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
  hireSignal:  z
    .enum(['Strong No', 'No', 'Lean No', 'Lean Yes', 'Yes', 'Strong Yes'])
    .optional(),
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

// Numeric rank mirrors README HireSignal ordering (Strong No=0 … Strong Yes=5).
const HIRE_RANK: Record<string, number> = {
  'Strong No': 0,
  'No':        1,
  'Lean No':   2,
  'Lean Yes':  3,
  'Yes':       4,
  'Strong Yes': 5,
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

// Best graded attempt by hireSignal rank; null if none are graded.
export function selectBest(
  attempts: InterviewAttempt[],
): InterviewAttempt | null {
  const graded = attempts.filter(
    (a) => a.status === 'graded' && a.hireSignal != null,
  )
  if (graded.length === 0) return null
  return graded.reduce((a, b) =>
    (HIRE_RANK[a.hireSignal!] ?? 0) >= (HIRE_RANK[b.hireSignal!] ?? 0)
      ? a
      : b,
  )
}

function toMs(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts) {
    return (ts as { toMillis(): number }).toMillis()
  }
  if (typeof ts === 'number') return ts
  return 0
}
