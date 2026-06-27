// Graded matching grid (build-brief §4.4): a true left↔right pairing for
// spaced-retrieval openers + the L4 mixed-review checkpoint. Distinct from the
// single-select `mcq`. Tap a left item, then its partner from the (reordered)
// right palette; Check grades every pair through the hint ladder, so it drives
// needsReview + the mastery signal like other graded beats. Tap-only, aria-live.

import { useRef, useState, type ReactNode } from 'react'
import { animate, m, useMotionValue, type PanInfo } from 'motion/react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback, useHintLadder } from '../feedback'
import { SPRING } from '../../motion/tokens'
import { isRetrievalGridCorrect } from '../grading'

type DraggableTileProps = {
  className: string
  'aria-pressed'?: boolean
  'aria-label'?: string
  disabled?: boolean
  children: ReactNode
  onTap: () => void
  onDragMove: (info: PanInfo) => void
  clearDragover: () => void
  resolveDrop: (info: PanInfo, rect: DOMRect) => { cx: number; cy: number; commit: () => void } | null
  reducedMotion?: boolean
}

function DraggableTile({
  className,
  'aria-pressed': ariaPressed,
  'aria-label': ariaLabel,
  disabled,
  children,
  onTap,
  onDragMove,
  clearDragover,
  resolveDrop,
  reducedMotion,
}: DraggableTileProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef<HTMLButtonElement>(null)
  const wasDrag = useRef(false)

  return (
    <m.button
      ref={ref}
      type="button"
      className={className}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      disabled={disabled}
      style={{ x, y, position: 'relative' }}
      drag
      dragMomentum={false}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.04, rotate: 3, boxShadow: 'var(--ergo-shadow-md)' }}
      transition={SPRING}
      onClick={() => {
        if (wasDrag.current) { wasDrag.current = false; return }
        onTap()
      }}
      onDrag={(_e, info) => onDragMove(info)}
      onDragEnd={(_e, info) => {
        clearDragover()
        const realDrag = Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3
        if (!realDrag) {
          animate(x, 0, SPRING)
          animate(y, 0, SPRING)
          return
        }
        wasDrag.current = true
        const rect = ref.current?.getBoundingClientRect()
        const target = rect ? resolveDrop(info, rect) : null
        if (!target || !rect) {
          animate(x, 0, SPRING)
          animate(y, 0, SPRING)
          return
        }
        const curCx = rect.left + rect.width / 2
        const curCy = rect.top + rect.height / 2
        const nx = x.get() + (target.cx - curCx)
        const ny = y.get() + (target.cy - curCy)
        if (reducedMotion) {
          target.commit()
          x.set(0)
          y.set(0)
          return
        }
        animate(x, nx, SPRING)
        animate(y, ny, { ...SPRING, onComplete: () => { target.commit(); x.set(0); y.set(0) } })
      }}
    >
      {children}
    </m.button>
  )
}

export function RetrievalGridBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const [assign, setAssign] = useState<Record<number, string | null>>({})
  const [selLeft, setSelLeft] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const slotRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
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
    const ok = isRetrievalGridCorrect({ pairs }, assign)
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

  function handleTileDrag(info: PanInfo) {
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

  function clearDragover() {
    if (dragoverIdxRef.current != null) {
      slotRefs.current.get(dragoverIdxRef.current)?.classList.remove('retgrid__slot--dragover')
      dragoverIdxRef.current = null
    }
  }

  function resolveDrop(
    r: string,
    info: PanInfo,
  ): { cx: number; cy: number; commit: () => void } | null {
    if (solved || revealed) return null
    const idx = findSlotAtPoint(info.point.x, info.point.y)
    if (idx == null) return null
    const slotEl = slotRefs.current.get(idx)
    if (!slotEl) return null
    const slotRect = slotEl.getBoundingClientRect()
    return {
      cx: slotRect.left + slotRect.width / 2,
      cy: slotRect.top + slotRect.height / 2,
      commit: () => placeInto(idx, r),
    }
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
              <DraggableTile
                key={r}
                className={'token token--const' + (used ? ' token--placed' : '')}
                disabled={solved || revealed}
                onTap={() => { if (selLeft === null) return; placeInto(selLeft, r) }}
                onDragMove={handleTileDrag}
                clearDragover={clearDragover}
                resolveDrop={(info) => resolveDrop(r, info)}
                reducedMotion={props.reducedMotion}
              >
                {r}
              </DraggableTile>
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
