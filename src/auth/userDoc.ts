// Firestore helpers for the `users/{uid}` profile document (Phase 13).
//
// The profile is create-once and field-whitelisted to display-name data: the
// client only ever writes `displayName` plus the `createdAt`/`lastActiveAt`
// timestamps. Phase 18 enforces this same whitelist in security rules; until
// then these helpers are the single place that shapes the write, so progression
// fields can never be smuggled in from the client.
//
// ADR-0006: onboarding profile fields are owner-writable, non-progression fields
// stored on the same doc and covered by a widened rules update-whitelist.

import { z } from 'zod'
import type { Timestamp } from 'firebase/firestore'
import { getDb } from '../firebase/app'

export const USERS_COLLECTION = 'users'

export const DISPLAY_NAME_MAX = 40

export interface UserDoc {
  displayName: string
  createdAt?: Timestamp
  lastActiveAt?: Timestamp
  // Onboarding profile fields (ADR-0006; all optional — absent until survey is complete).
  learningGoal?: 'interview' | 'school' | 'intuition' | 'curious'
  comfortLevel?: 'new' | 'dabbled' | 'comfortable' | 'confident'
  focusArea?: string
  pace?: 'casual' | 'steady' | 'intense'
  defaultTrack?: 'A' | 'B'
  recommendedConceptId?: string
  onboardingCompletedAt?: Timestamp
}

// Lenient schema: every field except displayName is optional so an older doc
// with no onboarding fields still parses cleanly.
export const UserDocSchema = z.object({
  displayName: z.string(),
  createdAt: z.unknown().optional(),
  lastActiveAt: z.unknown().optional(),
  learningGoal: z.enum(['interview', 'school', 'intuition', 'curious']).optional(),
  comfortLevel: z.enum(['new', 'dabbled', 'comfortable', 'confident']).optional(),
  focusArea: z.string().optional(),
  pace: z.enum(['casual', 'steady', 'intense']).optional(),
  defaultTrack: z.enum(['A', 'B']).optional(),
  recommendedConceptId: z.string().optional(),
  onboardingCompletedAt: z.unknown().optional(),
})

// Returns the profile, or null when the user has authenticated but not yet
// completed onboarding (drives the first-sign-in → display-name routing).
export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const db = await getDb()
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) return null
  const parsed = UserDocSchema.safeParse(snap.data())
  return parsed.success ? (parsed.data as UserDoc) : (snap.data() as UserDoc)
}

// Create-once: never clobbers an existing profile (so `createdAt` is stable and
// a re-run of onboarding can't reset the doc). No-ops if the profile exists.
export async function createUserDoc(
  uid: string,
  displayName: string,
): Promise<void> {
  const db = await getDb()
  const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore')
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
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    displayName: displayName.trim(),
    lastActiveAt: serverTimestamp(),
  })
}

// Onboarding survey write: saves all 6 answer/derived fields plus timestamps.
// Called after the survey completes; must succeed before routing to the catalog.
export async function saveOnboardingProfile(
  uid: string,
  profile: {
    learningGoal: UserDoc['learningGoal']
    comfortLevel: UserDoc['comfortLevel']
    focusArea: string
    pace: UserDoc['pace']
    defaultTrack: 'A' | 'B'
    recommendedConceptId: string
  },
): Promise<void> {
  const db = await getDb()
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...profile,
    onboardingCompletedAt: serverTimestamp(),
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
