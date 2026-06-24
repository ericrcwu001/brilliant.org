// Streak logic (Phase 17). Function-owned so the daily streak cannot be forged
// from the client: security rules deny client writes to users/{uid}/streaks/*.
//
// The streak increments once per local calendar day on the first qualifying
// action. `incrementDailyStreak` is the reusable helper wired into
// `recordQualifyingAction` in index.ts (the parent left that seam). The activity
// "day" is the learner's local calendar date, computed *server-side* from a
// client-supplied IANA timezone (falling back to UTC) so a tampered client clock
// cannot inflate the count. Repeat calls on the same local day are idempotent.

import { FieldValue, type Firestore } from 'firebase-admin/firestore'

export interface StreakDoc {
  count: number
  longest: number
  lastActiveDate: string | null // YYYY-MM-DD in the learner's local timezone
  timezone: string | null // IANA timezone the date was computed in
}

export interface StreakUpdate {
  next: StreakDoc
  incremented: boolean
}

export interface StreakResult extends StreakDoc {
  incremented: boolean
}

const FALLBACK_TZ = 'UTC'

// Pure: derive the next streak doc from the current one and today's local date.
//   - same local day as last activity -> no change (idempotent)
//   - the immediately following day    -> continue the streak (+1)
//   - any larger gap (or first ever)   -> reset to 1
export function computeStreakUpdate(
  current: StreakDoc | undefined,
  localDate: string,
  timezone: string,
): StreakUpdate {
  const prev = current?.lastActiveDate ?? null
  if (prev === localDate) {
    const count = current?.count ?? 1
    return {
      next: {
        count,
        longest: Math.max(current?.longest ?? 0, count),
        lastActiveDate: localDate,
        timezone,
      },
      incremented: false,
    }
  }
  const continues = prev !== null && previousDate(localDate) === prev
  const count = continues ? (current?.count ?? 0) + 1 : 1
  const longest = Math.max(current?.longest ?? 0, count)
  return {
    next: { count, longest, lastActiveDate: localDate, timezone },
    incremented: true,
  }
}

// YYYY-MM-DD of the day before the given local date (date-only, tz-agnostic).
export function previousDate(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// The learner's local calendar date right now, in the given IANA timezone.
// en-CA renders as YYYY-MM-DD. Computed on the server so the day boundary can't
// be spoofed by a client clock.
export function localDateInTimezone(tz: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length === 0) return false
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

// Increment the streak at most once per local day (idempotent same-day),
// transactionally. Reusable by recordQualifyingAction in index.ts. `tz` is the
// learner's IANA timezone; an invalid/absent value falls back to UTC.
export async function incrementDailyStreak(
  db: Firestore,
  uid: string,
  tz: string | undefined,
): Promise<StreakResult> {
  const zone = isValidTimezone(tz) ? tz : FALLBACK_TZ
  const localDate = localDateInTimezone(zone)
  const ref = db.doc(`users/${uid}/streaks/current`)
  const update = await db.runTransaction(async (txn) => {
    const snap = await txn.get(ref)
    const current = snap.exists ? (snap.data() as StreakDoc) : undefined
    const u = computeStreakUpdate(current, localDate, zone)
    txn.set(
      ref,
      { ...u.next, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    )
    return u
  })
  return { ...update.next, incremented: update.incremented }
}
