// PayoffMatrixBeat — 2-player normal-form bimatrix explorer.
// Ungraded interactive widget; five task modes via interaction.task:
//   bestResponse | nash | dominance | value | mix
// All hooks unconditional; early return for wrong interaction type comes after.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import {
  rowBestResponses,
  colBestResponses,
  pureNashEquilibria,
  strictlyDominatedRows,
  strictlyDominatedCols,
  iesdsSolution,
  iteratedElimination,
  saddlePoint,
  mixedValue2x2,
  formatRational,
} from '../../engine/gameTheory'
import type { Game } from '../../engine/gameTheory'

export function PayoffMatrixBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props

  // Narrow interaction before hooks (hooks must remain unconditional).
  const interaction =
    beat.interaction.type === 'payoffMatrix' ? beat.interaction : null

  // Derive game data before hooks; safe with empty arrays when interaction is null.
  const game: Game =
    interaction?.matrix.map((r) =>
      r.cells.map((c) => ({ row: c.row, col: c.col })),
    ) ?? []

  const rowMatrix =
    interaction?.matrix.map((r) => r.cells.map((c) => c.row)) ?? []

  const task = interaction?.task ?? 'nash'
  const rowLabels = interaction?.rows ?? []
  const colLabels = interaction?.cols ?? []
  const rowPlayer = interaction?.rowPlayer ?? 'Row'
  const colPlayer = interaction?.colPlayer ?? 'Column'

  // Pre-compute engine outputs.
  // strictlyDominated* access g[0] directly — guard against empty game.
  const nashEqs = game.length > 0 ? pureNashEquilibria(game) : []
  const domRowIdxs = game.length > 0 ? strictlyDominatedRows(game) : []
  const domColIdxs = game.length > 0 ? strictlyDominatedCols(game) : []
  const rowBRs = game.length > 0 ? rowBestResponses(game) : []
  const colBRs = game.length > 0 ? colBestResponses(game) : []
  const saddle = rowMatrix.length > 0 ? saddlePoint(rowMatrix) : null

  // Mix equilibrium — may throw if game has a saddle point; handled gracefully.
  const mixEq: ReturnType<typeof mixedValue2x2> | null = (() => {
    if (task !== 'mix' || rowMatrix.length !== 2 || rowMatrix[0]?.length !== 2)
      return null
    try {
      return mixedValue2x2(rowMatrix)
    } catch {
      return null
    }
  })()

  // ── All hooks unconditional ──────────────────────────────────────────────

  // bestResponse: which col / row header is highlighted
  const [brHighlightCol, setBrHighlightCol] = useState<number | null>(null)
  const [brHighlightRow, setBrHighlightRow] = useState<number | null>(null)

  // nash: keys of NEs the learner has found ("row,col")
  const [foundNEKeys, setFoundNEKeys] = useState<string[]>([])

  // dominance: marked headers (learner's exploration) + solve state
  const [domMarkedRows, setDomMarkedRows] = useState<number[]>([])
  const [domMarkedCols, setDomMarkedCols] = useState<number[]>([])
  const [dominanceSolved, setDominanceSolved] = useState(false)

  // mix: slider position 0–100 (percent)
  const [sliderPercent, setSliderPercent] = useState<number>(() => {
    // Reduced-motion → start at equilibrium p* so the final frame is shown.
    if (task === 'mix' && reducedMotion && mixEq !== null) {
      return Math.round((mixEq.p.n / mixEq.p.d) * 100)
    }
    return 50
  })

  // Shared aria-live message for screen readers.
  const [liveMsg, setLiveMsg] = useState('')

  // ── Guard: wrong interaction type ────────────────────────────────────────
  if (interaction === null) return null

  // ── Derived values ────────────────────────────────────────────────────────

  // Nash: all equilibria found (or none exist) → reveal the set.
  const nashRevealed =
    task === 'nash' &&
    (nashEqs.length === 0 || foundNEKeys.length >= nashEqs.length)

  // Dominance: IESDS solution (only after Solve is pressed).
  const iesdsResult = dominanceSolved ? iesdsSolution(game) : null

  // Value: row-minimum column indices and col-maximum row indices.
  const rowMinCol: number[] =
    task === 'value'
      ? rowMatrix.map((row) => {
          let minJ = 0
          for (let j = 1; j < row.length; j++) {
            const cur = row[j]
            const min = row[minJ]
            if (cur.n * min.d < min.n * cur.d) minJ = j
          }
          return minJ
        })
      : []

  const colMaxRow: number[] =
    task === 'value'
      ? colLabels.map((_, j) => {
          let maxI = 0
          for (let i = 1; i < rowMatrix.length; i++) {
            const cur = rowMatrix[i][j]
            const max = rowMatrix[maxI][j]
            if (cur.n * max.d > max.n * cur.d) maxI = i
          }
          return maxI
        })
      : []

  // Mix: expected values at current p for both column strategies.
  const pFloat = sliderPercent / 100
  const mixEvVsCol0 =
    task === 'mix' && rowMatrix.length === 2
      ? pFloat * (rowMatrix[0][0].n / rowMatrix[0][0].d) +
        (1 - pFloat) * (rowMatrix[1][0].n / rowMatrix[1][0].d)
      : 0
  const mixEvVsCol1 =
    task === 'mix' && rowMatrix.length === 2
      ? pFloat * (rowMatrix[0][1].n / rowMatrix[0][1].d) +
        (1 - pFloat) * (rowMatrix[1][1].n / rowMatrix[1][1].d)
      : 0
  // Within 1% of the equilibrium probability → show crossing highlight.
  const atEquilibrium =
    mixEq !== null && Math.abs(pFloat - mixEq.p.n / mixEq.p.d) < 0.01

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleColHeaderClick(j: number) {
    if (task === 'bestResponse') {
      const next = brHighlightCol === j ? null : j
      setBrHighlightCol(next)
      setBrHighlightRow(null)
      if (next !== null) {
        const best = (rowBRs[j] ?? []).map((i) => rowLabels[i]).join(', ')
        setLiveMsg(
          best
            ? `Best response for ${rowPlayer} vs ${colLabels[j]}: ${best}`
            : `No best response for ${colLabels[j]}`,
        )
      } else {
        setLiveMsg('')
      }
    } else if (task === 'dominance') {
      setDomMarkedCols((prev) =>
        prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j],
      )
    }
  }

  function handleRowHeaderClick(i: number) {
    if (task === 'bestResponse') {
      const next = brHighlightRow === i ? null : i
      setBrHighlightRow(next)
      setBrHighlightCol(null)
      if (next !== null) {
        const best = (colBRs[i] ?? []).map((j) => colLabels[j]).join(', ')
        setLiveMsg(
          best
            ? `Best response for ${colPlayer} vs ${rowLabels[i]}: ${best}`
            : `No best response for ${rowLabels[i]}`,
        )
      } else {
        setLiveMsg('')
      }
    } else if (task === 'dominance') {
      setDomMarkedRows((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
      )
    }
  }

  function handleCellClick(i: number, j: number) {
    if (task !== 'nash' || nashRevealed) return
    const key = `${i},${j}`
    const isNE = nashEqs.some((ne) => ne.row === i && ne.col === j)
    if (isNE && !foundNEKeys.includes(key)) {
      const next = [...foundNEKeys, key]
      setFoundNEKeys(next)
      const allFound = next.length >= nashEqs.length
      setLiveMsg(
        allFound
          ? `All ${nashEqs.length} Nash equilibri${nashEqs.length === 1 ? 'um' : 'a'} found!`
          : `Nash equilibrium: (${rowLabels[i]}, ${colLabels[j]}). ${next.length} of ${nashEqs.length} found.`,
      )
    } else if (!isNE) {
      setLiveMsg(
        `(${rowLabels[i]}, ${colLabels[j]}) is not a mutual best response.`,
      )
    }
  }

  function handleSolve() {
    setDominanceSolved(true)
    const result = iesdsSolution(game)
    if (result !== null) {
      setLiveMsg(
        `IESDS: unique survivor is (${rowLabels[result.row]}, ${colLabels[result.col]}).`,
      )
    } else {
      const { rows: surRows, cols: surCols } = iteratedElimination(game)
      setLiveMsg(
        `After IESDS: ${surRows.length} row ${surRows.length === 1 ? 'strategy' : 'strategies'} and ${surCols.length} column ${surCols.length === 1 ? 'strategy' : 'strategies'} survive.`,
      )
    }
  }

  // ── Cell classification helpers ───────────────────────────────────────────

  function isBRHighlighted(i: number, j: number): boolean {
    if (task !== 'bestResponse') return false
    if (brHighlightCol !== null && brHighlightCol === j)
      return (rowBRs[j] ?? []).includes(i)
    if (brHighlightRow !== null && brHighlightRow === i)
      return (colBRs[i] ?? []).includes(j)
    return false
  }

  // ── Interaction flags ─────────────────────────────────────────────────────

  const colHeaderTappable = task === 'bestResponse' || task === 'dominance'
  const rowHeaderTappable = task === 'bestResponse' || task === 'dominance'
  const cellTappable = task === 'nash' && !nashRevealed

  // Only show both payoffs for general-sum tasks; zero-sum tasks show row only.
  const showBothPayoffs = task !== 'value' && task !== 'mix'

  // ── BeatShell actions ────────────────────────────────────────────────────

  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }

  const secondary =
    task === 'dominance'
      ? {
          label: dominanceSolved ? 'Solved' : 'Solve',
          onClick: handleSolve,
          enabled: !dominanceSolved,
        }
      : undefined

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <BeatShell primary={primary} secondary={secondary}>
      <div className="gt-payoff">
        {/* Player axis labels */}
        <div className="gt-payoff__players" aria-hidden="true">
          <span className="gt-payoff__player-label gt-payoff__player-label--row">
            ↕ {rowPlayer}
          </span>
          <span className="gt-payoff__player-label">↔ {colPlayer}</span>
        </div>

        {/* Main bimatrix table */}
        <div
          className="gt-payoff__table-wrap"
          role="region"
          aria-label="Payoff matrix"
        >
          <table className="gt-payoff__table">
            <thead>
              <tr>
                <th
                  className="gt-payoff__corner"
                  aria-label={`${rowPlayer} strategies (rows) vs ${colPlayer} strategies (columns)`}
                >
                  <span className="gt-payoff__corner-labels" aria-hidden="true">
                    <span>{rowPlayer}</span>
                    <span>{colPlayer}</span>
                  </span>
                </th>
                {colLabels.map((col, j) => {
                  const isActive = task === 'bestResponse' && brHighlightCol === j
                  const isDominated =
                    task === 'dominance' && domColIdxs.includes(j)
                  const isMarked =
                    task === 'dominance' && domMarkedCols.includes(j)
                  const cls = [
                    'gt-payoff__col-header',
                    colHeaderTappable
                      ? 'gt-payoff__col-header--tappable'
                      : '',
                    isDominated ? 'gt-payoff__col-header--dominated' : '',
                    isMarked ? 'gt-payoff__col-header--marked' : '',
                    isActive ? 'gt-payoff__col-header--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <th
                      key={j}
                      scope="col"
                      className={cls}
                      onClick={
                        colHeaderTappable
                          ? () => handleColHeaderClick(j)
                          : undefined
                      }
                      tabIndex={colHeaderTappable ? 0 : undefined}
                      onKeyDown={
                        colHeaderTappable
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleColHeaderClick(j)
                              }
                            }
                          : undefined
                      }
                      aria-pressed={
                        task === 'bestResponse' ? isActive : undefined
                      }
                    >
                      {col}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rowLabels.map((row, i) => {
                const isActive =
                  task === 'bestResponse' && brHighlightRow === i
                const isDominated =
                  task === 'dominance' && domRowIdxs.includes(i)
                const isMarked =
                  task === 'dominance' && domMarkedRows.includes(i)
                const rhCls = [
                  'gt-payoff__row-header',
                  rowHeaderTappable
                    ? 'gt-payoff__row-header--tappable'
                    : '',
                  isDominated ? 'gt-payoff__row-header--dominated' : '',
                  isMarked ? 'gt-payoff__row-header--marked' : '',
                  isActive ? 'gt-payoff__row-header--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <tr key={i}>
                    <th
                      scope="row"
                      className={rhCls}
                      onClick={
                        rowHeaderTappable
                          ? () => handleRowHeaderClick(i)
                          : undefined
                      }
                      tabIndex={rowHeaderTappable ? 0 : undefined}
                      onKeyDown={
                        rowHeaderTappable
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleRowHeaderClick(i)
                              }
                            }
                          : undefined
                      }
                      aria-pressed={
                        task === 'bestResponse' ? isActive : undefined
                      }
                    >
                      {row}
                    </th>
                    {colLabels.map((_, j) => {
                      const cell = interaction.matrix[i].cells[j]
                      const rowPayoff = formatRational(cell.row)
                      const colPayoff = showBothPayoffs
                        ? formatRational(cell.col)
                        : null

                      const isBR = isBRHighlighted(i, j)
                      const isNEFound = foundNEKeys.includes(`${i},${j}`)
                      const isSaddleCell =
                        saddle !== null &&
                        saddle.row === i &&
                        saddle.col === j
                      const isRowMin =
                        task === 'value' && rowMinCol[i] === j
                      const isColMax =
                        task === 'value' && colMaxRow[j] === i
                      const isSurvivor =
                        dominanceSolved &&
                        iesdsResult !== null &&
                        iesdsResult.row === i &&
                        iesdsResult.col === j

                      const cellCls = [
                        'gt-payoff__cell',
                        cellTappable ? 'gt-payoff__cell--tappable' : '',
                        isBR ? 'gt-payoff__cell--best-response' : '',
                        isNEFound ? 'gt-payoff__cell--ne' : '',
                        isSaddleCell ? 'gt-payoff__cell--saddle' : '',
                        isRowMin && !isSaddleCell
                          ? 'gt-payoff__cell--row-min'
                          : '',
                        isColMax && !isSaddleCell
                          ? 'gt-payoff__cell--col-max'
                          : '',
                        isSurvivor ? 'gt-payoff__cell--survivor' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')

                      const ariaLabel = showBothPayoffs
                        ? `${row}, ${colLabels[j]}: ${rowPlayer} ${rowPayoff}, ${colPlayer} ${colPayoff}${isNEFound ? ', Nash equilibrium' : ''}`
                        : `${row}, ${colLabels[j]}: ${rowPayoff}${isSaddleCell ? ', saddle point' : ''}`

                      return (
                        <td
                          key={j}
                          className={cellCls}
                          onClick={
                            cellTappable
                              ? () => handleCellClick(i, j)
                              : undefined
                          }
                          tabIndex={cellTappable ? 0 : undefined}
                          onKeyDown={
                            cellTappable
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleCellClick(i, j)
                                  }
                                }
                              : undefined
                          }
                          aria-label={ariaLabel}
                        >
                          {showBothPayoffs ? (
                            <span className="gt-payoff__payoff">
                              <span className="gt-payoff__payoff-row">
                                {rowPayoff}
                              </span>
                              <span
                                className="gt-payoff__payoff-sep"
                                aria-hidden="true"
                              >
                                ,
                              </span>
                              <span className="gt-payoff__payoff-col">
                                {colPayoff}
                              </span>
                            </span>
                          ) : (
                            <span className="gt-payoff__payoff">
                              <span className="gt-payoff__payoff-row">
                                {rowPayoff}
                              </span>
                            </span>
                          )}
                          {isNEFound && (
                            <span
                              className="gt-payoff__ne-badge"
                              aria-hidden="true"
                            >
                              NE
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Nash: progress counter while not yet revealed */}
        {task === 'nash' && !nashRevealed && nashEqs.length > 0 && (
          <p className="gt-payoff__progress">
            {`${foundNEKeys.length} / ${nashEqs.length} equilibri${nashEqs.length === 1 ? 'um' : 'a'} found — tap cells to explore`}
          </p>
        )}

        {/* Nash: reveal status */}
        {task === 'nash' && nashRevealed && (
          <p className="gt-payoff__status">
            {nashEqs.length === 0
              ? 'No pure Nash equilibrium — you would have to randomize.'
              : `Pure Nash equilibri${nashEqs.length === 1 ? 'um' : 'a'}: ${nashEqs.map((ne) => `(${rowLabels[ne.row]}, ${colLabels[ne.col]})`).join(', ')}`}
          </p>
        )}

        {/* Value: saddle-point info */}
        {task === 'value' && (
          <p className="gt-payoff__status">
            {saddle !== null
              ? `Saddle point at (${rowLabels[saddle.row]}, ${colLabels[saddle.col]}): game value = ${formatRational(saddle.value)}`
              : 'No saddle point — you must mix strategies.'}
          </p>
        )}

        {/* Mix: slider + EV display */}
        {task === 'mix' && (
          <div className="gt-payoff__mix-section">
            <label className="gt-payoff__slider-label">
              <span>{`p = P(${rowLabels[0]}) = ${sliderPercent}%`}</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderPercent}
                onChange={(e) => setSliderPercent(Number(e.target.value))}
                className="gt-payoff__slider"
                aria-label={`p = probability ${rowPlayer} plays ${rowLabels[0]}`}
              />
            </label>
            <div className="gt-payoff__ev-display">
              <div
                className={`gt-payoff__ev-line${atEquilibrium ? ' gt-payoff__ev-line--equal' : ''}`}
              >
                <span className="gt-payoff__ev-label">
                  {`vs ${colLabels[0]}:`}
                </span>
                <span className="gt-payoff__ev-value">
                  {mixEvVsCol0.toFixed(2)}
                </span>
              </div>
              <div
                className={`gt-payoff__ev-line${atEquilibrium ? ' gt-payoff__ev-line--equal' : ''}`}
              >
                <span className="gt-payoff__ev-label">
                  {`vs ${colLabels[1]}:`}
                </span>
                <span className="gt-payoff__ev-value">
                  {mixEvVsCol1.toFixed(2)}
                </span>
              </div>
            </div>
            {mixEq !== null && (
              <p className="gt-payoff__equilibrium">
                {`Equilibrium: p* = ${formatRational(mixEq.p)}, q* = ${formatRational(mixEq.q)}, value = ${formatRational(mixEq.value)}`}
              </p>
            )}
          </div>
        )}

        {/* Aria-live region — announces dynamic changes for screen readers */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="gt-payoff__live"
        >
          {liveMsg}
        </p>
      </div>
    </BeatShell>
  )
}
