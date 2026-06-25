// Onboarding survey model (ADR-0006). Pure functions — no Firebase, no React.
// All types and derivations used by OnboardingSurvey and the Firestore write.

import type { Course } from '../content/schema'
import { COURSE_ID } from '../content/courseIds'

export type LearningGoal = 'interview' | 'school' | 'intuition' | 'curious'
export type ComfortLevel = 'new' | 'dabbled' | 'comfortable' | 'confident'
export type Pace = 'casual' | 'steady' | 'intense'
export type DefaultTrack = 'A' | 'B'

/** Maps the four comfort levels to the binary track (new/dabbled → A, comfortable/confident → B). */
export function comfortToDefaultTrack(comfortLevel: ComfortLevel): DefaultTrack {
  return comfortLevel === 'comfortable' || comfortLevel === 'confident' ? 'B' : 'A'
}

/** Returns distinct domain names sorted by the lowest domainOrder seen for that domain. */
export function focusAreaOptions(courses: Course[]): string[] {
  const domainOrder = new Map<string, number>()
  for (const course of courses) {
    if (!course.domain) continue
    const existing = domainOrder.get(course.domain)
    const order = course.domainOrder ?? 999
    if (existing === undefined || order < existing) {
      domainOrder.set(course.domain, order)
    }
  }
  return Array.from(domainOrder.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([domain]) => domain)
}

/** Returns the conceptId to recommend for the chosen focusArea.
 *  Picks the first live concept in that domain (by course.order then domainOrder).
 *  Falls back to the flagship COURSE_ID when no live concept exists in the area. */
export function recommendConcept(courses: Course[], focusArea: string): string {
  const inFocus = courses
    .filter((c) => c.domain === focusArea && c.status !== 'coming_soon')
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  return inFocus.length > 0 ? inFocus[0].courseId : COURSE_ID
}
