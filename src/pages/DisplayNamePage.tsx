// First-sign-in display-name capture (Phase 13). Only reachable when the user is
// authenticated but has no `users/{uid}` doc yet (App's guard enforces this).
// Submitting creates the create-once profile; the guard then routes to the
// course path once the profile is present, so this page never navigates itself.

import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { authErrorMessage } from '../auth/authErrors'
import { DISPLAY_NAME_MAX, validateDisplayName } from '../auth/userDoc'

export function DisplayNamePage() {
  const { user, createUserProfile } = useAuth()
  // Prefill from a Google display name when present; email users start empty.
  const [name, setName] = useState(user?.displayName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const validationError = validateDisplayName(name)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setBusy(true)
    try {
      await createUserProfile(name)
      // On success the profile becomes present and the route guard redirects.
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <main className="authpage">
      <div className="authcard">
        <p className="authcard__eyebrow">One last thing</p>
        <h1 className="authcard__title">What should we call you?</h1>
        <p className="authcard__sub">
          This is the name shown on your course path. You can change it later.
        </p>

        <form className="authform" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Display name</span>
            <input
              className="field__input"
              type="text"
              name="displayName"
              autoComplete="nickname"
              maxLength={DISPLAY_NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </label>

          {error && (
            <p className="authform__error" role="alert">
              {error}
            </p>
          )}

          <div className="authactions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              Continue
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
