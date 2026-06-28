# Interaction Spec — `lesson-options-1`: Payoffs & the Contract

> Stage-2 Dept-2 (Interactive Experience / Design). Design-only — NO production code.
> Reads `brief.md`, `../concept-brief.md`, `../../../.cursor/skills/lesson-factory/artifacts.md` §4.
> New-type surface: **first use of `optionBoard` `display:'payoffDiagram'`** — the hockey-stick payoff vs
> S_T; long-call ↔ long-put toggle; `markS` reads `headline` live. Key exact-rational goldens:
> `callPayoff(130,100)=30`, `callPayoff(70,100)=0`; `putPayoff(70,100)=30`, `putPayoff(80,100)=20`;
> protective put → 130, 100; straddle → 30, 30.

## Concept-level decisions carried into this lesson

- **`optionBoard` display-mode set (frozen for the whole concept):** `payoffDiagram` (L1, L3, L6),
  `binomialTree` (L4, L5, L6), `parityScale` (L2), `greeksSlider` (L5, L6). L1 uses only
  `payoffDiagram`. The `greeksSlider` view is **display-only / NEVER an `accept`** (continuous Greeks
  are irrational).
- **Exact-rational contract:** all graded quantities are exact integers (call/put payoffs, spread payoffs
  with rational K=100). No Black-Scholes, no N(·), no float is ever graded. The `BigRational` ↔
  `RationalSchema` reconciliation flag raised by the concept-brief applies; Dept-3 resolves once
  (shared with covariance). Every graded `accept` in this lesson (`30`, `0`, `130`, `100`, `20`) is a
  plain JS-safe integer; overflow risk is nil for L1.
- **`opt1-explore` L1 shape:** ships a **long-call ↔ long-put TOGGLE** (two single-leg presets, tap to
  switch) rather than free leg-dragging. Full leg-dragging deferred to L3 (spreads). The hockey-stick
  curve redraws live on toggle; `markS` drag-spot reads the payoff in `headline`.

---

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|--------|----------------------------------------|-----------------|-------------|-----------------|------|---------------|-------|
| 1 | `opt1-recall` | Tap-and-match two pairs: `E[X], fair die → 7/2`; `A fair bet is worth its… → expected value, E[X]=Σx·P(x)`; bridge `An option is a bet whose payoff… → bends at the strike K`. All three sourced from EV L1. | `retrievalGrid` | REUSE | Correct: "E[X]=7/2 is the fair price; a bet on a kink bends at the strike — that's what makes a call not a forward." Hints: ① both came from Expected Value (`ev1-recall`/`ev1-win`) ② die mean = (1+…+6)/6 = 7/2; a bet is worth its expectation ③ **7/2**; the option payoff **bends at the strike K** | Tap-and-tap primary (drag enhancement); `role=status` aria-live mirror narrates matched pairs; 44px touch targets; reduced-motion → match-snap only | match-snap on pair completion | both |
| 2 | `opt1-bet` | Choose one option: "Long call K=100, stock at S_T=70 at expiry — what is the call worth?" Three choices: −30 / 0 / −5. **No gate** (ungraded productive-failure hook). | `prediction` (byOption, **no gate**) | REUSE | byOption refutations — see Feedback § below; ungraded, no gate; sets up the kink reveal | `role=radiogroup`/`radio`, `aria-checked`; 44px; keyboard native | none | both |
| 3 | `opt1-explore` ⭐ HERO | **Toggle long-call ↔ long-put; drag `markS` along the S_T axis; read the hockey-stick payoff live.** Manipulate: tap the CALL/PUT toggle button (44px min); drag the `markS` marker left/right (or tap +/− keys) to move the read-spot. Respond: the piecewise-linear `payoffDiagram` curve redraws in `--dur-slow` (360ms) on toggle (slow-first gate `--dur-tell` 600ms for the very first toggle to let the kink register); `headline` updates to the exact payoff at `markS` computed by `callPayoff`/`putPayoff` via `options.ts`; a `role=status` readout strip narrates the change. Loop: toggle call→put, watch the curve flip left/right around K=100; drag `markS` below K, above K, exactly at K to read 0, positive, and 0 respectively; see that both shapes are flat at 0 on the "wrong" side of K. | `optionBoard` `display:'payoffDiagram'` (`interactive:true`) | **NEW** (first use) | Ungraded HERO; correct-on-explore line: "Both payoffs are 0 below (or above) the strike — the kink at K is the whole idea. A straight line would be a forward." | SVG/DOM decorative curve `aria-hidden`; toggle button `role=button` 44px, keyboard Tab/Enter/Space; `markS` slider `type=range` accessible, Arrow keys ±5 units, Home/End to K−50/K+50; **exactly one** `aria-live="polite" aria-atomic` mirror: `"Long [call/put] K=100. At S_T=[val], payoff = [n/d]. [Above/Below/At] strike — kink at 100."`; `role=status` readout strips; sign never color-only (glyph + word "In the money / Out of the money / At the money"); reduced-motion → final frame only (no curve-redraw animation, no slider motion interpolation) | curve redraw `--dur-slow` `--ease-out`; `markS` drag smooth `--dur-base`; **first toggle: `--dur-tell` (600ms) slow-in gate** so the kink lands; compositor-only `transform`/`opacity`; reduced-motion final frame | both |
| 4 | `opt1-model` | Tap through three lenses: ① **Definition** — "a right, not an obligation; exercise only when favorable → payoff ≥ 0" ② **The floor** — "the `(·)⁺` clamp ⇒ the kink at K; intrinsic value is floored at 0, never negative" ③ **Intrinsic vs time value** — "at expiry, value = intrinsic = `max(·,0)`; extra time-value before expiry is pricing, deferred." Introduces symbol `(S−K)⁺`. | `tripletReveal` (`introducesSymbol: '(S−K)⁺'`, `groundedBy: ['opt1-win']`) | REUSE | Converge line: "Payoff = max(·,0) — the floor IS the kink. Pricing is later." | Tap `aria-expanded`; `role=status` converge line; 44px tap targets; reduced-motion skips card-flip animation | card reveal | both |
| 5 | `opt1-win` | Formula `max(S−K, 0)` and K=100 are **handed over**. Type the call payoff at two spots: S_T=130 then S_T=70. (#1 dossier) | `answerEntry` | REUSE | Golden **30** (S_T=130), **0** (S_T=70); `accept: ["30"]` and `["0"]`; 3-level ladder + per-mistake — see Feedback §; `density:'split'`; `assist`: prefill the `max(·, 0)` shell | Input `aria-label`="Payoff when S_T=130" / "Payoff when S_T=70", Enter submits; inline hint reveal; no motion | none | both |
| 6 | `opt1-gate` | **Label-stripped prompt:** "At expiry the stock sits at S_T=80. You hold a long put with K=100 and need its cash value at expiry. Which move gets you there?" Three choices: "Payoff construction" / "Put–call parity" / "No-arbitrage replication". | `prediction` (`gate`, `correct:'payoff-construction'`) | REUSE | byOption refutations per foil — see Feedback §; `density:'split'`; `hintCapOverride` (no prefill possible; override keeps the 3-level refutational ladder available) | `role=radiogroup`; 44px; keyboard native; `aria-describedby` on the gate prompt | none | both |
| 7 | `opt1-compare` | Match-grid pairing: ① "Long call K=100 at S_T=130 → **30** = max(130−100, 0)" and ② "Long put K=100 at S_T=70 → **30** = max(100−70, 0)"; the last pair: "Below its strike, a call's intrinsic value is → **0**" (refutes misconception **c**). All three pairs sourced from #1 + #2 dossier. | `retrievalGrid` | REUSE | Correct: "Same method, different costume — both payoffs are max(·,0) of the favorable gap, floored at 0. A below-strike call has 0 intrinsic, never negative." Hints: ①one is a call (S−K)⁺, one is a put (K−S)⁺ — what's the same? ②both are max(gap, 0) of the relevant direction ③**0** — the floor IS the definition | Tap-and-tap; `role=status` aria-live mirror; 44px; `assist.prefillToLastTerm` pre-matches pair ① as worked anchor; `hintCapOverride` | match-snap | both |
| 8 | `transfer-heldout` | **Held-out transfer (Track B, heldOut, not required).** "Long straddle: long call K=100 + long put K=100. At expiry, what is the payoff at S_T=130? At S_T=70?" (#4 dossier — fresh surface: a V-shaped straddle vs the one-sided hockey-stick.) Fixture: `spreadPayoff([{kind:'call',K:100,qty:1},{kind:'put',K:100,qty:1}], S_T)` | `masteryChallenge` (`heldOut:true`, `required:false`, `density:'merged'`) | REUSE | Goldens **30** (S_T=130), **30** (S_T=70); `accept:["30"]` both parts; `hintCapOverride` safety ladder (no dead-end even without prefill); hints: ① a straddle is call + put at the same K — what does each leg pay? ② at S_T=130: call pays 30, put pays 0; at S_T=70: call pays 0, put pays 30 ③ **30** both — it's \|S_T−100\| | Per-field `aria-label`; Enter submits; no motion | none | **B** |
| 9 | `opt1-mastery` | **Mastery (prove).** "Protective put: long stock + long put K=100. Terminal value at S_T=130? At S_T=80?" (#3 dossier — multi-leg composition, `max(S_T,100)` identity). Fixture: `spreadPayoff([{kind:'stock',qty:1},{kind:'put',K:100,qty:1}], S_T)` | `masteryChallenge` (`required:true`, `density:'split'`) | REUSE | Goldens **130** (S_T=130), **100** (S_T=80); `accept:["130"]` and `["100"]`; 3-level ladder + per-mistake — see Feedback §; `assist.prefillToLastTerm` on the composition | Per-field `aria-label`; Enter; no motion | none | both |
| 10 | `opt1-recap` | Recap: "The payoff = max(·,0) — the kink at K; compose legs, their payoffs add; next: parity & no-arbitrage." One-move summary. | `recap` (`required:true`) | REUSE | — | `role=radiogroup`; reveal reduced-motion-guarded | reveal | both |

---

## New interaction types (for Wave 0) — `optionBoard`

**First use of the single new discriminated-union member** (`covarianceBoard` precedent: one new `type`, multiple `display` modes folded under it). L1 uses only `display:'payoffDiagram'`.

**Frozen schema (full four-mode shape; conform — do NOT invent a new type):**

```ts
z.object({
  type: z.literal('optionBoard'),
  display: z.enum(['payoffDiagram', 'binomialTree', 'parityScale', 'greeksSlider']),
  legs: z.array(z.object({
    kind: z.enum(['call', 'put', 'stock', 'bond']),
    K: RationalSchema.optional(),   // absent for stock/bond legs
    qty: RationalSchema,            // qty < 0 = short
  })).optional(),
  tree: z.object({                  // binomialTree only
    S0: RationalSchema, u: RationalSchema, d: RationalSchema,
    R: RationalSchema, K: RationalSchema,
    n: z.number().int(), kind: z.enum(['call', 'put']),
  }).optional(),
  sigma: RationalSchema.optional(), // greeksSlider (display-only)
  markS: RationalSchema.optional(), // the S_T read-off marker
  labels: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),  // engine-computed payoff/price at markS — the validate-fixtures anchor
})
```

**`payoffDiagram` prop contract for L1:**
- `legs`: two single-leg presets authored in the fixture — one `[{kind:'call',K:100,qty:1}]` (the CALL preset) and one `[{kind:'put',K:100,qty:1}]` (the PUT preset). The toggle switches between them; the renderer computes the piecewise-linear curve across a range of S_T (e.g. 50–150) via `callPayoff`/`putPayoff` from `options.ts`.
- `markS`: the current read-spot (authored initial value e.g. `130`); updated live by the slider; the engine recomputes `headline` at each new `markS`.
- `headline`: the exact payoff at `markS` as a `"n/d"` string (e.g. `"30"`, `"0"`); the validation anchor cross-checked by `validate-fixtures`.
- `interactive: true` on the explore beat.
- `labels`: `["S_T", "Payoff"]` (axis labels, optional; decorative only).

**Registration:**
- `optionBoard` is **NOT graded, NOT a `HERO_TYPE`** in `GRADED_TYPES` / `HERO_TYPES`. Hero is carried by `beat.hero: true` + `headline` text (the `chainBoard`/`covarianceBoard` precedent). Graded reads use `answerEntry`/`masteryChallenge`.
- Renderer: `OptionBoardBeat.tsx`, dispatch by `display`. L1 needs only `PayoffDiagramDisplay`. Architecture mirrors `CovarianceBoardBeat.tsx` (one entry point, one display per sub-component).
- `BeatView` dispatcher entry: `case 'optionBoard': return <OptionBoardBeat {...props}/>`.
- Engine cross-check block: for each authored `headline`, `validate-fixtures` calls `callPayoff`/`putPayoff`/`spreadPayoff` and asserts the string matches (skip `greeksSlider`).
- **No Konva** for `payoffDiagram` — inline SVG + DOM (same discipline as `CovarianceBoardBeat`).

---

## Feedback + hint ladders

### `opt1-bet` (`prediction`, byOption; no gate)

**Prompt:** "Long call K=100. At expiry S_T=70. What is the call worth at expiry?"

- **−30** — "you're locked in to buy at 100 a stock worth 70" → *(misconception **a**: call-as-forward).*
  "Let's test it — that treats the call like a forward (an obligation). A call is a **right**: when the stock is cheaper you simply walk away. The payoff is `max(S−K,0)` — floored at 0, never −30. You never exercise into a loss." (false)
- **0** — "the right to buy at 100 is worthless when the stock is at 70; you walk away" →
  "Good instinct — exercising would mean overpaying, so you don't. Payoff = `max(70−100,0) = 0`. The downside is clamped at the strike — that's the kink." (true)
- **−5** — "you still lose the premium you paid for it" → *(misconception **b**: payoff = profit).*
  "Let's test it — that's **profit** (payoff minus the premium), not the contract's **payoff**. Today we read the payoff at expiry, which is 0 here. The premium and P&L come later (pricing, L2+). Payoff is always ≥ 0; only profit can go negative." (false)

---

### `opt1-win` (`answerEntry`, two parts; goldens 30 and 0; #1 dossier)

- **Correct (both):** "Yes — max(130−100,0)=30; max(70−100,0)=0. The floor kicks in below K and clamps the payoff to 0."
- **Hints:** ① the payoff needs two pieces — the inner gap and the floor; you have the formula ② max(130−100, 0): inner gap = 30 ≥ 0 so payoff = 30; max(70−100, 0): inner gap = −30 < 0 so payoff = 0 — don't stop at the gap ③ **30**; **0** (#1).
- **Per-mistake — `−30` at S_T=70:** "That's S−K without the floor. The `max(·,0)` clamp sets it to 0 — you walk away from a losing exercise."
- **Per-mistake — `30` at S_T=70:** "You evaluated S_T=130, not S_T=70. At S_T=70 the gap S−K = −30; the max(·,0) floors it to 0."

---

### `opt1-gate` (`prediction.gate`, byOption; `correct:'payoff-construction'`)

**Label-stripped prompt:** "At expiry the stock sits at S_T=80. You hold a long put with K=100 and need its cash value at expiry. Which move gets you there?"

- **Payoff construction** → *(correct).*
  "Right — at a known expiry spot you evaluate the piecewise-linear payoff: `max(100−80,0)=20`. No second instrument, no portfolio — payoff construction." (correct)
- **Put–call parity** → *(foil ∈ `CONFUSABLE['payoff-construction']`).*
  "Parity (`C−P=S−K·D`) ties a call and a put's **prices** together; here you're handed **one** option and a **known** S_T and asked for its cash value. There's no second instrument and nothing to price — reading `max(K−S,0)` is the move. Save parity for L2, when two prices must agree." (false)
- **No-arbitrage replication** → *(foil ∈ `CONFUSABLE['payoff-construction']`).*
  "Replication builds a synthetic copy to **price** an option before expiry. At expiry, with S_T known, you read the payoff straight off the kinked line — no hedge, no replicating portfolio. That's pricing machinery for later lessons." (false)

**Hint ladder (hintCapOverride — the gate can't be prefilled):**
① "One move reads a cash value at a known S_T; the other two are for pricing before expiry — which one fits?" ② "The formula is `max(K−S_T, 0)`; nothing else is needed to get the number." ③ "**Payoff construction**: `max(100−80,0)=20`."

---

### `opt1-compare` (`retrievalGrid`, three pairs; #1 + #2 dossier)

- **Correct (all three matched):** "Same method, different costume — both payoffs are max(·,0) of the favorable gap, floored at 0. A below-strike call has 0 intrinsic, never negative."
- **Hints:** ① both are max(gap,0) of the direction that profits ② call: (S−K)⁺ = max(130−100,0)=30; put: (K−S)⁺ = max(100−70,0)=30; below-strike: the gap is negative → floored to 0 ③ **30**, **30**, **0** (#1, #2).
- **Per-mistake — pairing `−30` or `30` for the below-strike call:** "Intrinsic value is `max(·,0)`, floored at 0. A call 30 below its strike has intrinsic value 0, not −30 — the floor IS the definition."

---

### `transfer-heldout` (`masteryChallenge`; heldOut/Track B; golden 30, 30; #4 dossier)

- **Correct (both):** "The straddle is call + put at the same K — you get paid whichever way the stock moves. Payoff = `|S_T−100|` = 30 both ways."
- **Hints:** ① a straddle has two legs — evaluate each leg separately, then add ② at S_T=130: call pays max(30,0)=30, put pays max(−30,0)=0 → total 30; at S_T=70: call pays 0, put pays 30 → total 30 ③ **30** (both spots, #4).
- **Per-mistake — `0` at either spot:** "A straddle can never pay 0 away from the strike. The V shape means one leg is always in the money — at 130 the call pays 30; at 70 the put pays 30." (Refutes "between the strikes it pays 0" misconception; there are no strikes between 70 and 130 here.)
- **hintCapOverride** guarantees the 3-level ladder is always available (`density:'merged'` with no prefill would otherwise dead-end a struggling solver).

---

### `opt1-mastery` (`masteryChallenge`; required; goldens 130, 100; #3 dossier)

- **Correct (both):** "Long stock + long put = protective put. The put floors the terminal value at K=100, so the total is `max(S_T,100)` — 130 when the stock wins, 100 when it doesn't."
- **Hints:** ① add the two payoffs: stock pays S_T always; put pays max(100−S_T,0) ② at S_T=130: stock=130, put=max(100−130,0)=0 → total 130; at S_T=80: stock=80, put=max(100−80,0)=20 → total 100 ③ **130**; **100** (#3).
- **Per-mistake — `110` at S_T=80 (adds 80+30):** "The put pays max(100−80,0)=20, not 30. Stock=80, put=20 → 100."
- **Per-mistake — `80` at S_T=80 (forgets the put):** "The put leg pays max(100−80,0)=20 at S_T=80 — that's the floor. Stock 80 + put 20 = 100."
- **Per-mistake — `0` for the put at S_T=130:** "Correct — max(100−130,0)=0. The put expires worthless above K; the stock contributes 130 directly."
- **`assist.prefillToLastTerm`:** prefills the stock-leg payoff (130 / 80) leaving the put-leg payoff and sum for the learner to fill; `hintCapOverride` keeps the ladder available.

---

## Build decomposition (Technical Planner — for Dept 3)

### Engine functions (`src/engine/options.ts` — NEW FILE)

| fn | signature | L1 goldens (exact integers; no floats) |
|----|-----------|----------------------------------------|
| `callPayoff` | `(ST: Rat, K: Rat): Rat` → `max(S_T−K, 0)` | `callPayoff(130,100)=30` ✓; `callPayoff(70,100)=0` ✓ |
| `putPayoff` | `(ST: Rat, K: Rat): Rat` → `max(K−S_T, 0)` | `putPayoff(70,100)=30` ✓; `putPayoff(130,100)=0` ✓; `putPayoff(80,100)=20` ✓ |
| `legPayoff` | `(leg: Leg, ST: Rat): Rat` | delegates to `callPayoff`/`putPayoff`; stock leg: returns S_T; bond leg: returns K |
| `spreadPayoff` | `(legs: Leg[], ST: Rat): Rat` → `Σ qty·legPayoff` | protective put `[{stock,qty:1},{put,K100,qty:1}]` → **130**, **100** (#3) ✓; straddle `[{call,K100,qty:1},{put,K100,qty:1}]` → **30**, **30** (#4) ✓ |

**`spreadPayoff` leg encoding confirmation (per Dept-2 Lead open item #2):**
- A `stock` leg (`kind:'stock'`, no K, `qty:1`) contributes `S_T`; a `put` leg (`kind:'put'`, K=100, `qty:1`) contributes `max(100−S_T,0)`. Their sum = `S_T + max(100−S_T,0) = max(S_T,100)` ✓ (protective put identity, GB §6.1 p.70 L10800).
- A `call` leg + `put` leg at the same K=100 contribute `max(S_T−100,0) + max(100−S_T,0) = |S_T−100|` ✓ (straddle, GB §6.3 p.80 L12552). Both engine goldens match the fixture `accept`s exactly.

**`BigRational` ↔ `RationalSchema` reconciliation flag:** L1 goldens are plain integers (30, 0, 20, 130, 100) — `n < 2⁵³`, no overflow risk. Nevertheless, `options.ts` should use `BigRational {n:bigint; d:bigint}` internally (matching `optimalStopping.ts`/`combinatorics.ts`) for uniformity with L4–L5 tree denominators (`5ⁿ`, `nCk·q^k(1−q)^(n−k)`). The fixture `RationalSchema` (`z.number().int()`) serializes the int portion; `ratToNumber` is the display escape hatch. **Dept-3 resolves this flag once** (identical to the covariance flag — shared resolution).

### Schema variant

`optionBoard` as specified above (frozen). L1 uses `display:'payoffDiagram'` only. `legs` carries the single-leg call or put preset; `markS` is the authored initial read-spot; `headline` is the engine-computed payoff at `markS` as a `"n/d"` or plain integer string. `interactive:true` on the explore beat; all other boards in L1 are passive display.

### Renderer/widget + props

`OptionBoardBeat.tsx` (NEW FILE) — architecture mirrors `CovarianceBoardBeat.tsx`:
- Entry point: reads `beat.interaction.type === 'optionBoard'`, dispatches by `display`.
- `PayoffDiagramDisplay({ it, reducedMotion })`:
  - Renders an inline SVG hockey-stick curve. X-axis: S_T range (e.g. 50–150). Y-axis: payoff ≥ 0. The kink vertex is at K, computed from `legs[0].K`.
  - CALL preset curve: flat 0 for S_T < K; 45° slope S_T−K for S_T ≥ K.
  - PUT preset curve: slope K−S_T for S_T ≤ K; flat 0 for S_T > K.
  - Toggle button (44px minimum height, `role=button`, Tab/Enter/Space): switches between the two preset `legs` arrays. On first toggle: `--dur-tell` (600ms) curve redraw; subsequent toggles: `--dur-slow` (360ms).
  - `markS` control: native `<input type="range">` (accessible, Arrow keys ±1 unit, Home/End). Alternatively keyboard-tappable +/− buttons (44px). Live `headline` string from `callPayoff`/`putPayoff`.
  - `role=status` readout strip (non-live): "Long call / Long put · K=100".
  - **Exactly one** `aria-live="polite" aria-atomic="true"` sr-only mirror (announced on each `markS` move or toggle): `"Long [call/put] K=100. At S_T=[val], payoff = [headline]. [In the money / Out of the money / At the money]."` Moneyness label: never color-only (glyph + word).
  - Decorative SVG axes and curve: `aria-hidden="true"`.
  - Reduced-motion guard: on `prefers-reduced-motion: reduce`, suppress curve-redraw transition (jump to final frame); suppress slider interpolation. The final frame is always rendered.
  - CSS tokens: `--dur-base` (200ms) for `headline` text update; `--dur-slow` (360ms) for curve path redraw; `--dur-tell` (600ms) for first-toggle slow gate; `--ease-out` for all transitions. Compositor-only properties (`transform`, `opacity`) only.
  - No Konva. DOM + inline SVG only.

### Fixture fields per beat

| beat | key fields |
|------|-----------|
| `opt1-recall` | `retrievalGrid` pairs (3 pairs as above); `schemaId:'linearity-indicators'` |
| `opt1-bet` | `prediction` options `["-30","0","-5"]`; `byOption` copy; no `gate`; no `schemaId` |
| `opt1-explore` | `optionBoard` `display:'payoffDiagram'` `interactive:true` `legs:[{kind:'call',K:100,qty:1}]` (initial CALL preset); `markS:130`; `headline:"30"`; `labels:["S_T","Payoff"]`; `hero:true` |
| `opt1-model` | `tripletReveal` three lenses; `introducesSymbol:'(S−K)⁺'`; `groundedBy:['opt1-win']` |
| `opt1-win` | `answerEntry` two-part; `accept:["30"]` and `["0"]`; `schemaId:'payoff-construction'`; `density:'split'`; `hintCapOverride:true`; `assist:{prefillShell:'max(□−100,0)'}` |
| `opt1-gate` | `prediction` `gate:{kind:'which-method',correct:'payoff-construction',optionMethods:['payoff-construction','put-call-parity','no-arbitrage-replication']}`; `options:["Payoff construction","Put–call parity","No-arbitrage replication"]`; `schemaId:'payoff-construction'`; `density:'split'`; `hintCapOverride:true` |
| `opt1-compare` | `retrievalGrid` 3 pairs; `schemaId:'payoff-construction'`; `density:'split'`; `assist:{prefillToLastTerm:true}`; `hintCapOverride:true` |
| `transfer-heldout` | `masteryChallenge` two-part; `accept:["30"]` × 2; `schemaId:'payoff-construction'`; `heldOut:true`; `required:false`; `track:'B'`; `density:'merged'`; `hintCapOverride:true` |
| `opt1-mastery` | `masteryChallenge` two-part; `accept:["130"]` and `["100"]`; `schemaId:'payoff-construction'`; `required:true`; `density:'split'`; `hintCapOverride:true`; `assist:{prefillToLastTerm:true}` |
| `opt1-recap` | `recap` `required:true` |

### Validation anchors

Every graded `accept` is engine-reproducible:

| accept | engine call | golden | verified |
|--------|-------------|--------|---------|
| `opt1-win` part 1: `"30"` | `callPayoff(130,100)` | **30** | ☑ source (GB §6.1 L10744) · ☐ engine (Stage-2) |
| `opt1-win` part 2: `"0"` | `callPayoff(70,100)` | **0** | ☑ source · ☐ engine |
| `opt1-gate` (prose only; payoff = 20 is the explanation, not the graded accept) | `putPayoff(80,100)` | **20** | ☑ source · ☐ engine |
| `opt1-compare` pair 1: `"30"` | `callPayoff(130,100)` | **30** | ☑ source · ☐ engine |
| `opt1-compare` pair 2: `"30"` | `putPayoff(70,100)` | **30** | ☑ source · ☐ engine |
| `opt1-compare` pair 3 (below-strike): `"0"` | `callPayoff(70,100)` | **0** | ☑ source · ☐ engine |
| `transfer-heldout` part 1: `"30"` | `spreadPayoff([call100,put100],130)` | **30** | ☑ source (GB §6.3 L12552) · ☐ engine |
| `transfer-heldout` part 2: `"30"` | `spreadPayoff([call100,put100],70)` | **30** | ☑ source · ☐ engine |
| `opt1-mastery` part 1: `"130"` | `spreadPayoff([stock,put100],130)` | **130** | ☑ source (GB §6.1 L10800) · ☐ engine |
| `opt1-mastery` part 2: `"100"` | `spreadPayoff([stock,put100],80)` | **100** | ☑ source · ☐ engine |
| `opt1-explore` `headline:"30"` | `callPayoff(130,100)` | **30** | ☑ source · ☐ engine (validate-fixtures cross-check) |

No floats are graded. All L1 goldens are exact integers. Exact-rational discipline holds.

**`LessonPlayer` heldOut confirmation (per Dept-2 Lead open item #3):** `transfer-heldout` and `opt1-mastery` are back-to-back `masteryChallenge` beats — this shape is shipped in covariance-1 (low risk). `LessonPlayer` excludes `heldOut:true` beats from the visible/required walk; the Track-B gold gate is invisible to Track-A learners. Both are `masteryChallenge` before `opt1-recap` — the `(masteryChallenge, recap)` ending invariant holds.

---

## Definition-of-Ready checklist

| beat | verified+sourced problem (cite #) | concrete direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px/reduced-motion/aria-live) | graded carries schemaId + (capped) assist/hintCapOverride + density |
|------|-----------------------------------|---------------------------------------|----------------------------------|--------------------------------------|----------------------------------------------------------------------|
| `opt1-recall` | ✅ #1 (7/2, EV bridge); EV L1 | ✅ tap-and-match grid | ✅ correct line + 3-level ladder | ✅ | ✅ `schemaId:'linearity-indicators'`; no assist needed (warm-up) |
| `opt1-bet` | ✅ #1 (call at S_T=70; ungraded) | ✅ 3-option choice + byOption refutations | ✅ byOption per foil (ungraded productive-failure; no grade) | ✅ | N/A — ungraded |
| `opt1-explore` | ✅ #1+#2 (toggle call/put; ungraded HERO) | ✅ toggle 44px button + `markS` range slider → curve redraws + `headline` live | ✅ correct-on-explore narrative line | ✅ 44px toggle; `markS` range; aria-live mirror; reduced-motion final frame | N/A — ungraded |
| `opt1-model` | ✅ #1 (thin on-ramp after explore) | ✅ tap-through tripletReveal | ✅ converge line | ✅ | N/A — ungraded |
| `opt1-win` | ✅ #1 (`callPayoff(130,100)=30`, `callPayoff(70,100)=0`) | ✅ two-part type-in with handed-over formula | ✅ correct + 3-level ladder + per-mistake | ✅ | ✅ `schemaId:'payoff-construction'`; `density:'split'`; `assist` prefill shell; `hintCapOverride` |
| `opt1-gate` | ✅ #2 (`putPayoff(80,100)=20`; label-stripped) | ✅ 3-option which-method selection | ✅ byOption refutations + 3-level hintCapOverride ladder | ✅ | ✅ `schemaId:'payoff-construction'`; `density:'split'`; `hintCapOverride` |
| `opt1-compare` | ✅ #1+#2 (call 30, put 30, below-strike 0) | ✅ tap-and-match retrieval grid + `prefillToLastTerm` | ✅ correct line + 3-level ladder + per-mistake | ✅ | ✅ `schemaId:'payoff-construction'`; `density:'split'`; `assist.prefillToLastTerm`; `hintCapOverride` |
| `transfer-heldout` | ✅ #4 (`spreadPayoff([call100,put100])→30,30`; fresh straddle surface) | ✅ two-part type-in masteryChallenge | ✅ correct + 3-level hintCapOverride ladder + per-mistake | ✅ | ✅ `schemaId:'payoff-construction'`; `heldOut:true required:false track:'B'`; `density:'merged'`; `hintCapOverride` |
| `opt1-mastery` | ✅ #3 (`spreadPayoff([stock,put100])→130,100`) | ✅ two-part compose-and-evaluate masteryChallenge | ✅ correct + 3-level ladder + per-mistake | ✅ | ✅ `schemaId:'payoff-construction'`; `required:true`; `density:'split'`; `assist.prefillToLastTerm`; `hintCapOverride` |
| `opt1-recap` | ✅ (summary, ungraded) | ✅ recap reveal | ✅ | ✅ | N/A — ungraded |

**DoR holds for all L1 beats.**

---

## Lesson-level LS checklist (§6)

- **§2.1 — schemaId on every graded beat:** ✅ `opt1-recall` → `linearity-indicators`; `opt1-win` / `opt1-gate` / `opt1-compare` / `transfer-heldout` / `opt1-mastery` → `payoff-construction`. No method leaks through a beat title (`opt1-win`, `opt1-gate`, `opt1-compare` are surface-neutral). `payoff-construction` is a new Wave-0 id proposed by the concept-brief; Dept-3 freezes it before any fixture persists it.
- **§2.2 — which-method gate:** ✅ `opt1-gate` is a graded `prediction.gate`; `correct == 'payoff-construction' == beat.schemaId`; foils `['put-call-parity','no-arbitrage-replication']` are exactly `CONFUSABLE['payoff-construction']`; prompt is label-stripped (surface story only; no method name in the prompt text).
- **§2.3 — held-out transfer:** ✅ `transfer-heldout` is `heldOut:true, track:'B', required:false`; `schemaId:'payoff-construction'` = `opt1-mastery.schemaId`; fresh surface (straddle V vs single-leg hockey-stick); placed immediately before `opt1-mastery`; engine-verified `spreadPayoff([call100,put100],130/70)=30,30` (GB §6.3 L12552 ☑ source; ☐ engine Stage-2).
- **§2.4 — ≥1 cold graded checkpoint; opening bet ungraded:** ✅ two cold graded checkpoints (`opt1-gate`, `opt1-mastery`). `opt1-bet` is a plain ungraded `prediction` with no `gate` — exempt by design (§2.4 / D6).
- **§2.5 — cold retrieval opener; worked solution gated behind attempt:** ✅ `opt1-recall` is a graded `retrievalGrid` of a **prior** concept (`E[X]`, EV L1) — not an options primer. The worked solution (7/2; variance promise) is gated behind the attempt via the hint ladder.
- **§2.6 — assist/hintCapOverride + density on every capped graded beat:** ✅ all five graded beats carry `hintCapOverride:true`; `density:'split'` on `opt1-win`/`opt1-gate`/`opt1-compare`/`opt1-mastery`; `density:'merged'` on `transfer-heldout` (Track-B harder surface). No dead-end paths.
- **§2.7 — "same method, different costume" comparison + CONFUSABLE foils:** ✅ `opt1-compare` explicitly pairs a long-call payoff (#1) with a long-put payoff (#2) on the same `retrievalGrid` asking "what's the same?" — two costumes, one `schemaId`. Gate foils drawn only from `CONFUSABLE['payoff-construction']`. EV `E[X]` re-surfaced at opener (cross-domain gap, continuity report §3c).
- **§2.8 — thin on-ramp, faded fast:** ✅ `opt1-model` is a brief `tripletReveal` that seeds the schema *after* the explore and *before* the win — then the lesson is entirely cold (gate/compare/transfer/mastery carry no worked example). Genuine first contact; the inversion to cold retrieval does not occur before the schema exists (boundary §4.1).
- **§2.9 — byOption refutational feedback; feed-forward; no person-verdict:** ✅ `opt1-bet` and `opt1-gate` carry full `byOption` refutational copy naming the specific wrong model (call-as-forward, payoff=profit, parity, replication). All hint ladders are generation-first (nudge → method → answer). No person-level verdict anywhere.
