# Interaction Spec: Convergence: Forgetting the Start  (lesson-markov-chains-7)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type, the
> `markov.ts` engine, and the validate-fixtures edits live in `../wave0-contracts.md` (§1, §4, §6) — this spec
> maps every Dept-1 beat to a real interaction type and supplies the per-beat feedback ladder, a11y, and
> Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-markov-chains'`, `patternOptions:["H"]` (safe
> H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and no Markov beat reads the
> automaton), `milestoneId:'markov-chains-convergence'`, `unlocks:'lesson-markov-chains-8'`, `schemaVersion:1`.
> Glyph `Pⁿ→π`, viz `twoNode` (course node).
>
> **L7 introduces NO new `chainBoard` display.** It **reuses** `powers` (debuted **L3**) and `distribution`
> (debuted **L6**) — honoring the lean-FOLD decision (wave0 §1). The concept's one new interaction type
> (`chainBoard`), its engine (`src/engine/markov.ts`), and the renderer were frozen in Wave 0; this lesson adds
> none. **Every graded number is an exact rational reproduced by `markov.ts`.**

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-LLN` | Tap a concept on the left → pick its match on the (shuffled) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag targets ≥44px; `aria-live` "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `open-bet` | Pick one chip (stay-different / same-number / depends) → soft per-option note → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-regular-ergodic` | Expand the JIT primer (regular / aperiodic / ergodic) → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `early-power` | Read `P`, step to `n=2`, type the chosen entry `(P²)_clear,clear` → Check → hint ladder | `chainBoard` `display:'powers'` `task:'entry'` | **reuse (chainBoard:powers, debuted L3)** | `display`,`matrix` (weather),`labels:["Clear","Rainy"]`,`task:'entry'`,`step:2`,`cell:{row:0,col:0}`,`interactive:true`,`headline:'12/25'` (**no `hero` ⇒ graded**) | matrix cells + step control = native `<button>`/`<input range>` ≥44px, arrow-steppable; visually-hidden `aria-live` "(P²) clear→clear = 12 in 25"; reduced-motion → P² already shown | DOM/SVG grid squares `P`→`P²` (CSS); **no Konva** | both |
| 5 | `explore-collapse` | Step `n` up and watch **every row of `Pⁿ` collapse onto one identical row** | `chainBoard` `display:'powers'` (hero) | **reuse (chainBoard:powers, debuted L3)** | `display`,`matrix` (weather **leads**, `vizKey:twoNode`),`labels`,`step:8`,`interactive:true`,`headline:'3/7,4/7'` + beat-level `hero{slowFirst:true,structuralReadout,reducedMotionFinalFrame:true}` (**no `task` ⇒ passive; `hero` ⇒ ungraded**) | step control ≥44px; `aria-live` "After 8 steps: clear 3 in 7, rainy 4 in 7 — both rows"; reduced-motion → rows already collapsed | DOM/SVG powers grid iterating `k=1…8`; **rows visibly merge** (two-state first), then **escalates** to a Land-of-Oz 3-row illustration collapsing; slow-first per `hero` | both |
| 6 | `model-ergodic` | Reveal three lenses → they converge on `Pⁿ→π` | `tripletReveal` | reuse | `value:'Pⁿ→π'`, `lenses:[{label,body}]` (×3), `display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 7 | `approach-pi` | Watch the clear-start distribution march toward `π`; read the limit row `π_clear` → Check | `chainBoard` `display:'distribution'` `task:'stationary'` | **reuse (chainBoard:distribution, debuted L6)** | `display`,`matrix` (weather),`labels`,`task:'stationary'`,`start:0`,`cell:{row:0,col:0}`,`interactive:true`,`headline:'3/7'` (**no `hero` ⇒ graded**) | bars non-interactive; read-off input + Check ≥44px; `aria-live` "Settles to clear 3 in 7"; reduced-motion → settled bars | DOM bars (width-animated, the `BayesUpdateBeat` pattern) evolving clear → `π`; reduced-motion → final frame | both |
| 8 | `periodic-trap` | Iterate `Pⁿ` (it flips, never settles) → answer the graded **"does `Pⁿ` converge?"** choice → Check | `chainBoard` `display:'powers'` `task:'classify'` | **reuse (chainBoard:powers, debuted L3)** | `display`,`matrix` (Ehrenfest m=2 `[[0,1,0],[1/2,0,1/2],[0,1,0]]`),`labels:["0","1","2"]`,`task:'classify'`,`step:8`,`interactive:true`,`headline:'oscillates'` + beat-level `interviewNote` (**no `hero` ⇒ graded**) | converge?/oscillates? choice = native radio ≥44px; `aria-live` "Odd powers = P; even powers differ — Pⁿ does not converge"; reduced-motion → P^odd & P^even shown side by side | DOM/SVG powers grid **alternating** `P^odd=P` ↔ `P^even=[[1/2,0,1/2],[0,1,0],[1/2,0,1/2]]` (CSS) | both |
| 9 | `interleave-forgets` | Sort each chain into **forgets (ergodic)** vs **never forgets (absorbing — stuck)** → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag ≥44px; `aria-live` (built-in) | none (tap) | both |
| 10 | `mastery-challenge` | Type Ana's & Ben's long-run clear fraction (both `3/7`) + the Ehrenfest discriminator → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` (×3) — **no `pattern`**, **no `chainBoard`** | badge card; inputs ≥44px; Enter submits; `aria-live` | none | both |
| 11 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

## Remaps vs. Dept-1 brief (explicit)

- **Beat 4 `early-power` — brief said `chainBoard:powers` (L3) + `answerEntry`; remapped to a single graded
  `chainBoard` beat.** Per the frozen grading rule (wave0 §1: *a `chainBoard` beat is graded iff its `hero`
  block is absent*), the **brief's "+answerEntry" is the chainBoard's own inline type-in**. The learner taps the
  `cell:{row:0,col:0}` of `P²` and types `12/25`; the renderer grades the entry against
  `matrixPower(P, step)[row][col]` (wave0 §6c `case 'entry'`). No separate `answerEntry` beat — one beat, one
  surface, one grade.
- **Beat 7 `approach-pi` — brief said `chainBoard:distribution` (L6) + `answerEntry`; same remap.** The
  distribution display's **inline stationary read-off is the type-in**: the learner reads the settled bar and
  types `π_clear = 3/7`, graded against `stationaryDistribution(P)[cell.row]` (wave0 §6c `case 'stationary'`,
  `cell` present ⇒ scalar). The bars animate the finite march (`3/5 → 12/25 → … → 3/7`); the graded value is the
  limit.
- **Beat 5 `explore-collapse` — brief said `chainBoard:powers→distribution` (HERO).** Kept as **one `powers`
  hero**; the brief's "→distribution" is the *rows-collapse* choreography *within* the powers grid (each row of
  `Pⁿ` is itself a distribution), not a second beat. The schema carries **one `matrix`**, so the beat's `matrix`
  is the **2-state weather** (`vizKey:twoNode`, headline `3/7,4/7` = `stationaryDistribution(weather)`); the
  brief's "escalate to Land of Oz" is the hero's **secondary illustrative frame** (3 rows → `2/5,1/5,2/5`),
  named in `hero.structuralReadout`. Because the hero carries **no `task`**, neither anchor is engine-gated
  (wave0 §6c hits `default: continue` for a passive hero) — both are documentation anchors `markov.ts`
  reproduces.
- **Beat 8 `periodic-trap` — brief said `chainBoard:powers` (L3) + `byOption`.** Kept: a **graded `chainBoard`
  `powers` beat** whose direct manipulation is a binary **"does `Pⁿ` converge?"** choice (a tapped
  classification, wave0 §1: graded `chainBoard` checks "a tapped class"). Feedback is `byOption` keyed to the
  two choices. The categorical `headline:'oscillates'` is derived from `classifyStates` — see §Gate notes for
  the exact derivation.
- **Beat 10 `mastery-challenge` — brief floated `masteryChallenge` + `chainBoard:distribution`; remapped to a
  PURE `masteryChallenge` type-in.** Per wave0 §1 ("**Mastery beats are NOT `chainBoard`**" — the two are
  distinct schema members, never combined), the penult beat is a gate-required `masteryChallenge` with **no
  `pattern`** and **no `chainBoard`**. The chainBoard distribution surface already lives in `explore-collapse`
  and `approach-pi`; mastery is the type-in payoff.
- No other remaps. Every reuse beat (`recall-LLN`, `open-bet`, `name-regular-ergodic`, `model-ergodic`,
  `interleave-forgets`, `recap`) maps 1:1 to an existing real type.

## New interaction types (Wave 0)

- **L7 adds NO new interaction type and NO new `chainBoard` display.** It **reuses** `display:'powers'` (frozen
  + debuted **L3**) for `early-power`/`explore-collapse`/`periodic-trap` and `display:'distribution'` (frozen +
  debuted **L6**) for `approach-pi`. See wave0 **§1** for the frozen `chainBoard` Zod object (five displays:
  `diagram | matrix | powers | distribution | stationary`) and the field-usage matrix (L7 rows match exactly).
- **No new schema, renderer, engine, or fixture-validator surface** is introduced by this lesson. The renderer
  (`ChainBoardBeat.tsx`, wave0 §3) and engine (`markov.ts`, wave0 §4) are concept-level Wave-0 deliverables.
- **Engine functions this lesson exercises** (`src/engine/markov.ts`, all frozen):
  - `matrixPower(P, n)` — `early-power` entry (`P²` cell) and the `explore-collapse`/`periodic-trap` iteration.
  - `stationaryDistribution(P)` — `approach-pi` read-off (the limit row `π`).
  - `classifyStates(P)[i].period` — `periodic-trap` convergence verdict (period `> 1` ⇒ does not converge).

## Feedback + hint ladders (actual copy)

Hint-ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]` = gentle, `hints[1]` = the
**misconception refutation**, `hints[2]` = the **revealed answer** (label flips to "Answer"; "Try again"
resets). `required` graded beats that reach reveal report `needsReview`. Ungraded beats use `correct`/`hints`
as caption/aria copy; `byOption` notes are keyed by the exact option string.

**1 · `recall-LLN`** — graded `correct` + `hints[3]`
- correct: "Long-run frequency = expectation (the **LLN**), and only the present state sets the next step (**memoryless**). Put them together and you get today's headline — the **ergodic theorem**: time-average = space-average = π."
- hints: `["Warm-up — pull these from EV-1 (the Law of Large Numbers) and L1 (the Markov property).", "LLN: a long-run average converges to the expected value — not luck or streaks. Memoryless: once you know the present, the past drops out.", "Match each to its meaning; together they read time-average = space-average = π (the ergodic theorem)."]`
- pairs: `"Law of Large Numbers (EV-1)"→"long-run average → the expected value"`, `"Markov property (L1)"→"only the present state sets the next step"`, `"Stationary π (L6)"→"the long-run fraction of time in each state"`, `"Ergodic theorem (today)"→"time-average = space-average = π"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"Stay different — Ana's head start sticks"` → `{note:"That's the trap. For a regular chain every row of Pⁿ marches to the SAME vector — the start washes out.", correct:false}`
- `"Same number — the start washes out"` → `{note:"Today's headline (for a regular chain like the weather): both starts land on (3/7, 4/7).", correct:true}`
- `"It depends on the chain"` → `{note:"You're peeking at the twist — a PERIODIC chain can have π yet never settle. But a regular chain always forgets its start.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll run it.", "For a regular chain the start can't stick: every row of Pⁿ converges to one π.", "Weather: clear-start 3/5→12/25→…→3/7; rainy-start 3/10→39/100→…→3/7. Both reach (3/7, 4/7)."]`

**3 · `name-regular-ergodic`** (primer; copy = caption/aria)
- correct: "Regular = some `Pⁿ` is all-positive (irreducible AND aperiodic). Regular ⇒ `Pⁿ → π`."
- hints: `["Regular is more than 'has a π' — it needs aperiodicity too.", "Irreducible: every state reaches every other. Aperiodic: no fixed cycle length traps the chain.", "Regular ⇔ some power Pⁿ is all-positive ⇔ Pⁿ → π (the chain forgets its start)."]`
- title: "Regular, aperiodic, ergodic" · body: "A chain is **regular** when some power `Pⁿ` has **all-positive** entries — equivalently it is **irreducible** (every state reaches every other) **and aperiodic** (no fixed period traps it). For a regular chain, **every row of `Pⁿ` marches to the same vector π** — it is **ergodic**, so it *forgets where it started*. (The catch, next: a **periodic** chain can have a π and still never converge.)"

**4 · `early-power`** — graded `correct` + `hints[3]`  ·  engine: `matrixPower(weather,2)[0][0] = 12/25`
- correct: "(P²)_clear,clear = (3/5)(3/5) + (2/5)(3/10) = 9/25 + 3/25 = **12/25** = .48. A finite power is an exact rational — close to π_clear = 3/7 ≈ .4286, but **not equal yet**."
- hints: `["Square P: (P²)_clear,clear is the 'Clear' row dotted with the 'Clear' column.", "A finite Pⁿ does NOT already equal π — 12/25 = .48 is still above the limit 3/7 ≈ .4286.", "(3/5)(3/5) + (2/5)(3/10) = 9/25 + 3/25 = 12/25."]`

**5 · `explore-collapse`** (ungraded hero; copy = aria/caption)
- correct: "Iterate `Pⁿ` and watch every row collapse onto one identical row — the start washes out. Weather → (3/7, 4/7); Land of Oz's three rows → (2/5, 1/5, 2/5)."
- hints: `["Step n up and watch the two rows.", "Different start rows do NOT stay different — they march together.", "By a handful of steps the clear-row and the rainy-row both read (3/7, 4/7)."]`
- `hero.structuralReadout`: "Every row of Pⁿ marches to the same π — weather → (3/7, 4/7), Land of Oz → (2/5, 1/5, 2/5). The start washes out."

**6 · `model-ergodic`** (ungraded reveal)
- correct: "Three lenses, one fact: **regular ⇒ `Pⁿ → π`**. The *distribution* settles; the chain itself keeps hopping forever."
- hints: `["Reveal each lens.", "Convergence does NOT mean the chain freezes — it keeps moving; what stabilizes is the long-run fraction of time in each state.", "Rows of Pⁿ → π; time-average = space-average = π; it's L1 memorylessness at the distribution level."]`
- value: `Pⁿ→π` · lenses: `{label:"Rows of Pⁿ", body:"every row → the same π = (3/7, 4/7)"}`, `{label:"Ergodic theorem", body:"time-average = space-average = π"}`, `{label:"Memorylessness (L1)", body:"the present mix, not the history, fixes the long-run mix"}`

**7 · `approach-pi`** — graded `correct` + `hints[3]`  ·  engine: `stationaryDistribution(weather)[0] = 3/7`
- correct: "The limit row of Pⁿ is π = (3/7, 4/7), so π_clear = **3/7** ≈ .4286. The clear-start entry marches 3/5 → 12/25 → … → 3/7 — it *approaches* but never exactly equals π at any finite n."
- hints: `["The bars settle to π = stationaryDistribution(P); read the clear share.", "The entry doesn't jump straight to π, and it never overshoots — it marches 3/5 → 12/25 → … → 3/7.", "π_clear = (3/10)/(2/5 + 3/10) = (3/10)/(7/10) = 3/7."]`

**8 · `periodic-trap`** — graded `byOption` (+ fallback `hints`) + `interviewNote`  ·  engine: `classifyStates(ehr2)[0].period = 2`
- `"Yes — Pⁿ settles to π = (1/4, 1/2, 1/4)"` → `{note:"No. π EXISTS (πP = π), but Pⁿ never reaches it: odd powers = P, even powers = [[1/2,0,1/2],[0,1,0],[1/2,0,1/2]]. Existence of π ≠ convergence.", correct:false}`
- `"No — Pⁿ oscillates forever (period 2)"` → `{note:"Right. Ehrenfest m=2 is periodic (period 2): Pⁿ flips between two matrices and never settles, even though π = (1/4, 1/2, 1/4) satisfies πP = π. You also need aperiodicity (regularity).", correct:true}`
- hints: `["A stationary π can exist without Pⁿ converging — check the period.", "Ehrenfest m=2 has period 2: from an even state you only return in an even number of steps, so Pⁿ alternates.", "π = (1/4, 1/2, 1/4) exists, but Pⁿ oscillates (P^odd = P, P^even = [[1/2,0,1/2],[0,1,0],[1/2,0,1/2]]) → does NOT converge."]`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L7): "'A stationary π exists' ≠ '`Pⁿ` converges.' The missing hypothesis is **aperiodicity** (regularity). Ehrenfest m=2 is the canonical counterexample: `πP = π` holds, yet `Pⁿ` oscillates with period 2. (Its **Cesàro/time-average** still equals π — convergence in the time-average sense — but the instantaneous `Pⁿ` does not settle.)"

**9 · `interleave-forgets`** — graded `correct` + `hints[3]` (the interleave)
- correct: "Regular chains **forget** the start (every row of Pⁿ → π). Absorbing chains **never forget** — once absorbed they're frozen, and the start fixes the odds. **Not every chain forgets**, and an absorbing chain does not settle to an interior π."
- hints: `["Two fates: ergodic (rows merge to one π) vs absorbing (frozen at a wall).", "An absorbing chain does NOT settle to an interior π — it gets stuck; where you start sets the absorption odds.", "Weather & Land of Oz → forget; gambler's ruin & drunkard → never forget."]`
- pairs: `"2-state weather (regular)"→"Forgets the start → both rows of Pⁿ reach (3/7, 4/7)"`, `"Land of Oz (regular)"→"Forgets the start → all rows reach (2/5, 1/5, 2/5)"`, `"Gambler's ruin (walls at 0, N)"→"Never forgets — absorbed at a wall; the start sets the ruin odds"`, `"Drunkard: home or bar (absorbing)"→"Never forgets — ends frozen at home or bar"`

**10 · `mastery-challenge`** — graded `correct` + `hints[3]`  ·  values: `stationaryDistribution(weather)[0]=3/7`; `classifyStates(ehr2)[0].period=2 ⇒ no`
- correct: "Both starts wash out to the SAME long run: from clear → **3/7**, from rainy → **3/7** (finite check: 12/25 from clear, 39/100 from rainy, both → 3/7). But Ehrenfest m=2 does **not** converge — π = (1/4, 1/2, 1/4) exists yet Pⁿ oscillates (period 2). Existence of π ≠ convergence; you need regularity."
- hints: `["The weather chain is regular, so the start washes out — both rows of Pⁿ reach the same π. Ehrenfest m=2 has a π but is periodic.", "A higher-probability start keeps NO long-run edge: clear-start and rainy-start both give long-run P(clear) = 3/7. And a stationary π alone does not force convergence — Ehrenfest m=2 oscillates.", "From clear → 3/7; from rainy → 3/7; Ehrenfest m=2 converges? No."]`
- scenario: "Two forecasters run the same 2-state weather chain `P = [[3/5,2/5],[3/10,7/10]]` (Clear, Rainy). Ana starts on a **clear** day, Ben on a **rainy** day. They each let it run for weeks."
- fields: `{id:"fromClear", label:"Ana's long-run fraction of clear days (started clear)", accept:["3/7"]}`, `{id:"fromRainy", label:"Ben's long-run fraction of clear days (started rainy)", accept:["3/7"]}`, `{id:"ehrenfest", label:"Bonus — does Ehrenfest m=2 (π = (1/4,1/2,1/4)) converge as n→∞? (yes/no)", accept:["no"]}`

**11 · `recap`** (generic generate-then-reveal; `correct` = principle, `hints` = takeaways)
- correct: "A **regular** chain (some Pⁿ all-positive ⇒ irreducible + aperiodic) forgets its start: every row of Pⁿ → π, so the long run is decided by P alone, never by X₀. A **periodic** chain can have a π and still oscillate forever."
- hints: `["Finite powers are exact rationals approaching π: 12/25, 39/100, … → 3/7. Both starts land on (3/7, 4/7).", "Convergence is about the DISTRIBUTION, not the chain freezing — it keeps hopping; the fractions settle.", "Next up (L8): when is a chain reversible? Detailed balance πᵢpᵢⱼ = πⱼpⱼᵢ."]`

## Build decomposition

- **Engine — `src/engine/markov.ts` (frozen Wave 0; no new code for L7).** L7 pins these goldens (wave0 §4
  table rows 4, 5, 16, 21, 15; asserted in `markov.test.ts` and re-asserted by `validate-fixtures`):
  - `matrixPower(weather, 2)[0][0] = 12/25`  and  `matrixPower(weather, 2)[1][0] = 39/100`  (the two finite
    powers — clear-start above π, rainy-start below π).
  - `stationaryDistribution(weather) = (3/7, 4/7)`  and  `stationaryDistribution(oz) = (2/5, 1/5, 2/5)`  (the
    collapse targets).
  - `classifyStates(ehrenfest_m2)[0].period = 2`  ⇒  `Pⁿ` does **not** converge (period `> 1`).
- **Schema — `chainBoard` member (frozen Wave 0).** L7 uses only: `display ∈ {powers, distribution}`, `matrix`,
  `labels`, `task ∈ {entry, stationary, classify}`, `step`, `start`, `cell`, `interactive`, `headline`; plus the
  reuse members `retrievalGrid`, `prediction` (+`byOption`), `primer`, `tripletReveal`, `masteryChallenge`,
  `recap`. No schema change.
- **Renderer / widget — `ChainBoardBeat.tsx` (frozen Wave 0); `powers`/`distribution` are DOM/SVG + CSS, no
  Konva.** L7 exercises: (a) the **`powers` rows-collapse animation** (iterate `matrixPower(P,k)`, rows merge;
  slow-first under `hero`); (b) the **`distribution` bars** evolving from `start` toward
  `stationaryDistribution(P)`; (c) the **graded inline entry/stationary type-ins** (`early-power`,
  `approach-pi`); (d) the **`periodic-trap` "converge?" choice** — a 2-option radio graded against
  `classifyStates(P)[0].period === 1`, with the grid alternating `P^odd`/`P^even` to make non-convergence
  visible; (e) **reduced-motion final frame** (collapsed rows / settled bars / `P^odd` & `P^even` side by side).
- **Fixture — `fixtures/lesson-markov-chains-7.json`.** 11 beats (order above); `courseId:"course-markov-chains"`,
  `patternOptions:["H"]`, `milestoneId:"markov-chains-convergence"`, `unlocks:"lesson-markov-chains-8"`,
  `schemaVersion:1`. Course node carries `glyphKey:"Pⁿ→π"`, `vizKey:"twoNode"` (wave0 §5a).

## Definition-of-Ready (per beat)

| beatId | verified + sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|----------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-LLN | n/a (recall of EV-1 LLN + L1) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | (3/7, 4/7) (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-regular-ergodic | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| early-power | 12/25 ✔ engine (`matrixPower`, golden #4) | step to n=2 + type entry ✔ | triple ✔ | aria-live entry mirror + final frame ✔ |
| explore-collapse | (3/7,4/7) & (2/5,1/5,2/5) ✔ engine (`stationaryDistribution`, goldens #16, #21) | step n up, watch rows merge ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| model-ergodic | Pⁿ→π ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| approach-pi | 3/7 ✔ engine (`stationaryDistribution`, golden #16) | watch march + type π_clear ✔ | triple ✔ | aria-live mirror + final frame ✔ |
| periodic-trap | period 2 ⇒ oscillates ✔ engine (`classifyStates`, golden #15) | tap converge?/oscillates? ✔ | byOption ✔ | aria-live mirror + final frame ✔ |
| interleave-forgets | n/a (interleave L4/L5 vs today) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| mastery-challenge | 3/7, 3/7, no ✔ engine (`stationaryDistribution`/`classifyStates`) | type ×3 ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** Every graded number is an exact rational reproduced by `markov.ts`; every beat has a
concrete manipulation, instant feedback (triple or byOption), and the frozen a11y kit.

## Gate notes (this lesson)

- **GATED inclusivity** (after adding `lesson-markov-chains-7`): ≥1 `primer` ✔ (`name-regular-ergodic`,
  `track:A`, `required:false`); every `prediction` uses `byOption` ✔ (`open-bet`); exactly one `interviewNote`
  ✔ (`periodic-trap`, per wave0 §6f); the first graded beat is the `retrievalGrid` opener ✔ (`recall-LLN`); the
  last beat is `recap` ✔. **No `introducesSymbol` tags** ⇒ the per-track notation-ladder check is **vacuously
  satisfied** (the only candidate grounding is the track-A-only `name-regular-ergodic` primer; tagging a
  `track:both` beat would fail the gate in track B — wave0 §6f).
- **MASTERY_LESSONS**: last beat `recap` ✔; penult beat `mastery-challenge` is `required:true` with **no
  `pattern`** ✔ (so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped — `3/7` / `no` are not
  hitting-times) and **not** a `chainBoard` ✔ (wave0 §1: mastery beats are pure `masteryChallenge`).
- **chainBoard engine cross-check** (wave0 §6c — `chainBoard` is in **neither** `HERO_TYPES` nor `GRADED_TYPES`;
  the gate rides the beat-level `hero` block + this cross-check):
  - `early-power` `headline:'12/25'` → `case 'entry'`: `formatRational(matrixPower(weather, 2)[0][0]) = '12/25'` ✔
  - `approach-pi` `headline:'3/7'` → `case 'stationary'` (`cell` present ⇒ scalar):
    `formatRational(stationaryDistribution(weather)[0]) = '3/7'` ✔
  - `periodic-trap` `headline:'oscillates'` → `case 'classify'`, **categorical derivation** (the contract's §6c
    note defers the categorical anchor to each spec): the engine anchor is
    `classifyStates(ehrenfest_m2)[0].period === 1 ? 'converges' : 'oscillates'`; `period = 2 > 1` ⇒
    `'oscillates'` ✔. The renderer grades the "does `Pⁿ` converge?" choice against `period === 1` (period 2 ⇒
    correct answer = **No / oscillates**). *(Dept-3 note: the §6c `classify` skeleton handles the numeric-period
    path (e.g. L4 `'2'`) and the kind-list path; this spec supplies the `'oscillates'` categorical mapping the
    §6c note anticipates — `period > 1 ⇒ 'oscillates'`.)*
  - `explore-collapse` `headline:'3/7,4/7'` is a **hero** with no `task` ⇒ wave0 §6c hits `default: continue`
    (not gated). It is the documented collapse target `= formatVector(stationaryDistribution(weather))`; the
    secondary Land-of-Oz frame `= formatVector(stationaryDistribution(oz)) = '2/5,1/5,2/5'`.
