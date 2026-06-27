// Concept Catalog page — signed-in macro home.
// Container: loads all course docs from Firestore, subscribes to the user's
// progress map + streak, builds the CatalogModel, and renders <ConceptCatalog>.
// All rendering lives in ConceptCatalog so the container is testable with
// fixture data and no Firebase (mirroring the CoursePathPage / StudyDesk split).

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { isQuantIntensity, gatedOn } from '../auth/track'
import { loadCoursesFromFirestore } from '../content/firestoreLoader'
import type { Course } from '../content/schema'
import { subscribeProgressMap } from '../progress/progress'
import { subscribeStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { buildCatalogModel, type ProgressMap } from './conceptCatalog.model'
import { analytics } from '../analytics/events'
import { ROUTES, type NavigateFn } from './routes'
import { ConceptCatalog } from './ConceptCatalog'
import { subscribeInterviewAttempts } from '../interview/attempts'
import { loadDueQueue } from '../lesson/queue'
import { rebuildReviewDeck } from '../progress/functions'
import { buildHeroModel, type DailyReviewHeroModel } from './dailyReview.model'

// Cheap existence read for the Daily Review hero: does the learner have ANY review
// card? Distinguishes caught-up from no-deck (spec-20 §4.5). A 1-doc limit query,
// NOT a new exported queue API (queue.ts is frozen).
async function loadHasAnyReviewCard(uid: string): Promise<boolean> {
  try {
    const [{ getDb }, { collection, query, limit, getDocs }] = await Promise.all([
      import('../firebase/app'),
      import('firebase/firestore'),
    ])
    const db = await getDb()
    const snap = await getDocs(query(collection(db, 'users', uid, 'reviews'), limit(1)))
    return !snap.empty
  } catch {
    return false
  }
}

export function ConceptCatalogPage({ navigate }: { navigate: NavigateFn }) {
  const { user, userDoc, flags } = useAuth()
  const displayName = userDoc?.displayName ?? user?.displayName ?? 'there'

  const [courses, setCourses] = useState<Course[] | null>(null)
  const [progressById, setProgressById] = useState<ProgressMap>({})
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const [loadError, setLoadError] = useState(false)
  const [resumeInterviewDone, setResumeInterviewDone] = useState(false)

  // Daily Review hero state (spec-20 / D8). quantGate is the single
  // isQuantIntensity helper (gate Issue #9 — never a bare defaultTrack check); it
  // only selects the hero's COPY (foils). The Daily Review SURFACE itself is the
  // aggressive net-new behavior — rollout-gated DEFAULT-OFF via gatedOn (holdout
  // cohort + the dailyReviewQueue flag + intensity). Off ⇒ no hero, catalog/home
  // behave exactly as today (spec-05 §3b).
  const quantGate = isQuantIntensity(userDoc)
  const dailyReviewEnabled = gatedOn('dailyReviewQueue', userDoc, flags)
  const [reviewHero, setReviewHero] = useState<DailyReviewHeroModel | null>(null)
  const [reviewReload, setReviewReload] = useState(0)
  const backfillFired = useRef(false)

  // One-time course list load.
  useEffect(() => {
    let cancelled = false
    void loadCoursesFromFirestore()
      .then((c) => { if (!cancelled) setCourses(c) })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [])

  // Realtime progress + streak subscriptions (gated on auth).
  useEffect(() => {
    if (!user) return
    const uid = user.uid
    const unsubProgress = subscribeProgressMap(uid, setProgressById)
    const unsubStreak = subscribeStreak(uid, setStreak)
    return () => {
      unsubProgress()
      unsubStreak()
    }
  }, [user])

  // catalog_viewed fires once on mount (fire-and-forget).
  useEffect(() => {
    void analytics.catalogViewed()
  }, [])

  // Daily Review hero (spec-20): read the due queue + the any-card existence
  // signal, derive hasCompletedLessons from the progress the container already
  // subscribes to, and build the hero view-model via the pure buildHeroModel.
  // Best-effort — a failure leaves the hero hidden (the catalog is unaffected).
  useEffect(() => {
    if (!user || !dailyReviewEnabled) return // flag DEFAULT-OFF ⇒ no hero
    let cancelled = false
    const uid = user.uid
    void (async () => {
      try {
        const [due, anyCard] = await Promise.all([
          loadDueQueue(uid, new Date(), { foils: quantGate }),
          loadHasAnyReviewCard(uid),
        ])
        if (cancelled) return
        const hasCompletedLessons = Object.values(progressById).some(
          (p) => p.completionStatus === 'completed',
        )
        const model = buildHeroModel(
          due.length,
          anyCard,
          hasCompletedLessons,
          userDoc?.targetInterviewDate,
          new Date(),
        )
        setReviewHero(model)
        if (model.state === 'due' || model.state === 'ramp') {
          void analytics.dailyReviewHeroShown({ dueCount: model.dueCount })
        }
      } catch {
        /* leave the hero hidden — never break the catalog */
      }
    })()
    return () => {
      cancelled = true
    }
    // progressById intentionally excluded: hasCompletedLessons is read at fire
    // time; re-reading the queue on every progress tick is wasteful. reviewReload
    // re-runs it after a backfill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dailyReviewEnabled, quantGate, userDoc?.targetInterviewDate, reviewReload])

  // No-deck backfill, automatic-once (§4.5): when the hero resolves to no-deck
  // (no cards, but completed lessons), fire spec-01's backfill once, then re-read.
  // Guarded so it never re-fires. Rejects harmlessly if the callable isn't
  // deployed yet (the no-deck affordance stays visible — §4.5).
  const triggerBackfill = () => {
    if (backfillFired.current) return
    backfillFired.current = true
    void rebuildReviewDeck()
      .then(() => setReviewReload((n) => n + 1))
      .catch(() => {})
  }
  useEffect(() => {
    if (reviewHero?.state === 'no-deck' && !backfillFired.current) triggerBackfill()
  }, [reviewHero?.state])

  // Built before the early returns so the recommendation effect below stays an
  // unconditional hook (rules-of-hooks); null until the course list resolves.
  const model = courses
    ? buildCatalogModel(
        courses,
        progressById,
        userDoc?.recommendedConceptId,
        userDoc?.focusArea,
      )
    : null

  const masteredResumeConceptId =
    model?.resume?.progress.state === 'mastered' ? model.resume.conceptId : null

  useEffect(() => {
    if (!user || !masteredResumeConceptId) return
    return subscribeInterviewAttempts(user.uid, masteredResumeConceptId, (attempts) => {
      setResumeInterviewDone(attempts.some((a) => a.status === 'graded'))
    })
  }, [user, masteredResumeConceptId])

  // Fire recommendation_shown once when a recommended-start hero is displayed.
  useEffect(() => {
    if (model?.recommendedStart && model.resume) {
      void analytics.recommendationShown({ recommendedConceptId: model.resume.conceptId })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model?.recommendedStart, model?.resume?.conceptId])

  if (loadError) {
    return (
      <main className="ergo-catalog" aria-label="Concepts">
        <p className="ergo-catalog__state-msg">
          Couldn&apos;t load concepts — check your connection and try again.
        </p>
      </main>
    )
  }

  if (courses === null || model === null) {
    return <CatalogSkeleton />
  }

  if (courses.length === 0) {
    return (
      <main className="ergo-catalog" aria-label="Concepts">
        <p className="ergo-catalog__state-msg">No concepts available yet.</p>
      </main>
    )
  }

  return (
    <ConceptCatalog
      model={model}
      streak={streak}
      displayName={displayName}
      navigate={navigate}
      resumeInterviewDone={resumeInterviewDone}
      reviewHero={reviewHero ?? undefined}
      quantGate={quantGate}
      onStartReview={() => navigate(ROUTES.review)}
      onBuildDeck={triggerBackfill}
    />
  )
}

// Hairline skeleton shown while the course list loads.
function CatalogSkeleton() {
  return (
    <main className="ergo-catalog" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading concepts…</span>
      <div className="ergo-catalog-skeleton">
        <div className="ergo-catalog-skeleton__hero" />
        <div className="ergo-catalog-skeleton__shelf" />
        <div className="ergo-catalog-skeleton__shelf" style={{ animationDelay: '0.12s' }} />
      </div>
    </main>
  )
}
