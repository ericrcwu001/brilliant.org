import { describe, it, expect } from 'vitest'
import { buildWalk, simulateWalk, batchWalkStats, walkDurationHistogram, traceWalk } from './walk'
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

describe('walkDurationHistogram', () => {
  it('bin counts sum to trials', () => {
    const hist = walkDurationHistogram(2, 4, 0.4, mulberry32(0xf00d), 500)
    const total = hist.bins.reduce((s, b) => s + b.count, 0)
    expect(total).toBe(500)
  })
  it('ruinRate is within sane bounds for biased walk (p=0.4)', () => {
    // exact ruin from i=2 is 9/13 ≈ 0.69; allow generous slack for Monte Carlo
    const hist = walkDurationHistogram(2, 4, 0.4, mulberry32(0xbeef), 500)
    expect(hist.ruinRate).toBeGreaterThan(0.55)
    expect(hist.ruinRate).toBeLessThan(0.85)
  })
  it('meanSteps roughly matches exact duration for fair walk (±20%)', () => {
    const exact = buildWalk(4, 0.5).duration[2]  // { n: 4, d: 1 }
    const hist = walkDurationHistogram(2, 4, 0.5, mulberry32(0xc0de), 2000)
    const exactVal = exact.n / exact.d
    expect(hist.meanSteps).toBeGreaterThan(exactVal * 0.8)
    expect(hist.meanSteps).toBeLessThan(exactVal * 1.2)
  })
  it('maxCount equals the largest bin count', () => {
    const hist = walkDurationHistogram(2, 4, 0.5, mulberry32(0x1234), 200)
    const largest = Math.max(...hist.bins.map((b) => b.count))
    expect(hist.maxCount).toBe(largest)
  })
  it('returns empty result for zero trials', () => {
    const hist = walkDurationHistogram(2, 4, 0.5, mulberry32(0xdead), 0)
    expect(hist.bins).toHaveLength(0)
    expect(hist.trials).toBe(0)
    expect(hist.meanSteps).toBe(0)
  })
})

describe('traceWalk', () => {
  const SEED = 2024
  it('positions start at i and end at a wall', () => {
    const t = traceWalk(2, 4, 0.5, mulberry32(SEED))
    expect(t.positions[0]).toBe(2)
    const last = t.positions[t.positions.length - 1]
    expect(last === 0 || last === 4).toBe(true)
    expect(t.end).toBe(last === 0 ? 'ruin' : 'win')
  })
  it('every consecutive pair differs by exactly ±1', () => {
    const t = traceWalk(2, 4, 0.5, mulberry32(SEED))
    for (let k = 1; k < t.positions.length; k++) {
      expect(Math.abs(t.positions[k] - t.positions[k - 1])).toBe(1)
    }
  })
  it('is deterministic for the same seed', () => {
    const t1 = traceWalk(2, 4, 0.5, mulberry32(SEED))
    const t2 = traceWalk(2, 4, 0.5, mulberry32(SEED))
    expect(t1.positions).toEqual(t2.positions)
    expect(t1.end).toBe(t2.end)
  })
  it('steps and end are consistent with simulateWalk for the same seed', () => {
    const S = 0xabcd
    const trace = traceWalk(2, 4, 0.4, mulberry32(S))
    const sim = simulateWalk(2, 4, 0.4, mulberry32(S))
    expect(trace.positions.length - 1).toBe(sim.steps)
    expect(trace.end).toBe(sim.end)
  })
  it('tags win and ruin correctly for deterministic inputs', () => {
    const w = traceWalk(3, 4, 1, () => 0)
    expect(w.end).toBe('win')
    expect(w.positions).toEqual([3, 4])
    const r = traceWalk(1, 4, 0, () => 0.9)
    expect(r.end).toBe('ruin')
    expect(r.positions).toEqual([1, 0])
  })
})
