// Client wrappers for the progression Cloud Functions (Phase 16).
//
// Cloud Functions are the ONLY writer of completion/mastery/unlock + streak
// qualifying actions (docs/mvp_prd.md "Write Model"). Instant feedback stays
// client-side; these callables are only on the achievement path. Each wrapper
// unwraps the HttpsCallableResult to its typed `.data` for ergonomics.

import { httpsCallable } from 'firebase/functions'
import { getFns } from '../firebase/app'

// Mirrors the flagship derived-field block (docs/mvp_prd.md "Derived learning
// fields"). The opening bet is qualitative, so `initialPrediction` may be a
// string; the function computes `predictionDeltaInitial` from the numbers it can.
export type CompleteLessonInput = {
  lessonId: string
  completedBeats: string[]
  needsReview: boolean
  derived: {
    initialPrediction: string | number | null
    finalPrediction: number | null
    empiricalMean: number | null
    theoreticalValue: number | null
    simRuns: number | null
    // Light per-lesson mastery signal (L1 §9): graded beats first-try-correct,
    // no full reveal. Non-blocking; persisted under derived for a future review.
    mastered: boolean
  }
}

export type CompleteLessonResult = {
  completionStatus: 'completed'
  masteryStatus: 'mastered'
  unlockedLessonId: string | null
  alreadyCompleted: boolean
  // Phase 17: milestone ids newly awarded by this completion (lesson milestone +
  // course-completion when all three are done). Empty when already earned.
  awardedMilestones?: string[]
}

export type RecordQualifyingActionInput = {
  lessonId: string
  beatId: string
}

export type RecordQualifyingActionResult = {
  recorded: boolean
  lessonId: string
  beatId: string
  // Phase 17 streak state (null on a streak error). `incremented` is true only
  // on the call that first ticks the learner's local day.
  streak?: {
    count: number
    longest: number
    lastActiveDate: string | null
    timezone: string | null
    incremented: boolean
  } | null
}

export async function completeLesson(
  input: CompleteLessonInput,
): Promise<CompleteLessonResult> {
  const functions = await getFns()
  const fn = httpsCallable<CompleteLessonInput, CompleteLessonResult>(
    functions,
    'completeLesson',
  )
  const res = await fn(input)
  return res.data
}

export async function recordQualifyingAction(
  input: RecordQualifyingActionInput,
): Promise<RecordQualifyingActionResult> {
  // Phase 17: include the learner's IANA timezone so the Cloud Function computes
  // the local-day streak boundary (the streak increments once per local day).
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const functions = await getFns()
  const fn = httpsCallable<
    RecordQualifyingActionInput & { timezone: string },
    RecordQualifyingActionResult
  >(functions, 'recordQualifyingAction')
  const res = await fn({ ...input, timezone })
  return res.data
}
