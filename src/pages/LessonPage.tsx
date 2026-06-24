// Lesson route (Phase 15/16). Loads the lesson from Firestore and hydrates the
// restore snapshot (newer of Firestore vs the local mirror), shows the
// design-system loading skeleton while both resolve, then renders the
// LessonPlayer with persistence + completion wired in. The dev fixture lesson
// still lives at /dev/lesson (no auth, no persistence).

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { loadLessonFromFirestore } from '../content/loader'
import { loadSnapshot } from '../lesson/snapshot'
import { LessonPlayer } from '../lesson/LessonPlayer'
import type { Lesson, Snapshot } from '../content/schema'
import { ROUTES, type NavigateFn } from './routes'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; lessonId: string; message: string }
  | { status: 'ready'; lessonId: string; lesson: Lesson; snapshot: Snapshot | null }

export function LessonPage({
  navigate,
  lessonId,
}: {
  navigate: NavigateFn
  lessonId: string
}) {
  const { user } = useAuth()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    void (async () => {
      try {
        // Lesson content + restore snapshot resolve together so the player mounts
        // once with its restored initial state (no post-mount state reset).
        const [lesson, snapshot] = await Promise.all([
          loadLessonFromFirestore(lessonId),
          loadSnapshot(uid, lessonId),
        ])
        if (!cancelled) setState({ status: 'ready', lessonId, lesson, snapshot })
      } catch (err) {
        if (!cancelled) {
          setState({
            status: 'error',
            lessonId,
            message:
              err instanceof Error ? err.message : 'Could not load this lesson.',
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, lessonId])

  // Gate on the loaded lessonId so stale results from a previous lesson show the
  // skeleton (not the wrong lesson) until the new fetch resolves — without a
  // synchronous setState reset in the effect.
  if (state.status === 'ready' && state.lessonId === lessonId && user) {
    return (
      <LessonPlayer
        key={lessonId}
        lesson={state.lesson}
        initialSnapshot={state.snapshot}
        persistence={{ uid: user.uid, lessonId }}
        onExit={() => navigate(ROUTES.coursePath)}
      />
    )
  }

  if (state.status === 'error' && state.lessonId === lessonId) {
    return (
      <div className="lesson">
        <header className="topbar">
          <button
            type="button"
            className="topbar__back"
            onClick={() => navigate(ROUTES.coursePath)}
            aria-label="Back to course path"
          >
            ←
          </button>
          <div className="topbar__center">
            <span className="topbar__title">{lessonId}</span>
          </div>
          <span className="streak" aria-label="Daily streak">
            0
          </span>
        </header>
        <section className="lessonloading" role="alert">
          <p className="prompt__text">{state.message}</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(ROUTES.coursePath)}
          >
            Back to course path
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="lesson">
      <header className="topbar">
        <button
          type="button"
          className="topbar__back"
          onClick={() => navigate(ROUTES.coursePath)}
          aria-label="Back to course path"
        >
          ←
        </button>
        <div className="topbar__center">
          <span className="topbar__title">{lessonId}</span>
        </div>
        <span className="streak" aria-label="Daily streak">
          0
        </span>
      </header>

      <section className="lessonloading" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading lesson…</span>
        <div className="skeleton skeleton__kicker" />
        <div className="skeleton skeleton__prompt" />
        <div className="skeleton skeleton__region" />
        <div className="skeleton skeleton__bar" />
      </section>
    </div>
  )
}
