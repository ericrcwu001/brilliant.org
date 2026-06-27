// Pure SM-2 spaced-repetition scheduler + interview-date anchoring (spec-01,
// README §4 Foundation A / §4.7). Dependency-free: it imports NOTHING from
// firebase — it operates on plain numbers and JS `Date`s so (a) the server can
// inject a server-supplied `now` (never a client timestamp — R12) at the write
// boundary and (b) the unit tests are deterministic. The callable converts to a
// Firestore `Timestamp` (`Timestamp.fromDate(...)`) only at the write boundary.
//
// POLICY BOUNDARY: SM-2 is a *policy* choice (D4), not a contract. The contract
// is the `SchedulingState` field set + the `nextSchedule(prev, result, opts)`
// signature. A Leitner / expanding-interval drop-in is a legal alternative behind
// the SAME seam (a Leitner "box" maps onto `reps`; `intervalDays` follows the
// expanding ladder; `easeFactor` may be held constant) with NO change to
// `submitReview`, the card shape, or callers. Keep all SM-2 specifics inside
// `nextSchedule`/the constants so a future swap is a single-module change.

// SM-2 constants (D4). UNTUNED placeholders — revisit with real retention data.
export const INIT_EASE = 2.5
export const EASE_FLOOR = 1.3
export const EASE_PASS_BONUS = 0.1 // right → ease += 0.10
export const EASE_FAIL_PENALTY = 0.2 // wrong → ease -= 0.20
export const FIRST_INTERVAL_DAYS = 1 // first pass and every lapse reset to 1d
export const FORCE_FINAL_WINDOW_DAYS = 3 // force a review into the last 3 days before the target date
export const MS_PER_DAY = 86_400_000

export type ReviewResult = 'pass' | 'fail'

// Only the SM-2 + scheduling fields — never the denormalized identity fields
// (those live on the `ReviewCard` shape in src/content/schema.ts).
export interface SchedulingState {
  dueAt: Date
  intervalDays: number
  easeFactor: number
  reps: number
  lapses: number
}

export interface NextScheduleOpts {
  now: Date // server now (caller passes a server-derived Date — R12)
  targetDate?: Date | null // parsed userDoc.targetInterviewDate (local midnight); anchors/caps
}

// Initial card created at completion (never reviewed): first review is due ≥1
// day out so gold can never be minted same-day (coherent with D7's "delayed ≥1
// day"). All arithmetic is in whole days; sub-day precision is out of scope.
export function initialSchedule(now: Date): SchedulingState {
  return {
    dueAt: new Date(now.getTime() + FIRST_INTERVAL_DAYS * MS_PER_DAY),
    intervalDays: FIRST_INTERVAL_DAYS,
    easeFactor: INIT_EASE,
    reps: 0,
    lapses: 0,
  }
}

// Advance the SM-2 state for one graded review. `now` is injected (no Date.now()
// inside) so the module stays deterministic + Firebase-free.
//
// Queue-volume ramp (D4 "ramp queue volume as the date nears") is a SELECTION-side
// concern that lives in spec-10's queue builder, NOT here. This module only
// guarantees the cap + forced-final-rep that make that ramp possible.
export function nextSchedule(
  prev: SchedulingState,
  result: ReviewResult,
  opts: NextScheduleOpts,
): SchedulingState {
  const { now } = opts
  const round = Math.round

  let easeFactor: number
  let intervalDays: number
  let reps: number
  let lapses: number

  if (result === 'fail') {
    easeFactor = Math.max(EASE_FLOOR, prev.easeFactor - EASE_FAIL_PENALTY)
    intervalDays = FIRST_INTERVAL_DAYS
    reps = 0
    lapses = prev.lapses + 1
  } else {
    easeFactor = prev.easeFactor + EASE_PASS_BONUS // no upper cap (D4)
    reps = prev.reps + 1
    // First pass resets to the first interval; subsequent passes apply the NEW
    // ease to the PRIOR interval.
    intervalDays = reps === 1 ? FIRST_INTERVAL_DAYS : round(prev.intervalDays * easeFactor)
    lapses = prev.lapses
  }

  let dueAt = new Date(now.getTime() + intervalDays * MS_PER_DAY)

  // Interview-date anchoring (D4). No-op when no target is set.
  const targetDate = opts.targetDate
  if (targetDate && targetDate.getTime() >= now.getTime()) {
    const targetMs = targetDate.getTime()
    const withinFinalWindow =
      targetMs - now.getTime() <= FORCE_FINAL_WINDOW_DAYS * MS_PER_DAY

    if (withinFinalWindow) {
      // Already in the last 3 days: compress into the window and guarantee a
      // final rep before the date. If the base would overshoot the target,
      // force a rep at target-1d (never before now, never after the target).
      if (dueAt.getTime() > targetMs) {
        const forced = Math.max(now.getTime(), targetMs - MS_PER_DAY)
        dueAt = new Date(Math.min(forced, targetMs))
      }
    } else if (dueAt.getTime() > targetMs) {
      // Cap: never schedule past the interview.
      dueAt = new Date(targetMs)
    }
    // Recompute intervalDays so the stored interval stays coherent with dueAt.
    intervalDays = Math.max(1, round((dueAt.getTime() - now.getTime()) / MS_PER_DAY))
  }
  // If targetDate < now (interview already passed) anchoring is ignored — plain SM-2.

  return { dueAt, intervalDays, easeFactor, reps, lapses }
}
