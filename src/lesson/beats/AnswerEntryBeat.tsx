// Graded type-in answer (replaces the single-select mcq). One or more short
// free-entry fields, each graded against a normalized accept-list through the
// hint ladder, so it drives needsReview + the mastery signal like other graded
// beats. Tap/keyboard-native (no motion); Enter submits.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'

// Normalize for comparison: trim, lowercase, strip all whitespace. Authors list
// each accepted form explicitly (e.g. ["1/2", "0.5"]) since these don't unify.
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '')

export function AnswerEntryBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const [values, setValues] = useState<Record<string, string>>({})
  const [solved, setSolved] = useState(false)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  if (beat.interaction.type !== 'answerEntry') return null
  const { fields } = beat.interaction
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const graded = ladder.view.kind === 'hint' && !solved
  const allFilled = fields.every((f) => (values[f.id] ?? '').trim() !== '')

  function check() {
    const ok = fields.every((f) =>
      f.accept.map(norm).includes(norm(values[f.id] ?? '')),
    )
    if (ok) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: allFilled, onClick: check }

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setValues({})
            }
          : undefined
      }
    >
      <div className="answer-entry">
        {fields.map((f) => {
          const shown = revealed ? f.accept[0] : (values[f.id] ?? '')
          const isWrong =
            graded &&
            (values[f.id] ?? '').trim() !== '' &&
            !f.accept.map(norm).includes(norm(values[f.id] ?? ''))
          return (
            <label className="answer-entry__field" key={f.id}>
              <span className="answer-entry__label">{f.label}</span>
              <span className="answer-entry__inputwrap">
                <input
                  type="text"
                  className={
                    'answer-entry__input' +
                    (isWrong ? ' answer-entry__input--wrong' : '') +
                    (solved || revealed ? ' answer-entry__input--correct' : '')
                  }
                  aria-label={f.label}
                  value={shown}
                  placeholder={f.placeholder}
                  disabled={solved || revealed}
                  autoComplete="off"
                  onChange={(e) => {
                    const v = e.target.value
                    setValues((prev) => ({ ...prev, [f.id]: v }))
                    ladder.clear()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !solved && allFilled) {
                      e.preventDefault()
                      check()
                    }
                  }}
                />
                {f.suffix && (
                  <span className="answer-entry__suffix">{f.suffix}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </BeatShell>
  )
}
