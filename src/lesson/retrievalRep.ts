// Retrieval-rep taxonomy (README §4 Foundation D, Decision D10). PLUMBING ONLY.
//
// A *retrieval rep* is a cold-recall act — the unit the difficulty governor
// (spec-21), calibration scoring (spec-12), and analytics count. It is NOT the
// streak: the streak (functions/src/streaks.ts) counts required-beat completion
// once per local day and is UNCHANGED by this taxonomy (D10, foolproofing R9).
//
// Pure + dependency-free so it is unit-tested in the node Vitest env (matches
// mastery.ts / hintLadder.ts). "Cold recall" depends on HOW a beat is surfaced,
// not on the beat alone, so callers pass the context they know; the classifier
// fails closed (returns false) when nothing marks recall.

import type { Beat } from '../content/schema'

export type RetrievalRepContext = {
  // How the beat was surfaced. 'review' = re-asked by the SR queue (spec-10);
  // 'lesson' (default) = first pass in normal lesson flow.
  source?: 'lesson' | 'review'
  // The method tag (Foundation B / spec-00), denormalized by the queue for
  // method-weakness + interleave. Carried here so future consumers (spec-12/21)
  // can group reps by method without re-reading the beat; NOT used in the
  // boolean today. Same field name as BeatSchema.schemaId — do not rename.
  schemaId?: string
}

// True iff the beat is a cold-recall retrieval act. See README §4 Foundation D / §4.5.
//   1. surfaced by the SR queue as a spaced-review problem (ctx.source==='review').
//      This is the primary retrieval signal and OVERRIDES the others: a review-
//      surfaced beat is a rep regardless of type (the queue only re-asks graded
//      problems, but the predicate's contract is "review surfacing ⇒ rep").
//   2. a masteryChallenge checkpoint (the in-lesson cold "show you've got it").
//   3. a which-method gate — a `prediction` beat carrying the `gate` block
//      (spec-13, README §4.5). Detected BY STRUCTURE, not via a ctx.role flag:
//      callers (the governor's attempt stream, calibration scoring) won't reliably
//      thread a role flag, so the only durable signal is the beat shape. The exempt
//      opening qualitative bet is a plain `prediction` with no `gate` ⇒ NOT a rep.
// Teaching / primer / sim / recap beats seen first-pass in normal flow are NOT reps;
// the classifier returns false by default (fail-closed).
export function isRetrievalRep(beat: Beat, ctx: RetrievalRepContext = {}): boolean {
  if (ctx.source === 'review') return true
  if (beat.interaction.type === 'masteryChallenge') return true
  // `gate` lives on the `prediction` member (spec-13, README §4.5). When absent
  // (the exempt opening bet) this is false; structural access via the discriminated
  // `prediction` arm. retrieval-rep ≠ graded-beat: we deliberately key off the beat
  // shape + context, NOT mastery's GRADED_BEAT_TYPES, so the two never drift (R2).
  if (beat.interaction.type === 'prediction' && Boolean(beat.interaction.gate)) return true
  return false
}
