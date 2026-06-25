// Choose / compare beat. The flagship compares HH vs HT (both pre-selected). When
// the fixture authors per-pattern `previews`, each card becomes a tap target that
// reveals that pattern's near-miss one-liner before the simulation (cycle-1 P-1
// option 3: turn the passive confirmation screen into a micro-exploration).
// Without `previews` it stays the passive compare cards (e.g. L5). Ungraded, so
// no feedback strip and Continue is always enabled (tap-only / reduced-motion
// safe by construction).

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'

export function PatternPickBeat(props: BeatProps) {
  const { beat, isLast, onAdvance } = props
  const [active, setActive] = useState<string | null>(null)
  if (beat.interaction.type !== 'patternPick') return null
  const { patterns, previews } = beat.interaction
  const interactive = !!previews && Object.keys(previews).length > 0

  const previewText =
    (active && previews?.[active]) ||
    'Tap a pattern to preview its near-miss before we simulate.'

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="compare">
        {patterns.map((p) =>
          interactive ? (
            <button
              type="button"
              key={p}
              className={`compare__card compare__card--tap${active === p ? ' compare__card--on' : ''}`}
              aria-pressed={active === p}
              aria-label={`Preview the near-miss for ${p.split('').join(' ')}`}
              onClick={() => setActive((cur) => (cur === p ? null : p))}
            >
              {p}
            </button>
          ) : (
            <div className="compare__card" key={p}>
              {p}
            </div>
          ),
        )}
      </div>
      {interactive && (
        <p className="compare__preview" role="status" aria-live="polite">
          {previewText}
        </p>
      )}
    </BeatShell>
  )
}
