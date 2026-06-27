# Efficacy rollup dependency + tuning procedure (spec-04 §3.2 / §3.3 / §3.5)

This is the **human-process half** of [spec-04](spec-04-efficacy-measurement.md). The TS half ships in
`src/analytics/efficacy.ts` (the pure metric formulas, the single source of truth) + the `cohort` / `track` /
`milestoneEarned.kind` analytics dimensions in `src/analytics/events.ts`. This note (a) **requests** the data-source
dependency the repo does not have today, (b) carries the **portable pseudo-SQL** for each metric (whose GROUP BYs are
exactly the analytics dimensions), and (c) records the **tuning procedure** + the empty **Tuning Log**.

No code, no Firestore document, no scheduled Function, no push (D14). Aggregation lives in the export, not the app.

---

## 1. The rollup dependency — REQUEST: enable Firebase Analytics → BigQuery export

The §3.1 metrics are cross-learner aggregates over time — a query engine's job, a poor fit for a Firestore counter
doc (no GROUP BY; would need the fan-in scheduled writer D14 forbids). The chosen home is the **Firebase Analytics →
BigQuery export**:

- **Action required (project-config, not repo code):** enable the BigQuery export for the Firebase project in the
  Firebase console (Project Settings → Integrations → BigQuery). This is a toggle the repo does **not** have today
  (spec-04 §2 — no `bigquery` references anywhere). Until it is on, the §3.1 metrics run only via the offline fallback
  below.
- **Owner:** the learning-science / DRI owner of `docs/learning-science/` (the same owner who runs the §3 tuning loop).
- **Privacy (README §4.6):** the export inherits the project's analytics retention; outputs are **aggregate /
  cohort-level**, never a new per-learner sink, never a gate (D11). **No audio, ever.** The cascade-delete path
  (spec-05) covers the per-learner inputs this spec reads; the export adds nothing for it to delete.
- **Fallback if the export is declined:** a one-off admin script reads the Firestore subcollections
  (`reviews/{cardId}`, `calibration/summary`) + the analytics events, shapes them into the
  `ReviewEventRow` / `MilestoneRow` / `CalibrationRow` row-sets, and runs the **same** `src/analytics/efficacy.ts`
  formulas. The pure TS module is the contract; the data source (BigQuery vs offline read) is swappable behind it.

The pure TS reference impl (`src/analytics/efficacy.ts`) and the SQL below compute the **same formula** on the same
row-set; the §5 fixture tests in `src/analytics/efficacy.test.ts` pin the TS side.

---

## 2. Portable pseudo-SQL (GROUP BYs = the Step-1/2 dimensions: `cohort`, `track`, `kind`)

`W` = the trailing window (default 28 days). Every rate is `NULL` below `MIN_EFFICACY_N` (= 20) per cohort×window —
the SQL mirrors the TS null-floor via the `HAVING` clause. The control arm is `cohort = 'holdout'` (README §4.5; there
is **no `'control'` literal**).

The per-review **outcome event** (spec-01) is the source for metrics 1/2 — one row per review, carrying the
server-graded `result` and the **elapsed** `intervalDays`. It is **not** the `reviews/{cardId}` snapshot (a snapshot's
`lastResult` is only the latest result and `reps/lapses` is not a review counter — spec-01 resets `reps=0` on FAIL — so
a snapshot cannot recover the **first** review's result).

```sql
-- Metric 1 — delayed-retrieval pass rate (headline durability).
-- "First delayed review per card" = earliest event (by event_ts) with elapsed interval_days >= 1.
WITH first_delayed AS (
  SELECT cardId, cohort, track, result,
         ROW_NUMBER() OVER (PARTITION BY cardId ORDER BY event_ts ASC) AS rn
  FROM review_outcome_events
  WHERE interval_days >= 1                      -- exclude same-session re-asks
    AND event_ts >= @window_start
)
SELECT cohort, track,
       COUNTIF(result = 'pass') / COUNT(*)      AS pass_rate
FROM first_delayed
WHERE rn = 1                                    -- first delayed review per card only
GROUP BY cohort, track
HAVING COUNT(*) >= 20;                          -- MIN_EFFICACY_N null-floor

-- Metric 2 — transfer pass rate. Identical, restricted to held-out transfer cards.
-- ... same as metric 1 with an added `AND is_transfer = TRUE` in the first_delayed CTE.

-- Metric 3 — gold-mint rate. (delayed_gold + transfer_gold) / silver, by `kind`.
SELECT cohort, track,
       COUNTIF(kind IN ('delayed_gold','transfer_gold'))
         / NULLIF(COUNTIF(kind = 'silver'), 0)  AS gold_mint_rate
FROM milestone_earned_events
WHERE event_ts >= @window_start
GROUP BY cohort, track
HAVING COUNTIF(kind = 'silver') >= 20;          -- floor on the silver denominator

-- Metric 4 — calibration cohort overconfidence (CONSUMED from spec-12, never recomputed).
-- `overconfidence` = spec-12's meanConfidence - accuracy; reliable = n >= MIN_CALIBRATION_N.
SELECT cohort, track, AVG(overconfidence) AS cohort_overconfidence
FROM calibration_summaries
WHERE reliable = TRUE AND overconfidence IS NOT NULL
GROUP BY cohort, track
HAVING COUNT(*) >= 20;

-- Metric 5a — queue-completion guardrail.
SELECT cohort, track,
       SUM(reviewed) / NULLIF(SUM(surfaced), 0) AS queue_completion_rate
FROM queue_rows               -- surfaced = review_recommended_shown; reviewed = retrieval_rep src='review'
WHERE event_ts >= @window_start
GROUP BY cohort, track
HAVING SUM(surfaced) >= 20;

-- Metric 5b — retrieval-reps per learner per 7 days (informational guardrail).
SELECT cohort, track, COUNT(*) / COUNT(DISTINCT uid) AS reps_per_learner
FROM retrieval_rep_events
WHERE event_ts >= @week_start
GROUP BY cohort, track
HAVING COUNT(DISTINCT uid) >= 20;
```

**A-B read (§3.4):** run any metric query, then take the **between-cohort delta**
`Δ = treatment − holdout` over the same window. `delta` is undefined (skip the experiment read) if **either** arm is
below the floor — the TS `abDelta()` enforces this (null if either side null). Rows with `cohort` absent (spec-05 not
yet shipped or assignment failed) are **excluded** from both arms — fail-absent — never folded into treatment; a
treatment-only **descriptive** read (labeled "no holdout — descriptive only") is still produced pre-spec-05.

---

## 3. The tuning process (closes the D4 / D9 "revisit with retention data" loop)

**Constants in scope (the only things this loop re-tunes):**

- **SM-2 (D4)** — `src/progress/scheduling.ts` (spec-01) + the SM-2 advance body (spec-10): init ease `2.5`, ease
  floor `1.3`, wrong-penalty `−0.20`, right-bonus `+0.10`, reset-interval `1d`, interview-date anchoring caps.
- **Governor band (D9)** — the difficulty governor (spec-21): `EASIER_BELOW` (~50%), `HARDER_ABOVE` (~85%), and the
  ~50–70% target band.

Both ship as **placeholders in code with a comment pointing here** until the first re-tune.

**Trigger threshold (a re-tune is allowed only when BOTH hold for a cohort):**

1. **Sufficient + stable data:** the metric-1 denominator has `firstDelayedReviews >= 200` for the cohort (above
   `MIN_EFFICACY_N`; 200 is the lower bound for a stable rate at the per-constant grain — itself a revisable
   placeholder), **and** the rate has stabilized (two consecutive 28-day windows moving < 3 absolute pts).
2. **Off-target signal:** the first-delayed pass rate is outside the desirable-difficulty band. Target ≈ **85%**
   ("successful but effortful" retrieval). Pass rate **> 90%** → intervals too short → **lengthen** (raise right-bonus /
   init ease); **< 80%** → too long → **shorten** (lower init ease / raise wrong-penalty). The governor band re-tunes on
   the **same** rolling-success signal but scoped to **scaffolding** not spacing: if the acted-on cohort sits
   persistently outside ~50–70% *despite acting*, move `EASIER_BELOW` / `HARDER_ABOVE`.

**Procedure (offline, human-owned):**

1. Pull §3.1 metrics per cohort×window from the rollup.
2. If the trigger holds, propose a **single** constant delta — never move SM-2 **and** the governor in the same cycle,
   so the next window attributes the change.
3. Change the constant **only** in its pure module, behind the existing flag (spec-05); ship to the **treatment**
   cohort and leave the **`holdout`** cohort on the prior constant.
4. Re-measure for **≥ 2 windows**; keep the change iff durability improves with **no guardrail regression** (metric 5)
   beyond threshold — **revert** if queue-completion drops > 10 pts or streak-median drops > 1 day.

**Owner:** the **learning-science / DRI owner** of this plan (the human maintaining `docs/learning-science/`). This is
**not** an automated job — assigning a human owner is the point of closing D4/D9 ("revisit," not "auto-optimize").
Each change is recorded as a §4 Tuning-Log row + a one-line ADR addendum (D16 housekeeping style).

**Dimension setter call sites (spec-04 Step 6 — coordination, not force-wired here):**
`setAnalyticsDimensions({ cohort })` is called once per session by **spec-05** when it has the assignment;
`setAnalyticsDimensions({ track })` is called by the track context (**spec-10/20**). Live wiring is left to those
specs to avoid speculative coupling; this spec only defines the setter + the omit-undefined contract.

---

## 4. Tuning Log

Dated, append-only. Empty at ship — the constants ship as placeholders.
Columns: `date | constant | old → new | cohort | metric before | metric after | owner | reverted?`

| date | constant | old → new | cohort | metric before | metric after | owner | reverted? |
|---|---|---|---|---|---|---|---|
| — | (none yet — constants ship as placeholders) | — | — | — | — | — | — |
