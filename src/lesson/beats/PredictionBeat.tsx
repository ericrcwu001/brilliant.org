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

  const view: FeedbackView =
    selected !== null ? { kind: 'correct', text: fb.correct } : { kind: 'idle' }

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
