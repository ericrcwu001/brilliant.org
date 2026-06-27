# Lesson Brief — `lesson-covariance-3`: Variance of a Sum: The Cross Term

- **courseId:** `course-covariance` · **chapter:** `ch-covariance-2` (The Covariance Toolkit)
- **unlocks:** `lesson-covariance-4` · **prereqs:** `lesson-covariance-2`, `lesson-expected-value-2`
- **glyphKey:** `Var(X+Y)` · **vizKey:** `twoNode` · **introducesSymbol:** `Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)`

## Hook (the bet)
"Linearity of expectation (EV L2) added with no fine print — E[X+Y]=E[X]+E[Y], dependent or not. Does the *variance* of a sum add just as cleanly?" This is a productive-failure bet: the intuitive "yes" is wrong in general, and the gap is exactly 2Cov(X,Y).

## Core promise (one idea)
**Variance of a sum carries a cross term: Var(X+Y) = Var(X) + Var(Y) + 2Cov(X,Y).** Variances add cleanly only when Cov = 0; otherwise the covariance is the correction.

## Display fields
glyphKey `Var(X+Y)`; vizKey `twoNode`. Explore beat may reuse `covarianceBoard` (`scatter` display) to show the cross term geometrically, or a simple two-bar comparison; no genuinely new mechanic beyond the L2 type.

## Verified problems & answers
| # | Problem | Exact-rational answer | Source | check |
|---|---|---|---|---|
| #2 | Two independent fair dice: Var(X₁+X₂) | **35/6** | GB p.47-48 "general rules" (line 7582); randomservices.org | ☐engine ☐source |
| #3 | S=X₁+X₂: Cov(X₁,S) | **35/12** | randomservices.org Covariance §; GB bilinearity p.48 | ☐engine ☐source |

(Var of one die = 35/12 from #1 is re-surfaced as the building block.)

## Beat-by-beat plan (Bet → Explore → Model → Prove)
| # | beatId | intent | teaches | misconception elicited/refuted | graded? | track |
|---|---|---|---|---|---|---|
| 1 | `cov3-recall` | Retrieval opener: "Linearity E[X+Y]=…" → E[X]+E[Y] always; "Var of one die" → 35/12 | re-activates EV L2 linearity + L1 result | — | yes (`retrievalGrid`, required) | all |
| 2 | `cov3-bet` | Bet: does Var of a sum add as cleanly as expectation? | productive failure: variance ≠ linearity | "variance always adds" | no (`prediction`, byOption) | all |
| 3 | `cov3-explore` | Explore: independent dice (cross term vanishes) vs S=X₁+X₂ (it doesn't) | when 2Cov shows up | — | no (`covarianceBoard` `scatter`, hero) | all |
| 4 | `cov3-model` | Model card: Var(X+Y)=Var(X)+Var(Y)+2Cov via bilinearity; contrast with linearity | the cross-term formula + its condition | "Var(X+Y)=Var(X)+Var(Y)" (drops 2Cov) | no (`tripletReveal`, introducesSymbol `Var(X+Y)`, groundedBy `cov3-win`) | all |
| 5 | `cov3-win` | Guaranteed early win: independent dice, Cov=0 → 35/12+35/12 = 35/6 | one-addition application when 2Cov=0 | "report one die's 35/12" | yes (`answerEntry`, **35/6**) | all |
| 6 | `cov3-mastery` | Mastery: Cov(X₁,S) via bilinearity = Var(X₁)+Cov(X₁,X₂) = 35/12 | the part-correlates-with-the-whole insight | "independent ⇒ Cov(X₁,S)=0" | yes (`masteryChallenge`, required, **35/12**) | all |
| 7 | `cov3-recap` | Recap: variances add only when Cov=0; next, a unit-free score | — | — | yes (`recap`, required) | all |

## Misconceptions (per-option refutation copy)
**Bet `prediction` ("Does Var of a sum equal the sum of variances?")**:
- "Always, just like expectation adds" → *"Let's test it — linearity (EV L2) adds with no fine print, but variance picks up a 2Cov(X,Y) cross term. It only matches the naive sum when Cov=0 — true here, but for a reason, not by default."* (false)
- "Never — variances can't be added" → *"Let's test it — too pessimistic. Var(X+Y)=Var(X)+Var(Y)+2Cov always holds; when independent the cross term is 0 and they add cleanly to 35/6 (#2)."* (false)
- "Here yes, because these dice are independent (Cov=0)" → *"Good instinct — the cross term is 0 only because of independence. Let's get 35/12+35/12 = 35/6 (#2)."* (true)

**`cov3-win` hint ladder** (accept `35/6`): nudge "use Var(X)+Var(Y)+2Cov; recall Cov for independent dice" → method "each Var=35/12; independent ⇒ Cov=0 so cross term drops" → answer "35/12+35/12 = 70/12 = **35/6** (#2)." Most likely wrong answer: `35/12` (reports one die) or `1225/144` (multiplies variances).

**`cov3-mastery` hint ladder** (accept `35/12`): nudge "covariance is bilinear — split Cov(X₁,X₁+X₂)" → method "= Cov(X₁,X₁)+Cov(X₁,X₂) = Var(X₁)+0" → answer "Var(X₁)=35/12, Cov(X₁,X₂)=0 → **35/12** (#3)." Most likely wrong answer: `0` ("the dice are independent so it's 0") — misses that S *contains* X₁, so Cov(X₁,X₁)=Var(X₁) survives. A sharp, diagnostic distractor.

**Misconceptions targeted:** dropping the 2Cov cross term (#2); "independent ⇒ every covariance involving them is 0" even when a variable appears on both sides (#3).

## Assessment + continuity
- **Retrieval opener** (`cov3-recall`, required, graded): `{ "Linearity: E[X+Y]=…" → "E[X]+E[Y], always" }`, `{ "Var of ONE fair die (from L1)" → "35/12" }`. Sets up the contrast + re-surfaces L1's result.
- **Guaranteed early win** (`cov3-win`): Cov=0 carried from L2 → one addition to 35/6.
- **Required mastery before recap** (`cov3-mastery`): Cov(X₁,S) forces choosing the bilinearity tool, not the variance-of-sum formula.
- **Interleave (continuity §3b bullet 2):** mix items where the sum rule applies dependence-free against items where the 2Cov cross term appears — discriminate "expectations always add" from "variances add only when Cov=0."
- **Spacing:** re-surface linearity (EV L2) [across-course]; Var=35/12 (L1) [+1 gap]; the 2Cov cross term re-surfaces in the L6 capstone. Optional intuition hook: the inclusion-exclusion "parts + overlap correction" silhouette (continuity §2) — analogy ONLY, not a math dependency.
- **Accept strings:** Var-sum `35/6` → `["35/6"]`; Cov(X₁,S) `35/12` → `["35/12"]`.

## Open items for Dept 2
- `cov3-explore` reuses `covarianceBoard` `scatter`; if the cross-term geometry is hard to render meaningfully here, a two-bar "Var(X)+Var(Y) vs Var(X+Y)" comparison is an acceptable simpler fallback. Flagging as a render-clarity (not correctness) question.
