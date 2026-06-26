# Interaction Spec: Hitting Times & Absorption  (lesson-markov-chains-5)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the shipped reuse renderers (`RetrievalGridBeat`,
> `PredictionBeat`, `PrimerBeat`, `WalkBoardBeat`, `AnswerEntryBeat`, `RaceSimBeat`, `TripletRevealBeat`,
> `MasteryChallengeBeat`, `RecapBeat`). The frozen `chainBoard` type, the `markov.ts` engine, the new
> `ChainBoardBeat`/`ChainGraph`, and the `validate-fixtures.ts` edits all live in `../wave0-contracts.md`
> (§1–§6, FROZEN) — this spec maps every Dept-1 brief beat to a real interaction type and supplies the
> per-beat feedback ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]`
> (safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and no Markov beat
> reads the automaton), `milestoneId:'markov-chains-hitting'`, `unlocks:'lesson-markov-chains-6'`,
> `schemaVersion:1`. Glyph `(I−Q)⁻¹`, viz `randomWalk`.
>
> **This lesson recalls and lifts.** Ten of eleven beats reuse shipped renderers; the only net-new surface
> is the single `chainBoard:matrix` hero (`solve-matrix`). Every graded number is an exact rational
> reproduced by `markov.ts` (§4 golden table). Per the frozen grading rule (§1), a `chainBoard` beat is
> **graded iff it carries no `hero` block**; `solve-matrix` carries a `hero` block, so it is the ungraded
> "watch it resolve" hero, and its correctness rides the `validate-fixtures` headline cross-check
> (`4/7,6/7`), not a learner hint ladder.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-first-step` | Tap a left recurrence → pick its match on the (shuffled) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag targets ≥44px; `aria-live` status mirror (renderer built-in) | none (tap) | both |
| 2 | `time-or-prob-bet` | Pick one chip (a/b/neither) → soft per-option note → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `lift-to-matrix` | Expand the JIT primer naming Q, R, I, N=(I−Q)⁻¹ → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `walk-recall` | Watch one fair \$0–\$4 walk slam a wall; optional 200-walk batch tally → Continue | `walkBoard` | reuse | `n:4`, `p:0.5`, `start:2`, `display:'single'` + beat-level `hero` (`slowFirst:false`) | buttons ≥44px; `aria-live` readout; reduced-motion → discrete paced steps to final frame | SVG number line; single-walk step playback (HERO_TYPES) | both |
| 5 | `iN-early-win` | Type the three reach-probabilities (start 1/2/3) → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept}]` (×3) | inputs ≥44px; Enter submits; FeedbackStrip `aria-live` | none | both |
| 6 | `race-recall` | Watch THH vs HHH race one coin stream; tally who-first → Continue | `raceSim` | reuse | `patterns:["THH","HHH"]`, `display:'lanes'`, `mode:'patterns'`, `trials?` + beat-level `hero` (`slowFirst:false`) | lane controls ≥44px; `aria-live` race tally; reduced-motion → final standings | race-track animation (HERO_TYPES); slow-first **false** (replay) | both |
| 7 | `solve-matrix` | Watch P split into Q/R, N=(I−Q)⁻¹ assemble, then B=NR resolve to 4/7,6/7 → Continue | `chainBoard` `display:'matrix'` | **NEW** | `display:'matrix'`, `task:'absorption'`, `matrix` (4×4 rationals), `labels:["0","1","2","3"]`, `absorbing:[0,3]`, `headline:"4/7,6/7"` + beat-level `hero` (`slowFirst:true`) + `interviewNote` | matrix cells/readout mirrored by visually-hidden `aria-live`; reduced-motion → final N and B already resolved | DOM/SVG grid; slow-first Q/R → N → B=NR reveal (CSS transitions) | both |
| 8 | `triplet-reveal` | Reveal each of three lenses → they converge on 4/7 | `tripletReveal` | reuse | `value:'4/7'`, `lenses:[{label,body}]` (×3), `display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 9 | `time-vs-prob` | Match each read (probability vs time) on the *same* walk → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag ≥44px; `aria-live` | none | both |
| 10 | `mastery-dice` | Type P(single 12 before two consecutive 7s) → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 11 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

**Required / track flags** (schema `required` is mandatory): graded beats `recall-first-step`, `iN-early-win`,
`time-vs-prob`, `mastery-dice` are `required:true, track:both`; the JIT primer `lift-to-matrix` is
`track:A, required:false`; the prediction, both recalls, the hero, the triplet, and the recap are
`required:false` (ungraded). The three heroes carry the `hero` block; only `solve-matrix` is `slowFirst:true`.

## Remaps vs. Dept-1 brief (explicit)

- **`solve-matrix` (b7) → the chainBoard:matrix hero.** The brief sketched a `chainBoard:matrix` solve and
  labeled it "yes (hero)". Per the **frozen grading rule** (§1: graded ⇔ no `hero`), a beat with a `hero`
  block is the ungraded "watch it resolve" hero (primary = Continue). So `solve-matrix` is **ungraded**; its
  correctness is enforced by the `validate-fixtures` §6c cross-check that recomputes
  `absorptionProbabilities(P,[0,3])` and asserts the declared `headline:"4/7,6/7"` — **not** a learner hint
  ladder. The hint copy below is therefore caption/aria-mirror copy, exactly as the Bayes `explore-update`
  hero (R-1).
- **`walk-recall` (b4, `walkBoard`) and `race-recall` (b6, `raceSim`) carry `hero` blocks with
  `slowFirst:false`.** `walkBoard` and `raceSim` are in `HERO_TYPES` (§6), so the validator **requires** a
  `hero` block on every beat of those types. These two are *replays* (recall), so `slowFirst:false`,
  reserving the true watch-it-resolve hero for the `chainBoard` solve. `chainBoard` itself is **not** in
  `HERO_TYPES`, so this requirement is independent of the new type.
- **`interviewNote` ADDED on `solve-matrix` (Dept-2 GATE addition).** The L5 brief specified no
  `interviewNote`; the wave-0 contract's GATED block requires exactly one per lesson (§6f, risk R-5), so
  Dept-2 authors it here on `solve-matrix`.
- **`mastery-dice` (b10) is a PURE `masteryChallenge` type-in.** Per the contract note ("Mastery beats are
  NOT chainBoard"), the dice 4-state absorption is *stated* as a type-in scenario; it carries **no
  `chainBoard`** surface and **no `pattern`** (avoids the `buildAutomaton(pattern).E0 ∈ accept` cross-check,
  risk R-4). The chainBoard surface for the lesson lives solely in `solve-matrix`.
- No other remaps. Every other beat maps 1:1 to an existing real type.

## New interaction types (Wave 0)

Only one, and it appears once in this lesson:

- **`chainBoard` `display:'matrix'`, `task:'absorption'`** (frozen in `../wave0-contracts.md` §1). The
  renderer (`ChainBoardBeat.tsx`, §3) draws a DOM/SVG grid of the rational P, renders the **Q / R split**
  (transient rows {1,2} vs absorbing columns {0,3}) and the resolved **fundamental matrix N = (I−Q)⁻¹**,
  then **B = NR**. All displayed/graded values come from `src/engine/markov.ts` — never hardcoded:
  `absorptionProbabilities(P, absorbing)` (= B = (I−Q)⁻¹R) anchors the `4/7,6/7` headline, and
  `expectedAbsorptionTime(P, absorbing)` (= t solving (I−Q)t = 1) supplies the "+1" companion shown in the
  triplet/interleave copy. `chainBoard` is **not** added to `HERO_TYPES` or `GRADED_TYPES` (§6); the
  hero/graded split rides the beat-level `hero` block + the §6c engine cross-check.

## Feedback + hint ladders (actual copy)

Hint-ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]` = Hint 1 (gentle),
`hints[1]` = Hint 2 (the **misconception refutation**), `hints[2]` = Hint 3 = the **revealed answer**
(label flips to "Answer"; "Try again" resets). `required` graded beats that reach reveal report
`needsReview`. Heroes/recalls/primer/recap use the same `{correct, hints}` shape as caption/aria copy.

**1 · `recall-first-step`** — graded `correct` + `hints[3]`
- correct: "A probability recurrence is a *split* (no +1); only a *duration* recurrence pays +1 per step. Same chain, two different reads."
- hints: `["Warm-up — you wrote all of these in PHT, gambler's ruin, and EV. No new tool here.", "Not every recurrence carries a +1: a win-chance just splits and ends at 1 (win) or 0 (broke). The +1 belongs only to duration.", "Win-chance → a split (no +1); duration → +1 each step; symmetric reach → i/4; E[HH] → 6."]`
- pairs: `"Win-chance recurrence  P₂ = ⅓P₁ + ⅔P₃"→"no +1 — just a split, ending at 0 or 1"`, `"Duration recurrence  D₂ = 1 + ⅓D₁ + ⅔D₃"→"+1 on every step"`, `"Symmetric walk, P(reach $4 | start $i)"→"i/4 — the start sets the split"`, `"E[HH] by conditioning on the first flip"→"6 flips"`

**2 · `time-or-prob-bet`** — `byOption` (+ fallback `hints`)
- `"Both need a +1"` → `{note:"Only one does. A win-chance recurrence has no +1 — it just splits and ends at 1 (win) or 0 (broke). The +1 is the cost of taking a step, which only matters when you're counting steps.", correct:false}`
- `"Only the duration (time) carries the +1"` → `{note:"Right — tᵢ = 1 + Σⱼ pᵢⱼtⱼ. That +1 is the step you just spent. In matrix form it's exactly the 1 on the right of (I−Q)t = 1; it's simply absent from B = (I−Q)⁻¹R.", correct:true}`
- `"Neither needs a +1"` → `{note:"Duration does. Each step you take adds 1 to the count, so tᵢ = 1 + Σⱼ pᵢⱼtⱼ. Without the +1 you'd predict 0 steps to the wall.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll weigh it.", "Counting steps means each step adds 1; a probability only splits.", "Only the duration carries the +1; the win-chance is a pure split."]`

**3 · `lift-to-matrix`** (primer; copy = caption/aria)
- correct: "Q and R split the chain; the single N = (I−Q)⁻¹ prices both the split (B = NR) and the time ((I−Q)t = 1)."
- hints: `["Q = transient→transient moves; R = transient→wall jumps.", "N = (I−Q)⁻¹ is the *same* matrix for both reads — it's not a new method.", "B = NR is the split; (I−Q)t = 1 adds the +1."]`
- title: "Q, R, and the fundamental matrix N = (I−Q)⁻¹" · body: "Split the chain into its **transient** block **Q** (moves among not-yet-absorbed states) and its **absorbing** block **R** (jumps to a wall). The **fundamental matrix N = (I−Q)⁻¹** counts expected visits, and it prices *both* reads of the chain: absorption probabilities **B = (I−Q)⁻¹R** (no +1, just the split) and expected hitting times **t** solving **(I−Q)t = 1** (the +1 is the 1 on the right). Same Q, same N — two answers."

**4 · `walk-recall`** (ungraded recall hero; copy = aria/caption)
- correct: "A symmetric walk steps ½/½, but the *outcome* isn't ½ from everywhere — from \$2 it's 1/2, from \$1 it's 1/4. The start sets the split."
- hints: `["Watch one walk slam into a wall, then run a batch to see the split.", "Symmetric = each *step* is ½/½; it does NOT mean the win-chance is ½ from every start.", "From $2: reach $4 with probability 1/2 in ~4 flips; from $1, only 1/4."]`
- `hero.structuralReadout`: "From \$2 of \$0–\$4: reach \$4 with probability 1/2; about 4 flips to a wall." · `hero.slowFirst:false`, `hero.reducedMotionFinalFrame:true`

**5 · `iN-early-win`** — graded `correct` + `hints[3]`
- correct: "Symmetric ⇒ P(reach \$4 | start i) = i/N = i/4: **1/4, 1/2, 3/4**. The start *is* the whole answer (no +1 — this is the split)."
- hints: `["Symmetric walk: the reach-probability is linear in your starting money.", "It's not ½ from everywhere — symmetric means each *step* is ½/½, not the *outcome*. From $1 you're one slip from broke.", "i/4: start 1 → 1/4, start 2 → 1/2, start 3 → 3/4."]`
- fields: `{id:"i1", label:"P(reach $4 | start $1)", accept:["1/4"], placeholder:"e.g. 1/4"}`, `{id:"i2", label:"P(reach $4 | start $2)", accept:["1/2"]}`, `{id:"i3", label:"P(reach $4 | start $3)", accept:["3/4"]}`

**6 · `race-recall`** (ungraded recall hero; copy = aria/caption)
- correct: "Penney's 'who reaches their pattern first' is an **absorption probability** — a who-first split (7/8 vs 1/8), the same B = (I−Q)⁻¹R you're about to build. No new tool."
- hints: `["Watch the two patterns race the same stream; tally who lands first.", "Racing patterns isn't a brand-new tool — it's absorption on the pattern-prefix chain.", "THH lands first 7/8 of the time; HHH only 1/8."]`
- `hero.structuralReadout`: "Two patterns race one coin stream: THH lands first 7 of 8 times — a who-first split (absorption probability), no +1." · `hero.slowFirst:false`, `hero.reducedMotionFinalFrame:true`

**7 · `solve-matrix`** (ungraded hero; copy = aria/caption; correctness via §6c cross-check)
- correct: "Same N = (I−Q)⁻¹ as the fair walk — Q just holds ⅔ and ⅓. B = NR gives P(reach \$3 | start \$1) = **4/7** and P(reach \$3 | start \$2) = **6/7**. Asymmetry doesn't break the formula."
- hints: `["Split P into Q (states 1,2) and R (walls 0,3), then form N = (I−Q)⁻¹.", "Asymmetric (up ⅔) doesn't break anything — Q just carries ⅔ and ⅓ instead of ½,½. The same N works.", "B = NR = (4/7, 6/7): from $1 you reach $3 with probability 4/7; from $2, 6/7."]`
- `hero.structuralReadout`: "N = (I−Q)⁻¹ → B = NR" · `hero.slowFirst:true`, `hero.reducedMotionFinalFrame:true`
- `interviewNote` (Dept-2 ADD, satisfies the GATED "≥1 interviewNote" rule): "(I−Q)⁻¹ — the fundamental matrix — prices BOTH absorption probability (B = NR) and expected hitting time ((I−Q)t = 1); interviewers check you know the only difference is the +1."
- `matrix` P (row-stochastic, exact `{n,d}` rationals; `labels:["0","1","2","3"]`, `absorbing:[0,3]`):

```text
[ [1,    0,    0,    0   ],   // state 0 — absorbing (broke)
  [1/3,  0,    2/3,  0   ],   // state 1 — down 1/3, up 2/3
  [0,    1/3,  0,    2/3 ],   // state 2 — down 1/3, up 2/3
  [0,    0,    0,    1   ] ]  // state 3 — absorbing (win)
encoded: 1={n:1,d:1}, 0={n:0,d:1}, 1/3={n:1,d:3}, 2/3={n:2,d:3}
```

**8 · `triplet-reveal`** (ungraded reveal)
- correct: "Recurrence, matrix solve, and simulation all land on **4/7** — they're the same first-step bookkeeping, not three coincidences. (A martingale / optional-stopping argument gives it too — an aside, not a fourth method.)"
- hints: `["Reveal each lens.", "(I−Q)⁻¹R *is* your first-step equations written as a matrix — not a rival method that could disagree.", "All three say 4/7."]`
- value: `'4/7'` · lenses: `{label:"Recurrence", body:"a₁ = ⅓·0 + ⅔a₂, a₂ = ⅓a₁ + ⅔·1 ⇒ a₁ = 4/7"}`, `{label:"Matrix solve", body:"B = (I−Q)⁻¹R; the start-$1 transient row = 4/7"}`, `{label:"Simulation", body:"Run the up-⅔ walk from $1 thousands of times → ≈ 0.571 reach $3"}` · display: `'cards'`

**9 · `time-vs-prob`** — graded `correct` + `hints[3]` (the interleave)
- correct: "Same walk, two reads: the **probability** i/N carries no +1 (a split), the **time** i(N−i) carries +1 every step. Don't reuse one recurrence for the other."
- hints: `["Which read counts steps (so each step adds 1), and which only splits the chance?", "Expected-time and absorption-probability do NOT share one recurrence — the time has a +1 per step, the probability doesn't.", "Win-chance: 1/4, 1/2; time-to-wall: 3, 4."]`
- pairs: `"Win-chance from $1 (i/N)"→"1/4 — no +1"`, `"Time-to-wall from $1, i(N−i)"→"3 — +1 each step"`, `"Win-chance from $2 (i/N)"→"1/2 — no +1"`, `"Time-to-wall from $2, i(N−i)"→"4 — +1 each step"`

**10 · `mastery-dice`** — graded `correct` + `hints[3]`
- correct: "Build the 4-state chain {start, saw-one-7, won-by-12, won-by-7·7} and solve B = (I−Q)⁻¹R: P(single 12 first) = **7/13**. The two-consecutive-7s event is its complement, **6/13** — name the absorbing state before you compute."
- hints: `["Build the absorbing chain: states are {start, just-saw-a-7, 12-wins, 7·7-wins}. Which absorbing state is '12 first'?", "7/13 is P(a single 12 first), NOT the two-consecutive-7s probability — that's the complement, 6/13. Read the event.", "7/13."]`
- scenario: "You roll two dice over and over. Two events race to happen first: a **single 12** appears, or **two 7s in a row** appear. Per roll, P(7) = 6/36, P(12) = 1/36, anything else = 29/36. What is P(a single 12 comes first)?" · field: `{id:"dice", label:"P(a single 12 before two consecutive 7s)", accept:["7/13"], placeholder:"e.g. 7/13"}` · **no `pattern`**

**11 · `recap`** (generic generate-then-reveal; `correct` = principle, `hints` = takeaways)
- correct: "One matrix prices everything: N = (I−Q)⁻¹ gives the **probability** B = NR (no +1) and the **time** (I−Q)t = 1 (the +1). Recurrence, matrix, and simulation are the same bookkeeping."
- hints: `["A win-chance is a split (no +1); a duration pays +1 every step — that +1 is the 1 in (I−Q)t = 1.", "Asymmetry doesn't break the formula: Q just carries different probabilities. Scale it up — the drunk man on a 100-m bridge from step 17 reaches the far end with probability 17/100, in 17·83 = 1411 expected steps.", "Next up: where does a memoryless process settle? The stationary distribution πP = π."]`

## Build decomposition

- **Engine (`src/engine/markov.ts`, wave0 §4).** This lesson exercises exactly two functions:
  - `absorptionProbabilities(P, absorbing)` (= B = (I−Q)⁻¹R via `solveLinearSystem`). Goldens to pin in
    `markov.test.ts`: gambler up-⅔ `[0,3]` → **4/7, 6/7** (the headline column); symmetric \$0–\$4 reach →
    **(1/4, 1/2, 3/4)**; dice 4-state → **7/13** (12-first) and its complement **6/13** (two-7s-first);
    Penney THH/HHH → **1/8** (P(HHH before THH)).
  - `expectedAbsorptionTime(P, absorbing)` (= t solving (I−Q)t = 1). Goldens: E[THH] → **8**; symmetric
    \$0–\$4 duration → **(3, 4, 3)**; drunk-man start-17 on a 100-state walk → **1411** (= 17·83).
  - **No new engine for the recalls.** `walk-recall` reuses the shipped `src/engine/walk.ts`
    (`buildWalk`/`traceWalk`/`simulateWalk`) and `race-recall` reuses `src/engine/race.ts` (Penney) via the
    existing `WalkBoardBeat`/`RaceSimBeat`. **No `walk.ts` change is needed** (wave0 §7: constant-p
    absorbing gambler's ruin is already supported).
- **Schema (`src/content/schema.ts`).** Append the frozen `chainBoard` member (§1) — the only schema delta
  concept-wide. This beat uses the `matrix` / `task:'absorption'` / `labels` / `absorbing` / `headline`
  fields; the recalls use the existing `walkBoard` (`n`/`p`/`start`/`display`) and `raceSim`
  (`patterns`/`display`/`mode`/`trials`) members plus the existing beat-level `hero` block; all other beats
  use already-shipped members (`retrievalGrid`, `prediction`, `primer`, `answerEntry`, `tripletReveal`,
  `masteryChallenge`, `recap`).
- **Renderer / widget.** `ChainBoardBeat.tsx` (§3): for `display:'matrix', task:'absorption'`, render the
  P grid → Q/R split → N = (I−Q)⁻¹ → B = NR, every value from `markov.ts`, slow-first per `hero.slowFirst`,
  reduced-motion → final frame, with the visually-hidden `aria-live` matrix mirror. **Reuse**
  `WalkBoardBeat.tsx` (walk-recall) and `RaceSimBeat.tsx` (race-recall) **unchanged**. No Konva needed for
  the matrix display (DOM/SVG + CSS, mirroring `WalkBoardBeat` SVG).
- **Fixture (`fixtures/lesson-markov-chains-5.json`).** 11 beats per the table; lesson fields per the
  fixture facts above; the four chainBoard rationals encoded as `{n,d}`; `validate-fixtures` §6c recomputes
  `absorptionProbabilities(P,[0,3])` and asserts `headline === "4/7,6/7"`.

## Definition-of-Ready checklist

| beatId | verified + sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|----------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-first-step | n/a (recall of PHT/gambler's/EV) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| time-or-prob-bet | n/a (commitment bet) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| lift-to-matrix | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| walk-recall | reach 1/2, dur 4 (G&S Ex.11.13–15) ✔ engine | watch walk + batch ✔ | hero readout + caption ✔ | aria-live + final frame ✔ |
| iN-early-win | (1/4, 1/2, 3/4) (G&S Ex.11.13) ✔ engine | type ×3 ✔ | triple ✔ | ✔ |
| race-recall | 7/8 vs 1/8 (GB p.56) ✔ engine | watch race + tally ✔ | hero readout + caption ✔ | aria-live + final frame ✔ |
| solve-matrix | 4/7, 6/7 (GB p.54–55) ✔ engine (§6c) | watch Q/R → N → B resolve ✔ | hero readout + caption ✔ | aria-live matrix mirror + final frame ✔ |
| triplet-reveal | 4/7 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| time-vs-prob | (1/4,1/2) & (3,4) (G&S Ex.11.15) ✔ engine | tap/drag match ✔ | triple ✔ | ✔ |
| mastery-dice | 7/13 (GB p.55–56 + 5 web) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a (17/100, 1411 aside) ✔ engine | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** One watch-item: the drunk-man scale-up number is **1411** (= 17·83), OCR-corrected
from the source's printed "1441" (brief flags this); the engine `expectedAbsorptionTime` must reproduce
1411 and the `markov.test.ts` golden pins it — Ready, engine-verify on build.

## Gate notes (this lesson)

- **GATED inclusivity** (after adding `lesson-markov-chains-5` to `GATED`): ≥1 `primer` ✔ (`lift-to-matrix`,
  track A); every `prediction` uses `byOption` ✔ (`time-or-prob-bet`); exactly one `interviewNote` ✔
  (`solve-matrix` — **Dept-2 ADD**, the brief specified none); the first graded beat is the `retrievalGrid`
  opener ✔ (`recall-first-step`); `walkBoard` + `raceSim` beats carry their required `hero` blocks ✔
  (`walk-recall`/`race-recall`, both `slowFirst:false`, HERO_TYPES); **no `introducesSymbol` tags** ⇒ the
  per-track notation-ladder check is **vacuously satisfied** (the only candidate grounding is the
  track-A-only `lift-to-matrix` primer; tagging a `track:both` beat would fail the gate in track B — same
  reasoning as Bayes §6f).
- **MASTERY_LESSONS** (after adding to `MASTERY_LESSONS`): last beat is `recap` ✔; penult beat is
  `masteryChallenge` `required:true` with **no `pattern`** ✔ (`mastery-dice` — 7/13 is a Markov fraction,
  not a hitting-time, so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped, risk R-4).
- **chainBoard cross-check** (§6c): `solve-matrix` declares `headline:"4/7,6/7"`; the validator recomputes
  `absorptionProbabilities(P,[0,3])` and formats the reach-the-win-wall column to `4/7,6/7`. `chainBoard` is
  **not** added to `HERO_TYPES`/`GRADED_TYPES`; the hero/graded split rides the beat-level `hero` block plus
  this cross-check (risk R-2).
