# Interaction Spec — `lesson-options-6`: Synthesis: Hedging, Greeks & In the Wild (capstone)

> Stage-2 Dept-2. Design-only — NO production code. Cumulative interleaved capstone (states-streaks /
> covariance-6 shape: two required `retrievalGrid` openers before the bet + a multi-part `masteryChallenge`
> forcing tool-selection). Explore hero = `optionBoard display:'greeksSlider'` DISPLAY-ONLY (sweep σ/S; Greek
> signs hold/flip; every magnitude a `ratToNumber` reference; no graded headline). Key goldens:
> `hedgeRatio(6,9)=`**2/3**, `hedgeRatio(−6,9)=`**−2/3** (#21); `minVarWeights={wA:6/7,wB:1/7,varMin:27/700}`
> (#22, held-out); Greek signs call Δ **+**, put Δ **−**, Γ **+**, vega **+**, Θ **−**; one-touch
> `oneTouchPrice(5/4)=`**4/5**, `oneTouchPrice(2)=`**1/2**; mastery Part B `replicate(...).delta=`**1/2**.
> Synthesis headline: the option **delta = the Cov/Var hedge ratio**, re-struck each step.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `opt6-recall` | Cumulative cold match: drag/tap 3 cards (Var(X+Y)=Var+Var+2Cov · h\*=Cov/Var=−2/3 · σ=spread) to their values. Respond: each correct pair snaps and checks; wrong pairs stay loose. Loop: retry mismatched cards until all land. | `retrievalGrid` (`required`) | REUSE | correct: "Every hedge prereq from the arc: Var(X+Y)=Var+Var+2Cov, h\*=Cov/Var=−2/3, σ=SD=spread." Hints below. | tap-and-tap ≥44px; `aria-live="polite"` | match-snap | both |
| 2 | `opt6-mixed` | Second cold match: drag/tap 4 **unlabeled** arc results (payoff 30 · no-arb gap 1 · q 1/2 · 2-step price 11) to their quantity type. No method labels in the prompt. Respond: snap+check per pair. Loop: retry mismatched cards. | `retrievalGrid` (`required`) | REUSE | correct: "One spine per card: payoff 30 = piecewise-linear read; gap 1 = parity no-arb; q=1/2 = risk-neutral measure; 11 = backward fold." Hints below. | tap-and-tap ≥44px; `aria-live="polite"` | match-snap | both |
| 3 | `opt6-bet` | Tap one of 3 options (prediction, **no gate**): "No — unrelated; one is statistics, the other is calculus (∂V/∂S)." / "Yes — but only by coincidence at one price." / "Yes — the delta is h=Cov/Var, re-struck each step." Respond: byOption refutation shown immediately. Loop: — (single ungraded choice). | `prediction` (byOption, **no gate**, ungraded) | REUSE | byOption copy (below); ungraded. | radiogroup ≥44px | none | both |
| 4 | `opt6-explore` | **HERO DISPLAY-ONLY.** Drag the σ-slider (native `range`, arrow-key steps) and the S-sweep marker → the Black-Scholes delta-curve and Greek sign readouts update live. Read: call Δ stays +(0,1); put Δ stays −(−1,0); Γ, vega stay +; Θ stays −. Loop: sweep the full σ/S range; observe signs hold even as magnitudes vary continuously. | `optionBoard` `display:'greeksSlider'` (`interactive:true`, **hero**) | REUSE (`optionBoard` type introduced upstream L1/L4/L5; `greeksSlider` mode in L5) | Settle line: "Signs hold across all σ and S — the sign is the thing you can bet your book on. Magnitudes (Δ=N(d₁), Γ, vega, Θ) are display-only." Ungraded. | Native `range` inputs for σ and S (arrow keys); `role=status` readouts; exactly one `aria-live="polite" aria-atomic` mirror: `"σ=…, S=…: call Δ sign +, put Δ sign −, Γ sign +, vega sign +, Θ sign −. Magnitudes display-only."`; decorative SVG curves `aria-hidden`; sign label = glyph **+** word (never color-only); **reduced-motion → final static frame** | σ-curve morphs with `--dur-slow` stroke-dashoffset `--ease-out`; S-marker slides with `--dur-base`; sign glyphs lock on first valid render; reduced-motion → show final frame immediately; compositor-only | both |
| 5 | `opt6-win` | Type the min-variance hedge ratio for two inputs: Cov=6, Var=9 → h\*=? (then sign-flip: Cov=−6 → h\*=?). Submit → instant check. Loop: 3-level hint ladder; Enter to submit. | `answerEntry` | REUSE | golden **2/3**; **−2/3**; accept `["2/3"]` / `["-2/3","−2/3"]`; ladder below; per-mistake 9/6 (inverted) and 6 (reported Cov). | `aria-label` per field; Enter submits; `role=status` readout | none | both |
| 6 | `opt6-gate` | Tap one of 4 **label-stripped** options (surface story only: "A desk is long one option and wants the number of shares to short **right now** so the book barely moves on small wiggles. Which tool gives that number?"). Method names hidden. Respond: per-option refutation; gate blocks advance until correct. Loop: `required` — keeps presenting until `delta-hedging` selected. | `prediction` (`gate`, `required`) | REUSE | `gate.correct='delta-hedging'`; foils `['linearity-indicators','no-arbitrage-replication','binomial-pricing']` (all ⊂ `CONFUSABLE['delta-hedging']`); byOption copy below; `--dur-tell` slow-first reveal. | radiogroup ≥44px; `role=status`; `aria-live="polite"` on gate reveal; Enter | `--dur-tell` slow-first gate-door open `--ease-out` | both |
| 7 | `opt6-greeksigns` | For each of 5 Greeks (call Δ · put Δ · Γ · vega · Θ): tap one button in a **+/0/− segmented selector** (3-button `role=radiogroup` per Greek). Respond: per-field instant correct-flash or refutation; wrong field shakes. Loop: revisit any wrong field; all 5 correct to advance. | `answerEntry` (5-field; each field rendered as a +/0/− `role=radiogroup` with three `role=radio` buttons ≥44px) | REUSE (new rendering affordance note — see §New types) | per-field accepts: call Δ `["+","+1"]`; put Δ `["−","-","-1","−1"]`; Γ `["+","+1"]`; vega `["+","+1"]`; Θ `["−","-","-1","−1"]`; graded against `greekSign(...)∈{-1,0,1}`; per-field refutation copy below. | Every button ≥44px; `role=radio` in `role=radiogroup`; `aria-label="[Greek name] sign: + / 0 / −"`; one `aria-live="polite" aria-atomic` mirror narrating each field result; sign label = glyph **+** word ("positive"/"negative"), never color-only. | per-field snap-lock on correct with `--dur-base`; wrong field shakes with `--dur-base`; glyph + word label always visible; compositor-only | both |
| 8 | `opt6-exotic` | Type the one-touch digital price for H=5/4 (→4/5) and then H=2 (→1/2). Given: martingale S₀=1, r=0, pays $1 first time S hits H; replicate by buying 1/H shares. Submit → instant check. Loop: 3-level hint ladder. | `answerEntry` | REUSE | golden **4/5** / **1/2**; accept `["4/5","0.8",".8"]` / `["1/2","0.5",".5"]`; ladder below; per-mistake H itself (5/4 or 2). | `aria-label` per field; Enter; `role=status` | none | both |
| 9 | `transfer-heldout` | Type w_A (→6/7), w_B (→1/7), and min Var (→27/700) for the two-stock min-variance portfolio (#22: Var_A=1/25, Var_B=9/100, Cov=3/100). Respond: per-field instant check. Loop: 3-level hints; `heldOut` beat excluded from visible/required walk. | `masteryChallenge` (`heldOut:true, required:false`) | REUSE | golden **6/7** / **1/7** / **27/700**; accept `["6/7"]` / `["1/7"]` / `["27/700"]`; ladder below; most-likely-wrong σ=√(27/700) — DISPLAY-ONLY, **never accept**. | per-field `aria-label`; Enter; `aria-live="polite"` per field | none | B |
| 10 | `opt6-mastery` | **Part A:** type the min-variance hedge h\*=Cov/Var on the #21 numbers re-struck as the dynamic option Δ (Cov=6, Var=9 → 2/3 = today's delta). **Part B:** from the canonical tree (handed C_u=20, C_d=0, S=100, u=6/5, d=4/5, R=1, K=100), type the risk-cancelling **share count** Δ — NOT the price. Respond: per-part instant check; `density:'split'` segments the two parts. Loop: 3-level hints per part. | `masteryChallenge` (`required`, `density:'split'`) | REUSE | Part A golden **2/3** accept `["2/3"]`; Part B golden **1/2** accept `["1/2","0.5",".5"]`; ladders + per-mistake below. | per-field `aria-label`; Enter; `aria-live="polite"` | none | both |
| 11 | `opt6-recap` | Tap through 5 recap cards (payoff · parity/no-arb · q-price · tree · delta) revealing the one-toolkit synthesis frame: "One connected set of moves, told apart on sight — method = what the question asks for." Loop: done when all 5 revealed. | `recap` (`required`) | REUSE | — | tap ≥44px; `aria-expanded` per card; `role=status` | reveal per card | both |

## New interaction types (for Wave 0)

`optionBoard` is the **single new discriminated-union member** for this concept (introduced in L1/L4/L5). L6 uses only the `greeksSlider` display mode. Four `display` values are folded under one schema member — the `chainBoard` / `covarianceBoard` / `stoppingBoard` precedent. `optionBoard` is **not graded** and **not a `HERO_TYPE`** (the hero is set via `beat.hero:true` on the beat, not on the schema type).

### `greeksSlider` (L6 hero, DISPLAY-ONLY)

Props used in L6:

```ts
{
  type: 'optionBoard',
  display: 'greeksSlider',
  sigma: RationalSchema,       // initial σ value; the σ-slider sweeps continuously
  markS: RationalSchema,       // initial S marker; the S-sweep slider repositions it
  tree?: { S0, u, d, R, K, n, kind },  // optional: anchors the curve at the rational binomial grid
  interactive: true,           // enables live σ/S sliders
  headline?: string,           // EXEMPT from validate-fixtures engine cross-check (greeksSlider is display-only)
                               // may be omitted; any number printed is a ratToNumber sourced reference
}
```

**Key constraints — every graded path goes through `answerEntry`/`masteryChallenge`, never through the board:**
- **No `accept`** on the `opt6-explore` beat — greeksSlider is entirely ungraded
- **No engine-checked `headline`** — the `validate-fixtures` cross-check block skips `greeksSlider` (or the field is omitted)
- **Every printed magnitude** (Δ=N(d₁), Γ, vega, Θ, any BS price) is behind the `ratToNumber` display-only boundary; these values are sourced references, never graded inputs
- **Greek signs** are narrated qualitatively in the `aria-live` mirror; the **graded sign values** live on `opt6-greeksigns` (`answerEntry` + the +/0/− selector vs `greekSign()`), never on the board

**The +/0/− segmented selector for `opt6-greeksigns`** is a **rendering variant of the existing `answerEntry` type** — 5 per-field `role=radiogroup`s each with three `role=radio` buttons ("+", "0", "−") ≥44px, labeled with glyph + word. Accept tokens map to `+1`/`0`/`-1` for comparison with `greekSign()` output. This is **not a new schema type** — it is `answerEntry` with `inputStyle:'signSelector'` (or an equivalent renderer hint field).

**Shape requirements (no schema change needed):**
- Two required `retrievalGrid` openers before the bet: `lesson-states-streaks.json` and `lesson-covariance-6.json` already ship this exact shape — no runner change needed
- A `heldOut:true required:false` `masteryChallenge` immediately before the required `masteryChallenge`: both states-streaks and covariance-6 ship this shape — low risk, no schema change required

## Feedback + hint ladders

**`opt6-recall` (goldens: Var+Var+2Cov; h\*=Cov/Var=−2/3; σ=spread):** correct: "Every load-bearing prereq for the capstone: Var(X+Y)=Var+Var+2Cov (the cross term), the min-variance ratio h\*=Cov/Var=−2/3, and σ=SD=the spread." Hints ① each card is the headline from a different prior lesson ② Var(X+Y) adds a 2Cov cross term (not just two variances); h\* has the variance of the short leg in the denominator; σ is the standard deviation, not the variance ③ **Var+Var+2Cov** (`cov3-win`); **−2/3** (`cov5-win`); **spread** (`cov1`).

**`opt6-mixed` (goldens: 30, 1, 1/2, 11):** correct: "One method per spine: payoff 30 is a piecewise-linear read (max(130−100,0)); gap 1 is the no-arb parity shortfall; q=1/2 is the risk-neutral probability; 11 is the two-step backward fold." Hints ① no method labels — identify by what *type* of quantity it is (a cash payoff? a probability? a price?) ② payoff = max expression at a point; gap = C−P−(S−K); q=(R−d)/(u−d); 2-step price = (1/R²)·Σweight·payoff ③ **30** (#1); **1** (#7); **1/2** (#13); **11** (#17).

**`opt6-bet` (byOption):**
- "No — unrelated; one is statistics, the other is calculus (∂V/∂S)." → *"Let's test it — they're the same move in two costumes. The delta IS the share count that makes a hedged book locally riskless, exactly what h=Cov/Var does, only re-struck each step as S moves. (#21)"* (false)
- "Yes — but only by coincidence at one price." → *"Closer — but it's not a coincidence. Delta IS the (instantaneous) Cov/Var hedge ratio; the tree's Δ=(C_u−C_d)/(S(u−d)) is that ratio for the next step. (#21, #13)"* (false)
- "Yes — the delta is h=Cov/Var, re-struck each step." → *"Exactly — one risk-cancelling ratio, two surfaces. The capstone proves it on #21 (h=2/3) and the canonical tree (Δ=1/2)."* (true)

**`opt6-win` (goldens: 2/3, −2/3):** correct: "h\*=Cov/Var=6/9=2/3; flip the sign with Cov=−6 → −2/3. One division; the sign follows the direction of the covariance." Hints ① h = Cov ÷ Var, one division ② 6÷9=2/3; Cov=−6 → −2/3; do NOT report Cov alone or invert the ratio ③ **2/3** and **−2/3** (#21, GB §4.5 p.48). Per-mistake **`9/6`/`3/2`** (inverted ratio): *"You divided Var by Cov instead of Cov by Var. h\*=Cov/Var=(6)/(9)=2/3, not 9/6=3/2. The short-leg variance is the denominator. (#21)"* Per-mistake **`6`** (reported Cov): *"That's the numerator — but h\* is a ratio: Cov/Var=6/9=2/3. Divide by the variance of the short leg. (#21)"* Note: floats (0.666…) are not accepted — h\*=2/3 is non-terminating.

**`opt6-gate` (byOption, label-stripped; correct = `delta-hedging`):**
- **Delta hedging** → *"Right — the risk-cancelling share count is the delta = the Cov/Var hedge ratio, re-struck each step."* (correct)
- **Linearity / indicators** → *"That averages payoffs as a linear combination — an expected value, not a share count. The question asks how many shares to short, not what the option is worth. (delta-hedging)"* (false)
- **No-arbitrage replication** → *"Static replication rebuilds the whole {Δ shares + bond} to PRICE the option; here you only need today's risk-cancelling share count — that's the delta itself. (delta-hedging)"* (false)
- **Binomial pricing** → *"Re-pricing the tree gives the option's VALUE, not its hedge. Choose by what's asked: a risk-cancelling share count = delta-hedging (Cov/Var), not re-pricing. (#21)"* (false)

**`opt6-greeksigns` (per-field refutations; accepted tokens: `["+","+1"]` / `["−","-","-1","−1"]`):**
- **call Δ** (correct `+`): if `−` entered → *"A call GAINS value as the stock rises — its delta is **positive**, ∈(0,1). (`greekSign('delta','call')=+1`)"*
- **put Δ** (correct `−`): if `+` entered → *"A put LOSES value as the stock rises — its delta is **negative**, ∈(−1,0). (`greekSign('delta','put')=−1`)"*
- **Γ** (correct `+`): if `−` entered → *"A long option has **positive** gamma — the value curve bends upward; convexity is on your side. (`greekSign('gamma',·)=+1`)"*
- **vega** (correct `+`): if `−` entered → *"A long option gains value as volatility rises — vega is **positive**. (`greekSign('vega',·)=+1`)"*
- **Θ** (correct `−`): if `+` entered → *"Long options bleed time value: theta is **negative** for a long position. (`greekSign('theta',·)=−1`)"*
- Greek **magnitudes** (N(d₁), Γ, vega, Θ) remain display-only on the `greeksSlider` — grade the sign, never the number.

**`opt6-exotic` (goldens: 4/5 for H=5/4; 1/2 for H=2):** correct: "Martingale S₀=1, r=0: replicate a $1-at-H payout by buying 1/H shares at price S₀=1. Replicating cost = price = 1/H." Hints ① martingale + r=0: what portfolio costs $1 when S first reaches H? ② buy 1/H shares at S₀=1; the replicating cost IS the no-arb price; price=1/H, not 1−1/H ③ H=5/4 → **4/5**; H=2 → **1/2** (GB §6.2 p.75 L11741). Per-mistake **`5/4`/`2`** (reports H): *"That's the barrier H itself — the price is 1/H, the cost of the replicating portfolio (1/H shares at S₀=1). (#exotic)"* Per-mistake **`1/5`** or `1-1/H` variants: *"Check: 1÷(5/4) = 4/5, not 1/5. Dividing by a fraction inverts it — 1/(5/4)=4/5. (#exotic)"*

**`transfer-heldout` (#22 goldens: w_A=6/7, w_B=1/7, min Var=27/700):** correct: "Same Cov/Var minimization restruck as portfolio weights: w_A=(Var_B−Cov)/(Var_A+Var_B−2Cov)=(9/100−3/100)/(1/25+9/100−6/100)=(6/100)/(7/100)=6/7; w_B=1−w_A=1/7; min Var=27/700." Hints ① same h=Cov/Var structure — now solve for the weight in the two-asset portfolio ② w_A=(Var_B−Cov)/(Var_A+Var_B−2Cov); w_B=1−w_A; min Var=w_A²·Var_A+w_B²·Var_B+2w_Aw_B·Cov ③ **6/7** in A, **1/7** in B; Var=**27/700** (#22, GB §6.4 p.82-83). Most-likely wrong — **σ=√(27/700)** (reporting the standard deviation instead of the variance): *"Min-variance is 27/700 — that's the **variance** (the quantity the Cov/Var algebra produces directly). The SD=√(27/700) is irrational and is display-only; never a graded answer. Grade the variance, not the root. (#22)"* Per-mistake swapped weights: *"Check which asset has lower variance: σ_A=20% < σ_B=30%, so A is the safer leg — w_A=6/7 is the **larger** weight. Swapping them raises variance. (#22)"*

**`opt6-mastery` Part A (golden: 2/3; the §2.7 costume change):** correct: "h\*=Cov/Var IS today's option delta — the same risk-cancelling share count, one method in two costumes. Cov=6, Var=9 → Δ=h\*=2/3." Hints ① the bet proved it: the option delta IS the Cov/Var hedge ratio, re-struck each step ② same formula as `opt6-win`; now read it as the option's dynamic Δ, not just a static hedge ③ **2/3** (#21). Per-mistake **`9/6`** (inverted): *"Var is the denominator, Cov is the numerator. Δ=h\*=Cov/Var=6/9=2/3. (#21)"*

**`opt6-mastery` Part B (golden: 1/2; the discrimination):** correct: "Δ=(C_u−C_d)/(S(u−d))=(20−0)/(100·(6/5−4/5))=20/20=1/2. The desk wants the risk-cancelling **share count**, not the price (which would be 10)." Hints ① the gate told you: a risk-cancelling share count = delta-hedging, not re-pricing ② Δ=(V_u−V_d)/(S(u−d)); you are given C_u=20, C_d=0 ③ 20/(100·2/5)=20/20=**1/2** (#mastery, GB §6.1+§5.3). Per-mistake **`10`** (re-priced the tree): *"You re-priced the option (price=10), not the hedge. The question asks for the **share count** that cancels risk — Δ=(C_u−C_d)/(S(u−d))=1/2, not the price. This is the gate misconception (d) live: re-pricing gives value, delta-hedging gives the share count. (#mastery)"*

## Build decomposition (Technical Planner — for Dept 3)

**Engine fns (`src/engine/options.ts` — exact `BigRational {n:bigint; d:bigint}`, no floats):**

| fn | signature | golden (exact rational, engine-reproducible) |
|---|---|---|
| `hedgeRatio` | `(cov: Rat, varB: Rat): Rat` | `hedgeRatio(6,9)=`**2/3**; `hedgeRatio(−6,9)=`**−2/3** (#21) |
| `minVarWeights` | `(varA, varB, cov: Rat): {wA, wB, varMin: Rat}` | `{wA:`**6/7**`, wB:`**1/7**`, varMin:`**27/700**`}` (#22) |
| `oneTouchPrice` | `(H: Rat): Rat` — 1/H | `oneTouchPrice(5/4)=`**4/5**; `oneTouchPrice(2)=`**1/2** |
| `greekSign` | `(greek: 'delta'\|'gamma'\|'theta'\|'vega'\|'rho', kind: Kind): -1\|0\|1` | call Δ=**+1**, put Δ=**−1**, Γ=**+1**, vega=**+1**, Θ=**−1** |
| `replicate` | `(S,u,d,R,K,kind): {delta: Rat, bond: Rat}` | `replicate(100,6/5,4/5,1,100,'call').delta=`**1/2** |
| `blackScholesCall` | `(S,K,r,sigma,T): number` | **DISPLAY-ONLY** — `ratToNumber` sourced reference; never an `accept` |
| `continuousGreek` | `(...): number` | **DISPLAY-ONLY** — Δ=N(d₁), Γ, vega, Θ; never an `accept` |

**Forbidden in any `accept`:** `σ=√(27/700)` (irrational root), any `blackScholesCall(...)` output, any `continuousGreek(...)` magnitude, `9/6`/`3/2` (inverted hedge), `10` (re-priced tree).

**`BigRational ↔ RationalSchema` reconciliation flag:** existing `RationalSchema` is `z.number().int()`; `options.ts` should use `BigRational {n:bigint; d:bigint}` (as `optimalStopping.ts`/`combinatorics.ts`) with a `ratToNumber` display escape. Flag to Wave-0/Dept-3: resolve once, shared with the covariance engine.

**Schema variant:**
- `greeksSlider` display mode of the existing `optionBoard` union member — **DISPLAY-ONLY**; its `headline` field is **EXEMPT** from the `validate-fixtures` engine cross-check block (or may be omitted)
- Two required `retrievalGrid` openers before the bet: runner already supports this (states-streaks / covariance-6 shapes) — **no schema change**
- `heldOut:true required:false` `masteryChallenge` immediately before the required `masteryChallenge`: also the existing states-streaks / covariance-6 shape — **no schema change**

**Renderer/widget + props:**
- `OptionBoardBeat.tsx` → `GreeksSliderDisplay` (σ-slider, S-sweep, live curve computed via `ratToNumber` + `continuousGreek`; `aria-live` mirror; decorative SVG `aria-hidden`; reduced-motion → final static frame)
- +/0/− sign selector for `opt6-greeksigns`: rendered by `answerEntry` variant — 5 per-field `role=radiogroup`s each with three `role=radio` buttons ("+", "0", "−") ≥44px; `aria-label="[Greek name] sign"`; token accept maps `+`/`+1`→`+1`, `−`/`-`/`-1`/`−1`→`-1`, `0`→`0` for comparison against `greekSign()` output. **Not a new schema type** — `answerEntry` with `inputStyle:'signSelector'` (or equivalent renderer-hint field)
- `masteryChallenge` `density:'split'`: standard segmented Part A / Part B (existing covariance-6 pattern)

**Fixture fields per beat:**

| beat | accept strings | headline | notes |
|---|---|---|---|
| `opt6-recall` | exact-string retrieval-grid right-card matches | n/a | schemaId `linearity-indicators` |
| `opt6-mixed` | exact-string retrieval-grid right-card matches | n/a | schemaId `binomial-pricing` |
| `opt6-bet` | — (no accept) | none (ungraded) | `prediction` byOption, no gate |
| `opt6-explore` | — (no accept) | EXEMPT or omitted | hero `optionBoard greeksSlider`; ungraded DISPLAY-ONLY |
| `opt6-win` | `["2/3"]`, `["-2/3","−2/3"]` | `"2/3"` (engine-checked) | schemaId `delta-hedging` |
| `opt6-gate` | — (tap choice) | `gate.correct:"delta-hedging"` | foils `linearity-indicators`, `no-arbitrage-replication`, `binomial-pricing` |
| `opt6-greeksigns` | call Δ `["+","+1"]`; put Δ `["−","-","-1","−1"]`; Γ `["+","+1"]`; vega `["+","+1"]`; Θ `["−","-","-1","−1"]` | tokens vs `greekSign()`∈{-1,0,1} | schemaId `delta-hedging` |
| `opt6-exotic` | `["4/5","0.8",".8"]`, `["1/2","0.5",".5"]` | `"4/5"` / `"1/2"` (engine-checked) | schemaId `no-arbitrage-replication` |
| `transfer-heldout` | `["6/7"]`, `["1/7"]`, `["27/700"]` | `"27/700"` (engine-checked) | `heldOut:true required:false`; schemaId `delta-hedging`; **never** √(27/700) |
| `opt6-mastery` | Part A `["2/3"]`; Part B `["1/2","0.5",".5"]` | `"2/3"` / `"1/2"` (engine-checked) | `density:'split'`; schemaId `delta-hedging` |
| `opt6-recap` | — (no accept) | none (ungraded) | required |

**Validation anchors — every graded `accept`/`headline` is an exact rational the engine reproduces:**
- `hedgeRatio(6,9)=2/3` ✓; `hedgeRatio(-6,9)=-2/3` ✓
- `minVarWeights(1/25, 9/100, 3/100)={wA:6/7, wB:1/7, varMin:27/700}` ✓ — `√(27/700)` never appears in any `accept`
- `greekSign('delta','call')=+1`, `('delta','put')=-1`, `('gamma',·)=+1`, `('vega',·)=+1`, `('theta',·)=-1` ✓
- `oneTouchPrice(5/4)=4/5` ✓; `oneTouchPrice(2)=1/2` ✓
- `replicate(100,6/5,4/5,1,100,'call').delta=1/2` ✓
- Confirmed forbidden: `σ=√(27/700)`, any BS price, any `N(d₁)` magnitude — none appear in any `accept`

## Definition-of-Ready checklist

| beat | verified+sourced (cite #) | concrete direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px/reduced-motion/aria-live) | graded: schemaId + assist/hintCapOverride + density |
|---|---|---|---|---|---|
| `opt6-recall` | ✅ cov3-win / cov5-win / cov1 | ✅ cold cumulative match cards | ✅ correct + 3-level hints | ✅ | ✅ `linearity-indicators`; `density:'merged'`; assist per card |
| `opt6-mixed` | ✅ #1 / #7 / #13 / #17 | ✅ unlabeled match (quantity-type discrimination) | ✅ correct + 3-level hints | ✅ | ✅ `binomial-pricing`; `density:'merged'`; assist per card |
| `opt6-bet` | ✅ #21 / #13 (byOption copy sourced) | ✅ byOption tap + instant per-option refutation | ✅ 3 option refutations | ✅ radiogroup ≥44px | ungraded; no schemaId |
| `opt6-explore` | ✅ (DISPLAY-ONLY; all magnitudes sourced via `ratToNumber`) | ✅ σ/S sliders → live curve (genuine sweep manipulation; sign holds/flips observable) | ✅ settle line: signs hold; magnitudes display-only | ✅ native `range`; `aria-live`; reduced-motion→final frame; sign = glyph+word | **ungraded DISPLAY-ONLY** — no `accept`, no headline validation, no schemaId |
| `opt6-win` | ✅ #21 (GB §4.5 p.48) | ✅ type h\*=Cov/Var; instant check; sign-flip second input | ✅ 3-level ladder + 9/6 + 6 per-mistake | ✅ `aria-label`; Enter; `role=status` | ✅ `delta-hedging`; `density:'merged'`; `assist.prefillToLastTerm` on Cov/Var fraction |
| `opt6-gate` | ✅ #21 (`gate.correct='delta-hedging'`) | ✅ label-stripped tap; per-option refutation; gate blocks until correct | ✅ byOption copy (4 options) | ✅ radiogroup ≥44px; `aria-live` gate reveal | ✅ `delta-hedging`; `density:'merged'`; gate `required` |
| `opt6-greeksigns` | ✅ GB §6.2 p.75 (greekSign engine goldens) | ✅ +/0/− segmented selector per Greek; per-field instant refutation | ✅ per-field refutations + `hintCapOverride` per field | ✅ `role=radio` in `role=radiogroup` ≥44px; `aria-live`; sign = glyph+word; color-safe | ✅ `delta-hedging`; `density:'merged'`; `hintCapOverride` on each field |
| `opt6-exotic` | ✅ GB §6.2 p.75 L11741 (oneTouchPrice goldens) | ✅ type 1/H for two barriers; instant check | ✅ 3-level ladder + H-itself per-mistake | ✅ `aria-label`; Enter; `role=status` | ✅ `no-arbitrage-replication`; `density:'merged'`; assist hint |
| `transfer-heldout` | ✅ #22 (GB §6.4 p.82-83; engine ☑) | ✅ type 3 fields (w_A, w_B, Var); per-field instant check | ✅ 3-level ladder + √(27/700) per-mistake + swapped-weight per-mistake | ✅ per-field `aria-label`; `aria-live` | ✅ `delta-hedging`; `heldOut:true required:false`; `density:'merged'`; `assist` formula prefill |
| `opt6-mastery` | ✅ #21 Part A (GB §4.5) + `replicate(100,6/5,4/5,1,100,'call').delta=1/2` Part B (GB §6.1+§5.3) | ✅ Part A: type dynamic Δ=h\*; Part B: type risk-cancelling share count (not price) | ✅ per-part ladders + 9/6 (Part A) + 10 (Part B) per-mistake | ✅ per-field `aria-label`; Enter; `aria-live` | ✅ `delta-hedging`; `density:'split'`; `required`; `assist.prefillToLastTerm` Parts A+B |
| `opt6-recap` | ✅ (synthesis frame) | ✅ tap-through 5 reveal cards | ✅ ungraded synthesis settle | ✅ `aria-expanded`; `role=status` | ungraded; required |

**DoR holds for all L6 beats.**

## Lesson-level LS checklist (§6)

- **§2.1 schemaId on every graded beat:** ✅ `opt6-recall`→`linearity-indicators`; `opt6-mixed`→`binomial-pricing`; `opt6-win`/`opt6-gate`/`opt6-greeksigns`/`transfer-heldout`/`opt6-mastery`→`delta-hedging`; `opt6-exotic`→`no-arbitrage-replication`. Ungraded: `opt6-bet`, `opt6-explore`, `opt6-recap`. No method name leaks through any graded beat title — every graded title is surface-only ("the share count that cancels risk," "first time S reaches H").

- **§2.2 which-method gate:** ✅ `opt6-gate` — `prediction.gate`, `gate.correct='delta-hedging'` equals that beat's `schemaId`; label-stripped prompt (surface story: "…wants the number of shares to short **right now** so the book barely moves on small wiggles…"); `optionMethods=['delta-hedging','linearity-indicators','no-arbitrage-replication','binomial-pricing']` — all three foils are ⊂ `CONFUSABLE['delta-hedging'] = ['no-arbitrage-replication','binomial-pricing','linearity-indicators']`; per-option `byOption` refutation copy present.

- **§2.3 held-out transfer:** ✅ `transfer-heldout` — `heldOut:true, track:'B', required:false`; `schemaId:'delta-hedging'` (= `opt6-mastery`'s method); visibly fresh surface (#22: two-stock min-variance **portfolio weights** vs #21's single-asset hedge — different numbers, framing, and quantity being solved for); placed immediately before `opt6-mastery`; engine-verified (`minVarWeights(1/25,9/100,3/100)={wA:6/7,wB:1/7,varMin:27/700}`). **Explicit spec-24 reconciliation:** the **one-touch digital is NOT the transfer** — its method is `no-arbitrage-replication` (replicate by buying 1/H shares), which is ≠ the mastery method `delta-hedging` (a transfer must share the mastery `schemaId`). The transfer is **#22** (a fresh `delta-hedging` surface); the one-touch lives as a **separate graded `opt6-exotic` beat** tagged `no-arbitrage-replication`, which also gives that method a clean graded checkpoint.

- **§2.4 confidence-eligible checkpoints:** ✅ `opt6-mastery` (`masteryChallenge`, `required`) and `opt6-gate` (`prediction.gate`, `required`) are the confidence-eligible checkpoints. The opening `opt6-bet` is a plain ungraded `prediction` with **no gate** — exempt by design (D6).

- **§2.5 cold retrieval openers:** ✅ Two cold graded `retrievalGrid` openers before any bet: `opt6-recall` (hedge prereqs Var+Var+2Cov / h\*=Cov/Var=−2/3 / σ=spread, sourced from cov3-win/cov5-win/cov1) then `opt6-mixed` (UNLABELED arc results: payoff 30 / arb gap 1 / q=1/2 / 2-step 11, sourced from #1/#7/#13/#17). Both are cold recall — no primer precedes them. Worked solutions gated behind the 3-level hint ladder on every checkpoint.

- **§2.6 desirable-difficulty band / assist:** ✅ Every capped graded beat has an `assist`/`hintCapOverride` path so the governor can fade without dead-ending: `assist.prefillToLastTerm` on `opt6-win`'s Cov/Var, `transfer-heldout`'s weight formula, `opt6-mastery` Parts A+B; `hintCapOverride` on each `opt6-greeksigns` field. `density:'split'` on `opt6-mastery` (segmented A/B); `density:'merged'` on all other graded beats.

- **§2.7 same-method-different-costume:** ✅ `delta-hedging ≡ Cov/Var` — the option delta and the statistical min-variance hedge ratio are the same method in two costumes. Explicit comparison in **`opt6-mastery` Part A** (#21 numbers re-struck as the dynamic Δ, the §2.7 beat). Seeded at **`opt6-recall`** (cold recall of h\*=Cov/Var=−2/3) and **`opt6-bet`** (predicts the delta↔h link). Every Continuity-Report overlap is a recall/interleave beat (openers + mastery), never a re-teach. All gate foils are CONFUSABLE, not random.

- **§2.8 worked-example fading:** ✅ This is a capstone — no first contact; every beat is recall/discrimination. Scaffolds to fade are the hint ladders + `density:'split'` + `assist` paths. Speed primitives (Cov/Var division, 1/H) are overlearned from L1–L5; the thin on-ramp lived upstream. Every beat opens cold.

- **§2.9 feedback:** ✅ All predictions/gate use `byOption` refutational copy targeting the specific wrong mental model per distractor; `opt6-greeksigns` per-field refutations name the sign and the engine call. All feedback targets the task/process and the next fix ("the short-leg variance is the denominator," "you re-priced instead of hedging — read what's asked"); no hire-signal or person-level verdict anywhere.

- **Capstone = the spacing:** ✅ No scheduler — the unlock order (L1→L6) *is* the spacing; `opt6-recall`/`opt6-mixed` surface the full arc cold at the terminal step (continuity §3c). `opt6-mastery` is the §3c terminal checkpoint.

- **Feed-forward `byOption`, no person-verdict:** ✅ All feedback copy is task/process-level; `opt6-recap` closes with the one-toolkit synthesis frame. No hire-signal or verdict on the person anywhere in L6.
