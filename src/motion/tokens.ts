// JS mirror of the CSS motion tokens (src/styles/tokens.css "Motion").
//
// Motion (motion/react) animates via the Web Animations API / rAF on inline
// styles, so — like the Konva theme — it cannot read CSS custom properties at
// runtime. This is the single JS mirror of `--dur-*` / `--ease-*`; keep it in
// sync with tokens.css. Durations are in SECONDS (Motion's unit), eases are
// cubic-bezier tuples.

export const DUR = {
  micro: 0.12,
  base: 0.2,
  slow: 0.36,
  tell: 0.6,
} as const

export const EASE = {
  out: [0.2, 0.7, 0.2, 1] as [number, number, number, number],
  spring: [0.2, 1.2, 0.3, 1] as [number, number, number, number],
  inout: [0.5, 0, 0.2, 1] as [number, number, number, number],
} as const

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
