// Phase 7 — Guided substitution. A tap-to-advance stepper that derives the
// expected value by revealing the engine-computed substitution steps one at a
// time. Not graded (no hint ladder): each tap on the primary substitutes the
// next known value; "Show algebra" reveals every step at once. The final step's
// resultValue is the derived expected value, stored as theoreticalValue.

import { useEffect, useRef, useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'

export function SubstitutionBeat({
  beat,
  pattern,
  reducedMotion,
  isLast,
  onAdvance,
  setLessonState,
}: BeatProps) {
  const steps =
    beat.interaction.type === 'substitution' ? beat.interaction.steps : []

  // Start with the first step shown; the learner taps to reveal each next one.
  const [revealed, setRevealed] = useState(1)
  const [showedAll, setShowedAll] = useState(false)
  const reported = useRef(false)

  const allRevealed = revealed >= steps.length
  const finalValue = steps[steps.length - 1]?.resultValue

  // The derived expected value feeds the slider marker, chart, and recap.
  useEffect(() => {
    if (allRevealed && !reported.current && finalValue !== undefined) {
      reported.current = true
      setLessonState({ theoreticalValue: finalValue })
    }
  }, [allRevealed, finalValue, setLessonState])

  if (beat.interaction.type !== 'substitution') return null

  const fb = resolveFeedback(beat.feedback, pattern)
  const view: FeedbackView = allRevealed
    ? { kind: 'correct', text: fb.correct }
    : { kind: 'idle' }

  const primary = allRevealed
    ? {
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }
    : {
        label: 'Substitute',
        enabled: true,
        onClick: () => setRevealed((r) => Math.min(r + 1, steps.length)),
      }

  const secondary = allRevealed
    ? undefined
    : {
        label: 'Show algebra',
        onClick: () => {
          setShowedAll(true)
          setRevealed(steps.length)
        },
      }

  return (
    <BeatShell feedback={view} primary={primary} secondary={secondary}>
      <ol className="substeps" aria-live="polite">
        {steps.map((step, i) => {
          const isVisible = i < revealed
          // Animate only the single newly revealed step (skip when revealed in
          // bulk via "Show algebra", and under reduced motion just appear).
          const isNewest =
            isVisible && i === revealed - 1 && !showedAll && !reducedMotion
          return (
            <li
              key={i}
              aria-hidden={isVisible ? undefined : true}
              className={`substep${isVisible ? '' : ' substep--pending'}${
                isNewest ? ' substep--enter' : ''
              }`}
            >
              <span className="substep__display">{step.display}</span>
              {isVisible && step.resultValue !== undefined && (
                <span className="substep__result">⇒ {step.resultValue}</span>
              )}
            </li>
          )
        })}
      </ol>
    </BeatShell>
  )
}
