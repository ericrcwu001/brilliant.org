// Course-path route data container (Phase 17 wiring; Study Desk reskin). Loads
// the seeded course from Firestore, overlays the Cloud-Function-written progress
// cache, and reads streak + earned milestones from the habit loop, then hands
// them to the presentational <StudyDesk>. All rendering lives in StudyDesk; this
// file is intentionally just the data wiring (so the reskin is decoupled and the
// /dev/home harness can render StudyDesk with fixture data and no Firebase).

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { COURSE_ID, loadCourseFromFirestore } from '../content/loader'
import type { Course, Progress } from '../content/schema'
import { subscribeProgressMap } from '../progress/progress'
import { subscribeStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { subscribeEarnedMilestones } from '../habit/milestones'
import {
  loadCourseEntryState,
  saveTrack,
  markWelcomeSeen,
  type Track,
} from '../progress/track'
import { analytics } from '../analytics/events'
import { StudyDesk } from './StudyDesk'
import { DiagnosticGate } from './DiagnosticGate'
import { WelcomeScreen } from './WelcomeScreen'
import { lessonPath, INTRO_LESSON_ID, ROUTES, type NavigateFn } from './routes'

const seenKey = (uid: string) => `phht:seenSeals:${uid}`

function readSeen(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]'))
  } catch {
    return new Set()
  }
}

function writeSeen(key: string, ids: Iterable<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    // Storage unavailable — the fade simply won't be suppressed next time.
  }
}

export function CoursePathPage({
  navigate,
  conceptId,
}: {
  navigate: NavigateFn
  /** Which concept to load. Defaults to the flagship course (back-compat). */
  conceptId?: string
}) {
  const { user, userDoc } = useAuth()
  const displayName = userDoc?.displayName ?? user?.displayName ?? 'there'
  // Resolved concept id used for Firestore loading and the view-transition morph target.
  const effectiveConceptId = conceptId ?? COURSE_ID

  const [course, setCourse] = useState<Course | null>(null)
  const [progressById, setProgressById] = useState<Record<string, Progress>>({})
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const [earned, setEarned] = useState<Set<string>>(new Set())
  const [newlyEarned, setNewlyEarned] = useState<Set<string>>(new Set())
  // Two-track diagnostic at course entry (build-brief §4.8). `undefined` = still
  // loading; `null` = not yet taken (show the gate); 'A'/'B' = chosen.
  const [track, setTrack] = useState<Track | null | undefined>(undefined)
  // First-run welcome (new accounts). `undefined` = still loading; `false` =
  // show it; `true` = already shown (started the intro or skipped).
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    // The welcome + diagnostic ("Quick check") are flagship-only: they live on the
    // single flagship progress doc and the diagnostic questions are PHT-specific.
    // For any other concept, skip both gates (default to the lean Track B) so the
    // concept's own journey opens directly instead of the flagship's diagnostic.
    // (Per-concept "Calibrate" is the planned onboarding redesign.)
    if (effectiveConceptId !== COURSE_ID) {
      // Defer to a microtask so this isn't a synchronous setState in the effect
      // body (mirrors the async loadCourseEntryState().then() pattern below).
      void Promise.resolve().then(() => {
        setTrack((prev) => (prev === undefined ? 'B' : prev))
        setWelcomeSeen((prev) => (prev === undefined ? true : prev))
      })
      return
    }
    let cancelled = false
    void loadCourseEntryState(uid).then(({ track: t, welcomeSeen: seen }) => {
      if (!cancelled) {
        // Don't clobber a track the learner just chose this session (Skip ->
        // 'A', or the diagnostic) if this initial load resolves afterward.
        setTrack((prev) => (prev === undefined ? t : prev))
        // Same guard as the track load: never overwrite a local decision made
        // before this initial read resolves.
        setWelcomeSeen((prev) => (prev === undefined ? seen : prev))
      }
    })
    return () => {
      cancelled = true
    }
  }, [user, effectiveConceptId])

  useEffect(() => {
    let cancelled = false
    void loadCourseFromFirestore(conceptId ?? COURSE_ID)
      .then((c) => {
        if (!cancelled) setCourse(c)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [conceptId])

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    const unsubscribeProgress = subscribeProgressMap(uid, setProgressById)
    const unsubscribeStreak = subscribeStreak(uid, setStreak)
    const unsubscribeEarned = subscribeEarnedMilestones(uid, (m) => {
      setEarned(m)
      // Earn moment (Q11): play the one-time ghost→inked fade for any seal not
      // yet seen on this device. A live listener now delivers a seal the instant
      // the completeLesson Cloud Function awards it, so diff every snapshot
      // against the per-user localStorage seen set, then persist so the fade
      // never replays.
      const key = seenKey(uid)
      const seen = readSeen(key)
      const newly = new Set([...m].filter((id) => !seen.has(id)))
      if (newly.size > 0) setNewlyEarned(newly)
      writeSeen(key, m)
    })
    return () => {
      unsubscribeProgress()
      unsubscribeStreak()
      unsubscribeEarned()
    }
  }, [user])

  const reviewFired = useRef(false)
  useEffect(() => {
    if (reviewFired.current) return
    const reviewLessonId = Object.entries(progressById).find(
      ([, p]) => p.needsReview,
    )?.[0]
    if (reviewLessonId) {
      reviewFired.current = true
      analytics.reviewRecommendedShown({ lessonId: reviewLessonId })
    }
  }, [progressById])

  // First-run welcome (new accounts): greet + offer the optional intro (L0)
  // before the diagnostic. Shown once; persisted as `welcomeSeenAt` on the
  // course progress doc. Takes precedence over the diagnostic below.
  if (user && welcomeSeen === false) {
    const uid = user.uid
    return (
      <WelcomeScreen
        displayName={displayName}
        onStartIntro={() => {
          void markWelcomeSeen(uid).catch(() => {})
          setWelcomeSeen(true)
          navigate(lessonPath(INTRO_LESSON_ID))
        }}
        onSkip={() => {
          void markWelcomeSeen(uid).catch(() => {})
          setWelcomeSeen(true)
          void saveTrack(uid, 'A').catch(() => {})
          setTrack('A')
        }}
      />
    )
  }

  // Course entry: run the ~60s diagnostic once if the learner has no track yet,
  // persist the choice, then reveal the path. Gated behind the welcome so a
  // brand-new account always sees the welcome first. L0 stays offered to everyone.
  if (user && welcomeSeen === true && track === null) {
    const uid = user.uid
    return (
      <DiagnosticGate
        onDone={(t) => {
          void saveTrack(uid, t).catch(() => {})
          setTrack(t)
        }}
      />
    )
  }

  // Hold the desk skeleton until the first-run gates (welcome → diagnostic) have
  // resolved, so the real desk never flashes before them for a new account.
  const firstRunResolving =
    !!user && (welcomeSeen === undefined || track === undefined)

  return (
    <StudyDesk
      course={firstRunResolving ? null : course}
      progressById={progressById}
      streak={streak}
      earned={earned}
      newlyEarned={newlyEarned}
      displayName={displayName}
      navigate={navigate}
      onBack={() => navigate(ROUTES.landing)}
      conceptTitle={course?.title ?? effectiveConceptId}
    />
  )
}
