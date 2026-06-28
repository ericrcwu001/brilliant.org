# Interaction Spec — `lesson-options-5`: Multi-Step Binomial → Black-Scholes  ★ reach-BS-never-grade-it

> Stage-2 Dept-2. Design-only — NO production code. New display surfaces: `optionBoard display:'binomialTree'` (HERO lattice; tap-a-node backward fold; `headline`="11" engine-checked by `validate-fixtures`) and `optionBoard display:'greeksSlider'` (DISPLAY-ONLY BS continuous limit; no `accept`, `headline` EXEMPT from `validate-fixtures`, every printed number a `ratToNumber` sourced reference — never graded). Goldens (exact rationals, u=6/5, d=4/5, R=1, q=1/2): terminals **{144, 96, 64}**; weights **{1/4, 1/2, 1/4}**; price **11** (C_u=**22**, C_d=**0**); 3-step top: **1** path, terminal **864/5** (=172.8). **Load-bearing display-only resolution:** the binomial price (**11**) is the graded "ρ²" — exact rational, engine-reproduced, `accept`-able, headline-anchored. Black-Scholes (`c = S·N(d₁) − K·e^(−rT)·N(d₂)`, ≈10.45) is the display-only "ρ" — irrational (`N(·)` has no rational closed form), reached with the σ slider, NEVER an `accept`, excluded from `validate-fixtures` goldens — exactly as cov-4 grades ρ²=1/2 while ρ=1/√2 stays display-only text.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | feedback + hints | a11y | visual/motion | track |
|---|---|---|---|---|---|---|---|---|
| 1 | `opt5-recall` | Match two pairs: **"sum of Pascal row n" → 2ⁿ** and **"C(n,k) counts" → "size-k subsets / up-paths to a node"**. Manipulate: tap a left prompt card, then tap the matching right answer card. Respond: correct pair snaps with a green check; wrong pair shakes and returns. Loop: both pairs must match before advancing; bridge copy fires on the final correct match: *"Those counts will weight the risk-neutral node probabilities."* | `retrievalGrid` (required) | REUSE | correct + 3-level hint ladder (below) | tap-and-tap; 44px cards; one `aria-live="polite" aria-atomic` mirror narrates each snap (e.g. *"Matched: Pascal row n → 2ⁿ"*) | match-snap `--dur-base`; bridge copy reveal `--dur-tell` | both |
| 2 | `opt5-bet` | Commit to one of three options about the 2-step price: **(e)** ≈14.7 (plain terminal average), **(b)** 44 (raw-path-count-weighted, unnormalized), **(c)** 11 (q-weighted fold). Manipulate: tap one option. Respond: choice locks; byOption feedback fires for every option. Loop: one shot — no retry gate (this is an ungraded bet). | `prediction` (byOption) | REUSE | byOption refutations for (e), (b), (c) (below); no person-verdict | radiogroup; 44px; `aria-live` on reveal | none | both |
| 3 | `opt5-explore` ★ HERO | Tap any of the 6 lattice nodes in the rendered 2-step binomial tree (root; up-node; down-node; up-up terminal S=144; mid terminal S=96; down-down terminal S=64). Respond: side panel animates to show **S at that node**, its **q-weight** (`nCk·q^k(1−q)^(n−k)`), and the **rolled-back option value** (leaf payoff at terminals → C_u=22, C_d=0 at intermediate nodes → price=11 at root). The full backward fold is readable by exploring all nodes. `headline`="11" (engine `binomialPrice`, cross-checked by `validate-fixtures`). Loop: free exploration; side panel updates on every tap. | `optionBoard` `display:'binomialTree'` **HERO** | **NEW** (`optionBoard` union member) | Ungraded hero; no accept; per-node annotation in side panel; no correct/incorrect gate | 44px transparent tap-target overlay on every node; one `aria-live="polite" aria-atomic` mirror per tap (e.g. *"Node: up–up · S = 144 · q-weight = 1/4 · payoff = 44"*); decorative lattice SVG `aria-hidden`; reduced-motion → final fully-folded frame (all node values populated, price 11 at root) | tap highlight `--dur-base`; side-panel slide `--dur-base`; backward-fold reveal `--dur-slow`; `--ease-out`; compositor-only transforms | both |
| 4 | `opt5-model` | Three lenses revealed in sequence. **Lens 1:** node weight formula `nCk·q^k(1−q)^(n−k)` with the 2-step instantiation {1/4, 1/2, 1/4} and the Σ=1 check. **Lens 2:** price = `(1/Rⁿ)·Σ weight·payoff` with the numerical example 1/4·44 + 1/2·0 + 1/4·0 = 11. **Lens 3:** misconception (a) refutation — "drop `(1−q)^(n−k)` and the weights stop summing to 1." Manipulate: tap each card to flip-reveal. Loop: all 3 tapped before advancing. | `tripletReveal` (`introducesSymbol nCk·q^k(1−q)^(n−k)`, `groundedBy opt5-win`) | REUSE | misconception (a) refutation prose in Lens 3; no grading | tap `aria-expanded`; `role=status` on each lens-reveal | card flip `--dur-tell` | both |
| 5 | `opt5-win` | **Intermediate values displayed on the lattice:** C_u = 22 (up-node) and C_d = 0 (down-node) are given. Task: type today's fair call price. Manipulate: type a single answer. Respond: engine checks against 11; correct → win celebration; wrong → gentle shake + hint fires. Loop: 3-level hint ladder; `assist.prefillToLastTerm` hands the q-weighted sum expression (½·22 + ½·0) and asks only for the discount step. | `answerEntry` (required) | REUSE | golden **11**, accept `["11"]`; 3-level ladder + per-mistake for (e) and (a) (below) | `aria-label`="Today's fair call price" on input; Enter; 44px | none | both |
| 6 | `opt5-gate` | **Label-stripped prompt (surface story only):** "A stock starts at 100; each period it either rises or falls by fixed factors; a risk-free account is available. Two periods. Find today's fair price of the 100-call — which method?" Four radiogroup options. Manipulate: tap one. Respond: byOption gate feedback fires per method. Loop: re-attempt (graded gate; wrong stays here with escalating hints; `assist` narrows to {binomial-pricing, backward-induction} after second wrong answer). | `prediction` (`gate` block, required) | REUSE | byOption gate (below); `gate.correct = binomial-pricing`; `assist` narrows to 2 methods | radiogroup; 44px; `aria-live` on reveal; slow-first `--dur-tell` reveal | slow-first gate `--dur-tell` | both |
| 7 | `opt5-bs-limit` ★ DISPLAY-ONLY ungraded | σ slider (native `<input type="range">`, σ ∈ [0.05, 1.0]). Manipulate: drag or arrow-key σ. Respond: the displayed BS curve morphs as n→∞ (CRR limit, illustrative); a discrete-price bar tracks toward ≈10.45; the side panel shows the **#19 formula** `c = S·N(d₁) − K·e^(−rT)·N(d₂)`, the **5 BS assumptions** as static text, and **"≈ 10.45 (sourced reference, display-only)"**; the discrete binomial price **11** stays anchored for comparison. On-screen prose refutes misconception (c). **No accept. No headline. Exempt from `validate-fixtures`.** Loop: free exploration; "Continue" exits. | `optionBoard` `display:'greeksSlider'` **DISPLAY-ONLY** | **NEW** (`optionBoard` union member) | NO grading; NO accept; NO headline; sourced-reference framing + misconception (c) refutation in on-screen prose (below) | Native `<input type="range">` (arrow-key navigable); one `aria-live="polite" aria-atomic` mirror per change (e.g. *"σ = 0.30 · BS price ≈ 10.45 (sourced reference, display-only — not a graded answer)"*); decorative curve SVG `aria-hidden`; reduced-motion → static final frame (BS formula + 5 assumptions as text, BS curve at σ=0.20, discrete bar at 11) | curve-morph `--dur-slow`; σ readout `--dur-base`; `--ease-out`; compositor-only | both |
| 8 | `transfer-heldout` | **Fresh surface (#20, 3-step, Track B only):** "Same parameters: u=6/5, d=4/5, R=1, S₀=100. The stock now has 3 periods and 8 price paths. How many paths lead to the single top node (three consecutive up-moves), and what is the terminal stock price there?" Two fields: path count, then terminal price. Manipulate: type each. Respond: engine checks 1 and 864/5; correct → advance; wrong → per-field hint. Loop: 3-level per-field hint ladder. | `masteryChallenge` (`heldOut:true`, `required:false`, `track:'B'`) | REUSE | goldens **1** / **864/5**; accepts `["1"]` and `["864/5","172.8"]`; 3-level per-field ladder (below) | per-field `aria-label`; Enter; 44px | none | B |
| 9 | `opt5-mastery` | **`density:'split'`. Part A (#17):** given S₀=100, u=6/5, d=4/5, R=1, K=100, 2-step call — type up-node value C_u, down-node value C_d, the three terminal node weights (k=2, k=1, k=0), and the fair call price. **Part B (#18):** the middle node has __ paths and a q-weight of __; discriminate path count from q-probability. Manipulate: type each field. Respond: engine checks each against the exact-rational golden; wrong → per-field hint. Loop: per-part 3-level ladders + count-vs-weight refutation. | `masteryChallenge` (required, `density:'split'`) | REUSE | Part A goldens: C_u **22**, C_d **0**, weights **1/4, 1/2, 1/4**, price **11**; Part B: count **2**, weight **1/2**; full ladders + count-vs-weight refutation (below) | per-field `aria-label`; Enter; 44px | split-part layout; none | both |
| 10 | `opt5-recap` | Recap card: "Price any multi-step call by folding the tree backward — q-weighting each branch and discounting by R at every step. Node weights are Pascal's `nCk·q^k(1−q)^(n−k)` (they sum to 1). As the steps shrink to zero the discrete price converges to Black-Scholes `c = S·N(d₁) − K·e^(−rT)·N(d₂)` — reached with a slider but never graded here, because N(·) is irrational. Next: delta hedging and the Greeks." Manipulate: tap Continue. | `recap` (required) | REUSE | — | 44px Continue; `aria-live` | reveal `--dur-tell` | both |

## New interaction types (for Wave 0)

`optionBoard` is the sole new `InteractionSchema` union member for the options concept, folding four `display` modes under one type (the `covarianceBoard` / `chainBoard` / `stoppingBoard` precedent). It is **not graded and not a `HERO_TYPE`** — the HERO status on `opt5-explore` is conferred by `beat.hero: true` + a `headline` that is engine-checked; the `greeksSlider` view is display-only with its headline exempt from the cross-check. `optionBoard` is frozen in Wave 0; only `binomialTree` and `greeksSlider` are used by L5.

### `display: 'binomialTree'` — the HERO lattice

Props used in L5:

```jsonc
// opt5-explore (n=2, K=100, call, S₀=100)
{
  "type": "optionBoard",
  "display": "binomialTree",
  "tree": { "S0": "100/1", "u": "6/5", "d": "4/5", "R": "1/1", "K": "100/1", "n": 2, "kind": "call" },
  "interactive": true,
  "headline": "11"
}

// transfer-heldout (n=3, same params)
{
  "type": "optionBoard",
  "display": "binomialTree",
  "tree": { "S0": "100/1", "u": "6/5", "d": "4/5", "R": "1/1", "K": "100/1", "n": 3, "kind": "call" },
  "interactive": true,
  "headline": "?"   // transfer-heldout uses masteryChallenge, not optionBoard; note only
}
```

Tap-a-node behavior: a 44px transparent tap-target overlay sits on every lattice node. On tap the side panel fires with:
1. **S** — the stock price at that node (`S₀·u^k·d^(n−k)`), exact rational displayed as a decimal.
2. **q-weight** — `nCk·q^k·(1−q)^(n−k)` (the node's Pascal-counted probability), exact rational.
3. **Rolled-back value** — the engine-computed option value at that node: payoff `max(S−K,0)` at terminal leaves; discounted q-average of children at internal nodes.

The side panel "shows the fold" for L5 — the backward-induction step-by-step, not the L4/L6 `{delta, bond}` replicating portfolio (which is the `binomialTree` side-panel for L4 and L6).

`headline` = "11" is cross-checked by `validate-fixtures` using `binomialPrice(100,6/5,4/5,1,100,2,'call')` → 11. The `greeksSlider` view is the only `optionBoard` beat where the headline (if any) is exempt.

### `display: 'greeksSlider'` — DISPLAY-ONLY BS continuous limit

Props used in L5 (`opt5-bs-limit`):

```jsonc
{
  "type": "optionBoard",
  "display": "greeksSlider",
  "tree": { "S0": "100/1", "u": "6/5", "d": "4/5", "R": "1/1", "K": "100/1", "n": 2, "kind": "call" },
  "sigma": "1/5",
  "interactive": true
  // NO "accept" field
  // NO "headline" field (or headline EXEMPT from validate-fixtures if authored)
}
```

The σ slider drives `blackScholesCall(S=100, K=100, r=0, σ, T=1)` (illustrative; display-only). K/r/T may be hardcoded to illustrative values since the beat is exempt from golden verification — this is not a blocking gap. The BS curve renders via `ratToNumber`-escaped floats and is never compared to the engine's exact-rational output.

**DISPLAY-ONLY contract (load-bearing — the direct L5 analogue of cov-4's ρ=1/√2 display-only rule):**
- Every rendered number (≈10.45, N(d₁), N(d₂)) crosses the `ratToNumber` display-only boundary — it is a `blackScholesCall(...)` float, **never** an `accept` string, never a golden in `validate-fixtures`.
- The beat carries **no `accept` fields** and is **excluded from the validate-fixtures `opt5-bs-limit` anchor block** entirely (the beat is skipped; the concept-brief's Wave-0 wiring note: "add an engine cross-check block validating each `headline` — skip `greeksSlider`").
- On-screen prose refutes misconception (c) in task-level framing: *"As the steps shrink, the binomial price converges to Black-Scholes `c = S·N(d₁) − K·e^(−rT)·N(d₂)`. But N(·) is the normal CDF — irrational, no rational closed form — so the BS number you see (≈ 10.45) is a sourced reference, not a graded answer. The price this lesson grades is the binomial one (11). (Exactly like cov-4 grading ρ² instead of the irrational ρ.)"*
- The `aria-live` mirror always appends *"display-only — not a graded answer"* to every number it narrates.

### The binomial-price-graded / Black-Scholes-display-only mechanism (load-bearing)

This is the direct L5 analogue of cov-4's ρ²/ρ split. Every graded `accept` is an exact rational reproduced by the engine:

```jsonc
// opt5-win — one graded field
{ "id": "call-price",
  "label": "Today's fair call price (q-weighted, discounted by R)",
  "accept": ["11"],
  "placeholder": "integer or fraction" }

// opt5-mastery Part A — six graded fields
{ "id": "up-node-value",   "label": "C_u  (option value at the up-node after 1 period)",         "accept": ["22"]  }
{ "id": "down-node-value", "label": "C_d  (option value at the down-node after 1 period)",       "accept": ["0"]   }
{ "id": "weight-top",      "label": "q-weight of terminal uu (k=2)",                             "accept": ["1/4"] }
{ "id": "weight-mid",      "label": "q-weight of terminal ud/du (k=1)",                          "accept": ["1/2"] }
{ "id": "weight-bot",      "label": "q-weight of terminal dd (k=0)",                             "accept": ["1/4"] }
{ "id": "call-price-a",    "label": "Fair call price  (= 1/4·44 = 11)",                          "accept": ["11"]  }

// opt5-mastery Part B — two graded fields
{ "id": "path-count-mid",  "label": "Number of paths to the middle node (ud or du)",             "accept": ["2"]   }
{ "id": "q-weight-mid",    "label": "q-weight (probability) of the middle node",                 "accept": ["1/2"] }

// transfer-heldout — two graded fields
{ "id": "path-count-top",  "label": "Paths to the single top node (uuu, 3-step)",                "accept": ["1"]   }
{ "id": "terminal-top",    "label": "Terminal stock price at the top node (100·u³)",              "accept": ["864/5","172.8"] }
```

The Black-Scholes price ≈10.45, `N(d₁)`, `N(d₂)` are **never** in any `accept` list, `headline`, or on a graded path. `blackScholesCall(...)` returns a JS `number` (float) that crosses the display-only boundary; only `binomialPrice(...)` (exact `BigRational`) reaches the grader. **No float is ever graded.**

---

## Feedback + hint ladders

**`opt5-recall` (goldens: 2ⁿ; size-k subsets):** correct: *"2ⁿ sums every Pascal row — each step doubles the sum. C(n,k) counts the size-k subsets — equivalently, the number of up-paths to a node with k up-moves. Those nCk counts will weight the risk-neutral node probabilities in the binomial tree."*  Hints: ① one card asks about the row sum (what happens when you add the entries of a Pascal row?), one asks what C(n,k) counts  ② Pascal's triangle: each row n sums to 2ⁿ because every entry equals the sum of two above it, so row sums double; C(n,k) = number of n-bit strings with exactly k ones = number of size-k subsets  ③ **2ⁿ**; **size-k subsets** (Comb-L3 l3-recall).

**`opt5-bet` (byOption):**
- **(e)** "≈ 14.7 — plain average of the three terminal payoffs (44+0+0)/3" → *"Let's test it — a plain average uses weights 1/3, 1/3, 1/3. The risk-neutral weights are **1/4, 1/2, 1/4** (Pascal 1-2-1 over 2²), and you must discount by Rⁿ (here R=1, so no discount). The middle node is twice as likely as each corner, so 1/4·44 = **11**, not 44/3."* (false)
- **(b)** "44 — weight the terminals by their path counts 1, 2, 1: 1·44 + 2·0 + 1·0" → *"Let's test it — those are raw **counts**, not probabilities; they sum to 4, not 1. Divide by 2ⁿ = 4 (equivalently multiply each by q^k(1−q)^(n−k)): 44/4 = **11**. A count becomes a probability only after you normalize."* (false)
- **(c)** "11 — re-fold the same q-weighted, discounted average one layer at a time" → *"Good instinct — pricing a tree is the one-step fold, iterated: C_u=22, C_d=0, then today = ½·22 + ½·0 = **11** (#17)."* (true)

**`opt5-win` (golden 11):** correct: *"(1/R)·(q·C_u + (1−q)·C_d) = 1·(½·22 + ½·0) = **11**. The q-weighted average discounted by R=1 (#17)."*  Hints: ① the price today is the q-weighted average of C_u and C_d, discounted by R  ② q=1/2, R=1, so price = ½·C_u + ½·C_d = ½·22 + ½·0  ③ `assist.prefillToLastTerm` fills the expression ½·22 + ½·0 = ?, asks only for the discount: "÷ R = ÷ 1 = **11**" (#17).  Per-mistake: **"44"** *"That's the payoff at the top terminal, not today's price. You have C_u=22 and C_d=0 at the intermediate layer — fold one more step: ½·22 + ½·0 = 11."*  · **"22"** *"C_u=22 is the option value at the up-node after one period, not today's price. Fold one more step to today: (1/R)·(q·22 + (1−q)·0) = ½·22 = 11."*

**`opt5-gate` (which-method, label-stripped; byOption):**
- **Backward induction** (`backward-induction`) → *"Right shape — you do fold from the end. But bare backward induction doesn't carry the **risk-neutral q-weights** and the **1/R discount**; binomial pricing is that fold's q-weighted, discounted specialization."* (the near-miss, misconception (d))
- **First-step analysis** (`first-step-analysis`) → *"That conditions **forward** on the first move and solves a recurrence. Here you fold **backward** from expiry — the values are known at the leaves, not the root."*
- **Recursion / self-reference** (`recursion-self-reference`) → *"Naive recursion re-expands the whole tree (and double-counts the recombining middle node). The structured q-weighted fold visits each node **once**."*
- **Binomial pricing** (`binomial-pricing`, correct) → *"Yes — the q-weighted backward fold over the lattice, discounting by R at each step. `gate.correct = binomial-pricing`."* (true)

**`opt5-bs-limit` (UNGRADED — no ladder):** No hint ladder; no grading; no accept. Sourced-reference framing instead: *"As the steps shrink, the binomial price converges to Black-Scholes `c = S·N(d₁) − K·e^(−rT)·N(d₂)`. But N(·) is the normal CDF — **irrational, no rational closed form** — so the BS number you see (≈ 10.45) is a **sourced reference** (GB §6.1 L11274/L11360), not a graded answer. The price this lesson grades is the **binomial** one (11). (Exactly like cov-4 grading ρ² instead of the irrational ρ.)"* Misconception (c) "the BS price is exact / gradeable" is refuted in this prose — it is the only refutation needed since the beat is display-only and carries no byOption.

**`transfer-heldout` (#20, 3-step):** correct: *"C(3,3) = 1 path leads to the top node (every period goes up: uuu). Terminal stock price = 100·(6/5)³ = 100·216/125 = 864/5 = 172.8 (#20)."*

*Field 1 — path count:*  Hints: ① at the top node after 3 steps the stock went up every single period — how many ways can that happen?  ② every period must go up; the only path is u·u·u → C(3,3) = 1  ③ **1** path (#20).

*Field 2 — terminal price:*  Hints: ① the terminal price at the top node is S₀ multiplied by u exactly 3 times: S₀·u³  ② u = 6/5, so u³ = (6/5)³ = 216/125; multiply: 100·216/125  ③ 100·216/125 = 21600/125 = **864/5** = 172.8 (#20).

**`opt5-mastery` Part A (#17):** correct: *"Backward fold: C_u = ½·44 + ½·0 = **22**; C_d = ½·0 + ½·0 = **0**. Node weights: k=2 → C(2,2)·(1/2)² = **1/4**; k=1 → C(2,1)·(1/4) = **1/2**; k=0 → C(2,0)·(1/2)² = **1/4**. Check: 1/4+1/2+1/4=1 ✓. Price = ½·22 + ½·0 = **11** (#17)."*  Hints: ① start at the terminal payoffs (144→44, 96→0, 64→0); fold backward one step using q=1/2 to get C_u and C_d; then fold again to today; weights = nCk·q^k·(1−q)^(n−k)  ② C_u = ½·44 + ½·0 = 22; C_d = ½·0 + ½·0 = 0; top weight = C(2,2)·(1/2)²=1/4; mid weight = C(2,1)·(1/4)=1/2; bot weight = C(2,0)·(1/2)²=1/4  ③ C_u=**22**, C_d=**0**; weights **1/4, 1/2, 1/4**; price = ½·22 + ½·0 = **11** (#17).  Per-mistake on weights (e.g. **"1/3, 1/3, 1/3"** or **"1, 2, 1"**): *"The weights are nCk·q^k(1−q)^(n−k), not plain equal shares or raw counts. n=2, q=1/2: top = C(2,2)·(1/4)=1/4; middle = C(2,1)·(1/4)=2·1/4=1/2; bottom = C(2,0)·(1/4)=1/4. Check: 1/4+1/2+1/4 = 1 ✓. Raw counts (1,2,1) sum to 4, not 1 — they aren't probabilities."*

**`opt5-mastery` Part B (#18; count-vs-weight):** correct: *"The middle node has **C(2,1) = 2** paths (ud and du) — a count. Its q-weight (probability) is C(2,1)·q¹·(1−q)¹ = 2·¼ = **1/2** — the count times q^k(1−q)^(n−k). Count answers 'how many ways'; weight answers 'how likely' (#18)."*  Hints: ① how many distinct sequences of ups/downs lead to the middle node after 2 steps? and what is the probability of each such path?  ② paths to middle: ud and du → count = C(2,1) = 2; each path has probability q·(1−q) = ¼; total q-weight = 2·¼  ③ count = **2**; q-weight = **1/2** (#18).  Per-mistake (giving count=2 when weight is asked, or weight=1/2 when count is asked): *"The middle node has C(2,1)=**2** paths (ud, du) — that's a count. Its **probability** (q-weight) is C(2,1)·q¹·(1−q)¹ = 2·¼ = 1/2. Count answers 'how many ways'; weight answers 'how likely'. They are related (weight = count × q^k(1−q)^(n−k)) but are different objects (#18)."*

---

## Build decomposition (Technical Planner — for Dept 3)

### Engine fns (`src/engine/options.ts`) — L5 surface, exact rationals only

All signatures use `Rat = BigRational {n:bigint; d:bigint}`. Every graded golden below is an exact rational reproduced by the engine.

```ts
// L5 fns — multi-step tree
export function treeTerminals(S0: Rat, u: Rat, d: Rat, n: number): Rat[]
// Returns [S0·d^n, S0·u¹·d^(n−1), …, S0·u^n] (n+1 terminals, k=0…n)
// L5 golden: treeTerminals({100,1},{6,5},{4,5},2) = [{64,1},{96,1},{144,1}]
// Transfer golden: treeTerminals({100,1},{6,5},{4,5},3) top = {864,5}

export function treeWeights(q: Rat, n: number): Rat[]
// Returns [nCk·q^k·(1−q)^(n−k) for k=0..n]  (Σ = 1)
// L5 golden: treeWeights({1,2},2) = [{1,4},{1,2},{1,4}]

export function binomialPrice(S0: Rat, u: Rat, d: Rat, R: Rat, K: Rat, n: number, kind: Kind): Rat
// Backward fold: (1/Rⁿ)·Σ weight·max(S−K,0)
// L5 golden: binomialPrice({100,1},{6,5},{4,5},{1,1},{100,1},2,'call') = {11,1}
// Intermediate goldens: C_u={22,1}, C_d={0,1} (depth-1 fold at up- and down-node)

export function pathCount(n: number, k: number): bigint
// C(n,k) — reuse combinatorics.ts
// L5 goldens: pathCount(2,1)=2n; pathCount(2,0)=pathCount(2,2)=1n; pathCount(3,3)=1n

// DISPLAY-ONLY boundary — NEVER a golden, NEVER an accept
export function ratToNumber(x: Rat): number           // plotting escape hatch
export function blackScholesCall(S:number, K:number, r:number, sigma:number, T:number): number
// c = S·N(d1) − K·e^(−rT)·N(d2) — irrational; sourced reference only
// "≈ 10.45" for S=100,K=100,r=0,σ≈0.20,T=1 (illustrative params; not a golden)
```

**BigRational reconciliation flag (Wave-0 / Dept-3):** `(6/5)²=36/25`, `(6/5)³=216/125`; `nCk·(1/2)^n` denominators are powers of 2; all stay well within BigInt range for n≤10. Use local `BigRational{n:bigint;d:bigint}` (as `optimalStopping.ts`/`combinatorics.ts` do) with `ratToNumber` display-only escape. Reconcile with `RationalSchema = z.number().int()` once (shared Wave-0 flag with covariance — resolve once for the whole concept).

**Engine goldens (L5 only — what `validate-fixtures` cross-checks):**

| fn call | exact result | used in |
|---|---|---|
| `treeTerminals(100,6/5,4/5,2)` | {64,1},{96,1},{144,1} | opt5-explore side-panel + opt5-mastery Part A |
| `treeWeights(1/2,2)` | {1,4},{1,2},{1,4} | opt5-mastery Part A weight fields |
| `binomialPrice(...,2,'call')` | {11,1} | opt5-explore `headline`, opt5-win, opt5-mastery Part A price |
| C_u (depth-1 up) | {22,1} | opt5-win (given), opt5-mastery Part A field |
| C_d (depth-1 down) | {0,1} | opt5-win (given), opt5-mastery Part A field |
| `pathCount(2,1)` | 2 | opt5-mastery Part B count field |
| `pathCount(3,3)` | 1 | transfer-heldout path-count field |
| `treeTerminals(100,6/5,4/5,3)` top | {864,5} | transfer-heldout terminal-price field |
| `blackScholesCall(100,100,0,σ,1)` | ≈10.45 | opt5-bs-limit display-only only — **NOT a golden** |

### Schema variant

`optionBoard` is already frozen in the Wave-0 schema (concept-brief). L5 uses two of the four display modes:

```ts
// binomialTree (opt5-explore): tree required; interactive:true; headline engine-checked
z.object({
  type: z.literal('optionBoard'),
  display: z.literal('binomialTree'),
  tree: z.object({ S0: RationalSchema, u: RationalSchema, d: RationalSchema,
                   R: RationalSchema, K: RationalSchema, n: z.number().int(),
                   kind: z.enum(['call','put']) }),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),   // "11" — validated by validate-fixtures
})

// greeksSlider (opt5-bs-limit): sigma required; NO headline validation; NO accept
z.object({
  type: z.literal('optionBoard'),
  display: z.literal('greeksSlider'),
  tree: z.object({ /* same fields */ }).optional(),  // used for the binomial anchor
  sigma: RationalSchema.optional(),
  interactive: z.boolean().optional(),
  // headline: intentionally absent OR explicitly exempt in validate-fixtures
})
```

### Renderer / widget

**`OptionBoardBeat.tsx`** — dispatches on `beat.interaction.display`:

- **`BinomialTreeDisplay.tsx`** — renders the recombining lattice (SVG, Konva, or HTML grid; TBD); manages tap-a-node state (`selectedNode: {k,depth} | null`); calls `treeTerminals`, `treeWeights`, `binomialPrice` (and the depth-1 intermediates for internal nodes) to populate the side panel; shows `headline` at root. Reduced-motion guard: skip tween animations, render fully-folded frame on first paint.

- **`GreeksSliderDisplay.tsx`** — renders the BS curve (via `blackScholesCall` + `ratToNumber`) and the discrete-lattice price bar alongside; the σ slider is a native `<input type="range">` (no custom widget); side panel contains the static #19 formula + 5 BS assumptions as text + "≈ 10.45 (sourced reference, display-only)"; the binomial price 11 is anchored separately. Reduced-motion guard: skip curve animation; render static final frame.

Both sub-renderers share the `aria-live` mirror pattern from `CovarianceBoardBeat.tsx` (one `<p className="sr-only" aria-live="polite" aria-atomic="true">` per interactive component, narrating engine values on every state change; decorative SVG children carry `aria-hidden`).

### Fixture fields per beat

| beat | `interaction.type` + key fields | `accept` | `headline` | notes |
|---|---|---|---|---|
| `opt5-recall` | `retrievalGrid`; items: [{"prompt":"sum of Pascal row n","answer":"2ⁿ"},{"prompt":"C(n,k) counts","answer":"size-k subsets"}] | — | — | schemaId=`choose-vs-arrange` |
| `opt5-bet` | `prediction`; options: ["≈ 14.7","44","11"]; byOption feedback | — | — | ungraded |
| `opt5-explore` | `optionBoard`; display='binomialTree'; tree={100,6/5,4/5,1,100,2,'call'}; interactive:true | none | `"11"` | beat.hero=true; headline cross-checked |
| `opt5-model` | `tripletReveal`; 3 lens items; introducesSymbol | — | — | ungraded |
| `opt5-win` | `answerEntry`; 1 field id=call-price | `["11"]` | — | schemaId=`binomial-pricing`; assist.prefillToLastTerm |
| `opt5-gate` | `prediction`; gate.kind='which-method'; gate.correct='binomial-pricing'; optionMethods=[…] | — | — | schemaId=`binomial-pricing` |
| `opt5-bs-limit` | `optionBoard`; display='greeksSlider'; tree={…,n:2}; sigma='1/5'; interactive:true | **none** | **none** (or exempt if authored) | ungraded; EXCLUDED from validate-fixtures goldens |
| `transfer-heldout` | `masteryChallenge`; 2 fields | `["1"]`, `["864/5","172.8"]` | — | schemaId=`binomial-pricing`; heldOut:true; track:'B'; required:false |
| `opt5-mastery` | `masteryChallenge`; density:'split'; 8 fields (6 Part A + 2 Part B) | Part A: `["22"]`,`["0"]`,`["1/4"]`,`["1/2"]`,`["1/4"]`,`["11"]`; Part B: `["2"]`,`["1/2"]` | — | schemaId=`binomial-pricing`; required:true |
| `opt5-recap` | `recap`; text content | — | — | ungraded |

### Validation anchors

Every graded `accept` and `headline` is an exact rational the engine reproduces; the `greeksSlider` numbers are display-only and excluded:

- `binomialPrice({100,1},{6,5},{4,5},{1,1},{100,1},2,'call')` → `{11,1}` ✓ cross-checks `opt5-explore` headline="11", `opt5-win` accept="11", `opt5-mastery` Part A price accept="11"
- depth-1 up-node fold → `{22,1}` ✓ cross-checks `opt5-mastery` Part A C_u accept="22"
- depth-1 down-node fold → `{0,1}` ✓ cross-checks `opt5-mastery` Part A C_d accept="0"
- `treeWeights({1,2},2)` → `[{1,4},{1,2},{1,4}]` ✓ cross-checks `opt5-mastery` Part A weight accepts
- `pathCount(2,1)` → `2` ✓ cross-checks `opt5-mastery` Part B count accept="2"
- middle-node q-weight `C(2,1)·(1/2)²` → `{1,2}` ✓ cross-checks `opt5-mastery` Part B weight accept="1/2"
- `pathCount(3,3)` → `1` ✓ cross-checks `transfer-heldout` path-count accept="1"
- `treeTerminals({100,1},{6,5},{4,5},3)` top → `{864,5}` ✓ cross-checks `transfer-heldout` terminal accepts `["864/5","172.8"]`
- `blackScholesCall(100,100,0,σ,1)` ≈10.45 — **NOT a golden; display-only; excluded from `validate-fixtures`**

**Forbidden in any `accept` or `headline` anywhere in L5:** any BS price float, `N(d₁)`/`N(d₂)`, any irrational number, any continuous Greek magnitude, σ inferred from the tree.

---

## Definition-of-Ready checklist

| beat | verified+sourced (cite #) | concrete direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px / reduced-motion / aria-live) | graded: schemaId + (capped) assist/hintCapOverride + density |
|---|---|---|---|---|---|
| `opt5-recall` | ✅ Comb-L3 canon (Pascal/nCk prior lesson); no new source needed | ✅ tap-and-tap match grid | ✅ correct line + 3-level ladder | ✅ 44px cards; aria-live snap narration; reduced-motion → final matched frame | ✅ schemaId=`choose-vs-arrange`; retrieval opener, not a capped beat — no assist trap |
| `opt5-bet` | ✅ #17 (price=11, ≈14.7 plain-avg refuted, 44 count-weighted refuted) | ✅ tap one of 3 options | ✅ byOption per (e)/(b)/(c) | ✅ radiogroup; 44px; aria-live on reveal | ungraded — no schemaId, no assist |
| `opt5-explore` | ✅ #17 (headline="11" engine golden; node values engine-computed) | ✅ tap-a-node lattice; per-node side panel animates S/q-weight/rolled-back value | ✅ ungraded hero; per-node annotation; no correct/incorrect | ✅ 44px overlay per node; aria-live per-tap; decorative SVG aria-hidden; reduced-motion → fully-folded final frame | ungraded (no accept); headline="11" cross-checked by validate-fixtures |
| `opt5-model` | ✅ #17 (weight formula + price formula verified) | ✅ tap-to-reveal 3-lens card | ✅ misconception (a) refutation in Lens 3 | ✅ tap aria-expanded; role=status | ungraded — no schemaId; groundedBy opt5-win |
| `opt5-win` | ✅ #17 (C_u=22, C_d=0, price=11 — ☑ source GB §5.3 L9497 + §6.1 L11319; ☑ engine) | ✅ type-in with displayed intermediates (genuine fold step) | ✅ correct + 3-level ladder + per-mistake for (e) "44" and (a) "22" | ✅ aria-label on input; Enter; 44px | ✅ schemaId=`binomial-pricing`; assist=`prefillToLastTerm`; density default |
| `opt5-gate` | ✅ label-stripped method discrimination (#17 tree surface) | ✅ 4-option radiogroup with slow-first reveal | ✅ byOption gate (4 methods) + escalating hints; assist narrows to 2 methods | ✅ radiogroup; 44px; aria-live; slow-first `--dur-tell` | ✅ schemaId=`binomial-pricing`; assist narrows to 2; density default |
| `opt5-bs-limit` | ✅ #19 (BS formula + 5 assumptions — ☑ source GB §6.1 L11274/L11360; "≈10.45" ratToNumber display-only) | ✅ native range slider; σ morphs BS curve (genuine direct manipulation) | No ladder — UNGRADED; sourced-reference framing + misconception (c) prose | ✅ native range (arrow-key); 44px; aria-live with "display-only" suffix; reduced-motion → static final frame | **UNGRADED DISPLAY-ONLY** — no schemaId, no accept; DoR = "renders BS as sourced reference, grades nothing" |
| `transfer-heldout` | ✅ #20 (pathCount(3,3)=1; terminal=864/5 — ☑ source GB §5.3 L9497 + Cudina/O'Connell; ☑ engine) | ✅ type-in 2 fields (fresh 3-step surface, distinct from mastery) | ✅ 3-level per-field ladders (path-count and terminal-price) | ✅ per-field aria-label; Enter; 44px | ✅ schemaId=`binomial-pricing`; 3-rung ladders; density default; heldOut:true track:'B' required:false |
| `opt5-mastery` | ✅ #17/#18 (6 Part A goldens + 2 Part B goldens — ☑ source GB §5.3 L9497 + Cudina/O'Connell; ☑ engine) | ✅ type-in 8 fields across 2 parts (density:'split'; Part B forces count-vs-weight discrimination) | ✅ 3-level per-field ladders (Part A: fold + weights + price; Part B: count-vs-probability) + count-vs-weight per-mistake refutation | ✅ per-field aria-label; Enter; 44px | ✅ schemaId=`binomial-pricing`; 3-rung ladders per part; density=`'split'`; required:true |
| `opt5-recap` | ✅ summary only | ✅ tap Continue | ✅ — | ✅ 44px; aria-live | ungraded — no schemaId |

**DoR holds for all L5 beats.**

---

## Lesson-level LS checklist (§6)

**§2.1 — Deep-structure schemaId on every graded beat:** ✅ `opt5-recall` → `choose-vs-arrange`; `opt5-win`, `opt5-gate`, `transfer-heldout`, `opt5-mastery` → `binomial-pricing`. No method name leaks into any graded beat title (gate prompt is surface-only: stock / periods / factors / risk-free account). `binomial-pricing` is a Wave-0 registry addition (with `CONFUSABLE = [risk-neutral-pricing, delta-hedging, backward-induction, first-step-analysis, recursion-self-reference]` and reverse edges on the existing ids) — must be frozen by the Dept-3 Schema/Types Specialist before this fixture validates.

**§2.2 — Which-method gate:** ✅ `opt5-gate` is a graded `prediction.gate`; `gate.correct = 'binomial-pricing'` (== the beat's `schemaId`); `optionMethods = ['binomial-pricing','backward-induction','first-step-analysis','recursion-self-reference']` (positionally aligned with display labels `['Binomial pricing','Backward induction','First-step analysis','Recursion / self-reference']`); all foils are exactly ⊂ `CONFUSABLE[binomial-pricing]` — genuine deep-structure near-misses; prompt is label-stripped (surface story only).

**§2.3 — Held-out transfer:** ✅ `transfer-heldout`: `heldOut:true, track:'B', required:false`; `schemaId='binomial-pricing'` (same as mastery); fresh surface (#20 — 3-step tree, paths to uuu + terminal price, never the mastery reworded); placed immediately before `opt5-mastery` (so the `(masteryChallenge, recap)` ending invariant holds); engine-verified (`pathCount(3,3)=1`; `treeTerminals(100,6/5,4/5,3)` top=`{864,5}`).

**§2.4 — Confidence-eligible checkpoints:** ✅ `opt5-gate` (which-method gate) and `opt5-mastery` (masteryChallenge) are the graded confidence-eligible checkpoints. `opt5-bet` is a plain ungraded `prediction` with no `gate` — exempt by design (D6).

**§2.5 — Cold retrieval opener:** ✅ `opt5-recall` is a cold `retrievalGrid` recall of Combinatorics-L3 Pascal/nCk (a prior concept, not a primer); the worked solution fires only via the hint ladder after a genuine attempt; bridge copy links the recall to the new concept ("Those nCk counts will weight the risk-neutral node probabilities").

**§2.6 — Difficulty band / assist:** ✅ Every capped/graded beat has an assist path: `opt5-win` (`assist.prefillToLastTerm` — hands the q-weighted expression, asks only for the discount); `opt5-gate` (`assist` narrows to 2 methods after second wrong); `transfer-heldout` (3-rung per-field hint ladders); `opt5-mastery` (3-rung ladders per part, `density:'split'`). Authored for ~50–85% success; no beat is floored below ~50%.

**§2.7 — Same-method, different-costume + CONFUSABLE interleaving:** ✅ Lives in `opt5-mastery`: Part A wears the **price costume** (fold the 2-step tree → price=11 with weights 1/4,1/2,1/4, #17); Part B wears the **count/probability costume** (discriminate path-count nCk from node-weight nCk·q^k(1−q)^(n−k), #18). Both parts share `schemaId='binomial-pricing'`. Gate foils are drawn from `CONFUSABLE[binomial-pricing]` (backward-induction, first-step-analysis, recursion-self-reference) — genuine deep-structure near-misses, not random. Continuity-Report overlaps converted to interleave/recall: (1) `binomial-pricing ≡ backward-induction` (game-theory-5/optimal-stopping-4) drilled at `opt5-gate`; (2) path-count nCk (Combinatorics) vs node-weight seeded at `opt5-bet` misconception (b) and re-tested at `opt5-mastery` Part B.

**§2.8 — Thin on-ramp, faded fast:** ✅ `opt5-model` is the thin on-ramp (`tripletReveal`; introduces symbol `nCk·q^k(1−q)^(n−k)`; faded immediately into `opt5-win`). Speed primitives overlearned: powers of 6/5 and 4/5; small C(n,k) values; ×1/2 q-weights; Σ-weights-=1 sanity check.

**§2.9 — Feedback discipline:** ✅ All bet + gate options use `byOption` refutational copy (see ladders above) — each names the specific wrong mental model (e.g. "plain average," "raw path counts," "backward induction without q-weights") and states the next fix. `opt5-bs-limit` prose refutes misconception (c) at the task level. Feed-forward throughout; no person-level verdict anywhere.

**§6 confirms: all items hold for L5.**
