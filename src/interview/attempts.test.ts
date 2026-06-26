import { describe, it, expect, vi } from 'vitest'

// attempts.ts imports getDb from '../firebase/app'; mock to prevent
// initializeApp crashing in node env (no valid Firebase config in tests).
vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

import { selectLatest, selectBest } from './attempts'
import type { InterviewAttempt } from './attempts'

// ── Fixture helper ─────────────────────────────────────────────────────────────

const make = (overrides: Partial<InterviewAttempt>): InterviewAttempt => ({
  id: 'a1',
  conceptId: 'course-expected-value',
  questionId: 'q-1',
  fingerprint: 'fp',
  tier: 'hard',
  mode: 'voice',
  status: 'graded',
  startedAt: 0,
  createdAt: 1000,
  ...overrides,
})

// ── selectLatest ───────────────────────────────────────────────────────────────

describe('selectLatest', () => {
  it('returns null on an empty array', () => {
    expect(selectLatest([])).toBeNull()
  })

  it('returns the only attempt when the array has one element', () => {
    const a = make({ id: 'a' })
    expect(selectLatest([a])?.id).toBe('a')
  })

  it('returns the attempt with the highest createdAt', () => {
    const a = make({ id: 'a', createdAt: 1000 })
    const b = make({ id: 'b', createdAt: 2000 })
    expect(selectLatest([a, b])?.id).toBe('b')
    expect(selectLatest([b, a])?.id).toBe('b')
  })

  it('handles three attempts — picks the most recent', () => {
    const a = make({ id: 'a', createdAt: 1000 })
    const b = make({ id: 'b', createdAt: 3000 })
    const c = make({ id: 'c', createdAt: 2000 })
    expect(selectLatest([a, b, c])?.id).toBe('b')
  })
})

// ── selectBest ─────────────────────────────────────────────────────────────────

describe('selectBest', () => {
  it('returns null when no attempts are graded', () => {
    expect(selectBest([make({ status: 'pending', hireSignal: undefined })])).toBeNull()
  })

  it('returns null when no graded attempt has a hireSignal', () => {
    expect(selectBest([make({ status: 'graded', hireSignal: undefined })])).toBeNull()
  })

  it('returns the single graded attempt with a hireSignal', () => {
    const a = make({ id: 'a', hireSignal: 'Yes' })
    expect(selectBest([a])?.id).toBe('a')
  })

  it('returns the attempt with the highest hireSignal rank', () => {
    const a = make({ id: 'a', hireSignal: 'No' })
    const b = make({ id: 'b', hireSignal: 'Yes' })
    expect(selectBest([a, b])?.id).toBe('b')
    expect(selectBest([b, a])?.id).toBe('b')
  })

  it('Strong Yes beats Yes', () => {
    const a = make({ id: 'a', hireSignal: 'Yes' })
    const b = make({ id: 'b', hireSignal: 'Strong Yes' })
    expect(selectBest([a, b])?.id).toBe('b')
  })

  it('covers the full ranking order (Strong No < No < Lean No < Lean Yes < Yes < Strong Yes)', () => {
    const signals = ['Strong No', 'No', 'Lean No', 'Lean Yes', 'Yes', 'Strong Yes'] as const
    const attempts = signals.map((hireSignal, i) =>
      make({ id: `a${i}`, hireSignal }),
    )
    expect(selectBest(attempts)?.hireSignal).toBe('Strong Yes')
  })

  it('ignores pending attempts when mixed with graded', () => {
    const pending = make({ id: 'p', status: 'pending', hireSignal: undefined })
    const graded = make({ id: 'g', status: 'graded', hireSignal: 'Lean Yes' })
    expect(selectBest([pending, graded])?.id).toBe('g')
  })
})
