// stampConfidence pure-helper tests (spec-02 / D6). NODE env.
// useRealtimeInterview.ts imports functions.ts → firebase/app; mock to prevent
// initializeApp crashing in node env (no valid Firebase config in tests).
import { describe, it, expect, vi } from 'vitest'

vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

import { stampConfidence } from './useRealtimeInterview'
import type { Turn } from '../content/interviewPack'

function turn(role: Turn['role'], text: string, ts = 0): Turn {
  return { role, text, ts, final: true }
}

describe('stampConfidence (spec-02 / D6)', () => {
  it('stamps confidence onto the LAST candidate turn only', () => {
    const turns: Turn[] = [
      turn('interviewer', 'Q1'),
      turn('candidate', 'A1'),
      turn('interviewer', 'follow-up'),
      turn('candidate', 'A2'),
    ]
    const out = stampConfidence(turns, 0.85)
    expect(out[1].confidence).toBeUndefined() // first candidate untouched
    expect(out[3].confidence).toBe(0.85) // last candidate stamped
    expect(out[0].confidence).toBeUndefined()
    expect(out[2].confidence).toBeUndefined()
  })

  it('returns the input unchanged when there is no candidate turn', () => {
    const turns: Turn[] = [turn('interviewer', 'only the interviewer spoke')]
    expect(stampConfidence(turns, 0.7)).toBe(turns)
  })

  it('never mutates the input array or its turns', () => {
    const turns: Turn[] = [turn('candidate', 'A1')]
    const out = stampConfidence(turns, 1.0)
    expect(out).not.toBe(turns) // new array
    expect(out[0]).not.toBe(turns[0]) // new turn object
    expect(turns[0].confidence).toBeUndefined() // original untouched
    expect(out[0].confidence).toBe(1.0)
  })
})
