// Phase 11 — Compare theory vs simulation. Pressing Run plays a batch of trials
// out live: every run is appended to the chart over ~6s (500 runs × 12ms cadence)
// and the x-axis grows to the cumulative run count while the empirical mean
// converges on the theory line. "Run 500 more" folds another batch into the same
// running mean; "Run again" starts fresh. Only the summarized result
// (empiricalMean + simRuns) is persisted — never per-trial data.
//
// Additive extension (lesson-expected-value-2): when mode === 'noodleLoops', the
// beat renders a step-through partial-sum chart driven by noodleLoops(k) from
// the expectation engine. The existing automaton path is completely unchanged.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { BeatProps } from './types'
import { flipsToAbsorption } from '../../engine/simulate'
import { noodleLoops } from '../../engine/expectation'
import { BeatShell, type PrimaryAction, type SecondaryAction } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { SimChart } from '../konva/SimChart'
import { useElementWidth } from '../konva/useElementWidth'
import { analytics } from '../../analytics/events'
import { Dialog } from '../../ui/Dialog'
import { useProgressiveRuns } from './useProgressiveRuns'

const BATCH = 500
// Confirm convergence once the empirical mean has had time to settle.
const CONVERGED_AT = 120

export function TheorySimChartBeat(props: BeatProps) {
  const { beat, lessonId, pattern, automaton, isLast, onAdvance } = props
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [points, setPoints] = useState<number[]>([])
  const [announce, setAnnounce] = useState('')
  const [showVariance, setShowVariance] = useState(false)

  // Animation bookkeeping kept in refs so the rAF loop never reads stale state.
  const sumRef = useRef(0)
  const countRef = useRef(0)
  const persistedRef = useRef(0)
  // Empirical points are accumulated here each rAF frame and committed to React
  // state at <=30fps (never per frame) — design doc Performance: "no per-frame
  // React state during canvas animation; batch to <=30fps".
  const pendingRef = useRef<number[]>([])
  const varianceShownRef = useRef(false)

  // ── noodleLoops additive state (hooks called unconditionally, Rules of Hooks) ──
  const nMax =
    beat.interaction.type === 'theorySimChart' ? (beat.interaction.nMax ?? 100) : 100
  const isNoodleLoops =
    beat.interaction.type === 'theorySimChart' && beat.interaction.mode === 'noodleLoops'

  const fullSeries = useMemo(
    () => Array.from({ length: nMax }, (_, i) => noodleLoops(i + 1)),
    [nMax],
  )

  const [step, setStep] = useState(
    () =>
      isNoodleLoops && props.reducedMotion && beat.hero?.reducedMotionFinalFrame === true
        ? nMax
        : 0,
  )

  useEffect(() => {
    if (!isNoodleLoops) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setStep((s) => Math.min(s + 1, nMax))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isNoodleLoops, nMax])

  // Compute theory before the hook (callbacks reference it) and before the
  // early return so the hook is called unconditionally (Rules of Hooks).
  const theory = automaton.expectedTimes[automaton.states[0].id]

  function persist() {
    persistedRef.current = countRef.current
    props.setLessonState({
      empiricalMean: Math.round((sumRef.current / countRef.current) * 100) / 100,
      simRuns: countRef.current,
    })
  }

  const sim = useProgressiveRuns({
    total: BATCH,
    onTrial: () => {
      sumRef.current += flipsToAbsorption(automaton)
      countRef.current += 1
      pendingRef.current.push(sumRef.current / countRef.current)
    },
    onFlush: () => {
      if (pendingRef.current.length > 0) {
        const flush = pendingRef.current
        pendingRef.current = []
        setPoints((p) => p.concat(flush))
      }
      // Milestone persist + live region every 100 runs (not every frame).
      if (countRef.current - persistedRef.current >= 100) {
        persist()
        setAnnounce(
          `${countRef.current} runs, empirical mean ${(sumRef.current / countRef.current).toFixed(2)}.`,
        )
      }
    },
    onComplete: () => {
      persist()
      setAnnounce(
        `Done. ${countRef.current} total runs, empirical mean ${(sumRef.current / countRef.current).toFixed(2)} versus theory ${theory}.`,
      )
      if (!varianceShownRef.current) {
        varianceShownRef.current = true
        setShowVariance(true)
      }
    },
  })

  if (beat.interaction.type !== 'theorySimChart') return null

  // ── noodleLoops path: step-through partial-sum chart ────────────────────────
  // When mode === 'noodleLoops', render a step-through chart whose series is
  // noodleLoops(k) for k=1..nMax. The automaton path below is UNCHANGED.
  if (beat.interaction.mode === 'noodleLoops') {
    const cur = step > 0 ? fullSeries[step - 1] : null
    const isComplete = step >= nMax
    const finalRat = fullSeries[nMax - 1]
    const finalApprox = (finalRat.n / finalRat.d).toFixed(2)

    const liveText =
      step === 0
        ? 'Press Step to tie the first pair of ends.'
        : isComplete
          ? `All ${nMax} ties: E[loops] ≈ ${finalApprox}`
          : `Tie ${step}: E[loops] = ${cur!.n}/${cur!.d}`

    const fb: FeedbackView = isComplete
      ? { kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }
      : { kind: 'idle' }

    const stepPrimary: PrimaryAction = isComplete
      ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
      : { label: 'Step', enabled: true, onClick: () => setStep((s) => Math.min(s + 1, nMax)) }

    const resetSecondary: SecondaryAction | undefined =
      step > 0 ? { label: 'Reset', onClick: () => setStep(0) } : undefined

    // SVG chart: k on x-axis (1..nMax), E[loops] on y-axis (0..maxV).
    const W = 280
    const H = 160
    const pad = { t: 10, r: 10, b: 24, l: 36 }
    const cW = W - pad.l - pad.r
    const cH = H - pad.t - pad.b
    const maxV = finalRat.n / finalRat.d
    const scX = (k: number) => pad.l + ((k - 1) / Math.max(nMax - 1, 1)) * cW
    const scY = (v: number) => pad.t + cH - (v / (maxV * 1.1)) * cH
    const polyPts =
      step > 0
        ? fullSeries
            .slice(0, step)
            .map((r, i) => `${scX(i + 1).toFixed(1)},${scY(r.n / r.d).toFixed(1)}`)
            .join(' ')
        : ''

    return (
      <BeatShell feedback={fb} primary={stepPrimary} secondary={resetSecondary}>
        <div className="noodle-chart">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            aria-hidden="true"
            className="noodle-chart__svg"
          >
            <line
              x1={pad.l}
              y1={pad.t + cH}
              x2={W - pad.r}
              y2={pad.t + cH}
              className="noodle-chart__axis"
            />
            <line
              x1={pad.l}
              y1={pad.t}
              x2={pad.l}
              y2={pad.t + cH}
              className="noodle-chart__axis"
            />
            <text
              x={pad.l - 3}
              y={pad.t + 4}
              textAnchor="end"
              className="noodle-chart__tick"
            >
              {maxV.toFixed(1)}
            </text>
            <text
              x={pad.l - 3}
              y={pad.t + cH + 4}
              textAnchor="end"
              className="noodle-chart__tick"
            >
              0
            </text>
            <text
              x={pad.l}
              y={H - 4}
              textAnchor="start"
              className="noodle-chart__tick"
            >
              1
            </text>
            <text
              x={W - pad.r}
              y={H - 4}
              textAnchor="end"
              className="noodle-chart__tick"
            >
              {nMax}
            </text>
            {polyPts && <polyline points={polyPts} className="noodle-chart__line" />}
          </svg>
          <p role="status" aria-live="polite" className="noodle-chart__readout mono">
            {liveText}
          </p>
          {isComplete && beat.hero?.structuralReadout && (
            <p className="noodle-chart__summary">{beat.hero.structuralReadout}</p>
          )}
        </div>
      </BeatShell>
    )
  }

  // ── Existing automaton path (mode absent or 'automaton') — byte-for-byte ────

  const count = points.length
  const mean = count > 0 ? points[count - 1] : 0

  // Run one batch of BATCH trials. `reset` wipes the curve first ("Run again");
  // otherwise the batch continues the same cumulative mean ("Run 500 more").
  function start(reset: boolean) {
    if (reset) {
      sumRef.current = 0
      countRef.current = 0
      persistedRef.current = 0
      setPoints([])
    }
    pendingRef.current = []
    analytics.simulationRun({ lessonId, beatId: beat.beatId, n: BATCH })
    setAnnounce(`Simulating ${BATCH} runs, plotting the empirical mean live.`)
    sim.start({ reset })
  }

  const view: FeedbackView =
    count >= CONVERGED_AT
      ? { kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }
      : { kind: 'idle' }

  const advanceLabel = isLast ? 'Finish' : 'Continue'

  // Action bar lifecycle: a single start CTA before the first run; a busy state
  // (with an escape hatch) while animating; then Continue + the two run actions.
  let primary: PrimaryAction
  let secondary: SecondaryAction | undefined
  let tertiary: SecondaryAction | undefined
  if (sim.running) {
    primary = { label: 'Simulating…', enabled: false, onClick: () => {} }
    secondary = { label: advanceLabel, onClick: onAdvance }
    tertiary = undefined
  } else if (count === 0) {
    primary = {
      label: `Run ${BATCH} simulations`,
      enabled: true,
      onClick: () => start(true),
    }
    secondary = undefined
    tertiary = undefined
  } else {
    primary = { label: advanceLabel, enabled: true, onClick: onAdvance, variant: 'ghost' }
    secondary = { label: 'Run again', onClick: () => start(true), variant: 'secondary' }
    tertiary = { label: `Run ${BATCH} more`, onClick: () => start(false), variant: 'primary' }
  }

  return (
    <BeatShell feedback={view} primary={primary} secondary={secondary} tertiary={tertiary}>
      <div className="simbeat" ref={boxRef}>
        <div className="canvas-frame">
          {width > 0 && (
            <SimChart
              width={width}
              height={Math.max(240, Math.round((width || 320) * 0.5))}
              theory={theory}
              prediction={props.lessonState.finalPrediction}
              points={points}
              running={sim.running}
            />
          )}
        </div>

        <div className="sim-status">
          <div className="sim-stats">
            <span className="sim-stat sim-stat--quill">
              <b>{count > 0 ? mean.toFixed(2) : '—'}</b>
              <small>empirical</small>
            </span>
            <span className="sim-stat sim-stat--ink">
              <b>{theory}</b>
              <small>theory</small>
            </span>
            <span className="sim-stat">
              <b>{count}</b>
              <small>runs</small>
            </span>
          </div>

          <div
            className="sim-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sim.progress * 100)}
          >
            <div className="sim-progress__bar" style={{ width: `${Math.round(sim.progress * 100)}%` }} />
          </div>

          <p className="sim-readout mono" role="status" aria-live="polite">
            {count === 0
              ? 'Run the simulation to plot the empirical average, one trial at a time.'
              : announce}
          </p>
        </div>
      </div>
      <Dialog
        open={showVariance}
        onOpenChange={setShowVariance}
        title={`Why isn't it exactly ${theory}?`}
        description="Expected values are long-run averages, not guarantees."
      >
        <p>
          Your {count} runs produced an empirical mean of <b>{mean.toFixed(2)}</b> — close to the
          theoretical value of <b>{theory}</b>, but not equal. That gap is normal. Each run&apos;s
          flip-count varies a lot: most games end quickly, a handful stretch on for much longer. Any
          finite sample&apos;s average wobbles around the true expected value because of this
          variance.
        </p>
        <p>
          The more runs you add, the steadier that average becomes. It won&apos;t hit <b>{theory}</b>{' '}
          on cue — it just keeps getting closer on average.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => setShowVariance(false)}>
          Got it
        </button>
      </Dialog>
    </BeatShell>
  )
}
