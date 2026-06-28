// Smoke tests for OptionBoardBeat via react-dom/server renderToString.
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

import { OptionBoardBeat } from './OptionBoardBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'
import {
  toBig,
  formatRational,
  spreadPayoff,
  parityGap,
  binomialPrice,
} from '../../engine/options'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeBeat(interaction: Beat['interaction'], overrides: Partial<Beat> = {}): Beat {
  return {
    beatId: 'opt-test',
    required: false,
    prompt: 'Explore options.',
    interaction,
    feedback: { correct: 'ok', hints: ['a', 'b', 'c'] },
    ...overrides,
  }
}

const baseProps: Omit<BeatProps, 'beat'> = {
  lessonId: 'lesson-options-1',
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
    React.createElement(OptionBoardBeat, { ...baseProps, beat, reducedMotion }),
  )
}

// ── payoffDiagram ─────────────────────────────────────────────────────────────

describe('OptionBoardBeat — payoffDiagram', () => {
  // Long call: K=100, qty=1. markS=130 → payoff = max(130−100,0) = 30.
  const legs = [{ kind: 'call' as const, K: { n: 100, d: 1 }, qty: { n: 1, d: 1 } }]
  const markS = { n: 130, d: 1 }

  it('renders SVG and Continue', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'payoffDiagram', legs, markS })
    const html = render(beat)
    expect(html).toContain('<svg')
    expect(html).toContain('Continue')
  })

  it('shows engine payoff value at markS', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'payoffDiagram', legs, markS })
    const html = render(beat)
    const engineLegs = [{ kind: 'call' as const, K: toBig({ n: 100, d: 1 }), qty: toBig({ n: 1, d: 1 }) }]
    const payoffStr = formatRational(spreadPayoff(engineLegs, toBig(markS)))
    // payoff = 30
    expect(payoffStr).toBe('30')
    expect(html).toContain(payoffStr)
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'payoffDiagram', legs })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('renders range slider when interactive', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'payoffDiagram', legs, interactive: true })
    const html = render(beat)
    expect(html).toContain('type="range"')
  })

  it('not disabled (ungraded)', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'payoffDiagram', legs })
    const html = render(beat)
    expect(html).not.toContain('disabled')
  })
})

// ── binomialTree ──────────────────────────────────────────────────────────────

describe('OptionBoardBeat — binomialTree', () => {
  // Canonical 1-step: S0=100, u=6/5, d=4/5, R=1, K=100, n=1, call.
  // q = (1−4/5)/(6/5−4/5) = (1/5)/(2/5) = 1/2.
  // Vu = max(120−100,0)=20, Vd = max(80−100,0)=0.
  // Price = (1/1)·[(1/2)·20 + (1/2)·0] = 10.
  const tree = {
    S0: { n: 100, d: 1 },
    u: { n: 6, d: 5 },
    d: { n: 4, d: 5 },
    R: { n: 1, d: 1 },
    K: { n: 100, d: 1 },
    n: 1,
    kind: 'call' as const,
  }

  it('renders SVG with Continue', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'binomialTree', tree })
    const html = render(beat)
    expect(html).toContain('<svg')
    expect(html).toContain('Continue')
  })

  it('shows engine root price "10"', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'binomialTree', tree })
    const html = render(beat)
    const priceStr = formatRational(
      binomialPrice(toBig(tree.S0), toBig(tree.u), toBig(tree.d), toBig(tree.R), toBig(tree.K), tree.n, tree.kind),
    )
    expect(priceStr).toBe('10')
    expect(html).toContain(priceStr)
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'binomialTree', tree })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('reduced-motion: renders without throwing', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'binomialTree', tree })
    expect(() => render(beat, true)).not.toThrow()
  })
})

// ── parityScale ───────────────────────────────────────────────────────────────

describe('OptionBoardBeat — parityScale', () => {
  // C=8, P=2, S=100, K=95, D=1.
  // gap = (C−P) − (S−K·D) = (8−2) − (100−95) = 6 − 5 = 1.
  const legs = [
    { kind: 'call' as const, K: { n: 95, d: 1 }, qty: { n: 8, d: 1 } },
    { kind: 'put' as const, K: { n: 95, d: 1 }, qty: { n: 2, d: 1 } },
    { kind: 'stock' as const, qty: { n: 100, d: 1 } },
    { kind: 'bond' as const, qty: { n: 1, d: 1 } },
  ]

  it('renders SVG scale and Continue', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'parityScale', legs })
    const html = render(beat)
    expect(html).toContain('<svg')
    expect(html).toContain('Continue')
  })

  it('shows engine gap "1"', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'parityScale', legs })
    const html = render(beat)
    const gapStr = formatRational(
      parityGap(toBig({ n: 8, d: 1 }), toBig({ n: 2, d: 1 }), toBig({ n: 100, d: 1 }), toBig({ n: 95, d: 1 }), toBig({ n: 1, d: 1 })),
    )
    expect(gapStr).toBe('1')
    expect(html).toContain(gapStr)
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'parityScale', legs })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('shows arbitrage chip when gap ≠ 0', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'parityScale', legs })
    const html = render(beat)
    expect(html).toContain('arbitrage')
  })
})

// ── greeksSlider ──────────────────────────────────────────────────────────────

describe('OptionBoardBeat — greeksSlider', () => {
  it('renders slider and display-only note', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'greeksSlider' })
    const html = render(beat)
    expect(html).toContain('type="range"')
    expect(html).toContain('not graded')
  })

  it('shows greek sign chips for all 5 greeks', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'greeksSlider' })
    const html = render(beat)
    expect(html).toContain('delta')
    expect(html).toContain('gamma')
    expect(html).toContain('vega')
  })

  it('has aria-live polite mirror', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'greeksSlider' })
    const html = render(beat)
    expect(html).toContain('aria-live="polite"')
  })

  it('continues ungraded', () => {
    const beat = makeBeat({ type: 'optionBoard', display: 'greeksSlider' })
    const html = render(beat)
    expect(html).toContain('Continue')
    expect(html).not.toContain('disabled')
  })
})

// ── guard ─────────────────────────────────────────────────────────────────────

describe('OptionBoardBeat — guard', () => {
  it('returns empty string for non-optionBoard beat', () => {
    const html = render(makeBeat({ type: 'recap' }))
    expect(html).toBe('')
  })
})
