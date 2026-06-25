// Cross-lesson next-step recommender + weak-node selector (build-brief §4.10b).
//
// CRITICAL: re-surfacing reads the LIVE, authoritative snapshot
// (`snapshots/{lessonId}.interactionState.maxHintLevelByBeat`, owner-readable),
// NOT the frozen `progress.derived.mastered` (completeLesson is idempotent, so
// `mastered` never upgrades on replay) and NOT `attemptsByBeat` (never persisted
// by any function). `maxHintLevelByBeat` is the only durable struggle signal and
// it updates on every replay.
//
// The Firestore read is lazy-imported so the pure selectors below stay
// dependency-free and node-testable (recommend.test.ts).

import { SnapshotSchema, type Beat } from '../content/schema'
import { gradedRequiredBeatIds } from '../lesson/mastery'

export type WeakNode = { lessonId: string; beatId: string; maxHintLevel: number }

/** Live cross-lesson struggle: per lesson, its snapshot's maxHintLevelByBeat. */
export async function loadMaxHintLevels(
  uid: string,
  lessonIds: string[],
): Promise<Record<string, Record<string, number>>> {
  const [{ getDb }, { doc, getDoc }] = await Promise.all([
    import('../firebase/app'),
    import('firebase/firestore'),
  ])
  const db = await getDb()
  const entries = await Promise.all(
    lessonIds.map(async (lessonId) => {
      try {
        const snap = await getDoc(doc(db, 'users', uid, 'snapshots', lessonId))
        if (!snap.exists()) return [lessonId, {}] as const
        const parsed = SnapshotSchema.safeParse(snap.data())
        const m = parsed.success
          ? (parsed.data.interactionState.maxHintLevelByBeat ?? {})
          : {}
        return [lessonId, m] as const
      } catch {
        // Offline/denied/missing → no recorded struggle for this lesson.
        return [lessonId, {}] as const
      }
    }),
  )
  return Object.fromEntries(entries)
}

/**
 * Pure: is a lesson mastered given its beats + the live max-hint map? Mirrors
 * `computeMastered` but is reused cross-lesson by the recommender so a replay's
 * cleaner struggle data is honored (not the frozen derived.mastered).
 */
export function masteredFromLive(
  beats: Beat[],
  maxHintByBeat: Record<string, number>,
): boolean {
  const ids = gradedRequiredBeatIds(beats)
  return ids.length > 0 && ids.every((id) => (maxHintByBeat[id] ?? 0) === 0)
}

/**
 * Pure: the single most-struggled graded-required beat across the given lessons
 * (the L4 weak-node selector). Restricted to graded-required beats so a stray
 * high-water mark on a non-graded beat can't win. Ties resolve to the earliest
 * lesson, then the earliest beat — stable for tests + a deterministic re-test.
 */
export function selectWeakNode(
  lessons: { lessonId: string; beats: Beat[] }[],
  maxHintByLesson: Record<string, Record<string, number>>,
): WeakNode | null {
  let best: WeakNode | null = null
  for (const { lessonId, beats } of lessons) {
    const map = maxHintByLesson[lessonId] ?? {}
    for (const beatId of gradedRequiredBeatIds(beats)) {
      const lvl = map[beatId] ?? 0
      if (lvl > 0 && (best === null || lvl > best.maxHintLevel)) {
        best = { lessonId, beatId, maxHintLevel: lvl }
      }
    }
  }
  return best
}

/**
 * Next-step recommender (build-brief §4.10b). Consumes mastery (computed from
 * the LIVE snapshot, not the frozen flag) to point back at the weakest
 * reviewable node among completed-but-not-mastered lessons; returns null when
 * everything completed is mastered (advance normally — non-blocking).
 */
export function recommendReview(
  lessons: { lessonId: string; beats: Beat[]; completed: boolean }[],
  maxHintByLesson: Record<string, Record<string, number>>,
): WeakNode | null {
  const unmastered = lessons.filter(
    (l) =>
      l.completed && !masteredFromLive(l.beats, maxHintByLesson[l.lessonId] ?? {}),
  )
  return selectWeakNode(unmastered, maxHintByLesson)
}
