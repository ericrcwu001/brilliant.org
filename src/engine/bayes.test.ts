import { describe, it, expect } from 'vitest'
import {
  bayesUpdate,
  bayesPosterior,
  posteriorOdds,
  sequentialPosterior,
  naturalFrequencies,
  oddsToProb,
  oddsUpdateProb,
  smallestKCross,
  formatRational,
} from './bayes'
import type { Rational } from './types'

const R = (n: number, d = 1): Rational => ({ n, d })

describe('bayesUpdate — two-hypothesis golden rows', () => {
  it('#1 two-coin, 1 head → 2/3', () => {
    expect(formatRational(bayesUpdate(R(1, 2), R(1), R(1, 2)))).toBe('2/3')
  })

  it('#3 boys-girls, ≥1 boy → 1/3', () => {
    expect(formatRational(bayesUpdate(R(1, 4), R(1), R(2, 3)))).toBe('1/3')
  })

  it('#4 boys-girls, "meet a boy" contrast → 1/2', () => {
    expect(formatRational(bayesUpdate(R(1, 4), R(1), R(1, 3)))).toBe('1/2')
  })

  it('#5 two-urn → 2/3', () => {
    expect(formatRational(bayesUpdate(R(1, 2), R(2, 3), R(1, 3)))).toBe('2/3')
  })

  it('#6 disease 1% → 1/2', () => {
    expect(formatRational(bayesUpdate(R(1, 100), R(99, 100), R(1, 100)))).toBe('1/2')
  })

  it('#7 disease 10% → 11/12', () => {
    expect(formatRational(bayesUpdate(R(1, 10), R(99, 100), R(1, 100)))).toBe('11/12')
  })

  it('#8 disease 25% → 33/34', () => {
    expect(formatRational(bayesUpdate(R(1, 4), R(99, 100), R(1, 100)))).toBe('33/34')
  })

  it('#9 disease 95%-acc/1% → 19/118', () => {
    expect(formatRational(bayesUpdate(R(1, 100), R(95, 100), R(5, 100)))).toBe('19/118')
  })
})

describe('sequentialPosterior — golden rows', () => {
  it('#2 two-coin HH (k=2) → 4/5', () => {
    expect(formatRational(sequentialPosterior(R(1, 2), R(1), R(1, 2), 2))).toBe('4/5')
  })

  it('#10 1000-coins, 10 H → 1024/2023', () => {
    expect(formatRational(sequentialPosterior(R(1, 1000), R(1), R(1, 2), 10))).toBe('1024/2023')
  })

  it('#11 1000-coin sequential k=1 → 2/1001', () => {
    expect(formatRational(sequentialPosterior(R(1, 1000), R(1), R(1, 2), 1))).toBe('2/1001')
  })

  it('#12 1000-coin sequential k=5 → 32/1031', () => {
    expect(formatRational(sequentialPosterior(R(1, 1000), R(1), R(1, 2), 5))).toBe('32/1031')
  })

  it('#13 1000-coin sequential k=10 → 1024/2023', () => {
    expect(formatRational(sequentialPosterior(R(1, 1000), R(1), R(1, 2), 10))).toBe('1024/2023')
  })

  it('#14 two-coin sequential k=1 → 2/3', () => {
    expect(formatRational(sequentialPosterior(R(1, 2), R(1), R(1, 2), 1))).toBe('2/3')
  })

  it('#15 two-coin sequential k=2 → 4/5', () => {
    expect(formatRational(sequentialPosterior(R(1, 2), R(1), R(1, 2), 2))).toBe('4/5')
  })

  it('#16 two-coin sequential k=3 → 8/9', () => {
    expect(formatRational(sequentialPosterior(R(1, 2), R(1), R(1, 2), 3))).toBe('8/9')
  })

  it('#18 smallest k with 2ᵏ > 999: crosses 1/2 at k=10, not k=9', () => {
    const half = R(1, 2)
    const lt = (a: Rational, b: Rational) => a.n * b.d < b.n * a.d
    const k9 = sequentialPosterior(R(1, 1000), R(1), R(1, 2), 9)
    const k10 = sequentialPosterior(R(1, 1000), R(1), R(1, 2), 10)
    expect(lt(k9, half) && lt(half, k10)).toBe(true)
  })
})

describe('bayesPosterior — n-hypothesis', () => {
  it('#10 1000-coins bayesPosterior[0] → 1024/2023', () => {
    const result = bayesPosterior([R(1, 1000), R(999, 1000)], [R(1), R(1, 1024)])
    expect(formatRational(result[0])).toBe('1024/2023')
  })
})

describe('posteriorOdds + oddsToProb', () => {
  it('#17 two 99% tests → 99/100', () => {
    const result = oddsToProb(posteriorOdds(posteriorOdds(R(1, 99), R(99, 1)), R(99, 1)))
    expect(formatRational(result)).toBe('99/100')
  })
})

describe('naturalFrequencies', () => {
  it('#6 disease 1% via natural frequencies → ppv = 1/2', () => {
    const { ppv } = naturalFrequencies(R(1, 100), R(99, 100), R(99, 100), 10000)
    expect(formatRational(ppv)).toBe('1/2')
    expect(ppv).toEqual({ n: 1, d: 2 })
  })

  it('disease 10% via natural frequencies → ppv = 11/12', () => {
    const { ppv } = naturalFrequencies(R(1, 10), R(99, 100), R(99, 100), 10000)
    expect(formatRational(ppv)).toBe('11/12')
  })

  it('#9 disease 95%-acc/1% via natural frequencies → ppv = 19/118', () => {
    const { ppv } = naturalFrequencies(R(1, 100), R(95, 100), R(95, 100), 10000)
    expect(formatRational(ppv)).toBe('19/118')
  })

  it('tp/fp/fn/tn are exact integers for disease 1%, pop 10000', () => {
    const { tp, fp, fn, tn } = naturalFrequencies(R(1, 100), R(99, 100), R(99, 100), 10000)
    expect(tp).toEqual({ n: 99, d: 1 })
    expect(fp).toEqual({ n: 99, d: 1 })
    expect(fn).toEqual({ n: 1, d: 1 })
    expect(tn).toEqual({ n: 9801, d: 1 })
  })
})

describe('oddsUpdateProb — golden rows', () => {
  it('1% disease, LR=99 once → 1/2', () => {
    expect(formatRational(oddsUpdateProb(R(1, 99), [R(99, 1)]))).toBe('1/2')
  })
  it('1% disease, LR=99 twice → 99/100', () => {
    expect(formatRational(oddsUpdateProb(R(1, 99), [R(99, 1), R(99, 1)]))).toBe('99/100')
  })
  it('1% disease, LR=99 three times → 9801/9802', () => {
    expect(formatRational(oddsUpdateProb(R(1, 99), [R(99, 1), R(99, 1), R(99, 1)]))).toBe('9801/9802')
  })
  it('1% disease, LR+ then LR− → back to base rate 1/100', () => {
    expect(formatRational(oddsUpdateProb(R(1, 99), [R(99, 1), R(1, 99)]))).toBe('1/100')
  })
  it('2% disease, LR=99 twice → 9801/9850', () => {
    expect(formatRational(oddsUpdateProb(R(1, 49), [R(99, 1), R(99, 1)]))).toBe('9801/9850')
  })
  it('10% condition, LR=9/2 twice → 9/13', () => {
    expect(formatRational(oddsUpdateProb(R(1, 9), [R(9, 2), R(9, 2)]))).toBe('9/13')
  })
})

describe('smallestKCross — golden rows', () => {
  it('1000 coins, crosses 1/2 at k=10', () => {
    expect(formatRational(smallestKCross(R(1, 1000), R(1), R(1, 2), R(1, 2)))).toBe('10')
  })
  it('1000 coins, crosses 99/100 at k=17', () => {
    expect(formatRational(smallestKCross(R(1, 1000), R(1), R(1, 2), R(99, 100)))).toBe('17')
  })
})

describe('formatRational', () => {
  it('integer result omits denominator', () => {
    expect(formatRational({ n: 4, d: 1 })).toBe('4')
    expect(formatRational({ n: 6, d: 2 })).toBe('3')
  })

  it('reduces before formatting', () => {
    expect(formatRational({ n: 2, d: 4 })).toBe('1/2')
    expect(formatRational({ n: 10, d: 15 })).toBe('2/3')
  })
})
