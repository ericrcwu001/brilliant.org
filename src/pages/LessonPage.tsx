// Lesson route (Phase 15/16). Loads the lesson from Firestore and hydrates the
// restore snapshot (newer of Firestore vs the local mirror), shows the
// design-system loading skeleton while both resolve, then renders the
// LessonPlayer with persistence + completion wired in. The dev fixture lesson
// still lives at /dev/lesson (no auth, no persistence).
//
// ADR-0006: calibration now happens at concept entry (CoursePathPage), not here.
// Track = per-concept track ?? userDoc.defaultTrack ?? 'B'.

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { loadLessonFromFirestore, COURSE_ID } from '../content/loader'
import { loadSnapshot } from '../lesson/snapshot'
import { LessonPlayer } from '../lesson/LessonPlayer'
import { loadTrack, type Track } from '../progress/track'
import { loadProgress } from '../progress/progress'
import type { Lesson, Snapshot } from '../content/schema'
import { ROUTES, type NavigateFn } from './routes'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; lessonId: string; message: string }
  | {
      status: 'ready'
      lessonId: string
      lesson: Lesson
      snapshot: Snapshot | null
      // null ⇒ per-concept calibrate not yet taken; fall back to global default.
      track: Track | null
      completed: boolean
    }

export function LessonPage({
  navigate,
  lessonId,
}: {
  navigate: NavigateFn
  lessonId: string
}) {
  const { user, userDoc } = useAuth()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [reloadNonce, setReloadNonce] = useState(0)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    void (async () => {
      try {
        // TODO: map lesson→concept when multiple concepts go live.
        // For now all live lessons belong to the flagship concept.
        const conceptId = COURSE_ID
        const [lesson, snapshot, track, progress] = await Promise.all([
          loadLessonFromFirestore(lessonId),
          loadSnapshot(uid, lessonId),
          loadTrack(uid, conceptId),
          loadProgress(uid, lessonId),
        ])
        if (!cancelled)
          setState({
            status: 'ready',
            lessonId,
            lesson,
            snapshot,
            track,
            completed: progress?.completionStatus === 'completed',
          })
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

  if (state.status === 'ready' && state.lessonId === lessonId && user) {
    // Effective track: per-concept calibrate ?? global default ?? 'B'.
    const effectiveTrack: Track = state.track ?? userDoc?.defaultTrack ?? 'B'
    return (
      <LessonPlayer
        key={lessonId}
        lesson={state.lesson}
        initialSnapshot={state.snapshot}
        persistence={{ uid: user.uid, lessonId }}
        track={effectiveTrack}
        review={state.completed}
        onExit={() => navigate(ROUTES.landing)}
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
            onClick={() => navigate(ROUTES.landing)}
            aria-label="Back to catalog"
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
            onClick={() => navigate(ROUTES.landing)}
          >
            Back to catalog
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
          onClick={() => navigate(ROUTES.landing)}
          aria-label="Back to catalog"
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
