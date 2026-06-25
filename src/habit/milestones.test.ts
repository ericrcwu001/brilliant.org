import { describe, it, expect, vi } from 'vitest'
import { CourseSchema, type Course, type Progress } from '../content/schema'
import flagshipFixture from '../../fixtures/course-pattern-hitting-times.json'

// milestones.ts imports firebase/app at the module level.
// Mock it out so the pure helpers can be tested without a live Firebase
// project or env vars.
vi.mock('../firebase/app', () => ({
  getDb: () => Promise.resolve({}),
  getFns: () => Promise.resolve({}),
  auth: {},
  app: {},
  usingEmulators: false,
}))

import {
  isMilestoneMastered,
  isMilestoneMasteredForCourse,
  conceptBadges,
} from './milestones'

const flagship = CourseSchema.parse(flagshipFixture)

// A non-flagship concept (its own lessons/chapters/completion milestone).
const bayes: Course = {
  courseId: 'course-bayes-rule',
  title: "Bayes' Rule",
  description: 'd',
  persona: 'p',
  completionMilestoneId: 'bayes-rule-complete',
  schemaVersion: 1,
  roadmap: [],
  accent: 'ch2',
  chapters: [
    { id: 'c1', label: 'A', accent: 'ch1', lessonIds: ['lesson-bayes-rule-1'] },
    { id: 'c2', label: 'B', accent: 'ch4', lessonIds: ['lesson-bayes-rule-2'] },
  ],
  lessons: [
    {
      lessonId: 'lesson-bayes-rule-1',
      title: 'The Update Rule',
      summary: 's',
      milestoneId: 'bayes-rule-update',
      built: true,
      glyphKey: '2/3',
    },
    {
      lessonId: 'lesson-bayes-rule-2',
      title: 'The Base-Rate Trap',
      summary: 's',
      milestoneId: 'bayes-rule-base-rate',
      built: true,
      glyphKey: '1%',
    },
  ],
}

const aced: Progress = {
  completionStatus: 'completed',
  derived: { mastered: true },
}

describe('isMilestoneMastered', () => {
  it('gold when the milestone lesson was aced (derived.mastered)', () => {
    expect(
      isMilestoneMastered('hh-ht-mastered', {
        'lesson-pattern-hitting-times': aced,
      }),
    ).toBe(true)
  })

  it('not gold when completed without acing', () => {
    expect(
      isMilestoneMastered('hh-ht-mastered', {
        'lesson-pattern-hitting-times': {
          completionStatus: 'completed',
          needsReview: true,
        },
      }),
    ).toBe(false)
  })

  it('aggregate is gold only when every constituent lesson is aced', () => {
    const partial: Record<string, Progress> = {
      'lesson-pattern-hitting-times': aced,
      'lesson-penneys-game': aced,
      'lesson-gamblers-ruin': { completionStatus: 'completed' },
    }
    expect(isMilestoneMastered('three-lessons-complete', partial)).toBe(false)
    partial['lesson-gamblers-ruin'] = aced
    expect(isMilestoneMastered('three-lessons-complete', partial)).toBe(true)
  })

  it('locked / unknown milestone is not mastered', () => {
    expect(isMilestoneMastered('hh-ht-mastered', {})).toBe(false)
    expect(isMilestoneMastered('does-not-exist', {})).toBe(false)
  })
})

describe('conceptBadges', () => {
  it('flagship keeps its hand-authored, interleaved sequence + capstone', () => {
    const badges = conceptBadges(flagship)
    expect(badges.map((b) => b.meta.id)).toEqual([
      'hh-ht-mastered',
      'penneys-game-won',
      'gamblers-ruin-solved',
      'three-lessons-complete',
      'first-pattern-cracked',
      'state-machine-builder',
      'martingale-mastered',
      'six-lessons-complete',
    ])
    expect(badges.filter((b) => b.capstone).map((b) => b.meta.id)).toEqual([
      'six-lessons-complete',
    ])
    expect(badges[0].hueVar).toBe('ch1') // hh-ht-mastered
  })

  it('derives a distinct badge set from a non-flagship concept own lessons', () => {
    const badges = conceptBadges(bayes)
    expect(badges.map((b) => b.meta.id)).toEqual([
      'bayes-rule-update',
      'bayes-rule-base-rate',
      'bayes-rule-complete',
    ])
    // No Pattern-Hitting-Times milestones leak into another concept.
    expect(badges.some((b) => b.meta.id === 'hh-ht-mastered')).toBe(false)
    // Per-lesson titles + glyphs come from the concept's own course nodes.
    expect(badges[0].meta).toEqual({
      id: 'bayes-rule-update',
      title: 'The Update Rule',
      glyph: '2/3',
    })
    // Hues track each lesson's chapter accent; completion is the brand capstone.
    expect(badges.map((b) => b.hueVar)).toEqual(['ch1', 'ch4', 'ergo-brand'])
    expect(badges.map((b) => b.capstone)).toEqual([false, false, true])
    expect(badges[2].meta.title).toBe("Bayes' Rule mastered")
  })
})

describe('isMilestoneMasteredForCourse', () => {
  it('per-lesson milestone is gold only when that lesson was aced', () => {
    expect(
      isMilestoneMasteredForCourse(bayes, 'bayes-rule-update', {
        'lesson-bayes-rule-1': aced,
      }),
    ).toBe(true)
    expect(isMilestoneMasteredForCourse(bayes, 'bayes-rule-update', {})).toBe(
      false,
    )
  })

  it('completion milestone is gold only when every required lesson is aced', () => {
    const partial: Record<string, Progress> = {
      'lesson-bayes-rule-1': aced,
      'lesson-bayes-rule-2': { completionStatus: 'completed' },
    }
    expect(
      isMilestoneMasteredForCourse(bayes, 'bayes-rule-complete', partial),
    ).toBe(false)
    partial['lesson-bayes-rule-2'] = aced
    expect(
      isMilestoneMasteredForCourse(bayes, 'bayes-rule-complete', partial),
    ).toBe(true)
  })

  it('falls back to the flagship aggregate map for hand-authored marks', () => {
    const allAced: Record<string, Progress> = Object.fromEntries(
      [
        'lesson-pattern-hitting-times',
        'lesson-penneys-game',
        'lesson-gamblers-ruin',
      ].map((id) => [id, aced]),
    )
    expect(
      isMilestoneMasteredForCourse(flagship, 'three-lessons-complete', allAced),
    ).toBe(true)
  })
})
