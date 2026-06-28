# Interaction Spec — `lesson-options-2`: Put-Call Parity & No-Arbitrage

> Stage-2 Dept-2 (Interactive Experience / Design). Design-only — NO production code.
> **First justified use of `optionBoard` display:`parityScale`** (Wave-0 `optionBoard` schema member; four
> display modes folded under one union type). New type surfaces: `parityScale` ONLY.
> Key goldens: `parityGap(8,2,100,95,1)=1` (HERO headline); `paritySolve P (C=10,S=100,K=100,D=1)=10` (#6);
> `paritySolve C (P=3,S=50,K=44,D=10/11)=13` (#8 transfer); `callBounds(100,90,1)={lo:10,hi:100}` (display
> read). All exact rationals; Black-Scholes never graded.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `opt2-recall` | **Match:** tap-pair "a move best no matter what the opponent does" → *dominant*; "no profitable deviation" → *Nash equilibrium*. Bridge card: "arbitrage = a dominant money-pump markets erase." Manipulate: select each card pair. Respond: snap to match slot; readout "Correct — dominant beats every response; Nash is the equilibrium." Loop: two pairs, both required before advancing. | `retrievalGrid` | REUSE | correct: "Dominant: the move beats every opponent response. Arbitrage is the same idea applied to prices — no risky step, strict gain. Markets erase it, which forces the parity identity." Hints: ①one card names the strictly-better move, one names the stable equilibrium ②dominant = beats all responses; Nash = no player can profitably deviate ③**dominant**; **Nash** (recalling `game-theory-1 l1-recall`). Assist: 3-step ladder; density `merged` | tap-and-tap 44px; Tab navigates cards; Enter/Space selects; one `aria-live="polite" aria-atomic` mirror: "Matched: [term] → [definition]. n of 2 pairs matched."; `role=status` match-count; decorative borders `aria-hidden` | match-snap `--dur-base var(--ease-out)` | both |
| 2 | `opt2-bet` | **Choose:** "Same stock S=100, K=95, r=0. Market quotes: C=$8, P=$2. The call costs $6 more than the put, but S−K is only $5. Is the extra $1 free money?" 3 options (byOption, **no gate**, ungraded). | `prediction` (byOption) | REUSE | byOption (see §Feedback); no gate; ungraded | radiogroup 44px; aria-label per option | none | both |
| 3 | `opt2-explore` | **HERO `parityScale`.** Two-pan balance: left pan shows `C + K·D`, right pan shows `P + S`. Initial state: C=8, P=2, S=100, K=95, D=1 → left=103, right=102 → left pan dips (gap=+1). **Manipulate:** drag or tap legs (call/put/stock/bond, qty<0=short/borrow) from the leg palette into the conversion tray. **Respond:** scale tilt redraws live via `parityGap`; signed gap chip updates ("gap +1 → left heavy"); when conversion is complete (sell call qty=−1, buy put qty=+1, buy stock qty=+1, borrow bond K·D=95 qty=−1) scale flattens to 0, a "Balanced" banner appears. `interactive:true`; reduced-motion → final balanced frame. `headline="parityGap(8,2,100,95,1)=1"` (engine-reproducible). **Loop:** directed target — "Build the conversion that rebalances the scale to flat." | `optionBoard` `display:'parityScale'` (`interactive:true`) | **NEW** | ungraded hero; target-completion line: "Scale balanced — you've assembled the conversion and extracted the $1 gap." | Leg palette buttons ≥44px; tap-and-tap primary, drag enhancement; keyboard Tab to each leg, Arrow keys adjust qty, Enter adds to tray; one `aria-live="polite" aria-atomic` mirror narrating: "Left pan: C + K·D = n/d. Right pan: P + S = n/d. Gap: n/d [direction word]. Tray: [leg list with qty]."; `role=status` live gap readout strip; SVG scale arms `aria-hidden`; gap sign never color-only (glyph + word: ↑ heavy / = balanced / ↓ light) | Scale tilt: `--dur-slow var(--ease-out)` compositor-only `transform:rotate()`; **slow-first gate `--dur-tell`** (600 ms) on first leg drop; leg drop snap `--dur-base`; gap chip color/glyph transition `--dur-base`; reduced-motion → render final balanced frame statically | both |
| 4 | `opt2-model` | **Three lenses (triplet):** (1) "same expiry payoff ⇒ same price today"; (2) `C − P = S − K·D` (with D=1 at r=0: `C − P = S − K`); (3) **no-arb bounds display read** `max(S−K,0) ≤ C ≤ S` (e.g. S=100, K=90 → `10 ≤ C ≤ 100`). `introducesSymbol:'C−P=S−K·D'`, `groundedBy:'opt2-win'`. | `primer` / `tripletReveal` | REUSE | converge: "Two portfolios with the same payoff cost the same — no σ, no model, just no free lunch." Note: **`callBounds(100,90,1)={lo:10,hi:100}` is folded here as a display read, not a standalone graded beat**, to preserve the ~10-beat skeleton. | tap aria-expanded; `role=status` status line | reveal | both |
| 5 | `opt2-win` | **Type** the missing put price: r=0, S=100, K=100, C=10 (identity and all inputs handed). One rearrangement `P = C − (S−K)`. Faded `equationTiles`: `P = 10 − ( __ )`. | `answerEntry` | REUSE | golden **10** accept `["10","10/1"]`; hint ladder (below); assist `prefillToLastTerm` on `equationTiles`; density `split` | input aria-label "Enter the put price P"; Enter submits | none | both |
| 6 | `opt2-gate` | **Which-method gate (LABEL-STRIPPED):** "You're quoted three of {call price, put price, spot price, discounted strike}. Which move prices the missing one fastest?" 3 options, positionally aligned to `optionMethods`. gate.correct: `put-call-parity`. | `prediction` (`gate`, which-method) | REUSE | gate.correct `put-call-parity`; foils `no-arbitrage-replication`, `payoff-construction`; byOption refutations (below); `hintCapOverride` exposes per-foil copy; density `merged` | radiogroup 44px; aria-live announces option selected | none | both |
| 7 | `opt2-compare` | **Grid:** pair two parity surfaces sharing `schemaId=put-call-parity` — *solve-for-P* (C=10,S=100,K=100,D=1 → P=10) vs *solve-for-C* (P=3,S=50,K=44,D=10/11 → C=13); "what's shared?" card = *one identity `C−P=S−K·D`, read in two directions*. | `retrievalGrid` (`required`) | REUSE | correct: "One identity, two rearrangements — the method is identical; only the unknown leg swaps." Hints: ①both use the same parity identity — flip the unknown ②P=C−(S−K·D); C=P+(S−K·D) ③one identity **two directions**. Assist: hint ladder; density `merged` | tap-and-tap 44px; aria-live mirror | match-snap | both |
| 8 | `transfer-heldout` | **Held-out transfer (Track-B gold gate):** D=10/11, S=50, K=44, P=3 — find the no-arb call price by parity (K·D=40 exact rational). `heldOut:true required:false`. | `masteryChallenge` | REUSE | golden **13** accept `["13","13/1"]`; hint ladder (below); density `merged`; `hintCapOverride` surfacing K·D step only | input aria-label "Enter the call price C"; Enter | none | B |
| 9 | `opt2-mastery` | **Split mastery.** Part A: "S=100, K=95, C=8, P=2, r=0 — what is the arb gap?" (type number). Part B: "Name the 4 conversion legs and state the cash flows: +$? today, $? at expiry." `density:'split'`; assist `prefillToLastTerm` prefills the `S−K=5` term so Part A sign-flip trap cannot strand a novice. | `masteryChallenge` (`required`, `density:'split'`) | REUSE | goldens: Part A gap `1`; Part B profit-today `1`, profit-at-expiry `0`; ladders + per-mistake (below); `hintCapOverride`; density `split` | per-field aria-label; Enter advances parts; aria-live narrates each part result | none | both |
| 10 | `opt2-recap` | **Recap:** two portfolios → one price → `C−P=S−K·D`; the gap = the arb; the conversion (sell call, buy put, buy stock, borrow K); no-arb bounds (display read, `callBounds(100,90,1)`); "next: spreads & straddles compose legs." | `recap` (`required`) | REUSE | — | — | reveal | both |

---

## New interaction types (for Wave 0)

`optionBoard` is the **single new discriminated-union member** for the entire `course-options` concept (four display modes folded: `payoffDiagram`, `binomialTree`, `parityScale`, `greeksSlider`). This lesson is the **first use** of the `parityScale` mode. `optionBoard` is **NOT a `HERO_TYPE`** and **NOT in `GRADED_TYPES`** — the hero status is carried by `beat.hero:true` and validated via `headline`; graded reads use `answerEntry`/`masteryChallenge`. (Precedent: `covarianceBoard`, `chainBoard`, `stoppingBoard`.)

### Frozen schema (Wave-0; conform — do NOT invent a new type)

```ts
z.object({
  type: z.literal('optionBoard'),
  display: z.enum(['payoffDiagram', 'binomialTree', 'parityScale', 'greeksSlider']),
  legs: z.array(z.object({
    kind: z.enum(['call', 'put', 'stock', 'bond']),
    K: RationalSchema.optional(),
    qty: RationalSchema,           // <0 = short / borrow
  })).optional(),
  tree: z.object({                 // binomialTree only
    S0: RationalSchema, u: RationalSchema, d: RationalSchema,
    R: RationalSchema, K: RationalSchema,
    n: z.number().int(), kind: z.enum(['call', 'put']),
  }).optional(),
  sigma: RationalSchema.optional(),     // greeksSlider (display-only)
  markS: RationalSchema.optional(),     // S_T read-off marker / spot S
  labels: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),      // engine-reproducible anchor; validate-fixtures checks it
})
```

**`parityScale` prop contract (this lesson):** `legs` (call/put/stock/bond, qty<0=short/borrow), `interactive:true`, `headline = parityGap` (engine-reproducible). Renderer displays `C + K·D` vs `P + S` and updates the tilt live.

---

### ⚠️ SCHEMA GAP — `parityScale` cannot express market quotes (Wave-0 amendment required)

**What the renderer needs to draw the initial tilted scale and run `parityGap` live:**
- The quoted call price **C** (e.g. 8)
- The quoted put price **P** (e.g. 2)
- The spot price **S** (e.g. 100)
- The discount factor **D** (e.g. 1)
- The strike **K** (e.g. 95, for the bond/borrow leg and K·D computation)

**What the frozen schema provides:**
- `legs[].kind` / `legs[].K` / `legs[].qty` — structural legs only; **no per-leg price field**
- `markS` can carry spot **S**, but there is no slot for quoted **C**, quoted **P**, or **D**
- `headline` carries the engine output string (e.g. `"parityGap(8,2,100,95,1)=1"`) but the renderer cannot parse it back to reconstruct the live inputs

**Impact:** without the market quotes, the renderer cannot (a) set the initial scale tilt, (b) update `C + K·D` vs `P + S` live as the learner drags legs, or (c) validate the gap chip to a meaningful number. `headline` is still cross-checkable by `validate-fixtures` regardless.

**Recommended Wave-0 amendment (pick one):**

*Option A (preferred — minimal, per-beat):* add an optional top-level `quotes` object:
```ts
quotes: z.object({
  C: RationalSchema.optional(),
  P: RationalSchema.optional(),
  S: RationalSchema.optional(),
  K: RationalSchema.optional(),
  D: RationalSchema.optional(),
}).optional(),
```

*Option B:* add an optional `price: RationalSchema` field on each `legs[]` entry so each leg carries its market quote alongside its structural `kind`/`K`/`qty`.

**Stopgap within the frozen schema (fragile — call-out only):** pack the five quotes as prefixed strings in `labels` (e.g. `["C=8","P=2","S=100","K=95","D=1"]`) and have the renderer parse them with a fixed index convention. This is brittle, invisible to the type system, and not recommended for production — call it out as a temporary workaround only if Wave-0 cannot land the amendment before the renderer ships.

**`headline=parityGap` is unaffected** — it remains the engine-reproducible anchor and `validate-fixtures` golden regardless of which amendment is chosen.

---

## Feedback + hint ladders

### `opt2-bet` (byOption, ungraded — "K=95, C=8, P=2, r=0: is the extra $1 free money?")

- "Yes — parity forces C−P to equal S−K=$5, but the quotes give $6, so there's a risk-free edge." → *"Right — the gap (C−P)−(S−K) = 6−5 = 1 is a genuine $1 arbitrage. The explore builds the conversion that harvests it, and the mastery proves it nets +$1 today, $0 at expiry (#7)."* (**correct**)
- "No — you can't call it mispriced without a volatility / Black-Scholes model." → *"Parity is an **exact no-arbitrage identity**, not an empirical fit. Two portfolios with the same expiry payoff must cost the same today; no σ and no Black-Scholes enter. The mismatch is real — and harvestable (#7)."* (false — misconception **(a)**)
- "No — C−P should equal K−S = −$5, and these quotes look close enough." → *"Sign check: a long call + short put pays S_T−K at expiry (it synthesizes stock-minus-strike), so C−P = S−K·D, **not** K−S. Verify the payoff at S_T≥K and at S_T<K (#5)."* (false — misconception **(b)**)

### `opt2-win` (golden `10`)

Correct: "P = C−(S−K) = 10−(100−100) = 10. No model needed — no-arbitrage alone pins the put price."

Hint ladder:
1. (nudge) "The parity identity is C−P = S−K at r=0. You have C, S, K — rearrange for P."
2. (method) "P = C−(S−K) = 10−(100−100). What is 100−100?"
3. (answer) "P = **10** (#6). S=K so the gap term vanishes — the put and call cost the same."

Per-mistake: most-likely wrong = stalling for "more info / need volatility" (misconception **(a)**) → *"You have everything you need: parity is C−P=S−K at r=0. No σ, no Black-Scholes. Plug in: P = 10−(100−100)."*

### `opt2-gate` (byOption, graded — label-stripped; `correct=put-call-parity`; foils ⊂ `CONFUSABLE[put-call-parity]`)

Options (positionally aligned to `optionMethods`):
- **Put–call parity** *(correct; `put-call-parity`)* → *"One identity ties C, P, S and K·D; rearranging for the missing quote is a single step. Fastest path — you don't rebuild anything."*
- **No-arbitrage replication** *(foil; `no-arbitrage-replication` — misconception **(d)**)* → *"You could rebuild the replicating portfolio leg-by-leg from scratch — but the parity identity **already encodes** that replication. Recognizing the identity is the faster move; replication is the long path to the same number."*
- **Payoff construction** *(foil; `payoff-construction`)* → *"Drawing the payoff diagram gives the value **at expiry**, not the price relationship **today**. Parity is the current-cost identity that pins the fourth quote — a payoff read alone won't."*

### `opt2-compare` (golden: one identity, two directions)

Correct: "One identity `C−P=S−K·D`, two rearrangements. The schemaId is `put-call-parity` either way."

Hint ladder:
1. (nudge) "Both surfaces share the same four quantities — C, P, S, K·D. What single equation connects them?"
2. (method) "P = C−(S−K·D); C = P+(S−K·D). Same identity flipped."
3. (answer) "One identity, **two directions** — solve-for-P and solve-for-C are the same method."

### `transfer-heldout` (golden `13`, accept `["13","13/1"]`)

Correct: "C = P + S − K·D = 3 + 50 − 40 = 13. The discount bites now (D=10/11 ≠ 1), and K·D = 44·(10/11) = 40 exact."

Hint ladder:
1. (nudge) "Same identity, but r≠0 this time: C = P + S − K·D. Compute K·D first."
2. (method) "K·D = 44 × (10/11) = 440/11 = 40 exactly (exact rational, no float). So C = 3 + 50 − 40."
3. (answer) "C = **13** (#8)."

Per-mistake: most-likely wrong = **9** (ignoring D, using K=44 directly: 3+50−44=9 — misconception **(c)** on a fresh surface where it finally bites) → *"The discount isn't 1 here. K·D = 44·(10/11) = 40, not 44. With D=10/11: C = 3 + 50 − 40 = **13**, not 9."*

### `opt2-mastery` (split: Part A gap `1`; Part B profit-today `1`, profit-at-expiry `0`)

**Part A correct:** "Gap = (C−P)−(S−K) = (8−2)−(100−95) = 6−5 = **1**."

Part A hint ladder:
1. (nudge) "Gap = (C−P)−(S−K). You need the call-minus-put spread and the stock-minus-strike spread."
2. (method) "C−P = 8−2 = 6. S−K = 100−95 = 5. Gap = 6−5."
3. (answer) "Gap = **1** (#7). The call side is $1 too expensive."

Part A per-mistakes:
- **11** (sign-flip: `(C−P)−(K−S) = 6+5`) → *"Sign check: parity says C−P = S−K, so the gap is (C−P)−(S−K), not (C−P)+(S−K). S−K = 100−95 = +5, not −5."*
- **6** (stop at C−P, forget S−K) → *"C−P = 6 is only half the identity. The parity benchmark is S−K = 5, not zero. Gap = 6−5 = 1."*

**Part B correct:** "Scale tips toward the call side (call is overpriced), so: **sell call, buy put, buy stock, borrow 95** (=K·D at r=0). Today: +8−2−100+95 = **+$1** cash in. At expiry: (stock+put−call) book is always worth K=95; you repay 95 → **$0** net."

Part B hint ladder:
1. (nudge) "The gap is +1 (left pan too heavy). To rebalance: sell the overpriced side, buy the cheap side."
2. (method) "Sell call (+8), buy put (−2), buy stock (−100), borrow 95 today (+95). Sum today = +1. At expiry the portfolio is always worth 95 and you repay 95."
3. (answer) "**Sell call, buy put, buy stock, borrow 95.** Today: **+$1**. At expiry: **$0** (#7)."

---

## Build decomposition (Technical Planner — for Dept 3)

### Engine functions (`src/engine/options.ts`)

All inputs/outputs are exact `BigRational {n:bigint; d:bigint}`. No floats are graded; `ratToNumber` is the display-only escape hatch.

```ts
parityGap(C, P, S, K, D): Rat       // (C−P) − (S−K·D); 0 = fair, ≠0 = arb
paritySolve(known: Partial<{C,P,S,K,D}>): Rat  // solve the one missing leg
parityArbLeg(C, P, S, K, D): { trade: Leg[]; profitToday: Rat }
callBounds(S, K, D): { lo: Rat; hi: Rat }    // max(S−K·D,0) ≤ C ≤ S
```

**Engine goldens (every graded `accept`/`headline` must be one of these exact rationals):**

| function call | golden | citation | graded by |
|---|---|---|---|
| `parityGap(10,10,100,100,1)` | `0` | GB §6.1 L10840 | `opt2-explore` headline (fair identity) |
| `paritySolve P (C=10,S=100,K=100,D=1)` | `10` | GB §6.1 L10840 | `opt2-win` accept |
| `parityGap(8,2,100,95,1)` | `1` | GB §6.1 + Derivatives Atlas | `opt2-explore` headline; `opt2-mastery` Part A accept |
| `parityArbLeg(8,2,100,95,1)` | `{profitToday:1, trade:[…]}` | GB §6.1 | `opt2-mastery` Part B accept |
| `paritySolve C (P=3,S=50,K=44,D=10/11)` | `13` | GB §6.1 L10820 + Ryan O'Connell | `transfer-heldout` accept |
| `callBounds(100,90,1)` | `{lo:10, hi:100}` | GB §6.1 p.70 | `opt2-model` + `opt2-recap` display read |

> **`BigRational` ↔ `RationalSchema` reconciliation flag (identical to the covariance concept flag — resolve once, shared):** `src/engine/types.ts` defines `Rational = {n:number; d:number}` (plain JS `number`); the fixture `RationalSchema` is `z.number().int()`. Parity denominators stay small (integers, no exponential blow-up), so JS `number` is adequate for L2. Nevertheless, `options.ts` should use `BigRational {n:bigint; d:bigint}` internally (matching `optimalStopping.ts`/`combinatorics.ts`) and expose a `toRational()` adapter for the fixture layer. **Wave-0 Dept-3 action:** reconcile the engine's `BigRational` with the fixture `RationalSchema` once, shared across the options concept.

### Schema variant

`optionBoard` union member (see frozen schema above). This lesson uses only `display:'parityScale'`. `parityScale`-specific fixture fields: `display`, `legs`, `interactive`, `headline`. **See schema-gap flag in §New interaction types for the missing market-quote fields.**

### Renderer/widget

`OptionBoardBeat.tsx` (NEW), dispatching by `display`. For `parityScale`:
- `ParityScaleDisplay` sub-component
- Props: `legs` (palette), `interactive`, `headline`, `labels` (stopgap for market quotes if amendment is deferred)
- Live state: conversion tray (`Leg[]`), gap = `parityGap(C,P,S,K,D)` from engine
- Scale tilt: `transform:rotate()` keyed on gap; compositor-only
- Leg palette: `<button>` elements ≥44px for call/put/stock/bond with ± qty controls
- Gap chip: glyph + word (never color-only)
- One `aria-live="polite" aria-atomic` mirror per interactive instance
- `role=status` readout strip
- SVG scale arms: `aria-hidden`
- Reduced-motion: render final balanced frame (tray filled, gap=0, no animation)
- Keyboard: Tab across legs, Arrow keys ± qty, Enter adds to tray, Space confirms
- `index.tsx`: `case 'optionBoard': return <OptionBoardBeat {...props}/>`

### Fixture fields per beat

| beatId | key fixture fields | accept / headline |
|---|---|---|
| `opt2-recall` | `interaction.type:'retrievalGrid'`, `schemaId:'dominance-nash'`, `required:true`, `density:'merged'` | match pairs |
| `opt2-bet` | `interaction.type:'prediction'`, `interaction.byOption:true`, no `gate` | ungraded |
| `opt2-explore` | `interaction.type:'optionBoard'`, `display:'parityScale'`, `legs:[…palette…]`, `interactive:true`, `hero:true`, `headline:"parityGap(8,2,100,95,1)=1"` | ungraded; headline validated by `validate-fixtures` |
| `opt2-model` | `interaction.type:'tripletReveal'`, `introducesSymbol:'C−P=S−K·D'`, `groundedBy:'opt2-win'` | ungraded |
| `opt2-win` | `interaction.type:'answerEntry'`, `schemaId:'put-call-parity'`, `required:true`, `density:'split'`, `assist.prefillToLastTerm:true` | `accept:["10","10/1"]` |
| `opt2-gate` | `interaction.type:'prediction'`, `gate.kind:'which-method'`, `gate.correct:'put-call-parity'`, `gate.optionMethods:['put-call-parity','no-arbitrage-replication','payoff-construction']`, `schemaId:'put-call-parity'`, `required:true`, `density:'merged'`, `hintCapOverride:true` | graded gate |
| `opt2-compare` | `interaction.type:'retrievalGrid'`, `schemaId:'put-call-parity'`, `required:true`, `density:'merged'` | match pairs |
| `transfer-heldout` | `interaction.type:'masteryChallenge'`, `schemaId:'put-call-parity'`, `heldOut:true`, `track:'B'`, `required:false`, `density:'merged'`, `hintCapOverride:true` | `accept:["13","13/1"]` |
| `opt2-mastery` | `interaction.type:'masteryChallenge'`, `schemaId:'put-call-parity'`, `required:true`, `density:'split'`, `assist.prefillToLastTerm:true`, `hintCapOverride:true` | Part A `accept:["1"]`; Part B `accept:["1","0"]` |
| `opt2-recap` | `interaction.type:'recap'`, `required:true` | ungraded |

### Validation anchors

`validate-fixtures` must:
1. Add `lesson-options-2` to `GATED` and `MASTERY_LESSONS`.
2. Cross-check every `headline` against the engine golden (skip `greeksSlider`; `parityScale` headline = `parityGap(8,2,100,95,1)=1` confirmed).
3. Confirm `heldOut` beats are excluded from visible/required walk.
4. Confirm `put-call-parity` and `CONFUSABLE[put-call-parity]` exist in `src/content/methods.ts` before the gate validates.

---

## Definition-of-Ready checklist

| beat | verified + sourced (cite #) | concrete direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px / reduced-motion / aria-live) | graded carries schemaId + (capped) assist / hintCapOverride + density |
|---|---|---|---|---|---|
| `opt2-recall` | ✅ game-theory-1 dominance/Nash | ✅ tap-match grid | ✅ 3-step ladder | ✅ | ✅ `dominance-nash`; density `merged`; 3-step assist |
| `opt2-bet` | ✅ #7 (gap=1) | ✅ 3-option choice | ✅ byOption refutation | ✅ | — ungraded |
| `opt2-explore` | ✅ #7 `parityGap(8,2,100,95,1)=1` | ✅ HERO drag/tap legs, live tilt, directed target | ✅ ungraded target line | ✅ aria-live gap mirror; reduced-motion final frame; 44px leg buttons | — ungraded; ⚠️ **parityScale schema gap** (Wave-0 dependency — `quotes` or per-leg `price` field needed for renderer to receive C/P/D; see §New interaction types; `headline` validation unaffected) |
| `opt2-model` | ✅ GB §6.1 + `callBounds(100,90,1)` | ✅ triplet tap-reveal | ✅ | ✅ | — ungraded |
| `opt2-win` | ✅ #6 `paritySolve P=10` | ✅ type-in with faded equationTiles | ✅ ladder + per-mistake | ✅ | ✅ `put-call-parity`; density `split`; `prefillToLastTerm` assist |
| `opt2-gate` | ✅ #6 (gate framing) | ✅ labeled-stripped 3-option gate | ✅ byOption + hintCapOverride | ✅ | ✅ `put-call-parity`; density `merged`; `hintCapOverride` |
| `opt2-compare` | ✅ #6 (P=10) + #8 (C=13) | ✅ grid same-method pair | ✅ 3-step ladder | ✅ | ✅ `put-call-parity`; density `merged`; hint ladder |
| `transfer-heldout` | ✅ #8 `paritySolve C (D=10/11)=13` | ✅ type-in | ✅ ladder + per-mistake (wrong=9) | ✅ | ✅ `put-call-parity`; density `merged`; `hintCapOverride` K·D step |
| `opt2-mastery` | ✅ #7 `parityGap=1` + `parityArbLeg` | ✅ split: type gap + name trade | ✅ per-part ladder + per-mistake (11, 6) | ✅ | ✅ `put-call-parity`; density `split`; `prefillToLastTerm` + `hintCapOverride` |
| `opt2-recap` | ✅ | ✅ | ✅ | ✅ | — ungraded |

**DoR holds for all L2 beats.** The `parityScale` schema gap (missing market-quote fields `C`, `P`, `D` in the frozen `optionBoard` schema) is a **Wave-0 renderer dependency, not a DoR blocker**: `headline=parityGap(8,2,100,95,1)=1` is engine-reproducible and `validate-fixtures`-checkable today; the explore beat is ungraded; the stopgap `labels` encoding is available if the amendment is deferred past spec-freeze. Dept-3 must resolve the gap (Option A `quotes:{}` recommended) before `OptionBoardBeat.tsx` ships.

---

## Lesson-level LS checklist (§6)

- [x] **§2.1 — Every graded beat has a valid `schemaId`; no method leaks through a label.** `opt2-recall`→`dominance-nash`; `opt2-win`/`opt2-gate`/`opt2-compare`/`transfer-heldout`/`opt2-mastery`→`put-call-parity`. The word "parity" never appears on a graded *solving* surface; beat titles are surface-neutral (`opt2-win`, `opt2-gate`, `opt2-compare`); the gate prompt is label-stripped.

- [x] **§2.2 — ≥1 which-method gate (`prediction.gate`, `correct == schemaId`, `CONFUSABLE` distractors, label-stripped prompt).** `opt2-gate`: `gate.correct='put-call-parity'` == `schemaId`; foils `['no-arbitrage-replication','payoff-construction']` ⊂ `CONFUSABLE['put-call-parity']` (verified in `concept-brief.md`); prompt is label-stripped ("you're quoted three of {call, put, spot, discounted strike} — which move finds the fourth fastest?"). ✅

- [x] **§2.3 — Held-out transfer (`heldOut:true track:'B' required:false`, same `schemaId` as mastery, fresh surface, before mastery, engine-verified).** `transfer-heldout`: `schemaId='put-call-parity'` == mastery's `schemaId`; fresh surface D=10/11 (rational discount that *bites*, not D=1), solve-for-C (not P), S=50/K=44/P=3 (all new); placed immediately before `opt2-mastery`; engine-verified `paritySolve C (D=10/11)=13`; excluded from visible/required walk. ✅

- [x] **§2.4 — ≥1 graded checkpoint exists; opening bet is a plain ungraded `prediction`.** Cold checkpoints: `opt2-gate` (which-method gate) and `opt2-mastery` (masteryChallenge), both confidence-eligible. `opt2-bet` is an ungraded `prediction` with **no `gate`** — exempt by design. ✅

- [x] **§2.5 — Opens with cold retrieval; worked solution gated behind a hint-ladder attempt.** `opt2-recall` is a graded `retrievalGrid` cold-recalling `lesson-game-theory-1`'s dominance/Nash — a prior concept, not a primer. The bridge rationale ("arbitrage = dominant money-pump") is gated behind the learner's attempt via the hint ladder (§2.5). ✅

- [x] **§2.6 — Every capped/graded beat has an assist/`hintCapOverride` path; `density` set per beat.** `opt2-recall`: density `merged`, 3-step ladder. `opt2-win`: density `split`, `prefillToLastTerm`. `opt2-gate`: density `merged`, `hintCapOverride`. `opt2-compare`: density `merged`, hint ladder. `transfer-heldout`: density `merged`, `hintCapOverride` (K·D step). `opt2-mastery`: density `split`, `prefillToLastTerm` + `hintCapOverride`. No graded beat can dead-end. ✅

- [x] **§2.7 — Continuity-Report overlap is a recall/interleave beat; ≥1 "same method, different costume" comparison; foils are `CONFUSABLE`, not random.** `opt2-recall` recycles `game-theory-1`'s dominance/Nash as cold cross-domain recall (continuity §3a). `opt2-compare` is the explicit "same method, different costume" beat: solve-for-P vs solve-for-C, same `schemaId='put-call-parity'`, asks "what's shared?" The gate's foils (`no-arbitrage-replication`, `payoff-construction`) are drawn exclusively from `CONFUSABLE['put-call-parity']`. ✅

- [x] **§2.8 — Thin worked-example on-ramp for first contact; fades fast.** `opt2-model` (`tripletReveal`) is the thin on-ramp: three lenses, faded fast, with `introducesSymbol` and `groundedBy:'opt2-win'` so the formal identity is grounded by the learner's own correct answer, not pre-announced. The no-arb call bounds (`callBounds(100,90,1)={lo:10,hi:100}`) are folded as a **display read** inside `opt2-model` and `opt2-recap` rather than a standalone graded beat — this preserves the ~10-beat skeleton and correctly treats the bounds as a secondary consequence of the parity identity, not a new method. ✅

- [x] **§2.9 — `byOption` refutational feedback; feed-forward, no person-level verdict.** `opt2-bet` and `opt2-gate` both carry per-option refutational feedback naming the specific misconception (a)/(b)/(d) and refuting it. All feedback is task-/process-level and feed-forward ("verify at S_T≥K and S_T<K"; "the discount enters only via K·D"). No person-level verdict, no hire signal (ADR-0010). ✅
