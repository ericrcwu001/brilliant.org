// Capstone interview page (Phase 3). Manages all UI states driven by the
// useRealtimeInterview hook: idle(preflight) → connecting → live → grading →
// done(report) → error. Mounts <Orb> for audio-reactive visuals and
// <InterviewReportView> when the session ends.

import { useRef, type FormEvent } from 'react'
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
    remoteStream,
    secondsLeft,
    error,
    report,
    attemptId,
    start,
    stop,
    sendTypedAnswer,
  } = useRealtimeInterview(conceptId, _transport)

  const typedInputRef = useRef<HTMLInputElement>(null)

  function handleBack() {
    navigate(conceptPath(conceptId))
  }

  function handleTypedSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = typedInputRef.current
    if (!input || !input.value.trim()) return
    sendTypedAnswer(input.value.trim())
    input.value = ''
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
          <h1 className="iv-ready__title">Capstone Interview</h1>
          <p className="iv-ready__note">
            You'll speak with an AI interviewer about{' '}
            {conceptId.replace(/^course-/, '').replace(/-/g, ' ')}.
            The session lasts up to 8 minutes.
          </p>
          {!rtcAvailable && (
            <p className="iv-ready__note" role="alert">
              Your browser does not support WebRTC. Please use a modern browser.
            </p>
          )}
          <p className="iv-ready__note">
            Microphone access is recommended but optional — you can type your answers.
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
    const isQuota = error?.code === 'resource-exhausted'
    const isGrade = error?.stage === 'grade'
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
        <span
          className={`iv-countdown${isWarning ? ' iv-countdown--warning' : ''}`}
          aria-live="polite"
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

      <div className="iv-live">
        {/* Orb — decorative, audio-reactive. The Orb renders its own .iv-orb container. */}
        <Orb remoteStream={remoteStream} isAiSpeaking={isAiSpeaking} />

        <ol
          className="iv-transcript"
          aria-live="polite"
          aria-label="Interview transcript"
        >
          {transcript.map((turn, i) => (
            <li key={i} data-role={turn.role}>
              <span className="iv-turn-role">
                {turn.role === 'interviewer' ? 'Interviewer' : 'You'}
              </span>
              <span className={turn.final ? '' : 'iv-turn--pending'}>
                {turn.text}
              </span>
            </li>
          ))}
        </ol>

        <form className="iv-typed-form" onSubmit={handleTypedSubmit}>
          <input
            ref={typedInputRef}
            type="text"
            className="iv-typed-input"
            placeholder="Type your answer…"
            aria-label="Type your answer"
          />
          <button type="submit" className="btn btn--primary">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
