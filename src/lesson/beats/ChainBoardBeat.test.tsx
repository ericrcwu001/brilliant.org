// Smoke tests for ChainBoardBeat via react-dom/server renderToString.
// NODE env — no jsdom, no clicks. Covers all five display modes + hero/graded split.

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import React from 'react'

vi.mock('../konva/ChainGraph', () => ({ ChainGraph: () => null }))
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
    answerSubmitted() {},
    hintRevealed() {},
    lessonStarted() {},
    lessonCompleted() {},
    beatCompleted() {},
  },
}))

import { ChainBoardBeat } from './ChainBoardBeat'
import {
  matrixPower,
  stationaryDistribution,
  absorptionProbabilities,
  pagerank,
  formatRational,
  formatVector,
} from '../../engine/markov'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'
import type { Rational } from '../../engine/types'

// Weather chain: P = [[3/5, 2/5], [3/10, 7/10]]
const WEATHER: Rational[][] = [
  [{ n: 3, d: 5 }, { n: 2, d: 5 }],
  [{ n: 3, d: 10 }, { n: 7, d: 10 }],
]
const WEATHER_LABELS = ['Clear', 'Rainy']

// 3-state absorbing chain for absorption tests: states 0,1 transient; 2 absorbing
const ABSORB: Rational[][] = [
  [{ n: 0, d: 1 }, { n: 1, d: 2 }, { n: 1, d: 2 }],
  [{ n: 1, d: 4 }, { n: 0, d: 1 }, { n: 3, d: 4 }],
  [{ n: 0, d: 1 }, { n: 0, d: 1 }, { n: 1, d: 1 }],
]
const ABSORB_LABELS = ['A', 'B', 'Done']

function makeBeat(
  interaction: Beat['interaction'],
  overrides: Partial<Beat> = {},
): Beat {
  return {
    beatId: 'test-beat',
    required: true,
    prompt: 'Test prompt.',
    interaction,
    feedback: {
      correct: 'Correct!',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-markov-chains-1',
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

describe('ChainBoardBeat smoke', () => {
  it('returns empty for non-chainBoard beat', () => {
    const beat = makeBeat({ type: 'recap' })
    const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
    expect(html).toBe('')
  })

  describe('diagram display — graded entry', () => {
    it('renders without throwing and contains label names', () => {
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'diagram',
        matrix: WEATHER,
        labels: WEATHER_LABELS,
        task: 'entry',
        cell: { row: 0, col: 1 },
        step: 1,
        headline: formatRational(WEATHER[0][1]),
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toBeTruthy()
      expect(html).toContain('Clear')
      expect(html).toContain('Rainy')
    })

    it('contains aria-live region', () => {
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'diagram',
        matrix: WEATHER,
        labels: WEATHER_LABELS,
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain('aria-live="polite"')
    })

    it('renders hero diagram with structuralReadout (ungraded)', () => {
      const beat = makeBeat(
        {
          type: 'chainBoard',
          display: 'diagram',
          matrix: WEATHER,
          labels: WEATHER_LABELS,
          start: 0,
        },
        {
          hero: {
            slowFirst: true,
            structuralReadout: 'Weather chain hero readout.',
            reducedMotionFinalFrame: true,
          },
        },
      )
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain('Weather chain hero readout.')
      // Hero primary: Continue (not Check)
      expect(html).toContain('Continue')
    })

    it('renders graded diagram with Check button', () => {
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'diagram',
        matrix: WEATHER,
        labels: WEATHER_LABELS,
        task: 'classify',
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain('Check')
    })
  })

  describe('matrix display — absorption graded', () => {
    it('renders the transition matrix and absorption probs', () => {
      const absProbs = absorptionProbabilities(ABSORB, [2])
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'matrix',
        matrix: ABSORB,
        labels: ABSORB_LABELS,
        task: 'absorption',
        absorbing: [2],
        headline: formatVector(absProbs[0]),
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toBeTruthy()
      expect(html).toContain('Done')
      // The absorption table header contains the absorbing state label
      expect(html).toContain('aria-live="polite"')
    })

    it('renders hero matrix with Continue (ungraded)', () => {
      const beat = makeBeat(
        {
          type: 'chainBoard',
          display: 'matrix',
          matrix: WEATHER,
          labels: WEATHER_LABELS,
        },
        {
          hero: {
            slowFirst: true,
            structuralReadout: 'Matrix hero.',
            reducedMotionFinalFrame: true,
          },
        },
      )
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain('Continue')
    })
  })

  describe('powers display — graded entry', () => {
    it('renders Pⁿ grid with engine-computed value', () => {
      const step = 3
      const Pn = matrixPower(WEATHER, step)
      const expected = formatRational(Pn[0][0])
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'powers',
        matrix: WEATHER,
        labels: WEATHER_LABELS,
        task: 'entry',
        step,
        cell: { row: 0, col: 0 },
        headline: expected,
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain(expected)
      expect(html).toContain('Check')
    })
  })

  describe('distribution display — stationary settling', () => {
    it('renders bars with label names and stationary vector', () => {
      const stationary = stationaryDistribution(WEATHER)
      const expected = formatRational(stationary[0])
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'distribution',
        matrix: WEATHER,
        labels: WEATHER_LABELS,
        start: 0,
        step: 4,
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain('Clear')
      expect(html).toContain('Rainy')
      // Stationary readout in sr-only paragraph
      expect(html).toContain(expected)
    })
  })

  describe('stationary display — pagerank with damping', () => {
    it('renders PageRank bars with engine values', () => {
      const damping: Rational = { n: 85, d: 100 }
      const pr = pagerank(WEATHER, damping)
      const expected = formatRational(pr[0])
      const beat = makeBeat({
        type: 'chainBoard',
        display: 'stationary',
        matrix: WEATHER,
        labels: WEATHER_LABELS,
        task: 'pagerank',
        damping,
        headline: 'unique',
      })
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain(expected)
      expect(html).toContain('aria-live="polite"')
    })

    it('renders hero stationary with Continue (ungraded)', () => {
      const beat = makeBeat(
        {
          type: 'chainBoard',
          display: 'stationary',
          matrix: WEATHER,
          labels: WEATHER_LABELS,
        },
        {
          hero: {
            slowFirst: true,
            structuralReadout: 'Stationary hero.',
            reducedMotionFinalFrame: true,
          },
        },
      )
      const html = renderToString(React.createElement(ChainBoardBeat, { ...baseProps, beat }))
      expect(html).toContain('Continue')
    })
  })
})
