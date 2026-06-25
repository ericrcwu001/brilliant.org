// Client-side progress reads (Phase 16). `users/{uid}/progress/{lessonId}` is a
// Cloud-Function-written read cache for the course path; the client only reads
// it (Phase 18 rules deny client writes to the progression fields). Validated
// through ProgressSchema so the runtime never trusts an unexpected shape.

import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { getDb } from '../firebase/app'
import { ProgressSchema, type Progress } from '../content/schema'

export async function loadProgress(
  uid: string,
  lessonId: string,
): Promise<Progress | null> {
  try {
    const db = await getDb()
    const snap = await getDoc(doc(db, 'users', uid, 'progress', lessonId))
    if (!snap.exists()) return null
    return ProgressSchema.parse(snap.data())
  } catch {
    // Missing/denied/unparseable → treat as no progress yet.
    return null
  }
}

// Realtime progress read cache for the course path. A collection listener so
// Cloud-Function completion/unlock writes push into the UI immediately (no
// manual refresh). Each doc is parsed through ProgressSchema; unparseable docs
// are skipped. Best-effort: a listen error leaves the last-known map in place.
export function subscribeProgressMap(
  uid: string,
  onChange: (map: Record<string, Progress>) => void,
): () => void {
  let unsub: (() => void) | null = null
  let cancelled = false
  void getDb().then((db) => {
    if (cancelled) return
    unsub = onSnapshot(
      collection(db, 'users', uid, 'progress'),
      (snap) => {
        const out: Record<string, Progress> = {}
        for (const d of snap.docs) {
          const parsed = ProgressSchema.safeParse(d.data())
          if (parsed.success) out[d.id] = parsed.data
        }
        onChange(out)
      },
      () => {
        // Denied/offline → keep last-known map (reads are display best-effort).
      },
    )
  })
  return () => {
    cancelled = true
    unsub?.()
  }
}
