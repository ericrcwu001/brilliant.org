// JS mirror of the CSS motion tokens — derived from the single-source token
// pipeline (scripts/build-tokens.ts → tokens.generated.ts).
//
// Durations are in SECONDS (Motion's unit); TOKENS stores milliseconds so we
// divide by 1000. Easing tuples are `[p1x, p1y, p2x, p2y]` cubic-bezier
// params for Motion's `ease` option; TOKENS stores them as readonly tuples via
// `as const` so we spread + cast to mutable tuples here.

import { TOKENS } from '../styles/tokens.generated'

export const DUR = {
  micro: TOKENS.durMicro / 1000,
  base:  TOKENS.durBase  / 1000,
  slow:  TOKENS.durSlow  / 1000,
  tell:  TOKENS.durTell  / 1000,
} as const

export const EASE = {
  out:    [...TOKENS.easeOut]    as [number, number, number, number],
  spring: [...TOKENS.easeSpring] as [number, number, number, number],
  inout:  [...TOKENS.easeInout]  as [number, number, number, number],
} as const

// Master clocks for choreographed sequences (--flip-beat / --stamp-beat).
// Also provided in ms for convenience (e.g. Konva timeline offsets).
export const FLIP_BEAT    = TOKENS.flipBeat  / 1000  // 0.52 s
export const FLIP_BEAT_MS = TOKENS.flipBeat           // 520 ms
export const STAMP_BEAT    = TOKENS.stampBeat / 1000  // 0.48 s
export const STAMP_BEAT_MS = TOKENS.stampBeat          // 480 ms

// Alias for the celebration beat clock — used by the lesson-complete light-streak.
// Same 480ms duration; avoids touching the token pipeline just for a rename.
export const CELEBRATE_BEAT    = STAMP_BEAT
export const CELEBRATE_BEAT_MS = STAMP_BEAT_MS

// Per-run cadence for progressive Monte Carlo beats (races, walks, ledger,
// theory chart). Runs are spread this many ms apart so learners watch values
// converge live; total batch duration therefore scales with the run count.
export const SIM_RUN_CADENCE_MS = TOKENS.simRunCadence // 12 ms

// Physical springs for Motion's `transition`. Use SPRING/SPRING_SOFT for
// everyday UI motion. SPRING_CELEBRATE is the "licensed bounce" — its overshoot
// reads as joyful, so reserve it for genuine win moments (lesson complete,
// mastery, streak), never routine feedback (matches --ease-spring's intent).
export const SPRING = { type: 'spring', stiffness: 520, damping: 30, mass: 0.8 } as const
export const SPRING_SOFT = { type: 'spring', stiffness: 320, damping: 26 } as const
export const SPRING_CELEBRATE = {
  type: 'spring',
  stiffness: 440,
  damping: 12,
  mass: 0.9,
} as const
