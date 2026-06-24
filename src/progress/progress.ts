// Client-side progress reads (Phase 16). `users/{uid}/progress/{lessonId}` is a
// Cloud-Function-written read cache for the course path; the client only reads
// it (Phase 18 rules deny client writes to the progression fields). Validated
// through ProgressSchema so the runtime never trusts an unexpected shape.

import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/app'
import { ProgressSchema, type Progress } from '../content/schema'

export async function loadProgress(
  uid: string,
  lessonId: string,
): Promise<Progress | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'progress', lessonId))
    if (!snap.exists()) return null
    return ProgressSchema.parse(snap.data())
  } catch {
    // Missing/denied/unparseable → treat as no progress yet.
    return null
  }
}

export async function loadProgressMap(
  uid: string,
  lessonIds: string[],
): Promise<Record<string, Progress>> {
  const entries = await Promise.all(
    lessonIds.map(async (id) => [id, await loadProgress(uid, id)] as const),
  )
  const out: Record<string, Progress> = {}
  for (const [id, p] of entries) if (p) out[id] = p
  return out
}
