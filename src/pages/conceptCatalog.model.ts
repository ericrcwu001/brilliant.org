// Concept Catalog model types + builder (Wave-0 freeze; Stream B implements body).
// Groups courses by domain, computes per-concept progress client-side,
// and picks the resume concept.

import type { Course } from '../content/schema'
import type { Progress } from '../content/schema'

// ── Public types (frozen) ─────────────────────────────────────────────────────

export type ConceptStatus = 'live' | 'coming_soon'

export type ConceptProgressState = 'not_started' | 'in_progress' | 'mastered'

export type ConceptCard = {
  conceptId: string
  title: string
  tagline: string
  accent: string
  vizKey?: string
  status: ConceptStatus
  lessonCount: number
  progress: {
    percent: number
    state: ConceptProgressState
  }
}

export type DomainSection = {
  domain: string
  order: number
  concepts: ConceptCard[]
}

export type CatalogModel = {
  /** The concept to resume (most-recently-active in-progress; else recommended). */
  resume?: ConceptCard
  sections: DomainSection[]
}

// ── ProgressMap type (mirrors subscribeProgressMap callback signature) ─────────
// Record<lessonId, Progress> keyed by lessonId, written by Cloud Functions.
export type ProgressMap = Record<string, Progress>

// ── Accent cycle for concepts with no explicit accent field ───────────────────
const ACCENT_CYCLE = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'] as const

/** Build the catalog view model from a list of courses + the user's progress
 *  map (subscribeProgressMap snapshot). Groups concepts by domain, computes
 *  per-concept progress client-side, and picks the resume concept. */
export function buildCatalogModel(
  courses: Course[],
  progress: ProgressMap,
): CatalogModel {
  // Bucket cards by domain, keeping insertion order for stable sorting.
  const domainBuckets = new Map<
    string,
    { domainOrder: number; cards: Array<{ card: ConceptCard; order: number }> }
  >()

  courses.forEach((course, index) => {
    const status: ConceptStatus = course.status ?? 'live'
    const lessonIds = course.lessons.map((l) => l.lessonId)
    const lessonCount = lessonIds.length

    // Progress aggregation: intersect lesson ids with the per-lesson progress map.
    let percent = 0
    let state: ConceptProgressState = 'not_started'

    if (status !== 'coming_soon' && lessonCount > 0) {
      const completedCount = lessonIds.filter(
        (id) => progress[id]?.completionStatus === 'completed',
      ).length
      const hasInProgress = lessonIds.some(
        (id) => progress[id]?.completionStatus === 'in_progress',
      )
      percent = Math.round((completedCount / lessonCount) * 100)
      if (completedCount === lessonCount) {
        state = 'mastered'
      } else if (completedCount > 0 || hasInProgress) {
        state = 'in_progress'
      }
    }

    const card: ConceptCard = {
      conceptId: course.courseId,
      title: course.title,
      tagline: (course.tagline ?? course.description).trim(),
      accent: course.accent ?? ACCENT_CYCLE[index % ACCENT_CYCLE.length],
      vizKey: course.vizKey,
      status,
      lessonCount,
      progress: { percent, state },
    }

    const domain = course.domain ?? 'Other'
    const domainOrder = course.domainOrder ?? 999
    const order = course.order ?? 999

    const bucket = domainBuckets.get(domain)
    if (bucket) {
      // Keep the smallest domainOrder seen for this domain (in case of mismatch).
      if (domainOrder < bucket.domainOrder) bucket.domainOrder = domainOrder
      bucket.cards.push({ card, order })
    } else {
      domainBuckets.set(domain, { domainOrder, cards: [{ card, order }] })
    }
  })

  // Build sections: outer sort by domainOrder, inner sort by per-concept order.
  const sections: DomainSection[] = Array.from(domainBuckets.entries())
    .sort(([, a], [, b]) => a.domainOrder - b.domainOrder)
    .map(([domain, { domainOrder, cards }]) => ({
      domain,
      order: domainOrder,
      concepts: cards
        .sort((a, b) => a.order - b.order)
        .map(({ card }) => card),
    }))

  // Resume pick: first in_progress live → first not_started live → any mastered live.
  const allCards = sections.flatMap((s) => s.concepts)
  const resume =
    allCards.find((c) => c.status === 'live' && c.progress.state === 'in_progress') ??
    allCards.find((c) => c.status === 'live' && c.progress.state === 'not_started') ??
    allCards.find((c) => c.status === 'live' && c.progress.state === 'mastered')

  return { resume, sections }
}
