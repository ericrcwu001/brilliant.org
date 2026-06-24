// Landing hero (Phase 13). Confident, terse copy per the Auth-First Onboarding
// spec. The hero content reveals in a gentle stagger, a live "signal" pulse
// travels the ∅ → H → HH state machine, and the CTAs lift on hover — all
// suppressed under prefers-reduced-motion (MotionConfig + the gated signal).
// Primary CTA creates an account; secondary signs in.

import type { CSSProperties } from 'react'
import { m } from 'motion/react'
import type { NavigateFn } from './routes'
import { ROUTES } from './routes'
import { DUR, EASE, SPRING } from '../motion/tokens'
import { useReducedMotion } from '../lesson/useReducedMotion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
}

export function LandingPage({ navigate }: { navigate: NavigateFn }) {
  return (
    <main className="hero">
      <m.div
        className="hero__inner"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <m.h1 className="hero__title" variants={item}>
          Pattern Hitting Times
        </m.h1>
        {/* De-gatekept subline (proposed §2.7): curiosity-first, with the quant
            framing kept as an opt-in reassurance rather than the doorman. */}
        <m.p className="hero__subtitle" variants={item}>
          Learn probability by playing with it.
        </m.p>
        <m.p className="hero__reassure" variants={item}>
          Starts from zero — no formulas required to walk in. Deep enough for
          quant-interview prep.
        </m.p>

        <StateMachinePreview />

        <m.div className="hero__cta" variants={item}>
          <m.button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(`${ROUTES.auth}?mode=create`)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
          >
            Create account
          </m.button>
          <m.button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate(`${ROUTES.auth}?mode=signin`)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
          >
            Sign in
          </m.button>
        </m.div>
      </m.div>
    </main>
  )
}

// Decorative ∅ → H → HH chain. The node rings pulse via CSS (gated by
// prefers-reduced-motion); on top, a quill "signal" travels the chain and pauses
// at each node, reinforcing "advance a step on each match". aria-hidden.
function StateMachinePreview() {
  const reduced = useReducedMotion()
  const nodes = [
    { id: 'empty', label: '\u2205' },
    { id: 'h', label: 'H' },
    { id: 'hh', label: 'HH' },
  ]
  return (
    <m.div className="preview" aria-hidden="true" variants={item}>
      <svg className="preview__svg" viewBox="0 0 320 120" role="presentation">
        <line className="preview__edge" x1="60" y1="60" x2="160" y2="60" />
        <line className="preview__edge" x1="160" y1="60" x2="260" y2="60" />
        {nodes.map((node, i) => (
          <g
            key={node.id}
            className="preview__node"
            style={{ '--i': i } as CSSProperties}
            transform={`translate(${60 + i * 100}, 60)`}
          >
            <circle className="preview__ring" r="24" />
            <text className="preview__label" dy="0.35em">
              {node.label}
            </text>
          </g>
        ))}
        {!reduced && (
          <m.circle
            className="preview__signal"
            r="5"
            cy="60"
            initial={{ cx: 60, opacity: 0 }}
            animate={{
              cx: [60, 160, 160, 260, 260, 60],
              opacity: [0, 1, 1, 1, 1, 0],
            }}
            transition={{
              duration: 3.2,
              times: [0, 0.28, 0.42, 0.7, 0.82, 1],
              ease: EASE.inout,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        )}
      </svg>
    </m.div>
  )
}
