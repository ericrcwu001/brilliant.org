// Course-path route data container (Phase 17 wiring; Study Desk reskin). Loads
// the seeded course from Firestore, overlays the Cloud-Function-written progress
// cache, and reads streak + earned milestones from the habit loop, then hands
// them to the presentational <StudyDesk>. All rendering lives in StudyDesk; this
// file is intentionally just the data wiring (so the reskin is decoupled and the
// /dev/home harness can render StudyDesk with fixture data and no Firebase).
//
// ADR-0006: the WelcomeScreen is retired; DiagnosticGate is repositioned as an
// optional skippable Calibrate offered once per concept.

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { COURSE_ID, loadCourseFromFirestore } from '../content/loader'
import type { Course, Progress } from '../content/schema'
import { subscribeProgressMap } from '../progress/progress'
import { subscribeStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { subscribeEarnedMilestones } from '../habit/milestones'
import { loadTrack, saveTrack, type Track } from '../progress/track'
import { analytics } from '../analytics/events'
import { StudyDesk } from './StudyDesk'
import { DiagnosticGate } from './DiagnosticGate'
import { ROUTES, type NavigateFn } from './routes'

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
  // Per-concept track. `undefined` = still loading; `null` = Calibrate not yet
  // taken for this concept (show the gate); 'A'/'B' = chosen.
  const [track, setTrack] = useState<Track | null | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    void loadTrack(uid, effectiveConceptId).then((t) => {
      if (!cancelled) {
        setTrack((prev) => (prev === undefined ? t : prev))
      }
    })
    return () => { cancelled = true }
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

  // Calibrate moment: offered once per concept when track is null (not yet
  // calibrated). Skipping persists the global defaultTrack so it won't re-prompt.
  if (user && track === null) {
    const uid = user.uid
    const defaultTrack = userDoc?.defaultTrack ?? 'B'
    return (
      <DiagnosticGate
        conceptId={effectiveConceptId}
        onDone={(t) => {
          void saveTrack(uid, effectiveConceptId, t).catch(() => {})
          setTrack(t)
        }}
        onSkip={() => {
          void saveTrack(uid, effectiveConceptId, defaultTrack).catch(() => {})
          setTrack(defaultTrack)
        }}
      />
    )
  }

  // Hold the desk skeleton until the per-concept track has resolved.
  const trackResolving = !!user && track === undefined

  return (
    <StudyDesk
      course={trackResolving ? null : course}
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
