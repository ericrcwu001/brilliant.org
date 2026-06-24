// Pure feedback resolution (no React / analytics / firebase imports) so it is
// unit-testable in the node Vitest env. `feedback.ts` re-exports these for the
// beat views; the hook (`useHintLadder`) and `FeedbackView` stay in feedback.ts.

import type { Feedback } from '../content/schema'

export type FeedbackTriple = { correct: string; hints: [string, string, string] }
export type OptionFeedback = { note: string; correct?: boolean }

// Compare lessons key feedback by the active pattern; flagship beats use a
// single triple. Falls back to the first authored pattern if unkeyed. A
// `byOption` prediction beat has no single triple — expose its optional `hints`
// so callers (captions/idle copy) keep working; per-option notes come from
// `resolveOptionFeedback`.
export function resolveFeedback(
  feedback: Feedback,
  pattern: string,
): FeedbackTriple {
  if ('byPattern' in feedback) {
    return (feedback.byPattern[pattern] ??
      Object.values(feedback.byPattern)[0]) as FeedbackTriple
  }
  if ('byOption' in feedback) {
    return { correct: '', hints: feedback.hints ?? ['', '', ''] }
  }
  return feedback as FeedbackTriple
}

// Resolve the refutation/affirmation note for the specific option a learner
// picked in a `byOption` prediction beat (L1 §3.1). Returns null for triple /
// byPattern feedback (no per-option copy), so callers fall back gracefully.
export function resolveOptionFeedback(
  feedback: Feedback,
  selectedOption: string,
): OptionFeedback | null {
  if ('byOption' in feedback) {
    return feedback.byOption[selectedOption] ?? null
  }
  return null
}
