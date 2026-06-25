// Smoke tests for PascalTriangleBeat via react-dom/server renderToString.
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

// Mock useReducedMotion so we can control the reduced-motion branch.
vi.mock('../useReducedMotion', () => ({ useReducedMotion: vi.fn(() => false) }))

import { PascalTriangleBeat } from './PascalTriangleBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

function makeBeat(
  interaction: Beat['interaction'],
  overrides: Partial<Beat> = {},
): Beat {
  return {
    beatId: 'pt-test',
    required: false,
    prompt: 'Build the triangle.',
    interaction,
    feedback: {
      correct: 'Every row doubles.',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-combinatorics-3',
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

// ── Helpers ──────────────────────────────────────────────────────────────────

// Beat with reveal:'all' so initial render shows the full triangle.
const allRevealedBeat = makeBeat({
  type: 'pascalTriangle',
  rows: 4,
  reveal: 'all',
  showRowSums: true,
  showSymmetry: true,
})

// Beat with reveal:'tap' (default) — no cells revealed on initial SSR.
const tapBeat = makeBeat({
  type: 'pascalTriangle',
  rows: 3,
  reveal: 'tap',
  showRowSums: false,
  showSymmetry: false,
})

// Beat with hero block — reduced-motion renders final frame.
const heroBeat = makeBeat(
  {
    type: 'pascalTriangle',
    rows: 3,
    reveal: 'tap',
    showRowSums: true,
    showSymmetry: true,
  },
  {
    hero: {
      slowFirst: true,
      structuralReadout: 'Row 3 = 1+3+3+1 = 8 = 2³.',
      reducedMotionFinalFrame: true,
    },
  },
)

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PascalTriangleBeat smoke', () => {
  describe('reveal:"all" — all cells shown immediately', () => {
    it('renders without throwing', () => {
      expect(() =>
        renderToString(
          React.createElement(PascalTriangleBeat, {
            ...baseProps,
            beat: allRevealedBeat,
          }),
        ),
      ).not.toThrow()
    })

    it('contains the aria-live polite status region', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('aria-live="polite"')
    })

    it('shows the correct value for C(4,2) = 6 in a revealed cell', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      // C(4,2) = 6; revealed cell aria-label contains the value.
      expect(html).toContain('C(4,2) = 6')
    })

    it('shows the correct value for C(4,0) = 1', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('C(4,0) = 1')
    })

    it('shows the correct value for C(4,4) = 1', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('C(4,4) = 1')
    })

    it('shows C(4,1) = 4', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('C(4,1) = 4')
    })

    it('shows row-sum label "= 2^4" after row 4 completes (showRowSums)', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('= 2^4')
    })

    it('shows row-sum labels for all rows 0..4', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      for (let n = 0; n <= 4; n++) {
        expect(html).toContain(`= 2^${n}`)
      }
    })

    it('cells carry data-n and data-k attributes', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('data-n="4"')
      expect(html).toContain('data-k="2"')
    })

    it('revealed cells have role="cell" and tabIndex=-1', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('role="cell"')
      expect(html).toContain('tabindex="-1"')
    })

    it('shows feedback.correct note once all cells are revealed', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('Every row doubles.')
    })

    it('renders a Continue button (ungraded — always enabled)', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('Continue')
    })
  })

  describe('reveal:"tap" — no cells shown initially', () => {
    it('renders without throwing', () => {
      expect(() =>
        renderToString(
          React.createElement(PascalTriangleBeat, { ...baseProps, beat: tapBeat }),
        ),
      ).not.toThrow()
    })

    it('unrevealed cells have role="button" and tabIndex=0', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, { ...baseProps, beat: tapBeat }),
      )
      expect(html).toContain('role="button"')
      expect(html).toContain('tabindex="0"')
    })

    it('unrevealed cells carry aria-label "Reveal C(n,k)"', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, { ...baseProps, beat: tapBeat }),
      )
      expect(html).toContain('Reveal C(0,0)')
      expect(html).toContain('Reveal C(3,0)')
    })

    it('does NOT show row-sum labels when no cells are revealed', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, { ...baseProps, beat: tapBeat }),
      )
      expect(html).not.toContain('= 2^')
    })

    it('does NOT show feedback note before the triangle is complete', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, { ...baseProps, beat: tapBeat }),
      )
      expect(html).not.toContain('Every row doubles.')
    })

    it('still renders a Continue button', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, { ...baseProps, beat: tapBeat }),
      )
      expect(html).toContain('Continue')
    })
  })

  describe('reduced-motion final frame (hero beat)', () => {
    it('renders all cells revealed when useReducedMotion returns true', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: heroBeat,
        }),
      )

      // With reducedMotion + hero, all cells start revealed.
      expect(html).toContain('C(3,0) = 1')
      expect(html).toContain('C(3,1) = 3')
      expect(html).toContain('C(3,2) = 3')
      expect(html).toContain('C(3,3) = 1')
      // Row sums visible since all rows complete.
      expect(html).toContain('= 2^3')

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('renders without throwing in reduced-motion mode', async () => {
      const { useReducedMotion } = await import('../useReducedMotion')
      vi.mocked(useReducedMotion).mockReturnValue(true)

      expect(() =>
        renderToString(
          React.createElement(PascalTriangleBeat, {
            ...baseProps,
            beat: heroBeat,
          }),
        ),
      ).not.toThrow()

      vi.mocked(useReducedMotion).mockReturnValue(false)
    })

    it('still renders normal tap beat without revealing cells when motion is allowed', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: heroBeat,
        }),
      )
      // Without reduced motion, hero beat starts unrevealed.
      expect(html).toContain('Reveal C(0,0)')
    })
  })

  describe('symmetry attributes', () => {
    it('revealed cells carry data-n and data-k for symmetry pairing', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      // Row 4: C(4,1) and C(4,3) are symmetric (both = 4).
      expect(html).toContain('data-n="4" data-k="1"')
      expect(html).toContain('data-n="4" data-k="3"')
    })

    it('C(4,2) value matches engine pascalRow(4)[2] = 6', () => {
      const html = renderToString(
        React.createElement(PascalTriangleBeat, {
          ...baseProps,
          beat: allRevealedBeat,
        }),
      )
      expect(html).toContain('C(4,2) = 6')
    })
  })

  describe('returns null for wrong interaction type', () => {
    it('renders empty for a non-pascalTriangle beat', () => {
      const beat = makeBeat({ type: 'recap' })
      const html = renderToString(
        React.createElement(PascalTriangleBeat, { ...baseProps, beat }),
      )
      expect(html).toBe('')
    })
  })
})
