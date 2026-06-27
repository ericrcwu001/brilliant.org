// Pure unit tests for the Daily Review hero model (spec-20 §8.1). Node env, no
// Firebase/React — rampNote + buildHeroModel are dependency-free.

import { describe, it, expect } from 'vitest'
import { rampNote, buildHeroModel } from './dailyReview.model'

// A fixed "now" so the calendar-day math is deterministic.
const NOW = new Date(2026, 5, 27) // 2026-06-27 local midnight
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function inDays(n: number): string {
  const t = new Date(NOW)
  t.setDate(t.getDate() + n)
  return iso(t)
}

describe('rampNote (§4.4)', () => {
  it('returns null when targetInterviewDate is undefined', () => {
    expect(rampNote(undefined, NOW, 3)).toBeNull()
  })

  it('returns null when dueCount === 0 (nothing to ramp)', () => {
    expect(rampNote(inDays(2), NOW, 0)).toBeNull()
  })

  it('returns null when the date is malformed', () => {
    expect(rampNote('not-a-date', NOW, 3)).toBeNull()
    expect(rampNote('2026-13-40', NOW, 3)).toBeNull()
  })

  it('returns null when daysUntil > 14 (far away)', () => {
    expect(rampNote(inDays(15), NOW, 3)).toBeNull()
  })

  it('8–14 days → "keeps it warm" line (boundary 14 and 8)', () => {
    expect(rampNote(inDays(14), NOW, 3)).toBe('Interview in 14 days — daily review keeps it warm.')
    expect(rampNote(inDays(8), NOW, 3)).toBe('Interview in 8 days — daily review keeps it warm.')
  })

  it('4–7 days → "ramping up" line (boundary 7 and 4)', () => {
    expect(rampNote(inDays(7), NOW, 3)).toBe('Interview in 7 days — reviews are ramping up.')
    expect(rampNote(inDays(4), NOW, 3)).toBe('Interview in 4 days — reviews are ramping up.')
  })

  it('≤3 days → final-stretch line (boundary 3 and 1, singular at 1)', () => {
    expect(rampNote(inDays(3), NOW, 3)).toBe("Final stretch — 3 days to go. Clear today's queue.")
    expect(rampNote(inDays(1), NOW, 3)).toBe("Final stretch — 1 day to go. Clear today's queue.")
  })

  it('day-of (0) → interview-day line; past (-1) → same forgiving line', () => {
    expect(rampNote(inDays(0), NOW, 3)).toBe('Interview day. One last pass.')
    expect(rampNote(inDays(-1), NOW, 3)).toBe('Interview day. One last pass.')
  })
})

describe('buildHeroModel state derivation (§4.5 — covers both empty states)', () => {
  it('!hasAnyCards && !hasCompletedLessons ⇒ hidden (regardless of dueCount)', () => {
    expect(buildHeroModel(0, false, false, undefined, NOW).state).toBe('hidden')
    // Even a stray dueCount can't happen without cards, but the order guarantees hidden.
    expect(buildHeroModel(5, false, false, undefined, NOW).state).toBe('hidden')
  })

  it('!hasAnyCards && hasCompletedLessons ⇒ no-deck (never caught-up)', () => {
    const m = buildHeroModel(0, false, true, undefined, NOW)
    expect(m.state).toBe('no-deck')
    expect(m.state).not.toBe('caught-up')
  })

  it('hasAnyCards && dueCount === 0 ⇒ caught-up', () => {
    expect(buildHeroModel(0, true, true, undefined, NOW).state).toBe('caught-up')
  })

  it('hasAnyCards && dueCount > 0 ⇒ due (no near date)', () => {
    expect(buildHeroModel(4, true, true, undefined, NOW).state).toBe('due')
  })

  it('hasAnyCards && dueCount > 0 && near target date ⇒ ramp', () => {
    const m = buildHeroModel(4, true, true, inDays(2), NOW)
    expect(m.state).toBe('ramp')
    expect(m.rampNote).toBe("Final stretch — 2 days to go. Clear today's queue.")
  })

  it('a far target date does NOT promote due → ramp', () => {
    const m = buildHeroModel(4, true, true, inDays(30), NOW)
    expect(m.state).toBe('due')
    expect(m.rampNote).toBeNull()
  })

  it('passes dueCount through and composes the rampNote field', () => {
    const m = buildHeroModel(7, true, true, inDays(5), NOW)
    expect(m.dueCount).toBe(7)
    expect(m.rampNote).toBe('Interview in 5 days — reviews are ramping up.')
    expect(m.hasAnyCards).toBe(true)
    expect(m.hasCompletedLessons).toBe(true)
  })

  it('the caught-up state is NEVER produced while !hasAnyCards (the §4.5 invariant)', () => {
    for (const hasCompleted of [true, false]) {
      for (const due of [0, 1, 9]) {
        const m = buildHeroModel(due, false, hasCompleted, undefined, NOW)
        expect(m.state).not.toBe('caught-up')
      }
    }
  })
})
