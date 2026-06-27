// Stage-2 fact-check: every graded number in lesson-markov-chains-6.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import {
  stationaryDistribution,
  kacReturnTime,
  formatRational,
  formatVector,
} from '../engine/markov'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-markov-chains-6.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

// ── Rational constructor shorthand ────────────────────────────────────────────
function r(n: number, d = 1): Rational {
  return { n, d }
}

// ── GfG Sunny/Rainy chain: P_gfg = [[7/10,3/10],[4/10,6/10]] ─────────────────
const gfg: Rational[][] = [
  [r(7, 10), r(3, 10)],
  [r(4, 10), r(6, 10)],
]

// ── Clear/Rainy chain: P_wx = [[3/5,2/5],[3/10,7/10]] ────────────────────────
const weather: Rational[][] = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(7, 10)],
]

// ── Cloudy-town 3-state chain: P_ct = [[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]] ──
const cloudy: Rational[][] = [
  [r(0), r(1, 2), r(1, 2)],
  [r(1, 4), r(1, 2), r(1, 4)],
  [r(1, 4), r(1, 4), r(1, 2)],
]

describe('lesson-markov-chains-6 fact-check', () => {
  // ── Engine goldens ─────────────────────────────────────────────────────────

  it('engine golden: formatRational(stationaryDistribution(gfg)[0]) === "4/7"', () => {
    expect(formatRational(stationaryDistribution(gfg)[0])).toBe('4/7')
  })

  it('engine golden: formatVector(stationaryDistribution(weather)) === "3/7,4/7"', () => {
    expect(formatVector(stationaryDistribution(weather))).toBe('3/7,4/7')
  })

  it('engine golden: formatRational(kacReturnTime(weather, 0)) === "7/3"', () => {
    expect(formatRational(kacReturnTime(weather, 0))).toBe('7/3')
  })

  it('engine golden: formatVector(stationaryDistribution(cloudy)) === "1/5,2/5,2/5"', () => {
    expect(formatVector(stationaryDistribution(cloudy))).toBe('1/5,2/5,2/5')
  })

  it('engine golden: formatRational(kacReturnTime(cloudy, 0)) === "5"', () => {
    expect(formatRational(kacReturnTime(cloudy, 0))).toBe('5')
  })

  // ── Fixture cross-checks: declared values match engine ─────────────────────

  it('read-the-share headline "4/7" === formatRational(stationaryDistribution(gfg)[0])', () => {
    const beat = beatById('read-the-share')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(stationaryDistribution(gfg)[0]))
  })

  it('watch-it-settle headline "3/7,4/7" === formatVector(stationaryDistribution(weather))', () => {
    const beat = beatById('watch-it-settle')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatVector(stationaryDistribution(weather)))
  })

  it('solve-pi piClear accept "3/7" === formatRational(stationaryDistribution(weather)[0])', () => {
    const beat = beatById('solve-pi')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'piClear')
    if (!field) throw new Error('field piClear not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(weather)[0]))
  })

  it('solve-pi piRainy accept "4/7" === formatRational(stationaryDistribution(weather)[1])', () => {
    const beat = beatById('solve-pi')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'piRainy')
    if (!field) throw new Error('field piRainy not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(weather)[1]))
  })

  it('kac-return kacClear accept "7/3" === formatRational(kacReturnTime(weather, 0))', () => {
    const beat = beatById('kac-return')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'kacClear')
    if (!field) throw new Error('field kacClear not found')
    expect(field.accept[0]).toBe(formatRational(kacReturnTime(weather, 0)))
  })

  it('mastery-cloudy-town piSunny accept "1/5" === formatRational(stationaryDistribution(cloudy)[0])', () => {
    const beat = beatById('mastery-cloudy-town')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'piSunny')
    if (!field) throw new Error('field piSunny not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(cloudy)[0]))
  })

  it('mastery-cloudy-town piCloudy accept "2/5" === formatRational(stationaryDistribution(cloudy)[1])', () => {
    const beat = beatById('mastery-cloudy-town')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'piCloudy')
    if (!field) throw new Error('field piCloudy not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(cloudy)[1]))
  })

  it('mastery-cloudy-town piRainy accept "2/5" === formatRational(stationaryDistribution(cloudy)[2])', () => {
    const beat = beatById('mastery-cloudy-town')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'piRainy')
    if (!field) throw new Error('field piRainy not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(cloudy)[2]))
  })

  it('mastery-cloudy-town kacSunny accept "5" === formatRational(kacReturnTime(cloudy, 0))', () => {
    const beat = beatById('mastery-cloudy-town')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'kacSunny')
    if (!field) throw new Error('field kacSunny not found')
    expect(field.accept[0]).toBe(formatRational(kacReturnTime(cloudy, 0)))
  })

  // ── Structural checks ──────────────────────────────────────────────────────

  it('watch-it-settle carries hero block with slowFirst:true', () => {
    const beat = beatById('watch-it-settle')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(true)
  })

  it('read-the-share has no hero block (graded)', () => {
    const beat = beatById('read-the-share')
    expect(beat.hero).toBeUndefined()
  })

  it('mastery-cloudy-town has no pattern (avoids buildAutomaton cross-check)', () => {
    const beat = beatById('mastery-cloudy-town')
    expect((beat as { pattern?: unknown }).pattern).toBeUndefined()
  })

  it('lesson has exactly 12 beats in spec order', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'recall-geometric',
      'settle-bet',
      'name-stationary',
      'read-the-share',
      'watch-it-settle',
      'solve-pi',
      'kac-return',
      'triangulate-pi',
      'absorbing-vs-stationary',
      'transfer-heldout',
      'mastery-cloudy-town',
      'recap',
    ])
  })

  it('penultimate beat is mastery-cloudy-town (required), last beat is recap', () => {
    const beats = lesson.beats
    expect(beats[beats.length - 2].beatId).toBe('mastery-cloudy-town')
    expect(beats[beats.length - 2].required).toBe(true)
    expect(beats[beats.length - 1].beatId).toBe('recap')
  })

  it('name-stationary is track:A and required:false', () => {
    const beat = beatById('name-stationary')
    expect(beat.track).toBe('A')
    expect(beat.required).toBe(false)
  })
})
