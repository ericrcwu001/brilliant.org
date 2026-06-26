import { describe, it, expect } from 'vitest'
import {
  expectedValue,
  totalExpectation,
  indicatorExpectation,
  harmonic,
  couponCollector,
  distinctAfterDraws,
  orderStatUniform,
  noodleLoops,
} from './expectation'
import type { Rational } from './types'

const R = (n: number, d: number): Rational => ({ n, d })

describe('expectation engine (exact rational)', () => {
  it('expectedValue Σ x·P(x)', () => {
    const die = [1, 2, 3, 4, 5, 6].map((x) => ({ x: R(x, 1), p: R(1, 6) }))
    expect(expectedValue(die)).toEqual(R(7, 2))
    const twoDice = [
      [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6],
      [8, 5], [9, 4], [10, 3], [11, 2], [12, 1],
    ].map(([x, w]) => ({ x: R(x, 1), p: R(w, 36) }))
    expect(expectedValue(twoDice)).toEqual(R(7, 1))
    expect(
      expectedValue([
        { x: R(3, 1), p: R(1, 4) },
        { x: R(5, 1), p: R(1, 2) },
        { x: R(7, 1), p: R(1, 4) },
      ]),
    ).toEqual(R(5, 1))
  })

  it('totalExpectation (literal + self-referential via solveLinearSystem)', () => {
    expect(
      totalExpectation([
        { p: R(1, 2), value: R(7, 2) },
        { p: R(1, 2), value: R(0, 1) },
      ]),
    ).toEqual(R(7, 4))
    expect(
      totalExpectation([
        { p: R(1, 2), value: R(2, 1) },
        { p: R(1, 2), restart: { add: R(5, 1) } },
      ]),
    ).toEqual(R(7, 1))
  })

  it('indicatorExpectation E[1_A]=P(A)', () => {
    expect(indicatorExpectation(R(1, 13))).toEqual(R(1, 13))
  })

  it('harmonic + couponCollector', () => {
    expect(harmonic(2)).toEqual(R(3, 2))
    expect(harmonic(3)).toEqual(R(11, 6))
    expect(harmonic(6)).toEqual(R(49, 20))
    expect(couponCollector(6)).toEqual(R(147, 10))
  })

  it('distinctAfterDraws N(1−((N−1)/N)^m)', () => {
    expect(distinctAfterDraws(6, 1)).toEqual(R(1, 1))
    expect(distinctAfterDraws(6, 2)).toEqual(R(11, 6))
  })

  it('orderStatUniform + noodleLoops', () => {
    expect(orderStatUniform(2)).toEqual({ max: R(2, 3), min: R(1, 3) })
    expect(orderStatUniform(4).min).toEqual(R(1, 5))
    expect(orderStatUniform(500).max).toEqual(R(500, 501))
    expect(noodleLoops(2)).toEqual(R(4, 3))
    expect(noodleLoops(3)).toEqual(R(23, 15))
  })
})
