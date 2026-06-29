// Per-learner Capstone rubric scores over time (mentor feedback: "surfacing
// those rubric scores per learner in the dashboard would let learners see their
// own delta over time"). DOM-only, presentational, accessible — mirrors the bar
// pattern of src/lesson/FirstSuccessTimeline.tsx and the iv-dim pip styling.
//
// `full` (Profile, cross-concept): mean-score bars + per-dimension latest value
// and delta-since-first. `compact` (per-concept Study Desk): bars + one-line
// readout only.

import {
  DIM_KEYS,
  dimensionScores,
  meanRubricScore,
  toMs,
  type DimKey,
  type InterviewAttempt,
} from './attempts'

const DIM_LABELS: Record<DimKey, string> = {
  correctness: 'Correctness',
  approach: 'Approach',
  rigor: 'Rigor',
  communication: 'Communication',
  speed: 'Speed',
}

const MAX_SCORE = 5

type GradedPoint = { id: string; mean: number; dims: Record<DimKey, number> }

export function RubricTrend({
  attempts,
  variant = 'full',
}: {
  attempts: InterviewAttempt[]
  variant?: 'full' | 'compact'
}) {
  // Graded attempts with a usable rubric, sorted oldest→newest here so the trend
  // and the "since your first" delta are correct regardless of caller ordering.
  const graded: GradedPoint[] = [...attempts]
    .filter((a) => a.status === 'graded')
    .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt))
    .map((a) => ({ id: a.id, mean: meanRubricScore(a), dims: dimensionScores(a) }))
    .filter((x): x is GradedPoint => x.mean != null && x.dims != null)

  if (graded.length === 0) {
    return (
      <p className="rubric-trend__empty">
        Finish a Capstone interview to start tracking your rubric scores over time.
      </p>
    )
  }

  const first = graded[0]
  const last = graded[graded.length - 1]
  const meanDelta = last.mean - first.mean
  const multiple = graded.length > 1

  const readout = multiple
    ? `${graded.length} graded interviews — mean rubric ${last.mean.toFixed(1)}/5` +
      ` (${meanDelta >= 0 ? '+' : ''}${meanDelta.toFixed(1)} since your first).`
    : `1 graded interview — mean rubric ${last.mean.toFixed(1)}/5.`

  return (
    <div className={`rubric-trend${variant === 'compact' ? ' rubric-trend--compact' : ''}`}>
      <div
        className="rubric-trend__chart"
        role="img"
        aria-label={`Mean rubric score per interview, oldest to newest. ${readout}`}
      >
        {graded.map((g, i) => (
          <span
            key={g.id}
            className={`rubric-trend__bar${i === graded.length - 1 ? ' rubric-trend__bar--latest' : ''}`}
            style={{ height: `${(g.mean / MAX_SCORE) * 100}%` }}
          />
        ))}
      </div>

      <p className="rubric-trend__readout" role="status">
        {readout}
      </p>

      {variant === 'full' && (
        <ul className="rubric-trend__dims">
          {DIM_KEYS.map((k) => {
            const delta = last.dims[k] - first.dims[k]
            const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
            return (
              <li key={k} className="rubric-trend__dim">
                <span className="rubric-trend__dim-label">{DIM_LABELS[k]}</span>
                <span className="rubric-trend__dim-score">{last.dims[k]}/5</span>
                {multiple && (
                  <span
                    className={`rubric-trend__delta rubric-trend__delta--${dir}`}
                    aria-label={
                      delta === 0
                        ? 'no change since first interview'
                        : `${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} since first interview`
                    }
                  >
                    {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '—'}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// Loading placeholder for RubricTrend — shown while the attempts subscription
// resolves (Profile). Mirrors the `full` layout (chart + readout + dim rows) so
// the real content swaps in without layout shift, and suppresses RubricTrend's
// "Finish a Capstone interview…" empty-state during load. Composes the shared
// `.skeleton` shimmer primitive; reduced-motion handling comes from that base
// class. Purely presentational — the caller owns the loading vs. ready decision.
const SKELETON_BAR_HEIGHTS = ['40%', '60%', '50%', '78%', '88%']

export function RubricTrendSkeleton({
  variant = 'full',
}: {
  variant?: 'full' | 'compact'
}) {
  return (
    <div
      className={`rubric-trend-skeleton${variant === 'compact' ? ' rubric-trend-skeleton--compact' : ''}`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="visually-hidden">Loading your Capstone progress…</span>
      <div className="rubric-trend-skeleton__chart" aria-hidden="true">
        {SKELETON_BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="skeleton rubric-trend-skeleton__bar"
            style={{ height: h }}
          />
        ))}
      </div>
      <div className="skeleton rubric-trend-skeleton__readout" aria-hidden="true" />
      {variant === 'full' && (
        <ul className="rubric-trend-skeleton__dims" aria-hidden="true">
          {DIM_KEYS.map((k) => (
            <li key={k} className="rubric-trend-skeleton__dim">
              <span className="skeleton rubric-trend-skeleton__dim-label" />
              <span className="skeleton rubric-trend-skeleton__dim-score" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
