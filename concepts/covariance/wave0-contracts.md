# Wave-0 Frozen Contracts — Covariance & Correlation (`course-covariance`)

> Stage-3 (Dept 3 / Coding). These contracts are FROZEN. Stage-4 per-lesson builds
> consume them and MUST NOT modify the schema member, engine signatures, renderer/
> grading slots, or the validate-fixtures cross-check. Committed on branch
> `concept/covariance`.

## 1. Schema — the single new discriminated-union member

Added to `src/content/schema.ts` immediately after the `nimBoard` block. ONE new
member, three display modes (the `chainBoard`/`stoppingBoard`/`payoffMatrix`
precedent — one type folds multiple presentations):

```ts
z.object({
  type: z.literal('covarianceBoard'),
  display: z.enum(['jointPmf', 'scatter', 'corrVectors']),
  joint: z.array(z.object({ x: RationalSchema, y: RationalSchema, p: RationalSchema })).optional(),
  rho1: RationalSchema.optional(),
  rho2: RationalSchema.optional(),
  labels: z.array(z.string()).optional(),
  task: z.enum(['covariance', 'rhoSquared', 'corrRange']).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),
})
```

- `ellipse` was DROPPED from the original concept-brief enum (Dept-2 froze three modes).
- `RationalSchema` is the existing `{ n: int, d: positive-int }` (plain-number) — the engine
  matches it (see §2: plain-number Rational, NOT BigInt).
- **NOT a `HERO_TYPE`** and **NOT in `GRADED_TYPES`**. Graded reads use `answerEntry` /
  `masteryChallenge`; the explore beats carry an engine-reproducible `headline` only.
- `task` selects the validate-fixtures cross-check path (§4): `covariance` & `rhoSquared`
  recompute from `joint`; `corrRange` recomputes from `rho1`/`rho2`.

## 2. Engine — `src/engine/covariance.ts` (pure, exact-rational, dependency-free)

**Plain-number `Rational` decision (FROZEN):** uses `Rational = { n: number; d: number }`
(consistent with `src/engine/types.ts`), NOT BigInt. Verified safe: worst intermediate
across every function is ≈176,400 (the ρ²-path) ≪ MAX_SAFE_INTEGER (9e15), provided every
op reduces via gcd (it does — `ratAdd`/`ratSub`/`ratMul` all call `reduce`). A BigInt engine
would force a number↔bigint bridge with the fixtures/validate-fixtures, which speak
plain-number Rational. No float is ever produced on a graded/anchored path (`ratToNumber`
is display-only).

### Types (FROZEN)
```ts
export type Rational = { n: number; d: number }
export type Pmf = { x: Rational; p: Rational }[]
export type JointCell = { x: Rational; y: Rational; p: Rational }
export type RhoResult =
  | { kind: 'rational'; rho: Rational; rhoSquared: Rational }
  | { kind: 'irrational'; rhoSquared: Rational; display: string }   // NO float .rho
```

### Public signatures (FROZEN)
```ts
export function reduce(n: number, d: number): Rational
export const ratAdd: (a: Rational, b: Rational) => Rational
export const ratSub: (a: Rational, b: Rational) => Rational
export const ratMul: (a: Rational, b: Rational) => Rational
export function expectedValueX2(pmf: Pmf): Rational
export function variance(pmf: Pmf): Rational
export function expectedProduct(joint: JointCell[]): Rational
export function covariance(joint: JointCell[]): Rational
export function covarianceIndicators(pAB: Rational, pA: Rational, pB: Rational): Rational
export function varianceOfSum(varX: Rational, varY: Rational, cov: Rational): Rational
export function covBilinear(varX: Rational, covXY: Rational): Rational
export function rhoSquared(cov: Rational, varX: Rational, varY: Rational): Rational
export function rho(cov: Rational, varX: Rational, varY: Rational): RhoResult
export function corrRange(rho1: Rational, rho2: Rational): { min: Rational; max: Rational }
export function psdDeterminant3(r12: Rational, r13: Rational, r23: Rational): Rational
export function equicorrelationMin(n: number): Rational
export function optimalHedgeRatio(covAB: Rational, varB: Rational): Rational
export function orderStatCovUniform(): { cov: Rational; rho: Rational }
export function formatRational(r: Rational): string
export function formatRangePair(range: { min: Rational; max: Rational }): string
export function ratToNumber(r: Rational): number   // display-only, never graded
```

### Golden anchors (in `src/engine/covariance.test.ts`, all pass exactly)
`variance(die)=35/12` · `expectedValueX2(die)=91/6` · `covariance ∈ {0, 1/4}` (+ two-dice 0) ·
`expectedProduct ∈ {49/4, 1/2, 1/4}` · `varianceOfSum(35/12,35/12,0)=35/6` ·
`covBilinear(35/12,0)=35/12` · `rhoSquared ∈ {1/2, 16/25, 1/4}` · `rho(12,9,25)=4/5` (rational) ·
`rho(35/12,35/12,35/6)` → `{kind:'irrational', rhoSquared:1/2, display:'1/√2'}` (NO float) ·
`corrRange(4/5,4/5)={7/25,1}` · `psdDeterminant3=0` at BOTH bounds (4/5,4/5,7/25) and (4/5,4/5,1) ·
`equicorrelationMin(3)=−1/2` · `optimalHedgeRatio(−6,9)=−2/3` · `orderStatCovUniform()={cov:1/36, rho:1/2}`.

ρ=1/√2 is display-only: the irrational `RhoResult` variant has no `.rho` field, so a float ρ
can never reach the grader. L4 grades `ρ²=1/2` only.

`corrRange` THROWS for non-Pythagorean-pair inputs (no float fallback) — the renderer's
ungraded interior-sweep readout wraps it in try/catch for display only.

## 3. Renderer / grading / dispatcher / CSS slots (FROZEN)

- **Renderer:** `src/lesson/beats/CovarianceBoardBeat.tsx` — `export function CovarianceBoardBeat(props: BeatProps)`,
  dispatches on `it.display` into `JointPmfDisplay` (DOM table, integer-mass-over-fixed-T, Σp=1
  exact, sign chip glyph+word), `ScatterDisplay` (inline SVG, authored points, scale slider),
  `CorrVectorsDisplay` (inline SVG vectors + [−1,1] number-line bracket). No Konva. Uses
  `chapterColor(props.lessonId)` for SVG strokes. Reduced-motion final frame; one `aria-live`
  mirror per view; 44px tap targets. Ungraded — advances on Continue (the StoppingBoardBeat shape).
- **Dispatcher:** `src/lesson/beats/index.tsx` — `case 'covarianceBoard': return <CovarianceBoardBeat {...props} />`.
- **Grading:** `src/lesson/grading.ts` — `isCovarianceBoardGraded(beat)` returns `false`
  (covarianceBoard never self-grades; graded reads use answerEntry) and
  `isCovarianceBoardCorrect(beat, input)` recomputes the anchor via the engine and compares
  under `norm` (pure, testable; not invoked by the runtime renderer).
- **CSS:** `src/styles/surfaces/covariance.css` (classes `covboard__*`/`covboard--*`, tokens only,
  reduced-motion block), imported in `src/styles/app.css`.
- **Renderer test:** `src/lesson/beats/CovarianceBoardBeat.test.tsx` (22 tests, green).

## 4. validate-fixtures cross-check (FROZEN)

`scripts/validate-fixtures.ts` §3f: for every `covarianceBoard` beat with a `headline`,
recompute via `covariance.ts` (switch on `task`) and assert equality —
`covariance`→`covFmt(covariance(joint))`, `rhoSquared`→`covFmt(rhoSquared(cov, varX, varY))`
(varX/varY from the joint marginals), `corrRange`→`covFmtRange(corrRange(rho1, rho2))`. A beat
with no `task` is skipped (passive display). It is a **no-op when no covariance fixtures exist**
(verified: `✓ covarianceBoard headlines match covariance.ts (0 beats)`). Mirrors the
chainBoard §3c / stoppingBoard §3d / gameTheory §3e precedent.

## 5. Accent `ch5` decision

Two distinct accent paths:
1. **Catalog/journey (data-driven, ADR-0004):** `ConceptCatalog.tsx` / `CourseJourney.tsx` read
   `course.accent` / `course.chapters[].accent` and emit `data-ch={accent}`. The catalog
   (`ergo-catalog.css`) and journey (`ergo-journey.css`) CSS already have `ch5` rules, and
   `studyDesk.resolveChapters` maps `CourseChapter.accent` straight through. **No fix needed
   here — handles ch5.**
2. **Lesson shell:** `LessonPlayer.tsx` emits `data-ch={chapterOf(lessonId)}` from
   `src/lesson/chapters.ts` (NOT from the course doc). `shell.css` mapped `data-ch='ch1'..'ch4'`
   to `--accent`/`--accent-tint`/`--accent-glow` but had **no `ch5` rule** — so a lesson root
   carrying `data-ch="ch5"` rendered the default brand indigo, off-palette. (The `--ch5`/`--ch5-tint`
   tokens already exist; `combinatorics-1.css` already *assumes* this rule.)

**Fix applied (minimal):** added one rule to `src/styles/surfaces/shell.css`:
```css
.lesson[data-ch='ch5'] { --accent: var(--ch5); --accent-tint: var(--ch5-tint); --accent-glow: rgba(124,92,240,.18); }
```
This makes chapter-1 covariance lessons (accent `ch5`) render on-palette inside the lesson
shell. The lesson→ch5 *assignment* in `chapters.ts` (`LESSON_CHAPTER`/`chapterOf`, whose
`ChapterHue` type is ch1-ch4 and which the Konva `CHAPTER_ACCENT` table also keys on) was
NOT touched — that is a Stage-4 per-concept-journey concern (the journey badge wiring), and
covarianceBoard renders in DOM/SVG via `var(--accent)` + `chapterColor`, so the palette rule
is the load-bearing fix for on-palette rendering. Do not over-edit chapters.ts in Stage 4
beyond what the journey-integration step needs.

## 6. Stage-4 per-lesson build split (RECORDED)

Each of the 6 lessons adds ONLY:
- `fixtures/lesson-covariance-N.json`
- `src/content/lesson-covariance-N.factcheck.test.ts`

These can be built in parallel (no shared-file contention) because the schema member, engine,
renderer, grading, dispatcher, CSS, and the validate-fixtures §3f block are all frozen here.

**Single shared integration step in Stage 4** (one serial commit, NOT per-lesson):
- Create `fixtures/course-covariance.json` (catalog fields from concept-brief §Catalog:
  domain Probability, domainOrder 0, order 4, status live, accent `ch5`, vizKey `twoNode`,
  chapters ch-covariance-1 (`ch5`)/ch-covariance-2 (`ch1`)/ch-covariance-3 (`ch3`)).
- Add the 6 lessonIds (`lesson-covariance-1..6`) to `GATED` and `MASTERY_LESSONS` in
  `scripts/validate-fixtures.ts`.
- (Optional, journey) wire the covariance lessons into the per-concept journey accent path if
  the journey badge needs `chapterOf` to return ch5 for L1/L2.

These were INTENTIONALLY deferred from Stage 3 so validate-fixtures never references an absent
fixture this turn (the chapters-coverage gate §7 would fail on a built course node with no
fixture on disk; the GATED/MASTERY gates would fail on absent lessons).

## Per-lesson display/task/headline map (from the interaction specs, for Stage 4 authors)
| lesson | beat | display | task | headline anchor |
|---|---|---|---|---|
| L2 | cov2-explore | `jointPmf` | `covariance` | `"0"` (independent) / `"1/4"` (matched) |
| L4 | cov4-explore | `scatter` | `rhoSquared` | `"1/2"` |
| L5 | cov5-explore | `corrVectors` | `corrRange` | `"7/25,1"` (rho1=rho2=4/5) |
| L6 | cov6-explore | `scatter` | `covariance` | `"1/36"` |
(L1, L3 use no covarianceBoard explore — they reuse shipped types per the specs.)
