# spec-03 — Retrieval-rep taxonomy (plumbing only)

- **Status:** Planned
- **Phase:** 0 (Foundations)
- **Depends-on:** spec-00 (method registry / `BeatSchema.schemaId`) — for the type, not the runtime; see Current reality.
- **Coordinates-with:** spec-13 (which-method gate) — spec-13 adds `gate` to the `prediction` member; this classifier
  detects that gate by structure (`interaction.type==='prediction' && !!interaction.gate`). See the 03↔13 note in §3.
- **Implements:** Foundation D (`README.md` §4); Decision **D10** (streak unchanged); app-action "retrieval reps" plumbing for the governor (#difficulty), calibration (#confidence), and analytics.

> This spec links back to [`README.md`](README.md). The shared contracts in §4 are authoritative; this spec
> references them by name and does **not** redefine them.

---

## 1. Goal & non-goals

**Goal.** Add the single source of truth for "is this beat a *cold-recall retrieval act*?" as a **pure, dependency-free
classifier** `src/lesson/retrievalRep.ts` (`isRetrievalRep(beat, ctx) → boolean`), exactly as specified in
`README.md` §4 Foundation D. A retrieval rep is a spaced-review problem (surfaced by the queue), a `masteryChallenge`,
or a which-method gate. It is **not** an ordinary teaching beat, primer, or sim. Expose one analytics hook
(`analytics.retrievalRep`) so downstream consumers can mark reps, and document the exact READ points the Phase-1/2
consumers (governor `spec-21`, calibration `spec-12`, analytics) will wire into — **without implementing those
features here**.

**Non-goals.**
- **Zero changes to streak behavior** (D10, foolproofing R9). This spec must not touch `functions/src/streaks.ts`,
  the `recordQualifyingAction` streak call, the streak count, or its reset rule. The classifier is read-only plumbing.
- Do **not** implement the difficulty governor (`spec-21`), the calibration/Brier computation (`spec-12`), the SR
  queue (`spec-10`), or the which-method gate (`spec-13`). This spec only *exposes* the classifier + analytics hook
  and documents where those specs read it.
- Do **not** add the SR card schema, confidence field, or method registry — those are spec-01/02/00.
- An optional informational "retrieval reps this week" stat is **allowed** but is **not** required by this spec; if
  added it must be read-only and must not alter the streak number or reset (see §6, §9).

---

## 2. Current reality (verified against the code)

| Claim | Evidence |
|---|---|
| The streak counts **required-beat completion**, once per local calendar day; it does **not** know about "retrieval reps." | `functions/src/streaks.ts:35-60` (`computeStreakUpdate`: same-day no-op, next-day +1, gap → reset to **1**); wired via `incrementDailyStreak` (`streaks.ts:98-118`). |
| The streak increment is gated on `beatDef.required`, with **no** notion of recall/method. | `functions/src/index.ts:225-279` (`recordQualifyingAction`): loads the lesson, rejects non-`required` beats (`:236-241`), upserts `completedBeats`, then best-effort `incrementDailyStreak(db, uid, data.timezone)` (`:270-275`). |
| Reset is to **1**, not 0 (premise #4 in §1 was wrong — do not "fix" it). | `functions/src/streaks.ts:54` (`const count = continues ? … : 1`). |
| There is **no** existing `retrievalRep` / `isRetrievalRep` / "which-method gate" code anywhere. | `grep -rn "whichMethod\|which-method\|isRetrievalRep\|retrievalRep" src functions/src` → no matches. |
| Graded-beat membership lives in `mastery.ts` as `GRADED_BEAT_TYPES` ∪ accept-gated `countingTree`/`selectionGrid`. **Keep it stable** (collision matrix §5; R2). | `src/lesson/mastery.ts:11` (`GRADED_BEAT_TYPES`), `:15` (`ACCEPT_GATED_BEAT_TYPES`), `isGradedBeat` `:17-25`. |
| `masteryChallenge` is a graded interaction type. | `src/content/schema.ts:224-235`; included in `GRADED_BEAT_TYPES` (`mastery.ts:11`). |
| The which-method gate is built on the **`prediction`** beat (D12, R11). Today the `prediction` member is `{ type, options }` with **no `gate` field** — `spec-13` adds `gate: { kind, correct, optionMethods }` to it (`README.md` §4.5). A `prediction` beat is a retrieval rep **only** when it carries that `gate` block; the plain (opening-bet) `prediction` is not. `patternPick` is never used (no `byOption`, ungraded). | `prediction` interaction `src/content/schema.ts:120-121`; `gate` not yet present (added by spec-13); `byOption` only on `prediction` feedback `schema.ts:594-606`; `patternPick` `schema.ts:122-131`. |
| `schemaId` (method tag) is added to `BeatSchema` by **spec-00** and is **not yet present**. | `src/content/schema.ts:608-652` (BeatSchema today has no `schemaId`); `README.md` §4 Foundation B. |
| Beat-type discriminator is `beat.interaction.type`. | `src/content/schema.ts:120` (`z.discriminatedUnion('type', …)`); accessed as `beat.interaction.type` in `mastery.ts:18`. |
| Analytics is a flat object of typed `track(...)` wrappers; fire-and-forget, skipped in emulator/dev. | `src/analytics/events.ts:70-137`. |
| Pure lesson modules are unit-tested in the node Vitest env (no React/Firebase). | `src/lesson/mastery.test.ts`, `src/lesson/hintLadder.test.ts`. |

**Spec-00 dependency note.** This spec's classifier reads `beat.schemaId` **only** through the optional context flag
(it never requires the field to be present), so it compiles and is fully testable even before spec-00 lands. The
`MethodId` *type* import is optional — see the code sketch (we keep the signature `schemaId?: string` to avoid a hard
type dependency that would block this Phase-0 spec if spec-00 is sequenced after it).

---

## 3. Design

Per `README.md` §4 Foundation D, the classifier is pure and answers one question: **is this beat a cold-recall
retrieval act?** "Cold recall" depends on *how the beat is being surfaced*, not on the beat alone — the same
`prediction` beat is a passive in-lesson prediction in one place and a which-method gate in another; the same graded
beat is teaching-context fluency the first time and a spaced-review rep when the queue re-asks it. So the classifier
takes a **context** object the caller fills in from what *it* knows.

A beat is a retrieval rep iff **any** of:
1. **Spaced-review surfacing** — `ctx.source === 'review'` (the SR queue re-asked this due problem cold). This is the
   primary retrieval signal and overrides the others: a review-surfaced *graded* beat is a rep regardless of type.
2. **Mastery challenge** — `beat.interaction.type === 'masteryChallenge'` (the in-lesson cold "show you've got it"
   checkpoint).
3. **Which-method gate** — detected **by structure**: `beat.interaction.type === 'prediction' && !!beat.interaction.gate`
   (a `prediction` beat carrying the `gate` block that `spec-13` adds, per D12/R11 and `README.md` §4.5). A plain
   `prediction` beat (the exempt opening qualitative bet) has **no** `gate` and is **not** a rep. We detect the gate
   structurally rather than relying on `ctx.role` because callers (the governor's attempt stream, calibration scoring)
   will **not** reliably thread a `role` flag through to the classifier — the only durable signal is the beat shape
   itself.

A beat is **never** a retrieval rep if it is a teaching/primer/sim/recap beat being seen for the first time in normal
lesson flow (`ctx.source !== 'review'`, not a `masteryChallenge`, not a gate `prediction`). The classifier returns
`false` by default — fail-closed.

The context object is intentionally tiny and optional-by-field so each consumer supplies only what it knows:

```ts
export type RetrievalRepContext = {
  // How the beat was surfaced. 'review' = re-asked by the SR queue (spec-10);
  // 'lesson' (default) = first pass in normal lesson flow.
  source?: 'lesson' | 'review'
  // The method tag (Foundation B / spec-00), denormalized by the queue for
  // method-weakness + interleave. Carried here so future consumers can group
  // reps by method without re-reading the beat; NOT used in the boolean today.
  schemaId?: string
}
```

The which-method gate is **not** carried on the context — it is detected from the beat itself
(`interaction.type === 'prediction' && !!interaction.gate`), because callers won't reliably thread a `role` flag
(see §3 above and `README.md` §4.5, gate Issue #4/#5). `schemaId` is carried on the context (not read for the boolean)
so the consumers in §5 have it at the same read point without a second lookup; it is the spec-00 field by name
(do not rename).

### Consumer READ points (documented, NOT implemented here)

These are the contractual call sites the Phase-1/2 specs wire. This spec only guarantees the classifier + the
analytics hook exist and have these shapes.

| Consumer | Spec | Reads `isRetrievalRep` to… |
|---|---|---|
| Difficulty governor rolling-success window | `spec-21` | Count **only** retrieval reps (not teaching attempts) into the rolling success rate that nudges fade-density/hint availability toward ~50–70%. The governor filters its attempt stream with `isRetrievalRep`. |
| Calibration scoring | `spec-12` | Mark which graded answers were **real recall** so the Brier delta is computed over reps, not in-session fluency. |
| Analytics | this spec | `analytics.retrievalRep(...)` fires when a rep is graded so the funnel/retention dashboards can count reps independent of the streak. |

**03 ↔ 13 coordination (gate Issue #5).** `spec-13` owns adding `gate: { kind, correct, optionMethods }` to the
`prediction` member of `InteractionSchema` (`README.md` §4.5; collision matrix §5 — `schema.ts` `prediction` member is
spec-13's). This spec **does not** add or modify that field; it only *reads* it structurally. The two specs agree on the
exact predicate — `interaction.type === 'prediction' && !!interaction.gate` — which is the same shape `spec-02`'s
`isCheckpointBeat` uses (README §4.5). If spec-03 is implemented before spec-13, the predicate is a harmless no-op
(`gate` is always undefined); when spec-13 lands, gate `prediction` beats become reps with no further change here.

---

## 4. Step-by-step implementation

### Step 1 — Create the pure classifier `src/lesson/retrievalRep.ts`

Create the file. Keep it dependency-free (matches `mastery.ts` / `hintLadder.ts` so it runs in the node Vitest env).

```ts
// Retrieval-rep taxonomy (README §4 Foundation D, Decision D10). PLUMBING ONLY.
//
// A *retrieval rep* is a cold-recall act — the unit the difficulty governor
// (spec-21), calibration scoring (spec-12), and analytics count. It is NOT the
// streak: the streak (functions/src/streaks.ts) counts required-beat completion
// once per local day and is UNCHANGED by this taxonomy.
//
// Pure + dependency-free so it is unit-tested in the node Vitest env. "Cold
// recall" depends on how a beat is surfaced, so callers pass the context they
// know; the classifier fails closed (returns false) when nothing marks recall.

import type { Beat } from '../content/schema'

export type RetrievalRepContext = {
  source?: 'lesson' | 'review'
  schemaId?: string
}

// True iff the beat is a cold-recall retrieval act. See README §4 Foundation D / §4.5.
//   1. surfaced by the SR queue as a spaced-review problem (ctx.source==='review')
//   2. a masteryChallenge checkpoint
//   3. a which-method gate — a prediction beat carrying the `gate` block (spec-13).
//      Detected BY STRUCTURE, not via ctx.role: callers won't reliably thread a role
//      flag, so the only durable signal is the beat shape. The exempt opening
//      qualitative bet is a plain `prediction` with no `gate`, so it is NOT a rep.
// Teaching / primer / sim / recap beats seen first-pass in normal flow are NOT reps.
export function isRetrievalRep(beat: Beat, ctx: RetrievalRepContext = {}): boolean {
  if (ctx.source === 'review') return true
  if (beat.interaction.type === 'masteryChallenge') return true
  // `gate` is added to the `prediction` member by spec-13 (README §4.5). Until
  // then `interaction.gate` is always undefined, so this is a no-op pre-spec-13
  // and compiles regardless (access is via the discriminated `prediction` arm).
  if (beat.interaction.type === 'prediction' && Boolean(beat.interaction.gate)) return true
  return false
}
```

> **Type note (spec-13 sequencing).** `beat.interaction.gate` only exists on the `prediction` member after spec-13
> adds it (`README.md` §4.5: `gate: { kind, correct, optionMethods }` on `InteractionSchema`'s `prediction` arm). If
> spec-03 lands before spec-13, narrow with a structural read so the file typechecks without the field — e.g.
> `('gate' in beat.interaction && beat.interaction.gate)` — and tighten to the typed access once spec-13's field
> exists. Either way the predicate is identical: `prediction` + a present `gate`.

→ **verify:** `./node_modules/.bin/eslint src/lesson/retrievalRep.ts` passes; `./node_modules/.bin/tsc --noEmit`
(or the project typecheck) has no error on the new file.

### Step 2 — Add the analytics hook `analytics.retrievalRep`

Edit `src/analytics/events.ts`. Add one entry to the `analytics` object (place it next to the other lesson-flow
events, e.g. just after `reviewRecommendedShown` at `:86-87`, matching the existing one-line-per-event style):

```ts
  // Fired when a graded answer is a retrieval rep (README §4 Foundation D).
  // Counted by the governor/calibration/dashboards; independent of the streak (D10).
  retrievalRep: (
    p: { lessonId: string; beatId: string; schemaId?: string; correct: boolean; source: 'lesson' | 'review' },
  ) => track('retrieval_rep', p),
```

Do **not** add any call site that fires it in this spec beyond what already grades a beat — the consumers wire the
actual `analytics.retrievalRep(...)` calls. (If you want a single live call site to prove the hook, see Step 4; it is
optional and gated to graded beats only, never the streak path.)

→ **verify:** `grep -n "retrievalRep" src/analytics/events.ts` shows the new entry; `./node_modules/.bin/eslint
src/analytics/events.ts` passes.

### Step 3 — Confirm-and-document the streak is untouched (no code change)

Add a short comment block at the top of `src/lesson/retrievalRep.ts` (already in the Step-1 sketch) stating the
streak is unchanged and pointing at `functions/src/streaks.ts`. Make **no** edits to `functions/src/streaks.ts`,
`functions/src/index.ts` (`recordQualifyingAction`), or any streak test.

→ **verify:** `git diff --name-only` after this spec lists **only** `src/lesson/retrievalRep.ts`,
`src/lesson/retrievalRep.test.ts`, and `src/analytics/events.ts` (plus a `docs/` ADR/glossary note if you add the
optional stat). Specifically `git diff --stat functions/` is **empty**.

### Step 4 (OPTIONAL) — Live analytics call at the one existing graded-submit site

If and only if a reviewer wants the hook proven live now (not required by this spec), wire a single
`analytics.retrievalRep(...)` call where a graded beat is submitted, passing `source: 'lesson'` and
`ctx`-free `isRetrievalRep(beat)`. Do this only at the lesson-grading site, never inside the streak
(`recordQualifyingAction`) path. Prefer to leave this to `spec-21`/`spec-12` to avoid speculative wiring.

→ **verify (if done):** the call is in the grading/feedback flow, not the streak path; manual `/dev/lesson` shows no
behavioral change (fire-and-forget; emulator/dev skips analytics — `events.ts:23`).

---

## 5. Two-track behavior

The classifier itself is **track-agnostic** — "is this a cold-recall act?" is the same question for both tracks.
Two-track gating lives in the *consumers*:

- **Track A (gentle default):** The governor (`spec-21`) and the celebrated calibration score (`spec-12`) are
  **off/light** for Track A (D2/D6/D9). So although Track-A learners still *produce* retrieval reps (a
  `masteryChallenge` is a rep on both tracks), nothing in this spec changes their experience; the reps are recorded
  for analytics only.
- **Quant-intensity gate (Track B `OR` `learningGoal === 'interview'`):** The governor's rolling-success window and
  the calibration-forward report consume `isRetrievalRep`. The which-method gate (a `prediction` beat carrying
  `interaction.gate`, detected structurally) and review-surfaced reps (`ctx.source === 'review'`) are the surfaces
  those features add — see `spec-13`/`spec-10`.

This spec adds **no** track branch of its own; it must not read `track`/`learningGoal`. The gate is applied by
consumers, keeping the classifier a single pure predicate.

---

## 6. Data / schema changes

**None to any persisted schema.** This spec adds no Firestore field, no `BeatSchema` field, no snapshot field.

- The `schemaId` referenced on `RetrievalRepContext` is the **spec-00** field (`README.md` §4 Foundation B) carried
  in-memory only; it is not persisted by this spec.
- The optional informational "retrieval reps this week" stat (D10) — **if** built — must derive from the
  `retrieval_rep` analytics events or an existing read path; it must **not** add a streak-like persisted counter and
  must **not** alter `users/{uid}/streaks/current` (`functions/src/streaks.ts`). This spec does **not** build that
  stat; it only reserves the analytics event name `retrieval_rep`.

No new shared contract fields are introduced. (`RetrievalRepContext` is a local module type, not a §4 shared shape;
flag to the consistency gate only that the analytics event name `retrieval_rep` is reserved.)

---

## 7. Tests

Create `src/lesson/retrievalRep.test.ts` (node Vitest, mirroring `mastery.test.ts` style — parse a real fixture to
get real beats). Use `fixtures/lesson-pattern-hitting-times.json` (it has a `masteryChallenge` and a `prediction`
beat, per `mastery.test.ts:15`).

Cases:
1. **masteryChallenge is always a rep** — `isRetrievalRep(masteryChallengeBeat)` is `true` with empty ctx and with
   `{ source: 'lesson' }`.
2. **review-surfaced graded beat is a rep** — take any non-mastery graded beat (e.g. the `equation-tiles` beat),
   `isRetrievalRep(beat, { source: 'review' })` is `true`.
3. **which-method gate is a rep (by structure)** — a `prediction` beat **carrying a `gate` block** is `true` with
   empty ctx. Since the fixtures have no `gate` until spec-13 lands, synthesize the gate in the test by spreading the
   real `prediction` beat: `{ ...predictionBeat, interaction: { ...predictionBeat.interaction, gate: { kind: 'whichMethod', correct: predictionBeat.interaction.options[0], optionMethods: {} } } }`. Assert `true` even with no
   `ctx.role` — detection must not depend on a threaded role flag.
4. **plain prediction is NOT a rep** — the real `prediction` beat (no `gate`) with empty ctx (or `{ source: 'lesson' }`)
   is `false`. This is the exempt opening qualitative bet.
5. **teaching/sim/recap first-pass is NOT a rep** — a non-graded teaching beat (e.g. a `slider`/`coinSim`/`recap`
   beat) with empty ctx is `false`.
6. **fail-closed default** — `isRetrievalRep(anyNonMasteryBeat)` with no ctx returns `false`.
7. **review overrides** — a non-graded teaching beat with `{ source: 'review' }` returns `true` (the queue only
   re-asks graded problems, but the predicate's contract is "review surfacing ⇒ rep"; document this in a comment).

→ **verify:** `./node_modules/.bin/vitest run src/lesson/retrievalRep.test.ts` is green.

**Streak-untouched guard (regression).** Run the existing streak tests unchanged and confirm they still pass:

→ **verify:** `./node_modules/.bin/vitest run functions` (or the streak test file) is green and **unmodified** —
`git diff --stat functions/` is empty.

**Fixture validator.** No new assertions in this spec, but run it to confirm nothing regressed:

→ **verify:** `tsx scripts/validate-fixtures.ts` passes.

---

## 8. Foolproofing (which §8 items apply)

- **R9 — "It's in the product" ≠ "the mechanism exists."** This spec builds the *mechanism* (the classifier) but
  deliberately does **not** wire the unbuilt consumer features. The hard rule **zero changes to streak behavior**
  (D10) is enforced by Step 3's `git diff` check on `functions/`.
- **R2 — Two mastery sources of truth / keep `GRADED_BEAT_TYPES` stable** (collision matrix §5). This spec does
  **not** edit `mastery.ts` or `GRADED_BEAT_TYPES`. The classifier deliberately keys off `interaction.type ===
  'masteryChallenge'` and context flags, not off the mastery graded-beat set, so the two never drift. If a future
  reader is tempted to "reuse" `isGradedBeat`, note: retrieval-rep ≠ graded-beat (a review-surfaced graded beat is a
  rep; a first-pass graded beat is not).
- **R11 — Calibrate/discrimination + patternPick trap.** The which-method-gate path keys off a **`prediction`** beat
  carrying `interaction.gate` (the block `spec-13` adds), detected by structure — never `patternPick` (no `byOption`,
  ungraded). The classifier never inspects `patternPick`. Matching the README §4.5 contract, the gate is distinguished
  from the exempt opening qualitative bet **only** by `interaction.gate` being present.
- **R12 — Client timestamps are spoofable.** This spec records no time and writes no scheduling state, so there is
  no spoofable surface. (Consumers that schedule must use server time per `spec-01`.)

---

## 9. Definition of Done

- [ ] `src/lesson/retrievalRep.ts` exists: pure, dependency-free, exports `isRetrievalRep` + `RetrievalRepContext`,
      with the streak-unchanged comment block.
- [ ] `src/analytics/events.ts` exposes `analytics.retrievalRep(...)` with the documented param shape; reserves the
      `retrieval_rep` event name.
- [ ] **Zero changes** under `functions/` — `git diff --stat functions/` is empty; streak count/reset behavior
      untouched (D10, R9).
- [ ] `./node_modules/.bin/vitest run src/lesson/retrievalRep.test.ts` green (all 7 cases).
- [ ] Existing streak tests still green and unmodified.
- [ ] `tsx scripts/validate-fixtures.ts` passes.
- [ ] `./node_modules/.bin/eslint src/lesson/retrievalRep.ts src/lesson/retrievalRep.test.ts src/analytics/events.ts`
      passes.
- [ ] Project typecheck clean on touched files (the `schemaId?: string` signature compiles with or without spec-00
      landed).
- [ ] The consumer READ-point table (§3) is accurate so `spec-21`/`spec-12`/`spec-10`/`spec-13` can wire against it
      with no further design.
