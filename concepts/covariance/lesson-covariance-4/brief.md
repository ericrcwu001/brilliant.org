# Lesson Brief — `lesson-covariance-4`: Correlation ρ: The Unit-Free Score  ★ converse-trap lesson

- **courseId:** `course-covariance` · **chapter:** `ch-covariance-2` (The Covariance Toolkit)
- **unlocks:** `lesson-covariance-5` · **prereqs:** `lesson-covariance-3`
- **glyphKey:** `ρ(X,Y)` · **vizKey:** `twoNode` · **introducesSymbol:** `ρ(X,Y)=Cov(X,Y)/(σ_X·σ_Y)`

## Hook (the bet)
"Covariance has units of X×Y (recall) — so can you compare a height-weight covariance to a temperature-sales covariance?" You can't: the units don't match. The bet motivates dividing the units out → the unit-free score ρ, always in [−1,1].

## Core promise (one idea)
**Correlation is unit-free covariance: ρ = Cov(X,Y)/(σ_X·σ_Y), always in [−1,1].** And the headline trap: **ρ = 0 does NOT mean independent** — zero correlation only rules out a *linear* relationship.

## Display fields
glyphKey `ρ(X,Y)`; vizKey `twoNode`. Explore beat uses `covarianceBoard` (`ellipse` display) to show ρ tilting/squashing a covariance ellipse + the rescale-invariance demo (Cov changes under rescaling, ρ holds). The L2-introduced type covers this.

## EXACT-RATIONAL / √ CONSTRAINT (lesson-critical)
ρ is generically irrational. This lesson **grades ρ² (always rational) or a rational ρ only** (perfect-square variances / Pythagorean pairs). The dice ρ=1/√2 is shown display-only and graded as ρ²=1/2. NEVER accept a float ρ where the dossier says ρ is irrational.

## Verified problems & answers
| # | Problem | Exact-rational answer | Source | check |
|---|---|---|---|---|
| #5 | Cov=12, Var(X)=9, Var(Y)=25: ρ | **4/5** | GB p.48 ρ-definition (line 7660) | ☐engine ☐source |
| #4 | S=X₁+X₂, dice: ρ²(X₁,S) | **1/2** (ρ=1/√2 display-only) | randomservices.org; GB p.48 | ☐engine ☐source |
| #7 | X symmetric, Y=X²: Cov(X,X²), ρ | Cov=**0**, ρ=**0** (yet dependent) | randomservices.org; USNA Math 431 HW9; GB ρ-section | ☐engine ☐source |

## Beat-by-beat plan (Bet → Explore → Model → Prove)
| # | beatId | intent | teaches | misconception elicited/refuted | graded? | track |
|---|---|---|---|---|---|---|
| 1 | `cov4-recall` | Retrieval opener: "Cov carries units of…" → X×Y; "Independent ⇒ Cov=…" → 0 | motivates unit-free ρ; re-surfaces L2 Cov=0 | — | yes (`retrievalGrid`, required) | all |
| 2 | `cov4-bet` | Bet: Cov=12, Var 9 & 25 — what is ρ? | ρ has no units; divide by product of SDs | "ρ=Cov" / "divide by sum of variances" | no (`prediction`, byOption) | all |
| 3 | `cov4-explore` | Explore: rescale a variable → Cov shifts but ρ holds | ρ is scale-invariant, bounded [−1,1] | "ρ can exceed 1" | no (`covarianceBoard` `ellipse`, hero) | all |
| 4 | `cov4-model` | Model card: ρ=Cov/(σ_Xσ_Y), [−1,1]; ρ² when irrational; the converse trap | the ρ formula + the √ handling + Cov=0⇏indep | "ρ=0 ⇒ independent" | no (`tripletReveal`, introducesSymbol `ρ(X,Y)`, groundedBy `cov4-win`) | all |
| 5 | `cov4-win` | Guaranteed early win (rational-ρ): 12/√225 = 12/15 = 4/5 | clean rational ρ from perfect-square variances | "divide by 34" / report Cov | yes (`answerEntry`, **4/5**) | all |
| 6 | `cov4-interleave` | Interleave: "independent ⇒ ___ the likelihoods" (multiply) vs the Cov=0/dependent counterexample | discriminate independence (factors) from uncorrelated | the converse trap | yes (`retrievalGrid`, required) | all |
| 7 | `cov4-mastery` | Mastery: Part A ρ²(X₁,S)=1/2 (grade ρ², ρ=1/√2 display-only); Part B Cov(X,X²)=0, ρ=0 yet dependent | √-handling + the headline converse trap | grade the float ρ; "Cov=0 ⇒ independent" | yes (`masteryChallenge`, required, **ρ²=1/2 / Cov=0, ρ=0**) | all |
| 8 | `cov4-recap` | Recap: ρ ∈ [−1,1], unit-free; uncorrelated ≠ independent; next, three variables | — | — | yes (`recap`, required) | all |

## Misconceptions (per-option refutation copy)
**Bet `prediction` ("Cov=12, Var 9 & 25 — what is ρ?")**:
- "12 — the covariance is the correlation" → *"Let's test it — that's the raw covariance, still carrying units of X×Y. ρ divides them out: ρ=Cov/(σ_Xσ_Y). And ρ must land in [−1,1], so a bare 12 can't be one."* (false)
- "12/34 — divide by the variances added" → *"Let's test it — you divided by Var(X)+Var(Y)=34. ρ divides by the product of SDs √(9·25)=15, not the sum of variances."* (false)
- "4/5 — Cov over √(Var·Var)" → *"Good instinct — divide by the product of SDs to strip the units. 12/√225=12/15=4/5 (#5)."* (true)

> **Dept 2 flag (from Misconception Specialist):** this prediction works because #5 has perfect-square variances. Do NOT clone the "pick the decimal ρ" option shape for #4 (ρ=1/√2 is irrational) — use the ρ² entry instead.

**`cov4-win` hint ladder** (accept `4/5`): nudge "ρ=Cov/√(Var·Var)" → method "√(9·25)=√225=15" → answer "12/15 = **4/5** (#5)." Most likely wrong: `12` (reports Cov) or `12/34`.

**`cov4-mastery` Part A** (accept ρ² `1/2`): most likely wrong = `1/√2`/`0.71` (computes ρ directly — the wrong, ungradeable object; not wrong math, wrong object). **Part B refutation (the converse trap), exact copy a learner sees when picking "independent":**
> *"Let's test it — Cov=0 only says there's no linear trend. But Y=X² is literally computed from X: tell me X and I'll tell you Y exactly. That's the strongest dependence there is. Independence ⇒ Cov=0, but the arrow does not reverse. Here Cov(X,X²)=0 and ρ=0 (#7), yet X,Y are completely dependent. Zero correlation is not independence."*

**Misconceptions targeted:** **Cov=0 ⇒ independent (the converse trap, #7 — the concept's #1 misconception)**; "ρ has units / ρ=Cov" (#5); "divide by Var(X)+Var(Y)"; "grade the float ρ=1/√2 instead of ρ²=1/2" (#4); "ρ can exceed 1" (the [−1,1] sanity check).

## Assessment + continuity
- **Retrieval opener** (`cov4-recall`, required, graded): `{ "Covariance carries units of…" → "X × Y" }`, `{ "Independent ⇒ Cov = … (from L2)" → "0" }`. Motivates unit-free ρ; re-surfaces L2 Cov=0 [§3c gap +2].
- **Guaranteed early win** (`cov4-win`): perfect-square variances → clean rational ρ=4/5; the one place a decimal equivalent (0.8) is safe to accept (#5).
- **Required mastery before recap** (`cov4-mastery`): two-part — Part A grades ρ²=1/2 (honors √ constraint, ρ=1/√2 display-only); Part B is the converse trap (Cov(X,X²)=0, ρ=0, dependent).
- **The converse-trap interleave (continuity §3b bullet 1, sharpened):** `cov4-interleave` pairs a Bayes-L3 "independent ⇒ multiply the likelihoods" recall against the #7 counterexample. The discrimination the pair builds: multiplying likelihoods *defines* independence (joint factors); Cov=0 is strictly weaker and the X/X² pair satisfies it WITHOUT factorization.
- **Accept strings:** ρ `4/5` (#5) → `["4/5","0.8",".8"]`; ρ² `1/2` (#4) → `["1/2","0.5",".5"]` — **do NOT accept** `0.707`, `1/√2`, or any float ρ; Cov `0` and ρ `0` (#7) → `["0"]` each.

## Open items for Dept 2
- The √-constraint grading (Part A must score ρ² and reject any float ρ entry) needs the engine + answerEntry to support a "display-only, not graded" ρ value. Confirm the `answerEntry`/`covarianceBoard` can show ρ=1/√2 as text while grading only ρ²=1/2. This is the load-bearing exact-rational requirement.
