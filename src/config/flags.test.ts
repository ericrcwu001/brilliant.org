// spec-05 client flags + cohort tests (pure parse / fail-closed / assignment).
// firebase/app is mocked so importing flags.ts does not boot the SDK; loadFlags
// runs the emulator-skip path (usingEmulators:true) which returns ALL_OFF.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../firebase/app', () => ({
  app: {},
  usingEmulators: true, // skip Remote Config in tests → loadFlags resolves ALL_OFF
}))

import {
  FlagsSchema,
  ALL_OFF,
  loadFlags,
  getFlagsSync,
  assignCohort,
  __resetFlagsForTest,
  type Flags,
} from './flags'

beforeEach(() => {
  __resetFlagsForTest()
})

describe('FlagsSchema / ALL_OFF (R14 — every feature DEFAULT-OFF)', () => {
  it('parses {} to all-off defaults', () => {
    const flags = FlagsSchema.parse({})
    expect(flags.dailyReviewQueue).toBe(false)
    expect(flags.difficultyGovernor).toBe(false)
    expect(flags.brutalMockFloor).toBe(false)
    expect(flags.goldMint).toBe(false)
    expect(flags.rolloutPercent).toBe(0)
  })

  it('ALL_OFF is every feature off', () => {
    expect(ALL_OFF).toEqual({
      dailyReviewQueue: false,
      difficultyGovernor: false,
      brutalMockFloor: false,
      goldMint: false,
      rolloutPercent: 0,
    })
  })

  it('strips unknown keys (a backend typo cannot smuggle a truthy gate)', () => {
    const flags = FlagsSchema.parse({ somethingOn: true, dailyReviewQueue: true } as unknown)
    expect((flags as Record<string, unknown>).somethingOn).toBeUndefined()
    expect(flags.dailyReviewQueue).toBe(true)
  })

  it('rejects an out-of-range rolloutPercent (parse fails, caller falls back)', () => {
    expect(FlagsSchema.safeParse({ rolloutPercent: 150 }).success).toBe(false)
    expect(FlagsSchema.safeParse({ rolloutPercent: -1 }).success).toBe(false)
  })
})

describe('loadFlags / getFlagsSync (fail-closed)', () => {
  it('returns ALL_OFF in emulator/dev (no Remote Config backend)', async () => {
    const flags = await loadFlags()
    expect(flags).toEqual(ALL_OFF)
  })

  it('getFlagsSync returns ALL_OFF until loadFlags resolves, and the cached value after', async () => {
    expect(getFlagsSync()).toEqual(ALL_OFF) // default before load
    await loadFlags()
    expect(getFlagsSync()).toEqual(ALL_OFF)
  })
})

describe('assignCohort (deterministic, monotonic — README §4.5)', () => {
  const uids = Array.from({ length: 200 }, (_, i) => `user-${i}`)

  it('rolloutPercent=0 ⇒ everyone holdout', () => {
    for (const uid of uids) expect(assignCohort(uid, 0)).toBe('holdout')
  })

  it('rolloutPercent=100 ⇒ everyone treatment', () => {
    for (const uid of uids) expect(assignCohort(uid, 100)).toBe('treatment')
  })

  it('is deterministic in uid (same uid + % ⇒ same cohort)', () => {
    for (const uid of uids) {
      expect(assignCohort(uid, 37)).toBe(assignCohort(uid, 37))
    }
  })

  it('is MONOTONIC in rolloutPercent (raising % never moves a user OUT of treatment)', () => {
    for (const uid of uids) {
      const ramp = [0, 5, 25, 50, 75, 100]
      let everTreatment = false
      for (const pct of ramp) {
        const cohort = assignCohort(uid, pct)
        if (everTreatment) {
          // once treatment at a lower %, must stay treatment at every higher %.
          expect(cohort).toBe('treatment')
        }
        if (cohort === 'treatment') everTreatment = true
      }
    }
  })

  it('clamps an out-of-range percent (no throw; 0..100 semantics hold)', () => {
    expect(assignCohort('x', -10)).toBe('holdout')
    expect(assignCohort('x', 200)).toBe('treatment')
  })

  it('produces a roughly uniform split at 50% (sanity, not exact)', () => {
    const treatment = uids.filter((u) => assignCohort(u, 50) === 'treatment').length
    // 200 users at 50% — expect a broad band, not a degenerate all-one-side split.
    expect(treatment).toBeGreaterThan(60)
    expect(treatment).toBeLessThan(140)
  })
})

describe('flags type export', () => {
  it('Flags is the inferred schema type', () => {
    const f: Flags = ALL_OFF
    expect(typeof f.dailyReviewQueue).toBe('boolean')
  })
})

describe('client ↔ server schema parity (drift guard — pins the canonical keys)', () => {
  // functions/src/flags.test.ts pins the SAME literal key set on the server
  // ServerFlagsSchema; together they guard against the two schemas drifting (the
  // client schema cannot be imported into the functions node env, so the key set
  // is the shared contract checked on both sides).
  const CANONICAL_FLAG_KEYS = [
    'dailyReviewQueue',
    'difficultyGovernor',
    'brutalMockFloor',
    'goldMint',
    'rolloutPercent',
  ].sort()
  it('FlagsSchema keys == the canonical flag key set', () => {
    expect(Object.keys(FlagsSchema.shape).sort()).toEqual(CANONICAL_FLAG_KEYS)
  })
})
