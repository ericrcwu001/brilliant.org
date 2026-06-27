// Stage-2 fact-check: every graded number in lesson-covariance-3.json is
// reproduced by src/engine/covariance.ts. Fails fast if a fixture author
// transcribes a wrong rational.

import { describe, it, expect } from 'vitest'
import { varianceOfSum, covBilinear, formatRational } from '../engine/covariance'
import fixture from '../../fixtures/lesson-covariance-3.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const var35_12 = { n: 35, d: 12 } // Var(one fair die)
const cov0 = { n: 0, d: 1 } // independent dice

describe('lesson-covariance-3 fact-check', () => {
  it('engine goldens: varianceOfSum=35/6, covBilinear=35/12', () => {
    expect(formatRational(varianceOfSum(var35_12, var35_12, cov0))).toBe('35/6')
    expect(formatRational(covBilinear(var35_12, cov0))).toBe('35/12')
  })

  it('cov3-win accept contains Var(X1+X2)=35/6', () => {
    const beat = beatById('cov3-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type: expected answerEntry')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields['var-sum']).toContain(formatRational(varianceOfSum(var35_12, var35_12, cov0)))
    expect(fields['var-sum']).toContain('35/6')
  })

  it('cov3-mastery accept contains Cov(X1,S)=35/12', () => {
    const beat = beatById('cov3-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type: expected masteryChallenge')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields['cov-x1-s']).toContain(formatRational(covBilinear(var35_12, cov0)))
    expect(fields['cov-x1-s']).toContain('35/12')
  })
})
