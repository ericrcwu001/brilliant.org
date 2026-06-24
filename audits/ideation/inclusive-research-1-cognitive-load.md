# Inclusive Research 1 — Cognitive Load Theory & Scaffolding for Novices

> **Agent 1 of 5.** Lens: **Cognitive Load Theory (CLT) & scaffolding for novices.** Sibling
> agents cover other lenses; a coordinator will synthesize all five into `docs/proposed-lessons.md`
> and the L1 fixture. **This file only — I edited nothing else.**
>
> **Order discrepancy I rely on (flagged per brief).** I treat the **PRD/CONTEXT** order as
> canonical: L1 Pattern Hitting Times → L2 Penney's → L3 Gambler's Ruin → **L4 States & Streaks →
> L5 Longer Patterns → L6 Overlap Shortcut**. Note that `docs/future_ideas.md` and the plan
> filenames (`plan-L4-overlap-shortcut.md`) use a *different* order (Overlap Shortcut at L4,
> consolidation/transfer last). This matters for my lens because **where the hardest idea
> (martingale/optional stopping) and the simplest idea (`E[H]=2`) sit is a load decision.** Where I
> say "L4 = States & Streaks" I mean the PRD order; I call out the conflict in §6.

---

## 1. Lens & TL;DR

**One line:** The whole course is tuned for an expert (quant-interview) working-memory profile —
symbols used cold, multi-equation systems early, "guess-then-get-corrected" traps — and the
**expertise-reversal effect** says those exact choices, which help the expert, *actively harm* a
near-zero-foundation learner. The fix is not to dumb it down; it is to **manage intrinsic load
(sequence simple→complex, pre-train symbols), strip extraneous load (split-attention/redundancy in
the widgets), and make guidance fade** so depth stays available to whoever can use it.

**Top recommendations (most to least important):**

1. **Pre-train the vocabulary and notation before the high-load beats** (Mayer's pretraining
   principle, median *d* ≈ 0.8–0.9). A novice cannot parse `open-bet`'s "which wait is longer, and
   by how much?" or `equation-tiles`' `E0 = 1 + ½E1 + ½E0` if "expected/average wait," "½," and
   "a letter that stands for an unknown number on both sides of `=`" are themselves unknown. Add a
   **Lesson 0 / just-in-time primer micro-beats** that name these *before* they are load-bearing.

2. **Re-sequence simple→complex.** CLT's worst entry point is the current one: the flagship opens on
   `HH` (3 states + a *reset* edge). The simplest instance (`H`, 2 states, `E=2`, **no** near-miss)
   is buried at L4. Move a stripped `H` warm-up **to the front** (or into L1's first beats) so the
   first worked instance of the state→recurrence→solve method has the **lowest element
   interactivity** possible. The plan-L5 review reaches the same conclusion independently
   ("teach **H before HH**").

3. **Make the equation/solve beats a true faded worked-example → completion → independent
   progression** (worked-example + guidance-fading effects). L1's `equation-tiles` already does
   *one* completion problem (worked `E0`, build `E1`) — good — but then L2/L3/L6 jump to 4–5-row
   systems with **no intermediate fading**. Build a deliberate ladder across lessons.

4. **Cut extraneous load in the existing widgets.** `EquationTilesBeat` stacks a worked row + a
   5-item legend + per-tile tooltips + a build row + a palette on one screen (split-attention +
   redundancy). The `simulate` beat runs three transient representations at once (stream + chip +
   animated graph) — the **transient-information effect**. Segment and signal these.

5. **Reframe the "predict-then-reveal traps" as productive-failure that requires a floor.**
   Productive failure (Kapur) only helps learners who have priors to generate a wrong answer *with*;
   a true novice just flounders (Kirschner/Sweller/Clark 2006). Keep the traps, but **gate each
   behind its primer** so the learner has something to fail *productively*.

6. **Adopt an optional-depth / faded-by-default design, justified by the load asymmetry.** The 2025
   expertise-reversal meta-analysis: high assistance helps novices (*d* = 0.505) and only mildly
   hurts experts (*d* = −0.428), and **"giving assistance to novices is more important than
   withholding it for experts."** So **default to scaffolding, let experts skip** — that dominates
   the current "default to expert, novices drown" design.

7. **Chunk every beat to ≤ ~4 simultaneous new elements** (Cowan's ~4). Several proposed beats blow
   past this (L3 builds **two** recurrences back-to-back; L2's `win-prob-tiles` is a cyclic 5-state
   system; L4's martingale couples ~5 ideas). Split them.

8. **Put intrinsic load on a budget, then spend extraneous savings on germane processing**
   (self-explanation prompts on the *faded* steps), not on more chrome.

---

## 2. Learning-science findings (with citations + "so what")

| # | Framework / finding | Key citation(s) | So what for *this* product |
|---|---|---|---|
| F1 | **Cognitive Load Theory; element interactivity drives intrinsic load, which is relative to expertise.** A "chunk" for an expert is many interacting elements for a novice (the "DOG = D,O,G" example). | Sweller (1988); Sweller, van Merriënboer & Paas (1998; **2019** "20 years later," *Educ Psych Rev* 31:261–292); Sweller (2010, *EPR* 22:123–138) | Every beat must be load-budgeted **for the novice**, not the author. `E0`, `½`, "expected wait," "absorbing state" are single chunks to a quant; to a novice each is several interacting elements. |
| F2 | **Working memory holds ~4 chunks** (≤ ~3 to be safe); Miller's 7±2 was an over-estimate inflated by chunking/rehearsal. | Cowan (2001, *Behavioral & Brain Sciences* 24:87–185); Miller (1956) | Cap *new* interacting elements per beat at ~4. Beats that introduce a new symbol **and** a new operation **and** a new representation **and** a misconception trap at once will overload. |
| F3 | **Expertise-reversal effect:** instructional support that helps novices becomes redundant or harmful for experts — and vice-versa. Worked examples help novices, bore experts; minimal-guidance "discovery" helps experts, overloads novices. | Kalyuga, Ayres, Chandler & Sweller (2003, *Educational Psychologist* 38:23–31); Kalyuga (2007, *EPR* 19:509–539) | **The backbone of this reframe.** The course is expert-optimized (cold notation, discovery traps, dense systems). Those are not neutral for novices — they're *negative*. The cure is adaptivity, not a rewrite. |
| F4 | **The reversal is asymmetric:** withholding help from experts costs less than withholding it from novices. Meta-analysis: novices + high assistance *d* = 0.505; experts + low assistance *d* = −0.428; "**assistance to novices matters more than withholding it for experts.**" | *A cornerstone of adaptivity — a meta-analysis of the expertise reversal effect*, **2025**, *Learning & Instruction* (60 studies, 176 effect sizes, N≈5924) | **Default to scaffolding; let experts opt out.** The downside of "too much help" for the quant learner is real but smaller than the downside of "too little help" for the novice. This resolves the depth-vs-accessibility tension in §7. |
| F5 | **Worked-example effect:** for novices, studying worked steps beats unguided problem-solving at equal time, because it builds schemas instead of spending WM on search. | Sweller & Cooper (1985, *Cognition & Instruction*); Renkl review in *Camb. Handbook of Multimedia Learning* | Don't open a new mechanic with a blank problem. Show a fully worked instance first, *then* fade. |
| F6 | **Guidance-fading / completion-problem effect:** the *transition* from worked example → independent problem should be gradual (a coordinated series of completion problems), not an abrupt switch. **Backward fading** (remove last steps first) is usually best; pair with **self-explanation** prompts. A "completion" (half-solved) problem performs as well as a full worked example. | Renkl & Atkinson (2003, *Educational Psychologist* 38:15–22); Renkl, Atkinson & Große (2004, *Instr. Science* 32:59–82); Atkinson, Derry, Renkl & Wortham (2000, *RER* 70:181–214); Paas (1992) | The equation-tiles and substitution beats should be **a ladder** across the course (worked → complete the last term → complete the row → build the system), not a step-function from "build 1 row" (L1) to "build 4 rows / 2 systems" (L3/L6). |
| F7 | **Pretraining principle:** teach the *names and characteristics of key components* before the integrated lesson; this off-loads essential processing onto the primer. Median *d* ≈ 0.78–0.92. | Mayer (2021, *Multimedia Learning* 3rd ed., Cambridge); Mayer & Pilegard | Add tiny primers for: "expected/average wait," "½ = one in two," "state = how much of the pattern you've matched," "`E0` = a number we don't know yet." Then the dense beats inherit the schema. |
| F8 | **Segmenting principle & transient-information effect:** learner-paced segments beat a continuous stream (median *d* ≈ 0.67–0.98); animated/transient info overloads because it vanishes before it's processed — segment it and add temporal cues/pauses. | Mayer (2021); Leahy & Sweller (2011); Singh, Marcus & Ayres (2012, *Appl. Cogn. Psych.* 26:848–853); Spanjers et al. (2012) | The `simulate` beat and every proposed "watch it resolve" hero (race swarm, walker swarm, gambler skyline) are transient. Give **single-step / pause / replay control** and signal the one thing to watch. |
| F9 | **Coherence & signaling principles:** exclude extraneous words/graphics (coherence, *d* ≈ 0.86); cue the essential bits (signaling, *d* ≈ 0.69). Redundancy/split-attention: don't force learners to integrate separated-but-related sources, and don't narrate identical on-screen text. | Mayer (2021); Chandler & Sweller (1991, redundancy; 1992, split-attention) | Trim widget chrome (legends + tooltips + worked rows shown simultaneously), integrate labels into the picture, and stop repeating the same fact in prose + legend + tooltip. |
| F10 | **Productive failure needs a knowledge floor.** Generation-before-instruction deepens learning *iff* the learner can use priors to generate (suboptimal) solutions; for true novices the generation phase becomes overload, so explicit instruction must come first. Review: 53 studies/166 comparisons, moderate conceptual benefit *when PF principles are followed*. | Kapur (2008, *Cognition & Instruction* 26:379–424; 2014, *Cognitive Science*); Sinha & Kapur (2021); Loibl, Roll & Rummel (2017); contra: Kirschner, Sweller & Clark (2006, *Educational Psychologist* 41:75–86); Bjork (1994) desirable difficulties | The product's "predict-then-reveal" traps are productive-failure. They work for the quant learner (who has priors). For a novice with no priors they're just failure. **Give a floor (primer), then trap.** |

---

## 3. Diagnosis — where the current product overloads a near-zero learner

### 3.1 Element-interactivity estimate of the **implemented L1** beats

Load rated **for a learner who does not yet know probability, fractions, EV, or algebra.** "Novice
elements" = the interacting pieces that must be held in WM *because the schema that would chunk them
is missing*.

| L1 beat (`beatId`) | Interaction | Novice intrinsic load | Why (interacting elements a novice can't yet chunk) |
|---|---|---|---|
| `open-bet` | prediction | **High** | "fair coin," `HH`/`HT` as *targets you wait for*, "wait" = flip count, **"on average"/expected** (undefined for a novice), and a two-way magnitude compare ("by how much") — all at once, in the very first sentence. |
| `pattern-pick` | patternPick | Low | Passive confirm. (Fine, but it's a wasted beat that could pre-train instead — see §5.) |
| `simulate` | coinSim | **High (transient)** | Three simultaneous transient representations — coin stream, prefix-state chip, animated 3-node graph — plus cold terms "state machine," "progress," "prefix-state." F8 transient-info + split-attention. |
| `failure-edge` | stateTap | **Med–High** | `E1`/`E0` as cold symbols; "near-miss"; the reset-vs-self-loop distinction; mapping a tapped edge to a claim about memory. |
| `equation-tiles` | equationTiles | **Very High** | The single biggest cliff. `E0,E1,E2` as variables (a number unknown, appearing **on both sides** of `=`), the `1+` flip cost, two `½` weights, the graph→equation mapping, canonical order. For a no-algebra learner the *concept of a recurrence variable* is itself missing. |
| `refine-prediction` | slider | Med | Requires "the answer is a single expected number," which is exactly the schema not yet built. |
| `guided-solve` | substitution | **High** | Substitution, "isolate `E0`," and `"Solving 1/2 E0 = 3 gives E0 = 6"` — opaque without basic algebra. |
| `theory-vs-sim` | theorySimChart | Med | "empirical mean," "converge," "theory line," 3 series. |
| `overlap` | overlap | Med | Narrative; depends on `E1` reset/self-loop schema from earlier beats holding. |
| `recap` | recap | Med | Retrieval of the whole chain. |

**Concrete fixture evidence:**

The opener presupposes expected value in its first sentence and bakes it into the distractor:

```13:13:fixtures/lesson-pattern-hitting-times.json
      "prompt": "You flip a fair coin until you see HH. Then again until you see HT. Which wait is longer, and by how much?",
```
```19:19:fixtures/lesson-pattern-hitting-times.json
          "They tie — both take 4 flips on average"
```

A learner who doesn't know what "on average" means cannot even *parse* the question, let alone the
trap. This is an expertise-reversal red flag (F3): the framing is a great hook *for someone with the
EV schema* and a wall for someone without it.

The equation beat jumps straight to the full recurrence in the prompt and the level-3 hint:

```102:102:fixtures/lesson-pattern-hitting-times.json
      "prompt": "Here's the equation for E0, worked out. Build E1 the same way: every flip costs 1, then split by the coin.",
```
```154:154:fixtures/lesson-pattern-hitting-times.json
          "E0 = 1 + 1/2 E1 + 1/2 E0 and E1 = 1 + 1/2 E2 + 1/2 E0, with E2 = 0."
```

"Build E1 the same way" is a worked-example→completion move (good, F5/F6) — but it assumes the
learner can read `E0 = 1 + ½E1 + ½E0` as a *self-referential equation*. There is no pretraining
(F7) of what `E0` even denotes before this screen.

The solve beat asserts algebra a novice can't follow:

```197:197:fixtures/lesson-pattern-hitting-times.json
          "Solving 1/2 E0 = 3 gives E0 = 6."
```

### 3.2 Extraneous load baked into the existing widgets (design-reducible — F1, F9)

From `src/lesson/beats/EquationTilesBeat.tsx`:

- **Split-attention + redundancy on one screen.** The beat renders, simultaneously: a worked
  `PrefilledRow` with an `E0_WORKED_EXPLANATION` paragraph, a 5-line `STATE_LEGEND` (`eqtiles__legend`),
  per-tile `InfoTip` tooltips (`TOKEN_TIPS`/`E0_TERM_TIPS`), the build row, and the palette. The
  same fact ("E2 is absorbing, 0 extra flips") appears in the legend **and** a tooltip **and** the
  static row note `"Absorbing state — HH matched, no extra flips needed."` That is the redundancy
  effect (F9): three encodings of one element competing for WM.

```92:96:src/lesson/beats/EquationTilesBeat.tsx
const STATE_LEGEND: { id: string; text: string }[] = [
  { id: 'E0', text: 'matched none of HH yet (start)' },
  { id: 'E1', text: 'matched one H (one flip from HH)' },
  { id: 'E2', text: 'matched HH — done, so E₂ = 0' },
]
```

- **Good news the coordinator should preserve:** the beat already implements a *completion problem*
  (`buildableRows` = the graded `E1`; `E0` is the worked example) and **backward-style per-slot
  diagnosis + a level-3 reveal**. The CLT bones are here — the problem is (a) no pretraining before
  it and (b) too much simultaneous chrome, not the core interaction.

- **Transient information in `simulate`** (per the plans' description of `CoinSimBeat`): a continuous
  stream + animated edge travel + pulsing nodes with no learner-paced segmentation beyond "Flip."
  The "guided replay" is a single scripted shot, not a pausable, cued segment (F8).

### 3.3 Element-interactivity of the **proposed L2–L6** dense beats (the load argument against expert-optimization)

| Proposed beat | Source | Novice load | The overload |
|---|---|---|---|
| L2 `win-prob-tiles` (`pick-your-counter` + win-prob recurrence) | `plan-L2-penneys-game.md` | **Very High** | The plan's own review: the `HHH/THH` system is **"~3× the tile load of L1's HH"** and is **cyclic** (no clean back-substitution). Worse for novices: it requires *unlearning* the `1+` they just learned (interference) — the learner must hold "duration recurrence has `1+`" **and** "probability recurrence has **no** `1+`, boundary 1/0" and discriminate. That is high element interactivity layered on a not-yet-automated schema. |
| L3 `ruin-tiles` **and** `duration-tiles` | `plan-L3-gamblers-ruin.md` | **Very High** | **Two** recurrences back-to-back. The review notes the contrast is *two* differences (leading `+1` vs `+0`; **and** asymmetric boundaries `P_0=0,P_N=1` vs `D_0=D_N=0`) that learners conflate. Add the new arena (number line, `N`, `i`, `p`, `r=q/p`) and you are far past Cowan's ~4 (F2). |
| L3 `house-edge` (biased `r=q/p`, cliff) | same | High | Biased closed form + nonlinear "cliff" intuition on top of an un-consolidated fair case. |
| L4/L6 `casino-intuition` / `gamblerLedger` (martingale, optional stopping) | `plan-L4-overlap-shortcut.md` | **Extreme** | The plan calls optional stopping **"the most abstract idea in the slate."** Couples ≥5 elements: a gambler enters each flip; parlay doubling `2^L`; bust on a wrong letter; survivor ⟺ border; fairness ⇒ `E[T]=Σ2^L`. Even the expert review flags it; for a novice it is unreachable without heavy staging. |
| L4 `self-overlap` / `autocorrelationRuler` | same | High | Shifts, borders, bit-vector, binary Conway number — a new symbolic system, introduced fast. |
| L6 `equation-tiles` (4 rows × 2 patterns) | `plan-L6-longer-patterns.md` | **Very High** | 4-state systems, *two* patterns, **faded hints (`maxHintLevel:2`)**. Faded scaffolding is correct *for someone who has the schema* (F3/F6) — but if the novice never got the fading ladder in L1–L5, capping hints here is withholding support from a learner who still needs it (anti-F4). |

**The load argument, stated plainly:** every one of these is a *good* design **for the persona the
PRD names** (a quant-prep underclassman who already chunks `½`, EV, and recurrences). That is
exactly why they fail a near-zero learner: the expertise-reversal effect (F3) predicts that
expert-optimized, low-guidance, high-element-interactivity beats *reduce* novice learning. The
product hasn't mis-designed for its stated persona; it has **mis-scoped the persona.**

---

## 4. Recommendations for `docs/proposed-lessons.md` (L2–L6)

General rules to thread through every lesson (so the coordinator can apply once):

- **R-A. Each new mechanic opens with a worked example, then a completion problem, then independent
  build** (F5/F6). Never open a mechanic with a blank.
- **R-B. Every high-load beat is preceded by a ≤20-second pretraining micro-beat** naming its new
  symbols/terms (F7).
- **R-C. Cap new interacting elements at ~4 per beat; if a beat exceeds it, split it** (F2).
- **R-D. Make "watch it resolve" heroes learner-paced** (single-step + pause + replay) and **signal
  the one thing to watch** (F8/F9).
- **R-E. Default to full scaffolding; gate "faded"/`maxHintLevel:2` behind evidence the learner
  earned it** (an optional-depth toggle or a prior clean pass), per the load asymmetry (F4).

### L2 — Penney's Game

- **Adopt the review's own cut to ~8 beats and retarget `win-prob-tiles` to the 2-state `HH` vs
  `HT` race** (the plan-L2 review already recommends this). From a CLT view this is essential: the
  new idea ("probability recurrence: no `1+`, boundary 1/0") should be taught at the **lowest
  element interactivity** (2 states), not on the cyclic 5-state `HHH/THH` system. Show `1/8` via the
  **Conway ruler + simulation**, never by building/solving a 5-row system.
- **Add a pretraining micro-beat before `win-prob-tiles`: "two kinds of equation."** A 10-second
  contrast card — *duration* asks "how many flips?" (`+1`, ends at 0); *probability* asks "what
  fraction of the time?" (no `+1`, ends at 1/0). This directly defuses the `1+` interference (F7).
- **`first-step-split` (beat 3)** is a good chunking move — keep it, but make it a worked
  example first (animate one decided race), *then* ask the tap.
- **`non-transitive-loop`** is high-wow but conceptually heavy; keep it **narrative/exploratory**,
  never gated. Signal the 4-cycle explicitly (the review corrected 3-cycle→4-cycle); don't make the
  learner discover it under load.
- **Faded scaffolding (`maxHintLevel:2` on the setup beats):** apply **R-E** — default to full
  hints; only fade for a learner flagged as not-needing-review on L1.

### L3 — Gambler's Ruin

- **Do not build two recurrences in two consecutive beats.** Split with a consolidation beat between
  `ruin-tiles` and `duration-tiles`, or — better — **build one (probability) fully, simulate it,
  then introduce duration as a single-difference completion problem** ("same system, add the `+1`
  back"). This is faded worked examples applied across beats (F6) and keeps each beat ≤ ~4 new
  elements (F2).
- **Teach the two differences as two separate signaled contrasts** (F9), not one: (1) `+1` vs `+0`;
  (2) boundaries `1/0` vs `0/0`. The plan-L3 review explicitly says the asymmetric-boundary idea is
  the *deeper* stumble and deserves "equal billing." Give each its own micro-beat.
- **Pretraining micro-beat: "the number line is a state machine"** — map wealth `0..N` onto the
  same node vocabulary before the walk board, so the arena change isn't a new schema on top of new
  math (F7).
- **`house-edge` / biased `r=q/p`:** keep **exploratory** (drag the cliff), never a graded tile beat
  — the tile grader is fair-coin-only anyway, and the biased algebra is past budget for a novice.
- **Walker swarm / histogram heroes:** make them **replayable and stepwise**, with a one-line signal
  ("watch the bar settle on 1/2"), not a one-shot transient flood (F8).

### L4 — States & Streaks (PRD position) — *promote it to a primer role*

- **This is the lowest-load lesson in the course and it is in the wrong place.** See §6: move a
  stripped version of it (the `H`, 2-state, `E=2` case) **to the front** as the first worked
  instance, and keep a short retrieval version here. From a CLT standpoint this single change does
  more for novices than any copy edit.
- If it stays at L4, its **`three-ways-to-two` / convergence** payload is genuinely germane (F1,
  redistributing freed capacity to schema-linking) — keep it; cut the busywork beats (the plan-L5
  review's "grade the trivial `E1=0`" and the ungraded "check") that add load without learning.

### L5 — Longer Patterns (transfer)

- **Transfer with faded hints is the *right* design for a learner who climbed the ladder, and the
  *wrong* one for a novice who didn't.** Apply **R-E**: keep `maxHintLevel:2` as the *default for
  learners who passed L1's setup beats cleanly*, but provide a full-hint path otherwise. The badge
  (`transferAttained`) can still distinguish effort without withholding help (F4).
- **Pretraining micro-beat naming "border / overlap length"** before the ruler, so the transfer is
  about *applying* the method, not decoding new notation under transfer pressure.

### L6 — Overlap Shortcut (martingale) — *keep it last; stage the abstraction*

- **Keep the martingale capstone LAST** (PRD order) — it should land only after maximal prior
  knowledge, which is the most load-sensible placement (F1; spacing the hardest idea last). Flag the
  conflict with `future_ideas.md`, which puts it at L4.
- **Segment the martingale into a worked sequence** (F5/F6/F8): (a) one gambler, one stream, watch
  it bust; (b) money-in = flips (count it); (c) money-out = the survivors (tap them); (d) *only
  then* "fair game ⇒ in = out." The plan-L4 review's "show running mean(T) in beat 7 so the equality
  is *felt* before it's asserted" is exactly a segmenting fix — adopt it.
- **Lead with the deterministic-payout insight** (survivors are the same every run) before "optional
  stopping" — it's the lower-element-interactivity framing of the same truth.

---

## 5. Recommendations for the implemented L1 lesson (`fixtures/lesson-pattern-hitting-times.json` + components)

A separate agent implements these; I give per-beat, applyable edits. **Net effect: lower the
entry-load wall without removing the depth that already works for experts.**

### 5.1 Add pretraining, ideally by repurposing the near-empty `pattern-pick` beat

`pattern-pick` is currently a passive confirm (low value, §3.1). **Repurpose it (or insert a beat
before `open-bet`) as a 2–3 card pretraining primer** (F7), tap-only:

- "**Average wait** = if you did this many times, the typical number of flips." (one sentence + a
  3-run mini illustration)
- "**½** = one out of two — a fair coin's chance of H." (a coin glyph)
- "**State** = how much of the pattern you've matched so far: none → `E0`, one H → `E1`, done →
  `E2`." (mini graph, no animation)

This off-loads the EV/fraction/state schema so `open-bet`, `simulate`, and `equation-tiles` inherit
it instead of teaching it implicitly under load.

### 5.2 Per-beat edits

- **`open-bet`** — Keep the trap (productive failure works here *once the primer above exists*, F10).
  But **add a plain-language gloss** so the question is parseable without the EV schema, e.g. prompt
  → *"You flip a fair coin over and over until `HH` shows up, and count the flips. Do it again for
  `HT`. On average, which one makes you wait longer?"* Drop "and by how much?" from the **first**
  ask (it adds a second quantity to compare); reintroduce it at `refine-prediction` where a number
  is actually wanted. Reword the distractor `"They tie — both take 4 flips on average"` only after
  "average" is primed.

- **`simulate`** — Apply segmenting + signaling (F8/F9): add **single-step mode with a pause after
  each flip** and a one-line cue ("watch where the blue chip goes after a near-miss"). Reduce
  simultaneous transient channels: when the guided replay runs, **dim the stream and chart so the
  graph edge is the only moving thing** (coherence, F9). Reword "Where does progress go on each
  flip?" to name the chip ("Watch the **state** chip — does a tail throw your progress away?").

- **`failure-edge`** — Before the tap, show a **worked instance** of one near-miss animated and
  labeled, *then* ask (worked→completion, F5/F6). Keep the existing `byPattern` hints — they're
  good. Add a plain gloss for `E1`/`E0` on first appearance ("`E1` = you've matched one `H`").

- **`equation-tiles`** — Highest-leverage edits:
  1. **Pretrain the variable idea** in one card before the beat: "`E0` is a number we don't know
     yet — the average flips left from the start. It can appear on **both sides** because after a
     tail you're *back at the start*." This is the single missing schema (§3.1).
  2. **Reduce simultaneous chrome** (F9): show the worked `E0` row **first, alone**; reveal the
     legend/build-row on a tap ("Now your turn"). Don't render worked row + 5-line legend + tooltips
     + build row + palette at once. Drop the redundant third encoding (legend vs tooltip vs static
     note all say "E2 = 0").
  3. **Add a faded middle rung** (F6, backward fading): an intermediate sub-step where the learner
     completes only the **last term** of `E1` (the `½E0` reset term) with the rest pre-filled,
     *before* building the whole row. This makes L1 a real worked→completion→build ladder and is the
     template L2/L3/L6 should reuse.
  4. **Add a self-explanation prompt** on the faded step ("Why does the tail term point at `E0` and
     not `E1`?") — fading without self-explanation under-delivers (F6).

- **`refine-prediction`** — Fine; this is where "by how much / what number" belongs. Add a one-line
  reminder of what the number means (germane, cheap).

- **`guided-solve`** — The algebra is opaque to a no-algebra learner. **Segment each substitution as
  its own tap with a plain-language line** (F8), and replace `"Solving 1/2 E0 = 3 gives E0 = 6"` in
  the hint with a worked micro-step: *"Half of the answer is 3, so the whole answer is 6."* Keep the
  PRD's "Show algebra" cut-line as the **expert** fast-path (optional-depth, F4).

- **`theory-vs-sim`, `overlap`, `recap`** — Lower priority. Add a single signaled cue per chart
  series (F9); gloss "empirical mean" once ("the average we actually measured").

### 5.3 Component implications (for the implementing agent)

- `EquationTilesBeat.tsx`: gate the legend/tooltips behind a reveal; add an optional intermediate
  "faded row" mode (one fillable slot) driven by a fixture flag; the HH-specific copy constants
  (`E0_WORKED_EXPLANATION`, `STATE_LEGEND`, `TOKEN_TIPS`, `renderStaticRow` note) should be made
  fixture-authored anyway (already flagged by sibling plans) — that work doubles as the pretraining
  hook.
- `CoinSimBeat`: add single-step + pause + a "watch this" signal layer; honor reduced-motion as the
  fully-segmented path.
- A small reusable **PrimerCard / pretraining** beat type would serve L1 *and* every L2–L6 primer
  recommended in §4 (one component, many uses).

---

## 6. Cross-cutting / structural proposals

1. **Re-sequence the course simple→complex (the biggest CLT lever).** The current first contact is
   the *hardest* low-level instance (`HH`: 3 states + a reset edge), while the *simplest* (`H`: 2
   states, `E=2`, no reset) sits at L4. CLT (F1/F5) and the plan-L5 review both say teach **`H` →
   `HH` → `HT`**. Minimum viable change: **prepend a stripped `H` warm-up to L1** (or as a true
   "Lesson 0") so the method's first worked instance is the lowest-load one; keep States & Streaks
   at L4 as the *retrieval/convergence* lesson. This is a sequencing change, not new math — `E[H]=2`
   already exists in the engine.

2. **A "Lesson 0" + just-in-time primers, not a wall of theory.** Pretraining works best as
   *small, just-in-time* naming right before each load spike (F7), not a front-loaded glossary.
   Concretely: a Lesson 0 that establishes coin/flip/average-wait/`½`/state, plus one primer
   micro-beat injected before each genuinely new mechanic (probability-vs-duration recurrence in L2,
   number-line-as-states in L3, border in L5, martingale staging in L6).

3. **Optional-depth toggle, faded by default for advancement, expandable for depth.** Justified by
   the load asymmetry (F4): make the *scaffolded* path the default and let the learner (or a
   prior-knowledge probe / their L1 performance) unlock the **expert fast-paths** (the "Show
   algebra" reveal, the `maxHintLevel:2` faded setups, the expert notes like the `Σ2^L` aside).
   Experts lose little by skipping help; novices lose a lot when it's withheld. This is also the only
   way to keep the quant-interview depth without gutting accessibility (§7).

4. **Persona reframing.** The PRD persona ("university underclassman, knows the Green Book") is the
   *expert* end of the reversal. Reframe to a **two-audience design**: a near-zero learner who needs
   the scaffolded spine, and the quant learner who skips to depth. The expertise-reversal literature
   is precisely a theory of serving both with one adaptive design — lean on it rather than forking
   the product.

5. **Course-wide faded-worked-example ladder.** Treat the equation/solve interaction as *one*
   competency taught across L1→L6 with monotonically increasing problem-completion demand (worked →
   complete-last-term → complete-row → build-row → build-system → build-system-faded). Today the
   demand jumps discontinuously; make it a designed slope (F6).

6. **Budget intrinsic load, spend savings on germane processing.** Every extraneous cut (§3.2)
   frees WM; reinvest it in **self-explanation prompts** on faded steps and in convergence/"why"
   beats — not in more chrome or more simultaneous heroes (F1 2019 revision: germane = redistributed
   capacity, not a third additive load).

---

## 7. Tradeoffs & open questions (for the human)

- **Depth vs. accessibility — the central tension, but it's asymmetric.** Adding scaffolding,
  primers, and worked steps risks boring/insulting the quant learner (expertise-reversal *can* run
  the other way). **But the evidence says the asymmetry favors scaffolding** (F4: novice gain *d* ≈
  0.51 > expert loss *d* ≈ 0.43, and "assistance to novices matters more"). **Recommendation:**
  default-scaffolded + expert opt-out (optional depth). Open question for the human: do we have a
  cheap **prior-knowledge probe** (or use L1 first-try/reveal rate) to auto-route, or do we expose a
  manual "I've seen this before — skip the basics" control? Auto-routing is better-grounded but more
  to build.

- **Productive-failure traps vs. overload.** The "predict-then-reveal" traps are pedagogically
  valuable *and* they presuppose priors (F10). Keeping them for novices requires a primer floor
  first; the risk is that even with a primer, a true novice's "prediction" is a random guess (no
  productive content to fail with). Open question: is the opening *bet* worth keeping for the
  near-zero learner, or should the primer + a low-stakes worked walkthrough replace it, with the bet
  reserved for the expert path?

- **Re-sequencing cost vs. payoff.** Moving the simplest case to the front is the highest-payoff CLT
  change but touches the built flagship and the unlock order. Open question: prepend a tiny `H`
  warm-up *inside* L1 (cheaper, preserves the gate) vs. a separate Lesson 0 node (cleaner pedagogy,
  more product surface)?

- **Segmenting animations vs. the "wow."** The product's identity is "watch the math resolve." Heavy
  segmentation/pausing (F8) can dull the cinematic heroes. Tradeoff: give a **first pass that's
  learner-paced/segmented** (for understanding) and an **optional replay at full speed** (for the
  wow). Costs a control; preserves both goals.

- **Reduced/"completion as mastery" vs. true mastery.** Lowering load raises completion rates, but
  completion = mastery (PRD) means we may pass novices who didn't build the schema. Out of my lens to
  decide, but flag: the deferred performance-threshold mastery (in `future_ideas.md`) interacts with
  any accessibility change — easier beats + completion-mastery could inflate false "mastered."

- **What I did not measure.** I estimated element interactivity by inspection, not with an empirical
  load measure (e.g., subjective rating à la Paas, or first-try/hint-rate as a load proxy). The
  product already plans `answer_submitted {hintLevel}` and reveal-rate KPIs — those are a usable
  **load proxy**; recommend treating high reveal/hint rates on a beat as evidence of an
  un-budgeted load spike to fix.

---

## 8. Sources

- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12, 257–285.
- Sweller, J., van Merriënboer, J., & Paas, F. (1998). Cognitive architecture and instructional design. *Educational Psychology Review*, 10, 251–296.
- Sweller, J., van Merriënboer, J., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review*, 31, 261–292.
- Sweller, J. (2010). Element interactivity and intrinsic, extraneous, and germane cognitive load. *Educational Psychology Review*, 22, 123–138.
- Miller, G. A. (1956). The magical number seven, plus or minus two. *Psychological Review*, 63, 81–97.
- Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity. *Behavioral and Brain Sciences*, 24, 87–185.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist*, 38, 23–31.
- Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review*, 19, 509–539.
- (Meta-analysis, 2025) A cornerstone of adaptivity — A meta-analysis of the expertise reversal effect. *Learning and Instruction* (60 studies, 176 effect sizes; novice+assistance *d*=0.505, expert+low-assistance *d*=−0.428).
- Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. *Cognition and Instruction*, 2, 59–89.
- Atkinson, R. K., Derry, S. J., Renkl, A., & Wortham, D. (2000). Learning from examples: Instructional principles from the worked examples research. *Review of Educational Research*, 70, 181–214.
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition: A cognitive load perspective. *Educational Psychologist*, 38, 15–22.
- Renkl, A., Atkinson, R. K., & Große, C. S. (2004). How fading worked solution steps works — a cognitive load perspective. *Instructional Science*, 32, 59–82.
- Paas, F. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology*, 84, 429–434.
- Mayer, R. E. (2021). *Multimedia Learning* (3rd ed.). Cambridge University Press. (15 principles incl. coherence *d*≈0.86, signaling *d*≈0.69, segmenting *d*≈0.67–0.98, pretraining *d*≈0.78–0.92, modality *d*≈1.0.)
- Chandler, P., & Sweller, J. (1991). Cognitive load theory and the format of instruction. *Cognition and Instruction*, 8, 293–332. (Redundancy / split-attention.)
- Leahy, W., & Sweller, J. (2011). Cognitive load theory, modality of presentation, and the transient information effect. *Applied Cognitive Psychology*, 25, 943–951.
- Singh, A.-M., Marcus, N., & Ayres, P. (2012). The transient information effect: Investigating the impact of segmentation on spoken and written text. *Applied Cognitive Psychology*, 26, 848–853.
- Ayres, P., & Paas, F. (2007). Making instructional animations more effective: A cognitive load approach. *Applied Cognitive Psychology*, 21, 695–700.
- Kapur, M. (2008). Productive failure. *Cognition and Instruction*, 26, 379–424.
- Kapur, M. (2014). Productive failure in learning math. *Cognitive Science*, 38, 1008–1022.
- Sinha, T., & Kapur, M. (2021). When problem solving followed by instruction works: Evidence for productive failure. *Review of Educational Research*. (53 studies, 166 comparisons.)
- Kirschner, P. A., Sweller, J., & Clark, R. E. (2006). Why minimal guidance during instruction does not work. *Educational Psychologist*, 41, 75–86.
- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In *Metacognition: Knowing about knowing* (desirable difficulties).
- (Repo) `fixtures/lesson-pattern-hitting-times.json`; `src/lesson/beats/EquationTilesBeat.tsx`; `docs/mvp_prd.md`; `docs/ui_design_system.md`; `audits/ideation/plan-L2..L6-*.md`; `docs/future_ideas.md`; `CONTEXT.md`.
