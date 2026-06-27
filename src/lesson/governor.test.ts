// Difficulty-governor unit tests (spec-21 / D9). PURE node Vitest — the module
// imports nothing, so no mocks are needed. Pins the bounded closed-enum behavior,
// the half-open inactive band [EASIER_BELOW, HARDER_ABOVE], and the cap floor that
// guarantees no dead-end (R6).
import { describe, it, expect } from 'vitest'
import {
  WINDOW_SIZE,
  MIN_REPS,
  EASIER_BELOW,
  HARDER_ABOVE,
  EMPTY_WINDOW,
  pushRep,
  successRate,
  governorState,
  effectiveHintCap,
  type RepWindow,
} from './governor'

// Build a window of `n` reps with `pass` of them correct (passes first).
function win(pass: number, n: number): RepWindow {
  return { results: Array.from({ length: n }, (_, i) => i < pass) }
}

describe('successRate', () => {
  it('is null below MIN_REPS (do not govern on noise)', () => {
    expect(successRate(EMPTY_WINDOW)).toBeNull()
    expect(successRate(win(1, MIN_REPS - 1))).toBeNull()
  })

  it('is the correct fraction at/above MIN_REPS', () => {
    expect(successRate(win(2, MIN_REPS))).toBe(2 / MIN_REPS)
    expect(successRate(win(MIN_REPS, MIN_REPS))).toBe(1)
    expect(successRate(win(0, MIN_REPS))).toBe(0)
  })
})

describe('pushRep', () => {
  it('appends most-recent-last', () => {
    const w = pushRep(pushRep(EMPTY_WINDOW, true), false)
    expect(w.results).toEqual([true, false])
  })

  it('caps at WINDOW_SIZE, dropping the oldest', () => {
    let w: RepWindow = EMPTY_WINDOW
    // Push WINDOW_SIZE trues then one false: the oldest true is dropped.
    for (let i = 0; i < WINDOW_SIZE; i++) w = pushRep(w, true)
    w = pushRep(w, false)
    expect(w.results.length).toBe(WINDOW_SIZE)
    expect(w.results[w.results.length - 1]).toBe(false)
    expect(w.results.filter(Boolean).length).toBe(WINDOW_SIZE - 1)
  })
})

describe('governorState (bounded closed enum)', () => {
  it('null window → static default', () => {
    expect(governorState(EMPTY_WINDOW)).toEqual({ offerFade: false, hintCap: 'default' })
    expect(governorState(win(1, MIN_REPS - 1))).toEqual({
      offerFade: false,
      hintCap: 'default',
    })
  })

  it('coasting (rate > HARDER_ABOVE) → tighten, no fade', () => {
    // 0.9 over 10 reps (> 0.85).
    expect(governorState(win(9, 10))).toEqual({ offerFade: false, hintCap: 'tighten' })
  })

  it('struggling (rate < EASIER_BELOW) → loosen, offer fade', () => {
    // 0.3 over 10 reps (< 0.5).
    expect(governorState(win(3, 10))).toEqual({ offerFade: true, hintCap: 'loosen' })
  })

  it('inside the inactive 50–85% band → default', () => {
    // 0.6 over 10 reps.
    expect(governorState(win(6, 10))).toEqual({ offerFade: false, hintCap: 'default' })
  })

  it('band boundaries are half-open [EASIER_BELOW, HARDER_ABOVE]: == bound → default', () => {
    // rate exactly 0.50 (== EASIER_BELOW, not <) → default, NOT loosen.
    expect(successRate(win(5, 10))).toBe(EASIER_BELOW)
    expect(governorState(win(5, 10))).toEqual({ offerFade: false, hintCap: 'default' })
    // rate exactly 0.85 (== HARDER_ABOVE, not >) → default, NOT tighten.
    expect(successRate(win(17, 20))).toBe(HARDER_ABOVE)
    expect(governorState(win(17, 20))).toEqual({ offerFade: false, hintCap: 'default' })
  })

  it('monotone tracking: one wrong rep into the band flips tighten→default in a single step', () => {
    // Coasting: 8/8 → tighten.
    let w = win(WINDOW_SIZE, WINDOW_SIZE)
    expect(governorState(w).hintCap).toBe('tighten')
    // One wrong rep drops the rate to 7/8 = 0.875 (still > 0.85) — still tighten.
    w = pushRep(w, false)
    expect(governorState(w).hintCap).toBe('tighten')
    // A second wrong rep: 6/8 = 0.75, inside the band → default in one evaluation.
    w = pushRep(w, false)
    expect(governorState(w).hintCap).toBe('default')
  })
})

describe('effectiveHintCap (D9 bound: never strands a learner)', () => {
  it("'loosen' always returns the full ladder (3)", () => {
    expect(effectiveHintCap({ offerFade: true, hintCap: 'loosen' }, 1)).toBe(3)
    expect(effectiveHintCap({ offerFade: true, hintCap: 'loosen' }, undefined)).toBe(3)
  })

  it("'default' returns the author cap (or 3 when unset)", () => {
    expect(effectiveHintCap({ offerFade: false, hintCap: 'default' }, 1)).toBe(1)
    expect(effectiveHintCap({ offerFade: false, hintCap: 'default' }, 2)).toBe(2)
    expect(effectiveHintCap({ offerFade: false, hintCap: 'default' }, undefined)).toBe(3)
  })

  it("'tighten' is FLOORED at 2 — never 0/1 for ANY author cap", () => {
    for (const author of [1, 2, 3, undefined] as const) {
      const cap = effectiveHintCap({ offerFade: false, hintCap: 'tighten' }, author)
      expect(cap).toBeGreaterThanOrEqual(2)
    }
    // Concrete bounds: author 1 → 1? NO — floored to 2; author 3 → 2.
    expect(effectiveHintCap({ offerFade: false, hintCap: 'tighten' }, 1)).toBe(2)
    expect(effectiveHintCap({ offerFade: false, hintCap: 'tighten' }, 3)).toBe(2)
    expect(effectiveHintCap({ offerFade: false, hintCap: 'tighten' }, undefined)).toBe(2)
  })
})
