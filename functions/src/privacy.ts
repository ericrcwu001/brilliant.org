// Learner-initiated data deletion (spec-05, README §4.6 — owned here).
//
// firestore.rules HARD-DENIES client `delete` on the user profile + progression
// subcollections (firestore.rules: users delete=false, reviews/calibration
// write=false), so a client delete CANNOT cascade. This callable is the
// Function-driven path: the Admin SDK bypasses rules. It is a CALLABLE, triggered
// on the learner's request — NOT a scheduled Cloud Function (D14 posture: no cron
// in v1).
//
// SCOPE (the §4.6 enumeration ONLY): the learning-science personal data THIS plan
// added. Full-account deletion (auth user + every doc) is a separate, pre-existing
// concern and is intentionally OUT OF SCOPE — this callable owns exactly §4.6 so
// the path is not orphaned, and says so rather than silently widening.
//
// Owner-only: operates ONLY on the caller's own uid (never accepts a target uid).
// Idempotent: deleting already-deleted data is a no-op success (a retried call is
// safe). Audio is NEVER stored (§4.6) — transcripts hold spoken-answer TEXT only,
// so there is no audio to delete; we field-clear per-turn `confidence`.

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const db = getFirestore()

function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.')
  return uid
}

// Extracted body so it is unit-testable with a fake Firestore (the onCall wrapper
// is opaque under vitest). Returns a small summary for the client + tests.
export async function deleteLearningDataFor(uid: string): Promise<{
  reviewsDeleted: boolean
  calibrationDeleted: boolean
  interviewsCleared: number
  userFieldsCleared: boolean
}> {
  // 1 + 2 — recursive cascade-delete of the reviews + calibration subcollections.
  // recursiveDelete is idempotent: an empty/absent collection is a no-op.
  await db.recursiveDelete(db.collection(`users/${uid}/reviews`))
  await db.recursiveDelete(db.collection(`users/${uid}/calibration`))

  // 3 + 4 — per-attempt field-clears on each interview (spec-12 calibration block,
  // spec-02 per-turn transcript confidence). The interview DOC + transcript text
  // stay intact; only the learning-science fields this plan added are cleared.
  const interviews = await db.collection(`users/${uid}/interviews`).get()
  let interviewsCleared = 0
  for (const snap of interviews.docs) {
    const data = snap.data() as Record<string, unknown>
    const update: Record<string, unknown> = {}
    if ('calibration' in data) update.calibration = FieldValue.delete()
    // Strip per-turn confidence from the transcript (field-clear within the array:
    // rewrite the turns without the confidence key). Audio was never stored.
    if (Array.isArray(data.transcript)) {
      const stripped = (data.transcript as Array<Record<string, unknown>>).map((t) => {
        if (t && typeof t === 'object' && 'confidence' in t) {
          const { confidence: _drop, ...rest } = t
          return rest
        }
        return t
      })
      const hadConfidence = (data.transcript as Array<Record<string, unknown>>).some(
        (t) => t && typeof t === 'object' && 'confidence' in t,
      )
      if (hadConfidence) update.transcript = stripped
    }
    if (Object.keys(update).length > 0) {
      update.updatedAt = FieldValue.serverTimestamp()
      await snap.ref.set(update, { merge: true })
      interviewsCleared++
    }
  }

  // 5 — userDoc fields this plan added: targetInterviewDate (spec-01) +
  // rolloutCohort (this spec). FieldValue.delete() leaves the account intact.
  // Guard: only update if the doc exists (a missing doc ⇒ nothing to clear).
  const userRef = db.doc(`users/${uid}`)
  const userSnap = await userRef.get()
  let userFieldsCleared = false
  if (userSnap.exists) {
    await userRef.set(
      {
        targetInterviewDate: FieldValue.delete(),
        rolloutCohort: FieldValue.delete(),
        lastActiveAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    userFieldsCleared = true
  }

  return {
    reviewsDeleted: true,
    calibrationDeleted: true,
    interviewsCleared,
    userFieldsCleared,
  }
}

export const deleteLearningData = onCall(async (request: CallableRequest<unknown>) => {
  const uid = requireUid(request) // owner-only: caller's own uid, never a target
  return deleteLearningDataFor(uid)
})
