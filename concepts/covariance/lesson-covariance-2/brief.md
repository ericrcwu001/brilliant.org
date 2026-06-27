# Lesson Brief — `lesson-covariance-2`: Covariance: The Leftover of the Product Rule

- **courseId:** `course-covariance` · **chapter:** `ch-covariance-1` (Spread & Co-Movement)
- **unlocks:** `lesson-covariance-3` · **prereqs:** `lesson-covariance-1`, `lesson-expected-value-2`, `lesson-expected-value-3`, `lesson-bayes-rule-3`
- **glyphKey:** `Cov(X,Y)` · **vizKey:** `twoNode` · **introducesSymbol:** `Cov(X,Y)=E[XY]−E[X]E[Y]`

## Hook (the bet)
"In EV you learned E[XY]=E[X]E[Y] — but only when X and Y are independent. So when they're NOT independent, what happens to E[XY]−E[X]E[Y]?" The leftover isn't zero — and that leftover is the whole lesson. This is the corpus's best setup (the continuity report's #1 conversion): retrieve the product rule, then name its residue.

## Core promise (one idea)
**Covariance is the leftover of the product rule: Cov(X,Y) = E[XY] − E[X]E[Y].** Its sign tells you the *direction* two variables move together; it's zero exactly when the product rule holds.

## Display fields
glyphKey `Cov(X,Y)`; vizKey `twoNode`. Explore beat uses the **one new** `covarianceBoard` interaction (`display: "jointPmf"`) — building a 2×2 joint pmf table is genuinely new (no existing interaction renders a joint distribution; `expectationScale` is 1-D). This is the first justified use of the new type.

## Verified problems & answers
| # | Problem | Exact-rational answer | Source | check |
|---|---|---|---|---|
| #6 | Perfectly-correlated bits P(0,0)=P(1,1)=1/2: Cov, ρ | Cov=**1/4**, ρ=**1** | GB p.47-48 Cov def (lines 7502-7566); randomservices.org | ☐engine ☐source |
| #6 | Independent fair bits: Cov | **0** | GB p.47-48; randomservices.org | ☐engine ☐source |
| #2 | Two independent fair dice: Cov(X₁,X₂) | **0** | GB p.47-48 "general rules" (line 7582); randomservices.org | ☐engine ☐source |

## Beat-by-beat plan (Bet → Explore → Model → Prove)
| # | beatId | intent | teaches | misconception elicited/refuted | graded? | track |
|---|---|---|---|---|---|---|
| 1 | `cov2-recall` | Retrieval opener: "E[XY]=E[X]E[Y] when…" → independent; "Cov(X₁,X₂) two dice" → 0 | re-activates EV L2 product rule; springs the leftover question | — | yes (`retrievalGrid`, required) | all |
| 2 | `cov2-bet` | Bet: Cov of two independent dice — positive, zero, or unknowable? | identically-distributed ≠ dependent | "both are dice ⇒ correlated" | no (`prediction`, byOption) | all |
| 3 | `cov2-explore` | Explore: build a 2×2 joint pmf; Cov updates live (independent vs matched) | the joint pmf table; sign of Cov | "Cov needs no joint table" | no (`covarianceBoard` `jointPmf`, hero) | all |
| 4 | `cov2-model` | Model card: Cov=E[XY]−E[X]E[Y]; sign = direction; the leftover of the product rule | the covariance formula + meaning | "Cov = E[XY]" (drops the correction) | no (`tripletReveal`, introducesSymbol `Cov(X,Y)`, groundedBy `cov2-win`) | all |
| 5 | `cov2-win` | Guaranteed early win: matched table E[XY]=1/2, E[X]E[Y]=1/4 → Cov=1/4 | one-subtraction application | "report E[XY]=1/2" | yes (`answerEntry`, **1/4**) | all |
| 6 | `cov2-interleave` | Interleave: "independent evidence ⇒ ___ the likelihoods" (Bayes L3 recall) vs the Cov items | independence test (factor/multiply) vs co-movement | seed: Cov=0 vs independence | yes (`retrievalGrid`, required) | all |
| 7 | `cov2-mastery` | Mastery: Part A independent table → Cov=0; Part B matched table → Cov=1/4, ρ=1 | sign-and-magnitude discrimination | "both are 0" (Cov=0 as default) | yes (`masteryChallenge`, required, **0 / 1/4 / ρ=1**) | all |
| 8 | `cov2-recap` | Recap: Cov is the product rule's residue; next, how Cov adds inside Var(X+Y) | — | — | yes (`recap`, required) | all |

## Misconceptions (per-option refutation copy)
**Bet `prediction` ("Cov(X₁,X₂) for two independent dice?")**:
- "Positive — both are dice, so they move together" → *"Let's test it — identically-distributed is not dependent. Two separate dice share a distribution but never influence each other. We'll show E[X₁X₂]−E[X₁]E[X₂] collapses to 0 (#2)."* (false)
- "Can't tell without the joint table" → *"Let's test it — generally true, but independence hands it to you: E[X₁X₂]=E[X₁]E[X₂] exactly (the EV L2 product rule), so the leftover is 0 (#2)."* (false)
- "Zero — they're independent" → *"Good instinct — independence makes the product rule exact, so the leftover vanishes. Let's confirm Cov=0 (#2)."* (true)

**`cov2-win` hint ladder** (accept `1/4`): nudge "Cov = E[XY] − E[X]E[Y]; find each piece" → method "XY=1 only on (1,1) so E[XY]=1/2; each bit Bernoulli(1/2) so E[X]E[Y]=1/4" → answer "1/2 − 1/4 = **1/4** (#6); Var=1/4 each so ρ=1." Most likely wrong answer: `1/2` (skips the E[X]E[Y] correction).

**`cov2-mastery`** (accept Part A `0`, Part B Cov `1/4` / ρ `1`): most likely wrong answer = both Cov=0 (over-applying "Cov=0" as default). The matched table breaks the product rule.

**Misconceptions targeted:** identically-distributed ≠ dependent (#2); "Cov = E[XY]" dropping E[X]E[Y] (#6); Cov=0 as automatic.

## Assessment + continuity
- **Retrieval opener** (`cov2-recall`, required, graded): `{ "E[XY]=E[X]E[Y] is allowed when…" → "X, Y are independent" }`, `{ "Two independent fair dice: Cov(X₁,X₂)" → "0" }`. Direct retrieval of `ev2-model`'s ⚠️ Product Rule card + the spring into the leftover.
- **Guaranteed early win** (`cov2-win`): both moments given → one subtraction to 1/4.
- **Required mastery before recap** (`cov2-mastery`): two-part Cov=0 vs Cov=1/4/ρ=1 contrast.
- **The single most valuable interleave (continuity §3b bullet 1):** `cov2-interleave` pairs a Bayes-L3 "independent evidence ⇒ multiply the likelihoods" recall against the Cov items, so the learner sorts independence (joint factors) from co-movement. This **seeds** the converse trap that L4 sharpens [§3c gap +2].
- **Spacing:** re-surface product rule (EV L2) at opener [across-course]. False-overlap guard (continuity §7): engine is `covariance.ts`, NOT the unrelated string `correlation.ts`.
- **Accept strings:** Cov `1/4` → `["1/4","0.25",".25"]`; Cov `0` → `["0"]`; ρ `1` → `["1"]`.

## Open items for Dept 2
- `cov2-explore` is the **first use of the new `covarianceBoard` `jointPmf` display**. Confirm the interactive joint-pmf-table mechanic (tap cells, Cov recomputes live) is buildable; this is the lesson where the new type is genuinely needed.
