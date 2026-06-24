# L5 Plan — States & Streaks (`lesson-states-streaks`)

**Agent:** 4 of 5 (lesson ideation)  
**Output path:** `audits/ideation/plan-L5-states-streaks.md`  
**Status:** Authoring spec for fixture + widgets (not built)

---

## 1. Positioning & promise

### Where L5 sits

L5 is **lesson 5 of 6**, unlocked only after:

| Prior lesson | Headline numbers the learner already owns |
|---|---|
| **L1** Pattern Hitting Times | `E[HH]=6`, `E[HT]=4`; overlap = memory |
| **L2** Penney's Game | `P(THH first vs HHH)=7/8`; `HH` vs `HT` **tie** 50/50 despite 6≠4 |
| **L3** Gambler's Ruin | `P_i=i/N`, `D_i=i(N−i)`; fair headline `P_2=½`, `D_2=4` at `N=4` |
| **L4** Overlap Shortcut | `E[wait]=Σ 2^L`; re-derives 6, 4, 8, 10 |

**L5 unlocks L6** (Longer Patterns & Overlap transfer: `THH` vs `HTH`).

### Reframe (critical)

This is **not** a cold-open warm-up. The course copy and home hook must say:

> *"You’ve raced patterns, walked to ruin, and read the wait off overlap. Now strip the problem to its skeleton: one target letter, two states, one number — and see every tool you learned collapse to the same answer."*

**Core learning promise (one sentence):** Model waiting for the **first** `H` as the simplest absorbing chain (`∅ → H`), derive `E[H]=2` by first-step analysis, confirm by simulation, and recognize it as **geometric waiting** (`1/p`), **overlap sum** (`2¹`), and **mean recurrence** (`1/π_H`).

**Milestone:** `first-pattern-cracked` (name is legacy; recap copy should say *"Simplest pattern cracked — every method agrees on 2"*).

### `patternOptions`

```json
"patternOptions": ["H"]
```

Single fixed target. **No** `patternPick`, **no** compare mode. Engine call: `buildAutomaton("H", 0.5)`.

### Automaton (engine golden)

| State | Label | Absorbing | Meaning |
|---|---|---|---|
| `E0` | `∅` | no | No `H` matched yet |
| `E1` | `H` | yes | First `H` absorbed |

**Transitions from `E0`:**

| on | to | kind |
|---|---|---|
| `H` | `E1` | advance |
| `T` | `E0` | self-loop |

**Recurrences (tile targets):**

```
E0 = 1 + 1/2 E1 + 1/2 E0
E1 = 0
```

**Solution:** `E[H] = E0 = 2`.

Golden test to add: `buildAutomaton("H", 0.5).expectedTimes.E0 === 2`.

**Substitution steps (engine-driven):**

1. `E1 = 0` → substitute `E1`, result `0`
2. `E0 = 1 + 1/2 E1 + 1/2 E0` → substitute `E1=0` → `E0 = 1 + 1/2 E0` → isolate → `E0 = 2`

**Overlap highlights:** only the `E0` on `T` self-loop (there is no near-miss reset to a *deeper* state — the “memory” is empty). Contrast copy in beat 5 explicitly against L1’s `E1 on T → E0` reset for `HH`.

> **(review: verified against engine)** `buildAutomaton("H",0.5).overlapHighlights` is the **empty array `[]`**, not the `T` self-loop. `overlapHighlights` only flags *near-miss reset* edges (`HH`→`[{from:E1,on:T}]`); the `E0`-on-`T` self-loop is an ordinary `transition` with `kind:"self-loop"`, never a highlight. This is the whole point pedagogically ("memory is empty"), but it has a **concrete code consequence**: `CoinSimBeat.startReplay()` reads `automaton.overlapHighlights[0].on` unconditionally and will **crash** on `H`. See Implementation §"FirstSuccessTimeline / coinSim".

---

## 2. Math spine (research-backed)

### Geometric waiting (first success)

Independent Bernoulli(`p`) trials until first success:  
`E[T] = 1/p`. Fair coin, target `H`: `p = ½` ⇒ **`E = 2`**.

**Quant interview trap:** “Probability of `H` on one flip is ½, so I wait 1 flip on average.”  
Wrong — expectation counts **all** tails before the first head: `1·½ + 2·(½)² + 3·(½)³ + … = 2`.

### Simplest absorbing chain

Two states, one absorbing. Same `(I−Q)t = 1` machinery as L1–L4; matrix is 1×1:

`(1 − ½) E0 = 1` ⇒ `E0 = 2`.

### Overlap shortcut instance (L4 retrieval)

Pattern `H`, length `L=1`, borders `{1}` only:

`E[H] = 2¹ = 2` — the **smallest** nontrivial case of `Σ 2^L`.

### Mean recurrence / Kac (light touch, not a new lesson)

For an i.i.d. fair coin, long-run fraction of `H` is `π_H = ½`. Mean **return** time to an `H`-event (gap between consecutive heads in the stream) is `1/π_H = 2`. The **first**-`H` waiting time equals that gap law in this symmetric case — preview only; full ergodic lesson is deferred (see agent-2 `lesson-stationary-recurrence`).

> **(review: correct number, subtle concept)** `1/π_H = 2` is right (verified). But Kac's lemma is about **mean recurrence time** (return to `H` *given you're already at* `H`), which is a *different quantity* from the **first-hitting time** (the wait from a cold start). They coincide here **only because the coin is memoryless** — both are `Geometric(½)`. Presenting Kac as a co-equal "road to 2" risks planting "hitting = recurrence always," a misconception L6 (where `THH`≠`HTH` hitting times) will have to undo. **Recommendation:** keep the canonical trio = {first-step, geometric `1/p`, overlap `Σ2^L`} (three *rigorously equal, already-owned* lenses) and demote Kac to a one-line teaser footnote inside the geometric card. Do **not** state Kac as the literal equality "first-`H` wait = recurrence time" without the memoryless caveat.

**Copy guardrail:** One beat, narrative + one tap-to-confirm chip. Do not introduce `π = πP` balance equations here.

### Gambler’s / Penney’s callbacks (retrieval only)

- L3 muscle memory: duration recurrence has **`1+`**; win-probability recurrence does **not** — `E0` here is duration-style.
- L2: “first to appear” ≠ “expected wait” — irrelevant for single `H`, but retrieval grid reinforces the distinction.

---

## 3. Beat inventory — 12 beats (11 Required + 0 Extension)

**Cut line (PRD):** if slipping, shrink to **7 Required** (see §8). Never go below 5 without explicit schedule panic.

### Phase rail (Top Bar)

| Phase | Beats | Tint role |
|---|---|---|
| **Bet** | 1–2 | Commit + retrieve course numbers |
| **Explore** | 3–4 | Sim + minimal graph hero |
| **Model** | 5–8 | Edges, tiles, trap check, slider |
| **Prove** | 9–12 | Solve, sim convergence, Kac bridge, recap |

Progress rail shows **12 segments** (no off-rail extension in L5).

> **(review: shared-infra blocker)** `src/lesson/phases.ts` is a **flagship-only singleton** — a hardcoded `PHASES` const listing L1's beatIds, and `phaseOf()` **throws `"Beat … is not in any phase"`** for any unknown beatId. `LessonPlayer` calls `PhaseRail`/`biasChipState` for *every* lesson, so L5's beatIds (`open-hook`, `course-retrieval`, …) would **throw on first render**. This must become per-lesson (keyed by `lessonId`, or read phase metadata from the fixture) before *any* non-flagship lesson renders. It's cross-cutting (blocks L2–L6, not just L5), so likely owned by shared infra — but it is a hard dependency for L5 and belongs in the risk list.

---

### Beat 1 — `open-hook` · **prediction** · Bet · Required

**Prompt:** *“You flip a fair coin until the first `H`. How many flips on average?”*

**Options (order shuffled in UI):**

- “**1 flip** — it’s 50/50 on the first try” ← **primary trap**
- “**2 flips** on average” ← correct
- “**½ flip** — expectation can be fractional” ← distractor (tests understanding)
- “**4 flips** — same as length-2 patterns” ← L1 confusion transfer

**Primary action:** `Continue` after selection (ungraded bet; store `initialPrediction`).

**Feedback:** Neutral note — *“Most interview candidates say 1. The state machine will show why it’s 2.”*

**Widget:** `PredictionBeat` (reuse). Large solo `H` token (no `HH`/`HT` compare cards).

---

### Beat 2 — `course-retrieval` · **retrievalGrid** · Bet · Required · **NEW**

**Prompt:** *“Before we solve — tap each number with the lesson that produced it.”*

**Interaction:** 2-column matching grid (DOM, 44px cells):

| Number | Tap one lesson label |
|---|---|
| `6` | Pattern Hitting Times |
| `4` | Pattern Hitting Times |
| `7/8` | Penney's Game |
| `i(N−i)` | Gambler's Ruin |
| `Σ 2^L` | Overlap Shortcut |
| **`2`** | *“Not yet — you’re about to derive it”* (ghost row, not gradable until beat 12) |

**Grading:** Each row `Check` independently or one `Check` all; wrong match → hint ladder highlights the course-path index card for that lesson (DOM glow, not Konva).

**Purpose:** Spaced retrieval **before** the easy solve — positions L5 as consolidation, not introduction.

**Schema addition (proposed):**

```ts
| {
    type: "retrievalGrid";
    rows: Array<{
      id: string;
      value: string;           // "6", "7/8", ...
      correctLessonId: string; // "lesson-pattern-hitting-times", ...
      lessonLabels: string[];  // shuffled display names
    }>;
    ghostRows?: Array<{ value: string; caption: string }>;
  }
```

**Cut line:** drop entire beat; fold one retrieval row into beat 12 recap.

---

### Beat 3 — `simulate-first-h` · **coinSim** + **FirstSuccessTimeline** · Explore · Required · **NEW sub-widget**

**Prompt:** *“Flip until the first `H`. Watch the waiting time stack up.”*

**Interaction:**

- `coinSim` mode `free`, gate `{ minFlips: 2 }` (force at least one tail once).
- **`FirstSuccessTimeline`** (Konva strip below stream): each trial is a tick; `T` = hollow tick, `H` = filled gold tick that **freezes** the run; counter shows `k` flips this run.
- Running **batch stats** (DOM): after ≥3 completed runs, show mini mean of run lengths drifting toward 2.

**Signature moment:** first absorption — graph node `H` double-ring absorbs, timeline highlights the success flip in `--mark`.

**Primary action:** `Flip` → after gate + ≥1 completed run, `Continue`.

**Engine:** `flipsToAbsorption("H", 0.5)` per run; `nextStateOf` for graph.

**Reduced motion:** timeline jumps to final tick; graph lands on `E1` without pulse travel.

**Schema:** extend `coinSim` with optional `overlay: "firstSuccessTimeline"`.

> **(review: reuse landmine — must fix before this beat works)** The existing `CoinSimBeat` is **not** a drop-in for `H`. After the gate, its `Continue` runs `startReplay()`, which does `const nearMiss = automaton.overlapHighlights[0]` then reads `nearMiss.on` — for `H`, `overlapHighlights` is `[]`, so this **throws `TypeError`**. Reuse requires a one-line guard (`if (automaton.overlapHighlights.length === 0) { onAdvance(); return }`) that skips the near-miss replay when there is no near-miss. Also note `CoinSimBeat` resets to `E0` after absorption and **keeps flipping a single stream** — it has *no per-run segmentation*, so `FirstSuccessTimeline` (per-run wait lengths) is **not** just an `overlay` flag; it needs new run-tracking state. See Implementation §FirstSuccessTimeline.

---

### Beat 4 — `minimal-graph-hero` · **stateGraphHero** · Explore · Required · **NEW layout mode**

**Prompt:** *“The whole problem fits on two nodes. Trace one flip.”*

**Interaction:** Enlarged 2-node `StateGraph` (~60vh laptop) — **hero scale** vs L1’s 3-node graph.

- Learner taps **`Flip once`** (single step only, repeated taps allowed).
- Each flip animates: coin token → edge travel → node pulse.
- Side panel (DOM): “Current state: `∅` or `H`” + “Flips this session: n”.

**No quiz.** Exit: after learner has seen **both** an `H`-absorption and at least one `T` self-loop on `∅`, enable `Continue`.

**Purpose:** Signature visual — *simplest instance of everything you learned* — states, edges, absorption.

**Implementation:** Reuse `StateGraph` + `CoinStream` with `layout: "heroTwoNode"` prop; no new engine.

> **(review: prop doesn't exist; radius is capped)** `StateGraph` has **no `layout` prop**, and its node radius is **hard-capped**: `radius = Math.min(34, Math.max(22, width/(n*3)))`. So a bigger `width` will *not* enlarge the 2 nodes past 34px — a "hero" graph genuinely needs a new optional size prop (e.g. `maxRadius`/`heroScale`), not a layout string. Small change (one cap + label-size knob), but real. Also: beat 4 isn't a schema type — the lightest path is to **merge it into beat 3** (the plan's own cut line) and pass the hero size to the graph already mounted by `CoinSimBeat`. (No engine change either way.)

**Cut line:** merge into beat 3 (same screen, graph always visible in coinSim).

---

### Beat 5 — `reset-edge` · **stateTap** · Model · Required

**Prompt:** *“From `∅`, where does a tail send you? Where does a head send you?”*

**Interaction:** `stateTap` transitions:

```json
"transitions": [
  { "from": "E0", "on": "T" },
  { "from": "E0", "on": "H" }
]
```

**Correct:**

- `E0` + `T` → `E0` (self-loop)
- `E0` + `H` → `E1` (absorb)

**Feedback copy (correct):** *“Right. A tail changes nothing — you’re still at `∅`. A head finishes the wait. No deeper near-miss state exists; that’s why `H` is the simplest pattern.”*

**Hints:**

1. L1 callback: *“For `HH`, one `H` then `T` reset progress. Here there is only one letter — what can a tail do?”*
2. Level 2: glow the self-loop arc above `∅`.
3. Level 3: reveal targets.

**Contrast panel (DOM, static):** thumbnail L1 `HH` reset edge vs L5 self-loop — *“Overlap memory needs length ≥ 2.”*

---

### Beat 6 — `one-plus-check` · **prediction** · Model · Required

**Prompt:** *“Which equation shape matches **expected waiting time** for the first `H`?”*

**Options (display as equation chips):**

- `E0 = 1 + 1/2 E1 + 1/2 E0` ← correct (duration / hitting time)
- `E0 = 1/2 E1 + 1/2 E0` ← **missing `1+` trap** (L3 callback)
- `P0 = 1/2 P1 + 1/2 P0` ← win-probability shape (L2/L3)
- `E0 = 2` ← answer peeking (meta trap)

**Purpose:** Spaced retrieval of **`1+` flip cost** after L3 explicitly separated duration vs probability recurrences.

> **(review: `prediction` does not grade)** `PredictionBeat` is **ungraded by design** — it accepts any pick and shows a neutral "Good guess!" note (it's the open-bet widget). So a `prediction` beat with a "correct" equation chip will **not** mark right/wrong, run a hint ladder, or catch the missing-`1+` trap. There is **no graded single-select MCQ variant** in the closed schema. Options: (a) accept beat 6 as an *ungraded* reflective pick (fine, but then it's not the "check" the misconceptions table implies), (b) **cut it** (recommended — its job is largely covered by the graded `equationTiles` E0 row), or (c) build a new `mcq` variant (not worth it for one beat). The misconceptions table (§7) should not credit beat 6 with *catching* the error unless (c).

---

### Beat 7 — `equation-tiles` · **equationTiles** · Model · Required

**Prompt:** *“Build the waiting-time system. `E0` is prefilled — you complete the absorbing row.”*

**Rows:**

| lhs | graded | target |
|---|---|---|
| `E0` | false (prefilled) | `1 + 1/2 E1 + 1/2 E0` |
| `E1` | **true** | `0` |

**Bank:** `1`, `0`, `1/2`, `E0`, `E1`, `+`, `=` (no `E2` — intentional simplification vs L1).

**Feedback (correct):** *“Two equations, two states — the smallest system that still needs the `1+` and the coin split.”*

**Note for implementers:** `equationDiagnosis.ts` HH-hardcoding is harmless here (only `E0`,`E1`); still prefer engine-derived hints.

> **(review: grading the wrong row)** As written this beat **prefills the meaningful row (`E0`) and grades the trivial one (`E1 = 0`)** — the learner drags a *single* `0` tile (`fillableCount = 1 + 2·0 = 1`). That's busywork, the opposite of desirable difficulty. The pedagogically valuable construction is `E0 = 1 + ½E1 + ½E0` (the `1+` and the coin split). **Recommendation: grade the `E0` row, prefill `E1 = 0`.** Effort check on the grader: `equationChecker.checkRow` is **fully generic** (needs *zero* change). `equationDiagnosis.ts` is generic too **except** `classifyStateMistake`, which only special-cases the `['E0','E2']` (HH) target — for `H`'s graded `E0` row (states `{E0,E1}`) it **falls through to the generic `wrong-var-generic` hint (no crash)**. So grading `E0` works today with a slightly blunter hint; an *optional* small `['E0','E1']` branch (self-loop vs advance) restores rich per-mistake copy. The shared-context claim that diagnosis "must be generalized" is overstated: it's optional polish, not a blocker.

---

### Beat 8 — `refine-prediction` · **slider** · Model · Required

**Prompt:** *“Lock your guess for `E[H]` before the algebra completes.”*

**Slider:** `min: 1`, `max: 6`, `step: 1` (includes trap `1` and L1-ish `6`).

**Primary action:** `Lock prediction`.

**Stores:** `finalPrediction`, `theoreticalValue: 2` (from engine at lock time).

---

### Beat 9 — `guided-solve` · **substitution** · Prove · Required

**Prompt:** *“Tap through the substitution until `E0` is a number.”*

**Steps (fixture mirrors engine):**

1. `E1 = 0` → `E1 = 0`
2. `E0 = 1 + 1/2 E1 + 1/2 E0` → substitute `E1` → `E0 = 1 + 1/2 E0`
3. Isolate → **`E0 = 2`**

**Feedback:** *“`E[H] = 2`. Substituting the absorbing state leaves a geometric series in disguise: half the time you restart.”*

**Cut line (PRD):** single “Show algebra” reveal → `Continue` (L5 may use this earlier than L1 if needed).

---

### Beat 10 — `theory-vs-sim` · **theorySimChart** · Prove · Required · **signature convergence**

**Prompt:** *“Run simulations. The average flips-to-first-`H` should lock onto 2.”*

**Chart:**

- Theory line at **2** (solid ink).
- Empirical mean of `flipsToAbsorption("H")` (quill blue).
- Prediction marker from beat 8 (`--mark` dashed).

**Primary action:** `Run simulation` (batch 500, same as L1).

**Side annotation (DOM):** *“Same chart as the flagship — now the simplest possible target.”*

> **(review: reuse landmine — chart floor is hardcoded)** `TheorySimChartBeat` is generic (it reads `theory = automaton.expectedTimes[states[0].id]` → **2 automatically**, good). But `SimChart` hardcodes the y-axis floor `yLo = 2` ("the running mean for this lesson never dips below ~2"). With `theory = 2`, `yFor(2) = plotB` — the **theory line renders exactly on the bottom axis** and the ±band around it is clipped to zero height, so the signature "lock onto 2" visual is broken. Fix: add an optional `yLo`/`yFloor` prop to `SimChart` (default `2`) and pass `1` (or `0.5`) for L5. One-param change; no engine touch. (Early empirical means of `Geometric(½)` can also be `1`, which currently clamps to the floor — the same `yLo` fix handles it.)

**Persist:** `empiricalMean`, `simRuns`.

This beat delivers the PRD **signature visual:** first absorption on minimal 2-node graph (inset thumbnail of graph at absorption) + sim convergence to **2**.

---

### Beat 11 — `three-ways-to-two` · **tripletReveal** · Prove · Required · **NEW (lightweight)**

**Prompt:** *“Three lenses, one answer — tap each to expand.”*

**Three expandable cards (DOM accordion, tap-to-open):**

1. **First-step analysis** — `E0 = 1 + 1/2 E0` ⇒ `E0 = 2` (what you just solved).
2. **Overlap shortcut (L4)** — borders of `H`: `{1}` ⇒ `2¹ = 2`.
3. **Geometric / Kac** — `E = 1/p = 2`; long-run `π_H = ½` ⇒ mean gap `1/π_H = 2`.

**Micro-check (graded, one tap):** *“Which fair-coin formula gives 2 for pattern `H`?”* Options: `Σ 2^L`, `i(N−i)`, `7/8` — correct `Σ 2^L`.

**Schema (proposed):**

```ts
| {
    type: "tripletReveal";
    cards: Array<{ title: string; body: string; lessonTag?: string }>;
    microCheck?: { prompt: string; options: string[]; correctIndex: number };
  }
```

**Alternative if schema freeze:** use `overlap` interaction with three static highlights + one `prediction` micro-check beat split — prefer single beat for pacing.

---

### Beat 12 — `recap` · **recap** · Prove · Required

**Prompt:** *“Recap: simplest pattern, full toolkit retrieved.”*

> **(review: `recap` is NOT free reuse)** `RecapBeat` is **hardcoded to the HH-vs-HT story**, almost none of it driven by fixture content: the retrieval question ("why does HH wait longer than HT?") and its three `RECALL` options are **literals in the component**; it derives a `contrastPattern = patternOptions.find(p => p !== pattern)` (for L5 `patternOptions:["H"]` → `undefined`, so the whole contrast/mechanism block disappears); the hero seal says `"HH ≠ HT"` and the verdict renders `E[HH] > E[HT]`; `openingBetNote` matches HH bet strings. Rendered for L5 it would show **nonsensical copy** and an empty mechanism table. The retrieval chips described below (`"Expected flips until first H?" → 2`, etc.) **cannot be authored through the current `RecapBeat`**. This beat needs a *content-driven* generalization (or a new component) — the single biggest chunk of genuinely-new work in L5. See Implementation §Recap.

**RecapBeat content (generate-then-reveal):**

**Retrieval chips (must pick before reveal):**

- “Expected flips until first `H`?” → **2**
- “`E[HH]` from L1?” → **6**
- “Overlap sum for `H`?” → **2¹**

**Hero verdict:** *“One letter, two states, **`E[H] = 2`** — the skeleton behind every pattern wait.”*

**Mechanism rows:**

| Method | Result |
|---|---|
| State recurrence | `E0 = 2` |
| Simulation | `empiricalMean ≈ 2` |
| Overlap sum | `2¹ = 2` |
| Geometric | `1/p = 2` |

**Belief update:** open-hook prediction vs final **2**.

**Next step copy:** *“Next: prove the method transfers — `THH` vs `HTH` without hand-holding.”* → L6.

**Milestone stamp:** `first-pattern-cracked`.

---

## 4. Widget catalog

### Reused (no new build)

| Widget | Beats |
|---|---|
| `prediction` | 1, 6 |
| `coinSim` | 3 |
| `stateTap` | 5 |
| `equationTiles` | 7 |
| `slider` | 8 |
| `substitution` | 9 |
| `theorySimChart` | 10 — *(review: needs `SimChart` `yLo` prop; theory=2 sits on the floor)* |
| `recap` | 12 — *(review: NOT free reuse — `RecapBeat` is HH/HT-hardcoded; needs generalization)* |
| Konva `StateGraph`, `CoinStream`, `SimChart`, `BeatShell`, `FeedbackStrip`, `useHintLadder` | all *(review: `StateGraph` radius capped at 34 → hero needs a size prop; `coinSim` crashes on empty `overlapHighlights`)* |

### New / extended (earned)

| Widget | Beat | Build size | Notes |
|---|---|---|---|
| **RetrievalGrid** | 2 | **medium** (DOM) | Course-path labels as tap targets; reuse tile styling |
| **FirstSuccessTimeline** | 3 | **small** (Konva strip) | Run-length visual; pairs with `flipsToAbsorption` |
| **StateGraph hero (2-node layout)** | 4 | **small** (prop on `StateGraph`) | Larger nodes, wider self-loop arc |
| **TripletReveal** | 11 | **small** (DOM accordion) | Three-lens consolidation; optional micro-check |

**Not building for L5:** `patternPick`, `overlap` side-by-side compare, `bias-sandbox` (L1 extension only per PRD), Penney race widgets, walk board.

---

## 5. Fixture skeleton

```json
{
  "lessonId": "lesson-states-streaks",
  "courseId": "course-pattern-hitting-times",
  "title": "States & Streaks",
  "patternOptions": ["H"],
  "milestoneId": "first-pattern-cracked",
  "unlocks": "lesson-longer-patterns",
  "schemaVersion": 1,
  "beats": [
    { "beatId": "open-hook", "required": true, "...": "..." },
    { "beatId": "course-retrieval", "required": true, "...": "..." },
    { "beatId": "simulate-first-h", "required": true, "...": "..." },
    { "beatId": "minimal-graph-hero", "required": true, "...": "..." },
    { "beatId": "reset-edge", "required": true, "...": "..." },
    { "beatId": "one-plus-check", "required": true, "...": "..." },
    { "beatId": "equation-tiles", "required": true, "...": "..." },
    { "beatId": "refine-prediction", "required": true, "...": "..." },
    { "beatId": "guided-solve", "required": true, "...": "..." },
    { "beatId": "theory-vs-sim", "required": true, "...": "..." },
    { "beatId": "three-ways-to-two", "required": true, "...": "..." },
    { "beatId": "recap", "required": true, "...": "..." }
  ]
}
```

**Authoring checklist:**

- [ ] Add `fixtures/lesson-states-streaks.json` + validate against `LessonSchema`
- [ ] Golden test `E[H]=2` in engine test suite
- [ ] Extend `InteractionSchema` for `retrievalGrid`, `tripletReveal`, `coinSim.overlay` (or implement retrieval/recap-only without schema change — retrieval as multi-row `prediction` fallback)
- [ ] Register beat renderers in `src/lesson/beats/index.tsx`
- [ ] Map phases in `phases.ts` for 12-beat rail
- [ ] Seed Firestore; wire `unlocks` from L4 → L5 → L6
- [ ] Update course card summary: *“Consolidation: first `H`, `E[H]=2`, every method agrees”*

---

## 6. CTA matrix (sticky action bar)

| beatId | Primary | Enabled when |
|---|---|---|
| `open-hook` | `Continue` | option selected |
| `course-retrieval` | `Check` → `Continue` | all rows matched |
| `simulate-first-h` | `Flip` → `Continue` | gate + ≥1 absorption run |
| `minimal-graph-hero` | `Flip once` → `Continue` | saw `T` loop + `H` absorb |
| `reset-edge` | `Check` | both transitions picked |
| `one-plus-check` | `Continue` | option selected |
| `equation-tiles` | `Check` | `E1` row filled |
| `refine-prediction` | `Lock prediction` | slider moved |
| `guided-solve` | `Substitute` / `Continue` | final value shown |
| `theory-vs-sim` | `Run simulation` | always (Continue after ≥1 batch) |
| `three-ways-to-two` | `Check` / `Continue` | micro-check correct or revealed |
| `recap` | `Continue` | always |

`Hint` secondary on graded beats: 2, 5, 6, 7, 11.

---

## 7. Misconceptions targeted

| Misconception | Beat that catches it |
|---|---|
| “First `H` takes 1 flip on average” | 1, 8, 10 |
| “Expected wait = `1/P(pattern in one flip)`” without waiting | 1, 11 |
| Forget **`1+`** in recurrence | 6, 7 |
| Confuse duration vs win-probability recurrence | 6 |
| “Length-1 behaves like length-2 (4 flips)” | 1, 5 |
| “Simulation and theory are flagship-only” | 10 |
| “Overlap sum is only for length ≥ 2” | 11 |

---

## 8. Cut lines

### 12 → 9 Required (moderate slip)

Drop: `course-retrieval` (2), `minimal-graph-hero` (4), `one-plus-check` (6).  
Merge Kac into `recap` mechanism rows.

### 9 → 7 Required (PRD warm-up line)

Keep: `open-hook`, `simulate-first-h`, `reset-edge`, `equation-tiles`, `guided-solve`, `theory-vs-sim`, `recap`.

### 7 → 5 (emergency)

Keep: `open-hook`, `simulate-first-h`, one graded (`equation-tiles` **or** `reset-edge`), `theory-vs-sim`, `recap`.

---

## 9. Analytics & derived fields

Same as flagship where applicable:

- `initialPrediction`, `finalPrediction`, `theoreticalValue: 2`, `empiricalMean`, `simRuns`, `predictionDeltaInitial`
- `beat_viewed`, `answer_submitted`, `simulation_run`, `lesson_completed`, `milestone_earned`

**L5-specific event (optional):** `retrieval_match` on beat 2 with `{ lessonId, correct }`.

---

## 10. Dependencies & risks

| Risk | Mitigation |
|---|---|
| New interaction types delay schema | Implement beat 2 as DOM-only custom beat keyed by `beatId`; beat 11 as `overlap` + `prediction` split |
| `equationDiagnosis` HH-hardcoded | Only `E1` row graded; hints generic |
| Learner boredom (“too easy”) | Beats 2, 6, 11 are **retrieval**, not repetition; copy acknowledges they know the machinery |
| Course summary still says “warm-up first” | Update `fixtures/course-pattern-hitting-times.json` L5 summary when authoring |

---

## 11. Acceptance (manual test)

1. Complete L1–L4 (or dev unlock) → L5 available.
2. Walk 12 beats tap-only; verify trap option 1 on beat 1 is common wrong path with good feedback.
3. `Check` on beat 5: `T`→`∅`, `H`→`H`.
4. Equation row `E1 = 0` passes.
5. Substitution yields **2**.
6. Simulation mean → **2**; theory line at 2.
7. Recap shows retrieval + milestone `first-pattern-cracked`.
8. L6 unlocks.

---

## 12. Summary table

| # | beatId | type | Phase | New? |
|---|---|---|---|---|
| 1 | `open-hook` | prediction | Bet | |
| 2 | `course-retrieval` | retrievalGrid | Bet | **NEW** |
| 3 | `simulate-first-h` | coinSim + timeline | Explore | **NEW overlay** |
| 4 | `minimal-graph-hero` | stateGraph hero | Explore | **NEW layout** |
| 5 | `reset-edge` | stateTap | Model | |
| 6 | `one-plus-check` | prediction | Model | |
| 7 | `equation-tiles` | equationTiles | Model | |
| 8 | `refine-prediction` | slider | Model | |
| 9 | `guided-solve` | substitution | Prove | |
| 10 | `theory-vs-sim` | theorySimChart | Prove | |
| 11 | `three-ways-to-two` | tripletReveal | Prove | **NEW** |
| 12 | `recap` | recap | Prove | |

**Engine headline:** `buildAutomaton("H", 0.5)` → **`E[H] = 2`**.  
**Pedagogy headline:** Simplest absorbing chain + spaced retrieval of L1–L4 + three paths to the same **2**.

---

## Plan assessment (Opus 4.8 review)

### Verdict: **Solid-with-fixes**

The math is correct, the engine reuse is real (genuinely ~zero new engine), and the "every tool collapses to 2" spine is a strong idea. But the plan over-claims reuse on three widgets that are *not* drop-ins (`coinSim` crashes on `H`, `SimChart` floor collapses `theory=2`, `RecapBeat` is HH/HT-hardcoded), is **over-scoped at 12 beats** for the simplest case, and **mis-assigns grading** (grades the trivial `E1=0` row; uses ungraded `prediction` as a "check"). Fix those and it's a genuinely good lesson; ship the 7-beat core, not the 12.

### Pedagogy notes

**Placement — EARLY vs LATE (the real question).** Pedagogically, the *simplest case is stronger EARLY*: the 2-state absorbing chain (`∅→H`, one number, no near-miss) is the natural **first** worked instance of the `(I−Q)t=1` method. The course currently teaches the *harder* case first (HH, 3 states, reset edge) as the flagship — that's a heavier cognitive entry point than necessary. The clean "simplest example → fade to complexity" progression would be **H → HH → HT → …**.

However, **L1 (HH) is already BUILT as the flagship**, and re-sequencing is a large, risky change. So **L5-as-consolidation is the pragmatic call** — *conditional* on it earning its place. My recommendation: keep L5 late, but make its reason-to-exist the two things that are genuinely *new* even to a learner who finished L1–L4:
1. **Multi-lens convergence** — the same `2` from first-step, geometric `1/p`, and overlap `Σ2^L` (this is the payload; do not cut `tripletReveal`).
2. **The no-overlap baseline** — `H` is the one pattern with *no* near-miss reset (`overlapHighlights = []`); beat 5's contrast against HH's reset edge is the conceptual anchor.
If a re-sequence ever becomes viable, teach **H before HH**.

**"Victory-lap" risk — real, and the plan partly walks into it.** The trivial derivation (`½E0=1 ⇒ 2`) carries no new challenge. The plan's mitigation (spaced retrieval) is right in spirit but two beats turn it into *busywork*: grading a single `0` tile (beat 7) and an ungraded "check" (beat 6). Desirable difficulty here = **retrieval + convergence + contrast**, not re-deriving an obvious number. Cut the filler; lean on the trio and the contrast.

**Retrieval grid — keep, but make it diagnostic.** Matching `6/4/7:8/i(N−i)/Σ2^L` → lessons is good *spaced retrieval* and sets up "…and now the simplest one." It avoids busywork **iff** the wrong-match hint teaches (glow the right course card + one-line "why"), which the plan does. Keep it (or fold to the recap if cutting hard).

**Kac — keep as a footnote, not a fourth road.** `1/π_H = 2` is correct, but it's a *recurrence-time* statement that equals the *hitting time* only by memorylessness (see inline review at §2). As a co-equal lens it risks "hitting = recurrence always," which L6 must then undo. Demote to a one-line teaser in the geometric card.

### Verified-math table (three roads to 2)

| Derivation | Statement | Value | Verdict |
|---|---|---|---|
| **First-step analysis** | `E0 = 1 + ½E1 + ½E0`, `E1 = 0` ⇒ `½E0 = 1` | **2** | ✓ engine `expectedTimes.E0 === 2` + algebra |
| **Geometric `1/p`** | `Σ_{k≥1} k(½)^k = (½)/(¼)`; `1/p = 1/½` | **2** | ✓ series → `2.000000` |
| **Overlap `Σ2^L`** | self-overlaps of `"H"` = `{1}` ⇒ `2¹` | **2** | ✓ engine-consistent (`HH=2²+2¹=6`, `HT=2²=4`) |
| **Kac `1/π_H`** | `π_H = ½` ⇒ `1/π_H` | **2** | ✓ *value*; ✗ as literal "= first-hitting time" w/o memoryless caveat |
| **Monte Carlo** | `mulberry32`, 200k runs | **≈1.9988** | ✓ |

*(Terminology nit, inline-tagged: "borders of `H` = {1}" uses the **inclusive** self-overlap convention — the full-length overlap `k=L=1` — not "proper borders" (`H` has none). Internally consistent with the engine; just say "self-overlap lengths" to avoid confusion.)*

### Scope / cut-line — ship **7**, not 12

12 beats for `E[H]=2` is too many. Recommended **7-beat core** (tighter than the plan's §8 "7", which drops the convergence payload):

| # | beatId | type | why it stays |
|---|---|---|---|
| 1 | `open-hook` | `prediction` | the "1 vs 2" trap is the hook |
| 2 | `course-retrieval` | `retrievalGrid` | spaced retrieval = the lesson's identity |
| 3 | `simulate-first-h` | `coinSim` (+ hero graph + timeline) | merge old beat 4 in; one explore screen |
| 4 | `reset-edge` | `stateTap` | **the new idea** — `H` has no reset |
| 5 | `equation-tiles` *or* `guided-solve` | `equationTiles`/`substitution` | **one** algebra beat (grade `E0`), not both |
| 6 | `three-ways-to-two` | `tripletReveal` | **the consolidation payload** |
| 7 | `recap` | `recap` (generalized) | retrieval + milestone |

**Cut for the 7:** beat 6 `one-plus-check` (ungraded), beat 8 `refine-prediction` (slider adds little when the answer is "obviously small"), and **one** of `equation-tiles`/`guided-solve` (redundant). `theory-vs-sim` is optional in the 7 — it's the signature visual but needs the `SimChart` fix; keep it if the fix lands, else it's the first thing to drop.

### Beat-by-beat flags

| Beat | Flag |
|---|---|
| 1 `open-hook` | ✅ clean `prediction` reuse (ungraded is correct for a bet). |
| 2 `course-retrieval` | 🆕 new variant; give exact Zod (below). Good retrieval. |
| 3 `simulate-first-h` | ⛔ **`coinSim` crashes on `H`** (empty `overlapHighlights`) — needs a guard. Timeline ≠ a flag (needs run-tracking). Merge beat 4 here. |
| 4 `minimal-graph-hero` | ⚠️ no `layout` prop; radius capped at 34. Merge into beat 3. |
| 5 `reset-edge` | ✅ `stateTap` is fully generic; works for `H` as-is. Keep — it's the core. |
| 6 `one-plus-check` | ⚠️ `prediction` doesn't grade. Cut (or accept as reflection). |
| 7 `equation-tiles` | ⚠️ grades the trivial `E1=0`. **Grade `E0` instead.** Grader is generic. |
| 8 `refine-prediction` | ✅ generic; auto-stores `theoreticalValue:2`. Low value — cut candidate. |
| 9 `guided-solve` | ✅ `substitution` generic; engine steps end on `2`. Redundant with 7 — keep one. |
| 10 `theory-vs-sim` | ⚠️ `SimChart yLo=2` collapses `theory=2` onto the axis — needs a `yLo` prop. |
| 11 `three-ways-to-two` | 🆕 new variant; the payload. `microCheck` must be graded *in-component* (no MCQ type). |
| 12 `recap` | ⛔ `RecapBeat` is HH/HT-hardcoded — needs content-driven generalization. |

### Prioritized recommended changes

1. **Cut 12 → 7** (drop `one-plus-check`, `refine-prediction`, and one algebra beat; merge hero graph into `simulate`).
2. **Grade the `E0` row**, not `E1=0` (real construction; grader already supports it).
3. **Fix the 3 reuse landmines**: `coinSim` empty-`overlapHighlights` guard, `SimChart` `yLo` prop, `RecapBeat` generalization.
4. **Demote Kac** to a footnote; canonical trio = first-step / geometric / overlap.
5. **Resolve the graded-MCQ gap**: fold beat 11's micro-check grading into the new `tripletReveal` component; don't rely on `prediction` for checks.
6. Confirm **`phases.ts`** is made per-lesson (shared-infra blocker).

---

## Implementation in the tech stack

Verified against source on 2026-06-23. Headline: **the engine is free** (`buildAutomaton("H",0.5)` already yields the 2-state machine, `E0=2`, the recurrences, and the substitution steps — `LessonPlayer` builds it automatically from `patternOptions[0]`). The cost is in **a handful of small UI generalizations** + **2 new variants**, not new math.

### retrievalGrid (beat 2) — **NEW variant**, DOM

Matching has no existing analog (`prediction` is single-select-one-list), so a new variant is the clean path. Refined Zod (drop the per-row `lessonLabels` duplication; share one pool, shuffle in-component):

```ts
z.object({
  type: z.literal('retrievalGrid'),
  lessons: z.array(z.object({ id: z.string(), label: z.string() })), // shared tap-target pool
  rows: z.array(z.object({
    id: z.string(),
    value: z.string(),            // "6", "4", "7/8", "i(N−i)", "Σ 2^L"
    correctLessonId: z.string(),  // must equal one lessons[].id
  })),
  ghostRows: z.array(z.object({ value: z.string(), caption: z.string() })).optional(),
})
```

- **Component** `RetrievalGridBeat`: DOM only (no Konva). One `<fieldset>`/`role="radiogroup"` per row, lesson chips as `role="radio"`, 44px targets. Grade with `picks[rowId] === row.correctLessonId`; wrong → glow the matching course card + a one-line "why" (reuse the `chip--wrong`/`chip--correct` classes from `RecapBeat`/`StateTapBeat`). Ghost row renders disabled with its caption.
- **Wiring:** `case 'retrievalGrid': return <RetrievalGridBeat {...props} />` in `beats/index.tsx`.
- **a11y / reduced-motion / tap:** radiogroup semantics; `role="status"` for "n of m matched"; correctness via class, not motion. Fully tap-completable.
- **Effort: medium. Risk: low** (self-contained, no engine).

### FirstSuccessTimeline + coinSim (beat 3) — **enhanced beat (+1 guard) + small sub-widget**

Two separate facts the plan conflates:
1. **`coinSim` is not a drop-in.** `CoinSimBeat.startReplay()` reads `automaton.overlapHighlights[0].on`; `H`'s is `[]` → **`TypeError` on the post-gate `Continue`.** Add a guard:
   ```ts
   if (automaton.overlapHighlights.length === 0) { onAdvance(); return } // no near-miss to replay
   ```
2. **The timeline is not an `overlay` flag.** `CoinSimBeat` resets to `E0` after absorption and runs one continuous stream — no per-run segmentation. `FirstSuccessTimeline` needs new state: track `runLengths: number[]`, reset a per-run counter when the stream hits the absorbing state.

- **Render (lightest): DOM strip**, not Konva — append below the existing `CoinStream`: hollow `T` ticks, gold `H` tick (`C.mark`) freezes the run; a small DOM batch-mean readout (drifting to 2) in `role="status"`. (A Konva strip is possible but DOM keeps it tap/a11y-trivial and avoids a second `'use no memo'` stage.)
- **Schema:** *optional* — either add `overlay: z.enum(['firstSuccessTimeline']).optional()` to the `coinSim` variant (additive, non-breaking) **or** route by `beatId` in `CoinSimBeat` with no schema change (preferred — lighter).
- **Hero 2-node graph (old beat 4) folds in here.** See next.
- **Engine:** `flipsToAbsorption(automaton)` per run (already used by `TheorySimChartBeat`), `nextStateOf` for the graph.
- **Effort: small–medium. Risk: medium** (the crash guard is mandatory; run-tracking is new but local).

### StateGraph heroTwoNode (beat 4 → merged into beat 3) — **enhanced rendering**, Konva

Not a new engine and not a `layout` string. `StateGraph` radius is **capped**: `Math.min(34, Math.max(22, width/(n*3)))`. To enlarge the 2 nodes, add optional size props (default-preserving):

```ts
// StateGraph props (additive)
maxRadius?: number   // default 34
labelScale?: number  // default 1
// radius = Math.min(maxRadius, Math.max(22, width/(n*3)))
```

Beat 3 (now the explore screen) mounts the graph already in `CoinSimBeat`; pass `maxRadius={56}` for hero emphasis. The self-loop arc and absorbing double-ring already scale off `radius`, so they enlarge for free. **No schema change.** Exit gate: enable `Continue` after the learner has seen one `T` self-loop *and* one `H` absorption (already derivable from `sawChange` + reaching the absorbing state). **Effort: small. Risk: low.**

### tripletReveal (beat 11) — **NEW variant**, DOM

No existing variant fits (it's accordion + a graded micro-check; `recap` is hardcoded, `overlap` renders a graph). Exact Zod:

```ts
z.object({
  type: z.literal('tripletReveal'),
  cards: z.array(z.object({
    title: z.string(),                 // "First-step analysis", "Overlap shortcut (L4)", "Geometric (1/p)"
    body: z.string(),
    lessonTag: z.string().optional(),  // e.g. "L4"
  })),
  microCheck: z.object({
    prompt: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number().int(),    // graded IN this component (no MCQ variant exists)
  }).optional(),
})
```

- **Component** `TripletRevealBeat`: DOM accordion (`<details>`/`<button aria-expanded>`), tap-to-open, no Konva. The `microCheck` is the **only graded element in L5 that isn't `stateTap`/`equationTiles`** — grade it here against `correctIndex` (this also absorbs beat 6's intent, removing the need for a graded-MCQ variant). Keep Kac as a sub-line in the geometric card per the math review.
- **a11y / reduced-motion / tap:** native disclosure semantics; reduced-motion → cards render expanded (or expand without transition); `role="status"` for the check verdict. Tap-only.
- **Effort: small–medium. Risk: low.**

### theorySimChart (beat 10) — **enhanced rendering** (1 prop), Konva

`TheorySimChartBeat` is generic — `theory = automaton.expectedTimes[states[0].id]` → **2 automatically**. The only fix is in `SimChart`: the floor `yLo = 2` is hardcoded, so `theory=2` lands on `plotB` and the convergence band is clipped. Add a prop:

```ts
// SimChart props (additive)
yLo?: number  // default 2
// then: const lo = yLo ?? 2  (use lo wherever yLo is used today)
```

`TheorySimChartBeat` passes `yLo={1}` for L5 (covers early `Geometric(½)` means of 1, too). **No engine touch. Effort: tiny. Risk: low.**

### recap (beat 12) — **generalization required** (biggest new work)

`RecapBeat` hardcodes the HH-vs-HT story (literal `RECALL` options, `"HH ≠ HT"` seal, `E[HH] > E[HT]` verdict, `openingBetNote` HH strings) and assumes a `contrastPattern`. For single-pattern `H` it renders nonsense + an empty mechanism table. Lightest non-destabilizing path (keeps `recap` as one type, doesn't touch the flagship's behavior):

```ts
// recap variant (additive optional fields)
z.object({
  type: z.literal('recap'),
  retrieval: z.object({
    prompt: z.string(),
    options: z.array(z.object({
      label: z.string(), correct: z.boolean(), why: z.string().optional(),
    })),
  }).optional(),
  hero: z.object({ seal: z.string(), principle: z.string() }).optional(),
})
```

In `RecapBeat`: if `interaction.retrieval` present, render it (else fall back to the current hardcoded `RECALL` — flagship unchanged); **guard the contrast/mechanism block on `contrastPattern !== undefined`** so single-pattern lessons skip it; source the seal/verdict from `interaction.hero` when present. The mechanism rows for `H` are naturally empty (the absorbing `E1` has no outgoing edge, so `e1Memory` returns `null`) — show the multi-method "every road = 2" rows instead. **Effort: medium. Risk: medium** (touches a built, flagship-critical component — gate behind the optional fields so L1 is byte-for-byte unchanged).

### Schema & engine changes (consolidated)

**Engine — essentially free.** Add a golden test to `src/engine/automaton.test.ts` (slots into the existing `describe('buildAutomaton — golden expected times…')`):

```ts
it('E[H] = 2', () => {
  expect(buildAutomaton('H', 0.5).expectedTimes.E0).toBe(2)
})
// optional shape lock:
// expect(buildAutomaton('H',0.5).recurrences.E0).toEqual({
//   lhs:'E0', constant:1, terms:[{coeff:{n:1,d:2},var:'E1'},{coeff:{n:1,d:2},var:'E0'}] })
```

**Schema (`src/content/schema.ts`)** — append two variants to the closed `InteractionSchema` union (`retrievalGrid`, `tripletReveal` as above), plus the additive optional fields on `coinSim` (`overlay?`, optional — or skip and route by `beatId`) and `recap` (`retrieval?`, `hero?`). All additive; existing fixtures stay valid. New `type`s need a `case` in `beats/index.tsx` (the `default` only renders a stub).

**`equationDiagnosis.ts` generalization — optional, not a blocker.** The grader `equationChecker.checkRow` is fully generic (zero change). `diagnoseRow`/`selectMistake` are generic; only `classifyStateMistake` special-cases `['E0','E2']` (HH). If you grade `H`'s `E0` row (states `{E0,E1}`), it falls through to `wrong-var-generic` (works, blunter hint). For rich hints, add one branch:

```ts
if (multisetEq([...targetStates].sort(), ['E0','E1'])) {
  // H's E0 row: T self-loops at E0, H advances to E1
  if (allAre('E1')) return 'both-goal'        // both branches "finish"
  if (allAre('E0')) return 'both-self-loop'   // both "nothing changes"
  // (reuse existing MISTAKE_HINTS copy)
}
```

**`validate-fixtures.ts`** currently hardcodes the flagship + `buildAutomaton('HH')`. Generalize the cross-check to also cover `lesson-states-streaks.json` with `buildAutomaton('H')` (or loop over `[{file, pattern}]` and derive `pattern = lesson.patternOptions[0]`). **Author the `target` objects in engine key order `{lhs, constant, terms}`** — the check is `JSON.stringify(expected) !== JSON.stringify(row.target)` (order-sensitive). For `H`: `E0 → {lhs:'E0',constant:1,terms:[{coeff:{n:1,d:2},var:'E1'},{coeff:{n:1,d:2},var:'E0'}]}`, `E1 → {lhs:'E1',constant:0,terms:[]}`.

### Risks & open questions

| Risk / question | Severity | Note |
|---|---|---|
| **`phases.ts` is a flagship singleton; `phaseOf` throws on unknown beatIds** | **Blocker** | `LessonPlayer` renders `PhaseRail` for every lesson → L5 throws on first render. Must be per-lesson (keyed by `lessonId` or fixture-driven). Cross-cutting (L2–L6), likely shared infra — but a hard dependency. |
| **`coinSim` crash on empty `overlapHighlights`** | High | Sharpest L5-specific landmine; one-line guard. |
| **`RecapBeat` HH/HT hardcoding** | High | Biggest chunk of new work; gate generalization behind optional fields so L1 is unchanged. |
| **No graded single-select MCQ** | Medium | Resolve by grading `tripletReveal.microCheck` in-component; cut `one-plus-check`. |
| **`SimChart yLo=2` floor** | Medium | One prop; needed for the signature convergence visual. |
| **`StateGraph` radius cap (34)** | Low | One optional prop for the hero graph. |
| Dev/seed path to *play* L5 | Medium | `LessonPlayer` dev route uses `loadFlagshipLesson()`; need a route param or Firestore seed (`scripts/seed-firestore.ts`) to exercise `lesson-states-streaks.json`. Out of content scope but required to test. |
| `stateTapHints.ts` copy for the no-reset `H` case | Low | Automaton-driven; sanity-check the level-2/3 strings read sensibly when there's no reset edge. |
| Course node summary | Low | Update `fixtures/course-pattern-hitting-times.json` L5 node to the consolidation framing. |

**Reuse vs new (headline):** of the 10 interaction types, **6 are clean reuse** for L5 (`prediction`, `stateTap`, `equationTiles`, `slider`, `substitution`, and `coinSim` *with a 1-line guard*); **1 reused-but-must-generalize** (`recap`); **2 brand-new variants** (`retrievalGrid`, `tripletReveal`); plus **3 tiny supporting tweaks** (`SimChart yLo`, `StateGraph maxRadius`, `phases` per-lesson) and **1 new DOM sub-widget** (`FirstSuccessTimeline`). **Engine cost ≈ one test line.** The lesson is mostly assembly + three small generalizations — provided the three landmines above are fixed first.
