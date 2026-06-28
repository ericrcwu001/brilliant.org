// Covariance board renderer (concept-covariance). One renderer, three displays
// (Wave-0 contract, cf. StoppingBoardBeat / ChainBoardBeat):
//   'jointPmf'    — DOM table of the joint pmf P(X=x, Y=y). When interactive,
//                   cells are tap-targets that move one mass unit diagonally;
//                   live readouts: E[XY], E[X]E[Y], Cov, and a sign chip.
//                   Marginal bars on top/left. Keyboard: Tab-focusable buttons,
//                   Enter/Space select, arrow-keys navigate. aria-live mirror.
//   'scatter'     — inline SVG point cloud from the joint cells. When interactive,
//                   a native range slider scales the cloud; standardized panel
//                   holds shape. aria-live mirror narrates scale + engine Cov/ρ.
//   'corrVectors' — inline SVG with two fixed unit vectors at arccos(rho1/rho2)
//                   plus a sweepable third vector (native range). Number-line with
//                   a live ρ(y,z) dot that stops at the attainable bound from the
//                   engine corrRange. aria-live mirror.
// Ungraded (no hint ladder / grade); every displayed value comes from
// src/engine/covariance.ts. Reduced-motion renders the final frame; an
// aria-live mirror narrates each change.

import { useState, useCallback, useMemo, type ReactNode, useRef, useId } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import {
  covariance,
  expectedProduct,
  variance,
  rho,
  corrRange,
  formatRational,
  formatRangePair,
} from '../../engine/covariance'
import type { JointCell, Rational } from '../../engine/covariance'
import { linScale, niceTicks, fmtTick } from '../plot'

// ── Utility ───────────────────────────────────────────────────────────────────

type CovIx = Extract<BeatProps['beat']['interaction'], { type: 'covarianceBoard' }>

/** Rational to float. */
function ratVal(r: Rational): number {
  return r.d === 0 ? 0 : r.n / r.d
}

/**
 * Derive X-marginal pmf from the joint cells.
 * Returns a map from x (as a rational key string) to probability.
 */
function marginalX(cells: JointCell[]): Map<number, Rational> {
  const m = new Map<number, Rational>()
  for (const c of cells) {
    const xf = ratVal(c.x)
    const prev = m.get(xf) ?? { n: 0, d: c.p.d }
    // Sum probabilities with same denominator (joint cells guaranteed common d by design)
    m.set(xf, { n: prev.n + c.p.n, d: c.p.d })
  }
  return m
}

function marginalY(cells: JointCell[]): Map<number, Rational> {
  const m = new Map<number, Rational>()
  for (const c of cells) {
    const yf = ratVal(c.y)
    const prev = m.get(yf) ?? { n: 0, d: c.p.d }
    m.set(yf, { n: prev.n + c.p.n, d: c.p.d })
  }
  return m
}

/**
 * Build the marginal pmf for one variable.
 * Returns sorted {val, p} pairs.
 */
function buildMarginalPmf(m: Map<number, Rational>): Array<{ val: number; p: Rational }> {
  return Array.from(m.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([val, p]) => ({ val, p }))
}

/** Compute E[X] from the marginal. */
function expectation(pmf: Array<{ val: number; p: Rational }>): number {
  return pmf.reduce((s, { val, p }) => s + val * ratVal(p), 0)
}

/**
 * Compute the total T = common denominator for moving integer mass units.
 * T is the sum of numerators when all cells share a common denominator.
 * Falls back to 1 if cells are empty.
 */
function computeT(cells: JointCell[]): number {
  if (cells.length === 0) return 1
  // All cells must share denominator d; T = Σ numerators
  return cells.reduce((s, c) => s + c.p.n, 0)
}

/** Find the diagonally-opposite cell index: swap x and y coordinates. */
function diagonallyOpposite(cells: JointCell[], idx: number): number {
  const cell = cells[idx]
  const cx = ratVal(cell.x)
  const cy = ratVal(cell.y)
  const oppIdx = cells.findIndex(
    (c) => Math.abs(ratVal(c.x) - cy) < 1e-9 && Math.abs(ratVal(c.y) - cx) < 1e-9,
  )
  return oppIdx
}

/** Move one mass unit from `donorIdx` to `targetIdx`, keeping Σp=1. */
function moveUnit(cells: JointCell[], targetIdx: number): JointCell[] | null {
  const donorIdx = diagonallyOpposite(cells, targetIdx)
  if (donorIdx === -1 || donorIdx === targetIdx) return null
  if (cells[donorIdx].p.n <= 0) return null
  const next = cells.map((c, i) => {
    if (i === targetIdx) return { ...c, p: { n: c.p.n + 1, d: c.p.d } }
    if (i === donorIdx) return { ...c, p: { n: c.p.n - 1, d: c.p.d } }
    return c
  })
  return next
}

// ── JointPmfDisplay ────────────────────────────────────────────────────────────

function JointPmfDisplay({
  it,
  reducedMotion,
}: {
  it: CovIx
  reducedMotion: boolean
}) {
  const initialCells: JointCell[] = it.joint ?? []
  const [cells, setCells] = useState<JointCell[]>(initialCells)

  // Derive sorted unique X/Y values
  const xVals = Array.from(new Set(cells.map((c) => ratVal(c.x)))).sort((a, b) => a - b)
  const yVals = Array.from(new Set(cells.map((c) => ratVal(c.y)))).sort((a, b) => a - b)

  // Build cell lookup map: [xIdx][yIdx] → cell index
  const cellMap = useMemo(() => {
    const m = new Map<string, number>()
    cells.forEach((c, i) => {
      m.set(`${ratVal(c.x)},${ratVal(c.y)}`, i)
    })
    return m
  }, [cells])

  // Engine computations
  const cov = covariance(cells)
  const expy = expectedProduct(cells)
  const mX = buildMarginalPmf(marginalX(cells))
  const mY = buildMarginalPmf(marginalY(cells))
  const eX = expectation(mX)
  const eY = expectation(mY)
  const eXeY = eX * eY
  const covFloat = ratVal(cov)

  // Sign chip
  const signKind: 'pos' | 'zero' | 'neg' =
    covFloat > 1e-12 ? 'pos' : covFloat < -1e-12 ? 'neg' : 'zero'
  const signGlyph = signKind === 'pos' ? '+' : signKind === 'neg' ? '−' : '0'
  const signWord = signKind === 'pos' ? 'positive' : signKind === 'neg' ? 'negative' : 'zero'

  const interactive = it.interactive ?? false
  const T = computeT(initialCells)

  // Keyboard navigation: track focused cell
  const focusRef = useRef<HTMLButtonElement | null>(null)

  const handleCellClick = useCallback(
    (xi: number, yi: number) => {
      if (!interactive) return
      const key = `${xVals[xi]},${yVals[yi]}`
      const targetIdx = cellMap.get(key)
      if (targetIdx === undefined) return
      const next = moveUnit(cells, targetIdx)
      if (next) setCells(next)
    },
    [interactive, cells, cellMap, xVals, yVals],
  )

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLButtonElement>,
      xi: number,
      yi: number,
    ) => {
      const nx = xVals.length
      const ny = yVals.length
      let newXi = xi
      let newYi = yi
      if (e.key === 'ArrowRight') { e.preventDefault(); newXi = Math.min(xi + 1, nx - 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); newXi = Math.max(xi - 1, 0) }
      else if (e.key === 'ArrowDown') { e.preventDefault(); newYi = Math.min(yi + 1, ny - 1) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); newYi = Math.max(yi - 1, 0) }
      else return

      const btn = document.querySelector<HTMLButtonElement>(
        `[data-covboard-cell="${newXi}-${newYi}"]`,
      )
      btn?.focus()
    },
    [xVals, yVals],
  )

  // aria-live mirror — narrates the actual current Cov/sign/marginals (no phantom hover)
  const ariaMsg = `Cov(X,Y) = ${formatRational(cov)}, sign ${signWord}. E[X] ≈ ${eX.toFixed(2)}, E[Y] ≈ ${eY.toFixed(2)}.`

  // Marginal bars (normalized to 44px max height visually, represented as pct widths)
  const maxMargX = Math.max(...mX.map((m) => ratVal(m.p)), 1e-9)
  const maxMargY = Math.max(...mY.map((m) => ratVal(m.p)), 1e-9)

  return (
    <div className="covboard covboard--jointpmf">
      {/* Live readout strip */}
      <div className="covboard__readout" role="status">
        <span className="covboard__stat">
          E[XY] = <strong>{formatRational(expy)}</strong>
        </span>
        <span className="covboard__stat">
          E[X]E[Y] = <strong>{(eXeY).toFixed(3)}</strong>
        </span>
        <span className="covboard__stat">
          Cov = E[XY] − E[X]E[Y] = <strong>{formatRational(cov)}</strong>
        </span>
        <span
          className={`covboard__sign-chip covboard__sign-chip--${signKind}`}
          aria-label={`Covariance sign: ${signWord}`}
        >
          {signGlyph} {signWord}
        </span>
      </div>

      {/* Table wrapper */}
      <div className="covboard__table-wrap" role="region" aria-label="Joint probability mass function">
        <table className="covboard__table">
          <thead>
            <tr>
              {/* Top-left corner: marginal header */}
              <th className="covboard__th covboard__th--corner" scope="col">
                Y ↓ / X →
              </th>
              {xVals.map((xv, xi) => {
                const mXbar = mX.find((m) => Math.abs(m.val - xv) < 1e-9)
                const pct = mXbar ? Math.round((ratVal(mXbar.p) / maxMargX) * 100) : 0
                return (
                  <th key={xi} className="covboard__th covboard__th--x" scope="col">
                    <div className="covboard__margbar-wrap">
                      <div
                        className="covboard__margbar covboard__margbar--x"
                        style={{
                          height: `${pct}%`,
                          transition: reducedMotion ? 'none' : `height var(--dur-base) var(--ease-out)`,
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    <span>{xv}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {yVals.map((yv, yi) => {
              const mYbar = mY.find((m) => Math.abs(m.val - yv) < 1e-9)
              const pctY = mYbar ? Math.round((ratVal(mYbar.p) / maxMargY) * 100) : 0
              return (
                <tr key={yi}>
                  {/* Left marginal */}
                  <th className="covboard__th covboard__th--y" scope="row">
                    <div className="covboard__margbar-wrap covboard__margbar-wrap--y">
                      <div
                        className="covboard__margbar covboard__margbar--y"
                        style={{
                          width: `${pctY}%`,
                          transition: reducedMotion ? 'none' : `width var(--dur-base) var(--ease-out)`,
                        }}
                        aria-hidden="true"
                      />
                    </div>
                    <span>{yv}</span>
                  </th>
                  {xVals.map((xv, xi) => {
                    const key = `${xv},${yv}`
                    const idx = cellMap.get(key)
                    const p = idx !== undefined ? cells[idx].p : { n: 0, d: 1 }
                    const pStr = formatRational(p)
                    const cellLabel = `P(X=${xv}, Y=${yv}) = ${pStr}`

                    return (
                      <td key={xi} className="covboard__td">
                        {interactive && idx !== undefined ? (
                          <button
                            type="button"
                            ref={xi === 0 && yi === 0 ? focusRef : undefined}
                            data-covboard-cell={`${xi}-${yi}`}
                            className="covboard__cell-btn"
                            aria-label={cellLabel}
                            onClick={() => handleCellClick(xi, yi)}
                            onKeyDown={(e) => handleKeyDown(e, xi, yi)}
                          >
                            {pStr}
                          </button>
                        ) : (
                          <span
                            className="covboard__cell-val"
                            aria-label={cellLabel}
                          >
                            {pStr}
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

      {interactive && (
        <p className="covboard__hint">
          Tap a cell to move one mass unit (total T = {T} units stays fixed).
        </p>
      )}

      {/* aria-live mirror — announces updates */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── ScatterDisplay ─────────────────────────────────────────────────────────────

function ScatterDisplay({
  it,
  reducedMotion,
}: {
  it: CovIx
  reducedMotion: boolean
}) {
  const cells: JointCell[] = it.joint ?? []
  const [scale, setScale] = useState(1)
  const clipId = useId()

  // Build points: one per cell, weight by p
  const xVals = cells.map((c) => ratVal(c.x))
  const yVals = cells.map((c) => ratVal(c.y))
  const xMin = Math.min(...xVals)
  const xMax = Math.max(...xVals)
  const yMin = Math.min(...yVals)
  const yMax = Math.max(...yVals)

  const SVG_W = 280
  const SVG_H = 200
  const PAD = 32

  // The Scale slider is a true domain zoom centred on the data centroid: the
  // visible window shrinks as scale grows. Axes, ticks, and points ALL derive
  // from this one visible domain, so they stay aligned at every zoom level. (The
  // old code multiplied only the point coords by scale, so points drifted off
  // the fixed axes — the "axes don't work" bug.)
  const xMid = (xMin + xMax) / 2
  const yMid = (yMin + yMax) / 2
  const halfX = ((xMax - xMin) / 2) * 1.1 || 0.5
  const halfY = ((yMax - yMin) / 2) * 1.1 || 0.5
  const dXMin = xMid - halfX / scale
  const dXMax = xMid + halfX / scale
  const dYMin = yMid - halfY / scale
  const dYMax = yMid + halfY / scale

  const toSvgX = linScale(dXMin, dXMax, PAD, SVG_W - PAD)
  const toSvgY = linScale(dYMin, dYMax, SVG_H - PAD, PAD)
  const xTicks = niceTicks(dXMin, dXMax)
  const yTicks = niceTicks(dYMin, dYMax)

  // Trend line via least-squares
  const n = cells.length
  const sumX = xVals.reduce((s, v) => s + v, 0)
  const sumY = yVals.reduce((s, v) => s + v, 0)
  const sumXY = cells.reduce((s, c) => s + ratVal(c.x) * ratVal(c.y), 0)
  const sumX2 = cells.reduce((s, c) => s + ratVal(c.x) ** 2, 0)
  const denom = n * sumX2 - sumX * sumX
  const mTrend = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0
  const bTrend = (sumY - mTrend * sumX) / n
  const trendY0 = mTrend * dXMin + bTrend
  const trendY1 = mTrend * dXMax + bTrend

  // Engine Cov/rho for aria mirror
  const cov = covariance(cells)
  const varX = variance(cells.map((c) => ({ x: c.x, p: c.p })))
  const varY = variance(cells.map((c) => ({ x: c.y, p: c.p })))
  const rhoResult = rho(cov, varX, varY)
  const rhoDisplay =
    rhoResult.kind === 'rational'
      ? formatRational(rhoResult.rho)
      : rhoResult.display

  const ariaMsg = `Scale: ${scale.toFixed(1)}×. Cov = ${formatRational(cov)}, ρ = ${rhoDisplay}.`

  return (
    <div className="covboard covboard--scatter">
      <div className="covboard__svg-wrap" role="figure" aria-label="Scatter plot of joint distribution">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-hidden="true"
          className="covboard__svg"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={PAD}
                y={PAD}
                width={SVG_W - 2 * PAD}
                height={SVG_H - 2 * PAD}
              />
            </clipPath>
          </defs>
          {/* Axes */}
          <line
            x1={PAD} y1={SVG_H - PAD}
            x2={SVG_W - PAD} y2={SVG_H - PAD}
            className="covboard__axis"
          />
          <line
            x1={PAD} y1={PAD}
            x2={PAD} y2={SVG_H - PAD}
            className="covboard__axis"
          />
          {/* X ticks + numeric labels (share the data scale) */}
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line
                x1={toSvgX(t)} y1={SVG_H - PAD}
                x2={toSvgX(t)} y2={SVG_H - PAD + 4}
                className="covboard__tick"
              />
              <text
                x={toSvgX(t)} y={SVG_H - PAD + 14}
                textAnchor="middle"
                className="covboard__ticklabel"
              >
                {fmtTick(t)}
              </text>
            </g>
          ))}
          {/* Y ticks + numeric labels */}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={PAD - 4} y1={toSvgY(t)}
                x2={PAD} y2={toSvgY(t)}
                className="covboard__tick"
              />
              <text
                x={PAD - 6} y={toSvgY(t) + 3}
                textAnchor="end"
                className="covboard__ticklabel"
              >
                {fmtTick(t)}
              </text>
            </g>
          ))}
          {/* Data clipped to the plot area so zoomed-out-of-frame points hide */}
          <g clipPath={`url(#${clipId})`}>
            {/* Trend line */}
            {!reducedMotion && denom !== 0 && (
              <line
                x1={toSvgX(dXMin)}
                y1={toSvgY(trendY0)}
                x2={toSvgX(dXMax)}
                y2={toSvgY(trendY1)}
                className="covboard__trendline"
              />
            )}
            {/* Points */}
            {cells.map((c, i) => {
              const cx = toSvgX(ratVal(c.x))
              const cy = toSvgY(ratVal(c.y))
              const r = Math.max(3, Math.round(ratVal(c.p) * 20))
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  className="covboard__point"
                  opacity={0.7}
                />
              )
            })}
          </g>
        </svg>
      </div>

      <div className="covboard__readout" role="status">
        <span className="covboard__stat">Cov = <strong>{formatRational(cov)}</strong></span>
        <span className="covboard__stat">ρ = <strong>{rhoDisplay}</strong></span>
      </div>

      {it.interactive && (
        <label className="covboard__control">
          <span>Scale: {scale.toFixed(1)}×</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={scale}
            aria-label="Scale factor"
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </label>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── CorrVectorsDisplay ─────────────────────────────────────────────────────────

function CorrVectorsDisplay({
  it,
  reducedMotion,
}: {
  it: CovIx
  reducedMotion: boolean
}) {
  const r1: Rational = it.rho1 ?? { n: 3, d: 5 }
  const r2: Rational = it.rho2 ?? { n: 4, d: 5 }
  const rho1 = ratVal(r1)
  const rho2 = ratVal(r2)

  // corrRange from engine — only valid for Pythagorean-pair inputs (1-ρ² is a
  // perfect-square rational). Wrap defensively; fall back to float approximation
  // if the engine throws for authored non-Pythagorean inputs.
  let range: { min: Rational; max: Rational }
  try {
    range = corrRange(r1, r2)
  } catch {
    // Float fallback for display only (no graded path)
    const spread = Math.sqrt((1 - rho1 * rho1) * (1 - rho2 * rho2))
    const centre = rho1 * rho2
    range = {
      min: { n: Math.round((centre - spread) * 1000), d: 1000 },
      max: { n: Math.round((centre + spread) * 1000), d: 1000 },
    }
  }
  const rangeMin = ratVal(range.min)
  const rangeMax = ratVal(range.max)
  const rangeLabel = formatRangePair(range)

  const labels = it.labels ?? ['x', 'y', 'z']

  // Initial angle: park at max-ρ for reduced-motion; mid-range otherwise
  const initPhi = reducedMotion ? rangeMax : (rangeMin + rangeMax) / 2
  const initDeg = Math.round(Math.acos(Math.max(-1, Math.min(1, initPhi))) * (180 / Math.PI))
  const [angleDeg, setAngleDeg] = useState(initDeg)

  const phi = Math.cos((angleDeg * Math.PI) / 180)
  // Clamp phi to attainable range
  const clampedPhi = Math.max(rangeMin, Math.min(rangeMax, phi))

  const SVG_W = 280
  const SVG_H = 200
  const CX = 140
  const CY = 130
  const R = 80

  // Vector 1: along x-axis (angle 0)
  const v1x = CX + R
  const v1y = CY

  // Vector 2: at arccos(rho1) from vector 1
  const theta1 = Math.acos(Math.max(-1, Math.min(1, rho1)))
  const v2x = CX + R * Math.cos(theta1)
  const v2y = CY - R * Math.sin(theta1)

  // Vector 3: sweepable, anchored at arccos(rho2) from vector 1's axis
  const theta3 = (angleDeg * Math.PI) / 180
  const v3x = CX + R * Math.cos(theta3)
  const v3y = CY - R * Math.sin(theta3)

  // Number-line: -1 to 1
  const NL_X1 = 20
  const NL_X2 = SVG_W - 20
  const NL_Y = SVG_H - 18
  const nlToX = (v: number) => NL_X1 + ((v + 1) / 2) * (NL_X2 - NL_X1)

  // Bracket endpoints on number-line
  const bracketMinX = nlToX(rangeMin)
  const bracketMaxX = nlToX(rangeMax)
  const dotX = nlToX(clampedPhi)

  // phi range as degrees
  const minDeg = Math.round(Math.acos(Math.min(1, Math.max(-1, rangeMax))) * (180 / Math.PI))
  const maxDeg = Math.round(Math.acos(Math.min(1, Math.max(-1, rangeMin))) * (180 / Math.PI))

  const ariaMsg = `Third vector angle: ${angleDeg}°. ρ(${labels[1]},${labels[2]}) = ${clampedPhi.toFixed(3)}. Attainable range: ${rangeLabel}.`

  return (
    <div className="covboard covboard--corrvectors">
      <div
        className="covboard__svg-wrap"
        role="figure"
        aria-label={`Correlation vectors for ${labels.join(', ')}`}
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-hidden="true"
          className="covboard__svg"
        >
          {/* Origin circle */}
          <circle cx={CX} cy={CY} r={2} className="covboard__origin" />

          {/* Vector 1 */}
          <line
            x1={CX} y1={CY}
            x2={v1x} y2={v1y}
            className="covboard__vector covboard__vector--1"
            strokeWidth={2}
            strokeDasharray="none"
          />
          <text x={v1x + 6} y={v1y + 4} className="covboard__vlabel">
            {labels[0]}
          </text>

          {/* Vector 2 */}
          <line
            x1={CX} y1={CY}
            x2={v2x} y2={v2y}
            className="covboard__vector covboard__vector--2"
            strokeWidth={2}
            strokeDasharray="6 3"
          />
          <text x={v2x + 4} y={v2y - 4} className="covboard__vlabel">
            {labels[1]}
          </text>

          {/* Vector 3 (sweepable) */}
          <line
            x1={CX} y1={CY}
            x2={v3x} y2={v3y}
            className="covboard__vector covboard__vector--3"
            strokeWidth={2.5}
            strokeDasharray="3 2"
            opacity={0.8}
          />
          <text x={v3x + 4} y={v3y - 4} className="covboard__vlabel">
            {labels[2] ?? 'z'}
          </text>

          {/* Number-line */}
          <line
            x1={NL_X1} y1={NL_Y}
            x2={NL_X2} y2={NL_Y}
            className="covboard__numberline"
          />
          <text x={NL_X1 - 2} y={NL_Y + 12} className="covboard__nl-label">−1</text>
          <text x={NL_X2 - 4} y={NL_Y + 12} className="covboard__nl-label">1</text>

          {/* Attainable bracket (full bracket in both motion modes) */}
          <rect
            x={bracketMinX}
            y={NL_Y - 6}
            width={Math.max(0, bracketMaxX - bracketMinX)}
            height={12}
            className="covboard__bracket"
            opacity={0.2}
          />

          {/* Live ρ dot */}
          <circle
            cx={dotX}
            cy={NL_Y}
            r={5}
            className="covboard__rhodot"
          />
          <text x={dotX} y={NL_Y - 10} className="covboard__rho-val" textAnchor="middle">
            {clampedPhi.toFixed(2)}
          </text>
        </svg>
      </div>

      <div className="covboard__readout" role="status">
        <span className="covboard__stat">
          ρ({labels[1]},{labels[2]}) = <strong>{clampedPhi.toFixed(3)}</strong>
        </span>
        <span className="covboard__stat">
          Attainable range: <strong>[{rangeLabel}]</strong>
        </span>
      </div>

      {!reducedMotion && (
        <label className="covboard__control">
          <span>
            Angle φ = {angleDeg}° (ρ = {clampedPhi.toFixed(3)})
          </span>
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={angleDeg}
            aria-label="Third vector angle"
            onKeyDown={(e) => {
              // minDeg/maxDeg derive from rangeMin/rangeMax, which can be NaN when
              // the corrRange float fallback hits Math.sqrt of a negative (authored
              // |ρ|>1). Never feed angleDeg a non-finite value — fall back to the
              // slider bounds (0 / 180), which are always valid.
              if (e.key === 'Home') { e.preventDefault(); setAngleDeg(Number.isFinite(minDeg) ? minDeg : 0) }
              if (e.key === 'End') { e.preventDefault(); setAngleDeg(Number.isFinite(maxDeg) ? maxDeg : 180) }
            }}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
          />
        </label>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── Public entry point ─────────────────────────────────────────────────────────

export function CovarianceBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  if (beat.interaction.type !== 'covarianceBoard') return null
  const it = beat.interaction

  // Chapter accent comes through CSS (var(--accent), injected by the lesson shell
  // data-ch rule). Unlike ChainBoardBeat's Konva graph — which can't read CSS vars
  // and so takes a resolved hex — this renderer is all DOM/SVG, so the covariance.css
  // classes use var(--accent) directly. No inline hex needed.

  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }

  let body: ReactNode
  if (it.display === 'jointPmf') {
    body = <JointPmfDisplay it={it} reducedMotion={reducedMotion} />
  } else if (it.display === 'scatter') {
    body = <ScatterDisplay it={it} reducedMotion={reducedMotion} />
  } else {
    body = <CorrVectorsDisplay it={it} reducedMotion={reducedMotion} />
  }

  return <BeatShell primary={primary}>{body}</BeatShell>
}
