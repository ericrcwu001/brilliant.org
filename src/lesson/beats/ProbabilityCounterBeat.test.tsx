// Smoke tests for ProbabilityCounterBeat via react-dom/server renderToString.
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

import { ProbabilityCounterBeat } from './ProbabilityCounterBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(
  interaction: Beat['interaction'],
  overrides: Partial<Beat> = {},
): Beat {
  return {
    beatId: 'pc-test',
    required: false,
    prompt: 'Tap chips to build the count.',
    interaction,
    feedback: {
      correct: '13 · 4 · 12 · 6 = 3744. P = 6/4165.',
      hints: ['Tap each chip.', '13 · 4 · 12 · 6 = 3744.', '3744 / 2598960 = 6/4165.'],
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

const exploreBeat = makeBeat(
  {
    type: 'probabilityCounter',
    factors: [
      { label: 'Triple rank (13 choices)', value: 13 },
      { label: 'Triple suits C(4,3)', value: 4 },
      { label: 'Pair rank (12 choices)', value: 12 },
      { label: 'Pair suits C(4,2)', value: 6 },
    ],
    total: 2598960,
  },
  {
    hero: {
      slowFirst: true,
      structuralReadout: '3744 / 2,598,960 → 6 / 4165',
      reducedMotionFinalFrame: true,
    },
  },
)

const scaffoldBeat = makeBeat({
  type: 'probabilityCounter',
  factors: [
    { label: 'Choose 2 ranks C(13,2)', value: 78 },
    { label: 'Rank-1 suits C(4,2)', value: 6 },
    { label: 'Rank-2 suits C(4,2)', value: 6 },
    { label: 'Kicker (44 cards)', value: 44 },
  ],
  total: 2598960,
})

describe('ProbabilityCounterBeat smoke', () => {
  describe('initial render (no chips selected)', () => {
    it('renders without throwing', () => {
      expect(() =>
        renderToString(
          React.createElement(ProbabilityCounterBeat, {
            ...baseProps,
            beat: exploreBeat,
          }),
        ),
      ).not.toThrow()
    })

    it('contains aria-live="polite" region', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      expect(html).toContain('aria-live="polite"')
    })

    it('renders 4 chip buttons with aria-pressed', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      const pressedCount = (html.match(/aria-pressed=/g) ?? []).length
      expect(pressedCount).toBe(4)
    })

    it('chips start with aria-pressed="false" when no hero/reduced-motion', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      expect(html).toContain('aria-pressed="false"')
      expect(html).not.toContain('aria-pressed="true"')
    })

    it('shows chip labels in the output', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      // React SSR inserts <!-- --> between adjacent JS expressions, so check
      // label and presence of each separately rather than as a joined string.
      expect(html).toContain('Triple rank (13 choices)')
      expect(html).toContain('Triple suits C(4,3)')
      expect(html).toContain('Pair rank (12 choices)')
      expect(html).toContain('Pair suits C(4,2)')
    })

    it('shows the Continue button (ungraded)', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      expect(html).toContain('Continue')
    })

    it('shows the total denominator in the fraction display', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      expect(html).toContain('2,598,960')
    })
  })

  describe('reduced-motion final frame (hero beat + reduced motion)', () => {
    it('renders all chips aria-pressed="true" in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )

      // All 4 chips should be pressed in reduced-motion + hero mode.
      const trueCount = (html.match(/aria-pressed="true"/g) ?? []).length
      expect(trueCount).toBe(4)

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('shows the reduced fraction 6/4165 in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )

      // Reduced fraction visible in final frame.
      expect(html).toContain('6/4165')

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('shows the product 3744 in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: exploreBeat }),
      )
      expect(html).toContain('3744')

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })
  })

  describe('scaffold beat (l6-pairs-scaffold, no hero)', () => {
    it('renders 4 chips for the scaffold beat', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: scaffoldBeat }),
      )
      const pressedCount = (html.match(/aria-pressed=/g) ?? []).length
      expect(pressedCount).toBe(4)
    })

    it('shows kicker chip label', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: scaffoldBeat }),
      )
      // React SSR inserts <!-- --> between JS expressions; check label presence.
      expect(html).toContain('Kicker (44 cards)')
    })

    it('chips start unselected (no hero)', () => {
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat: scaffoldBeat }),
      )
      expect(html).not.toContain('aria-pressed="true"')
    })
  })

  describe('returns null for wrong interaction type', () => {
    it('renders empty for a non-probabilityCounter beat', () => {
      const beat = makeBeat({ type: 'recap' })
      const html = renderToString(
        React.createElement(ProbabilityCounterBeat, { ...baseProps, beat }),
      )
      expect(html).toBe('')
    })
  })
})
