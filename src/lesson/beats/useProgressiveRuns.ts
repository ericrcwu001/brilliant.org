// Shared engine for "play a batch of simulation runs out over time" — the
// progressive, live-updating pattern first proven in TheorySimChartBeat, lifted
// here so every Monte Carlo beat (races, walks, ledger, theory) shares one
// per-run cadence and rhythm. The hook owns ONLY the timing/loop: it spreads
// `total` runs across `total × cadenceMs` at a fixed per-run cadence (so the
// total duration scales with the run count), calling `onTrial` once per run and
// committing the caller's React state via `onFlush` at <=30fps (never per rAF
// frame — design-doc Performance rule). The caller owns its own accumulator refs
// and state; the hook just drives the clock and exposes running/progress for the
// shared progress bar.
//
// NOTE: intentionally NOT gated on prefers-reduced-motion. Watching the values
// converge IS the lesson content (a smoothly updating number/line/bar carries no
// vestibular trigger), matching TheorySimChartBeat's documented exception. Do
// not add a reducedMotion short-circuit here.

import { useCallback, useEffect, useRef, useState } from 'react'
import { SIM_RUN_CADENCE_MS } from '../../motion/tokens'

// Commit React state at <=30fps, not on every rAF frame.
const FLUSH_MS = 33

// How many of a batch's `total` runs should have completed after `elapsedMs` at
// a fixed per-run cadence. Pure + clamped so the rAF loop can never overshoot.
export function runsDueByElapsed(
  elapsedMs: number,
  cadenceMs: number,
  total: number,
): number {
  if (total <= 0) return 0
  if (cadenceMs <= 0) return total
  if (elapsedMs <= 0) return 0
  return Math.min(total, Math.floor(elapsedMs / cadenceMs))
}

export interface ProgressiveRunsConfig {
  // Runs to add per batch (per start() call).
  total: number
  // Per-run cadence in ms; defaults to the shared SIM_RUN_CADENCE_MS token.
  cadenceMs?: number
  // Run ONE trial into the caller's refs. `index` is the cumulative 0-based run
  // index of this trial (the count BEFORE this run completes).
  onTrial: (index: number) => void
  // Copy the caller's refs into React state. Called at <=30fps while running and
  // once more at completion.
  onFlush: () => void
  // Optional: fired once after the final flush of a batch.
  onComplete?: () => void
}

export interface ProgressiveRuns {
  running: boolean
  // Cumulative committed run count (resets only on start({ reset: true })).
  count: number
  // 0→1 across the most recent batch (1 at rest after a completed batch).
  progress: number
  start: (opts?: { reset?: boolean }) => void
  cancel: () => void
}

export function useProgressiveRuns(config: ProgressiveRunsConfig): ProgressiveRuns {
  const { total, cadenceMs = SIM_RUN_CADENCE_MS } = config

  // Keep the latest callbacks in refs so the rAF loop never calls stale
  // closures, even if the caller passes inline callbacks. Synced in an effect
  // (not during render) to stay React-Compiler-safe.
  const onTrialRef = useRef(config.onTrial)
  const onFlushRef = useRef(config.onFlush)
  const onCompleteRef = useRef(config.onComplete)
  useEffect(() => {
    onTrialRef.current = config.onTrial
    onFlushRef.current = config.onFlush
    onCompleteRef.current = config.onComplete
  })

  const rafRef = useRef<number | null>(null)
  const countRef = useRef(0)
  const batchStartRef = useRef(0)
  const lastFlushRef = useRef(0)

  const [running, setRunning] = useState(false)
  const [count, setCount] = useState(0)
  const [progress, setProgress] = useState(0)

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => cancel, [cancel])

  const start = useCallback(
    (opts?: { reset?: boolean }) => {
      cancel()
      if (opts?.reset) {
        countRef.current = 0
        setCount(0)
      }
      const startCount = countRef.current
      batchStartRef.current = startCount
      const target = startCount + total
      lastFlushRef.current = 0
      setRunning(true)
      setProgress(total > 0 ? 0 : 1)
      const startTime = performance.now()

      const tick = () => {
        const elapsed = performance.now() - startTime
        const desired = startCount + runsDueByElapsed(elapsed, cadenceMs, total)
        if (desired > countRef.current) {
          while (countRef.current < desired) {
            onTrialRef.current(countRef.current)
            countRef.current += 1
          }
          const now = performance.now()
          if (now - lastFlushRef.current >= FLUSH_MS) {
            lastFlushRef.current = now
            onFlushRef.current()
            setCount(countRef.current)
            setProgress((countRef.current - batchStartRef.current) / total)
          }
        }
        if (countRef.current >= target) {
          rafRef.current = null
          onFlushRef.current()
          setCount(countRef.current)
          setProgress(1)
          setRunning(false)
          onCompleteRef.current?.()
          return
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [cancel, total, cadenceMs],
  )

  return { running, count, progress, start, cancel }
}
