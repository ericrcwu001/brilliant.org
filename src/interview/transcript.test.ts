// buildTranscript is the pure exported helper in useRealtimeInterview.ts;
// tests run in node env, no hooks called.
import { describe, it, expect, vi } from 'vitest'

// useRealtimeInterview.ts imports functions.ts → firebase/app; mock to prevent
// initializeApp crashing in node env (no valid Firebase config in tests).
vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

import { buildTranscript } from './useRealtimeInterview'
import type { Turn } from '../content/interviewPack'

function makeTurn(
  role: Turn['role'],
  text: string,
  final: boolean,
  ts = 0,
): Turn {
  return { role, text, ts, final }
}

describe('buildTranscript', () => {
  it('returns an empty array for an empty input', () => {
    expect(buildTranscript([])).toEqual([])
  })

  it('includes only turns where final === true', () => {
    const turns: Turn[] = [
      makeTurn('interviewer', 'Hello', true),
      makeTurn('candidate', 'in progress…', false),
      makeTurn('candidate', 'My answer is 42.', true),
    ]
    const result = buildTranscript(turns)
    expect(result).toHaveLength(2)
    expect(result.every((t) => t.final)).toBe(true)
  })

  it('excludes all turns when none are final', () => {
    const turns: Turn[] = [
      makeTurn('interviewer', 'delta…', false),
      makeTurn('candidate', 'typing…', false),
    ]
    expect(buildTranscript(turns)).toEqual([])
  })

  it('maps completed interviewer turns to role=interviewer', () => {
    const turns: Turn[] = [makeTurn('interviewer', 'Explain EV.', true, 100)]
    const result = buildTranscript(turns)
    expect(result[0].role).toBe('interviewer')
  })

  it('maps completed candidate turns to role=candidate', () => {
    const turns: Turn[] = [makeTurn('candidate', 'EV = Σ x·P(x).', true, 200)]
    const result = buildTranscript(turns)
    expect(result[0].role).toBe('candidate')
  })

  it('preserves order of the input array', () => {
    const turns: Turn[] = [
      makeTurn('interviewer', 'Q1', true, 100),
      makeTurn('candidate', 'A1', true, 200),
      makeTurn('interviewer', 'Q2', true, 300),
    ]
    const result = buildTranscript(turns)
    expect(result.map((t) => t.text)).toEqual(['Q1', 'A1', 'Q2'])
  })
})
