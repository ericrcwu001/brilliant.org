// L6 martingale ledger (build-brief §6, staged). A fair-betting casino can never
// profit, so money in (one $1 per flip = the wait T) must equal money out (the
// surviving parlays at the stop = Σ2^L). We STAGE it: run streams, watch
// mean(in) converge to the constant mean(out) = Σ2^L, THEN name E[T] = Σ2^L.
// The word "martingale" is deferred to the beat's interviewNote. Tap-only,
// aria-live; reduced motion shows the converged frame.

import { useMemo, useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { expectedWaitFair, gamblerLedger } from '../../engine/correlation'
import { prefixFunction } from '../../engine/automaton'
import { mulberry32 } from '../../engine/simulate'

function waitFor(target: string, pi: number[], rng: () => number): number {
  let k = 0
  let t = 0
  while (k < target.length && t < 1_000_000) {
    const c = rng() < 0.5 ? 'H' : 'T'
    t++
    while (k > 0 && c !== target[k]) k = pi[k - 1]
    if (c === target[k]) k++
  }
  return t
}

export function GamblerLedgerBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  const target = beat.pattern ?? pattern
  const pi = useMemo(() => prefixFunction(target), [target])
  const payout = expectedWaitFair(target)
  const ledger = useMemo(() => gamblerLedger(target, target), [target])
  const [stats, setStats] = useState<{ trials: number; meanIn: number } | null>(null)
  const [runs, setRuns] = useState(0)
  const [noteOpen, setNoteOpen] = useState(false)

  if (beat.interaction.type !== 'gamblerLedger') return null

  function run() {
    const rng = mulberry32(0x90d + runs)
    const trials = 400
    let total = 0
    for (let i = 0; i < trials; i++) total += waitFor(target, pi, rng)
    const prev = stats ?? { trials: 0, meanIn: 0 }
    const newTrials = prev.trials + trials
    const meanIn = (prev.meanIn * prev.trials + total) / newTrials
    setStats({ trials: newTrials, meanIn })
    setRuns((r) => r + 1)
  }

  const readout =
    beat.hero?.structuralReadout ??
    `Money in (the wait) settles on money out = Σ2^L = ${payout} for ${target}.`

  return (
    <BeatShell
      primary={{ label: isLast ? 'Finish' : 'Continue', enabled: !!stats, onClick: onAdvance }}
      tertiary={{ label: stats ? 'Run 400 more' : 'Run 400 streams', onClick: run }}
    >
      <div className="ledger">
        <p className="ledger__readout" role="status" aria-live="polite">
          {stats ? readout : `Flip a fair coin until ${target} appears. Does the casino profit?`}
        </p>

        <div className="ledger__cols">
          <div className="ledger__col">
            <p className="ledger__coltitle">Money out (parlays at the stop)</p>
            <ul className="ledger__rows">
              {ledger.rows.map((r) => (
                <li key={r.matchedLength}>
                  overlap {r.matchedLength} → ${r.parlay}
                </li>
              ))}
            </ul>
            <p className="ledger__sum">
              = <strong>{ledger.payout}</strong> (constant)
            </p>
          </div>
          <div className="ledger__col">
            <p className="ledger__coltitle">Money in (avg flips)</p>
            <p className="ledger__mean">
              {stats ? <strong>{stats.meanIn.toFixed(2)}</strong> : '—'}
            </p>
            <p className="ledger__sub">
              {stats ? `over ${stats.trials} streams` : 'run to measure'}
            </p>
          </div>
        </div>

        {stats && (
          <p className="ledger__assert">
            Fair game ⇒ in = out, so <strong>E[T] = Σ2^L = {payout}</strong>.
          </p>
        )}

        {beat.interviewNote && (
          <div className="ledger__note">
            {noteOpen ? (
              <p className="ledger__note-body">{beat.interviewNote}</p>
            ) : (
              <button
                type="button"
                className="ledger__note-toggle"
                aria-expanded={false}
                onClick={() => setNoteOpen(true)}
              >
                For the interview
              </button>
            )}
          </div>
        )}
      </div>
    </BeatShell>
  )
}
