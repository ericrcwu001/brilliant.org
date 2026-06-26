# Interaction Spec: Markov in the Wild  (lesson-markov-chains-10)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> dispatcher (`src/lesson/beats/index.tsx`), and reuse renderers. The frozen `chainBoard` type, the
> `src/engine/markov.ts` engine, and the validate-fixtures edits live in `../wave0-contracts.md` (§1, §4, §6) —
> this spec maps every Dept-1 beat to a real interaction type and supplies the per-beat feedback ladder, a11y,
> and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]` (the safe
> H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat reads the
> automaton**), `milestoneId:'markov-chains-wild'`, **`unlocks:null`**, `schemaVersion:1`. Glyph `mix`, viz `dice`.
>
> **`unlocks:null` = the concept finale** — L10 is the last node of `course-markov-chains` (the `unlocks` chain
> is L1→…→L10→`null`; wave0 §5b). It is the **interleaving capstone**: a course-level *pick-the-tool* lesson that
> re-surfaces every prior tool (absorption/hitting time L5, stationary L6, ergodic-vs-absorbing L4/L7,
> Ehrenfest/reversibility L8, PageRank-as-stationary L9) under one structural fork.
>
> **This lesson is ALL REUSE — no new interaction type or display.** Its two `chainBoard` beats reuse
> `display:'diagram'`+`task:'classify'` (debuted L1 `read-the-edge` / L4 `classify-first`); the rest reuse
> `retrievalGrid`, `prediction`, `primer`, `walkBoard`, `masteryChallenge`, `recap`. Every graded number is an
> exact rational reproduced by `markov.ts`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-pick-the-tool` | Tap a famous **result** on the left → pick the **tool** that made it on the (shuffled) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag targets ≥44px; `aria-live` "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `which-tool-bet` | Pick one tool chip for the **unlabeled Ehrenfest urn** → soft per-option note → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-the-rubric` | Expand the JIT primer (the fork + its two formula families) → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `classify-one` | Tap the **"ergodic → stationary share"** class chip on the weather diagram → Check (**GRADED**, no `hero`) | `chainBoard` `display:'diagram'` | reuse (L1/L4) | `display:'diagram'`, `matrix` (weather 2×2), `labels:["Clear","Rainy"]`, `task:'classify'`, `interactive:true`, `headline:"ergodic"` — **no `hero` ⇒ graded** | node + class chips = `<button>` ≥44px; visually-hidden `aria-live` "No state you can't leave ⇒ ergodic ⇒ stationary share"; reduced-motion → final frame | `ChainGraph` (Konva); node pulse on tap | both |
| 5 | `walk-recall` | Watch the **absorbing drunkard** replay slam into a wall → Continue (replay, not graded) | `walkBoard` `display:'single'` | reuse (L5) | `n:4`, `p:0.5`, `start:2`, `interactive:false`, `display:'single'` + **beat-level `hero` `slowFirst:false`** (walkBoard ∈ HERO_TYPES) | step path non-interactive; `aria-live` "reached wall 0/4 at step …"; reduced-motion → final frame (walker at the wall) | SVG walker; slow discrete steps (the replay IS the content) | both |
| 6 | `explore-mixed` | **HERO:** cycle Ehrenfest / weather / drunkard, classify each, watch the right tool resolve to its exact rational → Continue | `chainBoard` `display:'diagram'` | reuse | `display:'diagram'`, `matrix` (weather lead frame), `labels:["Clear","Rainy"]`, `task:'classify'`, `interactive:true`, `headline:"ergodic"` + **beat-level `hero` `slowFirst:true`** | class chips ≥44px; `aria-live` per-frame readout ("Ehrenfest: no exit ⇒ πP=π"); reduced-motion → final settled frame | `ChainGraph`; slow-first token hop + tool resolve | both |
| 7 | `discriminate` | Tap a structural **cue** on the left → pick its **tool** on the right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) + **beat-level `interviewNote`** | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `interleave-A-vs-B` | Decide the tool **first**, then type Part A and Part B values → Check | `masteryChallenge` | reuse | `scenario`, `fields:[…×2]` — **no `pattern`** | two inputs ≥44px; Enter submits; `aria-live` | none | both |
| 9 | `mastery-challenge` | **Classify** (absorbing) and type the **absorption vector** → Check (**required**, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[classify + ×3]` — **no `pattern`** | inputs ≥44px; Enter; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → one fork, three tools, exact rationals | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

## Remaps vs. Dept-1 brief (explicit)

The Dept-1 brief wrote its hero plan **assuming `chainBoard` would be added to `HERO_TYPES`** ("once `chainBoard`
is added to `HERO_TYPES` … `classify-one` (b4, chainBoard) … must carry a hero block with `slowFirst:false`").
The **FROZEN contract overrides this** (wave0 §1, §6): `chainBoard` is **NOT** in `HERO_TYPES` (confirmed in
`scripts/validate-fixtures.ts` `HERO_TYPES = {raceSim, walkBoard, gamblerLedger}`). The grading rule is
beat-level: **a `chainBoard` beat is graded iff it carries no `hero` block.** That forces three remaps:

- **`classify-one` (b4) is GRADED, with NO `hero` block** (not a `slowFirst:false` hero as the brief sketched).
  It is the lesson's guaranteed early win: the learner *taps the class* and the renderer checks the tap against
  `classifyStates(weather)` (no absorbing state ⇒ ergodic). Adding a hero block here would un-grade it.
- **`explore-mixed` (b6) is the one true hero** (`hero.slowFirst:true`) ⇒ ungraded "watch it resolve"
  (primary = Continue). This is the only `chainBoard` beat in L10 that carries `hero`.
- **`walk-recall` (b5) carries the `hero` block with `slowFirst:false`** — *because `walkBoard` IS in
  `HERO_TYPES`*, so the validator requires a `hero` block on it regardless of `chainBoard`. This is the
  `slowFirst:false` replay the brief intended, but it rides the `walkBoard` HERO_TYPE rule, **not** chainBoard.

- **Two `masteryChallenge` beats, both pure type-in, no `chainBoard`, no `pattern`** (wave0 §1 "Mastery beats are
  NOT chainBoard"): `interleave-A-vs-B` (b8, the side-by-side interleave) and `mastery-challenge` (b9, the
  gate-required penult). Both grade typed rationals against `accept` lists; neither embeds a `chainBoard` surface
  or a `pattern` (a Markov fraction/vector is not a hitting-time, so the `buildAutomaton(pattern).E0` cross-check
  must be skipped — wave0 R-4).
- No other remaps. Every other beat maps 1:1 to an existing real type.

## New interaction types (Wave 0)

**None.** L10 adds **no new interaction type and no new `display`.** Both `chainBoard` beats reuse the already-
debuted **`display:'diagram'` + `task:'classify'`** surface (first shipped by L1 `read-the-edge` /
L4 `classify-first`/`classify-board`; see wave0 §1 field-usage matrix). The frozen `chainBoard` Zod member, the
`ChainBoardBeat`/`ChainGraph` renderer, and the dispatcher case all land in earlier waves; L10 consumes them.

Engine surface consumed from `src/engine/markov.ts` (wave0 §4) — all exact-rational, `solveLinearSystem`-backed,
no floats on any graded path:

- **`classifyStates(P)`** → per-state `{kind, class, period}`; drives the `classify` taps in b4/b6 and the
  categorical `"ergodic"` headline (no state with `kind:'absorbing'`).
- **`absorptionProbabilities(P, absorbing)`** = `(I−Q)⁻¹R` → drunkard `(1/4, 1/2, 3/4)`, gambler `4/7` (the
  recall/interleave/mastery answers).
- **`expectedAbsorptionTime(P, absorbing)`** solving `(I−Q)t = 1` → drunkard `(3, 4, 3)` (the recall result).
- **`stationaryDistribution(P)`** solving `πP=π, Σπ=1` → weather `(3/7, 4/7)`, cloudy-town `(1/5, 2/5, 2/5)`,
  Ehrenfest `(1/4, 1/2, 1/4)`.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle), `hints[1]`=Hint 2
(**the misconception refutation**), `hints[2]`=Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again"
resets). `required` graded beats that ever reach reveal report `needsReview`. Predictions use `byOption`.

**1 · `recall-pick-the-tool`** — graded `correct` + `hints[3]`
- correct: "Each headline number is the fingerprint of one tool: a probability **split** with no +1 (absorption), a step-**count** with a +1 (hitting time), or a long-run **share** (stationary). The result reveals the question that was asked."
- hints: `["Warm-up — match each famous result to the formula that produced it.", "A probability split (no +1) is absorption; a step-count (+1 every move) is hitting time; a long-run fraction is the stationary share — the +1 is the only thing separating the first two.", "4/7 → absorption (I−Q)⁻¹R · (3,4,3) → hitting time (I−Q)t=1 · (3/7,4/7) → stationary share πP=π."]`
- pairs: `"4/7 — a gambler reaches $3 before $0"→"Absorption probability (I−Q)⁻¹R"`, `"(3,4,3) — a drunkard's steps to a wall"→"Hitting time (I−Q)t=1"`, `"(3/7,4/7) — long-run clear/rainy share"→"Stationary share πP=π"`

**2 · `which-tool-bet`** — `byOption` (+ fallback `hints`)
- `"Absorption — the balls eventually get stuck in one box"` → `{note:"Bouncing forever is the *opposite* of stuck. The Ehrenfest urn has NO absorbing state — every count leads back out, so there is nothing to be absorbed into. Ask the long-run share, πP=π.", correct:false}`
- `"Stationary share (πP=π) — it mixes forever"` → `{note:"Right — every state leads back out, so the chain never settles into one box. Ask what fraction of the time it spends at each count: (1/4, 1/2, 1/4).", correct:true}`
- `"Convergence (Pⁿ→π) — the distribution settles"` → `{note:"Careful — Ehrenfest is *periodic* (period 2): parity flips every step, so Pⁿ never settles. The long-run *time-average* (πP=π) still exists — that's the answerable question, not Pⁿ-convergence.", correct:false}`
- hints: `["No wrong guess yet — commit, and we'll test it by structure.", "Balls that bounce forever are the opposite of stuck — there is no state they can't leave, so 'when/where absorbed' is the wrong question.", "No absorbing state ⇒ ask the long-run share πP=π → (1/4, 1/2, 1/4)."]`

**3 · `name-the-rubric`** (primer; copy = caption/aria)
- correct: "One fork, then the tool picks itself: can the chain reach a state it can never leave?"
- hints: `["Ask one structural question before any algebra.", "A state you can't leave = absorbing → ask which / when. No such state = ergodic → ask the long-run share.", "Absorbing → (I−Q)⁻¹R & (I−Q)t=1 · Ergodic → πP=π & 1/πᵢ."]`
- title: "One fork decides the tool" · body: "Before computing anything, ask: **is there a state the chain can never leave?** **Yes → absorbing:** ask *which* exit (absorption probability (I−Q)⁻¹R) and *how long* until it's trapped (hitting time (I−Q)t=1). **No → it mixes forever (ergodic):** ask the *long-run share* (πP=π, Kac return time 1/πᵢ). Read the **structure, not the story** — and the tool picks itself."

**4 · `classify-one`** — graded `correct` + `hints[3]`
- correct: "Neither Clear nor Rainy is a trap — each leads back to the other, so the weather **mixes forever**. That's **ergodic** ⇒ ask the long-run share, πP=π = (3/7, 4/7)."
- hints: `["Look for a state with no way out. Is there one?", "A 'bad-weather' state is not a trap — Rainy still leads back to Clear. No state is absorbing, so the chain never gets stuck.", "No absorbing state ⇒ ergodic ⇒ tap 'ergodic → stationary share' (πP=π = 3/7, 4/7)."]`
- engine anchor: `classifyStates(weather)` returns no state with `kind:'absorbing'` (Clear↔Rainy, one irreducible recurrent class) ⇒ categorical `headline:"ergodic"`.

**5 · `walk-recall`** (ungraded replay; copy = aria/caption)
- correct: "The walls at 0 and 4 swallow the walker — once he hits one he never leaves. That's **absorbing**: ask *which* wall (reach P = i/4 = (1/4, 1/2, 3/4)) and *how long* (steps = i(4−i) = (3, 4, 3))."
- hints: `["Watch where the walk ends — does it ever come back?", "A symmetric walk has NO long-run share of the middle: the walls absorb it, so the chain ends rather than settling.", "Walls are absorbing ⇒ reach P = i/4 = (1/4, 1/2, 3/4), steps = i(4−i) = (3, 4, 3)."]`
- `hero.structuralReadout` (`slowFirst:false`): "Walls at 0 & 4 are absorbing — from the middle (start 2) the drunkard reaches a wall w.p. 1/2 each side; reach P = i/4 = (1/4, 1/2, 3/4), steps to a wall = i(4−i) = (3, 4, 3)."

**6 · `explore-mixed`** (ungraded hero; copy = aria/caption)
- correct: "Same fork, three costumes: weather and the Ehrenfest urn have **no exit** ⇒ stationary share (πP=π); the drunkard has **walls** ⇒ absorption (I−Q)⁻¹R / hitting time (I−Q)t=1. The structure, not the story, picks the tool."
- hints: `["Classify each chain first: is there a state it can never leave?", "The urn / weather / walk costumes don't matter — two mix forever (ergodic), one has walls (absorbing). Pick by structure.", "Ergodic → πP=π (weather 3/7,4/7; Ehrenfest 1/4,1/2,1/4) · Absorbing → absorption (1/4,1/2,3/4) / time (3,4,3)."]`
- `hero.structuralReadout` (`slowFirst:true`): "no exit ⇒ πP=π · has an exit ⇒ (I−Q)⁻¹R / (I−Q)t=1"
- engine anchor: lead frame = weather; `classifyStates(weather)` has no `kind:'absorbing'` ⇒ categorical `headline:"ergodic"`. (Renderer cycles the Ehrenfest period-2 ergodic frame and the drunkard absorbing frame as the explore sweep — see Build decomposition; the single `matrix` field anchors the headline cross-check.)

**7 · `discriminate`** — graded `correct` + `hints[3]` (the model/cue-match)
- correct: "Each structural **cue** names its tool: a state you can't leave → absorption; the steps to reach it → hitting time (the +1); every state leads back out → stationary share; how often you return → Kac time. Classify first, compute second."
- hints: `["Match by structure: what does each cue tell you about exits?", "Absorption probability and hitting time are NOT one computation — both use (I−Q)⁻¹, but hitting time adds +1 per step. 'Which end' vs 'how long' is the difference.", "Can't-leave → absorption (I−Q)⁻¹R · steps-to-it → hitting time (I−Q)t=1 · leads-back-out → πP=π · how-often-return → 1/πᵢ."]`
- pairs: `"A state you can never leave (a wall)"→"Absorption: which exit (I−Q)⁻¹R"`, `"How many steps until you hit that wall"→"Hitting time (I−Q)t=1 (the +1)"`, `"Every state leads back out — it mixes forever"→"Stationary share πP=π"`, `"How often you return to a state"→"Kac return time 1/πᵢ"`
- `interviewNote`: "The first move on *any* chain problem is to classify it — absorbing or ergodic — because that single fork decides whether you set up (I−Q)⁻¹ (which exit / how long) or πP=π (the long-run share). Naming the fork out loud is half the solution."

**8 · `interleave-A-vs-B`** — graded `correct` + `hints[3]`
- correct: "Part A has **walls** (the drunkard at 0/4 is absorbing) ⇒ absorption: P(reach the far wall | start 1) = **1/4**. Part B **mixes forever** (the weather is ergodic) ⇒ stationary: long-run Clear share = **3/7**. The cover story is a costume — classify by structure."
- hints: `["Don't compute yet — first ask each part: is there a state it can never leave?", "Pick the tool by *structure*, not the cover story: Part A has absorbing walls (ask which / when); Part B mixes forever (ask the long-run share).", "Part A absorption i/N = 1/4 · Part B stationary π_Clear = 3/7."]`
- scenario: "Two unlabeled problems. **Part A:** a walker on {0,1,2,3,4} steps ±1 with equal chance; 0 and 4 stop it — find the chance it reaches 4 starting from 1. **Part B:** a sky flips Clear↔Rainy forever by P=[[3/5,2/5],[3/10,7/10]] — find the long-run fraction of Clear days. Decide the tool for each *first*."
- fields: `{id:"partA", label:"Part A — P(reach 4 | start 1)", accept:["1/4"]}`, `{id:"partB", label:"Part B — long-run Clear share", accept:["3/7"]}`

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "A frog on pads 0–4 with sink pads 0 & 4 is a **symmetric absorbing walk** — *not* ergodic, so 'long-run share' is the trap. Absorption: P(reach pad 4 | start i) = i/4 ⇒ **(1/4, 1/2, 3/4)**."
- hints: `["It runs a while — but does it ever leave pad 0 or pad 4? Classify before you compute.", "'It runs a long time, so ask its long-run share' is the trap: the sink pads are absorbing, so the chain ends. Ask *which* pad and *how likely*, not a long-run fraction.", "Absorbing ⇒ absorption vector i/4 = (1/4, 1/2, 3/4): start 1 → 1/4, start 2 → 1/2, start 3 → 3/4."]`
- scenario: "A frog sits on lily pads 0–4 and hops left / right with equal chance. Pads **0** and **4** are sink pads — land there and it stops forever. Classify the chain, then give the chance it ends on pad 4 from each interior start."
- fields: `{id:"kind", label:"Is this chain absorbing or ergodic?", accept:["absorbing"]}`, `{id:"from1", label:"P(reach pad 4 | start pad 1)", accept:["1/4"]}`, `{id:"from2", label:"P(reach pad 4 | start pad 2)", accept:["1/2"]}`, `{id:"from3", label:"P(reach pad 4 | start pad 3)", accept:["3/4"]}`

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "Every chain question forks on one structural test — *is there a state the chain can never leave?* **Yes → absorbing** (which exit (I−Q)⁻¹R, how long (I−Q)t=1); **No → ergodic** (long-run share πP=π, return 1/πᵢ). Read the structure, not the story."
- hints: `["Absorbing walls ⇒ which / when: gambler 4/7, drunkard (1/4,1/2,3/4) & (3,4,3).", "Ergodic mixing ⇒ long-run share: weather (3/7,4/7), cloudy-town (1/5,2/5,2/5), Ehrenfest (1/4,1/2,1/4).", "Periodic warning: Ehrenfest's πP=π share exists, but Pⁿ never settles (period 2). That's the whole concept in one fork — you're done."]`

## Build decomposition

- **Engine (`src/engine/markov.ts`, wave0 §4 — already frozen/built earlier; L10 only consumes it):**
  - `classifyStates(P)` — absorbing-vs-ergodic + period. Weather/Ehrenfest ⇒ no `kind:'absorbing'` (ergodic);
    drunkard ⇒ states 0 & 4 are `kind:'absorbing'`. Ehrenfest period = 2.
  - `absorptionProbabilities(sym5,[0,4])` = `(1/4, 1/2, 3/4)`; `absorptionProbabilities(gr,[0,3])` start-1 = `4/7`.
  - `expectedAbsorptionTime(sym5,[0,4])` = `(3, 4, 3)`.
  - `stationaryDistribution(weather)` = `(3/7, 4/7)`; `(cloudy)` = `(1/5, 2/5, 2/5)`; Ehrenfest detailed balance
    ⇒ `(1/4, 1/2, 1/4)`. All exact rational via `solveLinearSystem`; **no floats graded.**
- **Schema (no new member — `chainBoard` frozen wave0 §1):** two `chainBoard` `display:'diagram'`+`task:'classify'`
  beats — b4 graded (no `hero`), b6 hero (`slowFirst:true`); one `walkBoard` `display:'single'` beat (b5) with a
  required `hero` block (`slowFirst:false`, walkBoard ∈ HERO_TYPES); plus reuse `retrievalGrid`×2, `prediction`,
  `primer`, `masteryChallenge`×2, `recap`.
- **Renderer / widget (all reuse — no new component):** `ChainBoardBeat` (the classify tap/cycler routes b4 + b6
  through the Konva `ChainGraph`, classifying ergodic/absorbing and resolving the right tool); reuse
  `WalkBoardBeat` for the b5 single absorbing-walk replay; reuse `RetrievalGridBeat`, `PredictionBeat`,
  `PrimerBeat`, `MasteryChallengeBeat`, `RecapBeat`. **Explore-mixed cycling:** the schema's single `matrix` field
  carries the **weather** anchor frame (the `headline:"ergodic"` cross-check target); the hero sweep cycles the
  Ehrenfest (m=2, period-2 ergodic — P=[[0,1,0],[1/2,0,1/2],[0,1,0]]) and drunkard (sym {0..4}, 0 & 4 absorbing,
  p=1/2) frames as renderer demo states (`simulateChain` token + per-frame `classifyStates`/`stationaryDistribution`/
  `absorptionProbabilities` readout). No new schema field is needed for the cycle.
- **Fixture (`fixtures/lesson-markov-chains-10.json`, wave0 §5a):** `courseId:"course-markov-chains"`,
  `patternOptions:["H"]`, `milestoneId:"markov-chains-wild"`, `unlocks:null`, `schemaVersion:1`, node
  `glyphKey:"mix"`, `vizKey:"dice"`. Weather P = `[[{n:3,d:5},{n:2,d:5}],[{n:3,d:10},{n:7,d:10}]]`,
  `labels:["Clear","Rainy"]` for b4 (and the b6 anchor). Both `masteryChallenge` beats carry **no `pattern`**
  (R-4) and **no `chainBoard`** (wave0 §1). L10 belongs to `ch-markov-chains-4` ("Ranking & Synthesis") in the
  course `chapters[]` (wave0 §5b).

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-pick-the-tool | 4/7, (3,4,3), (3/7,4/7) — recall of L5/L6 (G&S, Math.SE 3336273) ✔ | tap/drag match (×3) ✔ | triple ✔ | ✔ (renderer) |
| which-tool-bet | Ehrenfest (1/4,1/2,1/4) (stats.libretexts 16.8) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-the-rubric | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| classify-one | weather "ergodic", π=(3/7,4/7) (Math.SE 3336273) ✔ engine (`classifyStates`+`stationaryDistribution`) | tap class chip ✔ | triple ✔ | aria-live mirror + final frame ✔ |
| walk-recall | drunkard (1/4,1/2,3/4) & (3,4,3) (G&S Ex.11.13–15) ✔ engine | watch single replay ✔ | hero readout + caption ✔ | aria-live + final frame ✔ |
| explore-mixed | weather/Ehrenfest/drunkard ✔ engine (`classifyStates` + π / absorption) | cycle + watch resolve ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| discriminate | n/a (interleave cue→tool) ✔ | tap/drag match (×4) ✔ | triple ✔ | ✔ |
| interleave-A-vs-B | 1/4 (G&S Ex.11.13) & 3/7 (Math.SE 3336273) ✔ engine | type ×2 ✔ | triple ✔ | ✔ |
| mastery-challenge | (1/4,1/2,3/4) (G&S Ex.11.13) ✔ engine | classify + type ×3 ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** Every beat is verified+sourced (or n/a), reuse-only (no new type/display), has a concrete
direct-manipulation, a triple/byOption feedback ladder, and the frozen a11y set. The single design judgement —
explore-mixed anchoring its `headline:"ergodic"` on the weather frame while the renderer cycles the other two —
is resolved above and needs no schema change.

## Gate notes (this lesson)

- **GATED inclusivity** (after appending `lesson-markov-chains-10`, wave0 §6b): ≥1 `primer` ✔ (`name-the-rubric`,
  `track:'A'`, `required:false`); every `prediction` uses `byOption` ✔ (`which-tool-bet`); an `interviewNote`
  exists ✔ (`discriminate`); first graded beat is the `retrievalGrid` opener ✔ (`recall-pick-the-tool`, not a
  `HARDEST_TYPES` member, satisfies `OPENER_TYPES`); **walkBoard hero block** ✔ (`walk-recall` carries
  `hero.slowFirst:false` — `walkBoard ∈ HERO_TYPES`); **no `introducesSymbol` tags** ⇒ the per-track
  notation-ladder check is **vacuously satisfied** (the only track-A-only grounding is `name-the-rubric`; tagging
  a `track:'both'` beat would fail in track B — wave0 §6f).
- **MASTERY_LESSONS** (wave0 §6b): last beat `recap` ✔; penult is a `masteryChallenge` `required:true` with **no
  `pattern`** ✔ (`mastery-challenge` — so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped; a
  Markov absorption vector is not a hitting-time, R-4). The earlier `interleave-A-vs-B` is a *second*
  `masteryChallenge`, also pure type-in with no `pattern`.
- **chainBoard cross-check** (wave0 §6c): `classify-one` and `explore-mixed` declare `headline:"ergodic"`; the
  validator derives it from `classifyStates(P)` — **no state has `kind:'absorbing'`** (weather is one irreducible
  recurrent class) ⇒ the categorical `"ergodic"` is string-matched. `chainBoard` is **NOT** in
  `HERO_TYPES`/`GRADED_TYPES` (graded ⇔ no `hero`): `classify-one` is graded (no `hero`), `explore-mixed` is the
  hero (ungraded, `hero.slowFirst:true`). No gate asserts on these chainBoard beats beyond the headline check.
- **Concept finale:** `unlocks:null` — L10 ends the `course-markov-chains` path. Completion/unlock does not depend
  on a milestone seal on the dev build (wave0 R-8, seeded-only); no extra gate work is required here.
