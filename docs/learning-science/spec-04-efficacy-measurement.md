# spec-04 — Efficacy measurement & the retention-data tuning loop

- **Status:** Planned
- **Phase:** 0 (Foundations — Measurement)
- **Depends-on:** spec-01 (`reviews/{cardId}` SR state), spec-02 (confidence field), spec-03 (retrieval-rep taxonomy + `retrieval_rep` analytics name).
- **Coordinates-with:** spec-12 (calibration trend — consumed, not rebuilt), spec-05 (rollout — populates the holdout/A-B cohort this spec reads), spec-10/11/21 (the SM-2 and governor constants this spec's loop re-tunes).
- **Implements:** the **program-level measurement loop** the plan otherwise lacks (external-review finding #1); closes the D4/D9 "constants ship untuned — revisit with real retention data" loop (Decisions **D4**, **D9**, **D17**). References `README.md` §4 / §4.5 / §4.7.
- **Co-defined contract:** the **rollout-cohort enum** is `'treatment' | 'holdout'` (control arm = `'holdout'`, **no `'control'` literal**) — frozen once in `README.md` §4.5. spec-05 owns assignment; this spec owns the analytics `cohort` dimension + the efficacy read over it, and reads `'holdout'` as its control arm.

> This spec links back to [`README.md`](README.md). The shared contracts in §4 / §4.5 are authoritative; this spec
> references them by name and **consumes** the signals spec-02/03/12 already define rather than redefining them.

---

## 1. Goal & non-goals

**Goal.** Define the **measurement loop** that tells us whether the overhaul actually improves *durable, transferable,
under-pressure retrieval* (the §2 thesis), not in-session fluency. Concretely: (a) operational efficacy **metrics with
exact formulas** computed from the data spec-01/02/03/12 already persist; (b) the **analytics dimensions + rollup site**
where those metrics are aggregated, reusing the existing fire-and-forget analytics wrapper; (c) the **tuning process**
that turns retention data into re-tuned SM-2 ease/interval (D4) and governor band (D9) constants, with a named owner and
trigger threshold; (d) a **holdout / A-B comparison hook** so efficacy is measured against the **`holdout`** cohort (the control arm, spec-05),
not a pre/post self-comparison.

**Non-goals.**
- **Do not** rebuild spec-02 (confidence capture), spec-03 (retrieval-rep classifier), or spec-12 (Brier / calibration
  trend). This spec **reads** `reviews/{cardId}`, the `retrieval_rep` event, and `users/{uid}/calibration/summary`; it
  defines **no** new learning signal.
- **Do not** ship the rollout flag, holdout-cohort assignment, or kill switch — that is **spec-05** (D17, R14). This spec
  only defines the **dimension** (`cohort`) that spec-05 must stamp and the read contract over it.
- **Do not** auto-tune constants at runtime. The tuning loop (§3.3) is a **human-owned, offline** process; v1 ships a
  measurement + a documented re-tune procedure, **not** an online optimizer. Auto-tuning is explicit future work.
- **Do not** add a scheduled Cloud Function or push/email digest (D14). Aggregation is either client-event-driven
  (analytics dimensions) or an **offline export** (§3.2); no new return-trigger is introduced.
- **No new personal-data sink beyond §4.6.** Efficacy roll-ups are **aggregate / cohort-level**; this spec must not
  create a new per-learner doc that escapes the §4.6 retention/delete posture (see §6, §8 Foolproofing).

---

## 2. Current reality (verified against the code)

| Claim | Evidence |
|---|---|
| Analytics is a flat object of typed `track(name, params)` wrappers; fire-and-forget; auto-carries `uid` + `client_ts`; **skipped entirely in emulator/dev** and when there is no `measurementId`. | `src/analytics/events.ts:50-66` (`track`), `:70-137` (the `analytics` object). |
| Each event carries only its own params; there is **no shared cohort/track/dimension** stamped on events today. | `src/analytics/events.ts:58-62` — params are `{uid, client_ts, ...params}`; no `cohort`/`track`/`schemaId` global dimension. |
| There is **no efficacy aggregation** anywhere — no server aggregate doc, no BigQuery export config. | No `aggregate`/`bigquery`/`efficacy` identifiers in `src/` or `functions/src/`; `firestore.indexes.json` is `{indexes:[],fieldOverrides:[]}` (verified). |
| Firebase Analytics has a **BigQuery export** path (a project-config toggle, not code), but it is **not configured** in this repo and there is no export-consuming code. | No `bigquery` references in repo; export is a console/`firebase.json`-adjacent setting, stated as a **dependency** in §3.2. |
| The SR card persists exactly the fields this spec reads: `lastResult`, `reps`, `lapses`, `intervalDays`, `isTransfer`, `lastConfidence`, `lastReviewedAt`, `dueAt`. | `README.md` §4 Foundation A card shape (spec-01). |
| Calibration trend lives in a Function-owned `users/{uid}/calibration/summary` doc with `{n, brier, overconfidence, reliable, byFormat}`; gated by `MIN_CALIBRATION_N` (=5). | `README.md` §4.5; `spec-12` §3.3, §3.2a. |
| The `retrieval_rep` analytics event name is **reserved by spec-03** with params `{lessonId, beatId, schemaId?, correct, source}`; spec-03 does **not** wire its live call sites (consumers do). | `spec-03` §3 (Step 2), §6. |
| Medallion gold is **Function-owned**; `derived.mastered` only ever writes `true` and only *improves* on review (spec-11 redefines it to delayed/transfer). | `functions/src/index.ts:151-167`. |
| SM-2 + governor constants are **explicitly untuned placeholders** to be revisited with retention data; the owning loop is assigned to **spec-04**. | `README.md` D4, D9. |

**Dependency note.** Every metric in §3.1 is computable **only after** spec-01/02/03 land (their fields/events don't
exist yet). This spec is sequenced **after** them in §7 of the README precisely so the read contracts are real, not
speculative. The calibration delta metric additionally needs spec-12. Until spec-05 stamps `cohort`, the A-B metrics
(§3.4) degrade to a single-cohort (treatment-only) read — documented, not stubbed.

---

## 3. Design

### 3.1 Operational metrics + exact formulas

All metrics are computed over a **window** `W` (default: trailing 28 days, by `client_ts` / `lastReviewedAt`) and are
**split by `cohort`** (§3.4) so `treatment` is always read against the `holdout` control arm. Each is a pure function over the data
spec-01/02/03/12 persist; none introduces a new learner signal. Formulas are written so they can be unit-tested on
fixture data (§5).

Let, for a cohort × window:

1. **Delayed-retrieval pass rate (the headline durability metric).**
   The fraction of *first delayed SR reviews* that pass. A review is "delayed" iff its **elapsed** interval was ≥ 1 day —
   i.e. it is a genuine cold-recall act, not a same-session re-ask.
   - **Source (per-review EVENT stream, not the card snapshot).** This metric is computed over the **per-review outcome
     event** spec-01 fires on each `submitReview` (`src/analytics/events.ts`; one row per review, carrying the
     server-graded `result` and the **elapsed** `intervalDays` for that review), **NOT** over the `reviews/{cardId}`
     document. The card doc is a current-state *snapshot*: its `lastResult` is only the **most recent** result and its
     `reps`/`lapses` are not a monotonic total-review count (spec-01 §3 resets `reps=0` on every FAIL and increments
     `lapses` instead, so `reps + lapses` is **not** a review counter and cannot identify the first review). The first
     delayed review's result is recoverable **only** from the event stream.
   - **Numerator:** count of cards whose **first** review event with elapsed `intervalDays >= 1` had `result === 'pass'`.
   - **Denominator:** count of cards that have **at least one** review event with elapsed `intervalDays >= 1` (each card
     contributes its first such event exactly once).
   - **Formula:** `passRate = firstDelayedPasses / firstDelayedReviews`. (First-per-card is selected by ordering each
     card's delayed events by `ts` and taking the earliest — there is **no** `reps + lapses` disambiguation; that was
     invalid against spec-01's counter semantics.)
   - **Why first-review:** later reviews are confounded by the schedule the metric is trying to evaluate; the first
     delayed pass is the cleanest signal of "did the spacing produce durable recall." (Soderstrom & Bjork 2015:
     retention ≠ in-session performance — this metric is the retention side.) This is **why** the metric must read the
     event stream: a snapshot can report the latest review's pass rate, never the *first* review's.

2. **Transfer pass rate (the headline transferability metric).**
   Same as (1) but restricted to **held-out transfer cards** (`isTransfer === true`, spec-24/spec-01).
   - **Formula:** `transferPassRate = transferFirstDelayedPasses / transferFirstDelayedReviews`, over cards with
     `isTransfer === true`. This is the Track-B gold gate's empirical pass rate (spec-11).

3. **Gold-mint rate.**
   The fraction of learners (or of silver-earned lessons) that progress to **delayed gold**.
   - **Numerator:** count of `milestone_earned` golds attributable to a *delayed* mint (the async gold-mint branch
     spec-11 adds — distinguish via a `kind: 'delayed_gold'` dimension on `milestoneEarned`, §3.2).
   - **Denominator:** count of silver awards (instant on completion, spec-11) in the same window.
   - **Formula:** `goldMintRate = delayedGoldMints / silverAwards`. This is the **motivation-cliff** monitor for D14
     (instant silver → maybe-never gold for a non-returning learner): a low gold-mint rate is the empirical signature of
     the D14 risk and triggers the §3.3 re-engagement review.

4. **Calibration-delta trend (consumed from spec-12, not recomputed).**
   Read `users/{uid}/calibration/summary.overconfidence` (= `meanConfidence − accuracy`) and its `byFormat.voice`
   sub-summary; report the **cohort mean** and its **trend** (sign and slope of overconfidence over `W`). Only include
   learners with `reliable === true` (n ≥ `MIN_CALIBRATION_N`). **Formula:** `cohortOverconfidence = mean over reliable
   learners of summary.overconfidence`; trend = sign of the change in that mean across consecutive windows. We do **not**
   recompute Brier here — spec-12 owns it; this spec only aggregates the already-computed delta.

5. **Engagement guardrails (must-not-regress, from spec-03/streak data).**
   These are **guardrails**, not targets — desirable difficulties may *depress* fluency, so we watch that we do not also
   crater engagement:
   - **Queue-completion rate** = `dueCardsReviewed / dueCardsSurfaced` over `W` (from the `review_recommended_shown`
     event + `retrieval_rep` with `source==='review'`).
   - **Streak** = the existing streak distribution (median active-day streak), read unchanged from
     `users/{uid}/streaks/current` (D10 — **read-only**; this spec must not alter it).
   - **Retrieval-reps/week** = count of `retrieval_rep` events per active learner per 7 days (spec-03's informational
     stat, D10).
   A treatment cohort that improves (1)/(2) **but** regresses a guardrail beyond its threshold (§3.3) is a **failed**
   experiment, not a win.

> **Numerator/denominator hygiene.** Every rate is `null` (not `0`) when its denominator is below a minimum-n floor
> (`MIN_EFFICACY_N = 20` cards/learners per cohort×window) — mirrors spec-12's `reliable` gate so a 1-card cohort
> cannot read as "0% pass." Tests assert the `null` path (§5).

### 3.2 Computation / aggregation site (the rollup)

Two layers, both reusing existing patterns; **no new runtime behavior, no scheduled Function**:

**Layer 1 — analytics DIMENSIONS on existing events (this spec ships the dimension contract).**
Add a small set of **dimensions** so the events spec-01/02/03 already fire can be sliced by cohort/track/method without a
new event taxonomy. Reuse the fire-and-forget `track()` wrapper (`events.ts:50-66`) — the cleanest place is to extend the
shared param block in `track()` so **every** event carries the dimensions, set once at session start:

```ts
// src/analytics/events.ts — extend the shared block in track() (not per-call).
// Dimensions resolved once per session from the user/cohort context; absent → omitted.
logEvent(analyticsInstance, name, {
  uid: auth.currentUser?.uid ?? anonClientId(),
  client_ts: Date.now(),
  cohort,        // 'treatment' | 'holdout' | undefined  — STAMPED BY spec-05 (§3.4; README §4.5 enum); fail-absent
  track,         // 'A' | 'B' | undefined                — from isQuantIntensity context (README §4 helper)
  ...params,
})
```

- `cohort` is the **only** new load-bearing dimension this spec defines; its value enum is the co-defined
  `'treatment' | 'holdout'` (README §4.5; control arm = `'holdout'`), and it is **set by spec-05** (which owns
  assignment). This spec specifies the **name, type, and fail-absent semantics** (`undefined` when spec-05 hasn't
  assigned, never a guessed value), and the read contract over it. Until spec-05 lands, `cohort` is always `undefined`
  and §3.4 metrics collapse to single-cohort — documented, not broken.
- `track` reuses the existing `isQuantIntensity` track value (`README.md` §4 helper); it is **not** re-derived here.
- Add a `kind` param to **`milestoneEarned`** so delayed gold is distinguishable from instant silver/legacy gold for
  metric (3): `milestoneEarned({ lessonId, milestoneId, kind: 'silver'|'delayed_gold'|'transfer_gold' })`. spec-11 (which
  owns the mint) passes `kind`; this spec only specifies the param.

**Layer 2 — the aggregate rollup (RECOMMENDED: BigQuery export; dependency stated).**
The metrics in §3.1 are cross-learner *aggregates over time* — exactly what a query engine is for, and a poor fit for a
Firestore doc (no GROUP BY, would need a fan-in writer this plan deliberately lacks, D14). **Recommendation: enable the
Firebase Analytics → BigQuery export** and compute §3.1 as scheduled SQL over the `events_*` tables (the dimensions in
Layer 1 are the GROUP BY keys). **This is a stated dependency, not code in this repo:** the export is a Firebase-console /
project-config toggle the repo does **not** have today (§2), so spec-04's DoD includes *documenting and requesting* the
export, and the metric formulas (§3.1) are authored as **portable pseudo-SQL + a pure TS reference implementation**
(`src/analytics/efficacy.ts`, §4) that runs the same formulas on a fixture row-set for unit testing and for a local/dev
fallback before the export exists.

- **Why not a server aggregate doc:** rejected for the same reason spec-12 rejected `ProgressDerived` for cross-concept
  data — these metrics are cross-learner and time-windowed; a single Firestore counter doc would need a trusted fan-in
  writer (a scheduled Function, forbidden by D14) and could not answer windowed GROUP-BY queries. The **per-learner**
  inputs already live in Firestore (spec-01/12); the **aggregate** belongs in the export.
- **Fallback if BigQuery export is declined:** a manual/offline export of the same fields (a one-off admin script reading
  the Firestore subcollections, run by the owner in §3.3) computes the identical `src/analytics/efficacy.ts` formulas.
  The pure TS module is the contract; the data source (BigQuery vs offline read) is swappable behind it.

### 3.3 The tuning process (closes the D4 / D9 "revisit with retention data" loop)

This is the loop the plan was missing. It converts §3.1 metrics into re-tuned constants.

**Constants in scope (the only things this loop re-tunes):**
- **SM-2** (D4): init ease `2.5`, ease floor `1.3`, wrong-penalty `−0.20`, right-bonus `+0.10`, reset-interval `1d`,
  interview-date anchoring caps. Owned by `src/progress/scheduling.ts` (spec-01) + the SM-2 advance body (spec-10).
- **Governor band** (D9): `EASIER_BELOW` (~50%) and `HARDER_ABOVE` (~85%) and the ~50–70% target band, in the difficulty
  governor (spec-21).

**Trigger threshold (when a re-tune is allowed to run).** A re-tune review is triggered when **both** hold for a cohort:
- **Sufficient data:** the delayed-retrieval-pass-rate denominator (§3.1 metric 1) has `firstDelayedReviews >= 200` for
  the cohort (above `MIN_EFFICACY_N`; 200 is the lower bound for a stable rate at the per-constant grain — stated as a
  placeholder, itself revisable), AND the metric has stabilized (two consecutive 28-day windows with the rate moving
  < 3 absolute percentage points).
- **Off-target signal:** the **first-delayed-retrieval pass rate is outside the desirable-difficulty band** — the SM-2
  spacing is the lever here. The target is a **~85% first-delayed-pass rate** (the standard "successful but effortful"
  retrieval target; recall ≫ 90% means intervals are too short / under-spaced, ≪ 80% means too long / forgetting). Pass
  rate **> 90%** → lengthen intervals (raise right-bonus / init ease); **< 80%** → shorten (lower init ease / raise
  wrong-penalty). The governor band (D9) re-tunes on the **same** rolling-success signal but scoped to scaffolding, not
  spacing: if the governor's acted-on cohort sits persistently outside ~50–70% *despite* acting, move `EASIER_BELOW` /
  `HARDER_ABOVE`.

**Procedure (offline, human-owned).**
1. Pull §3.1 metrics per cohort×window from the rollup (§3.2).
2. If the trigger holds, propose a constant delta (one lever at a time — never move SM-2 *and* governor in the same
   cycle, so the next window attributes the change).
3. Change the constant **only** in its pure module (`scheduling.ts` / governor) behind the existing flag (spec-05), ship
   to the **treatment** cohort, leave the **`holdout`** cohort on the prior constant.
4. Re-measure for ≥ 2 windows; keep the change iff the durability metric improves with **no guardrail regression**
   (§3.1 metric 5) beyond its threshold (queue-completion drop > 10 pts, or streak-median drop > 1 day → revert).

**Owner.** The **learning-science / DRI owner of this plan** (the human maintaining `docs/learning-science/`) owns the
re-tune decision and records each change as a dated entry in this spec's **Tuning Log** (§3.5) + a one-line ADR addendum.
This is **not** an automated job — assigning a *human* owner is the point of closing the loop (D4/D9 said "revisit," not
"auto-optimize"). The constants remain **placeholders in code with a comment pointing here** until the first re-tune.

### 3.4 Holdout / A-B comparison hook (holdout vs treatment)

Efficacy must be measured against a **control arm** (the `holdout` cohort), not pre/post (a pre/post jump confounds the
overhaul with selection, seasonality, and content changes). The hook uses the co-defined `'treatment' | 'holdout'` enum
(README §4.5; **there is no `'control'` literal** — the control arm is named `holdout`):

- **spec-05 owns cohort assignment** (the holdout cohort is part of D17's rollout posture). spec-05 stamps each learner
  as `holdout` (the control arm: legacy behavior — no SR queue, instant gold, static difficulty) or `treatment` (the
  full overhaul) and exposes that assignment to the analytics dimension `cohort` (§3.2 Layer 1) **and** as a readable
  `userDoc.rolloutCohort` field the offline rollup can join on.
- **This spec consumes it:** every §3.1 metric is reported **paired** (`treatment` vs `holdout`) over the same window;
  the headline efficacy result is the **between-cohort delta** (e.g. `Δ delayedPassRate = treatment − holdout`), not a
  within-cohort pre/post. The A-B read is the same pure formula run twice (once per cohort) plus a difference.
- **Guard:** if `cohort` is absent for a learner (spec-05 not yet shipped, or assignment failed), that learner's events
  are **excluded** from the A-B delta (not silently folded into treatment) — fail-absent, matching the §3.2 dimension
  contract. A treatment-only single-cohort read is still produced for pre-spec-05 dev, clearly labeled
  "no holdout — descriptive only."

### 3.5 Tuning Log (lives in this spec)

A dated, append-only table recording every constant re-tune: `date | constant | old → new | cohort | metric-before |
metric-after | owner | revert?`. Empty at ship (constants are placeholders). This is the human-readable audit trail the
D4/D9 loop produces; each row is also reflected as an ADR addendum (D16 housekeeping style).

| date | constant | old → new | cohort | metric before | metric after | owner | reverted? |
|---|---|---|---|---|---|---|---|
| — | (none yet — constants ship as placeholders) | — | — | — | — | — | — |

---

## 4. Step-by-step implementation

### Step 1 — Add the `cohort` dimension contract to analytics

Edit `src/analytics/events.ts`. Extend the shared param block inside `track()` (`:58-62`) to carry `cohort` and `track`
dimensions resolved once per session (not per call), with **fail-absent** semantics (`undefined` → key omitted, never a
guessed value). Provide a tiny setter the app calls at session start once the user/cohort context is known:

```ts
// module-scoped, set once at session start; absent until known (fail-absent).
// cohort enum is co-defined in README §4.5: 'treatment' | 'holdout' (control arm = 'holdout'; NO 'control').
let sessionDimensions: { cohort?: 'treatment' | 'holdout'; track?: 'A' | 'B' } = {}
export function setAnalyticsDimensions(d: { cohort?: 'treatment' | 'holdout'; track?: 'A' | 'B' }) {
  sessionDimensions = { ...sessionDimensions, ...d }
}
// inside track(): spread sessionDimensions into the logEvent params (omit undefined keys).
```

- **spec-05** calls `setAnalyticsDimensions({ cohort })` once it has the assignment; **spec-10/20** (or the existing
  track context) calls it with `track`. This spec only *defines* the dimension + setter and the omit-undefined behavior.
- Do **not** stamp `cohort` from anything but spec-05's assignment (R12 spirit: do not derive a cohort from a spoofable
  client value).

→ **verify:** `grep -n "setAnalyticsDimensions\|cohort" src/analytics/events.ts` shows the setter + dimension;
`./node_modules/.bin/eslint src/analytics/events.ts` passes; undefined dimensions are omitted (unit-tested in Step 4).

### Step 2 — Add the `kind` param to `milestoneEarned`

Edit `src/analytics/events.ts`: change `milestoneEarned` to
`(p: { lessonId: string; milestoneId: string; kind?: 'silver' | 'delayed_gold' | 'transfer_gold' }) =>
track('milestone_earned', p)`. **spec-11** (owner of the mint) passes `kind` at each mint site; this spec only widens
the param so metric (3) (gold-mint rate) is computable. Keep `kind` optional so spec-11 can land independently.

→ **verify:** `grep -n "milestoneEarned" src/analytics/events.ts` shows the `kind` param; existing callers still compile
(optional param); `./node_modules/.bin/eslint src/analytics/events.ts` passes.

### Step 3 — Create the pure efficacy formulas `src/analytics/efficacy.ts`

Create a **pure, dependency-free** module (matches `mastery.ts` / `retrievalRep.ts` / `scheduling.ts` — runs in node
Vitest, no Firebase). It computes §3.1 metrics over an in-memory row-set (the same rows BigQuery or the offline export
would yield), so the formulas are the single source of truth and are unit-tested:

```ts
// Program-level efficacy metrics (spec-04 §3.1). PURE — runs over an in-memory
// row-set (BigQuery export rows OR an offline Firestore read; data source is
// swappable behind these formulas). Reads only fields spec-01/02/03/12 persist;
// defines NO new learning signal. Every rate returns null below MIN_EFFICACY_N.

export const MIN_EFFICACY_N = 20

// Cohort enum co-defined in README §4.5. Control arm = 'holdout'; there is NO 'control' literal.
export type Cohort = 'treatment' | 'holdout'

// ReviewEventRow = ONE PER REVIEW EVENT (spec-01's submitReview outcome event), NOT the
// reviews/{cardId} snapshot. Carries the server-graded result + the ELAPSED interval for
// THAT review + a timestamp, so the metric can identify each card's FIRST delayed review.
// (The card doc is a current-state snapshot: lastResult is only the latest result, and
//  reps/lapses are not a review counter — spec-01 resets reps=0 on FAIL — so a snapshot
//  cannot recover the first review's result.)
export type ReviewEventRow = {
  cardId: string; cohort?: Cohort
  intervalDays: number               // ELAPSED interval for this review event (days)
  result: 'pass' | 'fail'            // server-graded (R13)
  isTransfer: boolean
  ts: number                         // epoch ms; ordering (first-per-card) + window filter
}
export type MilestoneRow = { cohort?: Cohort; kind: 'silver'|'delayed_gold'|'transfer_gold'; ts: number }
export type CalibrationRow = { cohort?: Cohort; overconfidence: number | null; reliable: boolean }

// First delayed (>=1d elapsed) review event per card, by earliest ts.
function firstDelayedPerCard(rows: ReviewEventRow[]): ReviewEventRow[] {
  const earliest = new Map<string, ReviewEventRow>()
  for (const r of rows) {
    if (r.intervalDays < 1) continue
    const prev = earliest.get(r.cardId)
    if (!prev || r.ts < prev.ts) earliest.set(r.cardId, r)
  }
  return [...earliest.values()]
}
export function delayedRetrievalPassRate(rows: ReviewEventRow[]): number | null {
  const firstDelayed = firstDelayedPerCard(rows)
  if (firstDelayed.length < MIN_EFFICACY_N) return null
  const passes = firstDelayed.filter(r => r.result === 'pass').length
  return passes / firstDelayed.length
}
export function transferPassRate(rows: ReviewEventRow[]): number | null {
  return delayedRetrievalPassRate(rows.filter(r => r.isTransfer))
}
export function goldMintRate(rows: MilestoneRow[]): number | null {
  const silver = rows.filter(r => r.kind === 'silver').length
  if (silver < MIN_EFFICACY_N) return null
  const gold = rows.filter(r => r.kind === 'delayed_gold' || r.kind === 'transfer_gold').length
  return gold / silver
}
export function cohortOverconfidence(rows: CalibrationRow[]): number | null {
  const reliable = rows.filter(r => r.reliable && r.overconfidence != null)
  if (reliable.length < MIN_EFFICACY_N) return null
  return reliable.reduce((s, r) => s + (r.overconfidence as number), 0) / reliable.length
}
// A-B: same formula per cohort, then difference. null if either side is null.
// Control arm is 'holdout' (README §4.5) — no 'control' literal anywhere.
export function abDelta<T>(rows: T[], cohortOf: (r: T) => Cohort | undefined,
                           metric: (rs: T[]) => number | null): { holdout: number|null; treatment: number|null; delta: number|null } {
  const holdout = metric(rows.filter(r => cohortOf(r) === 'holdout'))
  const treatment = metric(rows.filter(r => cohortOf(r) === 'treatment'))
  const delta = holdout != null && treatment != null ? treatment - holdout : null
  return { holdout, treatment, delta }
}
```

(Engagement guardrails — queue-completion, retrieval-reps/week — follow the same shape over event rows; include them in
the module with the same `MIN_EFFICACY_N` null-floor.)

→ **verify:** `./node_modules/.bin/eslint src/analytics/efficacy.ts` and project typecheck pass; module imports nothing
from `firebase`.

### Step 4 — Unit tests on fixture row-sets

Create `src/analytics/efficacy.test.ts` (node Vitest). See §5 for cases.

→ **verify:** `./node_modules/.bin/vitest run src/analytics/efficacy.test.ts` green.

### Step 5 — Document the rollup dependency + tuning procedure

Add a `docs/learning-science/` note (or an ADR addendum) that (a) **requests the Firebase Analytics → BigQuery export**
(the stated dependency, §3.2) with the portable pseudo-SQL for each §3.1 metric, and (b) records the §3.3 tuning
procedure + the empty §3.5 Tuning Log. No code; this is the human-process half of the loop.

→ **verify:** the note exists and the pseudo-SQL GROUP BYs use exactly the Step-1/Step-2 dimensions (`cohort`, `track`,
`kind`); the TS reference impl (Step 3) and the SQL compute the same formula on the §5 fixture row-set.

### Step 6 — Wire the dimension setters at the two known call sites (coordination only, optional in this spec)

Document (do **not** force-wire) the two `setAnalyticsDimensions` call sites: spec-05 sets `cohort`; the track context
sets `track`. If a reviewer wants the `track` dimension proven live now, wire only the `track` setter (cohort waits on
spec-05). Prefer leaving live wiring to spec-05/10 to avoid speculative coupling.

→ **verify (if done):** the setter is called once per session, not per event; manual `/dev` shows no behavioral change
(fire-and-forget; emulator/dev skips analytics — `events.ts:23`).

---

## 5. Tests

`src/analytics/efficacy.test.ts` (node Vitest, pure — no Firebase). Build small fixture row-sets inline.

Cases:
1. **delayed-retrieval pass rate** — an **event** row-set (`ReviewEventRow[]`) of ≥ `MIN_EFFICACY_N` distinct cards with
   a known pass/fail mix on their first delayed event returns the exact expected ratio; review events with
   `intervalDays < 1` are excluded from both numerator and denominator; and when a card has **multiple** delayed events,
   only its **earliest by `ts`** counts (a later pass after a first-review fail does **not** flip the card to a pass —
   guards the first-vs-latest bug).
2. **min-n floor returns null** — a row-set below `MIN_EFFICACY_N` returns `null`, **not** `0` (numerator/denominator
   hygiene, §3.1).
3. **transfer pass rate** — only `isTransfer===true` rows count; a set with mixed `isTransfer` returns the rate over the
   transfer subset, and `null` when the transfer subset is below the floor even if total rows clear it.
4. **gold-mint rate** — `delayed_gold` + `transfer_gold` over `silver`; a cohort with silver but zero gold returns `0`
   (the motivation-cliff signal), distinct from `null` (no data).
5. **calibration cohort overconfidence** — only `reliable===true` rows with non-null `overconfidence` are averaged;
   unreliable rows are dropped; below-floor returns `null`. (Confirms spec-12 is **consumed**, not recomputed: the test
   feeds pre-computed `overconfidence` values.)
6. **A-B delta** — `abDelta` returns `{holdout, treatment, delta}`; `delta` is `null` if **either** cohort is below the
   floor (no spurious delta), and the numeric difference (`treatment − holdout`) when both are present. (Uses the
   co-defined `'holdout'` control literal — README §4.5; a `'control'` key would never match spec-05-stamped data.)
7. **cohort-absent exclusion** — rows with `cohort===undefined` are excluded from both A-B arms (fail-absent, §3.4), and
   a treatment-only descriptive read is still computable.
8. **dimension omit-undefined** (events.ts) — with `setAnalyticsDimensions({})`, `track()`'s params contain **no**
   `cohort`/`track` keys (undefined omitted); with `setAnalyticsDimensions({cohort:'treatment'})`, the next event's
   params contain `cohort:'treatment'`. (Test the param-assembly by injecting a stub `logEvent`, mirroring the
   fire-and-forget contract — no real Firebase.)

→ **verify:** `./node_modules/.bin/vitest run src/analytics/efficacy.test.ts` green (all 8 cases).

**Validator / regression.** This spec adds no fixture field, but run the suite to confirm no regression:

→ **verify:** `tsx scripts/validate-fixtures.ts` passes; existing analytics consumers compile with the widened
`milestoneEarned` param.

---

## 6. Data / schema changes

**No new persisted learner field.** This spec reads spec-01's `reviews/{cardId}`, spec-12's
`users/{uid}/calibration/summary`, and the spec-03 `retrieval_rep` event — it persists nothing new per learner.

- **Analytics dimensions** (`src/analytics/events.ts`): `cohort` (`'treatment'|'holdout'|undefined`, **set by spec-05**;
  enum co-defined in README §4.5, control arm = `'holdout'`), `track` (reused from the §4 `isQuantIntensity` value), and
  a widened `milestoneEarned.kind` (**set by spec-11**). These are event dimensions, **not** Firestore documents.
- **Aggregate rollup** (§3.2): the **recommended home is the BigQuery export** (a project-config dependency, not a repo
  doc) — explicitly chosen over a server aggregate doc so it does not require the fan-in scheduled Function D14 forbids.
  The pure formulas live in `src/analytics/efficacy.ts` (no persisted state).
- **§4.6 privacy.** Efficacy outputs are **aggregate / cohort-level**, never a new per-learner sink, so they fall under
  the existing §4.6 posture (owner-only inputs; aggregates are not personally identifying and are never a gate — D11).
  The BigQuery export inherits the project's analytics retention; **no audio, ever** (carried from §4.6). The
  cascade-delete path (§4.6, owned by spec-05) covers the per-learner inputs this spec reads; this spec adds nothing for
  it to delete.

No new §4 shared contract field is introduced. Flag to the consistency gate only that: the analytics dimension name
**`cohort`** is reserved here (assigned by spec-05), and `milestoneEarned.kind` values `'silver'|'delayed_gold'|
'transfer_gold'` are reserved here (passed by spec-11).

---

## 7. Two-track behavior

The efficacy **metrics are track-agnostic** — "did spaced retrieval produce durable recall?" is the same question for
both tracks, and `track` is carried as a **dimension** so every metric can be **sliced** by track without changing the
formula. The two-track relevance is in *interpretation*, not computation:

- **Track A (gentle default):** produces delayed-retrieval and gold-mint data (Track-A gold = re-retrieve the same
  checkpoint cold, spec-11), but **no transfer cards** (transfer is Track-B, D7) and **light/off calibration** (D6) — so
  metric (2) and metric (4) read mostly from the quant-intensity cohort. The metric code handles this by returning
  `null` (below floor) rather than a misleading `0` for Track-A transfer/calibration.
- **Quant-intensity gate (Track B `OR` `learningGoal === 'interview'`):** is where transfer pass rate, calibration
  delta, and the governor band live, so the §3.3 governor re-tune is scoped to this cohort. The SM-2 spacing re-tune
  (metric 1) applies to **both** tracks (both use the same scheduler).

This spec adds **no** track branch in code (the slice is a dimension filter); it must not gate behavior on
`track`/`learningGoal`.

---

## 8. Foolproofing (which §8 items apply)

- **R9 — "It's in the product" ≠ "the mechanism exists."** The external review's finding #1 is precisely R9 at the
  program level: lesson content reflects learning science, but **no measurement mechanism** existed to know if it works.
  This spec builds that mechanism. It measures **delayed** retrieval and **transfer**, not in-session fluency (the §2
  thesis), so a fluency win that doesn't translate to retention is **not** counted as success.
- **R4 — Schema migrations are permanent; the index file is empty.** This spec deliberately adds **no Firestore
  document** and **no index** (R4 avoided): it reads existing per-learner state and pushes aggregation to the export, so
  there is no new schema to freeze and no `dueAt`/`schemaId` query to index here. The one widened shape
  (`milestoneEarned.kind`) is an analytics param, not a persisted progression field.
- **R12 — Client timestamps / values are spoofable.** The `cohort` dimension is **set only by spec-05's server-derived
  assignment**, never from a spoofable client value; the headline metric reads the **server-graded `result`** carried on
  the per-review outcome event (R13 — the client never asserts pass/fail), and its window/first-review ordering keys off
  the event `ts`, used only for coarse windowing of fire-and-forget events, never to gate gold or re-tune a constant. A
  re-tune decision (§3.3) keys off server-graded review state (`reviews/{cardId}` + the server-graded outcome events),
  not client-asserted values.
- **R14 — No flag/holdout/kill infra exists.** The A-B hook (§3.4) **depends on** spec-05 to build the holdout cohort
  (R14); this spec does **not** assume it exists — it defines the `cohort` dimension contract and **fails absent**
  (excludes unassigned learners; produces a labeled treatment-only descriptive read pre-spec-05) so it is never silently
  wrong before spec-05 ships.
- **R2 (consume, don't fork).** This spec must **not** recompute mastery, Brier, or the retrieval-rep boolean — it reads
  spec-11/12/03's outputs. Forking any of these would create a second source of truth (the R2 failure mode). The
  `cohortOverconfidence` formula takes spec-12's `overconfidence` as input and never recomputes it.

---

## 9. Definition of Done

- [ ] `src/analytics/events.ts`: `setAnalyticsDimensions` + the `cohort`/`track` shared dimensions exist with
      **omit-undefined** (fail-absent) semantics; `milestoneEarned` carries optional `kind`. Existing callers still
      compile.
- [ ] `src/analytics/efficacy.ts` exists: **pure, Firebase-free**, exports `delayedRetrievalPassRate`,
      `transferPassRate`, `goldMintRate`, `cohortOverconfidence`, `abDelta` (+ guardrail metrics), each with the
      `MIN_EFFICACY_N` null-floor; defines no new learning signal (reads spec-01/03/12 fields only).
- [ ] `./node_modules/.bin/vitest run src/analytics/efficacy.test.ts` green (all 8 cases, incl. null-floor, transfer
      subset, A-B delta null-on-either-side, cohort-absent exclusion, dimension omit-undefined).
- [ ] The BigQuery-export dependency is **documented and requested** (§3.2 / Step 5) with portable pseudo-SQL whose
      GROUP BYs match the Step-1/2 dimensions; the TS reference impl and SQL compute the same formula on the §5 fixture.
- [ ] The §3.3 **tuning process** is documented with: constants in scope (SM-2 D4 + governor D9), the trigger threshold
      (≥200 first-delayed reviews + stabilized + off the ~85% band), the one-lever-at-a-time procedure, the
      guardrail-revert rule, and a **named owner** (the plan DRI). The §3.5 **Tuning Log** table exists (empty at ship).
- [ ] The §3.4 holdout/A-B hook reads spec-05's `cohort` and reports **between-cohort deltas**; fail-absent excludes
      unassigned learners (no silent fold into treatment).
- [ ] **No new Firestore document or index** added (R4); no scheduled Function / push (D14); `git diff --stat` shows only
      `src/analytics/*` (+ the docs note). `tsx scripts/validate-fixtures.ts` passes.
- [ ] `./node_modules/.bin/eslint src/analytics/efficacy.ts src/analytics/efficacy.test.ts src/analytics/events.ts`
      passes; project typecheck clean on touched files.
- [ ] The consume-don't-fork invariant holds: no Brier/mastery/retrieval-rep recomputation (R2); spec-12's
      `overconfidence` is taken as input.
