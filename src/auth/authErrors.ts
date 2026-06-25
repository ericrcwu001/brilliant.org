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

const EMAIL_CODES = new Set([
  'auth/invalid-email',
  'auth/email-already-in-use',
  'auth/user-not-found',
])

const PASSWORD_CODES = new Set([
  'auth/missing-password',
  'auth/weak-password',
  'auth/wrong-password',
  'auth/invalid-credential',
])

export type AuthField = 'email' | 'password' | null

export interface AuthFieldError {
  field: AuthField
  message: string
}

function authErrorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : ''
}

export function authErrorMessage(error: unknown): string {
  return MESSAGES[authErrorCode(error)] ?? 'Something went wrong. Please try again.'
}

export function classifyAuthError(error: unknown): AuthFieldError {
  const code = authErrorCode(error)
  const message = MESSAGES[code] ?? 'Something went wrong. Please try again.'
  if (EMAIL_CODES.has(code)) return { field: 'email', message }
  if (PASSWORD_CODES.has(code)) return { field: 'password', message }
  return { field: null, message }
}
