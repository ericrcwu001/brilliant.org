// Stage-2 fact-check: every graded number in lesson-covariance-6.json (the
// capstone) is reproduced by src/engine/covariance.ts. The cov6-explore scatter
// is an illustrative (min,max) cloud with no task/headline, so it carries no
// engine anchor (its exact-rational result Cov=1/36 is graded in cov6-mastery).

import { describe, it, expect } from 'vitest'
import { orderStatCovUniform, covBilinear, formatRational } from '../engine/covariance'
import fixture from '../../fixtures/lesson-covariance-6.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const R = (n: number, d = 1) => ({ n, d })

describe('lesson-covariance-6 fact-check', () => {
  it('engine goldens: orderStatCovUniform={cov:1/36, rho:1/2}, covBilinear(35/12,0)=35/12', () => {
    const os = orderStatCovUniform()
    expect(formatRational(os.cov)).toBe('1/36')
    expect(formatRational(os.rho)).toBe('1/2')
    expect(formatRational(covBilinear(R(35, 12), R(0)))).toBe('35/12')
  })

  it('cov6-win accept contains E[YZ] = 1/4', () => {
    const beat = beatById('cov6-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('1/4')
  })

  it('cov6-mastery: A Cov(min,max)=1/36 & ρ=1/2, B Cov(X1,S)=35/12', () => {
    const beat = beatById('cov6-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    const os = orderStatCovUniform()
    expect(fields['cov-minmax']).toContain(formatRational(os.cov)) // 1/36
    expect(fields['rho-minmax']).toContain(formatRational(os.rho)) // 1/2
    expect(fields['cov-x1-s']).toContain(formatRational(covBilinear(R(35, 12), R(0)))) // 35/12
  })

  it('GUARD: no accept list contains the 1/648 ρ-denominator trap', () => {
    for (const beat of lesson.beats) {
      const it = beat.interaction
      const fields =
        it.type === 'answerEntry' || it.type === 'masteryChallenge' ? it.fields : []
      for (const f of fields) for (const a of f.accept) expect(a).not.toBe('1/648')
    }
  })
})
