// Daily Review hero view-model (spec-20 / D8). PURE + dependency-free + node-
// testable (no Firebase, no React) — mirrors conceptCatalog.model.ts. The hero is
// a sibling of the catalog's ResumeHero; this module derives WHICH of the five
// states it renders and the interview-date ramp line, off inputs the container
// reads from spec-10's loadDueQueue + the existing progress subscription.
//
// This spec defines NO scheduling maths and NO persisted fields. The ramp note
// only DISPLAYS the consequence of spec-10's dueAt capping (§4.4); the SM-2 /
// due-selection / interleave all live in spec-10's queue.ts.

// The discriminated state (§4.2 / §4.5). Keeping the two empty conditions
// (caught-up vs no-deck) as DISTINCT literals is the whole point: showing
// "all caught up" over a learner who simply has no review deck yet is a bug.
export type DailyReviewHeroState =
  | 'due' // dueCount > 0
  | 'ramp' // dueCount > 0 AND target interview date near
  | 'caught-up' // cards EXIST (hasAnyCards), none currently due
  | 'no-deck' // NO cards exist yet, but the learner HAS completed lessons
  | 'hidden' // brand-new learner, no completed lessons — defer to ResumeHero

export interface DailyReviewHeroModel {
  state: DailyReviewHeroState // discriminant — drives which copy renders (§4.5)
  hasAnyCards: boolean
  hasCompletedLessons: boolean // disambiguates no-deck from hidden (§4.2 / §4.5)
  dueCount: number
  rampNote: string | null
}

// Days-until threshold past which the ramp note is suppressed entirely (far away).
const RAMP_THRESHOLD_DAYS = 14

// Parse a YYYY-MM-DD calendar date into a local Date at midnight. Returns null
// for a malformed/absent string so callers degrade gracefully (R5 — never throw).
function parseCalendarDate(s: string | undefined): Date | null {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const date = new Date(y, mo - 1, d)
  // Reject overflow (e.g. 2026-13-40 rolling into a later month).
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return null
  }
  return date
}

// Whole calendar days from `now` to the target, comparing local dates only (no
// timezone cleverness — matches how the streak treats local days, §4.4).
function daysUntil(target: Date, now: Date): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  return Math.round((b - a) / 86_400_000)
}

/**
 * The interview-date ramp line (§4.4). Pure + date-only. Returns null when:
 * there is no target date, the date is parse-invalid, nothing is due
 * (`dueCount === 0`), or the interview is still more than RAMP_THRESHOLD_DAYS
 * away. Otherwise a short escalating line keyed off the days remaining. This
 * spec only DISPLAYS the consequence of spec-10's dueAt capping.
 */
export function rampNote(
  targetInterviewDate: string | undefined,
  now: Date,
  dueCount: number,
): string | null {
  if (dueCount <= 0) return null
  const target = parseCalendarDate(targetInterviewDate)
  if (!target) return null
  const d = daysUntil(target, now)
  if (d > RAMP_THRESHOLD_DAYS) return null
  if (d <= 0) return 'Interview day. One last pass.'
  if (d <= 3) {
    return `Final stretch — ${d} ${d === 1 ? 'day' : 'days'} to go. Clear today's queue.`
  }
  if (d <= 7) return `Interview in ${d} days — reviews are ramping up.`
  return `Interview in ${d} days — daily review keeps it warm.`
}

/**
 * Compose the hero view-model (§4.5 state derivation). Order matters:
 *   !hasAnyCards && !hasCompletedLessons  → 'hidden'    (brand-new learner)
 *   !hasAnyCards &&  hasCompletedLessons  → 'no-deck'   (pre-SR / pre-backfill)
 *   dueCount > 0 && rampNote !== null     → 'ramp'
 *   dueCount > 0                          → 'due'
 *   else (hasAnyCards, dueCount === 0)    → 'caught-up'
 *
 * INVARIANT: the caught-up state is NEVER produced while !hasAnyCards — a
 * learner with no deck always lands on 'no-deck' (or 'hidden'), so the
 * misleading "all caught up" copy can never render over an empty deck.
 */
export function buildHeroModel(
  dueCount: number,
  hasAnyCards: boolean,
  hasCompletedLessons: boolean,
  targetInterviewDate: string | undefined,
  now: Date,
): DailyReviewHeroModel {
  const note = rampNote(targetInterviewDate, now, dueCount)
  let state: DailyReviewHeroState
  if (!hasAnyCards) {
    state = hasCompletedLessons ? 'no-deck' : 'hidden'
  } else if (dueCount > 0) {
    state = note !== null ? 'ramp' : 'due'
  } else {
    state = 'caught-up'
  }
  return {
    state,
    hasAnyCards,
    hasCompletedLessons,
    dueCount,
    rampNote: note,
  }
}
