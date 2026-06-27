// Stage-2 fact-check: every graded number + the corrVectors headline in
// lesson-covariance-5.json is reproduced by src/engine/covariance.ts.

import { describe, it, expect } from 'vitest'
import {
  corrRange,
  equicorrelationMin,
  optimalHedgeRatio,
  rho,
  formatRational,
  formatRangePair,
} from '../engine/covariance'
import fixture from '../../fixtures/lesson-covariance-5.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const R = (n: number, d = 1) => ({ n, d })

describe('lesson-covariance-5 fact-check', () => {
  it('engine goldens: corrRange(4/5,4/5)={7/25,1}, equicorrelationMin(3)=-1/2, hedge(-6,9)=-2/3', () => {
    expect(formatRangePair(corrRange(R(4, 5), R(4, 5)))).toBe('7/25,1')
    expect(formatRational(equicorrelationMin(3))).toBe('-1/2')
    expect(formatRational(optimalHedgeRatio(R(-6), R(9)))).toBe('-2/3')
  })

  it('cov5-explore corrVectors headline === formatRangePair(corrRange(rho1,rho2)) === "7/25,1"', () => {
    const beat = beatById('cov5-explore')
    if (beat.interaction.type !== 'covarianceBoard') throw new Error('wrong type')
    const it = beat.interaction
    expect(it.headline).toBe(formatRangePair(corrRange(it.rho1!, it.rho2!)))
    expect(it.headline).toBe('7/25,1')
  })

  it('cov5-win accept contains ρ = 4/5 (spaced recall)', () => {
    const beat = beatById('cov5-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const r = rho(R(12), R(9), R(25))
    if (r.kind !== 'rational') throw new Error('expected rational ρ')
    expect(beat.interaction.fields[0].accept).toContain(formatRational(r.rho))
    expect(beat.interaction.fields[0].accept).toContain('4/5')
  })

  it('cov5-mastery: A min=7/25 & max=1, B equicorr=-1/2, hedge=-2/3', () => {
    const beat = beatById('cov5-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    const range = corrRange(R(4, 5), R(4, 5))
    expect(fields['rho-yz-min']).toContain(formatRational(range.min)) // 7/25
    expect(fields['rho-yz-max']).toContain(formatRational(range.max)) // 1
    expect(fields['equicorr-min']).toContain(formatRational(equicorrelationMin(3))) // -1/2
    expect(fields['hedge']).toContain(formatRational(optimalHedgeRatio(R(-6), R(9)))) // -2/3
  })
})
