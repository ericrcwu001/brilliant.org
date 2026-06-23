// Phase 5 — the opening bet. The learner commits to a which-is-longer guess
// before any algebra; the options carry the "both 4" / tie trap. Any selection
// is accepted (it is a bet, not a graded check) and is stored as
// initialPrediction for the recap.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'

export function PredictionBeat({
  beat,
  pattern,
  isLast,
  onAdvance,
  setLessonState,
}: BeatProps) {
  const [selected, setSelected] = useState<string | null>(null)
  if (beat.interaction.type !== 'prediction') return null
  const { options } = beat.interaction
  const fb = resolveFeedback(beat.feedback, pattern)

  // The open bet is not graded and has no per-option correct answer, so the
  // strip is an answer-agnostic acknowledgement framed as a guess. We avoid
  // fb.correct ("…we'll prove HH takes longer…") since it would reveal the
  // result and congratulate every pick, including the traps. hints[2] confirms
  // the guess is provisional and will be revisited downstream.
  const view: FeedbackView =
    selected !== null
      ? { kind: 'note', text: fb.hints[2], label: 'Good guess!' }
      : { kind: 'idle' }

  return (
    <BeatShell
      feedback={view}
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: selected !== null,
        onClick: () => {
          if (selected !== null) setLessonState({ initialPrediction: selected })
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
