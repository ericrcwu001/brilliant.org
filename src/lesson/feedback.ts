// Hint-ladder React hook + feedback resolution helpers. The pure state machine
// lives in hintLadder.ts; the strip component lives in FeedbackStrip.tsx. This
// module exports no components so Fast Refresh stays happy.

import { useEffect, useRef, useState } from 'react'
import type { Feedback } from '../content/schema'
import {
  initialLadder,
  isRevealed,
  needsReview,
  onCorrect,
  onTryAgain,
  onWrong,
  type LadderState,
} from './hintLadder'

export type FeedbackTriple = { correct: string; hints: [string, string, string] }

// Compare lessons key feedback by the active pattern; flagship beats use a
// single triple. Falls back to the first authored pattern if unkeyed.
export function resolveFeedback(
  feedback: Feedback,
  pattern: string,
): FeedbackTriple {
  if ('byPattern' in feedback) {
    return (feedback.byPattern[pattern] ??
      Object.values(feedback.byPattern)[0]) as FeedbackTriple
  }
  return feedback as FeedbackTriple
}

export type FeedbackView =
  | { kind: 'idle' }
  | { kind: 'correct'; text: string }
  | { kind: 'note'; text: string; label?: string }
  | { kind: 'hint'; level: number; text: string; revealed: boolean }

export type HintLadder = {
  state: LadderState
  view: FeedbackView
  submitWrong: () => void
  submitCorrect: () => void
  tryAgain: () => void
  // Drop the visible verdict (e.g. when the learner edits their answer before
  // re-checking) while preserving wrongCount/everRevealed for needsReview.
  clear: () => void
}

export function useHintLadder(opts: {
  feedback: FeedbackTriple
  required: boolean
  maxHintLevel?: 1 | 2 | 3
  onNeedsReview?: () => void
}): HintLadder {
  const max = opts.maxHintLevel ?? 3
  const [state, setState] = useState<LadderState>(initialLadder)

  // Report needsReview up to the lesson once the thresholds are crossed.
  const reported = useRef(false)
  const onNeedsReview = opts.onNeedsReview
  useEffect(() => {
    if (!reported.current && needsReview(state, opts.required)) {
      reported.current = true
      onNeedsReview?.()
    }
  }, [state, opts.required, onNeedsReview])

  let view: FeedbackView = { kind: 'idle' }
  if (state.outcome === 'correct') {
    view = { kind: 'correct', text: opts.feedback.correct }
  } else if (state.outcome === 'wrong' && state.level > 0) {
    view = {
      kind: 'hint',
      level: state.level,
      text: opts.feedback.hints[state.level - 1],
      revealed: isRevealed(state),
    }
  }

  return {
    state,
    view,
    submitWrong: () => setState((p) => onWrong(p, max)),
    submitCorrect: () => setState(onCorrect),
    tryAgain: () => setState(onTryAgain),
    clear: () =>
      setState((p) => (p.outcome === 'idle' ? p : onTryAgain(p))),
  }
}
