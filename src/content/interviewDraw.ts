// Pure draw + seen-set logic for the capstone interview (ADR-0008 / ADR-0005).
// No Firebase, no `Date`, no `Math.random` by default (injectable `rng` for
// deterministic tests). Importable by both the browser dev-harness and the Cloud
// Functions runtime (a byte-identical copy lives at functions/src/interviewDraw.ts
// — guarded by a drift test).

import type { InterviewPack, Question } from './interviewPack'

const TIER_ORDER = ['hard', 'harder', 'brutal'] as const
type Tier = (typeof TIER_ORDER)[number]

export interface DrawOpts {
  /**
   * Minimum tier to include. Default: 'hard' (the pack floor — all questions
   * qualify). Set to 'harder' or 'brutal' to restrict to tougher questions.
   */
  tierFloor?: Tier
  /**
   * Injectable rng ∈ [0,1) for deterministic tests. Defaults to Math.random.
   * Shuffle is Fisher-Yates over the eligible pool so every eligible question is
   * equally likely on a cold seen-set, and order degrades gracefully as the pool
   * shrinks. Deterministic given rng.
   */
  rng?: () => number
}

export interface DrawResult {
  question: Question
  followUps: string[] // question.followUps — surfaced explicitly for the caller
}

/**
 * Select the next unseen question from `pack`, respecting:
 *   1. Not in seenQuestionIds (by id) nor in seen fingerprints (derived from the
 *      pack's questions array).
 *   2. Tier >= tierFloor (default: 'hard', i.e. all qualify).
 *   3. Deterministic given inputs when `rng` is injected; uses Math.random otherwise.
 * Returns null when the eligible pool is exhausted — the caller
 * (mintInterviewToken) should note this as a "pool empty" signal; runtime top-up
 * via the generatorPrompt is a future hook owned by Phase 1 (ADR-0005).
 */
export function drawQuestion(
  pack: InterviewPack,
  seenQuestionIds: string[],
  opts?: DrawOpts,
): DrawResult | null {
  const { tierFloor = 'hard', rng = Math.random } = opts ?? {}
  const tierMin = TIER_ORDER.indexOf(tierFloor)

  // Build seen set by id AND by fingerprint (catches regenerated variants with a
  // new id but the same structural fingerprint — the de-dup guarantee, ADR-0005).
  const seenIds = new Set(seenQuestionIds)
  const seenFps = new Set(
    pack.questions.filter((q) => seenIds.has(q.id)).map((q) => q.fingerprint),
  )

  const eligible = pack.questions.filter(
    (q) =>
      !seenIds.has(q.id) &&
      !seenFps.has(q.fingerprint) &&
      TIER_ORDER.indexOf(q.tier) >= tierMin,
  )

  if (eligible.length === 0) return null

  // Fisher-Yates shuffle over the eligible pool (in-place copy).
  const pool = eligible.slice()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const question = pool[0]
  return { question, followUps: question.followUps }
}

// ── Seen-set helpers (used by mintInterviewToken + tests) ──────────────────────

/** Add a drawn question's id to the seen list (immutable — returns a new array). */
export function markSeen(seenIds: string[], question: Question): string[] {
  return seenIds.includes(question.id) ? seenIds : [...seenIds, question.id]
}

/** True iff `question` has already been seen (by id or fingerprint match). */
export function isSeen(
  question: Question,
  seenIds: string[],
  pack: InterviewPack,
): boolean {
  const seenIdSet = new Set(seenIds)
  if (seenIdSet.has(question.id)) return true
  const seenFps = new Set(
    pack.questions.filter((q) => seenIdSet.has(q.id)).map((q) => q.fingerprint),
  )
  return seenFps.has(question.fingerprint)
}
