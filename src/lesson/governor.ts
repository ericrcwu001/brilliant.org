// Light bounded difficulty governor (README §4 consumers; Decision D9, app-action #4).
// PURE + dependency-free (node Vitest, like mastery.ts / retrievalRep.ts). The
// quant-intensity gate only ever calls this; Track A never runs the governor.
//
// Counts ONLY retrieval reps (isRetrievalRep, spec-03) into a rolling window and
// nudges TWO scaffolding knobs — fade density + hint cap — toward the ~50–70%
// desirable-difficulty TARGET (aspirational, UNTUNED). Active thresholds: it acts
// below 50% (EASIER_BELOW → easier) and above 85% (HARDER_ABOVE → harder); the
// inactive band [EASIER_BELOW, HARDER_ABOVE] = 50–85% is left alone. 0.70 is NOT a
// code constant (a separate UPPER would be dead code) — only EASIER_BELOW and
// HARDER_ABOVE are wired.
//
// BOUNDED by a CLOSED ENUM, not arithmetic: the only states are
// {offerFade, hintCap ∈ {tighten,default,loosen}} and `tighten` is FLOORED at cap 2
// (never 1, never 0). The governor therefore can never remove the level-3 reveal
// path, so it cannot strand a learner (R6 / D9). The struggle cap-lift to 3 still
// fires independently in the player. Constants UNTUNED — re-tuned per spec-04 with
// real retention data (mirrors the SM-2 constants caveat in D4).
//
// SCAFFOLDING ONLY (D9): it tunes how much help is on offer, never retrieval volume
// or spacing — those are owned by the queue (spec-10) and transfer gate (spec-11).
// It records no time and no scheduling state (R12); the window is a count-only ring.

export const WINDOW_SIZE = 8
export const MIN_REPS = 4
export const EASIER_BELOW = 0.5
export const HARDER_ABOVE = 0.85

// A tiny ring of the last ≤ WINDOW_SIZE retrieval-rep outcomes, most-recent-last.
// LOCAL module type (not a §4 shared shape); only the persisted boolean array
// (snapshot.interactionState.repWindow) crosses a contract boundary.
export type RepWindow = { results: boolean[] }

export const EMPTY_WINDOW: RepWindow = { results: [] }

// Append a rep outcome, dropping the oldest once past WINDOW_SIZE.
export function pushRep(w: RepWindow, correct: boolean): RepWindow {
  const results = [...w.results, correct]
  if (results.length > WINDOW_SIZE) results.splice(0, results.length - WINDOW_SIZE)
  return { results }
}

// Recent success rate, or null until MIN_REPS land (don't govern on noise).
export function successRate(w: RepWindow): number | null {
  if (w.results.length < MIN_REPS) return null
  return w.results.filter(Boolean).length / w.results.length
}

// LOCAL module type (not §4 shared). The bounded decision the player reads.
export type GovernorState = {
  // Offer the Track-A-style faded rung on capable split-aware beats even on the
  // quant gate (makes a too-hard streak easier). Null window ⇒ false (static default).
  offerFade: boolean
  // Cap delta applied to the hint ladder for the current graded beat:
  //   'tighten' → cap = min(beat.maxHintLevel ?? 3, 2) (harder; reveal still reachable
  //               via the struggle cap-lift, so NO dead-end — see R6 / §3.5)
  //   'default' → cap = beat.maxHintLevel ?? 3 (author's cap)
  //   'loosen'  → cap = 3 (full ladder; easiest)
  hintCap: 'tighten' | 'default' | 'loosen'
}

// One step per evaluation, re-evaluated as each new rep lands, so it tracks toward
// the band rather than overshooting. No multi-step ramp: the enum + window already
// make movement gradual and bounded. The inactive band is the HALF-OPEN
// [EASIER_BELOW, HARDER_ABOVE] — rate == 0.50 or == 0.85 is left alone (default).
export function governorState(w: RepWindow): GovernorState {
  const rate = successRate(w)
  if (rate === null) return { offerFade: false, hintCap: 'default' } // not enough reps: static
  if (rate > HARDER_ABOVE) return { offerFade: false, hintCap: 'tighten' } // coasting → harder
  if (rate < EASIER_BELOW) return { offerFade: true, hintCap: 'loosen' } // struggling → easier
  return { offerFade: false, hintCap: 'default' } // inside the inactive 50–85% band: leave it
}

// Resolve the effective hint cap for a beat given the governor + the author cap,
// FLOORED at 2 so the level-3 reveal is always reachable (R6, no dead-end). This is
// the structural bound D9 requires — `tighten` NEVER returns below 2 for ANY input,
// including an author cap of 1. (The §3.2 sketch's `min(author, 2)` would drop to 1
// for author 1; we instead floor at 2 to honor the DoD's "never below 2" guarantee:
// even a beat authored at maxHintLevel 1 keeps the level-2 hint + the struggle
// cap-lift to 3, so a tightened beat can never strand a learner.)
export function effectiveHintCap(
  state: GovernorState,
  authorCap: 1 | 2 | 3 | undefined,
): 1 | 2 | 3 {
  const author = authorCap ?? 3
  if (state.hintCap === 'loosen') return 3
  if (state.hintCap === 'tighten') return Math.max(Math.min(author, 2), 2) as 2 // floor 2
  return author
}
