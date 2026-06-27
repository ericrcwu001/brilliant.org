# spec-11 — Honest delayed mastery & transfer-gated medallions

**Status:** Planned
**Phase:** Phase 1 (Logic)
**Depends-on:** spec-01 (time axis / `reviews/{cardId}` + `submitReview` + card creation that sets `isTransfer` from `BeatSchema.heldOut`), spec-10 (SR engine + recommender wiring), **spec-24 (Track-B transfer-problem content — SOLID edge, not optional)**. spec-01 and spec-11 both edit `completeLesson`; spec-01 lands first (§7). **Two-stage shipping (README §7):** the Track-A gold gate (delayed re-retrieval) ships in Phase 1 with **no** dependency on spec-24; the Track-B gold gate (transfer) is **non-functional until spec-24 lands** the held-out transfer content — so `24 → 11` is a solid dependency for the Track-B half, not a parenthetical aside. See §1 "Two-stage shipping".
**Implements:** Decision **D7** (honest mastery), brainlift app-action **#2** (honest mastery), transfer-gated medallions. This single mechanism unifies "honest mastery" + "transfer-gated medallions".

> Read [`README.md`](README.md) §1 (corrected premises), §3 (D7), §4 (Foundation A `reviews/{cardId}`), and §8 (R2, R3, R5) before implementing. The shared contracts in §4 are authoritative — this spec consumes them by name and does not redefine them.

---

## 1. Goal & non-goals

**Goal.** Make gold mastery *honest*: (a) hints used **while learning** no longer bar gold, and (b) gold is only minted after a **delayed (≥1 day) success** routed through the SR system — Track A re-retrieves the *same* checkpoint problem cold; the quant-intensity gate (Track B `OR` `learningGoal === 'interview'`) must pass a held-out **transfer** problem (same method, fresh surface). **Silver** still awards instantly on completion (unchanged). **Gold mints asynchronously** when a qualifying review passes, by setting `progress.derived.mastered = true`.

**Two-stage shipping (SOLID dependency on spec-24 for Track B — README §7).** This spec ships in two stages, not one:
- **Stage 1 (Phase 1, no spec-24 needed):** the **Track-A** gold gate is fully functional — a delayed re-retrieval pass on the same checkpoint card mints gold. All the logic (`computeMastered` forgiving hints, the `completeLesson` change, `qualifiesForGoldMint`, the `submitReview` mint branch, the `heldOut` exclusion in `LessonPlayer`) lands and works for Track A.
- **Stage 2 (gated on spec-24):** the **Track-B** gold gate is **non-functional until spec-24 authors the held-out transfer content**. Until then, Track-B/quant-intensity lessons have no `isTransfer` card, so `qualifiesForGoldMint` returns false for them and they stay silver (honest interim — §3.3 R5). The `24 → 11` edge is therefore a **solid dependency** for the Track-B half of D7, not optional. Do not claim Track-B gold "works" before spec-24 ships.

**Non-goals.**
- Building the SR card schema, the SM-2 module, the `submitReview` callable, or the queue/recommender — those are spec-01 / spec-10. This spec *consumes* them and adds the gold-mint branch.
- Authoring the transfer problems themselves — that is **spec-24, a solid prerequisite for the Track-B gold gate** (not parenthetical). This spec defines how a transfer card is *recognized* (reads `card.isTransfer`, written by spec-01 from `BeatSchema.heldOut`) and *gates* gold, and degrades gracefully (Track-B gold simply cannot mint) until spec-24 ships content (R5).
- Changing silver semantics, unlock gating, the streak, or the celebration (`size==='lg'`) medallion.
- No scheduled Cloud Function / push (D14) — gold mints inside the `submitReview` call that passes. A consequence (preserved as a **deliberate** D14 deferral, not an oversight): gold can only mint when the user **voluntarily returns** and submits a delayed review. There is **no reminder, push, or scheduled job** that pulls them back, so a user who never returns stays at **silver indefinitely** even if they would have passed. This is the honest interim cost of D14 (no scheduled function / push in v1); re-engagement (reminding non-returning users to do their due review) is **flagged for a future re-engagement spec**, not built here.

---

## 2. Current reality (verified, with file:line)

**Two sources of truth for "mastered" (README §1 #2, R2 — confirmed):**

1. **`progress.derived.mastered`** (frozen at completion). Written by `completeLesson` from the **client-supplied** `data.derived.mastered` via `buildDerived` (`functions/src/index.ts:90-111`, used at `:178`). On replay it is **upgrade-only**: `improveMastered = nowMastered && !wasMastered`, and the patch only ever writes `derived: { mastered: true }` (`functions/src/index.ts:153-168`). It never demotes.
   - This frozen field is what the **medallion gold tier** reads, client-side: `lessonAced(p) => p?.derived?.mastered === true` (`src/habit/milestones.ts:180-182`), via `isMilestoneMastered` (`:187-196`) / `isMilestoneMasteredForCourse` (`:202-217`), which `ConceptMedallion` renders as `mastered ? gold : silver` (`src/habit/ConceptMedallion.tsx:44-49,58`).
2. **Live `maxHintLevelByBeat`** snapshot. The recommender reads `snapshots/{lessonId}.interactionState.maxHintLevelByBeat` (`src/progress/recommend.ts:19-45`) and recomputes mastery with `masteredFromLive` (`src/progress/recommend.ts:52-58`) — independent of the frozen flag, by design (comment at `recommend.ts:1-8`).

**Mastery definition today (the thing we are changing):**
- `computeMastered(beats, maxHintLevelByBeat)` returns true iff **every** required graded beat has high-water hint level `0` — i.e. **zero hints ever** (`src/lesson/mastery.ts:31-37`). `masteredFromLive` is a byte-for-byte mirror of this (`recommend.ts:52-58`).
- Computed **client-side** in `LessonPlayer.tsx`: `const mastered = computeMastered(visibleBeats, maxHintLevelByBeat)` (`src/lesson/LessonPlayer.tsx:154`), then sent to `completeLesson` inside `derived` (`LessonPlayer.tsx:315-327`). Mastery "computes client-side, persists server-side" (R3).

**Medallion award path:**
- Silver = milestone doc exists (`users/{uid}/milestones/{id}`), awarded instantly by `awardMilestonesForCompletion` (`functions/src/milestones.ts:71-131`), called from `completeLesson` (`functions/src/index.ts:208-213`). **Unchanged by this spec.**
- Gold = silver **and** `derived.mastered === true` for the backing lesson(s). That is the only lever this spec moves.

**SR / delayed infra (built by spec-01/10, consumed here):**
- `users/{uid}/reviews/{cardId}` (`cardId = ${lessonId}__${beatId}`) with `track`, `schemaId`, `dueAt`, `suspended`, etc. (README §4 Foundation A). At time of writing `functions/src/review.ts` does **not** exist yet (verified: `ls functions/src/review.ts` → absent) — spec-01 creates it. This spec **adds a branch inside** `submitReview`.
- A review's pass/fail and whether it is a **same-checkpoint re-retrieve** vs a **transfer** problem is what selects the Track-A vs Track-B gold gate.

**Discrepancy noted vs the brief.** The brief and README §1 #2 phrase the medallion source as a distinct "frozen `derived.mastered`" vs the recommender's live read. Verified: the medallion does read the *frozen* `derived.mastered`, and the recommender reads the *live* snapshot — so R2 holds — but both *currently compute the identical zero-hint predicate*. After this spec they diverge in **meaning** (see §4.3): `derived.mastered` becomes "delayed check passed", while the recommender's live struggle signal keeps driving *what to re-surface*. The R2 test must assert both ends after the change.

---

## 3. Design

### 3.1 Redefine `computeMastered`: hints are forgiven

`computeMastered` stops meaning "zero hints ever". It now means **"the required graded beats were answered (completed) during the lesson"** — i.e. the in-lesson bar for *eligibility to earn gold later*, with hints forgiven. Concretely it returns true iff there is ≥1 required graded beat (unchanged guard) — hint level no longer matters. Gold is **not** granted here anymore; passing `computeMastered` at completion now only means "this lesson is a gold *candidate*; a delayed check will decide."

Rename the *concept* but keep the **function name and call sites stable** (R2/R3: do not churn the snapshot/recommender contract). The function keeps its signature; only its predicate changes. Add a doc comment making the new meaning explicit.

> **Recommender coherence (R2).** `masteredFromLive` (`recommend.ts:52-58`) must stay the *struggle* signal that decides what to re-surface — it should **keep** the zero-hint predicate so the recommender still points at hinted beats for review. We therefore **do not** point `masteredFromLive` at the new `computeMastered`. Instead we give it its own clearly-named local predicate so the two intents can't be accidentally merged. This is the core R2 reconciliation: *"earned gold"* (delayed, in `derived.mastered`) and *"needs review"* (live hint struggle, in the recommender) are now genuinely different questions and have different code.

### 3.2 Silver instant, gold delayed — what `completeLesson` writes

At completion, `derived.mastered` must be **`false`** (gold is no longer earnable at completion). The medallion shows **silver** the instant the milestone doc is written (unchanged path). The lesson becomes a **gold candidate**: spec-01's `completeLesson` extension creates the first `reviews/{cardId}` card(s) for the lesson's graded checkpoint beats (README §4 write-path). This spec only requires that `derived.mastered` is no longer set true at completion.

### 3.3 Async gold mint (the new path) — inside `submitReview`

Gold mints when a **qualifying delayed review passes**. spec-01 owns `submitReview` (in `functions/src/review.ts`); this spec adds the gold-mint branch to it. A review **qualifies to mint gold** when all hold:

1. The review's **server-graded** result is a pass (R13). The mint reads the result the **server** produced by checking the submitted answer against the card's fixture accept-list — **not** a client-supplied `result` string. A client cannot fake gold by POSTing `result: 'pass'`: `submitReview` re-grades the answer server-side (spec-01/10 own the grading), and only that server verdict reaches `qualifiesForGoldMint`. A wrong answer submitted with `result: 'pass'` is graded `fail` server-side and mints nothing.
2. The card's `lastReviewedAt` was ≥ **1 day** before server `now`, **or** `reps >= 1` already (i.e. this is not the same-day first sit) — concretely: the card existed and was created/last-reviewed on an earlier local day. Use server time only (R12). The simplest robust rule: **the card's `createdAt` is on an earlier UTC day than the server `now`** (a delayed retrieval), which the SM-2 scheduling already guarantees because the first interval is ≥1d.
3. **Track gate** (see §5): Track A — the passing card is the **same checkpoint** problem (`cardId` corresponds to an in-lesson graded beat). Quant-intensity gate — the passing card must be a **transfer** card for that lesson (`card.isTransfer === true`, written by spec-01 at card creation from `BeatSchema.heldOut` — README §4; this spec only reads it, §6.1).

On a qualifying pass, mint gold for that lesson by setting `progress.derived.mastered = true` (Function-written; mirrors the existing upgrade-only write at `index.ts:160-168`). Re-use the **upgrade-only, idempotent** discipline: only ever write `mastered: true`, never demote. This keeps the medallion read (`lessonAced`) correct and never regresses an earned gold (R2).

> **Existing-user note (gold-preserving; upgrade-only).** Because every write to `derived.mastered` is upgrade-only and never demotes, existing completions that already earned gold under the old zero-hint rule **keep their gold** — this spec never revokes it. But existing users who currently hold only **silver** have **no `reviews/{cardId}` cards** (the cards are created at completion, and they completed before spec-01 shipped), so there is nothing for `submitReview` to pass and they **cannot earn gold** until spec-01's existing-user **card backfill** seeds their checkpoint (and, post-spec-24, transfer) cards. Until that backfill runs, an existing silver user stays silver — honest, not broken (R5). New gold for existing users is therefore blocked on spec-01's backfill, not on this spec.

**`reviews/{cardId}.suspended` ownership (spec-01 §5a / README §4).** spec-01 initializes every card with `suspended: false` and hands the field to this spec ("set true when gold via transfer is reached — maintenance cadence only"). spec-11 honors that contract here: when a **transfer** card (`card.isTransfer === true`) mints gold, the same transaction flips that card to `suspended: true`, so the queue drops it to maintenance cadence. A Track-A same-checkpoint card is **not** suspended — that card stays in the active SR rotation (the field is documented specifically for the transfer/gold-reached case), so spec-11 only writes `suspended` on the transfer-card branch. `submitReview`'s SM-2 write (spec-01 §5a step 6) is a `merge` write and never touches `suspended`, so this is the field's only writer. The card write joins the same transaction as the progress write, keeping the two coherent and idempotent (never re-write once already gold).

```
// functions/src/review.ts  (branch added by spec-11 inside submitReview, after the SM-2 card write)
// Gold mint: an honest, delayed pass on a qualifying card upgrades the lesson to gold.
// `result` here is the SERVER-GRADED verdict (spec-01/10 grade the submitted answer against the
// card's fixture accept-list); it is NOT the client-supplied result string (R13). A client cannot
// fake gold by POSTing result:'pass' — a wrong answer is graded `fail` server-side and never reaches here.
if (result === 'pass' && qualifiesForGoldMint(card, now, track)) {
  const progressRef = db.doc(`users/${uid}/progress/${card.lessonId}`)
  const cardRef = db.doc(`users/${uid}/reviews/${cardId}`)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(progressRef)
    const already = (snap.get('derived') as { mastered?: boolean } | undefined)?.mastered === true
    if (already) return                       // idempotent; never re-write
    tx.set(progressRef, {
      derived: { mastered: true },            // merge:true deep-merges (matches index.ts:167)
      updatedAt: FieldValue.serverTimestamp(),
      schemaVersion: PROGRESS_SCHEMA_VERSION,
    }, { merge: true })
    // spec-01 §5a hands `suspended` to spec-11: a transfer card that reaches gold
    // drops to maintenance cadence. Track-A checkpoint cards stay in active rotation.
    if (card.isTransfer === true) {
      tx.set(cardRef, {
        suspended: true,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    }
  })
}
```

`qualifiesForGoldMint(card, now, track)` is a **pure** helper (testable; in `functions/src/review.ts` or a small `functions/src/goldMint.ts`):

```
// Track A: any qualifying delayed pass on a checkpoint card mints gold.
// Track B / quant-intensity: only a delayed pass on a *transfer* card mints gold.
export function qualifiesForGoldMint(
  card: { createdAt: Timestamp; isTransfer?: boolean },
  now: Date,
  track: 'A' | 'B',
): boolean {
  if (!isLaterUtcDay(card.createdAt.toDate(), now)) return false   // delayed ≥1 day (R12: server now)
  return track === 'A' ? true : card.isTransfer === true
}
```

> **R5 graceful degradation.** Until spec-24 authors transfer content, Track-B lessons have no transfer card, so `qualifiesForGoldMint` is never true for them → Track-B users stay **silver**. That is the correct, non-broken interim state (silver is honest; gold is simply not yet attainable). The medallion gallery still renders; nothing throws.

> **k-of-n noise (v1 accepts a single delayed pass).** v1 mints gold on a **single** delayed pass, which is statistically noisy — one lucky retrieval can mint gold. This is accepted for v1 for two reasons: (1) gold is **upgrade-only**, so a noisy early mint is not catastrophic and a genuinely-mastered learner still mints on any later pass; and (2) a robust k-of-n gate needs **>1 authored transfer item** per lesson for the Track-B half, which is a real **spec-24** content cost (spec-24 authors ~1 transfer problem per lesson today). **FUTURE:** strengthen the gate by requiring `card.reps >= 2` (the `reps` counter already exists in the Foundation A card shape — README §4) **or** passes on **2 distinct transfer items**. If k-of-n is later adopted, **defer the `suspended: true` (transfer-gold) flip until the n-th qualifying pass** so a transfer card is not dropped to maintenance cadence before the gold gate actually closes.

### 3.4 The two meanings of "mastered" after this spec (R2 reconciliation table)

| Question | Where it lives | Predicate after spec-11 |
|---|---|---|
| **Did the user earn gold?** (medallion tier) | `progress.derived.mastered` (frozen, Function-written) | true only after a qualifying **delayed** pass (§3.3). False at completion. |
| **What should we re-surface for review?** (recommender) | live `snapshots/.maxHintLevelByBeat` via `masteredFromLive` | **unchanged** zero-hint struggle predicate (`recommend.ts:52-58`). |
| **Is this lesson a gold candidate?** (in-lesson, at completion) | `computeMastered` result, sent in `data.derived` | now "graded beats completed" (hints forgiven) — but **no longer written as `mastered: true`** (§3.2). |

---

## 4. Step-by-step implementation

> spec-01 must have landed (creates `functions/src/review.ts`, `submitReview`, the `reviews` card write at completion, and `PROGRESS_SCHEMA_VERSION` is already exported from `index.ts`). If it has not, **stop and coordinate** — do not stub the card schema (README §0.5).

1. **Forgive hints in `computeMastered`.** Edit `src/lesson/mastery.ts:31-37`. Keep the signature; change the body so it no longer checks hint levels.
   ```ts
   // Gold candidacy at completion: the required graded beats were completed.
   // Hints used WHILE LEARNING are forgiven (D7) — gold is earned later via a
   // delayed SR check (spec-11 §3.3), not by a zero-hint first sit. Returns
   // false only when there are no graded beats to retrieve.
   export function computeMastered(beats: Beat[], _maxHintLevelByBeat: Record<string, number>): boolean {
     return gradedRequiredBeatIds(beats).length > 0
   }
   ```
   Keep the `maxHintLevelByBeat` parameter (prefixed `_`) so the `LessonPlayer.tsx:154` call site and tests need no churn. Update the file header comment (`mastery.ts:1-5`) to state the new meaning.
   → **verify:** `./node_modules/.bin/vitest run src/lesson/mastery.test.ts` (after test edits in step 7); `grep -n maxHintLevelByBeat src/lesson/mastery.ts` shows the param still present.

2. **Stop minting gold at completion (server).** Edit `functions/src/index.ts`. In `buildDerived` (`:90-111`) set `mastered: false` unconditionally (gold is delayed):
   ```ts
   mastered: false,   // spec-11: gold is no longer earned at completion; minted later by submitReview (§3.3)
   ```
   In the **replay** branch (`index.ts:153-168`), remove the silver→gold upgrade-on-replay: delete the `improveMastered` computation and its `patch.derived = { mastered: true }` write, keeping only the `clearReview` handling. (Replays are reviews, but the *honest* gold path is now `submitReview`, not lesson replay.)
   → **verify:** `grep -n "mastered" functions/src/index.ts` shows no `derived: { mastered: true }` in `completeLesson`; `grep -n improveMastered functions/src/index.ts` returns nothing.

3. **Exclude `heldOut` transfer beats from the visible/required walk (spec-11 OWNS this — README §5, §8 R6, gate Issue #10).** A held-out transfer beat (`BeatSchema.heldOut === true`, authored by spec-24) is a Track-B gold-gate problem that must **only** ever be served by the SR queue (spec-10/20) as a delayed retrieval — it must **never** render inline in the normal lesson flow, or a learner would see the transfer problem the same day and the Track-B gold gate would be meaningless. Edit the `visibleBeats` memo in `src/lesson/LessonPlayer.tsx:75-81` to drop held-out beats from the walk:
   ```ts
   const visibleBeats = useMemo(
     () =>
       lesson.beats.filter(
         (b) =>
           !b.heldOut &&                                   // spec-11: held-out transfer beats are SR-queue-only (never in normal flow)
           (!b.track || b.track === 'both' || b.track === track),
       ),
     [lesson, track],
   )
   ```
   Because `visibleBeats` is the single source for the index walk, `completedBeats`, the `isLast` check (`:144`), and the `computeMastered(visibleBeats, …)` call (`:154`), this one filter keeps held-out beats out of the visible flow **and** out of the gold-candidate computation, with no other LessonPlayer change. The Cloud Function's required-beat check is unaffected: transfer beats are `required:false` (README §4), so excluding them never trips completion. (The `mastered` value sent from `:154,325` is now only a "gold candidate" signal the server ignores for gold — §3.2; add a one-line comment at `:152-154` noting this.)
   → **verify:** `grep -n "heldOut" src/lesson/LessonPlayer.tsx` shows the exclusion in the `visibleBeats` filter; `grep -n "computeMastered" src/lesson/LessonPlayer.tsx` unchanged; app still type-checks. (Depends on `BeatSchema.heldOut` existing — spec-24; the boolean field is optional so the filter is a safe no-op before spec-24 lands.)

4. **Add the gold-mint helper.** Create `functions/src/goldMint.ts` with the pure `qualifiesForGoldMint` + `isLaterUtcDay` (§3.3). Export both.
   → **verify:** `./node_modules/.bin/vitest run functions/src/goldMint.test.ts` (step 8).

5. **Wire the mint branch into `submitReview`.** Edit `functions/src/review.ts` (spec-01's file): after the SM-2 card write commits, run the gold-mint branch from §3.3, reading `track` and the transfer flag off the card (§6.1). Use server `now` (R12). Make the progress write idempotent + upgrade-only (never demote). In the same transaction, set `suspended: true` on the card **only when it is a transfer card** (`card.isTransfer === true`) — this is the `reviews/{cardId}.suspended` writer handed to spec-11 by spec-01 §5a / README §4 ("set true when gold via transfer is reached"). Do **not** suspend Track-A checkpoint cards.
   → **verify:** `grep -n "qualifiesForGoldMint\|derived: { mastered: true }\|suspended: true" functions/src/review.ts` shows the branch and the transfer-card suspend write.

6. **Medallion / catalog reads — confirm no change needed.** `lessonAced` / `isMilestoneMastered` (`src/habit/milestones.ts:180-217`) and `ConceptMedallion` (`src/habit/ConceptMedallion.tsx:44-58`) read `derived.mastered` and require **no edit** — they automatically reflect the delayed gold once the Function writes it (the gallery uses a realtime listener, `subscribeEarnedMilestones` / progress subscription). Update only the tooltip copy in `ConceptMedallion.tsx:13-16` so silver/gold reflect the new meaning:
   ```ts
   gold: 'Gold: mastered — passed a delayed retrieval',
   silver: 'Silver: completed; gold unlocks after a spaced review',
   ```
   → **verify:** `grep -n "delayed retrieval\|spaced review" src/habit/ConceptMedallion.tsx`.

7. **Update `mastery.test.ts`** (see §7).
   → **verify:** `./node_modules/.bin/vitest run src/lesson/mastery.test.ts`.

8. **Add `goldMint.test.ts`** (see §7).
   → **verify:** `./node_modules/.bin/vitest run functions/src/goldMint.test.ts`.

9. **Add the R2 two-source test** (see §7) — asserts medallion tier (frozen path) and recommender (live path) after the change.
   → **verify:** `./node_modules/.bin/vitest run src/progress/recommend.test.ts src/habit`.

10. **Lint + fixtures.** `./node_modules/.bin/eslint` on touched files; `tsx scripts/validate-fixtures.ts`.
    → **verify:** both green.

---

## 5. Two-track behavior

| | **Track A** (gentle default) | **Quant-intensity gate** (Track B `OR` `learningGoal === 'interview'`) |
|---|---|---|
| Hints during learning | Forgiven (no longer bar gold) | Forgiven |
| Silver | Instant on completion | Instant on completion |
| **Gold gate** | Pass a **delayed re-retrieve of the SAME checkpoint** problem cold (any qualifying card, `qualifiesForGoldMint` track `'A'`) | Pass a **delayed held-out TRANSFER** problem (same `schemaId`, fresh surface; `card.isTransfer === true`) — authored in spec-24 |
| If transfer content missing | n/a | Stays **silver** (honest interim; R5) — never errors |

Track is read from the **card's `track` field** (README §4 Foundation A — set at card creation from `progress.track` / `userDoc.defaultTrack`), so the gate is consistent with whatever track owned the lesson. Do **not** re-derive track in `submitReview` from a client arg (R12 spirit — server-trusted state).

---

## 6. Data / schema deltas

This spec adds **no new `reviews/{cardId}` field** — `isTransfer` is already in the Foundation A shape and is **written by spec-01**, not this spec. This spec only *reads* it:

### 6.1 Consumed (not new) field — `reviews/{cardId}.isTransfer`

- **`reviews/{cardId}.isTransfer: boolean`** — already in the Foundation A shape (README §4 line 120). **The writer is spec-01's card-creation path** (`writeCardsForCompletion` in `functions/src/review.ts`): per README §4 "Card-creation predicate", spec-01 creates a card for every graded-required beat **and** every `heldOut` transfer beat, and on a transfer card (`BeatSchema.heldOut === true`, authored by spec-24) sets `isTransfer: true` and `track: 'B'`. So the **source of truth is `BeatSchema.heldOut` → `card.isTransfer`, set at card creation by spec-01** (resolves gate Issue #1/#9). This spec does **not** set, derive, or re-flag `isTransfer`; it only reads `card.isTransfer` in `qualifiesForGoldMint` to enforce the Track-B transfer gate. No "stored boolean vs derive-from-naming" choice is left open — the README froze it: spec-01 writes the boolean from `beat.heldOut`.

### 6.2 Owned (not new) field — `reviews/{cardId}.suspended`

- **`reviews/{cardId}.suspended: boolean`** — already in the Foundation A shape (README §4 line 120; spec-01 §5b initializes it `false`). spec-01 §5a explicitly hands the *write* to this spec ("set true when gold via transfer is reached … maintenance cadence only"). spec-11 is the field's sole writer: it flips `suspended: true` on a **transfer** card in the same transaction as the gold mint (§3.3). No shape change — this spec only defines *when* the existing field is written, closing the ownership handoff so the field is not left orphaned at `false`.

No other schema changes. `progress.derived.mastered` already exists (`schema.ts:758`); we change *when* it is written, not its shape. No new index (the mint reads a single `progress/{lessonId}` doc by id and writes the card by id).

---

## 7. Tests

**`src/lesson/mastery.test.ts`** (edit `computeMastered` block, `:19-39`):
- Replace the "zero hints" assertions: gold candidacy is now **true even with hints** — `expect(computeMastered(beats, { 'failure-edge': 3 })).toBe(true)`.
- Keep: `computeMastered([], {})` is **false** (no graded beats).
- Keep the `bumpMaxHintLevel` and `gradedRequiredBeatIds` blocks unchanged.

**`functions/src/goldMint.test.ts`** (new, pure):
- Track A: a card created on an earlier UTC day, `result pass` → `qualifiesForGoldMint(card, now, 'A') === true`.
- Track A: a card created the **same** UTC day → `false` (not delayed).
- Track B: delayed pass on a **checkpoint** card (`isTransfer` absent) → `false`.
- Track B: delayed pass on a **transfer** card (`isTransfer: true`) → `true`.
- `isLaterUtcDay` boundary cases (same day, next day, far future).

**`functions/src/review.test.ts`** (new or extend spec-01's): integration-style with a fake Firestore (mirror `streaks.test.ts` style):
- Track A delayed pass mints `derived.mastered: true` exactly once (second pass is a no-op — idempotent, never re-writes).
- Track B delayed pass on a checkpoint card does **not** mint; on a transfer card it **does**.
- Track B transfer-card mint also sets `card.suspended: true`; a Track-A checkpoint-card mint leaves `suspended` **false** (only transfer cards are suspended — §3.3 / §6.2).
- A `fail` never mints; an already-gold lesson is never demoted (and `suspended` is not re-written on the idempotent second pass).
- **Server-graded gate (R13):** a **wrong** answer submitted with a client-claimed `result: 'pass'` is graded `fail` server-side and does **NOT** mint gold (`derived.mastered` stays `false`) — proving the mint keys off the server's grading verdict, not the client-supplied `result` string. A client cannot fake gold by POSTing `result: 'pass'`.

**R2 two-source assertion** (new test in `src/progress/recommend.test.ts` or a small `src/habit/milestones.test.ts` addition): after the change, with a hinted-but-completed lesson:
- **Medallion path:** `isMilestoneMastered(milestoneId, { [lessonId]: { derived: { mastered: false } } })` is **false** at completion, and **true** once `derived.mastered` is set (simulating the delayed mint).
- **Recommender path:** `masteredFromLive(beats, { someBeat: 2 })` is still **false** (hinted → still recommended for review) — proving the recommender's struggle signal is **decoupled** from the new gold semantics.

**Fixture validation:** `tsx scripts/validate-fixtures.ts` (no fixture shape change here; just confirm green).

**Manual `/dev` check (no Firebase needed):** load a `/dev/*` lesson route, finish a lesson using hints → done note shows completed/silver (not "fully mastered" gold). Then exercise the dev review path (spec-10's queue / `/dev` review harness) to confirm a delayed pass flips the medallion to gold. If spec-10's `/dev` review surface is not ready, assert via the unit/integration tests above and note it.

---

## 8. Foolproofing (§8 items this spec satisfies)

- **R2 — Two mastery sources of truth (CRITICAL).** This spec is the canonical R2 case. We change `derived.mastered` (frozen, medallion) to *delayed gold* and **explicitly keep** `masteredFromLive` (live, recommender) as the zero-hint struggle predicate (§3.1, §3.4). Step 9 adds a test asserting **both** the medallion tier and the recommender after the change. We never collapse the two predicates into one function.
- **R3 — Mastery computes client-side, persists server-side.** `computeMastered` still runs in `LessonPlayer` and is sent in `data.derived`, but the server no longer trusts it for gold (§3.2); gold is server-minted in `submitReview` (R3-safe: the snapshot-writer's silent offline failure can no longer fake gold, because gold requires a delayed pass **whose result is SERVER-GRADED against the fixture accept-list** — a client cannot fake gold by POSTing `result: 'pass'` (R13). The mint reads the server's grading verdict, never the client-claimed result).
- **R5 — Missing foundations silently degrade.** Track-B gold depends on spec-24 transfer content; until it exists, `qualifiesForGoldMint` returns false for Track B → silver stays (honest), nothing throws (§3.3 note). We do not stub a transfer card.
- **R6 — Held-out transfer beats must not render in normal flow (spec-11 OWNS this — README §8 R6).** Step 3 excludes `heldOut` beats from the `visibleBeats` walk in `LessonPlayer.tsx`, so a held-out transfer problem is served **only** by the SR queue (spec-10/20) as a delayed retrieval, never inline. Without this, a Track-B learner sees the transfer problem the same day and the gold gate is defeated. The filter is a safe no-op until `BeatSchema.heldOut` (spec-24) exists.
- **R12 — Client timestamps are spoofable.** The delay check keys off the card's server-written `createdAt`/`lastReviewedAt` and server `now`, never a client-supplied timestamp (§3.3, §5).

---

## 9. Definition of Done

- `computeMastered` forgives hints; `completeLesson` no longer writes `mastered: true` (completion or replay).
- `submitReview` mints gold (`derived.mastered: true`, idempotent, upgrade-only) on a **delayed** qualifying pass — Track A: same checkpoint; quant-intensity gate: transfer card.
- `LessonPlayer.tsx` excludes `heldOut` transfer beats from the visible/required walk (spec-11 owns this — README §8 R6); a held-out problem never renders in normal flow.
- `submitReview` sets `reviews/{cardId}.suspended: true` on a **transfer** card at gold mint (spec-01 §5a / README §4 handoff honored; Track-A checkpoint cards are not suspended). The field is no longer orphaned at `false`.
- Medallion gallery shows silver at completion and flips to gold only after the delayed check; reads unchanged except tooltip copy.
- `reviews/{cardId}.isTransfer` is **read** (not written) here; its sole writer is spec-01's card-creation path, which sets it from `BeatSchema.heldOut` (README §4). No field is left "open"/"flagged".
- Green: `./node_modules/.bin/vitest run` (mastery, goldMint, review, recommend/habit R2 tests), `tsx scripts/validate-fixtures.ts`, `./node_modules/.bin/eslint` on every touched file.
- Manual `/dev` verification per §7 (or noted blocked on spec-10's `/dev` review surface, with unit/integration coverage standing in).
