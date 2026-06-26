# Interaction Spec: The Stationary Distribution  (lesson-markov-chains-6)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the shipped reuse renderers. The frozen `chainBoard`
> type, the `src/engine/markov.ts` engine, the `ChainBoardBeat` renderer, and the `validate-fixtures.ts`
> edits are the single source of truth in `../wave0-contracts.md` (§1 field-usage matrix, §3 renderer, §4
> engine, §6 validator, §9 beat map) — this spec maps every Dept-1 brief beat to a real interaction type and
> supplies the per-beat feedback ladder, a11y, build decomposition, and Definition-of-Ready.
>
> **This lesson debuts `chainBoard` `display:'distribution'`** (two beats): `read-the-share` (the graded
> long-run read-off) and `watch-it-settle` (the hero "watch any start converge", whose `πP=π` solver is a
> **reveal overlay** on the same distribution beat — not a separate `display:'stationary'` beat). Everything
> else reuses shipped renderers. Per the frozen grading rule (§1), a `chainBoard` beat is **graded iff it
> carries no beat-level `hero` block**; `chainBoard` is in **neither** `HERO_TYPES` nor `GRADED_TYPES`.
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]`
> (the safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat
> reads the automaton**; no `chainBoard`/`masteryChallenge` here carries `pattern`, so the `buildAutomaton`
> cross-check never fires), `milestoneId:'markov-chains-stationary'`, `unlocks:'lesson-markov-chains-7'`,
> `schemaVersion:1`. Course lesson-node display keys: glyph `πP=π`, viz `fourNode`.
>
> **Worked chains.** GfG weather `P_gfg = [[7/10,3/10],[4/10,6/10]]`, labels `["Sunny","Rainy"]`
> (GeeksforGeeks), π = **(4/7, 3/7)** — the early-win read-off. Clear/Rainy `P_wx = [[3/5,2/5],[3/10,7/10]]`,
> labels `["Clear","Rainy"]` (Math.SE 3336273), π = **(3/7, 4/7)** — the solve / settle / Kac chain.
> Cloudy-town `P_ct = [[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]]`, labels `["Sunny","Cloudy","Rainy"]`
> (Rochester ECE440 HW5 #2), π = **(1/5, 2/5, 2/5)** — the mastery type-in. Every graded number is an exact
> rational reproduced by `markov.ts stationaryDistribution`/`kacReturnTime` (§4 golden table rows 16, 17, 19, 20).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-geometric` | Tap a geometric-wait fact on the left → pick its match on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag targets ≥44px; `aria-live` mirrors "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `settle-bet` | Pick one chip (Aria sunnier / identical / each freezes) → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-stationary` | Expand the JIT primer naming π, `πP=π`, `Σπ=1` → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A · required:false |
| 4 | `read-the-share` | The bars have stopped moving; read Sunny's settled share off them and type it into the board's read-off entry → Check → hint ladder | `chainBoard` `display:'distribution'` | **NEW** | `display:'distribution'`, `matrix`(`P_gfg`), `labels:["Sunny","Rainy"]`, `task:'stationary'`, `cell:{row:0,col:0}`, `headline:"4/7"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | read-off text entry ≥44px (Enter submits); bars = non-interactive `<div>`s; visually-hidden `aria-live` "Sunny settles at 4 in 7, Rainy 3 in 7"; reduced-motion → bars at settled widths | DOM bars (the `BayesUpdate` bars pattern), shown settled; no motion on the read-off | both |
| 5 | `watch-it-settle` | Watch the bars run from **both** starts (Clear, Rainy); they converge to the same π; the `πP=π` solver overlay fades in marking the fixed point → Continue | `chainBoard` `display:'distribution'` | **NEW** (hero) | `display:'distribution'`, `matrix`(`P_wx`), `labels:["Clear","Rainy"]`, `task:'stationary'`, `headline:"3/7,4/7"` + beat-level `hero{slowFirst:true,structuralReadout,reducedMotionFinalFrame:true}` (⇒ ungraded); `start` omitted (hero overlays both rows) | Continue ≥44px; bars non-interactive; visually-hidden `aria-live` "From Clear or Rainy, both settle: clear 3 in 7, rainy 4 in 7"; reduced-motion → final settled bars + solver readout | DOM bars evolving toward π; slow-first per `hero.slowFirst`; `πP=π` solver fades in as overlay | both |
| 6 | `solve-pi` | Type the two stationary shares π(Clear), π(Rainy) → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` (×2) | two inputs ≥44px; Enter submits; `FeedbackStrip` `aria-live` | none | both |
| 7 | `kac-return` | Type the mean return time of a clear day → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder,suffix}]` | input + `suffix:"days"` ≥44px; Enter submits; `aria-live` | none | both |
| 8 | `triangulate-pi` | Reveal each of three lenses (solve / watch Pⁿ / simulate) → they converge on (3/7, 4/7) | `tripletReveal` | reuse | `value:"(3/7, 4/7)"`, `lenses:[{label,body}]` (×3), `display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 9 | `absorbing-vs-stationary` | Tap a chain's `πP=π` on the left → pick its meaning on the (shuffled) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag ≥44px; `aria-live` | none | both |
| 10 | `mastery-cloudy-town` | Read the cloudy-town scenario → type the 3-state π (sunny, cloudy, rainy) **and** the Kac return time of a sunny day → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept,suffix?}]` (×4) — **no `pattern`** + beat-level `interviewNote` | badge card; inputs ≥44px; Enter submits; `aria-live` | none | both |
| 11 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

**Required / track flags** (schema `required` is mandatory): graded beats `recall-geometric`, `read-the-share`,
`solve-pi`, `kac-return`, `absorbing-vs-stationary`, `mastery-cloudy-town` are `required:true, track:'both'`.
The JIT primer `name-stationary` is `track:'A', required:false` (track-exclusive beats must be, per the
`BeatSchema.track` comment). The bet `settle-bet`, the hero `watch-it-settle`, the reveal `triangulate-pi`, and
`recap` are `track:'both', required:true` — every track sees them and the lesson advances through each in
sequence.

## Remaps vs. Dept-1 brief (explicit)

- **`watch-it-settle` (b5) is ONE `chainBoard` `display:'distribution'` hero beat — not two.** The brief
  sketches `chainBoard:distribution→stationary`; the "→stationary" `πP=π` solver is the hero's **reveal
  overlay** drawn on the settled bars after they converge, **not** a separate `display:'stationary'` beat.
  This rides the frozen single-type fold (§1): the distribution bars and the `πP=π` fixed-point readout share
  one renderer (`ChainBoardBeat`) and one engine call (`stationaryDistribution`). The brief's "`start` both"
  (start from clear *and* from rainy and converge to the same π) is the hero's whole point — since the frozen
  `start` is a single index, the fixture **omits `start`** and the hero distribution mode **overlays both
  start rows** (row 0 = Clear-start, row 1 = Rainy-start), the literal "every start reaches the same π"
  demonstration. `start` does not enter the §6c cross-check (task `stationary`, no `cell` → `formatVector(π)`).
- **`solve-pi` (b6) and `kac-return` (b7) are type-in `answerEntry`, not `chainBoard`.** The brief assigns
  them `answerEntry`; the `πP=π` solve and the Kac reciprocal require the learner to **produce the exact
  rational**, so they are graded type-ins with the standard hint ladder — mirroring the Bayes/L3 split between
  `answerEntry` (compute) and the board widget (manipulate/read). The distribution surface lives in b4/b5.
- **`mastery-cloudy-town` (b10) is a PURE `masteryChallenge` type-in — NOT a `chainBoard`, and no `pattern`.**
  Per the frozen §1 note ("Mastery beats are NOT chainBoard … `masteryChallenge` and `chainBoard` are distinct
  schema members and are never combined in one beat"), the 3-state `πP=π` + Kac capstone is entered as four
  typed rationals graded against `accept`. The cloudy-town matrix is *described* in the `scenario` (and
  engine-verified offline as a golden), but the beat renders **no** chainBoard surface and carries **no
  `pattern`** (so the `buildAutomaton(pattern).E0 ∈ accept` mastery cross-check is skipped — a stationary
  fraction/vector is not a hitting-time; risk R-4).
- **`read-the-share` (b4) uses the GfG Sunny/Rainy chain, a distinct sourced instance from the Clear/Rainy
  chain in b5/b6/b8** (intentional, per the §1 field-usage matrix and the brief's verified-answers table): the
  early-win read-off is `π(Sunny) = 4/7` off `P_gfg`, while the felt convergence / algebra solve give
  `(3/7, 4/7)` on `P_wx`. The two are labeled distinctly (Sunny/Rainy vs Clear/Rainy) so the swapped stationary
  vectors never collide.
- No other remaps. Every other beat (`recall-geometric`, `settle-bet`, `name-stationary`, `triangulate-pi`,
  `absorbing-vs-stationary`, `recap`) maps 1:1 to the brief's stated reuse type.

## New interaction types (Wave 0)

**`chainBoard` `display:'distribution'` — debuts here (the only NEW type this lesson).** Restating the
distribution-relevant fields; the **frozen full definition is wave0-contracts.md §1** (appended as the last
member of the `InteractionSchema` discriminated union in `src/content/schema.ts`, reusing the existing
`RationalSchema` — no new primitive). Do **not** widen it.

```ts
z.object({
  type: z.literal('chainBoard'),
  display: z.enum(['diagram','matrix','powers','distribution','stationary']), // L6 uses 'distribution'
  matrix: z.array(z.array(RationalSchema)),   // 2×2 weather P (exact rationals)
  labels: z.array(z.string()).min(2),         // ["Sunny","Rainy"] / ["Clear","Rainy"]
  task: z.enum(['entry','build','classify','absorption','stationary','balance','pagerank']).optional(), // 'stationary'
  cell: z.object({ row: z.number().int().nonnegative(), col: z.number().int().nonnegative() }).optional(), // read-off pi[cell.row]
  start: z.number().int().nonnegative().optional(),  // distribution: starting row (hero overlays both ⇒ unset)
  headline: z.string().optional(),            // "4/7" (scalar via cell) / "3/7,4/7" (full vector)
  // (layout / step / absorbing / damping / interactive unused this lesson)
}),
```

- **Grading rule (wave0 §1, FROZEN):** graded **iff** the beat-level `hero` block is absent. `read-the-share`
  omits `hero` ⇒ graded (standard `useHintLadder` + `FeedbackStrip`, same wiring as `AnswerEntryBeat`).
  `watch-it-settle` carries `hero` ⇒ ungraded "watch it resolve" (primary = Continue).
- **`chainBoard` is NOT in `HERO_TYPES` and NOT in `GRADED_TYPES`** (wave0 §1/§6): the hero/graded split rides
  the beat-level `hero` block + the §6c engine cross-check, exactly like `bayesUpdate`. The early-win invariant
  is already satisfied by the graded `retrievalGrid` opener (`recall-geometric`).
- **Renderer `src/lesson/beats/ChainBoardBeat.tsx`** (wave0 §3): narrows `props.beat.interaction` to the
  `chainBoard` member (early-returns `null` otherwise), ignores `automaton`/`pattern`, composes `<BeatShell>`.
  `display:'distribution'` → **DOM bars** (the width-animated pattern from `BayesUpdateBeat`'s bars) evolving
  from `start` toward `stationaryDistribution(P)`; the settled bar is the `stationary` read-off. For the hero,
  once the bars converge the renderer **fades in the `πP=π` solver readout** (the "→stationary" reveal, folded
  into the same distribution beat). **No Konva** for `distribution` (`ChainGraph.tsx` serves `display:'diagram'`
  only) — DOM/SVG + CSS transitions, mirroring `WalkBoardBeat`/`BayesUpdateBeat`.
- **Engine dep `src/engine/markov.ts`** (NEW, pure/exact-rational, wave0 §4): `stationaryDistribution(P)`
  (π solving `πP=π`, `Σπ=1`, via `solveLinearSystem`) anchors every read this lesson, and `kacReturnTime(P, i)`
  (= 1/πᵢ) anchors `kac-return` and the mastery Kac field. Both are pinned by `markov.test.ts` goldens and
  re-asserted by `validate-fixtures` (§6c/§6d).

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint-ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]` = Hint 1 (gentle nudge),
`hints[1]` = Hint 2 (**the misconception refutation**, drawn from the brief's Misconceptions section),
`hints[2]` = Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again" resets). `required` graded
beats that ever reach reveal report `needsReview`. `prediction` beats use `byOption` per-option notes (with a
`correct` flag) instead of a ladder; heroes/primer/reveal/recap reuse the `{correct, hints}` shape as
caption/aria copy.

**1 · `recall-geometric`** — graded `correct` + `hints[3]` + pairs
- correct: "A chance-`p` event recurs every `1/p` trials — and a state the chain spends a long-run **share** πᵢ of its time in recurs every `1/πᵢ` steps. That reciprocal *is* Kac's mean return time."
- hints: `["Warm-up from EV-5's geometric wait, E = 1/p — no pressure.", "Return time isn't about one edge's probability; it's the reciprocal of the long-run SHARE the chain spends in that state (Kac uses π, not a single transition).", "Chance p → 1/p trials; long-run share πᵢ → 1/πᵢ steps."]`
- pairs: `"Wait for a chance-p event (geometric)"→"1/p trials on average"`, `"p = 1/5 success each trial"→"5 trials to the first success"`, `"Return to a state with long-run share πᵢ (Kac)"→"1/πᵢ steps on average"`

**2 · `settle-bet`** — `byOption` (+ fallback `hints`)
- `"Aria stays sunnier — it started clear"` → `{note:"Tempting, but a regular chain forgets where it started. Run it from clear or from rainy and the long-run share of clear days is identical — 3/7 either way. That's the whole point (and L7's hook).", correct:false}`
- `"They end up identical — same rules, same long-run climate"` → `{note:"Right — every start converges to the same π. The chain forgets where it began; only the transition rules survive in the long run.", correct:true}`
- `"Each town freezes on its Monday weather"` → `{note:"That's an ABSORBING chain (L5), where πP=π is a stuck point-mass. A regular chain never stops switching — what settles is the FRACTION of time in each state (a spread), not a resting spot.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll run both towns.", "Different starts do NOT mean different long-run mixes for a regular chain — and it doesn't freeze on one state either; it keeps switching.", "Same rules ⇒ same π: both towns land at clear 3/7, rainy 4/7."]`

**3 · `name-stationary`** (primer; copy = caption/aria)
- correct: "Stationary = the *distribution* holds still, even though the chain keeps moving."
- hints: `["π is the long-run share of time spent in each state.", "πP=π: one more step leaves the mix unchanged — that's what 'stationary' means.", "And the shares sum to 1: Σπ = 1."]`
- title: "The stationary distribution π" · body: "The long-run share of time a chain spends in each state is its **stationary distribution** π. It is the one mix that one more step leaves **unchanged**: **πP = π**, with the shares summing to 1 (**Σπ = 1**). 'Stationary' describes the *distribution*, not the chain — the chain keeps hopping forever; what stops moving is the fraction of time in each state."

**4 · `read-the-share`** — graded `correct` + `hints[3]` (chainBoard `distribution`, typed read-off)
- correct: "The bars have stopped moving — Sunny holds **4/7** of the days, Rainy 3/7. The long-run answer is a **share**, not a single state the chain ends on."
- hints: `["The distribution has settled — read Sunny's bar height straight off.", "The long-run answer isn't one state the chain lands on; a regular chain never stops — it's the FRACTION of days each state holds.", "Sunny settles at 4 in 7 → 4/7."]`
- graded manipulation: the bars are shown settled at `stationaryDistribution(P_gfg) = (4/7, 3/7)`; the learner reads the **Sunny** bar (the state at `cell.row = 0`) and types its share into the board's read-off entry; Check cross-checks the value against `formatRational(stationaryDistribution(P_gfg)[0]) = "4/7"` (the §6c `headline`). aria-live mirror: "Sunny settles at 4 in 7, Rainy 3 in 7."
- chainBoard fields: `display:'distribution'`, `matrix:[[7/10,3/10],[4/10,6/10]]` = `[[{n:7,d:10},{n:3,d:10}],[{n:4,d:10},{n:6,d:10}]]`, `labels:["Sunny","Rainy"]`, `task:'stationary'`, `cell:{row:0,col:0}`, `headline:"4/7"`

**5 · `watch-it-settle`** (ungraded hero; copy = aria/caption)
- correct: "Start from Clear or from Rainy — both runs settle to the same bars: clear 3/7, rainy 4/7. The start washes out, and `πP=π` marks the fixed point they land on."
- hints: `["Watch both starts — clear and rainy — run side by side.", "They don't drift apart and neither freezes on one state; they converge to the SAME share.", "Both land at (3/7, 4/7) — the unique π solving πP=π."]`
- `hero.structuralReadout`: "From either start, the bars converge to clear 3 in 7, rainy 4 in 7 — the unique π with πP = π. The start is forgotten."
- `hero`: `{slowFirst:true, structuralReadout:"…", reducedMotionFinalFrame:true}` · chainBoard fields: `display:'distribution'`, `matrix:[[3/5,2/5],[3/10,7/10]]` = `[[{n:3,d:5},{n:2,d:5}],[{n:3,d:10},{n:7,d:10}]]`, `labels:["Clear","Rainy"]`, `task:'stationary'`, `headline:"3/7,4/7"` (no `cell`; `start` omitted ⇒ hero overlays both rows)

**6 · `solve-pi`** — graded `correct` + `hints[3]` + fields
- correct: "Balance gives (2/5)·π_clear = (3/10)·π_rainy ⇒ π_clear : π_rainy = 3 : 4, and with π_clear + π_rainy = 1 that's **(3/7, 4/7)**. `πP=π` means *unchanged*, not *uniform*."
- hints: `["Write the balance for one state: π_clear = π_clear·p_cc + π_rainy·p_rc, then use π_clear + π_rainy = 1.", "πP=π does NOT mean π is flat (1/2, 1/2) — it means one step leaves the mix unchanged; the structure weights each state by how its neighbors feed it. Uniform only happens when the chain is symmetric.", "(3/7, 4/7)."]`
- fields: `{id:"piClear", label:"π(Clear) — long-run share of clear days", accept:["3/7"], placeholder:"e.g. 1/2"}`, `{id:"piRainy", label:"π(Rainy)", accept:["4/7"], placeholder:"e.g. 1/2"}`

**7 · `kac-return`** — graded `correct` + `hints[3]` + field
- correct: "A clear day holds long-run share 3/7, so by Kac it recurs every 1/(3/7) = **7/3** days. Kac reads the **share**, not a single edge's probability."
- hints: `["Kac's mean return time to a state is 1 / (its long-run share).", "Don't use a one-step transition probability — use π(clear) = 3/7, the SHARE from the solve, not an edge of P.", "1/(3/7) = 7/3."]`
- field: `{id:"kacClear", label:"Mean return time to a clear day", accept:["7/3"], placeholder:"e.g. 5/2", suffix:"days"}`

**8 · `triangulate-pi`** (ungraded reveal)
- correct: "Algebra, the power iteration, and a long-run simulation all land on **(3/7, 4/7)** — the fraction isn't an artifact of one method."
- hints: `["Reveal each lens — solve, watch, simulate.", "Three roads to the same vector; simulation only approximates what the algebra nails.", "All three say (3/7, 4/7)."]`
- value: `"(3/7, 4/7)"` · display: `'cards'` · lenses: `{label:"Solve πP=π", body:"(2/5)·π_c = (3/10)·π_r ⇒ π_c : π_r = 3 : 4 ⇒ (3/7, 4/7)"}`, `{label:"Watch Pⁿ settle", body:"Every row of Pⁿ collapses to (3/7, 4/7) as n grows — the start washes out (L7)"}`, `{label:"Simulate", body:"Long-run frequency of clear days → 3/7, i.e. one clear day every 1/(3/7) = 7/3 steps (Kac)"}`

**9 · `absorbing-vs-stationary`** — graded `correct` + `hints[3]` + pairs (the interleave)
- correct: "Same `πP=π` lens, opposite meaning: an **absorbing** chain's fixed point is a stuck point-mass **(0, 1)**; a **regular** chain's is a spread **(3/7, 4/7)** — time split across states, never frozen."
- hints: `["Both vectors solve πP=π — but ask whether the chain ever leaves the state once there.", "Stationary is NOT 'where the chain gets stuck'. For an absorbing chain that's true (a one-way trap); for a regular chain π is the SPREAD of time across states, and it keeps switching forever.", "Absorbing → (0, 1); regular → (3/7, 4/7)."]`
- pairs: `"An absorbing chain's πP=π"→"a stuck point-mass (0, 1) — once there it never leaves"`, `"A regular chain's πP=π"→"a spread (3/7, 4/7) — time split, never frozen"`, `"What \"settles\" in a regular chain"→"the fraction of time per state, not a resting spot"`

**10 · `mastery-cloudy-town`** — graded `correct` + `hints[3]` + scenario + fields + interviewNote
- correct: "Solve column by column: π_sunny = ¼·(1 − π_sunny) ⇒ π_sunny = 1/5; then (3/2)·π_cloudy = 3/5 ⇒ π_cloudy = 2/5, leaving π_rainy = 2/5 ⇒ **(1/5, 2/5, 2/5)**. Kac: a sunny day (share 1/5) recurs every 1/(1/5) = **5** days. Three states still solve to exact fractions."
- hints: `["πP=π with Σπ=1 is a linear system — solve it with exact fractions, column by column.", "More states does NOT mean 'no clean answer, must simulate'; rational Gaussian elimination nails it. Start with the sunny column: π_s = ¼·(1 − π_s).", "(1/5, 2/5, 2/5); Kac sunny = 1/(1/5) = 5 days."]`
- scenario: "Cloudy-town cycles its weather with transition matrix **P = [[0, 1/2, 1/2], [1/4, 1/2, 1/4], [1/4, 1/4, 1/2]]** (rows / columns = sunny, cloudy, rainy). Solve **πP = π** with **Σπ = 1**, then apply **Kac** to the sunny state."
- fields: `{id:"piSunny", label:"π(sunny)", accept:["1/5"], placeholder:"e.g. 1/3"}`, `{id:"piCloudy", label:"π(cloudy)", accept:["2/5"]}`, `{id:"piRainy", label:"π(rainy)", accept:["2/5"]}`, `{id:"kacSunny", label:"Mean return time to a sunny day", accept:["5"], placeholder:"e.g. 4", suffix:"days"}` — **no `pattern`**
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L6): "The 3-state stationary solve is the canonical interview example: set up πP=π with Σπ=1 and eliminate column by column for exact fractions — cloudy-town lands on (1/5, 2/5, 2/5). Then Kac reads the mean return time straight off the share: a sunny day (π = 1/5) recurs every 5 days. Saying the reciprocal relationship — return time = 1/πᵢ — out loud *is* the insight."

**11 · `recap`** (generic generate-then-reveal; `correct` = principle, `hints` = takeaways)
- correct: "A regular chain forgets its start: the long-run share of time in each state is the unique π solving **πP = π** with **Σπ = 1** — and that share fixes how often each state returns, every **1/πᵢ** steps (Kac)."
- hints: `["π is a spread, not a sink and not uniform: clear/rainy settles to (3/7, 4/7), never (1/2, 1/2) and never one frozen state.", "Return time = 1/πᵢ: a clear day recurs every 7/3 days; a sunny cloudy-town day every 5.", "Next up: WHY every start converges — Pⁿ → π (convergence, L7)."]`

## Build decomposition (Technical Planner — for Dept 3)

- **Engine (`src/engine/markov.ts`, wave0 §4).** L6 exercises exactly two functions:
  - `stationaryDistribution(P)` — π solving `πP=π`, `Σπ=1` (augmented system → `solveLinearSystem`). Goldens
    to pin in `markov.test.ts` (wave0 §4 table): `stationaryDistribution([[3/5,2/5],[3/10,7/10]]) = '3/7,4/7'`
    (row 16, the `watch-it-settle`/`solve-pi`/`triangulate-pi` chain); `stationaryDistribution([[7/10,3/10],[4/10,6/10]]) = '4/7,3/7'`
    (row 17, the `read-the-share` chain → `[0] = 4/7`); `stationaryDistribution([[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]]) = '1/5,2/5,2/5'`
    (row 19, the mastery chain).
  - `kacReturnTime(P, i)` (= 1/πᵢ). Goldens (row 20): `kacReturnTime([[3/5,2/5],[3/10,7/10]], 0) = '7/3'`
    (the `kac-return` clear-day answer) and `kacReturnTime([[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]], 0) = '5'`
    (the mastery sunny-day answer).
  - `formatRational` / `formatVector` format `{n,d}` → `"4/7"` / `"3/7,4/7"` for the §6c headline asserts.
    The mastery type-in is engine-verified offline (golden) but grades via the `accept` list — it is **not** a
    `chainBoard` and is **not** touched by the §6c cross-check.
- **Schema (`src/content/schema.ts`, wave0 §1).** No edit beyond the frozen `chainBoard` append (reuses
  `RationalSchema`, no new primitive). L6 uses `display:'distribution'`, `matrix`, `labels`,
  `task:'stationary'`, `cell` (graded read-off only), `headline` (+ beat-level `hero`/`feedback`); `start` is
  left unset on the hero. Reuse members unchanged: `retrievalGrid{pairs}` (×2 beats), `prediction{options}` +
  `FeedbackSchema.byOption`, `primer{variant:'custom',title,body,collapsible}`,
  `answerEntry{fields:[{id,label,accept,placeholder,suffix?}]}` (×2 beats),
  `tripletReveal{value,lenses,display:'cards'}`, `masteryChallenge{scenario,fields}` (**no `pattern`**),
  `recap{type:'recap'}`.
- **Renderer / widget (`src/lesson/beats/ChainBoardBeat.tsx`, wave0 §3).** L6 exercises the `distribution`
  sub-view only (no `ChainGraph`/Konva): DOM bars evolving toward `stationaryDistribution(P)`.
  - `read-the-share` (graded, no `hero`): bars shown settled; primary `Check`; the typed read-off is graded
    through `resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)`, cross-checked against
    `stationaryDistribution(P_gfg)[cell.row] = 4/7`; reaching reveal calls `reportNeedsReview`.
  - `watch-it-settle` (hero): primary `{ label: isLast ? 'Finish' : 'Continue' }`; bars animate from both rows
    (slow-first per `hero.slowFirst`), then the `πP=π` solver readout fades in; reduced-motion → final settled
    bars + solver readout. Reads from props: `reducedMotion`, `isLast`, `onAdvance`, `reportNeedsReview`,
    `lessonId`, `beat.hero`. Bars are non-interactive `<div>`s; the read-off entry and Continue are ≥44px.
- **Fixture (`fixtures/lesson-markov-chains-6.json`, wave0 §5).** 11 beats as above; `lessonId:"lesson-markov-chains-6"`,
  `courseId:"course-markov-chains"`, `title:"The Stationary Distribution"`, `patternOptions:["H"]`,
  `milestoneId:"markov-chains-stationary"`, `unlocks:"lesson-markov-chains-7"`, `schemaVersion:1`. Graded beats
  `required:true, track:'both'`; `name-stationary` `track:'A', required:false`; `watch-it-settle` carries the
  `hero` block; `mastery-cloudy-town` carries `interviewNote` and **no `pattern`**. Course lesson-node:
  `glyphKey:"πP=π"`, `vizKey:"fourNode"`, `built:true`; this lessonId is the first member of chapter
  `ch-markov-chains-3` ("The Long Run") in `course-markov-chains.json` (wave0 §5b). `validate-fixtures` §6c
  recomputes both `chainBoard` headlines via `markov.ts`.

## Definition-of-Ready checklist (every beat)

| beatId | verified + sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|----------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-geometric | n/a — recall of EV-5's geometric wait E = 1/p, reframed as Kac 1/πᵢ ✔ | tap/drag match (×3) ✔ | triple ✔ | ✔ (renderer) |
| settle-bet | n/a — commitment bet (start-dependence) ✔ | chip pick (×3) ✔ | byOption (×3) ✔ | ✔ |
| name-stationary | n/a — JIT primer ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| read-the-share | 4/7 ✔ engine (`stationaryDistribution(P_gfg)[0]`; GeeksforGeeks, golden row 17) | read settled bars + type the share ✔ | triple ✔ | aria-live share mirror + final frame ✔ |
| watch-it-settle | (3/7, 4/7) ✔ engine (`stationaryDistribution(P_wx)`; Math.SE 3336273, golden row 16) | watch both starts converge ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| solve-pi | (3/7, 4/7) ✔ engine (golden row 16) | type ×2 ✔ | triple ✔ | ✔ |
| kac-return | 7/3 ✔ engine (`kacReturnTime(P_wx, 0)`; golden row 20) | type fraction ✔ | triple ✔ | ✔ |
| triangulate-pi | (3/7, 4/7) ✔ | reveal 3 lenses ✔ | reveal copy ✔ | aria-live ✔ |
| absorbing-vs-stationary | (0, 1) vs (3/7, 4/7) ✔ (L5 absorbing classes; Math.SE 3336273) | tap/drag match (×3) ✔ | triple ✔ | ✔ |
| mastery-cloudy-town | (1/5, 2/5, 2/5) & Kac 5 ✔ engine (Rochester ECE440 HW5 #2; goldens rows 19, 20) | type ×4 ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** Every graded number (`4/7`, `(3/7, 4/7)`, `7/3`, `(1/5, 2/5, 2/5)`, `5`) is an exact
rational from the brief's verified-answers table, each sourced (Math.SE 3336273, GeeksforGeeks, Rochester
ECE440 HW5 #2, Kac's formula) and reproduced by a wave0 §4 golden (rows 16, 17, 19, 20). Both `chainBoard`
beats have a real direct-manipulation mechanic (type the read-off share / watch both starts converge); the
two-distinct-chains design (GfG Sunny/Rainy 4/7 vs Clear/Rainy 3/7,4/7) is the frozen §1 matrix, with distinct
labels to avoid learner collision.

## Gate notes (this lesson)

- **GATED inclusivity** (after appending `lesson-markov-chains-6` to the gate set, wave0 §6b): ≥1 `primer` ✔
  (`name-stationary`, `track:A`, `required:false`); every `prediction` uses `byOption` ✔ (`settle-bet`);
  exactly one `interviewNote` ✔ (`mastery-cloudy-town`); the first graded beat is the `retrievalGrid` opener ✔
  (`recall-geometric`); **no `introducesSymbol` tags** ⇒ the per-track notation-ladder check is **vacuously
  satisfied** (the only candidate grounding is the track-A-only `name-stationary` primer; tagging a
  `track:both` beat would fail the gate in track B — same reasoning as Bayes §6f).
- **MASTERY_LESSONS** (after adding to `MASTERY_LESSONS`): the last beat is `recap` ✔; the penult is a
  `masteryChallenge` `required:true` with **no `pattern`** ✔ (`mastery-cloudy-town`), so the
  `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped — a stationary fraction/vector is not a
  hitting-time (risk R-4).
- **chainBoard cross-check** (wave0 §6c — runs for every `chainBoard` beat with a `headline`, hero or not;
  `task:'stationary'` → `const π = stationaryDistribution(P); got = it.cell ? formatRational(π[it.cell.row]) : formatVector(π)`):
  - `read-the-share` (graded): `headline:"4/7"`, `task:'stationary'`, `cell:{row:0,col:0}` →
    `formatRational(stationaryDistribution(P_gfg)[0]) = "4/7"` ✔.
  - `watch-it-settle` (hero, ungraded for the learner but still validated): `headline:"3/7,4/7"`,
    `task:'stationary'`, **no `cell`** → `formatVector(stationaryDistribution(P_wx)) = "3/7,4/7"` ✔.
  - Both omit `pattern`; `chainBoard` is **NOT** in `HERO_TYPES`/`GRADED_TYPES` (wave0 §6), so neither gate
    asserts on it — the hero rides the beat-level `hero` block, the graded read-off rides this §6c cross-check
    (risk R-2).
