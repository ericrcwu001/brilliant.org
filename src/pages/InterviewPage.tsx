// Capstone interview page (Phase 3). Manages all UI states driven by the
// useRealtimeInterview hook: idle(preflight) → connecting → live → grading →
// done(report) → error. Mounts <Orb> for audio-reactive visuals and
// <InterviewReportView> when the session ends.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { NavigateFn } from '../pages/routes'
import type { RealtimeTransport } from '../interview/useRealtimeInterview'
import { useRealtimeInterview } from '../interview/useRealtimeInterview'
import { Orb } from '../interview/Orb'
import { InterviewReportView } from '../interview/InterviewReportView'
import { conceptPath } from './routes'

function formatMmSs(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function InterviewPage({
  navigate,
  conceptId,
  _transport,
}: {
  navigate: NavigateFn
  conceptId: string
  _transport?: RealtimeTransport
}) {
  const {
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
  } = useRealtimeInterview(conceptId, _transport)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioBlocked, setAudioBlocked] = useState(false)

  // Auto-scroll the transcript to the newest caption, but only while the user is
  // already at the bottom — any scroll up (to re-read) detaches and we stop
  // yanking until they return to the bottom.
  const transcriptRef = useRef<HTMLOListElement | null>(null)
  const stickToBottomRef = useRef(true)
  const lastScrollTopRef = useRef(0)

  useEffect(() => {
    const el = transcriptRef.current
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [transcript])

  function handleTranscriptScroll() {
    const el = transcriptRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8
    // Treat any upward movement as intent to re-read; re-arm only at the bottom.
    if (el.scrollTop < lastScrollTopRef.current - 1) stickToBottomRef.current = false
    if (atBottom) stickToBottomRef.current = true
    lastScrollTopRef.current = el.scrollTop
    el.dataset.scrolled = el.scrollTop > 4 ? 'true' : 'false'
  }

  // Wire the remote stream to the <audio> element with a callback ref so it runs
  // exactly when the element mounts (or the stream changes), not on every status
  // change. The element only renders in `live` and the stream is usually set
  // earlier during `connecting`; the callback ref attaches srcObject the moment
  // the element appears, which a `[remoteStream]`-only effect would miss.
  const attachAudio = useCallback(
    (el: HTMLAudioElement | null) => {
      audioRef.current = el
      if (!el || !remoteStream) return
      el.srcObject = remoteStream
      el.play()
        .then(() => setAudioBlocked(false))
        .catch((err) => {
          console.error('[iv] remote audio play blocked', err)
          setAudioBlocked(true)
        })
    },
    [remoteStream],
  )

  // Barge-in duck: pause playback the instant the user talks over the AI so the
  // interruption feels immediate; resume when they stop.
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (userSpeaking && isAiSpeaking) el.pause()
    else if (!userSpeaking) el.play().catch(() => {})
  }, [userSpeaking, isAiSpeaking])

  function handleBack() {
    navigate(conceptPath(conceptId))
  }

  // ── Preflight (idle) ──────────────────────────────────────────────────────

  if (status === 'idle') {
    const rtcAvailable = typeof RTCPeerConnection !== 'undefined' || !!_transport
    return (
      <div className="iv-page">
        <header className="iv-topbar">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleBack}
            aria-label="Back"
          >
            ←
          </button>
          <span />
        </header>
        <div className="iv-ready">
          <p className="iv-ready__eyebrow">Capstone</p>
          <h1 className="iv-ready__title">Capstone Interview</h1>
          <p className="iv-ready__note">
            You'll speak with an AI interviewer about{' '}
            <span className="iv-concept">{conceptId.replace(/^course-/, '').replace(/-/g, ' ')}</span>.
            The session lasts up to 8 minutes.
          </p>
          {!rtcAvailable && (
            <p className="iv-ready__note" role="alert">
              Your browser does not support WebRTC. Please use a modern browser.
            </p>
          )}
          <p className="iv-ready__note">
            Microphone access is required — please allow it when prompted.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={start}
            disabled={!rtcAvailable}
          >
            Start interview
          </button>
        </div>
      </div>
    )
  }

  // ── Connecting (minting / awaitingMic / connecting) ───────────────────────

  if (
    status === 'minting' ||
    status === 'awaitingMic' ||
    status === 'connecting'
  ) {
    const msg =
      status === 'minting'     ? 'Preparing your interview…' :
      status === 'awaitingMic' ? 'Requesting microphone access…' :
                                 'Connecting…'
    return (
      <div className="iv-page">
        <header className="iv-topbar">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleBack}
            aria-label="Back"
          >
            ←
          </button>
          <span />
        </header>
        <div className="iv-connecting" aria-live="polite">
          <p>{msg}</p>
          <button type="button" className="btn btn--secondary" onClick={handleBack}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (status === 'error') {
    const isQuota  = error?.code === 'resource-exhausted'
    const isGrade  = error?.stage === 'grade'
    const isMic    = error?.stage === 'awaitingMic'
    return (
      <div className="iv-page">
        <header className="iv-topbar">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleBack}
            aria-label="Back"
          >
            ←
          </button>
          <span />
        </header>
        <div className="iv-error" role="alert">
          {isQuota ? (
            <>
              <p>You've used today's interview quota. Come back tomorrow!</p>
              <button type="button" className="btn btn--secondary" onClick={handleBack}>
                Back to course
              </button>
            </>
          ) : isMic ? (
            <>
              <p>Microphone access is required for the interview.</p>
              <button type="button" className="btn btn--primary" onClick={start}>
                Retry
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleBack}>
                Back to course
              </button>
            </>
          ) : isGrade ? (
            <>
              <p>We couldn't grade your interview. You can try again.</p>
              <button type="button" className="btn btn--primary" onClick={() => { void stop() }}>
                Retry grading
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleBack}>
                Back to course
              </button>
            </>
          ) : (
            <>
              <p>Something went wrong. Please try again.</p>
              <button type="button" className="btn btn--primary" onClick={start}>
                Try again
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleBack}>
                Back to course
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Ending / Grading ──────────────────────────────────────────────────────

  if (status === 'ending' || status === 'grading') {
    return (
      <div className="iv-page">
        <header className="iv-topbar">
          <span />
          <span />
        </header>
        <div className="iv-grading" aria-live="polite">
          <p>Grading your interview…</p>
        </div>
      </div>
    )
  }

  // ── Done (report) ─────────────────────────────────────────────────────────

  if (status === 'done' && report) {
    return (
      <div className="iv-page">
        <header className="iv-topbar">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleBack}
            aria-label="Back to course"
          >
            ←
          </button>
          <span>Interview complete</span>
        </header>
        <InterviewReportView
          report={report}
          attemptId={attemptId ?? ''}
          conceptId={conceptId}
          onClose={handleBack}
        />
      </div>
    )
  }

  // ── Live ──────────────────────────────────────────────────────────────────

  const isWarning = secondsLeft <= 60
  return (
    <div className="iv-page iv-page--live">
      <header className="iv-topbar">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleBack}
          aria-label="Back"
        >
          ←
        </button>
        <span
          className={`iv-countdown${isWarning ? ' iv-countdown--warning' : ''}`}
          aria-label={`Time remaining: ${formatMmSs(secondsLeft)}`}
        >
          {formatMmSs(secondsLeft)}
        </span>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => { void stop() }}
        >
          End interview
        </button>
      </header>

      <audio ref={attachAudio} autoPlay playsInline />

      <div className="iv-live">
        {/* Stage: compact Orb presence + a live speaking/listening status. */}
        <div className="iv-stage">
          {/* Orb — decorative, audio-reactive. Renders its own .iv-orb container. */}
          <Orb remoteStream={remoteStream} isAiSpeaking={isAiSpeaking} />

          <p className="iv-status" data-speaking={isAiSpeaking}>
            <span className="iv-status__dot" aria-hidden="true" />
            {isAiSpeaking ? 'Interviewer speaking' : 'Listening'}
          </p>

          {audioBlocked && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                audioRef.current
                  ?.play()
                  .then(() => setAudioBlocked(false))
                  .catch(() => {})
              }}
            >
              Tap to enable sound
            </button>
          )}
        </div>

        <ol
          className="iv-transcript"
          ref={transcriptRef}
          onScroll={handleTranscriptScroll}
          tabIndex={0}
          role="log"
          aria-live="polite"
          aria-label="Interview transcript"
        >
          {transcript.map((turn, i) => (
            <li
              key={i}
              data-role={turn.role}
              data-pending={turn.final ? undefined : 'true'}
              /* Don't announce streaming partials token-by-token; the finalized
                 turn is announced once when it replaces the pending one. */
              aria-live={turn.final ? undefined : 'off'}
            >
              <span className="iv-turn-role">
                {turn.role === 'interviewer' ? 'Interviewer' : 'You'}
              </span>
              <span className={`iv-turn-text${turn.final ? '' : ' iv-turn--pending'}`}>
                {turn.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
