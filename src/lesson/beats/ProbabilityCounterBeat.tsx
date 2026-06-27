// Chip-grid probability explorer (lesson-combinatorics-6 l6-explore, l6-pairs-scaffold).
// Toggle factor chips to build the running favorable count (product of selected
// chip values); live fraction favorable/total reduces on every toggle via
// probabilityFromCounts. Hero (l6-explore only): auto-selects chips one-by-one
// at HERO_STEP_MS intervals, then snaps the raw fraction → reduced with a
// compositor-only scale+opacity transition. Reduced-motion: skip animation,
// start with all chips selected (final frame). Ungraded in L6 (no `accept`):
// Continue → onAdvance; shows feedback.correct when all chips are selected.
// Graded mode (accept present): Submit + hint ladder like other graded beats.

import { useState, useEffect } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import type { FeedbackView } from '../feedback'
import { useReducedMotion } from '../useReducedMotion'
import { product, probabilityFromCounts } from '../../engine/combinatorics'
import { isProbabilityCounterCorrect } from '../grading'

const HERO_STEP_MS = 400
const SNAP_PAUSE_MS = 400
const SNAP_DURATION_MS = 600

export function ProbabilityCounterBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const reducedMotion = useReducedMotion()

  const pc = beat.interaction.type === 'probabilityCounter' ? beat.interaction : null
  const factors = pc?.factors ?? []
  const total = pc?.total ?? 1
  const accept = pc?.accept
  const isGraded = !!accept
  const hasHero = !!beat.hero

  // Reduced-motion final frame: all chips pre-selected when hero + reduced-motion.
  const startAllSelected = hasHero && reducedMotion
  const [selected, setSelected] = useState<boolean[]>(() =>
    Array(factors.length).fill(startAllSelected),
  )
  // snapPhase: 'none' = raw fraction visible; 'snapping' = CSS transition firing;
  // 'done' = reduced fraction visible (hero complete or reduced-motion final frame).
  const [snapPhase, setSnapPhase] = useState<'none' | 'snapping' | 'done'>(
    startAllSelected ? 'done' : 'none',
  )
  const [solved, setSolved] = useState(false)

  const resolved = resolveFeedback(beat.feedback, pattern)

  const ladder = useHintLadder({
    feedback: resolved,
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: isGraded ? props.reportNeedsReview : undefined,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: isGraded ? { lessonId: props.lessonId, beatId: beat.beatId } : undefined,
  })

  // Hero: auto-select chips one by one, then snap raw→reduced.
  // Runs once on mount; factors.length is a stable setup value.
  useEffect(() => {
    if (!pc || !hasHero || reducedMotion || factors.length === 0) return
    let cnt = 0
    let dead = false

    const tick = () => {
      if (dead) return
      const idx = cnt
      setSelected((prev) => {
        const next = [...prev]
        if (idx < next.length) next[idx] = true
        return next
      })
      cnt++
      if (cnt < factors.length) {
        setTimeout(tick, HERO_STEP_MS)
      } else {
        setTimeout(() => {
          if (dead) return
          setSnapPhase('snapping')
          setTimeout(() => {
            if (!dead) setSnapPhase('done')
          }, SNAP_DURATION_MS)
        }, SNAP_PAUSE_MS)
      }
    }

    const t = setTimeout(tick, HERO_STEP_MS)
    return () => {
      dead = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs once on mount

  if (!pc) return null

  const selectedValues = factors.filter((_, i) => selected[i]).map((f) => f.value)
  const fav = selectedValues.length > 0 ? product(selectedValues) : 0n
  const allSelected = selected.every(Boolean)
  const reduced = fav > 0n ? probabilityFromCounts(Number(fav), total) : null

  const liveText =
    fav > 0n && reduced
      ? `Favorable: ${fav}, Probability: ${reduced.n}/${reduced.d}`
      : `Favorable: 0, Probability: — / ${total}`

  function toggleChip(i: number) {
    if (solved || (ladder.view.kind === 'hint' && ladder.view.revealed)) return
    setSelected((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
    if (snapPhase !== 'none') setSnapPhase('none')
  }

  function check() {
    if (!accept || !reduced) return
    const answer = `${reduced.n}/${reduced.d}`
    const ok = isProbabilityCounterCorrect({ factors, total, accept }, answer)
    if (ok) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed

  const feedbackView: FeedbackView = isGraded
    ? ladder.view
    : allSelected
      ? { kind: 'note', text: resolved.correct }
      : { kind: 'idle' }

  const primary = isGraded
    ? solved
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Check', enabled: fav > 0n, onClick: check }
    : { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }

  const showReduced = snapPhase === 'done'
  const isSnapping = snapPhase === 'snapping'

  return (
    <BeatShell
      primary={primary}
      feedback={feedbackView}
      onTryAgain={
        isGraded && revealed
          ? () => {
              ladder.tryAgain()
            }
          : undefined
      }
    >
      <div className="prob-counter">
        <p
          aria-live="polite"
          aria-atomic="true"
          className="prob-counter__live"
        >
          {liveText}
        </p>

        <div className="prob-counter__chips" role="group" aria-label="Factor chips">
          {factors.map((f, i) => (
            <button
              key={i}
              type="button"
              className="prob-counter__chip"
              aria-pressed={selected[i] ?? false}
              onClick={() => toggleChip(i)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  toggleChip(i)
                }
              }}
            >
              {f.label}: {f.value}
            </button>
          ))}
        </div>

        <div className="prob-counter__display">
          <p className="prob-counter__product">
            {fav > 0n ? String(fav) : '\u2014'}
          </p>

          <div className="prob-counter__fraction-area" aria-hidden="true">
            {fav > 0n && !showReduced && (
              <span
                className={
                  'prob-counter__fraction prob-counter__fraction--raw' +
                  (isSnapping ? ' prob-counter__fraction--snapping' : '')
                }
              >
                {String(fav)} / {total.toLocaleString()}
              </span>
            )}
            {fav === 0n && (
              <span className="prob-counter__fraction prob-counter__fraction--raw">
                {'\u2014'} / {total.toLocaleString()}
              </span>
            )}
            {reduced && (showReduced || isSnapping) && (
              <span
                className={
                  'prob-counter__fraction prob-counter__fraction--reduced' +
                  (showReduced || isSnapping ? ' prob-counter__fraction--visible' : '')
                }
              >
                {String(reduced.n)}/{String(reduced.d)}
              </span>
            )}
          </div>
        </div>
      </div>
    </BeatShell>
  )
}
