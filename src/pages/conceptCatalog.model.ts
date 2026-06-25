// Concept Catalog model types + builder (Wave-0 freeze; Stream B implements body).
// Groups courses by domain, computes per-concept progress client-side,
// and picks the resume concept.
//
// ADR-0006: accepts optional recommendedConceptId + focusArea from the user doc.
// When the learner has no progress, the hero becomes a "recommended start" card
// and the focusArea domain shelf floats to the top.

import type { Course } from '../content/schema'
import type { Progress } from '../content/schema'
import { COURSE_ID } from '../content/courseIds'

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
  /** True when `resume` is a recommended-start (no user progress yet). */
  recommendedStart?: boolean
  /** When focusArea is chosen but all its concepts are coming_soon, a note is shown. */
  focusAreaComingSoon?: boolean
  sections: DomainSection[]
}

// ── ProgressMap type (mirrors subscribeProgressMap callback signature) ─────────
// Record<lessonId, Progress> keyed by lessonId, written by Cloud Functions.
export type ProgressMap = Record<string, Progress>

// ── Accent cycle for concepts with no explicit accent field ───────────────────
const ACCENT_CYCLE = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'] as const

/** Build the catalog view model from a list of courses + the user's progress
 *  map (subscribeProgressMap snapshot). Groups concepts by domain, computes
 *  per-concept progress client-side, and picks the resume concept.
 *
 *  ADR-0006 additions:
 *  - When the learner has no progress, uses `recommendedConceptId` as the hero
 *    (flagged as `recommendedStart: true`).
 *  - Reorders sections so the `focusArea` domain shelf appears first. */
export function buildCatalogModel(
  courses: Course[],
  progress: ProgressMap,
  recommendedConceptId?: string,
  focusArea?: string,
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
  let sections: DomainSection[] = Array.from(domainBuckets.entries())
    .sort(([, a], [, b]) => a.domainOrder - b.domainOrder)
    .map(([domain, { domainOrder, cards }]) => ({
      domain,
      order: domainOrder,
      concepts: cards
        .sort((a, b) => a.order - b.order)
        .map(({ card }) => card),
    }))

  // Reorder sections: float the focusArea domain to the top.
  if (focusArea) {
    const focusIdx = sections.findIndex((s) => s.domain === focusArea)
    if (focusIdx > 0) {
      sections = [sections[focusIdx], ...sections.filter((_, i) => i !== focusIdx)]
    }
  }

  // Resume pick: first in_progress live → first not_started live → any mastered live.
  const allCards = sections.flatMap((s) => s.concepts)
  const hasProgress =
    allCards.some((c) => c.progress.state === 'in_progress') ||
    allCards.some((c) => c.progress.state === 'mastered')

  const regularResume =
    allCards.find((c) => c.status === 'live' && c.progress.state === 'in_progress') ??
    allCards.find((c) => c.status === 'live' && c.progress.state === 'mastered')

  if (regularResume) {
    return { resume: regularResume, recommendedStart: false, sections }
  }

  // No progress yet — use the recommended concept as a start-here hero.
  if (recommendedConceptId) {
    // Guard: if the recommended concept is coming_soon, fall back to flagship.
    const effectiveId = (() => {
      const found = allCards.find((c) => c.conceptId === recommendedConceptId)
      if (!found || found.status === 'coming_soon') {
        const flagship = allCards.find((c) => c.conceptId === COURSE_ID && c.status === 'live')
        return flagship?.conceptId ?? allCards.find((c) => c.status === 'live')?.conceptId
      }
      return recommendedConceptId
    })()
    const recommendedCard = allCards.find((c) => c.conceptId === effectiveId)

    if (recommendedCard) {
      // focusAreaComingSoon: user chose a focus area but ALL its concepts are coming_soon.
      const focusAreaComingSoon =
        !!focusArea &&
        allCards
          .filter((c) => sections.find((s) => s.domain === focusArea)?.concepts.includes(c))
          .every((c) => c.status === 'coming_soon')

      return {
        resume: recommendedCard,
        recommendedStart: true,
        focusAreaComingSoon,
        sections,
      }
    }
  }

  // Final fallback: first live not_started.
  const firstLive = allCards.find((c) => c.status === 'live' && c.progress.state === 'not_started')
  return {
    resume: firstLive,
    recommendedStart: !hasProgress && !!firstLive,
    sections,
  }
}
