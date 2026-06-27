# Lesson Brief — `lesson-covariance-6`: Synthesis: Min, Max & the Whole Toolkit  (interleaved capstone)

- **courseId:** `course-covariance` · **chapter:** `ch-covariance-3` (Correlation in the Wild)
- **unlocks:** (concept end) · **prereqs:** `lesson-covariance-1`…`lesson-covariance-5`, `lesson-expected-value-6`
- **glyphKey:** `Cov(min,max)` · **vizKey:** `twoNode` · **introducesSymbol:** `Cov(min,max)` (order statistics)

## Hook (the bet)
"Two random draws; one is the smaller (min), one the larger (max). The min can never beat the max — so must they be perfectly correlated?" The deterministic ordering Y ≤ Z tempts ρ=1, but they only co-move at ρ=1/2. This is the **cumulative interleaved capstone** — modeled on `lesson-states-streaks.json`: multiple recall beats spanning the whole arc + a multi-part mastery that forces tool-selection.

## Core promise (one idea)
**Assemble the whole toolkit on one problem: order statistics.** For Y=min, Z=max of two iid U(0,1), Cov(Y,Z)=1/36 and ρ=1/2 — and the path there re-uses variance, the covariance formula, and the ρ definition from the entire arc.

## Display fields
glyphKey `Cov(min,max)`; vizKey `twoNode`. Explore beat may reuse `covarianceBoard` (`scatter` of (min,max) points). Capstone clones states-streaks structure: several short `retrievalGrid` beats + a multi-part `masteryChallenge`. No new mechanic.

## Verified problems & answers
| # | Problem | Exact-rational answer | Source | check |
|---|---|---|---|---|
| #8 | Two iid U(0,1), Y=min, Z=max: Cov(Y,Z), ρ | Cov=**1/36**, ρ=**1/2** | GB p.51-52 "Correlation of max and min" (lines 8059-8175) | ☐engine ☐source |
| #9 | Same: E[YZ], E[Y], E[Z] | E[YZ]=**1/4**, E[Y]=**1/3**, E[Z]=**2/3** | GB p.51-52 (lines 8085-8113) | ☐engine ☐source |
| (re-surfaced) | Var(die)=35/12 (#1), Var(X₁+X₂)=35/6 (#2), Cov(X₁,S)=35/12 (#3), ρ=4/5 (#5), Cov(X,X²)=0 (#7), min ρ=−1/2 (#11) | — | as cited above | ☐engine ☐source |

(ρ(min,max)=1/2 is rational here because Var(Y)=Var(Z)=1/18 — the √ collapses. Honors the exact-rational contract.)

## Beat-by-beat plan (Bet → Explore → Model → Prove) — capstone shape
| # | beatId | intent | teaches | misconception elicited/refuted | graded? | track |
|---|---|---|---|---|---|---|
| 1 | `cov6-recall` | Cumulative opener `retrievalGrid`: Var(die)=35/12, Var(X₁+X₂)=35/6, ρ=4/5, min pairwise ρ=−1/2 | re-surfaces every headline result | — | yes (`retrievalGrid`, required) | all |
| 2 | `cov6-mixed` | Mid-arc `retrievalGrid`: Cov(X,X²)=0 / "yet dependent" / "Independent ⇒ Cov=0" | re-surfaces the converse trap + co-movement | Cov=0 ⇒ independent | yes (`retrievalGrid`, required) | all |
| 3 | `cov6-bet` | Bet: how strongly are min and max correlated? | ordering ≠ lockstep | "ρ=1 (perfectly correlated)" / "ρ=0 (unrelated)" | no (`prediction`, byOption) | all |
| 4 | `cov6-explore` | Explore: scatter of (min,max) over iid U(0,1) | the co-movement shape | — | no (`covarianceBoard` `scatter`, hero) | all |
| 5 | `cov6-model` | Model card: YZ=min·max=X₁X₂ always; assemble Cov from the arc's pieces | the order-statistic covariance route | — | no (`primer`/`tripletReveal`, introducesSymbol `Cov(min,max)`, groundedBy `cov6-win`) | all |
| 6 | `cov6-win` | Guaranteed early win: E[YZ]=E[X₁]E[X₂]=1/2·1/2=1/4 (identity given) | the YZ=X₁X₂ reduction | report E[Y]E[Z]=2/9 | yes (`answerEntry`, **1/4**) | all |
| 7 | `cov6-mastery` | Multi-part mastery (states-streaks shape): Part A Cov(min,max)=1/36, ρ=1/2; Part B Cov(X₁,S)=35/12 (re-surfaced L3 tool) | tool-selection: order-stat Cov vs bilinearity cross term | "dependent ⇒ E[YZ]=E[Y]E[Z]"; L4 ρ-denominator error | yes (`masteryChallenge`, required, **1/36, 1/2 / 35/12**) | all |
| 8 | `cov6-recap` | Recap: variance, covariance, the cross term, ρ, and bounds — one toolkit, told apart on sight | — | — | yes (`recap`, required) | all |

## Misconceptions (per-option refutation copy)
**Bet `prediction` ("How correlated are min and max?")**:
- "ρ=1 — the min can never exceed the max, so they're locked together" → *"Let's test it — the ordering Y≤Z is real but doesn't make them move in lockstep. A big draw and a small draw raise the max while barely touching the min. ρ is only 1/2 (#8)."* (false)
- "ρ=0 — which draw is bigger is random, so they're unrelated" → *"Let's test it — they share the same two numbers, so they can't be independent. In fact YZ=X₁X₂ always, pinning a positive Cov of 1/36 (#8)."* (false)
- "ρ=1/2 — positively but not perfectly correlated" → *"Good instinct — they co-move, but ordering doesn't lock them. Let's prove Cov=1/36, ρ=1/2 (#8)."* (true)

**`cov6-win` hint ladder** (accept `1/4`): nudge "min·max equals the product of the original two draws, every time" → method "YZ=X₁X₂, independent, so E[YZ]=E[X₁]E[X₂]=(1/2)(1/2)" → answer "**1/4** (#9)." Most likely wrong: `2/9` (computes E[Y]E[Z]=(1/3)(2/3), forgetting E[YZ]≠E[Y]E[Z] for dependent Y,Z — and 2/9 is exactly the term that makes Cov=1/4−2/9=1/36).

**`cov6-mastery` Part A** (accept Cov `1/36`, ρ `1/2`): method "Cov=1/4−(1/3)(2/3)=1/4−2/9; ρ=(1/36)/(1/18)" → answer "Cov=**1/36**, ρ=**1/2** (#8); ρ rational here because Var(Y)=Var(Z) so the √ collapses." Most likely wrong ρ: `1/648` (divides Cov by Var·Var product instead of √product — the L4 ρ-denominator error resurfacing; this capstone is its spaced re-test). **Part B** (accept `35/12`): re-surfaces the L3 bilinearity cross term — the learner must name "covariance with a sum" as the right tool.

**Misconceptions targeted:** "min and max are perfectly correlated" (#8); "dependent ⇒ E[YZ]=E[Y]E[Z]" i.e. reporting 2/9 (#9); resurfaced L4 ρ-denominator error (product vs √product); plus the converse trap re-surfaced in `cov6-mixed`.

## Assessment + continuity (the cumulative re-surfacing terminal)
- **Retrieval openers** (multiple, required, graded — clones states-streaks): `cov6-recall` 4-pair cumulative grid (35/12, 35/6, 4/5, −1/2) + `cov6-mixed` converse-trap grid (Cov(X,X²)=0 / "dependent" / "Independent ⇒ Cov=0"). Re-surfaces every load-bearing result (continuity §3c terminal).
- **Guaranteed early win** (`cov6-win`): the YZ=X₁X₂ identity is handed over → 1/2·1/2=1/4.
- **Required multi-part mastery before recap** (`cov6-mastery`, states-streaks Part A/Part B shape): Part A order-statistic Cov=1/36, ρ=1/2 (#8); Part B re-surfaced bilinearity Cov(X₁,S)=35/12 (#3). Forces tool-selection on unlabeled problems — the capstone's whole point. *(Alternative Part B if Dept 2 prefers a ρ-bound re-surface: min pairwise ρ=−1/2, #11.)*
- **Spacing/interleaving (joint terminal, §3b bullets 1-2 + §3c):** independence-vs-Cov=0 (`cov6-mixed`) and sum-rule-vs-cross-term (Part B). Re-surfaces the EV L6 order-statistics prereq (E[min]=1/3, E[max]=2/3 echo `lesson-expected-value-6`'s E[max]=n/(n+1)).
- **Accept strings:** E[YZ] `1/4` (#9) → `["1/4","0.25",".25"]`; Cov(min,max) `1/36` (#8) → `["1/36"]`; ρ `1/2` (#8) → `["1/2","0.5",".5"]`; Cov(X₁,S) `35/12` (#3) → `["35/12"]`; opener right-cards are exact-string matches.

## Open items for Dept 2
- This is a multi-opener, multi-part capstone; confirm the lesson runner supports two required `retrievalGrid` beats before the bet (states-streaks ships exactly this shape, so this is low-risk — modeled directly on `lesson-states-streaks.json`).
