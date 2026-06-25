// Sign-in / create-account screen (Phase 13). One form that toggles between the
// two modes; email/password plus Google. On success the AuthProvider state
// updates and App's route guard redirects (to display-name capture on first
// sign-in, else the course path), so this page never navigates on success.

import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { classifyAuthError, type AuthFieldError } from '../auth/authErrors'
import type { NavigateFn } from './routes'
import { ROUTES } from './routes'

type Mode = 'create' | 'signin'

function initialMode(): Mode {
  const mode = new URLSearchParams(window.location.search).get('mode')
  return mode === 'signin' ? 'signin' : 'create'
}

export function AuthPage({ navigate }: { navigate: NavigateFn }) {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<AuthFieldError | null>(null)
  const [busy, setBusy] = useState(false)

  const isCreate = mode === 'create'

  function clearError() {
    setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError({ field: 'email', message: 'Enter your email.' })
      return
    }
    if (!password) {
      setError({ field: 'password', message: 'Enter your password.' })
      return
    }

    setBusy(true)
    try {
      if (isCreate) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      setError(classifyAuthError(err))
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(classifyAuthError(err))
      setBusy(false)
    }
  }

  function toggleMode() {
    setError(null)
    setMode(isCreate ? 'signin' : 'create')
  }

  return (
    <main className="authpage">
      <div className="authcard">
        <button
          type="button"
          className="authcard__back"
          onClick={() => navigate(ROUTES.landing)}
        >
          ← Back
        </button>

        <h1 className="authcard__title">
          {isCreate ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="authcard__sub">
          {isCreate
            ? 'Start with the flagship pattern-hitting-times lesson.'
            : 'Sign in to pick up where you left off.'}
        </p>

        <form className="authform" onSubmit={handleSubmit} noValidate>
          <label className="field" data-error={error?.field === 'email' || undefined}>
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error?.field === 'email') clearError()
              }}
              aria-invalid={error?.field === 'email' || undefined}
              aria-describedby={error?.field === 'email' ? 'email-hint' : undefined}
              required
            />
            {error?.field === 'email' && (
              <span className="field__hint" id="email-hint">
                {error.message}
              </span>
            )}
          </label>

          <label className="field" data-error={error?.field === 'password' || undefined}>
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              name="password"
              autoComplete={isCreate ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error?.field === 'password') clearError()
              }}
              aria-invalid={error?.field === 'password' || undefined}
              aria-describedby={
                error?.field === 'password' ? 'password-hint' : undefined
              }
              required
            />
            {error?.field === 'password' && (
              <span className="field__hint" id="password-hint">
                {error.message}
              </span>
            )}
          </label>

          {error?.field === null && (
            <p className="authform__error" role="alert">
              {error.message}
            </p>
          )}

          <div className="authactions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={busy}
            >
              {isCreate ? 'Create account' : 'Sign in'}
            </button>

            <div className="authdivider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn--secondary googlebtn"
              onClick={handleGoogle}
              disabled={busy}
            >
              <GoogleMark />
              Continue with Google
            </button>
          </div>
        </form>

        <p className="authswitch">
          {isCreate ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="authswitch__btn" onClick={toggleMode}>
            {isCreate ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg
      className="googlebtn__mark"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}
