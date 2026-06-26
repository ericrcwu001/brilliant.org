// Smoke tests for CouponCollectorSimBeat via react-dom/server renderToString.
// Node env, no jsdom, no clicks. Asserts toy grid, Σ panel, Draw button,
// and reduced-motion final frame render correctly in server HTML.

import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CouponCollectorSimBeat } from './CouponCollectorSimBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

const mockBeat: Beat = {
  beatId: 'ev5-explore',
  required: false,
  prompt: "Tap 'Draw box' to open cereal boxes until you've collected all 6 toy types.",
  interaction: {
    type: 'couponCollectorSim',
    n: 6,
  },
  hero: {
    slowFirst: true,
    structuralReadout: 'On average, the full set of 6 takes 147/10 = 14.7 boxes.',
    reducedMotionFinalFrame: true,
  },
  feedback: {
    correct: 'Set complete — it took far more than 6 boxes, and the last type alone cost the most.',
    hints: [
      'Keep drawing until all 6 toy types appear.',
      'Watch how the last type stalls the running total.',
      'Σ N/(N−i+1) converges to N·H_N ≈ 14.7.',
    ],
  },
}

function makeProps(overrides: Partial<BeatProps> = {}): BeatProps {
  return {
    beat: mockBeat,
    lessonId: 'lesson-expected-value-5',
    pattern: 'H',
    patternOptions: ['H'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    automaton: null as any,
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

describe('CouponCollectorSimBeat — renderToString smoke', () => {
  it('renders without throwing', () => {
    expect(() =>
      renderToString(<CouponCollectorSimBeat {...makeProps()} />),
    ).not.toThrow()
  })

  it('renders the toy grid with 6 type pills', () => {
    const html = renderToString(<CouponCollectorSimBeat {...makeProps()} />)
    const pillCount = (html.match(/ccsim__type-pill/g) ?? []).length
    expect(pillCount).toBeGreaterThanOrEqual(6)
    expect(html).toContain('Type 1')
    expect(html).toContain('Type 6')
  })

  it('renders the Σ panel with aria-live="polite"', () => {
    const html = renderToString(<CouponCollectorSimBeat {...makeProps()} />)
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('ccsim__sigma-panel')
  })

  it('renders the Draw box button in initial state', () => {
    const html = renderToString(<CouponCollectorSimBeat {...makeProps()} />)
    expect(html).toContain('Draw box')
    expect(html).toContain('ccsim__draw-btn')
  })

  it('renders aria-live="assertive" region', () => {
    const html = renderToString(<CouponCollectorSimBeat {...makeProps()} />)
    expect(html).toContain('aria-live="assertive"')
  })

  it('Continue button is disabled in initial state', () => {
    const html = renderToString(<CouponCollectorSimBeat {...makeProps({ reducedMotion: false })} />)
    expect(html).toContain('disabled')
  })

  it('returns null for non-couponCollectorSim beat type', () => {
    const nonBeat: Beat = {
      ...mockBeat,
      interaction: { type: 'recap' },
      feedback: { correct: 'ok', hints: ['h1', 'h2', 'h3'] },
    }
    const html = renderToString(
      <CouponCollectorSimBeat {...makeProps({ beat: nonBeat })} />,
    )
    expect(html).toBe('')
  })

  it('reduced-motion final frame: all 6 types marked collected', () => {
    const html = renderToString(
      <CouponCollectorSimBeat {...makeProps({ reducedMotion: true })} />,
    )
    const collectedCount = (html.match(/ccsim__type-pill--collected/g) ?? []).length
    expect(collectedCount).toBe(6)
  })

  it('reduced-motion final frame: Σ shows N·H_N = 49/20 decimal', () => {
    const html = renderToString(
      <CouponCollectorSimBeat {...makeProps({ reducedMotion: true })} />,
    )
    expect(html).toContain('49/20')
    expect(html).toContain('14.7')
  })

  it('reduced-motion final frame: Continue button is enabled (no disabled)', () => {
    const html = renderToString(
      <CouponCollectorSimBeat {...makeProps({ reducedMotion: true })} />,
    )
    expect(html).not.toContain('disabled')
  })

  it('reduced-motion final frame: correct feedback text is shown', () => {
    const html = renderToString(
      <CouponCollectorSimBeat {...makeProps({ reducedMotion: true })} />,
    )
    expect(html).toContain('Set complete')
  })
})
