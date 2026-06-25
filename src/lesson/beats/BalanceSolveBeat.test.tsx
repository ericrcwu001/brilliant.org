// Pure unit tests for the balanceModel helper exported from BalanceSolveBeat.
// No React rendering — these run in the plain node Vitest environment.

import { describe, it, expect } from 'vitest'
import { balanceModel } from './balanceModel'
import { buildAutomaton } from '../../engine/automaton'

describe('balanceModel — HH at p = 0.5', () => {
  const a = buildAutomaton('HH', 0.5)

  describe('E0 (start state)', () => {
    const m = balanceModel(a, 'E0')

    it('balance point is 6', () => {
      expect(m.balancePoint).toBe(6)
    })

    it('rhs(6) = 6 — beam levels at the engine solution', () => {
      expect(m.rhsAt(6)).toBeCloseTo(6)
    })

    it('leftAt(x) is identity', () => {
      expect(m.leftAt(6)).toBe(6)
      expect(m.leftAt(0)).toBe(0)
    })

    it('rhs(0) = 3 — right pan heavier when candidate too low', () => {
      // rhs(0) = 1 + 0.5*E1 + 0.5*0 = 1 + 2 + 0 = 3
      expect(m.rhsAt(0)).toBeCloseTo(3)
    })

    it('rhs(12) = 9 — left pan heavier when candidate too high', () => {
      // rhs(12) = 1 + 0.5*4 + 0.5*12 = 3 + 6 = 9
      expect(m.rhsAt(12)).toBeCloseTo(9)
    })

    it('selfCoeff is 0.5 — E0 on T self-loops back to E0', () => {
      expect(m.selfCoeff).toBeCloseTo(0.5)
    })

    it('otherTerm is 3 — constant 1 plus 0.5 × E1(=4)', () => {
      expect(m.otherTerm).toBeCloseTo(3)
    })
  })

  describe('E1 (one-H matched state)', () => {
    const m = balanceModel(a, 'E1')

    it('balance point is 4', () => {
      expect(m.balancePoint).toBe(4)
    })

    it('rhs(4) = 4', () => {
      expect(m.rhsAt(4)).toBeCloseTo(4)
    })

    it('selfCoeff is 0 — E1 has no self-loop', () => {
      expect(m.selfCoeff).toBeCloseTo(0)
    })

    it('rhs is constant (no self-loop → slope 0)', () => {
      expect(m.rhsAt(0)).toBeCloseTo(m.rhsAt(10))
    })
  })
})

describe('balanceModel — HT at p = 0.5', () => {
  const a = buildAutomaton('HT', 0.5)

  it('E0 balance point is 4', () => {
    const m = balanceModel(a, 'E0')
    expect(m.balancePoint).toBe(4)
    expect(m.rhsAt(4)).toBeCloseTo(4)
  })
})
