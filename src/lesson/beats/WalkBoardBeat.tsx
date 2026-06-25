// L3 Gambler's Ruin hero (build-brief §6, BESPOKE — StateGraph can't express the
// money↔P_i/D_i dual-label). A 1-D lattice between walls 0 (ruin) and N (win);
// exact reach/ruin/duration from buildWalk (a WalkModel, not an Automaton); a
// slow-first single walk then a batched swarm tally; optional bias/start steppers
// (tap-only, "commit on tap"); a `display:'landscape'` reach-curve that warps
// with bias. The plain structural number leads; reduced motion + aria-live render
// the final frame. SVG; the single walk plays back step-by-step (one setState per step, not per-frame).

import { useEffect, useMemo, useRef, useState } from 'react'
import type { BeatProps } from './types'
import type { Rational } from '../../engine/types'
import { BeatShell } from '../BeatShell'
import { buildWalk, traceWalk, simulateWalk, walkDurationHistogram } from '../../engine/walk'
import type { WalkTrace } from '../../engine/walk'
import { mulberry32 } from '../../engine/simulate'
import { C } from '../konva/theme'
import { useProgressiveRuns } from './useProgressiveRuns'

const dec = (r: Rational) => Number((r.n / r.d).toFixed(3)).toString()
const W = 320
const H = 90
const STEP_MS = 400 // fixed per-move playback (~0.4s), independent of walk length
// Histogram chart viewport constants
const HIST_VW = 320
const HIST_VH = 190
const HIST_PL = 24  // left padding
const HIST_PR = 8   // right padding
const HIST_PT = 8   // top padding
const HIST_PB = 28  // bottom padding (tick labels + axis label)
const HIST_CW = HIST_VW - HIST_PL - HIST_PR  // chart width = 288
const HIST_CH = HIST_VH - HIST_PT - HIST_PB  // chart height = 154

export function WalkBoardBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props
  const init = beat.interaction
  const [pPct, setPPct] = useState(
    init.type === 'walkBoard' ? Math.round((init.p ?? 0.5) * 100) : 50,
  )
  const [start, setStart] = useState(init.type === 'walkBoard' ? (init.start ?? 2) : 2)
  const [trace, setTrace] = useState<WalkTrace | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [watches, setWatches] = useState(0)
  const [batch, setBatch] = useState<{ ruin: number; win: number; meanSteps: number } | null>(
    null,
  )
  const [runs, setRuns] = useState(0)

  const N = init.type === 'walkBoard' ? (init.n ?? 4) : 4
  const p = pPct / 100
  const interactive = init.type === 'walkBoard' ? !!init.interactive : false
  const display = init.type === 'walkBoard' ? init.display : undefined
  const model = useMemo(() => buildWalk(N, p), [N, p])

  // Histogram: rendered on mount; recomputes when p or start changes.
  // Returns null for non-histogram display variants (no wasted work).
  const hist = useMemo(() => {
    if (display !== 'histogram') return null
    return walkDurationHistogram(start, N, p, mulberry32(0xd157 + pPct), 400)
  }, [display, start, N, p, pPct])

  // --- Batch progressive run refs + hook ---
  const walkRuinRef = useRef(0)
  const walkStepsRef = useRef(0)
  const walkCountRef = useRef(0)
  const walkRngRef = useRef<() => number>(() => 0)

  const batchRun = useProgressiveRuns({
    total: 200,
    onTrial: () => {
      const r = simulateWalk(start, N, p, walkRngRef.current)
      if (r.end === 'ruin') walkRuinRef.current += 1
      walkStepsRef.current += r.steps
      walkCountRef.current += 1
    },
    onFlush: () => {
      const c = walkCountRef.current
      setBatch({
        ruin: walkRuinRef.current,
        win: c - walkRuinRef.current,
        meanSteps: c > 0 ? walkStepsRef.current / c : 0,
      })
    },
  })

  // --- Histogram progressive run refs + hook ---
  const histCountsRef = useRef<number[]>([])
  const histRuinRef = useRef(0)
  const histStepsRef = useRef(0)
  const histTrialsRef = useRef(0)
  const histRngRef = useRef<() => number>(() => 0)
  const histBinWidthRef = useRef(1)
  const histBinCountRef = useRef(12)
  const histStartedRef = useRef(false)   // first-reveal animation has been kicked off
  const histKeyRef = useRef<string | null>(null) // detect slider/start changes (skip mount)

  const [histAnim, setHistAnim] = useState<
    null | { counts: number[]; trials: number; ruin: number; steps: number }
  >(null)

  const histRun = useProgressiveRuns({
    total: 400,
    onTrial: () => {
      const r = simulateWalk(start, N, p, histRngRef.current)
      const idx = Math.min(Math.floor(r.steps / histBinWidthRef.current), histBinCountRef.current - 1)
      histCountsRef.current[idx] += 1
      if (r.end === 'ruin') histRuinRef.current += 1
      histStepsRef.current += r.steps
      histTrialsRef.current += 1
    },
    onFlush: () => {
      setHistAnim({
        counts: [...histCountsRef.current],
        trials: histTrialsRef.current,
        ruin: histRuinRef.current,
        steps: histStepsRef.current,
      })
    },
    onComplete: () => {
      // Final animated state equals `hist` (same seed/binWidth/order); drop the
      // overlay so we render the exact memoized result.
      setHistAnim(null)
    },
  })

  // Single-walk playback: advance one lattice step every STEP_MS. The only
  // setState runs inside the interval callback (not synchronously in the effect
  // body). stepIdx is reset to 0 by the "Watch one walk" handler; reduced motion
  // skips the interval and renders the final frame directly (see `idx` below).
  useEffect(() => {
    if (!trace || reducedMotion) return
    const last = trace.positions.length - 1
    let k = 0
    const id = setInterval(() => {
      k += 1
      setStepIdx(k)
      if (k >= last) clearInterval(id)
    }, STEP_MS)
    return () => clearInterval(id)
  }, [trace, reducedMotion])

  // First-reveal animation effect (runs ONCE; guarded by histStartedRef).
  useEffect(() => {
    if (display !== 'histogram' || !hist || histStartedRef.current) return
    histStartedRef.current = true
    histBinCountRef.current = hist.bins.length
    histBinWidthRef.current = hist.bins.length > 0 ? hist.bins[0].hi : 1
    histCountsRef.current = new Array(hist.bins.length).fill(0)
    histRuinRef.current = 0
    histStepsRef.current = 0
    histTrialsRef.current = 0
    histRngRef.current = mulberry32(0xd157 + pPct)
    setHistAnim({ counts: new Array(hist.bins.length).fill(0), trials: 0, ruin: 0, steps: 0 })
    histRun.start({ reset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, hist])

  // Slider/start-change effect = instant update (cancel any running animation, drop overlay).
  // Skips the initial mount call to avoid cancelling the first-reveal animation.
  useEffect(() => {
    if (display !== 'histogram') return
    const key = `${pPct}|${start}`
    if (histKeyRef.current === null) {
      histKeyRef.current = key // first call (mount) — record, don't act
      return
    }
    if (key === histKeyRef.current) return
    histKeyRef.current = key
    histStartedRef.current = true // prevent the reveal effect from re-firing
    histRun.cancel()
    setHistAnim(null) // show the instant memoized `hist`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pPct, start])

  if (beat.interaction.type !== 'walkBoard') return null

  // Compute the histogram to render: animated overlay if present, else exact memo.
  const displayHist =
    histAnim && hist
      ? {
          bins: hist.bins.map((b, k) => ({ lo: b.lo, hi: b.hi, count: histAnim.counts[k] ?? 0 })),
          trials: histAnim.trials,
          meanSteps: histAnim.trials > 0 ? histAnim.steps / histAnim.trials : 0,
          ruinRate: histAnim.trials > 0 ? histAnim.ruin / histAnim.trials : 0,
          maxCount: hist.maxCount, // stable y-scale: bars grow into their final height
        }
      : hist

  const reach = model.reachProb[start]
  const ruin = model.ruinProb[start]
  const dur = model.duration[start]
  const xFor = (i: number) => 20 + (i / N) * (W - 40)

  const readout =
    beat.hero?.structuralReadout ??
    `From $${start}: reach $${N} with probability ${dec(reach)}; about ${dec(dur)} flips.`

  function runBatch() {
    setTrace(null)
    walkRngRef.current = mulberry32(0x5eed + runs)
    walkRuinRef.current = 0
    walkStepsRef.current = 0
    walkCountRef.current = 0
    setBatch({ ruin: 0, win: 0, meanSteps: 0 })
    setRuns((r) => r + 1)
    batchRun.start({ reset: true })
  }

  return (
    <BeatShell
      primary={{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }}
      secondary={{
        label: 'Watch one walk',
        enabled: !batchRun.running,
        onClick: () => {
          setTrace(traceWalk(start, N, p, mulberry32(0xa11ce + watches)))
          setStepIdx(0)
          setWatches((w) => w + 1)
        },
      }}
      tertiary={{ label: batch ? 'Run 200 more' : 'Run 200 walks', enabled: !batchRun.running, onClick: runBatch }}
    >
      <div className="walkboard">
        <p className="walkboard__readout" role="status" aria-live="polite">
          {readout}
        </p>

        {/* Number line with dual labels: money $i and the reach prob P_i. */}
        <svg className="walkboard__svg" viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label={`Walk from 0 to ${N}, start at ${start}`}>
          <line x1={xFor(0)} y1={40} x2={xFor(N)} y2={40} stroke={C.rule} strokeWidth={2} />
          {Array.from({ length: N + 1 }, (_, i) => (
            <g key={i}>
              <circle
                cx={xFor(i)}
                cy={40}
                r={i === 0 || i === N ? 9 : 7}
                fill={i === start ? C.quill : i === 0 ? C.ruinTint : i === N ? C.winTint : C.paper2}
                stroke={i === 0 ? C.ruin : i === N ? C.win : C.rule}
                strokeWidth={1.5}
              />
              <text x={xFor(i)} y={24} textAnchor="middle" fontSize={10} fill={C.graphite}>
                ${i}
              </text>
              <text x={xFor(i)} y={62} textAnchor="middle" fontSize={9} fill={C.graphiteSoft}>
                {dec(model.reachProb[i])}
              </text>
            </g>
          ))}
          <text x={xFor(0)} y={78} textAnchor="middle" fontSize={9} fill={C.ruin}>
            ruin
          </text>
          <text x={xFor(N)} y={78} textAnchor="middle" fontSize={9} fill={C.win}>
            win
          </text>
          {trace && (() => {
            const last = trace.positions.length - 1
            const idx = reducedMotion ? last : Math.min(stepIdx, last)
            const done = idx >= last
            return (
              <circle
                className="walkboard__walker"
                cx={xFor(trace.positions[idx])}
                cy={40}
                r={6}
                fill={done ? (trace.end === 'ruin' ? C.ruin : C.win) : C.quill}
              />
            )
          })()}
        </svg>
        <p className="walkboard__duallabel">
          top row = money $i · bottom row = P<sub>i</sub> (chance you reach ${N})
        </p>

        {interactive && (
          <div className="walkboard__controls">
            <div className="walkboard__stepper">
              <span>Start ${start}</span>
              <button type="button" onClick={() => setStart((s) => Math.max(1, s - 1))}
                aria-label="Lower start">−</button>
              <button type="button" onClick={() => setStart((s) => Math.min(N - 1, s + 1))}
                aria-label="Raise start">+</button>
            </div>
            <div className="walkboard__stepper">
              <span>P(heads) {p.toFixed(2)}</span>
              <button type="button" onClick={() => setPPct((v) => Math.max(20, v - 5))}
                aria-label="Lower bias">−</button>
              <button type="button" onClick={() => setPPct((v) => Math.min(80, v + 5))}
                aria-label="Raise bias">+</button>
            </div>
          </div>
        )}

        <p className="walkboard__exact">
          reach ${N}: <strong>{dec(reach)}</strong> · ruin: <strong>{dec(ruin)}</strong> ·
          avg flips: <strong>{dec(dur)}</strong>
        </p>

        {trace && (reducedMotion || stepIdx >= trace.positions.length - 1) && (
          <p className="walkboard__single" role="status" aria-live="polite">
            That walk ended in <strong>{trace.end}</strong> after{' '}
            {trace.positions.length - 1} flips.
          </p>
        )}
        {batch && (
          <p className="walkboard__batch" aria-live="polite">
            Of {batch.win + batch.ruin} walks: <strong>{batch.win} reached ${N}</strong>, {batch.ruin} went broke; mean{' '}
            {batch.meanSteps.toFixed(1)} flips.
            {!reducedMotion && !batchRun.running && ' "Average ≠ typical": most walks are short, a few run long.'}
          </p>
        )}
        {batchRun.running && (
          <div className="sim-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(batchRun.progress * 100)}>
            <div className="sim-progress__bar" style={{ width: `${Math.round(batchRun.progress * 100)}%` }} />
          </div>
        )}

        {display === 'landscape' && (
          <svg className="walkboard__landscape" viewBox={`0 0 ${W} ${H}`} role="img"
            aria-label="Reach-probability curve across starting money">
            <polyline
              fill="none"
              stroke={C.quill}
              strokeWidth={2}
              points={model.reachProb
                .map((r, i) => `${xFor(i)},${78 - (r.n / r.d) * 56}`)
                .join(' ')}
            />
            <line x1={xFor(0)} y1={78} x2={xFor(N)} y2={78} stroke={C.rule} strokeWidth={1} />
          </svg>
        )}

        {display === 'histogram' && displayHist && (
          <>
            {/* Continuous bias knob — exploration only, never blocks Continue */}
            <div className="walkboard__knob">
              <label className="walkboard__knob-label" htmlFor="walk-bias-knob">
                P(heads) <strong>{p.toFixed(2)}</strong>
              </label>
              <input
                id="walk-bias-knob"
                type="range"
                className="walkboard__knob-input"
                min={0.2}
                max={0.8}
                step={0.01}
                value={p}
                onChange={(e) => setPPct(Math.round(Number(e.target.value) * 100))}
                aria-label="Coin bias — P(heads)"
                aria-valuetext={`P(heads) ${p.toFixed(2)}; ruin ${Math.round(displayHist.ruinRate * 100)}%`}
              />
              <div className="walkboard__knob-ends">
                <span style={{ color: C.ruin }}>unfair (20%)</span>
                <span style={{ color: C.win }}>favored (80%)</span>
              </div>
            </div>

            {/* Duration histogram SVG */}
            <svg
              className="walkboard__histogram"
              viewBox={`0 0 ${HIST_VW} ${HIST_VH}`}
              role="img"
              aria-label={`Duration histogram: ${displayHist.trials} walks from $${start}; mean ${displayHist.meanSteps.toFixed(1)} flips; ruin rate ${Math.round(displayHist.ruinRate * 100)}%`}
            >
              {/* Bars */}
              {displayHist.bins.map((bin, k) => {
                const slotW = HIST_CW / displayHist.bins.length
                const barH = displayHist.maxCount > 0 ? (bin.count / displayHist.maxCount) * HIST_CH : 0
                const bx = HIST_PL + k * slotW
                const by = HIST_PT + HIST_CH - barH
                return (
                  <rect
                    key={k}
                    x={bx + 1}
                    y={by}
                    width={Math.max(slotW - 2, 0)}
                    height={barH}
                    fill={C.quill}
                    opacity={0.72}
                  />
                )
              })}

              {/* X-axis line */}
              <line
                x1={HIST_PL}
                y1={HIST_PT + HIST_CH}
                x2={HIST_PL + HIST_CW}
                y2={HIST_PT + HIST_CH}
                stroke={C.rule}
                strokeWidth={1}
              />

              {/* Tick marks + labels at 0, midpoint, cap */}
              {([0, 0.5, 1] as const).map((frac) => {
                const capVal = displayHist.bins[displayHist.bins.length - 1]?.hi ?? 1
                const tx = HIST_PL + frac * HIST_CW
                return (
                  <g key={frac}>
                    <line
                      x1={tx} y1={HIST_PT + HIST_CH}
                      x2={tx} y2={HIST_PT + HIST_CH + 3}
                      stroke={C.rule} strokeWidth={1}
                    />
                    <text
                      x={tx} y={HIST_PT + HIST_CH + 13}
                      textAnchor="middle" fontSize={8} fill={C.graphiteSoft}
                    >
                      {Math.round(frac * capVal)}
                    </text>
                  </g>
                )
              })}

              {/* X-axis label */}
              <text
                x={HIST_PL + HIST_CW / 2}
                y={HIST_VH - 4}
                textAnchor="middle"
                fontSize={9}
                fill={C.graphiteSoft}
              >
                walk length / flips
              </text>

              {/* Mean marker — dashed vertical line + label */}
              {(() => {
                const capVal = displayHist.bins[displayHist.bins.length - 1]?.hi ?? 1
                const meanFrac = Math.min(displayHist.meanSteps / capVal, 1)
                const mx = HIST_PL + meanFrac * HIST_CW
                return (
                  <g>
                    <line
                      x1={mx} y1={HIST_PT}
                      x2={mx} y2={HIST_PT + HIST_CH}
                      stroke={C.graphite}
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                      opacity={0.8}
                    />
                    <text
                      x={mx + 3}
                      y={HIST_PT + 9}
                      fontSize={8}
                      fill={C.graphite}
                    >
                      mean {displayHist.meanSteps.toFixed(1)}
                    </text>
                  </g>
                )
              })()}
            </svg>

            {histRun.running && (
              <div className="sim-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(histRun.progress * 100)}>
                <div className="sim-progress__bar" style={{ width: `${Math.round(histRun.progress * 100)}%` }} />
              </div>
            )}

            {/* Accessible live summary — updates whenever bias or start changes */}
            <p className="walkboard__hist-summary" aria-live="polite">
              Most walks end in ~{Math.round(displayHist.bins[0].hi)} flips; mean{' '}
              {displayHist.meanSteps.toFixed(1)}; ruin {Math.round(displayHist.ruinRate * 100)}%.
            </p>
          </>
        )}
      </div>
    </BeatShell>
  )
}
