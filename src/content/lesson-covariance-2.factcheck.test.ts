// Stage-2 fact-check: every graded number + covarianceBoard headline in
// lesson-covariance-2.json is reproduced by src/engine/covariance.ts. Fails fast
// if a fixture author transcribes a wrong rational.

import { describe, it, expect } from 'vitest'
import { covariance, expectedProduct, formatRational } from '../engine/covariance'
import type { JointCell } from '../engine/covariance'
import fixture from '../../fixtures/lesson-covariance-2.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const R = (n: number, d = 1) => ({ n, d })

// Matched bit table: P(0,0)=P(1,1)=1/2 → Cov=1/4, E[XY]=1/2.
const matched: JointCell[] = [
  { x: R(0), y: R(0), p: R(1, 2) },
  { x: R(0), y: R(1), p: R(0) },
  { x: R(1), y: R(0), p: R(0) },
  { x: R(1), y: R(1), p: R(1, 2) },
]
// Independent fair bits: all 1/4 → Cov=0.
const independent: JointCell[] = [
  { x: R(0), y: R(0), p: R(1, 4) },
  { x: R(0), y: R(1), p: R(1, 4) },
  { x: R(1), y: R(0), p: R(1, 4) },
  { x: R(1), y: R(1), p: R(1, 4) },
]

describe('lesson-covariance-2 fact-check', () => {
  it('engine goldens: matched Cov=1/4, E[XY]=1/2; independent Cov=0', () => {
    expect(formatRational(covariance(matched))).toBe('1/4')
    expect(formatRational(expectedProduct(matched))).toBe('1/2')
    expect(formatRational(covariance(independent))).toBe('0')
  })

  it('cov2-explore headline === formatRational(covariance(its joint))', () => {
    const beat = beatById('cov2-explore')
    if (beat.interaction.type !== 'covarianceBoard') throw new Error('wrong type: expected covarianceBoard')
    const it = beat.interaction
    expect(it.headline).toBe(formatRational(covariance(it.joint as JointCell[])))
  })

  it('cov2-win accept contains formatRational(covariance(matched)) === "1/4"', () => {
    const beat = beatById('cov2-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type: expected answerEntry')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.cov).toContain(formatRational(covariance(matched)))
    expect(fields.cov).toContain('1/4')
  })

  it('cov2-mastery Part A Cov=0, Part B Cov=1/4 & ρ=1', () => {
    const beat = beatById('cov2-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type: expected masteryChallenge')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields['cov-A']).toContain(formatRational(covariance(independent)))
    expect(fields['cov-A']).toContain('0')
    expect(fields['cov-B']).toContain(formatRational(covariance(matched)))
    expect(fields['cov-B']).toContain('1/4')
    expect(fields['rho-B']).toContain('1')
  })
})
