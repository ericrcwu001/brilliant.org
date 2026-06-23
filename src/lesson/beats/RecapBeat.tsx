// Phase 12 — Review and next step. Summarizes the learner's journey: the
// opening prediction, the theoretical result, the simulation result, and the
// overlap takeaway, with a milestone stamp. Reads the lesson-level state the
// earlier beats committed.

import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'

export function RecapBeat(props: BeatProps) {
  const { beat, pattern, automaton, isLast, onAdvance, needsReview, lessonState } =
    props

  if (beat.interaction.type !== 'recap') return null

  const theory =
    lessonState.theoreticalValue ?? automaton.expectedTimes[automaton.states[0].id]
  const rows: Array<{ label: string; value: string }> = [
    {
      label: 'Your opening bet',
      value: lessonState.initialPrediction ?? '—',
    },
    {
      label: 'Your locked prediction',
      value:
        lessonState.finalPrediction !== undefined
          ? `${lessonState.finalPrediction} flips`
          : '—',
    },
    { label: 'Theory', value: `E[${pattern}] = ${theory}` },
    {
      label: 'Simulation',
      value:
        lessonState.empiricalMean !== undefined
          ? `${lessonState.empiricalMean} over ${lessonState.simRuns} runs`
          : '—',
    },
    {
      label: 'Overlap insight',
      value: "A near-miss that resets costs more than one that keeps progress.",
    },
  ]

  return (
    <BeatShell
      feedback={{ kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }}
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="recap">
        <div className="recap__stamp" aria-label="Milestone earned">
          <span className="recap__seal mono">HH ≠ HT</span>
        </div>
        <dl className="recap__list">
          {rows.map((r) => (
            <div className="recap__row" key={r.label}>
              <dt className="recap__dt">{r.label}</dt>
              <dd className="recap__dd">{r.value}</dd>
            </div>
          ))}
        </dl>
        {needsReview && (
          <p className="hint-note hint-note--mark">
            Review recommended — revisit the beats you revealed before the next
            lesson.
          </p>
        )}
      </div>
    </BeatShell>
  )
}
