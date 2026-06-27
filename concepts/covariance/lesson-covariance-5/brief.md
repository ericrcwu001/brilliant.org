# Lesson Brief — `lesson-covariance-5`: The Correlation Triangle: 3-Variable Bounds

- **courseId:** `course-covariance` · **chapter:** `ch-covariance-3` (Correlation in the Wild)
- **unlocks:** `lesson-covariance-6` · **prereqs:** `lesson-covariance-4`
- **glyphKey:** `ρ-range` · **vizKey:** `twoNode` · **introducesSymbol:** `PSD det: 1+2ρ₁ρ₂ρ−ρ₁²−ρ₂²−ρ²≥0`

## Hook (the bet)
"x is 0.8-correlated with both y and z. Can ρ(y,z) be anything you like — even −1?" Intuition says correlations are independent of each other; they're not. If x is strongly tied to both y and z, then y and z can't be too unalike — the PSD constraint fences ρ(y,z) into a narrow band.

## Core promise (one idea)
**Correlations constrain each other: the correlation matrix must be positive semidefinite, which bounds any third correlation.** With ρ(x,y)=ρ(x,z)=4/5, ρ(y,z) ∈ [7/25, 1] — not [−1,1].

## Display fields
glyphKey `ρ-range`; vizKey `twoNode`. Explore beat uses `covarianceBoard` (`corrVectors` display): two unit vectors at fixed angles, sweep the third vector to watch ρ(y,z) hit its rational endpoints. This is the genuinely-new visual the new type was designed for.

## Verified problems & answers
| # | Problem | Exact-rational answer | Source | check |
|---|---|---|---|---|
| #10 | ρ(x,y)=ρ(x,z)=4/5: range of ρ(y,z) | max **1**, min **7/25** | GB p.26-29 (lines 4579-4943) | ☐engine ☐source |
| #11 | 3 vars, all pairwise ρ equal: min ρ | **−1/2** | atypicalquant.net; GB p.29 PSD material | ☐engine ☐source |
| #12 | n vars, all pairwise ρ equal: min ρ | **−1/(n−1)** | atypicalquant.net | ☐engine ☐source |
| #13 | Hedge: σ_A²=4, σ_B²=9, Cov=−6: h* | **−2/3** | GB p.48 "optimal hedge ratio" (line 7647) | ☐engine ☐source |

(Rejected per dossier: the Jane Street 0.9/0.8 range — irrational √0.19, kept out of the graded set.)

## Beat-by-beat plan (Bet → Explore → Model → Prove)
| # | beatId | intent | teaches | misconception elicited/refuted | graded? | track |
|---|---|---|---|---|---|---|
| 1 | `cov5-recall` | Retrieval opener: "ρ lies in…" → [−1,1]; "ρ=Cov/…" → √(Var·Var) | re-surfaces the L4 ρ definition + bound | — | yes (`retrievalGrid`, required) | all |
| 2 | `cov5-bet` | Bet: x 0.8-correlated with y and z — can ρ(y,z) be anything in [−1,1]? | correlations aren't free; PSD fences them | "the third ρ is free in [−1,1]" | no (`prediction`, byOption) | all |
| 3 | `cov5-explore` | Explore: two unit vectors at fixed angles; sweep the third | the geometry of the correlation bound | — | no (`covarianceBoard` `corrVectors`, hero) | all |
| 4 | `cov5-model` | Model card: PSD determinant bounds ρ(y,z); equicorrelation det (1−ρ)²(1+2ρ) | the PSD-determinant mechanism | "any ρ in [−1,1]" | no (`tripletReveal`, introducesSymbol PSD-det, groundedBy `cov5-win`) | all |
| 5 | `cov5-win` | Guaranteed early win: hedge h*=Cov/Var=−6/9=−2/3 (single division) | Cov/Var bilinearity application | reach for ρ when Cov/Var suffices | yes (`answerEntry`, **−2/3**) | all |
| 6 | `cov5-mastery` | Mastery: Part A min ρ(y,z)=7/25 (Pythagorean pair), max 1; Part B equicorrelation min −1/2 (and −1/(n−1)) | the PSD-bound tool, both forms | "third ρ down to −1" / "all pairwise can be −1" | yes (`masteryChallenge`, required, **7/25, 1 / −1/2, −1/(n−1)**) | all |
| 7 | `cov5-recap` | Recap: correlations live inside a PSD box; next, the synthesis capstone | — | — | yes (`recap`, required) | all |

## Misconceptions (per-option refutation copy)
**Bet `prediction` ("Can ρ(y,z) be anything in [−1,1]?")**:
- "Yes — y and z are free, any value in [−1,1]" → *"Let's test it — correlations aren't free of each other. If x is strongly tied to both y and z, they can't be too unalike. The correlation matrix must be PSD, fencing ρ(y,z) into a narrower band (#10)."* (false)
- "It can reach up to 1 but down to −1" → *"Let's test it — the top is right (ρ(y,z) can hit 1), but the floor isn't −1. The PSD constraint lifts the minimum to 7/25=0.28 (#10)."* (false)
- "No — it's pinned between 7/25 and 1" → *"Good instinct — the PSD-determinant condition bounds it. Let's derive ρ(y,z) ∈ [7/25, 1] (#10)."* (true)

> **Dept 2 flag (from Misconception Specialist):** this prediction is diagnostic only because the options are range **endpoints** (7/25, −1, "anything"), and 7/25 is rational via the Pythagorean (4/5,3/5) pair. A free-numeric ρ(y,z) entry would be irrational for non-Pythagorean inputs (the rejected Jane Street case) — keep any such entry display-only; grade endpoints / the PSD determinant / ρ².

**`cov5-win` hint ladder** (accept `-2/3`): nudge "h*=Cov(A,B)/Var(B), no ρ needed" → method "(−6)/9" → answer "**−2/3** (#13)." Most likely wrong: a value built from ρ (e.g. ρ=−6/√36=−1 then mis-scaling) — over-reaching for ρ when Cov/Var suffices.

**`cov5-mastery` Part A** (accept min `7/25`, max `1`): nudge "min = ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²); the (4/5,3/5) pair keeps roots rational" → method "16/25 − (3/5)(3/5)=16/25−9/25" → answer "**7/25** (#10); max 16/25+9/25=1." **Part B** (accept `-1/2`, stretch `-1/(n-1)`): method "equicorrelation det (1−ρ)²(1+2ρ)≥0 ⇒ 1+2ρ≥0" → answer "ρ≥**−1/2** (#11); general −1/(n−1) (#12)." Most likely wrong (both parts): `−1` — assuming correlations bottom out at −1, missing that three things can't all mutually disagree as hard as two.

**Misconceptions targeted:** "the third correlation is free in [−1,1]" ignoring PSD (#10); "all pairwise correlations can be −1" missing the −1/(n−1) floor (#11,#12); over-using ρ where Cov/Var suffices (#13).

## Assessment + continuity
- **Retrieval opener** (`cov5-recall`, required, graded): `{ "ρ always lies in the interval…" → "[−1, 1]" }`, `{ "ρ(X,Y) = Cov(X,Y) / …" → "√(Var_X · Var_Y)" }`. Re-surfaces the L4 ρ definition the geometry tightens.
- **Guaranteed early win** (`cov5-win`): hedge #13 = single division (−6/9). **Decision (resolved by Dept 1 Lead):** use #13 — it is the only L5 dossier number reachable in one operation with no √ and no PSD reasoning, and it reinforces the Cov/Var bilinearity thread. Caveat (flagged by Assessment Designer): all L5 dossier numbers are bounds/optimization results, so even this requires *selecting* the hedge formula — slightly harder than L1-L4's plug-ins. **Fallback for Dept 2 if playtesting shows it's too hard:** re-surface ρ=4/5 (#5) as a pure-recall early win.
- **Required mastery before recap** (`cov5-mastery`): two-part — Part A 3-variable range (Pythagorean pair → rational 7/25, 1); Part B equicorrelation floor (−1/2, −1/(n−1)). Forces the PSD-determinant tool over the naive [−1,1].
- **Spacing:** re-surface ρ definition + [−1,1] (L4) at opener; bilinearity Cov/Var (L3) inside the hedge win. Light interleave: single-pair ρ (L4) vs the three-way PSD box.
- **Accept strings:** h* `-2/3` (#13) → `["-2/3","−2/3"]` (both hyphen forms, no decimal — repeating); min ρ(y,z) `7/25` (#10) → `["7/25","0.28",".28"]`; max `1` → `["1"]`; min ρ `-1/2` (#11) → `["-1/2","−1/2","-0.5","−0.5"]`; `-1/(n-1)` (#12) → `["-1/(n-1)"]` (symbolic, display/stretch only).

## Open items for Dept 2
- **Early-win difficulty (flagged):** #13 hedge requires formula-selection; confirm in playtest or swap to the #5 recall fallback.
- `cov5-explore` (`corrVectors`) needs the new `covarianceBoard` to render two fixed vectors + a sweepable third with a live ρ readout. Confirm buildable; this is the second genuine use of the new type.
