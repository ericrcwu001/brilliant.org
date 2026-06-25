// Landing hero (Phase 13). Confident, terse copy per the Auth-First Onboarding
// spec. The hero content reveals in a gentle stagger, a live "signal" pulse
// travels the ∅ → H → HH state machine, and the CTAs lift on hover — all
// suppressed under prefers-reduced-motion (MotionConfig + the gated signal).
// Primary CTA creates an account; secondary signs in.

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import { m } from 'motion/react'
import type { NavigateFn } from './routes'
import { ROUTES } from './routes'
import { DUR, EASE, SPRING, FLIP_BEAT } from '../motion/tokens'
import { useReducedMotion } from '../lesson/useReducedMotion'
import { revealHeadline } from '../motion/gsapText'
import { useAmbient } from '../motion/useAmbient'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
}

export function LandingPage({ navigate }: { navigate: NavigateFn }) {
  const reduced = useReducedMotion()
  const titleRef = useRef<HTMLHeadingElement>(null)
  // GSAP SplitText reveal owns the Space Grotesk hero (design doc §Display-type
  // reveals). It starts hidden (opacity 0) so there's no flash before gsap loads;
  // revealHeadline reveals it per-line, or instantly under reduced motion.
  useEffect(() => {
    void revealHeadline(titleRef.current, { reduced })
  }, [reduced])
  return (
    <main className="hero">
      <m.div
        className="hero__inner"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <h1 className="hero__title" ref={titleRef} style={{ opacity: 0 }}>
          Why does <code>HH</code> take longer to appear than <code>HT</code>?
        </h1>
        <m.p className="hero__subtitle" variants={item}>
          State thinking for quant interviews.
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
// prefers-reduced-motion); on top, a Ch1 indigo "signal" travels the chain and
// pauses at each node, reinforcing "advance a step on each match". aria-hidden.
function StateMachinePreview() {
  const previewRef = useRef<HTMLDivElement>(null)
  // Ambient breathing pauses when offscreen, tab-hidden, idle, or reduced-motion
  // (Restraint Rails) — replacing the bare reduced-motion gate.
  const ambient = useAmbient(previewRef)
  const nodes = [
    { id: 'empty', label: '\u2205' },
    { id: 'h', label: 'H' },
    { id: 'hh', label: 'HH' },
  ]
  return (
    <m.div className="preview" aria-hidden="true" variants={item} ref={previewRef}>
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
        {ambient && (
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
              // Each edge traversal = 1 FLIP_BEAT; full cycle ≈ 3.5 beats.
              duration: FLIP_BEAT * 3.5,
              times: [0, 0.29, 0.43, 0.71, 0.86, 1],
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
