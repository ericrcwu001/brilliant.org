// Lesson-complete "Boop Stamp" celebration wrapper: the awarded ConceptMedallion
// comes in slightly large and counter-clockwise-rotated, then settles with an
// overshoot, accompanied by a 5 micro-particle burst that fades out on impact.
// Reduced-motion: renders a static, centered medallion instead (no m.div, no
// particles — the @media rule in beats.css hides them at the CSS layer too).

import { m } from 'motion/react'
import { ConceptMedallion } from '../habit/ConceptMedallion'
import type { MilestoneMeta } from '../habit/milestones'
import { STAMP_BEAT, EASE } from '../motion/tokens'

const PARTICLES = [-60, -20, 20, 70, 130]

export function BadgeStamp({
  meta,
  hueVar,
  reducedMotion,
}: {
  meta: MilestoneMeta
  hueVar?: string
  reducedMotion: boolean
}) {
  const hue = hueVar ?? 'ergo-brand'
  const style = { '--badge-hue': `var(--${hue})` } as React.CSSProperties

  if (reducedMotion) {
    return (
      <div className="badge-stamp" style={style}>
        <ConceptMedallion meta={meta} earned hueVar={hueVar} size="lg" />
      </div>
    )
  }

  return (
    <div className="badge-stamp" style={style}>
      <m.div
        className="badge-stamp__seal"
        initial={{ scale: 1.18, rotate: -8, opacity: 0 }}
        animate={{
          scale: [1.18, 0.95, 1.02, 1],
          rotate: [-8, 1.5, -0.5, 0],
          opacity: [0, 1, 1, 1],
        }}
        transition={{
          duration: STAMP_BEAT,
          ease: EASE.out,
          times: [0, 0.45, 0.72, 1],
          delay: 0.12,
        }}
      >
        <ConceptMedallion meta={meta} earned hueVar={hueVar} size="lg" />
      </m.div>
      {PARTICLES.map((deg, i) => {
        const r = 58
        const rad = (deg * Math.PI) / 180
        return (
          <m.span
            key={i}
            className="badge-stamp__particle"
            aria-hidden="true"
            initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
            animate={{
              x: Math.cos(rad) * r,
              y: Math.sin(rad) * r,
              scale: [1, 0.4],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.4,
              delay: 0.12 + STAMP_BEAT * 0.42,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}
