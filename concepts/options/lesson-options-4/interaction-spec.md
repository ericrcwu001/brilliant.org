# Interaction Spec — `lesson-options-4`: One-Step Binomial: Price by Replication  ★ marquee

> Stage-2 Dept-2. Design-only — NO production code, NO fixtures, NO engine. **New-type surface:**
> `optionBoard display:'binomialTree'` (Wave-0 new union member; 4 displays folded under one
> discriminated-union entry). **Key goldens (exact-rational; engine-reproducible):** q=**1/2**
> (#13, #14); call price=**10** (#13); put price=**10** (#16); Δ=**1/2** / B=**−40** (#13);
> Δ=**−1/2** / B=**+60** (#16); parityGap=**0** (#16). **The marquee:** q is a
> **no-arbitrage weight** `(R−d)/(u−d)` — not the real up-probability p and not a Bayes
> posterior; the option price is determined entirely by replication, without ever knowing p.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `opt4-recall` | match: `E[X]=Σx·P(x) is the fair price of a → bet`; `Weight each outcome by its → probability`; `Fair die: E[X] → 7/2` | `retrievalGrid` | REUSE | correct + hints (below) | tap-and-tap; `aria-live` | match-snap | both |
| 2 | `opt4-bet` | tap one of 3 options: "The stock is 100. In one step it goes to 120 or 80. A call struck at 100 pays 20 or 0. Which probability do you weight the payoffs by to price it?" | `prediction` (byOption, **no `gate`**) | REUSE | byOption — 3-way (below) | radiogroup 44px | none | both |
| 3 | `opt4-explore` | **★ HERO — `binomialTree`.** Manipulate: tap the up-node (S=120) or down-node (S=80) in the rendered one-step lattice. Respond instantly: node highlights; side panel reads S (engine: S₀·u or S₀·d), q-weight=1/2 (`riskNeutralQ`), rolled-back option value C_u=20 or C_d=0 (`callPayoff` at terminal), and the replicating portfolio `{Δ=1/2, B=−40}` (`replicate`). Tap **"Reveal hedge cost"** → `hedge cost = ½·100 − 40 = 10 = price` lands at the root (engine `binomialPrice`). Loop: tap the other branch; side panel updates; price 10 stays pinned at root. | `optionBoard display:'binomialTree'` (`interactive:true`) | **NEW** | ungraded; post-reveal: "The cost of the hedge *is* the price — regardless of which branch." | node tap-targets: ≥44px transparent circular overlay; primary tap-and-tap; keyboard Tab→Enter/Space selects node, Arrow keys switch nodes; one `aria-live="polite" aria-atomic`: e.g. "Up node: S 120 · q-weight 1/2 · option value 20 · delta 1/2 · bond negative 40"; after reveal: "Hedge cost: 1/2 times 100 minus 40 equals 10. Price equals 10."; `role=status` readout strip; decorative SVG `aria-hidden`; sign conveyed by text label never color-only; reduced-motion → final frame (tree + side panel + reveal statically shown) | SVG lattice `aria-hidden`; node-tap side-panel appear `--dur-base`; rollback sparkle root→nodes `--dur-slow`; hedge-cost reveal `--dur-tell` slow-first; compositor-only (transform/opacity); reduced-motion: final frame static | both |
| 4 | `opt4-model` | tap to expand three lenses: ① `q=(R−d)/(u−d)` (the weight, not p); ② replication: `Δ=(V_u−V_d)/(S(u−d))`, `B=price−Δ·S`; ③ discount: `price=(1/R)·E_q[payoff]`. Carries one faded worked example on **#15** (q=3/5 — *worked-example only; never an accept*). | `tripletReveal` (`introducesSymbol:"q=(R−d)/(u−d)"`, `groundedBy opt4-win`) | REUSE | ungraded; note "q=3/5 for #15 — change u,d,R and q moves" | tap `aria-expanded`; `role=status` | reveal | both |
| 5 | `opt4-win` | type q for the canonical #13 tree (u=6/5, d=4/5, R=1 given; inputs displayed) | `answerEntry` | REUSE | golden **1/2**, accept `["1/2","0.5",".5"]`; `density:'split'`, `assist.prefillToLastTerm`; 3-level ladder (below) | `input aria-label`; Enter submits | none | both |
| 6 | `opt4-gate` | **THE MARQUEE which-method gate** (label-stripped: "A stock at 100 moves to 120 or 80 in one step; R=1. A call struck at 100 pays 20 or 0. Which method gives its arbitrage-free price?"). Tap one of 4 options. | `prediction` (`gate:{kind:'which-method', correct:'risk-neutral-pricing'}`, required) | REUSE | byOption — 4-way marquee (below) | radiogroup 44px | none | both |
| 7 | `opt4-compare` | match: `{r=0 tree (u=6/5,d=4/5): q → "1/2"}`; `{r=0 tree: call price → "10"}`; `{r=1/4 tree (u=7/4,d=3/4): q → "1/2"}`; `{r=1/4 tree: call price → "30"}`; `{What is the same in both? → "discounted E_q (never the real odds)"}` | `retrievalGrid` (required) | REUSE | correct + hints (below) | tap-and-tap; `aria-live` | match-snap | both |
| 8 | `transfer-heldout` | 4-field mastery: price the **PUT** on the #13 tree (#16) — type price, Δ, bond B, parity gap. `heldOut:true, required:false, track:'B'`. | `masteryChallenge` (`heldOut:true, required:false, density:'split'`) | REUSE | goldens price **10**, Δ **−1/2**, B **+60**, parity **0**; 3-level ladder + sign-refutation (below) | per-field `aria-label`; Enter | none | B |
| 9 | `opt4-mastery` | **Required mastery (split):** 4 fields on #13 — q (prefilled from opt4-win), price, Δ, bond B; then "hedge cost = ½·100 − 40 = 10 = price" reveal. `density:'split'`, `assist`+`hintCapOverride`; ladder price → Δ → B. | `masteryChallenge` (required, `density:'split'`) | REUSE | goldens q **1/2**, price **10**, Δ **1/2**, B **−40**; 3-level ladders + B=+40 sign-error + E_p refutations (below) | per-field `aria-label`; Enter | none | both |
| 10 | `opt4-recap` | recap: q is a no-arb weight, not p, not a posterior; price = hedge cost = (1/R)·E_q; next → multi-step trees (L5). | `recap` (required) | REUSE | — | tap to advance | reveal | both |

---

## New interaction types (for Wave 0)

`optionBoard` is the **single new discriminated-union member** for the whole `course-options` concept. Four `display` modes are folded under it — `payoffDiagram` (L1, L3, L6), **`binomialTree`** (L4, L5, L6), `parityScale` (L2), `greeksSlider` (L5, L6) — exactly mirroring the `covarianceBoard` / `chainBoard` / `stoppingBoard` precedent.

- **NOT graded, NOT a `HERO_TYPE`.** The HERO designation arrives via `beat.hero:true` + the `headline` field (the engine-reproducible validation anchor). All graded reads use `answerEntry` / `masteryChallenge` exclusively.
- `headline` is the validation anchor: `validate-fixtures` cross-checks it against the engine golden (skip `greeksSlider` — display-only; exempt from validation).

### `binomialTree` props (Wave-0 FROZEN; used in `opt4-explore`)

```ts
{
  type: 'optionBoard',
  display: 'binomialTree',
  tree: {
    S0:  { n: 100, d: 1 },
    u:   { n: 6,   d: 5 },   // 6/5
    d:   { n: 4,   d: 5 },   // 4/5
    R:   { n: 1,   d: 1 },   // r = 0
    K:   { n: 100, d: 1 },
    n:   1,
    kind: 'call',
  },
  interactive: true,
  headline: "10",             // engine: binomialPrice(100, 6/5, 4/5, 1, 100, 1, 'call') = 10
}
```

Prop contract for `binomialTree`:
- `tree.{S0, u, d, R, K, n, kind}` — all rationals as `{n, d}` integers except `n` (integer steps). For n=1 (this lesson): **no prop gap.**
- `headline` — the engine-reproducible price string; `validate-fixtures` checks it against `binomialPrice`.
- `interactive` — when `true`, enables tap-a-node flow with side panel and reveal.
- Renderer computes all node values via `src/engine/options.ts` (greenfield Wave-0): `riskNeutralQ` for q-weight, `callPayoff`/`putPayoff` at terminal nodes, `replicate` for `{delta, bond}`, `binomialPrice` for the root price in the reveal.

---

## Feedback + hint ladders

### `opt4-recall` (goldens: `bet`; `probability`; `7/2`)

Correct: "E[X]=Σx·P(x) — weight each outcome by its probability, sum up; that's the fair price of any bet. (EV L1.)"

Hints ① one card asks what `E[X]` is the fair price of; one asks what you weight outcomes by ② `Σx·P(x)` multiplies each value by its probability — that's the weight; E[X] is the break-even price ③ **bet**; **probability**; **7/2** (#EV1).

### `opt4-bet` (byOption, ungraded — no `gate`)

- *"The real-world probability p that the stock rises"* → "Let's test it — but you were never told p. The astonishing result: the price doesn't depend on it. No-arbitrage forces a *different* weight `q=(R−d)/(u−d)` that replaces the real odds entirely (#13)." (false)
- *"A weight q computed from u, d, R (not p), then discounted"* → "Good instinct — price comes from replication / no-arbitrage. Here `q=(R−d)/(u−d)=1/2`, then discount by 1/R. The real p never appears (#13)." (true)
- *"50/50 — by symmetry the two outcomes are equally likely"* → "Let's test it — you land on 1/2, but for the wrong reason. It isn't symmetry of the real odds; it's `q=(R−d)/(u−d)`, which is 1/2 only for *this* tree. Change u, d, R and q moves — the q-drill gives 3/5 (#15)." (false — right number, wrong object)

### `opt4-win` (golden **1/2**; accept `["1/2","0.5",".5"]`)

Correct: "q=(R−d)/(u−d): (1−4/5)/(6/5−4/5) = (1/5)/(2/5) = **1/2**. The no-arb weight, not the real up-prob (#13)."

Hints ① q=(R−d)/(u−d); plug u=6/5, d=4/5, R=1 ② numerator: R−d=1−4/5=1/5; denominator: u−d=6/5−4/5=2/5 ③ (1/5)÷(2/5) = **1/2** (#13).

Per-mistake **stated real probability** (e.g. "0.6", "3/5"): *"That's a real-world up-probability — you were never told p for this tree. q=(R−d)/(u−d) is forced by no-arbitrage: (1−4/5)/(6/5−4/5)=1/2 (#13). The real odds never enter."*

Per-mistake **"1/2 by symmetry"** (right value, wrong object): *"Right number, wrong object. q=1/2 here because of the u, d, R values, not because the real odds are 50/50 — change the tree (#15) and q=3/5."*

### `opt4-gate` (THE MARQUEE — graded `risk-neutral-pricing`; label-stripped surface)

| option label | `optionMethod` | byOption refutation |
|---|---|---|
| **Risk-neutral pricing** | `risk-neutral-pricing` | **(correct)** "Discount the q-weighted payoff: q=(R−d)/(u−d)=(1−4/5)/(2/5)=1/2, then price=(1/1)·(1/2·20+1/2·0)=10. q comes from no-arbitrage, not the real odds — that's why you never needed p (#13)." |
| Linearity / indicators | `linearity-indicators` | **"price = the (undiscounted) expected payoff under p"** → "Linearity of expectation under the *real* p doesn't price an option — that's the marquee trap. You must use the no-arbitrage weight q **and** discount by 1/R. Averaging 20 and 0 under real odds is not the arbitrage-free price (#13)." |
| Conditioning | `conditioning` | **"it's just a first-step conditional average"** → "Conditioning on the first step has the right *shape*, but only the **q-weighted, discounted** version is arbitrage-free. A plain conditional average under p still smuggles in the real odds (#13)." |
| Prior update | `prior-update` | **"q is a Bayesian posterior / an updated belief"** → "There is no prior and no evidence here. q is a **change of measure forced by no-arbitrage**, not Bayes' rule — you solve `(R−d)/(u−d)`, not Bayes' theorem. (The continuity report flags this exact false-analogy; #13.)" |

All four `optionMethods` are verified ⊂ `CONFUSABLE['risk-neutral-pricing']` per `concept-brief.md` methods table. No random distractor.

### `opt4-compare` (goldens: q=1/2 on both trees; price=10 / price=30; "discounted E_q")

Correct: "Discounted E_q — the same formula regardless of r. q=(R−d)/(u−d) absorbs the interest rate; the real odds never enter. Method invariant across costumes (#13, #14)."

Hints ① plug each tree's u, d, R into q=(R−d)/(u−d) — what do you get for both? ② #13: q=(1−4/5)/(2/5)=1/2, price=(1/1)·(1/2·20+1/2·0)=10; #14: q=(5/4−3/4)/(7/4−3/4)=1/2, price=(4/5)·(1/2·75+1/2·0)=30 ③ both trees use **discounted E_q** — the real odds never enter (#13, #14).

### `transfer-heldout` (put on #13 tree — #16; goldens price **10**, Δ **−1/2**, B **+60**, parity **0**)

Correct: "Same q-method, opposite payoffs: put pays P_u=0 up, P_d=20 down. q=1/2, price=(1/2·0+1/2·20)/1=**10**; Δ=(P_u−P_d)/(S(u−d))=(0−20)/40=**−1/2**; B=price−Δ·S=10+50=**60**; parity C−P=10−10=0=S−K ✓ (#16)."

Hints for Δ ① for a put Δ<0 — short the stock to hedge downside ② Δ=(P_u−P_d)/(S(u−d))=(0−20)/(100·2/5)=−20/40 ③ Δ=**−1/2** (#16).

Hints for B ① B=price−Δ·S; with Δ<0, B>0 (long the bond, not borrowed) ② B=10−(−1/2)·100=10+50 ③ B=**60** (#16).

Per-mistake **B=−60 (sign error)**: *"Sign error: Δ is negative here (short stock to hedge), so B=price−Δ·S=10−(−1/2)·100=10+50=**+60** (positive — long bond). Opposite sign to the call's B=−40. Parity confirms: C−P=10−10=0=S−K ✓ (#16)."*

Per-mistake **Δ=+1/2 (copied call formula)**: *"Sign flip: a put moves opposite to the stock. Δ=(P_u−P_d)/(S(u−d))=(0−20)/40=**−1/2** — the negative sign means short-selling stock to hedge (#16)."*

### `opt4-mastery` (goldens q **1/2**, price **10**, Δ **1/2**, B **−40**; `density:'split'`)

Correct: "Replication and the q-measure agree: q=1/2 by no-arbitrage, price=(1/1)·(1/2·20+1/2·0)=10, hedge cost=½·100−40=10=price. The real odds never entered (#13)."

Hints for price ① price=(1/R)·(q·C_u+(1−q)·C_d); q=1/2 prefilled, C_u=20, C_d=0 ② (1/1)·(1/2·20+1/2·0) = 1/2·20 ③ **10** (#13).

Hints for Δ ① Δ=(C_u−C_d)/(S·(u−d)) ② (20−0)/(100·(6/5−4/5)) = 20/40 ③ **1/2** (#13).

Hints for B ① B=price−Δ·S ② 10−(1/2)·100=10−50 ③ **−40** (#13).

Per-mistake **B=+40 (sign error)**: *"Sign error — the bond is borrowed (short bond). B=price−Δ·S=10−½·100=10−50=**−40**. Hedge cost = ½·100+(−40)=50−40=10=price ✓ (#13)."*

Per-mistake **price=E_p (uses a stated real probability)**: *"You used the real probability, not q. The engine can't verify E_p — you were never told p. Price=(1/R)·E_q=(1/1)·(1/2·20+1/2·0)=10 (#13). The real odds never enter."*

Per-mistake **price=E_q undiscounted (forgets 1/R)**: *"You computed E_q but forgot the 1/R discount. For this tree R=1 so the price is still 10 — but when R≠1 (#14) the discount matters: price=(1/R)·E_q."*

---

## Build decomposition (Technical Planner — for Dept 3)

### Engine functions (`src/engine/options.ts` — greenfield Wave-0; does not exist yet)

| function | signature | golden (cite) | anchor |
|---|---|---|---|
| `riskNeutralQ` | `(u,d,R: Rat) → Rat` | `riskNeutralQ(6/5,4/5,1)=1/2` (#13); `riskNeutralQ(7/4,3/4,5/4)=1/2` (#14) | graded accept `opt4-win`/`opt4-mastery` q=1/2; `opt4-compare` q=1/2 both trees |
| `binomialPrice` | `(S,u,d,R,K: Rat, n:int, kind) → Rat` | `binomialPrice(100,6/5,4/5,1,100,1,'call')=10` (#13); `binomialPrice(100,6/5,4/5,1,100,1,'put')=10` (#16); `binomialPrice(100,7/4,3/4,5/4,100,1,'call')=30` (#14) | graded accepts price=10/30; `headline:"10"` on `opt4-explore` |
| `replicate` | `(S,u,d,R,K: Rat, kind) → {delta:Rat; bond:Rat}` | `replicate(100,6/5,4/5,1,100,'call')={delta:1/2,bond:−40}` (#13); `replicate(100,6/5,4/5,1,100,'put')={delta:−1/2,bond:60}` (#16) | graded accepts Δ=1/2/−1/2, B=−40/60; side-panel display in `opt4-explore` |
| `parityGap` | `(C,P,S,K,D: Rat) → Rat` | `parityGap(10,10,100,100,1)=0` (#16) | graded accept parity=0 in `transfer-heldout` |

All inputs and outputs exact rationals. CRR `u=e^(σ√Δt)` **REJECTED** as a graded input — u, d, R enter as given rationals. Black-Scholes is L5 display-only — **never an accept.**

**#15 q=3/5 is a worked example only — NEVER an accept.** `riskNeutralQ(3/2,1/2,11/10)=3/5` appears only in `opt4-model` `tripletReveal` prose. Do not place it in any `accept` list, `headline`, or graded field.

**`BigRational {n:bigint;d:bigint}` ↔ `RationalSchema (z.number().int())` reconciliation flag:** `src/engine/options.ts` should use `BigRational` internally (as `optimalStopping.ts` / `combinatorics.ts` do) with a `ratToNumber` display escape — denominators grow as `5ⁿ` for multi-step trees. The fixture `RationalSchema = z.number().int()` is structurally mismatched. This is the **same flag covariance raised**; resolve once, shared, before either concept's `validate-fixtures` green.

### Schema variant

`optionBoard` (frozen Wave-0 union member; `concept-brief.md` schema-delta §"New interaction type"):

```ts
z.object({
  type: z.literal('optionBoard'),
  display: z.enum(['payoffDiagram', 'binomialTree', 'parityScale', 'greeksSlider']),
  tree: z.object({
    S0: RationalSchema, u: RationalSchema, d: RationalSchema,
    R: RationalSchema,  K: RationalSchema,
    n: z.number().int(), kind: z.enum(['call', 'put']),
  }).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),
  // legs, sigma, markS, labels — unused in binomialTree mode
})
```

`BeatView` dispatcher: add `case 'optionBoard': return <OptionBoardBeat {...props} />` in `src/lesson/beats/index.tsx`. Add `validate-fixtures` engine cross-check block for `headline` on `binomialTree` and `payoffDiagram` displays (skip `greeksSlider`).

### Renderer / widget

**`OptionBoardBeat.tsx`** (new component; mirrors `CovarianceBoardBeat.tsx` structure — one entry point dispatching to `display`-mode sub-components):

`BinomialTreeDisplay` sub-component for `display:'binomialTree'`:
- Renders an inline SVG one-step lattice (root node S₀=100, up-node S=120, down-node S=80) from `tree` prop.
- Each terminal node has a **transparent 44px circular tap-target overlay** (invisible visually; larger than the rendered node circle), mirroring the `CovarianceBoardBeat` 44px cell-button pattern.
- Keyboard: Tab brings focus to the tree widget; Arrow keys cycle between nodes; Enter/Space fires the tap action (focus ring on active node).
- State: `activeNode: 'up' | 'down' | null`. On node tap: set `activeNode`, compute side-panel values from engine.
- Side panel reads (all engine-computed from `tree` prop): S of the tapped node; q-weight (`riskNeutralQ(u,d,R)`); rolled-back option value (`callPayoff`/`putPayoff` at terminal); `{delta, bond}` from `replicate(S0,u,d,R,K,kind)`.
- **"Reveal hedge cost" button** — disabled until any node tapped; on click: shows `hedge cost = Δ·S₀ + B = price` step-by-step at the root. `--dur-tell` slow-first reveal.
- `aria-live="polite" aria-atomic="true"` mirror (`.sr-only`): narrates node state and hedge-cost reveal as plain English strings.
- `role="status"` readout strip: shows q, active-node option value, `{Δ, B}` as text (supplements the `aria-hidden` SVG).
- Sign of Δ/B conveyed by text label ("+" / "−") — **never color-only.**
- **Reduced-motion** (`reducedMotion` prop from `BeatProps`): render the final frame statically — tree fully drawn, side panel open with `{delta:1/2, bond:−40}`, reveal text visible; no CSS transitions or animations.
- Motion (when `!reducedMotion`): side-panel appear `transition: transform var(--dur-base) var(--ease-out)`; rollback sparkle `--dur-slow`; hedge-cost reveal `--dur-tell`; compositor-only properties (transform/opacity — not width/height/top/left).

### Fixture fields per beat

| beatId | key fixture fields | accept / headline |
|---|---|---|
| `opt4-recall` | `retrievalGrid` cards × 3 | right-cards exact-string: `"bet"`, `"probability"`, `"7/2"` |
| `opt4-bet` | `prediction` options × 3, `byOption` map | ungraded; **no `gate`**; no `accept` |
| `opt4-explore` | `optionBoard` `tree:{S0:100,u:6/5,d:4/5,R:1,K:100,n:1,kind:'call'}`, `interactive:true`, `headline:"10"` | `headline:"10"` ← `binomialPrice(100,6/5,4/5,1,100,1,'call')=10` (#13) |
| `opt4-model` | `tripletReveal` `introducesSymbol:"q=(R−d)/(u−d)"`, `groundedBy:"opt4-win"`; #15 prose | ungraded; q=3/5 in prose only — **never in `accept`** |
| `opt4-win` | `answerEntry`; `accept:["1/2","0.5",".5"]`; `density:'split'`; `assist:{prefillToLastTerm:true}` | `accept:["1/2","0.5",".5"]` (#13) |
| `opt4-gate` | `prediction` options × 4; `gate:{kind:'which-method',correct:'risk-neutral-pricing'}`; `optionMethods:['risk-neutral-pricing','linearity-indicators','conditioning','prior-update']`; `byOption` map | graded `schemaId:'risk-neutral-pricing'`; `required:true` |
| `opt4-compare` | `retrievalGrid` cards × 5 | right-cards: `"1/2"` (×2), `"10"`, `"30"`, `"discounted E_q (never the real odds)"` (#13,#14) |
| `transfer-heldout` | `masteryChallenge` fields × 4: price/Δ/B/parityGap; `heldOut:true`; `track:'B'`; `required:false`; `density:'split'` | price `["10"]`; Δ `["-1/2","−1/2","-0.5","−0.5"]`; B `["60","+60"]`; parity `["0"]` (#16) |
| `opt4-mastery` | `masteryChallenge` fields × 4: q/price/Δ/B; `required:true`; `density:'split'`; `assist:{prefillQ:'opt4-win'}`; per-field `hintCapOverride` | q `["1/2","0.5",".5"]` (prefilled); price `["10"]`; Δ `["1/2","0.5",".5"]`; B `["-40","−40"]` (#13) |
| `opt4-recap` | `recap` cards | ungraded |

**Exact-rational discipline:** every `accept` string is the engine-reproduced exact rational. `headline:"10"` is the engine integer. Decimal aliases `"0.5"` / `"-0.5"` are exact (IEEE-safe); `"3/5"` is **forbidden** in any `accept` (worked example only). No float is ever graded.

### Validation anchors

- `opt4-explore headline:"10"` ← `binomialPrice(100,6/5,4/5,1,100,1,'call')=10` (#13) ✓
- `opt4-win accept "1/2"` ← `riskNeutralQ(6/5,4/5,1)=1/2` (#13) ✓
- `opt4-compare "1/2"` (×2) ← `riskNeutralQ` #13 + #14 ✓; `"10"` ← `binomialPrice` #13 ✓; `"30"` ← `binomialPrice` #14 ✓
- `transfer-heldout price "10"` ← `binomialPrice(100,6/5,4/5,1,100,1,'put')=10` (#16) ✓
- `transfer-heldout Δ "-1/2"` ← `replicate(...,'put').delta=−1/2` (#16) ✓
- `transfer-heldout B "60"` ← `replicate(...,'put').bond=60` (#16) ✓
- `transfer-heldout parity "0"` ← `parityGap(10,10,100,100,1)=0` (#16) ✓
- `opt4-mastery` q `"1/2"`, price `"10"`, Δ `"1/2"`, B `"-40"` ← #13 ✓

All engine boxes currently ☐ (greenfield Wave-0); flip to ☑ once `src/engine/options.ts` ships and goldens pass `options.test.ts`.

---

## Definition-of-Ready checklist

| beat | verified+sourced (cite #) | concrete direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px/reduced-motion/aria-live) | graded carries schemaId + (capped) assist/hintCapOverride + density |
|---|---|---|---|---|---|
| `opt4-recall` | ✅ #EV1 | ✅ tap-and-tap grid (3 cards) | ✅ correct + 3-level ladder | ✅ | ✅ `linearity-indicators`; `density:'merged'`; 3-level hint ladder |
| `opt4-bet` | ✅ #13 | ✅ 3-option radiogroup tap | ✅ byOption 3-way | ✅ 44px radiogroup | n/a (ungraded, no `gate`) |
| `opt4-explore` | ✅ #13 | ✅ tap-node → side panel + reveal; genuine: breaks "hedge cost ≠ price" intuition by the learner's own tapping | ✅ post-reveal prose; ungraded | ✅ 44px overlay, aria-live narration, reduced-motion final frame | n/a (ungraded hero) |
| `opt4-model` | ✅ #13/#15 | ✅ tap-expand triplet (3 lenses) | ✅ ungraded reveal; #15 note | ✅ tap aria-expanded; role=status | n/a (ungraded) |
| `opt4-win` | ✅ #13 (q=1/2) | ✅ type-in + per-mistake refutation | ✅ 3-level ladder + 2 per-mistake | ✅ input aria-label | ✅ `risk-neutral-pricing`; `density:'split'`; `assist.prefillToLastTerm` |
| `opt4-gate` | ✅ #13 | ✅ 4-option which-method tap (label-stripped surface) | ✅ byOption 4-way marquee | ✅ 44px radiogroup | ✅ `risk-neutral-pricing`; `density:'merged'`; `gate.correct=='schemaId'` ✓ |
| `opt4-compare` | ✅ #13/#14 | ✅ tap-and-tap grid; two-tree comparison | ✅ correct + 3-level | ✅ aria-live | ✅ `risk-neutral-pricing`; `density:'merged'`; hint ladder |
| `transfer-heldout` | ✅ #16 (price=10, Δ=−1/2, B=60, parity=0) | ✅ 4-field mastery; fresh surface (put vs call + parity) | ✅ 3-level per field + sign refutations | ✅ per-field aria-label | ✅ `risk-neutral-pricing`; `density:'split'`; per-field `assist`; `heldOut:true track:'B' required:false` |
| `opt4-mastery` | ✅ #13 (q=1/2, price=10, Δ=1/2, B=−40) | ✅ 4-field mastery (q prefilled, ladder price→Δ→B) | ✅ 3-level per field + B-sign + E_p + undiscounted refutations | ✅ per-field aria-label | ✅ `risk-neutral-pricing`; `density:'split'`; `assist`+`hintCapOverride`; q prefilled from `opt4-win` |
| `opt4-recap` | ✅ | ✅ tap-advance | ✅ | ✅ | n/a (ungraded) |

**DoR holds for all L4 beats.**

---

## Lesson-level LS checklist (§6)

- **§2.1 Every graded beat has a valid `schemaId`.** `opt4-recall`=`linearity-indicators`; `opt4-win` / `opt4-gate` / `opt4-compare` / `transfer-heldout` / `opt4-mastery`=`risk-neutral-pricing`. Ungraded beats carry `—`. `risk-neutral-pricing` is a Wave-0 registry addition — Dept-3 must add it (name "Risk-neutral pricing", `domains:['options']`) with symmetric `CONFUSABLE` edges `['no-arbitrage-replication','binomial-pricing','conditioning','linearity-indicators','prior-update']` **and** reverse edges on the three foil ids (`conditioning`, `linearity-indicators`, `prior-update` each += `risk-neutral-pricing`) per `concept-brief.md` methods table, or `methods.test.ts` symmetry fails. No method leaks through a label on any graded beat. ✅

- **§2.2 Which-method gate.** `opt4-gate` — graded `prediction.gate`, `gate.correct='risk-neutral-pricing'` (== `schemaId`), `optionMethods=['risk-neutral-pricing','linearity-indicators','conditioning','prior-update']`, all three distractors verified ⊂ `CONFUSABLE['risk-neutral-pricing']` per `concept-brief.md`, label-stripped surface ("A stock at 100 moves to 120 or 80…"). **This is the marquee discrimination.** ✅

- **§2.3 Held-out transfer.** `transfer-heldout` — #16 put on #13 tree; `schemaId='risk-neutral-pricing'` (== mastery `schemaId`); fresh surface (put vs call; parity check added as diagnostic); `heldOut:true, required:false, track:'B'`; placed at beat 8 immediately before `opt4-mastery` (beat 9), preserving `(masteryChallenge, recap)` ending invariant; engine-verified (☑ source, ☐ engine pending Wave-0). ✅

- **§2.4 ≥1 graded checkpoint.** `opt4-win` (cold answerEntry), `opt4-gate` (which-method gate), `opt4-mastery` (required masteryChallenge). Opening bet `opt4-bet` is a plain ungraded `prediction` with **no `gate`** — exempt by design. ✅

- **§2.5 Cold retrieval opener.** `opt4-recall` is a cold `retrievalGrid` recall of EV L1 (prior concept, not this lesson's content); the worked solution ("discounted E_q, not real odds") is gated behind the bet → win → gate → mastery ladder, never pre-shown. ✅

- **§2.6 Desirable-difficulty band.** All capped graded beats have assist paths: `opt4-win` `density:'split'` + `assist.prefillToLastTerm`; `opt4-gate`/`opt4-compare`/`opt4-recall` `density:'merged'` + 3-level hint ladder; `transfer-heldout` `density:'split'` + per-field `assist`; `opt4-mastery` `density:'split'` + `assist`+`hintCapOverride` (q prefilled from win, ladder price→Δ→B). No beat dead-ends when the governor lowers scaffolding. ✅

- **§2.7 Interleaving + "same method, different costume."** `opt4-compare` pairs #13 (r=0) and #14 (r=1/4) — two surfaces, one `schemaId` `risk-neutral-pricing`, asks "what's the same?" `opt4-gate` interleaves `risk-neutral-pricing` × `linearity-indicators` (physical-p average) × `conditioning` (first-step) × `prior-update` (Bayes posterior) — all verified ⊂ `CONFUSABLE`. EV L1 surfaces at `opt4-recall` (→ discounted E_q); all Continuity-Report overlaps converted to recall, never re-taught. ✅

- **§2.8 Thin on-ramp faded.** `opt4-model` is the single thin worked-example on-ramp for q formula + replication (genuine first contact; continuity report flags discounting as absent from the entire corpus). One worked example on #15 (q=3/5 displayed in prose, never graded), then fast fade to cold checkpoints. `q=(R−d)/(u−d)` substitution is a speed primitive — overlearned at `opt4-win`. ✅

- **§2.9 Feed-forward, no person-verdict.** `opt4-bet` and `opt4-gate` use `byOption` refutational copy naming the specific wrong model each option encodes (real-p linearity / first-step conditioning / Bayes posterior). All feedback is feed-forward / task-level ("here's the next fix"). No hire signal, no person-level verdict (ADR-0010). ✅

**§6 holds fully for all L4 beats.**
