# spec-01 — Time axis & SM-2 scheduling state (Foundation A)

**Status:** Planned
**Phase:** Phase 0 (Foundations — build first)
**Depends-on:** **spec-24** (reads `BeatSchema.heldOut` to set `isTransfer`/`track:'B'` on transfer cards — README §7; the card-creation predicate must create a card for every `heldOut` transfer beat, so this is a real edge). (Soft: `schemaId` denormalized on cards is populated only once `spec-00` lands; until then it is written as `''`. This spec does not require `spec-00` to compile or pass; the `heldOut` field is optional, so this spec compiles before `spec-24` lands but Track-B transfer cards only appear once `spec-24`'s held-out beats exist.)
**Implements:** Decisions **D3** (problem-level SR unit), **D4** (SM-2 + interview-date anchoring), **D13** (target interview date), **D14** (Function-owned SR write-path); **Foundation A** (README §4).

> Read README §1 (corrected premises), §3 (D3/D4/D13/D14), §4 Foundation A (authoritative card shape), §8 (R4/R7/R12) before coding. The shapes in §4 are authoritative — this spec references them by name and does not rename them.

---

## 1. Goal & non-goals

**Goal.** Build the net-new problem-level time axis that every later SR spec consumes: the `users/{uid}/reviews/{cardId}` subcollection (exact §4 shape, Function-owned), the pure SM-2 scheduling module `src/progress/scheduling.ts` (with interview-date anchoring/capping + a forced final review in the last 3 days), the Firestore rules block + the indexes the queue queries actually need, the `targetInterviewDate` capture on `userDoc` (Onboarding + Profile UI), and the server write-path: a **server-grade** `submitReview` callable (grades the learner's raw answer against the fixture accept-list — never a client-asserted result) plus per-card card-creation at lesson completion (and lazy backfill of existing users on replay).

**Non-goals.** No due-selection / queue building (that is `spec-10`, which reads these cards). No recommender wiring, no UI surface for reviews (`spec-20`). No gold-mint logic (`spec-11`). No scheduled Cloud Function / push notifications — explicitly out for v1 (D14); "what's due" is computed client-side by comparing `dueAt` to `now`. SM-2 constants are **untuned** — they are placeholders to revisit with real retention data (D4); do not tune them here.

---

## 2. Current reality (verified, file:line)

- **`firestore.rules`** — owner-read + client-write-denied pattern to mirror: `milestones` (`firestore.rules:95-98`), `streaks` (`:99-102`), `interviews`/`interviewUsage`/`interviewState` (`:104-116`). The `users/{uid}` `update` whitelist is at `:54-61` (currently `displayName, lastActiveAt, learningGoal, comfortLevel, focusArea, pace, defaultTrack, recommendedConceptId, onboardingCompletedAt`). The profile `create` whitelist is `:45-49`.
- **`firestore.indexes.json`** — `{ "indexes": [], "fieldOverrides": [] }` (entirely empty). R4: any `where`/`orderBy` query needs a pre-created index or it throws at runtime.
- **`src/content/schema.ts`** — `SnapshotSchema` at `:720`, `ProgressSchema` at `:762`, `ProgressDerivedSchema` at `:746`. `BeatSchema` at `:608` has **no `schemaId`** today (added by `spec-00`).
- **`functions/src/index.ts`** — `initializeApp()` + `setGlobalOptions({region:'us-central1'})` at `:24-26`; `db` at `:28`; helpers `requireUid` `:60`, `requireString` `:68`, `loadLesson` `:75` (loads `lessons/{lessonId}`). `completeLesson` callable at `:113-223`; the **first-completion write** (not a replay) is the transaction branch at `:173-185`. Interview callables are re-exported at `:283` (`export { mintInterviewToken, gradeInterview } from './interview'`).
- **Lesson fixtures** carry `courseId` and graded beats. Verified: `fixtures/lesson-bayes-rule-1.json` has `courseId: 'course-bayes-rule'`, graded beat `compute-posterior` (`answerEntry`), `schemaId` currently `undefined`. `courseId` **is** the `conceptId` per §4. NOTE: `loadLesson`'s `LessonDoc` type (`functions/src/index.ts:32`) only declares `{beats?, unlocks?}` — it must be widened to read `courseId`, per-beat `schemaId`/`heldOut`, **and the graded beats' accept-lists** (`interaction.entries[].accept` for `answerEntry`; `interaction.accept` for accept-gated types) so `submitReview` can grade server-side. Verified: `compute-posterior` has `interaction.entries:[{id:'posterior', accept:['2/3']}]`.
- **Graded-beat taxonomy** (for which beats get a card): `GRADED_BEAT_TYPES` + `ACCEPT_GATED_BEAT_TYPES` + `isGradedBeat`/`gradedRequiredBeatIds` in `src/lesson/mastery.ts:11-37` (verified: `GRADED_BEAT_TYPES` is `{stateTap, equationTiles, answerEntry, masteryChallenge, retrievalGrid, handRanker}` at `:11`; `ACCEPT_GATED_BEAT_TYPES` is `{countingTree, selectionGrid}` at `:15`; `gradedRequiredBeatIds` filters on `b.required && isGradedBeat(b)` at `:27-29`). This is the canonical "which beats are problems" set; reuse the **graded** predicate, do not re-derive. **But the card-creation predicate is broader than `gradedRequiredBeatIds`** — see the card-creation predicate in §5b: it must also create a card for every `heldOut` transfer beat, which are `required:false`.
- **`BeatSchema.heldOut`** (added by `spec-24`, README §4.5: `heldOut: z.literal(true).optional()`): marks a held-out transfer problem. `spec-01` **reads** this field to decide card creation (transfer cards) — the `spec-01 → spec-24` dependency. The field is optional, so it is `undefined` on every beat until `spec-24` lands.
- **`src/auth/userDoc.ts`** — `UserDoc` interface `:20-32`, `UserDocSchema` `:36-47`, `saveOnboardingProfile` `:93-111`, `updateUserDisplayName` `:79-89`. No date field exists.
- **`src/pages/onboarding.model.ts`** — pure, no Firebase; `comfortToDefaultTrack` `:13`. `src/pages/OnboardingSurvey.tsx` — 4-step flow; `submit` `:93-123` calls `completeOnboarding(profile)`. `src/auth/AuthProvider.tsx:122-130` `completeOnboarding` → `saveOnboardingProfile`. `src/auth/authContext.ts:35` types it. `src/pages/ProfilePage.tsx` edits display name only (`:11-132`).
- **Client callable pattern to mirror:** `src/progress/functions.ts` (`httpsCallable` + `getFns()`, unwrap `.data`). `getFns()` lives in `src/firebase/app.ts:88-108`.
- **Rules test harness:** `tests/firestore.rules.test.ts` (`@firebase/rules-unit-testing`, `seed()` bypasses rules to simulate Admin SDK). Run via `npm run test:rules` (Java + emulator; kept out of the default suite). Existing `milestones/streaks` deny tests at `:183+` are the template.
- **`track`** is resolved per-concept from `progress.track` (`src/progress/track.ts`); the **existing app convention** falls back to `userDoc.defaultTrack ?? 'B'` (ProgressSchema `:765` comment). **But the card's `track` field deliberately diverges to fail gentle** — card-creation resolves `progress.track ?? userDoc.defaultTrack ?? 'A'` (#16; the gentle default, never `'B'`, so an unresolved track does not silently opt a learner into the transfer-gated path). This matches §5b's card-creation steps and mirrors the README §4 isQuantIntensity divergence (intensity gates fail gentle even though the existing convention defaults to `'B'`).
- **`needsReview`** (R7) is set true server-side at `functions/src/index.ts:177` (from client `data.needsReview`) and cleared at `:165`; the asymmetric set rule lives in `src/lesson/hintLadder.ts:52`. It is per-**lesson**, not per-beat.

---

## 3. Design

Reference the authoritative **Foundation A** shape in README §4 (`users/{uid}/reviews/{cardId}`, `cardId = ${lessonId}__${beatId}`) — do not redefine it here. The pieces:

1. **`src/progress/scheduling.ts`** — pure SM-2 + anchoring, no Firebase imports. Exported `nextSchedule(card, result, opts)` (opts is **required** — it carries the server-supplied `now: Date` plus optional `targetDate`; see §4 `NextScheduleOpts`) returns the next scheduling fields only. Unit-tested. Used by the `submitReview` callable (server) and importable by `spec-10`.
2. **`functions/src/review.ts`** (NEW — **spec-01 owns this file's creation + the `submitReview` callable declaration** with the frozen **server-grade** signature `{cardId, answer, confidence?}` — the client sends its raw answer payload, **never** an asserted `result`; the server grades it against the fixture beat's accept-list via `loadLesson` (§5a). `spec-10` later fills the SM-2 advance body, `spec-11` the gold-mint branch — README §5). The `submitReview` callable is the Function-owned writer of the card on each review (grades server-side → `pass`/`fail`, writes `confidence → lastConfidence`) + exported two-phase card-creation helpers (`readCardsForCompletion`/`writeCardsForCompletion`, split so all tx reads precede all tx writes — §5b) called from `completeLesson` to create the first card per **graded-required beat AND per `heldOut` transfer beat** (predicate in §5b). Re-export `submitReview` from `functions/src/index.ts` (mirrors `:283`).
3. **`firestore.rules`** — a `reviews` block under `users/{uid}` (owner read; all client writes denied) + add `targetInterviewDate` to the userDoc update whitelist.
4. **`firestore.indexes.json`** — `spec-10`'s `loadDueQueue` queries single-field `dueAt` (method grouping is in-memory), which the automatic index already covers, so **no composite is added** here; the `(schemaId,dueAt)` composite is speculative-for-later and deferred to whichever spec actually issues a `schemaId==` query (gate Issue #14). See §6.
5. **`userDoc.targetInterviewDate`** (`src/auth/userDoc.ts`) + Onboarding capture (optional 5th step) + Profile edit field.
6. **`src/content/schema.ts`** — `ReviewCardSchema` **and** its inferred `ReviewCard` type live **here** (`src/content/schema.ts`, alongside the other content schemas — not in `scheduling.ts`, which stays Firebase-free and only knows `SchedulingState`), matching the §4 shape exactly (all fields, including `isTransfer: boolean` and `lastConfidence: number | null` per README §4) so the client can parse cards it reads when building the queue.

**Why server-owned (R4/R12):** cards gate gold mastery (`spec-11`), so they must be trusted. The client never writes them; rules deny it. Scheduling keys only off server `now` / `FieldValue.serverTimestamp()`, never a client timestamp — **and the `pass` is server-graded against the fixture beat's accept-list, never the client's asserted result** (a client that POSTs `result:'pass'` could otherwise mint gold for a wrong answer). The frozen `submitReview` contract therefore takes the learner's raw `answer` payload, not a `result`; this is a **frozen-contract change vs README §4 — flag for README §4 update** (the §4 signature still reads `{cardId, result, confidence?}`).

---

## 4. SM-2 module — `src/progress/scheduling.ts` (NEW)

Pure, dependency-free (node Vitest env, like `src/lesson/mastery.ts`). It must **not** import `firebase/firestore` — it operates on plain numbers/`Date`s, so the server passes server-now in and the unit tests are deterministic. **`now` is a `Date`** (a JS `Date`, server-derived — never a Firestore `Timestamp` and never read from client input); the callable does `Timestamp.fromDate(...)` at the write boundary only. `targetDate` (when present) is likewise a `Date` at local midnight. This keeps the pure module Firebase-free (#15).

Constants (D4 — **UNTUNED**, comment them so):

```ts
// SM-2 constants (D4). UNTUNED placeholders — revisit with real retention data.
export const INIT_EASE = 2.5
export const EASE_FLOOR = 1.3
export const EASE_PASS_BONUS = 0.1   // right → ease += 0.10
export const EASE_FAIL_PENALTY = 0.2 // wrong → ease -= 0.20
export const FIRST_INTERVAL_DAYS = 1 // first pass and every lapse reset to 1d
export const FORCE_FINAL_WINDOW_DAYS = 3 // force a review into the last 3 days before the target date
export const MS_PER_DAY = 86_400_000

export type ReviewResult = 'pass' | 'fail'

// Only the SM-2 + scheduling fields — never the denormalized identity fields.
export interface SchedulingState {
  dueAt: Date
  intervalDays: number
  easeFactor: number
  reps: number
  lapses: number
}

export interface NextScheduleOpts {
  now: Date              // server now (caller passes a server-derived Date)
  targetDate?: Date | null // parsed userDoc.targetInterviewDate (local midnight); anchors/caps
}
```

`nextSchedule(prev: SchedulingState, result: ReviewResult, opts: NextScheduleOpts): SchedulingState`:

- **fail:** `easeFactor = max(EASE_FLOOR, prev.easeFactor - EASE_FAIL_PENALTY)`; `intervalDays = FIRST_INTERVAL_DAYS`; `reps = 0`; `lapses = prev.lapses + 1`.
- **pass:** `easeFactor = prev.easeFactor + EASE_PASS_BONUS` (no upper cap per D4); `reps = prev.reps + 1`; `intervalDays = reps === 1 ? FIRST_INTERVAL_DAYS : round(prev.intervalDays * easeFactor)` (the **new** ease applied to the **prior** interval); `lapses` unchanged.
- **dueAt base:** `now + intervalDays days`.
- **Anchoring/capping (D4)** when `targetDate` is present:
  - **Cap:** if base `dueAt > targetDate`, set `dueAt = targetDate` (never schedule past the interview). Recompute `intervalDays = max(1, round((dueAt - now)/MS_PER_DAY))` so stored interval stays coherent with `dueAt`.
  - **Forced final review:** if `now` is already within `FORCE_FINAL_WINDOW_DAYS` of `targetDate` (i.e. `targetDate - now <= 3 days`) **and** `targetDate >= now`, clamp `dueAt` into that window: `dueAt = min(base dueAt, targetDate)` but never later than `targetDate`, and if base would push past `targetDate`, force `dueAt = max(now, targetDate - 1 day)` so at least one more review lands before the date. (Net effect: as the date nears, intervals compress and a final rep is guaranteed.)
  - If `targetDate < now` (interview already passed): ignore anchoring, behave as no-target.
- **No target:** standard SM-2, no cap.
- **Initial card** (created at completion, never reviewed): exported helper `initialSchedule(now): SchedulingState` → `{ dueAt: now + 1d, intervalDays: 1, easeFactor: INIT_EASE, reps: 0, lapses: 0 }`. (First review is due ≥1 day out so gold can never be minted same-day — coherent with D7's "delayed ≥1 day".)

> **Queue-volume ramp** (D4 "ramp queue volume as the date nears") is a *selection-side* concern that lives in `spec-10`'s queue builder, not in the per-card scheduler. This module only guarantees the cap + forced-final-rep that make the ramp possible. State this in a comment so `spec-10` knows where the ramp lives.

`round` = `Math.round`. Document that all arithmetic is in whole days; sub-day precision is intentionally out of scope.

> **Policy-boundary note (algorithm is swappable behind the `nextSchedule()` seam).** SM-2 is a *policy* choice (D4), not a contract. The contract is the `SchedulingState` field set (`dueAt, intervalDays, easeFactor, reps, lapses`) and the `nextSchedule(prev, result, opts)` signature. A **Leitner / expanding-interval** drop-in is a legal alternative: it uses the *same* `SchedulingState` fields (a Leitner "box" maps onto `reps`; `intervalDays` follows the expanding ladder 1→3→7→…; `easeFactor` may be held constant) and is selected behind the **same** `nextSchedule()` seam with **no** change to `submitReview`, the card shape, or callers. Keep all SM-2 specifics inside `nextSchedule`/the constants so a future swap is a single-module change. (Still UNTUNED either way — D4.)

---

## 5. Write-path — `functions/src/review.ts` (NEW) + `completeLesson` edit

### 5a. `submitReview` callable

**spec-01 OWNS the `submitReview` callable declaration** in `functions/src/review.ts` with the **FROZEN, server-grade** signature (resolves gate Issue #2/#7; **frozen-contract change vs README §4 — flag for README §4**). Mirror `interview.ts` callable style. The contract takes the learner's **raw answer payload** and grades it server-side — it does **not** accept a client-asserted `result` (R12: a `pass` that gates gold must be earned, not declared). Input/output:

```ts
// FROZEN signature (server-grade) — do NOT add a {lessonId,beatId} variant and
// do NOT accept a client `result`. The client derives cardId = `${lessonId}__${beatId}`
// and sends its RAW answer; the server grades against the fixture beat's accept-list.
type SubmitReviewData = {
  cardId?: string
  answer?: Record<string, string> // entryId → submitted value (mirrors the answerEntry shape)
  confidence?: number
}
// returns { result: 'pass'|'fail' /* server-graded */, dueAt: string /* ISO */, intervalDays, easeFactor, reps, lapses, lastResult }
```

> The one frozen shape is `submitReview({ cardId: string; answer: Record<string,string>; confidence?: number })`. `confidence` is **optional** (the Daily-Review surface passes it per D6; Track-A / no-confidence callers omit it). There is **no** `{lessonId,beatId}` variant and **no** client `result` — accepting either would fork the contract spec-10/spec-11 build on or let the client mint gold for a wrong answer. spec-01 declares the callable + grading + card-creation here; **spec-10** fills the SM-2 advance body, **spec-11** adds the gold-mint branch (README §5 collision matrix: 3 specs, one file).

Steps inside the callable:
1. `requireUid`; `cardId = requireString(data.cardId, 'cardId')`. Require `data.answer` to be a non-null object (else `invalid-argument`). If `data.confidence` is present, validate it is a finite number (else `invalid-argument`); if absent, treat as `null`.
2. `const ref = db.doc(\`users/${uid}/reviews/${cardId}\`)`.
3. In a `db.runTransaction`: read the card; if missing → `failed-precondition` ("review card not found"). Read `targetInterviewDate` from `users/${uid}` (same tx) → parse to a `Date` at local midnight, or null.
4. `const now = new Date()` (server now — R12; never read a client timestamp).
5. **Server-grade (before scheduling).** Derive `{lessonId, beatId}` by splitting `cardId` on `'__'` (the card stores both fields too — read whichever is simpler). `const lesson = await loadLesson(lessonId)` (reuse the existing helper, `functions/src/index.ts:75`; widen `LessonDoc` per §5b so `interaction.accept`/`entries[].accept` are readable). Locate the beat by `beatId`, read its accept-list (for `answerEntry`: each `entries[i].accept: string[]` keyed by `entries[i].id`; for accept-gated beats: `interaction.accept`), and compute `const result: 'pass'|'fail' = gradeAgainstAccept(beat, data.answer) ? 'pass' : 'fail'`. Grading must match the same normalization the in-lesson grader uses (reuse/inline the accept-compare predicate, with a comment pointing at its source so the two cannot drift — R2-style). If the beat has no accept-list (mis-routed card) → `failed-precondition`. **The server's `result`, not the client's, feeds the rest of the path.**
6. Build `prev: SchedulingState` from the card fields; `const next = nextSchedule(prev, result, { now, targetDate })`.
7. `tx.set(ref, { dueAt: Timestamp.fromDate(next.dueAt), intervalDays, easeFactor, reps, lapses, lastResult: result, lastConfidence: data.confidence ?? null, lastReviewedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, {merge:true})`. **`confidence` lands in `lastConfidence`** (README §4: third D6 capture site, fed to calibration in spec-12). When `confidence` is omitted the merge writes `lastConfidence: null` (an absent rating is not a stale carry-over).
8. **Fire the per-interval outcome analytics event** (see below) with the *elapsed* interval and server-graded `result`.
9. Return the next fields + the server-graded `result` (ISO `dueAt`) for the client to update its in-memory queue without a re-read.

**Per-interval outcome analytics (spec-04 feed — UNTUNED).** On each review, after the grade, emit one analytics event so efficacy can be measured later:

```ts
// Per-review efficacy datapoint (feeds spec-04 efficacy measurement). UNTUNED.
{ cardId, schemaId,         // identity (schemaId is '' until spec-00 backfill)
  intervalDays,             // the interval that ELAPSED before this review (prev.intervalDays, i.e. how long the card was held before re-test)
  result,                   // server-graded 'pass' | 'fail'
  lapses }                  // post-update lapse count
```

Fire it via the existing analytics seam (`src/analytics/events.ts` is the client sink per Foundation D; on the Function side emit through the same event name/shape so spec-04 reads one schema). This is a **measurement** event only — it changes no scheduling. **UNTUNED — revisit per spec-04 (efficacy measurement)**: the exact retention/efficacy metric derived from `{intervalDays elapsed, result, lapses}` is spec-04's to define; spec-01 only guarantees the datapoint is captured at the one place that knows both the elapsed interval and the true result.

> `suspended` is **not** touched here — it is owned by `spec-11` (set true when gold via transfer is reached). `submitReview` must preserve it (merge-write leaves it untouched). State this.

### 5b. First-card creation at completion

Add an exported helper to `review.ts`. Because Firestore forbids reads after writes in a transaction (`INVALID_ARGUMENT: Firestore transactions require all reads to be executed before all writes` — see the comment at `index.ts:142`), the helper is split into a **read phase** and a **write phase** so the caller can interleave them correctly with `completeLesson`'s own progress writes:

```ts
// Read phase: all tx.get(...) calls (per-card existence + the concept-progress and
// userDoc reads needed to resolve track). MUST run before any tx.set in completeLesson.
export async function readCardsForCompletion(
  tx, uid, lesson,
): Promise<{ cardRef; beat; exists: boolean }[] /* + resolved track */>

// Write phase: only tx.set(...) calls. MUST run after completeLesson's progress writes.
export function writeCardsForCompletion(
  tx, plan /* the read-phase result, incl. resolved track */,
): void
```

A single `createCardsForCompletion(tx, …)` that does reads-then-writes internally is **not** usable here, because the caller must write `progressRef`/`nextRef` between the two phases yet all reads must precede all writes within the one transaction. Keep the two phases as separate exported functions (or one function returning a deferred-write closure) and document why.

**Card-creation predicate (authoritative — README §4, resolves gate Issue #1).** `writeCardsForCompletion` creates a card for **every graded-required beat AND every beat with `heldOut === true`** (transfer beats). Transfer beats are `required:false`, so a `gradedRequiredBeatIds`-only predicate would **never** create them and Track-B gold (`spec-11`) could never mint. Concretely the card-eligible set is:

```
isCardBeat(beat) := (beat.required && isGradedBeat(beat))   // the gradedRequiredBeatIds set
                    || beat.heldOut === true                 // held-out transfer beat (spec-24)
```

For a **transfer card** (`beat.heldOut === true`) set `isTransfer: true` and `track: 'B'` (the transfer gold gate is Track-B only — D7); the resolved per-concept track is **not** used for transfer cards. For a normal graded-required card set `isTransfer: false` and `track:` the resolved per-concept track.

**Read phase** (`readCardsForCompletion`): resolve `track` first (see wiring below), then for each **card-eligible** beat (`isCardBeat` above — graded-required ∪ `heldOut`) build `cardId = \`${lesson.lessonId}__${beatId}\`` and `tx.get(cardRef)` to capture existence. Return the per-beat refs/snaps + per-beat `isTransfer` flag (= `beat.heldOut === true`) + the resolved `track`. No writes.

**Write phase** (`writeCardsForCompletion`): for each beat whose read-phase snap did **not** exist, `tx.set(cardRef, fullCard, {merge:true})`. The rule is **"do not RESET an existing card on replay; DO create cards that are ABSENT"** — the guard is **per-card existence** (the read-phase `exists` flag), not "first completion vs replay" globally. A replay that finds some cards missing (e.g. a lesson edited to add a graded beat, or a user who completed the lesson before `spec-01` shipped — see backfill below) creates exactly the missing ones and leaves existing cards' schedules untouched. The `{merge:true}` write is idempotent for an absent card and is never issued for an existing card, so it can never clobber live SM-2 state. `fullCard` = §4 shape with identity fields (`lessonId`, `beatId`, `conceptId: lesson.courseId`, `schemaId: beat.schemaId ?? ''`, `track: isTransfer ? 'B' : resolvedTrack`, `isTransfer`) + `initialSchedule(new Date())` fields as `Timestamp.fromDate(...)` + `reps:0, lapses:0, lastResult:null, lastConfidence:null, lastReviewedAt:null, suspended:false, createdAt/updatedAt: serverTimestamp()`. (`lastConfidence:null` and `isTransfer` are part of the frozen §4 card shape — do not omit.)

**Note on the graded-beat set:** `gradedRequiredBeatIds` lives in `src/lesson/mastery.ts` (client tree). Functions cannot import across the `src/`↔`functions/` boundary cleanly. **Do not import it.** Instead, inline a tiny copy of the `isGradedBeat` predicate in `review.ts` (the type set is small and stable per R2/§5 collision note) with a comment pointing at `src/lesson/mastery.ts:11` as the source of truth and a fixture test (§7) that asserts the two stay in sync. The card-creation predicate then layers the `heldOut` clause on top of the graded-required set (`isCardBeat` above) — the inlined predicate is `isGradedBeat`, **not** the broader card predicate, so the sync test compares `isGradedBeat`'s type sets only. Widen `loadLesson`'s `LessonDoc` (`functions/src/index.ts:32`) to `{ lessonId?: string; courseId?: string; beats?: Array<{beatId; required; heldOut?: boolean; schemaId?; interaction:{type; accept?: string[]; entries?: Array<{id: string; accept?: string[]}>}}>; unlocks? }` — note the added `heldOut?: boolean` so the predicate can read it (it is `undefined` until `spec-24` marks transfer beats), **and `interaction.entries[].accept` / `interaction.accept` so `submitReview` can grade server-side** (§5a step 5). Verified shape: `fixtures/lesson-bayes-rule-1.json` beat `compute-posterior` has `interaction.entries: [{id:'posterior', accept:['2/3']}]`.

**Wire into `completeLesson`:** in the first-completion branch (`functions/src/index.ts:173-185`):

1. **Reads first (before any `tx.set`).** All of `completeLesson`'s existing reads (`progressSnap` at `:143`, `nextSnap` at `:144`) already precede the writes; add the card-creation reads alongside them, **above** the `tx.set(progressRef, progressWrite, …)` at `:185`:
   - **Resolve `track` from the correct doc.** Track is keyed by **concept**, not lesson: it is written to `users/${uid}/progress/${conceptId}` (`src/progress/track.ts:31-39`; `conceptId = lesson.courseId` per §4) and documented there in `ProgressSchema:763-765`. The `progressSnap` already read at `:143` is `progress/${lessonId}` (e.g. `progress/lesson-bayes-rule-1`), whose `.track` is **always undefined** for any real fixture (every lesson has `lessonId !== courseId`, e.g. `lesson-bayes-rule-1` vs `course-bayes-rule`) — do **not** reuse it for track. Add a **new** tx read `const conceptProgressSnap = await tx.get(db.doc(\`users/${uid}/progress/${lesson.courseId}\`))` and read the user doc `const userSnap = await tx.get(db.doc(\`users/${uid}\`))`. Resolve `track = conceptProgressSnap.get('track') ?? userSnap.get('defaultTrack') ?? 'A'`. **The final fallback is `'A'` (gentle), not `'B'`** (#16): an unresolved track must not silently opt a learner into the brutal/transfer-gated path. (Getting the *source doc* wrong instead silently defaults every card off `progress/${lessonId}.track` which is always undefined — see below — discarding a learner's per-concept choice and mis-gating spec-11's gold mechanism, re-retrieve vs transfer.) The content-driven transfer-card override is unaffected: a `heldOut` beat still forces `track:'B'`/`isTransfer:true` regardless of the resolved track (it is content-driven, not a fallback).
   - **Card existence reads.** Call `const plan = await readCardsForCompletion(tx, uid, lesson)` (which performs the per-card `tx.get` and returns refs/snaps + the resolved `track`), or pass the already-resolved `track` in if you resolve it inline here. Either way every `tx.get` for cards happens here, before the writes.
2. **Writes after.** Keep the existing `tx.set(progressRef, progressWrite, …)` (`:185`) and the successor `tx.set(nextRef, …)` (`:188-199`), then call `writeCardsForCompletion(tx, plan)` to emit the card `tx.set`s. No read may follow these writes.

On a **replay** (`alreadyCompleted` branch, `:146-171`) apply the **same per-card existence guard** as first completion: do **not** reset existing cards, but **do** create any that are ABSENT. For a lesson that was first completed *before* `spec-01` shipped, every card is absent, so the replay creates them all — see §5d. (This replaces the older "do not create cards on replay" rule: it was correct for resetting but wrong for the absent-card case, which is exactly how existing users get backfilled.) Concretely: wire `readCardsForCompletion`/`writeCardsForCompletion` into the `alreadyCompleted` branch too, not only the first-completion branch — both branches must still keep all `tx.get`s before all `tx.set`s.

### 5c. Two-phase split (unchanged)

(See the read/write phase contract above — it is shared by both the first-completion and replay branches.)

### 5d. Existing-user backfill (lazy, per-card, idempotent — #4)

Users who completed lessons **before** `spec-01` shipped have no review cards, so they would never enter the SR loop. The backfill is **lazy and requires no separate migration job**:

- **Mechanism = the per-card existence guard, reused.** Because card creation is gated on per-card existence (`exists` from the read phase) and writes with `{merge:true}`, the **replay path itself is the backfill**: the next time an existing user replays (or otherwise re-completes) a lesson, `writeCardsForCompletion` finds the cards absent and creates exactly them, with fresh `initialSchedule(now)` state. No card that already exists is touched.
- **Idempotent.** Running it twice is a no-op for already-created cards (existence guard) and `{merge:true}` makes the create write safe to repeat. There is no global "has this user been backfilled?" flag — correctness comes from per-card existence, not a per-user marker.
- **No separate job, no scheduled Function** (consistent with D14 — no scheduled Cloud Function in v1). Backfill happens incrementally as users return to lessons. A learner who never revisits a completed lesson simply has no due cards for it yet, which is acceptable for v1 (the Daily Review queue, spec-10, surfaces what cards exist; it does not promise to retro-enroll untouched history).
- **Eager option (explicitly deferred).** A one-shot admin/Function sweep that iterates each user's completed lessons and calls the write phase is *possible* but is **out of scope for v1** — it is a scheduled/batch job (D14 defers those) and the lazy path covers the active-user population. Note it here only so a later spec can pick it up; do not build it now.

**Acceptance / test (must be testable):** replaying a lesson for a user whose review cards are **absent** creates one card per card-eligible beat (graded-required ∪ `heldOut`) with `reps:0`/fresh `initialSchedule` state; replaying again creates **no** new cards and **does not reset** the now-existing cards' schedules (the `dueAt`/`reps` set by an intervening `submitReview` are preserved). See §10 "Card-creation predicate" tests.

> R7 coherence: `needsReview` (per-lesson, `progress` doc) and per-beat `dueAt` (cards) now coexist. Keep both: `completeLesson` still writes `needsReview` exactly as today (`:177`); creating cards does not touch it. Add a code comment at the card-creation call site stating the two are independent signals (lesson-level review flag vs problem-level due dates) and that `spec-10`/`spec-20` branch UX on review-vs-first-attempt.

---

## 6. Firestore rules & indexes

### Rules (`firestore.rules`)
Add inside `match /users/{uid}` (after the interview blocks, `:116`):

```
// Spaced-review cards — Cloud Functions only (Admin SDK bypasses rules).
// They gate gold mastery so must be trusted; client computes "what's due" by
// reading dueAt and comparing to now (D14).
match /reviews/{cardId} {
  allow read: if isOwner(uid);
  allow write: if false;
}
```

Add `'targetInterviewDate'` to the userDoc update whitelist (`firestore.rules:55-59`) so the client can set/edit it. It is a non-progression profile field, like `learningGoal`. (No type-validation in rules beyond the whitelist — match the existing onboarding fields' treatment.)

### Indexes (`firestore.indexes.json`) — R4 + gate Issue #14
**Authoritative (README §5 collision matrix + §4 Foundation A):** `spec-10`'s `loadDueQueue` queries on the **single field `dueAt`**; **method grouping / interleave is done in-memory** over the loaded cards, not via a `where('schemaId','==',…)` Firestore query. Therefore the `(schemaId ASC, dueAt ASC)` composite is **speculative-for-later** — do **NOT** pre-create it here. Add a composite **only when a query actually issues a `schemaId==` filter** (gate Issue #14); per the current `spec-10` plan, none does.

State the query `spec-10` actually runs and confirm it needs no composite:
- **Q1 — flat due queue (the only query in v1):** subcollection `reviews` `where('dueAt','<=', now).orderBy('dueAt')`. A single-field range+orderBy on the **same** field needs **no composite** index (Firestore's automatic single-field index covers it). Document this; add nothing.

So `firestore.indexes.json` stays effectively empty for this spec (the `reviews` subcollection needs only the automatic single-field `dueAt` index):

```json
{ "indexes": [], "fieldOverrides": [] }
```

(If `spec-10` later adds a real `where('schemaId','==',m)` or `where('suspended',…)` server-side query, **that spec** adds the matching composite at that point. Do not speculatively add either now — an unused composite is drift, gate Issue #14.) Note that any future composite would use `queryScope: "COLLECTION"` for per-user subcollection queries; switch to `COLLECTION_GROUP` only if a cross-user query is ever needed (it isn't in v1).

---

## 7. Step-by-step implementation

1. **Create `src/progress/scheduling.ts`** with constants, `SchedulingState`, `initialSchedule`, `nextSchedule` (§4).
   → verify: `./node_modules/.bin/eslint src/progress/scheduling.ts` clean; file imports nothing from `firebase`.
2. **Create `src/progress/scheduling.test.ts`** (§8 test list).
   → verify: `./node_modules/.bin/vitest run src/progress/scheduling.test.ts` green.
3. **Add `ReviewCardSchema`** to `src/content/schema.ts` (after `ProgressSchema`, ~`:780`) matching §4 **field-for-field** — `lessonId, beatId, conceptId, schemaId, track('A'|'B'), dueAt, intervalDays, easeFactor, reps, lapses, lastResult('pass'|'fail'|null), lastConfidence(number|null), isTransfer(boolean), suspended(boolean), createdAt, updatedAt, lastReviewedAt(Timestamp|null)`. Timestamps as `z.unknown()` (like `ProgressSchema.completedAt:776`); export `type ReviewCard = z.infer<...>`. Do **not** omit `isTransfer` or `lastConfidence` (gate fix — they are part of the frozen §4 card shape consumed by spec-11/spec-12).
   → verify: `./node_modules/.bin/eslint src/content/schema.ts` clean; `tsc` via build has no new errors.
4. **`src/auth/userDoc.ts`**: add `targetInterviewDate?: string` to `UserDoc` (`:32`) and `targetInterviewDate: z.string().optional()` to `UserDocSchema` (`:46`). Add a `saveTargetInterviewDate(uid, date: string | null)` helper (mirrors `updateUserDisplayName`; writes `targetInterviewDate` + `lastActiveAt`; passing `null` deletes via `deleteField()`). Add `validateInterviewDate(date: string): string | null` (empty ok → returns null meaning "no date"; must be `YYYY-MM-DD` and not in the past relative to today).
   → verify: eslint clean; the helper uses `updateDoc`/`serverTimestamp` like the others.
5. **`src/auth/AuthProvider.tsx` + `authContext.ts`**: expose `setTargetInterviewDate(date: string | null)` (mirrors `updateUserProfile`: call `saveTargetInterviewDate`, then `refreshUserDoc`). Add it to the context type + `value`/`useMemo` deps.
   → verify: eslint clean; `useAuth().setTargetInterviewDate` typed.
6. **`src/auth/userDoc.ts saveOnboardingProfile`**: accept an optional `targetInterviewDate?: string` on the `profile` arg and write it when present (additive; existing callers unaffected). Add to `OnboardingProfile` type wherever it's defined (grep — it's used by `completeOnboarding`).
   → verify: existing onboarding still compiles; new field optional.
7. **`src/pages/OnboardingSurvey.tsx`**: add an **optional** Step 5 ("When's your interview? (optional)") with a `<input type="date">` and a "Skip" button; fold the value into the `submit` payload (`targetInterviewDate`). Keep it optional — Skip submits without it. Update the step counters ("Step N of 5"). (D13: interview-date capture; intensity-gating reuses existing `learningGoal`/track — **no new gate field**.)
   → verify: `/dev` onboarding route renders the new step; Skip still completes onboarding.
8. **`src/pages/ProfilePage.tsx`**: add an editable `<input type="date">` bound to `userDoc.targetInterviewDate`, saved via `setTargetInterviewDate` (its own Save action or folded into the existing form). Show `validateInterviewDate` errors inline like the name field.
   → verify: `/dev` profile route lets you set/clear the date; past dates rejected.
9. **`functions/src/review.ts` (NEW)**: implement `submitReview` (§5a — server-grade: take the raw `answer` payload, `loadLesson`, grade against the beat's accept-list **before** `nextSchedule`, fire the per-interval analytics event), the two-phase card creation `readCardsForCompletion`/`writeCardsForCompletion` (§5b — split so all tx reads precede all tx writes in the caller), the inlined graded-beat predicate, the inlined accept-compare predicate (with a source-of-truth comment), and `initialSchedule`/`nextSchedule` imports. Import `nextSchedule`/`initialSchedule`/`SchedulingState` — **note** `functions/` has its own tsconfig/build; if it cannot import from `src/progress/scheduling.ts` across the boundary, copy the pure module to `functions/src/scheduling.ts` and add a sync test (§7 mastery-style) OR configure a path import. Prefer the copy (matches the existing `requireUid` duplication rationale at `interview.ts:66`). Pick one and state it.
   → verify: `cd functions && ./node_modules/.bin/eslint src/review.ts` (or repo eslint) clean.
10. **`functions/src/index.ts`**: widen `LessonDoc` (`:32`); import + wire the two-phase card creation in the first-completion branch (§5b) — card-existence/concept-progress/userDoc reads (incl. the new `progress/${lesson.courseId}` track read) **before** the `tx.set(progressRef,…)`, card `tx.set`s **after**; re-export `submitReview` near `:283`.
    → verify: functions build/typecheck passes; first completion does not throw the read-after-write `INVALID_ARGUMENT`; track resolves from `progress/${courseId}` not `progress/${lessonId}` with a final `?? 'A'` fallback; replay creates only ABSENT cards and never resets existing ones (backfill §5d; covered by test §10).
11. **`src/progress/functions.ts`** (or a new `src/review/functions.ts` mirroring it): add a `submitReview(input)` client wrapper (`httpsCallable` + `getFns`, unwrap `.data`) typed to the **server-grade** signature `{cardId, answer, confidence?}` → `{result, dueAt, …}`. The wrapper sends the learner's raw answer and reads back the **server-graded** `result`; it must **not** expose a `result` input.
    → verify: eslint clean; typed input/output match §5a; no `result` field on the input type.
12. **`firestore.rules`**: add the `reviews` block + `targetInterviewDate` to the update whitelist (§6).
    → verify: `npm run test:rules` (Java) — new tests in §8 pass; existing rules tests still pass.
13. **`firestore.indexes.json`**: leave it `{ "indexes": [], "fieldOverrides": [] }` — Q1 (`dueAt` single-field) is covered by the automatic index, and the `(schemaId,dueAt)` composite is deferred (gate Issue #14; method grouping is in-memory in `spec-10`). No edit unless a later `schemaId==` query is actually introduced.
    → verify: file is valid JSON; no unused composite is present (confirm by inspection / `firebase firestore:indexes`).

---

## 8. Two-track behavior

- **Card `track` field** records which gold gate applies later (D7): `'A'` = re-retrieve the same checkpoint cold; `'B'` = held-out transfer problem. **This spec only stores `track`/`isTransfer`**; the gold-gate branching is `spec-11`. Resolution for a **normal graded-required card**: per-concept `progress.track` ?? `userDoc.defaultTrack` ?? `'A'` (#16 — the final fallback is **gentle `'A'`**, never `'B'`; an unresolved track must not opt a learner into the transfer-gated path). A **transfer card** (`beat.heldOut === true`) always stores `track:'B'` and `isTransfer:true` (content-driven, not a fallback) regardless of the learner's resolved track — the transfer gold gate is Track-B-only (D7); `spec-11` reads `isTransfer` to apply the transfer gate.
- **Quant-intensity gate** (Track B OR `learningGoal === 'interview'`): not exercised by the scheduler itself, but **interview-date anchoring** is most impactful for this audience — they are the ones who set a `targetInterviewDate`. The anchoring/cap logic is unconditional (it's a no-op when no date is set), so Track A users who skip the date get plain SM-2. No track branch in `scheduling.ts`.
- No Track-A UI suppression here (the date field is offered to everyone, optional).

---

## 9. Data / schema deltas

Only deltas; shared shapes are in README §4 (do not redefine):
- **NEW collection** `users/{uid}/reviews/{cardId}` — §4 Foundation A shape. Function-owned.
- **`src/content/schema.ts`**: `+ ReviewCardSchema` / `ReviewCard` (client-read parser only).
- **`src/auth/userDoc.ts`**: `+ targetInterviewDate?: string` on `UserDoc` + `UserDocSchema` (D13; client-writable). **Privacy (#13):** `targetInterviewDate` is learner-supplied personal data — it is optional, user-editable, and deletable (`setTargetInterviewDate(null)` → `deleteField()`); handle/retain it per the privacy treatment in README §4.6 (data-handling & retention for learner-supplied profile fields).
- **`firestore.rules`**: `+ reviews` block; `+ targetInterviewDate` in userDoc update whitelist.
- **`firestore.indexes.json`**: **no change** — `spec-10`'s `loadDueQueue` uses single-field `dueAt` (auto-indexed); method grouping is in-memory. The `(schemaId ASC, dueAt ASC)` composite is speculative-for-later, deferred to whichever spec issues a `schemaId==` query (gate Issue #14).
- **No** change to `ProgressSchema`/`SnapshotSchema`/`BeatSchema` (BeatSchema.`schemaId` is `spec-00`).

---

## 10. Tests

**Unit — `src/progress/scheduling.test.ts`** (vitest, node env; mirror `recommend.test.ts` style):
- `initialSchedule`: dueAt = now+1d, ease 2.5, reps 0, lapses 0.
- pass from initial → reps 1, interval 1d (first interval), ease 2.6.
- second consecutive pass → interval = round(1 * 2.7) (new ease on prior interval), reps 2.
- fail → interval resets to 1d, ease −0.20, lapses +1, reps 0.
- ease floor: repeated fails never drop ease below 1.3.
- **anchoring cap:** with `targetDate` 2 days out and a pass that would schedule 30 days out, `dueAt === targetDate` and `intervalDays` recomputed to 2.
- **forced final review:** `now` within 3 days of `targetDate`, a pass that would overshoot → `dueAt <= targetDate` and `dueAt >= targetDate - 1d` (a final rep guaranteed before the date).
- **past target:** `targetDate < now` → anchoring ignored (plain SM-2).
- no-target → plain SM-2, no cap.
- determinism: same inputs → same outputs (no `Date.now()` inside; `now` injected).

**Fixture/sync test** (if the predicate or scheduling module is copied into `functions/`): a test asserting the `functions/` inlined `isGradedBeat` type set equals `GRADED_BEAT_TYPES ∪ ACCEPT_GATED_BEAT_TYPES` from `src/lesson/mastery.ts`, and (if copied) `functions/src/scheduling.ts` is byte-identical to `src/progress/scheduling.ts` (read both, compare). Prevents silent drift (R2-style).

**Card-creation predicate (Functions test / pure predicate test):**
- A lesson with graded-required beats + one `heldOut:true` transfer beat (`required:false`) creates a card for **every** graded-required beat **and** the transfer beat (predicate = graded-required ∪ `heldOut`); an ungraded non-`required` non-`heldOut` beat gets **no** card.
- The transfer card has `isTransfer:true` and `track:'B'` regardless of the resolved per-concept track; a normal card has `isTransfer:false` and `track` = resolved per-concept track (Track-A concept → `'A'`; unresolved → final fallback `'A'`, **not** `'B'` — #16).
- **Backfill / per-card existence guard (#4):** replaying a lesson when **no** review cards exist yet (the existing-user case, §5d) **creates** one card per card-eligible beat with fresh `initialSchedule` state (`reps:0`). Replaying again **creates no new cards** and **does not reset** existing cards — a card whose `dueAt`/`reps` were advanced by an intervening `submitReview` keeps those values (guard is per-card existence + `{merge:true}`, never a global reset).
- A replay that finds some-but-not-all cards present creates exactly the absent ones and leaves the present ones untouched.

**`submitReview` server-grade + confidence write (Functions test):**
- **Server-grades, ignores any client-asserted result.** A correct `answer` (matching the fixture beat's accept-list, e.g. `{posterior:'2/3'}` for `compute-posterior`) → stored `lastResult:'pass'` and the pass-branch SM-2 advance; an incorrect `answer` (e.g. `{posterior:'1/2'}`) → `lastResult:'fail'`, interval reset, `lapses+1`. The result is computed server-side from the accept-list, **not** taken from the payload.
- The payload carries **no** `result` field; the returned object carries the **server-graded** `result`.
- `submitReview({cardId, answer:<correct>, confidence:0.8})` writes `lastConfidence:0.8`; `submitReview({cardId, answer:<correct>})` (no confidence) writes `lastConfidence:null`.
- A `{lessonId,beatId}` payload is **not** accepted (only `cardId`); missing `cardId` → `invalid-argument`/`requireString` throw; missing/non-object `answer` → `invalid-argument`.
- `suspended` set on the card by a prior write is preserved across a `submitReview` (merge-write leaves it untouched).
- **Per-interval analytics event fired:** a `submitReview` emits one outcome event `{cardId, schemaId, intervalDays (elapsed = prev.intervalDays), result (server-graded), lapses}` (assert via a spied analytics sink).

**Validator:** `tsx scripts/validate-fixtures.ts` must still pass unchanged (this spec adds no fixture requirement; `schemaId` requirement is `spec-00`).

**Rules — `tests/firestore.rules.test.ts`** (`npm run test:rules`; new `describe('reviews (Cloud Functions only)')`, mirroring the milestones block `:183`):
- owner can read a seeded card; non-owner cannot.
- client `setDoc`/`updateDoc` to `users/alice/reviews/x` **fails** (denied) for owner and non-owner.
- userDoc update including `targetInterviewDate` (alone, and alongside `lastActiveAt`) **succeeds** for owner; **fails** for non-owner; a write smuggling a progression field still fails.

**Manual `/dev` (no Firebase/Java needed per AGENTS.md):**
- `/dev` onboarding: the optional date step renders, Skip completes, choosing a date completes.
- `/dev` profile: set a future date (saves), set a past date (rejected), clear it (deletes).
- (Functions write-path needs the emulator; cover by unit + rules tests, not `/dev`.)

---

## 11. Foolproofing (README §8)

- **R4 (permanent schema + empty index file).** Card shape is frozen to §4 (do not invent variants), including `isTransfer` and `lastConfidence`. The only query `spec-10` runs in v1 (`loadDueQueue`, single-field `dueAt` `<=` + `orderBy`) is covered by Firestore's automatic single-field index, so `indexes.json` needs no composite and stays empty (gate Issue #14: do not pre-create the `(schemaId,dueAt)` composite — method grouping is in-memory; an unused composite is drift). A composite is added only when a spec actually issues a `schemaId==` server-side query. New progression collection routes through a Function (rules deny client writes).
- **R12 (client-supplied state is spoofable — timestamps AND results).** `submitReview` and the card-creation write phase (`writeCardsForCompletion`) derive all time from server `new Date()` / `FieldValue.serverTimestamp()`; `nextSchedule` takes `now` as an injected `Date` parameter (server-supplied) — no `Date.now()` inside the pure module. The callable never reads a client-supplied timestamp. **The `pass`/`fail` is likewise server-derived:** `submitReview` grades the raw `answer` against the fixture beat's accept-list (via `loadLesson`) and ignores any client-asserted result — otherwise a client could POST `pass` and mint gold (`spec-11`) for a wrong answer. This is the frozen-contract change flagged for README §4.
- **R7 (`needsReview` ↔ `dueAt` coherence).** Both signals are kept and documented as independent: `needsReview` is the per-lesson review flag (set/cleared exactly as today in `completeLesson`); `dueAt` is per-beat. Card creation does not touch `needsReview`; a comment at the call site records that downstream UX branches review-vs-first-attempt.
- **R2 (graded-beat set is shared truth).** The graded-beat predicate is the single `src/lesson/mastery.ts` definition; the `functions/` copy is guarded by a sync test so the two never drift.
- **R5 (don't stub foundations).** `schemaId` on cards is written as `''` until `spec-00`'s tagging lands (the field exists and is denormalized now so `spec-10` can query it the moment backfill completes); no foundation is stubbed away — the card schema is complete.

---

## 12. Definition of Done

- `./node_modules/.bin/vitest run` green (incl. new `scheduling.test.ts` + any sync test).
- `tsx scripts/validate-fixtures.ts` passes (unchanged behavior).
- `./node_modules/.bin/eslint .` clean on all touched files (`src/progress/scheduling.ts`, `src/content/schema.ts`, `src/auth/userDoc.ts`, `src/auth/AuthProvider.tsx`, `src/auth/authContext.ts`, `src/pages/OnboardingSurvey.tsx`, `src/pages/ProfilePage.tsx`, `src/progress/functions.ts`, `functions/src/review.ts`, `functions/src/index.ts`).
- `npm run test:rules` green (reviews-deny + targetInterviewDate-allow tests), where Java/emulator is available; otherwise reviewed by inspection and the rules block matches the milestones template verbatim.
- Functions typecheck/build passes; `completeLesson` creates one card per card-eligible beat (graded-required ∪ `heldOut`) when the card is **absent** — on first completion AND on a replay that finds it missing (existing-user backfill §5d) — and **never resets** an existing card (per-card existence guard; covered by a Functions test or documented manual emulator check).
- `submitReview` is **server-grade**: it accepts the raw `answer` payload (no client `result`), grades it against the fixture beat's accept-list via `loadLesson` **before** `nextSchedule`, and returns the server-graded `result`. A wrong answer can never produce a `pass`.
- A per-interval outcome analytics event `{cardId, schemaId, intervalDays elapsed, result, lapses}` fires once per `submitReview` (feeds spec-04 — **UNTUNED — revisit per spec-04 (efficacy measurement)**).
- Manual `/dev` onboarding + profile date flows verified (§10).
- SM-2 constants carry an explicit "UNTUNED — revisit with retention data" comment (D4).
- README §4 Foundation A is satisfied exactly for the **card shape** — `ReviewCardSchema` and the written card include **all** §4 fields (`isTransfer`, `lastConfidence` included); `confidence → lastConfidence`; the card-creation predicate is graded-required ∪ `heldOut` (transfer cards → `isTransfer:true`, `track:'B'`); normal-card track resolves with a final `?? 'A'` fallback.
- **Frozen-contract change flagged for README §4:** the `submitReview` signature is now **server-grade** `{cardId, answer, confidence?}` (returns a server-graded `result`), replacing §4's `{cardId, result, confidence?}`. README §4 (and §4.5's `submitReview` callable note) must be updated to match — a client-asserted `result` is no longer accepted (R12). No new shared field is introduced beyond `userDoc.targetInterviewDate` (already in §4) and the card's `schemaId: ''` placeholder convention (until `spec-00` backfill).
- `firestore.indexes.json` carries **no** `(schemaId,dueAt)` composite (gate Issue #14 — speculative; method grouping is in-memory in `spec-10`); only the automatic single-field `dueAt` index backs `loadDueQueue`.
