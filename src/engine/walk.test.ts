import { describe, it, expect } from 'vitest'
import { buildWalk, simulateWalk, batchWalkStats } from './walk'
import { mulberry32 } from './simulate'

describe('buildWalk (fair, N=4)', () => {
  const w = buildWalk(4, 0.5)
  it('reach probabilities are [0, 1/4, 1/2, 3/4, 1]', () => {
    expect(w.reachProb).toEqual([
      { n: 0, d: 1 },
      { n: 1, d: 4 },
      { n: 1, d: 2 },
      { n: 3, d: 4 },
      { n: 1, d: 1 },
    ])
  })
  it('ruin probabilities are the complement', () => {
    expect(w.ruinProb).toEqual([
      { n: 1, d: 1 },
      { n: 3, d: 4 },
      { n: 1, d: 2 },
      { n: 1, d: 4 },
      { n: 0, d: 1 },
    ])
  })
  it('durations are [0, 3, 4, 3, 0]', () => {
    expect(w.duration).toEqual([
      { n: 0, d: 1 },
      { n: 3, d: 1 },
      { n: 4, d: 1 },
      { n: 3, d: 1 },
      { n: 0, d: 1 },
    ])
  })
})

describe('buildWalk (biased p=0.4, N=4)', () => {
  const w = buildWalk(4, 0.4)
  it('reach from i=2 is 4/13, ruin 9/13', () => {
    expect(w.reachProb[2]).toEqual({ n: 4, d: 13 })
    expect(w.ruinProb[2]).toEqual({ n: 9, d: 13 })
  })
  it('duration from i=2 is 50/13', () => {
    expect(w.duration[2]).toEqual({ n: 50, d: 13 })
  })
})

describe('simulateWalk / batchWalkStats (statistical)', () => {
  it('fair N=4 from i=2 is ~50/50 with mean steps ~4', () => {
    const s = batchWalkStats(2, 4, 0.5, mulberry32(2024), 5000)
    expect(s.ruin / 5000).toBeGreaterThan(0.45)
    expect(s.ruin / 5000).toBeLessThan(0.55)
    expect(s.meanSteps).toBeGreaterThan(3.5)
    expect(s.meanSteps).toBeLessThan(4.5)
  })
  it('tags outcomes by wall reached', () => {
    const win = simulateWalk(3, 4, 1, () => 0) // always H → +1 → reaches 4
    expect(win.end).toBe('win')
    const ruin = simulateWalk(1, 4, 0, () => 0.9) // always T → −1 → reaches 0
    expect(ruin.end).toBe('ruin')
  })
})
