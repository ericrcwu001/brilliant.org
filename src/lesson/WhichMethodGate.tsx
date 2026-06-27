// Which-method discrimination gate (spec-13 / D12, README §4.5 + §5). The
// CANONICAL gate renderer: both the in-lesson `PredictionBeat` (delegated below)
// and the spec-20 Daily Review queue mount THIS exact component with the frozen
// props `{ beat, schemaId, onResolved }` (gate Issue #11 — do not rename).
//
// The gate is a GRADED `prediction` beat (never `patternPick` — R11): `options`
// are method display names, `gate.correct` is the right MethodId, and the
// SELECTION is the graded act (SPOV2 — picking the method before solving, not
// computing). It is built on `prediction` because only `prediction` carries
// `byOption` refutation (schema.ts:618) and a graded path here.
//
// Grading is by registry id, not display copy: correct ⇔ optionMethods[i] ===
// gate.correct (so green never lands on a wrong method). Refutation reuses the
// existing `byOption` machinery. The component drives `useHintLadder` so the
// high-water mark + needsReview + analytics flow exactly like other graded beats
// (model: RetrievalGridBeat.tsx). It is ALWAYS locally label-stripped: it never
// renders the lesson title and shows its own neutral discrimination prompt
// ("Which method cracks this?"), hiding the ungraded bet's "no wrong answer" copy.

import { useState } from 'react'
import type { Beat } from '../content/schema'
import { BeatShell } from './BeatShell'
import { ConfidenceRating } from './ConfidenceRating'
import { resolveFeedback, resolveOptionFeedback, useHintLadder } from './feedback'
import { gradeMethodGate, isWhichMethodGate } from './methodGate'
import { analytics } from '../analytics/events'

export function WhichMethodGate({
  beat,
  schemaId,
  onResolved,
  lessonId,
  pattern = '',
  isLast = false,
  reportNeedsReview,
  initialHintLevel,
  onHintLevelChange,
  showConfidence = false,
  confidenceValue,
  onConfidence,
}: {
  beat: Beat
  // The method under test (= beat.interaction.gate.correct); callers pass it
  // explicitly so the queue can label its surface. Cross-checked against the gate.
  schemaId: string
  // Fired when the learner resolves the gate. The in-lesson host advances on a
  // correct pick; the spec-20 queue drives its own progression off this callback.
  onResolved: (result: { correct: boolean; picked: string }) => void
  // Analytics + hint-ladder plumbing (threaded by the in-lesson host; the queue
  // supplies its own). All optional so the queue can mount the bare component.
  lessonId?: string
  pattern?: string
  isLast?: boolean
  reportNeedsReview?: () => void
  initialHintLevel?: number
  onHintLevelChange?: (level: number) => void
  // Confidence (spec-02 / D6, Track-aware). The host passes showConfidence only
  // on the quant-intensity gate; Track A renders no rating.
  showConfidence?: boolean
  confidenceValue?: number
  onConfidence?: (value: number) => void
}) {
  const [picked, setPicked] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)

  // Hooks must run unconditionally (rules of hooks) — call the ladder before the
  // gate-shape assertion below; a non-gate beat renders nothing after this.
  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: beat.maxHintLevel,
    onNeedsReview: reportNeedsReview,
    initialLevel: initialHintLevel,
    onLevelChange: onHintLevelChange,
    event: lessonId ? { lessonId, beatId: beat.beatId } : undefined,
  })

  // The component renders nothing unless it is a real gate beat (README §5 / step 5).
  if (!isWhichMethodGate(beat)) return null
  const { options, gate } = beat.interaction

  function resolve(opt: string, index: number) {
    if (solved) return
    const correct = gradeMethodGate(gate, index)
    setPicked(opt)
    if (lessonId) {
      analytics.methodGatePicked({
        lessonId,
        beatId: beat.beatId,
        picked: opt,
        correct,
        schemaId: gate.correct,
      })
    }
    if (correct) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      // Wrong picks keep the learner on the gate — selecting the method IS the
      // graded act, so we do not advance past it.
      ladder.submitWrong()
    }
    onResolved({ correct, picked: opt })
  }

  // The grade is authoritative from gate.correct; byOption[label] is the copy
  // affordance (the validator cross-checks the two agree). Fall back to the
  // ladder view (correct/hint) when a pick has no byOption entry.
  const optionFb = picked !== null ? resolveOptionFeedback(beat.feedback, picked) : null
  const view =
    picked !== null && optionFb
      ? optionFb.correct
        ? ({ kind: 'correct', text: optionFb.note } as const)
        : ({ kind: 'note', text: optionFb.note, label: 'Not quite' } as const)
      : ladder.view

  // The pick IS the graded act and fires onResolved (the in-lesson host advances
  // on correct; the queue drives itself). On a WRONG pick the learner stays on the
  // gate — the chips remain enabled so they can re-discriminate; the action bar's
  // Continue stays disabled until a correct pick lands (`solved`).
  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: solved,
    onClick: () => onResolved({ correct: true, picked: picked ?? '' }),
  }

  return (
    <BeatShell feedback={view} primary={primary}>
      <div className="gate" data-schema-id={schemaId}>
        <p className="gate__prompt">Which method cracks this?</p>
        <div className="chips" role="radiogroup" aria-label="Which method">
          {options.map((opt, i) => (
            <button
              type="button"
              role="radio"
              aria-checked={picked === opt}
              key={opt}
              className={`chip chip--select${picked === opt ? ' chip--on' : ''}`}
              disabled={solved}
              onClick={() => resolve(opt, i)}
            >
              {opt}
            </button>
          ))}
        </div>
        {/* Confidence capture (spec-02 / D6): only on the quant-intensity gate,
            after a pick; never blocks. */}
        {showConfidence && picked !== null && (
          <ConfidenceRating
            value={confidenceValue}
            onSelect={(v) => onConfidence?.(v)}
            question="How sure were you?"
          />
        )}
      </div>
    </BeatShell>
  )
}
