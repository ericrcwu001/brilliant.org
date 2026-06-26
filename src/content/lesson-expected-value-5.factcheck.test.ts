// Fact-check: verify the lesson-expected-value-5 fixture's graded accept values
// against the exact-rational engine. Catches any drift between authoring and math.

import { describe, it, expect } from 'vitest'
import fixtureJson from '../../fixtures/lesson-expected-value-5.json'
import { LessonSchema } from './schema'
import { harmonic, couponCollector } from '../engine/expectation'
import { ratAdd } from '../engine/automaton'

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

describe('harmonic(6) golden', () => {
  it('harmonic(6) === {n:49, d:20}', () => {
    const r = harmonic(6)
    expect(r.n).toBe(49)
    expect(r.d).toBe(20)
  })
})

describe('couponCollector(6) golden', () => {
  it('couponCollector(6) === {n:147, d:10}', () => {
    const r = couponCollector(6)
    expect(r.n).toBe(147)
    expect(r.d).toBe(10)
  })
})

describe('ev5-prove: full set accept matches couponCollector(6)', () => {
  it('fixture accept contains "147/10"', () => {
    expect(acceptOf('ev5-prove')).toContain('147/10')
  })

  it('couponCollector(6) produces 147/10', () => {
    const r = couponCollector(6)
    expect(`${r.n}/${r.d}`).toBe('147/10')
  })
})

describe('ev5-win: last-stage wait N/(N−k) = 6/(6−5) = 6', () => {
  it('fixture accept contains "6"', () => {
    expect(acceptOf('ev5-win')).toContain('6')
  })

  it('inline stageWait(6, 5) = 6/(6-5) = 6', () => {
    const wait = 6 / (6 - 5)
    expect(wait).toBe(6)
  })
})

describe('ev5-stage: k=2 stage wait N/(N−k) = 6/(6−2) = 3/2', () => {
  it('fixture accept contains "3/2"', () => {
    expect(acceptOf('ev5-stage')).toContain('3/2')
  })

  it('inline stageWait(6, 2) = 6/(6-2) = 3/2', () => {
    const num = 6
    const den = 6 - 2
    expect(num).toBe(6)
    expect(den).toBe(4)
    expect(num / den).toBeCloseTo(1.5)
  })
})

describe('six stage waits sum to couponCollector(6)', () => {
  it('ratAdd of stageWait(6, k) for k=0..5 equals {n:147, d:10}', () => {
    // stageWait(6, k) = 6/(6-k) for k=0..5
    const stageWaits = [0, 1, 2, 3, 4, 5].map((k) => ({
      n: 6,
      d: 6 - k,
    }))
    const sum = stageWaits.reduce(
      (acc, r) => ratAdd(acc, r),
      { n: 0, d: 1 },
    )
    const cc = couponCollector(6)
    // Both should reduce to 147/10
    expect(sum.n * cc.d).toBe(cc.n * sum.d)
  })
})
