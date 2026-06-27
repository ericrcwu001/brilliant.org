# Interaction Spec — `lesson-covariance-3`: Variance of a Sum: The Cross Term

> Stage-2 Dept-2. Design-only. **Flagged-beat resolution (cov3-explore):** use the **two-bar
> comparison** reusing the shipped **`slider`** type — NOT `covarianceBoard scatter`. The gap between
> the bars IS 2Cov; scatter shows correlation, not the additive cross-term identity. Lower build cost,
> better interaction-fit, **consumes no `covarianceBoard` mode.** Goldens: Var(X₁+X₂)=**35/6**, Cov(X₁,S)=**35/12**.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `cov3-recall` | match: `linearity E[X+Y]=… → E[X]+E[Y], always`; `Var one die → 35/12` | `retrievalGrid` | REUSE | correct: "Expectation adds unconditionally; one die has Var=35/12 (L1)." Hints ①one is the EV-L2 *unconditional* rule, one is L1's die variance ②linearity never needs independence; Var=91/6−49/4 ③**E[X]+E[Y], always**; **35/12** | tap-and-tap; aria-live | match-snap | both |
| 2 | `cov3-bet` | choose: does Var of a sum add as cleanly as expectation? | `prediction` (byOption) | REUSE | byOption (below); productive-failure bet | radiogroup | none | both |
| 3 | `cov3-explore` | **two-bar comparison.** Manipulate: drag a **Cov slider** over an integer-stepped rational domain (clamped to \|Cov\|≤√(VarX·VarY)). Respond: left **stacked bar Var(X)+Var(Y) stays fixed**; right **bar Var(X+Y)** grows/shrinks; the visible gap is a distinctly-colored band **labeled "= 2·Cov"** that flips side+sign as Cov crosses 0. Loop: drag to the **Cov=0 detent** → bars snap flush ("variances add cleanly"); drag ± → right bar over/undershoots by exactly 2Cov. Right bar STARTS at the independent (gap-zero) config, never pre-set to the answer. | `slider` | REUSE (existing `slider` type) | ungraded hero; readout `Var(X)+Var(Y)=35/6 · 2·Cov=n/d · Var(X+Y)=m/d` | native `<input type=range>` (full arrow-key support via `useSliderControl`); 44px thumb; `aria-live aria-atomic` readout; reduced-motion → bars at final heights, no tween | bars retween width% `--dur-base var(--ease-out)`; "2·Cov" band sign-colored (teal+/coral−, glyph+word); Cov=0 detent is the cinematic snap; reduced-motion final frame | both |
| — | `cov3-primer-bilinear` | JIT primer: "covariance splits over a sum; Cov(X,X)=Var(X)" | `primer` (`custom`, collapsible) | REUSE | — | tap-expand | collapsible | **A** (`required:false`) |
| 4 | `cov3-model` | three lenses → `Var(X+Y)=Var(X)+Var(Y)+2Cov`; contrast with clean linearity | `tripletReveal` (`introducesSymbol Var(X+Y)`, `groundedBy cov3-win`) | REUSE | converge: "Variances add cleanly only when Cov=0." | tap aria-expanded; status | reveal | both |
| 5 | `cov3-win` | type Var(X₁+X₂) for independent dice (Cov=0 carried from L2) | `answerEntry` | REUSE | golden **35/6** accept `["35/6"]`; ladder (below) | input aria-label; Enter | none | both |
| 6 | `cov3-mastery` | Cov(X₁,S) via bilinearity = Var(X₁)+Cov(X₁,X₂) = 35/12 (the part-correlates-with-the-whole) | `masteryChallenge` (`required`, `density:split` on A) | REUSE | golden **35/12** accept `["35/12"]`; ladder + the sharp `0` distractor (below) | per-field aria-label; Enter | none | both |
| 7 | `cov3-recap` | recap: variances add only when Cov=0; next, a unit-free score | `recap` (`required`) | REUSE | — | radiogroup | reveal | both |

## New interaction types (for Wave 0)
**None.** L3 reuses the shipped `slider` (schema lines 154-159). The two-bar render is a thin layer over the
slider value (Bar A = `varX+varY`, Bar B = `varianceOfSum(varX,varY,cov)`); reuses `chainboard-*` bar-track CSS.
**No `covarianceBoard` mode consumed by L3** — keeping the new-type surface minimal.

## Feedback + hint ladders

**`cov3-bet` (byOption):**
- "Always, just like expectation adds" → *"Linearity adds with no fine print, but variance picks up a 2Cov(X,Y) cross term. It matches the naive sum only when Cov=0 — true here, but for a reason, not by default."* (false)
- "Never — variances can't be added" → *"Too pessimistic. Var(X+Y)=Var(X)+Var(Y)+2Cov always holds; independent ⇒ cross term 0 ⇒ they add to 35/6 (#2)."* (false)
- "Here yes, because these dice are independent (Cov=0)" → *"The cross term is 0 only because of independence. 35/12+35/12=35/6 (#2)."* (true)

**`cov3-win` (golden 35/6):** correct: "Var(X+Y)=Var(X)+Var(Y)+2Cov; independence kills the cross term, so 35/12+35/12=35/6." Hints ①sum's variance = two variances + cross term; recall Cov for *independent* dice ②each Var=35/12; Cov=0 drops 2Cov; add — don't report one, don't multiply ③35/12+35/12=70/12=**35/6** (#2). Per-mistake **`35/12`** *"That's one die — you're summing two: 35/12+35/12=35/6."* · **`1225/144`** *"You multiplied the variances. Variance of a sum *adds* (plus 2Cov): 35/6."*

**`cov3-mastery` (golden 35/12):** correct: "Cov(X₁,S)=Cov(X₁,X₁)+Cov(X₁,X₂)=Var(X₁)+0=35/12 — the part correlates with the whole because the whole contains it." Hints ①S contains X₁; split Cov(X₁,X₁+X₂) before reaching for "independent so 0" ②=Var(X₁)+Cov(X₁,X₂); dice independent ⇒ Cov(X₁,X₂)=0 but Cov(X₁,X₁)=Var(X₁)=35/12 survives ③**35/12** (#3). Per-mistake **`0`** (the diagnostic distractor) *"X₁,X₂ are independent, but S isn't a stranger to X₁ — it contains it. Cov(X₁,X₁)+Cov(X₁,X₂)=Var(X₁)+0=35/12. A variable always covaries perfectly with itself; that term never vanishes."*

## Build decomposition (Technical Planner — for Dept 3)
- **Engine fns:** `varianceOfSum(varX, varY, cov): Rational` → 35/6; `covBilinear(varX, covXY): Rational` → 35/12. Plain-number `Rational`.
- **Schema variant:** none new — reuse `slider` (`min/max/step`).
- **Renderer/widget + props:** `SliderBeat.tsx` (existing) + a two-bar render layer (Bar A fixed `varX+varY`, Bar B `varianceOfSum`, "2·Cov" band). New CSS `covbars-*` (or reuse `chainboard-dist__*`), token-only, DOM/SVG, no Konva. `cov3-win`/`cov3-mastery` are standard `answerEntry`/`masteryChallenge`.
- **Fixture fields:** slider `min/max/step` spanning the valid Cov range with a 0 stop; `cov3-win` accept `["35/6"]`; `cov3-mastery` accept `["35/12"]`. No `headline` (no covarianceBoard).
- **Validation anchors:** `varianceOfSum → 35/6`, `covBilinear → 35/12`.

## Definition-of-Ready checklist
| beat | verified+sourced | concrete mechanic | feedback + 3-level hints | a11y |
|---|---|---|---|---|
| cov3-recall | ✅ #1/#2 | ✅ grid | ✅ | ✅ |
| cov3-bet | ✅ #2 | ✅ choice+refute | ✅ byOption | ✅ |
| cov3-explore | ✅ #2 | ✅ slider → bars; gap=2Cov, Cov=0 detent (real direct-manipulation) | ✅ ungraded readout | ✅ |
| cov3-model | ✅ #2 | ✅ triplet | ✅ | ✅ |
| cov3-win | ✅ #2 (35/6) | ✅ type-in | ✅ ladder+per-mistake | ✅ |
| cov3-mastery | ✅ #3 (35/12) | ✅ bilinearity | ✅ ladder + diagnostic `0` | ✅ |
| cov3-recap | ✅ | ✅ | ✅ | ✅ |

**DoR holds for all L3 beats.**
