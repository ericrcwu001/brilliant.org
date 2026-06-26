// Stage-2 fact-check: every graded number in lesson-markov-chains-10.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import {
  classifyStates,
  absorptionProbabilities,
  stationaryDistribution,
  formatRational,
} from '../engine/markov'
import fixture from '../../fixtures/lesson-markov-chains-10.json'
import type { Lesson } from './schema'

// Cast through unknown so we don't need exact TS inference of the JSON literal.
const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

type Rat = { n: number; d: number }
const r = (n: number, d = 1): Rat => ({ n, d })

// Weather chain P = [[3/5, 2/5], [3/10, 7/10]]
const weather: Rat[][] = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(7, 10)],
]

// Symmetric drunkard 0–4, states 0 & 4 absorbing, p = 1/2
const sym5: Rat[][] = [
  [r(1), r(0), r(0), r(0), r(0)],
  [r(1, 2), r(0), r(1, 2), r(0), r(0)],
  [r(0), r(1, 2), r(0), r(1, 2), r(0)],
  [r(0), r(0), r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(0), r(0), r(1)],
]

describe('lesson-markov-chains-10 fact-check', () => {
  // ── classify-one (beat 4) + explore-mixed (beat 6): headline "ergodic" ──────

  it('classify-one headline "ergodic": weather has no absorbing state', () => {
    expect(classifyStates(weather).some((c) => c.kind === 'absorbing')).toBe(false)
  })

  it('explore-mixed headline "ergodic": weather has no absorbing state', () => {
    expect(classifyStates(weather).some((c) => c.kind === 'absorbing')).toBe(false)
  })

  // ── interleave-A-vs-B (beat 8) ───────────────────────────────────────────

  it('interleave-A-vs-B partA accept[0] === formatRational(absorptionProbabilities(sym5,[0,4])[0][1]) (= "1/4")', () => {
    const beat = beatById('interleave-A-vs-B')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const partA = beat.interaction.fields.find((f) => f.id === 'partA')
    if (!partA) throw new Error('field "partA" not found')
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(partA.accept[0]).toBe(formatRational(B[0][1]))
  })

  it('interleave-A-vs-B partB accept[0] === formatRational(stationaryDistribution(weather)[0]) (= "3/7")', () => {
    const beat = beatById('interleave-A-vs-B')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const partB = beat.interaction.fields.find((f) => f.id === 'partB')
    if (!partB) throw new Error('field "partB" not found')
    expect(partB.accept[0]).toBe(formatRational(stationaryDistribution(weather)[0]))
  })

  // ── mastery-challenge (beat 9) ───────────────────────────────────────────

  it('mastery-challenge kind accept[0] === "absorbing": sym5 state 0 is absorbing', () => {
    expect(classifyStates(sym5)[0].kind).toBe('absorbing')
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const kind = beat.interaction.fields.find((f) => f.id === 'kind')
    if (!kind) throw new Error('field "kind" not found')
    expect(kind.accept[0]).toBe('absorbing')
  })

  it('mastery-challenge from1 accept[0] === formatRational(absorptionProbabilities(sym5,[0,4])[0][1]) (= "1/4")', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const from1 = beat.interaction.fields.find((f) => f.id === 'from1')
    if (!from1) throw new Error('field "from1" not found')
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(from1.accept[0]).toBe(formatRational(B[0][1]))
  })

  it('mastery-challenge from2 accept[0] === formatRational(absorptionProbabilities(sym5,[0,4])[1][1]) (= "1/2")', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const from2 = beat.interaction.fields.find((f) => f.id === 'from2')
    if (!from2) throw new Error('field "from2" not found')
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(from2.accept[0]).toBe(formatRational(B[1][1]))
  })

  it('mastery-challenge from3 accept[0] === formatRational(absorptionProbabilities(sym5,[0,4])[2][1]) (= "3/4")', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const from3 = beat.interaction.fields.find((f) => f.id === 'from3')
    if (!from3) throw new Error('field "from3" not found')
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(from3.accept[0]).toBe(formatRational(B[2][1]))
  })

  // ── Engine goldens ────────────────────────────────────────────────────────

  it('engine golden: absorptionProbabilities(sym5,[0,4])[0][1] = "1/4"', () => {
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(formatRational(B[0][1])).toBe('1/4')
  })

  it('engine golden: absorptionProbabilities(sym5,[0,4])[1][1] = "1/2"', () => {
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(formatRational(B[1][1])).toBe('1/2')
  })

  it('engine golden: absorptionProbabilities(sym5,[0,4])[2][1] = "3/4"', () => {
    const B = absorptionProbabilities(sym5, [0, 4])
    expect(formatRational(B[2][1])).toBe('3/4')
  })

  it('engine golden: stationaryDistribution(weather)[0] = "3/7"', () => {
    expect(formatRational(stationaryDistribution(weather)[0])).toBe('3/7')
  })

  it('engine golden: classifyStates(sym5)[0].kind = "absorbing"', () => {
    expect(classifyStates(sym5)[0].kind).toBe('absorbing')
  })
})
