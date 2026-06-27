# Interaction Spec — `lesson-covariance-4`: Correlation ρ: The Unit-Free Score  ★ converse-trap

> Stage-2 Dept-2. Design-only. **Load-bearing flagged-beat resolution (cov4-mastery Part A):** grade
> ONLY ρ²=1/2; ρ=1/√2 is **display-only text, never gradeable**. Decision = **option (b): schema stays
> FROZEN** — ρ=1/√2 lives in `tripletReveal` prose + the graded field's `label`; the `answerEntry`
> grades the single ρ² field. (Option (a) — optional `accept` — was rejected: `gradeAcceptFields`
> calls `f.accept.map(norm)` unconditionally and would throw on an accept-less field.) Explore uses
> `covarianceBoard scatter` (raw-vs-standardized; **`ellipse` dropped**). Goldens: ρ=**4/5** (#5),
> ρ²=**1/2** (#4, ρ=1/√2 display-only), Cov(X,X²)=**0**/ρ=**0** (#7).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `cov4-recall` | match: `Cov carries units of → X×Y`; `Independent ⇒ Cov = → 0` | `retrievalGrid` | REUSE | correct + hints (below) | tap-and-tap; aria-live | match-snap | both |
| 2 | `cov4-bet` | choose ρ given Cov=12, Var 9 & 25 | `prediction` (byOption) | REUSE | byOption (below) | radiogroup | none | both |
| — | `cov4-primer-sqrt-denom` | JIT primer: "the ρ denominator is √(product), not the product (and not the sum)" | `primer` (`custom`, collapsible) | REUSE | — | tap-expand | collapsible | **A** (`required:false`) |
| 3 | `cov4-explore` | **scale-invariance via raw-vs-standardized scatter.** Manipulate: **micro-prediction first** ("as you stretch Y, does ρ go up/down/stay?"), then drag a scale slider c∈{1/2,1,2,3} multiplying Y. Respond: a **raw (X,cY) cloud visibly stretches vertically** while the **standardized (X/σ_X, Y/σ_Y) cloud refuses to change shape**; Cov readout tracks ×c, ρ readout stays pinned (4/5 / display ρ²). Loop: sweep c, watch the raw cloud deform while standardized holds — the learner's wrong guess ("ρ should change") is broken by their own dragging. | `covarianceBoard` `scatter` (`interactive:true`) | **NEW** (reuses the L2 type, scatter mode) | ungraded hero; post-prediction reveal line "Stretching the units changed Cov, not ρ." | "add/step" via tap & slider (native range, arrow keys); 44px; one `aria-live` mirror `scale c=2 · Cov=n/d (×c) · ρ held`; decorative trend/cloud `aria-hidden`; reduced-motion → final settled clouds, no stretch animation | raw cloud scaleY tween `--dur-slow`; standardized cloud static (that's the point); ρ readout sign-colored; reduced-motion final frame | both |
| 4 | `cov4-model` | three lenses → `ρ=Cov/(σ_Xσ_Y)`, [−1,1]; **ρ² when irrational**; the converse trap. **Carries the ρ=1/√2 display-only prose.** | `tripletReveal` (`introducesSymbol ρ(X,Y)`, `groundedBy cov4-win`) | REUSE | converge: "ρ strips units into [−1,1]; ρ=0 ⇏ independent." `value` string holds "ρ=1/√2≈0.707 (irrational → we grade ρ²)" | tap aria-expanded; status | reveal | both |
| 5 | `cov4-win` | type ρ given Cov=12, Var 9 & 25 (perfect squares → rational ρ) | `answerEntry` | REUSE | golden **4/5** accept `["4/5","0.8",".8"]`; ladder (below) | input aria-label; Enter | none | both |
| 6 | `cov4-interleave` | match the converse trap: `independent ⇒ multiply (joint factors)` vs `Cov=0 ⇏ independent (X/X²)` | `retrievalGrid` (`required`) | REUSE | correct + hints (below) | tap-and-tap; aria-live | match-snap | both |
| 7 | `cov4-mastery` | **Part A: type ρ²=1/2 (ρ=1/√2 shown, never graded). Part B: Cov(X,X²)=0, ρ=0 yet dependent (converse trap).** | `masteryChallenge` (`required`, `density:split` on A) | REUSE | goldens A ρ² **1/2**, B Cov **0**/ρ **0**; ladders + the wrong-OBJECT refutation (below) | per-field aria-label; field label names the graded object; Enter | none | both |
| 8 | `cov4-recap` | recap: ρ∈[−1,1], unit-free; uncorrelated ≠ independent; next, three variables | `recap` (`required`) | REUSE | — | radiogroup | reveal | both |

## New interaction types (for Wave 0)
Reuses the `covarianceBoard` member (frozen in L2 spec) with `display:'scatter'`. The scatter renderer plots a
handful of **authored** standardized + raw points (reproducible — not RNG); `task:'rhoSquared'` lets the headline
anchor be ρ² when the variance product isn't a perfect square. **No new member; `ellipse` is not in the enum.**

### The ρ²-graded / ρ-display-only mechanism (load-bearing)
- **Graded field (only field in Part A) — exact JSON:**
```json
{ "id": "rho-sq-dice",
  "label": "ρ²(X₁, S)  (we grade the square — ρ = 1/√2 itself is irrational)",
  "accept": ["1/2", "0.5", ".5"],
  "placeholder": "a/b", "suffix": "= ρ²" }
```
- `label`/`suffix` are display-only decoration (per `AnswerEntryBeat.tsx`) — they print the "ρ=1/√2 is the
  ungradeable object" framing without ever entering `gradeAcceptFields`. ρ=1/√2 ALSO appears in the `cov4-model`
  `tripletReveal` prose. The string `1/√2` / `0.707` / `0.71` is **never** in any `accept` list, `headline`, or
  on a graded path — engine `rho(...)` returns `{kind:'irrational', rhoSquared:1/2, display:'1/√2'}`; only
  `rhoSquared` (always rational) reaches the grader. **No float is ever graded.**

## Feedback + hint ladders

**`cov4-recall` (golden: X×Y; 0):** correct: "Cov carries units of X×Y (why we divide them out); independent ⇒ Cov=0." Hints ①one card asks the *units* Cov carries, one is what independence does to Cov (L2) ②Cov multiplies an X-unit by a Y-unit; independent ⇒ product rule exact ⇒ 0 ③**X × Y**; **0** (#2).

**`cov4-bet` (byOption):**
- "12 — the covariance is the correlation" → *"That's the raw covariance, still carrying units of X×Y — and ρ must be in [−1,1], so a bare 12 can't be one. ρ=Cov/(σ_Xσ_Y)."* (false)
- "12/34 — divide by the variances added" → *"You divided by Var(X)+Var(Y)=34. ρ divides by the *product of SDs* √(9·25)=15, not the sum of variances."* (false)
- "4/5 — Cov over √(Var·Var)" → *"Divide by the product of SDs to strip units: 12/√225=12/15=4/5 (#5)."* (true)

**`cov4-win` (golden 4/5):** correct: "ρ=12/√(9·25)=12/15=4/5 — product of SDs strips the units, lands in [−1,1]." Hints ①divide Cov by the *product of SDs*, not anything you add ②σ_X=3, σ_Y=5 ⇒ denom √225=15, not 9+25=34 ③12/15=**4/5** (#5). Per-mistake **`12`** *"Raw Cov, still in X×Y units — and outside [−1,1]. Divide by 15: 4/5."* · **`12/34`** *"Divided by the sum of variances; ρ divides by the product of SDs, 15."*

**`cov4-interleave` (golden: the converse trap):** correct: "Independence *defines* itself by the joint factoring (multiply); Cov=0 is strictly weaker and doesn't buy that." Hints ①independent likelihoods do one thing; Cov=0 is weaker — one direction only ②independent ⇒ factors ⇒ multiply ⇒ Cov=0; but Cov=0 kills only a *linear* trend (X/X²) ③independent ⇒ **multiply**; **Cov=0 does NOT ⇒ independent** (#7).

**`cov4-mastery` Part A (golden ρ²=1/2):** correct: "We grade ρ²=1/2 here; ρ itself is 1/√2 (irrational), so the exact-rational object is its square." Hints ①ρ here is irrational → display-only; the gradeable object is one step away (always rational) ②ρ=1/√2 (shown for reference); square it → ρ²=1/2; enter ρ², not ρ ③ρ²=**1/2** (#4). **Per-mistake `1/√2`/`0.707`/`0.71` (most likely — the wrong OBJECT):** *"Your math is right — ρ really is 1/√2≈0.707. But that's the **wrong object**: ρ here is irrational, so this beat grades **ρ²**, which is rational. Square it: ρ²=1/2. We never grade a float ρ on this lesson."* (route as the level-2 method hint; consider a `byPattern` on `1/√2`/`0.707` if the grader supports keying wrong strings, so the diagnosis fires immediately.)

**`cov4-mastery` Part B (goldens Cov=0, ρ=0; dependent):** correct: "Cov(X,X²)=0 and ρ=0, yet Y=X² is computed from X — completely dependent. Zero correlation ≠ independence." Hints ①compute Cov by symmetry (0); then ask: does Cov=0 force independence? ②symmetric X ⇒ E[X]=E[X³]=0 ⇒ Cov=E[X³]−0=0, ρ=0; but Cov=0 kills only *linear* association — X²'s tie to X is curved ③Cov=**0**, ρ=**0** — yet fully dependent (#7). **Per-mistake "independent" pick** (brief's verbatim copy kept): *"Cov=0 only says no linear trend. But Y=X² is computed from X: tell me X and I'll tell you Y exactly — the strongest dependence there is. Independence ⇒ Cov=0, but the arrow does not reverse. Cov(X,X²)=0, ρ=0 (#7), yet X,Y completely dependent. Zero correlation is not independence."*

## Build decomposition (Technical Planner — for Dept 3)
- **Engine fns:** `rhoSquared(cov,varX,varY): Rational` → 1/2 (always rational); `rho(cov,varX,varY): RhoResult` → `{kind:'rational',rho:4/5}` (#5) and `{kind:'irrational',rhoSquared:1/2,display:'1/√2'}` (#4); `covariance(joint): Rational` → 0 (#7). `RhoResult` is the display-only escape (mirrors `optimalStopping.ratToNumber`).
- **Schema variant:** `covarianceBoard scatter` (existing member). **No `answerEntry`/`masteryChallenge` change** (option b).
- **Renderer/widget + props:** `CovarianceBoardBeat.tsx` → `ScatterDisplay` (raw + standardized panels, authored points, scale slider). `cov4-mastery` standard `masteryChallenge` (ρ² field + Part B Cov/ρ + a dependent/independent chip). `cov4-explore` headline `"1/2"` (ρ², `task:'rhoSquared'`).
- **Fixture fields:** `cov4-explore` authored `joint`/points + `task:'rhoSquared'`, `headline:"1/2"`; `cov4-win` accept `["4/5","0.8",".8"]`; `cov4-mastery` accepts `["1/2","0.5",".5"]` (ρ²), `["0"]` (Cov), `["0"]` (ρ). **Forbidden in accept anywhere:** `0.707`, `0.71`, `1/√2`.
- **Validation anchors:** `rhoSquared → 1/2`; `rho → 4/5` (rational kind); `covariance → 0`. ρ=1/√2 explicitly excluded from every anchor (display-only).

## Definition-of-Ready checklist
| beat | verified+sourced | concrete mechanic | feedback + 3-level hints | a11y |
|---|---|---|---|---|
| cov4-recall | ✅ #2 | ✅ grid | ✅ | ✅ |
| cov4-bet | ✅ #5 | ✅ choice+refute | ✅ byOption | ✅ |
| cov4-explore | ✅ #5/#4 | ✅ predict→stretch raw vs standardized (genuine; breaks the wrong intuition) | ✅ ungraded reveal | ✅ |
| cov4-model | ✅ #4 | ✅ triplet (+ρ=1/√2 prose) | ✅ | ✅ |
| cov4-win | ✅ #5 (4/5) | ✅ type-in | ✅ ladder+per-mistake | ✅ |
| cov4-interleave | ✅ #7/Bayes-L3 | ✅ grid | ✅ | ✅ |
| cov4-mastery | ✅ #4/#7 (ρ²=1/2; 0,0) | ✅ two-part; ρ² graded, ρ display-only | ✅ ladder + wrong-object + converse-trap | ✅ |
| cov4-recap | ✅ | ✅ | ✅ | ✅ |

**DoR holds for all L4 beats.**
