# Interaction Spec: Classifying States  (lesson-markov-chains-4)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type, the
> `src/engine/markov.ts` engine, the Konva `ChainGraph.tsx` widget, and the validate-fixtures edits are the
> single source of truth in `../wave0-contracts.md` (§1 field-usage matrix, §3 renderer, §4 engine, §6
> validator, §9 beat map) — this spec maps every Dept-1 beat to a real interaction type and supplies the
> per-beat feedback ladder, a11y, build decomposition, and Definition-of-Ready.
>
> **This is the `chainBoard` workhorse lesson — five `display:'diagram'` beats** (the concept's densest
> classify/absorption surface): `classify-first` (graded, tap the absorbing state), `classify-board` (the
> hero tap-to-classify + period toggle), `classify-and-group` (graded, classify + name classes),
> `ehrenfest-period` (graded period), and `transient-vs-recurrent` (graded absorption / return probability).
> Everything else reuses shipped renderers (`retrievalGrid`, `prediction`, `primer`, `tripletReveal`,
> `masteryChallenge`, `recap`). **The penult `mastery-challenge` is a pure `masteryChallenge` type-in — NOT a
> `chainBoard`** (wave0 §1 mastery note).
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]` (the
> safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat reads
> the automaton**; no `chainBoard`/`masteryChallenge` here carries `pattern`, so the `buildAutomaton`
> cross-check never fires), `milestoneId:'markov-chains-classify'`, `unlocks:'lesson-markov-chains-5'`,
> `schemaVersion:1`. Course lesson-node display keys: glyph `R/T/A`, viz `stateMachine`; L4 sits in chapter
> `ch-markov-chains-2` ("Reaching States") with L5. **Hero / explore 4-state chain**
> `P=[[0,1/2,0,1/2],[0,0,1,0],[0,1,0,0],[0,0,0,1]]`, labels `["1","2","3","4"]` (1 transient · {2,3}
> recurrent period 2 · 4 absorbing). **Ehrenfest m=2** `P=[[0,1,0],[1/2,0,1/2],[0,1,0]]`, labels
> `["0","1","2"]` (one class, period 2).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-absorbing` | Tap a known absorbing case on the left → pick its "can't leave" match on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag targets ≥44px; `aria-live` mirrors "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `open-bet` | Pick one chip (for sure / maybe never / only if absorbing) → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-the-classes` | Expand the JIT primer (recurrent/transient/absorbing/communicating/period) → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A · required:false |
| 4 | `classify-first` | Tap the one state that, once entered, never lets you leave (the absorbing node) → Check → hint ladder | `chainBoard` `display:'diagram'` | **NEW** | `display`,`matrix` (3×3),`labels:["1","2","3"]`,`task:'classify'`,`headline:"absorbing"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | nodes/classify-chips = `<button>` ≥44px; visually-hidden `aria-live` "State 3: absorbing — self-loop probability 1"; reduced-motion → static labelled graph | Konva `ChainGraph`; one-shot chip pulse on tap | both |
| 5 | `classify-board` | Tap each node to label it R/T/A → flip the period toggle on the {2,3} pair → loop | `chainBoard` `display:'diagram'` | **NEW** (hero) | `display`,`matrix` (4×4),`labels:["1","2","3","4"]`,`task:'classify'`,`interactive`,`headline:"2"` + beat-level `hero{slowFirst,structuralReadout,reducedMotionFinalFrame:true}` (⇒ ungraded) | node + chip + period-toggle `<button>`s ≥44px; `aria-live` "1 transient, 2 and 3 recurrent (period 2), 4 absorbing"; reduced-motion → final labelled frame, period shown | Konva `ChainGraph`; tap-to-classify chips + period overlay; slow-first | both |
| 6 | `classify-and-group` | Classify each node, then group them into communicating classes → Check → hint ladder | `chainBoard` `display:'diagram'` | **NEW** | `display`,`matrix` (4×4),`labels:["1","2","3","4"]`,`task:'classify'`,`headline:"transient,recurrent,recurrent,absorbing"` (no `hero` ⇒ graded) + beat-level `interviewNote` + `feedback{correct,hints[3]}` | nodes/chips ≥44px; `aria-live` per-node kind + class membership | Konva `ChainGraph`; class-grouping rings on tap | both |
| 7 | `model-period` | Reveal each of three lenses (return prob / visits / period) → they converge on "recurrent ⇔ return prob 1" | `tripletReveal` | reuse | `value`, `lenses:[{label,body}]` (×3), `display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 8 | `ehrenfest-period` | Trace returns to a state in the Ehrenfest urn → read the period → Check → hint ladder | `chainBoard` `display:'diagram'` | **NEW** | `display`,`matrix` (3×3 Ehrenfest),`labels:["0","1","2"]`,`task:'classify'`,`headline:"2"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | nodes/period readout ≥44px; `aria-live` "Returns take 2, 4, 6, … steps → period 2"; reduced-motion → static graph | Konva `ChainGraph`; even-step return arcs highlighted | both |
| 9 | `transient-vs-recurrent` | Classify the chain, then make the home state absorbing and read the return probability → Check | `chainBoard` `display:'diagram'` | **NEW** | `display`,`matrix` (3×3),`labels:["1","2","3"]`,`task:'absorption'`,`absorbing:[2]`,`cell:{row:1,col:1}`,`headline:"1/2"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | tap home node + read cell ≥44px; `aria-live` "State 1: transient — return probability 1 in 2"; reduced-motion → static graph | Konva `ChainGraph`; absorbing double-ring on state 3; return-path highlight | both |
| 10 | `mastery-challenge` | Read the gambler's-ruin scenario → type the classification **and** the return probability → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` (×2) — **no `pattern`** | badge card; two inputs ≥44px; Enter submits; `aria-live` | none | both |
| 11 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

Graded beats `1, 4, 6, 8, 9, 10` are `required:true`, `track:'both'`. The JIT primer `name-the-classes`
(track A) is `required:false` (track-exclusive beats must be, per the `BeatSchema.track` comment). The hero
`classify-board`, the bet `open-bet`, the reveal `model-period`, and `recap` are `track:'both'`. Exactly one
`hero` block (`classify-board`) and exactly one `interviewNote` (`classify-and-group`).

## Remaps vs. Dept-1 brief (explicit)

- **`mastery-challenge` is a pure `masteryChallenge` type-in — NOT a `chainBoard` and NOT an `answerEntry`.**
  The Dept-1 brief sketched beat 10 as "`masteryChallenge` (REUSE; wraps `chainBoard:diagram` +
  `answerEntry`)". Per the frozen wave0 §1 note — "Mastery beats are NOT chainBoard … the penult beat is a
  pure `masteryChallenge` type-in (gate-required, no `pattern`); `masteryChallenge` and `chainBoard` are
  distinct schema members and are never combined in one beat" — the "wrap" is realized as the **preceding
  chainBoard surfaces** (`classify-first` → `classify-board` → `classify-and-group` → `ehrenfest-period` →
  `transient-vs-recurrent` give the hands-on classify/return-prob practice) **plus a type-in penult**. Beat 10
  renders no chainBoard: it grades two typed fields — a normalized class/kind string and the fraction `2/9` —
  against `accept` lists. The gambler's-ruin chain is *described* in `scenario` and engine-verified offline
  (golden #14), never rendered.
- **The period and return-probability numerics are graded by the `chainBoard` renderer itself, not a separate
  `answerEntry`.** The brief's beats 8/9 said "use the folded `answerEntry`/period readout" and beat 9 added
  "(+`answerEntry` 1/2)". Per the frozen contract, the `chainBoard` `classify` task's period readout
  (`ehrenfest-period` → `2`, `classify-board` → `2`) and the `absorption` task's return-probability read
  (`transient-vs-recurrent` → `1/2`) are checked **in the `ChainBoardBeat` renderer against `markov.ts`**
  (`classifyStates`/`absorptionProbabilities`) via the §6c cross-check — there is **no sibling `answerEntry`
  beat**. This keeps the one-new-type budget and the single chainBoard↔engine validator path; the numeric is
  the beat's `headline`.
- **The five `chainBoard` debut beats — display + task (all `display:'diagram'`):**
  - `classify-first` → `task:'classify'`, **no `hero` ⇒ graded**. The renderer checks the tapped node against
    `classifyStates(P)[2].kind === 'absorbing'` (state 3, the self-loop-1 trap). `headline:"absorbing"` is the
    tapped state's kind (derivation §"Gate notes").
  - `classify-board` → `task:'classify'`, `interactive:true`, **carries `hero` ⇒ ungraded**. The learner taps
    every node to label it and flips a period toggle; `headline:"2"` is the period of the recurrent `{2,3}`
    class (`structuralReadout` mirrors the gcd-of-return-lengths reasoning).
  - `classify-and-group` → `task:'classify'`, **no `hero` ⇒ graded**. Grades per-node kind + class membership;
    `headline:"transient,recurrent,recurrent,absorbing"` = `classifyStates(P).map(c => c.kind).join(',')`.
  - `ehrenfest-period` → `task:'classify'`, **no `hero` ⇒ graded**. `headline:"2"` = `classifyStates(P)[0].period`
    (one class, all states share period 2).
  - `transient-vs-recurrent` → `task:'absorption'`, `absorbing:[2]`, `cell:{row:1,col:1}`, **no `hero` ⇒
    graded**. `headline:"1/2"` = the **return probability** of state "1" (golden #13), computed by making the
    home state absorbing — a return-mode derivation of the `absorption` task (§"Gate notes").
- **`interactive` reserved for the hero.** Per wave0 §3, the renderer's **graded** `classify`/`absorption`
  modes already provide tap-to-classify / tap-the-state answer input inherently ("classify mode taps a node to
  label it"), so the graded chainBoard beats (4, 6, 8, 9) omit `interactive` (matching the §1 field-usage
  rows). Only the hero `classify-board` sets `interactive:true`, marking its tap-to-classify + period-toggle
  explore affordance layered on the otherwise-passive watch.
- No other remaps. Every other beat (`recall-absorbing`, `open-bet`, `name-the-classes`, `model-period`,
  `mastery-challenge`, `recap`) maps 1:1 to the brief's stated reuse type.

## New interaction types (for Wave 0)

**`chainBoard` (`display:'diagram'`, this lesson's `task:'classify'` and `task:'absorption'`).** Restating the
relevant schema line — the **frozen full definition is wave0-contracts.md §1** (appended as the last member of
the `InteractionSchema` discriminated union in `src/content/schema.ts`, reusing the existing `RationalSchema`):

```ts
z.object({
  type: z.literal('chainBoard'),
  display: z.enum(['diagram', 'matrix', 'powers', 'distribution', 'stationary']), // L4 uses 'diagram'
  matrix: z.array(z.array(RationalSchema)),       // e.g. hero 4-state [[0,1/2,0,1/2],[0,0,1,0],[0,1,0,0],[0,0,0,1]]
  labels: z.array(z.string()).min(2),             // ["1","2","3","4"]
  task: z.enum(['entry','build','classify','absorption','stationary','balance','pagerank']).optional(),
  absorbing: z.array(z.number().int().nonnegative()).optional(), // absorption: [2]
  cell: z.object({ row: z.number().int().nonnegative(), col: z.number().int().nonnegative() }).optional(),
  interactive: z.boolean().optional(),            // hero classify-board only
  headline: z.string().optional(),                // engine-reproducible anchor "absorbing" / "2" / "1/2" / kind-list
  // (layout / step / start / damping unused this lesson)
}),
```

- **Grading rule (wave0 §1, FROZEN):** a `chainBoard` beat is **graded iff its beat-level `hero` block is
  absent**. `classify-first`, `classify-and-group`, `ehrenfest-period`, `transient-vs-recurrent` omit `hero`
  ⇒ graded (standard `useHintLadder` + `FeedbackStrip`). `classify-board` carries `hero` ⇒ ungraded "watch /
  explore it" (primary = Continue).
- **`chainBoard` is NOT in `HERO_TYPES` and NOT in `GRADED_TYPES`** (wave0 §1/§6): the hero/graded split rides
  the beat-level `hero` block + the §6c engine cross-check, exactly like `bayesUpdate`. (The graded
  `classify-first`/`classify-and-group`/`ehrenfest-period`/`transient-vs-recurrent` must **not** carry a
  `hero` block; the early-win/retrieval-opener invariant is held by `recall-absorbing`, not by chainBoard.)
- **Renderer `src/lesson/beats/ChainBoardBeat.tsx`** (wave0 §3): narrows `props.beat.interaction` to the
  `chainBoard` member (early-return `null` otherwise), ignores `automaton`/`pattern`, composes `<BeatShell>`.
  `display:'diagram'` → **`ChainGraph`**. For `task:'classify'` it renders tap-to-classify R/T/A chips + the
  period readout; for `task:'absorption'` it lets the learner tap the home state (it becomes the absorbing
  read) and shows the return probability. Graded mode (no `hero`): primary `Check`, wires
  `resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)`; reaching reveal calls `reportNeedsReview`.
- **Konva `ChainGraph.tsx`** (NEW, sibling to `StateGraph.tsx` — reuse-as-pattern, do **not** mutate the
  H/T-bound `StateGraph`): renders an arbitrary chain — `n` nodes (free graph layout), rational edge labels,
  self-loops, **absorbing double-ring**, tap-to-classify chips, and a period toggle — with the `ch3` accent
  (`chapterColor(lessonId)` → `#F05A4A`). Imports `konva/theme.ts` (`C`, `accentFor`, `hexToRgba`,
  `FONT_MONO`). `reducedMotion` → final labelled frame (classes shown, period shown), no transitions.
- **Engine dep `src/engine/markov.ts`** (NEW, pure/exact-rational, wave0 §4): `classifyStates(P)` →
  per-state `{kind, class, period}` (the four `classify` beats) and `absorptionProbabilities(P, absorbing)`
  via `(I−Q)⁻¹R` (the `transient-vs-recurrent` return probability). `formatRational`/`formatVector` format the
  §6c headline asserts.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle nudge),
`hints[1]`=Hint 2 (**the misconception refutation**, drawn from the brief's Misconceptions section),
`hints[2]`=Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again" resets). `required` graded
beats that ever reach reveal report `needsReview`. `prediction` beats use `byOption` per-option notes
(`correct` flag) instead of a ladder.

**1 · `recall-absorbing`** — graded `correct` + `hints[3]`
- correct: "An absorbing state isn't the *popular* one — it's the one you can't leave: a self-loop of probability 1. You already met it as Penney's matched pattern and gambler's-ruin's \$0/\$N walls."
- hints: `["Warm-up — you saw absorbing states as Penney's matched pattern and gambler's-ruin's \$0 / \$N barriers.", "Visiting often isn't the test — *leaving* is. An absorbing state has a self-loop of probability 1: once you arrive, every future step stays put. It's the extreme recurrent state, not the most-visited one.", "Match each to 'can't leave': matched pattern → run is over; \$0 / \$N → barrier holds forever; self-loop → probability 1."]`
- pairs: `"Penney's matched pattern is reached"→"absorbing — the run is over, you can't leave"`, `"Gambler's ruin hits \$0 or \$N"→"absorbing — the barrier holds you forever"`, `"An absorbing state's self-loop"→"probability 1 — every step stays put"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"For sure — if you can reach it, you always return"` → `{note:"Only for recurrent states. From a transient state there's a real chance you leak into another class (or get absorbed) before coming back — return probability < 1.", correct:false}`
- `"Maybe never — you might wander off for good"` → `{note:"Right instinct. Some states (transient) let you slip away for good; others (recurrent) always pull you back. The dividing line is the chance you ever return. Let's name the kinds.", correct:true}`
- `"Only if it's an absorbing state"` → `{note:"Absorbing is the extreme 'can't leave' case — but plenty of non-absorbing states still always bring you back (recurrent). What decides it is the return probability, not the self-loop.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll test it on a chain.", "If the chain can leak elsewhere first, you may never return — reachable ≠ always-returns.", "Recurrent ⇔ return prob 1; transient ⇔ return prob < 1; absorbing ⇔ you never leave at all."]`

**3 · `name-the-classes`** (primer; copy = caption/aria)
- correct: "Five words: recurrent, transient, absorbing, communicating class, period. Keep them."
- hints: `["Return-for-sure vs maybe-never vs can't-leave.", "Two states *communicate* when each can reach the other — that's mutual, not one-way.", "Period = gcd of the step-lengths of all returns (1 = aperiodic)."]`
- title: "Recurrent, transient, absorbing — and class & period" · body: "A state is **recurrent** if you return for sure (return prob = 1), **transient** if you might never come back (return prob < 1), and **absorbing** if you can't leave at all (self-loop prob 1 — the extreme recurrent). States that can each reach the other form one **communicating class**. A class's **period** = the gcd of the step-lengths of all its returns (1 = aperiodic)."

**4 · `classify-first`** — graded `correct` + `hints[3]`
- correct: "State 3's row is `[0, 0, 1]` — a self-loop of probability 1. Once you arrive you never leave: that's **absorbing**, no matter how often 1 and 2 are visited."
- hints: `["Which state, once you enter it, never lets you step away again?", "Popularity isn't the test — leaving is. Don't pick the most-visited node; find the one whose only move is back to itself (self-loop probability 1).", "Tap state 3: its row is [0, 0, 1], so it stays put forever. Absorbing."]`
- chainBoard fields: `display:'diagram'`, `matrix:[[1/2,1/2,0],[1/2,0,1/2],[0,0,1]]` = `[[{n:1,d:2},{n:1,d:2},{n:0,d:1}],[{n:1,d:2},{n:0,d:1},{n:1,d:2}],[{n:0,d:1},{n:0,d:1},{n:1,d:1}]]`, `labels:["1","2","3"]`, `task:'classify'`, `headline:"absorbing"` (no `hero` ⇒ graded). Small **constructed** chain (states 1, 2 transient; state 3 absorbing) — engine-verifiable, defns sourced GB p.54–55.

**5 · `classify-board`** (ungraded hero; copy = aria/caption)
- correct: "Three kinds in one chain: **1** leaks away and never returns (transient), **{2,3}** bounce between each other forever (recurrent), **4** traps you (absorbing). Flip the period toggle: {2,3} only returns in *even* numbers of steps → period 2."
- hints: `["Tap each node to label it, then flip the period toggle on the {2,3} pair.", "Leaving a state doesn't make it transient — {2,3} leave each other *every* step but always come back (return prob 1). Transient means a real escape route you take with positive probability (that's state 1, which slips to {2,3} or 4 and never returns).", "1 transient · 2,3 recurrent (period 2) · 4 absorbing."]`
- `hero.structuralReadout`: "From state 2 you can only return in 2, 4, 6, … steps — gcd = 2, so the {2,3} class has **period 2**."
- `hero`: `{slowFirst:true, structuralReadout:"…", reducedMotionFinalFrame:true}` · chainBoard fields: `display:'diagram'`, `matrix:[[0,1/2,0,1/2],[0,0,1,0],[0,1,0,0],[0,0,0,1]]` = `[[{n:0,d:1},{n:1,d:2},{n:0,d:1},{n:1,d:2}],[{n:0,d:1},{n:0,d:1},{n:1,d:1},{n:0,d:1}],[{n:0,d:1},{n:1,d:1},{n:0,d:1},{n:0,d:1}],[{n:0,d:1},{n:0,d:1},{n:0,d:1},{n:1,d:1}]]`, `labels:["1","2","3","4"]`, `task:'classify'`, `interactive:true`, `headline:"2"` (period of the {2,3} class)

**6 · `classify-and-group`** — graded `correct` + `hints[3]`
- correct: "Communication is **mutual**: 1 reaches {2,3} but they can't reach back, so 1 is its own (transient) class. {2,3} reach each other → one recurrent class; 4 is alone (absorbing). Kinds: **transient, recurrent, recurrent, absorbing**; classes **{1}, {2,3}, {4}**."
- hints: `["For each pair ask: can *each* reach the other? Only mutual pairs share a class.", "Being in the same diagram isn't communicating. 1 → {2,3} is one-way (they never get back to 1), so 1 is a separate class — not 'all one class because it's one chain.' Only {2,3} are mutual.", "Classes {1}, {2,3}, {4}; kinds transient, recurrent, recurrent, absorbing."]`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L4): "Recurrent vs transient — *will the chain ever come back?* — is the structural question behind every absorption interview problem (hitting probabilities, gambler's ruin, MCMC mixing). Name each state's communicating class first; the arithmetic (return probabilities, expected hitting times) only makes sense once the structure is fixed."
- chainBoard fields: `display:'diagram'`, `matrix` (hero 4-state, same {n,d} as beat 5), `labels:["1","2","3","4"]`, `task:'classify'`, `headline:"transient,recurrent,recurrent,absorbing"` (no `hero` ⇒ graded)

**7 · `model-period`** (ungraded reveal)
- correct: "Three views of recurrence: return with probability 1 ⇔ visit it infinitely often. **Period only *times* the returns — it doesn't decide whether you come back.**"
- hints: `["Reveal each lens — return probability, number of visits, period.", "Recurrent and absorbing are NOT the same: absorbing never leaves (return prob 1 in zero steps); recurrent *leaves all the time* but always comes back (return prob 1). Period is a separate question about *when* you return.", "Recurrent ⇔ return prob 1 ⇔ infinitely many visits; period = gcd of return lengths."]`
- `value:"return prob 1"` · `display:'cards'` · lenses: `{label:"Return probability", body:"Recurrent ⇔ you come back with probability 1; transient ⇔ return prob < 1; absorbing ⇔ you never even leave."}`, `{label:"Number of visits", body:"Recurrent ⇔ you visit it infinitely often; transient ⇔ only finitely many visits before you leave for good."}`, `{label:"Period", body:"Period = gcd of the step-lengths of all returns (1 = aperiodic). It times the returns — it doesn't change whether you return."}`

**8 · `ehrenfest-period`** — graded `correct` + `hints[3]`
- correct: "In the Ehrenfest urn you can only come home in an **even** number of steps — return lengths are {2, 4, 6, …}, and gcd = **2**. The period is 2."
- hints: `["Count the steps of a few returns to one state. Are any of the return lengths odd?", "Not every chain is aperiodic / period 1. Here every return takes an even number of steps; period 1 would need an *odd* return somewhere (e.g. a self-loop), and there is none.", "gcd{2, 4, 6, …} = 2 → period 2."]`
- chainBoard fields: `display:'diagram'`, `matrix:[[0,1,0],[1/2,0,1/2],[0,1,0]]` = `[[{n:0,d:1},{n:1,d:1},{n:0,d:1}],[{n:1,d:2},{n:0,d:1},{n:1,d:2}],[{n:0,d:1},{n:1,d:1},{n:0,d:1}]]`, `labels:["0","1","2"]`, `task:'classify'`, `headline:"2"` (no `hero` ⇒ graded). Source: stats.libretexts 16.8 (Ehrenfest chains).

**9 · `transient-vs-recurrent`** — graded `correct` + `hints[3]`
- correct: "From 1 you must step to 2; from 2 you either fall back to 1 (½) or get absorbed at 3 (½). So you return with probability exactly **1/2** — that's transient: return prob < 1, not 0."
- hints: `["Trace state 1's only way out and back: 1 → 2 (forced), then 2 → 1 (return) or 2 → 3 (absorbed).", "Transient does NOT mean you never return — it means return prob < 1. You may even come back several times; each visit just risks the escape to absorbing 3.", "f₁₁ = P(1→2) · P(reach 1 from 2 before 3) = 1 · ½ = 1/2."]`
- chainBoard fields: `display:'diagram'`, `matrix:[[0,1,0],[1/2,0,1/2],[0,0,1]]` = `[[{n:0,d:1},{n:1,d:1},{n:0,d:1}],[{n:1,d:2},{n:0,d:1},{n:1,d:2}],[{n:0,d:1},{n:0,d:1},{n:1,d:1}]]`, `labels:["1","2","3"]`, `task:'absorption'`, `absorbing:[2]`, `cell:{row:1,col:1}`, `headline:"1/2"` (no `hero` ⇒ graded). **Constructed** (return-prob defn GB p.54–55); engine-verify via golden #13 (make home state "1" absorbing).

**10 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "{0} and {3} are **absorbing** (recurrent singletons); {1,2} **communicate** and are **transient**. From 1: down to 0 (⅓, gone) or up to 2 (⅔); from 2 you only get back to 1 by stepping down (⅓). So f₁₁ = (⅔)·(⅓) = **2/9** < 1 — the interior states are transient even though the steps look balanced."
- hints: `["Classify the \$0 and \$3 barriers first, then trace the one way back to 1 from 2.", "Symmetry doesn't make interior states recurrent — the absorbing walls leak probability away. From 1 you can fall to 0 and never return, so the return probability is < 1.", "f₁₁ = (⅔)·(⅓) = 2/9; classes {0},{3} absorbing, {1,2} transient (one communicating class)."]`
- scenario: "Gambler's ruin on **{0, 1, 2, 3}**: each step you go up with probability **2/3** and down with **1/3**; **\$0 and \$3 are absorbing walls**. (i) Classify every state and name the communicating classes. (ii) Starting from state **1**, what's the probability you ever return to state 1?"
- fields: `{id:"classes", label:"Classify all states + name the communicating classes", accept:["{0},{3} absorbing; {1,2} transient","0 and 3 absorbing, 1 and 2 transient","{0} absorbing {3} absorbing {1,2} transient one class","0,3 absorbing; 1,2 transient communicating"]}` (normalized: case/space/punctuation-insensitive, token-matched), `{id:"return1", label:"P(ever return to 1 | start 1)", accept:["2/9"]}` — **no `pattern`**

**11 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "A state's whole fate is one question — *what's the chance you ever return?* Recurrent = 1, transient = < 1, absorbing = you never leave. Communicating classes group mutual reachability, and a class's period = gcd of its return lengths. **Structure, not arithmetic, decides where a chain ends up.**"
- hints: `["Absorbing (self-loop 1) is the extreme recurrent — it never forgets where it stopped.", "Communication is mutual reachability: a one-way link splits classes (state 1 vs the {2,3} pair).", "Next up — Hitting Times & Absorption: not *whether* you get caught, but *how long* until you do."]`

## Build decomposition (Technical Planner — for Dept 3)

**Engine (`src/engine/markov.ts`, wave0 §4).** L4 exercises two functions plus the offline mastery verify:
- `classifyStates(P)` → per-state `{index, class, kind, period}`. Used by all four `classify` beats; pinned by
  **goldens** in `markov.test.ts`:
  - `classify-first` chain `[[1/2,1/2,0],[1/2,0,1/2],[0,0,1]]` → `[transient, transient, absorbing]`; tapped
    index 2 `.kind = 'absorbing'`.
  - hero 4-state `[[0,1/2,0,1/2],[0,0,1,0],[0,1,0,0],[0,0,0,1]]` → kinds `[transient, recurrent, recurrent,
    absorbing]`, classes `{1}/{2,3}/{4}`, and **`.period = 2` on the recurrent `{2,3}` class** (indices 1, 2).
  - Ehrenfest m=2 `[[0,1,0],[1/2,0,1/2],[0,1,0]]` → one class, recurrent, **`[0].period = 2`** (wave0 §4 golden
    #15).
  - gambler's-ruin `[[1,0,0,0],[1/3,0,2/3,0],[0,1/3,0,2/3],[0,0,0,1]]` → `{0},{3}` absorbing, `{1,2}` transient
    (one class) — the mastery classification.
  - cloudy-town `[[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]]` → one class, **aperiodic (period 1), ergodic**
    (wave0 §4 golden #19's chain) — pinned as the aperiodic counter-example, though no L4 beat renders it.
- `absorptionProbabilities(P, absorbing)` → `B = (I−Q)⁻¹R` (rows = transient, cols = absorbing). The
  **return-probability** beats make the *home* state absorbing first:
  - golden #13 — `transient-vs-recurrent` return prob: on `[[0,1,0],[1/2,0,1/2],[0,0,1]]` make state "1"
    (index 0) absorbing → `[[1,0,0],[1/2,0,1/2],[0,0,1]]`; from the only out-neighbor (state "2") the
    back-absorption probability to home is **1/2**, times `P(1→2)=1` → **f₁₁ = 1/2**.
  - golden #14 — mastery return prob: on the gambler's-ruin chain make state "1" absorbing → **f₁₁ = (⅔)·(⅓)
    = 2/9** (offline verify; the `masteryChallenge` grades the typed `2/9` against `accept`).
- `formatRational` / `formatVector` — format `{n,d}` → `"1/2"`, `"2"`, and the comma-joined kind list for the
  §6c headline asserts.

**Schema (`src/content/schema.ts`, wave0 §1).**
- `chainBoard` fields used — `classify` beats (4, 5, 6, 8): `type`, `display:'diagram'`, `matrix`, `labels`,
  `task:'classify'`, `headline`; plus `interactive` + beat-level `hero` on the hero (5). `absorption` beat
  (9): `type`, `display:'diagram'`, `matrix`, `labels`, `task:'absorption'`, `absorbing:[2]`,
  `cell:{row:1,col:1}`, `headline:"1/2"`.
- Reuse types: `retrievalGrid{pairs:[{left,right}]}` (×1), `prediction{options}` + `FeedbackSchema.byOption`
  (×1), `primer{variant:'custom',title,body,collapsible}`, `tripletReveal{value,lenses:[{label,body}],display:'cards'}`,
  `masteryChallenge{scenario,fields:[{id,label,accept}]}` (**no `pattern`**), `recap{type:'recap'}`. Beat-level
  `interviewNote` on `classify-and-group`; beat-level `hero` on `classify-board`.

**Renderer / widget (`ChainBoardBeat.tsx` + `ChainGraph.tsx`, wave0 §3).**
- `ChainBoardBeat` narrows to the `chainBoard` member (early-return `null` otherwise), composes `<BeatShell>`,
  and for `display:'diagram'` renders `<ChainGraph>`. Graded mode (4, 6, 8, 9; no `hero`): primary `Check`,
  wires `resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)`; reaching reveal calls
  `reportNeedsReview`. Hero mode (5): primary `{ label: isLast ? 'Finish' : 'Continue' }`.
- `ChainGraph` (this lesson): free-graph layout; rational edge labels + self-loops; **absorbing double-ring**;
  **tap-to-classify R/T/A chips** per node; a **period toggle/readout**; `accent` from
  `chapterColor(lessonId)` (`ch3` → `#F05A4A`). `task:'classify'` grades each node's chip against
  `classifyStates(P)[i].kind` (and class grouping on beat 6); `task:'absorption'` lets the learner tap the
  home node (it becomes the absorbing read) and reports the return probability from
  `absorptionProbabilities`. `reducedMotion` → final labelled frame (classes + period shown, no transitions).
  Reads from props: `reducedMotion`, `isLast`, `onAdvance`, `reportNeedsReview`, `lessonId`, `beat.hero`.

**Fixture (wave0 §5).**
- `fixtures/lesson-markov-chains-4.json`: `lessonId:"lesson-markov-chains-4"`,
  `courseId:"course-markov-chains"`, `title:"Classifying States"`, `patternOptions:["H"]`,
  `milestoneId:"markov-chains-classify"`, `unlocks:"lesson-markov-chains-5"`, `schemaVersion:1`, the 11 beats
  above.
- `fixtures/course-markov-chains.json` lesson node: `glyphKey:"R/T/A"`, `vizKey:"stateMachine"`, `built:true`;
  this lessonId is the first member of chapter `ch-markov-chains-2` ("Reaching States", with
  `lesson-markov-chains-5`).

## Definition-of-Ready checklist (every beat)

| beatId | verified+sourced problem | concrete interactive mechanic | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|-------------------------------|----------------------------------|----------------------------------------|
| recall-absorbing | n/a — recall of PHT matched state / gambler's-ruin walls + `types.ts absorbing` ✔ | tap/drag match (×3) ✔ | triple ✔ | ✔ (renderer) |
| open-bet | n/a — gut-check bet (recurrent vs transient) ✔ | chip pick (×3) ✔ | byOption (×3) ✔ | ✔ |
| name-the-classes | n/a — JIT primer ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| classify-first | **absorbing** ✔ engine (`classifyStates[2].kind`; constructed, defns GB p.54–55) | tap the absorbing node ✔ | triple ✔ | aria-live kind mirror + static-graph reduced-motion ✔ |
| classify-board | **period 2** ✔ engine (`classifyStates` {2,3}-class period; constructed, defns GB p.54–55) | tap-to-classify + period toggle ✔ | hero readout + caption ✔ | aria-live + final-frame ✔ |
| classify-and-group | **transient,recurrent,recurrent,absorbing** ✔ engine (`classifyStates` kinds + classes) | classify each + group classes ✔ | triple ✔ | aria-live per-node kind/class ✔ |
| model-period | n/a — triangulate recurrence (return prob / visits / period) ✔ | reveal 3 lenses ✔ | reveal copy ✔ | aria-live ✔ |
| ehrenfest-period | **2** ✔ engine (`classifyStates[0].period`; stats.libretexts 16.8) | trace returns + read period ✔ | triple ✔ | aria-live period mirror ✔ |
| transient-vs-recurrent | **1/2** ✔ engine (`absorptionProbabilities`, home-absorbing; **constructed → engine-verify**, golden #13) | classify + make home absorbing, read return prob ✔ | triple ✔ | aria-live return-prob mirror ✔ |
| mastery-challenge | classes ✔ source (GB p.54–55) · **2/9** ✔ engine (**constructed → engine-verify**, golden #14) | type classification + fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** Every graded number is exact: `absorbing` (categorical, `classifyStates`), `2` (period,
`classifyStates`), the kind list (`classifyStates`), `1/2` and `2/9` (return probabilities,
`absorptionProbabilities`). The two **constructed** return-probabilities (`1/2`, `2/9`) are derived from the
sourced transient/return-probability definition (GB p.54–55) with **stated answers** that `markov.ts`
reproduces exactly (goldens #13/#14) — they are **Ready (engine-verify), not kicked back**. Every chainBoard
beat has a real direct-manipulation mechanic (tap a node / classify chips / period toggle / tap the home
state).

## Gate notes (this lesson)

- **GATED** (after appending `lesson-markov-chains-4` to the gate set, wave0 §6b): ≥1 `primer` ✔
  (`name-the-classes`); every `prediction` uses `byOption` ✔ (`open-bet`); exactly one `interviewNote` ✔
  (`classify-and-group`); the first graded beat is the `retrievalGrid` opener ✔ (`recall-absorbing`); **no
  `introducesSymbol` tags** ⇒ the per-track notation-ladder check is **vacuously satisfied** (the only
  candidate grounding is the track-A-only `name-the-classes` primer; tagging a `track:both` beat would fail
  the gate in track B — same reasoning as Bayes §6f).
- **MASTERY** (wave0 §6b): last beat is `recap` ✔; the penult is a `masteryChallenge` `required:true` with
  **no `pattern`** ✔ (`mastery-challenge`), so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is
  skipped — `2/9` is a Markov return probability, not a hitting-time. It carries **no `chainBoard`** (wave0 §1
  mastery rule).
- **chainBoard engine cross-check** (wave0 §6c) — every L4 `chainBoard` beat declares a `headline` recomputed
  via `markov.ts`:
  - `classify-first` `task:'classify'`, `headline:"absorbing"` — the **tapped state's kind**:
    `classifyStates(P)[2].kind` (state 3) string-matches `"absorbing"`. (The simplest engine-derivable anchor
    for a single-tap classify, per the §6c "each spec states the exact derivation" rule — not the full kind
    list, since the learner grades on one tapped node.)
  - `classify-board` `task:'classify'`, `headline:"2"` (numeric branch) — the **period of the recurrent
    `{2,3}` class**, `classifyStates(P)[1].period` (index 0 is the transient state with no return, so this
    specializes the generic `cls[0].period` to the recurrent class index — stated derivation).
  - `classify-and-group` `task:'classify'`, `headline:"transient,recurrent,recurrent,absorbing"` (list
    branch) — `classifyStates(P).map(c => c.kind).join(',')` matches exactly.
  - `ehrenfest-period` `task:'classify'`, `headline:"2"` (numeric branch) — one class, so the generic
    `String(classifyStates(P)[0].period)` = `"2"` holds directly.
  - `transient-vs-recurrent` `task:'absorption'`, `headline:"1/2"` — the **return probability** of state "1"
    (golden #13). This is the absorption task's *return mode*: the renderer makes the home state (the `cell`
    home, index 0) absorbing and reads `f₁₁ = P(1→2) · absorptionProbabilities(home-absorbing variant)` =
    `1 · 1/2 = 1/2`, formatted via `formatRational`. (The declared `absorbing:[2]` is the displayed chain's
    natural wall, shown as the double-ring; the return read specializes the generic `B.flat()[0]` per the
    §6c stated-derivation rule.)
