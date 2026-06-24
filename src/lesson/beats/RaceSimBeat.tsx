// L2 race hero (build-brief §4.4 / §6). Two patterns race on one shared stream;
// the converging win-rate bars + tally emerge toward the exact Conway odds. A
// "watch one" slow-first reveal precedes the batch (proposed §2.8), the plain
// structural readout (beat.hero.structuralReadout) always leads, and reduced
// motion / aria-live render the final tally with no animation. `display:'heatmap'`
// renders the who-beats-whom winMatrix. Builds its own engine (ignores the
// shared automaton), per the active-pattern convention. Tap-only.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { penneyOdds, batchRace, simulateRace, winMatrix } from '../../engine/race'
import { mulberry32 } from '../../engine/simulate'
import { C } from '../konva/theme'

const TRIALS = 200

export function RaceSimBeat(props: BeatProps) {
  const { beat, patternOptions, isLast, onAdvance, reducedMotion } = props
  const [runs, setRuns] = useState(0)
  const [single, setSingle] = useState<'A' | 'B' | null>(null)
  const [seen, setSeen] = useState(reducedMotion) // reduced motion: final frame up front

  if (beat.interaction.type !== 'raceSim') return null
  const { patterns, display } = beat.interaction
  const a = patterns?.[0] ?? patternOptions[0] ?? 'HH'
  const b = patterns?.[1] ?? patternOptions[1] ?? 'HT'

  if (display === 'heatmap') {
    const pats = patternOptions.length >= 2 ? patternOptions : [a, b]
    const m = winMatrix(pats)
    return (
      <BeatShell
        primary={{
          label: isLast ? 'Finish' : 'Continue',
          enabled: true,
          onClick: onAdvance,
        }}
      >
        <div className="racehero">
          {beat.hero && <p className="racehero__readout">{beat.hero.structuralReadout}</p>}
          <table className="heatmap">
            <thead>
              <tr>
                <th aria-label="row beats column" />
                {pats.map((p) => (
                  <th key={p}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pats.map((row, i) => (
                <tr key={row}>
                  <th scope="row">{row}</th>
                  {pats.map((col, j) => {
                    const r = m[i][j]
                    const v = r.n / r.d
                    return (
                      <td
                        key={col}
                        style={{
                          background:
                            i === j
                              ? C.paper2
                              : v > 0.5
                                ? C.heatHi
                                : C.heatLo,
                          color: i === j ? C.graphiteSoft : C.paper0,
                        }}
                      >
                        {i === j ? '—' : `${Math.round(v * 100)}%`}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BeatShell>
    )
  }

  // Exact odds (the truth the bars converge toward) + a batched emergent tally.
  const odds = penneyOdds(a, b)
  const pA = odds.aBeatsB.n / odds.aBeatsB.d
  const rng = mulberry32(0xbada55 + runs)
  const tally = seen ? batchRace(a, b, 0.5, rng, TRIALS) : { a: 0, b: 0 }
  const total = tally.a + tally.b
  const aRate = total > 0 ? tally.a / total : pA
  const readout =
    beat.hero?.structuralReadout ??
    `${b} appears first about ${Math.round((1 - pA) * 100)} of every 100 races.`

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: seen,
        onClick: onAdvance,
      }}
      secondary={{
        label: 'Watch one race',
        onClick: () => {
          setSingle(simulateRace(a, b, 0.5, mulberry32(0xc0ffee + runs)))
          setSeen(true)
        },
      }}
      tertiary={{
        label: total > 0 ? 'Run 200 more' : 'Run 200 races',
        onClick: () => {
          setRuns((r) => r + 1)
          setSeen(true)
        },
      }}
    >
      <div className="racehero">
        <p className="racehero__readout" role="status" aria-live="polite">
          {seen ? readout : `Race ${a} vs ${b} — who shows up first?`}
        </p>
        {single && (
          <p className="racehero__single">
            That race: <strong>{single === 'A' ? a : b}</strong> appeared first.
          </p>
        )}
        {total > 0 && (
          <div className="racehero__bars" aria-hidden="true">
            <div className="racehero__bar">
              <span className="racehero__barlabel">{a}</span>
              <span className="racehero__track">
                <span
                  className="racehero__fill racehero__fill--a"
                  style={{ width: `${Math.round(aRate * 100)}%` }}
                />
              </span>
              <span className="racehero__pct">{tally.a}</span>
            </div>
            <div className="racehero__bar">
              <span className="racehero__barlabel">{b}</span>
              <span className="racehero__track">
                <span
                  className="racehero__fill racehero__fill--b"
                  style={{ width: `${Math.round((1 - aRate) * 100)}%` }}
                />
              </span>
              <span className="racehero__pct">{tally.b}</span>
            </div>
          </div>
        )}
      </div>
    </BeatShell>
  )
}
