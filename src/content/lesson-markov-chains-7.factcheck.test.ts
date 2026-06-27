// Stage-2 fact-check: every graded number in lesson-markov-chains-7.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import {
  matrixPower,
  stationaryDistribution,
  classifyStates,
  formatRational,
  formatVector,
} from '../engine/markov'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-markov-chains-7.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

// ── Rational constructor shorthand ────────────────────────────────────────────
const r = (n: number, d = 1): Rational => ({ n, d })

// ── Weather chain: Clear/Rainy ────────────────────────────────────────────────
// P = [[3/5,2/5],[3/10,7/10]]  (Math.SE 3336273)
const weather: Rational[][] = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(7, 10)],
]

// ── Ehrenfest m=2: states {0,1,2} ────────────────────────────────────────────
// P = [[0,1,0],[1/2,0,1/2],[0,1,0]]
const ehr2: Rational[][] = [
  [r(0), r(1), r(0)],
  [r(1, 2), r(0), r(1, 2)],
  [r(0), r(1), r(0)],
]

describe('lesson-markov-chains-7 fact-check', () => {
  // ── Engine goldens ─────────────────────────────────────────────────────────

  it('engine: matrixPower(weather,2)[0][0] = "12/25"  (early-power)', () => {
    expect(formatRational(matrixPower(weather, 2)[0][0])).toBe('12/25')
  })

  it('engine: formatVector(stationaryDistribution(weather)) = "3/7,4/7"  (explore-collapse)', () => {
    expect(formatVector(stationaryDistribution(weather))).toBe('3/7,4/7')
  })

  it('engine: formatRational(stationaryDistribution(weather)[0]) = "3/7"  (approach-pi / mastery)', () => {
    expect(formatRational(stationaryDistribution(weather)[0])).toBe('3/7')
  })

  it('engine: classifyStates(ehr2)[0].period = 2  (periodic-trap → oscillates)', () => {
    expect(classifyStates(ehr2)[0].period).toBe(2)
  })

  it('engine: classifyStates(ehr2)[0].period > 1  (⇒ Pⁿ does NOT converge → mastery "no")', () => {
    expect(classifyStates(ehr2)[0].period).toBeGreaterThan(1)
  })

  // ── Fixture cross-checks: declared values match engine ─────────────────────

  it('fixture early-power headline === formatRational(matrixPower(weather,2)[0][0])', () => {
    const beat = beatById('early-power')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(matrixPower(weather, 2)[0][0]))
  })

  it('fixture explore-collapse headline === formatVector(stationaryDistribution(weather))', () => {
    const beat = beatById('explore-collapse')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatVector(stationaryDistribution(weather)))
  })

  it('fixture approach-pi headline === formatRational(stationaryDistribution(weather)[0])', () => {
    const beat = beatById('approach-pi')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(stationaryDistribution(weather)[0]))
  })

  it('fixture mastery-challenge fromClear accept[0] === formatRational(stationaryDistribution(weather)[0])', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'fromClear')
    if (!field) throw new Error('fromClear field not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(weather)[0]))
  })

  it('fixture mastery-challenge fromRainy accept[0] === formatRational(stationaryDistribution(weather)[0])', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'fromRainy')
    if (!field) throw new Error('fromRainy field not found')
    expect(field.accept[0]).toBe(formatRational(stationaryDistribution(weather)[0]))
  })

  it('fixture mastery-challenge ehrenfest accept[0] = "no" and classifyStates(ehr2)[0].period === 2', () => {
    const beat = beatById('mastery-challenge')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const field = beat.interaction.fields.find((f) => f.id === 'ehrenfest')
    if (!field) throw new Error('ehrenfest field not found')
    expect(field.accept[0]).toBe('no')
    expect(classifyStates(ehr2)[0].period).toBe(2)
  })

  // ── Structural checks ──────────────────────────────────────────────────────

  it('explore-collapse carries hero block with slowFirst:true and reducedMotionFinalFrame:true', () => {
    const beat = beatById('explore-collapse')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(true)
    expect(beat.hero?.reducedMotionFinalFrame).toBe(true)
  })

  it('explore-collapse has no task field (passive hero)', () => {
    const beat = beatById('explore-collapse')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect((beat.interaction as Record<string, unknown>)['task']).toBeUndefined()
  })

  it('periodic-trap has interviewNote', () => {
    const beat = beatById('periodic-trap')
    expect((beat as unknown as Record<string, unknown>)['interviewNote']).toBeDefined()
  })

  it('periodic-trap feedback uses {correct,hints} (not byOption)', () => {
    const beat = beatById('periodic-trap')
    const fb = beat.feedback as Record<string, unknown>
    expect(fb['correct']).toBeDefined()
    expect(fb['hints']).toBeDefined()
    expect(fb['byOption']).toBeUndefined()
  })

  it('mastery-challenge has no pattern (avoids buildAutomaton cross-check)', () => {
    const beat = beatById('mastery-challenge')
    expect((beat as unknown as Record<string, unknown>)['pattern']).toBeUndefined()
  })

  it('lesson has exactly 12 beats in spec order', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'recall-LLN',
      'open-bet',
      'name-regular-ergodic',
      'early-power',
      'explore-collapse',
      'model-ergodic',
      'approach-pi',
      'periodic-trap',
      'interleave-forgets',
      'transfer-heldout',
      'mastery-challenge',
      'recap',
    ])
  })

  it('penultimate beat is mastery-challenge (required:true), last beat is recap', () => {
    const beats = lesson.beats
    expect(beats[beats.length - 2].beatId).toBe('mastery-challenge')
    expect(beats[beats.length - 2].required).toBe(true)
    expect(beats[beats.length - 1].beatId).toBe('recap')
  })
})
