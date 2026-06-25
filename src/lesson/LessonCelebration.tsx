// Lesson-complete celebration (the peak moment). Wraps the done-note: the card
// springs in on the "licensed" celebration bounce. Reduced-motion aware
// (the spring collapses under prefers-reduced-motion) so it never delays or
// obstructs the "Back to course path" action. The cinematic beats are the
// chapter-hued ConceptMedallion earn (scale + shadow flash) and a single
// GSAP light-streak arc that crosses once on mount (omitted under reduced-motion).

import type { ReactNode } from 'react'
import { m } from 'motion/react'
import { SPRING_CELEBRATE } from '../motion/tokens'
import { useReducedMotion } from './useReducedMotion'

export function LessonCelebration({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <m.div
      className="celebration"
      initial={reduced ? false : { opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={SPRING_CELEBRATE}
    >
      {children}
    </m.div>
  )
}
