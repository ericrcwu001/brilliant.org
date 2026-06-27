// Stage-2 fact-check: every graded number in lesson-covariance-1.json is
// reproduced by src/engine/covariance.ts. Fails fast if a fixture author
// transcribes a wrong rational.

import { describe, it, expect } from 'vitest'
import { variance, expectedValueX2, formatRational } from '../engine/covariance'
import type { Pmf } from '../engine/covariance'
import fixture from '../../fixtures/lesson-covariance-1.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

// Fair die: x=1..6, each with p=1/6.
const die: Pmf = [1, 2, 3, 4, 5, 6].map((x) => ({
  x: { n: x, d: 1 },
  p: { n: 1, d: 6 },
}))

describe('lesson-covariance-1 fact-check', () => {
  it('engine golden: variance(die) === 35/12', () => {
    expect(formatRational(variance(die))).toBe('35/12')
  })

  it('engine golden: expectedValueX2(die) === 91/6', () => {
    expect(formatRational(expectedValueX2(die))).toBe('91/6')
  })

  it('cov1-win accept contains formatRational(variance(die)) === "35/12"', () => {
    const beat = beatById('cov1-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type: expected answerEntry')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.var).toContain(formatRational(variance(die)))
    expect(fields.var).toContain('35/12')
  })

  it('cov1-mastery E[X²] field accept contains formatRational(expectedValueX2(die)) === "91/6"', () => {
    const beat = beatById('cov1-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type: expected masteryChallenge')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.ex2).toContain(formatRational(expectedValueX2(die)))
    expect(fields.ex2).toContain('91/6')
  })

  it('cov1-mastery Var field accept contains formatRational(variance(die)) === "35/12"', () => {
    const beat = beatById('cov1-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type: expected masteryChallenge')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.var).toContain(formatRational(variance(die)))
    expect(fields.var).toContain('35/12')
  })

  it('no accept list contains a forbidden SD float (display-only guard)', () => {
    const sdForbidden = /1\.7|√/
    for (const beat of lesson.beats) {
      const it = beat.interaction
      if (it.type === 'answerEntry') {
        for (const field of it.fields) {
          for (const a of field.accept) {
            expect(a).not.toMatch(sdForbidden)
          }
        }
      } else if (it.type === 'masteryChallenge') {
        for (const field of it.fields) {
          for (const a of field.accept) {
            expect(a).not.toMatch(sdForbidden)
          }
        }
      }
    }
  })
})
