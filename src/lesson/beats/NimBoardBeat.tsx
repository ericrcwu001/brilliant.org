import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import {
  nimSum,
  nimIsWinning,
  nimWinningMoves,
  subtractionIsWinning,
  subtractionWinningMove,
} from '../../engine/gameTheory'

export function NimBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props

  // Narrow interaction shape before hooks; hooks must remain unconditional.
  const nimInteraction =
    beat.interaction.type === 'nimBoard' ? beat.interaction : null

  const initialHeaps = nimInteraction?.heaps ?? []
  const task = nimInteraction?.task ?? 'nim'
  const maxRemove = nimInteraction?.maxRemove ?? 1

  // ALL hooks unconditional — early return comes after.
  const [heaps, setHeaps] = useState<number[]>(initialHeaps)
  // Reduced-motion: reveal the winning move immediately (static final frame).
  const [showMove, setShowMove] = useState(reducedMotion)
  const [statusKey, setStatusKey] = useState(0)

  if (nimInteraction === null) return null

  const isNim = task === 'nim'
  const pile = heaps[0] ?? 0
  const currentNimSum = nimSum(heaps)
  const isWinning = isNim
    ? nimIsWinning(heaps)
    : subtractionIsWinning(pile, maxRemove)
  const modulo = maxRemove + 1
  const residue = pile % modulo

  const winMoves = isNim ? nimWinningMoves(heaps) : []
  const subMove = !isNim ? subtractionWinningMove(pile, maxRemove) : null

  const statusText = isNim
    ? `nim-sum ${currentNimSum} — ${isWinning ? 'first player wins' : 'losing position'}`
    : `pile ${pile} — ${isWinning ? 'first player wins' : 'losing position'}`

  const winMoveText =
    isNim && winMoves.length > 0
      ? `Reduce heap ${winMoves[0].heap + 1} (size ${heaps[winMoves[0].heap]}) to ${winMoves[0].removeTo}`
      : !isNim && subMove !== null
        ? `Remove ${subMove} token${subMove !== 1 ? 's' : ''}`
        : null

  function handleNimTap(heapIdx: number, tokenIdx: number) {
    setHeaps((prev) => {
      const next = [...prev]
      next[heapIdx] = tokenIdx
      return next
    })
    setShowMove(false)
    setStatusKey((n) => n + 1)
  }

  function handleSubtract(amount: number) {
    setHeaps((prev) => {
      const next = [...prev]
      next[0] = Math.max(0, (prev[0] ?? 0) - amount)
      return next
    })
    setShowMove(false)
    setStatusKey((n) => n + 1)
  }

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="gt-nim">
        {/* Status line — aria-live so screen readers hear each update */}
        <p aria-live="polite" aria-atomic="true" className="gt-nim__status">
          <span
            key={statusKey}
            className={`gt-nim__status-badge gt-nim__status-badge--${isWinning ? 'win' : 'lose'}`}
          >
            {statusText}
          </span>
        </p>

        {/* Heap rows */}
        <div className="gt-nim__heaps">
          {heaps.map((size, heapIdx) => {
            const winMove =
              isNim && showMove
                ? winMoves.find((m) => m.heap === heapIdx)
                : undefined
            return (
              <div
                key={heapIdx}
                className="gt-nim__heap"
                role="group"
                aria-label={`Heap ${heapIdx + 1}, ${size} token${size !== 1 ? 's' : ''}`}
              >
                <span className="gt-nim__heap-label" aria-hidden="true">
                  {isNim ? `H${heapIdx + 1}` : 'Pile'}
                </span>
                <div className="gt-nim__heap-tokens">
                  {size === 0 ? (
                    <span className="gt-nim__heap-empty">(empty)</span>
                  ) : (
                    Array.from({ length: size }, (_, tokenIdx) => {
                      const isHighlighted =
                        winMove !== undefined && tokenIdx === winMove.removeTo
                      return (
                        <button
                          key={tokenIdx}
                          type="button"
                          className={
                            'gt-nim__token' +
                            (isHighlighted ? ' gt-nim__token--highlight' : '')
                          }
                          aria-label={
                            isNim
                              ? `Reduce heap ${heapIdx + 1} to ${tokenIdx} tokens`
                              : `Remove ${size - tokenIdx} token${size - tokenIdx !== 1 ? 's' : ''}`
                          }
                          onClick={() => {
                            if (isNim) handleNimTap(heapIdx, tokenIdx)
                            else handleSubtract(size - tokenIdx)
                          }}
                        />
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Subtraction: explicit remove-k buttons alongside the token display */}
        {!isNim && pile > 0 && (
          <div
            className="gt-nim__sub-controls"
            role="group"
            aria-label="Remove tokens"
          >
            {Array.from({ length: Math.min(maxRemove, pile) }, (_, i) => {
              const k = i + 1
              const isHighlighted = showMove && subMove === k
              return (
                <button
                  key={k}
                  type="button"
                  className={
                    'gt-nim__remove-btn' +
                    (isHighlighted ? ' gt-nim__remove-btn--highlight' : '')
                  }
                  aria-label={`Remove ${k} token${k !== 1 ? 's' : ''}`}
                  onClick={() => handleSubtract(k)}
                >
                  {`\u2212${k}`}
                </button>
              )
            })}
          </div>
        )}

        {/* Subtraction framing: "land on a multiple of k+1" */}
        {!isNim && (
          <p className="gt-nim__framing">
            {`Land on a multiple of ${modulo}. Current residue: ${residue}.`}
          </p>
        )}

        {/* Nim framing: show the live nim-sum */}
        {isNim && heaps.length > 1 && (
          <p className="gt-nim__framing">{`Nim-sum (XOR): ${currentNimSum}`}</p>
        )}

        {/* Show winning move affordance — hidden once revealed */}
        {isWinning && !showMove && (
          <button
            type="button"
            className="gt-nim__reveal-btn"
            onClick={() => setShowMove(true)}
          >
            Show winning move
          </button>
        )}

        {/* Winning-move hint */}
        {showMove && isWinning && winMoveText !== null && (
          <p className="gt-nim__move-hint" role="status">
            {winMoveText}
          </p>
        )}
      </div>
    </BeatShell>
  )
}
