// Profile (Phase 13 stub). Lets the learner edit their display name (the only
// client-writable, whitelisted profile field) and sign out. Signing out drops
// the user, and App's route guard handles the redirect back to the landing page.

import { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { authErrorMessage } from '../auth/authErrors'
import { DISPLAY_NAME_MAX, validateDisplayName } from '../auth/userDoc'
import { ROUTES, type NavigateFn } from './routes'

export function ProfilePage({ navigate }: { navigate: NavigateFn }) {
  const { user, userDoc, updateUserProfile, signOut } = useAuth()
  const [name, setName] = useState(userDoc?.displayName ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const dirty = name.trim() !== (userDoc?.displayName ?? '')

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const validationError = validateDisplayName(name)
    if (validationError) {
      setNameError(validationError)
      setFormError(null)
      setStatus(null)
      return
    }
    setNameError(null)
    setFormError(null)
    setStatus(null)
    setBusy(true)
    try {
      await updateUserProfile(name)
      setStatus('Saved.')
    } catch (err) {
      setFormError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="coursepath">
      <header className="appbar">
        <button
          type="button"
          className="appbar__back"
          onClick={() => navigate(ROUTES.coursePath)}
        >
          ← Path
        </button>
        <span className="appbar__title">Profile</span>
        <span className="appbar__right" />
      </header>

      <main className="profile">
        <h1 className="profile__heading">Your profile</h1>

        <form className="authform" onSubmit={handleSave} noValidate>
          <label className="field" data-error={nameError ? true : undefined}>
            <span className="field__label">Display name</span>
            <input
              className="field__input"
              type="text"
              name="displayName"
              autoComplete="nickname"
              maxLength={DISPLAY_NAME_MAX}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setStatus(null)
                if (nameError) setNameError(null)
              }}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? 'display-name-hint' : undefined}
              required
            />
            {nameError && (
              <span className="field__hint" id="display-name-hint">
                {nameError}
              </span>
            )}
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              value={user?.email ?? ''}
              readOnly
              disabled
            />
          </label>

          {formError && (
            <p className="authform__error" role="alert">
              {formError}
            </p>
          )}
          {status && (
            <p className="authform__status" role="status">
              {status}
            </p>
          )}

          <div className="authactions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={busy || !dirty}
            >
              Save changes
            </button>
          </div>
        </form>

        <div className="profile__signout">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  )
}
