# Wave-0 Contracts — concept-expected-value

Frozen shared contracts for `course-expected-value` (lessons `lesson-expected-value-1..6`),
so all six lessons build in parallel without colliding on shared files. **Additive only** —
the shipped Pattern-Hitting-Times (PHT) lessons are behaviorally unchanged. Branch: `concept/expected-value`.

**Status: FROZEN & GREEN.** `./node_modules/.bin/tsc -b` → exit 0; `./node_modules/.bin/vitest run` →
269/269 (35 files, incl. `src/engine/expectation.test.ts`); `./node_modules/.bin/tsx scripts/validate-fixtures.ts`
→ existing PHT gates + `✓ expectation engine self-check (Stage-2 anchor)` +
`✓ chapters cover all built lessons: course-pattern-hitting-times` +
`✓ expectation per-fixture engine cross-check (0 beats)` + `All fixtures valid.`

> Gotchas (build wave): no `npm run` — call `./node_modules/.bin/{tsc,vitest,eslint,vite,tsx}` directly;
> `tsc -b` typechecks `src/` + `vite.config.ts` only — `scripts/validate-fixtures.ts` is verified via `tsx`.
> No Java. Not committed (the Manager commits Wave 0).

---

## 1. Three new interaction types — `src/content/schema.ts`

Appended to the `InteractionSchema` `z.discriminatedUnion('type', […])` (after `tripletReveal`). All
**UNGRADED** (no `GRADED_TYPES` entries). Renderer files are **build-wave** targets (stub-routed to
`ContinueStub` in Wave 0). All DOM/SVG (no Konva).

| type | lesson | graded? | engine deps | renderer (build wave) |
|------|--------|---------|-------------|------------------------|
| `expectationScale` | L1 | ungraded | `expectedValue` | `ExpectationScaleBeat.tsx` |
| `conditionalTree` | L4 | ungraded | `totalExpectation` (+`solveLinearSystem`) | `ConditionalTreeBeat.tsx` |
| `couponCollectorSim` | L5 | ungraded | `harmonic`, `couponCollector` | `CouponCollectorSimBeat.tsx` |

Frozen Zod shapes (verbatim; `RationalSchema = {n:int, d:int>0}` is reused):

```ts
// L1
z.object({ type: z.literal('expectationScale'),
  outcomes: z.array(z.object({ x: z.number(), label: z.string().optional(), weight: RationalSchema.optional() })),
  accept: z.array(z.string()).optional() })
// L4
z.object({ type: z.literal('conditionalTree'),
  cases: z.array(z.object({ label: z.string(), p: RationalSchema,
    value: RationalSchema.optional(), restart: z.object({ add: RationalSchema }).optional() })),
  accept: z.array(z.string()).optional() })
// L5
z.object({ type: z.literal('couponCollectorSim'),
  n: z.number().int().positive(), accept: z.array(z.string()).optional() })
```

**Dispatcher** (`src/lesson/beats/index.tsx`): the 3 types are stacked stub slots → `ContinueStub`
before `default:`. Build wave: Coder B replaces each case with its real renderer (the one shared-file
edit per lesson; the Lead orders merges).

---

## 2. Additive back-compat extensions (NOT new types) — `src/content/schema.ts`

Optional fields added to existing variants; every existing PHT fixture still validates (none set them).

| variant | added (all optional) | EV use |
|---------|----------------------|--------|
| `theorySimChart` | `mode?: 'automaton' \| 'noodleLoops'`, `nMax?: number` | L1 LLN chart; L2 noodle-loops sim |
| `coinSim` | `p?: number` | biased-coin bets |
| `raceSim` | `mode?: 'patterns' \| 'ants'`, `ants?: { n }` | L6 ants-on-a-string finale |

**`SliderBeat` order-stat dual-readout = renderer-only** (L6) — **no schema change**; the existing
`slider` variant suffices. The build wave teaches `SliderBeat.tsx` to show the `max=n/(n+1)` / `min=1/(n+1)`
dual readout. Recorded here so it isn't mistaken for a frozen schema item.

---

## 3. Engine interface — `src/engine/expectation.ts` (FULLY IMPLEMENTED)

Pure, dependency-free, **exact-rational** (no floats). Reuses `Rational = {n,d}` from `src/engine/types.ts`
and `reduce / ratAdd / ratSub / ratMul / solveLinearSystem` from `src/engine/automaton.ts`. **Rational-in /
Rational-out** for the EV fns; **number-in** for the count helpers. Pinned by `src/engine/expectation.test.ts`.

```ts
expectedValue(pmf: { x: Rational; p: Rational }[]): Rational           // Σ x·P(x)
totalExpectation(cases: { p: Rational; value?: Rational; restart?: { add: Rational } }[]): Rational
indicatorExpectation(p: Rational): Rational                            // E[1_A] = P(A)
harmonic(n: number): Rational                                          // H_n
couponCollector(n: number): Rational                                   // n·H_n
distinctAfterDraws(N: number, m: number): Rational                     // N(1−((N−1)/N)^m)
orderStatUniform(n: number): { max: Rational; min: Rational }          // {n/(n+1), 1/(n+1)}
noodleLoops(n: number): Rational                                       // Σ 1/(2k−1)
```

`totalExpectation` solves the self-referential case `(1 − Σ p_restart)·E = Σ p·value + Σ p_restart·add`
via `solveLinearSystem` (the same util PHT's first-step equations use). `expectedValue`/`harmonic`/
`noodleLoops` accumulate with `ratAdd`/`ratMul` and return `reduce(acc.n, acc.d)`.

> ⚠️ `reduce` from `automaton.ts` takes **two numbers** `reduce(n, d)` (not a Rational) — reduce a
> Rational `r` with `reduce(r.n, r.d)`.

### Goldens (cross-checked in expectation.test.ts + the validate-fixtures self-check)

| call | = | source |
|------|---|--------|
| `expectedValue(fairDie)` / `expectedValue(twoDiceSum)` / `[3,5,7 pmf]` | `7/2` / `7` / `5` | GB p.62 / p.44 |
| `totalExpectation(coin-die)` / `totalExpectation(dice-game restart)` | `7/4` / `7` | GB p.47 / p.48 |
| `indicatorExpectation(1/13)` | `1/13` | GB p.31 |
| `harmonic(2)` / `harmonic(3)` / `harmonic(6)` | `3/2` / `11/6` / `49/20` | GB p.49 |
| `couponCollector(6)` | `147/10` | GB p.49–50 |
| `distinctAfterDraws(6,1)` / `(6,2)` | `1` / `11/6` | GB p.50 |
| `noodleLoops(2)` / `noodleLoops(3)` | `4/3` / `23/15` | GB p.47–48 |
| `orderStatUniform(2)` / `(4).min` / `(500).max` | `{2/3,1/3}` / `1/5` / `500/501` | GB p.50–52 |

First-ace `53/5 = 1 + 48·(1/5)` is an `indicatorExpectation` + linearity composition (L3 fixture/test, not a
standalone fn). `P(sum=5)=1/9` and the geometric wait `6` are counting/fixture values verified by the L1/L5
fixtures, not engine outputs.

---

## 4. `validate-fixtures.ts` registrations

- `GATED` += `lesson-expected-value-1..6` (inclusivity gate: ≥1 primer, prediction `byOption`, hero blocks,
  `interviewNote`, retrievalGrid early-win opener, notation ladder).
- `MASTERY_LESSONS` += `lesson-expected-value-1..6` (last beat `recap`; penultimate required `masteryChallenge`).
- **NO `GRADED_TYPES` additions** (all 3 new types ungraded).
- **§6 EV engine self-check** (Stage-2 math anchor; runs every invocation; asserts the goldens above).
- **§7 chapters-coverage gate** (general; live-concept requirement): for any course with `chapters[]`, every
  built lesson is in exactly one chapter and every chapter lessonId has a node + fixture. Dormant for
  `course-expected-value` (still a `coming_soon` stub with no chapters) until the build wave promotes it;
  validates `course-pattern-hitting-times` today.
- **§8 EV per-fixture cross-check** (dormant until EV fixtures land): recomputes `conditionalTree`→
  `totalExpectation` and `couponCollectorSim`→`couponCollector` and compares any graded `accept`.

**CRITICAL — pattern-unset preserved:** the mastery gate's `if (penult.pattern) { …buildAutomaton… }` block
is **unchanged** — it skips the H/T automaton cross-check whenever `pattern` is unset. Every EV `*-prove`
beat leaves `pattern` UNSET (EV answers are engine-verified, not H/T recurrences). Build wave: do NOT set
`beat.pattern` on EV beats.

---

## 5. Decisions

- **Automaton placeholder = `patternOptions: ["H"]`** (settled). Each EV fixture sets it; LessonPlayer's
  existing `'H'` fallback builds a valid (unused) automaton; EV beat renderers ignore `automaton`/`pattern`.
  No change to `BeatProps`/`LessonPlayer`/existing renderers.
- **Konva theme: SKIPPED.** EV lesson widgets are DOM/SVG (read `--ch4`/CSS directly); the EV catalog card
  thumbnail is not a Konva surface; the L6 ants Konva (if used) reuses existing `ch2`/`laneA-B` tokens. No
  change to `src/lesson/konva/theme.ts`.
- **`mastery.ts` needs NO change for EV** — EV's graded beats are `retrievalGrid`/`answerEntry`/
  `masteryChallenge` (already in `GRADED_BEAT_TYPES`); `computeMastered` works out of the box. `computeMastered`
  keys per spec: L1 `{ev1-recall, ev1-win, ev1-pmf, ev1-prove}`, L4 `{ev4-recall, ev4-win, ev4-firststep,
  ev4-prove}`, L5 `{ev5-recall, ev5-win, ev5-stage, ev5-prove}`.

---

## 6. Build-wave follow-ups (flagged, out of Wave-0 scope)

1. **Per-lesson `*.factcheck.test.ts`** (vitest): cross-check every graded `answerEntry`/`masteryChallenge`
   `accept` against the engine (the problem-specific numbers §3 lists: `7/2`, `5`, `7`, `7/4`, `147/10`,
   `3/2`, etc.) — validate-fixtures §8 only covers the structured types whose inputs live in the fixture.
2. **Promote `fixtures/course-expected-value.json` to live**: `status:"live"` + 6 lesson nodes (glyph/viz/
   milestone) + 3 chapters (`ch-expected-value-1` ch4 [EV1,EV2]; `ch-expected-value-2` ch1 [EV3,EV4];
   `ch-expected-value-3` ch2 [EV5,EV6]) covering all 6 lessonIds — then §7 fires for it.
3. **`patternOptions: ["H"]`** in every EV fixture; `beat.pattern` UNSET on all beats (see §4 CRITICAL).
4. **`SliderBeat` dual-readout** (renderer-only, §2) for L6 order statistics.
5. Renderers for the 3 new types replace their dispatcher stub slots.
