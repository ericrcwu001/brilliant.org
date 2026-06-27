// Per-lesson mastery signal (L1 §9). Pure + dependency-free so it is unit-tested
// in the node Vitest env; the LessonPlayer wires it to the persisted hint
// high-water mark.
//
// spec-11 / D7 — HINTS ARE FORGIVEN. `computeMastered` no longer means "zero
// hints ever". It now means GOLD CANDIDACY: the required graded beats were
// completed during the lesson (hint level no longer matters). Gold is NOT
// granted here — passing this at completion only marks the lesson a gold
// *candidate*; gold is minted later by a delayed SR re-retrieval / transfer
// pass (functions/src/review.ts qualifiesForGoldMint, spec-11 §3.3).
//
// R2 — this is the FROZEN/medallion side. The recommender keeps a SEPARATE
// zero-hint struggle predicate (src/progress/recommend.ts masteredFromLive) to
// decide what to re-surface; the two intents (earned-gold vs needs-review) are
// deliberately different code and must never be merged.
// Non-blocking: it never gates unlock — it only sets derived.mastered + the UI.

import type { Beat } from '../content/schema'

// Beat types that grade an answer through the hint ladder. `retrievalGrid` (the
// matching-grid recall variant, build-brief §4.4) is graded like the other check beats.
const GRADED_BEAT_TYPES = new Set(['stateTap', 'equationTiles', 'answerEntry', 'masteryChallenge', 'retrievalGrid', 'handRanker'])
// countingTree/selectionGrid grade an answer only when they carry an `accept`
// list — the combinatorics explore variants (no `accept`) are ungraded even when
// `required`, so they count toward the mastery signal only when graded.
const ACCEPT_GATED_BEAT_TYPES = new Set(['countingTree', 'selectionGrid'])

// Checkpoint beats eligible for confidence capture (spec-02 / D6) and, later,
// retrieval-rep classification (spec-03). The graded mastery challenge plus the
// which-method gate (a `prediction` beat that carries `interaction.gate`, added
// by spec-13 — README §4.5). The opening qualitative `prediction` bet has no
// `gate` and is EXEMPT (D6), so we MUST NOT put 'prediction' in this set. The
// spaced-review problem (third D6 site) is captured on the review surface by
// spec-20 (→ card.lastConfidence via submitReview), not here.
const CHECKPOINT_BEAT_TYPES = new Set(['masteryChallenge'])

export function isGradedBeat(beat: Beat): boolean {
  const type = beat.interaction.type
  // Which-method gate (spec-13 / D12): a `prediction` counts as graded IFF it
  // carries `interaction.gate`. The ungraded opening bet (no gate) stays ungraded.
  // Detected by the gate flag, never by adding 'prediction' to GRADED_BEAT_TYPES (R2).
  if (type === 'prediction') return 'gate' in beat.interaction && !!beat.interaction.gate
  if (GRADED_BEAT_TYPES.has(type)) return true
  if (ACCEPT_GATED_BEAT_TYPES.has(type)) {
    const accept = (beat.interaction as { accept?: unknown }).accept
    return Array.isArray(accept) && accept.length > 0
  }
  return false
}

// A graded checkpoint: a `masteryChallenge` or a which-method gate `prediction`.
// Detected via the gate flag (README §4.5), never by adding 'prediction' to the
// type set (that would capture the EXEMPT opening bet, violating D6).
export function isCheckpointBeat(beat: Beat): boolean {
  const i = beat.interaction
  if (i.type === 'prediction') return 'gate' in i && !!i.gate
  return CHECKPOINT_BEAT_TYPES.has(i.type)
}

export function gradedRequiredBeatIds(beats: Beat[]): string[] {
  return beats.filter((b) => b.required && isGradedBeat(b)).map((b) => b.beatId)
}

// Gold candidacy at completion: the required graded beats were completed.
// Hints used WHILE LEARNING are forgiven (D7) — gold is earned later via a
// delayed SR check (spec-11 §3.3), not by a zero-hint first sit. Returns
// false only when there are no graded beats to retrieve. The
// `maxHintLevelByBeat` param is kept (prefixed `_`) so the LessonPlayer call
// site + tests need no churn; the predicate no longer reads it.
export function computeMastered(
  beats: Beat[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _maxHintLevelByBeat: Record<string, number>,
): boolean {
  return gradedRequiredBeatIds(beats).length > 0
}

// Update the hint high-water mark for a beat, keeping the max ever reached.
// (The visible hint level resets to 0 on a correct submit, so only the max
// records whether a beat was ever a struggle.)
export function bumpMaxHintLevel(
  map: Record<string, number>,
  beatId: string,
  level: number,
): Record<string, number> {
  const cur = map[beatId] ?? 0
  return level > cur ? { ...map, [beatId]: level } : map
}
