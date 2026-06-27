# spec-23 — Interview report: feed-forward fix cards + calibration delta (remove hireSignal)

**Status:** Planned
**Phase:** Phase 2 (Surfaces)
**Depends-on:** [`spec-12-calibration-scoring.md`](spec-12-calibration-scoring.md) (the per-attempt `calibration` block + trend doc this report renders), [`spec-22-brutal-mock-and-rubric-fairness.md`](spec-22-brutal-mock-and-rubric-fairness.md) (both edit the grader output / `functions/src/interview.ts` — sequence/merge carefully)
**Implements:** brainlift app-action **#6** ("the interview report"); locked decision **D11** (hire signal removed entirely); [`ADR-0010`](../adr/0010-remove-interview-hire-signal-feedforward-report.md) (supersedes the hire-signal parts of ADR-0008).

> Read [`README.md`](README.md) §1, §3 (D11), §4 Foundation C, §8 (R4) and [`ADR-0010`](../adr/0010-remove-interview-hire-signal-feedforward-report.md) first.
> This spec **removes** the `hireSignal` verdict end-to-end (grader schema, attempt field, types, UI, analytics, "best attempt" selector) and **adds** the feed-forward presentation: the five rubric dimensions rendered as "next fix" cards plus the predicted-vs-measured calibration delta produced by spec-12. It does **not** compute calibration (spec-12 owns the maths/storage) and does **not** change the grader's `dimensions`/`summary`/`strengths`/`fixes` content (spec-22 owns rubric/tier fairness).

---

## 1. Goal & non-goals

**Goal.** Make the capstone-interview report **feed-forward, not a verdict** (ADR-0010 / D11). Concretely: delete the `HireSignal` type and the `hireSignal` field from the grader's structured output, the attempt doc, the client types, the analytics event, and the report UI; render `report.dimensions` as actionable **"next fix" cards** and surface the **predicted-vs-measured calibration delta** (from spec-12's `calibration` block) on the quant-intensity gate; and **replace the "best attempt" selector key** (no more numeric hire-signal rank) with **mean rubric score** (justified in §3.4).

**Non-goals.**
- **Computing calibration** — spec-12 owns `scoreCalibration`, the attempt `calibration` block, and `users/{uid}/calibration/summary`. This spec only *reads/renders* them.
- **Changing the grader's rubric content** — the per-dimension `score`/`evidence`, `summary`, `strengths`, `fixes`, and tier-aware scaling are owned by spec-22. This spec only removes `hireSignal` from the grader's schema + validation.
- **New surfaces** — no new page/route; the report renders where it already does (`InterviewReportView` inside `InterviewPage`, plus the `/dev/interview` harness if present).
- **Confidence capture** — spec-02; calibration scoring — spec-12.

---

## 2. Current reality (verified)

`hireSignal` is woven through **eight** files. All refs verified by `grep -rn "hireSignal\|HireSignal" src/ functions/`:

- **Grader structured-output schema** — `functions/src/interview.ts:342-345` (`hireSignal` enum property), `:350` (`hireSignal` in `required`). The grader is the OpenAI Responses API call at `:444-455` using `INTERVIEW_REPORT_SCHEMA` (`:327-363`).
- **Grader output validation** — `functions/src/interview.ts:468`: `if (!report.hireSignal || !report.dimensions …) throw 'incomplete report'`.
- **Attempt finalize write** — `functions/src/interview.ts:491`: `hireSignal: report.hireSignal` written onto the attempt doc inside the finalize transaction (`:485-497`).
- **`InterviewReport` / `HireSignal` types** — defined **twice** (the functions↔src split): `functions/src/interviewPack.ts:118-125` (`HireSignal` union with numeric comments) + `:126-141` (`InterviewReport` with `hireSignal: HireSignal`); byte-mirror at `src/content/interviewPack.ts:118` + `:139`. Re-exported to the interview UI via `src/interview/functions.ts:11-19`.
- **Attempt read schema + "best attempt" selector** — `src/interview/attempts.ts:13-28` (`InterviewAttemptSchema` carries `hireSignal?`), `:69-77` (`HIRE_RANK` numeric map mirroring the README ordering), `:89-102` (`selectBest` ranks graded attempts by `HIRE_RANK[hireSignal]`). `selectLatest` (`:80-87`) does **not** use `hireSignal`. **Verified: `selectBest` has no production call site** — `grep -rn "selectBest" src/ functions/` returns only `attempts.ts` (def) + `attempts.test.ts`. It is exported, tested, but unused in any `.tsx`. (R9: tested ≠ live.)
- **Report UI** — `src/interview/InterviewReportView.tsx:6` (imports `HireSignal`), `:24-26` (`signalSlug`), `:54-56` (renders `<div className="iv-signal …">{report.hireSignal}</div>`). The five dimensions already render as cards (`:60-73`) and `fixes` already render as a "To improve" list (`:86-95`).
- **Analytics** — `src/analytics/events.ts:121-126`: `interviewCompleted` carries `hireSignal: string`; fired at `src/interview/useRealtimeInterview.ts:688-693` with `hireSignal: gradeReport.hireSignal`.
- **Demo bot (`functions/`, run via `npm run interview:demo` / tsx)** — `functions/scripts/interview-demo-bot.ts` reads `report.hireSignal` at `:646` (the `report.md` artifact's "Hire Signal" line), `:712` (the `hireRow` cell in `comparison.md`, joined into the table array at `:727`), and `:836` (a `console.log`). It types `report` via `InterviewReport` imported from `../src/interviewPack` (`:17`). After the type removal (§3.2) these three reads type-error, and — critically — this file lives under `functions/`, so the step-13 global sweep / DoD grep `grep -rn hireSignal … functions/` is **unsatisfiable** unless it is edited too (handled at step 10). It is not a test; it is a CLI artifact generator.
- **Docs** — `docs/capstone-interview/README.md`: attempt-doc layout `:96` (`hireSignal?: HireSignal`), finalize step `:295`, `HireSignal` type `:305-311` ("numeric mapping used for 'best attempt' selection"), `InterviewReport` `:318-330` (`hireSignal: HireSignal`), analytics row `:375` (`interview_completed … hireSignal`).
- **Tests** — `functions/src/interview.grade.test.ts:38,42` (a fixture JSON string `'{"hireSignal":"Yes"}'` for `extractGradeJson`), `src/interview/attempts.test.ts` (~13 refs — the whole `selectBest` suite), `src/interview/InterviewReportView.test.tsx:31` (`hireSignal: 'Lean Yes'` in the fixture report).

**Report data flow (verified — important for calibration rendering).** The report shown in the UI comes from the **`gradeInterview` return value**, not a Firestore doc load: `useRealtimeInterview.ts:682` destructures `{ report } = await gradeInterview(...)`, `:694` `setReport(gradeReport)`; `InterviewPage.tsx:270-291` renders `<InterviewReportView report={report} …>`. `GradeInterviewOutput` is `{ report, attemptId }` (`functions/src/interview.ts:320-323`; mirror `src/interview/functions.ts:43-46`). spec-12 writes `calibration` onto the **attempt doc**, but the UI never loads that doc. **Consequence:** to render the calibration delta in v1 without adding a doc subscription, `gradeInterview` must **also return** the per-attempt `calibration` in its output (additive — §3.3). The cross-concept trend (`users/{uid}/calibration/summary`) is read via spec-12's `loadCalibrationSummary` selector if the report wants the "over time" line (optional, gated below).

**ADR-0010 already exists** (`docs/adr/0010-remove-interview-hire-signal-feedforward-report.md`) and names this spec as its implementer. The CONTEXT.md "Hire signal" retirement is D16/housekeeping, not this spec.

**spec-12 contract this spec consumes** (spec-12 §3.2-3.4, §9): the attempt `calibration` block and the trend doc are `CalibrationResult`-shaped: `{ n, brier, meanConfidence, accuracy, overconfidence }` (all `number | null`). The **predicted-vs-measured delta is `overconfidence` = meanConfidence − accuracy** (>0 overconfident). spec-12 only writes the block when confidence items exist (Track A no-confidence ⇒ no block).

---

## 3. Design

The change is **mechanical deletion** of `hireSignal` everywhere + **two additive surfaces** (fix cards framing, calibration delta). Reference shapes by name; do not redefine spec-12's `CalibrationResult`.

### 3.1 Remove `hireSignal` from the grader contract

- Delete the `hireSignal` property from `INTERVIEW_REPORT_SCHEMA.properties` and from its `required` array (`functions/src/interview.ts:342-345`, `:350`). The schema is `strict` with `additionalProperties:false`, so the grader will no longer emit it.

  **Shared `required`-array merge with spec-22 (authoritative — README §5 / §4.5).** This file's `required` is `['dimensions', 'hireSignal', 'summary', 'strengths', 'fixes']` today (verified `functions/src/interview.ts:350`). Two specs edit it additively: **spec-22 ADDS** `tier` and `pressureNote` (the `InterviewReport.tier`/`InterviewReport.pressureNote` fields, README §4.5); **spec-23 (this spec) REMOVES** `hireSignal`. The **final post-merge `required` set is exactly** `['dimensions', 'summary', 'strengths', 'fixes', 'tier', 'pressureNote']` (order not significant; element set is). Apply your delta surgically — remove only the `hireSignal` string; do **not** touch/re-list spec-22's `tier`/`pressureNote` entries (whether or not spec-22 has landed yet). If spec-22 lands first, your edit leaves `tier`/`pressureNote` intact; if this spec lands first, spec-22 appends them to the post-removal array. Mirror the same removal in the `INTERVIEW_REPORT_SCHEMA.properties` object (drop the `hireSignal` property only).
- Update the post-parse guard (`:468`) to no longer test `report.hireSignal` — assert `report.dimensions` only.
- Delete `hireSignal: report.hireSignal` from the finalize `tx.set` (`:491`).

### 3.2 Remove the `HireSignal` type + `hireSignal` field everywhere

- `functions/src/interviewPack.ts` **and** `src/content/interviewPack.ts` (byte-mirrors — change both identically; there is a drift guard test): delete the `HireSignal` union (`:118-125`) and the `hireSignal: HireSignal` line from `InterviewReport` (`:139`).
- `src/interview/functions.ts:11-19`: drop `HireSignal` from the import + `export type` lines.
- `src/interview/attempts.ts`: remove `hireSignal` from `InterviewAttemptSchema` (`:22-24`), delete `HIRE_RANK` (`:69-77`), and rewrite `selectBest` (§3.4).

### 3.3 Return per-attempt calibration from `gradeInterview` (additive)

spec-12 writes `calibration` onto the attempt doc inside the finalize transaction. To render it in the UI (which reads the function return, not the doc — §2), make `gradeInterview` **also return it**:

```ts
// functions/src/interview.ts — GradeInterviewOutput
interface GradeInterviewOutput {
  report: InterviewReport
  attemptId: string
  calibration?: CalibrationResult   // ← NEW (from spec-12 scoreCalibration; absent for Track A no-confidence)
}
// ...and at the end of gradeInterview, return { report, attemptId, calibration: cal }
//    where `cal` is the spec-12 scoreCalibration result already computed for the attempt write.
```

Mirror the optional field into `src/interview/functions.ts` `GradeInterviewOutput` (import `CalibrationResult` from `src/progress/calibration.ts`). `calibration` is **optional** so Track A (no confidence captured ⇒ spec-12 writes no block) returns `undefined` and the UI simply omits the calibration section.

> Coordination note (spec-12 ↔ spec-23): spec-12 step 5 computes `const cal = scoreCalibration(items)` and writes it onto the attempt. This spec adds `cal` to the **return value**. If spec-12 lands first, `cal` already exists in scope — this spec only widens `GradeInterviewOutput` and adds it to the `return`. If this spec lands first, it must not reference `cal` until spec-12 provides it; build order (README §7) puts spec-12 in Phase 1, before this Phase-2 spec, so `cal` exists. → flag for the consistency gate.

### 3.4 Replace the "best attempt" selector key — **mean rubric score** (chosen)

`selectBest` ranked by `HIRE_RANK[hireSignal]`. Pick the replacement key:

| Option | Verdict |
|---|---|
| **Mean of the five dimension scores** (`(correctness+approach+rigor+communication+speed)/5`, each 1..5) | **Chosen.** Always present on a graded attempt (the grader always returns all five `dimensions` — schema `required` at `interview.ts:339`), survives `hireSignal` removal, needs no confidence capture (works for Track A), and is the closest honest "how did this attempt go" number. Tie-break by most-recent `createdAt` (stable, deterministic). |
| **Best calibration** (lowest Brier / smallest `|overconfidence|`) | Rejected as the *primary* key: `calibration` is **absent for Track A** (no confidence captured) and is `n`-tiny per single-question attempt (spec-12 §2). It is a *quality of self-assessment* signal, not "best performance" — wrong semantics for "best attempt." |

`selectBest` reads `report.dimensions` off the attempt. The attempt read schema currently stores `report` as `z.unknown().optional()` (`attempts.ts:25`). Add a minimal typed parse for the five dimension scores so the selector is type-safe (do not re-validate the whole report). Sketch:

```ts
// src/interview/attempts.ts
const DIM_KEYS = ['correctness', 'approach', 'rigor', 'communication', 'speed'] as const

/** Mean of the five 1..5 dimension scores; null if the report shape is unusable. */
function meanRubricScore(a: InterviewAttempt): number | null {
  const dims = (a.report as { dimensions?: Record<string, { score?: number }> } | undefined)?.dimensions
  if (!dims) return null
  let sum = 0
  for (const k of DIM_KEYS) {
    const s = dims[k]?.score
    if (typeof s !== 'number') return null
    sum += s
  }
  return sum / DIM_KEYS.length
}

/** Best graded attempt by mean rubric score; ties broken by most-recent. null if none graded. */
export function selectBest(attempts: InterviewAttempt[]): InterviewAttempt | null {
  const graded = attempts.filter((a) => a.status === 'graded' && meanRubricScore(a) != null)
  if (graded.length === 0) return null
  return graded.reduce((a, b) => {
    const sa = meanRubricScore(a)!, sb = meanRubricScore(b)!
    if (sa !== sb) return sa >= sb ? a : b
    return toMs(a.createdAt) >= toMs(b.createdAt) ? a : b // tie → most recent
  })
}
```

`toMs` already exists (`attempts.ts:104-110`). `selectLatest` is unchanged.

### 3.5 Report UI — fix cards + calibration delta

`InterviewReportView.tsx`:
- **Delete** the `signalSlug` helper (`:24-26`) and the `<div className="iv-signal …">{report.hireSignal}</div>` block (`:53-56`) and the `HireSignal` import (`:6`).
- **Reframe dimensions as "next fix" cards.** The five-dimension block already renders score pips + an evidence blockquote (`:60-73`). Keep the structure; relabel the section heading to a feed-forward frame ("What to work on next" / "Next fixes") and keep the `summary` line as the lede. (No content change to the grader output; this is presentation. Heading copy + the existing `fixes` "To improve" list (`:86-95`) carry the actionable framing.) Keep `strengths` (`:75-84`).
- **Add the calibration delta** below the summary, **only when `calibration` is present and gated to the quant-intensity gate** (§5). Render a single honest sentence from `overconfidence`:

```tsx
// props: add `calibration?: CalibrationResult` and `showCalibration: boolean`
{showCalibration && calibration && calibration.n > 0 && calibration.overconfidence != null && (
  <div className="iv-calibration">
    <h3 className="iv-feedback__heading">Calibration</h3>
    <p>{calibrationSentence(calibration)}</p>
  </div>
)}
```

```ts
// calibrationSentence: predicted-vs-measured delta in plain words.
function calibrationSentence(c: CalibrationResult): string {
  const conf = Math.round((c.meanConfidence ?? 0) * 100)
  const acc = Math.round((c.accuracy ?? 0) * 100)
  const d = c.overconfidence ?? 0
  if (Math.abs(d) < 0.1) return `Well calibrated — you predicted ${conf}% and performed at ${acc}%.`
  return d > 0
    ? `You felt ${conf}% ready but performed at ${acc}% — watch for overconfidence.`
    : `You performed at ${acc}% but only felt ${conf}% ready — you can trust yourself more.`
}
```

The 10-point threshold and copy are illustrative; keep one short, non-judgmental sentence. **No verdict, no person-level label** (ADR-0010 rationale).

### 3.6 Plumb `calibration` + the track flag to the view

- `useRealtimeInterview.ts`: capture `calibration` from the `gradeInterview` return (`:682`) into state alongside `report`; expose it.
- `src/pages/InterviewPage.tsx` (the live path; `App.tsx:163` renders `<InterviewPage navigate conceptId>` and `DevInterviewPage.tsx` renders it with a stub transport — neither passes `uid`/`userDoc`): call the existing **`useAuth()`** context hook (`src/auth/authContext.ts:40`) inside the component to read `userDoc`, compute `showCalibration = isQuantIntensity(userDoc)` from it (§5; the README §4 shared helper, **not** an inlined predicate), and pass `calibration` + `showCalibration` to `<InterviewReportView>` at `:284-289`. **Do not** try to derive the gate from `useRealtimeInterview`'s `track` — those are WebRTC media tracks, not the learner track.

---

## 4. Step-by-step implementation

1. **Confirm spec-12 has landed.** `grep -n "calibration" functions/src/interview.ts` shows the attempt write; `src/progress/calibration.ts` exports `CalibrationResult`. If absent, **stop and build spec-12 first** (R5 — never stub a foundation). Also confirm whether spec-22 has touched `INTERVIEW_REPORT_SCHEMA` / the grader output to merge cleanly.
   → verify: `CalibrationResult` is importable; you know spec-22's state of `functions/src/interview.ts`.

2. **Grader schema + validation + write (`functions/src/interview.ts`).** Delete the `hireSignal` property (`:342-345`) and its `required` entry (`:350`); fix the post-parse guard (`:468`) to test only `report.dimensions`; delete `hireSignal: report.hireSignal` from the finalize `tx.set` (`:491`).
   → verify: `grep -n hireSignal functions/src/interview.ts` returns **nothing**; `cd functions && ./node_modules/.bin/tsc --noEmit` (or repo functions build) passes.

3. **Return calibration from `gradeInterview` (§3.3).** Widen `GradeInterviewOutput` (`:320-323`) with `calibration?: CalibrationResult` (import the type from spec-12's module per the functions↔src boundary spec-12 step 2 resolved); add `calibration: cal` to the final `return` (`:524`).
   → verify: functions build passes; the return includes `calibration`.

4. **Types (`functions/src/interviewPack.ts` + `src/content/interviewPack.ts` — both).** Delete the `HireSignal` union and the `hireSignal: HireSignal` line in `InterviewReport`. Keep the files byte-identical (there is a drift guard test).
   → verify: `diff <(sed -n '1,200p' functions/src/interviewPack.ts) <(sed -n '1,200p' src/content/interviewPack.ts)` shows no diff in the changed region; `grep -n HireSignal src/content/interviewPack.ts functions/src/interviewPack.ts` is empty; the interviewPack drift test passes.

5. **Client function wrapper (`src/interview/functions.ts`).** Remove `HireSignal` from the import + `export type` (`:11-19`); add `calibration?: CalibrationResult` to the `GradeInterviewOutput` type (`:43-46`), importing `CalibrationResult` from `../progress/calibration`.
   → verify: `grep -n HireSignal src/interview/functions.ts` empty; lint passes.

6. **Attempt read schema + `selectBest` (`src/interview/attempts.ts`).** Remove `hireSignal` from `InterviewAttemptSchema` (`:22-24`); delete `HIRE_RANK` (`:69-77`); replace `selectBest` with the mean-rubric-score version (§3.4); add `meanRubricScore` + `DIM_KEYS`. `selectLatest` unchanged.
   → verify: `grep -n hireSignal src/interview/attempts.ts` empty; lint passes.

7. **Report UI (`src/interview/InterviewReportView.tsx`).** Remove the `HireSignal` import (`:6`), `signalSlug` (`:24-26`), and the `iv-signal` block (`:53-56`). Add `calibration?: CalibrationResult` + `showCalibration: boolean` to props; render the calibration section (§3.5) gated on `showCalibration && calibration?.n`; relabel the dimensions section heading to the feed-forward frame. Add `calibrationSentence`.
   → verify: `grep -n "hireSignal\|signalSlug\|iv-signal" src/interview/InterviewReportView.tsx` empty; lint passes.

8. **Plumb through the hook + page (§3.6).** `useRealtimeInterview.ts`: store `calibration` from the `gradeInterview` return (`:682-694`) and expose it on the hook's return (`:731-739`). `src/pages/InterviewPage.tsx`: add `const { userDoc } = useAuth()` (import from `../auth/authContext`) and `import { isQuantIntensity } from '../auth/track'`, compute `const showCalibration = isQuantIntensity(userDoc)` (§5 — the README §4 shared helper; **do not** re-derive from `defaultTrack`/`learningGoal` inline; note the helper defaults a `null`/track-less userDoc to `'B'` ⇒ `true`, so the second render guard `calibration && calibration.n > 0` is what actually hides the section for not-yet-onboarded learners — see §5), and pass `calibration` + `showCalibration` to `<InterviewReportView>` (`:284-289`). Interview reports are not per-concept, so call `isQuantIntensity(userDoc)` with no `conceptProgress` arg — the helper falls back to `userDoc.defaultTrack ?? 'B'`.
   → verify: TypeScript build clean; `npx tsc --noEmit` (or the repo's typecheck) passes; `grep -n "isQuantIntensity\|showCalibration" src/pages/InterviewPage.tsx` shows the gate is wired through the helper from `userDoc`.

9. **Analytics (`src/analytics/events.ts` + caller).** Remove `hireSignal: string` from `interviewCompleted`'s param type (`:121-126`); **replace it** with `meanScore: number` (the same mean-rubric-score, computed at the call site) so completion is still measurable without a verdict. Update the caller `useRealtimeInterview.ts:688-693` to pass `meanScore` (compute from `gradeReport.dimensions`) instead of `hireSignal`.
   → verify: `grep -rn "hireSignal" src/analytics src/interview/useRealtimeInterview.ts` empty; lint passes.

10. **Demo bot (`functions/scripts/interview-demo-bot.ts`).** This tsx CLI (run by `npm run interview:demo`) types its graded `report` via `InterviewReport`, so it must drop the three `hireSignal` reads after §3.2: delete the `` `**Hire Signal:** ${report.hireSignal}` `` line + its trailing `''` from the `report.md` block (`:646-647`); delete the `hireRow` const (`:712`) and remove the `hireRow,` entry from the `comparison.md` array (`:727`); delete the `console.log(... Hire signal: ${report.hireSignal})` line (`:836`). No other behavior changes — the `dimensions`/`summary`/`strengths`/`fixes` artifacts are untouched.
   → verify: `grep -n hireSignal functions/scripts/interview-demo-bot.ts` empty; `cd functions && ./node_modules/.bin/tsc --noEmit` passes (the script is type-checked under the functions project).

11. **Tests** (§7): rewrite `attempts.test.ts`'s `selectBest` suite for mean-rubric-score; update `InterviewReportView.test.tsx` fixture (drop `hireSignal`, assert no verdict text, assert calibration renders when passed + hidden for Track A); fix `interview.grade.test.ts:38,42` fixture string (drop `hireSignal`); add a grader-schema test asserting `hireSignal` is not in `INTERVIEW_REPORT_SCHEMA`.
   → verify: `./node_modules/.bin/vitest run src/interview functions/src/interview.grade.test.ts` green.

12. **Docs (`docs/capstone-interview/README.md`).** Add a supersede note at the top of the Report/turn-types section pointing to ADR-0010 + this spec; remove `hireSignal` from the attempt-doc layout (`:96`), the finalize step (`:295`), the `HireSignal` type block (`:305-311`), the `InterviewReport` interface (`:326`); change "best attempt = numeric hireSignal mapping" to "best attempt = mean rubric score"; update the `interview_completed` analytics row (`:375`) to `{ conceptId, questionId, durationSec, meanScore }`; note calibration is now a report output.
   → verify: `grep -n "hireSignal\|HireSignal" docs/capstone-interview/README.md` empty; the supersede note references `docs/adr/0010-...` and `spec-23`.

13. **Global sweep (foolproofing).** `grep -rn "hireSignal\|HireSignal\|HIRE_RANK\|signalSlug\|iv-signal" src/ functions/ docs/` — expect **zero** hits outside this spec file (note `functions/scripts/` is in scope — the demo bot at step 10 is the last `functions/` holdout). Remove any dangling CSS for `.iv-signal*` if present.
    → verify: the grep is empty (clean supersede of the ADR-0008 shared contract).

14. **Run the full gate** (Definition of Done §10).

---

## 5. Two-track behavior

`hireSignal` removal and feed-forward fix cards apply to **all tracks** (the verdict is gone for everyone — D11). The **calibration delta is gated to the quant-intensity gate**:

| | Track A (gentle) | Quant-intensity gate (`isQuantIntensity(userDoc)` — README §4 helper) |
|---|---|---|
| **Verdict** | None (removed). | None (removed). |
| **Fix cards** | Shown (five dimensions reframed as next-fixes + `fixes` list + `strengths`). | Shown (same). |
| **Calibration delta** | **Hidden** (`showCalibration = false`). spec-12 also captures no confidence for Track A, so `calibration` is typically `undefined` anyway — the gate is belt-and-suspenders. | **Shown** (`showCalibration = true`): the predicted-vs-measured sentence from `calibration.overconfidence`; spec-12's `hardItemCalibrationBonus` may power "stayed humble and right on the brutal one" copy (optional, spec-12 exposes it). |

**Computing `showCalibration` (concrete, wired path).** The gate is the **shared `isQuantIntensity` helper** (README §4, `src/auth/track.ts`) — spec-23 imports it and does **not** re-derive the predicate from `defaultTrack`/`learningGoal` (gate Issue #9: a learner must never be quant-gated in one surface and gentle in another). The gate input comes entirely from the **`userDoc`** profile, which `InterviewPage` obtains from the existing **`useAuth()`** context (`src/auth/authContext.ts:40`; `AuthContextValue.userDoc: UserDoc | null` at `:23`). The helper internally reads the real, optional `UserDoc` fields (`src/auth/userDoc.ts:24-29`) `learningGoal?: 'interview' | …` and `defaultTrack?: 'A' | 'B'` (the persisted track that `comfortToDefaultTrack` in `src/pages/onboarding.model.ts:13-14` writes at onboarding — the stored learner track, **not** the WebRTC `track` identifiers in `useRealtimeInterview`). The call:

```ts
// src/pages/InterviewPage.tsx
import { useAuth } from '../auth/authContext'
import { isQuantIntensity } from '../auth/track'
// …inside InterviewPage:
const { userDoc } = useAuth()
// Interview reports are not per-concept ⇒ no conceptProgress arg; helper falls back to defaultTrack ?? 'B'.
const showCalibration = isQuantIntensity(userDoc)
```

The helper's contract (README §4): `effectiveTrack = conceptProgress?.track ?? userDoc?.defaultTrack ?? 'B'`, then `track === 'B' || userDoc?.learningGoal === 'interview'`. No new gate field, no `uid` lookup, no `loadTrack` call (D13: intensity-gating reuses existing `learningGoal`/track). `userDoc` may be `null` (not yet onboarded) ⇒ the helper short-circuits its `userDoc?.…` reads, but note the **default-`'B'` fallback** means a `null` userDoc yields `true`; pass through the `null` userDoc as-is and rely on the second render guard (`calibration && calibration.n > 0`) — a not-yet-onboarded learner has captured no confidence, so no `calibration` block is returned and the section stays hidden. The dev harness (`DevInterviewPage.tsx`) renders under the same `AuthProvider`, so `useAuth()` resolves there too; if it mounts without a `userDoc`, calibration is simply hidden (and the §7 `/dev` check passes a mock `calibration` + `showCalibration` directly into `InterviewReportView` to exercise the shown path).

> Render guard is double-safe: `showCalibration && calibration && calibration.n > 0`. A Track-A attempt with no confidence never renders the section even if `showCalibration` were true.

---

## 6. Data / schema deltas

Only deltas; shared calibration shapes live in spec-12 (§3.3/§9), not redefined here.

- **REMOVED — grader structured-output field** `INTERVIEW_REPORT_SCHEMA.hireSignal` (property + `required` entry). The grader no longer emits a verdict. **Shared `required` merge (README §5):** spec-22 adds `tier`/`pressureNote`; this spec removes `hireSignal`; final `required` = `['dimensions', 'summary', 'strengths', 'fixes', 'tier', 'pressureNote']`. Apply additively — remove only `hireSignal`, never re-list spec-22's additions (§3.1).
- **REMOVED — type** `HireSignal` (both `interviewPack.ts` copies) and the `hireSignal` field on `InterviewReport`.
- **REMOVED — attempt-doc field** `hireSignal` (no longer written; old graded attempts may still carry it — harmless, the read schema no longer references it).
- **CHANGED — `GradeInterviewOutput`** gains optional `calibration?: CalibrationResult` (additive; mirrors functions↔src). **NEW shared field — flag for the consistency gate** (the function return now carries calibration so the UI can render it without a doc subscription).
- **CHANGED — `interview_completed` analytics** property `hireSignal: string` → `meanScore: number`.
- **CHANGED — "best attempt" selector** key: numeric hire-signal rank → mean rubric score (tie-break most-recent).
- **No Firestore rules / index change.** No new collection; spec-12 already added the `calibration` rules block. The grader schema is server-internal.
- **No change** to `dimensions`/`summary`/`strengths`/`fixes` (spec-22 owns content/tier fairness).

---

## 7. Tests

**Unit — `src/interview/attempts.test.ts`** (rewrite the `selectBest` suite; keep `selectLatest`):
- `selectBest([])` → null; an attempt with no `report` / malformed dimensions → excluded (`meanRubricScore` null).
- highest mean of five dimension scores wins (e.g. all-5 beats all-3).
- **tie-break**: two attempts with equal mean → the more-recent `createdAt` is returned.
- a `pending` attempt is never selected even with a high-scoring report.
- delete every `hireSignal`/`HIRE_RANK` reference from the fixtures + `make()` helper.

**Unit — `src/interview/InterviewReportView.test.tsx`** (update fixture — drop `hireSignal`):
- renders all five dimension labels + the summary (unchanged).
- **asserts no verdict text** renders: `expect(html).not.toContain('Lean Yes')` and no `iv-signal` class.
- **calibration shown** when `showCalibration && calibration={n:1, meanConfidence:.8, accuracy:.6, overconfidence:.2, brier:…}` → the sentence contains "80%" and "60%" and the word "overconfidence".
- **calibration hidden** when `showCalibration={false}` (Track A) even with a `calibration` prop → section absent.

**Unit — grader schema (`functions/src/interview.*.test.ts`)**:
- assert `'hireSignal' in INTERVIEW_REPORT_SCHEMA.properties === false` and `hireSignal` is not in `required`. **Scope the assertion to `hireSignal` only** — do not assert the full `required` array equals a fixed list, because spec-22 additively adds `tier`/`pressureNote` to the same array (README §5 merge); a whole-array equality test would break depending on spec-22's landing order. Assert presence/absence of individual keys (`hireSignal` absent; `dimensions`/`summary`/`strengths`/`fixes` present).
- fix `interview.grade.test.ts:38,42`: the fixture JSON string drops `hireSignal` (the test targets `extractGradeJson`, so any valid string works — use `'{"dimensions":{}}'` or keep it minimal).

**Drift test.** The existing `interviewPack` functions↔src drift guard must still pass after editing both copies identically.

**Fixture validation.** `tsx scripts/validate-fixtures.ts` stays green (no fixture touches `hireSignal`).

**`/dev` manual check (no Firebase/Java).** If `/dev/interview` (`DevInterviewPage.tsx`) renders a report harness, load it and confirm: no verdict pill; the five dimensions render as next-fix cards; passing a mock `calibration` with `showCalibration` shows the predicted-vs-measured sentence; Track-A path (`showCalibration=false`) hides it. If the dev harness does not render the report, verify via the `InterviewReportView` smoke test instead.

---

## 8. Foolproofing (README §8)

- **R4 — schema migrations permanent; progression via Functions.** Removing `hireSignal` from the grader's structured output is safe (server-internal, not a stored progression field gated by rules). Old attempt docs that still carry `hireSignal` are harmless — the read schema (`InterviewAttemptSchema`) no longer references it, so they parse fine (extra fields ignored). The additive `calibration` on `GradeInterviewOutput` is a function-return field, not a client-written progression field. ✔
- **R9 — "tested ≠ live."** `selectBest` is exported + tested but has **no production call site** (verified §2). Rewriting it is low-risk; the spec still rewrites its tests so the suite reflects the new key. Do not assume removing `hireSignal` breaks a live "best attempt" surface — there isn't one. ✔
- **Clean supersede of ADR-0008 shared contract.** Step 13's global grep (`hireSignal|HireSignal|HIRE_RANK|signalSlug|iv-signal`) over `src/ functions/ docs/` must be **empty** — no dangling reference in code, types, analytics, the `functions/scripts/` demo bot, CSS, or docs. The docs supersede note + ADR-0010 reference make the contract change explicit. ✔
- **D11 dependency on spec-12 correctness signal.** spec-12 binarizes correctness from `report.dimensions.correctness.score >= 4`, **not** from `hireSignal` (spec-12 §8) — so removing `hireSignal` cannot break calibration. ✔
- **functions↔src mirror.** Both `interviewPack.ts` copies edited identically; the drift guard test enforces it (R: two-copy drift). ✔

## 9. NEW shared field (flag for the consistency gate)

- `GradeInterviewOutput.calibration?: CalibrationResult` — the function return now carries the per-attempt calibration so the report UI renders it without a doc subscription. Consumed by **spec-23** (this spec); produced from **spec-12**'s `scoreCalibration`. The consistency gate should confirm spec-12 exposes `cal` in `gradeInterview` scope and that `CalibrationResult` is the agreed shape on both sides of the functions↔src boundary.
- `interview_completed` analytics: `hireSignal` removed, `meanScore: number` added — note for any analytics dashboard consumer.
- "best attempt" key = mean rubric score (tie-break most-recent) — recorded so spec-22 (if it reasons about per-attempt aggregate quality) uses the same definition.

## 10. Definition of Done

- `hireSignal`/`HireSignal` removed from: `INTERVIEW_REPORT_SCHEMA` + grader guard + finalize write (`functions/src/interview.ts`), both `interviewPack.ts` copies, `src/interview/functions.ts`, `src/interview/attempts.ts` (+ `selectBest` rekeyed to mean rubric score), `InterviewReportView.tsx`, `src/analytics/events.ts` + its caller, `functions/scripts/interview-demo-bot.ts` (the three artifact/console reads), and `docs/capstone-interview/README.md`.
- The report renders feed-forward fix cards (no verdict) and, on the quant-intensity gate, the predicted-vs-measured calibration delta from `gradeInterview`'s returned `calibration`.
- `./node_modules/.bin/vitest run src/interview functions/src/interview.grade.test.ts` green (rewritten `selectBest` + `InterviewReportView` + grader-schema tests).
- `tsx scripts/validate-fixtures.ts` passes; `./node_modules/.bin/eslint .` clean on every touched file; functions build passes; the interviewPack drift test passes.
- Step-13 global grep for `hireSignal|HireSignal|HIRE_RANK|signalSlug|iv-signal` over `src/ functions/ docs/` returns **zero** hits — clean supersede of the ADR-0008 hire-signal contract. (Includes `functions/scripts/interview-demo-bot.ts`, edited at step 10.)
- `docs/capstone-interview/README.md` carries the ADR-0010 supersede note; "best attempt = mean rubric score" documented.
