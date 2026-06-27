// Stage-2 fact-check: every graded number in lesson-optimal-stopping-5.json is
// reproduced by src/engine/optimalStopping.ts. Fails fast if a fixture author
// transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { secretarySuccess, optimalCutoff, runStrategy, formatRational } from '../engine/optimalStopping'
import fixture from '../../fixtures/lesson-optimal-stopping-5.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-optimal-stopping-5 fact-check', () => {
  it('l5-recall pairs match engine optimalCutoff values', () => {
    const beat = beatById('l5-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['Best chance, 7 candidates']).toBe(formatRational(optimalCutoff(7).p))
    expect(map['Best chance, 4 candidates']).toBe(formatRational(optimalCutoff(4).p))
  })

  it('l5-bet correct option is the middle one (index 1)', () => {
    const beat = beatById('l5-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe(beat.interaction.options[1])
  })

  it('l5-apply headline matches runStrategy([3,5,1,4,2], 3) → win', () => {
    const beat = beatById('l5-apply')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    const res = runStrategy(beat.interaction.order!, beat.interaction.cutoff!)
    expect(beat.interaction.headline).toBe(res.win ? 'win' : 'miss')
    expect(res.win).toBe(true)
  })

  it('l5-hiring accept includes secretarySuccess(7,3) = 29/70', () => {
    const beat = beatById('l5-hiring')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.p73).toContain(formatRational(secretarySuccess(7, 3)))
  })

  it('l5-model tripletReveal value is 1/e', () => {
    const beat = beatById('l5-model')
    if (beat.interaction.type !== 'tripletReveal') throw new Error('wrong type')
    expect(beat.interaction.value).toBe('1/e')
  })

  it('l5-converge headline = String(optimalCutoff(50).r) = "19"', () => {
    const beat = beatById('l5-converge')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(String(optimalCutoff(50).r))
  })

  it('l5-interview accept includes String(optimalCutoff(100).r - 1) = "37"', () => {
    const beat = beatById('l5-interview')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.reject).toContain(String(optimalCutoff(100).r - 1))
  })

  it('l5-prove skip = optimalCutoff(5).r - 1 = 2; prob = optimalCutoff(5).p = 13/30', () => {
    const beat = beatById('l5-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.skip).toContain(String(optimalCutoff(5).r - 1))
    expect(fields.prob).toContain(formatRational(optimalCutoff(5).p))
  })

  it('engine goldens: formatRational(secretarySuccess(7,3)) = "29/70", formatRational(optimalCutoff(5).p) = "13/30"', () => {
    expect(formatRational(secretarySuccess(7, 3))).toBe('29/70')
    expect(formatRational(optimalCutoff(5).p)).toBe('13/30')
  })

  it('lesson.unlocks is null', () => {
    expect(lesson.unlocks).toBeNull()
  })
})
