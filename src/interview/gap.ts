// Practice-vs-performance gap helpers (spec-22 §3.3/§3.4). Pure + Firebase-free
// so they are node-testable. The gap surfaces the learner's IN-APP fluency next
// to their INTERVIEW performance — high in-app mastery + low interview
// correctness is exactly the practice-vs-performance gap the thesis (README §2)
// says is negatively diagnostic of readiness.
//
// NO correctness-pass threshold is defined here. The binary "was the interview
// answer correct?" decision imports `isCorrect`/`CORRECTNESS_PASS_THRESHOLD` from
// spec-12's calibration module (README §7 DAG — spec-12 owns the constant).
// `interviewAccuracyFromScore` below is a DISPLAY-ONLY bar-length proxy, not a
// pass threshold.

import type { Course } from '../content/schema'

/** Minimum completed lessons before the in-app accuracy comparison is meaningful;
 *  below this `computeInAppAccuracy` returns null so the UI hides the gap. */
export const MIN_LESSONS = 3

/** Emphasize the pressure-graduation framing only when in-app accuracy exceeds
 *  interview accuracy by at least this much (the practice-vs-performance gap). */
export const GAP_THRESHOLD = 0.2

/** Display-only continuous proxy for the interview-accuracy bar length: a 1–5
 *  correctness score mapped to [0,1]. NOT a pass threshold (use spec-12's
 *  `isCorrect` for a binary judgment). One question per attempt, so the single
 *  correctness dimension IS the interview-accuracy proxy. */
export function interviewAccuracyFromScore(score: number): number {
  return score / 5
}

/** Fraction of COMPLETED graded lessons in this concept that the learner mastered
 *  first-try (derived.mastered === true) — the in-app "looked easy in practice"
 *  signal (the same frozen medallion signal, R2). Returns null when too few
 *  completed lessons to be meaningful (< MIN_LESSONS) so the UI hides the
 *  comparison.
 *
 *  PRECONDITION: `progress` is already scoped to ONE concept's lessons (§3.4) —
 *  the caller intersects the whole-library progress map with `conceptLessonIds`
 *  before calling. The helper does NO concept filtering of its own (it cannot: a
 *  progress doc carries no conceptId). */
export function computeInAppAccuracy(
  progress: { completionStatus?: string; derived?: { mastered?: boolean } }[],
): number | null {
  const completed = progress.filter((p) => p.completionStatus === 'completed')
  if (completed.length < MIN_LESSONS) return null
  const mastered = completed.filter((p) => p.derived?.mastered === true).length
  return mastered / completed.length
}

/** The set of lessonIds belonging to one concept's course — the union of the
 *  built path (`course.lessons[].lessonId`, authoritative) and any chapter
 *  groupings (`course.chapters[].lessonIds`, optional). Used to scope the
 *  whole-library progress map down to THIS concept before computing in-app
 *  accuracy (§3.4). A pure Set keeps the concept-scoping testable. */
export function conceptLessonIds(course: Course): Set<string> {
  const ids = new Set<string>()
  for (const l of course.lessons) ids.add(l.lessonId)
  for (const c of course.chapters ?? []) for (const id of c.lessonIds) ids.add(id)
  return ids
}
