// Choose / compare beat. The flagship is scoped to HH vs HT compare mode (both
// pre-selected), so this beat just presents the side-by-side compare cards and
// confirms the contrast before the simulation. Passive (no graded check), so it
// shows no feedback strip — the prompt and cards already say it.

import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'

export function PatternPickBeat(props: BeatProps) {
  const { beat, isLast, onAdvance } = props
  if (beat.interaction.type !== 'patternPick') return null
  const { patterns } = beat.interaction

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="compare">
        {patterns.map((p) => (
          <div className="compare__card" key={p}>
            {p}
          </div>
        ))}
      </div>
    </BeatShell>
  )
}
