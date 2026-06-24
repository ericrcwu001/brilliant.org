// Graded single-select recall (L1 §3.2). Used for in-lesson retrieval openers
// (the diagnostic pre-check reuses the same scoring via DiagnosticGate). Unlike
// `prediction` (ungraded by design), this grades the pick and runs the hint
// ladder, so it can drive needsReview / the mastery signal like other graded
// beats. Tap-only radio group; no motion.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'

export function McqBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  if (beat.interaction.type !== 'mcq') return null
  const { options } = beat.interaction
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const graded = ladder.view.kind === 'hint' && !solved

  function check() {
    const opt = options.find((o) => o.id === selected)
    if (opt?.correct) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: selected !== null, onClick: check }

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={revealed ? () => {
        ladder.tryAgain()
        setSelected(null)
      } : undefined}
    >
      <div className="mcq" role="radiogroup" aria-label="Choose one">
        {options.map((opt) => {
          const isPick = selected === opt.id
          const showCorrect =
            ((revealed || solved) && opt.correct) ||
            (graded && isPick && opt.correct)
          const showWrong = graded && isPick && !opt.correct
          return (
            <button
              type="button"
              role="radio"
              aria-checked={isPick}
              key={opt.id}
              disabled={solved || revealed}
              className={
                'mcq__option' +
                (isPick ? ' mcq__option--on' : '') +
                (showCorrect ? ' mcq__option--correct' : '') +
                (showWrong ? ' mcq__option--wrong' : '')
              }
              onClick={() => {
                setSelected(opt.id)
                ladder.clear()
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </BeatShell>
  )
}
