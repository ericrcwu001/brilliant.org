# spec-10 — SR engine, queue selection & the recommender's first call site

**Status:** Planned
**Phase:** Phase 1 (Logic — consumes Phase 0 foundations)
**Depends-on:** [`spec-00`](spec-00-method-registry-and-tagging.md) (`methods.ts`, `BeatSchema.schemaId`), [`spec-01`](spec-01-time-axis-and-scheduling.md) (`reviews/{cardId}` schema, `scheduling.ts` SM-2 module, `targetInterviewDate`, rules + index, write-path seam)
**Implements:** brainlift app-actions **#1** (spaced problem-level retrieval) + **#10** (method-indexed weakness / which-method readiness); decisions **D3** (SR atomic unit = graded beat + method tag), **D4** (SM-2 + interview-date anchoring), **D14** (client computes "what's due", Functions own writes).

> Read [`README.md`](README.md) §1 (corrected premises), §3 (D3/D4/D14), §4 (Foundations A + B shared contracts — **authoritative**), §8 (foolproofing R1/R2/R4/R5/R12) before implementing. This spec **consumes** the §4 shapes; it does not redefine them.

---

## 1. Goal & non-goals

**Goal.** Turn the dead recommender into a live spaced-retrieval engine. Deliver (a) a pure **due-selection + interleave + foil** queue builder (`src/lesson/queue.ts`) that picks problem-level cards whose `dueAt <= now`, interleaves them by hidden **method** (`schemaId`), injects deliberate confusable-method foils, and is gated by a prerequisite/notation-order guard; (b) **method-indexed weakness** (resurface the weakest *method*, not the weakest lesson) extending `recommend.ts`; (c) the recommender's **first live call site** (R1) — wire it into the Study-Desk path; and (d) the **SM-2 advance body** inside `spec-01`'s `submitReview` callable (`functions/src/review.ts`) that advances the card via `nextSchedule` and writes the scheduling fields. (spec-01 owns the callable declaration + frozen `{cardId,result,confidence?}` signature; this spec fills the advance.)

**Non-goals.** The Daily-Review **hero UI / queue surface** is `spec-20` (this spec produces the data the surface renders, and a minimal wiring into `recommendedAction`). The **which-method gate beat** itself is `spec-13` (this spec only *interleaves foils* and *reserves a slot* for it). **Gold-via-delayed-check** mastery mint is `spec-11` (this spec writes the card + `lastResult`; it does not mint gold). The **difficulty governor** is `spec-21`. SM-2 math + anchoring lives in `spec-01`'s `scheduling.ts`; this spec **calls** `nextSchedule`, it does not reimplement it. No scheduled Cloud Function / push (D14).

---

## 2. Current reality (verified against source)

| Claim | Evidence |
|---|---|
| `selectWeakNode`, `recommendReview`, `masteredFromLive`, `loadMaxHintLevels` are **pure, tested, and never called in the live app**. | Defined `src/progress/recommend.ts:19,52,66,89`. Tested `src/progress/recommend.test.ts:1-72`. Grep for callers outside the file + its test returns **nothing** (only `CourseJourney.tsx` imports the *studyDesk.model* recommender, never `recommend.ts`). **R1 confirmed: dead code.** |
| The **live** entry point is `recommendedAction` in `src/pages/studyDesk.model.ts:118-145`. It returns `resume > review > start > replay` and **never touches `recommend.ts`** nor any time axis. | `src/pages/studyDesk.model.ts:118`; its only live caller is `src/pages/CourseJourney.tsx:45` (`const action = recommendedAction(nodes, progressById)`). |
| `review` is offered only when a node's `state === 'needsReview'` (`needsReview` is the permanent, Function-set flag — R7), **not** a `dueAt` time axis. There is no `dueAt` anywhere today. | `src/pages/studyDesk.model.ts:127-128`; `nodeState` reads `progress.needsReview` at `:58-59`. |
| Two mastery sources of truth (R2). `derived.mastered` is frozen at completion and only upgrades silver→gold (`functions/src/index.ts:154-167` — `improveMastered` write is `derived:{mastered:true}` only). The recommender reads the **live** `maxHintLevelByBeat` snapshot. | `functions/src/index.ts:147-167`; `src/progress/recommend.ts:3-8` (header) + `loadMaxHintLevels` `:19-45`. |
| `GRADED_BEAT_TYPES` set = `stateTap, equationTiles, answerEntry, masteryChallenge, retrievalGrid, handRanker`; `countingTree`/`selectionGrid` graded only when carrying `accept`. `gradedRequiredBeatIds(beats)` already exists. | `src/lesson/mastery.ts:11-37`. |
| `submitReview` / `functions/src/review.ts` / a `reviews` Firestore block **do not exist yet** (they are `spec-01`'s write-path seam). `firestore.rules` has blocks for snapshots/progress/milestones/streaks/interviews; **no `reviews` block**. | `functions/src/` has `index.ts, interview*.ts, interviewDraw.ts, interviewPack.ts, milestones.ts, streaks*.ts` — no `review.ts`. `firestore.rules:67-115`. |
| Client callable wrapper pattern: lazy `getFns()` + `httpsCallable<In,Out>` + unwrap `.data`. | `src/progress/functions.ts:8,59-87`. Function export pattern: re-export at bottom of `index.ts` so `initializeApp()` runs first (`functions/src/index.ts:289`). |
| `Lesson.courseId` exists (= conceptId for the queue). Notation-order tags `introducesSymbol`/`groundedBy` exist on `BeatSchema` and are **populated in most fixtures** (e.g. `lesson-combinatorics-*`, `lesson-expected-value-*`, `lesson-optimal-stopping-*`); flagship/markov fixtures carry 0. | `src/content/schema.ts:656`; `BeatSchema.introducesSymbol`/`groundedBy` at `schema.ts` (~`:651`); `grep -c introducesSymbol fixtures/*.json`. |
| Course/lesson loading: `loadCourseFromFirestore`, `loadLessonFromFirestore` (`src/content/firestoreLoader.ts:13,24`); fixture path `loadFlagshipLesson` (`src/content/loader.ts:25`). |

**Discrepancy note vs brief:** the brief says wire into "`recommendedAction` and/or the queue." Since `spec-20` owns the queue *surface*, this spec wires the recommender minimally into `recommendedAction` (a new `review` source that prefers a **due card** over the legacy `needsReview` flag) and exports the queue builder for `spec-20` to render. Both `needsReview` (R7) and `dueAt` are kept coherent.

---

## 3. Design

### 3.1 `src/lesson/queue.ts` — pure due-selection + interleave + foils (NEW)

Pure, dependency-free (node-testable like `recommend.ts`). Consumes the §4 Foundation-A `reviews/{cardId}` card shape **by name** (do not redefine — import the type from `spec-01`'s module; see §7). Input is already-loaded cards + the lessons' beats (so the prerequisite guard can see notation tags); the Firestore *read* of due cards lives in a thin async loader alongside it, mirroring `loadMaxHintLevels`.

```ts
// src/lesson/queue.ts
import type { ReviewCard } from '../progress/scheduling'  // spec-01 exports the card type
import type { Beat } from '../content/schema'
import { METHODS, type MethodId } from '../content/methods' // spec-00

export type QueueItem = {
  cardId: string          // `${lessonId}__${beatId}`
  lessonId: string
  beatId: string
  conceptId: string
  schemaId: MethodId
  kind: 'review' | 'foil' // foil = a deliberate confusable-method item (which-method context)
}

// A lesson's beats + whether each notation prerequisite is satisfied, supplied by the caller.
export type LessonOrder = { lessonId: string; beats: Beat[]; completed: boolean }

/** Pure: cards whose dueAt <= now. Server `now` is passed in (R12 — never client startedAt). */
export function dueCards(cards: ReviewCard[], now: number): ReviewCard[] {
  return cards
    .filter((c) => !c.suspended && c.dueAt.toMillis() <= now)
    .sort((a, b) => a.dueAt.toMillis() - b.dueAt.toMillis())
}

/**
 * Prerequisite/notation guard (R5): never surface a card whose beat introduces or
 * depends on notation not yet taught. A card is eligible only if its source lesson
 * is completed AND every `groundedBy` beatId of the target beat precedes it within
 * the lesson's own order. Lessons not completed are excluded outright.
 */
export function isNotationReady(card: ReviewCard, order: Map<string, LessonOrder>): boolean { ... }

/**
 * Interleave by method so no two adjacent items share a schemaId where avoidable
 * (deliberate interleaving, D3), and inject foils: for the dominant method in the
 * batch, insert a confusable sibling (a due card whose schemaId shares a `domains`
 * entry in METHODS) so the learner must discriminate. Foils are existing due cards
 * re-ordered, never synthesised. Deterministic given input order (stable for tests).
 *
 * R5 / gate Issue #6: FILTER OUT cards with a falsy/empty `schemaId` BEFORE bucketing
 * and foil-grouping — `METHODS[''] === undefined`, so reading `.domains` on an
 * un-backfilled card throws. Dropped cards degrade the queue to plain due-order
 * (handled by the caller's `dueCards` fallback); the build never throws on a
 * partially-tagged corpus.
 */
export function buildQueue(
  cards: ReviewCard[],
  order: Map<string, LessonOrder>,
  now: number,
  opts: { maxItems: number; foils: boolean },
): QueueItem[] { ... }
```

- **schemaId filter (gate Issue #6, R5)** = first, drop every card whose `schemaId` is falsy/empty (an un-backfilled card). `METHODS['']` is `undefined`, so bucketing or foil-grouping such a card would throw on `.domains`. With Foundation B incomplete this degrades the queue to plain due-order (the caller falls back to `dueCards`) instead of crashing. Only cards with a `schemaId` that keys a real `METHODS` entry are bucketed/interleaved/foiled.
- **Interleave** = round-robin by `schemaId` buckets (group the filtered due cards by method, then draw across buckets) so adjacent items differ in method. Stable: bucket order = first-appearance order; within a bucket keep `dueAt` order.
- **Confusable foils** = two methods are confusable iff `METHODS[a].domains ∩ METHODS[b].domains ≠ ∅`. When `opts.foils`, after placing a run of the dominant method, pull the next due card of a *confusable* method forward (mark `kind:'foil'`). No new content; just ordering. This *sets up* the `spec-13` which-method gate without implementing it. (Operates only on filtered, schemaId-bearing cards — never indexes `METHODS` with an empty id.)
- **Prerequisite guard** uses the existing `introducesSymbol`/`groundedBy` tags (`schema.ts`) — already in fixtures — to never surface a problem "whose notation isn't taught yet." A card is dropped if its lesson is not `completed`, or any `groundedBy` id of the target beat is not present earlier in that lesson's beat order. This is the R5 ordering guard.

### 3.2 Method-indexed weakness — extend `src/progress/recommend.ts`

Add a pure `selectWeakMethod` that aggregates the existing live struggle signal **by `schemaId`** instead of by lesson, so we "resurface the weakest method, not the weakest lesson" (#10). Reuse `gradedRequiredBeatIds` + `maxHintLevelByBeat` (the live source — R2). The existing `selectWeakNode`/`recommendReview`/`masteredFromLive` stay untouched (`selectWeakNode`/`recommendReview` are still used by tests; `masteredFromLive` is referenced by `spec-11`'s R2 test).

```ts
// append to src/progress/recommend.ts
import { METHODS, type MethodId } from '../content/methods'

export type MethodWeakness = { schemaId: MethodId; totalHint: number; beatCount: number }

/**
 * Aggregate live struggle by method. For each graded-required beat with a schemaId,
 * sum its maxHintLevel into that method's bucket. Weakest = highest total, ties → highest
 * mean, then alphabetical schemaId (stable for tests). Beats without a schemaId are skipped
 * (Foundation B is optional during backfill — R5: degrade quietly, don't throw).
 */
export function selectWeakMethod(
  lessons: { lessonId: string; beats: Beat[] }[],
  maxHintByLesson: Record<string, Record<string, number>>,
): MethodWeakness | null { ... }
```

`Beat.schemaId` is read defensively (`(beat as { schemaId?: MethodId }).schemaId`) so this compiles whether or not `spec-00` has landed the field at type level — but the **runtime** value is what matters; if absent everywhere, returns `null` and the queue/recommender fall back to the legacy lesson-level path.

### 3.3 First call site (R1) — wire into `recommendedAction`

`recommendedAction` (`studyDesk.model.ts:118`) gains a **due-card-aware review source** *ahead of* the legacy `needsReview` branch, without changing the `resume > review > start > replay` contract. Because `recommendedAction` is pure and synchronous and must stay React/Firebase-free, the **due decision is computed by the caller** (`CourseJourney.tsx`, the one live caller at `:45`) and passed in. Concretely:

- Add an optional param `reviewCardLessonId?: string | null` to `recommendedAction`. When non-null (a card is due now), the `review` branch returns `{ kind:'review', lessonId: reviewCardLessonId }` and takes priority over the `needsReview` node scan (keeping both coherent — R7). When null, behavior is **identical to today** (back-compat for all existing tests/callers).
- `CourseJourney.tsx` computes the due lesson via a new async hook that calls the queue loader (`loadDueQueue`, §3.4) and passes `buildQueue(...)[0]?.lessonId ?? null`. This is the recommender's **first live call site.** Guard it so a queue/read failure degrades to the legacy path (catch → null).

> This is intentionally minimal: `spec-20` replaces the side-card with the full Daily-Review hero rendering `buildQueue(...)`. This spec only proves the wire end-to-end and makes "Review" mean "a card is actually due."

### 3.4 `loadDueQueue` — thin async reader (in `queue.ts`)

Mirrors `loadMaxHintLevels` (lazy `firebase/firestore` import; try/catch → empty). Reads `users/{uid}/reviews` `where('dueAt','<=', Timestamp.fromMillis(now)).orderBy('dueAt')` (single-field auto-index per §4 — confirm with `spec-01`'s index decision), parses each via `spec-01`'s `ReviewCardSchema`, returns `ReviewCard[]`. `now` is the **server-trust-adjacent** client clock used only for *reads* (the authoritative write-time comparison is the Function's server `now` — R12); reading "what's due" from the client is exactly D14.

### 3.5 `functions/src/review.ts` — the SM-2 advance body inside `submitReview` (spec-01 owns the callable)

**Do not redefine the `submitReview` signature — `spec-01` owns it.** Per README §4, `submitReview` is declared by `spec-01` in `functions/src/review.ts` with the **frozen** shape:

```ts
submitReview({ cardId: string; result: 'pass' | 'fail'; confidence?: number })
```

There is **no `{lessonId, beatId}` variant** — the client derives `cardId = \`${lessonId}__${beatId}\`` and passes `cardId` (and, per D6, optional `confidence` from the Daily-Review surface, which lands in `lastConfidence`). `spec-01` declares the callable + the card create-on-first-review/completion + the pure `scheduling.ts`; **this spec fills the per-review SM-2 advance body only.** The snippet below is the body `spec-01`'s declaration wraps — not a second `onCall` registration.

```ts
// functions/src/review.ts — SM-2 advance body (spec-01 declares the surrounding onCall)
// req.data is the frozen { cardId, result, confidence? } (README §4); validation + uid live in spec-01's wrapper.
const ref = db.doc(`users/${uid}/reviews/${cardId}`)
const now = Timestamp.now() // server now — R12
await db.runTransaction(async (tx) => {
  const snap = await tx.get(ref)
  if (!snap.exists) throw new HttpsError('failed-precondition', 'No review card; finish the lesson first.')
  const card = snap.data() as ReviewCard
  const targetDate = await loadTargetInterviewDate(tx, uid) // userDoc.targetInterviewDate (spec-01/D13)
  const next = nextSchedule(card, result, targetDate) // {dueAt,intervalDays,easeFactor,reps,lapses}
  tx.set(ref, {
    ...next,
    lastResult: result,
    lastReviewedAt: now,
    lapses: result === 'fail' ? (card.lapses ?? 0) + 1 : card.lapses ?? 0,
    reps: result === 'pass' ? (card.reps ?? 0) + 1 : 0,
    ...(confidence !== undefined ? { lastConfidence: confidence } : {}), // D6 third capture site → feeds spec-12
    updatedAt: now,
  }, { merge: true })
})
```

> The advance writes **only** scheduling fields + `lastResult` (+ `lastConfidence` when supplied). It does **not** mint gold (that is `spec-11`, which reads `lastResult`/`reps` to decide the delayed-success gold mint). R2: the medallion tier (`derived.mastered`) is untouched here; the live `maxHintLevelByBeat` source is untouched. Both mastery reads survive.

Client wrapper in `src/progress/functions.ts` (mirror `recordQualifyingAction`): the Daily-Review surface (`spec-20`) calls `submitReview({ cardId, result, confidence? })` with the frozen shape. The client computes `cardId` from `lessonId__beatId`.

---

## 4. Step-by-step implementation

> Foundation-first: if `spec-00` (`methods.ts`, `BeatSchema.schemaId`) or `spec-01` (`reviews` schema, `scheduling.ts`, rules block, write-path seam) are **not yet landed**, STOP and build/coordinate them first (README §0.5 / R5). Do not stub them.

1. **Add `selectWeakMethod` to `src/progress/recommend.ts`** (§3.2), importing `METHODS`/`MethodId` from `src/content/methods.ts`. Read `schemaId` defensively. Do not modify the existing exports.
   → verify: `./node_modules/.bin/vitest run src/progress/recommend.test.ts` still green; new unit added (step 7) passes.

2. **Create `src/lesson/queue.ts`** (§3.1, §3.4): `dueCards`, `isNotationReady`, `buildQueue` (pure) + `loadDueQueue` (async, lazy Firestore, try/catch → `[]`). Import `ReviewCard`/`ReviewCardSchema` from `spec-01`'s `scheduling.ts`; `METHODS` from `methods.ts`; `Beat` from `schema.ts`.
   → verify: `./node_modules/.bin/eslint src/lesson/queue.ts` clean; file imports compile (`./node_modules/.bin/tsc --noEmit` if available, else build).

3. **Wire the first call site (R1)** — edit `src/pages/studyDesk.model.ts`: add optional `reviewCardLessonId?: string | null` param to `recommendedAction`; when non-null, the `review` branch returns it ahead of the `needsReview` scan. Default omitted → identical behavior.
   → verify: existing `src/pages/studyDesk.model.test.ts` passes unchanged; new test (step 7) for the due-card branch passes.

4. **Edit `src/pages/CourseJourney.tsx`** (`:45`): compute the due lesson via `loadDueQueue` + `buildQueue` in an effect/hook (state `dueLessonId`, init `null`, catch → `null`), pass it to `recommendedAction(nodes, progressById, dueLessonId)`. Keep the existing side-card behavior; this only changes which lesson "Review" points at when a card is due.
   → verify: `/dev/home` (`./node_modules/.bin/vite` → `http://localhost:5173/dev/home`) renders all scenarios with no console error (dev route has no Firebase → `loadDueQueue` catches → `null` → legacy behavior intact). R1 satisfied: `recommend.ts`/`queue.ts` now have a live caller.

5. **Fill the SM-2 advance body in `functions/src/review.ts`** (§3.5) — `spec-01` owns the `submitReview` callable declaration (frozen `{cardId,result,confidence?}`), its uid/validation, the card create-on-completion, and the `export { submitReview } from './review'` re-export from `functions/src/index.ts`. This step adds the transaction that loads the card, calls `nextSchedule`, and writes scheduling fields + `lastResult` (+ `lastConfidence` when supplied). If `spec-01` has stubbed the body, fill it here; do **not** add a second `onCall` or a second re-export.
   → verify: `npm run build --prefix functions` compiles; `submitReview` (spec-01's export) reflects the advance.

6. **Add/confirm the client wrapper** `submitReview({ cardId, result, confidence? })` in `src/progress/functions.ts` (mirror `recordQualifyingAction`, no timezone needed) — frozen shape, client derives `cardId` from `lessonId__beatId`. If `spec-01` already added the wrapper, this spec consumes it unchanged.
   → verify: `./node_modules/.bin/eslint src/progress/functions.ts` clean.

7. **Tests** (§7) — write `src/lesson/queue.test.ts`, extend `src/progress/recommend.test.ts`, extend `src/pages/studyDesk.model.test.ts`, add a `reviews` block to `tests/firestore.rules.test.ts` (coordinate with `spec-01`; if `spec-01` already added it, extend, don't duplicate).
   → verify: `./node_modules/.bin/vitest run` green.

8. **Confirm the Firestore index** for the `reviews` `where('dueAt','<=').orderBy('dueAt')` query exists (single-field auto-index suffices per §4; if a `schemaId`+`dueAt` query is added, the composite index must be pre-created by `spec-01`). State which query `loadDueQueue` actually uses.
   → verify: query shape documented; no composite needed for the dueAt-only read (R4 — an un-indexed query throws at runtime).

---

## 5. Two-track behavior

The **quant-intensity gate** = Track B `OR` `userDoc.learningGoal === 'interview'` (D2). This spec is foil/anchoring-gated:

| Aspect | Track A (gentle default) | Quant-intensity gate (Track B OR learningGoal==='interview') |
|---|---|---|
| Queue foils (confusable-method interleave) | `buildQueue(..., { foils: false })` — straight interleave by method, no deliberate confusables surfaced. | `{ foils: true }` — inject confusable-method foils so the learner must discriminate (sets up the `spec-13` which-method gate). |
| Interview-date anchoring of `dueAt` | Applies only if the learner set `targetInterviewDate` (D13); otherwise plain SM-2 (anchoring is a no-op when `targetDate` is undefined — handled inside `spec-01`'s `nextSchedule`). | Same mechanism; the gate audience is the one most likely to have set a date, so anchoring/volume-ramp bites. |
| Gold gate written downstream | `track:'A'` cards → `spec-11` re-retrieves the *same* checkpoint cold. | `track:'B'` cards → `spec-11` requires a held-out **transfer** problem. (This spec only persists `track` from the card; it does not branch the gate.) |

`submitReview` and SM-2 advance are **track-agnostic** (both tracks space). The `track` field on the card (set at create-time by `spec-01`) is read by `spec-11`, not here. The queue reads `opts.foils` from the caller, which derives it from the gate.

---

## 6. Data / schema changes (deltas only — see README §4 for shared shapes)

- **No new shared fields.** This spec **consumes** Foundation-A `reviews/{cardId}` (`schemaId`, `track`, `dueAt`, `intervalDays`, `easeFactor`, `reps`, `lapses`, `lastResult`, `lastReviewedAt`, `suspended`) and Foundation-B `methods.ts`/`BeatSchema.schemaId` exactly as defined — all introduced by `spec-00`/`spec-01`.
- **New code modules (not schema):** `src/lesson/queue.ts`; the **SM-2 advance body** filled into `spec-01`'s `functions/src/review.ts` (not a new file/callable — spec-01 owns `submitReview` + its frozen `{cardId,result,confidence?}` signature); appended `selectWeakMethod` in `recommend.ts`; new optional param on `recommendedAction`. The `submitReview` client wrapper is spec-01's; consumed unchanged.
- **Firestore rules:** the `reviews` block (owner read; client write **denied**; Functions write) is `spec-01`'s deliverable. This spec only adds the **rules test** for it if missing (step 7). Flag for the consistency gate: confirm `spec-01` lands the `reviews` match block before this spec's `submitReview` is exercised against the emulator.
- **Index:** `loadDueQueue` uses `where('dueAt','<=',now).orderBy('dueAt')` → single-field auto-index (no `firestore.indexes.json` entry needed). If a future method-scoped read adds `where('schemaId','==',…)`, that composite is `spec-01`'s to pre-create.

---

## 7. Tests

**Unit (vitest, node env — `./node_modules/.bin/vitest run`):**

- `src/lesson/queue.test.ts` (NEW):
  - `dueCards` returns only `dueAt<=now` and excludes `suspended`, sorted by `dueAt`.
  - `isNotationReady` drops a card whose lesson is incomplete; drops a card whose target beat has a `groundedBy` id not preceding it; accepts when all prerequisites precede.
  - `buildQueue` interleaves so adjacent items differ in `schemaId` when ≥2 methods are due; `maxItems` caps; deterministic given fixed input.
  - `buildQueue({foils:true})` inserts a `kind:'foil'` item of a **confusable** method (shared `domains`); `{foils:false}` emits no foils.
  - `buildQueue` with cards carrying a falsy/empty `schemaId` does **not** throw (gate Issue #6, `METHODS['']===undefined`): un-tagged cards are filtered out before bucketing/foiling; a corpus where every due card lacks a `schemaId` degrades to plain due-order rather than crashing.
- `src/progress/recommend.test.ts` (EXTEND): `selectWeakMethod` aggregates by `schemaId` (highest total wins, tie → highest mean → alphabetical); returns `null` when no beat carries a `schemaId` (backfill-incomplete fallback). Existing tests stay green (no edits to existing exports).
- `src/pages/studyDesk.model.test.ts` (EXTEND): `recommendedAction(nodes, progress, dueLessonId)` returns `{kind:'review', lessonId:dueLessonId}` ahead of a `needsReview` node; with `dueLessonId` omitted/null, behavior is byte-identical to current (R7 coherence).

**Function unit / integration:** `submitReview` advances the card (pass → `reps+1`, `easeFactor` per `nextSchedule`; fail → `reps:0`, `lapses+1`); throws `failed-precondition` when no card exists; uses server `Timestamp.now()` not client input (R12). Place per `functions/src` test convention (mirror `streaks.test.ts`).

**Rules (`tests/firestore.rules.test.ts`, run via `npm run test:rules` — Java/emulator):** add a `reviews` describe mirroring the milestones/interviews pattern (`:183-230`): owner can **read** a seeded `users/alice/reviews/L__b`; client write/update is **denied**; non-owner read denied.

**Fixture validation:** `tsx scripts/validate-fixtures.ts` must stay green (this spec adds no fixture fields; `schemaId` enforcement is `spec-00`'s).

**Manual `/dev` check:** `./node_modules/.bin/vite` → `http://localhost:5173/dev/home`. All scenarios render; no console errors; `loadDueQueue` catches the no-Firebase case and falls back to legacy `recommendedAction` (Review still driven by `needsReview`). Confirms R1 wiring without an emulator.

---

## 8. Foolproofing (README §8)

- **R1 — recommender is dead code.** Satisfied directly: §3.3 + step 3/4 **create the first live call site** by passing a due lesson into `recommendedAction` from `CourseJourney.tsx`, and `queue.ts` is consumed there. We do not "extend a live path" — we name and create the call site.
- **R2 — two mastery sources.** `submitReview` writes only scheduling fields + `lastResult`; it never touches `derived.mastered` (medallion tier) or `maxHintLevelByBeat` (recommender source). `selectWeakMethod` reads the **live** `maxHintLevelByBeat`, same source as `selectWeakNode`. Test asserts both reads still resolve after a review.
- **R4 — migrations permanent / index empty.** No new progression field (consumes `spec-01`'s). The only query (`dueAt<=now`) uses the auto single-field index; documented in §6 so it can't throw at runtime.
- **R5 — missing foundations silently degrade.** `selectWeakMethod`/`buildQueue` return `null`/fall back when `schemaId` is absent (backfill incomplete) instead of throwing. Specifically (gate Issue #6), `buildQueue` **filters out cards with a falsy/empty `schemaId` before bucketing/foil-grouping** — `METHODS['']` is `undefined`, so an un-backfilled corpus degrades to plain due-order rather than throwing on `.domains`. The prerequisite/notation guard (`isNotationReady`) uses existing `introducesSymbol`/`groundedBy` so a problem "whose notation isn't taught yet" is never surfaced.
- **R7 — `needsReview` permanent + asymmetric.** The new `dueAt`-driven review source sits **ahead of** the `needsReview` scan but does not remove it; when no card is due the legacy flag still drives "Review", keeping both coherent.
- **R12 — client timestamps spoofable.** `submitReview` keys SM-2 off server `Timestamp.now()`. The client `now` in `loadDueQueue` is used **only** to render what to *show*, never to write scheduling state.

---

## 9. Definition of Done

- `./node_modules/.bin/vitest run` green, including the new `queue.test.ts`, the extended `recommend.test.ts` + `studyDesk.model.test.ts`, and the `submitReview` function test.
- `npm run test:rules` green for the new `reviews` block (or confirmed covered by `spec-01`).
- `tsx scripts/validate-fixtures.ts` passes (no regression).
- `./node_modules/.bin/eslint src/lesson/queue.ts src/progress/recommend.ts src/progress/functions.ts src/pages/studyDesk.model.ts src/pages/CourseJourney.tsx functions/src/review.ts functions/src/index.ts` clean (touched files only; pre-existing `interviews/_build/*` lint errors are out of scope per AGENTS/README).
- `npm run build --prefix functions` compiles; `spec-01`'s `submitReview` export reflects this spec's SM-2 advance body.
- Manual: `/dev/home` renders all scenarios with no console errors; the recommender + queue have a live caller (R1 closed).
- A different fresh session can implement this from the file alone: every file is named, every step has a `→ verify`, the SM-2 math is delegated to `spec-01`'s `nextSchedule`, and the only cross-spec couplings (`reviews` rules block, `scheduling.ts`, `methods.ts`, `BeatSchema.schemaId`) are flagged for the consistency gate.
