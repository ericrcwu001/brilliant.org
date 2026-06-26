# Interaction Spec: Reversibility & Detailed Balance  (lesson-markov-chains-8)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type, the
> `markov.ts` engine, and the validate-fixtures edits live in `../wave0-contracts.md` (§1–§7) — this spec maps
> every Dept-1 beat to a real interaction type and supplies the per-beat feedback ladder, a11y, and
> Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-markov-chains'`, `patternOptions:["H"]` (safe H/T
> placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat reads the
> automaton**), `milestoneId:'markov-chains-reversible'`, `unlocks:'lesson-markov-chains-9'`, `schemaVersion:1`.
> Glyph `πᵢpᵢⱼ=πⱼpⱼᵢ`, viz `randomWalk`.
>
> **⚠ The big remap (frozen contract §7).** Dept-1 put the Ehrenfest hero `ehrenfest-walk` on `walkBoard`.
> Dept-2 **remaps it to `chainBoard` `display:'diagram'`, `layout:'line'`** — the reflecting, position-dependent
> birth–death boundaries (`P(i→i+1)=(m−i)/m`, `P(i→i−1)=i/m`, reflect at 0 and m) **live in the transition
> matrix P**, so `chainBoard` expresses them for free (`simulateChain` for the token, `detailedBalance` for the
> edge-flow readout). This keeps the one-new-type budget, needs **zero** change to the shipped `walk.ts`/
> `walkBoard`, and shows detailed balance better than the money-labeled gambler's-ruin `walkBoard`. **L8 uses no
> `walkBoard` at all** — its `recall-birth-death` opener is a `retrievalGrid` (text recall), not a walk render.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-birth-death` | Tap a birth–death term on the left → pick its match on the right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag targets ≥44px; `aria-live` status mirror (renderer built-in) | none (tap) | both |
| 2 | `guess-pi-bet` | Pick one chip ("can you get π without solving πP=π?") → soft per-option note → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-detailed-balance` | Read/expand the JIT primer (πᵢpᵢⱼ=πⱼpⱼᵢ) → Continue | `primer` | reuse | `variant:'custom'`·`title`·`body`·`collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A |
| 4 | `balance-one-edge` | Tap edge (0,1) → step π₁ until πᵢpᵢⱼ=πⱼpⱼᵢ balances (given π₀=1/4) → Check → hint ladder | `chainBoard` `display:'stationary'` `task:'balance'` | **NEW** (no `hero` ⇒ graded) | `display:'stationary'`·`task:'balance'`·`matrix`=ehr2 `[[0,1,0],[1/2,0,1/2],[0,1,0]]`·`labels:["0","1","2"]`·`cell:{row:0,col:1}`·`interactive:true`·`headline:"1/2"` | edge handle + π stepper = native `<button>`/range ≥44px; visually-hidden `aria-live` "Forward flow 1/4, back-flow 1/4 — balanced; π₁ = 1 in 2"; reduced-motion → settled bars | DOM bars + per-edge πᵢpᵢⱼ vs πⱼpⱼᵢ readout, CSS transitions | both |
| 5 | `ehrenfest-walk` | Step/play the urn token hop 0↔1↔2; each crossing's forward flow matches its back-flow → Continue | `chainBoard` `display:'diagram'` `layout:'line'` `task:'balance'` | **NEW · REMAP from `walkBoard` (§7)** (carries `hero` ⇒ ungraded) | `display:'diagram'`·`task:'balance'`·`layout:'line'`·`matrix`=ehr2·`labels:["0","1","2"]`·`interactive:true`·`headline:"1/4,1/2,1/4"` + beat-level `hero{slowFirst:true,structuralReadout,reducedMotionFinalFrame:true}` | step/play control + nodes = `<button>` ≥44px; `aria-live` mirrors each crossing "0→1 happens as often as 1→0 — balanced"; reduced-motion → final frame (token settled, edge-flow labels shown) | Konva `ChainGraph` 1-D urn lattice; animated token via `simulateChain` (node pulse + energy packet on active edge); slow-first per `hero.slowFirst` | both |
| 6 | `telescope-to-pi` | Tap each edge to read its ratio pₖ,ₖ₊₁/pₖ₊₁,ₖ → bars assemble π ∝ (1,2,1) → normalize → Check → hint ladder | `chainBoard` `display:'stationary'` `task:'balance'` | **NEW** (no `hero` ⇒ graded) + beat-level `interviewNote` | `display:'stationary'`·`task:'balance'`·`matrix`=ehr2·`labels:["0","1","2"]`·`interactive:true`·`headline:"1/4,1/2,1/4"` + `interviewNote` | per-edge readout buttons ≥44px; `aria-live` "π = 1/4, 1/2, 1/4 — every edge balanced"; FeedbackStrip `aria-live` | DOM bars + telescoping per-edge balance readout, CSS transitions | both |
| 7 | `triplet-reveal` | Reveal each of three lenses → they converge on (1/4,1/2,1/4) | `tripletReveal` | reuse | `value:'1/4,1/2,1/4'`·`lenses:[{label,body}]` (×3)·`display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 8 | `reversible-or-not` | Tap edge A→B and its back-edge B→A on the directed 3-cycle → read 1/3 vs 0 → pick the verdict → Check → hint ladder | `chainBoard` `display:'stationary'` `task:'balance'` | **NEW** (no `hero` ⇒ graded) | `display:'stationary'`·`task:'balance'`·`matrix`=cyc3 `[[0,1,0],[0,0,1],[1,0,0]]`·`labels:["A","B","C"]`·`interactive:true`·`headline:"not-reversible"` | edge buttons + verdict toggle ≥44px; `aria-live` "Forward A→B = 1/3, back-flow B→A = 0 — not balanced → not reversible"; FeedbackStrip | DOM bars + per-edge forward-vs-back readout, CSS transitions | both |
| 9 | `mastery-ehrenfest-m3` | Type π(0)…π(3) for the m=3 urn → Check (required, before recap) | `masteryChallenge` | reuse — **PURE type-in, no `pattern`, no `chainBoard`** | `scenario`·`fields:[{id,label,accept}]` (×4) — **no `pattern`** | badge card; four inputs ≥44px; Enter submits; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

## Remaps vs. Dept-1 brief (explicit)

- **THE BIG ONE — Beat 5 `ehrenfest-walk`: `walkBoard` → `chainBoard` `display:'diagram'`, `layout:'line'`,
  `task:'balance'` (frozen contract §7).** The Dept-1 brief marked this hero `REUSE walkBoard` and flagged
  "confirm `walkBoard`/`walk.ts buildWalk` supports reflecting boundaries at Wave 0." **Resolution (Dept 2): do
  not extend `walk.ts`/`walkBoard`.** Rationale (surgical, budget-respecting):
  - The Ehrenfest reflecting, **position-dependent** birth–death boundaries (`P(i→i+1)=(m−i)/m`,
    `P(i→i−1)=i/m`, reflect at 0 and m) are **intrinsic to the transition matrix P** — `chainBoard` expresses
    them for free (it is just a row-stochastic P), with `simulateChain` for the animated token and
    `detailedBalance` for the per-edge flow readout.
  - The shipped `walkBoard`/`walk.ts` is constant-`p` **absorbing** gambler's-ruin (money-labeled,
    walls-as-ruin). Bending it to reflecting, position-dependent rates would mutate a shipped hero widget and
    add build surface for **zero** pedagogical gain — `chainBoard` `layout:'line'` (a 1-D urn lattice 0–1–…–m)
    shows detailed balance *better* than `walkBoard` ever could.
  - Net: **no `walk.ts`/`walkBoard` change in this concept**, and the one-new-type budget (`chainBoard` only)
    is preserved. (Matches §1 field-usage matrix, the §7 decision, and §9's per-lesson beat map.)
- **Beat 1 `recall-birth-death` is a `retrievalGrid`, not a `walkBoard` render.** The opener *recalls* the
  gambler's-ruin nearest-neighbor up/down structure in words (`P₂=½P₃+½P₁`) and reframes it — "seal the
  absorbing walls into reflecting ends and the line becomes the canonical reversible chain." It needs no
  reflecting walk render, so **L8 ships no `walkBoard` at all.** (`walk.ts`/`walkBoard` remain reused as-is by
  L5/L10's absorbing recalls.)
- **Beat 9 `mastery-ehrenfest-m3` is a pure `masteryChallenge` type-in (no `chainBoard`, no `pattern`).** The
  Dept-1 brief wrote "`masteryChallenge` (wraps `chainBoard:stationary`)"; per the frozen contract (§1 note +
  R-4) `masteryChallenge` and `chainBoard` are **distinct schema members, never combined**. The penult beat is
  a gate-required `masteryChallenge` type-in `(1/8,3/8,3/8,1/8)`; the `chainBoard` surface lives in the
  preceding graded/hero beats (b4/b5/b6/b8). No `pattern` (so the `buildAutomaton(pattern).E0 ∈ accept`
  cross-check is skipped — a Markov vector is not a hitting-time).
- No other remaps. Every other beat maps 1:1 to an existing real type (`retrievalGrid`, `prediction`, `primer`,
  `tripletReveal`, `recap`).

## New interaction types (Wave 0)

L8 introduces **no new schema type** of its own — it instantiates the single concept-wide `chainBoard` member
frozen in **wave0 §1** (reusing `RationalSchema`; appended last in the `InteractionSchema` union). L8 exercises
**two `chainBoard` shapes**:

1. **`display:'stationary'` + `task:'balance'`** — beats `balance-one-edge` (b4), `telescope-to-pi` (b6),
   `reversible-or-not` (b8). Sub-view: **DOM bars + per-edge `πᵢpᵢⱼ` vs `πⱼpⱼᵢ` balance readout** (per §3). All
   three carry **no `hero` ⇒ graded**: the renderer checks the learner's direct manipulation (stepped π₁ /
   assembled telescoping π / tapped verdict) against `markov.ts` truth selected by `(display='stationary',
   task='balance')`, and the `headline` is the validation anchor cross-checked by validate-fixtures §6c.
2. **`display:'diagram'` + `layout:'line'` + `task:'balance'`** — beat `ehrenfest-walk` (b5), the **Ehrenfest
   urn lattice** (REMAP, §7). Sub-view: **Konva `ChainGraph` 1-D lattice 0–1–2** with an animated token via
   `simulateChain` + per-edge forward/back flow labels. Carries the beat-level `hero` block ⇒ **ungraded**.

**Grading rule (frozen, §1):** a `chainBoard` beat is **graded iff its `hero` block is absent.** `chainBoard`
is deliberately **NOT** in `HERO_TYPES` or `GRADED_TYPES` (§6) — the hero/graded split rides the beat-level
`hero` block + the §6c engine cross-check, exactly as `bayesUpdate` does.

**New build artifacts this lesson depends on** (all defined in wave0 §2–§4; none new to L8):
- **`ChainBoardBeat.tsx`** (dispatcher `case 'chainBoard'`, §2) — narrows the `chainBoard` member, composes
  `<BeatShell>`; ungraded (hero) → primary Continue/Finish; graded → primary Check + `useHintLadder` +
  `FeedbackStrip`.
- **`ChainGraph.tsx`** (new Konva widget, sibling to `StateGraph.tsx`, §3) — `layout:'line'` lays nodes on a
  1-D lattice and labels each edge's forward/back flow; reuses `konva/theme.ts` + the `ch3` accent. (Reuse-as-
  pattern; `StateGraph` is **not** mutated — risk R-6.)
- **`markov.ts`** (engine, §4) — L8 needs `detailedBalance(P)`, `isReversible(P, π)`,
  `stationaryDistribution(P)` (the πP=π fallback / the lens), and `simulateChain(P, start, steps, rng)` (the
  hero token; Monte-Carlo only, never on a graded path), plus `formatRational`/`formatVector` for headlines.

**Reuse types (zero new renderer work):** `retrievalGrid {pairs}` · `prediction {options}` + `byOption` ·
`primer {variant:'custom', title, body, collapsible}` · `tripletReveal {value, lenses, display:'cards'}` ·
`masteryChallenge {scenario, fields}` (no `pattern`) · `recap`.

## Feedback + hint ladders (actual copy)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle),
`hints[1]`=Hint 2 (the **misconception refutation**, drawn from the brief), `hints[2]`=Hint 3 = the **revealed
answer** (label flips to "Answer"; "Try again" resets). `required` graded beats that reach reveal report
`needsReview`. Every graded number below is the EXACT rational from the brief's verified-answer table.

**1 · `recall-birth-death`** — graded (easy) `correct` + `hints[3]`
- correct: "A nearest-neighbor up/down walk — gambler's ruin — is a **birth–death** line. Seal the absorbing walls into **reflecting** ends and that same line becomes the canonical **reversible** chain."
- hints: `["Warm-up from Gambler's Ruin — the walk that only steps to a neighbor (P₂ = ½P₃ + ½P₁).", "An absorbing walk gets stuck at a wall — but seal the walls to reflect and the same line has a clean long-run π.", "Up/down to a neighbor = birth–death; reflect the ends → the canonical reversible chain."]`
- pairs: `"Gambler's-ruin step (P₂ = ½P₃ + ½P₁)"→"move only to a neighbor (nearest-neighbor up/down)"`, `"An absorbing wall (ruin / win)"→"the walk stops there forever"`, `"Seal the wall to reflect"→"the walk bounces back — a birth–death chain"`, `"Birth–death line, reflecting ends"→"the canonical reversible chain"`

**2 · `guess-pi-bet`** — `byOption` (+ fallback `hints`)
- `"No — you must always solve the full πP=π system"` → `{note:"Not for a reversible chain. If every edge balances (πᵢpᵢⱼ=πⱼpⱼᵢ) you can walk π out edge by edge — no linear system at all.", correct:false}`
- `"Yes — if the chain has no preferred direction, read π off the edges"` → `{note:"Right — detailed balance lets you telescope π edge by edge. On the Ehrenfest urn that's just (1,2,1), normalized to (1/4,1/2,1/4).", correct:true}`
- `"Only for tiny 2-state chains"` → `{note:"No — the shortcut works for any reversible chain, including the m-ball Ehrenfest birth–death line. Size doesn't matter; reversibility does.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll test it.", "A reversible chain balances every edge, so π telescopes out without the full solve.", "Yes: (1,2,1) → (1/4,1/2,1/4), no πP=π needed."]`

**3 · `name-detailed-balance`** (primer; copy = caption/aria)
- correct: "Detailed balance: **πᵢpᵢⱼ = πⱼpⱼᵢ**. Flow i→j equals flow j→i on every edge — the movie runs the same backward."
- hints: `["Forward flow = back-flow, edge by edge.", "Balance is per-edge (πᵢpᵢⱼ=πⱼpⱼᵢ) — stronger than just a steady total.", "Reversible ⇒ run the movie backward and it looks identical."]`
- title: "Detailed balance: the movie runs the same backward" · body: "A chain is **reversible** when every edge balances its own back-flow: **πᵢpᵢⱼ = πⱼpⱼᵢ**. As much probability crosses i→j as crosses j→i. Film the chain in equilibrium and play it backward — you can't tell the difference. When this holds, you can build π **edge by edge** instead of solving πP=π."

**4 · `balance-one-edge`** — graded (easy) `correct` + `hints[3]` · engine: `isReversible` / `detailedBalance` single edge
- correct: "Detailed balance on edge (0,1): π₀p₀₁ = π₁p₁₀ → (1/4)·1 = π₁·(1/2) → π₁ = **1/2**. One edge, one equation — no system."
- hints: `["Use the edge you just named: π₀p₀₁ = π₁p₁₀.", "It's one concrete equation — read p₀₁=1 and p₁₀=1/2 straight off P, plug in π₀=1/4, solve for π₁.", "(1/4)·1 = π₁·(1/2) → π₁ = 1/2."]`
- engine anchor: `headline:"1/2"` = `detailedBalance(ehr2).pi[col]` for `cell:{0,1}` (= π₁).

**5 · `ehrenfest-walk`** (ungraded hero; copy = aria/caption) · engine: `detailedBalance` (golden #22) + `simulateChain` token
- correct: "Watch the token cross 0↔1↔2: each crossing happens as often forward as back. Flows balance edge by edge → π = **(1/4, 1/2, 1/4)**."
- hints: `["Step the urn and watch one crossing at a time.", "The balls don't drift to a 50/50 split and freeze — they keep crossing; π is Binomial(2,½), not a frozen middle.", "Forward flow matches back-flow on every edge → π = (1/4,1/2,1/4)."]`
- `hero.structuralReadout`: "Each crossing i↔i+1 happens as often forward as back — flows balance edge by edge → π = (1/4, 1/2, 1/4)"

**6 · `telescope-to-pi`** — graded `correct` + `hints[3]` · engine: `detailedBalance` (golden #22)
- correct: "Telescope the edge ratios: π ∝ (1, p₀₁/p₁₀, …) = (1, 2, 1); normalize → **(1/4, 1/2, 1/4)**. No πP=π system — detailed balance built it edge by edge."
- hints: `["Chain the edge balances: π₁/π₀ = p₀₁/p₁₀, then π₂/π₁ = p₁₂/p₂₁.", "No hidden system — each ratio is read straight off P: (1, 1/(1/2), …) = (1, 2, 1).", "(1,2,1) normalized → (1/4,1/2,1/4)."]`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L8): "Detailed balance — πᵢpᵢⱼ=πⱼpⱼᵢ — is the fastest route to a birth–death chain's stationary distribution, the standard follow-up once you've solved πP=π the long way."

**7 · `triplet-reveal`** (ungraded reveal)
- correct: "Detailed balance, πP=π (L6), and a long-run simulation all land on **(1/4, 1/2, 1/4)** — the same Binomial(2,½), not a trick of one method."
- hints: `["Reveal each lens.", "Three roads — edge balance, the full solve, and the simulation — to one π.", "All three say (1/4,1/2,1/4)."]`
- value: `"1/4,1/2,1/4"` · lenses: `{label:"Detailed balance", body:"π ∝ (1,2,1) from edge ratios → (1/4,1/2,1/4)"}`, `{label:"πP=π (L6)", body:"Solve the full stationary system → (1/4,1/2,1/4)"}`, `{label:"Long-run simulation", body:"Run the urn forever (simulateChain) → fractions 1/4, 1/2, 1/4 = Binomial(2,½)"}`

**8 · `reversible-or-not`** — graded `correct` + `hints[3]` · engine: `detailedBalance` (golden #24)
- correct: "Directed 3-cycle A→B→C→A: forward flow π_A·p_AB = (1/3)·1 = 1/3, back-flow π_B·p_BA = (1/3)·0 = 0. 1/3 ≠ 0 → detailed balance fails → **not reversible**. It is still *stationary* at (1/3,1/3,1/3) — but not every chain is reversible, so here you must fall back to L6's full πP=π."
- hints: `["Compare forward flow π_A·p_AB with back-flow π_B·p_BA on the A–B edge.", "Stationary ≠ reversible. The cycle is stationary at (1/3,1/3,1/3), yet the back-edge B→A has probability 0 — no edge balance.", "1/3 ≠ 0 → not reversible."]`
- engine anchor: `headline:"not-reversible"` = `detailedBalance(cyc3).reversible === false`.

**9 · `mastery-ehrenfest-m3`** — graded (required) `correct` + `hints[3]`
- correct: "Telescope on {0,1,2,3}: edge (0,1) gives π₁=3π₀, edge (1,2) gives π₂=π₁, edge (2,3) gives π₃=π₀ → π ∝ (1,3,3,1); normalize by 2³=8 → **(1/8, 3/8, 3/8, 1/8)** = C(3,i)/2³. More states, same shortcut — no πP=π."
- hints: `["Same telescoping product, now four states: π₁/π₀ = p₀₁/p₁₀, etc.", "Still no system — π is Binomial(3,½), not 1/3 again and not a frozen middle: (1,3,3,1).", "(1,3,3,1)/8 = (1/8,3/8,3/8,1/8)."]`
- scenario: "The Ehrenfest urn with **m = 3** balls, states {0,1,2,3}, P = [[0,1,0,0],[1/3,0,2/3,0],[0,2/3,0,1/3],[0,0,1,0]]. Find the stationary distribution π via detailed balance." · fields: `{id:"pi0", label:"π(0)", accept:["1/8"]}`, `{id:"pi1", label:"π(1)", accept:["3/8"]}`, `{id:"pi2", label:"π(2)", accept:["3/8"]}`, `{id:"pi3", label:"π(3)", accept:["1/8"]}` — **no `pattern`**

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "When every edge balances (πᵢpᵢⱼ=πⱼpⱼᵢ), the chain is **reversible** and π telescopes out edge by edge — no πP=π. For a birth–death chain like the Ehrenfest urn that hands you π(i) = C(m,i)/2ᵐ for free."
- hints: `["Reversible = forward flow equals back-flow on every edge.", "Telescoping product π ∝ ∏(pₖ,ₖ₊₁/pₖ₊₁,ₖ): Ehrenfest m=2 → (1/4,1/2,1/4), m=3 → (1/8,3/8,3/8,1/8).", "When detailed balance fails (a one-way cycle), drop back to L6's full πP=π solve."]`

## Build decomposition

- **Engine — `src/engine/markov.ts` (wave0 §4).** L8 exercises three pure exact-rational functions + the
  simulator; pin them as inline goldens (`markov.test.ts`, wave0 §6d) so correctness fails CI independent of
  fixtures:
  - `detailedBalance(ehr2)` → reversible, **(1/4, 1/2, 1/4)** (golden #22) — drives `ehrenfest-walk` headline,
    `telescope-to-pi` headline, and `triplet-reveal` value.
  - `detailedBalance(ehr3)` → reversible, **(1/8, 3/8, 3/8, 1/8)** (golden #23) — the `mastery-ehrenfest-m3`
    answer (graded by the type-in accept-list, *also* engine-pinned for the author).
  - `detailedBalance(cyc3)` → **NOT reversible** (`reversible:false`, π = 1/3,1/3,1/3) (golden #24) — drives
    `reversible-or-not` headline `"not-reversible"`.
  - `isReversible(ehr2, π)` / single-edge detailed balance on `cell:{0,1}` → **1/2** — the `balance-one-edge`
    answer.
  - `stationaryDistribution(P)` — the πP=π fallback used as the `triplet-reveal` "πP=π (L6)" lens (and the
    method `reversible-or-not` forces you back to). `simulateChain(ehr2, start, steps, rng)` — the
    `ehrenfest-walk` token (Monte-Carlo only, never graded). `formatRational`/`formatVector` — headline strings.
- **Schema — no change.** `chainBoard` is already frozen in §1 (reuses `RationalSchema`). L8 only authors fixture
  instances: `display:'stationary'`/`task:'balance'` (b4/b6/b8) and `display:'diagram'`/`layout:'line'`/
  `task:'balance'` (b5). Reuse members (`retrievalGrid`, `prediction`, `primer`, `tripletReveal`,
  `masteryChallenge`, `recap`) are unchanged.
- **Renderer / widget — `ChainBoardBeat.tsx` + `ChainGraph.tsx` (wave0 §2–§3).**
  - `display:'stationary'` `task:'balance'` → DOM bars + per-edge `πᵢpᵢⱼ` vs `πⱼpⱼᵢ` balance readout; graded
    (no hero) → check the manipulated edge / stepped π / tapped verdict against `detailedBalance`/`isReversible`;
    `FeedbackStrip` + `useHintLadder`.
  - `display:'diagram'` `layout:'line'` → `ChainGraph` 1-D urn lattice 0–1–2, animated token via
    `simulateChain` (node pulse + one-shot energy packet on the active edge) + forward/back edge-flow labels;
    hero (ungraded) → primary Continue/Finish; slow-first; reduced-motion → final frame.
  - `masteryChallenge`/`retrievalGrid`/`prediction`/`primer`/`tripletReveal`/`recap` → existing renderers, no
    change.
- **Fixture — `fixtures/lesson-markov-chains-8.json`.** `courseId:"course-markov-chains"`,
  `patternOptions:["H"]`, `milestoneId:"markov-chains-reversible"`, `unlocks:"lesson-markov-chains-9"`,
  `schemaVersion:1`, 10 beats above; course node carries `glyphKey:"πᵢpᵢⱼ=πⱼpⱼᵢ"`, `vizKey:"randomWalk"`
  (wave0 §5a, L8 lives in chapter `ch-markov-chains-3` "The Long Run"). All `matrix` entries are exact
  `{n,d}` rationals.
- **🚩 EXPLICIT: NO `walk.ts` / `walkBoard` change needed (§7).** The reflecting, position-dependent Ehrenfest
  birth–death boundaries live in P; `chainBoard` `layout:'line'` + `simulateChain` render them. L8 ships no
  `walkBoard` render at all.
- **Build note (not a brief kickback) — `validate-fixtures.ts` §6c `balance` branch.** As frozen, the `balance`
  branch returns `db.reversible ? formatVector(db.pi) : 'not-reversible'` — i.e. the *full* reversible vector.
  That reproduces `telescope-to-pi` ("1/4,1/2,1/4"), `ehrenfest-walk` hero ("1/4,1/2,1/4"), and
  `reversible-or-not` ("not-reversible") exactly, **but not the single-edge `balance-one-edge` headline "1/2"**
  (it would compute "1/4,1/2,1/4"). Surgical fix, mirroring the existing `stationary` branch which already reads
  `cell`: in the `balance` branch, when `it.cell` is present return `formatRational(db.pi[it.cell.col])` (= π₁ =
  "1/2"). Additive and isolated — `telescope-to-pi`/`reversible-or-not` omit `cell`, so nothing else changes.

## Definition-of-Ready checklist

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-birth-death | n/a (recall of PHT gambler's-ruin birth–death) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| guess-pi-bet | (1/4,1/2,1/4) (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-detailed-balance | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| balance-one-edge | **1/2** (brief; libretexts 16.8) ✔ engine `isReversible`/`detailedBalance` single-edge | tap edge (0,1) + step π₁ ✔ | triple ✔ | aria-live balance mirror + settled bars ✔ |
| ehrenfest-walk | **(1/4,1/2,1/4)** ✔ engine `detailedBalance` (golden #22) | step/play urn token ✔ | hero readout + caption ✔ | aria-live per-crossing mirror + final frame ✔ |
| telescope-to-pi | **(1/4,1/2,1/4)** ✔ engine `detailedBalance` (golden #22; (1,2,1)) | tap edges → assemble π ✔ | triple ✔ | aria-live π mirror ✔ |
| triplet-reveal | (1/4,1/2,1/4) ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| reversible-or-not | **not-reversible** / (1/3,1/3,1/3) ✔ engine `detailedBalance` (golden #24) | tap A→B / B→A + verdict ✔ | triple ✔ | aria-live flow mirror ✔ |
| mastery-ehrenfest-m3 | **(1/8,3/8,3/8,1/8)** ✔ engine `detailedBalance` (golden #23) | type ×4 ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

**DoR kickbacks: none.** Every Dept-1 answer is verified + sourced in the brief (libretexts 16.8 / UBC Lecture 3
/ theorempath), reproduced exactly by `markov.ts` (golden rows #22–#24 + the single-edge 1/2). The only
follow-up is the **Dept-3 build note** above (the §6c `balance` branch must read `cell` to reproduce
`balance-one-edge`'s "1/2") — a one-line, additive engine-validator change, **not** a brief defect.

## Gate notes (this lesson)

- **GATED inclusivity** (after adding `lesson-markov-chains-8`): ≥1 `primer` ✔ (`name-detailed-balance`,
  `track:A`, `required:false`); every `prediction` uses `byOption` ✔ (`guess-pi-bet`); exactly one
  `interviewNote` ✔ (`telescope-to-pi`, per §6f); the first graded beat is the `retrievalGrid` opener ✔
  (`recall-birth-death`, graded-easy — `guess-pi-bet`/`name-detailed-balance` are ungraded); **no
  `introducesSymbol` tags** ⇒ the per-track **notation-ladder** check is **vacuously satisfied** (the only
  candidate grounding is the track-A-only `name-detailed-balance` primer; tagging a `track:both` beat would fail
  the gate in track B — same reasoning as Bayes §6f).
- **MASTERY_LESSONS**: last beat is `recap` ✔; penult beat is a `masteryChallenge` (`mastery-ehrenfest-m3`)
  with `required:true` and **no `pattern`** ✔ (so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is
  skipped — `(1/8,3/8,3/8,1/8)` is a Markov vector, not a hitting-time).
- **chainBoard engine cross-check (§6c)** — every `chainBoard` beat with a `headline` is recomputed via
  `markov.ts` and asserted equal:
  - `balance-one-edge` → `"1/2"` via `detailedBalance(ehr2).pi[cell.col]` (`cell:{0,1}` → π₁). *(Requires the
    §6c `balance` branch to read `cell` — see the Build note; otherwise the frozen branch yields the full
    "1/4,1/2,1/4".)*
  - `ehrenfest-walk` (hero, still headline-checked) → `"1/4,1/2,1/4"` via `formatVector(detailedBalance(ehr2).pi)`.
  - `telescope-to-pi` → `"1/4,1/2,1/4"` via `formatVector(detailedBalance(ehr2).pi)`.
  - `reversible-or-not` → `"not-reversible"` via `detailedBalance(cyc3).reversible === false`.
- **`chainBoard` is not in `HERO_TYPES`/`GRADED_TYPES`** (§6): the hero/graded split rides the beat-level `hero`
  block (present only on `ehrenfest-walk`) + the §6c cross-check. `b4`/`b6`/`b8` are graded (no `hero`); `b5` is
  the ungraded hero.
