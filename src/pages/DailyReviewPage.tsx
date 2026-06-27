// Daily Review page — the /review container (spec-20 / D8, §4.3). Mirrors the
// ConceptCatalogPage container/presentational split: it does ALL the Firebase
// work (load the due queue via spec-10's loadDueQueue, load each due card's
// lesson, resolve the quant-intensity gate via the shared helper, trigger spec-01's
// no-deck backfill) and renders the pure <DailyReview> stepper.
//
// It consumes spec-10's EXACT queue API — loadDueQueue(uid, now, {maxItems,foils})
// which composes the 4-arg buildQueue internally. It defines NO scheduling maths
// and NO new Firestore writes beyond spec-10's submitReview (R4). `foils` and the
// gate are both the single isQuantIntensity helper (never a bare defaultTrack
// check — gate Issue #9).

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { isQuantIntensity } from '../auth/track'
import { loadDueQueue, type QueueItem } from '../lesson/queue'
import { loadLessonFromFirestore } from '../content/firestoreLoader'
import { subscribeProgressMap } from '../progress/progress'
import { submitReview, rebuildReviewDeck } from '../progress/functions'
import type { Lesson, Progress } from '../content/schema'
import { analytics } from '../analytics/events'
import { type NavigateFn } from './routes'
import { DailyReview } from './DailyReview'
import { DailyReviewHero } from './DailyReviewHero'
import { buildHeroModel } from './dailyReview.model'

// A cheap existence read: does the learner have ANY review card at all? Used to
// distinguish caught-up (deck exists, none due) from no-deck (pre-SR/pre-backfill)
// — §4.5. A 1-doc limit query, NOT a new exported queue API (queue.ts is frozen).
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

export function DailyReviewPage({ navigate }: { navigate: NavigateFn }) {
  const { user, userDoc } = useAuth()
  // The quant-intensity gate — the ONLY gate computation (README §4 helper, never
  // a bare defaultTrack === 'B'). Drives foils (D2) + the surface framing + D6.
  const quantGate = isQuantIntensity(userDoc)
  // Gold-gate LABEL only (re-retrieve vs transfer copy); all GATING uses quantGate.
  const track = userDoc?.defaultTrack ?? 'A'

  const [items, setItems] = useState<QueueItem[] | null>(null)
  const [lessonsById, setLessonsById] = useState<Record<string, Lesson>>({})
  const [hasAnyCards, setHasAnyCards] = useState<boolean | null>(null)
  const [progressById, setProgressById] = useState<Record<string, Progress>>({})
  const [loadError, setLoadError] = useState(false)
  const [building, setBuilding] = useState(false)
  const backfillFired = useRef(false)

  const hasCompletedLessons = Object.values(progressById).some(
    (p) => p.completionStatus === 'completed',
  )

  // Realtime progress (for hasCompletedLessons), gated on auth.
  useEffect(() => {
    if (!user) return
    return subscribeProgressMap(user.uid, setProgressById)
  }, [user])

  // Load the due queue + each due card's lesson content. Re-runnable so the
  // no-deck backfill can refresh it (the `reload` nonce).
  const [reload, setReload] = useState(0)
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const uid = user.uid
    void (async () => {
      try {
        setLoadError(false)
        const [due, anyCard] = await Promise.all([
          // spec-10's exact reader: composes the 4-arg buildQueue internally with
          // foils = isQuantIntensity (D2) and the prereq order map (R5).
          loadDueQueue(uid, new Date(), { foils: quantGate }),
          loadHasAnyReviewCard(uid),
        ])
        if (cancelled) return
        setHasAnyCards(anyCard)
        // Load each due card's source lesson (reuse the player's loader — no new
        // loader, §5 step 6). A lesson that fails to load is simply absent →
        // DailyReview skips that card.
        const lessonIds = [...new Set(due.map((i) => i.lessonId))]
        const loaded: Record<string, Lesson> = {}
        await Promise.all(
          lessonIds.map(async (id) => {
            try {
              loaded[id] = await loadLessonFromFirestore(id)
            } catch {
              /* skip — card without content is never surfaced */
            }
          }),
        )
        if (cancelled) return
        setLessonsById(loaded)
        setItems(due)
        void analytics.dailyReviewStarted({ dueCount: due.length, quantGate })
      } catch {
        if (!cancelled) setLoadError(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, quantGate, reload])

  // No-deck backfill, automatic-once (§4.5 variant 2): when the learner has no
  // cards but HAS completed lessons, fire spec-01's backfill once, then reload.
  // Guarded so it never re-fires. If the callable isn't deployed yet, it rejects
  // and we fall through to the no-deck affordance (which still renders — §4.5).
  const triggerBackfill = () => {
    if (backfillFired.current) return
    backfillFired.current = true
    setBuilding(true)
    void rebuildReviewDeck()
      .then(() => {
        setReload((n) => n + 1)
      })
      .catch(() => {
        /* spec-01 backfill not deployed yet → no-deck affordance stays visible */
      })
      .finally(() => setBuilding(false))
  }

  useEffect(() => {
    if (hasAnyCards === false && hasCompletedLessons && !backfillFired.current) {
      triggerBackfill()
    }
  }, [hasAnyCards, hasCompletedLessons])

  if (!user) return <ReviewSkeleton />

  if (loadError) {
    return (
      <main className="ergo-review" aria-label="Daily Review">
        <p className="ergo-catalog__state-msg">
          Couldn&apos;t load your reviews — check your connection and try again.
        </p>
      </main>
    )
  }

  if (items === null || hasAnyCards === null) return <ReviewSkeleton />

  // Empty queue (deep-link, §4.5): distinguish caught-up from no-deck. Never the
  // caught-up copy while !hasAnyCards — render the Build-deck affordance instead.
  if (items.length === 0) {
    const heroModel = buildHeroModel(
      0,
      hasAnyCards,
      hasCompletedLessons,
      userDoc?.targetInterviewDate,
      new Date(),
    )
    return (
      <main className="ergo-review" aria-label="Daily Review">
        <header className="ergo-review__topbar">
          <span className="ergo-wordmark">Daily Review</span>
        </header>
        {building ? (
          <section className="ergo-review__empty ergo-card" aria-busy="true">
            <p className="ergo-review__empty-title">Building your review deck…</p>
          </section>
        ) : (
          <DailyReviewHero
            model={heroModel}
            quantGate={quantGate}
            onStart={() => setReload((n) => n + 1)}
            onBuildDeck={triggerBackfill}
          />
        )}
      </main>
    )
  }

  return (
    <DailyReview
      items={items}
      lessonsById={lessonsById}
      track={track}
      quantGate={quantGate}
      onSubmit={(cardId, answer, confidence) => {
        // spec-10's frozen, server-graded submitReview (R13). Fire-and-forget on
        // the achievement path — never blocks the stepper. The server grades the
        // raw answer and (spec-11) mints gold; this client never asserts a result.
        void submitReview({ cardId, answer, confidence }).catch(() => {})
      }}
      navigate={navigate}
    />
  )
}

function ReviewSkeleton() {
  return (
    <main className="ergo-review" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading your reviews…</span>
      <div className="ergo-catalog-skeleton">
        <div className="ergo-catalog-skeleton__hero" />
      </div>
    </main>
  )
}
