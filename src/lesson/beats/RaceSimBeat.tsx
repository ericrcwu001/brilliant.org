// L2 race hero (build-brief §4.4 / §6). Two patterns race on one shared stream;
// the converging win-rate bars + tally emerge toward the exact Conway odds.
// "Watch one race" reveals the full shared coin stream flip-by-flip (the winning
// pattern highlighted in its lane color) with no batch bars; "Run 200 races"
// shows the converging tally. The structural readout (beat.hero.structuralReadout)
// leads once a batch has run, and reduced motion / aria-live render the final
// tally with no animation. `display:'heatmap'` renders the who-beats-whom
// winMatrix. Builds its own engine (ignores the shared automaton), per the
// active-pattern convention. Tap-only.

import { useState, useRef } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { penneyOdds, simulateRace, traceRace, winMatrix } from '../../engine/race'
import type { RaceTrace } from '../../engine/race'
import { mulberry32 } from '../../engine/simulate'
import { C } from '../konva/theme'
import { useProgressiveRuns } from './useProgressiveRuns'
import { AntsLanesBeat } from '../konva/AntsLanesBeat'

const TRIALS = 200

export function RaceSimBeat(props: BeatProps) {
  const { beat, patternOptions, isLast, onAdvance } = props
  const [runs, setRuns] = useState(0)
  const [watches, setWatches] = useState(0)
  const [single, setSingle] = useState<RaceTrace | null>(null)
  const [view, setView] = useState<'idle' | 'single' | 'batch'>('idle')

  const interaction = beat.interaction
  const racePatterns = interaction.type === 'raceSim' ? interaction.patterns : undefined
  const a = racePatterns?.[0] ?? patternOptions[0] ?? 'HH'
  const b = racePatterns?.[1] ?? patternOptions[1] ?? 'HT'

  const tallyRef = useRef({ a: 0, b: 0 })
  const rngRef = useRef<() => number>(() => 0)
  const [tally, setTally] = useState({ a: 0, b: 0 })

  const race = useProgressiveRuns({
    total: TRIALS,
    onTrial: () => {
      if (simulateRace(a, b, 0.5, rngRef.current) === 'A') tallyRef.current.a += 1
      else tallyRef.current.b += 1
    },
    onFlush: () => setTally({ a: tallyRef.current.a, b: tallyRef.current.b }),
  })

  if (
    beat.interaction.type === 'raceSim' &&
    beat.interaction.mode === 'ants' &&
    beat.interaction.display === 'lanes'
  ) {
    return <AntsLanesBeat {...props} />
  }

  if (beat.interaction.type !== 'raceSim') return null
  const { display } = beat.interaction

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

  // Exact odds (the truth the bars converge toward) + a progressive emergent tally.
  const odds = penneyOdds(a, b)
  const pA = odds.aBeatsB.n / odds.aBeatsB.d
  const total = tally.a + tally.b
  const aRate = total > 0 ? tally.a / total : pA
  const readout =
    beat.hero?.structuralReadout ??
    `${b} appears first about ${Math.round((1 - pA) * 100)} of every 100 races.`
  const seen = view !== 'idle'
  const status = race.running
    ? `Running ${total} of ${TRIALS} races…`
    : view === 'single'
      ? 'One race, flip by flip — first pattern to complete wins.'
      : view === 'batch'
        ? readout
        : `Race ${a} vs ${b} — who shows up first?`
  const winLen = single ? (single.winner === 'A' ? a.length : b.length) : 0
  const winStart = single ? single.flips.length - winLen : 0

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: seen,
        onClick: onAdvance,
        variant: 'ghost',
      }}
      secondary={{
        label: 'Watch one race',
        onClick: () => {
          setSingle(traceRace(a, b, 0.5, mulberry32(0xc0ffee + watches)))
          setWatches((w) => w + 1)
          setView('single')
        },
        variant: 'secondary',
        enabled: !race.running,
      }}
      tertiary={{
        label: runs > 0 ? 'Run 200 more' : 'Run 200 races',
        onClick: () => {
          rngRef.current = mulberry32(0xbada55 + runs)
          tallyRef.current = { a: 0, b: 0 }
          setTally({ a: 0, b: 0 })
          setRuns((r) => r + 1)
          setView('batch')
          race.start({ reset: true })
        },
        variant: 'primary',
        enabled: !race.running,
      }}
    >
      <div className="racehero">
        <p className="racehero__readout" role="status" aria-live="polite">
          {status}
        </p>
        {view === 'single' && single && (
          <div className="racehero__stream">
            <ol
              className="racehero__flips"
              aria-label={`Coin stream: ${single.flips.join(' ')}`}
            >
              {single.flips.map((f, i) => (
                <li
                  key={i}
                  className={
                    i >= winStart
                      ? `racehero__flip racehero__flip--win racehero__flip--${
                          single.winner === 'A' ? 'a' : 'b'
                        }`
                      : 'racehero__flip'
                  }
                >
                  {f}
                </li>
              ))}
            </ol>
            <p className="racehero__single">
              {single.flips.length} flips —{' '}
              <strong>{single.winner === 'A' ? a : b}</strong> completed first.
            </p>
          </div>
        )}
        {view === 'batch' && total > 0 && (
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
        {view === 'batch' && (
          <div
            className="sim-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(race.progress * 100)}
          >
            <div className="sim-progress__bar" style={{ width: `${Math.round(race.progress * 100)}%` }} />
          </div>
        )}
      </div>
    </BeatShell>
  )
}
