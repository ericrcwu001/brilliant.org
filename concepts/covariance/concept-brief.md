# Concept: Covariance & Correlation (course-covariance)

> Stage-1 Concept Brief — Department 1 (Curriculum / Learning Science). Sibling artifacts in this
> dir: `continuity-report.md` (overlap → recall conversions), `source-dossier.md` (the verified,
> cited, exact-rational problem set). Every lesson below anchors to a numbered dossier problem.

## Green Book anchor
Grounded in *A Practical Guide To Quantitative Finance Interviews* (Xinfeng Zhou),
`/Users/ericwu/Developer/brilliant.org/references/green-book.txt`:
- **§ "Covariance" / "General rules of variance and covariance" / "correlation coefficient ρ" — pages 47-48** (lines 7502, 7582, 7660). The defining algebra: `Cov(X,Y)=E[XY]−E[X]E[Y]`, bilinearity/variance rules, `ρ=Cov/(σ_Xσ_Y)`, and the optimal-hedge-ratio `h=ρσ_A/σ_B` (line 7647).
- **§ "max/min correlation of 3 variables" — pages 26-29** (lines 4579-4943, stated answer max 1 / min 0.28); the PSD correlation-matrix material (lines 4924-4944).
- **§ "Correlation of max and min" — pages 51-52** (lines 8059-8175, answer ρ=1/2) — the synthesis capstone.

## One-line promise
**"Measure how two things move together — and prove it can't lie."**
(Theme: quantifying co-movement of two random variables — from variance as self-covariance, through
the covariance formula and the variance-of-a-sum cross term, to the unit-free correlation
coefficient ρ, its [−1,1] bound, and the geometry of three correlated variables.)

## Catalog fields
| field | value | note |
|---|---|---|
| courseId | `course-covariance` | |
| title | Covariance & Correlation | |
| domain | `Probability` | |
| domainOrder | `0` | verified: all shipped Probability courses use domainOrder 0 (PHT/EV/Markov/Bayes) |
| order | `4` | first free slot: PHT 0, EV 1, Markov 2, Bayes 3 → covariance 4. No collision. |
| status | `live` | |
| tagline | `How do two random quantities move together?` | 43 chars (≤60) |
| accent | `ch5` | ch1-ch4 each already head a Probability concept; ch5 is free in this domain → keeps the shelf distinct |
| vizKey | `twoNode` | covariance = relationship between *two* variables; `twoNode` is the established "two-things-related" glyph (Bayes / Markov-L1). Runner-up: `sum` (reads as the EV Σ-family). |

### chapters[] (covers every lessonId exactly once)
| id | label | accent | lessonIds |
|---|---|---|---|
| `ch-covariance-1` | Spread & Co-Movement | ch5 | `lesson-covariance-1`, `lesson-covariance-2` |
| `ch-covariance-2` | The Covariance Toolkit | ch1 | `lesson-covariance-3`, `lesson-covariance-4` |
| `ch-covariance-3` | Correlation in the Wild | ch3 | `lesson-covariance-5`, `lesson-covariance-6` |

**Coverage proof:** union of chapter lessonIds = {L1,L2,L3,L4,L5,L6} = the complete 6-lesson set;
2+2+2 = 6; no lessonId is duplicated and none is omitted. The live-render requirement (every
lesson reachable via exactly one chapter) is satisfied.

## Lessons (ordered)
Beat arc per lesson is the standard **Bet → Explore → Model → Prove** (matching the
`lesson-expected-value-*` shape: a `retrievalGrid` opener, ungraded `prediction` bet, an explore
widget, a `primer`/`tripletReveal` model card with `introducesSymbol`, graded `answerEntry`, a
`masteryChallenge` prove beat, and a `recap` close). Sequence respects teach-fresh order:
variance/SD → covariance → variance-of-a-sum → ρ → 3-variable range → interleaved capstone.

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors (dossier #) |
|---|---|---|---|---|---|---|---|
| 1 | `lesson-covariance-1` | Spread: Variance & Standard Deviation | Define Var(X)=E[X²]−E[X]² and SD=√Var as spread around the balance point. | `lesson-expected-value-1`, `lesson-expected-value-2` | `Var(X)` | twoNode | **#1** Var(die)=35/12 — GB p.47-48 |
| 2 | `lesson-covariance-2` | Covariance: The Leftover of the Product Rule | Define Cov(X,Y)=E[XY]−E[X]E[Y]; read its sign; build a joint pmf. | `lesson-covariance-1`, `lesson-expected-value-2`, `lesson-expected-value-3`, `lesson-bayes-rule-3` | `Cov(X,Y)` | twoNode | **#6** Cov 0 vs 1/4; **#2** Cov(X₁,X₂)=0 — GB p.47-48 |
| 3 | `lesson-covariance-3` | Variance of a Sum: The Cross Term | Show Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y); contrast dependence-free linearity. | `lesson-covariance-2`, `lesson-expected-value-2` | `Var(X+Y)` | twoNode | **#2** Var(X₁+X₂)=35/6; **#3** Cov(X₁,S)=35/12 — GB p.47-48 |
| 4 | `lesson-covariance-4` | Correlation ρ: The Unit-Free Score | Define ρ=Cov/(σ_Xσ_Y)∈[−1,1]; grade ρ² when ρ irrational; expose Cov=0⇏independence. | `lesson-covariance-3` | `ρ(X,Y)` | twoNode | **#5** ρ=4/5; **#4** ρ²=1/2 (ρ=1/√2 display-only); **#7** Cov(X,X²)=0 — GB p.48 |
| 5 | `lesson-covariance-5` | The Correlation Triangle: 3-Variable Bounds | Use the PSD-determinant constraint to bound the third correlation; equicorrelation floor. | `lesson-covariance-4` | `ρ-range` | twoNode | **#10** max 1/min 7/25; **#11** −1/2; **#12** −1/(n−1); **#13** hedge −2/3 — GB p.26-29, p.48 |
| 6 | `lesson-covariance-6` | Synthesis: Min, Max & the Whole Toolkit | Cumulative interleaved capstone: order-statistic covariance + mixed-review across the arc. | `lesson-covariance-1`…`5`, `lesson-expected-value-6` | `Cov(min,max)` | twoNode | **#8** Cov(min,max)=1/36, ρ=1/2; **#9** E[YZ]=1/4 — GB p.51-52 |

**All 13 dossier problems placed:** L1:#1; L2:#2,#6; L3:#2,#3; L4:#4,#5,#7; L5:#10,#11,#12,#13;
L6:#8,#9. Rejected/irrational items (Jane Street 0.9/0.8 range; dice float ρ=1/√2 as a graded
float) are honored as display-only / out-of-graded-set per the dossier.

**Retrieval openers baked in** (per `continuity-report.md` §3a): L1 → "Recall E[X] for a fair die →
7/2" + "EV said one thing was *next* — what?" → spread; L2 → "When is E[XY]=E[X]E[Y] allowed?" →
only if independent; L3 → "State linearity of expectation"; L4 → "Covariance has units of X×Y —
recall"; L5/L6 → re-surface the ρ-definition + "P=favorable/total". The **single cumulative
interleaved capstone checkpoint** lives in **L6** (cloned from `lesson-states-streaks.json`'s
mixed-review design) — no scheduler.

## New engine(s)/widget(s) anticipated (for Wave 0)

### EXACT-RATIONAL / √ CONSTRAINT (rule 4 — this concept's central design risk)
**ρ = Cov/√(Var_X·Var_Y) is generically irrational.** The pure, dependency-free, exact (BigInt
rational) engine therefore:
1. **Grades on ρ², covariance, and variance** — all guaranteed rational from finite pmfs /
   bilinearity / PSD-determinant identities.
2. **Returns a rational ρ ONLY when provably rational** — perfect-square variances (#5: 12/√225 =
   4/5) or Pythagorean-pair inputs (#10: (4/5,3/5) ⇒ √(1−ρ²) rational, giving min 7/25, max 1).
3. **Never grades a float ρ.** #4's ρ=1/√2 is exposed as **ρ²=1/2** (graded golden) with ρ marked
   display-only (a `ratToNumber`-style escape). The Jane Street 0.9/0.8 range (0.72±0.6√0.19) is
   rejected; only the GB 0.8/0.8 twin survives. The PSD-determinant identity
   `det = 1+2ρ₁ρ₂ρ−ρ₁²−ρ₂²−ρ²` (and its equicorrelation form `(1−ρ)²(1+2ρ)`) is fully rational and
   is the exact mechanism behind L5's bounds.

### Engine — `src/engine/covariance.ts` (NEW FILE; pure, exact rational)
**Naming (load-bearing):** the file MUST be `covariance.ts`. `src/engine/correlation.ts` already
exists and is the **string-autocorrelation** engine (Penney/overlap) — unrelated to statistics.
Reusing that name would collide; this is the false-overlap the continuity report flagged.

**Rational-type note for Wave-0:** existing `src/engine/types.ts` defines `Rational = {n:number;
d:number}` (plain JS number) and the fixture `RationalSchema` is `z.number().int()`. To keep
moments like E[X²]=91/6 and Var=35/12 exact under multiplication, the dossier mandates **BigInt**
rationals — recommend a `BigRational {n:bigint; d:bigint}` local to `covariance.ts` with a
display-only escape hatch for irrational ρ. **Flag to Wave-0/Dept-3:** the engine's BigRational and
the fixture RationalSchema must be reconciled.

Proposed signatures (all return exact rationals unless noted):

```ts
type JointCell = { x: Rational; y: Rational; p: Rational }   // P(X=x, Y=y)
type Pmf       = { x: Rational; p: Rational }[]              // reuse expectation.ts shape

// L1 — single-variable spread
export function variance(pmf: Pmf): Rational                 // E[X²]−E[X]²  → 35/12 (fair die)
export function eX2(pmf: Pmf): Rational                      // E[X²] (= 91/6)
export function standardDeviation(pmf: Pmf): RationalSqrt    // √Var; rational ONLY if perfect square, else {radicand,display}

// L2 — covariance from a joint pmf
export function expectedProduct(joint: JointCell[]): Rational           // E[XY]
export function covariance(joint: JointCell[]): Rational                // E[XY]−E[X]E[Y]  (0, 1/4, …)
export function covarianceIndicators(pAB: Rational, pA: Rational, pB: Rational): Rational  // P(A∩B)−P(A)P(B)

// L3 — variance of a sum / bilinearity
export function varianceOfSum(varX: Rational, varY: Rational, cov: Rational): Rational     // Var(X)+Var(Y)+2Cov → 35/6
export function covBilinear(covXX: Rational, covXY: Rational): Rational                     // Cov(X,X+Y)=Var(X)+Cov(X,Y) → 35/12

// L4 — correlation: grade ρ², return ρ only when provably rational
export function rhoSquared(cov: Rational, varX: Rational, varY: Rational): Rational         // ALWAYS rational → 1/2, 16/25
export function rho(cov: Rational, varX: Rational, varY: Rational): RationalOrIrrational
//   {kind:'rational', value}            when varX·varY is a perfect square (12/√225 = 4/5)
//   {kind:'irrational', rhoSquared, display}   otherwise (ρ²=1/2, display "1/√2")

// L5 — 3-variable / PSD geometry
export function corrRange(rho1: Rational, rho2: Rational): { min: Rational; max: Rational }
//   ρ₁ρ₂ ∓ √(1−ρ₁²)√(1−ρ₂²); exact rational ONLY for Pythagorean-pair inputs → {7/25, 1}; else flag irrational
export function psdDeterminant3(r12: Rational, r13: Rational, r23: Rational): Rational
//   1 + 2·r12·r13·r23 − r12² − r13² − r23²   (≥0 ⇔ valid corr matrix) — fully rational
export function equicorrelationMin(n: number): Rational                  // −1/(n−1)  (n=3 → −1/2)
export function equicorrelationDet(rho: Rational, n: number): Rational    // (1−ρ)^(n−1)(1+(n−1)ρ)

// applications
export function optimalHedgeRatio(covAB: Rational, varB: Rational): Rational    // Cov/Var → −2/3 (never needs ρ)
export function orderStatCovUniform(): { covYZ: Rational; rhoYZ: Rational }      // {1/36, 1/2} — both rational (golden)
```

Helper types: `RationalSqrt = Rational | {radicand: Rational; display: string}`,
`RationalOrIrrational` as annotated. **Validation anchors** (cross-checked by
`scripts/validate-fixtures.ts`) are the rational outputs: variance 35/12, Cov {0, 1/4, 35/12},
varianceOfSum 35/6, ρ² 1/2, ρ 4/5, corrRange {7/25, 1}, equicorrelationMin −1/2, hedge −2/3,
orderStat {1/36, 1/2}.

### New interaction type — exactly ONE, folded (the chainBoard / bayesUpdate convention)
Per the continuity report's directive, the whole beat arc reuses shipped types — openers
`retrievalGrid`, bets `prediction`, model cards `primer`/`tripletReveal`, graded reads
`answerEntry`, capstone `masteryChallenge`, close `recap`. The only genuinely-new *visual* objects
are a joint-pmf table and a scatter/co-movement view, which no existing interaction renders
(`expectationScale` is a 1-D balance beam; `conditionalTree` is a one-step case tree). Propose
**one** new discriminated-union member, four display modes folded under it:

```ts
z.object({
  type: z.literal('covarianceBoard'),
  display: z.enum(['jointPmf', 'scatter', 'ellipse', 'corrVectors']),
  joint: z.array(z.object({ x: RationalSchema, y: RationalSchema, p: RationalSchema })).optional(), // jointPmf/scatter
  rho1: RationalSchema.optional(),   // corrVectors
  rho2: RationalSchema.optional(),   // corrVectors
  labels: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),   // reduced "n/d" Cov, ρ², or "min,max" range — the validation anchor
})
```
- `jointPmf` — build/read P(X=x,Y=y); Cov updates live (L2).
- `scatter` — point cloud of (X,Y); the co-movement trend tilts with ρ (L2/L4/L6).
- `ellipse` — ρ tilts/squashes a covariance ellipse / the rescale-invariance demo (L4).
- `corrVectors` — two unit vectors at fixed angles; sweep the third to see the ρ-range (L5).

All inputs exact rationals; the renderer computes every value via `src/engine/covariance.ts`;
`headline` is the engine-reproducible anchor (Cov / ρ² / range), cross-checked by
`scripts/validate-fixtures.ts`. Not graded, not a HERO_TYPE (graded reads use `answerEntry`).
Folding all four views under one type keeps the Wave-0 schema delta to a single new member,
matching the `chainBoard`/`bayesUpdate`/`stoppingBoard`/`payoffMatrix` precedent.
