// Pick-k-of-n selection grid for lesson-combinatorics-2.
// Ungraded (no `accept`): tap items, flip order toggle, tap Continue.
// Graded   (`accept` present): tap items, tap Submit → hint ladder → Continue.
// order='on'     → always ordered (nPk)
// order='off'    → always unordered (nCk)
// order='toggle' → learner flips a role="switch"; hero fan animation on l2-explore.

import { useMemo, useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { useReducedMotion } from '../useReducedMotion'
import { nCk, nPk, factorial } from '../../engine/combinatorics'
import { isSelectionGridCorrect } from '../grading'

export function SelectionGridBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props

  // All hooks must be called unconditionally (Rules of Hooks).
  // We guard interaction-specific values inside hook initializers / memos.
  const reducedMotion = useReducedMotion()

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [orderedMode, setOrderedMode] = useState<boolean>(() => {
    if (beat.interaction.type !== 'selectionGrid') return true
    return beat.interaction.order !== 'off'
  })
  const [solved, setSolved] = useState(false)
  const [fanKey, setFanKey] = useState(0)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  const count = useMemo<string>(() => {
    if (beat.interaction.type !== 'selectionGrid') return '—'
    const { n, k } = beat.interaction
    if (selected.size < k) return '—'
    return (orderedMode ? nPk(n, k) : nCk(n, k)).toString()
  }, [beat.interaction, selected.size, orderedMode])

  const kFactLabel = useMemo<string>(() => {
    if (beat.interaction.type !== 'selectionGrid') return ''
    const { k, order } = beat.interaction
    if (order !== 'toggle' || selected.size < k) return ''
    return `×${k}! = ${factorial(k).toString()}`
  }, [beat.interaction, selected.size])

  if (beat.interaction.type !== 'selectionGrid') return null
  const { n, k, order, labels, accept } = beat.interaction

  const itemLabels: string[] = labels ?? Array.from({ length: n }, (_, i) => String(i + 1))
  const isGraded = accept !== undefined && accept.length > 0
  const isComplete = selected.size === k

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  function toggleItem(idx: number) {
    if (solved || revealed) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else if (next.size < k) {
        next.add(idx)
      }
      return next
    })
    if (isGraded) ladder.clear()
  }

  function flipOrder() {
    setOrderedMode((prev) => !prev)
    if (isComplete) setFanKey((fk) => fk + 1)
  }

  function submit() {
    const ok = isSelectionGridCorrect({ n, k, order, accept }, count)
    if (ok) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const primary = isGraded
    ? solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Submit', enabled: isComplete, onClick: submit }
    : { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }

  const fanCount = Number(factorial(k))
  const ghostIndices =
    order === 'toggle' && isComplete && !reducedMotion && fanKey > 0
      ? Array.from({ length: Math.min(fanCount, 6) }, (_, i) => i)
      : []

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={
        revealed && isGraded
          ? () => {
              ladder.tryAgain()
              setSelected(new Set())
            }
          : undefined
      }
    >
      <section aria-label="Selection grid" className="sel-grid">
        <div
          role="group"
          aria-label={`Pool — choose ${k}`}
          className="sel-grid__pool"
        >
          {itemLabels.map((label: string, idx: number) => {
            const checked = selected.has(idx)
            const disabled = solved || revealed || (!checked && selected.size >= k)
            return (
              <button
                key={idx}
                type="button"
                role="checkbox"
                aria-checked={checked}
                className="sel-grid__item"
                disabled={disabled}
                onClick={() => toggleItem(idx)}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
                    e.preventDefault()
                    toggleItem(idx)
                  }
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {order === 'toggle' && (
          <button
            type="button"
            role="switch"
            aria-checked={orderedMode}
            className="sel-grid__toggle"
            onClick={flipOrder}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                flipOrder()
              }
            }}
          >
            Order: {orderedMode ? 'ON' : 'OFF'}
          </button>
        )}

        <p
          aria-live="polite"
          className={`sel-grid__count${count === '—' ? ' sel-grid__count--incomplete' : ''}`}
        >
          Count: {count}
        </p>

        {order === 'toggle' && (
          <p aria-live="assertive" className="sel-grid__kfact-label">
            {kFactLabel}
          </p>
        )}

        {/* Hero fan ghost cards (l2-explore, order=toggle, motion allowed) */}
        {ghostIndices.length > 0 && (
          <div key={fanKey} className="sel-grid__fan" aria-hidden="true">
            {ghostIndices.map((i) => (
              <span
                key={i}
                className="sel-grid__ghost"
                style={{
                  animationDelay: `${i * 80}ms`,
                  transform: `translateX(${i * 14}px) rotate(${(i - Math.floor(ghostIndices.length / 2)) * 8}deg)`,
                }}
              >
                {Array.from(selected)
                  .slice(0, k)
                  .map((si) => itemLabels[si])
                  .join(', ')}
              </span>
            ))}
          </div>
        )}

        {/* Reduced-motion static readout (replaces fan animation) */}
        {order === 'toggle' && reducedMotion && isComplete && (
          <p className="sel-grid__rm-readout">
            Order ON → {nPk(n, k).toString()} (nPk); Order OFF → {nCk(n, k).toString()} (nCk);{' '}
            {nPk(n, k).toString()}÷{nCk(n, k).toString()}={factorial(k).toString()}={k}!
          </p>
        )}
      </section>
    </BeatShell>
  )
}
