// Client habit-loop: streak reader (Phase 17). The streak is written only by the
// `recordQualifyingAction` Cloud Function (called from src/progress/functions.ts
// on each Required-beat/lesson completion); this module just reads the
// Function-owned doc for display on the course path + lesson top bar.

import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/app'

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
