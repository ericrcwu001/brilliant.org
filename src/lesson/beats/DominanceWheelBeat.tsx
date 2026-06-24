// L2 non-transitive cycle (build-brief §4.4 / §6). Every pattern has a beater —
// there is no single best. Renders the dominance relations (engine-driven via
// bestBeater/penneyOdds) and, because this beat states a contrast
// (comparison:true), asks the learner to align-and-articulate with one tap
// ("which pattern beats this one?") before revealing the cycle. Tap-only.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { bestBeater, penneyOdds } from '../../engine/race'

export function DominanceWheelBeat(props: BeatProps) {
  const { beat, patternOptions, isLast, onAdvance } = props
  const [picked, setPicked] = useState<string | null>(null)

  if (beat.interaction.type !== 'dominanceWheel') return null
  const pats = beat.interaction.patterns ?? patternOptions
  // The comparison: pick the beater of the first pattern.
  const target = pats[0] ?? 'HHH'
  const answer = bestBeater(target)
  const options = pats.includes(answer) ? pats : [answer, ...pats].slice(0, 4)
  const revealed = picked !== null
  const correct = picked === answer

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: revealed,
        onClick: onAdvance,
      }}
    >
      <div className="wheel">
        <p className="wheel__q">Which pattern beats {target}?</p>
        <div className="wheel__options">
          {options.map((p) => {
            const isAns = p === answer
            const show = revealed && (isAns || p === picked)
            return (
              <button
                key={p}
                type="button"
                className={
                  'token token--state' +
                  (show ? (isAns ? ' token--placed' : '') : '') +
                  (picked === p ? ' token--selected' : '')
                }
                disabled={revealed}
                onClick={() => setPicked(p)}
              >
                {p}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="wheel__reveal" role="status" aria-live="polite">
            <p>
              {correct ? 'Yes — ' : 'Not quite — '}
              <strong>{answer}</strong> beats {target} about{' '}
              {Math.round(
                (penneyOdds(target, answer).bBeatsA.n /
                  penneyOdds(target, answer).bBeatsA.d) *
                  100,
              )}
              % of the time.
            </p>
            <ul className="wheel__cycle">
              {pats.map((p) => (
                <li key={p}>
                  {p} → beaten by <strong>{bestBeater(p)}</strong>
                </li>
              ))}
            </ul>
            <p className="wheel__moral">
              Every pattern has a beater — so there is no single best one.
            </p>
          </div>
        )}
      </div>
    </BeatShell>
  )
}
