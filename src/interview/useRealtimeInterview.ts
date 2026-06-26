// WebRTC hook for the capstone interview (Phase 3). Manages the full state
// machine: idle → minting → awaitingMic → connecting → live → ending → grading
// → done (or → error from any stage). Assembles a live transcript from
// data-channel events, enforces an 8-minute countdown, and hands off to
// gradeInterview when the session ends.
//
// Transport injection: accepts an optional `_transport` param (RealtimeTransport)
// that replaces the real RTCPeerConnection + fetch SDP exchange, enabling the
// /dev/interview harness and unit tests to drive the hook with canned events.

import { useEffect, useRef, useState } from 'react'
import {
  mintInterviewToken,
  gradeInterview,
  type MintInterviewTokenOutput,
  type Turn,
  type InterviewReport,
} from './functions'
import { SESSION_CAP_SECONDS } from './constants'
import { analytics } from '../analytics/events'

// ── Types ─────────────────────────────────────────────────────────────────────

export type InterviewStatus =
  | 'idle'
  | 'minting'
  | 'awaitingMic'
  | 'connecting'
  | 'live'
  | 'ending'
  | 'grading'
  | 'done'
  | 'error'

export interface InterviewError {
  stage: 'mint' | 'awaitingMic' | 'connect' | 'grade'
  code?: string
  err: unknown
}

export interface RealtimeTransport {
  connect(
    clientSecret: string,
    micStream: MediaStream | null,
    onEvent: (event: Record<string, unknown>) => void,
  ): Promise<{
    remoteStream: MediaStream | null
    sendRaw: (json: string) => void
    close: () => void
  }>
}

export interface UseRealtimeInterviewReturn {
  status:          InterviewStatus
  transcript:      Turn[]
  isAiSpeaking:    boolean
  remoteStream:    MediaStream | null
  secondsLeft:     number
  error:           InterviewError | null
  report:          InterviewReport | null
  attemptId:       string | null
  start:           () => void
  stop:            () => void
  sendTypedAnswer: (text: string) => void
}

// ── Transcript helpers (exported for testability) ─────────────────────────────

export function buildTranscript(turns: Turn[]): Turn[] {
  return turns.filter((t) => t.final)
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRealtimeInterview(
  conceptId: string,
  _transport?: RealtimeTransport,
): UseRealtimeInterviewReturn {
  const [status, setStatus] = useState<InterviewStatus>('idle')
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_CAP_SECONDS)
  const [error, setError] = useState<InterviewError | null>(null)
  const [report, setReport] = useState<InterviewReport | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // Refs for imperative / closure-safe access.
  const statusRef            = useRef<InterviewStatus>('idle')
  const transcriptRef        = useRef<Turn[]>([])
  const isAiSpeakingRef      = useRef(false)
  const remoteStreamRef      = useRef<MediaStream | null>(null)
  const secondsLeftRef       = useRef(SESSION_CAP_SECONDS)
  const mintResultRef        = useRef<MintInterviewTokenOutput | null>(null)
  const micStreamRef         = useRef<MediaStream | null>(null)
  const pcRef                = useRef<RTCPeerConnection | null>(null)
  const dcRef                = useRef<RTCDataChannel | null>(null)
  const transportCloseRef    = useRef<(() => void) | null>(null)
  const sendRawRef           = useRef<((json: string) => void) | null>(null)
  const countdownRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  // In-progress (non-final) partial text per role.
  const inProgressRef        = useRef<Record<string, string>>({})

  function setStatusSafe(s: InterviewStatus) {
    statusRef.current = s
    setStatus(s)
  }

  // ── Transcript helpers ────────────────────────────────────────────────────

  function appendToInProgressTurn(role: string, delta: string) {
    inProgressRef.current[role] = (inProgressRef.current[role] ?? '') + delta
    // Show a pending turn in the transcript so the user sees incremental text.
    const pending: Turn = {
      role: role as Turn['role'],
      text: inProgressRef.current[role],
      ts:   Date.now(),
      final: false,
    }
    // Replace the last pending turn for this role, or append.
    const base = transcriptRef.current.filter(
      (t) => !(t.role === role && !t.final),
    )
    const next = [...base, pending]
    transcriptRef.current = next
    setTranscript([...next])
  }

  function finalizeTurn(role: string, text: string) {
    // Drop any in-progress partial for this role.
    inProgressRef.current[role] = ''
    const finalTurn: Turn = {
      role:  role as Turn['role'],
      text,
      ts:    Date.now(),
      final: true,
    }
    // Replace pending turns for this role with the finalized one.
    const base = transcriptRef.current.filter(
      (t) => !(t.role === role && !t.final),
    )
    const next = [...base, finalTurn]
    transcriptRef.current = next
    setTranscript([...next])
  }

  function seedInterviewerTurn(promptText: string) {
    finalizeTurn('interviewer', promptText)
  }

  // ── Countdown ────────────────────────────────────────────────────────────

  function startCountdown() {
    secondsLeftRef.current = SESSION_CAP_SECONDS
    setSecondsLeft(SESSION_CAP_SECONDS)
    countdownRef.current = setInterval(() => {
      secondsLeftRef.current -= 1
      setSecondsLeft(secondsLeftRef.current)
      if (secondsLeftRef.current <= 0) void stop()
    }, 1_000)
  }

  // ── Event handler ────────────────────────────────────────────────────────

  function handleEvent(event: Record<string, unknown>) {
    const type = event.type as string

    switch (type) {
      case 'conversation.item.input_audio_transcription.delta':
        appendToInProgressTurn('candidate', event.delta as string)
        break

      case 'conversation.item.input_audio_transcription.completed':
        finalizeTurn('candidate', event.transcript as string)
        break

      case 'response.output_audio_transcript.delta':
        appendToInProgressTurn('interviewer', event.delta as string)
        break

      case 'response.output_audio_transcript.done':
        finalizeTurn('interviewer', event.transcript as string)
        break

      case 'output_audio_buffer.started':
        isAiSpeakingRef.current = true
        setIsAiSpeaking(true)
        break

      case 'output_audio_buffer.stopped':
        isAiSpeakingRef.current = false
        setIsAiSpeaking(false)
        break

      case 'session.created':
        // IMPORTANT: do NOT read or propagate event.session.instructions
        if (statusRef.current === 'connecting') {
          setStatusSafe('live')
          void analytics.interviewConnected({ conceptId })
          seedInterviewerTurn(mintResultRef.current!.question.prompt)
          startCountdown()
          // Sync the remoteStream into React state now that we're live.
          setRemoteStream(remoteStreamRef.current)
        }
        break
    }
  }

  // ── start() ──────────────────────────────────────────────────────────────

  async function start() {
    if (statusRef.current !== 'idle' && statusRef.current !== 'error') return

    setError(null)
    setStatusSafe('minting')

    // 1. Mint ephemeral token.
    let mintResult: MintInterviewTokenOutput
    try {
      mintResult = await mintInterviewToken({ conceptId })
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'resource-exhausted') {
        void analytics.interviewQuotaBlocked({ conceptId, reason: 'daily' })
        setError({ stage: 'mint', code, err })
      } else {
        void analytics.interviewError({ conceptId, stage: 'mint' })
        setError({ stage: 'mint', err })
      }
      setStatusSafe('error')
      return
    }
    mintResultRef.current = mintResult
    setAttemptId(mintResult.attemptId)

    void analytics.interviewStarted({
      conceptId,
      questionId: mintResult.question.id,
      tier:       mintResult.question.tier,
      mode:       'voice',
    })

    // 2. Request mic access.
    setStatusSafe('awaitingMic')
    let micStream: MediaStream | null = null
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      // Mic denied → continue in text-only mode (micStream stays null).
    }
    micStreamRef.current = micStream

    // 3. Connect.
    setStatusSafe('connecting')

    try {
      if (_transport) {
        // Dev/test path: use injected transport.
        const result = await _transport.connect(
          mintResult.clientSecret,
          micStream,
          handleEvent,
        )
        remoteStreamRef.current = result.remoteStream
        sendRawRef.current      = result.sendRaw
        transportCloseRef.current = result.close
      } else {
        // Production path: real WebRTC.
        if (typeof RTCPeerConnection === 'undefined') {
          throw new Error('RTCPeerConnection unavailable')
        }
        const pc = new RTCPeerConnection()
        pcRef.current = pc

        pc.ontrack = (e) => {
          remoteStreamRef.current = e.streams[0]
        }

        if (micStream) {
          pc.addTrack(micStream.getTracks()[0])
        }

        const dc = pc.createDataChannel('oai-events')
        dcRef.current = dc
        dc.onmessage = (e) => {
          handleEvent(JSON.parse(e.data as string) as Record<string, unknown>)
        }
        sendRawRef.current = (json: string) => { dc.send(json) }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
          method: 'POST',
          body:   offer.sdp,
          headers: {
            Authorization:  `Bearer ${mintResult.clientSecret}`,
            'Content-Type': 'application/sdp',
          },
        })
        await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() })
      }
    } catch (err) {
      void analytics.interviewError({ conceptId, stage: 'connect' })
      setError({ stage: 'connect', err })
      setStatusSafe('error')
      cleanup()
      return
    }
  }

  // ── stop() ───────────────────────────────────────────────────────────────

  async function stop() {
    if (
      statusRef.current === 'ending' ||
      statusRef.current === 'grading'
    ) return

    setStatusSafe('ending')
    clearInterval(countdownRef.current ?? undefined)

    const finalTranscript = [...transcriptRef.current].filter((t) => t.final)
    const durationSec     = SESSION_CAP_SECONDS - secondsLeftRef.current

    cleanup()

    setStatusSafe('grading')
    try {
      const { report: gradeReport } = await gradeInterview({
        attemptId:  mintResultRef.current!.attemptId,
        conceptId,
        transcript: finalTranscript,
        durationSec,
      })
      void analytics.interviewCompleted({
        conceptId,
        questionId:  mintResultRef.current!.question.id,
        durationSec,
        hireSignal:  gradeReport.hireSignal,
      })
      setReport(gradeReport)
      setStatusSafe('done')
    } catch (err) {
      void analytics.interviewError({ conceptId, stage: 'grade' })
      setError({ stage: 'grade', err })
      setStatusSafe('error')
    }
  }

  // ── sendTypedAnswer() ────────────────────────────────────────────────────

  function sendTypedAnswer(text: string) {
    const send = sendRawRef.current
    if (!send) return

    send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    }))
    send(JSON.stringify({ type: 'response.create' }))
    void analytics.interviewFallbackUsed({ conceptId })
    finalizeTurn('candidate', text)
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  function cleanup() {
    transportCloseRef.current?.()
    transportCloseRef.current = null
    dcRef.current?.close()
    dcRef.current = null
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
    pcRef.current?.close()
    pcRef.current = null
  }

  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current ?? undefined)
      cleanup()
    }
  }, [])

  return {
    status,
    transcript,
    isAiSpeaking,
    remoteStream,
    secondsLeft,
    error,
    report,
    attemptId,
    start,
    stop,
    sendTypedAnswer,
  }
}