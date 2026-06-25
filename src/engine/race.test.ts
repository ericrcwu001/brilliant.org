import { describe, it, expect } from 'vitest'
import {
  penneyOdds,
  bestBeater,
  winMatrix,
  batchRace,
  conwayLeadingNumbers,
  simulateRace,
  traceRace,
} from './race'
import { mulberry32 } from './simulate'

describe('penneyOdds (Conway, fair coin)', () => {
  it('THH beats HHH 7:1', () => {
    const odds = penneyOdds('HHH', 'THH')
    expect(odds.aBeatsB).toEqual({ n: 1, d: 8 }) // P(HHH first)
    expect(odds.bBeatsA).toEqual({ n: 7, d: 8 }) // P(THH first)
  })

  it('HH vs HT is a dead tie despite 6 ≠ 4', () => {
    const odds = penneyOdds('HH', 'HT')
    expect(odds.aBeatsB).toEqual({ n: 1, d: 2 })
    expect(odds.bBeatsA).toEqual({ n: 1, d: 2 })
  })

  it('HHH vs HHT is 1:1 despite different waits (14 vs 8)', () => {
    const odds = penneyOdds('HHH', 'HHT')
    expect(odds.aBeatsB).toEqual({ n: 1, d: 2 })
    expect(odds.bBeatsA).toEqual({ n: 1, d: 2 })
  })

  it('leading numbers match the worked HHH/THH example', () => {
    expect(conwayLeadingNumbers('HHH', 'THH')).toEqual({ aa: 7, ab: 0, ba: 3, bb: 4 })
  })
})

describe('bestBeater (second-mover rule)', () => {
  it('counters HHH with THH', () => {
    expect(bestBeater('HHH')).toBe('THH')
  })
  it('always wins for the second mover (>1/2) on length-3 patterns', () => {
    for (const a of ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT']) {
      const b = bestBeater(a)
      expect(penneyOdds(a, b).bBeatsA.n / penneyOdds(a, b).bBeatsA.d).toBeGreaterThan(0.5)
    }
  })
})

describe('winMatrix', () => {
  it('has ½ self-ties and complementary off-diagonal', () => {
    const m = winMatrix(['HH', 'HT'])
    expect(m[0][0]).toEqual({ n: 1, d: 2 })
    expect(m[0][1]).toEqual({ n: 1, d: 2 }) // HH vs HT tie
  })
})

describe('simulateRace (shared stream, statistical)', () => {
  it('THH beats HHH about 7/8 of the time', () => {
    const { a, b } = batchRace('HHH', 'THH', 0.5, mulberry32(12345), 4000)
    const pThhFirst = b / (a + b)
    expect(pThhFirst).toBeGreaterThan(0.84)
    expect(pThhFirst).toBeLessThan(0.91)
  })

  it('HH vs HT is ~50/50', () => {
    const { a, b } = batchRace('HH', 'HT', 0.5, mulberry32(999), 4000)
    expect(a / (a + b)).toBeGreaterThan(0.45)
    expect(a / (a + b)).toBeLessThan(0.55)
  })
})

describe('traceRace (single race, full stream)', () => {
  it('records flips ending in the winning pattern', () => {
    const t = traceRace('HHH', 'THH', 0.5, mulberry32(7))
    const win = t.winner === 'A' ? 'HHH' : 'THH'
    expect(t.flips.length).toBeGreaterThanOrEqual(win.length)
    expect(t.flips.slice(-win.length).join('')).toBe(win)
  })

  it('agrees with simulateRace on the winner for the same seed', () => {
    for (let s = 0; s < 20; s++) {
      const trace = traceRace('HH', 'HT', 0.5, mulberry32(s))
      const direct = simulateRace('HH', 'HT', 0.5, mulberry32(s))
      expect(trace.winner).toBe(direct)
    }
  })
})
