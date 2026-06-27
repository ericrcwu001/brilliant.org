// Client read layer for interview attempts (Phase 5). Subscribes to the
// interviews subcollection, validates each doc via Zod, and exposes pure
// selectors. Mirrors subscribeProgressMap (src/progress/progress.ts) for the
// onSnapshot/safeParse pattern and subscribeEarnedMilestones
// (src/habit/milestones.ts) for the lazy getDb() + cancel guard.

import { collection, onSnapshot } from 'firebase/firestore'
import { z } from 'zod'
import { getDb } from '../firebase/app'

// Firestore Timestamps arrive as opaque objects; accept z.unknown() and
// coerce via toMs() below. Matches the Progress schema pattern in schema.ts.
export const InterviewAttemptSchema = z.object({
  conceptId:   z.string(),
  questionId:  z.string(),
  fingerprint: z.string(),
  tier:        z.enum(['hard', 'harder', 'brutal']),
  mode:        z.enum(['voice', 'text']),
  status:      z.enum(['pending', 'graded', 'abandoned']),
  startedAt:   z.unknown(),
  durationSec: z.number().optional(),
  report:    z.unknown().optional(),
  createdAt: z.unknown(),
  gradedAt:  z.unknown().optional(),
})

export type InterviewAttempt = z.infer<typeof InterviewAttemptSchema> & {
  id: string
}

// Realtime collection listener — all attempts for a user filtered to one
// concept. Each doc is validated; unparseable docs are skipped (best-effort,
// mirrors subscribeProgressMap). Denied/offline → keep last-known list.
export function subscribeInterviewAttempts(
  uid: string,
  conceptId: string,
  onChange: (attempts: InterviewAttempt[]) => void,
): () => void {
  let unsub: (() => void) | null = null
  let cancelled = false
  void getDb().then((db) => {
    if (cancelled) return
    unsub = onSnapshot(
      collection(db, 'users', uid, 'interviews'),
      (snap) => {
        const out: InterviewAttempt[] = []
        for (const d of snap.docs) {
          const parsed = InterviewAttemptSchema.safeParse(d.data())
          if (parsed.success && parsed.data.conceptId === conceptId) {
            out.push({ ...parsed.data, id: d.id })
          }
        }
        onChange(out)
      },
      () => {
        // Denied/offline → keep last-known list (display best-effort).
      },
    )
  })
  return () => {
    cancelled = true
    unsub?.()
  }
}

// Most-recent attempt by createdAt (Timestamp or epoch ms in tests).
export function selectLatest(
  attempts: InterviewAttempt[],
): InterviewAttempt | null {
  if (attempts.length === 0) return null
  return attempts.reduce((a, b) =>
    toMs(a.createdAt) >= toMs(b.createdAt) ? a : b,
  )
}

// The five rubric dimensions (each 1..5) the grader always returns (spec-23 §3.4).
const DIM_KEYS = ['correctness', 'approach', 'rigor', 'communication', 'speed'] as const

/** Mean of the five 1..5 dimension scores; null if the report shape is unusable.
 *  Replaces the removed hireSignal rank (D11 / spec-23 §3.4) as the "best attempt"
 *  key: always present on a graded attempt, survives the hire-verdict removal, and
 *  needs no confidence capture (works for Track A). */
function meanRubricScore(a: InterviewAttempt): number | null {
  const dims = (a.report as { dimensions?: Record<string, { score?: number }> } | undefined)
    ?.dimensions
  if (!dims) return null
  let sum = 0
  for (const k of DIM_KEYS) {
    const s = dims[k]?.score
    if (typeof s !== 'number') return null
    sum += s
  }
  return sum / DIM_KEYS.length
}

// Best graded attempt by mean rubric score; ties broken by most-recent. null if
// none graded (spec-23 §3.4).
export function selectBest(
  attempts: InterviewAttempt[],
): InterviewAttempt | null {
  const graded = attempts.filter(
    (a) => a.status === 'graded' && meanRubricScore(a) != null,
  )
  if (graded.length === 0) return null
  return graded.reduce((a, b) => {
    const sa = meanRubricScore(a)!
    const sb = meanRubricScore(b)!
    if (sa !== sb) return sa >= sb ? a : b
    return toMs(a.createdAt) >= toMs(b.createdAt) ? a : b // tie → most recent
  })
}

function toMs(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts) {
    return (ts as { toMillis(): number }).toMillis()
  }
  if (typeof ts === 'number') return ts
  return 0
}
