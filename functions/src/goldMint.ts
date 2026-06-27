// Gold-mint qualification (spec-11 §3.3 — honest delayed mastery, D7).
//
// PURE + dependency-light (only the firebase-admin Timestamp type, used as a
// type-only import) so it is node-testable. The actual minting (the Firestore
// transaction that sets progress.derived.mastered=true + suspends a transfer
// card) lives in functions/src/review.ts inside submitReviewTx; this module is
// only the predicate.
//
// R12 (client timestamps are spoofable): the delay check keys off the card's
// SERVER-WRITTEN `createdAt` and the SERVER `now`, never a client timestamp.
// R13 (server-graded): the caller only invokes this on a SERVER-GRADED pass.

import type { Timestamp } from 'firebase-admin/firestore'

/** True iff `a` falls on an EARLIER UTC calendar day than `b` (a delayed
 *  retrieval — the card was created/last-touched on a prior day). Compares
 *  UTC y/m/d, not a 24h elapsed window, so a card created at 23:00 and reviewed
 *  at 08:00 the next morning counts as delayed (SM-2's ≥1d first interval already
 *  guarantees this in practice). Far-future `b` is also "later". */
export function isLaterUtcDay(a: Date, b: Date): boolean {
  const dayA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const dayB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return dayB > dayA
}

/** Does a SERVER-GRADED pass on this card qualify to mint gold for its lesson?
 *
 *  Common gate (both tracks): the pass must be DELAYED — the card was created on
 *  an earlier UTC day than server `now` (§3.3 step 2; R12 server time only).
 *
 *  Track A (gentle default): ANY qualifying delayed pass on the card mints gold
 *  (it is a re-retrieval of the same in-lesson checkpoint, cold).
 *  Track B / quant-intensity: ONLY a delayed pass on a *transfer* card
 *  (`card.isTransfer === true`, set by spec-01 from BeatSchema.heldOut) mints
 *  gold — a same-checkpoint re-retrieve is not enough. Until spec-24 authors the
 *  transfer content, a Track-B lesson has no transfer card, so this returns false
 *  and the lesson stays silver (R5 — honest interim, never throws).
 *
 *  The caller reads `track` off the card (README §4), not a client arg (R12). */
export function qualifiesForGoldMint(
  card: { createdAt: Timestamp; isTransfer?: boolean },
  now: Date,
  track: 'A' | 'B',
): boolean {
  if (!isLaterUtcDay(card.createdAt.toDate(), now)) return false // delayed ≥1 day
  return track === 'A' ? true : card.isTransfer === true
}
