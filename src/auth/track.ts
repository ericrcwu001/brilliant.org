// The single quant-intensity gate predicate (README §4 shared helper, D2/D17).
//
// Every aggressive behavior (brutal mock, difficulty governor, SR queue intensity,
// calibration-forward report, confidence capture) gates on THIS one helper, so a
// learner is never quant-gated in one surface and gentle in another. Consumed by
// spec-02/13/20/21/22/23; none re-derives the predicate from `defaultTrack` alone.
//
// IMPORTANT — fails GENTLE on purpose. effectiveTrack = per-concept progress.track
// ?? userDoc.defaultTrack ?? 'A'. A missing/loading track must never put a learner
// on the aggressive path (matches `comfortToDefaultTrack`: new/dabbled → A). This
// DELIBERATELY diverges from the app's other convention (`defaultTrack ?? 'B'`,
// schema.ts:765); `learningGoal === 'interview'` is the only implicit opt-in.

import type { UserDoc } from './userDoc'
import type { Progress } from '../content/schema'
import type { Flags } from '../config/flags'

export function isQuantIntensity(
  userDoc: UserDoc | null | undefined,
  conceptProgress?: Progress | null,
): boolean {
  const track = conceptProgress?.track ?? userDoc?.defaultTrack ?? 'A'
  return track === 'B' || userDoc?.learningGoal === 'interview'
}

// ── Rollout-gated chokepoint (spec-05, D17 / R14) ───────────────────────────────
// Every aggressive surface asks ONE question: gatedOn('<feature>', …). This layers
// the holdout cohort + per-feature flag ON TOP of the unchanged isQuantIntensity
// predicate, so flag + cohort + intensity are decided in the SAME place and gates
// cannot drift apart per-surface (no scattered gates). isQuantIntensity itself is
// untouched (it still answers the pure intensity question for callers that need it).
export type GatedFeature =
  | 'dailyReviewQueue'
  | 'difficultyGovernor'
  | 'brutalMockFloor'
  | 'goldMint'

export function gatedOn(
  feature: GatedFeature,
  userDoc: UserDoc | null | undefined,
  flags: Flags,
  conceptProgress?: Progress | null,
): boolean {
  // Control cohort: never gets aggressive behavior, regardless of flags.
  if (userDoc?.rolloutCohort === 'holdout') return false
  // Per-feature flag off (or fail-closed default ⇒ false). DEFAULT-OFF (R14).
  if (!flags[feature]) return false
  // Existing intensity predicate — fails GENTLE (Track A unaffected by rollout).
  return isQuantIntensity(userDoc, conceptProgress)
}
