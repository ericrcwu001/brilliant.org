// Milestone logic (Phase 17). Function-owned so awards cannot be forged from the
// client: security rules deny client writes to users/{uid}/milestones/*.
//
// `awardMilestonesForCompletion` is the reusable core, called by the
// (parent-owned) completeLesson in index.ts right after it records a lesson as
// completed. It awards the lesson's milestone plus the mid-course milestone
// (first three lessons) and the course-completion milestone (all six). All
// writes are idempotent, so re-completing a lesson never re-awards.

import { FieldValue, type Firestore } from 'firebase-admin/firestore'

// lessonId -> milestone earned on completing that lesson (six-lesson path; see
// docs/mvp_prd.md Course Path — Overlap Shortcut is the capstone, last).
export const LESSON_MILESTONES: Record<string, string> = {
  'lesson-pattern-hitting-times': 'hh-ht-mastered',
  'lesson-penneys-game': 'penneys-game-won',
  'lesson-gamblers-ruin': 'gamblers-ruin-solved',
  'lesson-states-streaks': 'first-pattern-cracked',
  'lesson-longer-patterns': 'state-machine-builder',
  'lesson-overlap-shortcut': 'martingale-mastered',
}

// Mid-course milestone: awarded once the first three lessons (the flagship plus
// the question/arena extensions) are completed.
export const MID_COURSE_MILESTONE = 'three-lessons-complete'
export const MID_COURSE_PATH = [
  'lesson-pattern-hitting-times',
  'lesson-penneys-game',
  'lesson-gamblers-ruin',
]

// Course-completion milestone: awarded once every lesson in FULL_COURSE_PATH is
// completed.
export const COURSE_COMPLETION_MILESTONE = 'six-lessons-complete'
export const FULL_COURSE_PATH = [
  'lesson-pattern-hitting-times',
  'lesson-penneys-game',
  'lesson-gamblers-ruin',
  'lesson-states-streaks',
  'lesson-longer-patterns',
  'lesson-overlap-shortcut',
]

export const ALL_MILESTONES = new Set<string>([
  ...Object.values(LESSON_MILESTONES),
  MID_COURSE_MILESTONE,
  COURSE_COMPLETION_MILESTONE,
])

export function isKnownMilestone(id: unknown): id is string {
  return typeof id === 'string' && ALL_MILESTONES.has(id)
}

// Idempotent award: writes users/{uid}/milestones/{milestoneId} only if it does
// not already exist. Returns true iff this call created the doc.
export async function awardMilestone(
  db: Firestore,
  uid: string,
  milestoneId: string,
  sourceLessonId: string | null,
): Promise<boolean> {
  const ref = db.doc(`users/${uid}/milestones/${milestoneId}`)
  return db.runTransaction(async (txn) => {
    const snap = await txn.get(ref)
    if (snap.exists) return false
    txn.set(ref, {
      milestoneId,
      sourceLessonId: sourceLessonId ?? null,
      earnedAt: FieldValue.serverTimestamp(),
    })
    return true
  })
}

async function isLessonCompleted(
  db: Firestore,
  uid: string,
  lessonId: string,
): Promise<boolean> {
  const snap = await db.doc(`users/${uid}/progress/${lessonId}`).get()
  return snap.exists && snap.get('completionStatus') === 'completed'
}

// Award the milestone for a just-completed lesson, plus the mid-course milestone
// (first three lessons) and the course-completion milestone (all six) when their
// paths are fully done. Idempotent throughout. Returns the milestone ids newly
// awarded by this call. Call AFTER the lesson's progress doc has been written as
// completed (so the path checks see it).
export async function awardMilestonesForCompletion(
  db: Firestore,
  uid: string,
  lessonId: string,
): Promise<string[]> {
  const newly: string[] = []

  const lessonMilestone = LESSON_MILESTONES[lessonId]
  if (
    lessonMilestone &&
    (await awardMilestone(db, uid, lessonMilestone, lessonId))
  ) {
    newly.push(lessonMilestone)
  }

  const midDone = await Promise.all(
    MID_COURSE_PATH.map((id) => isLessonCompleted(db, uid, id)),
  )
  if (
    midDone.every(Boolean) &&
    (await awardMilestone(db, uid, MID_COURSE_MILESTONE, lessonId))
  ) {
    newly.push(MID_COURSE_MILESTONE)
  }

  const allDone = await Promise.all(
    FULL_COURSE_PATH.map((id) => isLessonCompleted(db, uid, id)),
  )
  if (
    allDone.every(Boolean) &&
    (await awardMilestone(db, uid, COURSE_COMPLETION_MILESTONE, lessonId))
  ) {
    newly.push(COURSE_COMPLETION_MILESTONE)
  }

  return newly
}
