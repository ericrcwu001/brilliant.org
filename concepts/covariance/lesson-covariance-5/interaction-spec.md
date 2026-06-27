# Interaction Spec — `lesson-covariance-5`: The Correlation Triangle: 3-Variable Bounds

> Stage-2 Dept-2. Design-only. **Two flagged-beat resolutions here:**
> 1. **cov5-explore (`corrVectors`)** — confirmed buildable; two FIXED unit vectors (both ρ=4/5 to x) +
>    a sweepable third; live ρ(y,z) with the attainable range [7/25, 1].
> 2. **cov5-win early-win difficulty (Dept-2 CALL): SWAP to the #5 ρ=4/5 pure-recall fallback.** Keep
>    #13 hedge, but **demote it into `cov5-mastery`/interleave**, not the first graded slot.
> Goldens: ρ(y,z)∈[**7/25**,**1**] (#10), equicorrelation min **−1/2** (#11), **−1/(n−1)** (#12, display/stretch),
> hedge **−2/3** (#13). Pythagorean (4/5,3/5) keeps every √ rational.

## Early-win decision — rationale (cov5-win)
The rule "the first graded beat must not be the hardest type / must be a guaranteed win" decides it. **#13 hedge**
introduces a *new* formula (optimal-hedge) at the win slot and carries a live misconception attractor (over-reach
to ρ) — Dept 1 itself flagged it requires *formula-selection*, so it is not a guaranteed win. **#5 ρ=4/5** was
already the L4 win, so re-surfacing it at L5 is **spaced retrieval** — near-certain win-probability, lands on
material the `cov5-recall` opener just re-primed (ρ definition + [−1,1]). New tools belong in `cov5-model`/mastery,
where #13's Cov/Var and the PSD bounds already live. **Decision: cov5-win = #5 ρ=4/5 recall; #13 hedge → mastery interleave.**

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `cov5-recall` | match: `ρ lies in → [−1,1]`; `ρ = Cov / → √(Var·Var)` | `retrievalGrid` | REUSE | correct: "ρ∈[−1,1], ρ=Cov/√(Var_X·Var_Y) — the bound the geometry tightens." Hints ①both are the L4 ρ definition: the interval + the denominator ②ρ normalizes Cov by the product of SDs ③**[−1,1]**; **√(Var_X·Var_Y)** | tap-and-tap; aria-live | match-snap | both |
| 2 | `cov5-bet` | choose: x is 0.8-correlated with y and z — can ρ(y,z) be anything in [−1,1]? | `prediction` (byOption) | REUSE | byOption (below) | radiogroup | none | both |
| — | `cov5-primer-psd` | JIT primer: "valid correlation matrix ⇒ PSD ⇒ det ≥ 0; solving det≥0 for the third ρ pins it" | `primer` (`custom`, collapsible) | REUSE | — | tap-expand | collapsible | **A** (`required:false`) |
| 3 | `cov5-explore` | **sweep the third vector — try to BREAK the bound.** Two FIXED unit vectors at angle arccos(4/5) to x (sin=3/5, exact). Manipulate: drag the third vector z (one rotational DOF, φ about x's cone), framed as "make y,z *anti*-correlated (ρ=−1)." Respond: live ρ(y,z)=cos θ_yz updates; the dot on a [−1,1] number-line slides toward the floor and **STOPS at 7/25, refusing to go lower** — discovery by collision. Loop: the range bracket [7/25,1] is revealed *after* the learner hits the wall; the dot can never leave it. | `covarianceBoard` `corrVectors` (`interactive:true`) | **NEW** (reuses the L2 type, corrVectors mode) | ungraded hero; collision line "You found the floor — ρ(y,z) can't drop below 7/25." | drag is enhancement; **canonical control = native range over φ, snap step, full arrow keys (Home/End = min/max-ρ stop)**; 44px thumb + 44px dot hit-target; one `aria-live`: `Third vector at θ°. ρ(y,z)=…. Attainable range [7/25,1] (0.28–1.00)`; vectors differ by label+token not hue; reduced-motion → z parked at max-ρ stop, full bracket drawn | sweep `transform rotate var(--dur-slow) var(--ease-out)`; snap-catch `--ease-spring` at ρ=1/0/floor; bracket grows scaleX from left; dot rides translateX; reduced-motion final frame | both |
| 4 | `cov5-model` | three lenses → PSD-determinant bounds ρ(y,z); equicorrelation det (1−ρ)²(1+2ρ) | `tripletReveal` (`introducesSymbol` PSD-det, `groundedBy cov5-win`) | REUSE | converge: "Correlations live inside a PSD box." | tap aria-expanded; status | reveal | both |
| 5 | `cov5-win` | **type ρ given Cov=12, Var 9 & 25 (re-surfaced #5 — spaced recall)** | `answerEntry` | REUSE | golden **4/5** accept `["4/5","0.8",".8"]`; ladder (below) | input aria-label; Enter | none | both |
| — | `cov5-primer-hedge` | JIT primer: "hedge h*=Cov/Var — a single division, no ρ, no √" | `primer` (`custom`, collapsible) | REUSE | — | tap-expand | collapsible | **A** (`required:false`) |
| 6 | `cov5-mastery` | **Part A: min ρ(y,z)=7/25, max 1 (Pythagorean pair). Part B: equicorrelation min −1/2 (stretch −1/(n−1)). Interleave: hedge h*=−2/3 (demoted #13).** | `masteryChallenge` (`required`, `density:split` on A) | REUSE | goldens A `7/25`,`1`, B `-1/2` (+ display `-1/(n-1)`), hedge `-2/3`; ladders (below) | per-field aria-label; `-1/(n-1)` field is display/stretch only; Enter | none | both |
| 7 | `cov5-recap` | recap: correlations live inside a PSD box; next, the synthesis capstone | `recap` (`required`) | REUSE | — | radiogroup | reveal | both |

## New interaction types (for Wave 0)
Reuses the `covarianceBoard` member with `display:'corrVectors'`, `task:'corrRange'`, fields `rho1:4/5`, `rho2:4/5`,
`headline:"7/25,1"`. The renderer (`CorrVectorsDisplay`, inline SVG, no Konva) draws two fixed vectors + one
draggable; the [−1,1] number-line bracket. Interior φ → generically irrational ρ shown as **display-only** readout
text (beat is ungraded, so no float is graded — the brief's flag satisfied by construction).

## Feedback + hint ladders

**`cov5-bet` (byOption):**
- "Yes — y,z free, any value in [−1,1]" → *"Correlations aren't free of each other. If x is strongly tied to both y and z, they can't be too unalike; the matrix must be PSD, fencing ρ(y,z) (#10)."* (false)
- "Up to 1 but down to −1" → *"Top is right (can hit 1), but the floor isn't −1 — PSD lifts the minimum to 7/25 (#10)."* (false)
- "No — pinned between 7/25 and 1" → *"The PSD-determinant condition bounds it: ρ(y,z)∈[7/25,1] (#10)."* (true)

**`cov5-win` (re-surfaced #5, golden 4/5):** correct: "ρ=12/√(9·25)=12/15=4/5 — the L4 definition, fresh from this lesson's opener." Hints ①ρ=Cov/√(Var·Var) (just retrieved) ②√(9·25)=15 ③12/15=**4/5** (#5). Per-mistake **`12`** *"Raw Cov, not in [−1,1]; divide by 15."* **Spacing note:** #5 appears in both cov4-win and cov5-win — intentional spaced recall; flag for QA's de-dup gate.

**`cov5-mastery` Part A (goldens 7/25, 1):** correct: "ρ(y,z)∈[7/25,1] — PSD lifts the floor well above −1." Hints ①third ρ isn't free; min/max from PSD-det; with ρ₁=ρ₂=4/5 the leftover root is √(9/25)=3/5, rational ②min=16/25−(3/5)(3/5)=16/25−9/25; max=16/25+9/25 ③min=**7/25**, max=**1** (#10). Per-mistake **`-1`** *"−1 is the floor for *two* variables. y and z are each pinned to x at 4/5 — they can't fully disagree; PSD lifts the floor to 7/25≈0.28."*

**`cov5-mastery` Part B (golden −1/2; stretch −1/(n−1)):** correct: "All-equal pairwise ρ has floor −1/2, not −1; general −1/(n−1)." Hints ①three mutually-negative correlations fight each other — can't all be −1 ②det (1−ρ)²(1+2ρ)≥0 ⇒ 1+2ρ≥0; for n: 1+(n−1)ρ≥0 ③ρ≥**−1/2** (#11); general **−1/(n−1)** (#12). Per-mistake **`-1`** *"−1 is the two-variable limit; 1+2ρ≥0 forces ρ≥−1/2. Adding variables only raises the floor: −1/(n−1)."*

**`cov5-mastery` hedge interleave (demoted #13, golden −2/3):** correct: "h*=Cov(A,B)/Var(B)=−6/9=−2/3 — a single division, no ρ." Hints ①hedge is Cov/Var, no ρ or √ ②(−6)/9; don't normalize into a correlation ③**−2/3** (#13) accept `["-2/3","−2/3"]`. Per-mistake **over-reach to ρ** *"You reached for the correlation; the hedge is Cov/Var, not Cov/√(Var·Var). −6/9=−2/3."*

## Build decomposition (Technical Planner — for Dept 3)
- **Engine fns:** `corrRange(rho1,rho2): {min,max}` → {7/25, 1} (exact via Pythagorean √); `psdDeterminant3(r12,r13,r23): Rational` → 0 at the bounds (the model-card mechanism); `equicorrelationMin(n): Rational` → −1/2 (n=3), −1/(n−1); `optimalHedgeRatio(covAB,varB): Rational` → −2/3; `rho(cov,varX,varY)` → 4/5 (cov5-win). All plain-number `Rational` (worst intermediate ≈1e9 « MAX_SAFE_INTEGER, even at n=10).
- **Schema variant:** `covarianceBoard corrVectors` (existing member); `rho1`/`rho2` fields, `task:'corrRange'`.
- **Renderer/widget + props:** `CovarianceBoardBeat.tsx` → `CorrVectorsDisplay` (inline SVG vectors + number-line bracket; native range over φ). `headline:"7/25,1"` via `formatRangePair`. cov5-win/mastery standard `answerEntry`/`masteryChallenge`.
- **Fixture fields:** `cov5-explore` `rho1:{n:4,d:5}`,`rho2:{n:4,d:5}`,`task:'corrRange'`,`headline:"7/25,1"`; cov5-win accept `["4/5","0.8",".8"]`; cov5-mastery accepts `["7/25","0.28",".28"]`,`["1"]`,`["-1/2","−1/2","-0.5","−0.5"]`,`["-1/(n-1)"]`(display),`["-2/3","−2/3"]`.
- **Validation anchors:** `corrRange → {7/25, 1}`, `psdDeterminant3 → 0` at bounds, `equicorrelationMin(3) → −1/2`, `optimalHedgeRatio → −2/3`, `rho → 4/5`.

## Definition-of-Ready checklist
| beat | verified+sourced | concrete mechanic | feedback + 3-level hints | a11y |
|---|---|---|---|---|
| cov5-recall | ✅ L4 ρ-def | ✅ grid | ✅ | ✅ |
| cov5-bet | ✅ #10 | ✅ choice+refute | ✅ byOption | ✅ |
| cov5-explore | ✅ #10 | ✅ sweep third vector, try-to-break the floor (genuine discovery) | ✅ ungraded collision line | ✅ |
| cov5-model | ✅ #11 | ✅ triplet | ✅ | ✅ |
| cov5-win | ✅ #5 (4/5, spaced) | ✅ type-in, guaranteed early win | ✅ ladder+per-mistake | ✅ |
| cov5-mastery | ✅ #10/#11/#12/#13 | ✅ multi-part PSD + hedge | ✅ ladders + per-mistake | ✅ |
| cov5-recap | ✅ | ✅ | ✅ | ✅ |

**DoR holds for all L5 beats.**
