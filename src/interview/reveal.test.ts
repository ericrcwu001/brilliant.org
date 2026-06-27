// Pure-helper tests for the interviewer caption reveal pacing. Runs in the node
// env (no AudioContext). useRealtimeInterview.ts imports functions.ts →
// firebase/app, so mock it (as transcript.test.ts does) to avoid initializeApp
// crashing without a valid config.
import { describe, it, expect, vi } from 'vitest'

vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

import { advanceReveal, initialRevealState, type RevealState } from './useRealtimeInterview'

// Drive the pure helper for `ms` of elapsed time in fixed `step`-ms ticks.
function run(
  state: RevealState,
  opts: { ms: number; step?: number; rawLevel: number; hasAnalyser: boolean; totalWords: number },
): { state: RevealState; revealCount: number } {
  const step = opts.step ?? 50
  let s = state
  let revealCount = 0
  for (let t = 0; t < opts.ms; t += step) {
    const r = advanceReveal(s, {
      dtMs: step,
      rawLevel: opts.rawLevel,
      hasAnalyser: opts.hasAnalyser,
      totalWords: opts.totalWords,
    })
    s = r.state
    revealCount = r.revealCount
  }
  return { state: s, revealCount }
}

describe('advanceReveal', () => {
  it('falls back to time-based pacing when no analyser is present', () => {
    // 170 wpm ≈ 2.83 words/sec → ~28 words in 10s.
    const { revealCount } = run(initialRevealState(), {
      ms: 10_000, rawLevel: 0, hasAnalyser: false, totalWords: 100,
    })
    expect(revealCount).toBeGreaterThan(20)
    expect(revealCount).toBeLessThanOrEqual(30)
  })

  it('advances while the voice is above threshold', () => {
    const { revealCount } = run(initialRevealState(), {
      ms: 3_000, rawLevel: 0.2, hasAnalyser: true, totalWords: 100,
    })
    expect(revealCount).toBeGreaterThan(0)
  })

  it('advances before the first voiced sample (startup fallback)', () => {
    const { revealCount } = run(initialRevealState(), {
      ms: 1_000, rawLevel: 0, hasAnalyser: true, totalWords: 100,
    })
    expect(revealCount).toBeGreaterThan(0)
  })

  it('plateaus (stops advancing) during sustained silence once voice has been seen', () => {
    const voiced = run(initialRevealState(), {
      ms: 1_000, rawLevel: 0.2, hasAnalyser: true, totalWords: 100,
    })
    expect(voiced.state.sawVoice).toBe(true)
    // Let the envelope hangover decay fully.
    const afterDecay = run(voiced.state, {
      ms: 2_000, rawLevel: 0, hasAnalyser: true, totalWords: 100,
    })
    // Further silence must not advance at all.
    const more = run(afterDecay.state, {
      ms: 5_000, rawLevel: 0, hasAnalyser: true, totalWords: 100,
    })
    expect(more.revealCount).toBe(afterDecay.revealCount)
  })

  it('never reveals more words than have been received', () => {
    const { revealCount, state } = run(initialRevealState(), {
      ms: 10_000, rawLevel: 0.2, hasAnalyser: true, totalWords: 3,
    })
    expect(revealCount).toBeLessThanOrEqual(3)
    expect(state.wordProgress).toBeLessThanOrEqual(3)
  })
})
