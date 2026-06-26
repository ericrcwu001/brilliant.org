// Fact-check: verify the lesson-expected-value-4 fixture's graded accept values
// against the exact-rational engine. Catches any drift between authoring and math.

import { describe, it, expect } from 'vitest'
import fixtureJson from '../../fixtures/lesson-expected-value-4.json'
import { LessonSchema } from './schema'
import { totalExpectation } from '../engine/expectation'

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

describe('ev4-win: coin-die bet via totalExpectation (literal)', () => {
  it('engine returns 7/4', () => {
    const r = totalExpectation([
      { p: { n: 1, d: 2 }, value: { n: 7, d: 2 } },
      { p: { n: 1, d: 2 }, value: { n: 0, d: 1 } },
    ])
    expect(r.n).toBe(7)
    expect(r.d).toBe(4)
  })

  it('fixture accept contains "7/4"', () => {
    expect(acceptOf('ev4-win')).toContain('7/4')
  })
})

describe('ev4-prove: dice game via totalExpectation (self-referential)', () => {
  it('engine returns 7 (n=7, d=1)', () => {
    const r = totalExpectation([
      { p: { n: 1, d: 2 }, value: { n: 2, d: 1 } },
      { p: { n: 1, d: 2 }, restart: { add: { n: 5, d: 1 } } },
    ])
    expect(r.n).toBe(7)
    expect(r.d).toBe(1)
  })

  it('fixture accept contains "7"', () => {
    expect(acceptOf('ev4-prove')).toContain('7')
  })
})

describe('ev4-explore: conditionalTree cases recompute to E[X]=7', () => {
  it('ev4-explore interaction is conditionalTree', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev4-explore')
    expect(beat?.interaction.type).toBe('conditionalTree')
  })

  it('totalExpectation(ev4-explore cases) = 7', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev4-explore')
    if (!beat || beat.interaction.type !== 'conditionalTree') {
      throw new Error('ev4-explore must be conditionalTree')
    }
    const r = totalExpectation(beat.interaction.cases)
    expect(r.n).toBe(7)
    expect(r.d).toBe(1)
  })

  it('ev4-explore has no accept list (UNGRADED in L4)', () => {
    const beat = lesson.beats.find((b) => b.beatId === 'ev4-explore')
    if (!beat || beat.interaction.type !== 'conditionalTree') {
      throw new Error('ev4-explore must be conditionalTree')
    }
    expect(beat.interaction.accept).toBeUndefined()
  })
})
