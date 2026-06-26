// Smoke tests for SliderBeat via react-dom/server renderToString. Node env —
// no jsdom, no clicks. Covers BOTH the new order-stat dual-readout path
// (ev6-model, introducesSymbol='E[max]=n/(n+1)') and the baseline prediction
// slider path (existing PHT behavior unchanged).

import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../analytics/events', () => ({
  analytics: { predictionSet: vi.fn() },
}))

import { SliderBeat } from './SliderBeat'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'
import { buildAutomaton } from '../../engine/automaton'

const automaton = buildAutomaton('H', 0.5)

function makeProps(beat: Beat, overrides?: Partial<BeatProps>): BeatProps {
  return {
    beat,
    lessonId: 'lesson-expected-value-6',
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

const orderStatBeat: Beat = {
  beatId: 'ev6-model',
  required: false,
  introducesSymbol: 'E[max]=n/(n+1)',
  groundedBy: ['ev6-win', 'ev6-explore'],
  prompt: 'Drag n from 2 to 20. Watch E[max] and E[min] update.',
  interaction: { type: 'slider', min: 2, max: 20, step: 1 },
  feedback: {
    correct: 'E[max]=n/(n+1) creeps toward 1 but never reaches it.',
    hints: [
      'At n=2: E[max]=2/3. At n=9: E[max]=9/10.',
      'The gap to 1 is always 1/(n+1), however large n grows.',
      'E[max]+E[min] = n/(n+1)+1/(n+1) = 1.',
    ],
  },
}

const baselineBeat: Beat = {
  beatId: 'prediction-slider',
  required: false,
  prompt: 'Estimate the expected wait time.',
  interaction: { type: 'slider', min: 1, max: 20, step: 1 },
  feedback: {
    correct: 'Great prediction.',
    hints: [
      'Think about the pattern.',
      'Consider the self-overlap.',
      'The answer is in the formula.',
    ],
  },
}

describe('SliderBeat — order-stat dual-readout (ev6-model path)', () => {
  it('renders without crashing', () => {
    expect(() =>
      renderToString(<SliderBeat {...makeProps(orderStatBeat)} />),
    ).not.toThrow()
  })

  it('renders E[max] in the readout', () => {
    const html = renderToString(<SliderBeat {...makeProps(orderStatBeat)} />)
    expect(html).toContain('E[max]')
  })

  it('renders E[min] in the readout', () => {
    const html = renderToString(<SliderBeat {...makeProps(orderStatBeat)} />)
    expect(html).toContain('E[min]')
  })

  it('renders an aria-live polite region for live fraction updates', () => {
    const html = renderToString(<SliderBeat {...makeProps(orderStatBeat)} />)
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-atomic="true"')
  })

  it('shows fraction spans for default midpoint n=11 (E[max]=11/12, E[min]=1/12)', () => {
    const html = renderToString(<SliderBeat {...makeProps(orderStatBeat)} />)
    // React SSR renders JSX expressions as separate text nodes with comment separators.
    // We check for the numerator and denominator values separately.
    expect(html).toContain('orderstat-readout__frac')
    // Slider mid = 2 + round((20-2)/2) * 1 = 11; E[max] = 11/12
    expect(html).toMatch(/11.*12/)
    expect(html).toMatch(/1.*12/)
  })

  it('renders the mini 0-1 axis dot elements', () => {
    const html = renderToString(<SliderBeat {...makeProps(orderStatBeat)} />)
    expect(html).toContain('orderstat-axis__dot--max')
    expect(html).toContain('orderstat-axis__dot--min')
  })
})

describe('SliderBeat — baseline prediction slider (PHT path unchanged)', () => {
  it('renders without crashing', () => {
    expect(() =>
      renderToString(<SliderBeat {...makeProps(baselineBeat)} />),
    ).not.toThrow()
  })

  it('does NOT render E[max]/E[min] readout for a plain prediction slider', () => {
    const html = renderToString(<SliderBeat {...makeProps(baselineBeat)} />)
    expect(html).not.toContain('E[max]')
    expect(html).not.toContain('E[min]')
  })

  it('renders the prediction-slider group', () => {
    const html = renderToString(<SliderBeat {...makeProps(baselineBeat)} />)
    expect(html).toContain('prediction-slider')
  })

  it('renders Lock prediction button when not locked', () => {
    const html = renderToString(<SliderBeat {...makeProps(baselineBeat)} />)
    expect(html).toContain('Lock prediction')
  })

  it('returns null for a non-slider beat', () => {
    const html = renderToString(
      <SliderBeat
        {...makeProps({ ...baselineBeat, interaction: { type: 'recap' } })}
      />,
    )
    expect(html).toBe('')
  })
})
