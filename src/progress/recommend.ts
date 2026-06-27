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
import { METHODS, type MethodId } from '../content/methods'

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

// ── Method-indexed weakness (spec-10, brainlift app-action #10) ────────────────
// Resurface the weakest METHOD (`schemaId`), not the weakest lesson: the queue
// asks problems interleaved by hidden method, so weakness is best indexed the
// same way. Reads the SAME live struggle signal as selectWeakNode
// (`maxHintLevelByBeat`, R2), aggregated per method instead of per lesson.

export type MethodWeakness = { schemaId: MethodId; totalHint: number; beatCount: number }

/**
 * Aggregate live struggle by method. For each graded-required beat carrying a
 * `schemaId`, add its maxHintLevel to that method's bucket. Weakest = highest
 * total hint; ties resolve to the highest mean (totalHint / beatCount), then to
 * the alphabetically-first schemaId (stable for tests + a deterministic re-test).
 *
 * `schemaId` is read DEFENSIVELY (the field is optional during the spec-00
 * backfill); a beat without one — or one whose id is not a real METHODS key — is
 * skipped (R5: degrade quietly, don't throw). Returns `null` when no graded beat
 * carries a usable schemaId, so the queue/recommender fall back to the legacy
 * lesson-level path.
 */
export function selectWeakMethod(
  lessons: { lessonId: string; beats: Beat[] }[],
  maxHintByLesson: Record<string, Record<string, number>>,
): MethodWeakness | null {
  const totals = new Map<MethodId, { totalHint: number; beatCount: number }>()
  for (const { lessonId, beats } of lessons) {
    const map = maxHintByLesson[lessonId] ?? {}
    const gradedIds = new Set(gradedRequiredBeatIds(beats))
    for (const beat of beats) {
      if (!gradedIds.has(beat.beatId)) continue
      const schemaId = (beat as { schemaId?: MethodId }).schemaId
      if (!schemaId || !(schemaId in METHODS)) continue // backfill-incomplete / unknown id
      const lvl = map[beat.beatId] ?? 0
      if (lvl <= 0) continue
      const bucket = totals.get(schemaId) ?? { totalHint: 0, beatCount: 0 }
      bucket.totalHint += lvl
      bucket.beatCount += 1
      totals.set(schemaId, bucket)
    }
  }

  let best: MethodWeakness | null = null
  for (const [schemaId, { totalHint, beatCount }] of totals) {
    const candidate: MethodWeakness = { schemaId, totalHint, beatCount }
    if (best === null) {
      best = candidate
      continue
    }
    if (totalHint !== best.totalHint) {
      if (totalHint > best.totalHint) best = candidate
      continue
    }
    const meanA = candidate.totalHint / candidate.beatCount
    const meanB = best.totalHint / best.beatCount
    if (meanA !== meanB) {
      if (meanA > meanB) best = candidate
      continue
    }
    if (schemaId < best.schemaId) best = candidate
  }
  return best
}
