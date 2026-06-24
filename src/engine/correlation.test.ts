import { describe, it, expect } from 'vitest'
import {
  correlation,
  autocorrelation,
  expectedWaitFair,
  gamblerLedger,
} from './correlation'
import { buildAutomaton } from './automaton'

const CURATED: Array<[string, number]> = [
  ['HT', 4],
  ['HH', 6],
  ['THH', 8],
  ['HTH', 10],
  ['HHH', 14],
]

describe('expectedWaitFair = Σ 2^L over borders', () => {
  it('matches the curated table', () => {
    for (const [pattern, wait] of CURATED) {
      expect(expectedWaitFair(pattern)).toBe(wait)
    }
  })

  it('equals buildAutomaton(pattern, 0.5).E0 for every curated pattern (golden)', () => {
    for (const [pattern] of CURATED) {
      const e0 = buildAutomaton(pattern, 0.5).expectedTimes.E0
      expect(expectedWaitFair(pattern)).toBe(e0)
    }
  })
})

describe('autocorrelation borders', () => {
  it('HH borders {1,2}; HTH borders {1,3}; THH borders {3}', () => {
    expect(autocorrelation('HH').overlaps).toEqual([1, 2])
    expect(autocorrelation('HTH').overlaps).toEqual([1, 3])
    expect(autocorrelation('THH').overlaps).toEqual([3])
  })
  it('correlation(v,w) is suffix-of-v vs prefix-of-w', () => {
    // THH suffix vs HHH prefix: k=1 "H"=="H"; k=2 "HH"=="HH"; k=3 "THH"!="HHH".
    expect(correlation('THH', 'HHH').overlaps).toEqual([1, 2])
  })
})

describe('gamblerLedger', () => {
  it('payout = Σ 2^L = expectedWaitFair for every curated pattern', () => {
    for (const [pattern] of CURATED) {
      expect(gamblerLedger(pattern, pattern).payout).toBe(expectedWaitFair(pattern))
    }
  })
  it('counts money-in as the wait until first occurrence', () => {
    expect(gamblerLedger('HH', 'THH').moneyIn).toBe(3)
    expect(gamblerLedger('HHH', 'HHH').moneyIn).toBe(3)
  })
})
