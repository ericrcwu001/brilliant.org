// Client habit-loop: streak reader (Phase 17). The streak is written only by the
// `recordQualifyingAction` Cloud Function (called from src/progress/functions.ts
// on each Required-beat/lesson completion); this module just reads the
// Function-owned doc for display on the course path + lesson top bar.

import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { getDb } from '../firebase/app'

export interface Streak {
  count: number
  longest: number
  lastActiveDate: string | null
}

export const ZERO_STREAK: Streak = { count: 0, longest: 0, lastActiveDate: null }

// Read the current streak for display. Returns a zero streak when signed out,
// not yet started, or on a read failure (never throws — display is best-effort).
export async function loadStreak(uid: string): Promise<Streak> {
  try {
    const db = await getDb()
    const snap = await getDoc(doc(db, `users/${uid}/streaks/current`))
    if (!snap.exists()) return ZERO_STREAK
    const data = snap.data()
    return {
      count: Number(data.count ?? 0),
      longest: Number(data.longest ?? 0),
      lastActiveDate: (data.lastActiveDate as string | null) ?? null,
    }
  } catch {
    return ZERO_STREAK
  }
}

// Realtime streak for display on the course path. A doc listener so the tally
// reflects the Cloud-Function increment without a manual refresh. Zero/last-known
// on a listen error (display best-effort, never throws).
export function subscribeStreak(
  uid: string,
  onChange: (streak: Streak) => void,
): () => void {
  let unsub: (() => void) | null = null
  let cancelled = false
  void getDb().then((db) => {
    if (cancelled) return
    unsub = onSnapshot(
      doc(db, `users/${uid}/streaks/current`),
      (snap) => {
        if (!snap.exists()) {
          onChange(ZERO_STREAK)
          return
        }
        const data = snap.data()
        onChange({
          count: Number(data.count ?? 0),
          longest: Number(data.longest ?? 0),
          lastActiveDate: (data.lastActiveDate as string | null) ?? null,
        })
      },
      () => {
        // Denied/offline → keep last-known streak.
      },
    )
  })
  return () => {
    cancelled = true
    unsub?.()
  }
}
