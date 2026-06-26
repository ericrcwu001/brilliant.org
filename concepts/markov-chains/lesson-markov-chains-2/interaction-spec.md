# Interaction Spec: The Transition Matrix  (lesson-markov-chains-2)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type, the
> `markov.ts` engine, the Konva `ChainGraph.tsx` widget, and the validate-fixtures edits live in
> `../wave0-contracts.md` (§1 field-usage matrix, §3 renderer, §4 engine, §6 gates, §9 beat map) — this spec
> maps every Dept-1 beat to a real interaction type and supplies the per-beat feedback ladder, a11y, build
> decomposition, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]`
> (safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat reads
> the automaton**; no `chainBoard`/`masteryChallenge` here carries `pattern`, so the `buildAutomaton`
> cross-check never fires), `milestoneId:'markov-chains-matrix'`, `unlocks:'lesson-markov-chains-3'`,
> `schemaVersion:1`. Catalog node keys: glyph `Σrow=1`, viz `stateMachine`.
>
> **One idea:** a transition matrix is the diagram rewritten — each state's outgoing arrows become **one row**
> of `P`, and because from where you are now you always go *somewhere* next, **every row sums to 1**. The
> diagram and the matrix are one object; a missing entry is never free, it's `1 − (the rest)`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-rows-sum-to-1` | Tap a familiar split on the left → pick its forced complement on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | tap/drag targets ≥44px; `aria-live` status mirror "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `predict-the-missing-edge` | Pick a chip for the Rainy row's missing entry → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-the-matrix` | Expand the JIT primer ("transition matrix") → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `fill-the-row` | Type the Clear row's missing entry so the row totals 1 → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` | text input ≥44px; Enter submits; `FeedbackStrip` `aria-live` | none | both |
| 5 | `build-the-board` | Drag an edge / step a node's rational split → the mirrored matrix cell moves live (rows-sum-to-1 enforced) → loop another edge; Continue | `chainBoard` `display:'diagram'` | **NEW** | `display:'diagram'`, `task:'build'`, `matrix`, `labels`, `interactive:true`, `headline:'1'` + beat-level `hero` | every node/edge handle = `<button>`/`<input type=range>` ≥44px, arrow-key steppable; visually-hidden `aria-live` mirror ("P(Clear→Rainy)=2 in 5; Clear row sums to 1"); reduced-motion → final frame | Konva `ChainGraph` (node pulse + edge energy packet), DOM matrix mirror w/ CSS width; slow-first per `hero.slowFirst` | both |
| 6 | `read-as-one` | Reveal each of three lenses (diagram · matrix · row-sum) → they converge on one object `P` | `tripletReveal` | reuse | `value:'Σrow=1'`, `lenses:[{label,body}]`, `display:'cards'` + beat-level `interviewNote` (**Dept-2 ADD**) | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 7 | `spot-the-invalid` | Tap a candidate row → pick its verdict (valid / invalid + the fix) → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | tap/drag ≥44px; `aria-live` mirror | none (tap) | both |
| 8 | `build-from-story` | Type each story sentence into its matrix cell → the live row-sum readout closes to 1 → Check → hint ladder | `chainBoard` `display:'matrix'` | **NEW** | `display:'matrix'`, `task:'build'`, `matrix`, `labels`, `interactive:true`, `headline:'1'` (no `hero` ⇒ graded) | editable rational cells = inputs ≥44px, arrow-key steppable; visually-hidden `aria-live` row-sum mirror ("Sunny row: 7/10 + 3/10 = 1"); `FeedbackStrip` `aria-live`; reduced-motion safe | DOM/SVG grid + CSS; live per-row-sum chip; no token motion | both |
| 9 | `mastery-challenge` | Type the Land-of-Oz entries, the row-sum, and the L3 seed `(P²)_Rain,Snow` → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept,placeholder}]` — **no `pattern`** | badge card; inputs ≥44px; Enter; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

**Graded vs hero (per wave0 §1 grading rule — graded ⇔ no `hero` block):** graded = `recall-rows-sum-to-1` (opener),
`fill-the-row`, `spot-the-invalid`, `build-from-story` (chainBoard, `headline:'1'`), `mastery-challenge` — all
`required:true, track:both`. Hero (ungraded) = `build-the-board` (carries the `hero` block; `headline:'1'` is the
engine cross-check anchor only). Ungraded non-hero = `predict-the-missing-edge` (byOption), `name-the-matrix`
(primer, `track:A, required:false`), `read-as-one`, `recap`.

## Remaps vs. Dept-1 brief (explicit)

- **`mastery-challenge` (b9) is a PURE `masteryChallenge` type-in, NOT a chainBoard.** The Dept-1 brief beat
  table wrote "REUSE `masteryChallenge` (folds `chainBoard:matrix` build)". The wave0 §1 freeze overrides:
  *"Mastery beats are NOT chainBoard … the penult beat is a pure `masteryChallenge` type-in (gate-required, no
  `pattern`); the chainBoard surface lives in that lesson's preceding hero/solve beat."* The live chainBoard
  **build** surface already appears at **`build-the-board` (b5, the `display:'diagram'`↔matrix hero)** and at
  **`build-from-story` (b8, `display:'matrix'`)**, so the 3-state Land-of-Oz transfer is **typed**, not rebuilt
  in a widget. `masteryChallenge` and `chainBoard` are distinct schema members and are never combined in one
  beat.
- **`interviewNote` ADDED on `read-as-one` (b6) — Dept-2 GATE addition.** The L2 brief specified **no**
  `interviewNote`, but the GATED set requires exactly one per lesson (wave0 §6f, risk R-5). This is a
  **kickback-prevention addition**: copy = *"Row-stochastic — every row of P sums to 1 — is the first sanity
  check an interviewer expects you to state about a transition matrix."* (Carried on `read-as-one` because
  that is the MODEL beat where `P` is formalized.)
- **chainBoard build beats — display/task pinned to wave0 §1.** The brief sketched b5 as
  "`chainBoard:diagram↔matrix`" and b8 as "`chainBoard:matrix`". Realized per the frozen field-usage matrix:
  - **b5 `build-the-board`** = `display:'diagram'`, `task:'build'`, `interactive:true`, **hero** (ungraded). The
    "diagram↔matrix" of the brief is the **dyna-link**: dragging an edge in the `ChainGraph` updates the
    mirrored DOM matrix cell live, rows-sum-to-1 enforced. Weather `P=[[3/5,2/5],[3/10,7/10]]`, labels
    `["Clear","Rainy"]`.
  - **b8 `build-from-story`** = `display:'matrix'`, `task:'build'`, `interactive:true`, **graded** (no hero),
    `headline:'1'`. Story `P=[[7/10,3/10],[4/10,6/10]]`, labels `["Sunny","Rainy"]`.
  - Per Manager decision #3 (lean **FOLD**), both presentations are the **one** `chainBoard` type (no sibling
    builder), exactly as `raceSim`/`walkBoard`/`bayesUpdate` fold their displays.
- No other remaps. Every other beat maps 1:1 to an existing real type.

## New interaction types (for Wave 0)

L2 is the **second** lesson to exercise the single new `chainBoard` type (after L1's `read-the-edge` /
`step-the-weather`). The type, schema, renderer, and engine are **frozen in `../wave0-contracts.md` §1–§4** —
nothing new is introduced here. L2 uses **two of the five displays**:

- **`display:'diagram'`** (b5) — the transition graph; `task:'build'` = drag edges / step rational probs with
  rows-sum-to-1 enforced. Renders via the new Konva **`ChainGraph.tsx`** (sibling to `StateGraph.tsx`, reuses
  `konva/theme.ts` + `chapterColor` → `ch3` accent `#F05A4A`). Not mutating shipped `StateGraph` (risk R-6).
- **`display:'matrix'`** (b8) — the same chain as the grid `P`; `task:'build'` = editable rational cells with a
  live row-sum check. DOM/SVG + CSS (no Konva), mirroring `WalkBoardBeat`/`BayesUpdateBeat`.

Frozen schema member (wave0 §1 — appended last in the `InteractionSchema` union; reuses `RationalSchema`,
**no new primitive**):

```ts
z.object({
  type: z.literal('chainBoard'),
  display: z.enum(['diagram', 'matrix', 'powers', 'distribution', 'stationary']),
  matrix: z.array(z.array(RationalSchema)),   // row-stochastic, aligned to `labels`
  labels: z.array(z.string()).min(2),
  task: z.enum(['entry','build','classify','absorption','stationary','balance','pagerank']).optional(),
  // …layout/step/start/absorbing/cell/damping (unused in L2)…
  interactive: z.boolean().optional(),
  headline: z.string().optional(),            // engine-reproducible anchor (L2: '1' = rows sum to 1)
}),
```

- **Dispatcher** (wave0 §2): `import { ChainBoardBeat } from './ChainBoardBeat'` + `case 'chainBoard': return <ChainBoardBeat {...props} />`.
- **Renderer** (wave0 §3): `ChainBoardBeat.tsx` narrows to the `chainBoard` member, ignores `automaton`/`pattern`,
  composes `<BeatShell>`. Graded ⇔ no `hero` (b8 runs the hint ladder via `useHintLadder` + `FeedbackStrip`; b5
  hero → primary Continue).
- **Engine** (wave0 §4): `src/engine/markov.ts` — pure, dependency-free, **exact rational**. L2 touches
  `buildChain` (validate square + rows-sum-to-1), `matrixPower` (the L3 seed), `formatRational`.
- **NOT in `HERO_TYPES` / `GRADED_TYPES`** (wave0 §1, §6): the hero/graded split rides the beat-level `hero`
  block + the §6c chainBoard cross-check, exactly as `bayesUpdate`.

## Feedback + hint ladders (actual copy)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]` = Hint 1 (gentle),
`hints[1]` = Hint 2 (**the brief's misconception refutation**), `hints[2]` = Hint 3 = the **revealed answer**
(label flips to "Answer"; "Try again" resets). `required` graded beats that ever reach reveal report
`needsReview`. Ungraded beats (hero/primer/reveal/recap) use `correct` + `hints` as caption/aria copy.

**1 · `recall-rows-sum-to-1`** — graded `correct` + `hints[3]`
- correct: "Those familiar splits — the fair coin's 1/2-1/2, the gambler's 2/5-3/5 — are exactly the **rows** of a transition matrix, and each one sums to 1."
- hints: `["Warm-up from Penney's / Gambler's Ruin — a state's exits, no pressure.", "From where you are now you go somewhere next with certainty, so a state's outgoing probabilities are a full menu that must add to 1. A row summing to 9/10 means the chain vanishes a tenth of the time; 11/10 means it's in two places at once.", "Fair coin: T = 1/2; gambler: down = 3/5; any state's out-edges total 1."]`
- pairs: `"Fair coin: P(H) = 1/2 → P(T)"→"1/2"`, `"Gambler: P(up) = 2/5 → P(down)"→"3/5"`, `"Any state: total of its out-edges"→"1"`

**2 · `predict-the-missing-edge`** — `byOption` (Rainy row `[3/10, ?]`; + fallback `hints`)
- `"7/10 — forced by the row totaling 1"` → `{note:"Right — you never need the weather for the last entry. The Rainy row must total 1, so it's 1 − 3/10 = 7/10.", correct:true}`
- `"3/10 — the two out-edges must match"` → `{note:"Out-edges only have to *sum* to 1, not match. From Rainy it's 3/10 to flip and 7/10 to stay — different numbers, same row.", correct:false}`
- `"Can't tell — it depends on the weather"` → `{note:"You never need the story for the LAST entry — the row must total 1, so it's forced: ? = 1 − 3/10 = 7/10.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll check the row total.", "The last entry never needs the story — the row must total 1, so it's forced; and the two out-edges don't have to match, only sum to 1.", "1 − 3/10 = 7/10."]`

**3 · `name-the-matrix`** (primer; copy = caption/aria)
- correct: "Each state's exits, stacked into a row — that's `P`, and every row sums to 1."
- hints: `["Rows, not columns.", "Row i = state i's outgoing probabilities (its arrows).", "P[i][j] = the arrow i→j; every row totals 1."]`
- title: "The transition matrix" · body: "Stack each state's outgoing probabilities as one **row** and you get the **transition matrix** `P`. The Clear row holds Clear's exits; the Rainy row holds Rainy's. Because you always go *somewhere* next, **every row sums to 1** (row-stochastic — Green Book p.53). The transition graph (Fig 5.1) is the same object drawn as arrows."

**4 · `fill-the-row`** — graded `correct` + `hints[3]`
- correct: "1 − 3/5 = **2/5**. The last entry is forced by the row summing to 1 — you need nothing about the weather."
- hints: `["The Clear row must total 1. What's left after 3/5?", "You never need the story for the last entry — the row must total 1, so it's forced: ? = 1 − 3/5 = 2/5.", "2/5."]`
- field: `{id:"clear-flip", label:"Clear row is [3/5, ?] — fill P(Clear → Rainy)", accept:["2/5"], placeholder:"e.g. 1/2"}`

**5 · `build-the-board`** (ungraded hero; copy = aria/caption)
- correct: "Drag any arrow and its matrix cell moves with it; a node's two arrows always re-close to 1 — the diagram and the grid are one object."
- hints: `["Drag an edge or step a split; watch the matrix cell mirror it.", "They're one object in two outfits. Every arrow i→j labeled p IS the cell P[i][j]; all the arrows out of a node ARE that node's row. Drag an edge and the matrix moves with it.", "Clear row [3/5, 2/5], Rainy row [3/10, 7/10] — each sums to 1."]`
- `hero`: `{ slowFirst:true, structuralReadout:"Every arrow Clear→Rainy you set IS the cell P[Clear][Rainy]; Clear's two arrows ARE its row, and that row always closes to 1.", reducedMotionFinalFrame:true }`
- chainBoard fields: `display:'diagram'`, `task:'build'`, `matrix:[[3/5,2/5],[3/10,7/10]]`, `labels:["Clear","Rainy"]`, `interactive:true`, `headline:"1"`

**6 · `read-as-one`** (ungraded reveal; + `interviewNote`)
- correct: "Diagram, grid, and the row-sum law are three views of **one** object `P` — and it's the **rows** (each state's exits) that sum to 1, never the columns."
- hints: `["Reveal each view — they describe the same P.", "A row is ONE starting state's options, so it sums to 1. A column gathers arrows from different starting states into one destination — there's no reason that totals anything. (Row-stochastic is the Green Book convention, p.53.)", "Diagram = matrix = row-stochastic: every row of P sums to 1."]`
- `value:"Σrow=1"` · `display:"cards"` · lenses: `{label:"Diagram", body:"Arrows out of each state, each labeled with a probability; one state's arrows fan out to total 1."}`, `{label:"Matrix P", body:"Stack each state's arrows as a row of the M×M grid P; the entry P[i][j] is exactly the arrow i→j."}`, `{label:"Row-stochastic", body:"Both pictures obey one law: every row of P sums to 1 — rows (a state's exits), not columns."}`
- `interviewNote` (**Dept-2 ADD**; satisfies the GATED "≥1 interviewNote" rule for L2): "Row-stochastic — every row of P sums to 1 — is the first sanity check an interviewer expects you to state about a transition matrix."

**7 · `spot-the-invalid`** — graded `correct` + `hints[3]` (the interleave)
- correct: "A grid is a transition matrix only if **every row sums to 1**. 3/10 + 6/10 = 9/10 fails — fix 6/10 → 7/10 to close the Rainy row."
- hints: `["Add each row across. Which one doesn't reach 1?", "Not every grid of probabilities is a P — the only test is rows-sum-to-1. A row of 3/10 + 6/10 = 9/10 leaks a tenth of the probability, so the chain isn't valid.", "[3/10, 6/10] sums to 9/10 → invalid; fix 6/10 → 7/10."]`
- pairs: `"Row [3/5, 2/5]"→"valid — sums to 1"`, `"Row [3/10, 6/10]"→"invalid — sums to 9/10; fix 6/10 → 7/10"`, `"Row [3/10, 7/10]"→"valid — sums to 1"`

**8 · `build-from-story`** — graded chainBoard `correct` + `hints[3]`
- correct: "'Sunny stays sunny 7/10' is the diagonal P[Sunny][Sunny] = 7/10, leaving 3/10 to turn rainy; 'rainy→sunny 4/10' leaves 6/10 to stay rainy. **P = [[7/10, 3/10], [4/10, 6/10]]** — both rows sum to 1."
- hints: `["Each sentence fills one cell; the rest of that row is forced to total 1.", "'Sunny stays sunny 7/10' is a real step Sunny→Sunny — it's the diagonal entry P[Sunny][Sunny] = 7/10, and it counts toward that row's sum like any other arrow.", "[[7/10, 3/10], [4/10, 6/10]]."]`
- chainBoard fields: `display:'matrix'`, `task:'build'`, `matrix:[[7/10,3/10],[4/10,6/10]]`, `labels:["Sunny","Rainy"]`, `interactive:true`, `headline:"1"` (the renderer grades the built P against `buildChain`; the row-sum invariant is the answer)

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "Land-of-Oz **P = [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]** (Rain/Nice/Snow): Nice→Nice = 0, every row sums to 1, and two steps out (P²)_Rain,Snow = (1/2)(1/4) + (1/4)(1/2) + (1/4)(1/2) = **3/8** — the exact chain L3 opens on."
- hints: `["Each sentence sets one row; the diagonal is 'stays the same,' and a row's last entry is forced to total 1.", "A third state changes nothing about the law — every row is still one starting day's full menu, so the Rain, Nice, AND Snow rows each sum to 1 (even the Nice row, which is 1/2 + 0 + 1/2).", "Nice→Nice = 0; Snow→Snow = 1/2; each row sums to 1; (P²)_Rain,Snow = 3/8."]`
- scenario: "In the **Land of Oz** the weather is Rain, Nice, or Snow. They **never have two nice days in a row** — after a nice day it's a coin-flip between rain and snow. After rain or snow there's an even chance the next day is the **same**; when it does **change**, only half those changes are to a nice day (the other half swap rain↔snow). Build P (rows Rain, Nice, Snow) and verify every row sums to 1."
- fields: `{id:"nice-nice", label:"From the story, P(Nice → Nice)", accept:["0","0/1"], placeholder:"e.g. 1/2"}`, `{id:"snow-snow", label:"P(Snow → Snow)", accept:["1/2"]}`, `{id:"rowsum", label:"Each of the three rows (Rain, Nice, Snow) sums to", accept:["1","1/1"]}`, `{id:"seed", label:"Two steps: (P²) from Rain to Snow", accept:["3/8"], placeholder:"e.g. 1/2"}` — **no `pattern`**

**10 · `recap`** (generic generate-then-reveal; `correct` = principle, `hints` = takeaways)
- correct: "A transition matrix is the diagram rewritten: each state's exits stack into a row, and because you always go somewhere next, **every row sums to 1** — so the diagram and the matrix are one object."
- hints: `["Every arrow i→j labeled p IS the cell P[i][j]; a node's arrows ARE its row.", "A missing entry is never free — it's 1 − (the rest).", "Next up: multiply P by itself — where are you after two steps? (Pⁿ)."]`

## Build decomposition (Technical Planner — for Dept 3)

**Engine (`src/engine/markov.ts` — wave0 §4).**
- `buildChain(P, labels)` — validate **square** + **every row sums to 1** (exact rational); reject
  non-stochastic input. **Must REJECT the b7 distractor** `[[3/5,2/5],[3/10,6/10]]` (Rainy row
  `3/10 + 6/10 = 9/10 ≠ 1`) and **accept** `[[3/5,2/5],[3/10,7/10]]`, `[[7/10,3/10],[4/10,6/10]]`, and the
  3-state Land-of-Oz `[[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]`. Backs both `task:'build'` beats (b5, b8) and
  the b9 type-in grading.
- `matrixPower(P, n)` — exact Pⁿ. Seeds **L3**: `matrixPower(oz, 2)[0][2] = (1/2)(1/4) + (1/4)(1/2) + (1/4)(1/2) = 3/8`
  (Rain→Snow in two steps; the b9 `seed` field). `matrixPower(P,1)=P`.
- `formatRational(r)` — reduced `"n/d"`, or `"n"` when `d=1` (the `headline:'1'` cross-check; the row-sum readouts).
- **No floats on any graded path.** `markov.test.ts` pins the L2-facing goldens: `buildChain` accept/reject set
  above; `matrixPower(oz,2)[0][2] = '3/8'`.

**Schema (`src/content/schema.ts` — wave0 §1).** Append the frozen `chainBoard` member (reuses `RationalSchema`).
L2 fields exercised: `display ∈ {'diagram','matrix'}`, `matrix`, `labels`, `task:'build'`, `interactive`,
`headline`. Reuse types used as-is: `retrievalGrid {pairs:[{left,right}]}` (b1, b7),
`prediction {options} + feedback.byOption` (b2), `primer {variant:'custom',title,body,collapsible}` (b3),
`answerEntry {fields:[{id,label,accept,placeholder?,suffix?}]}` (b4),
`tripletReveal {value,lenses:[{label,body}],display:'cards'} + beat.interviewNote` (b6),
`masteryChallenge {scenario,fields} (no pattern)` (b9), `recap {type:'recap'}` (b10).

**Renderer / widget (`ChainBoardBeat.tsx` + Konva `ChainGraph.tsx` — wave0 §3).**
- `ChainBoardBeat` narrows `props.beat.interaction` to the `chainBoard` member, ignores `automaton`/`pattern`,
  composes `<BeatShell>`. Graded ⇔ no `hero`: **b8** wires `useHintLadder` + `FeedbackStrip` (primary `Check`;
  reaching reveal calls `reportNeedsReview`); **b5** (hero) → primary `{label: isLast?'Finish':'Continue'}`.
- **b5 `display:'diagram'`** → `ChainGraph` (2 nodes Clear/Rainy, self-loops, **rational** edge labels). The
  **diagram↔matrix dyna-link**: dragging/stepping an edge updates that edge's rational **and** the mirrored DOM
  matrix cell live; the touched node's row re-normalizes so it always sums to 1 (rows-sum-to-1 enforced in the
  manipulation, not just at Check). `simulateChain` is **not** needed (this is a build, not a token hop).
- **b8 `display:'matrix'`** → DOM/SVG grid of editable **rational** cells (arrow-key steppable), each row
  carrying a **live row-sum chip** that turns valid when the row reaches 1. Check grades the built P via
  `buildChain`.
- **a11y:** every node/edge handle and matrix cell is a native `<button>`/`<input>` ≥44px; a visually-hidden
  `<p role="status" aria-live="polite">` mirrors the readout in words on each manipulation; `reducedMotion`
  renders the final frame (token/edges settled), honoring `hero.reducedMotionFinalFrame`.

**Fixture (`fixtures/lesson-markov-chains-2.json` — wave0 §5a).** `courseId:"course-markov-chains"`,
`patternOptions:["H"]`, `milestoneId:"markov-chains-matrix"`, `unlocks:"lesson-markov-chains-3"`,
`schemaVersion:1`, the 10 beats above. Course-node catalog keys glyph `Σrow=1` / viz `stateMachine`
(`course-markov-chains.json` lessons[] entry). The §6c validate-fixtures cross-check recomputes every
`chainBoard` `headline` via `markov.ts` (`task:'build'` → `'1'`).

## Definition-of-Ready checklist

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) | kickback |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|----------|
| recall-rows-sum-to-1 | 1/2, 3/5 (PHT ½/½; gambler p=2/5 → 3/5; brief table) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) | none |
| predict-the-missing-edge | 7/10 = 1 − 3/10 (Math.SE 3336273) ✔ | chip pick ✔ | byOption ✔ | ✔ | none |
| name-the-matrix | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ | none |
| fill-the-row | 2/5 = 1 − 3/5 (Math.SE 3336273) ✔ engine (`buildChain`) | type fraction ✔ | triple ✔ | ✔ | none |
| build-the-board | weather P rows = 1 (Math.SE 3336273) ✔ engine (`buildChain`, `headline:'1'`) | drag edge / step split + matrix mirror ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ | none |
| read-as-one | n/a (formalization) ✔ | reveal 3 lenses ✔ | reveal copy ✔ | aria-live ✔ | none (interviewNote added) |
| spot-the-invalid | 9/10 invalid; fix 6/10 → 7/10 (constructed distractor; `buildChain` rejects) ✔ engine | tap/match validity ✔ | triple ✔ | ✔ | none |
| build-from-story | [[7/10,3/10],[4/10,6/10]] rows = 1 (GeeksforGeeks) ✔ engine (`buildChain`, `headline:'1'`) | type each cell + live row-sum ✔ | triple ✔ | aria-live row-sum + final frame ✔ | none |
| mastery-challenge | Land-of-Oz [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]; (P²)_Rain,Snow = 3/8 (G&S Table 11.1) ✔ engine | type entries/row-sum/seed ✔ | triple ✔ | ✔ | none |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ | none |

**Kickbacks: none.** Every graded numeric answer is an exact rational verified against the brief's
anchor-and-source table and the wave0 §4 golden table; the one Dept-1 gap (no `interviewNote`) is closed by the
Dept-2 ADD on `read-as-one`.

## Gate notes (this lesson)

- **GATED inclusivity** (after adding `lesson-markov-chains-2`): ≥1 `primer` ✔ (`name-the-matrix`,
  `track:A, required:false`); every `prediction` uses `byOption` ✔ (`predict-the-missing-edge`); an
  `interviewNote` ✔ (`read-as-one` — **Dept-2 ADD**, the L2 brief specified none; see wave0 §6f / risk R-5);
  first graded beat is the `retrievalGrid` opener ✔ (`recall-rows-sum-to-1`); **no `introducesSymbol` tags** ⇒
  the per-track notation-ladder check is **vacuously satisfied** (the only candidate groundings are the
  track-A-only `name-the-matrix` primer; tagging a `track:both` beat would fail the gate in track B — same
  reasoning as Bayes §6f).
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔
  (so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped — Land-of-Oz fractions are not
  hitting-times; risk R-4).
- **chainBoard cross-check** (wave0 §6c; `chainBoard` is **not** in `HERO_TYPES`/`GRADED_TYPES`): both build
  beats declare `headline:"1"`, recomputed via `markov.ts` for `task:'build'` (`buildChain(P, labels)` ⇒
  `'1'`). **`build-from-story`** (b8, graded, `display:'matrix'`) — the validator runs `buildChain` on
  `[[7/10,3/10],[4/10,6/10]]` (rows sum to 1) and, by the same rule, would **reject** the b7 distractor
  `[[3/5,2/5],[3/10,6/10]]`. **`build-the-board`** (b5, **hero**/ungraded, `display:'diagram'`) also carries
  `headline:"1"` purely as the engine anchor — the `hero` block keeps it ungraded in the renderer.
