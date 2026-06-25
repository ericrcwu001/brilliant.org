// Grounding widget (L1 §5.5): run the experiment a handful of times and watch
// the running average settle toward the theoretical expected wait. This is the
// concrete definition of "expected value" arriving *before* the slider/algebra
// instead of after. Net-new primitive (also specced for L0/L4). DOM-only (no
// Konva) so it sizes fluidly on mobile; tap-only; reduced-motion friendly (the
// bars have no entrance animation — each Run just appends results).

import { useState } from 'react'
import type { Automaton } from '../engine/types'
import { flipsToAbsorption } from '../engine/simulate'

const MAX_BARS = 24

type Agg = { count: number; sum: number; recent: number[] }

export function FirstSuccessTimeline({
  automaton,
  onMean,
}: {
  automaton: Automaton
  // Optional: report the running mean + run count up (e.g. to seed the recap).
  onMean?: (mean: number, runs: number) => void
}) {
  const [agg, setAgg] = useState<Agg>({ count: 0, sum: 0, recent: [] })
  const e0 = automaton.states[0].id
  const theory = automaton.expectedTimes[e0]
  const mean = agg.count ? agg.sum / agg.count : 0
  const scaleMax = Math.max(theory * 2.5, ...agg.recent, 1)

  function runMore(k: number) {
    setAgg((prev) => {
      let { count, sum } = prev
      const recent = [...prev.recent]
      for (let i = 0; i < k; i++) {
        const f = flipsToAbsorption(automaton)
        count += 1
        sum += f
        recent.push(f)
      }
      const next = { count, sum, recent: recent.slice(-MAX_BARS) }
      onMean?.(next.sum / next.count, next.count)
      return next
    })
  }

  const theoryPct = Math.min(100, (theory / scaleMax) * 100)
  const meanPct = Math.min(100, (mean / scaleMax) * 100)

  return (
    <div className="fst">
      <p className="fst__title">Flips until the pattern appears, run by run</p>
      <div className="fst__plot">
        <div className="fst__yaxis" aria-hidden="true">
          <span className="fst__yaxis-label">flips</span>
          <span className="fst__ytick" style={{ top: 0 }}>{Math.round(scaleMax)}</span>
          <span className="fst__ytick" style={{ bottom: `${theoryPct}%` }}>{theory}</span>
          <span className="fst__ytick" style={{ bottom: 0 }}>0</span>
        </div>
        <div className="fst__chart" aria-hidden="true">
          <div className="fst__theory" style={{ bottom: `${theoryPct}%` }}>
            <span className="fst__theory-label">theory {theory}</span>
          </div>
          {agg.count > 0 && (
            <div className="fst__mean" style={{ bottom: `${meanPct}%` }}>
              <span className="fst__mean-label">avg {mean.toFixed(1)}</span>
            </div>
          )}
          <div className="fst__bars">
            {agg.recent.length === 0 ? (
              <p className="fst__empty">Tap "Run 10 times" to start.</p>
            ) : (
              agg.recent.map((f, i) => (
                <span
                  key={i}
                  className="fst__bar"
                  style={{ height: `${Math.min(100, (f / scaleMax) * 100)}%` }}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <p className="fst__xaxis">recent runs →</p>

      <p className="fst__readout" role="status" aria-live="polite">
        {agg.count === 0
          ? 'Each run flips until the pattern appears, and records how many flips it took.'
          : `${agg.count} run${agg.count === 1 ? '' : 's'} so far — running average ${mean.toFixed(
              1,
            )} flips (theory: ${theory}).`}
      </p>

      <div className="fst__controls">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => runMore(10)}
        >
          Run 10 times
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => runMore(1)}
        >
          Run once
        </button>
      </div>
    </div>
  )
}
