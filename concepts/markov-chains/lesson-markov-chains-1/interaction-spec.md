# Interaction Spec: The Markov Property  (lesson-markov-chains-1)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type,
> the `src/engine/markov.ts` engine, the Konva `ChainGraph.tsx` widget, and the validate-fixtures edits
> are the single source of truth in `../wave0-contracts.md` (§1 field-usage matrix, §3 renderer, §4 engine,
> §6 validator, §9 beat map) — this spec maps every Dept-1 beat to a real interaction type and supplies the
> per-beat feedback ladder, a11y, build decomposition, and Definition-of-Ready.
>
> **This lesson debuts the new `chainBoard` type** (two beats, both `display:'diagram'`): `read-the-edge`
> (graded edge read) and `step-the-weather` (the hero token walk). Everything else reuses shipped renderers.
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]`
> (the safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat
> reads the automaton**, and no `chainBoard`/`masteryChallenge` here carries `pattern`, so the
> `buildAutomaton` cross-check never fires), `milestoneId:'markov-chains-property'`,
> `unlocks:'lesson-markov-chains-2'`, `schemaVersion:1`. Course lesson-node display keys: glyph `P(·|now)`,
> viz `twoNode`. Weather chain `P=[[3/5,2/5],[3/10,7/10]]`, rows = today `["Clear","Rainy"]`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-no-memory` | Tap a streak on the left → pick its "only now matters" match on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag targets ≥44px; `aria-live` mirrors "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `streak-bet` | Pick one chip (lower / same 7/10 / higher) → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-markov` | Expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A · required:false |
| 4 | `read-the-edge` | Tap the Rainy node → tap its out-edge to Rainy → the rational reads 7/10 → Check → hint ladder | `chainBoard` `display:'diagram'` | **NEW** | `display`,`matrix`,`labels`,`task:'entry'`,`cell:{row:1,col:1}`,`interactive`,`headline:"7/10"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | nodes/edges = `<button>` ≥44px; visually-hidden `aria-live` "P(rain tomorrow \| rain today) = 7 in 10"; reduced-motion → static graph | Konva `ChainGraph`; one-shot edge pulse on tap | both |
| 5 | `step-the-weather` | Press Step → a token hops, the next state drawn **only** from the current row → loop | `chainBoard` `display:'diagram'` | **NEW** (hero) | `display`,`matrix`,`labels`,`interactive` (simulateChain), `headline:"7/10"` + beat-level `hero{slowFirst,structuralReadout,reducedMotionFinalFrame:true}` (⇒ ungraded) | Step `<button>` ≥44px; `aria-live` "On Rainy: next draw 7 in 10 rainy, 3 in 10 clear"; reduced-motion → token at settled node, no motion | Konva `ChainGraph`; node pulse + energy packet along the active edge; slow-first | both |
| 6 | `name-memoryless` | Reveal each of three lenses (edge / row / draw) → they converge on `P(Xₙ₊₁\|Xₙ)` | `tripletReveal` | reuse | `value`, `lenses:[{label,body}]` (×3), `display:'cards'` + beat-level `interviewNote` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 7 | `markov-or-not` | Tap a story on the left → pick "Markov / Not Markov" on the right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `remembers-vs-forgets` | Pick one chip → per-option note (seeds L4 absorbing / L7 ergodic) → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | radio ≥44px; `aria-live` note | none | B · required:false |
| 9 | `mastery-augment` | Read the sticky-weather scenario → type P(rain \| RR) → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; Enter submits; `aria-live` | none | both |
| 10 | `recap-now` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

Graded beats `1, 4, 7, 9` are `required:true`, `track:'both'`. The JIT primer `name-markov` (track A) and the
forward-seed `remembers-vs-forgets` (track B) are `required:false` (track-exclusive beats must be, per the
`BeatSchema.track` comment). The hero `step-the-weather`, the reveal `name-memoryless`, the bet `streak-bet`,
and `recap-now` are `track:'both'`, `required:true`.

## Remaps vs. Dept-1 brief (explicit)

- **`mastery-augment` is a pure `masteryChallenge` type-in — NOT a `chainBoard`.** This matches the brief
  (which already specs beat 9 as `masteryChallenge` reuse) and the frozen wave0 §1 note: "Mastery beats are
  NOT chainBoard … the penult beat is a pure `masteryChallenge` type-in (gate-required, no `pattern`);
  `masteryChallenge` and `chainBoard` are distinct schema members and are never combined in one beat." The
  4-state augmented chain is *described* in the `scenario` and engine-verified offline (golden), but the beat
  grades the typed `4/5` against the `accept` list — it never renders a chainBoard surface.
- **The two `chainBoard` debut beats — display + task:**
  - `read-the-edge` → `display:'diagram'`, **`task:'entry'`**, `interactive:true`, **no `hero` ⇒ graded**.
    The renderer checks the learner's tapped edge against `matrixPower(weather,1)[1][1]` (the `entry` engine
    path; `step` defaults to 1, so this is the literal matrix entry `weather[1][1]=7/10`). `cell:{row:1,col:1}`.
  - `step-the-weather` → `display:'diagram'`, **no `task`** (the passive watch carries no engine-anchored
    grade), `interactive:true` (animates the token via `simulateChain`), **carries `hero` ⇒ ungraded**.
    `headline:"7/10"` is the hero's structural anchor (mirrored by `structuralReadout`); because it has no
    `task`, the §6c validator switch hits `default: continue` and does not assert on it.
- No other remaps. Every other beat (`recall-no-memory`, `streak-bet`, `name-markov`, `name-memoryless`,
  `markov-or-not`, `remembers-vs-forgets`, `mastery-augment`, `recap-now`) maps 1:1 to the brief's stated
  reuse type.

## New interaction types (for Wave 0)

**`chainBoard` (debuts here, `display:'diagram'` only this lesson).** Restating the relevant schema line — the
**frozen full definition is wave0-contracts.md §1** (appended as the last member of the `InteractionSchema`
discriminated union in `src/content/schema.ts`, reusing the existing `RationalSchema`):

```ts
z.object({
  type: z.literal('chainBoard'),
  display: z.enum(['diagram', 'matrix', 'powers', 'distribution', 'stationary']), // L1 uses 'diagram'
  matrix: z.array(z.array(RationalSchema)),       // weather P = [[3/5,2/5],[3/10,7/10]]
  labels: z.array(z.string()).min(2),             // ["Clear","Rainy"]
  task: z.enum(['entry','build','classify','absorption','stationary','balance','pagerank']).optional(),
  cell: z.object({ row: z.number().int().nonnegative(), col: z.number().int().nonnegative() }).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),                // engine-reproducible anchor "7/10"
  // (layout / step / start / absorbing / damping unused this lesson)
}),
```

- **Grading rule (wave0 §1, FROZEN):** a `chainBoard` beat is **graded iff its beat-level `hero` block is
  absent**. `read-the-edge` omits `hero` ⇒ graded (standard `useHintLadder` + `FeedbackStrip`).
  `step-the-weather` carries `hero` ⇒ ungraded "watch it resolve" (primary = Continue).
- **`chainBoard` is NOT in `HERO_TYPES` and NOT in `GRADED_TYPES`** (wave0 §1/§6): the hero/graded split rides
  the beat-level `hero` block + the §6c engine cross-check, exactly like `bayesUpdate`.
- **Renderer `src/lesson/beats/ChainBoardBeat.tsx`** (wave0 §3): narrows `props.beat.interaction` to the
  `chainBoard` member, ignores `automaton`/`pattern`, composes `<BeatShell>`. `display:'diagram'` →
  **`ChainGraph`**.
- **Konva `ChainGraph.tsx`** (NEW, sibling to `StateGraph.tsx` — reuse-as-pattern, do **not** mutate the
  H/T-bound `StateGraph`): renders an arbitrary chain with rational edge labels + self-loops, the `ch3` accent
  (`chapterColor(lessonId)` → `#F05A4A`), and the flip choreography (node pulse + one-shot energy packet along
  the active edge) for the `simulateChain` token. Imports `konva/theme.ts` (`C`, `accentFor`, `hexToRgba`,
  `FONT_MONO`).
- **Engine dep `src/engine/markov.ts`** (NEW, pure/exact-rational, wave0 §4): `matrixPower` (the `entry` read)
  and `simulateChain` (the hero token; Monte-Carlo, never on a graded path).

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle nudge),
`hints[1]`=Hint 2 (**the misconception refutation**, drawn from the brief's Misconceptions section),
`hints[2]`=Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again" resets). `required` graded
beats that ever reach reveal report `needsReview`. `prediction` beats use `byOption` per-option notes
(`correct` flag) instead of a ladder.

**1 · `recall-no-memory`** — graded `correct` + `hints[3]`
- correct: "Memorylessness travels: the coin ignored its run, and so does the weather — the next state reads only 'now', never the streak."
- hints: `["You met this with the coin — a long run of heads doesn't bend the next flip.", "A Markov process keeps no tally of its run. P(rain tomorrow | rain today) = 7/10 whether it's rained one day or ten — the streak length is not part of the state. 'Due' is the gambler's fallacy.", "Match each run to 'only now matters': 9 heads → still 1/2; 9 wet days → still 7/10; 'we're due' → gambler's fallacy."]`
- pairs: `"A fair coin after 9 heads"→"still 1/2 — the run isn't tracked"`, `"Rain after 9 wet days"→"still 7/10 — only today's state matters"`, `"\"We're due for a change\""→"gambler's fallacy — no tally is kept"`

**2 · `streak-bet`** — `byOption` (+ fallback `hints`)
- `"Lower — nine wet days, it's due to clear"` → `{note:"That's the gambler's fallacy. A Markov process keeps no tally of its run — P(rain tomorrow | rain today) = 7/10 whether it rained one day or ten. The streak length is not part of the state.", correct:false}`
- `"The same 7/10 — only 'today is wet' matters"` → `{note:"Exactly — the chain reads only today's state. Nine wet days or one, rainy-today is rainy-today: 7/10.", correct:true}`
- `"Higher — wet weather feeds on itself"` → `{note:"Tempting, but the chain has no streak counter. Each step reads only the current state, so the run doesn't compound — it stays 7/10.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll test it on the chain.", "The streak isn't part of the state; only today is.", "It stays 7/10 — the run doesn't move it."]`

**3 · `name-markov`** (primer; copy = caption/aria)
- correct: "State, memoryless, `P(next | now)` — keep those three words."
- hints: `["'Where you are now' is the state.", "Memoryless: everything before the current state is discarded — not the current state itself.", "P(Xₙ₊₁ | X₀…Xₙ) = P(Xₙ₊₁ | Xₙ)."]`
- title: "Markov = memoryless" · body: "A process is **Markov (memoryless)** when the next state depends only on **where you are now** — the *state* — not the path that got you there. Formally `P(Xₙ₊₁ | X₀…Xₙ) = P(Xₙ₊₁ | Xₙ)`: the whole past collapses into the single current state."

**4 · `read-the-edge`** — graded `correct` + `hints[3]`
- correct: "Condition on **today**, so read today's **row**. Rainy-today is row 2 `[3/10, 7/10]`; the rain-tomorrow edge is the 7/10 self-loop. **7/10**."
- hints: `["Start on the node you're given: 'rain today' → tap the Rainy node, then its out-edge to Rainy.", "Condition on today, so read today's row. Rainy-today is the second row [3/10, 7/10]; the entry for rain-tomorrow is 7/10. Rows are 'where you are now,' columns are 'where you go.'", "The Rainy → Rainy self-loop is 7/10."]`
- chainBoard fields: `display:'diagram'`, `matrix:[[3/5,2/5],[3/10,7/10]]` = `[[{n:3,d:5},{n:2,d:5}],[{n:3,d:10},{n:7,d:10}]]`, `labels:["Clear","Rainy"]`, `task:'entry'`, `cell:{row:1,col:1}`, `interactive:true`, `headline:"7/10"`

**5 · `step-the-weather`** (ungraded hero; copy = aria/caption)
- correct: "Watch the token hop: each step the next state is drawn **only** from the current row — Clear fires `[3/5, 2/5]`, Rainy fires `[3/10, 7/10]`. The path of hops so far never enters the draw."
- hints: `["Press Step. The lit row is the only thing the next draw uses.", "The history of hops doesn't bias the next one — only the node you're standing on.", "Sit on Rainy and the next draw is 3/10 clear, 7/10 rainy — every time, regardless of the run."]`
- `hero.structuralReadout`: "Only the current row fires: from Rainy the next draw is 7/10 rainy, 3/10 clear — the streak never enters the draw."
- `hero`: `{slowFirst:true, structuralReadout:"…", reducedMotionFinalFrame:true}` · chainBoard fields: `display:'diagram'`, `matrix` (weather), `labels:["Clear","Rainy"]`, `interactive:true`, `headline:"7/10"` (no `task`)

**6 · `name-memoryless`** (ungraded reveal)
- correct: "Edge, row, and draw all read **only the current state** ⇒ `P(Xₙ₊₁ | X₀…Xₙ) = P(Xₙ₊₁ | Xₙ)`. That's the Markov property."
- hints: `["Reveal each lens — edge, row, draw.", "Memoryless ≠ independent. Today matters a lot — 7/10 after rain vs 2/5 after clear. What's discarded is everything *before* today, not today itself.", "All three keep only 'now': P(Xₙ₊₁ | past) = P(Xₙ₊₁ | Xₙ)."]`
- `value:"P(Xₙ₊₁ | Xₙ)"` · `display:'cards'` · lenses: `{label:"Diagram edge", body:"The edge out of Rainy reads 7/10 — it leaves the node you're on, nothing earlier."}`, `{label:"Matrix row", body:"Conditioning on today picks one row; that row alone is the next-step distribution."}`, `{label:"Simulation draw", body:"Each hop samples the current node's row — the chain of past hops never enters the draw."}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L1): "Memorylessness — *the* defining property — is the first thing a quant interview probes about a chain. State it as `P(Xₙ₊₁ | X₀…Xₙ) = P(Xₙ₊₁ | Xₙ)`: the current state is a sufficient statistic for the future."

**7 · `markov-or-not`** — graded `correct` + `hints[3]`
- correct: "Markov isn't 'no past' — it's 'no past **beyond the current state**.' Only-today is Markov; last-3-days isn't (on the raw state); the running max is Markov because the max already **is** the state."
- hints: `["Ask: does the next step need anything other than the single current state?", "Depending on the past is fine — depending on more than the current **state** is the problem. Fold the history you need into the state and it's Markov again.", "Only-today → Markov; last-3-days → not Markov (raw state); running-max → Markov."]`
- pairs: `"Tomorrow's weather uses only today's"→"Markov"`, `"Tomorrow's weather uses the last 3 days"→"Not Markov on {Clear, Rainy}"`, `"Your score = the running max so far"→"Markov — the max is the state"`

**8 · `remembers-vs-forgets`** — `byOption` (+ fallback `hints`)
- `"Both eventually forget where they started"` → `{note:"Half-right: the ergodic weather chain forgets its start (L7, Pⁿ→π). But a chain with an absorbing state never forgets — once it lands there it can't leave. Memoryless ≠ can't-get-stuck.", correct:false}`
- `"The absorbing one never forgets — once stuck, it stays"` → `{note:"Right. A memoryless chain can still have a one-way trapdoor: an absorbing state (L4). 'Memoryless' constrains the next step, not whether the long run can lock in.", correct:true}`
- `"Neither forgets — Markov means perfect memory"` → `{note:"Markov is the opposite of perfect memory — the next step reads only the current state. Some chains forget their start entirely (L7); others lock into an absorbing state (L4).", correct:false}`
- hints: `["No wrong guess — this seeds L4 (getting stuck) and L7 (forgetting the start).", "Memoryless constrains the next step, not whether the long run can lock in.", "Absorbing → never leaves; ergodic → forgets the start."]`

**9 · `mastery-augment`** — graded `correct` + `hints[3]`
- correct: "On {Clear, Rainy} the rule is ill-defined (4/5 after RR, 1/5 after CR) ⇒ not Markov. Augment the state to **(yesterday, today)**: from **RR**, rain tomorrow is **4/5**. Same process, clean 4-state chain."
- hints: `["The rule needs *two* days, so one day isn't enough state. What pair of days determines tomorrow?", "Only on the raw {Clear, Rainy} state is it non-Markov — P(rain | today rainy) is ambiguous (4/5 after RR, 1/5 after CR). Redefine the state as the ordered pair (yesterday, today) and the *same* process is a clean 4-state Markov chain. Augmentation is the fix.", "State RR means it rained both days, so the rule fires at 4/5. P(rain | RR) = 4/5."]`
- scenario: "'Sticky weather': it rains tomorrow with probability **4/5** if it rained **both** today and yesterday, otherwise **1/5**. On the raw state {Clear, Rainy} this isn't Markov — P(rain tomorrow | rainy today) is 4/5 after RR but 1/5 after CR. Redefine the state as the ordered pair **(yesterday, today)** to get a clean 4-state Markov chain." · field: `{id:"rr", label:"P(rain tomorrow | state = RR)", accept:["4/5"]}` — **no `pattern`**

**10 · `recap-now`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "Only **now** matters: a Markov process reads the current state and discards the path. If the next step needs more history, **fold that history into the state** — then it's Markov again."
- hints: `["Nine wet days or one — rainy-today is rainy-today: 7/10. The streak isn't in the state.", "Memoryless ≠ independent: today matters (7/10 vs 2/5); what's discarded is everything before today.", "Next up: pack a whole chain into one transition matrix P — every row a 'where you are now'."]`

## Build decomposition (Technical Planner — for Dept 3)

**Engine (`src/engine/markov.ts`, wave0 §4).** L1 exercises two functions plus the offline mastery verify:
- `matrixPower(P, n)` — `read-the-edge` grades `matrixPower(weather, 1)[1][1] = 7/10`. (`entry` path; `step`
  defaults to 1, so `matrixPower(P,1) = P` and the read is the literal entry `weather[1][1]`.) **Golden** (wave0
  §4 table row 1): `matrixPower(weather,1)[1][1] = '7/10'`.
- `simulateChain(P, start, steps, rng?)` — `step-the-weather` hero token (Monte-Carlo via `mulberry32`;
  **never on a graded path**). No golden (it feeds the animated token only); seeded for the reduced-motion
  final frame.
- `buildChain(P, labels)` + `matrixPower` — the **constructed** "sticky weather" augmented chain on
  `(yesterday, today) ∈ {CC, CR, RC, RR}` is row-stochastic, and from `RR` rain-tomorrow keeps state `RR` so
  `matrixPower(aug,1)[RR][RR] = 4/5`. **Engine-verify golden** (brief: "Engine-verify the 4/5 and the augmented
  chain's validity") pinned in `markov.test.ts`. The beat itself grades via the `masteryChallenge` accept-list
  `["4/5"]` — it is **not** a `chainBoard` and is **not** touched by the §6c cross-check.
- `formatRational` — formats `{n:7,d:10}` → `"7/10"` for the §6c headline assert.

**Schema (`src/content/schema.ts`, wave0 §1).**
- `chainBoard` fields used — `read-the-edge`: `type`, `display:'diagram'`, `matrix` (2×2 rationals), `labels`
  (×2), `task:'entry'`, `cell:{row,col}`, `interactive`, `headline`. `step-the-weather`: same minus
  `task`/`cell`, plus beat-level `hero`.
- Reuse types: `retrievalGrid{pairs:[{left,right}]}` (×2 beats), `prediction{options}` + `FeedbackSchema.byOption`
  (×2), `primer{variant:'custom',title,body,collapsible}`, `tripletReveal{value,lenses:[{label,body}],display:'cards'}`,
  `masteryChallenge{scenario,fields:[{id,label,accept}]}` (**no `pattern`**), `recap{type:'recap'}`.

**Renderer / widget (`ChainBoardBeat.tsx` + `ChainGraph.tsx`, wave0 §3).**
- `ChainBoardBeat` narrows to the `chainBoard` member (early-return `null` otherwise), composes `<BeatShell>`,
  and for `display:'diagram'` renders `<ChainGraph>`. Graded mode (`read-the-edge`, no `hero`): primary
  `Check`, wires `resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)`; reaching reveal calls
  `reportNeedsReview`. Hero mode (`step-the-weather`): primary `{ label: isLast ? 'Finish' : 'Continue' }`.
- `ChainGraph` props (this lesson): 2 nodes `["Clear","Rainy"]`; rational edge labels incl. both self-loops
  (`3/5, 2/5, 3/10, 7/10`); `accent` from `chapterColor(lessonId)` (`ch3` → `#F05A4A`); read mode (`entry`)
  taps an edge and reports the value for the graded check; hero mode animates the `simulateChain` token (node
  pulse + energy packet); `reducedMotion` → final settled frame. Reads from props: `reducedMotion`, `isLast`,
  `onAdvance`, `reportNeedsReview`, `lessonId`, `beat.hero`.

**Fixture (wave0 §5).**
- `fixtures/lesson-markov-chains-1.json`: `lessonId:"lesson-markov-chains-1"`,
  `courseId:"course-markov-chains"`, `title:"The Markov Property"`, `patternOptions:["H"]`,
  `milestoneId:"markov-chains-property"`, `unlocks:"lesson-markov-chains-2"`, `schemaVersion:1`, the 10 beats
  above.
- `fixtures/course-markov-chains.json` lesson node: `glyphKey:"P(·|now)"`, `vizKey:"twoNode"`, `built:true`;
  this lessonId is the first member of chapter `ch-markov-chains-1` ("The Memoryless Machine").

## Definition-of-Ready checklist (every beat)

| beatId | verified+sourced problem | concrete interactive mechanic | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|-------------------------------|----------------------------------|----------------------------------------|
| recall-no-memory | n/a — recall of PHT/Bayes "the coin has no memory" ✔ | tap/drag match (×3) ✔ | triple ✔ | ✔ (renderer) |
| streak-bet | 7/10 (brief table; Math.SE 3336273) ✔ | chip pick ✔ | byOption (×3) ✔ | ✔ |
| name-markov | n/a — JIT primer ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| read-the-edge | 7/10 ✔ engine (`matrixPower(weather,1)[1][1]`; Math.SE 3336273) | tap/read the Rainy→Rainy edge ✔ | triple ✔ | aria-live edge mirror + static-graph reduced-motion ✔ |
| step-the-weather | 7/10 ✔ engine (`simulateChain` draws from the current row) | press Step, watch the token ✔ | hero readout + caption ✔ | aria-live + final-frame ✔ |
| name-memoryless | n/a — triangulate edge/row/draw ✔ | reveal 3 lenses ✔ | reveal copy ✔ | aria-live ✔ |
| markov-or-not | n/a — classify stories (only-today / last-3-days / running-max) ✔ | tap/drag match (×3) ✔ | triple ✔ | ✔ |
| remembers-vs-forgets | n/a — forward seed (L4/L7) ✔ | chip pick ✔ | byOption (×3) ✔ | ✔ |
| mastery-augment | 4/5 ✔ engine (augmented (yesterday,today) chain, RR-row; **constructed → engine-verify**, brief table) | type fraction ✔ | triple ✔ | ✔ |
| recap-now | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** Every graded numeric answer (`7/10`, `4/5`) is an exact rational from the brief's
verified-answers table; both `chainBoard` debut beats have a real direct-manipulation mechanic (tap an edge /
step the token).

## Gate notes (this lesson)

- **GATED** (after appending `lesson-markov-chains-1` to the gate set, wave0 §6b): ≥1 `primer` ✔
  (`name-markov`); every `prediction` uses `byOption` ✔ (`streak-bet`, `remembers-vs-forgets`); exactly one
  `interviewNote` ✔ (`name-memoryless`); the first graded beat is the `retrievalGrid` opener ✔
  (`recall-no-memory`); **no `introducesSymbol` tags** ⇒ the per-track notation-ladder check is **vacuously
  satisfied** (the only candidate groundings are the track-A-only `name-markov` primer; tagging a `track:both`
  beat would fail the gate in track B — same reasoning as Bayes §6f).
- **MASTERY** (wave0 §6b): last beat is `recap` ✔ (`recap-now`); the penult is a `masteryChallenge`
  `required:true` with **no `pattern`** ✔ (`mastery-augment`), so the `buildAutomaton(pattern).E0 ∈ accept`
  cross-check is skipped — `4/5` is a Markov fraction, not a hitting-time.
- **chainBoard cross-check** (wave0 §6c): `read-the-edge` declares `headline:"7/10"`; the validator switches on
  `task:'entry'`, computes `matrixPower(weather, step ?? 1)[cell.row][cell.col] = matrixPower(weather,1)[1][1]`,
  formats it via `formatRational` → `"7/10"`, and asserts equality. `step-the-weather` declares
  `headline:"7/10"` as the hero's structural anchor, but carries **no `task`**, so the switch hits
  `default: continue` and the validator does not assert on it (consistent with the frozen §1 matrix and the
  "passive hero with no engine-anchored headline" rule).
