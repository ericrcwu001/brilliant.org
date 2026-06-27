// Stage-2 fact-check: every graded number + the ρ²-graded / ρ-display-only
// contract in lesson-covariance-4.json is reproduced by src/engine/covariance.ts.
// Asserts ρ = 1/√2 is NEVER graded as a float.

import { describe, it, expect } from 'vitest'
import { covariance, variance, rhoSquared, rho, formatRational } from '../engine/covariance'
import type { JointCell, Pmf } from '../engine/covariance'
import fixture from '../../fixtures/lesson-covariance-4.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

const R = (n: number, d = 1) => ({ n, d })

// Marginal pmf collapse (mirrors validate-fixtures §3f).
function marg(j: JointCell[], axis: 'x' | 'y'): Pmf {
  const m = new Map<string, { x: { n: number; d: number }; p: { n: number; d: number } }>()
  for (const c of j) {
    const v = axis === 'x' ? c.x : c.y
    const key = `${v.n}/${v.d}`
    const prev = m.get(key)
    m.set(key, { x: v, p: prev ? { n: prev.p.n * c.p.d + c.p.n * prev.p.d, d: prev.p.d * c.p.d } : c.p })
  }
  return [...m.values()]
}

describe('lesson-covariance-4 fact-check', () => {
  it('engine golden: rho(12,9,25) is rational 4/5', () => {
    const r = rho(R(12), R(9), R(25))
    expect(r.kind).toBe('rational')
    if (r.kind === 'rational') expect(formatRational(r.rho)).toBe('4/5')
  })

  it('engine golden: rho(35/12, 35/12, 35/6) is irrational with rho²=1/2 and NO float .rho', () => {
    const r = rho(R(35, 12), R(35, 12), R(35, 6))
    expect(r.kind).toBe('irrational')
    expect(formatRational(r.rhoSquared)).toBe('1/2')
    expect('rho' in r).toBe(false) // the float ρ is never produced
    expect(formatRational(rhoSquared(R(35, 12), R(35, 12), R(35, 6)))).toBe('1/2')
  })

  it('cov4-win accept contains ρ = 4/5', () => {
    const beat = beatById('cov4-win')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept).toContain('4/5')
  })

  it('cov4-explore scatter headline === engine ρ² from its joint (= 1/2)', () => {
    const beat = beatById('cov4-explore')
    if (beat.interaction.type !== 'covarianceBoard') throw new Error('wrong type')
    const it = beat.interaction
    const joint = it.joint as JointCell[]
    const got = formatRational(rhoSquared(covariance(joint), variance(marg(joint, 'x')), variance(marg(joint, 'y'))))
    expect(it.headline).toBe(got)
    expect(got).toBe('1/2')
  })

  it('cov4-mastery: Part A ρ²=1/2, Part B Cov=0 & ρ=0', () => {
    const beat = beatById('cov4-mastery')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields['rho-sq']).toContain('1/2')
    expect(fields['cov-xx2']).toContain('0')
    expect(fields['rho-xx2']).toContain('0')
  })

  it('GUARD: no accept list anywhere contains a float ρ (0.707, 0.71, 1/√2)', () => {
    const forbidden = /0\.707|0\.71|1\/√2/
    for (const beat of lesson.beats) {
      const it = beat.interaction
      const fields =
        it.type === 'answerEntry' || it.type === 'masteryChallenge' ? it.fields : []
      for (const f of fields) for (const a of f.accept) expect(a).not.toMatch(forbidden)
    }
  })
})
