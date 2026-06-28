// The single quant-intensity gate predicate (README §4 shared helper, D2/D17).
//
// Every aggressive behavior (brutal mock, difficulty governor, SR queue intensity,
// calibration-forward report, confidence capture) gates on THIS one helper, so a
// learner is never quant-gated in one surface and gentle in another. Consumed by
// spec-02/13/20/21/22/23; none re-derives the predicate from `defaultTrack` alone.
//
// UPDATE 2026-06-28 (product decision — "LS behaviors on for everyone"): the A/B
// intensity split is COLLAPSED — every learner is treated as quant-intensity, so
// this returns true unconditionally. Because both gatedOn() below and the direct
// callers (confidence/calibration in App.tsx, the quantGate in ConceptCatalogPage/
// LessonPage/DailyReviewPage) funnel through this one helper, flipping it here turns
// the aggressive surfaces on everywhere at once. The feature flags + holdout cohort
// (see flags.ts / gatedOn) still gate the four net-new behaviors, so a feature can
// still be killed without a deploy. To restore the gentle path, revert the body to:
//   const track = conceptProgress?.track ?? userDoc?.defaultTrack ?? 'A'
//   return track === 'B' || userDoc?.learningGoal === 'interview'

import type { UserDoc } from './userDoc'
import type { Progress } from '../content/schema'
import type { Flags } from '../config/flags'

export function isQuantIntensity(
  userDoc: UserDoc | null | undefined,
  conceptProgress?: Progress | null,
): boolean {
  // A/B split collapsed (2026-06-28): everyone is quant-intensity. The inputs are
  // accepted (and intentionally ignored) so call sites + signature stay unchanged.
  void userDoc
  void conceptProgress
  return true
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
  // Control cohort: never gets aggressive behavior, regardless of flags. This
  // kill switch still works post-2026-06-28; with rolloutPercent=100 no NEW user is
  // assigned 'holdout', but a previously-persisted holdout still opts out here.
  if (userDoc?.rolloutCohort === 'holdout') return false
  // Per-feature flag off ⇒ false. Flags now DEFAULT-ON (flags.ts), so this passes
  // unless the feature is explicitly killed via Remote Config / the config doc.
  if (!flags[feature]) return false
  // Intensity predicate — now true for everyone (the A/B split is collapsed).
  return isQuantIntensity(userDoc, conceptProgress)
}
