// Firebase client initialization (Group C foundation). Single source of truth
// for the app, auth, Firestore, and Functions handles used across the app.
//
// Config comes from VITE_FIREBASE_* env vars (see .env.example). When
// VITE_USE_EMULATORS === 'true' (the default dev loop), the SDK connects to the
// local Emulator Suite so the full Auth + Firestore + Functions path works
// end-to-end without touching real cloud resources. App Check (Phase 18) is
// initialized below for real projects and skipped in emulator mode.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore'
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app: FirebaseApp = initializeApp(firebaseConfig)

export const usingEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

// App Check (Phase 18): protect Firestore + Functions from scripted abuse of the
// public API key. Initialized immediately after the app and before first use of
// Firestore/Functions. Skipped in emulator/dev mode (no reCAPTCHA in the local
// loop); requires the reCAPTCHA v3 site key for the real dev/prod projects, and
// must also be enforced in the Firebase console before the public deploy.
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY as
  | string
  | undefined
if (!usingEmulators && appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const functions: Functions = getFunctions(app)

// Connect once; HMR can re-evaluate this module, and the SDK throws if an
// emulator is connected twice.
const g = globalThis as { __phhtEmulatorsConnected__?: boolean }
if (usingEmulators && !g.__phhtEmulatorsConnected__) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  g.__phhtEmulatorsConnected__ = true
}
