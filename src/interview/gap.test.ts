// Tests for the practice-vs-performance gap helpers (spec-22 §3.3/§3.4).
import { describe, it, expect } from 'vitest'
import type { Course } from '../content/schema'
import {
  computeInAppAccuracy,
  conceptLessonIds,
  interviewAccuracyFromScore,
  MIN_LESSONS,
} from './gap'

type ProgressLike = Parameters<typeof computeInAppAccuracy>[0][number]

const completed = (mastered: boolean): ProgressLike => ({
  completionStatus: 'completed',
  derived: { mastered },
})
const inProgress: ProgressLike = { completionStatus: 'in_progress' }

describe('computeInAppAccuracy', () => {
  it('returns null for an empty list', () => {
    expect(computeInAppAccuracy([])).toBeNull()
  })

  it('returns null below MIN_LESSONS completed', () => {
    expect(computeInAppAccuracy([completed(true), completed(true)])).toBeNull()
    expect(MIN_LESSONS).toBe(3)
  })

  it('returns 1.0 when all 3 completed lessons are mastered first-try', () => {
    expect(computeInAppAccuracy([completed(true), completed(true), completed(true)])).toBe(1.0)
  })

  it('returns 0.5 for 4 completed, 2 mastered', () => {
    expect(
      computeInAppAccuracy([completed(true), completed(true), completed(false), completed(false)]),
    ).toBe(0.5)
  })

  it('returns 0.0 when no completed lessons are mastered', () => {
    expect(computeInAppAccuracy([completed(false), completed(false), completed(false)])).toBe(0.0)
  })

  it('ignores in_progress lessons (only completed count toward the denominator)', () => {
    // 3 completed (2 mastered) + 2 in_progress ⇒ 2/3, not 2/5.
    expect(
      computeInAppAccuracy([
        completed(true),
        completed(true),
        completed(false),
        inProgress,
        inProgress,
      ]),
    ).toBeCloseTo(2 / 3)
  })
})

describe('conceptLessonIds', () => {
  function course(partial: Partial<Course>): Course {
    return {
      courseId: 'c',
      title: 't',
      description: 'd',
      persona: 'p',
      lessons: [],
      roadmap: [],
      completionMilestoneId: 'm',
      schemaVersion: 1,
      ...partial,
    } as Course
  }

  it('collects course.lessons[].lessonId', () => {
    const c = course({
      lessons: [
        { lessonId: 'l1', title: 'a', summary: 's', milestoneId: 'm', built: true },
        { lessonId: 'l2', title: 'b', summary: 's', milestoneId: 'm', built: true },
      ],
    })
    expect(conceptLessonIds(c)).toEqual(new Set(['l1', 'l2']))
  })

  it('unions chapter lessonIds when chapters are present, deduped', () => {
    const c = course({
      lessons: [{ lessonId: 'l1', title: 'a', summary: 's', milestoneId: 'm', built: true }],
      chapters: [
        { id: 'ch1', label: 'Ch1', accent: '#000', lessonIds: ['l1', 'l3'] },
        { id: 'ch2', label: 'Ch2', accent: '#000', lessonIds: ['l4'] },
      ],
    })
    const ids = conceptLessonIds(c)
    expect(ids).toEqual(new Set(['l1', 'l3', 'l4']))
    expect(ids.size).toBe(3) // no duplicate l1
  })

  it("excludes another concept's lessonId (the concept-scoping guard)", () => {
    const c = course({
      lessons: [{ lessonId: 'mine', title: 'a', summary: 's', milestoneId: 'm', built: true }],
    })
    expect(conceptLessonIds(c).has('other-concept-lesson')).toBe(false)
  })
})

describe('interviewAccuracyFromScore', () => {
  it('maps a 1–5 score to [0,1] (display-only bar proxy)', () => {
    expect(interviewAccuracyFromScore(5)).toBe(1.0)
    expect(interviewAccuracyFromScore(3)).toBeCloseTo(0.6)
    expect(interviewAccuracyFromScore(1)).toBeCloseTo(0.2)
  })
})
