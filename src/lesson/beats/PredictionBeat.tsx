// Phase 5 — the opening bet. The learner commits to a which-is-longer guess
// before any algebra; the options carry the "both 4" / tie trap. Any selection
// is accepted (it is a bet, not a graded check) and is stored as
// initialPrediction for the recap.
//
// spec-13 / D12: when the prediction carries `interaction.gate` it is instead a
// GRADED which-method discrimination gate — PredictionBeat delegates to the
// canonical `WhichMethodGate` (the same component spec-20's queue mounts). The
// dispatch branches to two child components, each owning its own hooks, so hook
// order stays stable per the rules of hooks (PredictionBeat itself calls none).

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, resolveOptionFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { analytics } from '../../analytics/events'
import { WhichMethodGate } from '../WhichMethodGate'

export function PredictionBeat(props: BeatProps) {
  const { beat, onAdvance } = props
  if (beat.interaction.type !== 'prediction') return null
  // Which-method gate (spec-13): the selection is the graded act. The in-lesson
  // host advances on a correct pick; a wrong pick keeps the learner on the gate.
  if (beat.interaction.gate) {
    return (
      <WhichMethodGate
        beat={beat}
        schemaId={beat.interaction.gate.correct}
        onResolved={({ correct }) => {
          if (correct) onAdvance()
        }}
        lessonId={props.lessonId}
        pattern={props.pattern}
        isLast={props.isLast}
        reportNeedsReview={props.reportNeedsReview}
        initialHintLevel={props.initialHintLevel}
        onHintLevelChange={props.onHintLevelChange}
        showConfidence={props.showConfidence}
        confidenceValue={props.confidenceValue}
        onConfidence={props.onConfidence}
      />
    )
  }
  return <OpeningBetView {...props} />
}

// The ungraded opening bet (today's behavior, unchanged).
function OpeningBetView({
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
