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
import { loadProgressMap } from '../progress/progress'
import { loadStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { loadEarnedMilestones } from '../habit/milestones'
import {
  loadTrack,
  saveTrack,
  loadWelcomeSeen,
  markWelcomeSeen,
  type Track,
} from '../progress/track'
import { analytics } from '../analytics/events'
import { StudyDesk } from './StudyDesk'
import { DiagnosticGate } from './DiagnosticGate'
import { WelcomeScreen } from './WelcomeScreen'
import { lessonPath, INTRO_LESSON_ID, type NavigateFn } from './routes'

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

export function CoursePathPage({ navigate }: { navigate: NavigateFn }) {
  const { user, userDoc } = useAuth()
  const displayName = userDoc?.displayName ?? user?.displayName ?? 'there'

  const [course, setCourse] = useState<Course | null>(null)
  const [progressById, setProgressById] = useState<Record<string, Progress>>({})
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const [earned, setEarned] = useState<Set<string>>(new Set())
  const [newlyEarned, setNewlyEarned] = useState<Set<string>>(new Set())
  const earnComputed = useRef(false)
  // Two-track diagnostic at course entry (build-brief §4.8). `undefined` = still
  // loading; `null` = not yet taken (show the gate); 'A'/'B' = chosen.
  const [track, setTrack] = useState<Track | null | undefined>(undefined)
  // First-run welcome (new accounts). `undefined` = still loading; `false` =
  // show it; `true` = already shown (started the intro or skipped).
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    void loadTrack(uid)
      .then((t) => {
        if (!cancelled) setTrack(t)
      })
      .catch(() => {
        if (!cancelled) setTrack('B')
      })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let cancelled = false
    void loadWelcomeSeen(uid)
      .then((seen) => {
        if (!cancelled) setWelcomeSeen(seen)
      })
      .catch(() => {
        if (!cancelled) setWelcomeSeen(true)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    void loadCourseFromFirestore(COURSE_ID)
      .then((c) => {
        if (!cancelled) setCourse(c)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user || !course) return
    const uid = user.uid
    const lessonIds = [
      ...course.lessons.map((l) => l.lessonId),
      ...course.roadmap.map((r) => r.lessonId),
    ]
    let cancelled = false
    void loadProgressMap(uid, lessonIds).then((map) => {
      if (!cancelled) setProgressById(map)
    })
    void loadStreak(uid).then((s) => {
      if (!cancelled) setStreak(s)
    })
    void loadEarnedMilestones(uid).then((m) => {
      if (cancelled) return
      setEarned(m)
      // Earn moment (Q11): the first Home load after a new earn plays the
      // one-time ghost→inked fade. Diff the earned set against a per-user seen
      // flag in localStorage, then persist so the fade never replays.
      if (!earnComputed.current && m.size > 0) {
        earnComputed.current = true
        const key = seenKey(uid)
        const seen = readSeen(key)
        const newly = new Set([...m].filter((id) => !seen.has(id)))
        if (newly.size > 0) setNewlyEarned(newly)
        writeSeen(key, m)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user, course])

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
    />
  )
}
