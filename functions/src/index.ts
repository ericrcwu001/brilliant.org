// Progression Cloud Functions (Phase 16) — the ONLY writer of completion,
// mastery, and unlock state (docs/mvp_prd.md "Write Model"). Instant feedback
// stays client-side; these callables run only on the achievement path.
//
//   completeLesson         verifies the submitted state against the seeded lesson
//                          fixture, then writes completionStatus/masteryStatus +
//                          derived fields and unlocks the successor lesson.
//                          Idempotent: re-completing is a no-op.
//   recordQualifyingAction records a required-beat completion into the progress
//                          read cache (the streak qualifying action that Phase 17
//                          will build the daily increment on).
//
// MVP rule: completion == mastery (finishing all Required beats once → mastered →
// next unlocks).

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
// Phase 17 habit-loop logic, wired into the progression functions below.
import { incrementDailyStreak } from './streaks'
import { awardMilestonesForCompletion } from './milestones'
// spec-01: problem-level review-card creation at lesson completion (two-phase,
// reads-before-writes). submitReview is re-exported at the bottom.
import {
  readCardsForCompletion,
  writeCardsForCompletion,
  type ReviewLessonDoc,
} from './review'

initializeApp()
// us-central1 matches the client's default getFunctions() region (firebase/app.ts).
setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

const db = getFirestore()
const PROGRESS_SCHEMA_VERSION = 1

// Widened (spec-01) so completion can read courseId (= conceptId), per-beat
// schemaId/heldOut, and the graded beats' accept-lists (interaction.fields[].accept
// for answerEntry/masteryChallenge; interaction.accept for accept-gated types) —
// the inputs review-card creation + submitReview server-grading need. All added
// fields are optional, so existing reads (beatId/required/unlocks) are unaffected.
type BeatDef = {
  beatId: string
  required: boolean
  heldOut?: boolean
  schemaId?: string
  interaction?: {
    type?: string
    accept?: string[]
    fields?: Array<{ id: string; accept: string[] }>
  }
}
type LessonDoc = {
  lessonId?: string
  courseId?: string
  beats?: BeatDef[]
  unlocks?: string | null
}

type DerivedInput = {
  initialPrediction?: string | number | null
  finalPrediction?: number | null
  empiricalMean?: number | null
  theoreticalValue?: number | null
  simRuns?: number | null
  // Light per-lesson mastery signal (L1 §9), computed client-side from the hint
  // high-water mark. Non-blocking: stored for review, never gates unlock.
  mastered?: boolean
}

type CompleteLessonData = {
  lessonId?: string
  completedBeats?: string[]
  needsReview?: boolean
  derived?: DerivedInput
}

type RecordQualifyingActionData = {
  lessonId?: string
  beatId?: string
  // IANA timezone for the local-day streak boundary (Phase 17). Optional;
  // falls back to UTC server-side when absent.
  timezone?: string
}

function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid
  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }
  return uid
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpsError('invalid-argument', `${name} is required.`)
  }
  return value
}

async function loadLesson(lessonId: string): Promise<LessonDoc> {
  const snap = await db.doc(`lessons/${lessonId}`).get()
  if (!snap.exists) {
    throw new HttpsError('not-found', `Lesson ${lessonId} not found.`)
  }
  return (snap.data() ?? {}) as LessonDoc
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

// Derived learning fields (docs/mvp_prd.md "Derived learning fields"). The
// flagship opener is qualitative, so `initialPrediction` may be a string;
// `predictionDeltaInitial` then falls back to the locked numeric prediction.
function buildDerived(input: DerivedInput | undefined): Record<string, unknown> {
  const initialPrediction = input?.initialPrediction ?? null
  const finalPrediction = finiteNumber(input?.finalPrediction)
  const empiricalMean = finiteNumber(input?.empiricalMean)
  const theoreticalValue = finiteNumber(input?.theoreticalValue)
  const simRuns = finiteNumber(input?.simRuns)
  const initialNumeric =
    typeof initialPrediction === 'number' ? initialPrediction : finalPrediction
  const predictionDeltaInitial =
    initialNumeric != null && theoreticalValue != null
      ? Math.abs(initialNumeric - theoreticalValue)
      : null
  return {
    initialPrediction,
    finalPrediction,
    empiricalMean,
    theoreticalValue,
    simRuns,
    predictionDeltaInitial,
    // spec-11 / D7: gold is no longer earned at completion. `mastered` is minted
    // later by submitReview on a delayed qualifying SR pass (§3.3); at completion
    // it is always false (the lesson is only a gold *candidate*). The client-sent
    // `data.derived.mastered` (computeMastered, hints forgiven) is ignored here.
    mastered: false,
  }
}

export const completeLesson = onCall(
  async (request: CallableRequest<CompleteLessonData>) => {
    const uid = requireUid(request)
    const data = request.data ?? {}
    const lessonId = requireString(data.lessonId, 'lessonId')
    const submittedBeats = Array.isArray(data.completedBeats)
      ? data.completedBeats.filter((b): b is string => typeof b === 'string')
      : []

    // Verify the submission against the seeded fixture: every Required beat must
    // be present (we never trust the client's claim of completion blindly).
    const lesson = await loadLesson(lessonId)
    const beats = lesson.beats ?? []
    const requiredBeats = beats.filter((b) => b.required).map((b) => b.beatId)
    const submitted = new Set(submittedBeats)
    const missing = requiredBeats.filter((b) => !submitted.has(b))
    if (missing.length > 0) {
      throw new HttpsError(
        'failed-precondition',
        `Required beats not completed: ${missing.join(', ')}`,
      )
    }

    const unlocks = typeof lesson.unlocks === 'string' ? lesson.unlocks : null
    const lastBeatId = beats.length > 0 ? beats[beats.length - 1].beatId : null
    const progressRef = db.doc(`users/${uid}/progress/${lessonId}`)
    const nextRef = unlocks ? db.doc(`users/${uid}/progress/${unlocks}`) : null

    // spec-01: the lesson shape review-card creation reads. lessonId is injected
    // (loadLesson keys by id, the fixture may omit it); courseId = conceptId.
    const reviewLesson: ReviewLessonDoc = {
      ...(lesson as ReviewLessonDoc),
      lessonId,
    }

    const alreadyCompleted = await db.runTransaction(async (tx) => {
      // All reads must precede all writes in a Firestore transaction.
      const progressSnap = await tx.get(progressRef)
      const nextSnap = nextRef ? await tx.get(nextRef) : null
      // spec-01 card-existence + per-concept track reads (must be BEFORE any
      // tx.set below). `needsReview` (per-lesson) and per-beat `dueAt` (cards)
      // are INDEPENDENT signals: card creation never touches needsReview; spec-10/
      // spec-20 branch UX on review-vs-first-attempt.
      const cardPlan = await readCardsForCompletion(tx, uid, reviewLesson)

      if (progressSnap.get('completionStatus') === 'completed') {
        // Replay = a review. Finishing it satisfies the review so the Study Desk
        // advances focus to the next lesson (recommendedAction stops returning
        // 'review'). Cleared even if this pass struggled, per product intent.
        //
        // spec-11 / D7: a lesson replay NO LONGER upgrades silver→gold. The
        // honest gold path is now a delayed SR pass via submitReview (§3.3) —
        // replaying the lesson the same day must not mint gold. We only clear
        // the per-lesson review flag here; gold (`derived.mastered`) is never
        // written on this path.
        const clearReview = progressSnap.get('needsReview') === true
        if (clearReview) {
          tx.set(
            progressRef,
            {
              needsReview: false,
              updatedAt: FieldValue.serverTimestamp(),
              schemaVersion: PROGRESS_SCHEMA_VERSION,
            },
            { merge: true },
          )
        }
        // spec-01 §5d: per-card existence guard is also the existing-user
        // backfill. A replay creates exactly the ABSENT cards (e.g. a user who
        // completed this lesson before spec-01 shipped) and never resets the
        // schedules of cards a prior submitReview already advanced.
        writeCardsForCompletion(tx, cardPlan)
        return true
      }

      const progressWrite: Record<string, unknown> = {
        completionStatus: 'completed',
        masteryStatus: 'mastered',
        completedBeats: submittedBeats,
        needsReview: data.needsReview === true,
        derived: buildDerived(data.derived),
        unlocks,
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        schemaVersion: PROGRESS_SCHEMA_VERSION,
      }
      if (lastBeatId) progressWrite.currentBeat = lastBeatId
      tx.set(progressRef, progressWrite, { merge: true })

      // Unlock the successor without downgrading an already-completed one.
      if (nextRef && nextSnap?.get('completionStatus') !== 'completed') {
        tx.set(
          nextRef,
          {
            unlockedAt: FieldValue.serverTimestamp(),
            unlockedBy: lessonId,
            updatedAt: FieldValue.serverTimestamp(),
            schemaVersion: PROGRESS_SCHEMA_VERSION,
          },
          { merge: true },
        )
      }
      // spec-01: create the first review card per card-eligible beat (graded-
      // required ∪ heldOut). WRITES only — must follow the progress writes above
      // (all tx reads already ran in readCardsForCompletion). Independent of
      // needsReview (R7): a per-beat due date, not the per-lesson review flag.
      writeCardsForCompletion(tx, cardPlan)
      return false
    })

    // Phase 17: award the lesson milestone (+ the mid-course milestone after the
    // first three lessons and the course-completion milestone after all six) now
    // that completion is recorded. Idempotent — a no-op re-completion re-checks
    // but never re-awards. Best-effort: a milestone failure must not fail the
    // (already-committed) completion.
    let awardedMilestones: string[] = []
    try {
      awardedMilestones = await awardMilestonesForCompletion(db, uid, lessonId)
    } catch {
      // Milestones are best-effort on the achievement path.
    }

    return {
      completionStatus: 'completed' as const,
      masteryStatus: 'mastered' as const,
      unlockedLessonId: unlocks,
      alreadyCompleted,
      awardedMilestones,
    }
  },
)

export const recordQualifyingAction = onCall(
  async (request: CallableRequest<RecordQualifyingActionData>) => {
    const uid = requireUid(request)
    const data = request.data ?? {}
    const lessonId = requireString(data.lessonId, 'lessonId')
    const beatId = requireString(data.beatId, 'beatId')

    // Only Required beats of the seeded lesson qualify (the bias sandbox etc. do
    // not increment the streak — see docs/mvp_prd.md "Streak").
    const lesson = await loadLesson(lessonId)
    const beatDef = (lesson.beats ?? []).find((b) => b.beatId === beatId)
    if (!beatDef || !beatDef.required) {
      throw new HttpsError(
        'failed-precondition',
        `${beatId} is not a required beat of ${lessonId}.`,
      )
    }

    // Upsert the progress read cache idempotently: record the current beat and a
    // de-duplicated set of completed required beats. The daily streak increment
    // is wired in Phase 17 on top of this qualifying-action seam.
    const progressRef = db.doc(`users/${uid}/progress/${lessonId}`)
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(progressRef)
      const completed = new Set<string>(
        (snap.get('completedBeats') as string[] | undefined) ?? [],
      )
      completed.add(beatId)
      const write: Record<string, unknown> = {
        currentBeat: beatId,
        completedBeats: Array.from(completed),
        updatedAt: FieldValue.serverTimestamp(),
        schemaVersion: PROGRESS_SCHEMA_VERSION,
      }
      // Seed in_progress when unset; never downgrade an already-completed lesson.
      if (snap.get('completionStatus') !== 'completed') {
        write.completionStatus = snap.get('completionStatus') ?? 'in_progress'
        write.masteryStatus = snap.get('masteryStatus') ?? 'not_mastered'
      }
      tx.set(progressRef, write, { merge: true })
    })

    // Phase 17: increment the daily streak (idempotent per local day) on top of
    // the qualifying-action seam. Best-effort: a streak failure must not fail the
    // already-recorded qualifying action.
    let streak: Awaited<ReturnType<typeof incrementDailyStreak>> | null = null
    try {
      streak = await incrementDailyStreak(db, uid, data.timezone)
    } catch {
      // Streak is best-effort; the qualifying action is already recorded.
    }

    return { recorded: true, lessonId, beatId, streak }
  },
)

// Capstone-interview callables (ADR-0008). Re-exported at the bottom so the
// initializeApp()/setGlobalOptions(...) above run before these register.
export { mintInterviewToken, gradeInterview } from './interview'

// spec-01: spaced-review write-path callable (server-graded). Re-exported here so
// initializeApp()/setGlobalOptions(...) above run before it registers.
export { submitReview } from './review'
