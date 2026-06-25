// Landing hero (Ergo). A mono eyebrow + Space Grotesk wordmark + tagline sit
// above the signature "exhibit": the HH automaton framed in a surface card with
// the page's thesis payoff (E[HH] = 6 vs E[HT] = 4) beneath it. A live indigo
// signal plays the "win path" while ambient; the CTAs lift on hover — all
// suppressed under prefers-reduced-motion. Primary creates an account; secondary
// signs in.

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
  // GSAP SplitText reveal owns the Space Grotesk wordmark (design doc §Display-type
  // reveals). It starts hidden (opacity 0) so there's no flash before gsap loads;
  // revealHeadline reveals it, or shows it instantly under reduced motion.
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
        <m.p className="hero__eyebrow" variants={item}>
          Quant Prep for Interviews
        </m.p>
        <h1 className="hero__title" ref={titleRef} style={{ opacity: 0 }}>
          Ergo
        </h1>
        <m.p className="hero__subtitle" variants={item}>
          State thinking, probability, and more.
        </m.p>

        <m.div className="exhibit" variants={item}>
          <StateMachinePreview />
          <div
            className="exhibit__results"
            aria-label="On average, HH first appears after 6 flips; HT after only 4."
          >
            <span className="stat" aria-hidden="true">
              <span className="stat__label">E[HH] =</span>
              <span className="stat__val stat__val--slow">6</span>
            </span>
            <span className="stat__vs" aria-hidden="true">
              vs
            </span>
            <span className="stat" aria-hidden="true">
              <span className="stat__label">E[HT] =</span>
              <span className="stat__val stat__val--fast">4</span>
            </span>
          </div>
          <p className="exhibit__caption">Same odds, different waits.</p>
        </m.div>

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

// The HH automaton, drawn as the signature math object: ∅ → H → HH advance on
// heads (gold), self-loop on ∅ and reset H → ∅ on tails (teal), HH absorbing
// (double ring). A Ch1-indigo "signal" travels the win path while ambient
// (paused offscreen/idle/hidden/reduced-motion per the Restraint Rails). Decorative.
function StateMachinePreview() {
  const previewRef = useRef<HTMLDivElement>(null)
  const ambient = useAmbient(previewRef)
  const nodes = [
    { id: 'empty', label: '\u2205', cx: 70 },
    { id: 'h', label: 'H', cx: 190 },
    { id: 'hh', label: 'HH', cx: 310 },
  ]
  return (
    <m.div className="preview" aria-hidden="true" variants={item} ref={previewRef}>
      <svg className="preview__svg" viewBox="0 0 380 210" role="presentation">
        <defs>
          <marker
            id="ah-h"
            markerWidth="8"
            markerHeight="8"
            refX="6.5"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" className="preview__arrow--h" />
          </marker>
          <marker
            id="ah-t"
            markerWidth="8"
            markerHeight="8"
            refX="6.5"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" className="preview__arrow--t" />
          </marker>
        </defs>

        {/* Advance edges (heads) */}
        <line
          className="preview__edge preview__edge--h"
          x1="100"
          y1="105"
          x2="158"
          y2="105"
          markerEnd="url(#ah-h)"
        />
        <line
          className="preview__edge preview__edge--h"
          x1="220"
          y1="105"
          x2="278"
          y2="105"
          markerEnd="url(#ah-h)"
        />
        <text className="preview__elabel preview__elabel--h" x="129" y="90">
          H
        </text>
        <text className="preview__elabel preview__elabel--h" x="249" y="90">
          H
        </text>

        {/* ∅ self-loop on tails */}
        <path
          className="preview__edge preview__edge--t"
          d="M57 78 C38 30 102 30 83 78"
          markerEnd="url(#ah-t)"
        />
        <text className="preview__elabel preview__elabel--t" x="70" y="26">
          T
        </text>

        {/* Reset H → ∅ on tails */}
        <path
          className="preview__edge preview__edge--t"
          d="M165 122 Q130 188 95 122"
          markerEnd="url(#ah-t)"
        />
        <text className="preview__elabel preview__elabel--t" x="130" y="184">
          T
        </text>

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g
            key={node.id}
            className="preview__node"
            style={{ '--i': i } as CSSProperties}
            transform={`translate(${node.cx}, 105)`}
          >
            <circle className="preview__ring" r="30" />
            {node.id === 'hh' && (
              <circle className="preview__ring preview__ring--absorb" r="23" />
            )}
            <text className="preview__label" dy="0.35em">
              {node.label}
            </text>
          </g>
        ))}

        {/* Win-path signal */}
        {ambient && (
          <m.circle
            className="preview__signal"
            r="6"
            cy="105"
            initial={{ cx: 70, opacity: 0 }}
            animate={{
              cx: [70, 190, 310, 310, 70],
              opacity: [0, 1, 1, 0, 0],
            }}
            transition={{
              duration: FLIP_BEAT * 3.5,
              times: [0, 0.34, 0.68, 0.85, 1],
              ease: EASE.inout,
              repeat: Infinity,
              repeatDelay: 0.6,
            }}
          />
        )}
      </svg>
    </m.div>
  )
}
