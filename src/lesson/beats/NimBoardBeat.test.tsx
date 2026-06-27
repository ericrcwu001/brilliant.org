// Smoke tests for NimBoardBeat — runs in Node via renderToString.
// No jsdom, no click simulation. Asserts key static structure for nim,
// subtraction, and mismatched-type variants.

import { vi, describe, it, expect } from 'vitest'

// NimBoardBeat has no firebase dep, but mocked for consistency with the suite
// pattern and in case any transitive import ever adds one.
vi.mock('../../firebase/app', () => ({
  getDb: () => Promise.resolve({}),
  getFns: () => Promise.resolve({}),
  auth: {},
  app: {},
  usingEmulators: false,
}))

import { renderToString } from 'react-dom/server'
import { NimBoardBeat } from './NimBoardBeat'
import { buildAutomaton } from '../../engine/automaton'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

const automaton = buildAutomaton('H', 0.5)

const BASE_PROPS: Omit<BeatProps, 'beat' | 'reducedMotion'> = {
  lessonId: 'lesson-game-theory-1',
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

// Nim beat: heaps [3,4,5] → nimSum = 3^4^5 = 2 → first player wins.
const nimBeat: Beat = {
  beatId: 'nim-explore',
  required: false,
  prompt: 'Take any number of tokens from one heap each turn.',
  interaction: {
    type: 'nimBoard',
    heaps: [3, 4, 5],
  },
  feedback: {
    correct: 'Nim-sum 2 — first player wins.',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  },
}

// Subtraction beat: pile 12, maxRemove 3 → 12 % 4 = 0 → losing position.
const subtractionBeat: Beat = {
  beatId: 'sub-explore',
  required: false,
  prompt: 'Take 1–3 tokens; last to take wins.',
  interaction: {
    type: 'nimBoard',
    heaps: [12],
    task: 'subtraction',
    maxRemove: 3,
  },
  feedback: {
    correct: 'A multiple of 4 is a losing position.',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
  },
}

describe('NimBoardBeat', () => {
  describe('nim beat — heaps [3,4,5], reducedMotion true (nim-sum 2, winning)', () => {
    const html = renderToString(
      <NimBoardBeat {...BASE_PROPS} beat={nimBeat} reducedMotion={true} />,
    )

    it('shows the nim-sum 2 in the status', () => {
      expect(html).toContain('nim-sum 2')
    })

    it('shows first-player-wins status', () => {
      expect(html).toContain('first player wins')
    })

    it('has an aria-live region for screen-reader announcements', () => {
      expect(html).toContain('aria-live="polite"')
    })

    it('renders heap labels H1, H2, H3', () => {
      expect(html).toContain('H1')
      expect(html).toContain('H2')
      expect(html).toContain('H3')
    })

    it('shows the winning move hint (reducedMotion reveals it immediately)', () => {
      // reducedMotion=true seeds showMove=true; winMoves([3,4,5]) → reduce H1 to 1.
      expect(html).toContain('Reduce heap 1')
    })
  })

  describe('subtraction beat — heaps [12], maxRemove 3, reducedMotion true (losing)', () => {
    const html = renderToString(
      <NimBoardBeat
        {...BASE_PROPS}
        beat={subtractionBeat}
        reducedMotion={true}
      />,
    )

    it('shows losing status', () => {
      expect(html).toContain('losing position')
    })

    it('shows the multiple-of-4 framing note', () => {
      expect(html).toContain('multiple of 4')
    })

    it('has an aria-live region', () => {
      expect(html).toContain('aria-live="polite"')
    })
  })

  describe('returns null for mismatched interaction type', () => {
    const wrongBeat: Beat = {
      beatId: 'other',
      required: false,
      prompt: 'Not a nim board.',
      interaction: { type: 'recap' },
      feedback: { correct: '', hints: ['', '', ''] },
    }

    it('renders nothing for a mismatched interaction type', () => {
      const html = renderToString(
        <NimBoardBeat
          {...BASE_PROPS}
          beat={wrongBeat}
          reducedMotion={false}
        />,
      )
      expect(html).toBe('')
    })
  })
})
