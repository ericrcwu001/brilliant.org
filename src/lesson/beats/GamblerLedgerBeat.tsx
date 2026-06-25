// L6 martingale ledger (build-brief §6, staged). A fair-betting casino can never
// profit, so money in (one $1 per flip = the wait T) must equal money out (the
// surviving parlays at the stop = Σ2^L). We STAGE it: run streams, watch
// mean(in) converge to the constant mean(out) = Σ2^L, THEN name E[T] = Σ2^L.
// The word "martingale" is deferred to the beat's interviewNote. Tap-only,
// aria-live; reduced motion shows the converged frame.

import { useMemo, useRef, useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { expectedWaitFair, gamblerLedger } from '../../engine/correlation'
import { prefixFunction } from '../../engine/automaton'
import { mulberry32 } from '../../engine/simulate'
import { useProgressiveRuns } from './useProgressiveRuns'

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

  const sumRef = useRef(0)
  const trialsRef = useRef(0)
  const rngRef = useRef<() => number>(() => 0)
  const [hasResult, setHasResult] = useState(false)

  const sim = useProgressiveRuns({
    total: 400,
    onTrial: () => {
      sumRef.current += waitFor(target, pi, rngRef.current)
      trialsRef.current += 1
    },
    onFlush: () => {
      const t = trialsRef.current
      setStats({ trials: t, meanIn: t > 0 ? sumRef.current / t : 0 })
    },
    onComplete: () => setHasResult(true),
  })

  if (beat.interaction.type !== 'gamblerLedger') return null

  function run() {
    rngRef.current = mulberry32(0x90d + runs)
    setRuns((r) => r + 1)
    sim.start({ reset: false })
  }

  const readout =
    beat.hero?.structuralReadout ??
    `Money in (the wait) settles on money out = Σ2^L = ${payout} for ${target}.`

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: hasResult,
        onClick: onAdvance,
        variant: 'ghost',
      }}
      tertiary={{
        label: stats ? 'Run 400 more' : 'Run 400 streams',
        onClick: run,
        variant: 'primary',
        enabled: !sim.running,
      }}
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

        {(sim.running || stats) && (
          <div
            className="sim-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sim.progress * 100)}
          >
            <div className="sim-progress__bar" style={{ width: `${Math.round(sim.progress * 100)}%` }} />
          </div>
        )}

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
