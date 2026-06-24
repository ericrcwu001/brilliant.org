# Inclusive Research — Agent 5: Learning Progressions, Mastery, Spacing/Interleaving/Retrieval & Adaptive Scaffolding

> **Lens (Agent 5):** sequencing & assessment architect. How should the *order* of
> lessons and beats, the *mastery/advance* rules, and the *retrieval/spacing/scaffolding*
> machinery be redesigned so a next-to-zero-foundation learner (may not know what a
> fraction, "probability," "expected value," or basic algebra are; may have math anxiety)
> can climb the course — **without** flattening the depth that serves the quant-interview
> persona?
>
> Grounded in BOTH the repo (`docs/mvp_prd.md`, `docs/proposed-lessons.md`,
> `docs/future_ideas.md`, `CONTEXT.md`, `fixtures/lesson-pattern-hitting-times.json`,
> the `plan-L*` specs, `src/content/schema.ts`) and the learning-science literature
> (citations in §8). One of five parallel inclusive-research files; a coordinator synthesizes.

---

## 1. Lens & TL;DR

**One line:** The course is sequenced *hardest-first* (the 3-state `HH` recurrence is the
flagship L1) while the *simplest* case (`E[H]=2`, two states) is buried as L4
"consolidation" — a textbook skip-level ordering that the learning-trajectory literature
predicts is the wrong on-ramp for a beginner, yet ripping it out would bore the quant. The
fix is **not re-ordering the gate**; it is **adding a skippable on-ramp + a two-track,
mastery-gated, retrieval-spaced scaffold** around the existing path.

**Top 8 concrete recommendations:**

1. **Insert an optional "Lesson 0 — The First Heads" (`E[H]=2`)** as the true on-ramp, built
   from the *already-planned* States & Streaks content moved to the front, plus three
   just-in-time primers (what `½` means, what "on average" means, what a "state" is). A
   beginner does it first; an advanced learner **skips it via a diagnostic pre-check**
   (expertise-reversal: Kalyuga 2003/2007). This resolves the buried-simplest-case problem
   *and* the PRD/`future_ideas` disagreement about where the warm-up sits in the back half.
2. **Repurpose the late "States & Streaks" (L4) slot from re-deriving `E[H]=2` into an
   interleaved mixed-review checkpoint** (retrieve H / HH / HT / race / ruin together). With
   `E[H]=2` now taught up front, re-deriving it late is redundant; interleaving is the
   higher-value use of that slot (Rohrer & Taylor 2007: mixed practice 63% vs 20% blocked).
3. **Promote a *light* mastery signal** from the deferred "performance-threshold" idea: a
   lesson is "mastered" at ≥~80% first-try on graded beats with no full reveal; otherwise
   "completed — review." Keep it **non-blocking for unlock** (preserve momentum) but let it
   **drive spaced re-surfacing** and the next-step recommender (Bloom 1984 mastery learning =
   +1σ; the *feedback-corrective loop is the active ingredient*).
4. **Make every L2+ lesson open with a retrieval warm-up** (cued recall of the prior
   headline number/idea) and **close every recap with generate-then-reveal retrieval**, not
   re-reading. The repo already gestures at this (`recall-grid`, `course-retrieval`); make it
   a *standard* opening beat (Roediger & Karpicke 2006: 61% vs 40% at 1 week).
5. **Adopt a two-track scaffolding policy by expertise:** beginners keep the full 3-level
   hint ladder *including* the bottom-out reveal (assistance-giving); transfer/advanced beats
   cap at `maxHintLevel: 2` (assistance-withholding, already designed for L5/L6). This is the
   assistance dilemma (Koedinger & Aleven 2007) resolved adaptively, not globally.
6. **Split the merged high-load beats for the beginner track.** The flagship's `simulate`
   beat fuses coin-stream + active prefix chip + 3-node pulsing graph + near-miss replay into
   one screen — high element-interactivity (Sweller/Kalyuga). Beginners get it as 2–3 smaller
   beats (flip & watch → meet the graph → spot the near-miss); experts keep the merged beat.
7. **Keep "predict before you're told" as the spine, and exploit it as assessment.** The
   opening `prediction` "bet" is productive failure (Kapur 2008) *and* a hypercorrection trap
   (Metcalfe): capture the confident wrong answer, then the corrective feedback sticks harder.
   Reuse the same prediction at the recap to *measure* belief change (`predictionDeltaInitial`
   already exists in `derived`).
8. **Fade scaffolding *backward* and *adaptively*, not on a fixed clock.** The flagship's
   equation beat already pre-fills `E0` and grades `E1` (a completion problem). Extend that
   pattern down the course (Renkl & Atkinson 2003: backward fading > forward; Salden et al.
   2010: adaptive fading > fixed), gating the fade on first-try success, not on lesson index.

---

## 2. Learning-science findings (each with a "so-what for this product")

| # | Framework / finding (citation) | Key evidence | So-what for Pattern Hitting Times |
|---|---|---|---|
| 2.1 | **Learning trajectories / hypothetical learning trajectory** (Simon 1995; Clements & Sarama 2004; Confrey) | A trajectory = (goal) + (research-based developmental progression from informal→formal) + (tasks per level). Genetic epistemology (Piaget): early reasoning is *partial* and must be refined gradually. | The product *has* a goal and tasks but its **progression is inverted** for novices: it starts at a 3-state self-referential recurrence, not the 1-step "wait for one H." Build the explicit novice→formal ladder: **count→fraction→"on average"→one state→two states→overlap.** |
| 2.2 | **LT-ordered instruction beats skip-level — but levels are *facilitative*, not always *necessary*** (Clements, Sarama et al. 2022, *Educ. Sci.* "10 experiments") | In 5/10 controlled experiments LT-sequenced teaching beat a "teach-to-target/skip-level" counterfactual; but some levels are "helpful, perhaps not necessary" for the next. | Two messages at once: (a) for a beginner, **don't skip to HH** — insert the simplest level; (b) for an expert, the simplest level may be *skippable* — hence a **diagnostic pre-check**, not a forced L0. |
| 2.3 | **Mastery learning & the 2-sigma problem** (Bloom 1984) | Mastery learning (mastery threshold + feedback-corrective loop before advancing) = **+1σ** (84th pctile); 1:1 tutoring = +2σ. Bloom's own table: "feedback-corrective" effect size ≈ **1.0**. | "Completion = mastery" (current MVP) captures *doing* but not the *corrective loop* that produces the 1σ. Add a light mastery threshold + **re-surface what was missed** — that loop, not the badge, is the lever. |
| 2.4 | **Half of the 2σ is just testing + feedback** (reanalysis, *Education Next* 2023; meta-analytic testing+feedback ≈ **0.73–0.96σ**) | Bloom's mastery group ≈ +1.1σ; ~half attributable to the extra testing/feedback, not tutoring magic. | The cheapest, highest-yield move here is **more low-stakes graded retrieval with instant specific feedback** — which this app is *architecturally built to do* (client-side instant feedback, hint ladder). Lean into it. |
| 2.5 | **Testing/retrieval-practice effect** (Roediger & Karpicke 2006) | Read×4 beat test×3 at 5 min (83% vs 71%) but **lost** at 1 week (40% vs 61%). Retrieval slows forgetting. | Recaps must be **generate-then-reveal**, never re-read. Open each lesson by *retrieving* the last one. The headline numbers (2/4/6/8/10) are perfect retrieval cues. |
| 2.6 | **Spacing / distributed practice** (Cepeda et al. 2006 meta-analysis, 839 effects; Cepeda et al. 2008 ridgeline) | Spacing reliably beats massing; the **optimal gap grows with the retention interval** (≈10–20% of it). | A 6-lesson course is a natural spacing engine: **re-surface each number at expanding gaps** (6&4 in L1 → again in L2's tie → again in the L4 review → again in the L6 capstone). Don't teach a concept once and abandon it. |
| 2.7 | **Interleaving / "desirable difficulties"** (Rohrer & Taylor 2007; Bjork & Bjork 2011; Kornell & Bjork 2008) | Mixed practice **63% vs 20%** blocked at 1 week (d=1.34). Interleaving builds *discrimination* between problem types. Feels harder, performs better. | The whole course is a discrimination problem: HH vs HT vs THH vs HTH; wait vs race; probability-recurrence (no `1+`) vs duration-recurrence (`1+`). **Interleave the contrasts**, especially the `1+`/no-`1+` trap that L2/L3 set up. Repurpose the late "consolidation" slot as a mixed set. |
| 2.8 | **Formative assessment & feedback** (Black & Wiliam 1998, *Inside the Black Box*, 578 studies, ES ≈ 0.4–0.7; Hattie & Timperley 2007) | Effective feedback answers **Where am I going? / How am I going? / Where next?** at the **task / process / self-regulation** (not "self"/praise) levels. | Audit the authored feedback against the three questions. The flagship's correct-answer copy is good ("why this is right"), but recaps should add **"where next"** routing, and hints should target **process** ("does the matched prefix survive?"), not praise. |
| 2.9 | **Assistance dilemma** (Koedinger & Aleven 2007) | Giving help lowers load + supports construction; withholding forces generation. No global optimum — it's contingent on learner state. | Don't pick one hint policy course-wide. **Give** (full ladder + reveal) for beginners/new ideas; **withhold** (`maxHintLevel: 2`, no reveal) on transfer/setup beats. The schema *already* supports per-beat `maxHintLevel`. |
| 2.10 | **Expertise-reversal effect** (Kalyuga, Ayres, Chandler & Sweller 2003; Kalyuga 2007) | Guidance/worked steps that help novices become **redundant or harmful** for experts (working-memory cost of processing what they already know). Full reversal documented. | A single fixed lesson **cannot** serve both personas. Primers and worked steps that rescue the beginner will *bore/slow* the quant. → **optional-depth + skip-via-pre-check** is not a nicety; it's required to avoid hurting the expert. |
| 2.11 | **Worked-example fading / completion problems** (Renkl & Atkinson 2003; Atkinson et al. 2003; Salden, Aleven, Renkl 2010) | Faded examples (full worked → completion → solo) beat example-problem pairs; **backward** fading (drop last steps first) > forward; **adaptive** fading > fixed. | The flagship equation beat (pre-fill `E0`, grade `E1`) is already a completion problem — generalize it: earlier lessons give more rows; later lessons grade more rows; **fade on success, not on lesson number.** |
| 2.12 | **Productive failure** (Kapur 2008, 2010, 2014) | Solving/guessing a novel problem *before* instruction beats direct-instruction on conceptual understanding & transfer, even though the first attempt "fails." | The "open with the bet" beat is exactly this — **keep it and protect it** (don't let a beginner-friendly redesign turn the bet into a tutorial). It is the single most pedagogically load-bearing beat for transfer. |
| 2.13 | **Hypercorrection effect** (Metcalfe et al.) | Errors made with **high confidence** are *more* likely to be corrected after feedback (surprise focuses attention; latent correct knowledge). | The "both take 4 flips" trap is a *high-confidence* error for many. Capturing it explicitly (as the fixture does) and then surprising the learner is optimal — make the confidence capture explicit and the correction vivid. |
| 2.14 | **The doer effect** (Koedinger, Kim, Jia, McLaughlin & Bier 2015; causal follow-up 2016) | In a real MOOC, *doing* an interactive activity was associated with **~6× the learning** of reading/watching the same content; shown causal. | Validates the product's "learn by doing, no text walls" thesis. **Inclusivity should add interaction, not text.** Beginner primers must be *micro-interactions* (tap, drag, predict), never paragraphs. |
| 2.15 | **Step-/interaction-grained tutoring ≈ human tutoring** (VanLehn 2011) | Step-based ITS reach effect sizes near human tutoring (≈0.76); granularity of interaction + feedback is a key driver. | The one-interaction-per-beat cadence is the right grain. For novices, push grain *finer* (split high-load beats, §2.6/Rec 6); for experts, coarser (merged beats). |

---

## 3. Diagnosis — sequencing & assessment failures for a near-zero learner

### 3.1 The progression is inverted (the headline failure)

The **canonical** unlock order (PRD §Course Path; `CONTEXT.md`) is:

```
L1 Pattern Hitting Times (HH vs HT, E=6 vs 4, 3 states, self-referential recurrence)   ← FLAGSHIP, BUILT
L2 Penney's Game        L3 Gambler's Ruin
L4 States & Streaks  (E[H]=2, 2 states, the SIMPLEST case)   ← labeled "consolidation"
L5 Longer Patterns      L6 Overlap Shortcut
```

A learner with no prior probability meets, on **beat 1 of the very first lesson**, a
question requiring the concepts of *expected value*, *a fair coin / probability ½*, *a
length-2 pattern*, and within five beats a recurrence `E0 = 1 + ½E1 + ½E0` that is **self-
referential** (E0 appears on both sides) and a 3-state automaton with a reset edge. The
*simplest possible instance* of the same machine — wait for one `H`, two states, `E[H]=2`,
no reset, a pure geometric — is deferred to L4 and explicitly framed as a post-hoc
"consolidation… after the extension arc" (PRD; `plan-L5-states-streaks.md`).

This is precisely the **"teach-to-target / skip-level"** sequencing that the learning-
trajectory experiments (Clements & Sarama; the 2022 "10 experiments") find *inferior* to
LT-ordered instruction. The repo's own curriculum agent reached the same conclusion: the
`plan-L5` Opus review states *"Pedagogically, the simplest case is stronger EARLY… The clean
'simplest example → fade to complexity' progression would be H → HH → HT… the course
currently teaches the harder case first… a heavier cognitive entry point than necessary."*
It then concedes the simplest-case lesson is kept late only because **L1 is already built**
and re-sequencing is risky — i.e., the late placement is an *implementation* compromise, not
a *pedagogical* judgment. My lens makes that explicit and offers a non-destructive fix (§6).

> **Discrepancy I rely on (flagged):** `docs/future_ideas.md` orders the back half **L4
> Overlap Shortcut → L5 States & Streaks → L6 Longer Patterns**, whereas the PRD/`CONTEXT.md`
> (canonical) order is **L4 States & Streaks → L5 Longer Patterns → L6 Overlap Shortcut**.
> Per the shared brief I treat **PRD/CONTEXT as canonical**. Either way the simplest case
> (`E[H]=2`) sits at L4 *or* L5 — late — so the diagnosis and fix below are order-agnostic.
> A useful side effect of my §6 restructure (pull the simplest case to an L0 on-ramp) is
> that it **removes this ambiguity** about where the warm-up belongs in the back half.

### 3.2 The implemented L1 beat order assumes prior knowledge it never builds

Current `fixtures/lesson-pattern-hitting-times.json` beat order (Required unless noted):

```
1 open-bet (prediction)     2 pattern-pick      3 simulate (coinSim, MERGED)   4 failure-edge (stateTap)
5 equation-tiles            6 refine-prediction (slider)   7 guided-solve (substitution)
8 theory-vs-sim             9 overlap (reveal)  10 bias-sandbox (Extension)    11 recap
```

Failures for a near-zero learner:

- **No concept on-ramp.** Beats 1–2 presuppose "fair coin," "½," "average wait," and reading
  `HH`/`HT` as targets. There is no beat that *establishes* these. (Doer-effect-compatible
  micro-primers are missing, §2.14.)
- **`simulate` (beat 3) is overloaded.** It is the explicit merge of the former simulate +
  state-machine beats (PRD Cycle 2). It simultaneously asks the novice to parse a streaming
  coin ribbon, an active prefix-state chip, a pulsing 3-node graph, *and* a scripted near-miss
  replay. High element-interactivity → working-memory overload for a novice (Kalyuga/Sweller).
- **Formalization precedes a qualitative model of "overlap."** The `overlap` reveal ("overlap
  is memory," beat 9) — the *conceptual punchline* — lands **after** the equation tiles (5),
  slider (6), and symbolic solve (7). A beginner thus manipulates symbols for the mechanism
  *before* they have a words-and-pictures model of it. (The PRD's own Open Question notes
  experts wanted the overlap/failure-edge insight before the tiles; it was deferred.) Note:
  `failure-edge` (4) *does* precede the tiles, which is good — but its qualitative meaning is
  never named until beat 9.
- **The bet is never reused as a measurement.** Beat 1 captures the (likely high-confidence)
  "both take 4" misconception — ideal hypercorrection fuel (§2.13) — but the recap (11)
  re-states results rather than re-presenting the *original* bet for an explicit belief
  update. `derived.predictionDeltaInitial` exists but the *flagship's own* opening bet is
  categorical ("which is longer"), while the slider (6) is numeric — so the initial→final
  delta is only partial.

### 3.3 The mastery / advance rule has no corrective loop

"Completion = mastery; finish all required beats once → unlocked" (PRD §Mastery). This
captures *doing* (good, doer effect) but discards the **feedback-corrective loop** that
*is* the active ingredient of Bloom's +1σ mastery effect (§2.3) and of formative assessment
(§2.8). Concretely: a learner can reach hint-level-3 reveal on every graded beat, never form
the skill, and still unlock — with only a `needsReview` flag that *"does not block unlocking"*
and a recommendation that is easy to ignore. There is no mechanism that **re-surfaces a
missed item later** (no spacing, no corrective re-test). The richer signals already designed
(`transferAttained` on L5/L6; the deferred "performance-threshold mastery" in
`future_ideas.md`) are exactly the missing loop but are confined to two lessons / deferred.

### 3.4 Retrieval, spacing, and interleaving are gestured at but not systematized

The plans contain *isolated* good instincts — L4/L5 open with retrieval grids
(`recall-grid`, `course-retrieval`); recaps are "retrieval-first"; L5 plans a `tripletReveal`
multi-lens convergence. But there is **no course-wide scheme**: most lessons open with a
fresh `prediction` (not a *retrieval* of the prior lesson); recaps risk being re-read
summaries (the built `RecapBeat` is largely static HH/HT copy); and the late "consolidation"
lesson **re-derives** `E[H]=2` (massed re-teaching) rather than **interleaving** the
accumulated cases (the higher-value desirable difficulty, §2.7).

### 3.5 The course can't serve both personas at once (expertise reversal)

Any inclusivity fix that hard-codes primers, extra worked steps, or finer-grained beats into
the single linear path will, by the expertise-reversal effect (§2.10), **slow and bore the
quant persona** — the explicit target user. The brief's "without boring the quant" constraint
is therefore not a soft preference; it is a hard design constraint that *forces* adaptivity
(optional depth / skip / pre-check), not a one-size path.

---

## 4. Recommendations for `docs/proposed-lessons.md` (L2–L6)

These keep the six-lesson gate intact and layer the §2 machinery onto it. (The structural
re-sequencing — the L0 on-ramp and the L4 repurpose — is in §6; here are the per-lesson,
beat-level changes the coordinator can fold into the L2–L6 specs.)

### 4.1 Course-level ordering (minimal change to the gate)

Keep the canonical unlock order **L1→L2→L3→L4→L5→L6**. The only ordering change I recommend
*inside* the numbered gate is **repurposing the L4 "States & Streaks" slot** (§6.2): from
"re-derive `E[H]=2`" to **"Mixed Review & Streaks"** — an interleaved retrieval checkpoint
across H/HH/HT/race/ruin. (`E[H]=2` itself moves to the optional L0 on-ramp, §6.1.) This is a
content swap within an existing slot, not a re-number — low blast radius.

### 4.2 Standard opening beat for every L2+ lesson: a *retrieval* warm-up

Replace/precede the cold `prediction` opener with a **graded cued-recall** of the *prior*
lesson's headline (testing effect + spacing, §2.5–2.6):

- **L2 Penney's** already opens by recalling `HH` slower than `HT` (6 vs 4) — make it a
  graded retrieval chip, not just prose, *then* spring the tie.
- **L3 Gambler's** open: "Last lesson, a near-miss for `HH` cost you — recall: was `E[HH]`
  6 or 4?" before the ruin bet.
- **L4 (repurposed) and L6** already plan retrieval grids (`recall-grid`,
  `course-retrieval`); keep them and make them the *template*.

This needs a **graded single-select / matching** capability the schema currently lacks
(`prediction` is ungraded by design — see `plan-L5` review). Either add a small `mcq`/
`retrievalGrid` variant (recommended; reused 5×) or grade in-component. See §6.5.

### 4.3 Per-lesson beat ordering: qualitative model **before** symbolic formalization

For each modeling lesson, insert a short **"name what just happened"** beat between the
exploration and the algebra, so the learner has a words-and-pictures model before tiles
(concrete→representational→abstract; reduces intrinsic load for novices):

- **L2:** after `first-step-split` (the one flip that decides), a one-line "so the race is
  decided by overlap *with the opponent*" qualitative beat **before** `win-prob-tiles`.
- **L3:** after `boundary-edge`, a qualitative "probability-recurrence has *no* `+1` (you're
  not counting flips, you're tracking a chance)" beat **before** `ruin-tiles`. This pre-empts
  the #1 trap (`1+` muscle memory) at the *concept* level, then the tiles confirm it.
- **L5/L6:** the `overlap-ruler` / `self-overlap` discovery beats already do this — keep them
  *before* the graded `equation-tiles`/`sum-it` beats.

This is the inclusive complement to **productive failure** (§2.12): the *bet* stays first
(struggle), but the *formalization* is preceded by a qualitative consolidation, not dropped
on the learner cold.

### 4.4 Faded, adaptive scaffolding policy (assistance dilemma + backward fading)

Make the fade an explicit, course-wide schedule keyed to *role*, faded *backward*, gated on
*success* (§2.9, §2.11):

| Lesson role | Hint policy | Equation/solve scaffolding |
|---|---|---|
| L0 Foundations (beginner) | Full 3-level ladder **incl. reveal** | All rows pre-filled except the last (max support) |
| L1 Flagship | Full ladder incl. reveal | Pre-fill `E0`, grade `E1` (current — keep) |
| L2 Penney's, L3 Gambler's | Full ladder incl. reveal; **cap setup beats at 2** | Grade more rows; pre-fill fewer |
| L5 Longer (transfer) | `maxHintLevel: 2` on `failure-edge`+`equation-tiles` (current) | Grade all non-absorbing rows (current) |
| L6 Overlap (capstone) | `maxHintLevel: 2` on `apply-*` | No worked steps; retrieval-only |

**Adaptive override (two-track):** a learner who is *struggling* (≥2 wrong on consecutive
graded beats) gets the cap *lifted* and a row *re-pre-filled* (adaptive fading "steps back in"
on failure — Salden et al. 2010). A learner who is *clearing first-try* gets rows *removed
faster*. This is the single most important adaptivity hook and it reuses existing plumbing
(hint ladder + `maxHintLevel` + the completion-problem pattern).

### 4.5 Make `transferAttained` the template for a course-wide mastery signal

L5/L6 already compute a per-lesson "did they do it without reveals" badge (`transferAttained`
→ "Fully mastered" vs "Completed"). **Generalize this signal to every lesson** as the light
mastery threshold (§6.4): it is the formative, non-punitive, spacing-driving mechanism the
course is missing, and the schema field (`ProgressDerivedSchema.transferAttained`) and the
"Fully mastered" UI already exist.

### 4.6 Per-lesson notes

- **L2 Penney's:** the `HH`/`HT` *tie* is a deliberate interleaved contrast against L1's `6≠4`
  — exactly the discrimination interleaving builds (§2.7). Keep it as beat 1–2. The `1+`-trap
  on `win-prob-tiles` is good desirable difficulty; author the *process-level* hint ("a
  probability doesn't pay a per-flip cost"), not praise (§2.8).
- **L3 Gambler's:** the two recurrences back-to-back (probability: no `1+`, boundary 1;
  duration: `1+`, boundary 0) are the course's best built-in interleaving. **Do not split them
  into separate lessons** — the side-by-side contrast is the point.
- **L4 (repurposed — see §6.2):** interleave H/HH/HT/THH/HTH "which waits longest, and which
  *ties* on the race" as a *mixed set*, not blocked by pattern.
- **L5 Longer (transfer):** strong as designed; it is the course's transfer test (novel pair,
  faded hints, no recap of HH/HT). Protect the "no HH/HT mention in the opener" exclusion.
- **L6 Overlap (capstone):** the most retrieval-heavy lesson (re-derives 6/4/8/10) — this is
  the **cumulative spaced-retrieval capstone**; ensure its opener retrieves *all* prior
  numbers at the longest gap (Cepeda expanding interval, §2.6).

---

## 5. Recommendations for the implemented L1 lesson (`fixtures/lesson-pattern-hitting-times.json`)

**Guiding principle:** do **not** insert the `E[H]=2` derivation *into* L1, and do **not**
de-fang the flagship. The simplest case belongs in the **optional L0 on-ramp** (§6.1) so a
beginner arrives at L1 already owning states + `½` + "on average." L1 then stays the
flagship "wow" for everyone. The L1 changes below are surgical and mostly **additive
(skippable) depth** so the quant path is byte-for-byte unchanged.

### 5.1 Do NOT reorder the gate to put `E[H]=2` before HH inside L1

The cleanest learning trajectory is `H → HH → HT` (the repo's own `plan-L5` review agrees).
But the right home for `H` is **L0 (a separate, skippable lesson)**, not a new first beat of
L1. Reasons: (a) keeps L1's identity as the hook; (b) lets the expert **skip the whole `H`
on-ramp via the pre-check** (expertise reversal) rather than sit through an in-lesson primer;
(c) avoids editing a built, gate-critical fixture's spine.

### 5.2 Split the overloaded `simulate` beat for the beginner track

Beat 3 (`simulate`, the merged coinSim+state-machine) is high element-interactivity (§3.2).
Add an *expertise-conditioned* expansion: on the **beginner track**, render it as 2–3
micro-beats — (a) flip & watch the stream only; (b) introduce the 3-node graph and the active
chip; (c) the scripted near-miss replay that gates `failure-edge`. On the **expert track**,
keep the single merged beat. Mechanism: a `beat.variants`/`density` flag or a beginner-only
beat group selected by the track (§6.3). No engine change (same `buildAutomaton('HH')`).

### 5.3 Name "overlap" qualitatively right after `failure-edge`

Insert a short, ungraded **"what just happened"** micro-beat between `failure-edge` (4) and
`equation-tiles` (5): *"A tail after one H throws `HH` all the way back, but for `HT` an extra
H keeps your progress. Hold that thought — now we'll put a number on it."* This gives the
beginner a words+picture model before symbols (§4.3) **without** moving the deep `overlap`
reveal (9), which still earns its place as the post-solve punchline (productive-failure
ordering preserved). Mark it **skippable**/auto-collapsed for the expert track.

### 5.4 Add just-in-time, collapsible primers to beats 1–3 (skippable)

Attach micro-explainers — *"½ means 1 in 2"* (a two-tap mini-interaction), *"'on average'
= what you'd get if you did this many times — we'll prove it by simulating"*, *"a 'state' =
how much of the pattern you've matched so far"* — as **collapsed, optional** affordances on
the relevant beats. Advanced users never expand them (expertise reversal). These must be
**micro-interactions, not text** (doer effect, §2.14).

### 5.5 Close the prediction loop and make it the formative signal

- Reuse the **beat-1 bet** in the recap for an explicit belief update ("you said *tie*; it's
  6 vs 4 — here's why"), exploiting hypercorrection (§2.13). The `refine-prediction` slider
  (6) already feeds `predictionDeltaInitial`; surface the *categorical* beat-1 → final shift
  too.
- Add the **light mastery signal** (§6.4) to L1: `mastered` iff the graded beats
  (`failure-edge`, `equation-tiles`) are first-try-correct with no reveal; else
  `completed — review`, and re-surface `failure-edge` in the L4 mixed review. Reuses the
  `transferAttained` plumbing pattern.

### 5.6 Formative checks to add (all client-side, no AI)

- **`failure-edge`** is the core state-thinking check — log first-try correctness as the L1
  mastery driver.
- **`equation-tiles`** — keep the completion-problem fade (pre-fill `E0`); for the beginner
  track, optionally pre-fill the `1 +` constant too and grade only the coin-split (finer fade).
- **No new graded beats are needed**; the win is in *scoring and re-surfacing* what's already
  there, not adding quizzes (avoids bloating the flagship; respects the doer effect).

---

## 6. Cross-cutting / structural proposals (the core of this lens)

### 6.1 Revised course progression (recommended)

The design keeps the **six-lesson gate unchanged in number and unlock order**, adds **one
optional on-ramp (L0)** that an expert skips, and **repurposes the L4 slot**. This satisfies
all three brief constraints at once: zero-foundation on-ramp (L0), undiminished depth
(L1–L6 intact + optional-depth toggles), and no expert boredom (skip + interleaving).

| Slot | Lesson | Core content | Track | New variable vs prior | Mastery/assessment role |
|---|---|---|---|---|---|
| **L0** *(NEW, optional, skippable)* | **The First Heads — Foundations** | Wait for one `H`: 2 states, no reset, `E[H]=2`. **+ JIT primers:** `½`="1 in 2"; "on average" (felt via sim); "a state". Pure geometric, the smallest `(I−Q)t=1`. | **Beginner only** (skipped by pre-check) | the machine itself, at minimum size | On-ramp; *no gate* — completing it just routes to L1 |
| **L1** | **Pattern Hitting Times** *(flagship, built)* | `HH` vs `HT`, 6 vs 4; overlap is memory; recurrence + sim + reveal | Both (beginner gets split `simulate` + collapsed primers) | overlap / near-miss memory | Gate; **light mastery signal added** (§6.4) |
| **L2** | **Penney's Game** | race on one stream; `HH`/`HT` **tie** (interleave vs L1); 7/8; non-transitive | Both | the **question** (how long → who's first) | Retrieval opener; setup beats cap@2 |
| **L3** | **Gambler's Ruin** | walk between walls; **probability vs duration** recurrence contrast (`no 1+` / `1+`) | Both | the **arena** (patterns → walk) | **Mid-course mastery checkpoint** after L3 (`three-lessons-complete`) — cumulative retrieval |
| **L4** | **Mixed Review & Streaks** *(repurposed States & Streaks slot)* | **Interleaved retrieval** across H/HH/HT/THH/race/ruin: "which waits longest? which ties? which has no `+1`?" `E[H]=2` reappears here as *one card among many* (retrieval, not re-derivation) | Both | consolidation **by interleaving** (Rohrer & Taylor) | Spaced-retrieval checkpoint; diagnostic of weak nodes |
| **L5** | **Longer Patterns** *(transfer)* | `THH` vs `HTH`, 8 vs 10; faded hints; novel pair | Both | **transfer** to unseen patterns | `transferAttained` → "Fully mastered" |
| **L6** | **The Overlap Shortcut** *(capstone)* | `E=Σ2^L`, martingale; re-derive 6/4/8/10 a new way | Both | the **method** (system → closed form) | **Cumulative retrieval capstone**; longest spacing gap |

**Why L0 *optional* rather than forcing the simplest-case as L1:** the LT "10 experiments"
(§2.2) show levels are *facilitative, not always necessary*; the expertise-reversal effect
(§2.10) shows forcing the primer on an expert *harms* them. So the simplest case is a
**gate-free, skippable on-ramp**, not a re-ordering of the flagship. This is also the lowest-
risk change: it adds a fixture (`lesson-first-heads`, reusing the already-specced States &
Streaks content) and a pre-check, rather than editing the built flagship's spine.

**Why repurpose L4 instead of deleting it:** the planners put a retrieval grid in States &
Streaks because they *sensed* it should consolidate — but re-deriving `E[H]=2` (now taught in
L0) is *massed re-teaching*. Converting the slot to an **interleaved mixed set** keeps the
milestone (`first-pattern-cracked` → rename to something like "patterns-connected") and the
spaced-retrieval value, at the higher effect size of interleaving over blocking (§2.7).

**Fallback if the team rejects an L0:** then make the simplest case the *first beat-group of
L1* (a 3-beat "warm-up" sub-lesson before the bet) gated open for beginners and auto-skipped
for the pre-check'd expert. Less clean (edits the built fixture) but preserves the on-ramp.

### 6.2 The repurposed L4 "Mixed Review" in detail

A 6–8 beat interleaved checkpoint (not a new concept):

1. **Retrieval grid** (graded): match {2, 4, 6, 8, 10, 7/8, i(N−i)} → their lessons/patterns.
2. **Mixed "which waits longest?"**: a shuffled set {H, HT, THH, HH, HTH, HHH} ranked by wait —
   forces discrimination, not recall of one (Rohrer & Taylor).
3. **Mixed "race or wait?"**: interleave 2–3 items asking *who's first* (L2) vs *how long*
   (L1) — the decoupling is the most confusable contrast.
4. **`+1` or not?**: interleave probability-recurrence vs duration-recurrence shapes (L3 trap).
5. **One re-surfaced weak node**: pick the beat the learner most struggled on across L1–L3
   (from the mastery signal) and re-test it (corrective loop, §2.3).
6. **Recap + streak**: generate-then-reveal; award the connection milestone.

### 6.3 Two-track design (serve beginner + quant without boring either)

The mechanism is **four cheap, composable hooks** — not a separate app:

| Hook | What it does | Beginner | Expert | Backing |
|---|---|---|---|---|
| **A. Diagnostic pre-check** (course entry, 4–5 micro-items) | "½ of 8?"; "you flip till the first H — about how many flips?"; "tap how much of `HH` you've matched after one `H`". Scores route to Track A (start at L0) or Track B (start at L1, primers collapsed). | → L0 + expanded/split beats + full hints | → L1, L0 offered as "skip/optional", primers collapsed | Expertise reversal (§2.10); LT levels facilitative-not-necessary (§2.2) |
| **B. Optional-depth toggles** | Per-beat collapsible primers (§5.4) and "go deeper" expert notes (e.g., the `Σ2^L` aside in L1's overlap). Default-collapsed. | Expands primers | Expands expert notes; never sees primers | Optional depth avoids redundancy (§2.10) |
| **C. Just-in-time primers** | Micro-interactions attached to the first beat needing a prereq (fraction, EV, state). Never blocking. | Sees them inline | Skips (collapsed) | Doer effect (§2.14); JIT reduces upfront load |
| **D. Adaptive hint cap / fade** | Caps lift on struggle, tighten on success; rows re-pre-fill on failure, drop faster on first-try wins. | More assistance | Less assistance, faster fade | Assistance dilemma (§2.9); adaptive fading (§2.11) |

**State needed:** a single `track: 'A' | 'B'` (from the pre-check) plus the existing
per-beat hint/attempt counters. `track` can live on the user doc / progress; the renderer
chooses beat density and default-collapsed state from it. This is *far* cheaper than two
content sets — it's mostly conditional rendering + which beats are `required`.

**Anti-boredom guarantee for the quant:** Track B is essentially today's path (flagship-
first, merged beats, primers hidden, expert notes available, hints uncapped until the
transfer lessons). The inclusivity additions are *invisible* to them. This is the
expertise-reversal mandate satisfied by construction.

### 6.4 Mastery + spaced-retrieval + interleaving scheme (course-wide)

**Mastery (light, non-blocking, corrective):**

- **Per-lesson signal** (generalize `transferAttained`): `mastered` iff first-try-correct on
  that lesson's graded beats with no full reveal; else `completed — review`. Reuses
  `ProgressDerivedSchema` + the "Fully mastered" UI.
- **Non-blocking unlock** stays (momentum; the brief's anti-frustration goal). The signal's
  job is to **drive re-surfacing**, not to lock the gate — this is the Bloom corrective loop
  (§2.3) made motivational rather than punitive.
- **Two mastery checkpoints** (the existing milestones become *retrieval events*): mid-course
  after L3, and the L6 capstone — each a short cumulative low-stakes retest of earlier
  lessons (testing effect at the longest gaps).

**Spaced retrieval (the 6-lesson path as a spacing engine, §2.6):** re-surface each headline
at **expanding gaps**:

```
E[HH]=6, E[HT]=4   introduced L1
                   → recalled L2 (the tie)            [gap: 1 lesson]
                   → recalled L4 (mixed review)       [gap: 2 lessons]
                   → recalled L6 (capstone Σ2^L)      [gap: 2+ lessons]
E[H]=2             introduced L0 → reappears L4, L6
E[THH]=8,E[HTH]=10 introduced L5 → re-derived L6
```

Implement as the **standard retrieval-opener beat** (§4.2) per lesson + the L4 mixed set +
the L6 capstone. No scheduler needed; the unlock order *is* the schedule.

**Interleaving (§2.7):** concentrate mixed practice where confusions cluster — (a) wait vs
race (L2 opener + L4); (b) probability-recurrence vs duration-recurrence / the `1+` trap (L3
+ L4); (c) which-pattern-waits-longest across lengths (L4 + L6). Prefer **mixed sets over
blocked** in every review beat. Warn authors (and learners) that interleaving *feels* harder
and *performs* better (desirable difficulty) so the team doesn't "fix" the difficulty away.

**Beat-level granularity rule:** split high-load beats for the beginner track (flagship
`simulate`, §5.2; any 4-row equation build); keep merged for experts. Finer grain for
novices, coarser for experts (VanLehn 2011 + expertise reversal).

### 6.5 Minimal schema/infra to enable the above

(For the coordinator; consistent with the `plan-L*` implementation reviews.)

- **A graded recall variant.** `prediction` is ungraded by design (`plan-L5` review), so
  retrieval-openers and mixed-review checks need either a small `mcq`/`retrievalGrid`
  interaction (recommended — reused in L2, L4, L6, and the pre-check) or in-component grading.
- **`track`** field (A/B) on progress/user; renderer reads it for beat density + default-
  collapsed depth. Pre-check is a tiny pre-L1 flow.
- **`beat.density`/variant or a beginner-only beat group** so the same lesson renders split
  vs merged beats by track (avoids duplicate fixtures).
- **High-water hint mark** (`maxHintLevelByBeat`) persisted (the `plan-L5`/`plan-L6` reviews
  already call for this for `transferAttained`) — it is also exactly what the light per-lesson
  mastery signal needs.
- **Optional-depth blocks**: a `collapsible` flag on a beat or an inline "primer"/"expert-
  note" content slot, default-collapsed, never `required`.

None of this requires AI (Phase-1 constraint holds): all checks are client-side against the
engine, all primers are hand-authored micro-interactions.

---

## 7. Tradeoffs & open questions (for the human to decide)

1. **L0 on-ramp vs scope/gate risk.** Adding L0 is one more fixture + a pre-check before the
   Wednesday gate. The PRD already flags build risk. *Tradeoff:* L0 reuses the already-specced
   States & Streaks content (engine is free — `buildAutomaton('H')` works), so the marginal
   cost is a small fixture + the retrieval/`mcq` variant. **My call:** worth it for
   inclusivity; if the gate is at risk, ship L0 *after* the gate and route beginners straight
   to L1 with primers expanded in the interim.
2. **Pre-check accuracy & cold-start.** A 4–5 item pre-check will mis-route some learners
   (false "expert"). *Mitigation:* make L0 always *offered* ("New to this? Start here") and
   make Track B's primers one tap away (the adaptive fade, §6.3-D, re-expands support on
   struggle). Never *force* either track.
3. **Is `E[H]=2` even necessary before `HH`?** The LT evidence (§2.2) is honest that levels
   can be *facilitative but not necessary*. A motivated beginner *might* survive HH-first.
   *Open question:* instrument it — A/B the pre-check routing and compare L1 first-try rates
   and D1 return. (The `answer_submitted` / `first_try_correct` events already planned support
   this.)
4. **Productive failure vs scaffolding tension.** Beginners benefit from *more* guidance
   (worked examples), but productive failure says *struggle first* improves transfer. *These
   can conflict.* My resolution: keep the **bet/prediction** (struggle) for everyone, but
   scaffold the **formalization** (post-struggle) more for beginners. Watch that the beginner
   track doesn't turn the bet into a tutorial.
5. **Interleaving feels worse in-the-moment** (lower fluency during practice, possible
   frustration/abandonment for an anxious novice). *Tradeoff vs* its superior retention/
   transfer. *Mitigation:* place heavy interleaving *after* initial competence (L4+, not L0),
   and frame the difficulty ("this feels hard because it's working").
6. **Non-blocking mastery vs real mastery.** Keeping unlock non-blocking preserves momentum
   but means a learner can advance un-mastered. *Open question:* should the **mid-course (L3)
   checkpoint** be the *one* place mastery is (softly) required — e.g., a required corrective
   re-test of the weakest node before L4 — to get a Bloom-style loop without a frustrating
   hard gate everywhere?
7. **Renaming `lesson-states-streaks`'s role.** Repurposing L4 to "Mixed Review" changes a
   milestone's meaning (`first-pattern-cracked`). *Tradeoff:* cleaner pedagogy vs churn in
   IDs/milestones/`CONTEXT.md`. If churn is unacceptable, keep the lesson id and just author
   it as interleaved review under the same name.
8. **`future_ideas.md` vs PRD order.** I built on the **PRD/CONTEXT** order per the brief; if
   the team actually intends the `future_ideas` order (Overlap Shortcut at L4), the §6 plan is
   unchanged in spirit (still pull the simplest case to L0, still repurpose the late warm-up
   slot) but the slot numbers shift. **The two docs must be reconciled regardless.**

---

## 8. Sources

**Learning progressions / trajectories**
- Simon, M. A. (1995). Reconstructing mathematics pedagogy from a constructivist perspective.
  *Journal for Research in Mathematics Education*, 26(2), 114–145. (Hypothetical learning trajectory.)
- Clements, D. H., & Sarama, J. (2004). Learning trajectories in mathematics education.
  *Mathematical Thinking and Learning*, 6(2), 81–89.
- Clements, D. H., Sarama, J., et al. (2022). Lessons Learned from 10 Experiments That Tested
  the Efficacy and Assumptions of Hypothetical Learning Trajectories. *Education Sciences*,
  12(3), 195. (LT-ordered > skip-level in 5/10; levels "facilitative, not always necessary.")
- Confrey, J., et al. — learning-trajectories program (CADRE synthesis, *cadrek12.org*).

**Mastery learning / 2-sigma**
- Bloom, B. S. (1984). The 2 Sigma Problem. *Educational Researcher*, 13(6), 4–16.
  (Mastery learning +1σ; tutoring +2σ; feedback-corrective effect size ≈ 1.0.)
- Wiliam/“Two-Sigma Tutoring: Separating Science Fiction from Science Fact,” *Education Next*
  (2023) — reanalysis: ~half the effect is testing+feedback (meta-analytic 0.73–0.96σ).

**Retrieval practice / testing effect**
- Roediger, H. L., & Karpicke, J. D. (2006). Test-Enhanced Learning. *Psychological Science*,
  17(3), 249–255. (STTT 61% vs SSSS 40% at 1 week; reversed from the 5-min test.)

**Spacing / distributed practice**
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed Practice
  in Verbal Recall Tasks: A Review and Quantitative Synthesis. *Psychological Bulletin*,
  132(3), 354–380. (839 effects; optimal gap grows with retention interval.)
- Cepeda, N. J., et al. (2008). Spacing effects in learning: a temporal ridgeline of optimal
  retention. *Psychological Science*, 19(11), 1095–1102.

**Interleaving / desirable difficulties**
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning.
  *Instructional Science*, 35(6), 481–498. (Mixed 63% vs blocked 20% at 1 week, d≈1.34.)
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way:
  creating desirable difficulties to enhance learning. (FABBS chapter.)
- Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: is spacing the "enemy
  of induction"? *Psychological Science*, 19(6), 585–592. (Interleaving aids induction.)

**Formative assessment & feedback**
- Black, P., & Wiliam, D. (1998). Assessment and Classroom Learning / *Inside the Black Box*.
  *Assessment in Education*, 5(1). (578 studies; gains ≈ 0.4–0.7σ.)
- Hattie, J., & Timperley, H. (2007). The Power of Feedback. *Review of Educational Research*,
  77(1), 81–112. (Feed-up/back/forward × task/process/self-regulation/self levels.)

**Assistance dilemma / contingent tutoring / fading / expertise reversal**
- Koedinger, K. R., & Aleven, V. (2007). Exploring the Assistance Dilemma in Experiments with
  Cognitive Tutors. *Educational Psychology Review*, 19(3), 239–264.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The Expertise Reversal Effect.
  *Educational Psychologist*, 38(1), 23–31. Kalyuga, S. (2007). *Educational Psychology
  Review*, 19, 509–539.
- Renkl, A., & Atkinson, R. K. (2003); Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003);
  Renkl, Atkinson, Maier & Staley (2002) — faded worked examples / completion problems;
  backward fading > forward.
- Salden, R. J. C. M., Aleven, V., Schwonke, R., & Renkl, A. (2010). The expertise reversal
  effect and worked examples in tutored problem solving. *Instructional Science*. (Adaptive
  fading > fixed fading.)
- VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring
  systems, and other tutoring systems. *Educational Psychologist*, 46(4), 197–221.

**Productive failure / hypercorrection / doer effect**
- Kapur, M. (2008). Productive Failure. *Cognition and Instruction*, 26(3), 379–424; Kapur, M.
  (2010), *Instructional Science*, 38(6), 523–550; Kapur, M. (2014), *Cognitive Science*, 38(5).
- Metcalfe, J. (e.g., 2017, *Annual Review of Psychology*, "Learning from Errors") —
  hypercorrection effect (high-confidence errors corrected more readily).
- Koedinger, K. R., Kim, J., Jia, J., McLaughlin, E. A., & Bier, N. L. (2015). Learning is Not
  a Spectator Sport: Doing is Better than Watching for Learning from a MOOC. *L@S '15*.
  (~6× learning benefit of doing vs reading/watching; causal follow-up 2016.)

**Repo artifacts grounding this analysis**
- `docs/mvp_prd.md` (course path, flagship beat flow, mastery rule, analytics, phases);
  `docs/proposed-lessons.md` (L2–L6 arc, "one new variable per lesson"); `docs/future_ideas.md`
  (L1–L6 ordering variant + deferred performance-threshold mastery); `CONTEXT.md` (canonical
  lesson order); `fixtures/lesson-pattern-hitting-times.json` (11-beat L1); `src/content/
  schema.ts` (interaction union, `maxHintLevel`, `ProgressDerived.transferAttained`);
  `audits/ideation/agent-5-curriculum.md`, `plan-L4-overlap-shortcut.md`,
  `plan-L5-states-streaks.md`, `plan-L6-longer-patterns.md`.
