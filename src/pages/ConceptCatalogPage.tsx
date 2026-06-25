// Concept Catalog page — signed-in macro home.
// Container: loads all course docs from Firestore, subscribes to the user's
// progress map + streak, builds the CatalogModel, and renders <ConceptCatalog>.
// All rendering lives in ConceptCatalog so the container is testable with
// fixture data and no Firebase (mirroring the CoursePathPage / StudyDesk split).

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { loadCoursesFromFirestore } from '../content/firestoreLoader'
import type { Course } from '../content/schema'
import { subscribeProgressMap } from '../progress/progress'
import { subscribeStreak, ZERO_STREAK, type Streak } from '../habit/streaks'
import { buildCatalogModel, type ProgressMap } from './conceptCatalog.model'
import { analytics } from '../analytics/events'
import type { NavigateFn } from './routes'
import { ConceptCatalog } from './ConceptCatalog'

export function ConceptCatalogPage({ navigate }: { navigate: NavigateFn }) {
  const { user, userDoc } = useAuth()
  const displayName = userDoc?.displayName ?? user?.displayName ?? 'there'

  const [courses, setCourses] = useState<Course[] | null>(null)
  const [progressById, setProgressById] = useState<ProgressMap>({})
  const [streak, setStreak] = useState<Streak>(ZERO_STREAK)
  const [loadError, setLoadError] = useState(false)

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
