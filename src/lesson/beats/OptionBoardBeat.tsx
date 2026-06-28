// OptionBoardBeat renderer for concept-options (Wave-0 contract, FROZEN schema).
// Four displays: payoffDiagram, binomialTree, parityScale, greeksSlider.
// Ungraded — advances on Continue. Engine: src/engine/options.ts (BigRational).
// Inline SVG/DOM only (no Konva). var(--accent) via CSS classes (options.css).

import { useState, useId, type ReactNode } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import {
  toBig,
  ratToNumber,
  formatRational,
  spreadPayoff,
  parityGap,
  riskNeutralQ,
  binomialPrice,
  replicate,
  treeTerminals,
  treeWeights,
  greekSign,
  blackScholesCall,
  type Leg,
} from '../../engine/options'
import { linScale, niceTicks, fmtTick } from '../plot'

// ── Type alias ────────────────────────────────────────────────────────────────

type OptIx = Extract<BeatProps['beat']['interaction'], { type: 'optionBoard' }>

// ── PayoffDiagramDisplay ──────────────────────────────────────────────────────

function PayoffDiagramDisplay({
  it,
  reducedMotion,
}: {
  it: OptIx
  reducedMotion: boolean
}) {
  const legs = it.legs ?? []
  const engineLegs: Leg[] = legs.map((l) => ({
    kind: l.kind,
    K: l.K ? toBig(l.K) : undefined,
    qty: toBig(l.qty),
  }))

  // Domain: 0 to ~1.5× max strike (or 200 if no strikes). Include exact strike
  // values so the kinks in the piecewise-linear payoff are represented exactly.
  const strikes = legs.filter((l) => l.K).map((l) => ratToNumber(toBig(l.K!)))
  const maxStrike = strikes.length > 0 ? Math.max(...strikes) : 100
  const domainMax = Math.ceil(maxStrike * 1.5)

  // Integer samples + exact strike values → unique sorted S_T list
  const intSamples = Array.from({ length: domainMax + 1 }, (_, i) => i)
  const allSTs = Array.from(new Set([...intSamples, ...strikes])).sort((a, b) => a - b)

  // Convert to BigRational via integer trick: use exact fractions for strikes,
  // plain integer {n:s, d:1} for integer samples.
  const points = allSTs.map((s) => {
    // For integer domain points we can use n=s, d=1 exactly.
    // For exact strike values (which may be rational), find the original leg.
    const matchingK = legs.find((l) => l.K && ratToNumber(toBig(l.K!)) === s)?.K
    const stBig = matchingK ? toBig(matchingK) : toBig({ n: Math.round(s), d: 1 })
    const payoffBig = spreadPayoff(engineLegs, stBig)
    return { s, payoff: ratToNumber(payoffBig) }
  })

  const initMarkS = it.markS ? ratToNumber(toBig(it.markS)) : undefined
  const [markedS, setMarkedS] = useState<number>(initMarkS ?? Math.round(domainMax / 2))

  // Compute exact readout at markedS
  const markedBig = toBig({ n: markedS, d: 1 })
  const markedPayoffBig = spreadPayoff(engineLegs, markedBig)
  const markedPayoffStr = formatRational(markedPayoffBig)

  // SVG layout
  const SVG_W = 300
  const SVG_H = 200
  const PAD_L = 40
  const PAD_R = 16
  const PAD_T = 16
  const PAD_B = 32

  const payoffs = points.map((p) => p.payoff)
  const pMin = Math.min(...payoffs, 0)
  const pMax = Math.max(...payoffs, 0)
  const pSpan = pMax - pMin || 1

  const toSvgX = linScale(0, domainMax, PAD_L, SVG_W - PAD_R)
  const toSvgY = linScale(pMin - pSpan * 0.05, pMax + pSpan * 0.05, SVG_H - PAD_B, PAD_T)

  const polyline = points.map((p) => `${toSvgX(p.s)},${toSvgY(p.payoff)}`).join(' ')
  const xTicks = niceTicks(0, domainMax, 4)
  const yTicks = niceTicks(pMin, pMax, 4)
  const zeroY = toSvgY(0)
  const markX = toSvgX(markedS)

  const ariaMsg = it.interactive
    ? `S_T = ${markedS}, payoff = ${markedPayoffStr}`
    : `Payoff at S_T = ${markedS}: ${markedPayoffStr}`

  return (
    <div className="optboard optboard--payoff">
      <div className="optboard__readout" role="status">
        {it.headline && (
          <span className="optboard__stat">
            {it.headline}
          </span>
        )}
        <span className="optboard__stat">
          Payoff at S<sub>T</sub> = {markedS}:{' '}
          <strong>{markedPayoffStr}</strong>
        </span>
      </div>

      <div className="optboard__svg-wrap" role="figure" aria-label="Option payoff diagram">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} aria-hidden="true" className="optboard__svg">
          {/* Zero line */}
          <line
            x1={PAD_L} y1={zeroY}
            x2={SVG_W - PAD_R} y2={zeroY}
            className="optboard__zeroline"
          />
          {/* Axes */}
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={SVG_H - PAD_B} className="optboard__axis" />
          <line x1={PAD_L} y1={SVG_H - PAD_B} x2={SVG_W - PAD_R} y2={SVG_H - PAD_B} className="optboard__axis" />

          {/* X ticks */}
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={toSvgX(t)} y1={SVG_H - PAD_B} x2={toSvgX(t)} y2={SVG_H - PAD_B + 4} className="optboard__tick" />
              <text x={toSvgX(t)} y={SVG_H - PAD_B + 14} textAnchor="middle" className="optboard__ticklabel">{fmtTick(t)}</text>
            </g>
          ))}

          {/* Y ticks */}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={PAD_L - 4} y1={toSvgY(t)} x2={PAD_L} y2={toSvgY(t)} className="optboard__tick" />
              <text x={PAD_L - 6} y={toSvgY(t) + 3} textAnchor="end" className="optboard__ticklabel">{fmtTick(t)}</text>
            </g>
          ))}

          {/* Payoff curve */}
          <polyline points={polyline} className="optboard__payline" fill="none" />

          {/* Vertical marker at markedS */}
          <line
            x1={markX} y1={PAD_T}
            x2={markX} y2={SVG_H - PAD_B}
            className="optboard__marker"
            style={{ transition: reducedMotion ? 'none' : 'x1 var(--dur-base) var(--ease-out), x2 var(--dur-base) var(--ease-out)' }}
          />
          <circle cx={markX} cy={toSvgY(ratToNumber(markedPayoffBig))} r={4} className="optboard__markerdot" />

          {/* Axis label */}
          <text x={SVG_W - PAD_R} y={SVG_H - PAD_B + 14} textAnchor="end" className="optboard__ticklabel">S<tspan dy="3" fontSize="7">T</tspan></text>
        </svg>
      </div>

      {it.interactive && (
        <label className="optboard__control">
          <span>S<sub>T</sub> = {markedS}</span>
          <input
            type="range"
            min={0}
            max={domainMax}
            step={1}
            value={markedS}
            aria-label="Terminal stock price"
            onChange={(e) => setMarkedS(Number(e.target.value))}
          />
        </label>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── BinomialTreeDisplay ───────────────────────────────────────────────────────

function BinomialTreeDisplay({
  it,
}: {
  it: OptIx
  reducedMotion: boolean
}) {
  // Hooks must run unconditionally before any early return.
  const [selected, setSelected] = useState<{ depth: number; idx: number } | null>(null)
  const clipId = useId()

  const tree = it.tree
  if (!tree) return null

  const S0 = toBig(tree.S0)
  const u = toBig(tree.u)
  const d = toBig(tree.d)
  const R = toBig(tree.R)
  const K = toBig(tree.K)
  const { n, kind } = tree

  const q = riskNeutralQ(u, d, R)
  const price = binomialPrice(S0, u, d, R, K, n, kind)
  const priceStr = formatRational(price)

  // Replicating portfolio (one-step, from root)
  const { delta, bond } = replicate(S0, u, d, R, K, kind)
  const deltaStr = formatRational(delta)
  const bondStr = formatRational(bond)

  // Selected node info
  let selectedSpotStr = ''
  let selectedPriceStr = ''
  let selectedWeightStr = ''
  if (selected) {
    const spots = treeTerminals(S0, u, d, selected.depth)
    const spotBig = spots[selected.idx]
    selectedSpotStr = formatRational(spotBig)
    // Roll-back option price: remaining steps = n - depth
    const remaining = n - selected.depth
    selectedPriceStr = formatRational(binomialPrice(spotBig, u, d, R, K, remaining, kind))
    if (selected.depth === n) {
      const weights = treeWeights(q, n)
      selectedWeightStr = formatRational(weights[selected.idx])
    }
  }

  const ariaMsg = selected
    ? `Node at depth ${selected.depth}, index ${selected.idx}: spot = ${selectedSpotStr}, option value = ${selectedPriceStr}.${selectedWeightStr ? ` Risk-neutral weight = ${selectedWeightStr}.` : ''} Root price = ${priceStr}.`
    : `Binomial tree. Root price = ${priceStr}. Delta = ${deltaStr}, bond = ${bondStr}.`

  // SVG layout: triangular lattice
  const SVG_W = 320
  const SVG_H = 60 + n * 60
  const PAD_X = 44
  const PAD_Y = 36
  const COL_W = n > 0 ? (SVG_W - 2 * PAD_X) / n : SVG_W - 2 * PAD_X
  const NODE_R = 18

  // Node centre: depth j, index i (0..j)
  function nodeXY(j: number, i: number): { x: number; y: number } {
    const x = PAD_X + j * COL_W
    const totalH = SVG_H - 2 * PAD_Y
    const spacing = j > 0 ? totalH / j : 0
    const y = PAD_Y + i * spacing
    return { x, y }
  }

  // Build edges
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  for (let j = 0; j < n; j++) {
    for (let i = 0; i <= j; i++) {
      const { x: x1, y: y1 } = nodeXY(j, i)
      const { x: x2u, y: y2u } = nodeXY(j + 1, i)     // up branch
      const { x: x2d, y: y2d } = nodeXY(j + 1, i + 1)  // down branch
      edges.push({ x1, y1, x2: x2u, y2: y2u })
      edges.push({ x1, y1, x2: x2d, y2: y2d })
    }
  }

  // Spot labels per node (formatRational of exact BigRational)
  const nodeLabels: string[][] = []
  for (let j = 0; j <= n; j++) {
    const spots = treeTerminals(S0, u, d, j)
    nodeLabels.push(spots.map((s) => formatRational(s)))
  }

  return (
    <div className="optboard optboard--tree">
      <div className="optboard__readout" role="status">
        <span className="optboard__stat">
          Price = <strong>{priceStr}</strong>
        </span>
        <span className="optboard__stat">
          Δ = <strong>{deltaStr}</strong>
        </span>
        <span className="optboard__stat">
          Bond = <strong>{bondStr}</strong>
        </span>
        {selected && (
          <span className="optboard__stat">
            Node: S = <strong>{selectedSpotStr}</strong>, V = <strong>{selectedPriceStr}</strong>
            {selectedWeightStr && <>, w = <strong>{selectedWeightStr}</strong></>}
          </span>
        )}
      </div>

      <div className="optboard__svg-wrap" role="figure" aria-label={`Binomial tree, depth ${n}`}>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-hidden="true"
          className="optboard__svg optboard__svg--tree"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={SVG_W} height={SVG_H} />
            </clipPath>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1}
              x2={e.x2} y2={e.y2}
              className="optboard__tree-edge"
            />
          ))}

          {/* Nodes */}
          {Array.from({ length: n + 1 }, (_, j) =>
            Array.from({ length: j + 1 }, (_, i) => {
              const { x, y } = nodeXY(j, i)
              const isSelected = selected?.depth === j && selected?.idx === i
              return (
                <g key={`${j}-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={NODE_R}
                    className={`optboard__tree-node${isSelected ? ' optboard__tree-node--selected' : ''}`}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="optboard__tree-label"
                  >
                    {nodeLabels[j][i]}
                  </text>
                  {/* Invisible 44px tap target */}
                  <circle
                    cx={x}
                    cy={y}
                    r={22}
                    fill="transparent"
                    role="button"
                    tabIndex={0}
                    aria-label={`Node depth ${j}, index ${i}: spot ${nodeLabels[j][i]}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setSelected(isSelected ? null : { depth: j, idx: i })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(isSelected ? null : { depth: j, idx: i })
                      }
                    }}
                  />
                </g>
              )
            }),
          )}

          {/* Depth labels */}
          {Array.from({ length: n + 1 }, (_, j) => {
            const { x } = nodeXY(j, 0)
            return (
              <text key={j} x={x} y={SVG_H - 6} textAnchor="middle" className="optboard__tree-depthlabel">
                t={j}
              </text>
            )
          })}
        </svg>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── ParityScaleDisplay ────────────────────────────────────────────────────────

// CONVENTION (FROZEN): it.legs carries the four parity components as dollar
// VALUES — call leg {kind:'call', K, qty:C}, put leg {kind:'put', K, qty:P},
// stock leg {kind:'stock', qty:S}, bond leg {kind:'bond', K, qty:D}.
// parityGap(C, P, S, K, D) = (C − P) − (S − K·D). Left pan = C + K·D;
// right pan = P + S; the tilt magnitude = parityGap.

function ParityScaleDisplay({
  it,
  reducedMotion,
}: {
  it: OptIx
  reducedMotion: boolean
}) {
  const legs = it.legs ?? []

  // Extract parity components from legs by kind
  const callLeg = legs.find((l) => l.kind === 'call')
  const putLeg = legs.find((l) => l.kind === 'put')
  const stockLeg = legs.find((l) => l.kind === 'stock')
  const bondLeg = legs.find((l) => l.kind === 'bond')

  // Default to zero if missing
  const C = callLeg ? toBig(callLeg.qty) : { n: 0n, d: 1n }
  const P = putLeg ? toBig(putLeg.qty) : { n: 0n, d: 1n }
  const S = stockLeg ? toBig(stockLeg.qty) : { n: 0n, d: 1n }
  // K is from the call or put leg's K field; D is the bond leg's qty
  const K = callLeg?.K ? toBig(callLeg.K) : putLeg?.K ? toBig(putLeg.K) : { n: 0n, d: 1n }
  const D = bondLeg ? toBig(bondLeg.qty) : { n: 0n, d: 1n }

  const gap = parityGap(C, P, S, K, D)
  const gapStr = formatRational(gap)
  const gapNum = ratToNumber(gap)

  // Pan totals: left = C + K·D, right = P + S
  const CStr = formatRational(C)
  const PStr = formatRational(P)
  const SStr = formatRational(S)
  const KStr = formatRational(K)
  const DStr = formatRational(D)

  const isFair = gap.n === 0n
  const chipKind: 'fair' | 'arb' = isFair ? 'fair' : 'arb'
  const chipGlyph = isFair ? '=' : gap.n > 0n ? '↑' : '↓'
  const chipWord = isFair ? 'fair' : 'arbitrage'

  // SVG balance scale
  const SVG_W = 300
  const SVG_H = 180
  const CX = 150  // fulcrum x
  const FY = 90   // fulcrum y
  const ARM_LEN = 100
  const MAX_TILT = 25  // max tilt angle (degrees)
  // Tilt: saturate at ±1 unit for visual representation (sign driven by gap)
  const tiltFrac = Math.max(-1, Math.min(1, gapNum / (Math.abs(gapNum) || 1)))
  const tiltDeg = reducedMotion ? (isFair ? 0 : gapNum > 0 ? MAX_TILT : -MAX_TILT) : tiltFrac * MAX_TILT
  const tiltRad = (tiltDeg * Math.PI) / 180

  const leftPanX = CX - ARM_LEN * Math.cos(tiltRad)
  const leftPanY = FY - ARM_LEN * Math.sin(tiltRad) + 30
  const rightPanX = CX + ARM_LEN * Math.cos(tiltRad)
  const rightPanY = FY + ARM_LEN * Math.sin(tiltRad) + 30
  const beamLX = CX - ARM_LEN * Math.cos(tiltRad)
  const beamLY = FY - ARM_LEN * Math.sin(tiltRad)
  const beamRX = CX + ARM_LEN * Math.cos(tiltRad)
  const beamRY = FY + ARM_LEN * Math.sin(tiltRad)

  const ariaMsg = `Left pan: C + K·D = ${CStr} + ${KStr}·${DStr}. Right pan: P + S = ${PStr} + ${SStr}. Gap = ${gapStr}. ${chipWord}.`

  return (
    <div className="optboard optboard--parity">
      <div className="optboard__readout" role="status">
        <span className="optboard__stat">
          Gap = (C − P) − (S − K·D) = <strong>{gapStr}</strong>
        </span>
        <span
          className={`optboard__chip optboard__chip--${chipKind}`}
          aria-label={`Parity status: ${chipWord}`}
        >
          {chipGlyph} {chipWord}
        </span>
      </div>

      <div className="optboard__svg-wrap" role="figure" aria-label="Put-call parity balance scale">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} aria-hidden="true" className="optboard__svg">
          {/* Stand */}
          <line x1={CX} y1={FY} x2={CX} y2={SVG_H - 20} className="optboard__scale-stand" />
          <line x1={CX - 20} y1={SVG_H - 20} x2={CX + 20} y2={SVG_H - 20} className="optboard__scale-stand" />

          {/* Beam */}
          <line
            x1={beamLX} y1={beamLY}
            x2={beamRX} y2={beamRY}
            className="optboard__scale-beam"
            style={{ transition: reducedMotion ? 'none' : 'all var(--dur-base) var(--ease-out)' }}
          />

          {/* Fulcrum */}
          <circle cx={CX} cy={FY} r={5} className="optboard__scale-fulcrum" />

          {/* Left pan */}
          <line
            x1={leftPanX} y1={leftPanY - 20}
            x2={leftPanX} y2={beamLY}
            className="optboard__scale-rope"
            style={{ transition: reducedMotion ? 'none' : 'all var(--dur-base) var(--ease-out)' }}
          />
          <rect
            x={leftPanX - 30} y={leftPanY - 16}
            width={60} height={32}
            rx={4}
            className="optboard__scale-pan"
            style={{ transition: reducedMotion ? 'none' : 'all var(--dur-base) var(--ease-out)' }}
          />
          <text x={leftPanX} y={leftPanY - 2} textAnchor="middle" className="optboard__scale-panlabel">C</text>
          <text x={leftPanX} y={leftPanY + 12} textAnchor="middle" className="optboard__scale-panlabel">+K·D</text>

          {/* Right pan */}
          <line
            x1={rightPanX} y1={rightPanY - 20}
            x2={rightPanX} y2={beamRY}
            className="optboard__scale-rope"
            style={{ transition: reducedMotion ? 'none' : 'all var(--dur-base) var(--ease-out)' }}
          />
          <rect
            x={rightPanX - 30} y={rightPanY - 16}
            width={60} height={32}
            rx={4}
            className="optboard__scale-pan"
            style={{ transition: reducedMotion ? 'none' : 'all var(--dur-base) var(--ease-out)' }}
          />
          <text x={rightPanX} y={rightPanY - 2} textAnchor="middle" className="optboard__scale-panlabel">P</text>
          <text x={rightPanX} y={rightPanY + 12} textAnchor="middle" className="optboard__scale-panlabel">+S</text>
        </svg>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── GreeksSliderDisplay ───────────────────────────────────────────────────────

function GreeksSliderDisplay({ it }: { it: OptIx }) {
  const initSigma = it.sigma ? ratToNumber(toBig(it.sigma)) : 0.2
  const [sigma, setSigma] = useState(initSigma)

  // Display-only fixed params (S, K, r, T from tree if present, else sensible defaults)
  const tree = it.tree
  const S = tree ? ratToNumber(toBig(tree.S0)) : 100
  const K = tree ? ratToNumber(toBig(tree.K)) : 100
  const r = 0.05  // conventional display-only rate
  const T = 1     // 1 year display-only horizon
  const kind = tree?.kind ?? 'call'

  const bsPrice = blackScholesCall(S, K, r, sigma, T)

  const greeks = (['delta', 'gamma', 'theta', 'vega', 'rho'] as const)
  const signs = greeks.map((g) => ({ greek: g, sign: greekSign(g, kind) }))

  const ariaMsg = `σ = ${sigma.toFixed(2)}, Black-Scholes call price ≈ ${bsPrice.toFixed(4)} (display only, not graded).`

  return (
    <div className="optboard optboard--greeks">
      <div className="optboard__display-note" role="note">
        Display-only reference (not graded)
      </div>

      <div className="optboard__readout" role="status">
        <span className="optboard__stat">
          σ = <strong>{sigma.toFixed(2)}</strong>
        </span>
        <span className="optboard__stat">
          BS price ≈ <strong>{bsPrice.toFixed(4)}</strong>
          <span className="optboard__approx"> (≈ display only, not graded)</span>
        </span>
      </div>

      <div className="optboard__greeks-grid" aria-label="Greek signs">
        {signs.map(({ greek, sign }) => {
          const signKind = sign > 0 ? 'pos' : sign < 0 ? 'neg' : 'zero'
          const signGlyph = sign > 0 ? '+' : sign < 0 ? '−' : '0'
          return (
            <div key={greek} className="optboard__greek-chip">
              <span className="optboard__greek-name">{greek}</span>
              <span className={`optboard__greek-sign optboard__greek-sign--${signKind}`}>
                {signGlyph}
              </span>
            </div>
          )
        })}
      </div>

      <label className="optboard__control">
        <span>σ (volatility) = {sigma.toFixed(2)}</span>
        <input
          type="range"
          min={0.01}
          max={1.0}
          step={0.01}
          value={sigma}
          aria-label="Volatility sigma"
          onChange={(e) => setSigma(Number(e.target.value))}
        />
      </label>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaMsg}
      </p>
    </div>
  )
}

// ── Public entry point ─────────────────────────────────────────────────────────

export function OptionBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  if (beat.interaction.type !== 'optionBoard') return null
  const it = beat.interaction

  const primary = {
    label: isLast ? 'Finish' : 'Continue',
    enabled: true,
    onClick: onAdvance,
  }

  let body: ReactNode
  if (it.display === 'payoffDiagram') {
    body = <PayoffDiagramDisplay it={it} reducedMotion={reducedMotion} />
  } else if (it.display === 'binomialTree') {
    body = <BinomialTreeDisplay it={it} reducedMotion={reducedMotion} />
  } else if (it.display === 'parityScale') {
    body = <ParityScaleDisplay it={it} reducedMotion={reducedMotion} />
  } else {
    body = <GreeksSliderDisplay it={it} />
  }

  return <BeatShell primary={primary}>{body}</BeatShell>
}
