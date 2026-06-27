// Smoke tests for PayoffMatrixBeat — renderToString in Node (no jsdom).
// Verifies key static structure for dominance, nash, value, mix, and
// the mismatched-type guard (→ '').

import { vi, describe, it, expect } from 'vitest'

// Prevent transitive firebase imports from failing in Node.
vi.mock('../../firebase/app', () => ({
  getDb: () => Promise.resolve({}),
  getFns: () => Promise.resolve({}),
  auth: {},
  app: {},
  usingEmulators: false,
}))

import { renderToString } from 'react-dom/server'
import { PayoffMatrixBeat } from './PayoffMatrixBeat'
import { buildAutomaton } from '../../engine/automaton'
import type { BeatProps } from './types'
import type { Beat } from '../../content/schema'

const automaton = buildAutomaton('H', 0.5)

const BASE_PROPS: Omit<BeatProps, 'beat' | 'reducedMotion'> = {
  lessonId: 'lesson-game-theory-1',
  pattern: 'H',
  patternOptions: ['H'],
  automaton,
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

// ── Prisoner's Dilemma — dominance task ──────────────────────────────────────
// Defect strictly dominates Cooperate for both players.
// IESDS unique survivor: (Defect, Defect).
const pdBeat: Beat = {
  beatId: 'gt-pd',
  required: false,
  prompt: 'Explore the Prisoner\'s Dilemma.',
  interaction: {
    type: 'payoffMatrix',
    rows: ['Cooperate', 'Defect'],
    cols: ['Cooperate', 'Defect'],
    matrix: [
      {
        cells: [
          { row: { n: 3, d: 1 }, col: { n: 3, d: 1 } },
          { row: { n: 0, d: 1 }, col: { n: 5, d: 1 } },
        ],
      },
      {
        cells: [
          { row: { n: 5, d: 1 }, col: { n: 0, d: 1 } },
          { row: { n: 1, d: 1 }, col: { n: 1, d: 1 } },
        ],
      },
    ],
    task: 'dominance',
    rowPlayer: 'Player 1',
    colPlayer: 'Player 2',
  },
  feedback: { correct: 'Well done.', hints: ['Hint 1', 'Hint 2', 'Hint 3'] },
}

// ── Stag Hunt — nash task ──────────────────────────────────────────────────
// Two pure Nash equilibria: (Stag, Stag) and (Hare, Hare).
const stagHuntBeat: Beat = {
  beatId: 'gt-stag-hunt',
  required: false,
  prompt: 'Explore the Stag Hunt.',
  interaction: {
    type: 'payoffMatrix',
    rows: ['Stag', 'Hare'],
    cols: ['Stag', 'Hare'],
    matrix: [
      {
        cells: [
          { row: { n: 4, d: 1 }, col: { n: 4, d: 1 } },
          { row: { n: 0, d: 1 }, col: { n: 3, d: 1 } },
        ],
      },
      {
        cells: [
          { row: { n: 3, d: 1 }, col: { n: 0, d: 1 } },
          { row: { n: 2, d: 1 }, col: { n: 2, d: 1 } },
        ],
      },
    ],
    task: 'nash',
    rowPlayer: 'Hunter A',
    colPlayer: 'Hunter B',
  },
  feedback: { correct: 'Well done.', hints: ['Hint 1', 'Hint 2', 'Hint 3'] },
}

// ── Saddle-point zero-sum — value task ────────────────────────────────────
// Row matrix:  [ [1, 3], [2, 4] ]
// Saddle at (Bottom, Left): min(row Bottom) = 2, max(col Left) = 2 → value = 2.
const saddleBeat: Beat = {
  beatId: 'gt-saddle',
  required: false,
  prompt: 'Find the saddle point.',
  interaction: {
    type: 'payoffMatrix',
    rows: ['Top', 'Bottom'],
    cols: ['Left', 'Right'],
    matrix: [
      {
        cells: [
          { row: { n: 1, d: 1 }, col: { n: -1, d: 1 } },
          { row: { n: 3, d: 1 }, col: { n: -3, d: 1 } },
        ],
      },
      {
        cells: [
          { row: { n: 2, d: 1 }, col: { n: -2, d: 1 } },
          { row: { n: 4, d: 1 }, col: { n: -4, d: 1 } },
        ],
      },
    ],
    task: 'value',
    rowPlayer: 'Row',
    colPlayer: 'Column',
    zeroSum: true,
  },
  feedback: { correct: 'Well done.', hints: ['Hint 1', 'Hint 2', 'Hint 3'] },
}

// ── Matching Pennies — mix task (reducedMotion=true) ──────────────────────
// Zero-sum 2×2: no saddle. Mixed equilibrium: p* = 1/2, q* = 1/2, value = 0.
const matchingPenniesBeat: Beat = {
  beatId: 'gt-matching-pennies',
  required: false,
  prompt: 'Explore mixed strategies in Matching Pennies.',
  interaction: {
    type: 'payoffMatrix',
    rows: ['Heads', 'Tails'],
    cols: ['Heads', 'Tails'],
    matrix: [
      {
        cells: [
          { row: { n: 1, d: 1 }, col: { n: -1, d: 1 } },
          { row: { n: -1, d: 1 }, col: { n: 1, d: 1 } },
        ],
      },
      {
        cells: [
          { row: { n: -1, d: 1 }, col: { n: 1, d: 1 } },
          { row: { n: 1, d: 1 }, col: { n: -1, d: 1 } },
        ],
      },
    ],
    task: 'mix',
    rowPlayer: 'Matcher',
    colPlayer: 'Mismatcher',
    zeroSum: true,
  },
  feedback: { correct: 'Well done.', hints: ['Hint 1', 'Hint 2', 'Hint 3'] },
}

// ── Mismatched interaction type ───────────────────────────────────────────
const wrongTypeBeat: Beat = {
  beatId: 'gt-wrong',
  required: false,
  prompt: 'Not a payoff matrix.',
  interaction: { type: 'recap' },
  feedback: { correct: '', hints: ['', '', ''] },
}

// ─────────────────────────────────────────────────────────────────────────────

describe('PayoffMatrixBeat — dominance (Prisoner\'s Dilemma)', () => {
  const html = renderToString(
    <PayoffMatrixBeat {...BASE_PROPS} beat={pdBeat} reducedMotion={false} />,
  )

  it('renders strategy labels', () => {
    expect(html).toContain('Cooperate')
    expect(html).toContain('Defect')
  })

  it('renders player labels', () => {
    expect(html).toContain('Player 1')
    expect(html).toContain('Player 2')
  })

  it('marks Cooperate row as dominated (engine result)', () => {
    expect(html).toContain('gt-payoff__row-header--dominated')
  })

  it('has an aria-live region', () => {
    expect(html).toContain('aria-live="polite"')
  })

  it('shows both row and column payoffs', () => {
    // Row payoff 3 and col payoff 3 for (C,C)
    expect(html).toContain('gt-payoff__payoff-row')
    expect(html).toContain('gt-payoff__payoff-col')
  })

  it('includes a Solve button for IESDS', () => {
    expect(html).toContain('Solve')
  })
})

describe('PayoffMatrixBeat — nash (Stag Hunt)', () => {
  const html = renderToString(
    <PayoffMatrixBeat {...BASE_PROPS} beat={stagHuntBeat} reducedMotion={false} />,
  )

  it('renders strategy labels', () => {
    expect(html).toContain('Stag')
    expect(html).toContain('Hare')
  })

  it('has an aria-live region', () => {
    expect(html).toContain('aria-live="polite"')
  })

  it('shows progress counter on initial render', () => {
    expect(html).toContain('0 / 2')
  })

  it('shows no NE badges initially (none found yet)', () => {
    expect(html).not.toContain('gt-payoff__ne-badge')
  })

  it('cells are tappable on initial render', () => {
    expect(html).toContain('gt-payoff__cell--tappable')
  })
})

describe('PayoffMatrixBeat — value (saddle point)', () => {
  const html = renderToString(
    <PayoffMatrixBeat {...BASE_PROPS} beat={saddleBeat} reducedMotion={false} />,
  )

  it('renders strategy labels', () => {
    expect(html).toContain('Top')
    expect(html).toContain('Bottom')
    expect(html).toContain('Left')
    expect(html).toContain('Right')
  })

  it('shows saddle-point status text', () => {
    expect(html).toContain('Saddle point')
  })

  it('shows the game value', () => {
    expect(html).toContain('game value = 2')
  })

  it('highlights the saddle cell', () => {
    expect(html).toContain('gt-payoff__cell--saddle')
  })

  it('has an aria-live region', () => {
    expect(html).toContain('aria-live="polite"')
  })
})

describe('PayoffMatrixBeat — mix (Matching Pennies, reducedMotion=true)', () => {
  const html = renderToString(
    <PayoffMatrixBeat
      {...BASE_PROPS}
      beat={matchingPenniesBeat}
      reducedMotion={true}
    />,
  )

  it('renders strategy labels', () => {
    expect(html).toContain('Heads')
    expect(html).toContain('Tails')
  })

  it('shows the mixed equilibrium section', () => {
    expect(html).toContain('Equilibrium')
  })

  it('shows the exact equilibrium probability p* = 1/2', () => {
    expect(html).toContain('1/2')
  })

  it('shows the game value = 0', () => {
    expect(html).toContain('value = 0')
  })

  it('has a slider for p', () => {
    expect(html).toContain('type="range"')
  })

  it('has an aria-live region', () => {
    expect(html).toContain('aria-live="polite"')
  })
})

describe('PayoffMatrixBeat — mismatched interaction type', () => {
  it('renders nothing for a non-payoffMatrix beat', () => {
    const html = renderToString(
      <PayoffMatrixBeat
        {...BASE_PROPS}
        beat={wrongTypeBeat}
        reducedMotion={false}
      />,
    )
    expect(html).toBe('')
  })
})
