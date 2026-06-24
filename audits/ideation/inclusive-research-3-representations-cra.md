# Inclusive Research 3 — Concrete→Abstract Representations, Multiple Representations, Dual Coding & Analogy

**Agent 3 of 5 · Lens: "How do we make abstractions graspable from zero?" · 2026-06-23**

> Scope note / discrepancy flag (asked for in the brief): I treat the **PRD + CONTEXT.md**
> order as canonical — L1 Pattern Hitting Times → L2 Penney's → L3 Gambler's Ruin → **L4 States &
> Streaks → L5 Longer Patterns → L6 The Overlap Shortcut (capstone, last)**. `docs/future_ideas.md`
> and the `plan-L4-overlap-shortcut.md` / `plan-L5-states-streaks.md` / `plan-L6-longer-patterns.md`
> files use a **different** order (Overlap Shortcut at **L4**, States & Streaks L5, Longer Patterns
> L6) and the `docs/proposed-lessons.md` section anchors still say "L4 Penney's / L5 Gambler's / L6
> Overlap." **This matters to my lens:** the `Σ2^L` closed form and the martingale are the *most
> idealized* representations in the course, so on concreteness-fading grounds they must come **after**
> the long-way recurrence work, i.e. the PRD's "capstone last" order is the right one and the
> future_ideas order is pedagogically backwards. Where I say "L4 = States & Streaks, L6 = Overlap
> Shortcut," I mean the PRD order. I refer to lessons by name to avoid number collisions.

---

## 1. Lens & TL;DR

**My lens:** every lesson in this course asks a near-zero learner to operate on *abstract objects* — a
"state," a transition diagram, a recurrence, "expected value," "overlap is memory," a random walk,
`Σ2^L`, a martingale. The question is not "is the math right" (it is) but **"what is the concrete
thing each abstraction stands for, and have we let the learner touch it before we hand them the
symbol?"** The current product, written by and for symbol-fluent quants, mostly hands over the symbol
first. That is the *expert blind spot* (Nathan & Koedinger 2000) operationalized as a product.

**Top recommendations (concrete, prioritized):**

1. **Build a course-wide notation onboarding ladder** (§6) and hold every beat to it: *concrete
   referent → linked intermediate representation → symbol, in that order, never skipped.* This is the
   core deliverable of my lens.
2. **L1: ground "expected wait" as the average of hand-counted runs BEFORE any equation or slider.**
   Today the learner commits to a number (`refine-prediction`, beat 6) and reads `E0 = 1 + ½E1 + ½E0`
   (beat 5) *before* the run-and-average chart (`theory-vs-sim`, beat 8) ever shows what "average over
   many runs" means. The concrete anchor for the central abstraction arrives last. Move a lightweight
   version of it first.
3. **L1: fix the unlinked-representations gap.** The `StateGraph` labels nodes `∅ / H / HH`; the
   `equationTiles` and `failure-edge` beats label the same states `E0 / E1 / E2`. **The dictionary
   `∅=E0, H=E1, HH=E2` is never taught.** Dual-label the graph and dyna-link tiles to edges.
4. **L1: stop dropping `E`-subscripts, `½`-as-weight, the `1+` cost, and the probability split all on
   one screen** (`equation-tiles`). Fade them in across sub-steps; introduce the symbol `E0` as a
   *nickname* for a situation the learner has already lived ("matched nothing yet").
5. **L2–L6: each lesson introduces a brand-new abstract object with even less grounding than L1.**
   Add a 1–2 beat concrete on-ramp to each new object (win-probability, two-wall walk, `Σ2^L`,
   martingale) per the ladders in §6 before the widget that formalizes it.
6. **Tame the perceptually-rich widgets (Kaminski caution).** RaceTrack swarms, ~100 WalkerSwarm
   tokens, the "city-skyline" GamblerLedger glowing gold are gorgeous but risk pulling attention to
   surface spectacle and away from structure. Each hero needs a *lean, explicitly-mapped* structural
   read-out, and a "slow first instance" before the swarm.
7. **Use matched-pair comparison deliberately (analogical encoding).** `HH` vs `HT`, `THH` vs `HTH`,
   probability-recurrence vs duration-recurrence are gold for transfer — *if* the two cases are
   aligned side-by-side with the learner articulating the one structural difference. Make that
   articulation an explicit, graded micro-moment, not a narrated reveal.
8. **Make the abstraction earnable, not assumed.** Keep the quant-interview depth, but gate it behind
   a concrete layer the anxious/under-prepared learner can complete, and let the fluent learner
   *fast-forward* the grounding rather than removing it.

---

## 2. Learning-science findings

Each finding: framework + citation + one-line "so what for this product."

**A. Concrete–Representational–Abstract (CRA) sequence.** Rooted in Bruner & Kenney's enactive →
iconic → symbolic stages (Bruner & Kenney 1965; Bruner 1966). As a math intervention (manipulatives →
drawings → notation) it is one of the better-evidenced strategies for struggling learners: a 2025
meta-analysis of 30 single-case studies found a very large overall effect (Tau-BC ≈ 0.99) and an
evidence-based-practice synthesis (Hughes et al. 2018) classifies it as evidence-based for learners
who struggle in math (Ebner, MacDonald, Grekov & Aspiranti 2025; Witzel, Mercer & Miller 2003).
Notably, the meta-analysis found **non-integrated** CRA (distinct stages) slightly *outperformed*
integrated CRA. **So what:** a near-zero learner needs to *do → see → symbolize* each object, in
separable steps — which argues against L1's current habit of cramming the doing, seeing, and
symbolizing of the recurrence onto one screen.

**B. Concreteness fading.** Start concrete, then *explicitly and gradually* strip detail toward the
symbol; this beats concrete-only *and* abstract-only on **transfer**, the exact outcome this course
cares about (Fyfe, McNeil, Son & Goldstone 2014, *Educational Psychology Review* 26(1):9–25; McNeil &
Fyfe 2012, *Learning and Instruction* 22:440–448 — fading won at immediate, 1-week, and 3-week
transfer; Goldstone & Son 2005, *J. Learning Sciences*). The four mechanisms Fyfe et al. name map
1:1 onto this product's needs: (1) interpret opaque symbols via known concrete objects, (2) embodied
grounding, (3) a store of memorable images for when symbols lose meaning, (4) stripping extraneous
detail to reach the generalizable core. Fyfe & Nathan (2019) add: **order matters and the *final*
representation shapes what's encoded** — so each ladder must *end* on the symbol but *pass through*
the concrete. **So what:** the course should be a fading staircase; the `Σ2^L`/martingale capstone
belongs *last* (PRD order), not at L4.

**C. The "perceptually rich concrete can backfire" caution.** Kaminski, Sloutsky & Heckler (2008,
*Science* 320:454–455) found college students transferred a math structure better from a single
generic/abstract instantiation than from concrete, perceptually rich ones, arguing extraneous surface
detail distracts from structure. **This is contested:** De Bock et al. (2011) and Trninic, Wagner &
Kapur (2020, *Cognitive Science* "The Disappearing Advantage…") show the effect evaporates when the
concrete condition is well-designed; and "blend" (concrete + abstract shown together) has beaten
abstract-only ~3× on transfer in replications. **So what:** the resolution is not "go abstract" — it's
**lean, structure-mapped concreteness + fading/blending.** This is a direct warning for the visually
lavish widget slate (swarms, glowing skylines): richness that doesn't map to structure is a tax.

**D. Multiple external representations — the DeFT framework.** Ainsworth (2006, *Learning and
Instruction* 16(3):183–198; Ainsworth 1999) names three functions of multiple representations:
**complement, constrain, construct.** A familiar representation can *constrain* (scaffold)
interpretation of an unfamiliar one. But the dominant *finding* is a warning: **learners treat
representations in isolation and find translating between them hard, especially when representations
are unlinked.** The strongest remedy is **dyna-linking** — action on one representation is reflected
live in another. **So what:** the graph (`∅/H/HH`) and the equation (`E0/E1/E2`) are currently
*unlinked* — the learner must privately build the dictionary. Dyna-link them.

**E. Dual coding + multimedia principles.** Paivio's dual coding (1986; Clark & Paivio 1991) and
Mayer's Cognitive Theory of Multimedia Learning (2009) — dual visual/verbal channels, limited
capacity, active integration — yield design principles that bear directly here: **pre-training**
(teach the key concepts/terms *before* the complex task), **segmenting** (chunk into learner-paced
parts), **spatial/temporal contiguity** (put the symbol next to the picture it names, at the same
time), **signaling** (cue the one thing that matters), **coherence/redundancy** (cut decorative or
duplicated detail). **So what:** "pre-training" = a notation pre-beat before each symbol-heavy beat;
"contiguity" = show `E0` *on* the `∅` node, not in a separate legend; "coherence" = the Kaminski
caution again.

**F. Analogical encoding / case comparison.** Transfer depends on extracting *deep structure*; without
it, learners don't spontaneously transfer (Gick & Holyoak 1983, *Cognitive Psychology* 15:1–38).
Having learners **compare two cases and articulate the shared structure** produces better schema
abstraction and transfer than studying cases separately — and in some studies better than being
*told* the principle (Gentner, Loewenstein & Thompson 2003, *J. Educational Psychology*). Contrasting
cases also prepare learners to *understand* a subsequent explanation (Schwartz & Bransford 1998;
Schwartz et al. 2011). **So what:** the course is *built* on matched pairs (`HH`/`HT`, `THH`/`HTH`,
probability-vs-duration recurrence) — but it currently *narrates* the contrast (e.g. L1 `overlap`
beat) rather than making the learner *align and articulate* it. Convert reveals into comparisons.

**G. Process–object duality (reification).** Sfard (1991, *Educational Studies in Mathematics*
22:1–36): mathematical ideas are first grasped **operationally** (as a process you *do*) and only
later **structurally** (as an object you manipulate); the shift ("reification") is hard, and
**symbolic notation is necessary but not sufficient** for it. **So what:** "expected value," "a
state," "a recurrence," "overlap" must each begin as a *process the learner performs* (average these
counts; track this suffix; tell the one-flip story) before they become an *object* (`E0`; a node; an
equation you substitute into). The product repeatedly presents the object first.

**H. Expert blind spot / Symbol Precedence vs. Verbal Precedence — the keystone.** Nathan & Koedinger
(2000, *JRME*) and Koedinger & Nathan (2004, *J. Learning Sciences*) showed that algebra
teachers/experts *believe* symbolic equations are easier for students than verbal/story versions
("Symbol Precedence Model"), but students' actual performance is the **opposite** — verbal/grounded
forms are solved more often (≈50% vs <30% on equations) ("Verbal Precedence Model"). Experts assume
the symbol is the natural starting point because it is *for them*. **So what:** this is the product's
core risk stated as a citation. The whole experience is authored from the Green-Book reader's
intuition that "`E0 = 1 + ½E1 + ½E0`" is the clean, easy starting representation. For a near-zero
learner it is the *hardest* representation, and it currently arrives early and unscaffolded.

---

## 3. Diagnosis — where the current product fails a near-zero learner (through this lens)

### 3.1 L1 (implemented) — quoting the fixture and the components

**(a) The very first screen is abstract-first.** `open-bet` (beat 1) asks: *"You flip a fair coin
until you see HH. Then again until you see HT. Which wait is longer, and by how much?"* with option
*"They tie — both take 4 flips on average."* This requires the learner to already hold *fair coin*,
*wait until a pattern*, and **expected value** ("on average," "4 flips") — three abstractions — before
a single coin has been flipped on screen. The first concrete coin-flipping is `simulate` (beat 3).
For the target persona this is the expert blind spot in miniature: the bet *feels* like a gentle
intuition prompt to a quant, but to a zero-foundation learner it is symbol/term shock before any
referent exists. (Verbal Precedence Model: ground first, predict second.)

**(b) Unlinked representations — the dictionary is never taught.** This is the sharpest finding.
The `StateGraph` renders nodes with **prefix labels** `∅ / H / HH`:

```214:228:src/lesson/konva/StateGraph.tsx
        {states.map((s, i) => (
          <Text
            key={`lbl-${s.id}`}
            text={s.label}
            ...
            fill={s.id === activeState ? C.quillStrong : C.ink}
            listening={false}
          />
        ))}
```

But `failure-edge` (beat 4) grades transitions on `E1`, and `equation-tiles` (beat 5) builds rows
keyed `E0 / E1 / E2`. The fixture's failure-edge prompt even says *"After matching one H…"* (concrete)
while the tap targets and equations are `E1`/`E0` (symbolic). The `EquationTilesBeat` does provide a
legend —

```92:96:src/lesson/beats/EquationTilesBeat.tsx
const STATE_LEGEND: { id: string; text: string }[] = [
  { id: 'E0', text: 'matched none of HH yet (start)' },
  { id: 'E1', text: 'matched one H (one flip from HH)' },
  { id: 'E2', text: 'matched HH — done, so E₂ = 0' },
]
```

— but this *introduces* `E0/E1/E2` for the first time, as text to read, at the moment of heaviest
symbol load (beat 5), and **the graph the learner stared at in beats 3–4 never showed an `E`-label at
all.** Per Ainsworth (2006), this is the classic unlinked-MER failure: the learner must privately
construct `∅=E0, H=E1, HH=E2`. A fluent quant does it instantly; a near-zero learner may not realize
they're the same objects.

**(c) The recurrence lands as one symbol avalanche.** `equation-tiles` (beat 5) introduces, *together*:
the subscript notation `E0/E1/E2`, `½` *as a weight on a branch* (distinct from `½` as a flip
frequency), the `1+` flip-cost convention, and the probability-weighted decomposition — with `E0`
prefilled as a "worked example" the learner *reads*, then asked to build `E1`. The component's own
copy carries the entire conceptual load in prose (`E0_WORKED_EXPLANATION`: *"From state E₀ (no H
matched yet), one flip always costs 1. With probability ½ you flip H and advance to E₁; with
probability ½ you flip T and fall back to E₀."*). For the persona this is elegant; for a near-zero
learner it violates segmenting (Mayer) and reification order (Sfard) at once — the recurrence is
presented as a finished *object* before the learner has performed the *process* it compresses.

**(d) "Expected value" is reified before it's grounded — and in the wrong beat order.**
`refine-prediction` (beat 6) asks the learner to "commit to a number: how many flips, on average,
until HH?" on a slider; `guided-solve` (beat 7) derives `E0 = 6`; only then does `theory-vs-sim`
(beat 8) show the empirical mean of many runs converging to 6. The **one beat that concretely defines
what "expected wait" *is*** (run it many times, average the counts) arrives *after* the learner has
already predicted it, built its equation, and solved it. Sfard's order is inverted: object (E0 in an
equation) → … → process (averaging runs) last.

**(e) The "overlap is memory" payoff is narrated, not compared.** `overlap` (beat 9) tells the learner
*"HH's near-miss resets to zero; HT's near-miss preserves progress."* The two highlighted edges are
shown, but the learner is a reader, not an aligner. Gentner's work says the transfer-producing move is
to have the learner *place the two cases side by side and articulate the single structural
difference* themselves.

**(f) `pattern-pick` (beat 2) is a no-op confirmation.** It adds a screen with no concrete or
representational work (the contrast `HH` vs `HT` is fixed). Minor, but it spends a beat that could
host the missing concrete on-ramp.

### 3.2 L2–L6 (proposed) — each new abstraction arrives with *less* grounding than L1

The proposed slate is widget-rich and mathematically careful, but through my lens it repeatedly
introduces a **new abstract object** and then formalizes it in a widget without a concrete on-ramp:

- **Penney's win-probability recurrence** (`win-prob-tiles`): a *second kind of recurrence* (no `1+`,
  boundary 1/0). The plans correctly flag the "muscle-memory `1+`" trap, but a near-zero learner never
  reified the *first* recurrence; now there are two, distinguished only symbolically. No concrete
  grounding of "probability A appears first" as *a fraction of races A won* before the tiles.
- **Conway numbers / autocorrelation as a binary integer** (`conway-aligner`, `AutocorrelationRuler`):
  this is close to pure symbol manipulation — slide, read bits, interpret as base-2, form a ratio. The
  ruler is tactile (good), but "the overlap *is* a binary number whose value sets the odds" is a steep
  reification with no intermediate.
- **Gambler's Ruin: two recurrences at once** (`ruin-tiles` + `duration-tiles`). The contrast is the
  lesson, which is great for analogical encoding — but only if both are first grounded concretely
  (fraction of hand-walks that reach the top; average steps of hand-walks). The plan's `walk-once`/
  `ruin-board` give the walk a concrete body (good); the *probability* and *duration* abstractions
  still arrive as tile targets.
- **The Overlap Shortcut: `Σ2^L`, and the martingale.** This is the most abstract content in the
  course: a closed-form sum indexed by overlap lengths, *justified by optional stopping on a
  martingale*. The plan's GamblerLedger is a genuine concrete grounding of the proof (count money in
  vs out) — but `Σ`-notation, exponents, and "a fair game can't make money on average ⇒ E[T] = Σ2^L"
  are three reifications stacked. (The plan's own review flags optional stopping as "the most abstract
  idea in the slate.")
- **The widgets risk the Kaminski tax.** RaceTrack "hundreds of races stream," `OddsDial` needle
  sweeps, WalkerSwarm "~100 tokens," GamblerLedger "flows like a city skyline … survivors glow gold,"
  TournamentHeatmap 8×8. These are beautiful and *can* be excellent dual-coded structure maps — but a
  swarm of 100 animated tokens is exactly the "perceptually rich" surface that Kaminski/Trninic warn
  can crowd out the structural read (here: "the outcome bar settles at i/N"). Spectacle must be
  subordinate to, and explicitly mapped onto, the one structural quantity.

### 3.3 Cross-cutting: notation arrives before the referent, course-wide

`E0/E1`, `½`, `Σ`, exponents `2^L`, `P_i`/`D_i`, `r=q/p` are each introduced as the *first*
encounter with their idea. There is no shared "notation onboarding" convention, so every lesson
re-pays the symbol-shock tax. The course needs one ladder discipline (§6) applied everywhere.

---

## 4. Recommendations for `docs/proposed-lessons.md` (L2–L6)

Per lesson: what to **add / cut / reorder / reword**, through the concrete→abstract / MER / analogy
lens. (All ladders referenced here are specified in §6.)

### L2 — Penney's Game
- **ADD a concrete on-ramp to "who appears first" before any probability symbol.** Before
  `win-prob-tiles`, add (or fold into `race-the-tie`) a *hand-tally* moment: run ~10 races by hand,
  write a tick under "HH first" or "HT first," see ~5/5. Ground `P(A first)` as **"the share of races
  A won"** — the concrete referent — before it is ever `w_s`. (Ladder: *win-probability*.)
- **REWORD/REORDER the win-probability recurrence as a contrast, not a new object.** Put the
  duration recurrence (`1 + …`) and the win-probability recurrence (`… no 1+`, boundary 1/0)
  **side by side** and have the learner *tap the one difference* ("the `1+` is gone; the ends are 1
  and 0, not 0 and 0"). This is analogical encoding (Gentner) and directly attacks the muscle-memory
  trap the plan already names. Cut the standalone 5-state `solve-the-odds` substitution (the plan's
  own review demotes it) — it's symbol grind with no new concrete idea.
- **CUT/SOFTEN the Conway binary leap.** Keep `AutocorrelationRuler` (tactile, good) but treat the
  "read the bits as a base-2 number" step as an **optional expert layer**. For the inclusive path,
  the ruler's job is concrete: *slide, find where the copy lines up, that overlap is why the odds
  tilt.* Introduce the `(AA−AB):(BB−BA)` formula only after the slide is felt. (Ladder:
  *overlap/correlation*.)
- **Tame the heroes (Kaminski).** `race-the-counter` should run **one slow race first** (watch a
  single shared stream decide), *then* batch to the swarm + `OddsDial`. The structural read-out
  ("THH won ~7 of every 8") must be a large, plain number, not just a needle.
- **Non-transitivity (`DominanceWheel`)** is a genuine "wow" but is a *relational* abstraction; keep
  it concrete by letting the learner *play* "find a pattern that beats mine" by hand for two rounds
  before the wheel diagram lights the full cycle.

### L3 — Gambler's Ruin
- **KEEP the probability-vs-duration contrast — it's the best analogical-encoding asset in the slate**
  — but **ground both quantities concretely first.** Before `ruin-tiles`/`duration-tiles`: hand-walk
  the token ~10 times; tally "reached \$4 / went broke" (grounds `P_i` as a share) and write down each
  walk's step count and average them (grounds `D_i` as a mean). Only then build the two recurrences,
  side by side, articulating the two differences (the `1+`; **and** the asymmetric boundaries
  `P_0=0, P_N=1` vs `D_0=D_N=0` — the plan's review rightly says the boundary asymmetry is the deeper
  stumble and deserves equal billing).
- **Reword "expected duration" away from symbol-first.** The slider beat should say "how many flips
  before it ends, *typically*?" with the just-built hand-average visible.
- **WalkerSwarm Kaminski guard:** release **one** walker (already `walk-once`), then the swarm; keep
  the outcome bar + a plain "ruin 51 / win 49 of 100" read-out as the structural anchor. The
  `RuinLandscape` warp is a strong dual-coded causal image — keep it, but label the axis in concrete
  money/odds, not just `P_i`.
- **Reorder the house-edge cliff to land emotionally on the concrete** ("a 60/40 coin → you go broke
  ~69% of the time") *before* the `(1−r^i)/(1−r^N)` form is shown. (`r=q/p` is the lesson's most
  opaque symbol; introduce it last, as shorthand for "the tilt.")

### L4 — States & Streaks (PRD order; the simplest case)
- **This lesson is, pedagogically, the natural *first* worked instance of the whole method** (one
  letter, two states, `E[H]=2`, *no* near-miss). Per CRA "simplest example first," its content is the
  cleanest place to *teach the notation ladder itself*. The plan smartly reframes it as consolidation
  (since L1 is already built) — embrace that, and make it the **explicit notation/representation
  retrospective**: "here is the two-node skeleton; here is `∅=E0, H=E1`; here is why `E[H]=2` three
  ways." (Ladders: *state*, *expected value*, *recurrence* in their gentlest form.)
- **KEEP `tripletReveal`** (first-step / geometric `1/p` / overlap `Σ2^L` all give 2) — it is
  analogical encoding across representations of *the same number*, which is exactly construct-function
  MER (Ainsworth). But make the learner *predict which lenses will agree* before revealing (turn the
  reveal into a comparison).
- **Demote Kac** to a footnote (the plan's review is right): equating hitting time with recurrence
  time plants a misconception. Three rigorously-equal lenses is plenty.
- **Use `retrievalGrid` as the course's representation map**, not just number-matching: pair each
  prior result with the *representation* it came from (a graph, a race bar, a walk landscape, a chip
  sum).

### L5 — Longer Patterns & Overlap (transfer)
- **This is the transfer test, so grounding must *fade*, not vanish.** Faded scaffolding on
  `failure-edge`/`equation-tiles` is correct (concreteness fading endpoint). But **add the concrete
  discovery first**: `overlap-ruler` (slide `THH`/`HTH` over themselves) is the right concrete
  on-ramp to *why* the extra 2 flips exist — keep it ahead of the graded setup beats; do not cut it
  to save beats (the plan lists it as a top cut candidate — resist for the inclusive path).
- **Make `overlap-compare` (beat 11) an articulation, not a narration.** Side-by-side 4-node graphs
  are already nearly free (`OverlapBeat`); add a one-tap "what's the single difference?" (HTH keeps a
  matched `H`; THH doesn't) so the learner *states* the structural alignment (Gentner).
- **Border-sum ledger:** introduce `2^L` chips concretely (one chip per overlap you found) **before**
  the `Σ` symbol; `Σ2^L` is the idealized endpoint, named last.

### L6 — The Overlap Shortcut (capstone, last)
- **Right place for the most idealized representation** (confirms the PRD order; concreteness fading
  ends here). Keep the retrieval-first framing.
- **The martingale is the single hardest reification in the course — give it the fullest ladder.**
  Lead with the concrete `GamblerLedger` count on *one* short stream (money in = one \$1 per flip;
  money out = the few surviving stacks), *show the running mean(in) and mean(out) converge*, and only
  then assert `E[T]=Σ2^L`. Defer the words "martingale / optional stopping" to an optional expert
  note (the idea — "a fair game can't make or lose money on average" — carries it). (Ladder:
  *martingale*.)
- **`Σ` and exponents:** the `SumTiles` chips are the concrete intermediate; the `Σ2^L` form is the
  symbol. Make the chip→sum→`Σ` fade explicit on screen (`6 = 4 + 2 = Σ2^L`).
- **Triangulation (recurrence = martingale = simulation)** is construct-function MER at its best —
  but have the learner predict "will the three agree?" first.

---

## 5. Recommendations for the implemented L1 lesson (fixture + components)

Concrete per-beat changes to `fixtures/lesson-pattern-hitting-times.json` and the implications for
`StateGraph` / `CoinStream` / `EquationTilesBeat` / the engine. Ordered by impact; each is scoped to
preserve the depth a fluent learner wants.

### 5.1 Fixture / beat-flow changes

1. **Insert a concrete "what does 'wait until HH' mean" pre-bet (or rebuild `pattern-pick`, beat 2,
   into it).** Before predicting which wait is longer, have the learner **flip by hand a few times and
   count flips to the first HH**, on screen, once. This gives the bet a referent. Reword `open-bet`
   feedback to lean on that lived count rather than on "4 flips on average." *(Addresses 3.1a;
   Verbal Precedence.)* This reuses the existing `coinSim` machinery; it can be a `coinSim` beat with a
   "count to first HH" framing rather than a new interaction type.

2. **Ground "expected wait" before the slider and the algebra.** Add a light "run it 10 times, watch
   the average" moment *before* `refine-prediction` (beat 6) — or split the existing `theory-vs-sim`
   (beat 8) into a tiny **"average of many runs"** grounding up front and keep the theory-line overlay
   later. Concretely: the learner sees run-lengths pile up (3, 7, 2, 11, …) and a running mean settle,
   *then* is asked to predict the number and build its equation. *(Addresses 3.1d; Sfard order.)* The
   `FirstSuccessTimeline` sub-widget proposed for L4 is the right primitive; pull it forward into L1.

3. **Reword `failure-edge` (beat 4) and `equation-tiles` (beat 5) to bridge `∅/H/HH` ↔ `E0/E1/E2`
   explicitly.** The failure-edge prompt already says "After matching one H"; make the tap chips show
   **both** the prefix label and the id ("`H` (E₁)"). In the equation legend, lead with the prefix
   form the learner already saw: "`E₁` = the state you called **H** (one head matched)." *(Addresses
   3.1b; Ainsworth constrain-function + contiguity.)*

4. **Fade the recurrence across sub-steps instead of one screen.** Keep `E0` as a worked example but
   present it as a **one-flip story built in stages**: first just the `1+` ("every flip costs 1"),
   then add the *first* branch (`½` chance you advance to E₁), then the *second* (`½` chance you fall
   back to E₀). The graded `E1` build then mirrors a story the learner watched assemble, not a static
   template. *(Addresses 3.1c; segmenting + reification.)* This is mostly a fixture/`EquationTilesBeat`
   presentation change, not an engine change.

5. **Turn `overlap` (beat 9) into a comparison the learner makes.** Instead of stating "HH resets, HT
   self-loops," show both mini-graphs and ask the learner to **tap which near-miss keeps progress**
   and **tap which one throws it away**, then reveal the 2-flip consequence. *(Addresses 3.1e;
   Gentner.)* `stateTap`-style grading on the two highlighted edges; reuse existing infra.

6. **Keep all of the above skippable for the fluent learner.** A "I've got this — skip to the math"
   affordance on the concrete on-ramps preserves the quant persona's pace (see §7 tradeoff).

### 5.2 Component / engine implications

- **`StateGraph` — dual-label nodes.** Add an optional secondary label so each node can render both
  its prefix label (`∅/H/HH`) and its id (`E0/E1/E2`), or a mode that shows the `E`-id beneath the
  prefix label. This is the single highest-leverage code change for the unlinked-MER problem; it makes
  the graph and the equation speak the same names. (Small: the `Text` block at
  `src/lesson/konva/StateGraph.tsx:214` already centers one label per node; add a sub-label line.)
- **Dyna-link tiles ↔ edges (DeFT's strongest remedy).** When the learner places a `½ E0` term in the
  `E1` row, briefly highlight the corresponding edge on the graph (`E1 --T--> E0`). Conversely, hovering
  an edge could echo its term. This converts two unlinked representations into one linked system
  (Ainsworth's dyna-linking). Implementable via the existing `highlight`/`activeEdge` props on
  `StateGraph` driven by `EquationTilesBeat` placements.
- **`CoinStream` already does good concrete→symbol bridging** (live coins + active prefix-state chip).
  Build on it: color the matched *suffix* of the stream and copy it into the active state chip so the
  learner literally sees "this tail = this state." This makes the *state* abstraction concrete
  (ladder §6.1) using infrastructure that exists.
- **`EquationTilesBeat` copy is HH-hardcoded** (`E0_WORKED_EXPLANATION`, `STATE_LEGEND`, `TOKEN_TIPS`,
  `renderStaticRow`'s "Absorbing state — HH matched"). The other agents already flag this as a
  blocker for L2–L6 reuse; from *my* lens the fix should also **author the copy as a fade** (story
  stages, prefix↔id bridge), so generalizing it is an opportunity to bake in the ladder, not just
  de-hardcode strings.
- **Engine:** none of the above needs new math. The `Automaton` already carries `states` with both
  `id` (`E0`) and `label` (`∅`), so dual-labeling is purely a render concern — the data is already
  there. (This is worth saying explicitly: the *data model already supports the linked
  representation; only the UI fails to show it.*)

---

## 6. Cross-cutting / structural — the Notation & Representation Onboarding Ladder

This is the core deliverable of my lens. For **every abstract object the course throws at a
beginner**, here is the concrete grounding to start from, the linked intermediate representation, and
**when the symbol is allowed to appear.** Adopt this as a course-wide authoring rule: *no symbol
before its referent and its intermediate.* End each ladder on the symbol (Fyfe & Nathan: the final
representation is what's encoded), but always pass through the left columns.

| Object | ① Concrete grounding (do it) | ② Linked intermediate (see it) | ③ Symbol — introduce only after ①②, named as shorthand | First appears |
|---|---|---|---|---|
| **A "state" (matched progress)** | Look at the actual coin stream; find the longest tail that starts the target ("how much of HH have I built?"). Highlight that suffix. | A "progress so far" chip showing the literal matched string `∅ / H / HH`, copied from the colored suffix. | `E0/E1/E2` as a *nickname* for each progress chip; subscript = # matched. Show `∅=E0` etc. on the node. | L1 simulate; reinforced L4 |
| **Automaton / transition diagram** | Replay your own flips; move a token between progress chips ("where does my progress go on H? on T?"). | 3-node graph with prefix labels, edges marked H/T, traced by the learner's own stream. | The directed graph with `E`-ids and the advance/self-loop/reset vocabulary — named *after* the learner felt the moves. | L1 simulate/failure-edge |
| **"Fair coin" / probability ½** | Flip many; tally H vs T; see ~half. "½ = about 1 of every 2." | A two-way split / two equally-likely branches off a node. | `½` *as a weight* on a branch (distinct from ½-as-frequency — say so). | L1 (already only `1/2` token; gloss the two meanings) |
| **Expected value / expected wait** | **Run "wait until HH" by hand many times; write each count; pile them; average.** "Expected = long-run average of these counts." | Running-average dot/line settling on a value (the sim chart, used as *grounding first*). | `E0` = "expected extra flips from the start"; the recurrence as a way to get that average *without* simulating. | **L1 — move grounding before slider/algebra** |
| **Recurrence `E0 = 1 + ½E1 + ½E0`** | Narrate one flip aloud: "I must flip (1). Then half the time I'm at H (E1 more), half back at start (E0 more)." | A one-flip probability tree: branch to two outcomes, each tagged with "remaining wait." Built in stages: `1+` → first branch → second branch. | The tile equation, assembled to mirror the story; the `1+`, then one term, then the other — never all at once. | L1 equation-tiles (re-staged) |
| **"Overlap is memory"** | Side-by-side: flip the near-miss for each pattern; physically cross out lost progress (HH: H→T loses it; HT: H→H keeps it). | Two highlighted edges: reset curving down vs self-loop arcing up. Learner *taps* which keeps progress. | The extra `½E0` term (L1); later the extra `2^1` term (L6) — the symbol *of* the kept/lost progress. | L1 overlap (made comparative) |
| **Win-probability (Penney)** | Run ~10 shared-stream races by hand; tally "A first / B first"; see the share. "P(A first) = share of races A won." | A converging win-rate bar; one slow race before the swarm. | `w_s`, the no-`1+`/boundary-1/0 recurrence — taught *as a contrast* to the duration recurrence. | L2 — add hand-tally on-ramp |
| **Overlap / correlation number** | Slide a paper copy of the pattern under itself/another; find where letters line up. | The `AutocorrelationRuler` lighting matched columns. | The binary read-out and `(AA−AB):(BB−BA)` — optional expert layer, after the slide is felt. | L2/L5/L6 |
| **Random walk (two walls)** | Move a token on a money number line by hand flips; stop at \$0/\$N. | The `WalkBoard` with an outcome bar; one walker before the swarm. | `P_i = i/N`, `D_i = i(N−i)`; `r=q/p` last, as "the tilt." | L3 — keep walk concrete first |
| **Two recurrences (prob vs duration)** | Hand-tally "reached top?" (share) and hand-average step counts (mean) separately. | The two recurrences side by side; tap the *two* differences (`1+`; boundary 1/0 vs 0/0). | `P_i` and `D_i` systems — as an articulated contrast, not two new objects. | L3 |
| **`Σ 2^L` closed form** | Find each overlap; drop one chip worth `2^(that length)`; add the chips. | `SumTiles`: `4 + 2`, `8`, `8 + 2` snapping to the known answer. | `Σ2^L` notation — *last*, as shorthand for "add a 2^L chip per overlap." Show `6 = 4+2 = Σ2^L`. | L6 (capstone) |
| **Martingale / optional stopping** | On one short stream: count money in (one \$1 per flip) and money out (surviving stacks). Watch mean(in) ≈ mean(out). | `GamblerLedger` skyline + fairness meter converging. | `E[T] = Σ2^L`; the words "martingale/optional stopping" deferred to an expert note. | L6 (capstone) |

**Representation conventions to adopt course-wide:**

1. **One name per object, shown linked.** Wherever an `E`-id appears, its prefix/concrete label
   appears too (and vice versa), at least until L4. Never let the graph and the equation use different
   alphabets silently. *(Ainsworth: avoid unlinked MERs.)*
2. **Dyna-link interactions across representations.** Placing a tile highlights the matching edge;
   flipping a coin updates stream + chip + graph together (already partly true). *(Ainsworth's
   strongest support condition.)*
3. **Ground every "average/expected/probability" word in a hand-count first.** No expectation,
   probability, or mean is *named* before the learner has produced it by tallying. *(Sfard; Verbal
   Precedence.)*
4. **Reveals become comparisons.** Any beat that currently *states* a contrast (overlap, paradox,
   triangulation) should make the learner *align and articulate* the structural difference.
   *(Gentner.)*
5. **Spectacle is subordinate to one structural number.** Every animated hero (race swarm, walker
   swarm, gambler skyline) is paired with a single large plain-language read-out of the structural
   quantity, and runs *one slow instance before the swarm.* *(Kaminski/Trninic; Mayer coherence.)*
6. **Symbols are nicknames, introduced after the referent, contiguous with it, faded to last.**
   `E`, `½`-as-weight, `Σ`, exponents, `P_i/D_i`, `r` each get a pre-training micro-moment. *(Mayer
   pre-training + contiguity; concreteness fading endpoint.)*
7. **Make grounding fast-forwardable, not removable** (see §7) so depth is preserved for the fluent.

---

## 7. Tradeoffs & open questions (for the human)

1. **Depth vs. accessibility — the central tension.** A concrete on-ramp per object lengthens lessons,
   colliding with the PRD's already-tight beat budgets and cut lines. **My proposed resolution:**
   make grounding a *fast-forwardable layer*, not extra required beats — the anxious learner walks the
   concrete steps; the Green-Book reader taps "skip to the math." This keeps both audiences without
   forking the content. Open question: is a per-beat "skip grounding" affordance acceptable in the
   one-interaction-per-beat model, or does it muddy the progress rail?
2. **The Kaminski tension is real and unresolved in the literature.** Rich concrete representations
   *can* either help (blend/contrasting-cases work) or hurt (extraneous-detail work). I've recommended
   "lean + mapped + slow-first," but how lean is a judgment call per widget. The swarm/skyline visuals
   are a product differentiator; trimming them for structural clarity is a brand-vs-pedagogy call the
   human should make deliberately.
3. **Will fluent quants find grounding patronizing?** Likely yes if forced. Hence fast-forward. But
   there's a subtler risk: concreteness fading's benefit is on *transfer*, which even strong learners
   need (the whole course is a transfer bet). Stripping grounding for "advanced" users may quietly
   hurt the outcome the course measures ("a majority reach the overlap beat without a reveal"). Worth
   an A/B if instrumentation allows.
4. **Reordering L1 touches built code.** Moving "average of many runs" before the slider/algebra, and
   dual-labeling the graph, are real edits to shipped beats and `StateGraph`/`EquationTilesBeat`. Low
   math risk (the engine data already supports dual labels), but it re-opens the flagship. Is the
   flagship frozen, or can it absorb representation fixes before L2 ships?
5. **Lesson-order discrepancy (flagged up top).** My ladder assumes the PRD's "Overlap Shortcut last"
   order. If the team actually ships the `future_ideas`/plan order (Shortcut at L4), the most idealized
   content arrives before the learner has done enough long-way concrete work — which my lens predicts
   will hurt. The human must reconcile the docs and pick the fading-respecting order.
6. **How far down do we ground "probability" and "fraction"?** The brief imagines learners who may not
   know what `½` is. A true zero-foundation on-ramp (what a fraction *is*) may be out of scope for a
   quant-prep product even in its inclusive form. Open question: where is the floor — "knows fractions,
   shaky on expectation/algebra," or truly "next-to-zero"? The ladder above assumes the former for `½`
   but grounds *everything built on top of it*; a true-zero floor would need a fractions pre-lesson.
7. **Non-integrated vs integrated CRA.** The 2025 meta-analysis slightly favored *separated* stages,
   but separated stages = more beats. The product's "one thing per beat" rhythm aligns with separation
   — but only if the beats are sequenced concrete→symbol, which today they are not. Tension between
   beat-count pressure and the stage-separation that the evidence prefers.

---

## 8. Sources

**Concrete–Representational–Abstract / Bruner.**
- Bruner, J. S., & Kenney, H. J. (1965). Representation and mathematics learning. *Monographs of the
  Society for Research in Child Development*, 30(1), 50–59.
- Bruner, J. S. (1966). *Toward a Theory of Instruction.* Harvard University Press. (enactive →
  iconic → symbolic)
- Witzel, B. S., Mercer, C. D., & Miller, M. D. (2003). Teaching algebra to students with learning
  difficulties: An investigation of an explicit instruction model. *Learning Disabilities Research &
  Practice*, 18(2), 121–131.
- Witzel, B. S., Riccomini, P. J., & Schneider, E. (2008). Implementing CRA with secondary students…
  (the CRAMATH 7-step sequence). *Intervention in School and Clinic.*
- Hughes, E. M., et al. (2018). The CRA approach for students with learning disabilities: An
  evidence-based-practice synthesis. *Remedial and Special Education.*
- Ebner, S., MacDonald, M. K., Grekov, P., & Aspiranti, K. B. (2025). A meta-analytic review of the
  CRA math approach. *Journal of … / SAGE*, Tau-BC ≈ 0.9965; non-integrated CRA slightly favored.

**Concreteness fading.**
- Fyfe, E. R., McNeil, N. M., Son, J. Y., & Goldstone, R. L. (2014). Concreteness fading in
  mathematics and science instruction: A systematic review. *Educational Psychology Review*, 26(1),
  9–25. doi:10.1007/s10648-014-9249-3.
- McNeil, N. M., & Fyfe, E. R. (2012). "Concreteness fading" promotes transfer of mathematical
  knowledge. *Learning and Instruction*, 22, 440–448.
- Goldstone, R. L., & Son, J. Y. (2005). The transfer of scientific principles using concrete and
  idealized simulations. *Journal of the Learning Sciences*, 14(1), 69–110.
- Fyfe, E. R., & Nathan, M. J. (2019). Making "concreteness fading" more concrete as a theory of
  instruction… *Educational Review / theory paper* (order/encoding effects).

**Abstract-vs-concrete debate (the Kaminski caution).**
- Kaminski, J. A., Sloutsky, V. M., & Heckler, A. F. (2008). The advantage of abstract examples in
  learning math. *Science*, 320, 454–455.
- Trninic, D., Wagner, R., & Kapur, M. (2020). The disappearing "advantage of abstract examples in
  learning math." *Cognitive Science*, 44(7), e12851. (well-designed concrete matches/beats abstract)
- De Bock, D., et al. (2011). Abstract or concrete examples in learning mathematics? A replication and
  elaboration of Kaminski et al. *Journal for Research in Mathematics Education.*

**Multiple external representations.**
- Ainsworth, S. (2006). DeFT: A conceptual framework for considering learning with multiple
  representations. *Learning and Instruction*, 16(3), 183–198. (complement/constrain/construct;
  dyna-linking; translation difficulty)
- Ainsworth, S. (1999). The functions of multiple representations. *Computers & Education*, 33,
  131–152.

**Dual coding + multimedia.**
- Paivio, A. (1986). *Mental Representations: A Dual Coding Approach.* Oxford University Press.
- Clark, J. M., & Paivio, A. (1991). Dual coding theory and education. *Educational Psychology
  Review*, 3, 149–210.
- Mayer, R. E. (2009). *Multimedia Learning* (2nd ed.). Cambridge University Press. (CTML; 12
  principles incl. pre-training, segmenting, contiguity, signaling, coherence, redundancy)
- Mayer, R. E., & Moreno, R. (2003). Nine ways to reduce cognitive load in multimedia learning.
  *Educational Psychologist*, 38(1), 43–52.

**Analogical encoding / case comparison / contrasting cases.**
- Gick, M. L., & Holyoak, K. J. (1983). Schema induction and analogical transfer. *Cognitive
  Psychology*, 15, 1–38.
- Gentner, D., Loewenstein, J., & Thompson, L. (2003). Learning and transfer: A general role for
  analogical encoding. *Journal of Educational Psychology*, 95(2), 393–408.
- Schwartz, D. L., & Bransford, J. D. (1998). A time for telling. *Cognition and Instruction*, 16(4),
  475–522. (contrasting cases)
- Schwartz, D. L., Chase, C. C., Oppezzo, M. A., & Chin, D. B. (2011). Practicing versus inventing
  with contrasting cases… *Journal of Educational Psychology*, 103(4), 759–775.

**Process–object duality (reification).**
- Sfard, A. (1991). On the dual nature of mathematical conceptions: Reflections on processes and
  objects as different sides of the same coin. *Educational Studies in Mathematics*, 22, 1–36.
  (interiorization → condensation → reification; symbol necessary but not sufficient)

**Expert blind spot / symbol vs. verbal precedence (the keystone).**
- Nathan, M. J., & Koedinger, K. R. (2000). An investigation of teachers' beliefs of students'
  algebra development. *Journal for Research in Mathematics Education*, 31(2), 168–190. (Symbol
  Precedence vs. Verbal Precedence Model)
- Koedinger, K. R., & Nathan, M. J. (2004). The real story behind story problems: Effects of
  representations on quantitative reasoning. *Journal of the Learning Sciences*, 13(2), 129–164.
  (students solve verbal/grounded forms more often than matched equations)
- Nathan, M. J., Koedinger, K. R., & Alibali, M. W. (2001). Expert blind spot: When content knowledge
  eclipses pedagogical content knowledge. *Proc. Int'l Conf. on Cognitive Science.*

---

*End of Agent-3 deliverable — `audits/ideation/inclusive-research-3-representations-cra.md`. Per the
brief, no other files were edited; a coordinator synthesizes all five agents.*
