# spec-00 — Method registry + `schemaId` tagging pipeline

- **Status:** Planned
- **Phase:** Phase 0 (Foundation B)
- **Depends-on:** none. (Upstream of `spec-03`, `spec-10`, `spec-11`, `spec-13`, `spec-24` — see README §7.)
- **Implements:** Decision **D5** (hybrid, extensible controlled-vocabulary method taxonomy); README §4 **Foundation B**; SPOV2 "tag every problem with a hidden deep-structure schema id" (brainlift app-action #9 — corrected per README §1 row 9: this is **net-new**, `BeatSchema` has no `schemaId` today).

> Read [README §1 row 9](README.md#§1), [§3 D5](README.md#§3), [§4 Foundation B](README.md#§4), [§8 R4/R5/R9](README.md#§8) before starting. This README's §4 Foundation B is the authoritative contract; do **not** rename `schemaId`, `METHODS`, `MethodId`, or `MethodIdSchema`.

---

## 1. Goal & non-goals

**Goal.** Create the single source of truth for the hidden deep-structure **method** of every graded problem: a new `src/content/methods.ts` registry (`METHODS`, `MethodId`, `MethodIdSchema`), an additive optional `schemaId` field on `BeatSchema`, a `validate-fixtures` assertion that (once backfill completes) **requires** a valid `schemaId` on every graded beat, a one-time agent-assisted backfill of the 187 existing graded beats, and lesson-factory skill edits that make declaring `schemaId` mandatory for every newly-authored graded beat (with a documented registry-extension process). This is the foundation the which-method gate (`spec-13`), the method-indexed recommender / interleaved queue (`spec-10`), method-weakness on review cards (`spec-01`/`spec-10`), and transfer-problem matching (`spec-24`) all read.

**Non-goals.** No queue, no recommender wiring, no UI surface, no confidence/SR fields (those are `spec-10`/`spec-13`/`spec-01`/`spec-02`). No new graded interaction types. No changes to grading, mastery semantics, or `GRADED_BEAT_TYPES` membership (R2). `schemaId` is **content metadata only** in this spec — nothing reads it at runtime yet; it is captured so downstream specs can.

---

## 2. Current reality (verified)

- **No `schemaId` / `methodTag` / `methods.ts` exists anywhere.** `grep -rn "schemaId\|methodTag\|method tag" src/ scripts/ fixtures/ .cursor/skills/lesson-factory/` returns nothing; `src/content/methods.ts` does not exist. (Confirms README §1 row 9.)
- **`BeatSchema`** is `src/content/schema.ts:608-652`. It is a flat `z.object` with `beatId`, `required`, `prompt`, `interaction`, `feedback`, and a set of optional additive fields (`maxHintLevel`, `track`, `density`, `pattern`, `hero`, `introducesSymbol`, `groundedBy`, `comparison`, `interviewNote`). `InteractionSchema` is the discriminated union at `:120-585`.
- **Graded-beat definition lives in `src/lesson/mastery.ts:11-25`.** `GRADED_BEAT_TYPES = {stateTap, equationTiles, answerEntry, masteryChallenge, retrievalGrid, handRanker}` (`:11`); `ACCEPT_GATED_BEAT_TYPES = {countingTree, selectionGrid}` (`:15`) are graded **only when** they carry a non-empty `accept` array (`isGradedBeat`, `:17-25`). `gradedRequiredBeatIds` (`:27-29`) and `computeMastered` (`:31-37`) consume this. **This is the canonical graded-beat predicate** — the validator must reuse it, not re-derive a parallel list. (Note: `validate-fixtures.ts` has a *separate, looser* `GRADED_TYPES` set at `:554-569` used only for the early-win/opener inclusivity check — it includes `substitution`/`patternPick`, which are **not** in `mastery.ts`. Do **not** reuse that set for `schemaId`; reuse `mastery.ts`'s predicate. See Foolproofing R-local.)
- **`validate-fixtures.ts`** (`scripts/validate-fixtures.ts`) parses every `fixtures/lesson-*.json` against `LessonSchema` (`:98-101`), then runs a series of engine cross-checks and gates. It has no env-flag pattern today; `process.env` is only used in seed/delete scripts. `fail(msg)` (`:81-84`) prints `✗ …` and `process.exit(1)`.
- **The corpus is 7 courses / 48 lesson fixtures / 187 graded beats** (verified by walking `fixtures/lesson-*.json` with the `mastery.ts` predicate):

  | courseId | lessons | graded beats | graded types present |
  |---|---|---|---|
  | `course-pattern-hitting-times` | 7 | 27 | answerEntry, retrievalGrid, equationTiles, masteryChallenge, stateTap |
  | `course-bayes-rule` | 8 | 38 | retrievalGrid, answerEntry, masteryChallenge |
  | `course-combinatorics` | 6 | 24 | retrievalGrid, countingTree(accept), answerEntry, masteryChallenge, selectionGrid(accept), handRanker |
  | `course-expected-value` | 6 | 24 | retrievalGrid, answerEntry, masteryChallenge |
  | `course-game-theory` | 6 | 19 | retrievalGrid, answerEntry, masteryChallenge |
  | `course-markov-chains` | 10 | 34 | retrievalGrid, masteryChallenge, answerEntry |
  | `course-optimal-stopping` | 5 | 21 | retrievalGrid, answerEntry, masteryChallenge |

  **DISCREPANCY to flag for the consistency gate:** the README §4 Foundation B starter `domains` lists reference 6 concept slugs (`probability`, `bayes-rule`, `combinatorics`, `expected-value`, `markov-chains`, `optimal-stopping`, `game-theory`) but the corpus has a **7th course, `course-pattern-hitting-times`** (the original coin/pattern flagship: first-heads, penney's, gambler's-ruin, states-streaks, longer-patterns, overlap-shortcut, pattern-hitting-times). Its deep structure is hitting-times / first-step-analysis on coin patterns — it maps cleanly onto the existing `first-step-analysis` / `symmetry` / `states-markov` ids using a `probability` domain tag, so **no new ids are strictly required**, but the registry's `domains` strings must include `probability` and the backfill must cover these 27 beats. This is reconciled in §4 below.
- **`concepts/<slug>/` authoring artifacts** exist for the 6 newer concepts (e.g. `concepts/bayes-rule/{concept-brief.md, wave0-contracts.md, lesson-bayes-rule-N/…}`); `course-pattern-hitting-times` predates this layout and has no `concepts/` dir. These are human-authored design docs, not machine-validated — the backfill updates fixtures, and *optionally* annotates these.
- **lesson-factory skill** (`.cursor/skills/lesson-factory/`): `SKILL.md` (org chart + pipeline), `departments.md` (Dept-1 Assessment Designer designs graded beats `:56`; Dept-3 Schema/Types Specialist owns schema additions `:127`), `qa-rubric.md` (9 Scorecard gates; gate 2 = math, gate 9 = inclusivity), `artifacts.md` (Lesson Brief template `:85`, Interaction Spec `:127`, Implementation Brief `:157`). The `GATED`/`MASTERY_LESSONS` allowlists in `validate-fixtures.ts` are called out as manually-maintained (`qa-rubric.md:53-57`).
- **ADR-0007** (`docs/adr/0007-lesson-factory-nested-department-leads.md`) documents the nested-department factory architecture — context only; not edited here.
- **Schema unit-test style:** `src/content/schema.test.ts` imports a fixture JSON + `LessonSchema` and asserts with vitest. `src/lesson/mastery.test.ts` exists for the graded predicate. Tests run via `./node_modules/.bin/vitest run`.

---

## 3. Design

Four additive pieces, in dependency order. Nothing existing changes behavior.

### 3a. The registry — `src/content/methods.ts` (NEW)

Single source of truth, shape per README §4 Foundation B (do not rename). Finalized id list in §4 below.

```ts
// src/content/methods.ts — single source of truth for deep-structure method tags
// (README §4 Foundation B, Decision D5). A `schemaId` on a graded beat names the
// METHOD a solver applies, independent of surface story — the hidden tag the
// which-method gate (spec-13), interleaved queue + method-weakness index
// (spec-10/01), and transfer matching (spec-24) read. Extensible: adding a
// concept may add ids here via the lesson-factory registry-extension process
// (.cursor/skills/lesson-factory/departments.md).
import { z } from 'zod'

export const METHODS = {
  // ── cross-domain (shared across concepts) ───────────────────────────────
  'first-step-analysis':   { name: 'First-step analysis',     domains: ['probability', 'markov-chains', 'optimal-stopping', 'expected-value'] },
  'symmetry':              { name: 'Symmetry',                domains: ['probability', 'combinatorics', 'game-theory'] },
  'conditioning':          { name: 'Conditioning',           domains: ['probability', 'bayes-rule', 'expected-value'] },
  'linearity-indicators':  { name: 'Linearity / indicators', domains: ['expected-value', 'combinatorics'] },
  'complementary-counting':{ name: 'Complementary counting', domains: ['combinatorics', 'probability'] },
  'recursion-self-reference': { name: 'Recursion / self-reference', domains: ['expected-value', 'probability', 'optimal-stopping'] },
  // ── domain-specific ─────────────────────────────────────────────────────
  'states-markov':         { name: 'States / Markov',        domains: ['markov-chains', 'probability'] },
  'stationary-distribution': { name: 'Stationary distribution', domains: ['markov-chains'] },
  'absorbing-states':      { name: 'Absorbing states / hitting times', domains: ['markov-chains', 'probability'] },
  'prior-update':          { name: 'Prior update',           domains: ['bayes-rule'] },
  'natural-frequencies':   { name: 'Natural frequencies',    domains: ['bayes-rule'] },
  'counting-product-rule': { name: 'Product rule / counting', domains: ['combinatorics'] },
  'choose-vs-arrange':     { name: 'Combinations vs permutations', domains: ['combinatorics'] },
  'inclusion-exclusion':   { name: 'Inclusion–exclusion',    domains: ['combinatorics'] },
  'pigeonhole':            { name: 'Pigeonhole',             domains: ['combinatorics'] },
  'dominance-nash':        { name: 'Dominance / Nash',       domains: ['game-theory'] },
  'backward-induction':    { name: 'Backward induction',     domains: ['game-theory', 'optimal-stopping'] },
  'mixed-strategy':        { name: 'Mixed strategy / indifference', domains: ['game-theory'] },
  'threshold-rule':        { name: 'Threshold / secretary',  domains: ['optimal-stopping'] },
} as const

export type MethodId = keyof typeof METHODS
export const MethodIdSchema = z.enum(
  Object.keys(METHODS) as [MethodId, ...MethodId[]],
)
```

> The `domains` strings are informational (used by `spec-24` transfer matching + author guidance), not enforced against `courseId`. **Keep ids stable forever** once backfilled — they are persisted on review cards (`reviews/{cardId}.schemaId`, Foundation A) and any rename silently orphans a learner's method-weakness history (R4: schema is permanent).

### 3b. `BeatSchema.schemaId` — `src/content/schema.ts` (EDIT, additive)

Add one optional field to `BeatSchema` (`:608-652`), mirroring the existing additive-optional fields (`introducesSymbol`, `interviewNote`, …):

```ts
  // Hidden deep-structure METHOD tag (README §4 Foundation B, Decision D5). Names
  // the method a solver applies, independent of the surface story. Optional during
  // the one-time backfill; once backfill completes, scripts/validate-fixtures.ts
  // REQUIRES a valid MethodId on every GRADED beat (mastery.ts predicate). Read by
  // the which-method gate (spec-13), the interleaved queue + method-weakness index
  // (spec-10/01), and transfer-problem matching (spec-24). NEVER shown to learners.
  schemaId: MethodIdSchema.optional(),
```

Import `MethodIdSchema` at the top of `schema.ts` (`import { MethodIdSchema } from './methods'` — `methods.ts` only imports `zod`, so no cycle). Export `Beat` type unchanged (it picks up the optional field automatically). This is **optional now** so the validator and all 48 fixtures still pass before backfill; §3c flips enforcement on.

### 3c. Validator assertion — `scripts/validate-fixtures.ts` (EDIT, flag-gated then hard)

Add one new section after the existing schema-validation block (§1, `:101`) and **reuse the `mastery.ts` graded predicate** (export it — see step 3). Flag-gated on `REQUIRE_SCHEMA_ID` until backfill completes; then make it unconditional.

> **Flag-flip ordering (README §5, gate Issue #12).** `validate-fixtures.ts` carries two enforcement flags that land in different specs: `REQUIRE_SCHEMA_ID` (this spec, gating method tags on graded beats) and `REQUIRE_TRANSFER` (`spec-24`, gating held-out transfer beats). **`REQUIRE_SCHEMA_ID=1` must flip to hard BEFORE `spec-24` flips `REQUIRE_TRANSFER=1`** — a transfer beat is also a graded beat that needs a valid `schemaId`, so enforcing the transfer gate on a not-yet-fully-tagged corpus would red-CI before the method-tag backfill is done. This spec only owns `REQUIRE_SCHEMA_ID`; `spec-24` must respect this ordering.

```ts
// ── 1c. Method-tag gate (Foundation B, spec-00). Every GRADED beat (the
// src/lesson/mastery.ts predicate — the same set that drives the mastery signal)
// must carry a valid schemaId. Flag-gated (REQUIRE_SCHEMA_ID=1) until the one-time
// backfill lands; then this becomes unconditional (R4: foundation enforced for good).
import { isGradedBeat } from '../src/lesson/mastery'   // export added in step 3
import { METHODS } from '../src/content/methods'
const VALID_METHOD_IDS = new Set(Object.keys(METHODS))
{
  const enforce = process.env.REQUIRE_SCHEMA_ID === '1'   // ← delete this line + the `if (enforce)` guard at end of backfill
  const offenders: string[] = []
  for (const lesson of lessons) {
    for (const beat of lesson.beats) {
      if (!isGradedBeat(beat)) continue
      const sid = (beat as { schemaId?: string }).schemaId
      if (sid == null) offenders.push(`${lesson.lessonId}/${beat.beatId}: graded beat missing schemaId`)
      else if (!VALID_METHOD_IDS.has(sid)) offenders.push(`${lesson.lessonId}/${beat.beatId}: schemaId "${sid}" not in registry`)
    }
  }
  if (offenders.length > 0) {
    if (enforce) {
      console.error('\n✗ method-tag gate:')
      for (const o of offenders) console.error(`  - ${o}`)
      process.exit(1)
    } else {
      console.warn(`⚠ method-tag gate (advisory; set REQUIRE_SCHEMA_ID=1 to enforce): ${offenders.length} graded beats missing/invalid schemaId`)
    }
  } else {
    console.log(`✓ method-tag gate: every graded beat carries a valid schemaId`)
  }
}
```

> `MethodIdSchema.optional()` already rejects *invalid* (non-registry) `schemaId` strings at parse time in §1, so the `!VALID_METHOD_IDS.has(sid)` branch is belt-and-suspenders; the load-bearing new check is **presence on graded beats**.

### 3d. lesson-factory skill edits — make `schemaId` mandatory on new graded beats

So every future authored graded beat self-tags and the registry stays the single source of truth. Edits to `qa-rubric.md`, `artifacts.md`, `departments.md` (§5 step 6). Includes the **registry-extension process**: if no existing id fits, the author proposes a new id (id + name + domains) as a Wave-0 contract addition to `src/content/methods.ts`, reviewed by the Dept-3 Schema/Types Specialist alongside the schema freeze — never invent an ad-hoc string on the beat.

### 3e. Backfill plan (§6)

One-time agent-assisted pass over the 48 fixtures (187 graded beats), human-reviewed, then flip §3c to hard.

---

## 4. Finalized registry id list (against the real corpus)

Decided by mapping each course's graded beats to their deep structure (prompts sampled in §2). The README starter list is **adjusted**: kept the cross-domain core; renamed/added domain-specific ids to cover all **7** courses; added a `probability` domain so `course-pattern-hitting-times` is covered without a redundant id.

| Course | Likely dominant `schemaId`(s) | Notes |
|---|---|---|
| `course-pattern-hitting-times` | `first-step-analysis`, `absorbing-states`, `symmetry`, `recursion-self-reference` | The 7th course (flag in §2). Coin-pattern hitting times = first-step / absorbing-state recurrences. |
| `course-bayes-rule` | `prior-update`, `natural-frequencies`, `conditioning` | |
| `course-combinatorics` | `counting-product-rule`, `choose-vs-arrange`, `inclusion-exclusion`, `pigeonhole`, `complementary-counting`, `symmetry` | |
| `course-expected-value` | `linearity-indicators`, `conditioning`, `recursion-self-reference`, `first-step-analysis` | Coupon-collector = linearity/indicators; one-step case tree = conditioning/recursion. |
| `course-game-theory` | `dominance-nash`, `backward-induction`, `mixed-strategy`, `symmetry` | |
| `course-markov-chains` | `states-markov`, `stationary-distribution`, `absorbing-states`, `first-step-analysis` | |
| `course-optimal-stopping` | `threshold-rule`, `backward-induction`, `first-step-analysis` | |

The per-beat assignment is the backfill's job (§6); this table is the author/reviewer guide, not a frozen per-beat mapping. **19 ids total**, all cross-domain ids reused by ≥2 domains (preserving the interleave-by-method goal of D3).

---

## 5. Step-by-step implementation

> Run all commands from repo root. Binaries direct, never `npm run` (AGENTS.md / HANDOFF.md).

1. **Create the registry.** Write `src/content/methods.ts` exactly as §3a (the 19-id list).
   → verify: `./node_modules/.bin/tsx -e "import('./src/content/methods.ts').then(m=>{console.log(Object.keys(m.METHODS).length); m.MethodIdSchema.parse('first-step-analysis'); try{m.MethodIdSchema.parse('nope');process.exit(2)}catch{console.log('rejects unknown ok')}})"` → prints `19` then `rejects unknown ok`.

2. **Add `schemaId` to `BeatSchema`.** In `src/content/schema.ts`: add `import { MethodIdSchema } from './methods'` near the top (after the `zod` import, `:12`); add the `schemaId: MethodIdSchema.optional()` field with its comment inside `BeatSchema` (after `interviewNote`, `:651`).
   → verify: `./node_modules/.bin/tsc -b` clean; `tsx scripts/validate-fixtures.ts` still prints `All fixtures valid.` (field is optional, so pre-backfill fixtures pass).

3. **Export the graded predicate for reuse.** In `src/lesson/mastery.ts`, change `function isGradedBeat` (`:17`) to `export function isGradedBeat`. (No behavior change; it just becomes importable by the validator so there is exactly one graded-beat definition — R-local.) **Coordination with `spec-13` (README §5 `src/lesson/mastery.ts` row):** spec-00 only adds the `export` keyword; `spec-13` later **edits the body** of this same `isGradedBeat` (and `isCheckpointBeat`) so it recognizes a gate `prediction` (`interaction.type==='prediction' && !!interaction.gate`). Both are compatible — keep this spec's edit a pure `export` flip (do not touch the body or `GRADED_BEAT_TYPES`, R2), so spec-13's body change applies additively on top.
   → verify: `./node_modules/.bin/vitest run src/lesson/mastery.test.ts` green.

4. **Add the flag-gated validator section.** Insert the §3c block into `scripts/validate-fixtures.ts` after the §1 schema-validation block (after `:101`, before the Firestore-safe §1b, or anywhere `lessons` is in scope). Add the two imports (`isGradedBeat`, `METHODS`) to the import group at the top.
   → verify (advisory mode): `tsx scripts/validate-fixtures.ts` prints `⚠ method-tag gate (advisory…): 187 graded beats…` and still ends `All fixtures valid.` (exit 0).
   → verify (enforce mode, pre-backfill, should FAIL): `REQUIRE_SCHEMA_ID=1 tsx scripts/validate-fixtures.ts` exits non-zero with `✗ method-tag gate:` listing offenders.

5. **Run the backfill** (§6). Tag all 187 graded beats across the 48 fixtures with a `schemaId`. Human-review the diff.
   → verify: `git diff --stat fixtures/ | tail -1` shows ~48 files changed; spot-check 3 fixtures by eye against §4.

6. **Flip the validator to hard.** Once backfill is reviewed + merged-intent: in `scripts/validate-fixtures.ts` delete the `const enforce = …` line and the `if (enforce) { … } else { warn }` branching — make the `offenders.length > 0` path always `console.error` + `process.exit(1)`.
   → verify: `tsx scripts/validate-fixtures.ts` prints `✓ method-tag gate: every graded beat carries a valid schemaId` and `All fixtures valid.`; temporarily delete one `schemaId` from a fixture → it now FAILS; restore it.

7. **Update the lesson-factory skill** (one coordinated edit per file; `spec-24` also edits these — apply additively, do not clobber):
   - `qa-rubric.md` gate 2 row (`:29`, Math correctness) OR a new sub-bullet under "Mechanized checks": add "**every graded beat declares a `schemaId`** from `src/content/methods.ts`; `validate-fixtures` enforces it (no missing/invalid tags)."
   - `qa-rubric.md` two-stage fact-check or gate 6: add a line that the Assessment Designer assigns the **deep-structure method** (`schemaId`) to each graded beat at brief time.
   - `artifacts.md` Lesson Brief "Verified problems & answers" table (`:103`) and the Implementation Brief Contracts (`:172`): add a `schemaId` column/field; add a short **Registry-extension process** note: "If no existing `METHODS` id fits a graded beat, propose a new id (`id`, `name`, `domains`) as a Wave-0 addition to `src/content/methods.ts`, reviewed by the Dept-3 Schema/Types Specialist with the schema freeze. Never put an unregistered string on a beat."
   - `departments.md`: Assessment Designer role (`:56`) gains "assigns each graded beat its `schemaId` method tag"; Schema/Types Specialist role (`:127`) gains "owns `src/content/methods.ts` registry additions during Wave-0 freeze."
   → verify: `grep -rn "schemaId" .cursor/skills/lesson-factory/` shows the new mentions in all four files.

8. **Write tests** (§7).
   → verify: `./node_modules/.bin/vitest run src/content/methods.test.ts src/content/schema.test.ts` green.

9. **Lint touched files.**
   → verify: `./node_modules/.bin/eslint src/content/methods.ts src/content/schema.ts src/lesson/mastery.ts scripts/validate-fixtures.ts` clean.

---

## 6. Backfill plan (one-time, agent-assisted, human-reviewed)

- **Scope:** the 187 graded beats in the 48 `fixtures/lesson-*.json` (the `isGradedBeat` predicate decides membership; `retrievalGrid`, `equationTiles`, `answerEntry`, `masteryChallenge`, `handRanker`, `stateTap`, and `countingTree`/`selectionGrid` *with* `accept`). **Ungraded beats get no `schemaId`** (the validator never asks for one).
- **Who:** a fresh Claude Code session (or the lesson-factory Dept-1 Assessment Designer) reads each lesson fixture's graded-beat `prompt`/`scenario`/`interaction`, and (for the 6 newer concepts) cross-references `concepts/<slug>/lesson-<slug>-N/` briefs, then assigns the best-fit `MethodId` from §4. Edit each fixture JSON to add `"schemaId": "<id>"` to each graded beat object.
- **Procedure (per fixture):** add the key; **never** reorder/reformat other keys (keep the diff surgical); run `tsx scripts/validate-fixtures.ts` after each file so a typo'd id fails immediately at Zod parse (`MethodIdSchema.optional()` rejects unknown strings even pre-flag).
- **Review:** the diff is reviewed by a human (or a second agent pass) for plausibility against §4 — a tagging error is low-blast-radius now (nothing reads it yet) but expensive later (orphans review-card history, R4), so review **before** any `spec-01`/`spec-10` work persists ids onto cards.
- **`concepts/*` artifacts:** optional. The fixtures are the machine-validated source of truth; updating the human briefs is nice-to-have, not gated. If updated, add the `schemaId` column to each lesson brief's problem table.
- **Gate flip:** only after the full diff is reviewed, do step 6 (validator → hard). Until then leave it advisory so a partial backfill doesn't red-CI other in-flight Phase-0 work.

---

## 7. Tests

- **`src/content/methods.test.ts` (NEW):**
  - `METHODS` has the expected ids (assert count = 19 and a few key ids present); every entry has a non-empty `name` and `domains` array.
  - `MethodIdSchema.parse('first-step-analysis')` succeeds; `MethodIdSchema.safeParse('not-a-method').success === false`.
  - Every `domains` string is from a known set (`probability`, the 6 concept slugs, `markov-chains`, etc.) — guards typos.
- **`src/content/schema.test.ts` (EDIT):** add a case that `BeatSchema` accepts a beat with a valid `schemaId`, accepts one with **no** `schemaId` (optional), and rejects `schemaId: 'bogus'`.
- **`src/lesson/mastery.test.ts` (EDIT, minimal):** add an assertion that `isGradedBeat` is exported and returns true for a `masteryChallenge` beat and false for a `recap`/`primer` (locks the predicate the validator depends on).
- **Fixture validation:** `tsx scripts/validate-fixtures.ts` green in advisory mode pre-backfill; green with `✓ method-tag gate` post-backfill+flip. After step 6, `REQUIRE_SCHEMA_ID` is gone and the gate is unconditional.
- **No `/dev` UI check needed** — this spec ships no surface. (Downstream `spec-13`/`spec-20` will exercise `schemaId` via `/dev/lesson/:id`.)

---

## 8. Data / schema deltas (only deltas; shapes per README §4)

- **`src/content/methods.ts`** (NEW): `METHODS`, `MethodId`, `MethodIdSchema` — README §4 Foundation B, finalized in §4 above. **New shared vocabulary**, consumed by `spec-01`, `spec-03`, `spec-10`, `spec-11`, `spec-13`, `spec-24`.
- **`BeatSchema.schemaId?: MethodId`** (`src/content/schema.ts`): additive, optional now → validator-required-on-graded-beats after backfill. No other schema field changes.
- **No Firestore changes** in this spec. (`reviews/{cardId}.schemaId` is denormalized there by Foundation A / `spec-01`, which imports `MethodId` from here — flagged so `spec-01` reuses this type, not a string.)

---

## 9. Foolproofing (README §8)

- **R4 (schema permanent; index empty).** `schemaId` ids are persisted onto review cards downstream, so they are effectively permanent — §3a/§6 stress **stable ids forever** and gate the validator to hard only after a human-reviewed backfill, so no half-tagged corpus ships. No Firestore query/index here (content-only field).
- **R5 (missing foundations silently degrade).** This spec **is** the foundation `spec-13`'s which-method gate, `spec-10`'s method interleave/weakness index, and `spec-24`'s transfer matching depend on. The hard validator gate (step 6) guarantees no graded beat reaches those specs untagged — they never have to stub a method. Build this before them (README §7: 00 → 03/10/11/13/24).
- **R9 ("in the product" ≠ "mechanism exists").** Confirmed by code, not the survey: no `schemaId` exists anywhere today (§2). The registry + tag are net-new.
- **R-local (one graded-beat definition).** The validator **imports `isGradedBeat` from `src/lesson/mastery.ts`** rather than re-listing types, and explicitly does **not** reuse `validate-fixtures.ts`'s looser inclusivity-only `GRADED_TYPES` (`:554`, which wrongly includes `substitution`/`patternPick`). One predicate, one source of truth (mirrors R2's "change mastery in one coherent place").

---

## 10. Definition of Done

- `src/content/methods.ts` exists with the 19-id registry; `MethodId`/`MethodIdSchema` exported.
- `BeatSchema.schemaId` added (optional); `isGradedBeat` exported from `mastery.ts`.
- `scripts/validate-fixtures.ts` enforces a valid `schemaId` on every graded beat **unconditionally** (flag removed in step 6) — `✓ method-tag gate` prints, and removing any `schemaId` fails CI.
- All 48 fixtures backfilled and human-reviewed; `tsx scripts/validate-fixtures.ts` ends `All fixtures valid.` and exits 0.
- lesson-factory `qa-rubric.md`, `artifacts.md`, `departments.md` make `schemaId` mandatory for new graded beats and document the registry-extension process.
- `./node_modules/.bin/vitest run` green (incl. new `methods.test.ts` + edited `schema.test.ts`/`mastery.test.ts`).
- `./node_modules/.bin/eslint src/content/methods.ts src/content/schema.ts src/lesson/mastery.ts scripts/validate-fixtures.ts` clean; `./node_modules/.bin/tsc -b` clean.
