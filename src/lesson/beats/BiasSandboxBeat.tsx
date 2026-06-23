// Phase 12 — Bias sensitivity sandbox (Extension). Dragging the coin bias p
// recomputes each pattern's recurrence values and expected times live. Purely
// exploratory: never graded, never blocks completion, never sets needsReview.

import { useState } from 'react'
import type { BeatProps } from './types'
import type { Automaton, StateId } from '../../engine/types'
import { buildAutomaton } from '../../engine/automaton'
import { BeatShell } from '../BeatShell'

function symbolicRecurrence(a: Automaton, from: StateId): string {
  const to = (on: 'H' | 'T') =>
    a.transitions.find((e) => e.from === from && e.on === on)!.to
  return `${from} = 1 + p·${to('H')} + (1−p)·${to('T')}`
}

export function BiasSandboxBeat(props: BeatProps) {
  const { beat, patternOptions, isLast, onAdvance } = props
  const [p, setP] = useState(0.5)

  if (
    beat.interaction.type !== 'slider'
  )
    return null
  const { min, max, step } = beat.interaction

  const automata = patternOptions.map((pat) => buildAutomaton(pat, p))

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
      secondary={{ label: 'Skip', onClick: onAdvance }}
    >
      <div className="bias">
        <label className="bias__control">
          <span className="bias__label">
            Coin bias <span className="mono">p(H) = {p.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="bias__range"
            aria-label="Coin bias p"
          />
        </label>

        <div className="bias__cards">
          {automata.map((a) => (
            <div className="bias__card" key={a.pattern}>
              <p className="bias__pattern mono">{a.pattern}</p>
              <p className="bias__exp mono">
                E = {a.expectedTimes[a.states[0].id].toFixed(2)}
              </p>
              <div className="bias__eqs">
                {a.states
                  .filter((s) => !s.absorbing)
                  .map((s) => (
                    <p className="bias__eq mono" key={s.id}>
                      {symbolicRecurrence(a, s.id)}
                    </p>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <p className="hint-note">
          Exploratory — biasing the coin stretches or shrinks both waits. This
          never affects completion.
        </p>
      </div>
    </BeatShell>
  )
}
