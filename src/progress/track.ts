// Two-track selection (L1 §3.3 / ADR-0006). The Calibrate check writes the
// learner's per-concept track to `users/{uid}/progress/{conceptId}`; the lesson
// route reads it to branch beats. The global default track lives on the user
// doc (set during onboarding); effective track = per-concept ?? global default.
//
// This is a learner-routing choice (not an achievement), so it lives on a
// client-writable progress doc — `track` is NOT in the Firestore rules'
// progression deny-list, so no rules change is needed.

import { getDb } from '../firebase/app'
import { ProgressSchema } from '../content/schema'

export type Track = 'A' | 'B'

// Returns the per-concept chosen track, or null when the Calibrate hasn't run
// for this concept yet (caller falls back to the global defaultTrack).
export async function loadTrack(uid: string, conceptId: string): Promise<Track | null> {
  try {
    const db = await getDb()
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, 'users', uid, 'progress', conceptId))
    if (!snap.exists()) return null
    const parsed = ProgressSchema.safeParse(snap.data())
    return parsed.success ? (parsed.data.track ?? null) : null
  } catch {
    // Offline/denied/unparseable → treat as not-yet-chosen (caller defaults).
    return null
  }
}

export async function saveTrack(uid: string, conceptId: string, track: Track): Promise<void> {
  const db = await getDb()
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(
    doc(db, 'users', uid, 'progress', conceptId),
    { track, schemaVersion: 1, updatedAt: serverTimestamp() },
    { merge: true },
  )
}
