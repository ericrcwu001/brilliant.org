// Pigeonhole board beat (lesson-combinatorics-5 l5-explore, l5-scaffold).
// DOM-only (not Konva). Items strip + holes grid; tap-to-place (tap an item
// then a hole). Drag additive-only. Forced-collision highlight once N > H.
// Hero (l5-explore): auto-place items sequentially; reduced-motion → static
// final frame (board filled, collision hole highlighted). Ungraded in L5.

import { useState, useEffect, useRef } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../feedback'
import { useReducedMotion } from '../useReducedMotion'
import { forcesCollision } from '../../engine/combinatorics'

// Mirrors --dur-tell (600 ms) from the design token set.
const HERO_STEP_MS = 600
// Dwell on collision before resuming auto-place: 2× --dur-slow (800 ms × 2).
const HERO_COLLISION_DWELL_MS = 800

type Placement = { itemIdx: number; holeIdx: number }

function buildFinalPlacements(items: number, holes: number): Placement[] {
  const placements: Placement[] = []
  for (let i = 0; i < items; i++) {
    placements.push({ itemIdx: i, holeIdx: i % holes })
  }
  return placements
}

export function PigeonholeBoardBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props

  const pb =
    beat.interaction.type === 'pigeonholeBoard' ? beat.interaction : null
  const numItems = pb?.items ?? 0
  const numHoles = pb?.holes ?? 0
  const holeLabels = pb?.holeLabels
  const itemLabel = pb?.itemLabel ?? 'item'
  const hasHero = !!beat.hero

  const reducedMotion = useReducedMotion()

  const finalPlacements = buildFinalPlacements(numItems, numHoles)

  const startPlacements: Placement[] =
    hasHero && reducedMotion ? finalPlacements : []

  const [placements, setPlacements] = useState<Placement[]>(startPlacements)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [heroPlaying, setHeroPlaying] = useState(
    hasHero && !reducedMotion,
  )
  const [collisionHole, setCollisionHole] = useState<number | null>(
    hasHero && reducedMotion
      ? finalPlacements.filter((p) =>
          finalPlacements.filter((q) => q.holeIdx === p.holeIdx).length >= 2
        ).map((p) => p.holeIdx)[0] ?? null
      : null,
  )
  const [politeMsg, setPoliteMsg] = useState('')
  const [assertiveMsg, setAssertiveMsg] = useState('')
  const [completed, setCompleted] = useState(false)

  const feedback = resolveFeedback(beat.feedback, pattern)

  const cancelledRef = useRef(false)

  useEffect(() => {
    if (pb === null || !hasHero || reducedMotion) return
    cancelledRef.current = false

    const placer: Placement[] = []
    let idx = 0

    const placeNext = () => {
      if (cancelledRef.current) return
      const fp = finalPlacements[idx]!
      placer.push(fp)
      setPlacements([...placer])

      const placed = placer.length
      const label = holeLabels?.[fp.holeIdx] ?? `Hole ${fp.holeIdx + 1}`
      setPoliteMsg(`${placed} of ${numItems} placed`)

      const countInHole = placer.filter((p) => p.holeIdx === fp.holeIdx).length
      const globalCollision = forcesCollision(placer.length, numHoles)

      if (globalCollision && countInHole >= 2 && collisionHole === null) {
        setCollisionHole(fp.holeIdx)
        setAssertiveMsg(`Collision forced in ${label}! Two ${itemLabel}s share this color.`)
      }

      idx++
      if (idx < numItems) {
        const delay =
          collisionHole === null &&
          globalCollision &&
          countInHole >= 2
            ? HERO_COLLISION_DWELL_MS
            : HERO_STEP_MS
        setTimeout(placeNext, delay)
      } else {
        setHeroPlaying(false)
        setCompleted(true)
      }
    }

    const timer = setTimeout(placeNext, HERO_STEP_MS)
    return () => {
      cancelledRef.current = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // runs once on mount

  if (pb === null) return null

  const placedCount = placements.length

  const countInHole = (holeIdx: number) =>
    placements.filter((p) => p.holeIdx === holeIdx).length

  const itemsInHole = (holeIdx: number) =>
    placements.filter((p) => p.holeIdx === holeIdx)

  const isItemPlaced = (itemIdx: number) =>
    placements.some((p) => p.itemIdx === itemIdx)

  function handleItemClick(itemIdx: number) {
    if (isItemPlaced(itemIdx)) return
    if (heroPlaying) setHeroPlaying(false)
    setSelectedItem((prev) => (prev === itemIdx ? null : itemIdx))
  }

  function placeItem(holeIdx: number) {
    if (selectedItem === null) return
    if (isItemPlaced(selectedItem)) {
      setSelectedItem(null)
      return
    }
    const next: Placement[] = [...placements, { itemIdx: selectedItem, holeIdx }]
    setPlacements(next)
    setSelectedItem(null)

    const placed = next.length
    const label = holeLabels?.[holeIdx] ?? `Hole ${holeIdx + 1}`
    setPoliteMsg(`${placed} of ${numItems} placed`)

    const countNow = next.filter((p) => p.holeIdx === holeIdx).length
    if (countNow >= 2 && forcesCollision(next.length, numHoles) && collisionHole === null) {
      setCollisionHole(holeIdx)
      setAssertiveMsg(`Collision forced in ${label}! Two ${itemLabel}s share this color.`)
    }

    if (placed === numItems) {
      setCompleted(true)
    }
  }

  function handleHoleClick(holeIdx: number) {
    placeItem(holeIdx)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, holeIdx: number) {
    e.preventDefault()
    const itemIdx = parseInt(e.dataTransfer.getData('itemIdx'), 10)
    if (isNaN(itemIdx) || isItemPlaced(itemIdx)) return
    setSelectedItem(null)

    const next: Placement[] = [...placements, { itemIdx, holeIdx }]
    setPlacements(next)

    const placed = next.length
    const label = holeLabels?.[holeIdx] ?? `Hole ${holeIdx + 1}`
    setPoliteMsg(`${placed} of ${numItems} placed`)

    const countNow = next.filter((p) => p.holeIdx === holeIdx).length
    if (countNow >= 2 && forcesCollision(next.length, numHoles) && collisionHole === null) {
      setCollisionHole(holeIdx)
      setAssertiveMsg(`Collision forced in ${label}! Two ${itemLabel}s share this color.`)
    }

    if (placed === numItems) {
      setCompleted(true)
    }
  }

  function handleDragStart(
    e: React.DragEvent<HTMLDivElement>,
    itemIdx: number,
  ) {
    e.dataTransfer.setData('itemIdx', String(itemIdx))
  }

  const feedbackView: FeedbackView | undefined =
    completed || (hasHero && reducedMotion)
      ? { kind: 'note', text: feedback.correct }
      : undefined

  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }

  return (
    <BeatShell primary={primary} feedback={feedbackView}>
      <div className="pigeonhole-board">
        {/* Visually-hidden aria-live regions */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {politeMsg}
        </div>
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        >
          {assertiveMsg}
        </div>

        {/* Items-placed counter */}
        <div
          className="pigeonhole-board__counter"
          aria-live="polite"
          aria-label={`${placedCount} of ${numItems} placed`}
        >
          <span className="pigeonhole-board__counter-label">Placed</span>
          <span className="pigeonhole-board__counter-count">
            {placedCount}/{numItems}
          </span>
        </div>

        {/* Items strip */}
        <div
          className="pigeonhole-board__items"
          role="group"
          aria-label={`${numItems} ${itemLabel}s to place`}
        >
          {Array.from({ length: numItems }, (_, i) => {
            const placed = isItemPlaced(i)
            const selected = selectedItem === i
            return (
              <div
                key={i}
                role={placed ? 'presentation' : 'button'}
                tabIndex={placed ? -1 : 0}
                aria-label={placed ? undefined : `Select ${itemLabel} ${i + 1}`}
                aria-pressed={selected ? 'true' : undefined}
                draggable={!placed}
                className={
                  'pigeonhole-board__item' +
                  (placed ? ' pigeonhole-board__item--placed' : '') +
                  (selected ? ' pigeonhole-board__item--selected' : '')
                }
                onClick={() => handleItemClick(i)}
                onKeyDown={(e) => {
                  if (!placed && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleItemClick(i)
                  }
                }}
                onDragStart={placed ? undefined : (e) => handleDragStart(e, i)}
              >
                {itemLabel} {i + 1}
              </div>
            )
          })}
        </div>

        {/* Holes grid */}
        <div
          className="pigeonhole-board__holes"
          role="group"
          aria-label={`${numHoles} holes`}
        >
          {Array.from({ length: numHoles }, (_, h) => {
            const label = holeLabels?.[h] ?? `Hole ${h + 1}`
            const isCollided = collisionHole === h
            const cnt = countInHole(h)
            const items = itemsInHole(h)
            return (
              <div
                key={h}
                role="button"
                tabIndex={0}
                aria-label={
                  `${label}: ${cnt} ${itemLabel}${cnt !== 1 ? 's' : ''}` +
                  (selectedItem !== null ? '; press Enter to place here' : '')
                }
                className={
                  'pigeonhole-board__hole' +
                  (isCollided ? ' pigeonhole-board__hole--collision' : '')
                }
                onClick={() => handleHoleClick(h)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleHoleClick(h)
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, h)}
              >
                <span className="pigeonhole-board__hole-label">{label}</span>
                <div className="pigeonhole-board__hole-items">
                  {items.map((p) => (
                    <div
                      key={p.itemIdx}
                      className={
                        'pigeonhole-board__token' +
                        (isCollided ? ' pigeonhole-board__token--collision' : '')
                      }
                      aria-hidden="true"
                    >
                      {itemLabel} {p.itemIdx + 1}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </BeatShell>
  )
}
