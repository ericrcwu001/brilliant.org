// Stage-2 fact-check: every graded number in lesson-optimal-stopping-4.json is
// reproduced by src/engine/optimalStopping.ts and src/engine/expectation.ts.
// Fails fast if a fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { secretarySuccess, optimalCutoff, runStrategy, formatRational } from '../engine/optimalStopping'
import { harmonic } from '../engine/expectation'
import fixture from '../../fixtures/lesson-optimal-stopping-4.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-optimal-stopping-4 fact-check', () => {
  it('l4-recall pairs match harmonic(2), harmonic(3), harmonic(4)', () => {
    const beat = beatById('l4-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['1 + 1/2']).toBe(`${harmonic(2).n}/${harmonic(2).d}`)
    expect(map['1 + 1/2 + 1/3']).toBe(`${harmonic(3).n}/${harmonic(3).d}`)
    expect(map['1 + 1/2 + 1/3 + 1/4']).toBe(`${harmonic(4).n}/${harmonic(4).d}`)
  })

  it('l4-bet correct option is the middle one', () => {
    const beat = beatById('l4-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe(
      'the best comes after the reject zone AND the top candidate so far was inside it',
    )
  })

  it('l4-build headline matches runStrategy([2,3,1,4], 2) → win', () => {
    const beat = beatById('l4-build')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    const res = runStrategy(beat.interaction.order!, beat.interaction.cutoff!)
    expect(beat.interaction.headline).toBe(res.win ? 'win' : 'miss')
    expect(res.win).toBe(true)
  })

  it('l4-decompose accept includes formatRational(secretarySuccess(4,2)) = "11/24"', () => {
    const beat = beatById('l4-decompose')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.sum).toContain(formatRational(secretarySuccess(4, 2)))
  })

  it('l4-formula tripletReveal value = "11/24"', () => {
    const beat = beatById('l4-formula')
    if (beat.interaction.type !== 'tripletReveal') throw new Error('wrong type')
    expect(beat.interaction.value).toBe('11/24')
  })

  it('l4-harmonic accept includes formatRational(secretarySuccess(5,2)) = "5/12"; harmonic(4) = {n:25,d:12}', () => {
    const beat = beatById('l4-harmonic')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.p52).toContain(formatRational(secretarySuccess(5, 2)))
    expect(harmonic(4)).toEqual({ n: 25, d: 12 })
  })

  it('l4-threshold accept includes String(optimalCutoff(4).r) = "2"', () => {
    const beat = beatById('l4-threshold')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.ropt).toContain(String(optimalCutoff(4).r))
  })

  it('l4-prove: prob accept = "5/12", isopt accept = "no", optimalCutoff(5).r ≠ 2', () => {
    const beat = beatById('l4-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.prob).toContain(formatRational(secretarySuccess(5, 2)))
    expect(fields.isopt).toContain('no')
    expect(optimalCutoff(5).r).not.toBe(2)
  })

  it('engine goldens: formatRational(secretarySuccess(4,2)) = "11/24", formatRational(secretarySuccess(5,2)) = "5/12"', () => {
    expect(formatRational(secretarySuccess(4, 2))).toBe('11/24')
    expect(formatRational(secretarySuccess(5, 2))).toBe('5/12')
  })
})
