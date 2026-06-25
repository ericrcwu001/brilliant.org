// Smoke tests for CountingTreeBeat — runs in Node via renderToString.
// No jsdom, no click simulation. Asserts key static structure for graded,
// ungraded, and hero+reducedMotion variants.

import { vi, describe, it, expect } from 'vitest'

// CountingTreeBeat → useHintLadder → analytics/events → firebase/app.
// Mock out the firebase module so the pure rendering path is testable in Node.
vi.mock('../../firebase/app', () => ({
  getDb: () => Promise.resolve({}),
  getFns: () => Promise.resolve({}),
  auth: {},
  app: {},
  usingEmulators: false,
}))

import { renderToString } from 'react-dom/server'
import { CountingTreeBeat } from './CountingTreeBeat'
import { buildAutomaton } from '../../engine/automaton'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

const automaton = buildAutomaton('H', 0.5)

const BASE_PROPS: Omit<BeatProps, 'beat' | 'reducedMotion'> = {
  lessonId: 'lesson-combinatorics-1',
  pattern: 'H',
  patternOptions: ['H'],
  automaton,
  density: 'merged',
  isLast: false,
  onAdvance: () => {},
  reportNeedsReview: () => {},
  needsReview: false,
  lessonState: {},
  setLessonState: () => {},
  milestone: null,
  lessonComplete: false,
}

// Graded beat (l1-win shape) — hero + reducedMotion → all levels start expanded.
const gradedBeat: Beat = {
  beatId: 'l1-win',
  required: true,
  prompt: 'Tap each level to expand the flip tree.',
  interaction: {
    type: 'countingTree',
    levels: [
      { label: 'Flip 1', options: 2 },
      { label: 'Flip 2', options: 2 },
      { label: 'Flip 3', options: 2 },
    ],
    accept: ['8'],
  },
  feedback: {
    correct: 'Right — 2×2×2 = 8.',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  },
  hero: {
    slowFirst: true,
    structuralReadout: 'Each tap doubles the running count.',
    reducedMotionFinalFrame: true,
  },
}

// Ungraded beat (l1-explore shape) — no hero, levels start collapsed.
const ungradedBeat: Beat = {
  beatId: 'l1-explore',
  required: true,
  prompt: 'Tap the outfit tree.',
  interaction: {
    type: 'countingTree',
    levels: [
      { label: 'Shirt color', options: 2 },
      { label: 'Pant style', options: 3 },
      { label: 'Shoe type', options: 2 },
    ],
  },
  feedback: {
    correct: '2×3×2 = 12.',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  },
}

// Beat with introducesSymbol (l1-model shape) — hero+reducedMotion → expanded.
const notationBeat: Beat = {
  beatId: 'l1-model',
  required: true,
  prompt: 'Tap the seating tree.',
  introducesSymbol: 'n!',
  groundedBy: ['l1-win', 'l1-explore'],
  interaction: {
    type: 'countingTree',
    levels: [
      { label: 'Person 1 (3 spots)', options: 3 },
      { label: 'Person 2 (2 spots)', options: 2 },
      { label: 'Person 3 (1 spot)', options: 1 },
    ],
  },
  feedback: {
    correct: '3×2×1 = 6 = 3!',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  },
  hero: {
    slowFirst: true,
    structuralReadout: '3×2×1 = 6.',
    reducedMotionFinalFrame: true,
  },
}

describe('CountingTreeBeat', () => {
  describe('graded beat — hero + reducedMotion (fully expanded on SSR)', () => {
    const html = renderToString(
      <CountingTreeBeat
        {...BASE_PROPS}
        beat={gradedBeat}
        reducedMotion={true}
      />,
    )

    it('renders all level labels', () => {
      expect(html).toContain('Flip 1')
      expect(html).toContain('Flip 2')
      expect(html).toContain('Flip 3')
    })

    it('shows the running-product readout with the final product', () => {
      expect(html).toContain('Running total: 8')
    })

    it('has an aria-live region for screen-reader product announcements', () => {
      expect(html).toContain('aria-live="polite"')
    })

    it('shows the answer input when graded and all levels expanded', () => {
      expect(html).toContain('Enter the total count')
    })

    it('labels the input for accessibility', () => {
      expect(html).toContain('aria-label="Enter the total count"')
    })
  })

  describe('ungraded beat — no hero, levels start collapsed', () => {
    const html = renderToString(
      <CountingTreeBeat
        {...BASE_PROPS}
        beat={ungradedBeat}
        reducedMotion={false}
      />,
    )

    it('renders all level labels', () => {
      expect(html).toContain('Shirt color')
      expect(html).toContain('Pant style')
      expect(html).toContain('Shoe type')
    })

    it('does not show an answer input (no accept)', () => {
      expect(html).not.toContain('Enter the total count')
    })

    it('has an aria-live region present but no product shown (nothing expanded)', () => {
      expect(html).toContain('aria-live="polite"')
    })

    it('does not show a running product when no levels are expanded', () => {
      expect(html).not.toContain('Running total:')
    })
  })

  describe('notation beat — hero + reducedMotion + introducesSymbol', () => {
    const html = renderToString(
      <CountingTreeBeat
        {...BASE_PROPS}
        beat={notationBeat}
        reducedMotion={true}
      />,
    )

    it('renders all level labels', () => {
      expect(html).toContain('Person 1 (3 spots)')
      expect(html).toContain('Person 2 (2 spots)')
      expect(html).toContain('Person 3 (1 spot)')
    })

    it('shows the running product for 3×2×1 = 6', () => {
      expect(html).toContain('Running total: 6')
    })

    it('shows the notation badge when all levels expanded', () => {
      expect(html).toContain('= n!')
    })

    it('does not show an answer input (no accept)', () => {
      expect(html).not.toContain('Enter the total count')
    })
  })

  describe('returns null for non-countingTree beats', () => {
    const wrongBeat: Beat = {
      beatId: 'other',
      required: false,
      prompt: 'Not a tree.',
      interaction: { type: 'recap' },
      feedback: { correct: '', hints: ['', '', ''] },
    }

    it('renders nothing for a mismatched interaction type', () => {
      const html = renderToString(
        <CountingTreeBeat
          {...BASE_PROPS}
          beat={wrongBeat}
          reducedMotion={false}
        />,
      )
      expect(html).toBe('')
    })
  })
})
