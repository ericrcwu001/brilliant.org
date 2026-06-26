// Smoke tests for TheorySimChartBeat via react-dom/server renderToString.
// NODE env — no jsdom, no clicks. Covers BOTH the new noodleLoops mode (series +
// readout present) and the baseline automaton mode (existing PHT path unchanged).

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'

// Mock firebase-dependent analytics so the test runs in node without a live
// Firebase project. SimChart (react-konva/Canvas) is also mocked.
vi.mock('../../analytics/events', () => ({
  analytics: { simulationRun: vi.fn(), answerSubmitted: vi.fn(), hintRevealed: vi.fn() },
}))
vi.mock('../konva/SimChart', () => ({ SimChart: () => null }))
vi.mock('../konva/useElementWidth', () => ({
  useElementWidth: () => [{ current: null }, 0] as const,
}))
import { TheorySimChartBeat } from './TheorySimChartBeat'
import { buildAutomaton } from '../../engine/automaton'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

const automaton = buildAutomaton('H', 0.5)

function makeProps(beat: Beat, overrides?: Partial<BeatProps>): BeatProps {
  return {
    beat,
    lessonId: 'lesson-expected-value-2',
    pattern: 'H',
    patternOptions: ['H'],
    automaton,
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
    ...overrides,
  }
}

const noodleBeat: Beat = {
  beatId: 'ev2-explore',
  required: false,
  prompt: 'Press Step to tie a pair of ends.',
  interaction: { type: 'theorySimChart', mode: 'noodleLoops', nMax: 10 },
  hero: {
    slowFirst: true,
    structuralReadout: 'E[10 noodles] ≈ 2.02',
    reducedMotionFinalFrame: true,
  },
  feedback: {
    correct: 'Each tie adds one tiny loop-closing chance.',
    hints: ['Press Step.', 'Watch E[loops].', 'After 10 noodles, the total is small.'],
  },
}

const automatonBeat: Beat = {
  beatId: 'theory-sim',
  required: false,
  prompt: 'Run the simulation.',
  interaction: { type: 'theorySimChart' },
  feedback: {
    correct: 'The empirical mean converges.',
    hints: ['Run more trials.', 'Watch the mean.', 'It converges to theory.'],
  },
}

describe('TheorySimChartBeat — noodleLoops mode', () => {
  it('renders without throwing', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(noodleBeat)))
    expect(html).toBeTruthy()
  })

  it('renders the aria-live readout element', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(noodleBeat)))
    expect(html).toContain('aria-live="polite"')
  })

  it('initial readout prompts the user to press Step', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(noodleBeat)))
    expect(html).toContain('Press Step')
  })

  it('renders the SVG chart container', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(noodleBeat)))
    expect(html).toContain('noodle-chart__svg')
  })

  it('reducedMotion=true starts at final frame (structural readout visible)', () => {
    const html = renderToString(
      createElement(TheorySimChartBeat, makeProps(noodleBeat, { reducedMotion: true })),
    )
    expect(html).toContain('E[10 noodles]')
  })

  it('renders the Step button when not complete', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(noodleBeat)))
    expect(html).toContain('Step')
  })
})

describe('TheorySimChartBeat — baseline automaton mode (PHT path)', () => {
  it('renders without throwing', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(automatonBeat)))
    expect(html).toBeTruthy()
  })

  it('renders the sim-status region', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(automatonBeat)))
    expect(html).toContain('sim-status')
  })

  it('renders the Run simulations button', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(automatonBeat)))
    expect(html).toContain('Run 500 simulations')
  })

  it('does NOT render noodle-chart markup', () => {
    const html = renderToString(createElement(TheorySimChartBeat, makeProps(automatonBeat)))
    expect(html).not.toContain('noodle-chart')
  })
})
