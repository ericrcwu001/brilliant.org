// Two-track selection (L1 §3.3). The diagnostic pre-check writes the learner's
// track to `users/{uid}/progress/{courseId}`; the lesson route reads it to
// branch beats. This is a learner-routing choice (not an achievement), so it
// lives on a client-writable progress doc — `track` is NOT in the Firestore
// rules' progression deny-list, so no rules change is needed (the Cloud
// Functions still own completion/mastery/unlock fields).

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/app'
import { COURSE_ID } from '../content/loader'
import { ProgressSchema } from '../content/schema'

export type Track = 'A' | 'B'

const courseProgressRef = (uid: string) =>
  doc(db, 'users', uid, 'progress', COURSE_ID)

// Returns the chosen track, or null when the diagnostic hasn't run yet.
export async function loadTrack(uid: string): Promise<Track | null> {
  try {
    const snap = await getDoc(courseProgressRef(uid))
    if (!snap.exists()) return null
    const parsed = ProgressSchema.safeParse(snap.data())
    return parsed.success ? (parsed.data.track ?? null) : null
  } catch {
    // Offline/denied/unparseable → treat as not-yet-chosen (caller defaults).
    return null
  }
}

export async function saveTrack(uid: string, track: Track): Promise<void> {
  await setDoc(
    courseProgressRef(uid),
    { track, schemaVersion: 1, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
