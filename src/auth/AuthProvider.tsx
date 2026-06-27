// Auth provider for the auth-first flow (Phase 13).
//
// Owns two pieces of async state the router guards on:
//   - the Firebase Auth user (`onAuthStateChanged`), and
//   - the `users/{uid}` profile doc (missing ⇒ route to display-name capture).
//
// Email/password + Google are the two providers. Display-name writes are
// orchestrated here so the `users/{uid}` doc (the app's source of truth) and the
// Firebase Auth profile stay in sync, and the cached profile is refreshed after.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '../firebase/app'
import { AuthContext, type AuthContextValue, type OnboardingProfile } from './authContext'
import {
  createUserDoc,
  fetchUserDoc,
  updateUserDisplayName,
  saveOnboardingProfile,
  saveTargetInterviewDate,
  type UserDoc,
} from './userDoc'

const googleProvider = new GoogleAuthProvider()

// The profile fetch result, tagged with the uid it was loaded for so readiness
// can be derived (avoids synchronous setState in the user-change effect).
interface UserDocResult {
  uid: string
  doc: UserDoc | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [userDocResult, setUserDocResult] = useState<UserDocResult | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthReady(true)
    })
  }, [])

  // Load the profile whenever the signed-in user changes. State is only set from
  // the async callbacks; readiness for the current user is derived below.
  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    fetchUserDoc(uid)
      .then((doc) => {
        if (!cancelled) setUserDocResult({ uid, doc })
      })
      .catch(() => {
        if (!cancelled) setUserDocResult({ uid, doc: null })
      })
    return () => {
      cancelled = true
    }
  }, [user])

  // Signed out ⇒ no profile, and ready (nothing to load). Signed in ⇒ ready only
  // once a result tagged for the current uid has arrived.
  const userDocReady = !user || userDocResult?.uid === user.uid
  const userDoc =
    user && userDocResult?.uid === user.uid ? userDocResult.doc : null

  const refreshUserDoc = useCallback(async () => {
    const current = auth.currentUser
    if (!current) return
    const doc = await fetchUserDoc(current.uid)
    setUserDocResult({ uid: current.uid, doc })
  }, [])

  const createUserProfile = useCallback(
    async (displayName: string) => {
      const current = auth.currentUser
      if (!current) throw new Error('Not signed in.')
      await createUserDoc(current.uid, displayName)
      // Keep the Firebase Auth profile in sync; non-critical if it fails since
      // the users/{uid} doc is authoritative.
      try {
        await updateProfile(current, { displayName: displayName.trim() })
      } catch {
        /* ignore */
      }
      await refreshUserDoc()
    },
    [refreshUserDoc],
  )

  const updateUserProfile = useCallback(
    async (displayName: string) => {
      const current = auth.currentUser
      if (!current) throw new Error('Not signed in.')
      await updateUserDisplayName(current.uid, displayName)
      try {
        await updateProfile(current, { displayName: displayName.trim() })
      } catch {
        /* ignore */
      }
      await refreshUserDoc()
    },
    [refreshUserDoc],
  )

  const completeOnboarding = useCallback(
    async (profile: OnboardingProfile) => {
      const current = auth.currentUser
      if (!current) throw new Error('Not signed in.')
      await saveOnboardingProfile(current.uid, profile)
      await refreshUserDoc()
    },
    [refreshUserDoc],
  )

  const setTargetInterviewDate = useCallback(
    async (date: string | null) => {
      const current = auth.currentUser
      if (!current) throw new Error('Not signed in.')
      await saveTargetInterviewDate(current.uid, date)
      await refreshUserDoc()
    },
    [refreshUserDoc],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authReady,
      userDoc,
      userDocReady,
      signUpWithEmail: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password)
      },
      signInWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
      },
      signInWithGoogle: async () => {
        await signInWithPopup(auth, googleProvider)
      },
      signOut: async () => {
        await firebaseSignOut(auth)
      },
      createUserProfile,
      updateUserProfile,
      completeOnboarding,
      setTargetInterviewDate,
    }),
    [
      user,
      authReady,
      userDoc,
      userDocReady,
      createUserProfile,
      updateUserProfile,
      completeOnboarding,
      setTargetInterviewDate,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
