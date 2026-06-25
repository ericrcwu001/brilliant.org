// Client habit-loop: milestone metadata + reader (Phase 17). Milestones are
// awarded server-side by the completeLesson Cloud Function (which calls
// awardMilestonesForCompletion); this module supplies the seal metadata for the
// course-path gallery + recap stamp, and reads which milestones are earned.

import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/app'
import type { Progress } from '../content/schema'

export interface MilestoneMeta {
  id: string
  title: string
  glyph: string // JetBrains Mono medallion glyph (Ergo medallions)
}

// Course milestone sequence + their stamped-seal glyphs. This is the display
// order in the seal gallery (lesson order; do not reorder by earned date). Six
// lesson milestones interleaved with the mid-course and course-completion marks,
// matching the six-lesson path (Overlap Shortcut is the capstone, last).
export const MILESTONE_SEQUENCE: MilestoneMeta[] = [
  { id: 'hh-ht-mastered', title: 'HH vs HT Mastered', glyph: 'HH≠HT' },
  { id: 'penneys-game-won', title: "Penney's Game Won", glyph: 'A≻B' },
  { id: 'gamblers-ruin-solved', title: "Gambler's Ruin Solved", glyph: 'i/N' },
  { id: 'three-lessons-complete', title: 'Three Lessons Complete', glyph: '✓×3' },
  { id: 'first-pattern-cracked', title: 'First Pattern Cracked', glyph: 'E[H]' },
  {
    id: 'state-machine-builder',
    title: 'State Machine Builder',
    glyph: '∅→H',
  },
  { id: 'martingale-mastered', title: 'Martingale Mastered', glyph: 'Σ2ᴸ' },
  { id: 'six-lessons-complete', title: 'Six Lessons Complete', glyph: '✓×6' },
]

const META_BY_ID: Record<string, MilestoneMeta> = Object.fromEntries(
  MILESTONE_SEQUENCE.map((m) => [m.id, m]),
)

export function milestoneMeta(id: string): MilestoneMeta {
  return META_BY_ID[id] ?? { id, title: id, glyph: '★' }
}

// Read the set of earned milestone ids for the seal gallery. Empty when signed
// out / none earned / on a read failure.
export async function loadEarnedMilestones(uid: string): Promise<Set<string>> {
  try {
    const snap = await getDocs(collection(db, `users/${uid}/milestones`))
    return new Set(snap.docs.map((d) => d.id))
  } catch {
    return new Set()
  }
}

// Milestone → the lesson whose mastery it reflects (client-side inverse of the
// server's LESSON_MILESTONES in functions/src/milestones.ts).
export const MILESTONE_LESSONS: Record<string, string> = {
  'hh-ht-mastered': 'lesson-pattern-hitting-times',
  'penneys-game-won': 'lesson-penneys-game',
  'gamblers-ruin-solved': 'lesson-gamblers-ruin',
  'first-pattern-cracked': 'lesson-states-streaks',
  'state-machine-builder': 'lesson-longer-patterns',
  'martingale-mastered': 'lesson-overlap-shortcut',
}

// Aggregate milestones reflect a set of lessons (mirrors MID_COURSE_PATH /
// FULL_COURSE_PATH server-side). Gold only when every constituent lesson is aced.
const MILESTONE_AGGREGATE_LESSONS: Record<string, string[]> = {
  'three-lessons-complete': [
    'lesson-pattern-hitting-times',
    'lesson-penneys-game',
    'lesson-gamblers-ruin',
  ],
  'six-lessons-complete': [
    'lesson-pattern-hitting-times',
    'lesson-penneys-game',
    'lesson-gamblers-ruin',
    'lesson-states-streaks',
    'lesson-longer-patterns',
    'lesson-overlap-shortcut',
  ],
}

function lessonAced(p: Progress | undefined): boolean {
  return p?.derived?.mastered === true
}

// True iff the concept behind this milestone was aced (gold tier). Aggregate
// milestones require every constituent lesson to be aced. Unknown ids and
// lessons with no/!aced progress return false (→ silver if earned, else locked).
export function isMilestoneMastered(
  milestoneId: string,
  progressById: Record<string, Progress>,
): boolean {
  const single = MILESTONE_LESSONS[milestoneId]
  if (single) return lessonAced(progressById[single])
  const agg = MILESTONE_AGGREGATE_LESSONS[milestoneId]
  if (agg) return agg.every((id) => lessonAced(progressById[id]))
  return false
}
