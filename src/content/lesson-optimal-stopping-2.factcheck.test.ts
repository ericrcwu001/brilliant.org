// Stage-2 fact-check: every graded number in lesson-optimal-stopping-2.json is
// reproduced by src/engine/optimalStopping.ts. Fails fast if a fixture author
// transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { secretarySuccess, naiveSuccess, optimalCutoff, runStrategy, formatRational } from '../engine/optimalStopping'
import fixture from '../../fixtures/lesson-optimal-stopping-2.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-optimal-stopping-2 fact-check', () => {
  it('l2-recall pairs match naive blind-pick 1/n values', () => {
    const beat = beatById('l2-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['Hire the first of 3']).toBe(formatRational(naiveSuccess(3)))
    expect(map['Pick one of 3 at random']).toBe(formatRational(naiveSuccess(3)))
    expect(map['Blind pick of 4']).toBe(formatRational(naiveSuccess(4)))
  })

  it('l2-bet correct option = secretarySuccess(3,2) = 1/2', () => {
    const beat = beatById('l2-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe(formatRational(secretarySuccess(3, 2)))
  })

  it('l2-watch headline matches runStrategy([3,1,2], 2) → win', () => {
    const beat = beatById('l2-watch')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    const res = runStrategy(beat.interaction.order!, beat.interaction.cutoff!)
    expect(beat.interaction.headline).toBe(res.win ? 'win' : 'miss')
    expect(res.win).toBe(true)
  })

  it('l2-explore headline = formatRational(optimalCutoff(4).p) = 11/24', () => {
    const beat = beatById('l2-explore')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(optimalCutoff(4).p))
  })

  it('l2-pin prob accept includes optimalCutoff(4).p; cutoff accept includes optimalCutoff(4).r', () => {
    const beat = beatById('l2-pin')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.prob).toContain(formatRational(optimalCutoff(4).p))
    expect(fields.cutoff).toContain(String(optimalCutoff(4).r))
  })

  it('l2-model tripletReveal value = 11/24', () => {
    const beat = beatById('l2-model')
    if (beat.interaction.type !== 'tripletReveal') throw new Error('wrong type')
    expect(beat.interaction.value).toBe('11/24')
  })

  it('l2-fivecase accept includes secretarySuccess(5,3) = 13/30', () => {
    const beat = beatById('l2-fivecase')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain(formatRational(secretarySuccess(5, 3)))
  })

  it('l2-prove prob accept includes secretarySuccess(5,3); better accept includes "yes"', () => {
    const beat = beatById('l2-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.prob).toContain(formatRational(secretarySuccess(5, 3)))
    expect(fields.better).toContain('yes')
  })

  it('engine goldens: secretarySuccess values match known fractions', () => {
    expect(formatRational(secretarySuccess(3, 2))).toBe('1/2')
    expect(formatRational(secretarySuccess(4, 2))).toBe('11/24')
    expect(formatRational(secretarySuccess(5, 3))).toBe('13/30')
  })
})
