import type { ReactNode } from 'react'
import { LazyMotion, domMax, MotionConfig } from 'motion/react'
import { DUR, EASE } from './tokens'

// App-wide Motion setup. Mounted once at the root (src/main.tsx) so every route
// — lesson, study desk, landing — can use the lightweight `m` components.
//
// - LazyMotion + domMax: loads the full DOM feature set (needed for the
//   equation-tile drag + the course-path shared-element `layout` transition)
//   a single time, lazily. `strict` forbids the heavy `motion.*` import so the
//   bundle can't silently balloon — always import `m` from "motion/react".
// - MotionConfig reducedMotion="user": every animation respects the OS
//   prefers-reduced-motion setting (transforms/layout skipped, opacity kept).
//   This is the JS counterpart to the global rule in app.css; the dedicated
//   useReducedMotion() hook remains the source of truth for Konva + bespoke logic.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: DUR.base, ease: EASE.out }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
