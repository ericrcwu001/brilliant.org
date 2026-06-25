import { describe, it, expect, vi } from 'vitest'
import type { Progress } from '../content/schema'

// milestones.ts imports firebase/app at the module level.
// Mock it out so the pure isMilestoneMastered helper can be tested without
// a live Firebase project or env vars.
vi.mock('../firebase/app', () => ({
  getDb: () => Promise.resolve({}),
  getFns: () => Promise.resolve({}),
  auth: {},
  app: {},
  usingEmulators: false,
}))

import { isMilestoneMastered } from './milestones'

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
