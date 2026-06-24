// Phase 5 — the opening bet. The learner commits to a which-is-longer guess
// before any algebra; the options carry the "both 4" / tie trap. Any selection
// is accepted (it is a bet, not a graded check) and is stored as
// initialPrediction for the recap.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, resolveOptionFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { analytics } from '../../analytics/events'

export function PredictionBeat({
  beat,
  lessonId,
  pattern,
  isLast,
  onAdvance,
  setLessonState,
}: BeatProps) {
  const [selected, setSelected] = useState<string | null>(null)
  if (beat.interaction.type !== 'prediction') return null
  const { options } = beat.interaction
  const fb = resolveFeedback(beat.feedback, pattern)
  const optionFb =
    selected !== null ? resolveOptionFeedback(beat.feedback, selected) : null

  // The open bet is ungraded. With `byOption` feedback (L1 §3.1) we refute or
  // affirm the *specific* pick: the right instinct gets an encouraging green
  // affordance, while a trap gets a soft, non-punishing note ("there's no wrong
  // answer yet"). Triple feedback falls back to the prior answer-agnostic
  // acknowledgement (hints[2]) so legacy fixtures keep working.
  let view: FeedbackView = { kind: 'idle' }
  if (selected !== null) {
    if (optionFb) {
      view = optionFb.correct
        ? { kind: 'correct', text: optionFb.note }
        : { kind: 'note', text: optionFb.note, label: 'Worth testing' }
    } else {
      view = { kind: 'note', text: fb.hints[2], label: 'Good guess!' }
    }
  }

  return (
    <BeatShell
      feedback={view}
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: selected !== null,
        onClick: () => {
          if (selected !== null) {
            setLessonState({ initialPrediction: selected })
            analytics.predictionSet({
              lessonId,
              beatId: beat.beatId,
              value: selected,
            })
          }
          onAdvance()
        },
      }}
    >
      <p className="bet-caption">
        Just a guess — there's no wrong answer here. {fb.hints[0]}
      </p>
      <div className="chips" role="radiogroup" aria-label="Your prediction">
        {options.map((opt) => (
          <button
            type="button"
            role="radio"
            aria-checked={selected === opt}
            key={opt}
            className={`chip chip--select${selected === opt ? ' chip--on' : ''}`}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </BeatShell>
  )
}
