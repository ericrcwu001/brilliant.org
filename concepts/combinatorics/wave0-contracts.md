# Wave-0 Contracts — concept-combinatorics

Frozen shared contracts for `course-combinatorics` (lessons `lesson-combinatorics-1..6`),
so all six lessons build in parallel without colliding on shared files. **Additive only** —
the seven Pattern-Hitting-Times lessons are behaviorally unchanged. Branch: `concept/combinatorics`.

**Status: FROZEN & GREEN.** `./node_modules/.bin/tsc -b` → exit 0; `./node_modules/.bin/vitest run` →
269/269 (35 files); `./node_modules/.bin/tsx scripts/validate-fixtures.ts` → all existing PHT gates +
`✓ combinatorics engine self-check (Stage-2 anchor)` + `All fixtures valid.`

> Repo gotchas (obey in the build wave): no `npm run` — call `./node_modules/.bin/{tsc,vitest,eslint,vite,tsx}`
> directly; typecheck with `tsc -b`. No Java locally (no emulators/seed/rules). `tsc -b` typechecks
> `src/` + `vite.config.ts` only — `scripts/validate-fixtures.ts` is verified by running it via `tsx`.

---

## 1. Seven new interaction types — `src/content/schema.ts`

All seven are appended to the `InteractionSchema` `z.discriminatedUnion('type', […])` (after the
`tripletReveal` entry). Renderer files listed are the **build-wave** targets (Coder B). In Wave 0 every
type is **stub-routed to `ContinueStub`** (see §3).

| type | lesson | graded? | engine deps | renderer (build wave) |
|------|--------|---------|-------------|------------------------|
| `countingTree` | L1 | **graded iff `accept` present** | `product`, (`factorial`,`nPk` for copy) | `CountingTreeBeat.tsx` |
| `selectionGrid` | L2 | **graded iff `accept` present** | `nPk`, `nCk`, `factorial`, `reduce` | `SelectionGridBeat.tsx` |
| `pascalTriangle` | L3 | ungraded in L3 | `nCk`, `pascalRow` | `PascalTriangleBeat.tsx` |
| `vennCounter` | L4 | ungraded in L4 | `unionSize`, `inclusionExclusion`, `derangements` | `VennCounterBeat.tsx` |
| `pigeonholeBoard` | L5 | ungraded in L5 | `pigeonholeMin`, `forcesCollision` | `PigeonholeBoardBeat.tsx` |
| `probabilityCounter` | L6 | ungraded in L6 | `product`, `probabilityFromCounts` | `ProbabilityCounterBeat.tsx` |
| `handRanker` | L6 | **always graded** | `probabilityFromCounts` (sort by `favorable`) | `HandRankerBeat.tsx` |

Frozen Zod shapes (verbatim, do not diverge):

```ts
// L1
z.object({ type: z.literal('countingTree'),
  levels: z.array(z.object({ label: z.string(), options: z.number().int().positive() })),
  accept: z.array(z.string()).optional() })
// L2
z.object({ type: z.literal('selectionGrid'),
  n: z.number().int().positive(), k: z.number().int().positive(),
  order: z.enum(['toggle','on','off']),
  labels: z.array(z.string()).optional(), accept: z.array(z.string()).optional() })
// L3
z.object({ type: z.literal('pascalTriangle'),
  rows: z.number().int().positive(), reveal: z.enum(['tap','all']).optional(),
  showRowSums: z.boolean().optional(), showSymmetry: z.boolean().optional(),
  accept: z.array(z.string()).optional() })
// L4
z.object({ type: z.literal('vennCounter'),
  sets: z.union([z.literal(2), z.literal(3)]).optional(),
  maxSize: z.number().int().positive().optional(),
  initial: z.object({ a: z.number().int(), b: z.number().int(), ab: z.number().int() }).partial().optional(),
  accept: z.array(z.string()).optional() })
// L5
z.object({ type: z.literal('pigeonholeBoard'),
  items: z.number().int().positive(), holes: z.number().int().positive(),
  holeLabels: z.array(z.string()).optional(), itemLabel: z.string().optional(),
  accept: z.array(z.string()).optional() })
// L6
z.object({ type: z.literal('probabilityCounter'),
  factors: z.array(z.object({ label: z.string(), value: z.number().int().positive() })),
  total: z.number().int().positive(), accept: z.array(z.string()).optional() })
// L6
z.object({ type: z.literal('handRanker'),
  hands: z.array(z.object({ label: z.string(), favorable: z.number().int().positive() })),
  total: z.number().int().positive(), order: z.enum(['rarestFirst','commonestFirst']).optional() })
```

No per-variant `export type` was added; the inferred `Interaction` union (`z.infer<typeof InteractionSchema>`)
picks these up. Build-wave renderers narrow on `beat.interaction.type` (discriminated union).

---

## 2. Engine interface — `src/engine/combinatorics.ts` (FULLY IMPLEMENTED)

Pure, dependency-free, **EXACT** (BigInt, no floats), mirroring `src/engine/automaton.ts` discipline.
**Convention: number-in / bigint-out**, except `reduce` (bigint-in / bigint-out). The Lead chose to
implement fully now (not just stub the interface) to de-risk the build wave and make the Stage-2
cross-check real; goldens are pinned in `src/engine/combinatorics.test.ts` (6 cases, all pass).

```ts
factorial(n: number): bigint
nPk(n: number, k: number): bigint
nCk(n: number, k: number): bigint
product(opts: number[]): bigint
pascalRow(n: number): bigint[]
unionSize(a: number, b: number, ab: number): bigint
inclusionExclusion(terms: { size: number; sign: 1 | -1 }[]): bigint
derangements(n: number): bigint
pigeonholeMin(items: number, holes: number): number      // ⌈items/holes⌉, integer
forcesCollision(items: number, holes: number): boolean   // items > holes
reduce(n: bigint, d: bigint): { n: bigint; d: bigint }   // bigint-in; denom normalized > 0
probabilityFromCounts(fav: number, total: number): { n: bigint; d: bigint }  // = reduce(BigInt(fav), BigInt(total))
```

Edge conventions: `factorial(0)=1n`; `nPk`/`nCk` return `0n` for out-of-range `k` (`k<0`, `n<0`, `k>n`);
`product([])=1n`; `factorial`/`pascalRow`/`derangements` throw on negative/non-integer; `pigeonholeMin`
requires `holes>0`; `reduce` throws on zero denominator.

> ⚠️ **Build wave: call with `number` args** (e.g. `nCk(52, 5)`, `factorial(5)`, `unionSize(8, 6, 3)`),
> **not** the bigint args some Dept-2 specs sketched. Only `reduce` takes bigints (`reduce(624n, 2598960n)`).

### Goldens (cross-checked by `combinatorics.test.ts` + validate-fixtures self-check)

| call | = |
|------|---|
| `factorial(5)` | `120n` |
| `nPk(5,3)` / `nPk(365,3)` | `60n` / `48228180n` |
| `nCk(52,5)` / `nCk(5,3)` / `nCk(6,3)` | `2598960n` / `10n` / `20n` |
| `product([13,4,12,6])` / `product([78,6,6,44])` / `product([2,2,2])` | `3744n` / `123552n` / `8n` |
| `pascalRow(4)` | `[1n,4n,6n,4n,1n]` (invariants: `Σ pascalRow(n)=2ⁿ`, `C(n,k)=C(n,n−k)` ∀ n=0..6) |
| `unionSize(8,6,3)` | `11n` |
| `inclusionExclusion([120+,60−,20+,5−,1+])` | `76n`  (and `factorial(5) − 76n === derangements(5)`) |
| `derangements(5)` | `44n` |
| `pigeonholeMin(51,25)` / `(4,3)` / `(7,3)` / `(9,7)` | `3` / `2` / `3` / `2` |
| `forcesCollision(4,3)` / `(3,3)` / `(26,25)` / `(9,7)` | `true` / `false` / `true` / `true` |
| `reduce(44n,120n)` | `{n:11n,d:30n}` |
| `probabilityFromCounts(624,2598960)` / `(3744,…)` / `(123552,…)` / `(20,216)` | `1/4165` / `6/4165` / `198/4165` / `5/54` |

---

## 3. Dispatcher slots — `src/lesson/beats/index.tsx`

Seven explicit `case` labels added before `default:`, stacked onto one `return <ContinueStub {...props} />`
(stub renderers per Wave-0 rules; not a switch fallthrough). **Build wave:** Coder B replaces each case
body with its real renderer (`case 'countingTree': return <CountingTreeBeat {...props} />`, etc.) — the one
shared-file edit per lesson; the Lead orders these merges to resolve the dispatcher-index conflict deterministically.

---

## 4. `validate-fixtures.ts` registrations

- `GATED` += `lesson-combinatorics-1..6` (inclusivity gate: ≥1 primer, prediction `byOption`, hero blocks,
  `interviewNote`, early-win + retrieval opener, notation ladder).
- `MASTERY_LESSONS` += `lesson-combinatorics-1..6` (last beat `recap`; penultimate required `masteryChallenge`).
- `GRADED_TYPES` += `countingTree`, `selectionGrid`, `handRanker`.
- Imports the engine; **§6 Stage-2 self-check block** asserts the headline goldens above on every run.

All registrations are **dormant** until the lesson fixtures exist (the gate loops iterate over loaded
fixtures; no `lesson-combinatorics-*.json` yet → skipped cleanly). PHT behavior is byte-identical.

**Build-wave TODO (documented in the §6 block):** add per-fixture engine cross-checks — for each
combinatorics beat, reproduce its target/`accept` from the engine (e.g. `product(levels.map(l=>l.options))`
for `countingTree`; `nPk`/`nCk` for `selectionGrid`; `unionSize` for `vennCounter`; `pigeonholeMin`/
`forcesCollision` for `pigeonholeBoard`/answerEntry; `probabilityFromCounts` for `probabilityCounter`/
`handRanker`/`masteryChallenge`). Land these alongside the fixtures so Stage-2 actually cross-checks them.

---

## 5. Automaton decision — **OPTION (a): `patternOptions: ["H"]` placeholder** (built, never read)

**Decision.** Each `lesson-combinatorics-*.json` sets `patternOptions: ["H"]`. The LessonPlayer builds the
`H` automaton from it (`buildAutomaton('H', 0.5)`) and passes a non-`undefined` `automaton`/`pattern` to every
beat as today; the combinatorics beat renderers **ignore** `automaton`/`pattern` and build their own model from
their own interaction fields (the established `RaceSimBeat`/`WalkBoardBeat` precedent). **No change** to
`BeatProps` (`src/lesson/beats/types.ts`), `LessonPlayer.tsx`, or any existing renderer.

> Dept-2 specs sketch `patternOptions: []`. Use **`["H"]`** instead: it is the precedent the repo already
> documents (L3 gamblers-ruin uses `["H"]`) and it keeps `pattern` a valid H/T placeholder. `[]` also works
> (LessonPlayer falls back to `'H'`), but `["H"]` is explicit and matches the existing convention.

**Why not option (b) — make `automaton`/`pattern` optional.** It is *not* genuinely surgical:
- `LessonPlayer.tsx:128-130` **already** defends a missing/invalid placeholder (`const pattern = raw && /^[HT]+$/.test(raw) ? raw : 'H'`), so a valid `automaton` is **always** constructed at runtime — the optional typing would buy zero runtime benefit.
- `automaton`/`pattern` are consumed by ~18 existing Pattern-Hitting-Times beat renderers. Weakening `BeatProps.automaton: Automaton` → `automaton?: Automaton` forces "possibly undefined" handling (guards or `!`) across all of them — touching working code for the 7 shipped lessons, against the "no behavior change for PHT" + surgical constraints.

Option (a) achieves the goal (combinatorics beats that don't need the coin automaton) with **zero** edits to
shared types or existing lessons, fully consistent with the repo's existing non-coin-lesson convention.

---

## 6. Build-wave follow-ups (flagged, intentionally out of Wave-0 scope)

1. **`mastery.ts` `GRADED_BEAT_TYPES` (the runtime `mastered` signal — separate set from validate-fixtures
   `GRADED_TYPES`)** does **not** include the combinatorics graded types, so `computeMastered` won't count
   `selectionGrid`/`countingTree`/`handRanker` beats. If the per-lesson `mastered` signal should reflect these
   (specs key e.g. L2 on `l2-win` = selectionGrid), extend `GRADED_BEAT_TYPES` with an **accept-aware** check
   (countingTree/selectionGrid graded only when `accept` present; handRanker always). ⚠️ Beware required-but-
   **ungraded** countingTree beats (L1 `l1-explore`, `l1-model` are `required:true` with no `accept`) — a naïve
   set-add would wrongly count them. Non-blocking (`mastered` never gates unlock). Left out of Wave 0 because
   the dispatch scoped graded registration to validate-fixtures only and the correct change isn't a plain set-add.
2. **Per-fixture engine cross-check** in validate-fixtures (see §4 TODO) — lands with the fixtures.
3. **`patternOptions: ["H"]`** in every combinatorics fixture (see §5). `pattern` UNSET on all beats
   (combinatorics is engine-verified, not the H/T automaton — incl. each `masteryChallenge`).
4. **`NO_RETRIEVAL_OPENER` not needed**: all six lessons open their first graded beat with `retrievalGrid`
   (`lN-recall`), satisfying the opener gate; no exception entries required.
5. **`HARDEST_TYPES` unchanged**: none of the new graded types are "hardest"; first-graded early-win holds
   (retrievalGrid opens every lesson regardless).
