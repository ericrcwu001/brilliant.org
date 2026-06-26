// Fact-check: verify the lesson-expected-value-6 fixture's graded accept values
// against the exact-rational engine. Catches any drift between authoring and math.

import { describe, it, expect } from 'vitest'
import fixtureJson from '../../fixtures/lesson-expected-value-6.json'
import { LessonSchema } from './schema'
import { orderStatUniform } from '../engine/expectation'

const lesson = LessonSchema.parse(fixtureJson)

function acceptOf(beatId: string): string[] {
  const beat = lesson.beats.find(b => b.beatId === beatId)
  if (!beat) throw new Error(`beat ${beatId} not found`)
  const it = beat.interaction
  if (it.type === 'answerEntry' || it.type === 'masteryChallenge') {
    return it.fields.flatMap(f => f.accept)
  }
  throw new Error(`beat ${beatId} has no accept list (type: ${it.type})`)
}

describe('ev6-win: E[max] and E[min] for n=2 draws', () => {
  it('orderStatUniform(2).max equals {n:2, d:3} = 2/3', () => {
    const r = orderStatUniform(2)
    expect(r.max).toEqual({ n: 2, d: 3 })
  })

  it('fixture ev6-win accepts "2/3" for E[max of 2 draws]', () => {
    expect(acceptOf('ev6-win')).toContain('2/3')
  })

  it('orderStatUniform(2).min equals {n:1, d:3} = 1/3', () => {
    const r = orderStatUniform(2)
    expect(r.min).toEqual({ n: 1, d: 3 })
  })

  it('fixture ev6-win accepts "1/3" for E[min of 2 draws]', () => {
    expect(acceptOf('ev6-win')).toContain('1/3')
  })
})

describe('ev6-min: E[min] for n=4 draws', () => {
  it('orderStatUniform(4).min equals {n:1, d:5} = 1/5', () => {
    const r = orderStatUniform(4)
    expect(r.min).toEqual({ n: 1, d: 5 })
  })

  it('fixture ev6-min accepts "1/5"', () => {
    expect(acceptOf('ev6-min')).toContain('1/5')
  })
})

describe('ev6-prove: E[max] for n=500 draws (ants clearing time)', () => {
  it('orderStatUniform(500).max equals {n:500, d:501} = 500/501', () => {
    const r = orderStatUniform(500)
    expect(r.max).toEqual({ n: 500, d: 501 })
  })

  it('fixture ev6-prove accepts "500/501"', () => {
    expect(acceptOf('ev6-prove')).toContain('500/501')
  })
})
