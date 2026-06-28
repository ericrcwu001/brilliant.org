// Hint-ladder React hook + feedback resolution helpers. The pure state machine
// lives in hintLadder.ts; the strip component lives in FeedbackStrip.tsx. This
// module exports no components so Fast Refresh stays happy.

import { useEffect, useRef, useState } from 'react'
import {
  isRevealed,
  needsReview,
  onCorrect,
  onTryAgain,
  onWrong,
  rehydrateLadder,
  type LadderState,
} from './hintLadder'
import { analytics } from '../analytics/events'
import {
  resolveFeedback,
  resolveOptionFeedback,
  type FeedbackTriple,
  type OptionFeedback,
} from './feedbackResolve'

// Re-export the pure resolvers (defined in feedbackResolve.ts so they stay
// node-testable, free of the React/analytics imports below).
export { resolveFeedback, resolveOptionFeedback }
export type { FeedbackTriple, OptionFeedback }

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
  // Persistence (Phase 15): seed the ladder from a restored level, and report
  // every level change up so the LessonPlayer can persist `hintLevelByBeat`.
  initialLevel?: number
  onLevelChange?: (level: number) => void
  // Analytics (Phase 19): when set, each Check fires answer_submitted (and a
  // hint_revealed when a wrong submit reaches the reveal). Graded beats pass it.
  event?: { lessonId: string; beatId: string }
}): HintLadder {
  const max = opts.maxHintLevel ?? 3
  const [state, setState] = useState<LadderState>(() =>
    rehydrateLadder(opts.initialLevel ?? 0, max),
  )

  // Report needsReview up to the lesson once the thresholds are crossed.
  const reported = useRef(false)
  const onNeedsReview = opts.onNeedsReview
  useEffect(() => {
    if (!reported.current && needsReview(state, opts.required)) {
      reported.current = true
      onNeedsReview?.()
    }
  }, [state, opts.required, onNeedsReview])

  // Report level changes up for persistence (skipping the initial seed value).
  const onLevelChange = opts.onLevelChange
  const lastLevel = useRef(state.level)
  useEffect(() => {
    if (state.level !== lastLevel.current) {
      lastLevel.current = state.level
      onLevelChange?.(state.level)
    }
  }, [state.level, onLevelChange])

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

  // Submission counter for answer_submitted's attemptN (1-indexed per beat).
  const attempts = useRef(0)
  const event = opts.event

  return {
    state,
    view,
    submitWrong: () => {
      if (event) {
        attempts.current += 1
        const nextLevel = Math.min(state.level + 1, max)
        analytics.answerSubmitted({
          lessonId: event.lessonId,
          beatId: event.beatId,
          attemptN: attempts.current,
          correct: false,
          hintLevel: nextLevel,
        })
        if (nextLevel >= 3) {
          analytics.hintRevealed({
            lessonId: event.lessonId,
            beatId: event.beatId,
            hintLevel: nextLevel,
          })
        }
      }
      setState((p) => onWrong(p, max))
    },
    submitCorrect: () => {
      if (event) {
        attempts.current += 1
        analytics.answerSubmitted({
          lessonId: event.lessonId,
          beatId: event.beatId,
          attemptN: attempts.current,
          correct: true,
          hintLevel: state.level,
        })
      }
      setState(onCorrect)
    },
    tryAgain: () => setState(onTryAgain),
    clear: () =>
      setState((p) => (p.outcome === 'idle' ? p : onTryAgain(p))),
  }
}
