// Interview report view (Phase 5). Renders an InterviewReport as a
// self-contained section inside InterviewPage once gradeInterview resolves.
// Fires interviewReportViewed analytics once on mount.

import { useEffect } from 'react'
import type { InterviewReport, HireSignal } from './functions'
import { analytics } from '../analytics/events'

interface InterviewReportViewProps {
  report:     InterviewReport
  attemptId:  string
  conceptId:  string
  onClose?:   () => void
}

const DIMS = [
  ['correctness',   'Correctness'],
  ['approach',      'Approach'],
  ['rigor',         'Rigor'],
  ['communication', 'Communication'],
  ['speed',         'Speed'],
] as const

function signalSlug(signal: HireSignal): string {
  return signal.toLowerCase().replace(/\s+/g, '-')
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
  onClose,
}: InterviewReportViewProps) {
  useEffect(() => {
    void analytics.interviewReportViewed({ conceptId, attemptId })
  }, [conceptId, attemptId])

  return (
    <section className="iv-report" aria-label="Interview report">
      <div className={`iv-signal iv-signal--${signalSlug(report.hireSignal)}`}>
        {report.hireSignal}
      </div>

      <p className="iv-summary">{report.summary}</p>

      <div className="iv-dims">
        {DIMS.map(([key, label]) => {
          const dim = report.dimensions[key]
          return (
            <div key={key} className="iv-dim">
              <div className="iv-dim__label">{label}</div>
              <ScorePips score={dim.score} />
              <blockquote className="iv-dim__evidence">
                {dim.evidence}
              </blockquote>
            </div>
          )
        })}
      </div>

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
