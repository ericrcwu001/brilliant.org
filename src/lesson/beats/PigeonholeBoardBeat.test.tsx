// Smoke tests for PigeonholeBoardBeat via react-dom/server renderToString.
// NODE env — no jsdom, no click simulation. Asserts static initial-render HTML.

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

import { PigeonholeBoardBeat } from './PigeonholeBoardBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(
  interaction: Beat['interaction'],
  overrides: Partial<Beat> = {},
): Beat {
  return {
    beatId: 'ph-test',
    required: false,
    prompt: 'Place the socks.',
    interaction,
    feedback: {
      correct: 'Collision forced.',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-combinatorics-5',
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
    type: 'pigeonholeBoard',
    items: 4,
    holes: 3,
    holeLabels: ['Red', 'Yellow', 'Blue'],
    itemLabel: 'sock',
  },
  {
    hero: {
      slowFirst: true,
      structuralReadout: 'After 3 socks fill every color, the 4th has nowhere to go.',
      reducedMotionFinalFrame: true,
    },
  },
)

const scaffoldBeat = makeBeat({
  type: 'pigeonholeBoard',
  items: 7,
  holes: 3,
  holeLabels: ['Red', 'Yellow', 'Blue'],
  itemLabel: 'sock',
})

describe('PigeonholeBoardBeat smoke', () => {
  describe('normal (non-hero) render', () => {
    it('renders without throwing', () => {
      expect(() =>
        renderToString(
          React.createElement(PigeonholeBoardBeat, {
            ...baseProps,
            beat: scaffoldBeat,
          }),
        ),
      ).not.toThrow()
    })

    it('contains aria-live="polite" for items-placed counter', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('aria-live="polite"')
    })

    it('contains aria-live="assertive" for collision alert', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('aria-live="assertive"')
    })

    it('renders item tokens for each item', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('sock 1')
      expect(html).toContain('sock 7')
    })

    it('renders hole cards with holeLabels', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('Red')
      expect(html).toContain('Yellow')
      expect(html).toContain('Blue')
    })

    it('hole cards have role="button"', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      const holeButtons = (html.match(/role="button"/g) ?? []).length
      expect(holeButtons).toBeGreaterThanOrEqual(3)
    })

    it('item tokens have tabindex="0" when unplaced', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('tabindex="0"')
    })

    it('renders items-placed counter showing 0 of 7', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('0 of 7 placed')
    })

    it('renders a Continue button', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).toContain('Continue')
    })

    it('does not show feedback note before completion', () => {
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: scaffoldBeat,
        }),
      )
      expect(html).not.toContain('Collision forced.')
    })
  })

  describe('reduced-motion final frame (hero beat)', () => {
    it('renders board filled (all items placed) in reduced-motion', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: exploreBeat,
        }),
      )

      expect(html).toContain('4 of 4 placed')
      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('shows collision highlight in reduced-motion final frame', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: exploreBeat,
        }),
      )

      expect(html).toContain('pigeonhole-board__hole--collision')
      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('shows feedback.correct in reduced-motion final frame', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, {
          ...baseProps,
          beat: exploreBeat,
        }),
      )

      expect(html).toContain('Collision forced.')
      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('renders without throwing in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      expect(() =>
        renderToString(
          React.createElement(PigeonholeBoardBeat, {
            ...baseProps,
            beat: exploreBeat,
          }),
        ),
      ).not.toThrow()

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })
  })

  describe('returns null for wrong interaction type', () => {
    it('renders empty for a non-pigeonholeBoard beat', () => {
      const beat = makeBeat({ type: 'recap' })
      const html = renderToString(
        React.createElement(PigeonholeBoardBeat, { ...baseProps, beat }),
      )
      expect(html).toBe('')
    })
  })
})
