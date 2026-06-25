// Pascal's triangle tap-to-reveal beat (lesson-combinatorics-3 l3-explore).
// Ungraded (no accept in L3): tap cells to build the triangle, then Continue.
// showRowSums: right-margin "= 2^n" label animates in after each row completes.
// showSymmetry: C(n,k)=C(n,n-k) pair highlights on cell focus/hover.
// Hero: auto-reveals cells sequentially if beat.hero is present.
// Reduced-motion: synchronous full-triangle final frame on mount.

import { useState, useEffect, useMemo } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import type { FeedbackView } from '../FeedbackStrip'
import { resolveFeedback } from '../feedback'
import { useReducedMotion } from '../useReducedMotion'
import { pascalRow } from '../../engine/combinatorics'

// Mirrors --dur-tell (600 ms) from tokens.generated.ts.
const HERO_STEP_MS = 600

export function PascalTriangleBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props

  // Narrow interaction type — extract stable setup values before any hooks.
  const pt = beat.interaction.type === 'pascalTriangle' ? beat.interaction : null
  const numRows = pt?.rows ?? 0
  const reveal = pt?.reveal ?? 'tap'
  const showRowSums = pt?.showRowSums ?? false
  const showSymmetry = pt?.showSymmetry ?? false
  const hasHero = !!beat.hero

  // All hooks unconditional (Rules of Hooks — narrowing happens after).
  const reducedMotion = useReducedMotion()

  // Reduced-motion final frame: skip all animation and start fully revealed.
  const startRevealed = reveal === 'all' || (hasHero && reducedMotion)

  // revealedCells[n][k] — true once cell (row n, col k) has been revealed.
  const [revealedCells, setRevealedCells] = useState<boolean[][]>(() =>
    Array.from({ length: numRows + 1 }, (_, n) => Array(n + 1).fill(startRevealed)),
  )
  const [heroPlaying, setHeroPlaying] = useState(hasHero && !reducedMotion)
  const [liveMessage, setLiveMessage] = useState('')
  const [focusedCell, setFocusedCell] = useState<{ n: number; k: number } | null>(null)

  // Precomputed pascal rows — stable for the lifetime of this beat.
  const rowData = useMemo<bigint[][]>(
    () => Array.from({ length: numRows + 1 }, (_, n) => pascalRow(n)),
    [numRows],
  )

  const feedback = resolveFeedback(beat.feedback, pattern)

  // Hero auto-reveal: one cell at a time, left→right top→bottom, HERO_STEP_MS delay.
  useEffect(() => {
    if (pt === null || !hasHero || reducedMotion) return
    const cells: { n: number; k: number }[] = []
    for (let n = 0; n <= numRows; n++) {
      for (let k = 0; k <= n; k++) cells.push({ n, k })
    }

    let idx = 0
    let cancelled = false
    // Local mutable copy so each step reads the latest state without closures.
    const cur: boolean[][] = Array.from({ length: numRows + 1 }, (_, n) =>
      Array(n + 1).fill(false),
    )

    const revealNext = () => {
      if (cancelled) return
      const cell = cells[idx]!
      cur[cell.n]![cell.k] = true
      setRevealedCells(cur.map((row) => [...row]))

      const val = rowData[cell.n]![cell.k]!
      const rowDone = cur[cell.n]!.every(Boolean)
      if (rowDone) {
        const rowSum = rowData[cell.n]!.reduce((a, b) => a + b, 0n)
        setLiveMessage(
          `Row ${cell.n} complete. Sum = ${rowSum} = 2 to the power ${cell.n}`,
        )
      } else {
        setLiveMessage(`C(${cell.n},${cell.k}) = ${val}`)
      }

      idx++
      if (idx < cells.length) {
        setTimeout(revealNext, HERO_STEP_MS)
      } else {
        setHeroPlaying(false)
      }
    }

    const timer = setTimeout(revealNext, HERO_STEP_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // runs once on mount; pt/numRows/rowData are stable setup values

  // Guard: wrong interaction type.
  if (pt === null) return null

  const allRevealed = revealedCells.every((row) => row.every(Boolean))

  function handleCellTap(n: number, k: number) {
    if (revealedCells[n]![k]) return
    if (heroPlaying) setHeroPlaying(false)
    const newCells = revealedCells.map((row) => [...row])
    newCells[n]![k] = true
    setRevealedCells(newCells)

    const val = rowData[n]![k]!
    const rowDone = newCells[n]!.every(Boolean)
    if (rowDone) {
      const rowSum = rowData[n]!.reduce((a, b) => a + b, 0n)
      setLiveMessage(`Row ${n} complete. Sum = ${rowSum} = 2 to the power ${n}`)
    } else {
      setLiveMessage(`C(${n},${k}) = ${val}`)
    }
  }

  function handleCellFocus(n: number, k: number) {
    if (!showSymmetry || !revealedCells[n]![k]) return
    setFocusedCell({ n, k })
    const val = rowData[n]![k]!
    const symK = n - k
    if (symK !== k) {
      setLiveMessage(`C(${n},${k}) = C(${n},${symK}) = ${val}`)
    }
  }

  function handleCellBlur() {
    setFocusedCell(null)
  }

  function isSymHighlighted(n: number, k: number): boolean {
    if (!showSymmetry || !focusedCell) return false
    const { n: fn, k: fk } = focusedCell
    if (fn !== n) return false
    return k === fk || k === n - fk
  }

  // Ungraded: Continue always enabled; show feedback.correct once fully built.
  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }

  const feedbackView: FeedbackView | undefined = allRevealed
    ? { kind: 'note', text: feedback.correct }
    : undefined

  return (
    <BeatShell primary={primary} feedback={feedbackView}>
      <div className="pascal-triangle">
        {/* Visually-hidden live region — fires on cell reveal, row complete, symmetry pair. */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pascal-triangle__live sr-only"
        >
          {liveMessage}
        </div>

        <div className="pascal-triangle__grid" aria-label="Pascal's triangle">
          {revealedCells.map((row, n) => {
            const rowComplete = row.every(Boolean)
            const rowSum =
              rowComplete && showRowSums
                ? rowData[n]!.reduce((a, b) => a + b, 0n)
                : null

            return (
              <div key={n} className="pascal-triangle__row">
                <div className="pascal-triangle__row-cells">
                  {row.map((isReveal, k) => {
                    const val = rowData[n]![k]!
                    const symHi = isSymHighlighted(n, k)

                    return (
                      <div
                        key={k}
                        role={isReveal ? 'cell' : 'button'}
                        aria-label={
                          isReveal
                            ? `C(${n},${k}) = ${val}`
                            : `Reveal C(${n},${k})`
                        }
                        tabIndex={isReveal ? -1 : 0}
                        data-n={n}
                        data-k={k}
                        className={
                          'pascal-triangle__cell' +
                          (isReveal ? ' pascal-triangle__cell--revealed' : '') +
                          (symHi ? ' sym-hi' : '')
                        }
                        onClick={() => {
                          if (!isReveal) handleCellTap(n, k)
                        }}
                        onKeyDown={(e) => {
                          if (
                            !isReveal &&
                            (e.key === ' ' || e.key === 'Enter')
                          ) {
                            e.preventDefault()
                            handleCellTap(n, k)
                          }
                        }}
                        onFocus={() => {
                          if (isReveal) handleCellFocus(n, k)
                        }}
                        onMouseEnter={() => {
                          if (isReveal) handleCellFocus(n, k)
                        }}
                        onBlur={handleCellBlur}
                        onMouseLeave={handleCellBlur}
                      >
                        {isReveal ? String(val) : ''}
                      </div>
                    )
                  })}
                </div>

                {rowSum !== null && (
                  <span
                    className="pascal-triangle__row-sum"
                    aria-label={`Row ${n} sums to ${rowSum} = 2 to the power ${n}`}
                  >
                    {`= 2^${n}`}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </BeatShell>
  )
}
