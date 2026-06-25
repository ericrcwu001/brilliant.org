// Smoke tests for HandRankerBeat via react-dom/server renderToString.
// NODE env — no jsdom, no click simulation. Asserts static initial-render output.

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

vi.mock('../../firebase/app', () => ({
  app: {},
  auth: {},
  db: {},
  functions: {},
  usingEmulators: false,
  getDb: () => ({}),
}))
vi.mock('../../analytics/events', () => ({
  analytics: {
    answerSubmitted: () => {},
    hintRevealed: () => {},
    lessonStarted: () => {},
    lessonCompleted: () => {},
    beatCompleted: () => {},
  },
}))

vi.mock('../useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }))

import { HandRankerBeat } from './HandRankerBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(
  interaction: Beat['interaction'],
  overrides: Partial<Beat> = {},
): Beat {
  return {
    beatId: 'l6-rank',
    required: true,
    prompt: 'Rank these two hands from rarest to most common.',
    interaction,
    feedback: {
      correct: 'Right — same denominator (4165), so the bigger top wins.',
      hints: [
        'Bigger numerator means *more* common, not rarer.',
        'Four of a kind: 1/4165. Full house: 6/4165.',
        'Rarest first: four of a kind (1/4165), then full house (6/4165).',
      ],
    },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-combinatorics-6',
  pattern: 'H',
  patternOptions: ['H'],
  automaton: {
    pattern: 'H',
    p: 0.5,
    states: [],
    transitions: [],
    recurrences: {} as BeatProps['automaton']['recurrences'],
    expectedTimes: {} as BeatProps['automaton']['expectedTimes'],
    substitutionSteps: [],
    overlapHighlights: [],
  },
  reducedMotion: false,
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

const rankBeat = makeBeat({
  type: 'handRanker',
  hands: [
    { label: 'Four of a kind', favorable: 624 },
    { label: 'Full house', favorable: 3744 },
  ],
  total: 2598960,
  order: 'rarestFirst',
})

describe('HandRankerBeat smoke', () => {
  describe('initial render', () => {
    it('renders without throwing', () => {
      expect(() =>
        renderToString(
          React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
        ),
      ).not.toThrow()
    })

    it('contains aria-live="polite" region', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('aria-live="polite"')
    })

    it('renders both hand card labels', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('Four of a kind')
      expect(html).toContain('Full house')
    })

    it('renders the reduced fraction 1/4165 for four-of-a-kind', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('1/4165')
    })

    it('renders the reduced fraction 6/4165 for full house', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('6/4165')
    })

    it('renders ranked slots (Rarest and More common labels)', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('Rarest')
      expect(html).toContain('More common')
    })

    it('renders card buttons (hand source pile)', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      // Each hand card is a button element.
      const buttonCount = (html.match(/<button/g) ?? []).length
      // At least 2 hand cards + primary action button.
      expect(buttonCount).toBeGreaterThanOrEqual(3)
    })

    it('renders the Check button (graded, unsubmitted)', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('Check')
    })

    it('renders the Reset button', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('Reset')
    })

    it('hand cards have aria-label attributes with fractions', () => {
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat: rankBeat }),
      )
      expect(html).toContain('Four of a kind, 1/4165')
      expect(html).toContain('Full house, 6/4165')
    })
  })

  describe('returns null for wrong interaction type', () => {
    it('renders empty for a non-handRanker beat', () => {
      const beat = makeBeat({ type: 'recap' })
      const html = renderToString(
        React.createElement(HandRankerBeat, { ...baseProps, beat }),
      )
      expect(html).toBe('')
    })
  })
})
