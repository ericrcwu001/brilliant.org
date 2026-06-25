// Pure model tests for the BayesUpdateBeat logic. No React rendering — these
// run in the plain node Vitest environment, mirroring SumTilesBeat.test.tsx.
// They verify the engine calculations the three displays depend on and the
// graded tap-partition grading rule.

import { describe, it, expect } from 'vitest'
import {
  bayesPosterior,
  sequentialPosterior,
  naturalFrequencies,
  formatRational,
} from '../../engine/bayes'
import { ratSub } from '../../engine/automaton'
import type { Rational } from '../../engine/types'

const ONE: Rational = { n: 1, d: 1 }
const R = (n: number, d = 1): Rational => ({ n, d })

// ── Bars display model (explore-update): bayesPosterior at the initial 1/2 prior.
describe('BarsDisplay model — two-coin at equal prior', () => {
  const priors = [R(1, 2), R(1, 2)]
  const likelihoods = [R(1, 1), R(1, 2)]

  it('posterior[0] is 2/3', () => {
    const post = bayesPosterior(priors, likelihoods)
    expect(formatRational(post[0])).toBe('2/3')
  })

  it('posterior[1] is 1/3', () => {
    const post = bayesPosterior(priors, likelihoods)
    expect(formatRational(post[1])).toBe('1/3')
  })

  it('posteriors sum to 1', () => {
    const post = bayesPosterior(priors, likelihoods)
    const sum = post[0].n * post[1].d + post[1].n * post[0].d
    expect(sum).toBe(post[0].d * post[1].d)
  })

  it('dragging prior to 25% gives a lower posterior for h0', () => {
    const draggedPriors = [R(25, 100), R(75, 100)]
    const post25 = bayesPosterior(draggedPriors, likelihoods)
    const post50 = bayesPosterior(priors, likelihoods)
    // post at 25% prior < post at 50% prior
    expect(post25[0].n / post25[0].d).toBeLessThan(post50[0].n / post50[0].d)
  })

  it('dragging prior to 75% gives a higher posterior for h0', () => {
    const draggedPriors = [R(75, 100), R(25, 100)]
    const post75 = bayesPosterior(draggedPriors, likelihoods)
    const post50 = bayesPosterior(priors, likelihoods)
    expect(post75[0].n / post75[0].d).toBeGreaterThan(post50[0].n / post50[0].d)
  })

  it('reduced-motion renders settled bars at 2/3 immediately (model check)', () => {
    // When reducedMotion=true, bars start at their final state — the initial
    // prior is unchanged, so the posterior from the fixture priors is 2/3.
    const post = bayesPosterior(priors, likelihoods)
    expect(formatRational(post[0])).toBe('2/3')
  })
})

// ── Tree large display model (explore-frequencies): naturalFrequencies at 1% prevalence.
describe('TreeLargeDisplay model — disease 1%, test 99%/99%, population 10000', () => {
  const prior = R(1, 100)
  const sensitivity = R(99, 100)
  const specificity = ratSub(ONE, R(1, 100)) // 1 - FPR = 1 - 1/100 = 99/100
  const population = 10000

  it('ppv is 1/2', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(formatRational(freq.ppv)).toBe('1/2')
  })

  it('tp = 99', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(freq.tp.n).toBe(99)
  })

  it('fp = 99', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(freq.fp.n).toBe(99)
  })

  it('fn = 1', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(freq.fn.n).toBe(1)
  })

  it('tn = 9801', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(freq.tn.n).toBe(9801)
  })

  it('tp + fp + fn + tn = population', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(freq.tp.n + freq.fp.n + freq.fn.n + freq.tn.n).toBe(population)
  })

  it('dragging prevalence to 10% raises ppv above 1/2', () => {
    const p10 = naturalFrequencies(R(10, 100), sensitivity, specificity, population)
    expect(p10.ppv.n / p10.ppv.d).toBeGreaterThan(0.5)
  })

  it('reduced-motion renders final frame: ppv = 1/2 at the fixture prior', () => {
    const freq = naturalFrequencies(prior, sensitivity, specificity, population)
    expect(formatRational(freq.ppv)).toBe('1/2')
  })
})

// ── Tree small display model (count-the-heads): tap-partition grading.
describe('TreeSmallDisplay model — count-the-heads grading', () => {
  const priors = [R(1, 2), R(1, 2)]
  const likelihoods = [R(1, 1), R(1, 2)]
  const population = 3
  const post = bayesPosterior(priors, likelihoods)
  const focalCount = Math.round((post[0].n / post[0].d) * population)

  function grade(tapped: Set<number>): boolean {
    return (
      tapped.size === focalCount &&
      Array.from({ length: focalCount }, (_, i) => i).every((i) => tapped.has(i))
    )
  }

  it('focalCount is 2 (2 of 3 icons belong to the two-headed coin)', () => {
    expect(focalCount).toBe(2)
  })

  it('tapping {0, 1} is correct (the two focal icons)', () => {
    expect(grade(new Set([0, 1]))).toBe(true)
  })

  it('tapping {1, 0} is the same as {0, 1} — correct', () => {
    // Sets are unordered; both indices must just be present.
    expect(grade(new Set([1, 0]))).toBe(true)
  })

  it('tapping only {0} is wrong (too few)', () => {
    expect(grade(new Set([0]))).toBe(false)
  })

  it('tapping {0, 1, 2} is wrong (too many)', () => {
    expect(grade(new Set([0, 1, 2]))).toBe(false)
  })

  it('tapping {1, 2} is wrong (includes non-focal icon 2)', () => {
    expect(grade(new Set([1, 2]))).toBe(false)
  })

  it('empty selection is wrong', () => {
    expect(grade(new Set())).toBe(false)
  })
})

// ── Sequence display model (explore-sequence): posterior per step.
describe('SequenceDisplay model — 1-in-1000 double-headed coin', () => {
  const prior = R(1, 1000)
  const pH = R(1, 1)
  const pNotH = R(1, 2)

  it('step 1 gives 2/1001', () => {
    expect(formatRational(sequentialPosterior(prior, pH, pNotH, 1))).toBe('2/1001')
  })

  it('step 5 gives 32/1031', () => {
    expect(formatRational(sequentialPosterior(prior, pH, pNotH, 5))).toBe('32/1031')
  })

  it('step 10 gives 1024/2023', () => {
    expect(formatRational(sequentialPosterior(prior, pH, pNotH, 10))).toBe('1024/2023')
  })

  it('step 10 is just over 1/2', () => {
    const p10 = sequentialPosterior(prior, pH, pNotH, 10)
    expect(p10.n / p10.d).toBeGreaterThan(0.5)
  })

  it('step 9 is still under 1/2', () => {
    const p9 = sequentialPosterior(prior, pH, pNotH, 9)
    expect(p9.n / p9.d).toBeLessThan(0.5)
  })

  it('reduced-motion renders the final frame: step = steps = 10, posterior = 1024/2023', () => {
    const steps = 10
    // When reducedMotion=true, step initialises to `steps` immediately.
    const post = sequentialPosterior(prior, pH, pNotH, steps)
    expect(formatRational(post)).toBe('1024/2023')
  })
})

// ── formatRational helper (used for all aria-live mirrors).
describe('formatRational', () => {
  it('reduces 2/3 correctly', () => {
    expect(formatRational({ n: 2, d: 3 })).toBe('2/3')
  })

  it('shows integer when denominator is 1', () => {
    expect(formatRational({ n: 4, d: 4 })).toBe('1')
  })

  it('reduces 4/6 to 2/3', () => {
    expect(formatRational({ n: 4, d: 6 })).toBe('2/3')
  })
})
