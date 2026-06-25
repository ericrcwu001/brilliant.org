// Smoke tests for SelectionGridBeat via react-dom/server renderToString.
// NODE env — no jsdom, no click simulation. Asserts static initial-render output.

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

// Mock Firebase/analytics to avoid network calls and credential errors in the
// node test environment. Must be hoisted before any transitive import that
// reaches src/firebase/app.ts.
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

// Mock useReducedMotion so we can assert the reduced-motion branch.
vi.mock('../useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }))

import { SelectionGridBeat } from './SelectionGridBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(interaction: Beat['interaction']): Beat {
  return {
    beatId: 'sg-test',
    required: true,
    prompt: 'Test prompt',
    interaction,
    feedback: {
      correct: 'Correct!',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    },
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-combinatorics-2',
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

describe('SelectionGridBeat smoke', () => {
  describe('order="on" (graded, l2-win)', () => {
    const beat = makeBeat({
      type: 'selectionGrid',
      n: 5,
      k: 3,
      order: 'on',
      labels: ['Anya', 'Ben', 'Cara', 'Dan', 'Eva'],
      accept: ['60'],
    })

    it('renders without throwing', () => {
      expect(() =>
        renderToString(React.createElement(SelectionGridBeat, { ...baseProps, beat })),
      ).not.toThrow()
    })

    it('renders the count badge with aria-live="polite"', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('aria-live="polite"')
      expect(html).toContain('sel-grid__count')
    })

    it('shows "—" (incomplete) in count badge with no selection', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      // React SSR may insert <!-- --> comment separators between text nodes.
      expect(html).toMatch(/Count:.*—/)
    })

    it('renders 5 pool items as checkboxes', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      const checkboxMatches = html.match(/role="checkbox"/g) ?? []
      expect(checkboxMatches.length).toBe(5)
    })

    it('does NOT render a role="switch" toggle', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).not.toContain('role="switch"')
    })

    it('renders Submit button (disabled — no items selected)', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('Submit')
    })
  })

  describe('order="toggle" (ungraded, l2-explore)', () => {
    const beat = makeBeat({
      type: 'selectionGrid',
      n: 5,
      k: 3,
      order: 'toggle',
      labels: ['Anya', 'Ben', 'Cara', 'Dan', 'Eva'],
    })

    it('renders without throwing', () => {
      expect(() =>
        renderToString(React.createElement(SelectionGridBeat, { ...baseProps, beat })),
      ).not.toThrow()
    })

    it('renders the order toggle as role="switch"', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('role="switch"')
    })

    it('toggle starts aria-checked="true" (orderedMode on by default for toggle)', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('aria-checked="true"')
    })

    it('renders Continue (not Submit) — ungraded', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('Continue')
      expect(html).not.toContain('Submit')
    })

    it('renders the assertive live region for the ×k! label', () => {
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('aria-live="assertive"')
    })
  })

  describe('reduced-motion final frame (order="toggle")', () => {
    it('renders without throwing when useReducedMotion returns true', async () => {
      // Re-mock to return true for this test suite.
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const beat = makeBeat({
        type: 'selectionGrid',
        n: 5,
        k: 3,
        order: 'toggle',
        labels: ['Anya', 'Ben', 'Cara', 'Dan', 'Eva'],
      })

      expect(() =>
        renderToString(React.createElement(SelectionGridBeat, { ...baseProps, beat })),
      ).not.toThrow()

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('still renders the switch and count badge in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const beat = makeBeat({
        type: 'selectionGrid',
        n: 5,
        k: 3,
        order: 'toggle',
        labels: ['Anya', 'Ben', 'Cara', 'Dan', 'Eva'],
      })

      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toContain('role="switch"')
      expect(html).toContain('aria-live="polite"')

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })
  })

  describe('returns null for wrong interaction type', () => {
    it('returns null for non-selectionGrid beats', () => {
      const beat = makeBeat({ type: 'recap' })
      const html = renderToString(
        React.createElement(SelectionGridBeat, { ...baseProps, beat }),
      )
      expect(html).toBe('')
    })
  })
})
