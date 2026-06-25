// Lazy GSAP SplitText reveal helper for Fraunces display headlines.
// gsap + SplitText are dynamically imported to keep them out of the entry bundle;
// they load only when this function is first called (Wave 2+).
//
// Defaults: duration = DUR.slow (0.36 s), stagger = DUR.micro (0.12 s), yPercent = 60.
// Under reduced motion the final visible state is set immediately with no animation.

import { DUR, EASE } from './tokens'

export interface RevealOptions {
  /** Pass true (or omit to auto-detect) to skip animation under prefers-reduced-motion. */
  reduced?: boolean
  /** Per-line animation duration in seconds. Defaults to DUR.slow. */
  durationSec?: number
  /** Stagger delay between lines in seconds. Defaults to DUR.micro. */
  staggerSec?: number
  /** Starting yPercent offset for lines. Defaults to 60. */
  y?: number
}

export async function revealHeadline(
  target: HTMLElement | null,
  options: RevealOptions = {},
): Promise<void> {
  const reduced =
    options.reduced ??
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  if (!target) return
  if (reduced) {
    target.style.opacity = '1'
    return
  }

  const { default: gsap } = await import('gsap')
  const { SplitText } = await import('gsap/SplitText')
  gsap.registerPlugin(SplitText)

  const duration = options.durationSec ?? DUR.slow
  const stagger = options.staggerSec ?? DUR.micro
  const yPercent = options.y ?? 60
  const ease = `cubic-bezier(${EASE.out.join(', ')})`

  // Reveal the parent now (callers start it hidden to avoid a flash of the full
  // headline before gsap loads); the split lines animate up from opacity 0 below.
  target.style.opacity = '1'
  const split = new SplitText(target, { type: 'lines,words' })

  return new Promise<void>((resolve) => {
    gsap.fromTo(
      split.lines,
      { opacity: 0, yPercent },
      {
        opacity: 1,
        yPercent: 0,
        duration,
        stagger,
        ease,
        onComplete() {
          split.revert()
          resolve()
        },
      },
    )
  })
}
