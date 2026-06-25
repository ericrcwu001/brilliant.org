// Firestore helpers for the `users/{uid}` profile document (Phase 13).
//
// The profile is create-once and field-whitelisted to display-name data: the
// client only ever writes `displayName` plus the `createdAt`/`lastActiveAt`
// timestamps. Phase 18 enforces this same whitelist in security rules; until
// then these helpers are the single place that shapes the write, so progression
// fields can never be smuggled in from the client.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { getDb } from '../firebase/app'

export const USERS_COLLECTION = 'users'

export const DISPLAY_NAME_MAX = 40

export interface UserDoc {
  displayName: string
  createdAt?: Timestamp
  lastActiveAt?: Timestamp
}

// Returns the profile, or null when the user has authenticated but not yet
// completed onboarding (drives the first-sign-in → display-name routing).
export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const db = await getDb()
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  return snap.exists() ? (snap.data() as UserDoc) : null
}

// Create-once: never clobbers an existing profile (so `createdAt` is stable and
// a re-run of onboarding can't reset the doc). No-ops if the profile exists.
export async function createUserDoc(
  uid: string,
  displayName: string,
): Promise<void> {
  const db = await getDb()
  const ref = doc(db, USERS_COLLECTION, uid)
  const existing = await getDoc(ref)
  if (existing.exists()) return
  await setDoc(ref, {
    displayName: displayName.trim(),
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  })
}

// Profile edit path: only the whitelisted display-name + activity stamp.
export async function updateUserDisplayName(
  uid: string,
  displayName: string,
): Promise<void> {
  const db = await getDb()
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    displayName: displayName.trim(),
    lastActiveAt: serverTimestamp(),
  })
}

// Shared validation for the onboarding and profile-edit forms.
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Enter a display name.'
  if (trimmed.length > DISPLAY_NAME_MAX) {
    return `Keep your display name under ${DISPLAY_NAME_MAX} characters.`
  }
  return null
}
