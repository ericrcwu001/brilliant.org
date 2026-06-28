// Interview report view (Phase 5). Renders an InterviewReport as a
// self-contained section inside InterviewPage once gradeInterview resolves.
// Fires interviewReportViewed analytics once on mount.

import { useEffect } from 'react'
import type { InterviewReport } from './functions'
import type { CalibrationResult } from '../progress/calibration'
import { analytics } from '../analytics/events'
import { GAP_THRESHOLD, interviewAccuracyFromScore } from './gap'

interface InterviewReportViewProps {
  report:     InterviewReport
  attemptId:  string
  conceptId:  string
  // Practice-vs-performance gap (spec-22 §3.3): the learner's in-app accuracy for
  // THIS concept (fraction of completed lessons mastered first-try), scoped +
  // computed by InterviewPage. null ⇒ too few completed lessons or still loading,
  // and the gap block hides cleanly.
  inAppAccuracy?: number | null
  // Predicted-vs-measured calibration delta (spec-23 §3.5), the per-attempt block
  // RETURNED by gradeInterview (spec-12). Optional — absent for a Track-A attempt
  // with no confidence captured.
  calibration?: CalibrationResult | null
  // Quant-intensity gate (spec-23 §5; README §4 isQuantIntensity). The calibration
  // delta is gated to the gate AND double-guarded on `calibration.n > 0`. The most
  // sensitive personal inference this surface shows (README §4.6) — self-only, no
  // share/export affordance.
  showCalibration?: boolean
  onClose?:   () => void
}

// Static fallback for an old attempt whose report predates spec-22's pressureNote.
const PRESSURE_FALLBACK =
  'A live, timed interview is harder than untimed practice — improving your ' +
  'under-pressure retrieval is the real goal.'

const DIMS = [
  ['correctness',   'Correctness'],
  ['approach',      'Approach'],
  ['rigor',         'Rigor'],
  ['communication', 'Communication'],
  ['speed',         'Speed'],
] as const

// Predicted-vs-measured delta in plain, non-judgmental words (spec-23 §3.5). No
// verdict, no person-level label (ADR-0010 rationale).
function calibrationSentence(c: CalibrationResult): string {
  const conf = Math.round((c.meanConfidence ?? 0) * 100)
  const acc = Math.round((c.accuracy ?? 0) * 100)
  const d = c.overconfidence ?? 0
  if (Math.abs(d) < 0.1) return `Well calibrated — you predicted ${conf}% and performed at ${acc}%.`
  return d > 0
    ? `You felt ${conf}% ready but performed at ${acc}% — watch for overconfidence.`
    : `You performed at ${acc}% but only felt ${conf}% ready — you can trust yourself more.`
}

function AccuracyBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="iv-gap__row">
      <span className="iv-gap__row-label">{label}</span>
      <div
        className="iv-gap__bar"
        role="meter"
        aria-label={`${label}: ${pct}%`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className="iv-gap__bar-fill" style={{ inlineSize: `${pct}%` }} />
      </div>
      <span className="iv-gap__row-value">{pct}%</span>
    </div>
  )
}

function ScorePips({ score }: { score: number }) {
  return (
    <div className="iv-dim__pips" aria-label={`Score: ${score} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`iv-dim__pip${i < score ? ' iv-dim__pip--filled' : ''}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function InterviewReportView({
  report,
  attemptId,
  conceptId,
  inAppAccuracy = null,
  calibration = null,
  showCalibration = false,
  onClose,
}: InterviewReportViewProps) {
  useEffect(() => {
    void analytics.interviewReportViewed({ conceptId, attemptId })
  }, [conceptId, attemptId])

  // Practice-vs-performance gap (spec-22 §3.3). interviewAccuracy is the
  // display-only proxy from the single correctness dimension (one question per
  // attempt). The block renders only when in-app accuracy is available; the
  // pressure-graduation framing is emphasized when the gap clears GAP_THRESHOLD.
  const interviewAccuracy = interviewAccuracyFromScore(report.dimensions.correctness.score)
  const showGap = inAppAccuracy != null
  const emphasizeGap = showGap && inAppAccuracy - interviewAccuracy >= GAP_THRESHOLD

  return (
    <section className="iv-report" aria-label="Interview report">
      <p className="iv-summary">{report.summary}</p>

      {/* Predicted-vs-measured calibration delta (spec-23 §3.5). Self-only, no
          verdict; gated to the quant-intensity gate AND double-guarded on a
          reliable-enough non-empty bucket (README §4.6). */}
      {showCalibration &&
        calibration &&
        calibration.n > 0 &&
        calibration.overconfidence != null && (
          <div className="iv-calibration">
            <h3 className="iv-feedback__heading">Calibration</h3>
            <p>{calibrationSentence(calibration)}</p>
          </div>
        )}

      <h3 className="iv-feedback__heading iv-dims__heading">What to work on next</h3>
      <div className="iv-dims">
        {DIMS.map(([key, label]) => {
          const dim = report.dimensions[key]
          // Mentor feedback: when the correctness row was set by the
          // deterministic engine check (not the LLM), say so explicitly.
          const anchor =
            key === 'correctness' && report.correctnessAnchor?.applied
              ? report.correctnessAnchor
              : null
          return (
            <div key={key} className="iv-dim">
              <div className="iv-dim__label">{label}</div>
              <ScorePips score={dim.score} />
              {anchor && (
                <span
                  className={`iv-dim__anchor iv-dim__anchor--${anchor.verdict}`}
                  title={`Engine answer: ${anchor.expected}`}
                >
                  {anchor.verdict === 'match'
                    ? '✓ Verified against the engine'
                    : '✗ Final answer didn’t match the engine'}
                </span>
              )}
              <blockquote className="iv-dim__evidence">
                {dim.evidence}
              </blockquote>
            </div>
          )
        })}
      </div>

      {showGap && (
        <div className={`iv-gap${emphasizeGap ? ' iv-gap--wide' : ''}`} aria-label="Practice vs interview">
          <p className="iv-gap__tier">
            Graded as a <strong>{report.tier}</strong> question
          </p>
          <AccuracyBar label="In practice" value={inAppAccuracy} />
          <AccuracyBar label="In the interview" value={interviewAccuracy} />
          <p className="iv-gap__note">{report.pressureNote || PRESSURE_FALLBACK}</p>
        </div>
      )}

      {report.strengths.length > 0 && (
        <div className="iv-feedback">
          <h3 className="iv-feedback__heading">Strengths</h3>
          <ul>
            {report.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {report.fixes.length > 0 && (
        <div className="iv-feedback">
          <h3 className="iv-feedback__heading">To improve</h3>
          <ul>
            {report.fixes.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {onClose && (
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Done
        </button>
      )}
    </section>
  )
}
