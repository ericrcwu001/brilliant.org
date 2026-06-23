// Pure hint-ladder state machine (see docs/mvp_prd.md "Feedback and Hint
// Ladder"). Kept dependency-free so it can be unit-tested in the node Vitest
// environment; the React `useHintLadder` hook in feedback.tsx wraps it.
//
// Semantics:
// - `level` is the current hint level (0 = nothing shown yet). It increments by
//   one on each wrong Check, capped at `maxHintLevel`.
// - A level-3 hint is the answer reveal; it only ever happens when
//   `maxHintLevel >= 3` (transfer setup beats cap at 2 to suppress the reveal).
// - `needsReview` fires on Required beats when the learner reaches a reveal OR
//   accumulates 3+ wrong submits. Extension beats never set it.

export type LadderOutcome = 'idle' | 'wrong' | 'correct'

export type LadderState = {
  level: number
  wrongCount: number
  everRevealed: boolean
  outcome: LadderOutcome
}

export const initialLadder: LadderState = {
  level: 0,
  wrongCount: 0,
  everRevealed: false,
  outcome: 'idle',
}

export function onWrong(state: LadderState, maxHintLevel: number): LadderState {
  const level = Math.min(state.level + 1, maxHintLevel)
  const revealed = level >= 3
  return {
    level,
    wrongCount: state.wrongCount + 1,
    everRevealed: state.everRevealed || revealed,
    outcome: 'wrong',
  }
}

export function onCorrect(state: LadderState): LadderState {
  // Reset the visible hint level on success; keep wrongCount/everRevealed so
  // the needsReview accounting for the beat is preserved.
  return { ...state, level: 0, outcome: 'correct' }
}

// Explicit "Try again" after a reveal: clear the strip and let the learner
// re-submit. needsReview has already been recorded and stays recorded.
export function onTryAgain(state: LadderState): LadderState {
  return { ...state, level: 0, outcome: 'idle' }
}

export function needsReview(state: LadderState, required: boolean): boolean {
  if (!required) return false
  return state.everRevealed || state.wrongCount >= 3
}

// Whether the current strip should show the answer reveal (only at the capped
// level 3).
export function isRevealed(state: LadderState): boolean {
  return state.outcome === 'wrong' && state.level >= 3
}
