// Stage-2 fact-check: every graded number in lesson-optimal-stopping-1.json is
// reproduced by src/engine/optimalStopping.ts (and combinatorics.ts for the
// permutation count). Fails fast if a fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { naiveSuccess, runStrategy, formatRational } from '../engine/optimalStopping'
import { factorial } from '../engine/combinatorics'
import fixture from '../../fixtures/lesson-optimal-stopping-1.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-optimal-stopping-1 fact-check', () => {
  it('l1-recall pairs are the blind-pick 1/n values', () => {
    const beat = beatById('l1-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['1 of 2 at random']).toBe(formatRational(naiveSuccess(2)))
    expect(map['1 of 3 at random']).toBe(formatRational(naiveSuccess(3)))
    expect(map['1 of 4 at random']).toBe(formatRational(naiveSuccess(4)))
  })

  it('l1-bet correct option = naiveSuccess(3) = 1/3', () => {
    const beat = beatById('l1-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe(formatRational(naiveSuccess(3)))
  })

  it('l1-watch sequence headline matches runStrategy([2,1,3], 1) → miss', () => {
    const beat = beatById('l1-watch')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    const res = runStrategy(beat.interaction.order!, beat.interaction.cutoff!)
    expect(beat.interaction.headline).toBe(res.win ? 'win' : 'miss')
    expect(res.win).toBe(false)
  })

  it('l1-explore sequence headline matches runStrategy([1,3,2], 1) → win', () => {
    const beat = beatById('l1-explore')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    const res = runStrategy(beat.interaction.order!, beat.interaction.cutoff!)
    expect(beat.interaction.headline).toBe(res.win ? 'win' : 'miss')
    expect(res.win).toBe(true)
  })

  it('l1-count fields = (best-first count, 1/3)', () => {
    const beat = beatById('l1-count')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    // Orders of 3 with the best first = 2! = 2 (the remaining two seats permute freely).
    expect(fields.count).toContain(factorial(2).toString())
    expect(fields.prob).toContain(formatRational(naiveSuccess(3)))
  })

  it('l1-model headline value is 1/n', () => {
    const beat = beatById('l1-model')
    if (beat.interaction.type !== 'tripletReveal') throw new Error('wrong type')
    expect(beat.interaction.value).toBe('1/n')
  })

  it('l1-stakes = naiveSuccess(10) = 1/10', () => {
    const beat = beatById('l1-stakes')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain(formatRational(naiveSuccess(10)))
  })

  it('l1-prove mastery = (naiveSuccess(4)=1/4, no)', () => {
    const beat = beatById('l1-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.prob).toContain(formatRational(naiveSuccess(4)))
    expect(fields.beats).toContain('no')
  })

  it('engine goldens: naiveSuccess(n) = 1/n', () => {
    expect(formatRational(naiveSuccess(3))).toBe('1/3')
    expect(formatRational(naiveSuccess(4))).toBe('1/4')
    expect(formatRational(naiveSuccess(10))).toBe('1/10')
  })
})
