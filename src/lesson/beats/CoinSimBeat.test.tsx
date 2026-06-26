// Smoke tests for CoinSimBeat using react-dom/server renderToString (NODE env;
// no jsdom, no clicks, lowercase HTML attrs). Two suites:
//   1. Biased-indicator branch (p = 1/13): "Ace (1)" / "Not ace (0)" labels,
//      aria-live readout, theory-line element.
//   2. Baseline PHT path (p absent): existing fair-coin rendering unaffected.

import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { CoinSimBeat } from './CoinSimBeat'
import type { BeatProps } from './types'
import type { Automaton } from '../../engine/types'

const mockAutomaton: Automaton = {
  pattern: 'H',
  p: 0.5,
  states: [{ id: 'E0', label: '∅', absorbing: false }],
  transitions: [],
  recurrences: {} as Automaton['recurrences'],
  expectedTimes: { E0: 2 },
  substitutionSteps: [],
  overlapHighlights: [],
}

function baseProps(overrides: Partial<BeatProps> = {}): BeatProps {
  return {
    beat: {
      beatId: 'test-beat',
      required: false,
      prompt: 'Test prompt.',
      interaction: { type: 'coinSim', mode: 'free' },
      feedback: {
        correct: 'Correct.',
        hints: ['Hint 1.', 'Hint 2.', 'Hint 3.'],
      },
    },
    lessonId: 'lesson-expected-value-3',
    pattern: 'H',
    patternOptions: ['H'],
    automaton: mockAutomaton,
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

describe('CoinSimBeat — biased indicator branch (p = 1/13)', () => {
  const indicatorProps = baseProps({
    beat: {
      beatId: 'ev3-explore',
      required: false,
      prompt: 'Draw cards — watch the running average settle.',
      interaction: {
        type: 'coinSim',
        mode: 'free',
        p: 1 / 13,
        gamblerNote: 'As draws grow, the average settles to P(ace) = 1/13.',
      },
      feedback: {
        correct: 'The hit-rate is P(ace).',
        hints: ['Run a large batch.', 'Running average = fraction of aces.', 'Converges to 1/13.'],
      },
    },
  })

  it('renders without crashing', () => {
    expect(() => renderToString(<CoinSimBeat {...indicatorProps} />)).not.toThrow()
  })

  it('includes "Ace (1)" label in the HTML', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).toContain('Ace')
    expect(html).toContain('(1)')
  })

  it('includes "Not ace (0)" label in the HTML', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).toContain('Not')
    expect(html).toContain('(0)')
  })

  it('renders an aria-live="polite" readout region', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).toContain('aria-live="polite"')
  })

  it('renders a theory-line element positioned at p', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).toContain('isim__theory-line')
  })

  it('does NOT render the automaton state graph (isim path)', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).not.toContain('coinsim__legend')
  })

  it('renders a "Run 100" secondary action before any draws', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).toContain('Run 100')
  })

  it('renders a "Draw card" primary action before any draws', () => {
    const html = renderToString(<CoinSimBeat {...indicatorProps} />)
    expect(html).toContain('Draw card')
  })
})

describe('CoinSimBeat — baseline PHT path (no p)', () => {
  it('renders without crashing for the default fair-coin beat', () => {
    expect(() => renderToString(<CoinSimBeat {...baseProps()} />)).not.toThrow()
  })

  it('renders the coin legend (automaton path)', () => {
    const html = renderToString(<CoinSimBeat {...baseProps()} />)
    expect(html).toContain('coinsim__legend')
  })

  it('does NOT render isim classes (automaton path stays clean)', () => {
    const html = renderToString(<CoinSimBeat {...baseProps()} />)
    expect(html).not.toContain('isim__readout')
    expect(html).not.toContain('isim__theory-line')
  })

  it('renders a "Flip" primary action', () => {
    const html = renderToString(<CoinSimBeat {...baseProps()} />)
    expect(html).toContain('Flip')
  })
})

describe('CoinSimBeat — p=0.5 routes to PHT (not indicator)', () => {
  const fairProps = baseProps({
    beat: {
      beatId: 'fair-coin',
      required: false,
      prompt: 'Fair coin with p=0.5 explicit.',
      interaction: { type: 'coinSim', mode: 'free', p: 0.5 },
      feedback: {
        correct: 'Correct.',
        hints: ['Hint 1.', 'Hint 2.', 'Hint 3.'],
      },
    },
  })

  it('routes to PHT (not indicator) when p=0.5', () => {
    const html = renderToString(<CoinSimBeat {...fairProps} />)
    expect(html).toContain('coinsim__legend')
    expect(html).not.toContain('isim__readout')
  })
})
