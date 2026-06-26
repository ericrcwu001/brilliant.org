# Phase 2 — Interview Pack Content Layer

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).

**Status:** Planned — not yet built.

---

## Goal

Wire the already-authored Expected Value pack into a typed, validated, shared content layer (2A) and author the Pattern-Hitting-Times pack (2B). After 2A, every downstream phase has a real `InterviewPack` to build against. After 2B, both packs are validated, the PHT interviewer and generator prompts are written, all answers are engine-verified, and the 8-gate scorecard is signed off.

---

## Scope

**In (2A — wire-only, no new content)**
- `src/content/interviewPack.ts` — Zod schema + types + `toClientPack()` + `parseInterviewPack()`
- `src/content/interviewDraw.ts` — pure draw + seen-set logic
- `scripts/validate-interview-packs.ts` + `package.json` `validate:interviews` script

**In (2B — new content authoring)**
- `interviews/_build/build-pattern-hitting-times-pack.ts` → `interviews/course-pattern-hitting-times.json`
- `interviews/_build/render-pht-md.ts` → `interviews/course-pattern-hitting-times.md`
- `interviews/_build/verify-pht-pack.ts` — schema + engine cross-check
- `interviews/_build/verify-pht-independent.ts` — BigInt/Markov ground-truth check

**Out (other phases own these)**
- Runtime generator top-up (runtime call to LLM with avoid-list) — noted as future hook per ADR-0005; the generator prompt is authored here but the call-site lives in Phase 1 (`functions/src/interview.ts`)
- Firestore seeding / deployment — packs are committed only; the seed glob matches `fixtures/course-*.json | fixtures/lesson-*.json`, not `interviews/`; packs reach the runtime only via Phase 0's Functions bundling
- `mintInterviewToken` / `gradeInterview` callables — Phase 1
- Browser route / Realtime hook — Phase 3
- Firestore rules + attempts UI — Phase 5
- Full test suite — Phase 6

---

## Dependencies & what this unblocks

**Depends on:** Phase 0 (infra, Functions bundling config). The EV pack (`interviews/course-expected-value.json`) is already authored; 2A is wire-only for it.

**Unblocks:**
- Phase 1 (`mintInterviewToken` needs `interviewDraw`, `parseInterviewPack`, `toClientPack`)
- Phase 3 (`useRealtimeInterview` needs `ClientQuestion` type)
- Phase 6 (guardrail tests use `drawQuestion` + `InterviewPackSchema`)

Per the dependency graph in the [spec index](./README.md), 2A should follow P0 immediately — it unblocks P1 and P3 to proceed in parallel.

---

## Part 2A — Shared content layer

### 1. `src/content/interviewPack.ts` (new)

Mirror the house style in `src/content/schema.ts` (`src/content/schema.ts:1–13`): one file, exported `const ...Schema = z....`, `z.discriminatedUnion`/`z.tuple`/`z.enum` where apt, `z.infer` types at the bottom (`src/content/schema.ts:500–514`). Keep Firebase-free (no import of `firebase/firestore` or `../firebase/app`) so it is importable by both the browser dev-harness and the Functions runtime. This mirrors the `src/content/courseIds.ts` pattern (`src/content/courseIds.ts:1–4`).

**Schema — corrected for Zod v4:**

The [spec index README](./README.md) sketched `z.record(z.unknown())` for `template.params`. This repo uses **Zod v4** (confirmed by `z.prettifyError` usage in `scripts/validate-fixtures.ts:44–46`). In Zod v4, `z.record` requires **two** arguments. Correct form: `z.record(z.string(), z.unknown())`.

```ts
// src/content/interviewPack.ts
import { z } from 'zod'

const HintTripleSchema = z.tuple([z.string(), z.string(), z.string()])
// ↑ mirrors src/content/schema.ts:305 — z.tuple([z.string(), z.string(), z.string()])

const RubricSchema = z.object({
  correctness:   z.string(),
  approach:      z.string(),
  rigor:         z.string(),
  communication: z.string(),
  speed:         z.string(),
})

export const QuestionSchema = z.object({
  id:          z.string(),
  tier:        z.enum(['hard', 'harder', 'brutal']),
  fingerprint: z.string(),
  template: z.object({
    id:     z.string(),
    params: z.record(z.string(), z.unknown()),  // Zod v4: two-arg z.record
  }).optional(),                                // omitted ⇒ free-form question
  prompt:  z.string(),
  source:  z.string(),
  engineCheck: z.object({
    module:   z.string(),
    calls:    z.array(z.string()),
    answer:   z.string(),
    verified: z.boolean(),
  }),
  hidden: z.object({
    answer:     z.string(),
    approaches: z.array(z.string()),
    wrongTurns: z.array(z.string()),
    hintLadder: HintTripleSchema,
    rubric:     RubricSchema,
  }),
  followUps: z.array(z.string()),
})

export const InterviewPackSchema = z.object({
  version:         z.literal(1),
  kind:            z.literal('interview-pack'),
  courseId:        z.string(),
  concept:         z.string(),
  greenBookAnchor: z.string(),
  engineModule:    z.string(),
  generator:       z.string(),
  note:            z.string(),
  counts: z.object({
    total:     z.number().int().nonnegative(),
    byTier: z.object({
      hard:   z.number().int().nonnegative(),
      harder: z.number().int().nonnegative(),
      brutal: z.number().int().nonnegative(),
    }),
    templated: z.number().int().nonnegative(),
    freeForm:  z.number().int().nonnegative(),
  }),
  interviewerPrompt: z.string(),  // server-only; stripped by toClientPack()
  generatorPrompt:   z.string(),  // server-only; stripped by toClientPack()
  templates: z.array(z.object({
    id:           z.string(),
    title:        z.string(),
    source:       z.string(),
    description:  z.string(),
    engineModule: z.string(),
  })),
  questions: z.array(QuestionSchema),
})

// ClientQuestion: hidden entirely dropped; engineCheck reduced to module+verified only
export const ClientQuestionSchema = QuestionSchema
  .omit({ hidden: true })
  .extend({
    engineCheck: z.object({
      module:   z.string(),
      verified: z.boolean(),
      // calls and answer intentionally absent (server-side only)
    }),
  })

// z.infer types at the bottom, matching src/content/schema.ts:500–514 convention
export type Question        = z.infer<typeof QuestionSchema>
export type InterviewPack   = z.infer<typeof InterviewPackSchema>
export type ClientQuestion  = z.infer<typeof ClientQuestionSchema>

// ── toClientPack ──────────────────────────────────────────────────────────────
// Strips every hidden field, engineCheck.answer/calls, and the pack-level
// interviewerPrompt + generatorPrompt. Used by the /dev harness and as
// defence-in-depth; see CRITICAL rule below.
export function toClientPack(pack: InterviewPack): Omit<
  InterviewPack,
  'interviewerPrompt' | 'generatorPrompt' | 'questions'
> & { questions: ClientQuestion[] } {
  const { interviewerPrompt: _ip, generatorPrompt: _gp, questions, ...rest } = pack
  return {
    ...rest,
    questions: questions.map(({ hidden: _h, engineCheck, ...q }) => ({
      ...q,
      engineCheck: { module: engineCheck.module, verified: engineCheck.verified },
    })),
  }
}

// ── Server/build loader entry ─────────────────────────────────────────────────
// Throws (with z.prettifyError) if JSON does not conform — mirrors
// LessonSchema.parse() in src/content/loader.ts:27 and
// firestoreLoader.ts:21,32.
export function parseInterviewPack(json: unknown): InterviewPack {
  const result = InterviewPackSchema.safeParse(json)
  if (!result.success) {
    throw new Error(
      `InterviewPack schema validation failed:\n${z.prettifyError(result.error)}`,
    )
  }
  return result.data
}
```

> **CRITICAL (from [README §Leak mitigation](./README.md)):** The full pack (with `hidden`, `interviewerPrompt`, `generatorPrompt`) lives **only server-side**, bundled into `functions/`. The production browser bundle must **never** import a `course-*.json` pack directly. The browser receives only a single `ClientQuestion` returned by `mintInterviewToken`. `toClientPack()` is for the `/dev` harness and as defence-in-depth; it is **not** the primary protection.

**Validation against the EV pack:** `InterviewPackSchema.parse(require('../../interviews/course-expected-value.json'))` must succeed — this is the integration gate for 2A.

---

### 2. `src/content/interviewDraw.ts` (new)

Pure draw logic — no Firebase, no `Date`, no `Math.random` by default (injectable `rng` for deterministic tests). Importable by both the browser dev-harness and the Functions runtime.

```ts
// src/content/interviewDraw.ts
import type { InterviewPack, Question } from './interviewPack'

const TIER_ORDER = ['hard', 'harder', 'brutal'] as const
type Tier = (typeof TIER_ORDER)[number]

export interface DrawOpts {
  /**
   * Minimum tier to include. Default: 'hard' (the pack floor — all questions
   * qualify). Set to 'harder' or 'brutal' to restrict to tougher questions.
   */
  tierFloor?: Tier
  /**
   * Injectable rng ∈ [0,1) for deterministic tests. Defaults to Math.random.
   * Shuffle is Fisher-Yates over the eligible pool so every eligible question
   * is equally likely on a cold seen-set, and order degrades gracefully as the
   * pool shrinks. Deterministic given rng.
   */
  rng?: () => number
}

export interface DrawResult {
  question: Question
  followUps: string[]  // question.followUps — surfaced explicitly for the caller
}

/**
 * Select the next unseen question from pack, respecting:
 *   1. Not in seenQuestionIds (by id) nor in seen fingerprints (derived
 *      internally from the pack's questions array).
 *   2. Tier >= tierFloor (default: 'hard', i.e. all qualify).
 *   3. Deterministic given inputs when rng is injected; uses Math.random otherwise.
 * Returns null when the eligible pool is exhausted — the caller (mintInterviewToken)
 * should note this as a "pool empty" signal; runtime top-up via the generatorPrompt
 * is a future hook owned by Phase 1 (ADR-0005).
 */
export function drawQuestion(
  pack: InterviewPack,
  seenQuestionIds: string[],
  opts?: DrawOpts,
): DrawResult | null {
  const { tierFloor = 'hard', rng = Math.random } = opts ?? {}
  const tierMin = TIER_ORDER.indexOf(tierFloor)

  // Build seen set by id AND by fingerprint (catches regenerated variants with
  // a new id but same structural fingerprint — the de-dup guarantee from ADR-0005).
  const seenIds = new Set(seenQuestionIds)
  const seenFps = new Set(
    pack.questions
      .filter((q) => seenIds.has(q.id))
      .map((q) => q.fingerprint),
  )

  const eligible = pack.questions.filter(
    (q) =>
      !seenIds.has(q.id) &&
      !seenFps.has(q.fingerprint) &&
      TIER_ORDER.indexOf(q.tier) >= tierMin,
  )

  if (eligible.length === 0) return null

  // Fisher-Yates shuffle over the eligible pool (in-place copy).
  const pool = eligible.slice()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const question = pool[0]
  return { question, followUps: question.followUps }
}

// ── Seen-set helpers (used by mintInterviewToken + tests) ──────────────────────

/** Add a drawn question's id to the seen list (immutable — returns new array). */
export function markSeen(seenIds: string[], question: Question): string[] {
  return seenIds.includes(question.id) ? seenIds : [...seenIds, question.id]
}

/** True iff question has already been seen (by id or fingerprint match). */
export function isSeen(
  question: Question,
  seenIds: string[],
  pack: InterviewPack,
): boolean {
  const seenIdSet = new Set(seenIds)
  if (seenIdSet.has(question.id)) return true
  const seenFps = new Set(
    pack.questions.filter((q) => seenIdSet.has(q.id)).map((q) => q.fingerprint),
  )
  return seenFps.has(question.fingerprint)
}
```

**Unit-test contract** (lives in Phase 6, but spec'd here):
- **No-repeat:** draw N questions sequentially (marking each seen), assert no `id` or `fingerprint` repeats.
- **Tier floor:** with `tierFloor: 'brutal'`, only `brutal` questions are returned.
- **Pool exhaustion:** after marking all questions seen, `drawQuestion()` returns `null`.
- **Determinism:** same `seenQuestionIds` + same seeded `rng` → same question every call.
- **Injectable rng:** pass `rng: () => 0` to get the first eligible question in pool order.

---

### 3. `scripts/validate-interview-packs.ts` (new) + `validate:interviews` script

Mirror `scripts/validate-fixtures.ts` (`scripts/validate-fixtures.ts:1–50`) exactly: `fail()` / numbered-section structure / `z.prettifyError` / `process.exit(1)` / final `console.log('All packs valid.')`.

**Add to `package.json` `"scripts"`:**
```json
"validate:interviews": "tsx scripts/validate-interview-packs.ts"
```

**Script structure:**

```ts
// scripts/validate-interview-packs.ts
// Glob interviews/course-*.json → schema-validate each → per-question engine
// cross-check → structural gates. Exits non-zero on any failure.

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { InterviewPackSchema } from '../src/content/interviewPack'
import type { Question } from '../src/content/interviewPack'
// Engine imports — only the engines actually used by the packs:
import { buildAutomaton } from '../src/engine/automaton'
import { penneyOdds, bestBeater, conwayLeadingNumbers } from '../src/engine/race'
import { buildWalk } from '../src/engine/walk'
import { expectedWaitFair, autocorrelation } from '../src/engine/correlation'
import {
  expectedValue, totalExpectation, indicatorExpectation,
  harmonic, couponCollector, distinctAfterDraws, orderStatUniform, noodleLoops,
} from '../src/engine/expectation'

const interviewsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'interviews')

function fail(msg: string): never {
  console.error(`\n✗ ${msg}`)
  process.exit(1)
}

// ── 1. Schema validation ───────────────────────────────────────────────────────
const packFiles = readdirSync(interviewsDir).filter(f => /^course-.*\.json$/.test(f)).sort()
if (packFiles.length === 0) fail('No interview packs found in interviews/')

const packs = packFiles.map(f => {
  const json = JSON.parse(readFileSync(join(interviewsDir, f), 'utf8'))
  const result = InterviewPackSchema.safeParse(json)
  if (!result.success) {
    console.error(`\n✗ ${f} failed schema validation:\n`)
    console.error(z.prettifyError(result.error))
    process.exit(1)
  }
  console.log(`✓ schema: ${f}`)
  return result.data
})

// ── 2. Per-question engine cross-check ────────────────────────────────────────
// Dispatch on q.engineCheck.module + q.template?.id.
// For each question: recompute the answer from the engine and assert exact equality
// with q.engineCheck.answer. PHT questions dispatch to automaton/race/walk/correlation;
// EV questions dispatch to expectation. Free-form questions (no template) are cross-
// checked by module only if a recomputation strategy exists.
// See the EV verifier (interviews/_build/verify-ev-pack.ts) and
// verify-ev-independent.ts as the gold reference for the cross-check structure.
for (const pack of packs) {
  let crossChecked = 0
  for (const q of pack.questions) {
    const recomputed = recomputeAnswer(q)
    if (recomputed !== null && recomputed !== q.engineCheck.answer) {
      fail(
        `${pack.courseId}/${q.id}: engine recompute="${recomputed}" ` +
        `engineCheck.answer="${q.engineCheck.answer}"`,
      )
    }
    if (recomputed !== null) crossChecked++
  }
  console.log(`✓ engine cross-check: ${pack.courseId} (${crossChecked} questions recomputed)`)
}

// ── 3. Structural gates (per-pack) ────────────────────────────────────────────
for (const pack of packs) {
  // a. All verified === true
  pack.questions.forEach(q => {
    if (!q.engineCheck.verified)
      fail(`${pack.courseId}/${q.id}: engineCheck.verified !== true`)
  })

  // b. Unique fingerprints
  const fps = pack.questions.map(q => q.fingerprint)
  const fpSet = new Set(fps)
  if (fpSet.size !== fps.length) {
    const dups = fps.filter((f, i) => fps.indexOf(f) !== i)
    fail(`${pack.courseId}: duplicate fingerprints: ${dups.join(', ')}`)
  }

  // c. Valid tiers (floor = hard)
  pack.questions.forEach(q => {
    if (!['hard', 'harder', 'brutal'].includes(q.tier))
      fail(`${pack.courseId}/${q.id}: invalid tier "${q.tier}"`)
  })

  // d. Exactly 3 hint rungs per question
  pack.questions.forEach(q => {
    if (q.hidden.hintLadder.length !== 3)
      fail(`${pack.courseId}/${q.id}: hintLadder has ${q.hidden.hintLadder.length} rungs (expected 3)`)
  })

  // e. All 5 rubric axes present
  pack.questions.forEach(q => {
    const r = q.hidden.rubric
    if (!r.correctness || !r.approach || !r.rigor || !r.communication || !r.speed)
      fail(`${pack.courseId}/${q.id}: missing rubric axis`)
  })

  // f. ≥1 followUp per question
  pack.questions.forEach(q => {
    if (q.followUps.length < 1)
      fail(`${pack.courseId}/${q.id}: no followUps`)
  })

  // g. Counts match pack.counts header
  const actual = pack.questions.length
  if (actual !== pack.counts.total)
    fail(`${pack.courseId}: counts.total=${pack.counts.total} but ${actual} questions present`)
  const byTier = { hard: 0, harder: 0, brutal: 0 }
  pack.questions.forEach(q => { byTier[q.tier]++ })
  ;(['hard', 'harder', 'brutal'] as const).forEach(t => {
    if (byTier[t] !== pack.counts.byTier[t])
      fail(`${pack.courseId}: counts.byTier.${t}=${pack.counts.byTier[t]} but got ${byTier[t]}`)
  })

  // h. NO-LEAK guard — hint rungs 2 & 3 must be method-only (not state the final answer).
  // Mirrors build-expected-value-pack.ts:1067–1091 hintRungLeaks() logic exactly.
  pack.questions.forEach(q => {
    const ans = q.engineCheck.answer
    if (hintRungLeaks(ans, q.hidden.hintLadder[1]))
      fail(`${pack.courseId}/${q.id}: hint rung 2 (stronger) leaks final answer "${ans}"`)
    if (hintRungLeaks(ans, q.hidden.hintLadder[2]))
      fail(`${pack.courseId}/${q.id}: hint rung 3 (near-reveal) leaks final answer "${ans}"`)
  })

  console.log(`✓ structural gates: ${pack.courseId}`)
}

console.log('\nAll packs valid.')
```

The `recomputeAnswer(q: Question): string | null` helper dispatches on `q.engineCheck.module`:
- `"src/engine/expectation.ts"` → parse `q.engineCheck.calls[0]` and re-invoke; the existing `verify-ev-pack.ts` (`interviews/_build/verify-ev-pack.ts:6–65`) is the gold reference — fold its re-derivation logic here.
- `"src/engine/automaton.ts"` → `buildAutomaton(pattern, p).expectedTimes.E0` per template params.
- `"src/engine/race.ts"` → dispatch on template id to `penneyOdds` / `bestBeater` / `conwayLeadingNumbers`.
- `"src/engine/walk.ts"` → `buildWalk(N, p).reachProb[i]` or `.duration[i]`.
- `"src/engine/correlation.ts"` → `expectedWaitFair(pattern)`.
- Free-form questions with no recomputation strategy: return `null` (skip cross-check with a note).

The `hintRungLeaks()` function is copied verbatim from `interviews/_build/build-expected-value-pack.ts:1067–1078`.

> **"EV wired"** = this script validates the existing EV pack (`interviews/course-expected-value.json`, 58 Qs) out of the box, folding in the logic from `interviews/_build/verify-ev-pack.ts` and `verify-ev-independent.ts` (which are the gold reference). Those per-pack verifiers remain as standalone scripts; the validate script runs all packs together as the CI gate.

---

## Part 2B — Authoring the Pattern-Hitting-Times pack

### Overview

Produces `interviews/course-pattern-hitting-times.json` (≥50 questions, engine-verified, 8-gate scorecard) and its `.md` mirror. The PHT concept spans **4 engines**:

| Engine | File | PHT topics covered |
|---|---|---|
| `automaton.ts` | `src/engine/automaton.ts` | Pattern wait time (Markov chains, recurrences, L1 + L4 + L5) |
| `race.ts` | `src/engine/race.ts` | Penney's Game, second-mover counter, non-transitivity (L2) |
| `walk.ts` | `src/engine/walk.ts` | Gambler's Ruin: reach probability, expected duration (L3) |
| `correlation.ts` | `src/engine/correlation.ts` | Overlap shortcut, Conway martingale, border structure (L6) |

Concept fixture anchors (for `source` fields): `fixtures/course-pattern-hitting-times.json` + lessons `lesson-pattern-hitting-times`, `lesson-penneys-game`, `lesson-gamblers-ruin`, `lesson-states-streaks`, `lesson-longer-patterns`, `lesson-overlap-shortcut`.

Pack-level `engineModule`: `"src/engine/automaton.ts"` (the flagship lesson's engine). Per-question `engineCheck.module` names the specific engine for that question.

---

### Templates (6, engine-backed)

Each template is an entry in the pack's `templates` array and drives multiple parameterized `questions`. Template ids, goldens, and source anchors are listed below. All goldens are pinned from the engine `*.test.ts` files.

---

#### Template 1 — `tmpl-pattern-wait`

**Title:** Expected flips to see a pattern (fair coin, Markov recurrence)  
**Source:** Zhou §5.2–5.3; `src/engine/automaton.test.ts:8–23` (golden assertions)  
**Engine:** `src/engine/automaton.ts` — `buildAutomaton(pattern, 0.5).expectedTimes.E0`  
**Params:** `{ pattern: string }` — one of the 5 curated patterns  
**`engineCheck.module`:** `"src/engine/automaton.ts"`

**Goldens (from `src/engine/automaton.test.ts:8–23`):**

| pattern | `buildAutomaton(pattern, 0.5).expectedTimes.E0` | `engineCheck.answer` |
|---|---|---|
| `"HT"` | `4` | `"4"` |
| `"HH"` | `6` | `"6"` |
| `"THH"` | `8` | `"8"` |
| `"HTH"` | `10` | `"10"` |
| `"HHH"` | `14` | `"14"` |

**Example `engineCheck.calls`:** `["buildAutomaton('THH', 0.5).expectedTimes.E0"]`

Follow-up chain: bias the coin to p≠0.5 (segues into tmpl-biased-wait), compare E[HH] vs E[HHH] (why longer pattern isn't always longer wait), ask why E[HT] < E[HH] despite same length.

---

#### Template 2 — `tmpl-biased-wait`

**Title:** Expected flips to see a pattern (biased coin p ≠ 0.5)  
**Source:** Zhou §5.2; `src/engine/automaton.ts:buildAutomaton`  
**Engine:** `src/engine/automaton.ts` — `buildAutomaton(pattern, p).expectedTimes.E0`  
**Params:** `{ pattern: string, pNum: number, pDen: number }` (p = pNum/pDen)  
**`engineCheck.module`:** `"src/engine/automaton.ts"`

Representative parameterizations (biased coin p=1/3):

| pattern | `buildAutomaton(pattern, 1/3).expectedTimes.E0` | `engineCheck.answer` |
|---|---|---|
| `"HH"` | engine result (solve via `buildAutomaton`) | rational string |
| `"HT"` | engine result | rational string |

The build script computes these inline via `buildAutomaton(pattern, pNum/pDen).expectedTimes.E0` and wraps in `check(result, advisory, ctx)` (`interviews/_build/build-expected-value-pack.ts:41–47` for the `check()` pattern).

Follow-up: restore p=0.5 and compare; ask which pattern benefits most from a biased coin.

---

#### Template 3 — `tmpl-penney-race`

**Title:** Penney's Game — exact win probability (Conway's formula)  
**Source:** Zhou §5.4; `src/engine/race.test.ts:14–34`  
**Engine:** `src/engine/race.ts` — `penneyOdds(a, b).bBeatsA` (or `.aBeatsB`)  
**Params:** `{ a: string, b: string }` — the two competing patterns  
**`engineCheck.module`:** `"src/engine/race.ts"`

**Goldens (from `src/engine/race.test.ts:14–34`):**

| a | b | `penneyOdds(a,b).bBeatsA` | `engineCheck.answer` |
|---|---|---|---|
| `"HHH"` | `"THH"` | `{n:7, d:8}` | `"7/8"` |
| `"HH"` | `"HT"` | `{n:1, d:2}` | `"1/2"` (tie despite E[HH]=6 ≠ E[HT]=4) |
| `"HHH"` | `"HHT"` | `{n:1, d:2}` | `"1/2"` (tie despite E[HHH]=14 ≠ E[HHT]=8) |

**Conway leading numbers (from `src/engine/race.test.ts:32–34`):**  
`conwayLeadingNumbers('HHH', 'THH')` → `{aa:7, ab:0, ba:3, bb:4}`  
Odds formula: P(THH beats HHH) = (aa − ab) / ((aa − ab) + (bb − ba)) = 7 / (7 + 1) = **7/8**.

**`engineCheck.calls`:** `["penneyOdds('HHH', 'THH').bBeatsA"]`

Follow-up: why does THH beat HHH 7:1 even though E[THH]=8 < E[HHH]=14 (wait time ≠ win probability), the non-transitivity cycle.

---

#### Template 4 — `tmpl-second-mover`

**Title:** Best counter in Penney's Game (second-mover always wins)  
**Source:** Zhou §5.4; `src/engine/race.test.ts:37–46`  
**Engine:** `src/engine/race.ts` — `bestBeater(a)` + `penneyOdds(a, bestBeater(a)).bBeatsA`  
**Params:** `{ a: string }` — the first player's announced pattern  
**`engineCheck.module`:** `"src/engine/race.ts"`

**Goldens:**
- `bestBeater('HHH')` → `'THH'` (`src/engine/race.ts:67–71`; rule: `flip(a[1]) + a.slice(0, n−1)`)
- `penneyOdds('HHH', 'THH').bBeatsA` → `7/8`
- The test asserts P(bestBeater wins) > 1/2 for **all** length-3 patterns (`src/engine/race.test.ts:42–46`)

**Construction rule** (from `src/engine/race.ts:65–71`): `bestBeater(a) = flip(a[1]) + a[0..n-2]`.  
Examples: `bestBeater('HTH')='HHT'`, `bestBeater('HHT')='THH'`, `bestBeater('TTT')='HTT'`.

Follow-up: does the second-mover guarantee extend to length-4 patterns? Is there any pattern that beats its own bestBeater?

---

#### Template 5 — `tmpl-gamblers-ruin`

**Title:** Gambler's Ruin — reach probability and expected duration  
**Source:** Zhou §5.1; `src/engine/walk.test.ts:5–45`  
**Engine:** `src/engine/walk.ts` — `buildWalk(N, p).reachProb[i]` and `.duration[i]`  
**Params:** `{ N: number, pNum: number, pDen: number, i: number, query: 'reach' | 'duration' }`  
**`engineCheck.module`:** `"src/engine/walk.ts"`

**Goldens (from `src/engine/walk.test.ts:5–45`):**

Fair coin (p=0.5), N=4:

| i | `reachProb[i]` | `duration[i]` |
|---|---|---|
| 0 | `{n:0,d:1}` → `"0"` | `{n:0,d:1}` → `"0"` |
| 1 | `{n:1,d:4}` → `"1/4"` | `{n:3,d:1}` → `"3"` |
| 2 | `{n:1,d:2}` → `"1/2"` | `{n:4,d:1}` → `"4"` |
| 3 | `{n:3,d:4}` → `"3/4"` | `{n:3,d:1}` → `"3"` |
| 4 | `{n:1,d:1}` → `"1"` | `{n:0,d:1}` → `"0"` |

Biased coin (p=0.4, q=0.6), N=4, i=2 (`src/engine/walk.test.ts:36–44`):
- `reachProb[2]` → `{n:4,d:13}` → `"4/13"`
- `duration[2]` → `{n:50,d:13}` → `"50/13"`

**`engineCheck.calls`** examples:
- `["buildWalk(4, 0.5).reachProb[2]"]` → answer `"1/2"`
- `["buildWalk(4, 0.4).duration[2]"]` → answer `"50/13"`

Interview angles: Why does the biased-against gambler at i=2 (4-step board, p=0.4) have reach prob 4/13 ≈ 0.31 (not 1/2)? Duration from i=2 is 50/13 ≈ 3.85; duration from i=1 and i=3 are not symmetric when p≠0.5 (asymmetry of duration vs reach is a key PHT edge case).

Follow-up: generalize to arbitrary N (the formula for fair coin: reach[i] = i/N; duration[i] = i(N−i)).

---

#### Template 6 — `tmpl-overlap-wait`

**Title:** Overlap shortcut — E[wait] = Σ 2^k over self-borders  
**Source:** Zhou §5.3; `src/engine/correlation.test.ts:10–30`  
**Engine:** `src/engine/correlation.ts` — `expectedWaitFair(pattern)` = `autocorrelation(pattern).sum`  
**Params:** `{ pattern: string }`  
**`engineCheck.module`:** `"src/engine/correlation.ts"`

**Goldens (from `src/engine/correlation.test.ts:10–30` and `src/engine/automaton.test.ts:8–23`):**

| pattern | `autocorrelation(pattern).overlaps` | `autocorrelation(pattern).sum` | `engineCheck.answer` |
|---|---|---|---|
| `"HT"` | `[2]` | `4` | `"4"` |
| `"HH"` | `[1, 2]` | `6` | `"6"` |
| `"THH"` | `[3]` | `8` | `"8"` |
| `"HTH"` | `[1, 3]` | `10` | `"10"` |
| `"HHH"` | `[1, 2, 3]` | `14` | `"14"` |

The test asserts `expectedWaitFair(pattern) === buildAutomaton(pattern, 0.5).expectedTimes.E0` for every curated pattern (`src/engine/correlation.test.ts:25–30`) — the 4-way agreement golden.

Interview angle: HHH has 3 non-trivial self-borders (k=1,2,3) → sum=2+4+8=14; THH has only k=3 → sum=8; that gap (not the pattern length) explains why HHH takes longer. Candidate must state the border definition and the martingale argument.

Follow-up: design a length-4 pattern that waits the longest (HHHH: borders {1,2,3,4} → sum=2+4+8+16=30) vs one that waits minimally (HTHT: borders {2,4} → sum=4+16=20... recheck: `autocorrelation('HTHT')` = k=2 'HT'=='HT'✓, k=4 'HTHT'=='HTHT'✓ → sum=4+16=20).

---

### Build script: `interviews/_build/build-pattern-hitting-times-pack.ts`

Structurally identical to `interviews/_build/build-expected-value-pack.ts` (`interviews/_build/build-expected-value-pack.ts:1–182`). Key elements:

**Imports (real engines — no re-derivation):**
```ts
import { buildAutomaton, ratAdd, ratSub, ratMul, ratDiv, reduce } from '../../src/engine/automaton'
import { penneyOdds, bestBeater, conwayLeadingNumbers, winMatrix } from '../../src/engine/race'
import { buildWalk } from '../../src/engine/walk'
import { expectedWaitFair, autocorrelation, correlation, gamblerLedger } from '../../src/engine/correlation'
import type { Rational } from '../../src/engine/types'
```

**Helpers — copy verbatim from EV build script (`interviews/_build/build-expected-value-pack.ts:26–57`):**
- `R(n, d?)` — construct `Rational`
- `ratStr(r)` — format as `"n"` or `"n/d"`
- `assertSafe(r, ctx)` — overflow guard (`Math.MAX_SAFE_INTEGER`)
- `check(r, advisory, ctx)` — compute + assert + return string; fails loudly on mismatch
- `semFp(topic, entities, params, ask)` — free-form semantic fingerprint via SHA-1
- `tplFp(id, params)` — template fingerprint `"id:k1=v1,k2=v2,..."` (keys sorted)

**Engine computation section:** All PHT golden values computed inline with `check()` assertions, mirroring the EV script's T1–T6/FF sections. Example:

```ts
// Automaton goldens
const htWait  = check(buildAutomaton('HT',  0.5).expectedTimes.E0, 4,   'pht-ht-wait')
const hhWait  = check(buildAutomaton('HH',  0.5).expectedTimes.E0, 6,   'pht-hh-wait')
const thhWait = check(buildAutomaton('THH', 0.5).expectedTimes.E0, 8,   'pht-thh-wait')
const hthWait = check(buildAutomaton('HTH', 0.5).expectedTimes.E0, 10,  'pht-hth-wait')
const hhhWait = check(buildAutomaton('HHH', 0.5).expectedTimes.E0, 14,  'pht-hhh-wait')

// Race goldens
const thhBeatsHhh = check(penneyOdds('HHH', 'THH').bBeatsA, '7/8', 'pht-thh-beats-hhh')
const hhHtTie     = check(penneyOdds('HH',  'HT' ).aBeatsB, '1/2', 'pht-hh-ht-tie')

// Walk goldens (fair N=4)
const w4fair    = buildWalk(4, 0.5)
const reach2f   = check(w4fair.reachProb[2],  '1/2', 'pht-reach-i2-fair')
const dur2f     = check(w4fair.duration[2],   '4',   'pht-dur-i2-fair')
// Walk goldens (biased p=0.4, N=4)
const w4bias    = buildWalk(4, 0.4)
const reach2b   = check(w4bias.reachProb[2],  '4/13', 'pht-reach-i2-biased')
const dur2b     = check(w4bias.duration[2],  '50/13', 'pht-dur-i2-biased')

// Overlap goldens
const hhhOverlap = check(autocorrelation('HHH').sum, 14, 'pht-hhh-overlap-sum')
const hthOverlap = check(autocorrelation('HTH').sum, 10, 'pht-hth-overlap-sum')
```

Note: `check()` in the EV script takes a `Rational` first argument (`interviews/_build/build-expected-value-pack.ts:41`). For automaton's `expectedTimes.E0` which returns `number`, wrap: `check(reduce(e0, 1), String(e0), ctx)` — or add a `checkNum()` variant for integer results.

**NO-LEAK guard** — copy `hintRungLeaks()` + the loop verbatim (`interviews/_build/build-expected-value-pack.ts:1064–1092`).

**Final assertions** — mirror the EV script's 7-assertion block (`interviews/_build/build-expected-value-pack.ts:1094–1154`):
1. `questions.length >= 50`
2. All `engineCheck.verified === true`
3. Unique fingerprints
4. Valid tiers
5. Non-empty required fields
6. 3 hint rungs, 5 rubric axes, ≥1 followUp per question
7. `counts.*` match actual histogram

**Pack assembly + emit:**
```ts
const pack = {
  version: 1,
  kind: 'interview-pack',
  courseId: 'course-pattern-hitting-times',
  concept: 'Pattern Hitting Times',
  greenBookAnchor:
    'Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — ' +
    '§5.1 Gambler\'s Ruin (p.107–112); §5.2–5.3 Markov chains / hitting times / ' +
    'pattern probability (p.113–128); §5.4–5.5 Penney\'s Game + Conway leading ' +
    'numbers (p.129–136)',
  engineModule: 'src/engine/automaton.ts',
  generator: 'interviews/_build/build-pattern-hitting-times-pack.ts',
  note: 'Dormant capstone asset: committed but NOT seeded/deployed. ' +
        'Every numeric answer is reproduced by the exact-rational PHT engines ' +
        '(automaton.ts / race.ts / walk.ts / correlation.ts).',
  counts: { total: questions.length, byTier, templated, freeForm },
  interviewerPrompt,
  generatorPrompt,
  templates: TEMPLATES,
  questions,
}
writeFileSync(outPath, JSON.stringify(pack, null, 2) + '\n', 'utf8')
```

**Determinism:** no `Date`, no `Math.random`, no timestamps. Re-running produces byte-identical JSON.

---

### PHT `interviewerPrompt` structure

Same structure as the EV prompt in `interviews/course-expected-value.json:interviewerPrompt`. PHT-specific sections:

**EDGE CASES TO PROBE (PHT-specific traps that separate strong candidates):**
- **Wait ≠ win probability:** longer expected wait does NOT imply a higher win probability in a race (E[HHH]=14 > E[THH]=8 yet THH beats HHH 7/8 of the time). Candidates conflate these constantly.
- **Non-transitivity of Penney's Game:** A beats B, B beats C does NOT imply A beats C. A cycle can beat any fixed sequence. Ask explicitly whether Penney's is transitive.
- **Self-overlap drives wait, not length:** HHH waits longer than THH despite equal length because HHH has 3 self-borders (k=1,2,3) vs THH's one (k=3). Candidates often assume longer pattern → longer wait.
- **Reach vs duration are different objects:** P(reach N before 0 | start i) ≠ E[steps to absorption | start i]. Biased gambler at mid-board may have low reach probability but not-so-short expected duration (the two curves have different shapes).
- **Conway leading numbers — the overlap of suffixes of A with prefixes of B, not vice versa:** L(A,B) ≠ L(B,A) in general; the formula is asymmetric.
- **Gambler's Ruin fair-coin linearity:** With p=0.5, reach[i] = i/N exactly (linear in position); duration[i] = i(N−i) (quadratic). Biased coin breaks both.
- **Martingale grounding for the overlap shortcut:** The surviving-gamblers argument (each border length k contributes 2^k, total = E[wait] by fairness) is the *proof*, not just a formula. Candidates should state WHY Σ 2^k = E[T].

**GROUNDING clause (critical, PHT-specific):** Treat `{{hidden.answer}}` and `{{hidden.approaches}}` as GROUND TRUTH — they were verified by the PHT engines (automaton.ts / race.ts / walk.ts / correlation.ts). The four engines are exact-rational; every PHT answer is a clean integer or rational. Do NOT re-derive the math; if your mental arithmetic conflicts with the hidden record, you are wrong.

---

### PHT `generatorPrompt` structure

ENGINE-VERIFY-BEFORE-SERVE section (the ADR-0005 second hard fence) must list all 4 PHT engine signatures explicitly:

```
ENGINE-VERIFY-BEFORE-SERVE — PHT engines and exact-rational ranges
The live feature will run one of these engines to verify your output; REJECT if it cannot verify.

1. src/engine/automaton.ts — buildAutomaton(pattern: string, p: number)
   → .expectedTimes.E0: number (integer for p=0.5; Rational for biased coins)
   Valid patterns: sequences of 'H'/'T', length 1–6. p ∈ (0,1).

2. src/engine/race.ts — penneyOdds(a: string, b: string): { aBeatsB: Rational, bBeatsA: Rational }
   Valid: any two H/T patterns. bestBeater(a: string): string — the Conway counter.
   conwayLeadingNumbers(a, b): { aa, ab, ba, bb } — leading numbers for the odds formula.
   winMatrix(patterns: string[]): Rational[][] — full pairwise matrix.

3. src/engine/walk.ts — buildWalk(N: number, p: number): WalkModel
   → .reachProb: Rational[]  (index 0..N, reachProb[0]=0, reachProb[N]=1)
   → .ruinProb: Rational[]   (= 1 − reachProb)
   → .duration: Rational[]   (index 0..N, duration[0]=duration[N]=0)
   Valid: N ∈ [2..50]; p ∈ (0,1). Keep p = a/b with small a,b to avoid overflow.

4. src/engine/correlation.ts — expectedWaitFair(pattern: string): number (exact integer)
   autocorrelation(pattern): { bits, overlaps, sum } — the self-border structure.
   correlation(v, w): { bits, overlaps } — cross-correlation.
   Valid: H/T patterns of any length; result is always an exact integer (Σ 2^k).

HARD RANGE RULE: every graded answer must be an exact rational (n/d with integer n,d)
or a plain integer. Never emit an irrational or a decimal approximation as the answer.
```

AVOID-LIST and fingerprint rules: same as EV `generatorPrompt` (`interviews/course-expected-value.json:generatorPrompt`) — `tplFp(id, params)` for templates, `semFp(...)` for free-form, fingerprint must not be in the avoid-list.

---

### `interviews/_build/render-pht-md.ts`

Mirror `interviews/_build/render-ev-md.ts`. Reads `interviews/course-pattern-hitting-times.json`, renders a human-readable `.md` with: pack metadata, template descriptions, one question block per question (tier, fingerprint, prompt, source, followUps — NO hidden fields, NO engineCheck.answer). Output path: `interviews/course-pattern-hitting-times.md`.

> **Note:** The EV `.md` mirror (`interviews/course-expected-value.md`) is currently stale relative to the EV JSON. Re-render it by running `./node_modules/.bin/tsx interviews/_build/render-ev-md.ts` before committing 2A.

---

### `interviews/_build/verify-pht-pack.ts` (engine-API cross-check)

Schema + engine cross-check for the PHT pack. Structure mirrors `interviews/_build/verify-ev-pack.ts`.

Additions vs the EV verifier:
- Dispatches to all 4 PHT engines (not just `expectation.ts`).
- BigInt cross-check for heavy walk items: independently solve the tridiagonal first-step system using BigInt arithmetic and assert exact equality with `buildWalk(N,p).reachProb[i]` / `.duration[i]`.
- Asserts `engineCheck.module` is one of the 4 valid PHT engines for every question.
- All structural gates (same as `scripts/validate-interview-packs.ts` §3 above).

---

### `interviews/_build/verify-pht-independent.ts` (BigInt/Markov ground-truth)

Independent verification — does **not** call the production engines. Implements the same math from scratch using BigInt exact arithmetic to establish a 4-way agreement:

```
groundTruth (BigInt Markov) == engine result == engineCheck.answer == hidden.answer
```

**Independent computations:**

1. **Pattern hitting times (automaton):** Solve the first-step linear system `E_i = 1 + p·E_{next(i,H)} + q·E_{next(i,T)}` directly over BigInt fractions (Gaussian elimination). Assert equals `buildAutomaton(pattern, p).expectedTimes.E0`.

2. **Conway win probabilities (race):** Compute leading numbers `L(x,y)` from scratch (no `race.ts`), apply the odds formula, reduce. Assert equals `penneyOdds(a,b)`.

3. **Gambler's Ruin reach and duration (walk):** Solve the two tridiagonal systems (reach: homogeneous; duration: inhomogeneous with constant 1) independently over BigInt, with boundary conditions `reach[0]=0, reach[N]=1` and `dur[0]=dur[N]=0`. Assert equals `buildWalk(N,p).reachProb[i]` and `.duration[i]`. This cross-checks `src/engine/walk.ts:61–73` (`solveInterior` correctness).

4. **Overlap sum (correlation):** Compute autocorrelation borders via the KMP prefix function independently (no import from `correlation.ts`), sum `2^k`. Assert equals `expectedWaitFair(pattern)` and `buildAutomaton(pattern, 0.5).expectedTimes.E0`.

Any mismatch in any of these 4-way checks is a hard failure with a diagnostic showing all four values.

---

## Data contracts

Authoritative schema defined in `src/content/interviewPack.ts`. Full shape is the [README §Interview pack schema](./README.md#interview-pack-schema) with these corrections:

| Field | README sketch | Correct (this spec) |
|---|---|---|
| `template.params` | `z.record(z.unknown())` | `z.record(z.string(), z.unknown())` — **Zod v4 requires two args** |
| `counts.*` | bare `z.number()` | `z.number().int().nonnegative()` |
| `HintTripleSchema` | inline `z.tuple([...])` | named `const HintTripleSchema` (house style, mirrors `schema.ts:305`) |

The EV pack at `interviews/course-expected-value.json` is the canonical reference instance. The schema must parse it exactly: `InterviewPackSchema.safeParse(evPackJson).success === true`.

**Firestore layout** (server-side only, owned by Phase 1): see [README §Firestore layout](./README.md#firestore-layout). Packs are **never seeded to Firestore**; they reach the runtime via Phase 0's Functions bundling.

**Leak rule** (from [README §Leak mitigation](./README.md#leak-mitigation)): the live session `instructions` must never include `hidden.answer`, `hidden.approaches`, `hidden.wrongTurns`, or `engineCheck.answer`. The NO-LEAK guard in the build scripts enforces this at author time (hint rungs 2 & 3 are method-only). `toClientPack()` strips `hidden` and `engineCheck.answer/calls` as defence-in-depth. The production browser never imports `interviews/course-*.json` directly.

---

## Acceptance criteria & verification

Run binaries directly (no `npm run` shortcuts):

### 2A — schema + draw module wired

```bash
# TypeScript: must compile clean
./node_modules/.bin/tsc -b

# EV pack validates against the new schema
./node_modules/.bin/tsx scripts/validate-interview-packs.ts
# Expected: ✓ schema: course-expected-value.json
#           ✓ engine cross-check: course-expected-value (58 questions recomputed)
#           ✓ structural gates: course-expected-value
#           All packs valid.

# EV .md mirror is current (re-render if stale)
./node_modules/.bin/tsx interviews/_build/render-ev-md.ts

# interviewDraw unit tests (authored in Phase 6; contract spec'd here)
./node_modules/.bin/vitest run --reporter=verbose src/content/interviewDraw.test.ts
# Must pass: no-repeat, tier floor, pool exhaustion null, determinism, injectable rng
```

### 2B — PHT pack authored and verified

```bash
# Build the PHT pack (deterministic — byte-identical on re-run)
./node_modules/.bin/tsx interviews/_build/build-pattern-hitting-times-pack.ts
# Expected: ✓ All engine computations passed (safe-integer + advisory assertions)
#           ✓ NO-LEAK guard passed: rungs 2 & 3 are method-only for all N questions
#           ✓ Final assertions: N questions, byTier ..., ALL N QUESTIONS ENGINE-VERIFIED
#           Wrote .../interviews/course-pattern-hitting-times.json

# PHT pack validates against the Zod schema (picked up by validate:interviews)
./node_modules/.bin/tsx scripts/validate-interview-packs.ts
# Expected: both EV and PHT packs valid

# PHT engine-API verifier
./node_modules/.bin/tsx interviews/_build/verify-pht-pack.ts
# Expected: ✓ schema, ✓ engine cross-check (N questions), ✓ structural gates, 0 leaks

# PHT independent BigInt/Markov verifier (4-way agreement, 0 leaks)
./node_modules/.bin/tsx interviews/_build/verify-pht-independent.ts
# Expected: ✓ 4-way agreement for all automaton / race / walk / correlation questions
#           groundTruth == engine == engineCheck.answer == hidden.answer for every question
#           ✓ NO-LEAK: rungs 2 & 3 are method-only

# Render the PHT .md mirror
./node_modules/.bin/tsx interviews/_build/render-pht-md.ts

# Full validate (both packs)
./node_modules/.bin/tsx scripts/validate-interview-packs.ts
# All packs valid.

# Lint
./node_modules/.bin/eslint src/content/interviewPack.ts src/content/interviewDraw.ts \
  scripts/validate-interview-packs.ts
```

### 8-gate scorecard (PHT pack, per `.cursor/skills/lesson-factory/interview-packs.md`)

| # | Gate | Pass condition |
|---|---|---|
| 1 | Source fidelity | Green Book §5.1–5.5 anchored; every question cited |
| 2 | Real quant-style | Every question reads like a genuine quant-desk question (pattern-wait, race odds, gambler's ruin, overlap insight — not arbitrary puzzles) |
| 3 | Engine-verified pool | All `engineCheck.verified === true`; `verify-pht-pack.ts` passes clean |
| 4 | De-duplicated | All fingerprints unique within the PHT pool |
| 5 | Interviewer prompt | No-answer-leak; escalating hints; PHT grounding clause (4 engines); structured scoring |
| 6 | Generator prompt | ENGINE-VERIFY-BEFORE-SERVE section listing all 4 engine signatures; avoid-list; real-quant-style fence |
| 7 | Difficulty | Floor = hard; tiers tagged; follow-up chains present for all questions |
| 8 | Asset hygiene | `interviews/course-pattern-hitting-times.json` validates; `.md` mirror generated; NOT seeded/deployed |

---

## Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| **PHT answer overflow** — automaton / walk rational arithmetic exceeds `Number.MAX_SAFE_INTEGER` for long patterns or extreme p | Medium | `assertSafe()` in every `check()` call (`interviews/_build/build-expected-value-pack.ts:36–39`). For biased-coin items, pre-screen p values with small denominators. The independent BigInt verifier catches any drift post-hoc. |
| **Hint leak** — rung 2 or 3 inadvertently states the final answer (especially for integer answers like "4" appearing in a "4-step board" context) | Medium | `hintRungLeaks()` differentiates integer answers from contextual numbers via the "stated result" pattern (`=`, `⇒`, `is X`, `: X`) — same guard as EV. Run `build-pht-pack.ts` to flush all violations before commit. |
| **Schema drift** — `interviews/course-expected-value.json` was authored without a Zod schema; a future edit might add fields not in the schema | Low | `validate-interview-packs.ts` runs on CI via `validate:interviews`; any drift fails loudly. The EV pack's `note` field documents that it predates the schema. |
| **Zod v4 one-arg `z.record`** — any future tooling that code-generates from the README sketch might copy the wrong form | Low | This spec and the implemented `interviewPack.ts` use the two-arg form. The README sketch is explicitly annotated as approximate; this spec is the authoritative implementation reference. |
| **Non-transitivity questions confuse candidates and interviewers** | Low | The PHT `interviewerPrompt` calls this out as a probe target, not a gotcha; the `hidden.wrongTurns` for Penney race questions lists "assumes transitivity" explicitly. |
| **4-engine dispatch complexity in `validate-interview-packs.ts`** | Low | Dispatch table is keyed by `q.engineCheck.module`; each engine has a small, stable set of call patterns. Free-form questions that cannot be re-dispatched return `null` and are skipped with a log note. |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md) — decision record for the Realtime interview feature
- [ADR-0005](../adr/0005-ai-interview-questions-grounded-and-engine-verified.md) — iron rule: grounded + engine-verified; the runtime generator carve-out
- [Spec index & shared contracts](./README.md) — Firestore layout, caps/constants, callable I/O, leak-mitigation rule, dependency graph
- [Phase 0 — Infrastructure](./phase-0-infrastructure.md) — CSP/Permissions-Policy headers; `OPENAI_API_KEY` secret; Functions bundling (packs land here)
- [Phase 1 — Cloud Functions](./phase-1-cloud-functions.md) — `mintInterviewToken` (calls `drawQuestion`/`parseInterviewPack`/`toClientPack`); `gradeInterview`
- [Phase 3 — Realtime client](./phase-3-realtime-client.md) — `useRealtimeInterview`; consumes `ClientQuestion` type from this phase
- [Phase 6 — Guardrails and tests](./phase-6-guardrails-and-tests.md) — `interviewDraw` unit tests (no-repeat, tier floor, pool exhaustion); Firestore rules tests; e2e
- `src/content/schema.ts` — house style reference (`export const ...Schema`, `z.infer` at bottom, `HintTripleSchema:305`)
- `src/content/loader.ts` / `src/content/firestoreLoader.ts` — `Schema.parse` / `safeParse` discipline and the Firebase-free `courseIds.ts` pattern
- `scripts/validate-fixtures.ts` — template for `validate-interview-packs.ts` (`fail()`, numbered sections, `z.prettifyError`, summary line)
- `interviews/_build/build-expected-value-pack.ts` — canonical model for the PHT build script (`check()`, `assertSafe()`, `tplFp()`/`semFp()`, NO-LEAK guard, final assertions, `writeFileSync(...JSON.stringify(pack,null,2)+'\n')`)
- `interviews/_build/verify-ev-pack.ts` / `verify-ev-independent.ts` — gold reference for the PHT verifiers; fold EV re-derivation logic into `validate-interview-packs.ts` §2
- `.cursor/skills/lesson-factory/interview-packs.md` — pack contract, 8-gate scorecard, fingerprint/seen-set design
