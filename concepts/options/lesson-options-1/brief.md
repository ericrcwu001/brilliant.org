# Lesson Brief — `lesson-options-1`: Payoffs & the Contract  (first contact — opens a new fourth domain)

- **courseId:** `course-options` · **chapter:** `ch-options-1` (The Contract & No-Arbitrage)
- **unlocks:** `lesson-options-2` · **prereqs:** `lesson-expected-value-1`
- **glyphKey:** `(S−K)⁺` · **vizKey:** `twoNode` · **introducesSymbol:** call/put payoff `max(S−K,0)` / `max(K−S,0)`
- **milestoneId:** `opt-payoffs` (`built:true`)

> First genuine contact with the whole Quantitative-Finance domain (continuity report: a corpus-wide grep
> for `option`/`call`/`put`/`strike`/`payoff diagram` returns **zero** finance hits). Everything this
> lesson *is* — the payoff function, the kink at the strike, intrinsic value, composing legs — is
> teach-fresh; the only thing recalled is `E[X]` as "the fair price of a bet" (EV L1). Modeled on the
> `lesson-covariance-1` first-contact brief (thin on-ramp, guaranteed early win) and the
> `lesson-covariance-6` beat shapes (cold `retrievalGrid` opener, `prediction` bet, board explore,
> `answerEntry` win, `prediction.gate`, held-out `masteryChallenge` before mastery, `recap` close).

## Hook (the bet)
**"You hold a call option to buy a stock at K = 100. At expiry the stock trades at S_T = 70. What is the
call worth at expiry?"** The instinct from every prior lesson is to compute the gap and sign it — so the
"obvious" answer is −30 ("you're locked in to buy at 100 a thing worth 70"). The bet forces the learner
to confront the one idea the whole concept rests on: an option is a **right, not an obligation**. You
simply don't exercise; the payoff is *floored at 0*. An option is **not** a forward — you never exercise
into a loss. That floor — the kink — is the hockey-stick everything else composes from. Ungraded by
design (the qualitative opener is exempt from confidence capture, §2.4 / D6).

## Core promise (one idea)
**An option's expiry payoff is a piecewise-linear `max(·, 0)`: a long call pays `max(S_T − K, 0)`, a long
put pays `max(K − S_T, 0)`.** Read one, compose several — the protective put floors terminal wealth at
`max(S_T, K)` and the straddle pays `|S_T − K|` — all by adding kinked lines. (Pricing the contract comes
later; today we *read the contract*.)

## Display fields  (populate the lesson node in the per-concept path)
- **glyphKey:** `(S−K)⁺` (the call-payoff glyph; free-form node-dot string).
- **vizKey:** `twoNode` (concept-level thumbnail — the up/down node that defines the whole arc; valid enum
  member, so the card renders rather than falling back to `coin`).
- **introducesSymbol:** `max(S−K,0)` / `max(K−S,0)` (the call/put payoff), surfaced on `opt1-model`
  (`tripletReveal`, `groundedBy: ['opt1-win']`).
- **New widget:** `optionBoard` with `display:'payoffDiagram'` (the hockey-stick payoff vs `S_T`; compose
  legs, curve redraws live). **Not graded, not a `HERO_TYPE`** — graded reads use `answerEntry` /
  `masteryChallenge`; `headline` (the reduced payoff at `markS`) is the engine-reproducible anchor
  `validate-fixtures` cross-checks. One new discriminated-union member for the whole concept (the
  `covarianceBoard` precedent); see concept-brief "New interaction type."

## Verified problems & answers  (anchor-and-source — REQUIRED; every number is exact-rational)
| # | Problem (exact-rational params) | Exact answer | Source | Engine call (Stage-2 reproduces) | verified |
|---|---|---|---|---|---|
| **#1** | Long call, K=100. Payoff at expiry if S_T=130? if S_T=70? | **30**; **0** | GB §6.1 p.69 L10744 (`payoff = max(S−K,0)`) | `callPayoff(130,100)=30`, `callPayoff(70,100)=0` | ☑ source · ☐ engine (Stage-2) |
| **#2** | Long put, K=100. Payoff if S_T=70? if S_T=130? Intrinsic value at S=80? | **30**; **0**; intrinsic **20** | GB §6.1 p.69 L10744 (`max(K−S,0)`); moneyness Table 6.1 | `putPayoff(70,100)=30`, `putPayoff(130,100)=0`, `putPayoff(80,100)=20` | ☑ source · ☐ engine (Stage-2) |
| **#3** | Protective put: long stock + long put(K=100). Terminal value `= max(S_T,100)`; value at S_T=130 and S_T=80. | `max(S_T,100)` ⇒ **130**, **100** | GB §6.1 p.70 L10800 (`max(S_T−K,0)+K = max(S_T,K)`) | `spreadPayoff([{kind:'stock',qty:1},{kind:'put',K:100,qty:1}], S_T)` → **130**, **100** | ☑ source · ☐ engine (Stage-2) |
| **#4 — held-out transfer** | Long straddle, K=100 (**fresh surface** vs the single-call payoff). Terminal payoff `= \|S_T−100\|`; value at S_T=130 and S_T=70. | `\|S_T−100\|` ⇒ **30**, **30** | GB §6.3 p.80 L12552 (`\|S_T−K\|`) | `spreadPayoff([{kind:'call',K:100,qty:1},{kind:'put',K:100,qty:1}], S_T)` → **30**, **30** | ☑ source · ☐ engine (Stage-2) |

> The **held-out transfer** (#4, Track-B gold gate, spec-24) is fact-checked **identically** to any other
> problem (☑ source now; ☐ engine reproduced by Stage-2 / `validate-fixtures`). Its `accept` is the
> engine's exact output. Same `schemaId` (`payoff-construction`) as the mastery challenge, on a visibly
> different surface — a **composed two-leg straddle** (a V) instead of a **single-leg call** (a one-sided
> hockey-stick). All four problems are piecewise-linear `max(·,0)` ⇒ **all exact**; no floats are graded.
> Black-Scholes / continuous Greeks are not relevant to L1 (no pricing here).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)  — ~10 beats
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | schemaId | track |
|---|--------|------------------------|---------|--------------------------------|---------|----------|-------|
| 1 | `opt1-recall` | **Cold retrieval opener** — recall the fair price of a bet | `E[X]=Σx·P(x)`, fair die → 7/2; bridge "an option is a bet that bends at the strike" | — (warm-up recall, not an options idea) | **yes** (`retrievalGrid`, required) | `linearity-indicators` | all |
| 2 | `opt1-bet` | **Bet (ungraded hook)** — a call below its strike, what's it worth? | a call is a *right*, not an obligation; the payoff floor | (a) "call pays S−K even when negative" / (b) "payoff = profit" | no (`prediction`, byOption, **no gate**) | — | all |
| 3 | `opt1-explore` | **Explore (hero)** — drag legs, watch the hockey-stick redraw | the payoff *shape*: flat at 0, kink at K, 45° beyond | "the payoff is a straight line" (misses the kink) | no (`optionBoard` `display:'payoffDiagram'`, hero) | — | all |
| 4 | `opt1-model` | **Model (thin on-ramp)** — name the formula, faded fast | call `max(S−K,0)`, put `max(K−S,0)`; intrinsic vs time value | "intrinsic value can be negative" (refuted by the `(·)⁺` floor) | no (`tripletReveal`, introducesSymbol `(S−K)⁺`, `groundedBy:['opt1-win']`) | — | all |
| 5 | `opt1-win` | **Guaranteed early win** — plug into the handed-over formula | read a long-call payoff at two spots (#1) | "stop at S−K = −30" (forgets the floor at S_T=70) | **yes** (`answerEntry`, required) | `payoff-construction` | all |
| 6 | `opt1-gate` | **Which-method gate** — *which move* gets this cash value? | discriminate reading a payoff from pricing it | foils: parity (relates prices) / replication (prices it) — neither is needed to read a payoff | **yes** (`prediction.gate`, required) | `payoff-construction` | all |
| 7 | `opt1-compare` | **Same method, different costume** — call vs put, what's the same? | both payoffs are `max(·,0)` of the favorable gap, floored at 0 (#1 + #2) | (c) "intrinsic can be negative" — a below-strike call is 0, not negative | **yes** (`retrievalGrid`, required) | `payoff-construction` | all |
| 8 | `transfer-heldout` | **Held-out transfer** (Track-B gold gate) — straddle, fresh surface | compose call+put → `\|S_T−K\|` (#4) | "a straddle can pay 0 between the strikes" (it's a V, min at K) | **yes** (`masteryChallenge`; `heldOut:true required:false`) | `payoff-construction` (= mastery) | **B** |
| 9 | `opt1-mastery` | **Mastery (prove)** — compose & read a multi-leg payoff | protective put = long stock + long put → `max(S_T,100)` (#3) | "the put just adds its own payoff" (misses the floor identity) | **yes** (`masteryChallenge`, required, `density:'split'`) | `payoff-construction` | all |
| 10 | `opt1-recap` | **Recap (close)** — one move ran through the lesson | payoff = `max(·,0)`; compose legs; next: parity & no-arbitrage | — | no (`recap`, required) | — | all |

> **`schemaId` is REQUIRED on every graded beat** (spec-00). Graded beats here: `opt1-recall`
> (`linearity-indicators` — a cross-domain recall of `E[X]`, exactly as `cov1-recall` tags the die-mean
> recall), and `opt1-win` / `opt1-gate` / `opt1-compare` / `transfer-heldout` / `opt1-mastery` (all
> `payoff-construction`). **No method leaks through a beat title** (`opt1-win`, `opt1-gate`,
> `opt1-compare`, `transfer-heldout`, `opt1-mastery` are surface-neutral) — the gate prompt is
> label-stripped. **Registry note (Wave-0):** `payoff-construction` is a **new** `methods.ts` id proposed
> by the concept brief (`domains:['options']`, symmetric `CONFUSABLE: ['put-call-parity',
> 'no-arbitrage-replication']`); a corpus grep confirms it is not yet registered. The Dept-3 Schema/Types
> Specialist freezes it (and the five sibling ids) in Wave-0 before any fixture persists it.

## Misconceptions (Specialist — per-option refutation copy)

**`opt1-bet` `prediction` (byOption; "long call, K=100, S_T=70 — worth what at expiry?"):**
- **−30 — "you're locked in to buy at 100 a stock worth 70"** → *(misconception **a**: a call pays
  `S−K` even when negative — treats the option as a forward).* **Refute:** *"Let's test it — that treats
  the call like a forward (an obligation to buy at 100). A call is a **right**: when the stock is cheaper
  you simply don't exercise. The payoff is floored — `max(S−K,0)` — so it's 0 here, never −30. You never
  exercise into a loss."* (false)
- **0 — "the right to buy at 100 is worthless when the stock is at 70; you walk away"** → **Refute
  (correct):** *"Good instinct — exercising would mean overpaying, so you don't. Payoff =
  `max(70−100, 0) = 0`. The downside is clamped at the strike — that's the kink."* (true)
- **−5 — "you still lose the premium you paid for it"** → *(misconception **b**: payoff = profit).*
  **Refute:** *"Let's test it — that's **profit** (payoff minus the premium), not the contract's
  **payoff**. Today we read the payoff at expiry, which is 0 here; the premium and P&L come later
  (pricing, L2+). Payoff is always ≥ 0; only profit can go negative."* (false)

**`opt1-explore` (structural, ungraded):** elicits *"the payoff is a straight line"* — dragging the spot
across K shows the curve is flat at 0 below the strike and only turns up at K. The **kink** is the whole
point; a straight line would be a forward.

**`opt1-model` lens + `opt1-compare` last pair (misconception **c**: intrinsic value can be negative):**
*"Intrinsic value = `max(·,0)`, **floored at 0**. A call 30 below its strike has intrinsic value 0, not
−30 — below-strike calls are simply worth 0 intrinsic, never negative."* (Wired as the compare grid's
"Below its strike, a call's intrinsic value is → **0**" pair, and as the model card's "the floor" lens.)

**`opt1-gate` `prediction.gate` (byOption; the foils refute the wrong *method*, §2.9):**
- **Payoff construction** → **Refute (correct):** *"Right — at a known expiry spot you just evaluate the
  piecewise-linear payoff: `max(100−80, 0) = 20`. No second instrument, no portfolio — payoff
  construction."* (correct)
- **Put–call parity** → *(foil ∈ `CONFUSABLE[payoff-construction]`).* **Refute:** *"Parity
  (`C−P = S−K·D`) ties a call and a put's **prices** together; here you're handed **one** option and a
  **known** S_T and asked for its cash value. There's no second instrument and nothing to price — reading
  `max(K−S,0)` is the move. Save parity for L2, when two prices must agree."*
- **No-arbitrage replication** → *(foil ∈ `CONFUSABLE[payoff-construction]`).* **Refute:** *"Replication
  builds a synthetic copy to **price** an option before expiry. At expiry, with S_T known, you read the
  payoff straight off the kinked line — no hedge, no replicating portfolio. That's pricing machinery for
  later lessons."*

**Misconceptions targeted (summary):** (a) call-as-forward / negative call payoff; (b) payoff = profit
(net of premium); (c) intrinsic value can be negative — all three resolve to the single `max(·,0)` floor.
Plus the method-discrimination near-misses (parity / replication) drilled at the gate.

## Assessment + continuity + learning science (Designer + Cartographer — `learning-science.md` §2)
- **Retrieval opener (COLD — §2.5; not a primer):** `opt1-recall` — a graded `retrievalGrid` recalling a
  *prior* concept, not an options idea. Pairs: `{ "E[X], one fair die" → "7/2" }`,
  `{ "A fair bet is worth its…" → "expected value, E[X]=Σx·P(x)" }`, and the bridge
  `{ "An option is a bet whose payoff…" → "bends at the strike K" }`. This is the continuity-report §3a
  seam (EV L1 `ev1-recall`/`ev1-win` → options) and the §3c spaced re-surfacing of `E[X]` (cross-domain
  gap; recurs again at L3 risk-neutral pricing and the L6 capstone). The worked recall is gated behind the
  attempt via the hint ladder ("both came from Expected Value" → "(1+…+6)/6 = 7/2" → "7/2; a bet is worth
  its expectation").
- **Guaranteed early win (§2.5/§2.6):** `opt1-win` — the formula `max(S−K,0)` and K=100 are **handed
  over**; the learner only evaluates it at two spots (#1 → 30, 0). Authored well inside the
  desirable-difficulty band (handed-over inputs ⇒ high success), the one beat that should feel like a win.
- **Which-method gate (spec-13 / §2.2):** `opt1-gate` — graded `prediction.gate`,
  `gate.correct = 'payoff-construction'` (**== the beat's `schemaId`**),
  `optionMethods = ['payoff-construction','put-call-parity','no-arbitrage-replication']` (distractors are
  **exactly** `CONFUSABLE['payoff-construction']`), `options = ['Payoff construction','Put–call
  parity','No-arbitrage replication']` (positionally aligned). **Label-stripped prompt:** *"At expiry the
  stock sits at S_T = 80. You hold a long put with K = 100 and need its cash value at expiry. Which move
  gets you there?"* — surface story only; selecting the method is the whole task. `byOption` refutational
  feedback per foil (above).
- **Confidence checkpoint (spec-02/12 / §2.4):** confidence rides on the two **cold graded checkpoints**
  — `opt1-gate` (which-method) and `opt1-mastery` (the prove beat). The opening bet `opt1-bet` stays an
  **ungraded** `prediction` with **no `gate`** (exempt by design). Reward correctly-low confidence on the
  gate/mastery, not bravado.
- **Mastery challenge (required, before recap):** `opt1-mastery` — compose **long stock + long put(K=100)**
  and read the terminal value `max(S_T,100)` at S_T=130 (**130**) and S_T=80 (**100**) (#3,
  `density:'split'`). Forces *composition* (the prove move), not a single-leg read.
- **Held-out transfer (Track-B gold gate, spec-24 / §2.3):** `transfer-heldout` — a **long straddle**
  `|S_T−100|` at 130 (**30**) and 70 (**30**) (#4), authored `required:false, track:'B', heldOut:true`,
  **same `schemaId` (`payoff-construction`) as `opt1-mastery`**, on a **visibly fresh surface** (a
  composed call+put V vs the single-call hockey-stick), placed **immediately before** `opt1-mastery` so
  the `(masteryChallenge, recap)` ending invariant holds, engine-verified (`spreadPayoff(...) → 30, 30`),
  and excluded from the visible/required walk.
- **"Same method, different costume" comparison (§2.7):** `opt1-compare` — a `retrievalGrid` pairing a
  **long-call** payoff (#1: K=100 at S_T=130 → **30 = max(S−K,0)**) with a **long-put** payoff (#2: K=100
  at S_T=70 → **30 = max(K−S,0)**) and asking *what's the same?* → both are `max(·,0)` of the favorable
  gap, floored at 0. Two surfaces, one `schemaId` — the learner abstracts the schema, not the story. (Last
  pair carries misconception **c**: "below its strike, a call's intrinsic value is → **0**".)
- **Spacing / interleaving (continuity §3b/§3c):** `payoff-construction` recurs **L1 (single)** ≡
  **L3 (compose spreads/straddles)** ≡ **L6 (mixed)** — the costume comparison spans the arc. `E[X]`
  (EV L1) re-surfaces at this opener (cross-domain gap), then again at L3 and the L6 capstone. Foils at
  the gate come **only** from `CONFUSABLE['payoff-construction']`, never a random shuffle.
- **Thin on-ramp, faded fast (§2.8):** this is genuine first contact, so `opt1-model` is a brief
  `tripletReveal` that **seeds** the schema (Definition: a right, exercised only when favorable, so
  `max(S−K,0)` / `max(K−S,0)`; The floor: the `(·)⁺` clamp ⇒ the kink at K, never negative; Intrinsic vs
  time value: at expiry value = intrinsic = `max(·,0)`, the extra "time value" before expiry is pricing,
  deferred). It blocks briefly *after* the explore and *before* the win, then the lesson interleaves and
  fades — the cold gate/compare/transfer/mastery carry no worked example. No inversion to cold retrieval
  *before* the schema exists (boundary §4.1).
- **Difficulty band / assist (spec-21 / §2.6):** every capped graded beat carries an
  `assist`/`hintCapOverride` path + a `density` flag so the governor can fade scaffolding without
  dead-ending:
  - `opt1-win` — `density:'split'`; `assist`: prefill the `max(·, 0)` shell (learner fills the inner gap)
    + `hintCapOverride` keeps the 3-level ladder ("you need both pieces" → "max(130−100,0)" → "30; below
    the strike it's 0").
  - `opt1-gate` — `density:'split'`; `hintCapOverride` keeps the refutational nudges available (the gate
    can't be prefilled, so the override is its no-dead-end guarantee).
  - `opt1-compare` — `density:'split'`; `assist.prefillToLastTerm` pre-matches one pair as a worked
    anchor + `hintCapOverride`.
  - `transfer-heldout` — `density:'merged'` (the harder Track-B gold gate, less scaffold) **with** a
    `hintCapOverride` safety path so a struggling solver never dead-ends (a graded beat with no assist
    path is a trap).
  - `opt1-mastery` — `density:'split'`; `assist.prefillToLastTerm` on the composition + `hintCapOverride`.
  - Targets ~50–85% success; the win is deliberately near the top of the band, the gate/mastery lower.
- **Feedback discipline (§2.9):** all `prediction` / `gate` feedback is `byOption` and **refutational**
  (names the specific wrong model and refutes it), **feed-forward / task-level**, with **no person-level
  verdict** anywhere (ADR-0010). The `answerEntry`/`masteryChallenge` hints are a generation-first ladder
  (nudge → method → answer), never the answer first.

## Open items for Dept 2
1. **New widget `optionBoard` (`display:'payoffDiagram'`) — the only Wave-0 interaction-schema delta.**
   `opt1-explore` needs the hockey-stick payoff vs `S_T`: drag/compose legs, the piecewise-linear curve
   redraws live, `headline` = the reduced payoff at `markS` (the engine-reproducible validation anchor).
   Confirm the renderer computes every value via `src/engine/options.ts` (no float math in the graded
   path) and that `optionBoard` is registered **not graded / not a `HERO_TYPE`** (graded reads stay
   `answerEntry`/`masteryChallenge`). Decide whether L1's explore exposes leg-dragging (compose call+put
   live) or ships a fixed long-call→long-put toggle for first contact — recommend the **toggle** to keep
   load low, with full leg-dragging deferred to L3 (spreads).
2. **`spreadPayoff` leg encoding for the composed beats.** `transfer-heldout` (straddle) and
   `opt1-mastery` (protective put) depend on `spreadPayoff(legs, S_T)` with
   `Leg = { kind:'call'|'put'|'stock'|'bond'; K?; qty }`. Confirm a **stock** leg (no `K`, `qty:1`) and a
   **put** leg compose to `max(S_T,100)`, and a **call+put** at the same K compose to `|S_T−100|`, so the
   fixture `accept`s (130/100 and 30/30) match the engine goldens exactly.
3. **`masteryChallenge` for a held-out transfer.** `transfer-heldout` uses `masteryChallenge` (per the
   covariance precedent) while `required:false, track:'B', heldOut:true`. Confirm `LessonPlayer` excludes
   `heldOut` beats from the visible/required walk *and* that two `masteryChallenge` beats back-to-back
   (`transfer-heldout` then `opt1-mastery`) are allowed before the `recap` (covariance-1 ships exactly this
   shape — low risk).
4. **Wave-0 wiring reminders (so gates don't pass vacuously):** add `lesson-options-1` to `GATED` +
   `MASTERY_LESSONS` in `scripts/validate-fixtures.ts`; add the `payoff-construction` (+ sibling) method
   ids and their symmetric `CONFUSABLE` edges to `src/content/methods.ts`; add `optionBoard` to the
   `InteractionSchema` union + a `BeatView` dispatch case with a `headline` engine cross-check; map
   `lesson-options-1` to `ch-options-1` (`ch2` accent) in `chapters.ts`.
