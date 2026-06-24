// Focused tests for the engine internals exported in build-brief §4.1, so the
// new pure engines (race/walk/correlation) build on a verified foundation.

import { describe, it, expect } from 'vitest'
import {
  prefixFunction,
  solveLinearSystem,
  reduce,
  toRational,
  ratAdd,
  ratSub,
  ratMul,
  ratDiv,
  ratNum,
} from './automaton'
import type { Rational } from './types'

const r = (n: number, d = 1): Rational => reduce(n, d)

describe('prefixFunction (KMP failure function)', () => {
  it('matches known border tables', () => {
    expect(prefixFunction('HH')).toEqual([0, 1])
    expect(prefixFunction('HT')).toEqual([0, 0])
    expect(prefixFunction('THH')).toEqual([0, 0, 0])
    expect(prefixFunction('HTH')).toEqual([0, 0, 1])
    expect(prefixFunction('HHH')).toEqual([0, 1, 2])
    // Classic CLRS example.
    expect(prefixFunction('ababaca')).toEqual([0, 0, 1, 2, 3, 0, 1])
  })
})

describe('rational toolkit (exact)', () => {
  it('reduces and converts', () => {
    expect(reduce(2, 4)).toEqual({ n: 1, d: 2 })
    expect(reduce(-3, -6)).toEqual({ n: 1, d: 2 })
    expect(toRational(0.4)).toEqual({ n: 2, d: 5 })
    expect(toRational(3)).toEqual({ n: 3, d: 1 })
  })

  it('adds, subtracts, multiplies, divides exactly', () => {
    expect(ratAdd(r(1, 2), r(1, 3))).toEqual({ n: 5, d: 6 })
    expect(ratSub(r(1, 1), r(2, 5))).toEqual({ n: 3, d: 5 })
    expect(ratMul(r(2, 3), r(3, 4))).toEqual({ n: 1, d: 2 })
    expect(ratDiv(r(1, 2), r(1, 4))).toEqual({ n: 2, d: 1 })
    expect(ratNum(r(50, 13))).toBeCloseTo(3.846153, 5)
  })
})

describe('solveLinearSystem (Gauss-Jordan over rationals)', () => {
  it('solves a 2x2 integer system', () => {
    // x + y = 3 ; x - y = 1  =>  x = 2, y = 1
    const sol = solveLinearSystem(
      [
        [r(1), r(1)],
        [r(1), r(-1)],
      ],
      [r(3), r(1)],
    )
    expect(sol).toEqual([
      { n: 2, d: 1 },
      { n: 1, d: 1 },
    ])
  })

  it('handles the fair-coin walk system exactly (N=4 reach probabilities)', () => {
    // P_i = 1/2 P_{i-1} + 1/2 P_{i+1}, P_0 = 0, P_4 = 1.
    // Interior i = 1,2,3:  P_i - 1/2 P_{i-1} - 1/2 P_{i+1} = boundary terms.
    const half = r(1, 2)
    const A = [
      [r(1), ratSub(r(0), half), r(0)],
      [ratSub(r(0), half), r(1), ratSub(r(0), half)],
      [r(0), ratSub(r(0), half), r(1)],
    ]
    // b: row1 has 1/2*P0 = 0; row3 has 1/2*P4 = 1/2.
    const b = [r(0), r(0), half]
    const sol = solveLinearSystem(A, b)
    expect(sol).toEqual([
      { n: 1, d: 4 },
      { n: 1, d: 2 },
      { n: 3, d: 4 },
    ])
  })
})
