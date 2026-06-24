// JIT primer (L1 §3.2 / §4.0). A tiny, ungraded, never-required tap
// micro-interaction that names a prerequisite ("½ means 1 in 2", "a state is
// how much you've matched so far") before it bites. Track A shows it expanded;
// Track B shows it collapsed behind a one-tap disclosure. No motion, tap-only,
// so it satisfies the reduced-motion + tap-only gates by construction.

import { useState } from 'react'
import type { Automaton } from '../../engine/types'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { FirstSuccessTimeline } from '../FirstSuccessTimeline'

const TITLES: Record<string, string> = {
  half: '½ means 1 in 2',
  average: 'What "on average" means',
  state: 'What a "state" is',
  exponent: 'What an exponent counts',
  transitivity: 'When "beats" is not transitive',
  custom: 'Quick refresher',
}

// Two-tap demo: pick either cell to see "1 of 2 = ½".
function HalfDemo() {
  const [pick, setPick] = useState<number | null>(null)
  return (
    <div className="primer__demo">
      <div className="primer__cells" role="group" aria-label="One in two">
        {[0, 1].map((i) => (
          <button
            type="button"
            key={i}
            className={`primer__cell${pick === i ? ' primer__cell--on' : ''}`}
            aria-pressed={pick === i}
            onClick={() => setPick((c) => (c === i ? null : i))}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="primer__readout" aria-live="polite">
        {pick === null
          ? 'Tap one of the two outcomes.'
          : '1 of 2 outcomes = ½ = a 50% chance.'}
      </p>
    </div>
  )
}

// Tap through the three prefixes to feel a "state" = how much you've matched.
function StateDemo() {
  const steps = [
    { label: '∅', text: 'none matched yet — the start' },
    { label: 'H', text: 'one H matched — halfway to HH' },
    { label: 'HH', text: 'HH matched — done' },
  ]
  const [i, setI] = useState(0)
  return (
    <div className="primer__demo">
      <div className="primer__cells" role="group" aria-label="How much matched">
        {steps.map((s, idx) => (
          <button
            type="button"
            key={s.label}
            className={`primer__cell${i === idx ? ' primer__cell--on' : ''}`}
            aria-pressed={i === idx}
            onClick={() => setI(idx)}
          >
            <span className="mono">{s.label}</span>
          </button>
        ))}
      </div>
      <p className="primer__readout" aria-live="polite">
        {steps[i].text}
      </p>
    </div>
  )
}

function PrimerDemo({
  variant,
  automaton,
}: {
  variant: string
  automaton: Automaton
}) {
  if (variant === 'half') return <HalfDemo />
  if (variant === 'state') return <StateDemo />
  // The "average" primer is the grounding moment (§5.5): run the experiment and
  // watch the running average settle toward the theoretical expected wait.
  if (variant === 'average') return <FirstSuccessTimeline automaton={automaton} />
  return null
}

export function PrimerBeat({ beat, automaton, isLast, onAdvance }: BeatProps) {
  const interaction = beat.interaction
  // Track B (or any author choice) collapses the card behind a disclosure;
  // Track A authors `collapsible: false` so it starts expanded.
  const collapsible = interaction.type === 'primer' ? interaction.collapsible ?? true : true
  const [open, setOpen] = useState(!collapsible)
  if (interaction.type !== 'primer') return null
  const { variant, body } = interaction
  const title = interaction.title ?? TITLES[variant] ?? TITLES.custom

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <section className="primer">
        {collapsible && !open ? (
          <button
            type="button"
            className="primer__disclosure"
            aria-expanded={false}
            onClick={() => setOpen(true)}
          >
            <span className="primer__kicker">Quick refresher</span>
            <span className="primer__title">{title}</span>
            <span className="primer__chevron" aria-hidden="true">
              +
            </span>
          </button>
        ) : (
          <div className="primer__card">
            <p className="primer__kicker">Quick refresher</p>
            <h2 className="primer__title">{title}</h2>
            <p className="primer__body">{body}</p>
            <PrimerDemo variant={variant} automaton={automaton} />
          </div>
        )}
      </section>
    </BeatShell>
  )
}
