// Client habit-loop: milestone metadata + reader (Phase 17). Milestones are
// awarded server-side by the completeLesson Cloud Function (which calls
// awardMilestonesForCompletion); this module supplies the seal metadata for the
// course-path gallery + recap stamp, and reads which milestones are earned.

import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/app'

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
