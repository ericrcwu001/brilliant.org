// Maps Firebase Auth error codes to terse, notebook-tone copy (no exclamation,
// no jargon) for inline field errors. Falls back to a generic line.

const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/missing-password': 'Enter your password.',
  'auth/weak-password': 'Use at least 6 characters for your password.',
  'auth/email-already-in-use': 'An account already exists for that email.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Try again in a moment.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''
  return MESSAGES[code] ?? 'Something went wrong. Please try again.'
}
