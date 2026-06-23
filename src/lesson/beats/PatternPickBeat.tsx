// Choose / compare beat. The flagship is scoped to HH vs HT compare mode (both
// pre-selected), so this beat just presents the side-by-side compare cards and
// confirms the contrast before the simulation. Not graded.

import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { resolveFeedback } from '../feedback'

export function PatternPickBeat(props: BeatProps) {
  const { beat, pattern, isLast, onAdvance } = props
  if (beat.interaction.type !== 'patternPick') return null
  const { patterns } = beat.interaction

  return (
    <BeatShell
      feedback={{ kind: 'correct', text: resolveFeedback(beat.feedback, pattern).correct }}
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
