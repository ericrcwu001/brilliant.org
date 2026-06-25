// Equivalence guards for the progressive simulation beats. Each beat now reveals
// its Monte Carlo batch one trial at a time (via useProgressiveRuns) instead of
// computing it synchronously. Because every beat folds the SAME engine trial fn
// over a SINGLE seeded rng in the SAME order as the original batch helper, the
// fully-revealed result must equal the batch result. These pure tests lock that
// invariant — most importantly for the histogram, whose bin geometry is derived
// from the final sample's 95th percentile and so must be reproduced exactly by
// the progressive fill (the beat locks binWidth from the memoized result, then
// reveals counts over time).

import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../../engine/simulate'
import { simulateRace, batchRace } from '../../engine/race'
import { simulateWalk, batchWalkStats, walkDurationHistogram } from '../../engine/walk'

describe('RaceSimBeat — progressive tally equals batchRace for the same seed', () => {
  const cases: ReadonlyArray<readonly [string, string]> = [
    ['HH', 'HT'],
    ['HHH', 'THH'],
    ['HTH', 'HHT'],
  ]
  for (const [a, b] of cases) {
    it(`${a} vs ${b} over 200 races`, () => {
      const seed = 0xbada55
      const batch = batchRace(a, b, 0.5, mulberry32(seed), 200)

      // Replicate the beat's fold: one simulateRace per onTrial over one rng.
      const rng = mulberry32(seed)
      const tally = { a: 0, b: 0 }
      for (let i = 0; i < 200; i++) {
        if (simulateRace(a, b, 0.5, rng) === 'A') tally.a += 1
        else tally.b += 1
      }
      expect(tally).toEqual(batch)
    })
  }
})

describe('WalkBoardBeat batch — progressive stats equal batchWalkStats for the same seed', () => {
  it('200 walks from $2 on a fair coin', () => {
    const start = 2
    const N = 4
    const p = 0.5
    const trials = 200
    const seed = 0x5eed
    const batch = batchWalkStats(start, N, p, mulberry32(seed), trials)

    const rng = mulberry32(seed)
    let ruin = 0
    let steps = 0
    for (let i = 0; i < trials; i++) {
      const r = simulateWalk(start, N, p, rng)
      if (r.end === 'ruin') ruin += 1
      steps += r.steps
    }
    expect(ruin).toBe(batch.ruin)
    expect(trials - ruin).toBe(batch.win)
    expect(steps / trials).toBeCloseTo(batch.meanSteps, 10)
  })
})

describe('WalkBoardBeat histogram — progressive fill lands on the exact memoized bins', () => {
  for (const pPct of [40, 50, 60]) {
    it(`bias ${pPct}% reproduces walkDurationHistogram bin-for-bin`, () => {
      const start = 2
      const N = 4
      const trials = 400
      const p = pPct / 100
      const target = walkDurationHistogram(start, N, p, mulberry32(0xd157 + pPct), trials)

      // The beat locks bin geometry from the final histogram, re-seeds the SAME
      // rng, then bins each walk with the SAME index formula as the engine.
      const binCount = target.bins.length
      const binWidth = target.bins[0].hi
      const counts = new Array<number>(binCount).fill(0)
      let ruin = 0
      let steps = 0
      const rng = mulberry32(0xd157 + pPct)
      for (let i = 0; i < trials; i++) {
        const r = simulateWalk(start, N, p, rng)
        const idx = Math.min(Math.floor(r.steps / binWidth), binCount - 1)
        counts[idx] += 1
        if (r.end === 'ruin') ruin += 1
        steps += r.steps
      }

      expect(counts).toEqual(target.bins.map((bin) => bin.count))
      expect(steps / trials).toBeCloseTo(target.meanSteps, 10)
      expect(ruin / trials).toBeCloseTo(target.ruinRate, 10)
    })
  }
})
