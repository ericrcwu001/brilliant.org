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
  // Optional target interview date (YYYY-MM-DD; ADR-0009/D13). Client-writable,
  // non-progression profile field; drives SM-2 interview-date anchoring (spec-01).
  targetInterviewDate?: string
  // Rollout cohort (spec-05, D17 / README §4.5). ONE enum 'treatment' | 'holdout'
  // (no 'control' literal). Assigned ONCE (deterministic hash of uid vs
  // rolloutPercent), then immutable so a user never flips mid-study (poisons
  // spec-04's measurement). Client-writable (non-progression); the SAME value is
  // stamped onto the analytics `cohort` dimension verbatim (spec-04 reads it,
  // control arm = 'holdout').
  rolloutCohort?: 'treatment' | 'holdout'
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
  targetInterviewDate: z.string().optional(),
  rolloutCohort: z.enum(['treatment', 'holdout']).optional(),
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

// Profile edit path: set or clear the optional target interview date (D13,
// spec-01). YYYY-MM-DD when present; passing `null` removes the field entirely.
// Like updateUserDisplayName, this is the single place that shapes the write so
// no progression field can ride along. Drives SM-2 interview-date anchoring.
export async function saveTargetInterviewDate(
  uid: string,
  date: string | null,
): Promise<void> {
  const db = await getDb()
  const { doc, updateDoc, serverTimestamp, deleteField } = await import(
    'firebase/firestore'
  )
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    targetInterviewDate: date === null ? deleteField() : date,
    lastActiveAt: serverTimestamp(),
  })
}

// Assign-once write of the rollout cohort (spec-05, D17). Persists the
// deterministic assignment ONLY when the doc has no cohort yet — a second call
// (or a raised rolloutPercent) never overwrites an existing cohort, so a user
// never flips holdout↔treatment mid-study. Client-writable (non-progression,
// in the rules update whitelist). Returns the cohort now on the doc (existing or
// newly written). Best-effort: a write failure self-heals (the bucket is
// deterministic, so the next load recomputes the same value).
export async function ensureRolloutCohort(
  uid: string,
  cohort: 'treatment' | 'holdout',
): Promise<'treatment' | 'holdout'> {
  const db = await getDb()
  const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore')
  const ref = doc(db, USERS_COLLECTION, uid)
  const snap = await getDoc(ref)
  const existing = snap.exists() ? (snap.data().rolloutCohort as unknown) : undefined
  if (existing === 'treatment' || existing === 'holdout') return existing
  await updateDoc(ref, { rolloutCohort: cohort, lastActiveAt: serverTimestamp() })
  return cohort
}

// Onboarding survey write: saves all 6 answer/derived fields plus timestamps,
// and the optional target interview date (D13) when the learner provided one.
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
    // Optional 5th onboarding step (spec-01 §7). Written only when present so
    // existing callers and the Skip path are unaffected.
    targetInterviewDate?: string
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

// Validate + normalize the optional target interview date (D13, spec-01).
// Empty input is OK and means "no date" (returns null). A non-empty value must be
// a YYYY-MM-DD calendar date that is not in the past (today is allowed). Returns
// the trimmed YYYY-MM-DD string when valid, null when empty, or throws the error
// message string for the form to display inline (mirrors validateDisplayName's
// caller contract but distinguishes "empty → no date" from "invalid → error").
export function validateInterviewDate(date: string): string | null {
  const trimmed = date.trim()
  if (trimmed.length === 0) return null // empty ⇒ "no date"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error('Enter the date as YYYY-MM-DD.')
  }
  // Compare calendar days in local time (the <input type="date"> value is a
  // local calendar day). A date that does not round-trip is invalid (e.g. 02-30).
  const [y, m, d] = trimmed.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  if (
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== m - 1 ||
    parsed.getDate() !== d
  ) {
    throw new Error('Enter a real calendar date.')
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (parsed.getTime() < today.getTime()) {
    throw new Error('Choose a date in the future.')
  }
  return trimmed
}
