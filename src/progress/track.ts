// Two-track selection (L1 §3.3). The diagnostic pre-check writes the learner's
// track to `users/{uid}/progress/{courseId}`; the lesson route reads it to
// branch beats. This is a learner-routing choice (not an achievement), so it
// lives on a client-writable progress doc — `track` is NOT in the Firestore
// rules' progression deny-list, so no rules change is needed (the Cloud
// Functions still own completion/mastery/unlock fields).

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDb } from '../firebase/app'
import { COURSE_ID } from '../content/loader'
import { ProgressSchema } from '../content/schema'

export type Track = 'A' | 'B'

// Returns the chosen track, or null when the diagnostic hasn't run yet.
export async function loadTrack(uid: string): Promise<Track | null> {
  try {
    const db = await getDb()
    const snap = await getDoc(doc(db, 'users', uid, 'progress', COURSE_ID))
    if (!snap.exists()) return null
    const parsed = ProgressSchema.safeParse(snap.data())
    return parsed.success ? (parsed.data.track ?? null) : null
  } catch {
    // Offline/denied/unparseable → treat as not-yet-chosen (caller defaults).
    return null
  }
}

export async function saveTrack(uid: string, track: Track): Promise<void> {
  const db = await getDb()
  await setDoc(
    doc(db, 'users', uid, 'progress', COURSE_ID),
    { track, schemaVersion: 1, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// First-run welcome (new accounts). The welcome offer of the optional intro (L0)
// is shown once; `welcomeSeenAt` on the same course progress doc records that it
// has been shown. Like `track`, it is not in the rules' progression deny-list, so
// the client may write it.

// Returns true once the learner has been shown the welcome (started the intro or
// skipped); false when it has never been shown (brand-new account).
export async function loadWelcomeSeen(uid: string): Promise<boolean> {
  try {
    const db = await getDb()
    const snap = await getDoc(doc(db, 'users', uid, 'progress', COURSE_ID))
    if (!snap.exists()) return false
    const parsed = ProgressSchema.safeParse(snap.data())
    return parsed.success ? parsed.data.welcomeSeenAt != null : false
  } catch {
    // Offline/denied/unparseable → fail open (don't trap the learner behind the
    // welcome); the caller treats this as already-seen.
    return true
  }
}

export async function markWelcomeSeen(uid: string): Promise<void> {
  const db = await getDb()
  await setDoc(
    doc(db, 'users', uid, 'progress', COURSE_ID),
    { welcomeSeenAt: serverTimestamp(), schemaVersion: 1, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// Combined reader: loads track + welcomeSeen in a single round trip. Used by
// CoursePathPage to avoid two identical getDoc calls on entry.
export async function loadCourseEntryState(
  uid: string,
): Promise<{ track: Track | null; welcomeSeen: boolean }> {
  try {
    const db = await getDb()
    const snap = await getDoc(doc(db, 'users', uid, 'progress', COURSE_ID))
    if (!snap.exists()) return { track: null, welcomeSeen: false }
    const parsed = ProgressSchema.safeParse(snap.data())
    if (!parsed.success) return { track: null, welcomeSeen: false }
    return { track: parsed.data.track ?? null, welcomeSeen: parsed.data.welcomeSeenAt != null }
  } catch {
    // Offline/denied: not-yet-chosen track, fail-open welcome (matches existing
    // loadWelcomeSeen fallback).
    return { track: null, welcomeSeen: true }
  }
}
