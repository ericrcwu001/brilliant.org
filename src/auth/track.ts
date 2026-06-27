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

export function isQuantIntensity(
  userDoc: UserDoc | null | undefined,
  conceptProgress?: Progress | null,
): boolean {
  const track = conceptProgress?.track ?? userDoc?.defaultTrack ?? 'A'
  return track === 'B' || userDoc?.learningGoal === 'interview'
}
