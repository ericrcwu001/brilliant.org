import { describe, it, expect } from 'vitest'
import lessonFixture from '../../fixtures/lesson-pattern-hitting-times.json'
import { LessonSchema, type Beat } from '../content/schema'
import {
  bumpMaxHintLevel,
  computeMastered,
  gradedRequiredBeatIds,
} from './mastery'

const lesson = LessonSchema.parse(lessonFixture)
const beats = lesson.beats as Beat[]

describe('gradedRequiredBeatIds', () => {
  it('selects only the required graded beats (L1: failure-edge + equation-tiles)', () => {
    expect(gradedRequiredBeatIds(beats)).toEqual(['failure-edge', 'equation-tiles'])
  })
})

describe('computeMastered (L1 §9)', () => {
  it('is true when every graded beat was first-try-correct (high-water mark 0)', () => {
    expect(computeMastered(beats, {})).toBe(true)
    expect(
      computeMastered(beats, { 'failure-edge': 0, 'equation-tiles': 0 }),
    ).toBe(true)
  })

  it('is false when any graded beat ever needed a hint', () => {
    expect(computeMastered(beats, { 'failure-edge': 1 })).toBe(false)
    expect(computeMastered(beats, { 'equation-tiles': 3 })).toBe(false)
  })

  it('ignores non-graded beats (a hinted slider does not block mastery)', () => {
    expect(computeMastered(beats, { 'refine-prediction': 3 })).toBe(true)
  })

  it('is false when there are no graded beats', () => {
    expect(computeMastered([], {})).toBe(false)
  })
})

describe('bumpMaxHintLevel (hint high-water mark, L1 §3.4)', () => {
  it('keeps the maximum level ever reached per beat', () => {
    let m: Record<string, number> = {}
    m = bumpMaxHintLevel(m, 'b', 1)
    m = bumpMaxHintLevel(m, 'b', 2)
    expect(m.b).toBe(2)
    // A later reset to 0 (correct submit) must NOT lower the high-water mark.
    m = bumpMaxHintLevel(m, 'b', 0)
    expect(m.b).toBe(2)
  })

  it('returns the same reference when the level does not exceed the current max', () => {
    const m = { b: 2 }
    expect(bumpMaxHintLevel(m, 'b', 1)).toBe(m)
  })
})
