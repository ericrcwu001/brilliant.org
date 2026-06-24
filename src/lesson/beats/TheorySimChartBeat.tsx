// Phase 11 — Compare theory vs simulation. Pressing Run plays a batch of trials
// out live: every run is appended to the chart over ~5 seconds (time-based, so
// the pace holds on any refresh rate) and the x-axis grows to the cumulative run
// count while the empirical mean converges on the theory line. "Run 500 more"
// folds another batch into the same running mean; "Run again" starts fresh. Only
// the summarized result (empiricalMean + simRuns) is persisted — never per-trial
// data.

import { useEffect, useRef, useState } from 'react'
import type { BeatProps } from './types'
import { flipsToAbsorption } from '../../engine/simulate'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'
import type { FeedbackView } from '../FeedbackStrip'
import { SimChart } from '../konva/SimChart'
import { useElementWidth } from '../konva/useElementWidth'
import { analytics } from '../../analytics/events'

const BATCH = 500
const DURATION_MS = 5000
// Confirm convergence once the empirical mean has had time to settle.
const CONVERGED_AT = 120

export function TheorySimChartBeat(props: BeatProps) {
  const { beat, lessonId, pattern, automaton, isLast, onAdvance } = props
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [points, setPoints] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const [announce, setAnnounce] = useState('')
  // Run count when the current batch began, so the progress bar can show this
  // batch's 0→100% (changes once per batch, so cheap as state).
  const [batchStart, setBatchStart] = useState(0)

  // Animation bookkeeping kept in refs so the rAF loop never reads stale state.
  const rafRef = useRef<number | null>(null)
  const sumRef = useRef(0)
  const countRef = useRef(0)
  const persistedRef = useRef(0)

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  if (beat.interaction.type !== 'theorySimChart') return null

  const theory = automaton.expectedTimes[automaton.states[0].id]
  const count = points.length
  const mean = count > 0 ? points[count - 1] : 0

  function cancel() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  function persist() {
    persistedRef.current = countRef.current
    props.setLessonState({
      empiricalMean: Math.round((sumRef.current / countRef.current) * 100) / 100,
      simRuns: countRef.current,
    })
  }

  // Run one batch of BATCH trials. `reset` wipes the curve first ("Run again");
  // otherwise the batch continues the same cumulative mean ("Run 500 more").
  function start(reset: boolean) {
    cancel()
    if (reset) {
      sumRef.current = 0
      countRef.current = 0
      persistedRef.current = 0
      setPoints([])
    }
    setBatchStart(countRef.current)
    const target = countRef.current + BATCH
    analytics.simulationRun({ lessonId, beatId: beat.beatId, n: BATCH })

    // NOTE: intentionally NOT gated on prefers-reduced-motion. The live sweep is
    // the lesson's content (watching the empirical mean converge), not decorative
    // motion — a smoothly drawn line has no vestibular triggers — so it always
    // animates. Do not re-add a reducedMotion short-circuit here; it makes the
    // 500 runs land instantly for anyone with Reduce Motion enabled.
    setRunning(true)
    setAnnounce(`Simulating ${BATCH} runs, plotting the empirical mean live.`)
    const startTime = performance.now()
    const startCount = countRef.current

    const tick = () => {
      // Time-based: advance to the run count this moment of the ~5s budget calls
      // for, simulating every intervening run so none are skipped on the graph.
      const elapsed = performance.now() - startTime
      const desired = Math.min(
        target,
        startCount + Math.round((BATCH * elapsed) / DURATION_MS),
      )
      if (desired > countRef.current) {
        const batch: number[] = []
        while (countRef.current < desired) {
          sumRef.current += flipsToAbsorption(automaton)
          countRef.current += 1
          batch.push(sumRef.current / countRef.current)
        }
        setPoints((p) => p.concat(batch))
      }

      if (countRef.current >= target) {
        rafRef.current = null
        setRunning(false)
        persist()
        setAnnounce(
          `Done. ${countRef.current} total runs, empirical mean ${(sumRef.current / countRef.current).toFixed(2)} versus theory ${theory}.`,
        )
        return
      }
      // Refresh the recap summary + live region on milestones, not every frame.
      if (countRef.current - persistedRef.current >= 100) {
        persist()
        setAnnounce(
          `${countRef.current} runs, empirical mean ${(sumRef.current / countRef.current).toFixed(2)}.`,
        )
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  // Progress bar tracks the current batch (0→100% across its ~5s), full at rest.
  const batchPct = running
    ? Math.min(100, Math.round(((count - batchStart) / BATCH) * 100))
    : count > 0
      ? 100
      : 0

  const view: FeedbackView =
    count >= CONVERGED_AT
      ? { kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }
      : { kind: 'idle' }

  const advanceLabel = isLast ? 'Finish' : 'Continue'

  // Action bar lifecycle: a single start CTA before the first run; a busy state
  // (with an escape hatch) while animating; then Continue + the two run actions.
  let primary: { label: string; enabled: boolean; onClick: () => void }
  let secondary: { label: string; onClick: () => void } | undefined
  let tertiary: { label: string; onClick: () => void } | undefined
  if (running) {
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
    primary = { label: advanceLabel, enabled: true, onClick: onAdvance }
    secondary = { label: 'Run again', onClick: () => start(true) }
    tertiary = { label: `Run ${BATCH} more`, onClick: () => start(false) }
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
              running={running}
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
            aria-valuenow={batchPct}
          >
            <div className="sim-progress__bar" style={{ width: `${batchPct}%` }} />
          </div>

          <p className="sim-readout mono" role="status" aria-live="polite">
            {count === 0
              ? 'Run the simulation to plot the empirical average, one trial at a time.'
              : announce}
          </p>
        </div>
      </div>
    </BeatShell>
  )
}
