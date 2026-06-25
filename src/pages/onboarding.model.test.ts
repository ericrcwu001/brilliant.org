import { describe, it, expect } from 'vitest'
import {
  comfortToDefaultTrack,
  focusAreaOptions,
  recommendConcept,
  type ComfortLevel,
} from './onboarding.model'
import { COURSE_ID } from '../content/courseIds'
import type { Course } from '../content/schema'

// Minimal valid Course factory — only fields read by onboarding.model need real values.
function makeCourse(
  courseId: string,
  overrides: Partial<Course> = {},
): Course {
  return {
    courseId,
    title: courseId,
    description: `Description for ${courseId}`,
    persona: 'explorer',
    lessons: [],
    roadmap: [],
    completionMilestoneId: 'c-main',
    schemaVersion: 1,
    ...overrides,
  }
}

// ── comfortToDefaultTrack ─────────────────────────────────────────────────────

describe('comfortToDefaultTrack', () => {
  const cases: [ComfortLevel, 'A' | 'B'][] = [
    ['new', 'A'],
    ['dabbled', 'A'],
    ['comfortable', 'B'],
    ['confident', 'B'],
  ]

  for (const [level, expected] of cases) {
    it(`${level} → Track ${expected}`, () => {
      expect(comfortToDefaultTrack(level)).toBe(expected)
    })
  }
})

// ── focusAreaOptions ──────────────────────────────────────────────────────────

describe('focusAreaOptions', () => {
  it('returns distinct domains sorted by domainOrder ascending', () => {
    const courses = [
      makeCourse('c1', { domain: 'Probability', domainOrder: 2 }),
      makeCourse('c2', { domain: 'Combinatorics & Games', domainOrder: 1 }),
      makeCourse('c3', { domain: 'Probability', domainOrder: 2 }),
    ]
    expect(focusAreaOptions(courses)).toEqual(['Combinatorics & Games', 'Probability'])
  })

  it('uses the lowest domainOrder when a domain appears multiple times with different orders', () => {
    const courses = [
      makeCourse('c1', { domain: 'Math', domainOrder: 5 }),
      makeCourse('c2', { domain: 'Math', domainOrder: 2 }),
    ]
    const options = focusAreaOptions(courses)
    expect(options).toEqual(['Math'])
    // The order value for Math should be 2 (lower), verified by sorting below.
  })

  it('courses with no domain are excluded', () => {
    const courses = [
      makeCourse('c1', { domain: undefined, domainOrder: 1 }),
      makeCourse('c2', { domain: 'Probability', domainOrder: 2 }),
    ]
    expect(focusAreaOptions(courses)).toEqual(['Probability'])
  })

  it('returns empty array for empty course list', () => {
    expect(focusAreaOptions([])).toEqual([])
  })

  it('missing domainOrder defaults to 999 for sorting purposes', () => {
    const courses = [
      makeCourse('c1', { domain: 'Z Domain', domainOrder: undefined }),
      makeCourse('c2', { domain: 'A Domain', domainOrder: 1 }),
    ]
    expect(focusAreaOptions(courses)).toEqual(['A Domain', 'Z Domain'])
  })
})

// ── recommendConcept ──────────────────────────────────────────────────────────

describe('recommendConcept', () => {
  it('returns the first live concept in the focus area sorted by order', () => {
    const courses = [
      makeCourse('c-prob-2', { domain: 'Probability', order: 2, status: 'live' }),
      makeCourse('c-prob-1', { domain: 'Probability', order: 1, status: 'live' }),
      makeCourse('c-combo', { domain: 'Combinatorics', order: 1, status: 'live' }),
    ]
    expect(recommendConcept(courses, 'Probability')).toBe('c-prob-1')
  })

  it('skips coming_soon concepts and picks the first live one', () => {
    const courses = [
      makeCourse('c-soon', { domain: 'Probability', order: 1, status: 'coming_soon' }),
      makeCourse('c-live', { domain: 'Probability', order: 2, status: 'live' }),
    ]
    expect(recommendConcept(courses, 'Probability')).toBe('c-live')
  })

  it('falls back to COURSE_ID when all focus-area concepts are coming_soon', () => {
    const courses = [
      makeCourse('c-soon', { domain: 'Probability', order: 1, status: 'coming_soon' }),
    ]
    expect(recommendConcept(courses, 'Probability')).toBe(COURSE_ID)
  })

  it('falls back to COURSE_ID when the focus area has no matching courses', () => {
    const courses = [
      makeCourse('c-combo', { domain: 'Combinatorics', order: 1, status: 'live' }),
    ]
    expect(recommendConcept(courses, 'Probability')).toBe(COURSE_ID)
  })

  it('falls back to COURSE_ID for an empty course list', () => {
    expect(recommendConcept([], 'Probability')).toBe(COURSE_ID)
  })

  it('uses order ?? 999 for sorting when order is absent', () => {
    const courses = [
      makeCourse('c-no-order', { domain: 'Probability', order: undefined, status: 'live' }),
      makeCourse('c-order-1', { domain: 'Probability', order: 1, status: 'live' }),
    ]
    expect(recommendConcept(courses, 'Probability')).toBe('c-order-1')
  })
})
