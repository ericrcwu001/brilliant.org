// Stage-2 fact-check: imports the lesson-expected-value-3 fixture and the
// expectation engine; asserts every graded accept value matches the engine's
// exact-rational output. Cross-checks ev3-win, ev3-count, and ev3-prove against
// the concrete engine functions used in the interaction spec.

import { describe, it, expect } from 'vitest'
import fixtureJson from '../../fixtures/lesson-expected-value-3.json'
import { LessonSchema } from './schema'
import { indicatorExpectation, distinctAfterDraws } from '../engine/expectation'
import { ratAdd, ratMul } from '../engine/automaton'
import type { Rational } from '../engine/types'

const lesson = LessonSchema.parse(fixtureJson)

function acceptOf(beatId: string): string[] {
  const beat = lesson.beats.find((b) => b.beatId === beatId)
  if (!beat) throw new Error(`beat ${beatId} not found`)
  const it = beat.interaction
  if (it.type === 'answerEntry' || it.type === 'masteryChallenge') {
    return it.fields.flatMap((f) => f.accept)
  }
  throw new Error(`beat ${beatId} has no accept list (type: ${it.type})`)
}

const R = (n: number, d: number): Rational => ({ n, d })

describe('ev3-win: E[1_ace] = indicatorExpectation({n:4, d:52})', () => {
  it('engine returns 1/13', () => {
    const r = indicatorExpectation(R(4, 52))
    expect(r).toEqual(R(1, 13))
  })

  it('fixture accept contains "1/13"', () => {
    expect(acceptOf('ev3-win')).toContain('1/13')
  })

  it('fixture accept contains "4/52" (alternate form)', () => {
    expect(acceptOf('ev3-win')).toContain('4/52')
  })
})

describe('ev3-count: E[distinct] = distinctAfterDraws(6, 2)', () => {
  it('engine returns 11/6', () => {
    const r = distinctAfterDraws(6, 2)
    expect(r).toEqual(R(11, 6))
  })

  it('fixture accept contains "11/6"', () => {
    expect(acceptOf('ev3-count')).toContain('11/6')
  })
})

describe('ev3-prove: E[first ace] = 1 + 48·indicatorExpectation({n:1,d:5})', () => {
  it('engine returns 53/5', () => {
    const oneR: Rational = R(1, 1)
    const fortyEight: Rational = R(48, 1)
    const eachNonAce = indicatorExpectation(R(1, 5))
    const r = ratAdd(oneR, ratMul(fortyEight, eachNonAce))
    expect(r).toEqual(R(53, 5))
  })

  it('fixture accept contains "53/5"', () => {
    expect(acceptOf('ev3-prove')).toContain('53/5')
  })

  it('fixture accept contains "10.6" (decimal form)', () => {
    expect(acceptOf('ev3-prove')).toContain('10.6')
  })
})
