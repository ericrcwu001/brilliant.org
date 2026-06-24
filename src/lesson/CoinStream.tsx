// Left-to-right coin stream with the active prefix-state chip at the head
// (docs/ui_design_system.md beat 3). DOM-rendered so the flip/state summary is
// announced to screen readers via aria-live — the accessible equivalent of the
// canvas motion (docs/ui_design_system.md "Accessibility").
//
// Each newly-flipped coin springs in (Motion `AnimatePresence`, initial={false}
// so only the freshly-added coin animates, not the whole row), and the prefix-
// state chip "ignites" with a spring pop whenever the matched state changes —
// choreographing the DOM moment with the Konva node-pulse + edge-travel that
// fire on the same flip. Reduced motion is honored globally via MotionConfig.

import { AnimatePresence, m } from 'motion/react'
import { SPRING, SPRING_SOFT } from '../motion/tokens'

export type Flip = { on: 'H' | 'T'; key: string }

export function CoinStream({
  flips,
  stateLabel,
  announce,
}: {
  flips: Flip[]
  stateLabel: string
  announce: string
}) {
  return (
    <div className="coinstream">
      <div className="coinstream__row" aria-hidden="true">
        <AnimatePresence initial={false}>
          {flips.map((f, i) => (
            <m.span
              key={f.key}
              className={`coin coin--${f.on}${i === flips.length - 1 ? ' coin--latest' : ''}`}
              initial={{ scale: 0.4, opacity: 0, y: -10, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              transition={SPRING}
            >
              {f.on}
            </m.span>
          ))}
        </AnimatePresence>
        {/* Keyed on the label so a real state change remounts → spring pop; a
            flip that leaves the state unchanged stays still (no false "ping"). */}
        <m.span
          key={stateLabel}
          className="coinstream__chip"
          title="Active prefix state"
          initial={{ scale: 0.72 }}
          animate={{ scale: 1 }}
          transition={SPRING_SOFT}
        >
          {stateLabel}
        </m.span>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
