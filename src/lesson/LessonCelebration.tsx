// Lesson-complete celebration (the peak moment). Wraps the done-note: the card
// springs in on the "licensed" celebration bounce and a restrained burst of
// notebook-palette paper bits fans out once. Decorative + reduced-motion aware
// (confetti is skipped and the spring collapses under prefers-reduced-motion),
// so it never delays or obstructs the "Back to course path" action.

import { useMemo, type ReactNode } from 'react'
import { m } from 'motion/react'
import { SPRING_CELEBRATE, EASE } from '../motion/tokens'
import { useReducedMotion } from './useReducedMotion'

const BIT_COLORS = [
  'var(--quill)',
  'var(--heads)',
  'var(--tails)',
  'var(--correct)',
  'var(--mark)',
]

function makeBits(n: number) {
  return Array.from({ length: n }, (_, i) => {
    // Fan mostly upward (−90° ± 70°) so bits rise off the card and fall away
    // from the text below rather than over it.
    const angle = (-90 + (Math.random() * 140 - 70)) * (Math.PI / 180)
    const dist = 70 + Math.random() * 90
    const x = Math.cos(angle) * dist
    const y = Math.sin(angle) * dist
    const drift = 26 + Math.random() * 30
    return {
      id: i,
      color: BIT_COLORS[i % BIT_COLORS.length],
      delay: Math.random() * 0.08,
      rotate: Math.random() * 320 - 160,
      x: [0, x * 0.7, x, x] as number[],
      y: [0, y, y + drift * 0.5, y + drift] as number[],
    }
  })
}

function Confetti() {
  const bits = useMemo(() => makeBits(16), [])
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <m.span
          key={b.id}
          className="confetti__bit"
          style={{ backgroundColor: b.color }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.6 }}
          animate={{
            x: b.x,
            y: b.y,
            opacity: [0, 1, 1, 0],
            rotate: [0, b.rotate * 0.6, b.rotate, b.rotate],
            scale: [0.6, 1, 1, 0.9],
          }}
          transition={{
            duration: 1.1,
            delay: b.delay,
            ease: EASE.out,
            times: [0, 0.35, 0.7, 1],
          }}
        />
      ))}
    </div>
  )
}

export function LessonCelebration({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <m.div
      className="celebration"
      initial={reduced ? false : { opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={SPRING_CELEBRATE}
    >
      {!reduced && <Confetti />}
      {children}
    </m.div>
  )
}
