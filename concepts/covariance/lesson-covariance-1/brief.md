# Lesson Brief — `lesson-covariance-1`: Spread: Variance & Standard Deviation

- **courseId:** `course-covariance` · **chapter:** `ch-covariance-1` (Spread & Co-Movement)
- **unlocks:** `lesson-covariance-2` · **prereqs:** `lesson-expected-value-1`, `lesson-expected-value-2`
- **glyphKey:** `Var(X)` · **vizKey:** `twoNode` · **introducesSymbol:** `Var(X)=E[X²]−E[X]²`

## Hook (the bet)
Two carnival games both pay $5 on average. One pays exactly $5 every time; the other pays $0 or $10 on a coin flip. Same expected value — so is one riskier? The bet forces the learner to admit E[X] alone can't tell them apart, motivating a *second* number: the spread.

## Core promise (one idea)
**Variance measures how far a random variable spreads around its mean: Var(X) = E[X²] − E[X]².** SD = √Var puts that spread back in the variable's own units.

## Display fields
glyphKey `Var(X)`; vizKey `twoNode` (concept-level); explore beat may reuse `expectationScale` (1-D spread around the balance point) — no new interaction type needed in L1.

## Verified problems & answers
| # | Problem | Exact-rational answer | Source | check |
|---|---|---|---|---|
| #1 | Fair die: E[X], E[X²], Var(X) | E[X]=7/2, E[X²]=91/6, **Var(X)=35/12** | GB p.47-48 (lines 7502-7593); randomservices.org Covariance §5 | ☐engine ☐source |
| #1 (display) | SD of a fair die | √(35/12) ≈ 1.71 (irrational — display only) | derived from #1 | ☐engine ☐source |

No new unsourced numbers. SD is irrational → display-only; the graded quantity is the rational Var = 35/12 (honors the exact-rational contract).

## Beat-by-beat plan (Bet → Explore → Model → Prove)
| # | beatId | intent | teaches | misconception elicited/refuted | graded? | track |
|---|---|---|---|---|---|---|
| 1 | `cov1-recall` | Retrieval opener: recall E[X]=7/2 and the EV "spread is next" promise | re-activates EV L1 + cashes the `ev6-recap` promise | — (warm-up) | yes (`retrievalGrid`, required) | all |
| 2 | `cov1-bet` | Bet: two same-mean games — is one riskier? | seeds the need for a spread number | "same E[X] ⇒ same risk" | no (`prediction`, byOption) | all |
| 3 | `cov1-explore` | Explore: drag a fair-die pmf, watch spread around 7/2 | spread is distance from the balance point | — | no (`expectationScale`, hero) | all |
| 4 | `cov1-model` | Model card: define Var(X)=E[X²]−E[X]², SD=√Var (units of X) | the variance formula + its two pieces | "Var = E[X²]" (forgets −E[X]²) | no (`tripletReveal`, introducesSymbol `Var(X)`, groundedBy `cov1-win`) | all |
| 5 | `cov1-win` | Guaranteed early win: Var(die)=91/6 − 49/4 = 35/12 (both inputs given) | one-subtraction application of the formula | "stop at E[X²]=91/6" / "square the mean" | yes (`answerEntry`, **35/12**) | all |
| 6 | `cov1-mastery` | Mastery: derive E[X²] from scratch, then return Var | full pipeline: build second moment, apply definition | reporting E[X²] as variance | yes (`masteryChallenge`, required, **E[X²]=91/6, Var=35/12**) | all |
| 7 | `cov1-recap` | Recap: variance = spread²; SD = spread; next, two variables | — | — | yes (`recap`, required) | all |

## Misconceptions (per-option refutation copy)
**Bet `prediction` ("Var of a fair die around 7/2?")** — 3 options, one correct:
- "Var = E[X²] = 91/6" → *"Let's test it — that's the raw second moment E[X²]=91/6 (#1). You forgot to subtract E[X]²=(7/2)²=49/4. Spread is measured around the balance point, not from zero."* (false)
- "Var = E[X]² = 49/4" → *"Let's test it — you squared the average instead of averaging the squares. Variance is E[X²]−E[X]², not E[X]² alone."* (false)
- "Var = E[X²] − E[X]² = 35/12" → *"Good instinct — mean of the squares minus square of the mean. Let's prove 91/6 − 49/4 = 35/12 (#1)."* (true)

**`cov1-win` hint ladder** (accept `35/12`): nudge "you need both pieces, mean-of-squares and square-of-mean" → method "E[X²]=91/6, E[X]²=49/4, subtract" → answer "182/12 − 147/12 = **35/12** (#1)." Most likely wrong answer: `91/6` (stops at E[X²]).

**`cov1-mastery`** (accept E[X²]=`91/6`, Var=`35/12`): most likely wrong answer = reporting `35/12 ≈ 2.92` as the SD (conflating spread² with spread). SD stays display-only (√(35/12) is irrational).

**Misconceptions targeted:** "variance forgets −E[X]²" (report E[X²]); "SD = Var" (skip the √).

## Assessment + continuity
- **Retrieval opener** (`required`, graded `retrievalGrid`): pairs `{ "E[X], one fair die" → "7/2" }`, `{ "EV's last lesson said one thing was 'next'" → "the spread (variance)" }`. Wires continuity §3a (EV→Covariance seam) + §3c "variance is next" callback. Pure recall, no new computation.
- **Guaranteed early win** (`cov1-win`): both inputs (7/2, 91/6) handed over → one subtraction to 35/12.
- **Required mastery before recap** (`cov1-mastery`): derive E[X²] from the pmf, then Var — forces the full pipeline, not the free subtraction.
- **Spacing/interleaving:** re-surface E[X]=7/2 (EV L1) at opener and inside E[X²] [§3c across-course → +1 gap]. L1 is teach-fresh foundation; only the Σ-weighting machinery is assumed-known (continuity §2 dedupe).
- **Accept strings:** `35/12` → `["35/12"]`; `91/6` → `["91/6"]`; opener right-card `7/2` is an exact retrievalGrid match.

## Open items for Dept 2
- The explore beat (`cov1-explore`) reuses `expectationScale`. If a clearer "spread vs balance-point" visual is wanted, this is a candidate for a `covarianceBoard` variant, but a genuine 1-D spread mechanic already exists in `expectationScale` — flagging as low-risk reuse.
