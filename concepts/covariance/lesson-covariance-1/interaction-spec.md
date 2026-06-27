# Interaction Spec — `lesson-covariance-1`: Spread: Variance & Standard Deviation

> Stage-2 Dept-2 (Interactive Experience / Design). Design-only — NO production code.
> Reads `brief.md`, `../concept-brief.md`, `../source-dossier.md`. Anchors every graded field to an
> exact-rational dossier value. New-type surface: this lesson uses **no `covarianceBoard`** — the
> explore beat reuses the shipped `expectationScale` (1-D balance beam). Golden: Var(die)=**35/12**.

## Concept-level decisions carried into this lesson
- **`covarianceBoard` display-mode set (frozen for the whole concept):** `jointPmf` (L2, L4-read, L6),
  `scatter` (L4-explore, L6-explore), `corrVectors` (L5). **`ellipse` is DROPPED** (decorative; L4's
  scale-invariance is better shown by raw-vs-standardized `scatter`). L1 + L3 use **no** new mode.
- **Exact-rational contract:** the only graded quantities are rationals (Var=35/12, E[X²]=91/6). SD=√(35/12)
  is irrational → **display-only text, never graded** (no float ever enters an `accept` list).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `cov1-recall` | tap/drag-match two pairs: `E[X], fair die → 7/2`; `EV said "___ is next" → the spread (variance)` | `retrievalGrid` | REUSE | correct: "E[X]=7/2 is the balance point; the spread around it is variance." Hints: ①both came from EV (the die mean + the "coming next" promise) ②(1+…+6)/6; EV closed promising a spread number ③**7/2**; the spread = **variance** | tap-and-tap primary path (drag is enhancement); `role="status"` aria-live mirror; reduced-motion commits without animation | no motion; match-snap only | both |
| 2 | `cov1-bet` | choose: which game is riskier (same $5 mean, one fixed, one 0/$10)? | `prediction` (byOption) | REUSE | byOption refutations (below); ungraded productive-failure bet | `role=radiogroup`/`radio`, `aria-checked`; tap/keyboard native | none | both |
| 3 | `cov1-explore` | **place each weight; the fulcrum (E[X]) stays pinned at 7/2 while a live SPREAD element grows.** Manipulate: tap outcome circles to place P(x); choose a narrow {3,4} vs wide {0,7} set (both centered on 7/2). Respond: each placed weight drops a **squared-deviation tile** (side=\|x−7/2\|) onto the axis + a horizontal **spread-span bar** widens; the `variance` readout labels the visible spread. Loop: swap narrow↔wide, watch Var change while the fulcrum doesn't move. | `expectationScale` | REUSE (+author spread element; see Build §) | ungraded hero; correct on all-placed: "Same balance point, different spread — that's variance." | SVG circles `role=button tabIndex=0`, Space/Enter/+/−/Arrow keys; 44px (r=22); `aria-live aria-atomic` readout `E[X]=7/2 · Var=35/12`; reduced-motion seeds all weights + final spread frame | fulcrum slide `transform var(--dur-slow) var(--ease-out)`; spread-span + tiles grow on `--dur-base`; reduced-motion → final frame | both |
| — | `cov1-primer-square` | JIT tap micro-primer: "E[X²] ≠ E[X]²" | `primer` (`variant:'custom'`, `collapsible`) | REUSE | — | tap to expand; no motion | collapsible card | **A** (`required:false`) |
| 4 | `cov1-model` | reveal three lenses converging on the variance formula; introduces `Var(X)` | `tripletReveal` (`introducesSymbol Var(X)`, `groundedBy cov1-win`) | REUSE | converge line: "Var = E[X²] − E[X]²." | tap `aria-expanded`; `role=status` converge line; no motion | card reveal | both |
| 5 | `cov1-win` | type Var given both inputs (E[X²]=91/6, E[X]²=49/4) → one subtraction | `answerEntry` | REUSE | golden **35/12**; per-mistake + 3-level ladder (below) | input `aria-label`, Enter submits, no motion | none | both |
| 6 | `cov1-mastery` | derive E[X²] from the pmf, THEN return Var (full pipeline) | `masteryChallenge` (`required`, `density:split` on A) | REUSE | goldens E[X²]=**91/6**, Var=**35/12**; ladder (below) | per-field `aria-label`; Enter; no motion | none | both |
| 7 | `cov1-recap` | recap: variance = spread²; SD = spread; next, two variables | `recap` (`required`) | REUSE | — | `role=radiogroup`; reveal reduced-motion-guarded | reveal | both |

## New interaction types (for Wave 0)
**None.** L1 reuses `expectationScale` (schema lines 413-423) unchanged in its Zod shape. The only build delta
is an **additive `variance(pmf)` readout + a spread-span/squared-deviation render layer** inside
`ExpectationScaleBeat.tsx` (no schema change; `outcomes[{x,weight?}]` already carries everything).
SD stays display-only prose. **No `covarianceBoard` in L1.**

## Feedback + hint ladders (graded beats)

**`cov1-bet` (`prediction`, byOption):**
- "Same mean ⇒ same risk" → *"Let's test it — both average $5, but the coin-flip game can pay $0 or $10. Same balance point, very different spread. We need a second number."* (false)
- "The fixed-$5 game is riskier" → *"Let's test it — backwards: a guaranteed $5 has zero spread. The 0/$10 game is the volatile one."* (false)
- "The 0/$10 game is riskier — bigger spread" → *"Good instinct — equal means, but spread around the mean differs. That spread is what variance measures."* (true)

**`cov1-win` (`answerEntry`, golden 35/12; accept `["35/12"]`):**
- correct: "Yes — Var = E[X²] − E[X]² = 35/12. Spread around the mean, not from zero."
- hints: ①variance needs two pieces — mean-of-squares and square-of-mean; you have both ②E[X²]=91/6, E[X]²=49/4; over 12 and subtract — don't stop at 91/6 ③182/12 − 147/12 = **35/12** (#1)
- per-mistake: **`91/6`** (most likely, stops at E[X²]) *"That's the raw second moment — spread from zero. Subtract E[X]²=49/4: 91/6−49/4=35/12."* · **`49/4`** *"You squared the average instead of averaging the squares. That's the term you subtract, not the answer."* (route into level-2 method hint)

**`cov1-mastery` (`masteryChallenge`, goldens E[X²]=91/6 accept `["91/6"]`, Var=35/12 accept `["35/12"]`):**
- correct: "Nailed both — built E[X²]=91/6 from the pmf, then subtracted to 35/12."
- hints: ①two steps: build mean-of-squares yourself, then apply the definition ②E[X²]=(1²+…+6²)/6=91/6; Var=91/6−49/4; keep squared units — don't take a root ③E[X²]=**91/6**, Var=**35/12** (#1). (SD=√(35/12)≈1.71 is display-only.)
- per-mistake: **reporting `35/12` as SD** *"35/12 is the variance — spread in squared units. SD is its root √(35/12)≈1.71, irrational, so we grade the variance. Don't take the √."* · **`91/6` for Var** *"91/6 is E[X²], the value you just built — still owe the −49/4 subtraction."*

## Build decomposition (Technical Planner — for Dept 3)
- **Engine fns used (`src/engine/covariance.ts`):** `variance(pmf: Pmf): Rational` → 35/12; `expectedValueX2(pmf): Rational` → 91/6. Both reuse `expectation.expectedValue` + the `automaton.ts` rational toolkit (plain-number `Rational`; overflow-safe — worst intermediate ≈760 « MAX_SAFE_INTEGER).
- **Schema variant:** none new. `expectationScale` unchanged.
- **Renderer/widget + props:** `ExpectationScaleBeat.tsx` (existing) + additive spread layer — props from `interaction.outcomes` (author a fixed-fulcrum pmf) and a derived `variance(activePmf)` readout. New CSS `escale__spread-span`, `escale__sqdev-tile` (token-only, `--dur-base`/`--ease-out`). DOM/SVG, no Konva.
- **Fixture fields:** `cov1-explore` authors `outcomes` centered on 7/2; `cov1-win` accept `["35/12"]`; `cov1-mastery` accepts `["91/6"]`,`["35/12"]`. **No `headline`** (no covarianceBoard).
- **Validation anchors:** `variance → 35/12`, `expectedValueX2 → 91/6`.

## Definition-of-Ready checklist (every beat)
| beat | verified+sourced problem | concrete interactive mechanic | instant feedback + 3-level hints | a11y covered |
|---|---|---|---|---|
| cov1-recall | ✅ #1 (7/2; EV promise) | ✅ matching grid | ✅ | ✅ |
| cov1-bet | ✅ (motivating, ungraded) | ✅ choice + refutations | ✅ byOption | ✅ |
| cov1-explore | ✅ #1 (Var=35/12) | ✅ place weights → spread grows (real direct-manipulation; fulcrum pinned) | ✅ (ungraded correct line) | ✅ |
| cov1-model | ✅ #1 | ✅ triplet reveal | ✅ | ✅ |
| cov1-win | ✅ #1 (35/12) | ✅ type-in | ✅ ladder + per-mistake | ✅ |
| cov1-mastery | ✅ #1 (91/6, 35/12) | ✅ derive-then-apply | ✅ ladder + per-mistake | ✅ |
| cov1-recap | ✅ | ✅ recap | ✅ | ✅ |

**DoR holds for all L1 beats.**
