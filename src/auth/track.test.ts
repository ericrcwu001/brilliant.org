import { describe, it, expect, vi } from 'vitest'

// gatedOn pulls in src/config/flags, which imports firebase/app at module load
// (getAuth throws in the node test env without a real config). Mock it — the
// chokepoint logic under test never touches the SDK.
vi.mock('../firebase/app', () => ({ app: {}, usingEmulators: true }))

import { isQuantIntensity, gatedOn, type GatedFeature } from './track'
import type { UserDoc } from './userDoc'
import type { Progress } from '../content/schema'
import { ALL_OFF, FlagsSchema, type Flags } from '../config/flags'

const doc = (p: Partial<UserDoc>): UserDoc => ({ displayName: 'x', ...p })
const flagsOn = (f: Partial<Flags>): Flags => FlagsSchema.parse(f)

describe('isQuantIntensity (quant-intensity gate, README §4 helper)', () => {
  it('fails GENTLE when nothing is set (undefined/null inputs)', () => {
    expect(isQuantIntensity(undefined)).toBe(false)
    expect(isQuantIntensity(null)).toBe(false)
    expect(isQuantIntensity(doc({}))).toBe(false)
  })

  it('is true for Track B (per-concept overrides userDoc)', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'B' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A' }), { track: 'B' } as Progress)).toBe(true)
  })

  it('per-concept Track A overrides a userDoc Track B (fails gentle to the concept)', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'B' }), { track: 'A' } as Progress)).toBe(false)
  })

  it('is true for the interview learningGoal regardless of track', () => {
    expect(isQuantIntensity(doc({ learningGoal: 'interview' }))).toBe(true)
    expect(isQuantIntensity(doc({ defaultTrack: 'A', learningGoal: 'interview' }))).toBe(true)
  })

  it('is gentle for non-interview goals on Track A', () => {
    expect(isQuantIntensity(doc({ defaultTrack: 'A', learningGoal: 'school' }))).toBe(false)
  })
})

describe('gatedOn (spec-05 rollout chokepoint — D17 / R14)', () => {
  const features: GatedFeature[] = [
    'dailyReviewQueue',
    'difficultyGovernor',
    'brutalMockFloor',
    'goldMint',
  ]

  it('DEFAULT-OFF: ALL_OFF flags ⇒ every feature off even for an intense, treatment user', () => {
    const u = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    for (const f of features) expect(gatedOn(f, u, ALL_OFF)).toBe(false)
  })

  it('holdout ⇒ always false regardless of flag + intensity (control cohort)', () => {
    const u = doc({ defaultTrack: 'B', learningGoal: 'interview', rolloutCohort: 'holdout' })
    const allOn = flagsOn({
      dailyReviewQueue: true,
      difficultyGovernor: true,
      brutalMockFloor: true,
      goldMint: true,
    })
    for (const f of features) expect(gatedOn(f, u, allOn)).toBe(false)
  })

  it('flag-off ⇒ false even for treatment + intensity', () => {
    const u = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    // brutalMockFloor on, the others off → only that feature can pass.
    const flags = flagsOn({ brutalMockFloor: true })
    expect(gatedOn('brutalMockFloor', u, flags)).toBe(true)
    expect(gatedOn('difficultyGovernor', u, flags)).toBe(false)
    expect(gatedOn('dailyReviewQueue', u, flags)).toBe(false)
    expect(gatedOn('goldMint', u, flags)).toBe(false)
  })

  it('treatment + flag-on ⇒ equals isQuantIntensity (the gate adds, never replaces)', () => {
    const flags = flagsOn({ dailyReviewQueue: true })
    // Intense treatment user → true.
    const intense = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    expect(gatedOn('dailyReviewQueue', intense, flags)).toBe(
      isQuantIntensity(intense),
    )
    expect(gatedOn('dailyReviewQueue', intense, flags)).toBe(true)
    // GENTLE treatment user (Track A, no interview goal) → false (fails gentle).
    const gentle = doc({ defaultTrack: 'A', rolloutCohort: 'treatment' })
    expect(gatedOn('dailyReviewQueue', gentle, flags)).toBe(
      isQuantIntensity(gentle),
    )
    expect(gatedOn('dailyReviewQueue', gentle, flags)).toBe(false)
  })

  it('a learningGoal:interview treatment user passes a flagged feature (implicit intensity opt-in)', () => {
    const u = doc({ defaultTrack: 'A', learningGoal: 'interview', rolloutCohort: 'treatment' })
    expect(gatedOn('difficultyGovernor', u, flagsOn({ difficultyGovernor: true }))).toBe(true)
  })

  it('passes per-concept progress through to isQuantIntensity', () => {
    const u = doc({ defaultTrack: 'B', rolloutCohort: 'treatment' })
    const flags = flagsOn({ difficultyGovernor: true })
    // per-concept Track A overrides the userDoc Track B → fails gentle.
    expect(gatedOn('difficultyGovernor', u, flags, { track: 'A' } as Progress)).toBe(false)
  })

  it('a user with NO cohort assigned yet (undefined) still gates on flag + intensity', () => {
    // undefined cohort is NOT holdout — it just hasn't been assigned. The flag +
    // intensity still decide (a treatment-bound user mid-assignment isn't penalized).
    const u = doc({ defaultTrack: 'B' }) // no rolloutCohort
    expect(gatedOn('brutalMockFloor', u, flagsOn({ brutalMockFloor: true }))).toBe(true)
  })
})
