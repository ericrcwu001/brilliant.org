# L1 Inclusive Redesign — implementation change spec

**Audience:** a future coding agent (or engineer) who will modify the **already-built flagship
lesson** so it works for a next-to-zero-foundation learner without regressing the experience for the
advanced "quant" learner. This is a *what-to-change* spec, not a narrative; apply it surgically and
keep every change behind the two-track gate so Track B (the current path) is byte-for-byte unchanged
unless noted.

**Why this exists.** `docs/proposed-lessons.md` was rewritten for inclusivity and covers the course
(L0–L6) and the cross-cutting system. L1 is *built*, so its changes need code-level detail. The
learning-science basis is `audits/ideation/inclusive-research-{1..5}-*.md`; this spec is the
operational distillation for L1 only.

**Golden rule:** **no engine math changes.** `buildAutomaton` already returns everything needed,
including both the symbolic `id` (`E0`) and the concrete `label` (`∅/H/HH`) per state, and the `H`
case (`buildAutomaton("H", 0.5).expectedTimes.E0 === 2`) for the L0 on-ramp. Every change below is
content (fixture copy), presentation (components), or schema/infra — not math.

---

## 1. Files in scope

| File | Role | Change class |
|---|---|---|
| `fixtures/lesson-pattern-hitting-times.json` | the L1 lesson content (11 beats) | **copy + beat structure** (most changes) |
| `src/content/schema.ts` | Zod contracts: `InteractionSchema` (closed union), `FeedbackSchema`, `BeatSchema` | **schema additions** (new beat types, `byOption` feedback, optional `track`/`density`/collapsible) |
| `src/lesson/beats/index.tsx` | `BeatView` dispatcher (switch on `interaction.type`) | add cases for new beat types |
| `src/lesson/beats/PredictionBeat.tsx` | the bet; currently **ungraded, same note for every pick** (lines 31–34) | **per-option feedback** |
| `src/lesson/beats/EquationTilesBeat.tsx` | tile builder; HH-hardcoded copy (`E0_WORKED_EXPLANATION`, `STATE_LEGEND`, `TOKEN_TIPS`), simultaneous chrome | **de-hardcode + staged fade + reduce chrome + dyna-link** |
| `src/lesson/beats/CoinSimBeat.tsx` | the `simulate` hero (stream + chip + 3-node graph + replay) | **segment / single-step (Track A)** |
| `src/lesson/konva/StateGraph.tsx` | node render; labels nodes `∅/H/HH` only (Text block ~line 214) | **dual-label (`∅` + `E0`) + dyna-link edge highlight** |
| `src/lesson/beats/RecapBeat.tsx` | recap; HH/HT-hardcoded | **belief-update + attribute the win** |
| `src/lesson/beats/StateTapBeat.tsx` | `failure-edge`; `byPattern` feedback (already good) | prompt copy only |
| `src/lesson/beats/SubstitutionBeat.tsx` | `guided-solve` stepper | step/hint copy only |
| `src/lesson/feedback.ts`, `hintLadder.ts` | `resolveFeedback`, hint ladder, `needsReview` | extend for `byOption`; persist hint **high-water mark** |
| `src/lesson/equationDiagnosis.ts` | per-slot grader; **HH-hardcoded copy** | **de-hardcode (blocker for any non-HH reuse)** |
| `scripts/validate-fixtures.ts` | fixture/engine cross-check | extend if new interaction types added |
| (new) `fixtures/lesson-first-heads.json` | the L0 on-ramp (`H`, `E[H]=2`) | new fixture (see `docs/proposed-lessons.md` §3) |
| (new) `src/lesson/beats/PrimerBeat.tsx` (+ `McqBeat.tsx`) | JIT primer micro-interactions + graded recall | new components |

---

## 2. Design constraints (do not violate)

1. **No AI** (Phase-1). All feedback/primers are hand-authored and computed client-side from the
   engine.
2. **Tap-only + reduced-motion completable.** Every new beat/primer must have a tap path and a
   reduced-motion path (existing codebase convention; the e2e suite asserts both).
3. **Track B unchanged.** A learner routed to Track B (the current experience) must see the present
   beats at the present density, primers collapsed, no new required beats. Inclusivity is *additive
   and skippable* for them.
4. **Golden tests stay green:** `E[HH]=6, E[HT]=4` (and `E[H]=2` once L0 lands). The
   `validate-fixtures` engine↔tile cross-check must still pass.
5. **Surgical.** Touch only what each item lists; do not refactor adjacent code or "improve"
   unrelated beats.

---

## 3. Schema / infra prerequisites (do these first)

These unblock everything else. `InteractionSchema` and `FeedbackSchema` are **closed discriminated
unions** (`src/content/schema.ts`), so every new widget/feedback shape is an explicit union member +
a `BeatView` dispatcher case (new types currently fall through to `ContinueStub`).

### 3.1 Per-option feedback (`Feedback.byOption`)
Today `FeedbackSchema = FeedbackTriple | { byPattern }`. Add a third variant so a `prediction` beat
can refute the *specific* pick:

```ts
// schema.ts — add to FeedbackSchema union
z.object({
  byOption: z.record(           // keyed by the exact option string
    z.string(),
    z.object({ note: z.string(), correct: z.boolean().optional() }),
  ),
  hints: HintTripleSchema.optional(),
})
```
- `resolveFeedback` (in `feedback.ts`) gains a `selectedOption` arg; `PredictionBeat` passes the
  chosen option and renders `byOption[selected].note` (and a correct/incorrect affordance if
  `correct` is set). Keep backward-compat: existing triple/`byPattern` feedback still works.

### 3.2 New beat types: `primer` and `mcq`
```ts
// InteractionSchema — add members
z.object({ type: z.literal('primer'),
  // a tiny tap/drag micro-interaction; never graded, never required
  variant: z.enum(['half', 'average', 'state', 'exponent', 'transitivity', 'custom']),
  body: z.string(),                 // one-line plain-language explainer
  collapsible: z.boolean().optional(), // default true on Track B
}),
z.object({ type: z.literal('mcq'),  // GRADED single-select for retrieval/diagnostic
  options: z.array(z.object({ id: z.string(), label: z.string(), correct: z.boolean() })),
}),
```
- Add `PrimerBeat` and `McqBeat` to `beats/index.tsx`. `primer` beats must be `required: false` and
  must never set `needsReview`. `mcq` is the graded recall variant the retrieval openers and the
  diagnostic pre-check need (`prediction` is ungraded by design and cannot grade).

### 3.3 Two-track flags
```ts
// BeatSchema — additions (all optional, default = current behavior)
track: z.enum(['A', 'B', 'both']).optional(),     // which track renders this beat (default 'both')
density: z.enum(['split', 'merged']).optional(),  // CoinSim/EquationTiles render mode by track
```
- A `track: 'A' | 'B'` value lives on the user/progress doc (set by the diagnostic). The lesson
  renderer (`LessonPlayer`) filters/branches beats by `track` and chooses `density`. Default
  (no flag) = `both`/`merged` = today's behavior.

### 3.4 Hint high-water mark (for the mastery signal)
`onCorrect` currently resets the hint level to 0, so the snapshot can't tell whether a learner *ever*
needed a reveal. Persist `maxHintLevelByBeat` (a high-water mark) alongside `hintLevelByBeat` in the
snapshot. This is the input to the light per-lesson mastery signal (§9) and to L5's `transferAttained`.

> **Decision for the human:** if branching/diagnostic is out of scope for the gate, ship inclusivity
> as *always-on, dismissible* primers (drop the `track` flag; make all primers `collapsible: true`
> for everyone). The per-beat copy changes (§4) and component fixes (§5) are valuable either way.

---

## 4. Per-beat changes to `fixtures/lesson-pattern-hitting-times.json`

Before→after copy is drawn from the motivation/representation/prerequisite memos. Math/values are
unchanged in every case; only words, options, hints, and (where noted) beat structure change.

### 4.0 (new) primer beats — insert, Track-A default-expanded / Track-B collapsed
Insert a primer trio so the prerequisites are named **before** they bite. Cheapest placement:
**repurpose the near-empty `pattern-pick` beat** (a passive confirm) into the primer host, or insert
before `open-bet`:
- `primer:half` — "½ means 1 in 2" (two-tap mini-interaction).
- `primer:average` — "'on average' = if you did this many times, the typical count — we'll prove it
  by simulating."
- `primer:state` — "a 'state' = how much of the pattern you've matched so far: none, one H, done."

### 4.1 `open-bet` (prediction)
- **Add `byOption` feedback** (§3.1) to refute each pick:
  - "They tie — both take 4 flips on average" → *"This is the natural guess — but length isn't the
    whole story. A near-miss costs HH and HT differently, and that gap is exactly what we'll find."*
    (`correct:false`)
  - "Waiting for HH takes longer" → *"Good instinct — we'll prove HH takes longer and pin down by
    exactly how much."* (`correct:true`)
  - "Waiting for HT takes longer" → *"Let's test it — watch which near-miss throws your progress
    away."* (`correct:false`)
- **Prompt:** keep the bet, but drop "and by how much?" from the first ask (it adds a second
  quantity); reintroduce "how much" at `refine-prediction` where a number is wanted. Gloss for
  no-EV learners: *"You flip a fair coin over and over until HH shows up, and count the flips. Do it
  again for HT. On average, which one makes you wait longer?"*
- **Soften** hint[1]: "Most people pick the tie — it's the natural guess. Here's the thing to watch:
  both are length 2, but a near-miss doesn't cost the same for each." (drop "the trap").
- **Keep** hint[0] verbatim ("There's no wrong guess yet…") — it's the best low-stakes line in the
  corpus.

### 4.2 `pattern-pick` (patternPick)
- Repurpose into the primer host (§4.0) **or** keep + add one plain line defining "pattern". Low
  prerequisite value as-is.

### 4.3 `simulate` (coinSim)
- **Track A: split into 2–3 micro-beats** via `density:'split'` (§3.3): (a) flip & watch the stream
  only; (b) meet the 3-node graph + active chip; (c) the scripted near-miss replay that gates
  `failure-edge`. **Track B keeps the single merged beat.**
- **Add a gambler's-fallacy refutation** the first time a run of ≥3 same-face appears: a one-time
  `aria-live` note — *"A long streak feels 'due' to break, but each flip is independent — the coin
  has no memory."* (`CoinSimBeat` detects the run; copy in fixture.)
- **Reframe** the prompt away from "guess the next flip" toward "we're measuring *how long*,
  repeatedly": "Flip the coin and watch the **state** chip — does a tail throw your progress away?"
- Apply segmenting/signaling: single-step + pause; during the replay, dim the stream/chart so the
  graph edge is the only moving thing (§5.4).

### 4.4 (new) `name-the-overlap` — insert between `failure-edge` and `equation-tiles` (Track-A, skippable)
A short ungraded "what just happened" micro-beat so the beginner has a words+picture model before
symbols: *"A tail after one H throws HH all the way back, but for HT an extra H keeps your progress.
Hold that thought — now we'll put a number on it."* The deep `overlap` reveal (beat 9) stays where it
is (post-solve punchline; preserves productive-failure ordering).

### 4.5 `failure-edge` (stateTap)
- **Prompt:** "You've got **one H** so far. The next flip is the make-or-break moment. On the diagram,
  where does your progress go?" (drop "the state machine"/"near-miss").
- Show a **worked instance** of one near-miss animated and labeled *before* the tap (worked→completion).
- Keep the excellent `byPattern` correct/hints as-is. Add a plain gloss for `E1`/`E0` on first
  appearance ("`E1` = you've matched one H").

### 4.6 `equation-tiles` (equationTiles) — highest-leverage
- **Pretrain the variable idea** (a collapsed `primer` card before the beat): "`E0` is a number we
  don't know yet — the average flips left from the start. It can appear on **both sides** because
  after a tail you're *back at the start* — like `x = 1 + ½x`."
- **Prompt before→after:** "Here's the equation for E0, worked out. Build E1 the same way: every flip
  costs 1, then split by the coin." → "Here's the finished equation for the **start state (E0)** — we
  did this one for you. Build the **next state (E1)** the same way: every flip costs **1 flip**, and
  then the coin sends you to one of two places, **half the time to each**. Tap the pieces into the
  slots."
- **Correct before→after:** "That's the system. The 1/2 E0 term in E1 is HH's penalty…" → "That's the
  whole setup. See the **½·E0** piece in the E1 line? That's HH's catch: one wrong flip sends you *all
  the way back to the start* — which is exactly why HH takes longer." (drop "the system"/"penalty").
- **Stage the recurrence** (Track A): present `E0` as a one-flip story assembled in steps (`1+` →
  first branch `½E1` → second branch `½E0`), not one static template. Add a backward-faded middle rung
  where the learner completes only the **last term** (`½E0`) with the rest pre-filled, then a
  self-explanation prompt ("Why does the tail term point at E0 and not E1?").
- **Reduce simultaneous chrome:** show the worked `E0` row first, alone; reveal the legend/build
  row/tooltips on a tap ("Now your turn"). Drop the triple-encoded "E2 = 0" (legend + tooltip + static
  note).

### 4.7 `refine-prediction` (slider)
- Add a one-line reminder of what the number means; ensure the "average of many runs" grounding
  (§5.5) has happened *before* this beat.

### 4.8 `guided-solve` (substitution) — plain-language the algebra
- **Prompt:** "Tap through the steps to find **E0 — the average number of flips until HH**. Each step
  plugs a value we already know into the next line."
- **Hints before→after** (values identical):
  - "Start from the absorbing state E2 = 0 and work backward." → "Start with the part you already
    know: once you've *seen* HH, you're done — so its wait is **0**. Build out from there."
  - "Substitute E2 into E1…" → "Drop that **0** into the E1 line to get a number for E1. Then drop
    E1's number into the E0 line."
  - "Solving 1/2 E0 = 3 gives E0 = 6." → "E1 works out to **4**. Put it into E0 = 1 + ½·E1 + ½·E0; the
    two ½·E0 pieces combine, and you get **E0 = 6 — about 6 flips, on average, to see HH**."
- Keep the PRD "Show algebra" cut-line as the **Track-B / expert** collapsed fast-path.

### 4.9 `theory-vs-sim` (theorySimChart)
- Add "average ≠ typical": "6 is the *average* — most runs are shorter, a few are long." Add
  anti-gambler's-fallacy: "more trials = steadier, not 'due'." Gloss "empirical mean" once.

### 4.10 `overlap` (overlap) — make it a comparison
- Turn the narration into an action: show both mini-graphs and ask the learner to **tap which
  near-miss keeps progress** and **which throws it away**, then reveal the 2-flip consequence
  (`stateTap`-style grading on the two highlighted edges; reuse existing infra). Keep the `Σ2^i`
  expert note collapsed.

### 4.11 `recap` (recap)
- **Belief update:** re-present the original `open-bet` choice ("you said *tie*; it's 6 vs 4 — here's
  why") to exploit hypercorrection.
- **Attribute the win:** "Look what you just did: you turned a coin question into a little machine,
  built its equations, and **proved** HH takes ~6 flips while HT takes 4 — **by hand**. That's the
  exact method professionals use."

---

## 5. Component / engine changes

### 5.1 `PredictionBeat.tsx` — per-option feedback
Lines 31–34 currently render the same `{ kind:'note', text: fb.hints[2], label:'Good guess!' }` for
*every* selection. Branch on `selected` using the new `byOption` feedback (§3.1): render the matched
option's `note`, and an encouraging correct/incorrect affordance when `correct` is set. Preserve the
"Just a guess — there's no wrong answer here" caption for the *idle* state.

### 5.2 `StateGraph.tsx` — dual-label + dyna-link
- **Dual-label:** the node `Text` block (~line 214) renders only `s.label` (`∅/H/HH`). Add an optional
  secondary line showing the `E`-id, or a mode prop that renders `E0` beneath `∅`. The `Automaton`
  data already carries both `id` and `label` — **render-only**, no engine change.
- **Dyna-link:** accept a `highlightEdge`/`activeEdge` prop so that when the learner places a `½E0`
  tile in `EquationTilesBeat`, the corresponding graph edge (`E1 --T--> E0`) briefly highlights
  (Ainsworth dyna-linking — the strongest MER remedy).

### 5.3 `EquationTilesBeat.tsx` — de-hardcode, stage, de-chrome, link
- **De-hardcode** `E0_WORKED_EXPLANATION`, `STATE_LEGEND`, `TOKEN_TIPS`, and `renderStaticRow`'s
  "Absorbing state — HH matched…" into **fixture-authored** copy (also a prerequisite for L2–L6
  reuse). Author it as a *fade* (story stages + prefix↔id bridge), not just de-hardcoded strings.
- **Staged reveal** (Track A): support an intermediate "faded row" mode (one fillable slot) driven by
  a fixture flag; reveal legend/tooltips/build-row on demand rather than all at once.
- **Dyna-link** placements to `StateGraph` edges (§5.2).

### 5.4 `CoinSimBeat.tsx` — segment for Track A
- Add single-step + pause; a "watch this" signal layer; during the guided replay, dim non-essential
  channels. Detect a ≥3 same-face run to surface the gambler's-fallacy note (§4.3). Honor
  reduced-motion as the fully-segmented path. Track B keeps the merged, continuous behavior.

### 5.5 Pull `FirstSuccessTimeline` forward (grounding "expected value")
Add a light "run it ~10 times, watch the average settle" moment **before** `refine-prediction` (or
split a tiny grounding pass off the front of `theory-vs-sim`). This is the concrete definition of
expected value arriving *before* the slider/algebra instead of after. The `FirstSuccessTimeline`
sub-widget specced for L0/L4 is the right primitive.

### 5.6 `equationDiagnosis.ts` — de-hardcode (blocker)
`diagnoseRow` grading is generic, but `classifyStateMistake`/`MISTAKE_HINTS` are HH copy, and
`EquationTilesBeat` overrides authored hints with them. Route non-HH (and the new authored `byPattern`
hints) to fixture copy; keep the graceful generic fallback. Required before any non-HH `equationTiles`
beat (L2/L3/L5/L6) ships; do it here so L1's authored hints also win.

### 5.7 Engine — confirm, don't change
No `automaton.ts` math change. Add one golden test `buildAutomaton("H",0.5).expectedTimes.E0 === 2`
for the L0 on-ramp. Confirm the `Automaton.states[i]` carries both `id` and `label` (it does) so
§5.2 dual-labeling is purely render.

---

## 6. New beats / lessons L1 depends on

- **L0 `lesson-first-heads`** (`docs/proposed-lessons.md` §3): a new fixture (`patternOptions:["H"]`,
  ~6 beats) that a Track-A learner does before L1. Reuses `buildAutomaton("H")`. Optional, ungated.
- **Diagnostic pre-check**: a tiny pre-L1 flow of `mcq` items that sets `track` (§3.3).

---

## 7. Two-track behavior for L1 (summary)

| Aspect | Track A (beginner) | Track B (current / expert) |
|---|---|---|
| Entry | after L0; primers expanded | straight to L1; primers collapsed; L0 offered as "skip" |
| `simulate` | split into 2–3 micro-beats (`density:'split'`) | single merged beat |
| `equation-tiles` | staged reveal + faded middle rung + variable primer | worked `E0` → build `E1` (today) |
| `guided-solve` | plain-language steps | "Show algebra" fast-path available |
| Primers / `name-the-overlap` | shown inline | collapsed / auto-skipped |
| Hints | full ladder incl. reveal; adaptive re-fill on struggle | uncapped (capped only on L5/L6 transfer) |

Mechanism: `track` on the progress doc + per-beat `track`/`density` flags + default-collapsed primer
blocks. No duplicate fixtures.

---

## 8. Misconceptions L1 must now elicit & refute

(See `audits/ideation/inclusive-research-2-prerequisites-misconceptions.md` §3b for the full
inventory.) Wire these into the per-option/`byOption` feedback and the new primers:
equiprobability ("both length-2 ⇒ 4"), gambler's fallacy (the streak note), "average = typical"
(`theory-vs-sim`), the "outcome approach" (reframe `simulate`), "expected wait = 1/P" (note that HT
genuinely *is* 4, which is what makes the wrong answer half-right), and "a self-referential equation
is circular" (the `equation-tiles` aside).

---

## 9. Mastery signal for L1

Generalize L5's `transferAttained` into a light, non-blocking per-lesson signal:
`mastered` iff the graded beats (`failure-edge`, `equation-tiles`) are first-try-correct with **no
full reveal** (uses the §3.4 hint high-water mark); else `completed — review`, and re-surface
`failure-edge` in the L4 mixed review. Unlock stays non-blocking. Reuses `ProgressDerived` + the
existing "Fully mastered" UI. No new graded beats — score what's already there.

---

## 10. Suggested implementation order (each step independently verifiable)

1. **Schema/infra** (§3): `byOption` feedback, `primer`+`mcq` types + dispatcher, optional
   `track`/`density`/`collapsible`, hint high-water mark. `validate` + `tsc` + `vitest` green.
2. **De-hardcode** `equationDiagnosis.ts` + `EquationTilesBeat.tsx` copy to fixture-authored (§5.3,
   §5.6). Re-run `validate`; HH behavior unchanged.
3. **Copy-only fixture edits** (§4.1, 4.5, 4.8, 4.9, 4.11) + per-option `open-bet` feedback (§5.1).
   Cheapest, reversible; verify via `/dev/lesson`.
4. **`StateGraph` dual-label + dyna-link** (§5.2) and `equation-tiles` prefix↔id bridge.
5. **Grounding pull-forward** (`FirstSuccessTimeline`, §5.5) + `overlap`-as-comparison (§4.10).
6. **Track A scaffolds**: `density:'split'` `simulate` (§5.4), staged `equation-tiles` (§5.3),
   primers (§4.0/4.6), `name-the-overlap` (§4.4) — all behind `track:'A'`.
7. **Mastery signal** (§9) + **L0 fixture** + **diagnostic pre-check** (§6).
8. Reduced-motion + tap-only paths for every new beat; then the two-track render in `LessonPlayer`.

---

## 11. Verification checklist (per the repo's gates)

- `npm run validate` — fixtures valid + engine recurrences match tile targets (add the `H` golden).
- `npx vitest run` — all green; add tests for `byOption` resolution, `primer`/`mcq` rendering, the
  hint high-water mark, and the per-lesson mastery signal.
- `npm run lint` — clean. `npm run build` — green.
- `npm run e2e` — the tap-only + reduced-motion projects must still complete L1 end-to-end; add a
  Track-A pass that completes the split `simulate` + primers.
- **Manual:** `/dev/lesson` for Track B (unchanged) and a Track-A scenario; confirm primers are
  collapsed for B and expanded for A; confirm `open-bet` refutes per option; confirm reduced-motion.

---

## 12. Risks & decisions deferred to the human

1. **Branching scope:** is the diagnostic/two-track in scope, or ship always-on dismissible primers
   first? (§3 decision note.)
2. **L0 as a separate lesson vs a Track-A beat-group inside L1** (cheaper, edits the built fixture).
3. **Editing the built flagship at all** — confirm the flagship isn't frozen before applying §4–§5.
4. **Voice calibration** — warm-but-precise; don't drift into bubbly (design-system tension).
5. **Validity:** the persona selected *against* the beginners we're now serving — these changes need
   testing with real novices; treat high reveal/hint rates per beat as a load-spike signal.

---

## 13. Provenance

- Cross-cutting design + course context: `docs/proposed-lessons.md` (inclusive redesign).
- Learning-science basis (citations, per-beat diagnosis, before→after copy this spec distills):
  `audits/ideation/inclusive-research-1-cognitive-load.md` (load, fading, segmenting),
  `-2-prerequisites-misconceptions.md` (prerequisite map, misconception inventory, ungraded-prediction
  finding), `-3-representations-cra.md` (dual-label/dyna-link, notation ladder, grounding order),
  `-4-motivation-anxiety.md` (persona + the before→after copy), `-5-progression-assessment.md`
  (split `simulate`, mastery signal, retrieval).
- Current contracts confirmed in `src/content/schema.ts`, `src/lesson/beats/index.tsx`,
  `PredictionBeat.tsx` (this spec's line references).
