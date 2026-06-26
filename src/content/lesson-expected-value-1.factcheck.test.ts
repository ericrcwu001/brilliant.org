// Stage-2 fact-check: imports the lesson-expected-value-1 fixture and the
// expectation engine; asserts every graded accept value matches the engine's
// exact-rational output. Cross-checks ev1-win, ev1-pmf (both fields), and
// ev1-prove against the concrete pmfs used in the interaction spec.

import { describe, it, expect } from 'vitest'
import fixture from '../../fixtures/lesson-expected-value-1.json'
import { LessonSchema } from './schema'
import { expectedValue } from '../engine/expectation'
import { reduce } from '../engine/automaton'
import type { Rational } from '../engine/types'

const R = (n: number, d: number): Rational => ({ n, d })

const lesson = LessonSchema.parse(fixture)

describe('lesson-expected-value-1 fact-check', () => {
  it('ev1-win accept includes "7/2" and matches expectedValue(fairDie)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev1-win')!
    expect(beat.interaction.type).toBe('answerEntry')
    if (beat.interaction.type !== 'answerEntry') return

    const field = beat.interaction.fields[0]
    const fairDie = [1, 2, 3, 4, 5, 6].map((x) => ({ x: R(x, 1), p: R(1, 6) }))
    const ev = expectedValue(fairDie)

    expect(ev).toEqual(R(7, 2))
    expect(field.accept).toContain('7/2')
    expect(field.accept).toContain(`${ev.n}/${ev.d}`)
  })

  it('ev1-pmf field-1 accept includes "1/9" (= reduce(4, 36))', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev1-pmf')!
    if (beat.interaction.type !== 'answerEntry') return

    const field1 = beat.interaction.fields[0]
    const r = reduce(4, 36)

    expect(r).toEqual(R(1, 9))
    expect(field1.accept).toContain(`${r.n}/${r.d}`)
  })

  it('ev1-pmf field-2 accept "5" matches expectedValue of 3-outcome pmf', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev1-pmf')!
    if (beat.interaction.type !== 'answerEntry') return

    const field2 = beat.interaction.fields[1]
    const pmf = [
      { x: R(3, 1), p: R(1, 4) },
      { x: R(5, 1), p: R(1, 2) },
      { x: R(7, 1), p: R(1, 4) },
    ]
    const ev = expectedValue(pmf)

    expect(ev).toEqual(R(5, 1))
    expect(field2.accept).toContain(String(ev.n))
  })

  it('ev1-prove accept includes "7" and matches expectedValue(twoDiceSum)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev1-prove')!
    expect(beat.interaction.type).toBe('masteryChallenge')
    if (beat.interaction.type !== 'masteryChallenge') return

    const field = beat.interaction.fields[0]
    const twoDiceSum = Array.from({ length: 11 }, (_, k) => {
      const sum = k + 2
      const ways = 6 - Math.abs(7 - sum)
      return { x: R(sum, 1), p: R(ways, 36) }
    })
    const ev = expectedValue(twoDiceSum)

    expect(ev).toEqual(R(7, 1))
    expect(field.accept).toContain('7')
    expect(field.accept).toContain(String(ev.n))
  })
})
