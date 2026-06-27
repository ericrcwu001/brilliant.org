// Smoke tests for CovarianceBoardBeat via react-dom/server renderToString.
// NODE env — no jsdom, no click simulation. Asserts the static initial-render
// HTML for each display; engine-derived values are checked against the engine.

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

import { CovarianceBoardBeat } from './CovarianceBoardBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'
import {
  covariance,
  expectedProduct,
  formatRational,
  corrRange,
  formatRangePair,
} from '../../engine/covariance'
import type { JointCell } from '../../engine/covariance'

// ── Fixtures ─────────────────────────────────────────────────────────────────

// A simple 2×2 joint pmf where each cell has p = 1/4
// X ∈ {0, 1}, Y ∈ {0, 1}
const JOINT_2X2: JointCell[] = [
  { x: { n: 0, d: 1 }, y: { n: 0, d: 1 }, p: { n: 1, d: 4 } },
  { x: { n: 0, d: 1 }, y: { n: 1, d: 1 }, p: { n: 1, d: 4 } },
  { x: { n: 1, d: 1 }, y: { n: 0, d: 1 }, p: { n: 1, d: 4 } },
  { x: { n: 1, d: 1 }, y: { n: 1, d: 1 }, p: { n: 1, d: 4 } },
]

// A positive-covariance joint pmf: high X paired with high Y more often
const JOINT_POS: JointCell[] = [
  { x: { n: 1, d: 1 }, y: { n: 1, d: 1 }, p: { n: 2, d: 6 } },
  { x: { n: 1, d: 1 }, y: { n: 3, d: 1 }, p: { n: 1, d: 6 } },
  { x: { n: 3, d: 1 }, y: { n: 1, d: 1 }, p: { n: 1, d: 6 } },
  { x: { n: 3, d: 1 }, y: { n: 3, d: 1 }, p: { n: 2, d: 6 } },
]

function makeBeat(interaction: Beat['interaction'], overrides: Partial<Beat> = {}): Beat {
  return {
    beatId: 'cov-test',
    required: false,
    prompt: 'Explore covariance.',
    interaction,
    feedback: { correct: 'ok', hints: ['a', 'b', 'c'] },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-covariance-1',
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

function render(beat: Beat, reducedMotion = false): string {
  return renderToString(
    React.createElement(CovarianceBoardBeat, { ...baseProps, beat, reducedMotion }),
  )
}

// ── jointPmf ─────────────────────────────────────────────────────────────────

describe('CovarianceBoardBeat — jointPmf', () => {
  it('renders a table with expected cells and Continue button', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    expect(html).toContain('<table')
    expect(html).toContain('Continue')
  })

  it('contains the engine Cov readout', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    const covExpected = formatRational(covariance(JOINT_2X2))
    expect(html).toContain(covExpected)
  })

  it('contains E[XY] from the engine', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    const exyExpected = formatRational(expectedProduct(JOINT_2X2))
    expect(html).toContain(exyExpected)
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('shows interactive cell buttons when interactive=true', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
      interactive: true,
    })
    const html = render(beat)
    expect(html).toContain('covboard__cell-btn')
  })

  it('shows static cell values when not interactive', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    expect(html).toContain('covboard__cell-val')
    expect(html).not.toContain('covboard__cell-btn')
  })

  it('contains sign chip', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_POS,
    })
    const html = render(beat)
    // positive covariance → sign chip pos
    expect(html).toContain('covboard__sign-chip')
  })

  it('reduced-motion: renders without throwing', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    expect(() => render(beat, true)).not.toThrow()
  })

  it('advances on Continue — enabled from the start', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'jointPmf',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    // Primary button must not be disabled (ungraded → always enabled)
    expect(html).not.toContain('disabled')
    expect(html).toContain('Continue')
  })
})

// ── scatter ───────────────────────────────────────────────────────────────────

describe('CovarianceBoardBeat — scatter', () => {
  it('renders an SVG element with points', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'scatter',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    expect(html).toContain('<svg')
    expect(html).toContain('covboard__point')
  })

  it('contains engine Cov readout', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'scatter',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    const covExpected = formatRational(covariance(JOINT_2X2))
    expect(html).toContain(covExpected)
  })

  it('renders a range slider when interactive', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'scatter',
      joint: JOINT_2X2,
      interactive: true,
    })
    const html = render(beat)
    expect(html).toContain('type="range"')
    expect(html).toContain('Scale')
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'scatter',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('advances on Continue', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'scatter',
      joint: JOINT_2X2,
    })
    const html = render(beat)
    expect(html).toContain('Continue')
  })

  it('reduced-motion: renders without throwing', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'scatter',
      joint: JOINT_2X2,
    })
    expect(() => render(beat, true)).not.toThrow()
  })
})

// ── corrVectors ───────────────────────────────────────────────────────────────

describe('CovarianceBoardBeat — corrVectors', () => {
  // 3/5 and 4/5 are a Pythagorean pair: 1−(3/5)²=16/25, 1−(4/5)²=9/25 — both perfect-square rationals.
  const RHO1 = { n: 3, d: 5 }
  const RHO2 = { n: 4, d: 5 }

  it('renders an SVG with a number-line', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'corrVectors',
      rho1: RHO1,
      rho2: RHO2,
      labels: ['x', 'y', 'z'],
    })
    const html = render(beat)
    expect(html).toContain('<svg')
    expect(html).toContain('covboard__numberline')
  })

  it('contains attainable bracket element', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'corrVectors',
      rho1: RHO1,
      rho2: RHO2,
    })
    const html = render(beat)
    expect(html).toContain('covboard__bracket')
  })

  it('contains range readout from engine corrRange + formatRangePair', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'corrVectors',
      rho1: RHO1,
      rho2: RHO2,
    })
    const html = render(beat)
    const range = corrRange(RHO1, RHO2)
    const rangeLabel = formatRangePair(range)
    expect(html).toContain(rangeLabel)
  })

  it('advances on Continue', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'corrVectors',
      rho1: RHO1,
      rho2: RHO2,
    })
    const html = render(beat)
    expect(html).toContain('Continue')
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'corrVectors',
      rho1: RHO1,
      rho2: RHO2,
    })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('reduced-motion: renders without throwing and parks at max-ρ', () => {
    const beat = makeBeat({
      type: 'covarianceBoard',
      display: 'corrVectors',
      rho1: RHO1,
      rho2: RHO2,
    })
    expect(() => render(beat, true)).not.toThrow()
    // Reduced-motion: range slider not rendered (parked at max-ρ)
    const html = render(beat, true)
    expect(html).not.toContain('type="range"')
  })
})

// ── non-covarianceBoard beat ──────────────────────────────────────────────────

describe('CovarianceBoardBeat — guard', () => {
  it('returns empty string for a non-covarianceBoard beat', () => {
    const html = render(makeBeat({ type: 'recap' }))
    expect(html).toBe('')
  })
})
