// Fact-check: verify the lesson-expected-value-2 fixture's graded accept values
// against the exact-rational engine. Catches any drift between authoring and math.

import { describe, it, expect } from 'vitest'
import fixtureJson from '../../fixtures/lesson-expected-value-2.json'
import { LessonSchema } from './schema'
import { expectedValue, noodleLoops } from '../engine/expectation'

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

describe('ev2-win: E[X+Y] two fair dice via expectedValue', () => {
  it('engine returns 7/1 (= 7)', () => {
    const counts = new Map<number, number>()
    for (let a = 1; a <= 6; a++) {
      for (let b = 1; b <= 6; b++) {
        const s = a + b
        counts.set(s, (counts.get(s) ?? 0) + 1)
      }
    }
    const pmf = Array.from(counts.entries()).map(([s, c]) => ({
      x: { n: s, d: 1 },
      p: { n: c, d: 36 },
    }))
    const r = expectedValue(pmf)
    expect(r.n).toBe(7)
    expect(r.d).toBe(1)
  })

  it('fixture accept contains "7"', () => {
    expect(acceptOf('ev2-win')).toContain('7')
  })
})

describe('ev2-noodles: E[loops] n=2 via noodleLoops', () => {
  it('noodleLoops(2) = 4/3', () => {
    const r = noodleLoops(2)
    expect(r.n).toBe(4)
    expect(r.d).toBe(3)
  })

  it('fixture accept contains "4/3"', () => {
    expect(acceptOf('ev2-noodles')).toContain('4/3')
  })
})

describe('ev2-prove: E[loops] n=3 via noodleLoops', () => {
  it('noodleLoops(3) = 23/15', () => {
    const r = noodleLoops(3)
    expect(r.n).toBe(23)
    expect(r.d).toBe(15)
  })

  it('fixture accept contains "23/15"', () => {
    expect(acceptOf('ev2-prove')).toContain('23/15')
  })
})
