// Graded mastery challenge: a distinct type-in card placed at the end of the
// Prove phase to confirm transfer. Mirrors AnswerEntryBeat's grading logic
// exactly (same norm helper, hint ladder, Enter-to-submit, try-again reset)
// but renders a visually distinct card with a badge and optional scenario line.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { MathText, mathToPlain } from '../MathText'
import { norm, gradeAcceptFields } from '../grading'

export function MasteryChallengeBeat(props: BeatProps) {
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

  if (beat.interaction.type !== 'masteryChallenge') return null
  const { fields, scenario } = beat.interaction
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const graded = ladder.view.kind === 'hint' && !solved
  const allFilled = fields.every((f) => (values[f.id] ?? '').trim() !== '')

  function check() {
    const ok = gradeAcceptFields(fields, values)
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
      <div className="mastery">
        <p className="mastery__badge">Mastery challenge</p>
        {scenario && <p className="mastery__scenario"><MathText>{scenario}</MathText></p>}
        <div className="answer-entry">
          {fields.map((f) => {
            const shown = revealed ? f.accept[0] : (values[f.id] ?? '')
            const isWrong =
              graded &&
              (values[f.id] ?? '').trim() !== '' &&
              !f.accept.map(norm).includes(norm(values[f.id] ?? ''))
            return (
              <label className="answer-entry__field" key={f.id}>
                <span className="answer-entry__label"><MathText>{f.label}</MathText></span>
                <span className="answer-entry__inputwrap">
                  <input
                    type="text"
                    className={
                      'answer-entry__input' +
                      (isWrong ? ' answer-entry__input--wrong' : '') +
                      (solved || revealed ? ' answer-entry__input--correct' : '')
                    }
                    aria-label={mathToPlain(f.label)}
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
      </div>
    </BeatShell>
  )
}
