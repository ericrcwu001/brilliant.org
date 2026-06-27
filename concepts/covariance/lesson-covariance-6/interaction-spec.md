# Interaction Spec — `lesson-covariance-6`: Synthesis: Min, Max & the Whole Toolkit (capstone)

> Stage-2 Dept-2. Design-only. Cumulative interleaved capstone (states-streaks shape: two required
> `retrievalGrid` openers before the bet + a multi-part mastery forcing tool-selection). Explore =
> `covarianceBoard scatter` of (min,max) — learner-driven sampling, the cloud IS the object. Goldens:
> Cov(min,max)=**1/36**, ρ=**1/2** (#8), E[YZ]=**1/4** (#9), re-surfaced Cov(X₁,S)=**35/12** (#3). ρ is
> rational here because Var(Y)=Var(Z)=1/18 (the √ collapses).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `cov6-recall` | cumulative match: `Var(die)→35/12`, `Var(X₁+X₂)→35/6`, `ρ→4/5`, `min pairwise ρ→−1/2` | `retrievalGrid` (`required`) | REUSE | correct + hints (below) | tap-and-tap; aria-live | match-snap | both |
| 2 | `cov6-mixed` | converse-trap match: `Cov(X,X²)→0`, `X,X² → dependent`, `Independent ⇒ Cov→0` | `retrievalGrid` (`required`) | REUSE | correct + hints (below) | tap-and-tap; aria-live | match-snap | both |
| 3 | `cov6-bet` | choose: how correlated are min and max? (ρ=1 / ρ=0 / ρ=1/2) | `prediction` (byOption) | REUSE | byOption (below) | radiogroup | none | both |
| 4 | `cov6-explore` | **learner-driven (min,max) scatter.** Manipulate: tap "draw" (or a draw-count slider) to ADD points (min(U₁,U₂), max(U₁,U₂)) from authored iid-uniform pairs. Respond: every point lands **on or above the y=x diagonal** (max≥min, a hard geometric boundary); the running ρ readout climbs and **settles near 1/2**; a faint **ρ=1 reference line** shows the cloud is demonstrably NOT a line. Loop: keep drawing until ρ stabilizes — convergence the learner drives, not watches. | `covarianceBoard` `scatter` (`interactive:true`) | **NEW** (reuses the L2 type, scatter mode) | ungraded hero; settle line "Fat cloud, not a line — they co-move at ρ=1/2, despite min≤max." | "draw" is a tap (`BeatShell` primary), Space steps; decorative trend/diagonal/ρ=1 line `aria-hidden`; one `aria-live` mirror `{count} samples. Running ρ(min,max)=…`; settled `…settled at 1/2 (theory 1/2)`; throttle to milestones; reduced-motion → full settled cloud immediately | points fade+scale-in staggered, capped `--dur-tell`; trend draws AFTER cloud settles (stroke-dashoffset `--dur-slow`); reduced-motion final cloud | both |
| 5 | `cov6-model` | YZ=min·max=X₁X₂ always; assemble Cov from the arc's pieces | `primer`/`tripletReveal` (`introducesSymbol Cov(min,max)`, `groundedBy cov6-win`) | REUSE | converge: "Order-statistic Cov from the toolkit you already have." | tap aria-expanded; status | reveal | both |
| 6 | `cov6-win` | type E[YZ] (YZ=X₁X₂ identity handed over) | `answerEntry` | REUSE | golden **1/4** accept `["1/4","0.25",".25"]`; ladder (below) | input aria-label; Enter | none | both |
| — | `cov6-primer-rho-denom` | JIT primer: "ρ denominator = √(product), not the product (spaced re-test)" | `primer` (`custom`, collapsible) | REUSE | — | tap-expand | collapsible | **A** (`required:false`) |
| 7 | `cov6-mastery` | **Part A: Cov(min,max)=1/36, ρ=1/2. Part B: re-surfaced bilinearity Cov(X₁,S)=35/12 (tool-selection).** | `masteryChallenge` (`required`, `density:split` on A) | REUSE | goldens A Cov `1/36`/ρ `1/2`, B `35/12`; ladders + the 1/648 trap (below) | per-field aria-label; Enter | none | both |
| 8 | `cov6-recap` | recap: variance, covariance, the cross term, ρ, bounds — one toolkit, told apart on sight | `recap` (`required`) | REUSE | — | radiogroup | reveal | both |

## New interaction types (for Wave 0)
Reuses the `covarianceBoard` member with `display:'scatter'`, `task:'covariance'`, authored (reproducible) points,
`headline:"1/36"` (Cov(min,max)). `ScatterDisplay` (inline SVG, no Konva) shared with L4. The two required
`retrievalGrid` openers before the bet are the states-streaks shape — no schema change (the runner already supports
multiple required beats before a bet; `lesson-states-streaks.json` ships exactly this).

## Feedback + hint ladders

**`cov6-recall` (goldens 35/12, 35/6, 4/5, −1/2):** correct: "Every headline from the arc: Var(die)=35/12, Var(sum)=35/6, ρ=4/5, equicorrelation floor −1/2." Hints ①each card is one load-bearing result from a different lesson ②Var(die)=91/6−49/4; Var(sum) with Cov=0; ρ=12/15; floor from 1+2ρ≥0 ③**35/12, 35/6, 4/5, −1/2** (#1,#2,#5,#11).

**`cov6-mixed` (goldens 0, dependent, independent⇒Cov=0):** correct: "Cov(X,X²)=0 yet X,X² dependent; independence forces Cov=0 — arrow one way only." Hints ①the L4 converse trap: a Cov value, a dependence verdict, a direction ②Cov(X,X²)=0 by symmetry but Y=X² is computed from X; independent⇒Cov=0, not the reverse ③**0**; **dependent**; **independent ⇒ Cov=0** (#7).

**`cov6-bet` (byOption):**
- "ρ=1 — min can never exceed max, locked together" → *"The ordering Y≤Z is real but doesn't make them move in lockstep. A big draw and a small draw raise the max while barely touching the min. ρ is only 1/2 (#8)."* (false)
- "ρ=0 — which draw is bigger is random, so unrelated" → *"They share the same two numbers, so they can't be independent. In fact YZ=X₁X₂ always, pinning Cov=1/36 (#8)."* (false)
- "ρ=1/2 — positively but not perfectly correlated" → *"They co-move, but ordering doesn't lock them. Cov=1/36, ρ=1/2 (#8)."* (true)

**`cov6-win` (golden 1/4):** correct: "YZ=min·max=X₁X₂ always; X₁,X₂ independent ⇒ E[YZ]=E[X₁]E[X₂]=(1/2)(1/2)=1/4." Hints ①min·max = product of the *original two draws*, every time ②YZ=X₁X₂; independent ⇒ E[YZ]=E[X₁]E[X₂]=(1/2)(1/2); do NOT use E[Y]E[Z] (Y,Z dependent) ③(1/2)(1/2)=**1/4** (#9). Per-mistake **`2/9`** (most likely) *"That's E[Y]E[Z]=(1/3)(2/3), but Y,Z are dependent so E[YZ]≠E[Y]E[Z]. Use YZ=X₁X₂: 1/4. (2/9 is exactly the term you'll subtract: Cov=1/4−2/9=1/36.)"*

**`cov6-mastery` Part A (goldens Cov=1/36, ρ=1/2):** correct: "Cov=1/4−2/9=1/36; ρ=(1/36)/(1/18)=1/2 — rational because Var(Y)=Var(Z), so the √ collapses." Hints ①Cov=E[YZ]−E[Y]E[Z] (now subtract the dependent product); ρ denom = a single √ of the *product* of variances ②Cov=1/4−(1/3)(2/3)=1/36; Var_Y=Var_Z=1/18 ⇒ √(1/18·1/18)=1/18 ⇒ ρ=(1/36)/(1/18); not Var·Var=1/324 ③Cov=**1/36**, ρ=**1/2** (#8). **Per-mistake `1/648` (the L4 ρ-denominator error resurfacing):** *"You divided by the *product* of variances (1/18)(1/18)=1/324, and the √ slip lands at 1/648. The ρ denominator is the **square root** of that product, √(Var_Y·Var_Z)=1/18, not the product. So ρ=(1/36)/(1/18)=1/2. This is the L4 rule ρ=Cov/√(Var·Var) coming back."* (route as level-2 method; `byPattern` on `1/648` if the grader supports it.)

**`cov6-mastery` Part B (golden 35/12, re-surfaced #3):** correct: "Cov(X₁,S)=Var(X₁)+Cov(X₁,X₂)=35/12+0=35/12 — you picked the bilinearity tool." Hints ①unlabeled — name the tool: S contains X₁, so it's 'covariance with a sum', not an independence question ②=Cov(X₁,X₁)+Cov(X₁,X₂)=Var(X₁)+0 ③35/12+0=**35/12** (#3). Per-mistake **`0`** *"Independence kills Cov(X₁,X₂), not Cov(X₁,S) — S contains X₁. Var(X₁)+0=35/12; a variable always covaries perfectly with itself."*
> *(Alternative Part B if Dept 1 prefers a ρ-bound re-surface: min pairwise ρ=−1/2, #11 — per the brief. Default kept = #3.)*

## Build decomposition (Technical Planner — for Dept 3)
- **Engine fns:** `orderStatCovUniform(): {covYZ:1/36, rhoYZ:1/2}`; `expectedProduct(joint): Rational` → 1/4 (cov6-win); `covariance(joint): Rational` → 1/36 (scatter headline); `covBilinear(varX,covXY): Rational` → 35/12 (Part B). Plain-number `Rational`; ρ²-path worst intermediate ≈176,400 « MAX_SAFE_INTEGER.
- **Schema variant:** `covarianceBoard scatter` (existing member); two required `retrievalGrid` openers (no schema change).
- **Renderer/widget + props:** `CovarianceBoardBeat.tsx` → `ScatterDisplay` (authored points, "draw" tap, ρ=1 reference line). `headline:"1/36"`. cov6-win/mastery standard `answerEntry`/`masteryChallenge`.
- **Fixture fields:** `cov6-explore` authored `joint`/points + `task:'covariance'`,`headline:"1/36"`; cov6-win accept `["1/4","0.25",".25"]`; cov6-mastery accepts `["1/36"]`,`["1/2","0.5",".5"]`,`["35/12"]`. Forbidden in any accept: `1/648`.
- **Validation anchors:** `orderStatCovUniform → {1/36, 1/2}`, `expectedProduct → 1/4`, `covariance → 1/36`, `covBilinear → 35/12`.

## Definition-of-Ready checklist
| beat | verified+sourced | concrete mechanic | feedback + 3-level hints | a11y |
|---|---|---|---|---|
| cov6-recall | ✅ #1/#2/#5/#11 | ✅ cumulative grid | ✅ | ✅ |
| cov6-mixed | ✅ #7 | ✅ converse-trap grid | ✅ | ✅ |
| cov6-bet | ✅ #8 | ✅ choice+refute | ✅ byOption | ✅ |
| cov6-explore | ✅ #8 | ✅ learner-driven sampling, ρ=1 contrast (genuine, earns its capstone slot) | ✅ ungraded settle line | ✅ |
| cov6-model | ✅ #8/#9 | ✅ model card | ✅ | ✅ |
| cov6-win | ✅ #9 (1/4) | ✅ type-in | ✅ ladder + 2/9 per-mistake | ✅ |
| cov6-mastery | ✅ #8/#3 (1/36,1/2;35/12) | ✅ multi-part tool-selection | ✅ ladders + 1/648 trap | ✅ |
| cov6-recap | ✅ | ✅ | ✅ | ✅ |

**DoR holds for all L6 beats.**
