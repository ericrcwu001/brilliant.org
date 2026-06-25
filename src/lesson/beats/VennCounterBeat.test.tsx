// Smoke tests for VennCounterBeat via react-dom/server renderToString.
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

import { VennCounterBeat } from './VennCounterBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(interaction: Beat['interaction'], extra?: Partial<Beat>): Beat {
  return {
    beatId: 'vc-test',
    required: false,
    prompt: 'Adjust the set sizes and their overlap.',
    interaction,
    feedback: {
      correct: 'The overlap region is counted twice — the formula subtracts it back.',
      hints: ['Push |A∩B| to its max.', 'Larger overlap → smaller union.', 'Set |A∩B| = |A|: then A ⊆ B.'],
    },
    ...extra,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-combinatorics-4',
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

describe('VennCounterBeat smoke', () => {
  describe('sets:2 ungraded (l4-explore)', () => {
    const beat = makeBeat(
      { type: 'vennCounter', sets: 2, maxSize: 20, initial: { a: 8, b: 6, ab: 3 } },
      {
        hero: {
          slowFirst: true,
          structuralReadout: '|A∪B| = |A| + |B| − |A∩B|',
          reducedMotionFinalFrame: true,
        },
      },
    )

    it('renders without throwing', () => {
      expect(() =>
        renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat })),
      ).not.toThrow()
    })

    it('renders stepper buttons with aria-labels for |A|, |B|, |A∩B|', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('aria-label="Decrease |A|"')
      expect(html).toContain('aria-label="Increase |A|"')
      expect(html).toContain('aria-label="Decrease |B|"')
      expect(html).toContain('aria-label="Increase |B|"')
      expect(html).toContain('aria-label="Increase |A\u2229B|"')
    })

    it('renders aria-live="polite" region', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('aria-live="polite"')
    })

    it('renders the formula readout element', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('venn-counter__formula')
    })

    it('renders Continue (ungraded — no Check button)', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('Continue')
      expect(html).not.toContain('>Check<')
    })

    it('hero start: ab shows as 0 when not reduced-motion', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      // Live region announces current ab; hero hasn't animated yet in SSR.
      expect(html).toContain('|A\u2229B| = 0')
    })
  })

  describe('reduced-motion final frame', () => {
    it('renders ab at initial.ab=3 immediately when reduced-motion is true', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const beat = makeBeat(
        { type: 'vennCounter', sets: 2, maxSize: 20, initial: { a: 8, b: 6, ab: 3 } },
        {
          hero: {
            slowFirst: true,
            structuralReadout: '|A∪B| = |A| + |B| − |A∩B|',
            reducedMotionFinalFrame: true,
          },
        },
      )

      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      // With reduced-motion, startAb = initAb = 3 → no animation.
      expect(html).toContain('|A\u2229B| = 3')

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('still renders stepper and aria-live in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const beat = makeBeat(
        { type: 'vennCounter', sets: 2, maxSize: 20, initial: { a: 8, b: 6, ab: 3 } },
        {
          hero: {
            slowFirst: true,
            structuralReadout: '|A∪B| = |A| + |B| − |A∩B|',
            reducedMotionFinalFrame: true,
          },
        },
      )

      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('aria-live="polite"')
      expect(html).toContain('venn-counter__step-btn')

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })
  })

  describe('sets:3', () => {
    const beat = makeBeat({
      type: 'vennCounter',
      sets: 3,
      maxSize: 20,
      initial: { a: 5, b: 4, ab: 2 },
    })

    it('renders without throwing', () => {
      expect(() =>
        renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat })),
      ).not.toThrow()
    })

    it('renders the |A∪B∪C| formula label', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('|A\u222aB\u222aC|')
    })

    it('renders sets:3 stepper for |C|', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('aria-label="Increase |C|"')
    })

    it('renders sets:3 stepper for |A∩B∩C|', () => {
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toContain('|A\u2229B\u2229C|')
    })
  })

  describe('returns null for wrong interaction type', () => {
    it('returns null for non-vennCounter beats', () => {
      const beat = makeBeat({ type: 'recap' })
      const html = renderToString(React.createElement(VennCounterBeat, { ...baseProps, beat }))
      expect(html).toBe('')
    })
  })
})
