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
  userSpeaking:    boolean
  remoteStream:    MediaStream | null
  secondsLeft:     number
  error:           InterviewError | null
  report:          InterviewReport | null
  attemptId:       string | null
  start:           () => void
  stop:            () => void
}

// ── Transcript helpers (exported for testability) ─────────────────────────────

export function buildTranscript(turns: Turn[]): Turn[] {
  return turns.filter((t) => t.final)
}

// Word-by-word interviewer caption reveal. OpenAI doesn't expose per-word audio
// timestamps, so we pace the reveal at a natural speaking rate and flush the
// remainder when audio playback ends — keeping captions in step with speech
// instead of dumping the whole turn ahead of the voice.
const REVEAL_WORDS_PER_MIN = 170
const REVEAL_TICK_MS = Math.round(60_000 / REVEAL_WORDS_PER_MIN)

function countWords(text: string): number {
  const m = text.match(/\S+/g)
  return m ? m.length : 0
}

// Slice `text` to the end of its `wordCount`-th word, preserving the original
// spacing/punctuation of the revealed portion.
function revealedText(text: string, wordCount: number): string {
  if (wordCount <= 0) return ''
  const matches = [...text.matchAll(/\S+/g)]
  if (wordCount >= matches.length) return text
  const last = matches[wordCount - 1]
  return text.slice(0, (last.index ?? 0) + last[0].length)
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRealtimeInterview(
  conceptId: string,
  _transport?: RealtimeTransport,
): UseRealtimeInterviewReturn {
  const [status, setStatus] = useState<InterviewStatus>('idle')
  const [transcript, setTranscript] = useState<Turn[]>([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
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
  const responseRequestedRef = useRef(false)
  const countdownRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  // In-progress (non-final) partial text per role.
  const inProgressRef        = useRef<Record<string, string>>({})
  // Barge-in bookkeeping: the in-flight assistant item + when its audio started,
  // so we can tell the model how much the user actually heard on interruption.
  const assistantItemIdRef   = useRef<string | null>(null)
  const audioStartedAtRef    = useRef<number>(0)
  // Paced word-by-word reveal of the interviewer caption.
  const revealBufferRef  = useRef<string>('')    // full interviewer text received so far
  const revealedCountRef = useRef<number>(0)      // number of words shown
  const revealDoneRef    = useRef<boolean>(false) // transcript fully received
  const revealTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  function setStatusSafe(s: InterviewStatus) {
    statusRef.current = s
    setStatus(s)
  }

  function updateRemoteStream(stream: MediaStream | null) {
    remoteStreamRef.current = stream
    setRemoteStream(stream)
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

  // ── Interviewer caption reveal (paced to speech) ──────────────────────────

  function renderInterviewerPending(text: string) {
    const pending: Turn = {
      role:  'interviewer',
      text,
      ts:    Date.now(),
      final: false,
    }
    const base = transcriptRef.current.filter(
      (t) => !(t.role === 'interviewer' && !t.final),
    )
    const next = [...base, pending]
    transcriptRef.current = next
    setTranscript([...next])
  }

  function resetReveal() {
    revealBufferRef.current  = ''
    revealedCountRef.current = 0
    revealDoneRef.current    = false
  }

  function stopReveal() {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current)
      revealTimerRef.current = null
    }
  }

  function startReveal() {
    if (revealTimerRef.current) return
    revealTimerRef.current = setInterval(tickReveal, REVEAL_TICK_MS)
  }

  function tickReveal() {
    const buffer = revealBufferRef.current
    const total  = countWords(buffer)
    if (revealedCountRef.current < total) {
      revealedCountRef.current += 1
      renderInterviewerPending(revealedText(buffer, revealedCountRef.current))
    }
    // Caught up to a completed turn → finalize and stop pacing.
    if (revealDoneRef.current && revealedCountRef.current >= total) {
      finalizeReveal()
    }
  }

  // Normal end of turn: finalize to the full buffered transcript.
  function finalizeReveal() {
    stopReveal()
    const text = revealBufferRef.current
    if (text) finalizeTurn('interviewer', text)
    resetReveal()
  }

  // Barge-in: the agent was cut off, so keep only the words actually heard.
  function finalizeRevealPartial() {
    stopReveal()
    const text = revealedText(revealBufferRef.current, revealedCountRef.current)
    if (text) finalizeTurn('interviewer', text)
    resetReveal()
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

  function requestInterviewerGreeting() {
    // With semantic_vad the model only auto-responds AFTER the user speaks, so
    // we must explicitly open the first turn or the interviewer never greets.
    if (responseRequestedRef.current) return
    responseRequestedRef.current = true
    sendRawRef.current?.(JSON.stringify({ type: 'response.create' }))
  }

  function handleEvent(event: Record<string, unknown>) {
    const type = event.type as string

    switch (type) {
      case 'conversation.item.input_audio_transcription.delta':
        appendToInProgressTurn('candidate', event.delta as string)
        break

      case 'conversation.item.input_audio_transcription.completed':
        finalizeTurn('candidate', event.transcript as string)
        break

      case 'response.output_item.added': {
        // Capture the assistant item id at the earliest point. This event fires
        // before any transcript delta and before audio starts, so a fast barge-in
        // (user interrupts before any transcript text arrives) can still truncate
        // the right item instead of silently no-opping.
        const item = event.item as { id?: unknown } | undefined
        if (item && typeof item.id === 'string') assistantItemIdRef.current = item.id
        // New interviewer turn boundary (fires before its deltas): clean slate.
        resetReveal()
        break
      }

      case 'response.output_audio_transcript.delta':
        if (typeof event.item_id === 'string') assistantItemIdRef.current = event.item_id
        // Buffer the text; reveal it in step with audio rather than all at once.
        revealBufferRef.current += event.delta as string
        if (isAiSpeakingRef.current) startReveal()
        break

      case 'response.output_audio_transcript.done':
        if (typeof event.item_id === 'string') assistantItemIdRef.current = event.item_id
        if (typeof event.transcript === 'string') revealBufferRef.current = event.transcript
        revealDoneRef.current = true
        break

      case 'output_audio_buffer.started':
        audioStartedAtRef.current = Date.now()
        isAiSpeakingRef.current = true
        setIsAiSpeaking(true)
        startReveal()
        break

      case 'output_audio_buffer.stopped':
        isAiSpeakingRef.current = false
        setIsAiSpeaking(false)
        assistantItemIdRef.current = null
        // Audio finished: reveal any remaining buffered words and finalize.
        finalizeReveal()
        break

      case 'input_audio_buffer.speech_started':
        setUserSpeaking(true)
        // Barge-in: trim the assistant item to what was actually heard so the
        // model's context matches reality and it resumes coherently, and lock the
        // on-screen caption to the words the candidate actually heard.
        if (isAiSpeakingRef.current) {
          if (assistantItemIdRef.current) {
            sendRawRef.current?.(
              JSON.stringify({
                type: 'conversation.item.truncate',
                item_id: assistantItemIdRef.current,
                content_index: 0,
                audio_end_ms: Math.max(0, Date.now() - audioStartedAtRef.current),
              }),
            )
          }
          finalizeRevealPartial()
        }
        console.debug('[iv] speech_started — server is receiving mic audio')
        break

      case 'input_audio_buffer.speech_stopped':
        setUserSpeaking(false)
        console.debug('[iv] speech_stopped')
        break

      case 'error':
        console.error('[iv] server error event', event)
        break

      case 'session.created':
        // IMPORTANT: do NOT read or propagate event.session.instructions
        if (statusRef.current === 'connecting') {
          setStatusSafe('live')
          void analytics.interviewConnected({ conceptId })
          startCountdown()
          // Sync the remoteStream into React state now that we're live.
          setRemoteStream(remoteStreamRef.current)
          // Open the first turn so the interviewer speaks the question aloud; the
          // caption now streams in word-by-word as it is spoken.
          requestInterviewerGreeting()
        }
        break

      default:
        console.debug('[iv] event', type)
        break
    }
  }

  // ── start() ──────────────────────────────────────────────────────────────

  async function start() {
    if (statusRef.current !== 'idle' && statusRef.current !== 'error') return

    setError(null)
    responseRequestedRef.current = false
    stopReveal()
    resetReveal()
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

    // 2. Request mic access (real path only; skip when transport is injected).
    setStatusSafe('awaitingMic')
    let micStream: MediaStream | null = null
    if (!_transport) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch (err) {
        setError({ stage: 'awaitingMic', err })
        setStatusSafe('error')
        return
      }
      const micTrack = micStream.getAudioTracks()[0]
      if (micTrack) {
        micTrack.enabled = true
        console.debug('[iv] mic track ready', micTrack.readyState, 'enabled', micTrack.enabled)
      }
    }
    micStreamRef.current = micStream

    void analytics.interviewStarted({
      conceptId,
      questionId: mintResult.question.id,
      tier:       mintResult.question.tier,
      mode:       'voice',
    })

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
        sendRawRef.current        = result.sendRaw
        transportCloseRef.current = result.close
        if (result.remoteStream) updateRemoteStream(result.remoteStream)
      } else {
        // Production path: real WebRTC.
        if (typeof RTCPeerConnection === 'undefined') {
          throw new Error('RTCPeerConnection unavailable')
        }
        const pc = new RTCPeerConnection()
        pcRef.current = pc

        pc.onconnectionstatechange = () => {
          console.debug('[iv] connectionState', pc.connectionState)
          if (
            pc.connectionState === 'failed' &&
            (statusRef.current === 'connecting' || statusRef.current === 'live')
          ) {
            void analytics.interviewError({ conceptId, stage: 'connect' })
            setError({ stage: 'connect', err: new Error('peer connection failed') })
            setStatusSafe('error')
            cleanup()
          }
        }
        pc.oniceconnectionstatechange = () => {
          console.debug('[iv] iceConnectionState', pc.iceConnectionState)
        }

        pc.ontrack = (e) => {
          console.debug('[iv] ontrack', e.track.kind)
          updateRemoteStream(e.streams[0] ?? null)
        }

        if (micStream) {
          const micTrack = micStream.getAudioTracks()[0]
          if (micTrack) pc.addTrack(micTrack, micStream)
        }

        const dc = pc.createDataChannel('oai-events')
        dcRef.current = dc
        sendRawRef.current = (json: string) => {
          try {
            dc.send(json)
          } catch (err) {
            console.error('[iv] dc.send failed', err)
          }
        }
        dc.onopen  = () => console.debug('[iv] data channel open')
        dc.onerror = (e) => console.error('[iv] data channel error', e)
        dc.onmessage = (e) => {
          let parsed: Record<string, unknown>
          try {
            parsed = JSON.parse(e.data as string) as Record<string, unknown>
          } catch (err) {
            console.error('[iv] failed to parse event', err, e.data)
            return
          }
          handleEvent(parsed)
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        console.debug('[iv] senders', pc.getSenders().map((s) => s.track?.kind))
        const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
          method: 'POST',
          body:   offer.sdp,
          headers: {
            Authorization:  `Bearer ${mintResult.clientSecret}`,
            'Content-Type': 'application/sdp',
          },
        })
        if (!sdpRes.ok) {
          const body = await sdpRes.text()
          throw new Error(`SDP exchange failed: ${sdpRes.status} ${body}`)
        }
        const answerSdp = await sdpRes.text()
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
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

  // ── Cleanup ───────────────────────────────────────────────────────────────

  function cleanup() {
    stopReveal()
    transportCloseRef.current?.()
    transportCloseRef.current = null
    sendRawRef.current = null
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
    userSpeaking,
    remoteStream,
    secondsLeft,
    error,
    report,
    attemptId,
    start,
    stop,
  }
}