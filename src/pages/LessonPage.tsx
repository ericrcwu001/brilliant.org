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
import { loadTrack, saveTrack, type Track } from '../progress/track'
import { DiagnosticGate } from './DiagnosticGate'
import type { Lesson, Snapshot } from '../content/schema'
import { ROUTES, FLAGSHIP_LESSON_ID, type NavigateFn } from './routes'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; lessonId: string; message: string }
  | {
      status: 'ready'
      lessonId: string
      lesson: Lesson
      snapshot: Snapshot | null
      // null ⇒ the diagnostic hasn't run; the flagship shows DiagnosticGate.
      track: Track | null
    }

export function LessonPage({
  navigate,
  lessonId,
}: {
  navigate: NavigateFn
  lessonId: string
}) {
  const { user } = useAuth()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [reloadNonce, setReloadNonce] = useState(0)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    void (async () => {
      try {
        // Lesson content + restore snapshot + the course-level track resolve
        // together so the player mounts once with its restored initial state and
        // the right track (no post-mount reset). Missing track → Track B.
        const [lesson, snapshot, track] = await Promise.all([
          loadLessonFromFirestore(lessonId),
          loadSnapshot(uid, lessonId),
          loadTrack(uid),
        ])
        if (!cancelled)
          setState({ status: 'ready', lessonId, lesson, snapshot, track })
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
  }, [user, lessonId, reloadNonce])

  // Gate on the loaded lessonId so stale results from a previous lesson show the
  // skeleton (not the wrong lesson) until the new fetch resolves — without a
  // synchronous setState reset in the effect.
  if (state.status === 'ready' && state.lessonId === lessonId && user) {
    // First time into the flagship with no track yet → run the diagnostic, then
    // persist the choice and continue into the lesson on that track.
    if (state.track === null && lessonId === FLAGSHIP_LESSON_ID) {
      const uid = user.uid
      return (
        <DiagnosticGate
          onDone={(track) => {
            void saveTrack(uid, track).catch(() => {})
            setState({ ...state, track })
          }}
        />
      )
    }
    return (
      <LessonPlayer
        key={lessonId}
        lesson={state.lesson}
        initialSnapshot={state.snapshot}
        persistence={{ uid: user.uid, lessonId }}
        track={state.track ?? 'B'}
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
            className="btn btn--ghost"
            onClick={() => {
              setState({ status: 'loading' })
              setReloadNonce((n) => n + 1)
            }}
          >
            Retry
          </button>
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
