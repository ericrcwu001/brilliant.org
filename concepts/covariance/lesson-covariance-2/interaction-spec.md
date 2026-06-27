# Interaction Spec — `lesson-covariance-2`: Covariance: The Leftover of the Product Rule

> Stage-2 Dept-2 (Interactive Experience / Design). Design-only — NO production code.
> **First justified use of the new `covarianceBoard` type** (`display:'jointPmf'`). Goldens: Cov=**0**
> (independent), Cov=**1/4** / ρ=**1** (matched), Cov(X₁,X₂)=**0** (#2,#6). All exact rationals.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `cov2-recall` | match: `E[XY]=E[X]E[Y] when… → independent`; `Cov(X₁,X₂) two dice → 0` | `retrievalGrid` | REUSE | correct: "Product rule holds exactly under independence, so two separate dice have Cov=0." Hints: ①one card is the EV-L2 product-rule *condition*, one is what it does to the leftover ②allowed iff independent; separate dice never influence each other ③**independent**; Cov=**0** (#2) | tap-and-tap; aria-live mirror | match-snap | both |
| 2 | `cov2-bet` | choose Cov of two independent dice: positive / unknowable / zero | `prediction` (byOption) | REUSE | byOption (below) | radiogroup | none | both |
| — | `cov2-primer-jointpmf` | JIT primer: "what a joint pmf is" (cells sum to 1; independent ⇒ row×col) | `primer` (`custom`, collapsible) | REUSE | — | tap-expand | collapsible | **A** (`required:false`) |
| 3 | `cov2-explore` | **tap 2×2 joint-pmf cells to move probability mass; Cov recomputes live.** Manipulate: integer mass-units over a FIXED total T (T=4); tapping cell (i,j) moves one unit from the diagonally-opposite donor cell → Σp stays exactly 1, no float. Respond: live readouts **E[XY]**, **E[X]E[Y]**, and **Cov = E[XY]−E[X]E[Y]** as reduced "n/d" + sign chip (+/0/−); marginal bars on top/left re-settle; diagonal-heavy → teal cells (Cov+), anti-diagonal → coral (Cov−). Loop: **directed targets** — "make Cov negative", then "make Cov exactly 0 *without* dumping all mass in one cell" (forces the independent/product-structure config). | `covarianceBoard` `jointPmf` (`interactive:true`) | **NEW** | ungraded hero; target-completion line "You built independence — the leftover is 0." | cell `<button>` 44×44; Tab between cells, +/−/Arrow add/remove a unit, Space/Enter select; one `aria-live` mirror: `Cell (X=x,Y=y) now n/d. Cov(X,Y)=n/d, sign positive/zero/negative. Marginals P(X=x)=…, P(Y=y)=…`; table `role=region`, th `scope`; sign never color-only (glyph+word); no sweep, instant | mass-fill height% `--dur-base var(--ease-out)`; diagonal-tint flip is the cinematic moment; **L2 slow-first gate `--dur-tell` (600ms)** after first move; reduced-motion → fills at final height, no gate | both (`density:split` on A) |
| 4 | `cov2-model` | three lenses → `Cov(X,Y)=E[XY]−E[X]E[Y]`; sign=direction; the product-rule leftover | `tripletReveal` (`introducesSymbol Cov(X,Y)`, `groundedBy cov2-win`) | REUSE | converge: "Cov is the leftover of the product rule." | tap aria-expanded; status line | reveal | both |
| 5 | `cov2-win` | type Cov of the matched table (E[XY]=1/2, E[X]E[Y]=1/4 given) | `answerEntry` | REUSE | golden **1/4** accept `["1/4","0.25",".25"]`; ladder (below) | input aria-label, Enter | none | both |
| 6 | `cov2-interleave` | match: `independent evidence ⇒ ___ the likelihoods → multiply` (Bayes-L3) vs the Cov items | `retrievalGrid` (`required`) | REUSE | correct + hints (below); **seeds** the L4 converse trap | tap-and-tap; aria-live | match-snap | both |
| 7 | `cov2-mastery` | Part A independent table → Cov=0; Part B matched table → Cov=1/4, ρ=1 | `masteryChallenge` (`required`, `density:split` on A) | REUSE | goldens A `0`, B Cov `1/4` / ρ `1`; ladder (below) | per-field aria-label; Enter | none | both |
| 8 | `cov2-recap` | recap: Cov = product-rule residue; next, how it adds inside Var(X+Y) | `recap` (`required`) | REUSE | — | radiogroup | reveal | both |

## New interaction types (for Wave 0) — `covarianceBoard`
First use of the single new discriminated-union member. **Frozen shape (display modes actually used across the concept):**
```ts
z.object({
  type: z.literal('covarianceBoard'),
  display: z.enum(['jointPmf', 'scatter', 'corrVectors']),   // ellipse DROPPED
  joint: z.array(z.object({ x: RationalSchema, y: RationalSchema, p: RationalSchema })).optional(), // jointPmf/scatter
  rho1: RationalSchema.optional(),                            // corrVectors
  rho2: RationalSchema.optional(),                            // corrVectors
  labels: z.array(z.string()).optional(),
  task: z.enum(['covariance', 'rhoSquared', 'corrRange']).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),   // engine-reproducible anchor (Cov / ρ² / "min,max"); validate-fixtures checks it
})
```
- **Renderer:** `CovarianceBoardBeat.tsx`, dispatch by `display`. `jointPmf` → `JointPmfDisplay` (DOM `<table>`, reuses `chainboard-matrix__*`/bar-track CSS; integer-mass-over-fixed-T mechanic). NOT a `HERO_TYPE`, NOT in `GRADED_TYPES` (graded reads use `answerEntry`); hero-vs-passive carried by `beat.hero` + `headline`, exactly the `chainBoard` precedent. **No Konva** (DOM table).
- **Engine dep:** `covariance(joint): Rational` → 0 / 1/4 / 1/36; plus `expectedProduct(joint)` for the E[XY] readout.
- **L2 headline anchors:** matched preset `"1/4"`; independent preset `"0"`.

## Feedback + hint ladders

**`cov2-bet` (byOption):**
- "Positive — both are dice" → *"Identically-distributed isn't dependent. Two separate dice share a distribution but never influence each other; E[X₁X₂]−E[X₁]E[X₂] collapses to 0 (#2)."* (false)
- "Can't tell without the joint table" → *"Generally true, but independence hands it to you: E[X₁X₂]=E[X₁]E[X₂] exactly, so the leftover is 0 (#2)."* (false)
- "Zero — they're independent" → *"Independence makes the product rule exact, so the leftover vanishes. Cov=0 (#2)."* (true)

**`cov2-win` (golden 1/4):** correct: "Cov=E[XY]−E[X]E[Y]=1/2−1/4=1/4 — the leftover isn't zero, this table isn't independent." Hints: ①Cov is the *leftover* — find E[XY] and E[X]E[Y] separately ②XY=1 only on (1,1) at prob 1/2 → E[XY]=1/2; each Bernoulli(1/2) → E[X]E[Y]=1/4; subtract ③1/2−1/4=**1/4** (#6). Per-mistake **`1/2`** (most likely) *"That's E[XY] — you dropped the −E[X]E[Y]=1/4 correction: Cov=1/4."*

**`cov2-interleave` (golden: multiply):** correct: "Independent evidence multiplies the likelihoods — the same factorization that forces Cov=0." Hints: ①Bayes L3: independent likelihoods → ? ②joint factors P(A,B)=P(A)P(B) ⇒ multiply ⇒ Cov=0 ③**multiply** (joint factors) ⇒ Cov=0.

**`cov2-mastery` (Part A `0`, Part B Cov `1/4` / ρ `1`):** correct: "Independent table → Cov=0; matched table breaks the product rule → Cov=1/4, ρ=1. Cov=0 is a result, not a default." Hints: ①run Cov=E[XY]−E[X]E[Y] on each — don't assume they match ②A: independent ⇒ leftover 0; B: mass on (0,0),(1,1) ⇒ E[XY]=1/2≠1/4 ⇒ Cov=1/4, ρ=(1/4)/(1/4)=1 ③A=**0**; B Cov=**1/4**, ρ=**1** (#6). Per-mistake **both `0`** *"You applied Cov=0 to both, but that only holds under the product rule. The matched table forces X=Y (lockstep): Cov=1/4, ρ=1. Cov=0 is earned, not a default."*

## Build decomposition (Technical Planner — for Dept 3)
- **Engine fns:** `covariance(joint): Rational`, `expectedProduct(joint): Rational`, `variance` (for the ρ=1 readout from Var=1/4); `covarianceIndicators(pAB,pA,pB)` available for an optional indicator example.
- **Schema variant:** the new `covarianceBoard` member (above) — first introduced here.
- **Renderer/widget + props:** `CovarianceBoardBeat.tsx` → `JointPmfDisplay`; props `joint`, `labels`, `task:'covariance'`, `interactive:true`, `headline`. Grading helper `isCovarianceBoardCorrect` exists in `grading.ts` but is unused here (explore is ungraded). index.tsx: `case 'covarianceBoard': return <CovarianceBoardBeat {...props}/>`.
- **Fixture fields:** two `jointPmf` presets (independent `[[1,1],[1,1]]/4`, matched `[[2,0],[0,2]]/4`); `cov2-win` accept `["1/4","0.25",".25"]`; `cov2-mastery` accepts `["0"]`,`["1/4",…]`,`["1"]`; headlines `"0"`,`"1/4"`.
- **Validation anchors:** `covariance → {0, 1/4}`, `expectedProduct → {1/4, 1/2}`.

## Definition-of-Ready checklist
| beat | verified+sourced | concrete mechanic | feedback + 3-level hints | a11y |
|---|---|---|---|---|
| cov2-recall | ✅ #2 | ✅ grid | ✅ | ✅ |
| cov2-bet | ✅ #2 | ✅ choice+refute | ✅ byOption | ✅ |
| cov2-explore | ✅ #6/#2 | ✅ tap mass, Cov live + directed targets (STRONG fit) | ✅ ungraded targets | ✅ |
| cov2-model | ✅ #6 | ✅ triplet | ✅ | ✅ |
| cov2-win | ✅ #6 (1/4) | ✅ type-in | ✅ ladder+per-mistake | ✅ |
| cov2-interleave | ✅ Bayes-L3 | ✅ grid | ✅ | ✅ |
| cov2-mastery | ✅ #6 (0,1/4,1) | ✅ two-part | ✅ ladder+per-mistake | ✅ |
| cov2-recap | ✅ | ✅ | ✅ | ✅ |

**DoR holds for all L2 beats.**
