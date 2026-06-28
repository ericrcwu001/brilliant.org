// spec-05 server flags — fail-closed, TTL cache, serverGatedOn, schema parity.
// firebase-admin/firestore is mocked so importing flags.ts does not boot the
// runtime; the doc reader is swapped via the test seam.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    doc: () => ({ get: async () => ({ exists: false, data: () => undefined }) }),
  })),
}))

import {
  ServerFlagsSchema,
  DEFAULT_FLAGS_SERVER,
  loadServerFlags,
  serverGatedOn,
  __setFlagsDocReaderForTest,
} from './flags'

// The client FlagsSchema (src/config/flags.ts) cannot be imported into the
// functions node env (it pulls firebase/app + import.meta.env). Instead, pin the
// canonical key set HERE; src/config/flags.test.ts asserts the client schema
// matches the same literal keys, so the two specs together guard against drift.
const CANONICAL_FLAG_KEYS = [
  'dailyReviewQueue',
  'difficultyGovernor',
  'brutalMockFloor',
  'goldMint',
  'rolloutPercent',
].sort()

beforeEach(() => {
  __setFlagsDocReaderForTest(null) // reset cache + reader to the default
})

describe('ServerFlagsSchema / DEFAULT_FLAGS_SERVER (2026-06-28 — default-on)', () => {
  it('parses {} to all-on', () => {
    expect(DEFAULT_FLAGS_SERVER).toEqual({
      dailyReviewQueue: true,
      difficultyGovernor: true,
      brutalMockFloor: true,
      goldMint: true,
      rolloutPercent: 100,
    })
  })
})

describe('loadServerFlags (fails open — defaults all-on)', () => {
  it('returns DEFAULT_FLAGS_SERVER when the doc is absent', async () => {
    __setFlagsDocReaderForTest(async () => undefined)
    const flags = await loadServerFlags(1)
    expect(flags).toEqual(DEFAULT_FLAGS_SERVER)
  })

  it('returns DEFAULT_FLAGS_SERVER when the reader THROWS (fails open)', async () => {
    __setFlagsDocReaderForTest(async () => {
      throw new Error('firestore down')
    })
    const flags = await loadServerFlags(1)
    expect(flags).toEqual(DEFAULT_FLAGS_SERVER)
  })

  it('parses a real doc (an explicitly-killed flag reads through)', async () => {
    __setFlagsDocReaderForTest(async () => ({ dailyReviewQueue: false, rolloutPercent: 25 }))
    const flags = await loadServerFlags(1)
    expect(flags.dailyReviewQueue).toBe(false) // explicit kill reads through
    expect(flags.rolloutPercent).toBe(25)
    expect(flags.goldMint).toBe(true) // default-on
  })

  it('fails open on a malformed doc (parse failure ⇒ DEFAULT_FLAGS_SERVER)', async () => {
    __setFlagsDocReaderForTest(async () => ({ goldMint: 'yes-please' }))
    const flags = await loadServerFlags(1)
    expect(flags).toEqual(DEFAULT_FLAGS_SERVER)
  })

  it('caches within the TTL and refreshes after it (kill flip propagates ≤60s)', async () => {
    let calls = 0
    __setFlagsDocReaderForTest(async () => {
      calls++
      return { goldMint: calls === 1 } // first read: on; later: off (a kill flip)
    })
    const t0 = 1_000_000
    expect((await loadServerFlags(t0)).goldMint).toBe(true) // read 1
    expect((await loadServerFlags(t0 + 30_000)).goldMint).toBe(true) // cached, no read
    expect(calls).toBe(1)
    // After the TTL the doc is re-read → the kill flip is now visible.
    expect((await loadServerFlags(t0 + 61_000)).goldMint).toBe(false)
    expect(calls).toBe(2)
  })
})

describe('serverGatedOn (gold-mint kill — D17)', () => {
  it('holdout ⇒ false even when the flag is ON (control cohort kill switch)', () => {
    expect(serverGatedOn('goldMint', 'holdout', DEFAULT_FLAGS_SERVER)).toBe(false)
  })

  it('an explicitly-killed flag ⇒ false (kill switch still works post-default-on)', () => {
    expect(serverGatedOn('goldMint', 'treatment', { ...DEFAULT_FLAGS_SERVER, goldMint: false })).toBe(false)
    expect(serverGatedOn('goldMint', undefined, { ...DEFAULT_FLAGS_SERVER, goldMint: false })).toBe(false)
  })

  it('treatment + flag-on (default) ⇒ true', () => {
    expect(serverGatedOn('goldMint', 'treatment', DEFAULT_FLAGS_SERVER)).toBe(true)
  })

  it('undefined cohort + flag-on ⇒ true (cohort not yet assigned is not holdout)', () => {
    expect(serverGatedOn('goldMint', undefined, DEFAULT_FLAGS_SERVER)).toBe(true)
  })
})

describe('client ↔ server schema parity (drift guard)', () => {
  it('ServerFlagsSchema keys == the canonical flag key set (matches the client)', () => {
    const serverKeys = Object.keys(ServerFlagsSchema.shape).sort()
    expect(serverKeys).toEqual(CANONICAL_FLAG_KEYS)
  })

  it('server goldMint default is ON (the client asserts the same in its own suite)', () => {
    expect(ServerFlagsSchema.parse({}).goldMint).toBe(true)
  })
})
