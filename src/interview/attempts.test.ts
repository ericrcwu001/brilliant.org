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

// ── selectBest (mean rubric score — spec-23 §3.4, hireSignal removed / D11) ──────

// A report blob carrying the five dimension scores (only `score` matters here).
const reportWith = (score: number) => ({
  dimensions: {
    correctness:   { score, evidence: '' },
    approach:      { score, evidence: '' },
    rigor:         { score, evidence: '' },
    communication: { score, evidence: '' },
    speed:         { score, evidence: '' },
  },
})

describe('selectBest', () => {
  it('returns null on an empty array', () => {
    expect(selectBest([])).toBeNull()
  })

  it('returns null when no attempts are graded', () => {
    expect(selectBest([make({ status: 'pending', report: reportWith(5) })])).toBeNull()
  })

  it('excludes an attempt with no report (mean null)', () => {
    expect(selectBest([make({ status: 'graded', report: undefined })])).toBeNull()
  })

  it('excludes an attempt whose dimensions are malformed (missing score)', () => {
    const bad = make({
      status: 'graded',
      report: { dimensions: { correctness: { evidence: 'x' } } },
    })
    expect(selectBest([bad])).toBeNull()
  })

  it('returns the single graded attempt with a usable report', () => {
    const a = make({ id: 'a', report: reportWith(3) })
    expect(selectBest([a])?.id).toBe('a')
  })

  it('returns the attempt with the highest mean rubric score (all-5 beats all-3)', () => {
    const a = make({ id: 'a', report: reportWith(3) })
    const b = make({ id: 'b', report: reportWith(5) })
    expect(selectBest([a, b])?.id).toBe('b')
    expect(selectBest([b, a])?.id).toBe('b')
  })

  it('tie on mean score → the more-recent createdAt wins', () => {
    const older = make({ id: 'old', createdAt: 1000, report: reportWith(4) })
    const newer = make({ id: 'new', createdAt: 2000, report: reportWith(4) })
    expect(selectBest([older, newer])?.id).toBe('new')
    expect(selectBest([newer, older])?.id).toBe('new')
  })

  it('never selects a pending attempt even with a high-scoring report', () => {
    const pending = make({ id: 'p', status: 'pending', report: reportWith(5) })
    const graded = make({ id: 'g', status: 'graded', report: reportWith(3) })
    expect(selectBest([pending, graded])?.id).toBe('g')
  })
})
