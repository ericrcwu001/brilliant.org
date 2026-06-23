import { describe, it, expect } from 'vitest'
import { buildAutomaton } from '../engine/automaton'
import { stateTapHint } from './stateTapHints'

describe('stateTapHint', () => {
  const hh = buildAutomaton('HH', 0.5)
  const ht = buildAutomaton('HT', 0.5)

  describe('HH — E1 on T (reset)', () => {
    it('level 1 points at the edge', () => {
      expect(stateTapHint(hh, 'E1', 'T', 1)).toBe(
        'Watch where H (E1) goes on a T.',
      )
    })

    it('level 2 describes a near-miss reset', () => {
      expect(stateTapHint(hh, 'E1', 'T', 2)).toMatch(/near-miss/)
    })

    it('level 3 reveals E0', () => {
      expect(stateTapHint(hh, 'E1', 'T', 3)).toBe('E1 on T goes to E0 (∅).')
    })
  })

  describe('HH — E1 on H (advance)', () => {
    it('level 2 describes extending the match', () => {
      expect(stateTapHint(hh, 'E1', 'H', 2)).toMatch(/extends the match/)
    })

    it('level 3 reveals E2', () => {
      expect(stateTapHint(hh, 'E1', 'H', 3)).toBe('E1 on H goes to E2 (HH).')
    })
  })

  describe('HT — E1 on H (self-loop)', () => {
    it('level 2 describes preserved progress', () => {
      expect(stateTapHint(ht, 'E1', 'H', 2)).toMatch(/progress is preserved/)
    })

    it('level 3 reveals E1', () => {
      expect(stateTapHint(ht, 'E1', 'H', 3)).toBe('E1 on H goes to E1 (H).')
    })
  })
})
