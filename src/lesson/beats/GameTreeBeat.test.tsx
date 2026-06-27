// Smoke tests for GameTreeBeat — runs in Node via renderToString.
// No jsdom, no click simulation. Asserts key static structure for
// reduced-motion (fully-solved final frame), interactive, and mismatched-type.

import { vi, describe, it, expect } from 'vitest'

// GameTreeBeat → BeatShell → (transitive) → firebase/app. Mock so Node can run.
vi.mock('../../firebase/app', () => ({
  getDb: () => Promise.resolve({}),
  getFns: () => Promise.resolve({}),
  auth: {},
  app: {},
  usingEmulators: false,
}))

import { renderToString } from 'react-dom/server'
import { GameTreeBeat } from './GameTreeBeat'
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

// Centipede-style 2-decision tree:
//   Root (Player 0): Take → leaf [1,0] | Pass → (Player 1: Take → [0,2] | Pass → [2,2])
//
// SPE by backward induction:
//   Player 1: max(payoff[1]) = max(2, 2) → tie → first move = Take → result [0,2]
//   Player 0: max(payoff[0]) = max(1, 0) → Take → result [1,0]
//   SPE payoff = "1,0", SPE path = ["Take"]
const centipedeBeat: Beat = {
  beatId: 'gt-centipede',
  required: false,
  prompt: 'Fold the game tree to find the subgame-perfect equilibrium.',
  interaction: {
    type: 'gameTree',
    root: {
      kind: 'decision',
      player: 0,
      moves: [
        {
          label: 'Take',
          child: {
            kind: 'leaf',
            payoff: [
              { n: 1, d: 1 },
              { n: 0, d: 1 },
            ],
          },
        },
        {
          label: 'Pass',
          child: {
            kind: 'decision',
            player: 1,
            moves: [
              {
                label: 'Take',
                child: {
                  kind: 'leaf',
                  payoff: [
                    { n: 0, d: 1 },
                    { n: 2, d: 1 },
                  ],
                },
              },
              {
                label: 'Pass',
                child: {
                  kind: 'leaf',
                  payoff: [
                    { n: 2, d: 1 },
                    { n: 2, d: 1 },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    players: ['Player 1', 'Player 2'],
  },
  feedback: { correct: '', hints: ['', '', ''] },
}

describe('GameTreeBeat', () => {
  describe('reduced-motion: renders fully-folded final frame', () => {
    const html = renderToString(
      <GameTreeBeat {...BASE_PROPS} beat={centipedeBeat} reducedMotion={true} />,
    )

    it('renders player names', () => {
      expect(html).toContain('Player 1')
      expect(html).toContain('Player 2')
    })

    it('renders move labels', () => {
      expect(html).toContain('Take')
      expect(html).toContain('Pass')
    })

    it('shows the SPE payoff in the reduced-motion final frame', () => {
      expect(html).toContain('1,0')
    })

    it('shows the SPE badge', () => {
      expect(html).toContain('SPE payoff')
    })

    it('announces the SPE outcome in the aria-live region', () => {
      expect(html).toContain('Subgame-perfect equilibrium')
    })

    it('has an aria-live region for screen-reader announcements', () => {
      expect(html).toContain('aria-live="polite"')
    })

    it('does not show the "Solve from the end" button when already solved', () => {
      expect(html).not.toContain('Solve from the end')
    })
  })

  describe('interactive: renders unsolved tree', () => {
    const html = renderToString(
      <GameTreeBeat
        {...BASE_PROPS}
        beat={centipedeBeat}
        reducedMotion={false}
      />,
    )

    it('renders player names', () => {
      expect(html).toContain('Player 1')
      expect(html).toContain('Player 2')
    })

    it('shows leaf payoffs', () => {
      expect(html).toContain('0,2')
      expect(html).toContain('2,2')
    })

    it('shows the "Solve from the end" affordance', () => {
      expect(html).toContain('Solve from the end')
    })

    it('has an aria-live region present', () => {
      expect(html).toContain('aria-live="polite"')
    })

    it('does not show the SPE badge before solving', () => {
      expect(html).not.toContain('SPE payoff')
    })
  })

  describe('mismatched type returns empty string', () => {
    const wrongBeat: Beat = {
      beatId: 'other',
      required: false,
      prompt: 'Not a game tree.',
      interaction: { type: 'recap' },
      feedback: { correct: '', hints: ['', '', ''] },
    }

    it('renders nothing for a mismatched interaction type', () => {
      const html = renderToString(
        <GameTreeBeat
          {...BASE_PROPS}
          beat={wrongBeat}
          reducedMotion={false}
        />,
      )
      expect(html).toBe('')
    })
  })
})
