// Graded matching grid (build-brief §4.4): a true left↔right pairing for
// spaced-retrieval openers + the L4 mixed-review checkpoint. Distinct from the
// single-select `mcq`. Tap a left item, then its partner from the (reordered)
// right palette; Check grades every pair through the hint ladder, so it drives
// needsReview + the mastery signal like other graded beats. Tap-only, aria-live.

import { useRef, useState } from 'react'
import { m, type PanInfo } from 'motion/react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { SPRING } from '../../motion/tokens'

export function RetrievalGridBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const [assign, setAssign] = useState<Record<number, string | null>>({})
  const [selLeft, setSelLeft] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const slotRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const wasDragRef = useRef(false)
  const dragoverIdxRef = useRef<number | null>(null)

  const ladder = useHintLadder({
    feedback: resolveFeedback(beat.feedback, pattern),
    required: beat.required,
    maxHintLevel: props.hintCapOverride ?? beat.maxHintLevel,
    onNeedsReview: props.reportNeedsReview,
    initialLevel: props.initialHintLevel,
    onLevelChange: props.onHintLevelChange,
    event: { lessonId: props.lessonId, beatId: beat.beatId },
  })

  if (beat.interaction.type !== 'retrievalGrid') return null
  const { pairs } = beat.interaction
  // Reorder the right palette so the rows don't line up 1:1 (still tap-only).
  const rights = pairs.map((p) => p.right).slice().reverse()
  const revealed = ladder.view.kind === 'hint' && ladder.view.revealed
  const graded = ladder.view.kind === 'hint' && !solved
  const allAssigned = pairs.every((_, i) => assign[i] != null)

  function check() {
    const ok = pairs.every((p, i) => assign[i] === p.right)
    if (ok) {
      ladder.submitCorrect()
      setSolved(true)
    } else {
      ladder.submitWrong()
    }
  }

  function placeInto(leftIdx: number, r: string) {
    setAssign((prev) => {
      const next: Record<number, string | null> = {}
      for (const [k, v] of Object.entries(prev)) next[Number(k)] = v === r ? null : v
      next[leftIdx] = r
      return next
    })
    setSelLeft(null)
    ladder.clear()
  }

  function findSlotAtPoint(x: number, y: number): number | null {
    const vx = x - window.scrollX
    const vy = y - window.scrollY
    for (const [idx, el] of slotRefs.current) {
      const rect = el.getBoundingClientRect()
      if (vx >= rect.left && vx <= rect.right && vy >= rect.top && vy <= rect.bottom) return idx
    }
    return null
  }

  function handleTileDrag(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const found = findSlotAtPoint(info.point.x, info.point.y)
    if (found === dragoverIdxRef.current) return
    if (dragoverIdxRef.current != null) {
      slotRefs.current.get(dragoverIdxRef.current)?.classList.remove('retgrid__slot--dragover')
    }
    if (found != null) {
      slotRefs.current.get(found)?.classList.add('retgrid__slot--dragover')
    }
    dragoverIdxRef.current = found
  }

  function handleTileDragEnd(r: string, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (dragoverIdxRef.current != null) {
      slotRefs.current.get(dragoverIdxRef.current)?.classList.remove('retgrid__slot--dragover')
      dragoverIdxRef.current = null
    }
    const realDrag = Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3
    if (!realDrag) return
    wasDragRef.current = true
    if (solved || revealed) return
    const idx = findSlotAtPoint(info.point.x, info.point.y)
    if (idx == null) return
    placeInto(idx, r)
  }

  const primary = solved
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Check', enabled: allAssigned, onClick: check }

  return (
    <BeatShell
      primary={primary}
      feedback={ladder.view}
      onTryAgain={
        revealed
          ? () => {
              ladder.tryAgain()
              setAssign({})
              setSelLeft(null)
            }
          : undefined
      }
    >
      <div className="retgrid">
        <p className="retgrid__label">Tap a result on the left, then its match — or drag a match onto a slot.</p>
        <ul className="retgrid__rows">
          {pairs.map((p, i) => {
            const shown = revealed ? p.right : (assign[i] ?? null)
            const status =
              graded && assign[i] != null
                ? assign[i] === p.right
                  ? 'correct'
                  : 'wrong'
                : solved || revealed
                  ? 'correct'
                  : ''
            return (
              <li className="retgrid__row" key={p.left}>
                <span className="retgrid__left">{p.left}</span>
                <button
                  type="button"
                  className={
                    'retgrid__slot' +
                    (selLeft === i ? ' retgrid__slot--sel' : '') +
                    (shown ? ' retgrid__slot--filled' : '') +
                    (status ? ` retgrid__slot--${status}` : '')
                  }
                  disabled={solved || revealed}
                  aria-label={`${p.left}: ${shown ?? 'unmatched'}`}
                  onClick={() => setSelLeft((cur) => (cur === i ? null : i))}
                  ref={(el) => { if (el) slotRefs.current.set(i, el); else slotRefs.current.delete(i) }}
                >
                  {shown ?? 'tap, then pick a match'}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="retgrid__palette" aria-label="Matches">
          {rights.map((r) => {
            const used = Object.values(assign).includes(r)
            return (
              <m.button
                key={r}
                type="button"
                className={'token token--const' + (used ? ' token--placed' : '')}
                disabled={solved || revealed}
                onClick={() => {
                  if (wasDragRef.current) { wasDragRef.current = false; return }
                  if (selLeft === null) return
                  placeInto(selLeft, r)
                }}
                drag
                dragSnapToOrigin
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                whileDrag={{ scale: 1.04, rotate: 3, boxShadow: 'var(--ergo-shadow-md)' }}
                transition={SPRING}
                onDrag={handleTileDrag}
                onDragEnd={(e, info) => handleTileDragEnd(r, e, info)}
                style={{ position: 'relative' }}
              >
                {r}
              </m.button>
            )
          })}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {graded ? 'Some matches need another look.' : solved ? 'All matched.' : ''}
        </p>
      </div>
    </BeatShell>
  )
}
