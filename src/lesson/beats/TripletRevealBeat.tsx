// tripletReveal (build-brief §4.4): three lenses converging on one value,
// predict-then-reveal. L4 "three ways to 2"; L6 TriangulationStrip (display:
// 'axis'). The learner commits to "will they agree?" by revealing each lens,
// then the shared value snaps into place. Tap-only, aria-live, no motion needed.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'

export function TripletRevealBeat(props: BeatProps) {
  const { beat, isLast, onAdvance } = props
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  if (beat.interaction.type !== 'tripletReveal') return null
  const { value, lenses, display } = beat.interaction
  const allRevealed = revealed.size === lenses.length

  const primary = allRevealed
    ? { label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }
    : { label: 'Reveal each lens', enabled: false, onClick: () => {} }

  return (
    <BeatShell primary={primary}>
      <div className={'triplet' + (display === 'axis' ? ' triplet--axis' : '')}>
        <ul className="triplet__lenses">
          {lenses.map((lens, i) => {
            const open = revealed.has(i)
            return (
              <li key={lens.label} className="triplet__lens">
                <button
                  type="button"
                  className={'triplet__card' + (open ? ' triplet__card--open' : '')}
                  aria-expanded={open}
                  onClick={() =>
                    setRevealed((prev) => {
                      const next = new Set(prev)
                      next.add(i)
                      return next
                    })
                  }
                >
                  <span className="triplet__label">{lens.label}</span>
                  {open ? (
                    <>
                      <span className="triplet__body">{lens.body}</span>
                      <span className="triplet__value">{value}</span>
                    </>
                  ) : (
                    <span className="triplet__tap">tap to reveal</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <p className="triplet__converge" role="status" aria-live="polite">
          {allRevealed
            ? `All three lenses agree: ${value}.`
            : 'Reveal each lens — will they agree?'}
        </p>
      </div>
    </BeatShell>
  )
}
