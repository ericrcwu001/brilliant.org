# spec-24 — Held-out transfer-problem content (Track-B gold gate)

- **Status:** Planned
- **Phase:** **Phase 0/1 — content long pole, start early** (re-tagged per README §7: it feeds both `spec-11`'s Track-B gold gate **and** `spec-01`'s card-creation, which reads `BeatSchema.heldOut` to set `isTransfer`). Listed under Phase 2 in the §6 index for grouping, but the build order in §7 starts it in Phase 0.
- **Depends-on:** `spec-00` (method registry + `BeatSchema.schemaId`). **Feeds `spec-01`** (card creation reads `heldOut` → `reviews/{cardId}.isTransfer:true`, README §4 Foundation A) and **feeds `spec-11`** (Track-B gold-mint draws the transfer card; excludes `heldOut` from the visible walk). Reconciles its `BeatSchema` marker with `spec-00`/`spec-02` at the consistency gate.
- **Implements:** Decision **D15** (transfer-problem content as its own workstream); the Track-B half of Decision **D7** (gold via a held-out **transfer** problem — fresh surface, same method); SPOV2 transfer (brainlift app-action #5, corrected per README §1 row 5 — delayed-transfer gold is **net-new** infra).

> Read [README §1 rows 5/9](README.md#§1), [§3 D5/D7/D15](README.md#§3), [§4 Foundation A + Foundation B](README.md#§4), [§8 R8/R9](README.md#§8), and `docs/proposed-lessons.md §1` (canonical lesson order) before starting. The §4 contracts (`reviews/{cardId}.schemaId`, `reviews/{cardId}.track`, `BeatSchema.schemaId`) are authoritative — do **not** rename them.

---

## 1. Goal & non-goals

**Goal.** Author **~1 held-out transfer problem per lesson** (~48 lessons) so `spec-11`'s Track-B gold gate has a real "fresh surface, same method" problem to draw. Each transfer problem (a) tests the **same `schemaId` method** as that lesson's checkpoint (`masteryChallenge`), (b) presents a **fresh surface** (different numbers/objects/framing — *not* the checkpoint reworded), and (c) is shown **only** as the Track-B delayed gold gate — **never** in normal lesson flow, on either track. This spec adds the schema marker that distinguishes a held-out beat, defines the per-lesson authoring procedure (every number engine-verified per lesson-factory rule 3 + cross-checked by `validate-fixtures`), and updates the lesson-factory skill so every *future* lesson is authored with one.

**Non-goals.** No queue/draw logic, no gold-mint logic, no UI — `spec-11` (mint) and `spec-10`/`spec-20` (queue surface) consume these beats; this spec only *produces* the content + the marker. No Track-A re-retrieval content (Track A re-asks the *same* checkpoint cold — no new content needed; D7). No new graded interaction **types** (transfer beats reuse existing graded types — usually `masteryChallenge`/`answerEntry`). No change to `GRADED_BEAT_TYPES`, grading, or mastery semantics (R2). No change to the live lesson runtime (a `required:false` heldOut beat is already filtered out of the visible flow — see §3.3).

> **RISK (accepted).** All ~48 transfer problems are **hand-authored, source-anchored, engine-verified** (§3.5) — a **serial bottleneck on the Track-B gold critical path** (D15 carries this workstream's cost explicitly; §7 critical-path notes). The cost is owned, not designed away. **Mitigation:** (1) **per-concept incremental** — the validator gate (§3.4) is not allowlist-gated and presence stays **advisory** until `REQUIRE_TRANSFER=1`, so any unauthored lesson **degrades to silver** (gold simply never mints for it; R5 — no stubbed foundation, the feature absence is graceful, not broken); (2) **`REQUIRE_TRANSFER` stays advisory** (`⚠`, never red CI) until authoring completes and `spec-00`'s `REQUIRE_SCHEMA_ID=1` + backfill have landed (R-rollout; gate Issue #12); (3) **author the flagship `pattern-hitting-times` concept FIRST** (canonical order, §4 / R8) so the demo path has gold before the long tail is done. This preserves graceful degradation: a learner on an unauthored lesson still earns silver instantly and is never blocked.

---

## 2. Current reality (verified against the code)

- **48 lesson fixtures** exist: `ls fixtures/lesson-*.json | wc -l` → `48`. They cover 8 concepts (`pattern-hitting-times` L0–L6 + bayes-rule ×8, combinatorics ×6, expected-value ×6, game-theory ×6, markov-chains ×10, optimal-stopping ×5).
- **Every lesson except `lesson-first-heads` (L0) ends `… masteryChallenge, recap`.** Verified by iterating all fixtures: the only fixture whose last two beats are not `(masteryChallenge, recap)` is `lesson-first-heads` (ends `primer, answerEntry`). The `masteryChallenge` beat is the lesson's **checkpoint** — the natural method anchor for its transfer problem.
- **`scripts/validate-fixtures.ts` §5 "mastery-challenge gate" (`:721-743`) hard-asserts the ending invariant** for every lesson in `MASTERY_LESSONS` (`:686-720`): `beats[last]` must be `recap` (`:726-727`) and `beats[last-1]` must be a `required` `masteryChallenge` (`:729-734`). **A new beat placed *between* `masteryChallenge` and `recap` (or *after* `recap`) breaks this gate.** → The held-out transfer beat must be placed **before** the `masteryChallenge` (see §3.3, R-place).
- **A graded `masteryChallenge` beat to clone-by-method** is `lesson-bayes-rule-3` → `mastery-challenge` (`fixtures/lesson-bayes-rule-3.json`): `interaction.type:"masteryChallenge"`, `interaction.scenario`, `interaction.fields:[{id,label,accept:["10"],placeholder}]`, `feedback.correct` + `feedback.hints` (a 3-tuple). This is the shape a transfer beat clones (same `type`, fresh `scenario`/`fields`/`feedback`).
- **`schemaId` is owned by `spec-00`,** not yet in the code: `grep -rn "schemaId" src/content/schema.ts` → nothing. `spec-00` adds `BeatSchema.schemaId: MethodIdSchema.optional()` (`src/content/schema.ts`, after `interviewNote` `:651`), creates `src/content/methods.ts` (`METHODS`/`MethodId`/`MethodIdSchema`), and backfills all 187 graded beats. **This spec consumes that field; it does not redefine it.**
- **Graded-beat predicate** is `isGradedBeat` in `src/lesson/mastery.ts:17-25` (canonical; spec-00 reuses it). A transfer beat is a graded beat, so once spec-00's `REQUIRE_SCHEMA_ID` flag is on, a heldOut beat **also** needs a valid `schemaId` — which is the point (it carries the method it tests).
- **Track-exclusivity convention already exists.** `BeatSchema.track: z.enum(['A','B','both']).optional()` (`src/content/schema.ts:618`); the schema comment (`:616-617`) states *"Track-exclusive beats MUST be `required: false` so the Cloud Function's required-beat check (which sees the full fixture) still passes."* `visibleFor(beats, track)` (`scripts/validate-fixtures.ts:575-577`) filters `(b.track ?? 'both') === 'both' || b.track === track`. A heldOut beat will be `required:false` for the same reason.
- **The live player renders required + in-track beats and steps a linear spine** (`computeMastered` reads only `required` graded beats; `gradedRequiredBeatIds`, `mastery.ts:27-29`). A `required:false` beat already does not gate unlock or mastery. The held-out marker (§3.1) is what additionally **excludes it from the normal visible flow** so it is reserved for the gate.
- **lesson-factory skill files** to edit (shared with `spec-00` — apply additively):
  - `.cursor/skills/lesson-factory/SKILL.md` — rule 3 (`:37-46`) two-stage engine-verify; vocabulary (`:17-22`).
  - `.cursor/skills/lesson-factory/qa-rubric.md` — two-stage fact-check (`:7-22`), 9 gates (gate 6 Assessment `:33`), mechanized checks (`:38-48`).
  - `.cursor/skills/lesson-factory/artifacts.md` — Lesson Brief (`:85-123`: "Verified problems & answers" `:103`, beat table `:110`, "Assessment + continuity" `:118-122`).
  - `.cursor/skills/lesson-factory/departments.md` — Assessment Designer role (`:56`).

---

## 3. Design

### 3.1 The schema marker — `BeatSchema.heldOut` (★ NEW SHARED FIELD — flag for the consistency gate)

A held-out transfer beat needs a marker that says *"never render this in normal flow; reserve it for the Track-B gold gate."* `track:'B'` alone is **insufficient** — a normal Track-B-only teaching/checkpoint beat is also `track:'B'`, and we do not want `spec-11` to mistake every Track-B beat for a gold gate. So add one boolean:

```ts
// In BeatSchema (src/content/schema.ts), additive-optional, alongside schemaId
// (spec-00) and the other optional fields. A held-out TRANSFER problem for the
// Track-B delayed gold gate (D7/D15): SAME method (schemaId) as this lesson's
// masteryChallenge checkpoint, FRESH surface. NEVER rendered in normal lesson
// flow on either track; harvested only by spec-11's gold-mint draw. Implies a
// graded beat carrying a valid schemaId.
heldOut: z.literal(true).optional(),
```

- **`z.literal(true).optional()`** (not `boolean`): the only meaningful value is `true`; absence = a normal beat. Mirrors the existing `comparison: z.literal(true).optional()` style at `schema.ts:648`.
- It is **purely content metadata in this spec** — nothing reads it at runtime here. **`spec-01` reads it** at lesson completion to create the transfer review card and set `reviews/{cardId}.isTransfer:true` + `track:'B'` (README §4 Foundation A — the `heldOut → isTransfer` mapping is **owned by spec-01**, not deferred to spec-11). **`spec-11`** then draws that `isTransfer` card for the Track-B gold-mint and must **exclude** `heldOut` beats from the visible spine (§3.3 — owned by spec-11, flagged below).

> **★ Consistency-gate note.** `heldOut` is a **NEW shared field on `BeatSchema`**, the same file `spec-00` (`schemaId`) and `spec-02` (`confidenceByBeat`) edit (README §5 collision matrix). It must be reconciled into the **single** additive set of optional `BeatSchema` fields — apply all three additively, in one coherent block, do not let a later spec clobber an earlier spec's field. This spec proposes the field; the gate folds it into the authoritative §4 / §4.5 contract (where `heldOut: z.literal(true).optional()` on `BeatSchema` is owned by spec-24, consumed by **01 → card `isTransfer`** and **11 → excluded from the visible walk**). **Two consumers depend on this field name** (`heldOut`) and on the convention `heldOut ⟹ track:'B' && required:false && has schemaId` (§3.2):
> - **`spec-01` (card creation) OWNS the `heldOut → reviews/{cardId}.isTransfer` mapping.** Per README §4 Foundation A, `writeCardsForCompletion` creates a card for **every graded-required beat AND every `heldOut` transfer beat** (transfer beats are `required:false`, so a graded-*required*-only predicate would never create them and Track-B gold could never mint); on a transfer card it sets `isTransfer:true` and `track:'B'`. That is a real **spec-01 → spec-24** dependency — do **not** route the `isTransfer` mapping through `spec-11`.
> - **`spec-11`** then consumes `reviews/{cardId}.isTransfer` for the Track-B gold-mint draw, and OWNS excluding `heldOut` from the normal visible/required walk (§3.3).

### 3.2 Invariants of a held-out transfer beat (the authoring contract)

Every held-out transfer beat MUST satisfy, and `validate-fixtures` (§3.4) enforces:

1. `heldOut: true`.
2. `track: 'B'` — it is the **Track-B** gold gate (D7). (Track A re-uses the *same* checkpoint cold; no held-out content.)
3. `required: false` — so the Cloud Function's required-beat completion check (which sees the full fixture) and `computeMastered` (which reads only `required` graded beats) both ignore it (matches the `schema.ts:616-617` convention).
4. It is a **graded beat** (`isGradedBeat` true — typically `masteryChallenge` or `answerEntry`) and carries a **valid `schemaId`**.
5. Its `schemaId` **equals the lesson's checkpoint `schemaId`** — the `masteryChallenge` beat's method. (Same method, fresh surface.) For `lesson-first-heads` (no `masteryChallenge`), match the lesson's last graded beat's method.
6. It is placed **before** the `masteryChallenge` beat (R-place; §3.3) so the §5 mastery-challenge gate's `(penult=masteryChallenge, last=recap)` invariant is preserved.
7. **Fresh surface:** different scenario from the checkpoint (enforced softly — see §3.4 the surface-distinctness check on `interaction.scenario`/`prompt`; the deep "is it really a new surface?" judgment is human/QA, gate 6).

### 3.3 Placement (R-place) and runtime exclusion

**Placement.** Insert the held-out beat in the **"Prove" region but before** the `masteryChallenge` — concretely, immediately **before** the `masteryChallenge` beat (so the fixture order is `…, transfer-heldout (required:false, track:B, heldOut), mastery-challenge (required), recap`). The §5 gate only inspects the *last two* beats (`:724-725`), so an inserted `required:false` beat before the `masteryChallenge` leaves `penult==masteryChallenge` and `last==recap` intact. → verify in §3.4 that the §5 gate still passes after insertion.

**Runtime exclusion (flagged for `spec-11`, not built here).** A `required:false`, `track:'B'` beat would still *render* for a Track-B learner walking the spine. To truly hold it out, the player must skip `heldOut` beats in the normal walk. That is a one-line filter in the visible-beat selection and belongs to **`spec-11`** (the consumer that also adds the draw). This spec **flags it**: spec-11 must add `&& !beat.heldOut` wherever the player builds the visible/required beat sequence for normal play (and surface the beat *only* via the gold-gate draw). The validator gate (§3.4) guarantees the marker is well-formed so spec-11 can rely on it.

### 3.4 Validator additions — `scripts/validate-fixtures.ts` (new section "8. Held-out transfer gate")

Additive, after the mastery-challenge gate (§5, `:743`). Reuses spec-00's `isGradedBeat` import and `VALID_METHOD_IDS` set (spec-00 §3c). Runs over **all** lessons (not allowlist-gated) — but a lesson with **no** `heldOut` beat is allowed during authoring rollout (advisory), flipping to **required-one-per-lesson** behind a flag once authoring completes (mirrors spec-00's `REQUIRE_SCHEMA_ID` pattern, R-rollout).

> **★ Flag-ordering (README §5 collision matrix / gate Issue #12): do NOT flip `REQUIRE_TRANSFER=1` before `spec-00`'s `REQUIRE_SCHEMA_ID=1` + the 187-beat backfill have landed.** Check (c) "`heldOut` schemaId == checkpoint method" compares the held-out beat's `schemaId` against the `masteryChallenge` checkpoint's `schemaId`. Until spec-00 backfills the checkpoints' `schemaId`s, `checkpointSchema` is `undefined`, so the same-method assertion silently no-ops (it is guarded by `if (checkpointSchema …)`) and the gate would pass transfer beats whose method was never verified. `REQUIRE_TRANSFER=1` must therefore be sequenced **strictly after** `REQUIRE_SCHEMA_ID=1`. (`REQUIRE_SCHEMA_ID` ⇒ every checkpoint carries a real `schemaId` ⇒ check (c) is meaningful.)

```ts
// ── 8. Held-out transfer gate (spec-24 / D7 / D15). A held-out beat is the
// Track-B delayed gold gate: SAME method as the lesson's masteryChallenge, fresh
// surface, never in normal flow. Each well-formed; presence-per-lesson enforced
// once REQUIRE_TRANSFER=1 (post-authoring).
import { isGradedBeat } from '../src/lesson/mastery'   // canonical predicate (spec-00 also imports it)
const requireTransfer = process.env.REQUIRE_TRANSFER === '1'
for (const lesson of lessons) {
  const beats = lesson.beats
  const heldOuts = beats.filter((b) => (b as { heldOut?: boolean }).heldOut === true)
  // a) presence (advisory until the flag flips)
  if (heldOuts.length === 0) {
    const msg = `${lesson.lessonId}: no held-out transfer beat (Track-B gold gate)`
    if (requireTransfer) fail(msg); else console.warn(`⚠ transfer gate (advisory; set REQUIRE_TRANSFER=1): ${msg}`)
  }
  // find the checkpoint method (masteryChallenge schemaId; fallback last graded)
  const checkpoint = [...beats].reverse().find((b) => b.interaction.type === 'masteryChallenge')
    ?? [...beats].reverse().find((b) => isGradedBeat(b))
  const checkpointSchema = (checkpoint as { schemaId?: string } | undefined)?.schemaId
  for (const b of heldOuts) {
    const where = `${lesson.lessonId}/${b.beatId}`
    // b) well-formed marker
    if (b.track !== 'B') fail(`${where}: heldOut beat must be track:'B'`)
    if (b.required !== false) fail(`${where}: heldOut beat must be required:false`)
    if (!isGradedBeat(b)) fail(`${where}: heldOut beat must be a graded beat`)
    const sid = (b as { schemaId?: string }).schemaId
    if (sid == null || !VALID_METHOD_IDS.has(sid)) fail(`${where}: heldOut beat needs a valid schemaId`)
    // c) SAME method as the checkpoint
    if (checkpointSchema && sid !== checkpointSchema)
      fail(`${where}: heldOut schemaId "${sid}" != checkpoint method "${checkpointSchema}"`)
    // d) placed BEFORE the masteryChallenge (preserve §5 invariant)
    const mcIdx = beats.findIndex((x) => x.interaction.type === 'masteryChallenge')
    const myIdx = beats.findIndex((x) => x.beatId === b.beatId)
    if (mcIdx !== -1 && myIdx > mcIdx) fail(`${where}: heldOut beat must precede the masteryChallenge`)
    // e) fresh surface (soft): scenario/prompt must differ from the checkpoint's
    const cpText = checkpoint ? ((checkpoint.interaction as { scenario?: string }).scenario ?? checkpoint.prompt) : ''
    const myText = (b.interaction as { scenario?: string }).scenario ?? b.prompt
    if (cpText && myText && cpText.trim() === myText.trim())
      fail(`${where}: heldOut surface is identical to the checkpoint (must be a FRESH surface)`)
  }
}
console.log('✓ held-out transfer gate')
```

> If `spec-00` exposes its graded-set/`VALID_METHOD_IDS` differently than assumed, reuse whatever symbol it actually exports — the contract is "reuse `isGradedBeat` + the registry id set, do not re-derive." Coordinate at the gate.

### 3.5 Every number engine-verified (lesson-factory rule 3)

Each transfer problem's answer is "true" only when (1) it is anchored to a Green-Book / sourced quant-interview problem with the source's stated answer recorded, **and** (2) the lesson's existing pure engine (`src/engine/<topic>.ts`) **independently reproduces** it (`qa-rubric.md` Stage-2). The transfer beat's `accept` values must be the engine's exact output. Where a lesson's `masteryChallenge` is already engine-cross-checked (e.g. the pattern-pinned challenges via `buildAutomaton`, `validate-fixtures.ts:735-740`), the transfer beat is cross-checked the **same way** (it shares the method/engine; §3.4 (d) does not re-check the number — extend the existing per-concept engine cross-check to also cover the `accept` of `heldOut` beats, surgically, per concept). The point: a transfer problem with an un-reproduced number does **not** ship (R9: "in the product ≠ mechanism exists" — a gold gate keyed off a wrong answer silently denies mastery).

---

## 4. Authoring plan (~48 transfer problems)

**Scope.** One held-out transfer beat per lesson, ~48 total. **Long pole** — start during Phase 0/1 (after `spec-00` lands `schemaId` so the matching field exists). Cost is real (D15 calls it out): ~48 fresh, sourced, engine-verified problems.

**Canonical lesson order (R8).** For the `pattern-hitting-times` concept use the **PRD/`CONTEXT.md` canonical order from `docs/proposed-lessons.md §1`**: L0 `lesson-first-heads`, L1 `lesson-pattern-hitting-times`, L2 `lesson-penneys-game`, L3 `lesson-gamblers-ruin`, **L4 `lesson-states-streaks` (Mixed Review)**, **L5 `lesson-longer-patterns` (transfer)**, **L6 `lesson-overlap-shortcut` (Overlap Shortcut — LAST/capstone)**. Do **not** trust `docs/future_ideas.md` or the `plan-L4-overlap-shortcut.md`/`plan-L6-longer-patterns.md` filenames — they encode the OLD numbering (Overlap at L4). Cite `proposed-lessons.md §1` (`:88-106`). This matters because L5 (`lesson-longer-patterns`) is **already the in-course transfer lesson** — its *checkpoint* tests transfer-to-an-unseen-pair, so its **held-out** problem must be an even-fresher pair (not a duplicate of the L5 checkpoint surface), and L6 (`overlap-shortcut`, the most idealized, last) is the cumulative capstone whose transfer problem should exercise the `Σ2^L`/martingale method on a fresh pattern.

**Per-lesson procedure (a fresh session can follow this verbatim):**

1. Open `fixtures/lesson-<slug>-N.json`; find the `masteryChallenge` beat (or, for `lesson-first-heads`, the last graded beat). Read its `schemaId` (added by spec-00's backfill) — that is the **method** the transfer problem must test. Read its `scenario`/`fields`/`feedback` — that is the surface to **avoid duplicating**.
2. Author a **fresh-surface, same-method** problem: anchor it to a Green-Book problem **or** a sourced quant-interview question (record the source); pick numbers/objects/framing visibly different from the checkpoint. Prefer the **same interaction type** as the checkpoint (`masteryChallenge`, else `answerEntry`) to reuse the renderer (no new types — non-goal).
3. **Engine-verify the answer** (§3.5): run the lesson's `src/engine/<topic>.ts` on the new problem; set `interaction.fields[].accept` to the engine's exact rational/integer output. Record both source + engine in the Lesson Brief problem table.
4. Author `feedback.correct` + a 3-level `feedback.hints` tuple (same shape as the checkpoint; explain the *method*, since this is the gold gate).
5. Insert the beat **immediately before** the `masteryChallenge` (R-place) with `"required": false, "track": "B", "heldOut": true, "schemaId": "<same as checkpoint>"`. Keep the diff surgical — do not reorder/reformat sibling beats.
6. → verify (per file): `tsx scripts/validate-fixtures.ts` → prints `✓ held-out transfer gate` and the existing `✓ mastery-challenge gate: lesson-<slug>-N` and `All fixtures valid.` Then `REQUIRE_TRANSFER=1 tsx scripts/validate-fixtures.ts` once the lesson is done → no advisory for that lesson.

**Suggested checkpoint→method reference** (informational; the real `schemaId` comes from the fixture after spec-00 backfill — do not hard-code from this table):

| Concept | Likely checkpoint method(s) (`schemaId`) | Transfer-surface idea (fresh, same method) |
|---|---|---|
| pattern-hitting-times (L1–L6) | `states-markov`, `first-step-analysis` | a new pattern/automaton not taught in that lesson |
| bayes-rule | `conditioning`, `prior-update` | a different prior/likelihood story |
| combinatorics | `complementary-counting`, `linearity-indicators` | a different count with the same structure |
| expected-value | `linearity-indicators`, `first-step-analysis` | a fresh indicator/recurrence scenario |
| game-theory | `dominance-nash`, `backward-induction` | a different game with the same solution method |
| markov-chains | `states-markov`, `first-step-analysis` | a fresh chain with the same hitting/stationary method |
| optimal-stopping | `threshold-rule`, `backward-induction` | a different stopping problem, same threshold method |

### lesson-factory skill update (so future lessons author one)

Apply **additively** to the four files (coordinate with `spec-00`'s edits to the same files — do not clobber; one coherent pass if both specs land together):

- **`artifacts.md` Lesson Brief** (`:85-123`):
  - "Verified problems & answers" table (`:103-107`): add a row class **"held-out transfer problem"** with its source + `☐ engine ☐ source` verification, same as any other problem.
  - "Assessment + continuity" block (`:118-122`): add a bullet **`held-out transfer (Track-B gold gate): <fresh-surface problem, SAME schemaId as the mastery challenge>`**, noting it is authored `required:false, track:'B', heldOut:true` and placed **before** the mastery challenge.
  - Beat-by-beat table (`:110`): note the held-out transfer beat as a row (`graded? yes`, `track B`).
- **`qa-rubric.md`**:
  - Two-stage fact-check (`:7-22`): add "the **held-out transfer problem** is fact-checked identically (Stage-1 source + Stage-2 engine reproduction)."
  - Gate 6 "Assessment, mastery & continuity" (`:33`): add to the pass condition "…**and a held-out transfer problem** (same `schemaId` as the mastery challenge, fresh surface, `heldOut:true track:'B' required:false`, placed before the mastery challenge) for the Track-B delayed gold gate."
  - "Mechanized checks" (`:42-48`) / gate-6 note: add that `validate-fixtures` runs the **held-out transfer gate** (and that `REQUIRE_TRANSFER=1` makes presence mandatory once a concept's authoring is complete — add the new lessonIds nothing extra needed since the gate is not allowlist-gated; just author the beat).
- **`departments.md`** Assessment Designer role (`:56`): append "…and authors the **held-out transfer problem** (fresh surface, same `schemaId` as the mastery challenge) for the Track-B gold gate (`spec-24`)."
- **`SKILL.md`**: under vocabulary or rule 3, one line: "Every lesson also carries a **held-out transfer problem** (`heldOut:true`) — same method (`schemaId`), fresh surface — engine-verified like any other number; reserved for the Track-B delayed gold gate, never shown in normal flow."

---

## 5. Step-by-step implementation

> Prereq: `spec-00` has landed (`BeatSchema.schemaId`, `src/content/methods.ts`, the 187-beat backfill, `VALID_METHOD_IDS` in the validator). If not, **stop and coordinate** — do not stub `schemaId` (R5).

1. **Add the `heldOut` field to `BeatSchema`.** In `src/content/schema.ts`, inside `BeatSchema` (after `schemaId` from spec-00, near `:651`), add `heldOut: z.literal(true).optional()` with the §3.1 comment. Apply additively next to `schemaId`/`comparison`/`interviewNote` — do not reorder existing fields.
   → verify: `./node_modules/.bin/tsc -b` clean; `./node_modules/.bin/tsx -e "import('./src/content/schema.ts').then(m=>{m.BeatSchema.parse({beatId:'x',required:false,track:'B',heldOut:true,schemaId:'symmetry',prompt:'p',interaction:{type:'answerEntry',fields:[{id:'a',accept:['1']}]},feedback:{correct:'c',hints:['','','']}});console.log('ok'); try{m.BeatSchema.parse({beatId:'x',required:false,prompt:'p',heldOut:false,interaction:{type:'answerEntry',fields:[{id:'a',accept:['1']}]},feedback:{correct:'c',hints:['','','']}});process.exit(2)}catch{console.log('rejects heldOut:false ok')}})"` → prints `ok` then `rejects heldOut:false ok`.

2. **Add the held-out transfer gate to the validator.** In `scripts/validate-fixtures.ts`, add the §3.4 "section 8" block after the mastery-challenge gate (`:743`). Import `isGradedBeat` from `../src/lesson/mastery` and reuse spec-00's `VALID_METHOD_IDS`.
   → verify: `./node_modules/.bin/tsx scripts/validate-fixtures.ts` exits 0, prints `✓ held-out transfer gate`, all `✓ mastery-challenge gate: …` still pass, and `All fixtures valid.` (Before any content is authored, the new gate is advisory-only: it prints `⚠ transfer gate (advisory…)` per lesson and does not fail.)

3. **Author the held-out transfer beats**, lesson by lesson, following §4's per-lesson procedure. Start with the `pattern-hitting-times` concept in canonical order (R8), then the other 7 concepts. Commit per-concept.
   → verify (per lesson): `./node_modules/.bin/tsx scripts/validate-fixtures.ts` green; the lesson's per-concept engine cross-check (extended in step 4) reproduces the new `accept`.

4. **Extend the per-concept engine cross-check** so each `heldOut` beat's `accept` is engine-reproduced (§3.5). For pattern-pinned `masteryChallenge`-style transfer beats, reuse the existing `buildAutomaton(pattern,0.5).expectedTimes.E0` check pattern (`validate-fixtures.ts:735-740`); for other concepts extend their existing fixture cross-checks (or the engine golden test) to include the heldOut `accept`. Surgical — one assertion per concept.
   → verify: deliberately corrupt one `accept` digit on a heldOut beat → `validate-fixtures` (or the engine golden) FAILS; restore it.

5. **Update the lesson-factory skill** (the four files, §4 "lesson-factory skill update"), additively and coordinated with `spec-00`'s edits to the same files.
   → verify: `grep -rn "heldOut\|held-out transfer" .cursor/skills/lesson-factory/` shows the new mentions in `SKILL.md`, `qa-rubric.md`, `artifacts.md`, `departments.md`; `grep -n "schemaId" .cursor/skills/lesson-factory/` (spec-00's edits) is still present (not clobbered).

6. **Flip the presence flag on** once all 48 lessons have a transfer beat **AND `spec-00`'s `REQUIRE_SCHEMA_ID=1` + backfill have already landed** (gate Issue #12 — `REQUIRE_TRANSFER=1` is sequenced strictly **after** `REQUIRE_SCHEMA_ID=1`, else the "schemaId == checkpoint method" check (c) silently no-ops on un-backfilled checkpoints). Add `REQUIRE_TRANSFER=1` to the validator invocation in CI/DoD (or default it on as spec-00 does for `REQUIRE_SCHEMA_ID` after its backfill).
   → verify: confirm `REQUIRE_SCHEMA_ID=1` is already on; then `REQUIRE_TRANSFER=1 ./node_modules/.bin/tsx scripts/validate-fixtures.ts` is green; delete one lesson's heldOut beat → it FAILS with `no held-out transfer beat`; restore.

7. **Flag the two consumer dependencies in the consistency-gate handoff** (no runtime/Function code in this spec):
   - **`spec-01`** must read `BeatSchema.heldOut` in `writeCardsForCompletion` and create a card for **every graded-required beat AND every `heldOut` beat**, setting `isTransfer:true` + `track:'B'` on the transfer card (README §4 Foundation A — this is the spec-01-owned `heldOut → isTransfer` mapping; transfer beats are `required:false`, so a graded-required-only predicate would never create them).
   - **`spec-11`** must skip `heldOut` beats in the normal visible/required walk (`LessonPlayer.tsx`, README §5 — owned by spec-11) and surface them only via the Track-B gold-mint draw of the `isTransfer` card.

---

## 6. Two-track behavior

- **Track A** (gentle default): **never sees** the held-out transfer beat (it is `track:'B'` and `heldOut`). Track A's delayed gold gate re-asks the **same** `masteryChallenge` cold (D7) — that needs no new content, so this spec produces nothing for Track A.
- **Quant-intensity gate (Track B `OR` `learningGoal==='interview'`):** the held-out transfer beat **is** the delayed gold gate. At lesson completion **`spec-01`** creates its review card (`isTransfer:true`, `track:'B'` — the `heldOut`-driven card-creation it owns, README §4 Foundation A). After ≥1 day, **`spec-11`** draws that transfer card (fresh surface, same method) and mints gold only if the learner solves it cold. The beat never appears in normal flow (R-place + spec-11's runtime filter), so it stays genuinely held-out — the first time the learner meets that surface is the gate. This realizes "transfer-gated medallions" (D7) for the quant audience.

---

## 7. Data / schema changes (deltas only)

- **`BeatSchema.heldOut: z.literal(true).optional()`** — ★ NEW shared field (§3.1). Additive-optional; same file as `spec-00` `schemaId` and `spec-02` `confidenceByBeat` (README §5). Now folded into README §4.5 (owner spec-24; consumers **01 → card `isTransfer`**, **11 → excluded from visible walk**). No Firestore/userDoc/`reviews` writes **in this spec** — it is fixture content. **`spec-01` reads it** at completion to set `reviews/{cardId}.isTransfer:true` + `track:'B'` (that write is owned by spec-01, README §4 Foundation A); `spec-11` reads it via the loaded lesson to exclude it from the visible walk.
- **Reuses (does not redefine):** `BeatSchema.schemaId` + `MethodIdSchema`/`VALID_METHOD_IDS` (spec-00, §4 Foundation B); `reviews/{cardId}.schemaId`, `.track`, and `.isTransfer` (spec-01, §4 Foundation A) — `.isTransfer` is the spec-01-owned projection of `heldOut`; `spec-11` matches the transfer card against these — all referenced by name, not changed here.
- **`scripts/validate-fixtures.ts`** — additive gate section 8 (§3.4) + per-concept engine cross-check extension (§3.5). No removals.

---

## 8. Tests

- **Validator (primary gate; `scripts/validate-fixtures.ts`):**
  - `./node_modules/.bin/tsx scripts/validate-fixtures.ts` → green incl. `✓ held-out transfer gate`; all existing `✓ mastery-challenge gate` lines still pass (proves R-place did not break §5).
  - `REQUIRE_TRANSFER=1 …` → green once authoring complete; FAILS on a lesson missing its heldOut beat.
  - Negative cases (manually, then revert): a heldOut beat with `track:'A'` → fail; with `required:true` → fail; with a `schemaId` ≠ checkpoint method → fail; placed **after** the `masteryChallenge` → fail; with a scenario identical to the checkpoint → fail; with a wrong `accept` digit → engine cross-check fail.
- **Schema unit (vitest, node env; e.g. `src/content/schema.heldOut.test.ts`):** `BeatSchema.parse` accepts `heldOut:true`; rejects `heldOut:false` (literal-true); a heldOut beat round-trips with `schemaId`+`track:'B'`+`required:false`.
- **Engine goldens (existing per-concept `*.test.ts`):** each heldOut `accept` value equals the engine's exact output for that problem (Stage-2; reuse the concept's golden harness).
- **Full suite (DoD):** `./node_modules/.bin/vitest run` green; `./node_modules/.bin/eslint scripts/validate-fixtures.ts src/content/schema.ts` clean on touched files.
- **Manual `/dev` check:** open `/dev/lesson/<lessonId>` (no Firebase/Java per AGENTS.md) for a finished lesson on **both** tracks and confirm the held-out transfer beat **does not appear** in the normal walk. (Full confirmation that it appears *only* in the gold gate lands with `spec-11`, which adds the draw + the runtime `!heldOut` filter — note this dependency in the verification log.)

---

## 9. Foolproofing (README §8)

- **R8 — Canonical lesson order.** §4 fixes the `pattern-hitting-times` order from `docs/proposed-lessons.md §1` (Overlap Shortcut = **L6, last**; States & Streaks = L4; Longer Patterns = L5). The spec explicitly does **not** trust `future_ideas.md` or the mis-numbered `plan-L*` filenames. This matters for L5 (already the in-course transfer lesson → its held-out problem must be an *even fresher* pair) and L6 (capstone method).
- **R9 — Mechanism vs content.** Every transfer number is engine-verified (§3.5) and cross-checked by `validate-fixtures` (§3.4–§3.5). A gold gate keyed off an un-reproduced answer would silently deny mastery — so no transfer beat ships without Stage-1 source + Stage-2 engine reproduction.
- **R5 — No stubbed foundations.** `schemaId` (spec-00) is a hard prereq (§5 step 0). The matching invariant (heldOut `schemaId` == checkpoint `schemaId`) is meaningless without the real backfilled tags, so this spec is sequenced after spec-00.
- **R2 — Mastery sources untouched.** `heldOut` beats are `required:false`, so `computeMastered`/`gradedRequiredBeatIds` (`mastery.ts:27-37`) and the Cloud Function's required-beat check ignore them; `GRADED_BEAT_TYPES` is unchanged. The transfer beat affects gold **only** via spec-11's delayed gate, not the instant medallion path.
- **R-place (local).** The §5 mastery-challenge gate hard-requires `(penult=masteryChallenge, last=recap)`; the held-out beat is placed **before** the `masteryChallenge` and the validator (§3.4 (d)) asserts it, so the invariant holds for all 47 MASTERY_LESSONS.
- **R-rollout (local).** The presence check is advisory (`⚠`) until `REQUIRE_TRANSFER=1`, mirroring spec-00's `REQUIRE_SCHEMA_ID` — partial authoring never red-lights CI; full authoring flips it hard.

---

## 10. Definition of Done

- `BeatSchema.heldOut` added (additive-optional, reconciled with spec-00/spec-02 at the consistency gate); `tsc -b` clean.
- Held-out transfer gate added to `scripts/validate-fixtures.ts`; per-concept engine cross-check extended to cover heldOut `accept`.
- **~48 held-out transfer beats authored** — one per lesson, each: `heldOut:true`, `track:'B'`, `required:false`, valid `schemaId` **== its lesson's checkpoint method**, fresh surface, **engine-verified** answer, placed **before** the `masteryChallenge`.
- `./node_modules/.bin/tsx scripts/validate-fixtures.ts` green (incl. `✓ held-out transfer gate` and every `✓ mastery-challenge gate`); `REQUIRE_TRANSFER=1 …` green; `All fixtures valid.`
- `./node_modules/.bin/vitest run` green; `./node_modules/.bin/eslint` clean on `scripts/validate-fixtures.ts` + `src/content/schema.ts`.
- lesson-factory skill (`SKILL.md`, `qa-rubric.md`, `artifacts.md`, `departments.md`) updated additively so every future lesson is authored with a held-out transfer problem; spec-00's `schemaId` edits to the same files preserved.
- Consistency-gate handoff records: (1) `heldOut: z.literal(true).optional()` as a NEW `BeatSchema` field, folded into README §4.5 (owner spec-24); (2) the `heldOut ⟹ track:'B' && required:false && has schemaId == checkpoint` authoring contract; (3) the **`heldOut → reviews/{cardId}.isTransfer:true + track:'B'`** card-creation mapping is **owned by `spec-01`** (`writeCardsForCompletion` creates a card for every graded-required beat AND every `heldOut` beat — README §4 Foundation A); (4) the runtime `!heldOut` visible-walk exclusion is **owned by `spec-11`**; (5) `REQUIRE_TRANSFER=1` is sequenced **after** spec-00's `REQUIRE_SCHEMA_ID=1` + backfill (gate Issue #12).
- Manual `/dev/lesson/<id>` check on both tracks: the held-out beat does not appear in normal flow (full gold-gate behavior verified with spec-11).
