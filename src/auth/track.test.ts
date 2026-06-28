import { describe, it, expect, vi } from 'vitest'

// gatedOn pulls in src/config/flags, which imports firebase/app at module load
// (getAuth throws in the node test env without a real config). Mock it — the
// chokepoint logic under test never touches the SDK.
vi.mock('../firebase/app', () => ({ app: {}, usingEmulators: true }))

import { isQuantIntensity, gatedOn, type GatedFeature } from './track'
import type { UserDoc } from './userDoc'
import type { Progress } from '../content/schema'
import { DEFAULT_FLAGS, FlagsSchema, type Flags } from '../config/flags'

const doc = (p: Partial<UserDoc>): UserDoc => ({ displayName: 'x', ...p })
const flagsOn = (f: Partial<Flags>): Flags => FlagsSchema.parse(f)

describe('isQuantIntensity (collapsed 2026-06-28 — quant-intensity for everyone)', () => {
  it('is true regardless of track / goal / missing inputs (the A/B split is collapsed)', () => {
    expect(isQuantIntensity(undefined)).toBe(true)
    expect(isQuantIntensity(null)).toBe(true)
    expect(isQuantIntensity(doc({}))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'B' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A', learningGoal: 'school' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A', learningGoal: 'interview' }))).toBe(true)
  })

  it('no longer downgrades on a per-concept Track A override', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'B' }), { track: 'A' } as Progress)).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A' }), { track: 'A' } as Progress)).toBe(true)
  })
})

describe('gatedOn (spec-05 rollout chokepoint — D17; default-on 2026-06-28)', () => {
  const features: GatedFeature[] = [
    'dailyReviewQueue',
    'difficultyGovernor',
    'brutalMockFloor',
    'goldMint',
  ]

  it('DEFAULT-ON: DEFAULT_FLAGS ⇒ every feature on for a treatment user', () => {
    const u = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    for (const f of features) expect(gatedOn(f, u, DEFAULT_FLAGS)).toBe(true)
  })

  it('DEFAULT-ON reaches even a gentle Track-A treatment user (split collapsed)', () => {
    const u = doc({ defaultTrack: 'A', rolloutCohort: 'treatment' })
    for (const f of features) expect(gatedOn(f, u, DEFAULT_FLAGS)).toBe(true)
  })

  it('holdout ⇒ always false regardless of flag + intensity (control cohort kill switch)', () => {
    const u = doc({ defaultTrack: 'B', learningGoal: 'interview', rolloutCohort: 'holdout' })
    for (const f of features) expect(gatedOn(f, u, DEFAULT_FLAGS)).toBe(false)
  })

  it('an explicitly-killed flag ⇒ false even for treatment (kill switch still works)', () => {
    const u = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    // brutalMockFloor killed, the others left on (now-default true) → only it is off.
    const flags = flagsOn({ brutalMockFloor: false })
    expect(gatedOn('brutalMockFloor', u, flags)).toBe(false)
    expect(gatedOn('difficultyGovernor', u, flags)).toBe(true)
    expect(gatedOn('dailyReviewQueue', u, flags)).toBe(true)
    expect(gatedOn('goldMint', u, flags)).toBe(true)
  })

  it('treatment + flag-on ⇒ true for everyone (intensity no longer downgrades)', () => {
    const flags = flagsOn({ dailyReviewQueue: true })
    const intense = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    expect(gatedOn('dailyReviewQueue', intense, flags)).toBe(true)
    // A gentle Track-A treatment user now ALSO passes (was false pre-2026-06-28).
    const gentle = doc({ defaultTrack: 'A', rolloutCohort: 'treatment' })
    expect(gatedOn('dailyReviewQueue', gentle, flags)).toBe(true)
    expect(gatedOn('dailyReviewQueue', gentle, flags)).toBe(isQuantIntensity(gentle))
  })

  it('a per-concept Track A override no longer fails gentle (split collapsed)', () => {
    const u = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    const flags = flagsOn({ difficultyGovernor: true })
    expect(gatedOn('difficultyGovernor', u, flags, { track: 'A' } as Progress)).toBe(true)
  })

  it('a user with NO cohort assigned yet (undefined) still passes a flagged feature', () => {
    // undefined cohort is NOT holdout — it just hasn't been assigned.
    const u = doc({ defaultTrack: 'B' }) // no rolloutCohort
    expect(gatedOn('brutalMockFloor', u, flagsOn({ brutalMockFloor: true }))).toBe(true)
  })
})
