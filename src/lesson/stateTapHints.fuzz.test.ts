// Pass C (robustness / O2) — every outgoing transition of every curated pattern
// must yield non-empty hint copy at all three ladder levels, so the stateTap
// beat can never render a blank or crash on a valid tap.

import { describe, it, expect } from 'vitest'
import { buildAutomaton } from '../engine/automaton'
import { stateTapHint } from './stateTapHints'

const PATTERNS = ['HH', 'HT', 'THH', 'HTH']

describe('stateTapHint enumeration (all transitions x levels)', () => {
  it('returns non-empty hints for every non-absorbing transition', () => {
    for (const pattern of PATTERNS) {
      const a = buildAutomaton(pattern, 0.5)
      for (const s of a.states) {
        if (s.absorbing) continue // absorbing states have no outgoing edges
        for (const on of ['H', 'T'] as const) {
          for (const level of [1, 2, 3] as const) {
            const hint = stateTapHint(a, s.id, on, level)
            expect(typeof hint).toBe('string')
            expect(hint.length).toBeGreaterThan(0)
          }
        }
      }
    }
  })
})
