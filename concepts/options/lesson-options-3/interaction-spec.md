# Interaction Spec — `lesson-options-3`: Spreads & Straddles

> Stage-2 Dept-2 (Interactive Experience / Design). Design-only — NO production code.
> **First use of `optionBoard` `display:'payoffDiagram'`** (full leg-drag compose; piecewise-linear curve redraws live; caps & break-points emerge from the legs). Goldens: bull spread 130→**20**, 110→**10**, 90→**0** (cap = K₂−K₁ = 20); butterfly peak = **10**, wings = **0**; strangle 130/70→**20**, 100→**0**; no-arb bound **0 ≤ c₁−c₂ ≤ 20**. All exact integers; `BigRational ↔ RationalSchema` reconciliation flag active (Dept-3 resolve once, shared with covariance).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `opt3-recall` | match 3 L1 payoff cards: `{"Long call K=100, S_T=130"→"30"}`, `{"Long call K=100, S_T=70"→"0"}`, `{"Long put K=100, S_T=70"→"30"}`; bridge card "now stack two legs" completes on final match | `retrievalGrid` (required) | REUSE | correct: "Single-leg payoffs from L1: call=max(S_T−K,0), put=max(K−S_T,0). Now we stack two." Hints: ①which legs are in-the-money at each S_T? recall the hockey-stick shape ②long call(100) at 130: in-the-money (130>100), pays 30; at 70: OTM, pays 0; long put(100) at 70: in-the-money (70<100), pays 30 ③**30**; **0**; **30** (`callPayoff(130,100)=30`, `callPayoff(70,100)=0`, `putPayoff(70,100)=30`) | tap-and-tap; `aria-live` mirror | match-snap | both |
| 2 | `opt3-bet` | choose — bull spread (long c100/short c120) at S_T=130: "30 — long call pays unbounded" / "20 — gain capped at K₂−K₁" / "0 — long and short cancel"; **NO gate** | `prediction` (byOption, no gate) | REUSE | byOption (§ below) | radiogroup; 44px | none | both |
| 3 | `opt3-explore` | **Drag/add legs on the payoff diagram; the piecewise-linear curve redraws live.** Manipulate: drag a leg card from the palette (call/put, strike, qty ±1) onto the diagram; tap a leg card then tap the strike axis to add; drag an existing leg's handle to reposition its strike; tap a leg's remove button to delete. Respond: the SVG piecewise-linear `S_T → payoff` curve is the live `spreadPayoff(legs, S_T)` (engine-exact) for every S_T; a draggable `markS` vertical marker at S_T=110 shows a live payoff readout; `headline` = `spreadPayoff(legs, markS)` as reduced "n/d" string, updated every frame; caps/kinks/break-points emerge automatically from the legs — the curve is the Σ of its legs. Loop: directed targets — (a) add long c(100) then short c(120) → watch the flat cap at 20 form; (b) remove the short leg → cap disappears, the curve becomes unbounded. **HERO block (beat-level fields; `optionBoard` is NOT a registered `HERO_TYPE` — hero treatment authored on the beat, not inherited):** `beat.hero:true`; `beat.slowFirst:true` → first leg-add triggers `--dur-tell` (600ms) slow-first gate showing the single-leg hockey-stick before the second leg snaps into place; `beat.structuralReadout:"the curve is the live sum of its legs — a flat cap at 20"` → overlay appears when the cap kink forms (after the second leg is added and the flat cap region emerges); `beat.reducedMotionFinalFrame:true` → render the completed bull-spread diagram at markS=110, headline="10", no animation | `optionBoard` `display:'payoffDiagram'` (`interactive:true`, HERO) | **NEW** (first `payoffDiagram` use) | ungraded HERO; target-completion line: "You built the spread — the curve caps at 20 because the short leg eats every dollar above 120." | leg-palette `<button>` ≥44×44px; tap-and-tap primary; drag = enhancement; keyboard: Tab between leg handles, Enter/Space add/remove a leg, Arrow keys adjust strike ±5; one `aria-live="polite" aria-atomic` mirror (narrates after each leg change): `"Position: long call K=100, short call K=120. At S_T=110 payoff = 10."`; `role=status` readout strip showing live payoff at markS; decorative SVG `aria-hidden`; sign/cap never color-only (text label + glyph) | `--dur-slow` curve redraw on each leg change; `--dur-tell` slow-first gate (first leg-add only); `--dur-base` headline/readout updates; `--ease-out`; reduced-motion → final frame (completed bull-spread at markS=110, headline="10"); compositor-only transforms | both |
| 4 | `opt3-model` | three lenses → `Σ qty·max(·,0)`; "short legs carry qty<0 — they subtract"; "caps & break-points draw themselves from the sum" (thin on-ramp, faded) | `primer`/`tripletReveal` (`introducesSymbol Σ qty·max(·,0)`, `groundedBy opt3-win`) | REUSE | converge: "Any multi-leg payoff is the sum — short legs subtract, so the gain caps where they meet." | tap `aria-expanded`; status line | reveal | both (`density:split` on A) |
| 5 | `opt3-win` | type bull-spread payoff at S_T=130 (expect **20**) and S_T=110 (expect **10**); leg table pre-displayed showing long c(100) → max(S_T−100,0) and short c(120) → −max(S_T−120,0) | `answerEntry` (required, `density:split`) | REUSE | goldens **20**, **10**; accept `["20"]`, `["10"]`; ladder + per-mistake (§ below); `assist.prefillLegTable` seeds per-leg max(·,0) values at each S_T | input `aria-label`; Enter | none | both |
| 6 | `opt3-gate` | label-stripped: "An investor is long c(100) and short c(120). What is the first move to find the cash payoff at S_T=130?" — choose one of `["Payoff construction", "Put–call parity", "No-arbitrage replication"]`; `gate.correct='payoff-construction'`, `optionMethods=['payoff-construction','put-call-parity','no-arbitrage-replication']` | `prediction` (`gate` block, required, `density:split`) | REUSE | byOption (§ below); density:split → hint un-strips one surface cue on second attempt | radiogroup; 44px; `aria-live` | none | both |
| 7 | `opt3-compare` | match 3 pairs: `{"Bull spread (long c100/short c120) at S_T=130"→"20"}`, `{"Straddle |S_T−100| at S_T=130"→"30"}`, `{"The shared move in both"→"sum each leg's max(·,0)"}` — one rule, two costumes | `retrievalGrid` (required, `density:split`) | REUSE | correct + hints (§ below) | tap-and-tap; `aria-live` mirror | match-snap | both |
| 8 | `transfer-heldout` | type strangle (long put(90)+long call(110)) payoff at S_T=130 / 100 / 70; position described label-stripped as "a position long put K=90 and long call K=110"; three input fields | `masteryChallenge` (`heldOut:true, required:false, density:split`) | REUSE | goldens **20**, **0**, **20**; accept `["20"]`,`["0"]`,`["20"]`; ladder + per-mistake (§ below); `assist.prefillLegSplit` reveals which leg is in-the-money at each S_T | per-field `aria-label`; Enter | none | **B** |
| 9 | `opt3-mastery` | **Part A** — butterfly (long c(90) / short 2·c(100) / long c(110)): type peak payoff at S_T=100 (accept `["10"]`) and wing payoff at S_T=90 (accept `["0"]`). **Part B** — no-arb price bound for the bull spread: type lower bound (accept `["0"]`) and upper bound (accept `["20"]`). Optional `spreadBounds(legs)` helper flagged for Dept 3. `density:split` | `masteryChallenge` (required, `density:split`) | REUSE | Part A goldens **10**, **0**; Part B goldens **0**, **20**; ladders + per-mistake (§ below); `assist.prefillToLastTerm` on the Σ leg sum | per-field `aria-label`; Enter | none | both |
| 10 | `opt3-recap` | recap: legs add (`Σ qty·max(·,0)`); caps & break-points draw themselves; price ∈ [0, K₂−K₁] bounded by no-arbitrage | `recap` (required) | REUSE | — | radiogroup | reveal | both |

## New interaction types (for Wave 0) — `optionBoard`

The single new discriminated-union member for the entire options concept. Four `display` modes folded under one `type`, matching the `covarianceBoard`/`chainBoard`/`stoppingBoard` precedent. **Frozen Wave-0 shape:**

```ts
z.object({
  type: z.literal('optionBoard'),
  display: z.enum(['payoffDiagram', 'binomialTree', 'parityScale', 'greeksSlider']),
  legs: z.array(z.object({                     // payoffDiagram / parityScale
    kind: z.enum(['call', 'put', 'stock', 'bond']),
    K: RationalSchema.optional(),
    qty: RationalSchema,                       // <0 = short
  })).optional(),
  tree: z.object({                             // binomialTree
    S0: RationalSchema, u: RationalSchema, d: RationalSchema,
    R: RationalSchema, K: RationalSchema,
    n: z.number().int(), kind: z.enum(['call', 'put']),
  }).optional(),
  sigma: RationalSchema.optional(),            // greeksSlider (display-only)
  markS: RationalSchema.optional(),            // S_T read-off marker
  labels: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),             // engine-reproducible anchor (validate-fixtures checks it; greeksSlider exempt)
})
```

**Per-display contract (L3 uses only `payoffDiagram`):**

- **`payoffDiagram` (L1, L3, L6):** `legs[]` (full compose — multiple call/put/stock legs, `qty<0=short`), `markS` (the S_T read-off), `headline` = `spreadPayoff(legs, markS)` as reduced "n/d" (engine-exact), `labels`, `interactive:true`. The piecewise-linear curve is the live Σ of leg payoffs; caps/kinks/break-points emerge from the legs. **L3 `opt3-explore` is the first use.**
- **`binomialTree` (L4, L5, L6):** `tree{...}`, `headline` = price or Δ.
- **`parityScale` (L2):** `legs[]` (C+K·D vs P+S), `headline` = `parityGap`.
- **`greeksSlider` (L5, L6):** `sigma` (illustrative continuous limit) — **DISPLAY-ONLY, never an `accept`.**

**NOT graded, NOT a `HERO_TYPE`.** Hero-vs-passive is carried by `beat.hero:true` + `beat.headline` (the engine-reproducible read-off), exactly the `covarianceBoard` precedent. The hero treatment for `opt3-explore` is authored on the beat as three beat-level fields the renderer reads — they are **not** part of the `optionBoard` interaction schema:
- `beat.slowFirst:true` → `--dur-tell` gate on first leg-add
- `beat.structuralReadout:"…"` → overlay copy string
- `beat.reducedMotionFinalFrame:true` → skip animation, render final state

**Renderer:** `OptionBoardBeat.tsx`, dispatch by `display`. `payoffDiagram` → `PayoffDiagramDisplay` (inline SVG + leg palette; no Konva). `CovarianceBoardBeat.tsx` is the a11y/motion precedent (44px buttons, single `aria-live="polite" aria-atomic` mirror, `role=status` readouts, `--dur-slow`/`--dur-tell`/`--dur-base`, `--ease-out`, reduced-motion final frame, compositor-only). `BeatView` dispatcher: `case 'optionBoard': return <OptionBoardBeat {...props}/>`. Engine dep: `src/engine/options.ts` → `spreadPayoff`, `legPayoff`. `validate-fixtures` cross-checks every `headline` against `spreadPayoff` (skips `greeksSlider`).

## Feedback + hint ladders

### `opt3-recall` (goldens 30, 0, 30)

Correct: "Single-leg payoffs from L1: call = max(S_T−K,0), put = max(K−S_T,0). Now we stack two."
- Hint ① which legs are in-the-money at each S_T? Recall the hockey-stick shape from L1.
- Hint ② long call(100) at 130: in-the-money (130>100), pays 130−100=30; at 70: OTM, pays 0. Long put(100) at 70: in-the-money (70<100), pays 100−70=30.
- Hint ③ **30**; **0**; **30** (`callPayoff(130,100)=30`, `callPayoff(70,100)=0`, `putPayoff(70,100)=30`).

### `opt3-bet` (byOption)

- **"30 — your long call pays 130−100=30; the upside is yours"** → *(a) unbounded:* "Let's test it — you **sold** the 120 call, so it pays you −(130−120) = −10. Net = 30 − 10 = **20**. The short leg caps every dollar above 120 (#9)."
- **"20 — the call you sold caps the gain at K₂−K₁ = 20"** → *(correct):* "Above 120 both legs move dollar-for-dollar and offset, freezing the spread at **20** (#9). Let's prove it leg by leg."
- **"0 — a long and a short call just cancel"** → *(d) over-cancellation:* "They only offset *above* 120. Between 100 and 120 the long leg is live and the short is worthless, so the spread climbs to its **20** cap there (#9). Partial cancellation, not total."

### `opt3-win` (goldens 20 at S_T=130; 10 at S_T=110)

Correct: "The short c(120) starts paying back at 120+: at 130 it costs −10, leaving 20; at 110 only the long is live, paying 10 (#9)."
- Hint ① apply the leg table: long c(100) pays max(S_T−100,0); short c(120) pays −max(S_T−120,0); sum them at each S_T.
- Hint ② at S_T=130: long pays 30, short pays −10; 30+(−10)=20. At S_T=110: long pays 10, short is OTM (pays 0); 10+0=10.
- Hint ③ **20** (`spreadPayoff([c100+1,c120−1], 130)=20`); **10** (`spreadPayoff([c100+1,c120−1], 110)=10`) (#9).
- Per-mistake **30** (at S_T=130): "That's the long call alone — you skipped the short c(120). The 120 call you sold costs −(130−120)=−10, so the net is **20** (#9)."
- Per-mistake **20** (at S_T=110): "That's the cap — but at 110 the short c(120) is OTM (pays 0). Only the long c(100) is live: 110−100=**10** (#9)."

### `opt3-gate` (byOption; foils are exactly `CONFUSABLE['payoff-construction']`)

- **"Put–call parity"** → "Parity (C−P=S−K) relates a call and a put **price** — there's no put in this position and you're asked for the **cash at expiry**, not a price relation. That's a payoff read, not parity." (refutes `put-call-parity`)
- **"No-arbitrage replication"** → "Replication builds a stock+bond book to **price** the position. The question wants the **payoff** (what it pays at S_T), which you read directly by summing each leg's max(·,0)." (refutes `no-arbitrage-replication`)
- **"Payoff construction"** → correct: add each leg's max(·,0) at S_T=130 (short legs subtract); leads to `spreadPayoff` = 20 (#9).

### `opt3-compare` (goldens 20, 30, "sum each leg's max(·,0)")

Correct: "One rule, two costumes — spreads cap the payoff, straddles open it both ways, but both add each leg's max(·,0). The method is the same; the position's shape is different."
- Hint ① match each value with its position type first — which one has the flat top? which one has the V-shape?
- Hint ② bull spread = long c(100)+short c(120): flat cap at 20 (at 130: 30−10=**20** #9). Straddle = long c(100)+long p(100): V-shape (at 130: 30+0=**30**, L1).
- Hint ③ **20**; **30**; **sum each leg's max(·,0)** — one `payoff-construction` schema, two costumes.

### `transfer-heldout` (#12 strangle, goldens 20, 0, 20)

Correct: "Strangle = long put(90) + long call(110) — a magnitude/volatility bet. Both legs are long (qty=+1, no subtraction). At 130: call pays 20, put OTM → 20. At 100: both OTM → 0. At 70: put pays 20, call OTM → 20 (#12)."
- Hint ① two **long** legs — both add (no negative qty here). Identify which leg is in-the-money at each S_T.
- Hint ② at 130: call(110) pays 130−110=20, put(90) is OTM (pays 0). At 70: put(90) pays 90−70=20, call(110) is OTM. At 100: both OTM, pays 0.
- Hint ③ 130→**20**; 100→**0**; 70→**20** (`spreadPayoff([put90+1,call110+1], ·)` golden, #12).
- Per-mistake "70→0" *(directional error):* "A strangle is a **magnitude** bet, not directional. The put(90) pays 90−70=**20** at 70 — a large downside move is as profitable as a large upside. Only the quiet middle pays 0 (#12)."
- Per-mistake "100→20" *(OTM confusion):* "At S_T=100 both legs are OTM: the put needs S_T<90, the call needs S_T>110. Neither pays; the strangle earns **0** in the quiet middle (#12)."

### `opt3-mastery` Part A — butterfly (goldens 10, 0)

Correct: "Long butterfly at S_T=100: long c(90) pays 10, short 2·c(100) pays 0 (ATM), long c(110) pays 0 — peak = 10. At wings S_T=90: all three OTM → 0 (#11)."
- Hint ① apply `Σ qty·max(·,0)` at each S_T, tracking all three legs separately.
- Hint ② at S_T=100: long c(90)=max(10,0)·1=10; short 2·c(100)=max(0,0)·(−2)=0; long c(110)=max(−10,0)·1=0; sum=10.
- Hint ③ peak=**10**; wing=**0** (`spreadPayoff([c90+1,c100−2,c110+1], ·)` golden, #11).
- Per-mistake **20** (peak): "That's the outer span K₃−K₁=110−90=20. The peak is the **wing width** K₂−K₁=100−90=**10** — the short middle pair (−2·c(100)) caps it there (#11)."
- Per-mistake **10** (wing, should be 0): "At the wing S_T=90: long c(90) is ATM (pays 0), short 2·c(100) is OTM (pays 0), long c(110) is OTM (pays 0). All three are out-of-the-money; the sum is **0** (#11)."

### `opt3-mastery` Part B — no-arb price bound (goldens 0, 20)

Correct: "The bull spread payoff ∈ [0, K₂−K₁]=[0,20] at every S_T, so by no-arbitrage the price is trapped in [0, 20] (#10)."
- Hint ① the price can't exceed the maximum possible payoff (no free lunch) and can't be negative (free money if it were).
- Hint ② max payoff = K₂−K₁=120−100=20 (when S_T≥120); min payoff = 0 (when S_T≤100); price ∈ [min payoff, max payoff].
- Hint ③ lower bound=**0**; upper bound=**20** (payoff envelope of `spreadPayoff`, #10).
- Per-mistake "lower bound > 0": "The payoff is exactly 0 at S_T=90, so a positive price would mean paying now to receive nothing — arbitrage. Lower bound is **0** (#10)."
- Per-mistake "upper bound > 20": "At no S_T does the spread pay more than K₂−K₁=**20** — the short leg eats every dollar above 120. Charging more than 20 today is a free lunch (#10)."

## Build decomposition (Technical Planner — for Dept 3)

### Engine fns + goldens

Primary fn: `spreadPayoff(legs: Leg[], ST: Rat): Rat` — `Σ qty·legPayoff(leg,ST)` (already in proposed `options.ts` surface). `legPayoff(leg: Leg, ST: Rat): Rat` (atomic helper).

Optional: `spreadBounds(legs: Leg[]): { lo: Rat; hi: Rat }` — evaluates the piecewise-linear envelope at the breakpoints (strikes) and endpoints to return `{lo:0, hi:K₂−K₁}`. Derivable from existing `spreadPayoff`; low-risk. **Flag for Dept 3:** add `spreadBounds` if the mastery-challenge bound-grading needs a programmatic check; otherwise the two hardcoded goldens (0 and 20) in the fixture are sufficient.

**Goldens (all exact integers; engine `spreadPayoff` in `src/engine/options.ts`):**

| position | call | golden | engine call |
|---|---|---|---|
| bull call spread | `spreadPayoff([{call,100,+1},{call,120,−1}], 130)` | **20** | `max(30,0)+(−max(10,0))=30−10=20` ✓ |
| bull call spread | `spreadPayoff([{call,100,+1},{call,120,−1}], 110)` | **10** | `max(10,0)+(−max(−10,0))=10+0=10` ✓ |
| bull call spread | `spreadPayoff([{call,100,+1},{call,120,−1}], 90)` | **0** | `max(−10,0)+(−max(−30,0))=0+0=0` ✓ |
| butterfly | `spreadPayoff([{call,90,+1},{call,100,−2},{call,110,+1}], 100)` | **10** | `10+(−2·0)+0=10` ✓ |
| butterfly | `spreadPayoff([{call,90,+1},{call,100,−2},{call,110,+1}], 90)` | **0** | `0+(−2·0)+0=0` ✓ |
| strangle | `spreadPayoff([{put,90,+1},{call,110,+1}], 130)` | **20** | `max(−40,0)+max(20,0)=0+20=20` ✓ |
| strangle | `spreadPayoff([{put,90,+1},{call,110,+1}], 100)` | **0** | `max(−10,0)+max(−10,0)=0+0=0` ✓ |
| strangle | `spreadPayoff([{put,90,+1},{call,110,+1}], 70)` | **20** | `max(20,0)+max(−40,0)=20+0=20` ✓ |
| explore headline | `spreadPayoff([{call,100,+1},{call,120,−1}], 110)` | **10** → `headline:"10"` | confirmed ✓ |

Every graded `accept` and `headline` is an exact integer with n,d < 1000 — `BigRational`-safe with no overflow risk in L3 (the reconciliation flag matters more for L4/L5 tree denominators).

**`BigRational ↔ RationalSchema` reconciliation flag:** `options.ts` should use local `BigRational {n:bigint; d:bigint}` (same as `optimalStopping.ts`/`combinatorics.ts`); the fixture `RationalSchema` is `z.number().int()`. Wave-0/Dept-3 resolve once, shared with the identical covariance-concept flag.

### Schema variant

`optionBoard` — new discriminated-union member (see New Interaction Types section for full Zod shape). Add to `InteractionSchema` in `src/content/schema.ts`. First introduced in this lesson (`payoffDiagram` mode).

### Renderer/widget + props

`OptionBoardBeat.tsx` → `PayoffDiagramDisplay` (inline SVG, leg palette). Props consumed by L3: `legs`, `markS`, `headline`, `labels`, `interactive:true`. SVG axis spans S_T ≈ 50–200; piecewise-linear curve sampled at all strike breakpoints plus the axis endpoints. Leg palette: `<button>` cards ≥44×44px for add/remove. Drag: SVG `onPointerDown/Move/Up` + keyboard fallback (Tab/Enter/Space/Arrow). `CovarianceBoardBeat.tsx` is the binding a11y/motion precedent.

Beat-level hero fields the renderer reads (not part of `optionBoard` schema): `beat.slowFirst`, `beat.structuralReadout`, `beat.reducedMotionFinalFrame`.

### Fixture fields per beat

- **`opt3-explore`:** `{ type:'optionBoard', display:'payoffDiagram', legs:[{kind:'call',K:100,qty:1},{kind:'call',K:120,qty:-1}], markS:110, headline:"10", interactive:true, labels:["S_T","payoff"] }`; beat-level: `hero:true, slowFirst:true, structuralReadout:"the curve is the live sum of its legs — a flat cap at 20", reducedMotionFinalFrame:true`
- **`opt3-recall`:** `retrievalGrid` accepts `["30"]`, `["0"]`, `["30"]`
- **`opt3-win`:** `answerEntry` accepts `["20"]`, `["10"]`; `density:'split'`; `assist:{ prefillLegTable:true }`
- **`opt3-gate`:** `prediction.gate`; `options:["Payoff construction","Put–call parity","No-arbitrage replication"]`; `gate:{ kind:"which-method", correct:"payoff-construction", optionMethods:["payoff-construction","put-call-parity","no-arbitrage-replication"] }`; `density:'split'`; `schemaId:"payoff-construction"`
- **`opt3-compare`:** `retrievalGrid` accepts `["20"]`, `["30"]`, `["sum each leg's max(·,0)"]`; `density:'split'`; `schemaId:"payoff-construction"`
- **`transfer-heldout`:** `masteryChallenge` accepts `["20"]`,`["0"]`,`["20"]`; `heldOut:true, track:'B', required:false, density:'split'`; `assist:{ prefillLegSplit:true }`; `schemaId:"payoff-construction"`
- **`opt3-mastery`:** `masteryChallenge` Part A accepts `["10"]`,`["0"]`; Part B accepts `["0"]`,`["20"]`; `density:'split'`; `assist:{ prefillToLastTerm:true }`; `schemaId:"payoff-construction"`

### Validation anchors

- `validate-fixtures` cross-checks every `optionBoard` `headline` against `spreadPayoff(legs, markS)` (skip `greeksSlider` display).
- `options.test.ts` golden table reproduces all 8 `spreadPayoff` values + `headline:"10"` above.
- Wave-0 wiring: add `lesson-options-3` to `GATED` + `MASTERY_LESSONS` in `scripts/validate-fixtures.ts`; add `optionBoard` to `InteractionSchema` + `BeatView` dispatcher (`src/lesson/beats/index.tsx`); register `payoff-construction` (+ `CONFUSABLE` edges: `['put-call-parity','no-arbitrage-replication']`) in `src/content/methods.ts`; add `lesson-options-3 → ch-options-2` in `src/content/chapters.ts`.

## Definition-of-Ready checklist

| beat | verified + sourced (cite #) | concrete direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px / reduced-motion / aria-live) | graded carries schemaId + (capped) assist/hintCapOverride + density |
|---|---|---|---|---|---|
| `opt3-recall` | ✅ L1 payoff goldens (`callPayoff`, `putPayoff`) | ✅ grid match | ✅ 3-level ladder | ✅ | ✅ `payoff-construction`; hints gated behind attempt |
| `opt3-bet` | ✅ #9 | ✅ choice + byOption refute | ✅ byOption (3 options) | ✅ | — (ungraded) |
| `opt3-explore` | ✅ #9 (`headline:"10"` engine-verified) | ✅ drag/add legs, live piecewise-linear curve (STRONG fit — caps/break-points emerge from the composition in real time) | ✅ ungraded hero; target-completion line | ✅ | — (ungraded HERO) |
| `opt3-model` | ✅ #9/#11 | ✅ tripletReveal | ✅ | ✅ | — (ungraded) |
| `opt3-win` | ✅ #9 (20, 10) | ✅ type-in per S_T | ✅ 3-level ladder + per-mistake | ✅ | ✅ `payoff-construction`; `density:split`; `assist.prefillLegTable` |
| `opt3-gate` | ✅ #9 | ✅ label-stripped which-method | ✅ byOption (3 foils) | ✅ | ✅ `payoff-construction`; `density:split`; hint un-strips one surface cue |
| `opt3-compare` | ✅ #9 + L1 straddle | ✅ grid match (two costumes, one schema) | ✅ 3-level ladder | ✅ | ✅ `payoff-construction`; `density:split` |
| `transfer-heldout` | ✅ #12 (20, 0, 20) | ✅ type-in (3 fields) | ✅ 3-level ladder + per-mistake | ✅ | ✅ `payoff-construction`; `heldOut:true required:false`; `density:split`; `assist.prefillLegSplit` |
| `opt3-mastery` | ✅ #11 (10, 0) + #10 (0, 20) | ✅ multi-part type-in (4 fields) | ✅ 3-level ladders + per-mistake (each part) | ✅ | ✅ `payoff-construction`; `density:split`; `assist.prefillToLastTerm` |
| `opt3-recap` | ✅ | ✅ | ✅ | ✅ | — (ungraded) |

**DoR holds for all L3 beats.**

## Lesson-level LS checklist (§6)

- **§2.1** ✅ Every graded beat (`opt3-recall`, `opt3-win`, `opt3-gate`, `opt3-compare`, `transfer-heldout`, `opt3-mastery`) carries `schemaId:'payoff-construction'`, a valid `METHODS` id (Wave-0 addition; `domains:['options']`). Beat titles are surface-only ("Stack two legs", "Which first move?", "What's the same?", "Compose & bound"); no method leaks through labels, headings, or beat titles on any graded beat. Gate `options[]` labels name the methods only because labeling is the task (spec-13 — required for the discrimination).

- **§2.2** ✅ `opt3-gate` is a graded `prediction.gate`; `gate.correct='payoff-construction'` = `schemaId`; distractors `['put-call-parity','no-arbitrage-replication']` are **exactly** `CONFUSABLE['payoff-construction']` (no random foils); prompt is label-stripped (unlabeled long c(100)/short c(120) position). Opening `opt3-bet` is a plain ungraded `prediction` with **NO gate** (exempt by design, §2.4).

- **§2.3** ✅ `transfer-heldout` is `heldOut:true, track:'B', required:false`; `schemaId='payoff-construction'` = mastery method; **visibly fresh surface** (#12 strangle — a put + a call, V-floor on both sides, distinct from the one-sided bull-spread cap and from the butterfly); placed **immediately before** `opt3-mastery`; engine-verified 20/0/20 (all confirmed against `spreadPayoff` golden).

- **§2.4** ✅ `opt3-gate` (which-method gate) and `opt3-mastery` are graded checkpoints (confidence-eligible); `opt3-bet` is a plain ungraded `prediction` (no gate, exempt by design). ≥1 cold graded checkpoint present.

- **§2.5** ✅ Opens cold with `opt3-recall` — graded retrieval of L1 single-leg payoffs (gap +2 lessons); worked solution is gated behind the hint-ladder attempt (3-level ladder, answer revealed only at Hint ③).

- **§2.6** ✅ Every capped graded beat has `density:'split'` + an `assist`/`hintCapOverride` path: `opt3-win` → `assist.prefillLegTable`; `opt3-gate` → hint un-strips one surface cue; `opt3-compare` → `density:split` (grid scaffolding); `transfer-heldout` → `assist.prefillLegSplit`; `opt3-mastery` → `assist.prefillToLastTerm`. No capped beat dead-ends when the governor fades scaffolding. Authored for ~50–85% success.

- **§2.7** ✅ `opt3-recall` re-surfaces L1 payoffs (overlap → recall, gap +2); `opt3-compare` is the explicit **"same method, different costume"** beat (bull-spread vs straddle, one `payoff-construction` schemaId, asks *what's the same?* — abstracts the schema, not the story). Gate foils are drawn **only** from `CONFUSABLE['payoff-construction']` = `['put-call-parity','no-arbitrage-replication']`, never random.

- **§2.8** ✅ `opt3-model` is the thin first-contact primer for `Σ qty·max(·,0)` (`density:split` on Track A, fades to `merged` from `opt3-win` on). Single-leg `max(·,0)` is treated as an overlearned speed primitive (recalled cold at `opt3-recall`, not re-taught). No cold retrieval of a schema that hasn't been encoded.

- **§2.9** ✅ All bet and gate feedback is `byOption` refutational, names the specific wrong mental model each distractor encodes, is task-/process-level and feed-forward ("here's the next move"). No person-level verdict anywhere. Mastery per-mistake feedback targets the misconception directly (b: butterfly peak = outer span; c: strangle is directional; d: sign on short legs).

**§6 fully holds for `lesson-options-3`.**

---

### optionBoard prop gap check

No prop gap for `payoffDiagram`. The frozen schema supplies all required fields: `legs[]` (full compose), `markS` (S_T read-off), `headline` (engine-reproducible), `interactive`, `labels`. Hero treatment fields (`slowFirst`, `structuralReadout`, `reducedMotionFinalFrame`) are beat-level, not schema-level — no schema extension needed. The `headline` field is the single engine-anchored validation hook; `validate-fixtures` cross-checks it against `spreadPayoff(legs, markS)`.
