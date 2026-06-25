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

// Mid-course milestone: awarded once the first three flagship lessons are
// completed. Flagship-only (hand-authored; not modeled in the course schema).
export const MID_COURSE_MILESTONE = 'three-lessons-complete'
export const MID_COURSE_PATH = [
  'lesson-pattern-hitting-times',
  'lesson-penneys-game',
  'lesson-gamblers-ruin',
]

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

// Award the milestones earned by completing `lessonId`: the lesson's own
// milestone (optional on-ramps earn none), the concept-completion milestone once
// every required lesson of that concept is done, and — for the flagship only —
// the hand-authored mid-course mark. Milestones resolve from the seeded
// lesson/course docs, so EVERY concept awards its own badge set (not just the
// flagship). Idempotent throughout. Returns the milestone ids newly awarded by
// this call. Call AFTER the lesson's progress doc has been written as completed.
type CourseNode = { lessonId: string; milestoneId?: string; optional?: boolean }

export async function awardMilestonesForCompletion(
  db: Firestore,
  uid: string,
  lessonId: string,
): Promise<string[]> {
  const newly: string[] = []

  // Resolve the lesson's concept + node from the seeded docs.
  const lessonSnap = await db.doc(`lessons/${lessonId}`).get()
  const courseId = lessonSnap.get('courseId') as string | undefined
  const courseSnap = courseId ? await db.doc(`courses/${courseId}`).get() : null
  const courseData = courseSnap?.exists ? courseSnap.data() : undefined
  const nodes = (courseData?.lessons ?? []) as CourseNode[]
  const node = nodes.find((n) => n.lessonId === lessonId)

  // 1) The lesson's own milestone — optional on-ramps earn no gallery badge.
  const lessonMilestone =
    node?.milestoneId ?? (lessonSnap.get('milestoneId') as string | undefined)
  if (
    lessonMilestone &&
    node?.optional !== true &&
    (await awardMilestone(db, uid, lessonMilestone, lessonId))
  ) {
    newly.push(lessonMilestone)
  }

  // 2) Concept-completion milestone once every required lesson is completed.
  const completionMilestone = courseData?.completionMilestoneId as
    | string
    | undefined
  if (completionMilestone) {
    const required = nodes
      .filter((n) => n.optional !== true)
      .map((n) => n.lessonId)
    const done = await Promise.all(
      required.map((id) => isLessonCompleted(db, uid, id)),
    )
    if (
      required.length > 0 &&
      done.every(Boolean) &&
      (await awardMilestone(db, uid, completionMilestone, lessonId))
    ) {
      newly.push(completionMilestone)
    }
  }

  // 3) Flagship-only mid-course mark (hand-authored; not in the course schema).
  if (LESSON_MILESTONES[lessonId]) {
    const midDone = await Promise.all(
      MID_COURSE_PATH.map((id) => isLessonCompleted(db, uid, id)),
    )
    if (
      midDone.every(Boolean) &&
      (await awardMilestone(db, uid, MID_COURSE_MILESTONE, lessonId))
    ) {
      newly.push(MID_COURSE_MILESTONE)
    }
  }

  return newly
}
