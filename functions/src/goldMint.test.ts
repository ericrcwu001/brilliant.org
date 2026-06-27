// spec-11 — pure gold-mint qualification (no firebase runtime needed; the only
// import is the type-only Timestamp, so this file does NOT mock firebase-admin).

import { describe, it, expect } from 'vitest'
import { qualifiesForGoldMint, isLaterUtcDay } from './goldMint'
import type { Timestamp } from 'firebase-admin/firestore'

// Minimal fake of the admin Timestamp shape qualifiesForGoldMint reads (.toDate()).
const ts = (iso: string): Timestamp =>
  ({ toDate: () => new Date(iso) }) as unknown as Timestamp

const NOW = new Date('2026-06-27T12:00:00.000Z')

describe('isLaterUtcDay', () => {
  it('false on the same UTC day', () => {
    expect(isLaterUtcDay(new Date('2026-06-27T00:00:00Z'), NOW)).toBe(false)
    expect(isLaterUtcDay(new Date('2026-06-27T23:59:59Z'), NOW)).toBe(false)
  })

  it('true when the card day is strictly earlier (next day / far future now)', () => {
    expect(isLaterUtcDay(new Date('2026-06-26T23:00:00Z'), NOW)).toBe(true)
    expect(isLaterUtcDay(new Date('2026-01-01T00:00:00Z'), NOW)).toBe(true)
  })

  it('false when the card day is LATER than now (no time-travel mint)', () => {
    expect(isLaterUtcDay(new Date('2026-06-28T00:00:00Z'), NOW)).toBe(false)
  })
})

describe('qualifiesForGoldMint', () => {
  it('Track A: a DELAYED pass on a checkpoint card qualifies', () => {
    expect(qualifiesForGoldMint({ createdAt: ts('2026-06-26T12:00:00Z') }, NOW, 'A')).toBe(true)
  })

  it('Track A: a SAME-day pass does NOT qualify (not delayed)', () => {
    expect(qualifiesForGoldMint({ createdAt: ts('2026-06-27T08:00:00Z') }, NOW, 'A')).toBe(false)
  })

  it('Track B: a delayed pass on a NON-transfer (checkpoint) card does NOT qualify', () => {
    // isTransfer absent (undefined) — the same-checkpoint re-retrieve is not enough.
    expect(qualifiesForGoldMint({ createdAt: ts('2026-06-26T12:00:00Z') }, NOW, 'B')).toBe(false)
    expect(
      qualifiesForGoldMint({ createdAt: ts('2026-06-26T12:00:00Z'), isTransfer: false }, NOW, 'B'),
    ).toBe(false)
  })

  it('Track B: a delayed pass on a TRANSFER card qualifies', () => {
    expect(
      qualifiesForGoldMint({ createdAt: ts('2026-06-26T12:00:00Z'), isTransfer: true }, NOW, 'B'),
    ).toBe(true)
  })

  it('Track B: a SAME-day pass on a transfer card does NOT qualify (delay gate first)', () => {
    expect(
      qualifiesForGoldMint({ createdAt: ts('2026-06-27T08:00:00Z'), isTransfer: true }, NOW, 'B'),
    ).toBe(false)
  })

  it('Track A on a transfer card is also fine when delayed (track gate is the only difference)', () => {
    expect(
      qualifiesForGoldMint({ createdAt: ts('2026-06-26T12:00:00Z'), isTransfer: true }, NOW, 'A'),
    ).toBe(true)
  })
})
