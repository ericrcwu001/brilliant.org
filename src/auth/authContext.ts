// Auth context + hook, split from the provider component so the provider file
// only exports a component (repo convention: logic in .ts, components in .tsx;
// keeps react-refresh happy).

import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserDoc } from './userDoc'

export type OnboardingProfile = {
  learningGoal: UserDoc['learningGoal']
  comfortLevel: UserDoc['comfortLevel']
  focusArea: string
  pace: UserDoc['pace']
  defaultTrack: 'A' | 'B'
  recommendedConceptId: string
}

export interface AuthContextValue {
  user: User | null
  /** True once the first `onAuthStateChanged` has resolved. */
  authReady: boolean
  /** The `users/{uid}` profile, or null if not yet onboarded. */
  userDoc: UserDoc | null
  /** True once the profile fetch for the current user has resolved. */
  userDocReady: boolean
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  /** First-sign-in display-name capture: create-once profile + auth sync. */
  createUserProfile: (displayName: string) => Promise<void>
  /** Profile edit: update the whitelisted display name + auth sync. */
  updateUserProfile: (displayName: string) => Promise<void>
  /** Onboarding survey completion: writes the 6 profile fields + timestamps. */
  completeOnboarding: (profile: OnboardingProfile) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
