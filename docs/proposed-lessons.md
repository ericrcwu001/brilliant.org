# Proposed Lessons — Inclusive Redesign (next-to-zero foundation)

**What this is.** A rethink of the Pattern Hitting Times course — the proposed extension/capstone
lessons **and** the on-ramp to the built flagship — so the product works for a learner **starting
from next-to-zero foundation** (may not know what a fraction `½`, "probability," "expected value,"
or basic algebra are; may have math anxiety) **without gutting the depth** that serves the
quant-interview learner. It supersedes the earlier "three picks" framing of this file; the verified
math, widget catalog, and engine plans are preserved and folded into an inclusivity-first structure.

**Companion documents.**
- The implemented flagship (L1) has its own implementation-ready change spec:
  **`docs/l1-inclusive-redesign-spec.md`** (a future agent applies those edits to
  `fixtures/lesson-pattern-hitting-times.json` and the beat components).
- The learning-science basis for everything here is five parallel research memos:
  `audits/ideation/inclusive-research-1-cognitive-load.md` (cognitive load / expertise reversal),
  `-2-prerequisites-misconceptions.md` (prerequisite map + misconception inventory),
  `-3-representations-cra.md` (concrete→abstract / notation ladder),
  `-4-motivation-anxiety.md` (persona, copy, math anxiety),
  `-5-progression-assessment.md` (sequencing, mastery, spacing/interleaving).
- Detailed beat-by-beat math specs for L2/L3/L5/L6 still live in `audits/ideation/plan-L{2..6}-*.md`
  (treat their math as canonical; treat their *sequencing/copy* as superseded by this file).

---

## 0. The headline reframe

Five independent learning-science audits converged on one diagnosis and one fix.

**Diagnosis — the course is expert-optimized, and that *actively* hurts beginners.** Every strong
choice for the stated persona ("a university underclassman preparing for quant interviews [who]
know[s] the Green Book") is, by the **expertise-reversal effect** (Kalyuga 2007; 2025 meta-analysis),
a *negative* for a near-zero learner: cold notation, predict-then-reveal "traps," and dense
multi-equation systems that assume `½`, expected value, variables, and recurrences are already
automatic. The product hasn't mis-designed for its persona — it **mis-scoped the persona**.

**Fix — scaffold by default, let experts opt out.** The reversal is *asymmetric*: withholding help
from a novice costs more (*d*≈0.51) than giving "too much" help to an expert (*d*≈−0.43), and
"assistance to novices matters more than withholding it for experts." So the inclusive design is not
a dumbing-down; it is **one adaptive spine** with:

1. **An optional, diagnostic-gated on-ramp (L0)** that teaches the *simplest* case first (`E[H]=2`).
2. **A two-track experience** — a short pre-check routes a beginner through primers and expanded
   beats, and lets a fluent learner skip straight to depth.
3. **Just-in-time primers + a concrete→abstract notation ladder** so no symbol arrives before its
   referent.
4. **Elicit-and-refute misconception handling** (per-option feedback), faded worked examples,
   systematic retrieval/spacing/interleaving, and a light non-blocking mastery signal.
5. **De-gatekept, warm-but-precise copy**, with the quant framing preserved in opt-in
   "**For the interview**" notes.

Everything below is the application of that fix, lesson by lesson and course-wide.

---

## Table of contents

1. [The revised course map](#course-map)
2. [Cross-cutting inclusivity system](#system) — the rules every lesson inherits
   - 2.1 [Two-track architecture + diagnostic pre-check](#two-track)
   - 2.2 [Just-in-time primers + the notation onboarding ladder](#ladder)
   - 2.3 [Faded worked examples (worked → completion → independent)](#fading)
   - 2.4 [Misconception elicitation & refutation](#refute)
   - 2.5 [Retrieval, spacing & interleaving](#retrieval)
   - 2.6 [Light, non-blocking mastery signal](#mastery)
   - 2.7 [Copy & tone (de-gatekeeping)](#tone)
   - 2.8 [Widget & animation load rules](#widget-load)
3. [L0 — The First Heads (new on-ramp)](#l0)
4. [L1 — Pattern Hitting Times (inclusive deltas → see L1 spec)](#l1)
5. [L2 — Penney's Game](#l2)
6. [L3 — Gambler's Ruin](#l3)
7. [L4 — Mixed Review & Streaks (repurposed)](#l4)
8. [L5 — Longer Patterns & Overlap (transfer)](#l5)
9. [L6 — The Overlap Shortcut (capstone)](#l6)
10. [Engine, schema & infra additions](#engine)
11. [Course-path integration (IDs, order, milestones)](#course-path)
12. [Open questions & tradeoffs (for the human)](#open)
13. [Sources](#sources)

---

<a name="course-map"></a>
## 1. The revised course map

Canonical unlock order is unchanged in number and gate; the inclusive design **adds an optional L0
on-ramp** and **repurposes the L4 slot** from re-deriving the simplest case (now taught in L0) into
interleaved mixed review.

| Slot | lessonId | Title | New vs prior | Track | Inclusive role |
|---|---|---|---|---|---|
| **L0** *(new, optional, ungated)* | `lesson-first-heads` | The First Heads | the machine, at minimum size (`E[H]=2`, 2 states, no reset) | **Beginner** (expert skips via pre-check) | The true on-ramp: builds *state*, `½`, "on average" on the smallest possible example |
| **L1** | `lesson-pattern-hitting-times` | Pattern Hitting Times *(built)* | overlap / near-miss memory (`HH`=6 vs `HT`=4) | Both | Flagship "wow"; beginner gets split `simulate` + collapsed primers (see `docs/l1-inclusive-redesign-spec.md`) |
| **L2** | `lesson-penneys-game` | Penney's Game | the **question** (how long → who's first) | Both | Interleaves L1's `6≠4` against the `HH`/`HT` race **tie** |
| **L3** | `lesson-gamblers-ruin` | Gambler's Ruin | the **arena** (patterns → a walk between walls) | Both | Probability-recurrence vs duration-recurrence contrast; mid-course checkpoint after L3 |
| **L4** | `lesson-states-streaks` | Mixed Review & Streaks *(repurposed)* | consolidation **by interleaving**, not re-derivation | Both | Spaced-retrieval checkpoint across `H`/`HH`/`HT`/race/ruin |
| **L5** | `lesson-longer-patterns` | Longer Patterns & Overlap | **transfer** to an unseen pair (`THH`=8 vs `HTH`=10) | Both | Faded hints; the course's transfer test |
| **L6** | `lesson-overlap-shortcut` | The Overlap Shortcut | the **method** (linear system → `Σ2^L` + martingale) | Both | Cumulative retrieval capstone; the most idealized content, last |

- `courseId`: `course-pattern-hitting-times` (unchanged). Roadmap stub after L6: `lesson-weighted-coins`.
- **Milestones:** `three-lessons-complete` after L3; `six-lessons-complete` after L6 (unchanged).
  L0 awards an optional, non-gating `first-heads-found` (or no milestone — see [§11](#course-path)).
- **Ordering note (discrepancy resolved):** this file uses the **PRD/`CONTEXT.md` canonical order**
  (States & Streaks = L4, Longer Patterns = L5, Overlap Shortcut = L6 **last**). `docs/future_ideas.md`
  and the `plan-L*` filenames use a *different* back-half order (Overlap Shortcut at L4). All five
  research memos flag this; concreteness-fading also argues the most idealized lesson (the martingale
  shortcut) belongs **last**. Reconcile `future_ideas.md` to match (tracked in [§12](#open)).

---

<a name="system"></a>
## 2. Cross-cutting inclusivity system

These rules apply to **every** lesson (L0–L6). They are the heart of the redesign; the per-lesson
sections ([§3](#l0)–[§9](#l6)) only note lesson-specific applications.

<a name="two-track"></a>
### 2.1 Two-track architecture + diagnostic pre-check

The expertise-reversal effect makes a single linear path impossible to optimize for both audiences.
The resolution is **one content spine, two render modes**, chosen by a tiny pre-check — *not* two
lesson trees.

- **Diagnostic pre-check (≈60s, course entry).** 4–5 hand-authored micro-items, e.g.:
  (1) "½ of 8 = ?"; (2) "the average of 2, 4, 6?"; (3) tap how much of `HH` you've matched after one
  `H` (reads a 1-arrow diagram); (4) "you flip a fair coin; after H, H, H, is T more likely next?"
  (gambler's-fallacy probe); (5) "on average, how many flips to get your first H?" (EV probe).
- **Routing.** ≥4 correct → **Track B** (start at L1; L0 offered as "skip/optional"; primers and
  worked steps collapsed; hints uncapped until the transfer lessons). Otherwise → **Track A**
  (start at L0; primers expanded; high-load beats split; full hint ladder incl. reveal).
- **Never forced, always recoverable.** L0 is always *offered* ("New to this? Start here"); Track B's
  primers are one tap away; the adaptive fade (§2.3) re-expands support on struggle. A coarse 5-item
  check *will* mis-route some learners — design so mis-routing self-corrects, never dead-ends.
- **State.** A single `track: 'A' | 'B'` on the user/progress doc; the renderer chooses beat density
  and default-collapsed depth from it. This is conditional rendering, not duplicate content.

**Anti-boredom guarantee for the quant learner.** Track B is essentially today's experience
(flagship-first, merged beats, primers hidden, expert notes available). Every inclusivity addition is
*invisible* to them by construction.

<a name="ladder"></a>
### 2.2 Just-in-time primers + the notation onboarding ladder

**Rule: no symbol before its referent.** For every abstract object the course introduces, the
authoring order is **① concrete grounding (do it) → ② linked intermediate (see it) → ③ symbol
(named as shorthand, last)**. Primers are **micro-interactions, not text walls** (the "doer effect":
doing ≈ 6× the learning of reading the same content), delivered *just-in-time* at the beat where the
prerequisite first bites, **collapsed by default for Track B**.

| Object | ① Concrete grounding | ② Linked intermediate | ③ Symbol (introduce last) | First needed |
|---|---|---|---|---|
| **A "state"** | Find the longest tail of the stream that starts the target ("how much of `HH` have I built?") | A "progress so far" chip showing `∅ / H / HH`, copied from the highlighted suffix | `E0/E1/E2` as a *nickname* for each chip, shown **on the node** | L0/L1 simulate |
| **Transition diagram** | Replay your own flips; move a token between chips | 3-node graph, edges marked H/T, traced by your stream | the directed graph + advance/self-loop/reset words | L1 simulate |
| **Probability `½`** | Flip many; tally H vs T; see ~half | a two-way split off a node | `½` *as a weight on a branch* (distinct from ½-as-frequency — say so) | L0/L1 |
| **Expected value** | **Run "wait until HH" by hand many times; write each count; average them** | a running-average line settling on a value | `E0` = "average extra flips from here"; the recurrence as a way to get it *without* simulating | **L0; L1 before the slider** |
| **Recurrence `E0=1+½E1+½E0`** | narrate one flip aloud ("I must flip (1); then half the time I'm at H, half back at start") | a one-flip probability tree, built in stages: `1+` → first branch → second branch | the tile equation, assembled to mirror the story | L1 equation-tiles |
| **"Overlap is memory"** | flip the near-miss for each pattern; cross out lost progress | two highlighted edges: reset-down vs self-loop-up; learner *taps* which keeps progress | the extra `½E0` term (L1); later the extra `2^1` (L6) | L1 overlap |
| **Win-probability** | run ~10 shared-stream races by hand; tally "A first / B first"; see the share | a converging win-rate bar; one slow race before the swarm | `w_s`, the **no-`1+`/boundary-1·0** recurrence — taught *as a contrast* | L2 |
| **Random walk (two walls)** | move a token on a money number line by hand flips; stop at `$0`/`$N` | the WalkBoard + outcome bar; one walker before the swarm | `P_i=i/N`, `D_i=i(N−i)`; `r=q/p` last, as "the tilt" | L3 |
| **`Σ 2^L` closed form** | find each overlap; drop one chip worth `2^(that length)`; add the chips | SumTiles: `4+2`, `8`, `8+2` snapping to the known answer | `Σ2^L` notation — **last**; show `6 = 4+2 = Σ2^L` | L6 |
| **Martingale / optional stopping** | on one short stream, count money in (`$1`/flip) and money out (surviving stacks); watch the means converge | GamblerLedger + fairness meter | `E[T]=Σ2^L`; defer the words "martingale/optional stopping" to an expert note | L6 |

**Course-wide representation conventions:** (1) one name per object, shown linked — wherever an
`E`-id appears, its concrete label appears too (and vice-versa); (2) **dyna-link** interactions
across representations (placing a tile highlights the matching edge); (3) ground every
"average/probability/expected" word in a hand-count *before* naming it; (4) **reveals become
comparisons** — any beat that *states* a contrast should make the learner align and articulate it;
(5) spectacle is subordinate to one structural number (§2.8).

<a name="fading"></a>
### 2.3 Faded worked examples (worked → completion → independent)

Open every new mechanic with a **fully worked example**, then a **completion problem**, then
**independent build** — never a blank. Fade **backward** (remove the last steps first) and
**adaptively** (on success, not on lesson index). L1's equation beat already does *one* completion
problem (worked `E0`, build `E1`) — generalize that into a deliberate slope across the course:

| Lesson | Equation / solve scaffolding | Hint policy |
|---|---|---|
| L0 (beginner) | all rows pre-filled except the last | full 3-level ladder **incl. reveal** |
| L1 | pre-fill `E0`, grade `E1` *(current — keep)*; beginner track may also pre-fill the `1+` and grade only the coin-split | full ladder incl. reveal |
| L2, L3 | grade more rows; pre-fill fewer | full ladder; **cap setup beats at level 2** for Track B only |
| L5 (transfer) | grade all non-absorbing rows | `maxHintLevel: 2` on `failure-edge` + `equation-tiles` |
| L6 (capstone) | no worked steps; retrieval-only | `maxHintLevel: 2` on `apply-*` |

**Adaptive override (the key two-track hook):** a learner struggling (≥2 wrong on consecutive graded
beats) gets the cap *lifted* and a row *re-pre-filled*; a learner clearing first-try gets rows
removed faster. Reuses the existing hint ladder + `maxHintLevel` + completion-problem plumbing.

**Productive failure needs a floor.** Keep the predict-then-reveal "bet" for everyone (it drives
transfer and exploits the hypercorrection effect) — but a true novice can only "fail productively" if
they have the *tools* to represent the problem. So the bet stays first; the *formalization* that
follows is scaffolded, and each high-load beat is **gated behind its primer**.

<a name="refute"></a>
### 2.4 Misconception elicitation & refutation

Conceptual change requires **eliciting the specific wrong model, marking it false, and explaining
why** (refutation outperforms neutral exposition). Two structural fixes:

- **Make `prediction` graded / per-option.** Today the prediction beat shows the same "Good guess!"
  for every choice (verified in `PredictionBeat.tsx`), so it cannot refute. Add `feedback.byOption`
  so the learner who picks the equiprobability trap and the learner who picks correctly get
  *different*, targeted responses.
- **Promote refutations out of hint-level-2 into the reveal**, and make every graded beat's
  level-1 hint *name the likely wrong model* ("You added a `1+` — but a probability has no per-flip
  cost"), not just "Try again."

**Misconceptions that are currently unaddressed and must be confronted (spaced, re-elicited):**

| Misconception | Where it fires now | Inclusive fix |
|---|---|---|
| **Gambler's fallacy** ("a T is due after HHHH") | L1 `simulate` live stream; L3 walk | refutation micro-beat at the first ≥3-run; re-elicit on the L3 walk |
| **Equiprobability bias** ("both length-2 ⇒ both wait 4") | L1 `open-bet` "tie" option | per-option refutation; generalize ("structure, not length, sets the wait") |
| **"Average = typical"** | L1 `theory-vs-sim`; acute in L3's fat-tailed duration | one line: "6 is the *average* — most runs are shorter, a few long" |
| **"Outcome approach"** (predict the next flip, not the distribution) | L1 `simulate`/`theory-vs-sim` | frame the sim as "we're counting *how long*, many times" |
| **"Expected wait = 1/P"** → 4 for both | implicit in the L1 "tie at 4" option | a micro-beat: 1/P works for one flip (`H`→2) but overlap changes it; note the trap that `HT` *is* genuinely 4 (half-right is what confuses) |
| **"Self-referential equation is circular"** | L1 `equation-tiles` (`E0` on both sides) | inline aside: "`E0` on both sides is allowed — it's an equation to solve, like `x = 1 + ½x`" |

<a name="retrieval"></a>
### 2.5 Retrieval, spacing & interleaving

The 6-lesson path is a natural spacing engine — the unlock order *is* the schedule. Systematize it:

- **Every L2+ lesson opens with a graded retrieval warm-up** of the prior headline (testing effect:
  retrieval beats re-reading at a 1-week delay), *then* springs the new hook. (Needs a graded
  recall variant — see [§10](#engine).)
- **Recaps are generate-then-reveal**, never re-read summaries.
- **Re-surface each headline at expanding gaps:** `E[HH]=6,E[HT]=4` introduced L1 → recalled L2 (the
  tie) → L4 (mixed review) → L6 (capstone); `E[H]=2` introduced L0 → reappears L4, L6; `THH/HTH`
  introduced L5 → re-derived L6.
- **Interleave where confusions cluster:** (a) wait vs race (L2 + L4); (b) probability-recurrence vs
  duration-recurrence / the `1+` trap (L3 + L4); (c) which-pattern-waits-longest across lengths
  (L4 + L6). Prefer **mixed sets over blocked**. Interleaving *feels* harder and *performs* better —
  warn authors not to "fix" the difficulty away, and place heavy interleaving *after* initial
  competence (L4+, not L0).

<a name="mastery"></a>
### 2.6 Light, non-blocking mastery signal

`completion = mastery` captures *doing* but discards the **feedback-corrective loop** that is the
active ingredient of mastery learning. Generalize L5/L6's `transferAttained` into a per-lesson signal:

- **`mastered`** iff the lesson's graded beats are first-try-correct with **no full reveal**;
  otherwise **`completed — review`**. Reuses `ProgressDerived` + the existing "Fully mastered" UI.
- **Non-blocking unlock stays** (momentum). The signal's job is to **drive spaced re-surfacing** and
  the next-step recommender — the corrective loop made motivational, not punitive.
- **Two cumulative retrieval checkpoints** become the existing milestones: mid-course after L3, and
  the L6 capstone — each a short low-stakes retest of earlier lessons at the longest gaps.

<a name="tone"></a>
### 2.7 Copy & tone (de-gatekeeping)

**Principle: two registers, one spine.** Default copy = curiosity + plain language (serves everyone);
an opt-in **"For the interview"** note carries the quant framing, formal names, and citations.
Nothing is removed; the *gate* is. Voice stays the design system's **warm-but-precise** (not bubbly,
not childish, not condescending).

- **Reframe the persona** from an identity gate to an invitation (full rewrite in
  `docs/l1-inclusive-redesign-spec.md` §persona): primary user = *a curious person who wants to
  understand probability by doing*; **assume no prior probability, statistics, or algebra**;
  quant-interview prep is a **named, fully-served optional track**, not the doorman.
- **Landing subline:** "State thinking for quant interviews." → "Learn probability by playing with
  it." (optional reassurance: "Deep enough for quant-interview prep.") The universal headline stays.
- **De-gatekeep every "Why it matters for quant" line.** Replace evaluator framings ("interviewers
  use it to see whether you can…", "the dividing line between 'can grind a recurrence' and 'thinks
  like a quant'") with curiosity/capability framings; move the interview phrasing into the opt-in
  note. Per-lesson before→after copy is in [§5](#l2)–[§9](#l6).
- **Retire adversarial metaphors** ("trap," "penalty") in favor of "the thing to watch," and surface
  the internal `needsReview` only as a gentle "worth another look," never a demerit.
- **Optional anxiety/belonging on-ramp (~20s, opt-in):** "Feeling rusty with math? That's normal,
  and it fades fast once you start. This course begins from zero — no formulas required to walk in."
- **Learner-generated relevance:** a light onboarding question — "What brings you here? [Just curious]
  [Brushing up] [Prepping for quant/tech interviews]" — sets tone and surfaces the "For the interview"
  notes by default for the quant choice. It does **not** fork content.

<a name="widget-load"></a>
### 2.8 Widget & animation load rules

The "watch it resolve" heroes (race swarm, ~100-token walker swarm, gambler skyline) are the brand,
but transient animation overloads a novice and rich surface detail can crowd out structure. So:

- **One slow instance before the swarm.** Always play a single, paced instance the learner can follow
  before batching to the spectacle.
- **One large, plain structural read-out per hero** ("THH won ~7 of every 8"; "ruin 51 / win 49 of
  100") — the number is the point; the needle/skyline is the garnish.
- **Learner-paced + replayable.** Single-step / pause / replay on every transient hero; signal the
  one thing to watch; reduced-motion renders the final frame instantly with an `aria-live` mirror.
- **Cut redundant chrome.** Don't show a worked row + a 5-line legend + per-tile tooltips + the build
  row + the palette simultaneously (the current `EquationTilesBeat` does); reveal on demand.

---

<a name="l0"></a>
## 3. L0 — The First Heads (new on-ramp)

**Status:** new, **optional**, ungated. **Track A starts here; Track B may skip it via the
pre-check.** Engine cost ≈ 0 — `buildAutomaton("H", 0.5)` already yields `E0 = 2` (add one golden
test). This is the single highest-impact inclusivity change: it gives a beginner the gentlest possible
first contact with *every* threshold (state, `½`, "on average," recurrence) on **two nodes, no
near-miss**, then L1 reuses the identical machinery on three nodes.

**Hook (Track A):** *"Flip a fair coin until you see your first heads. How many flips do you think
that takes, on average — and want to find out for real?"* (Trap: "1 flip — it's 50/50 on the first
try." Answer: **2**.) This is the cleanest possible elicitation of the expected-value threshold.

**Core promise (one idea):** the average wait for the first `H` is **2** — and you can *find* that by
flipping many times and averaging, *then* prove it with a tiny machine.

**Beat sequence (≈6 beats, all micro-interactions, fully scaffolded):**

| # | beatId | interaction | Teaches (one thing) | Inclusive notes |
|---|--------|-------------|---------------------|-----------------|
| 1 | `bet-first-h` | `prediction` (graded, per-option) | commit a guess (trap: "1 flip") | refute the "1 flip" pick directly (§2.4); "no wrong guess yet" framing |
| 2 | `what-is-half` | `primer` (micro) | `½` = 1 in 2 (flip-and-tally) | grounds `½` before it's a weight (§2.2) |
| 3 | `count-by-hand` | `coinSim` ("count to first H") | "average" = run it many times, average the counts | **this is the concrete definition of expected value**, before any symbol |
| 4 | `meet-the-state` | `coinSim` + 2-node `StateGraph` (hero) | a "state" = how much you've matched (`∅`, `H`) | dual-label nodes `∅=E0`, `H=E1` from the start |
| 5 | `build-E0` | `equationTiles` (all pre-filled but last) | `E0 = 1 + ½E1 + ½E0`, `E1 = 0` | worked → completion fade at max support (§2.3) |
| 6 | `recap-two` | `recap` | every lens says **2**; "look what you did — by hand" | attribute the win to the learner; tease L1 |

**Why optional, not a forced first lesson:** learning-trajectory evidence is that early levels are
*facilitative, not always necessary*, and forcing the primer on an expert *harms* them
(expertise-reversal). So L0 is a gate-free, skippable on-ramp — the lowest-risk way to fix the
buried-simplest-case problem without editing the built flagship's spine.

**Fallback if an L0 lesson is out of scope:** ship the same content as the first beat-group of L1,
expanded for Track A and auto-skipped for Track B. Less clean (edits the built fixture) but preserves
the on-ramp.

---

<a name="l1"></a>
## 4. L1 — Pattern Hitting Times (inclusive deltas)

L1 is **built**; its inclusive changes are surgical and mostly *additive (skippable) depth*, so the
Track-B path is effectively unchanged. The full, implementation-ready spec — per-beat before→after
copy, component changes, schema additions, verification plan — lives in
**`docs/l1-inclusive-redesign-spec.md`**. Summary of what changes:

- **Track-A `simulate` split** into 2–3 micro-beats (flip & watch → meet the graph → spot the
  near-miss); Track B keeps the merged beat.
- **Repurpose `pattern-pick`** (a passive confirm) into a collapsed primer trio (`½`, "average," "a
  state"), or insert a primer beat before `open-bet`.
- **Ground "expected wait"** as the average of many hand-counted runs **before** `refine-prediction`
  and the algebra (pull the L5-planned `FirstSuccessTimeline` forward).
- **Fix the unlinked-representation bug:** dual-label `StateGraph` nodes (`∅` *and* `E0`), bridge
  `failure-edge`/`equation-tiles` copy, and dyna-link tiles ↔ edges. The `Automaton` data already
  carries both `id` and `label` — this is a render-only fix.
- **Re-stage the recurrence** as a one-flip story built in stages (`1+` → first branch → second
  branch) instead of one symbol avalanche; cut redundant chrome (§2.8).
- **Turn `overlap` into a comparison** the learner makes (tap which near-miss keeps progress) rather
  than a narration; name "overlap" qualitatively right after `failure-edge`.
- **Per-option `open-bet` feedback** (refute the "tie"); reconcile the prompt's "by how much" with the
  options; soften "trap"/"penalty"; reuse the opening bet at the recap as a belief-change measure.
- **Plain-language `guided-solve`** ("drop that 0 into the E1 line"), with the formal algebra as a
  collapsible "Show algebra" expert path.
- **Light mastery signal** (§2.6) added; re-surface `failure-edge` in the L4 review.

---

<a name="l2"></a>
## 5. L2 — Penney's Game: "The race where going second wins"

**Quant grounding (kept, verified):** Penney-Ante (1969), Gardner (1974), Conway leading numbers
(Nishiyama 2010), Guibas–Odlyzko correlation polynomial (1981). Headline math (engine-verified):
`HH` vs `HT` race is a **tie (½ each)** despite `6 ≠ 4`; `HHH` vs `THH` → **`P(THH first)=7/8`**;
second-player rule `B=(¬a₂)a₁a₂`; the "beats" relation is **non-transitive** (a 4-cycle, per the L2
hardening review — *not* a 3-cycle). Detailed beat math: `audits/ideation/plan-L2-penneys-game.md`.

**Hook — before → after (de-gatekept, §2.7):**
> *Before:* "You proved HH is slower than HT (6 vs 4). So HT shows up first more often — right? … I'll
> pick second and beat you 7 to 1."
> *After:* "Last lesson, HH took longer than HT — 6 flips versus 4. So if we both watch the **same**
> coin, HT should win the race to show up first, right?" (It's a dead tie — 50/50.) "New game: you
> pick any 3-letter pattern; I'll pick mine after you and win about **7 times out of 8**. Want to try
> to beat me?"

**"Why it matters" — default (everyone):** "The pattern that *waits longer on its own* can still
*win the race* — and there's no single 'best' pattern, because every pattern can be beaten by another."
**"For the interview" (opt-in note):** "A classic trading-desk puzzle; it probes separating *which*
event happens first from *how long* it takes, competing absorbing states, and the second-mover edge
as a no-arbitrage argument."

**Inclusive beat sequence (~9–10 beats; the L2 review's own cut to ~8 + retrieval opener):**

| # | beatId | interaction | Teaches | Inclusive notes |
|---|--------|-------------|---------|-----------------|
| 1 | `recall-6-4` | `mcq`/retrieval (graded) | retrieve `E[HH]=6`, `E[HT]=4` | standard retrieval opener (§2.5) |
| 2 | `whos-first-primer` | `primer` (micro) | "who's first" ≠ "how long" | concrete: two friends watch one stream (§2.2) |
| 3 | `open-bet` | `prediction` (per-option) | bet the race winner (trap: HT, "4<6") | refute the pick (§2.4) |
| 4 | `race-the-tie` | RaceTrack (slow-first, then batch) | the tie at ~50/50 | one slow race, then swarm + plain "≈50/50" readout (§2.8) |
| 5 | `first-step-split` | `stateTap` (worked first) | one flip after the first H decides | animate one decided race, *then* tap |
| 6 | `pick-your-counter` | `patternPick` (graded) + OddsDial | a second mover can counter `HHH` | grade the counter; refute "pick the strong-looking one" |
| 7 | `race-the-counter` | RaceTrack + OddsDial | **7:1 emerges** from many races | slow race → swarm; "THH won ~7 of 8" readout |
| 8 | `prob-vs-duration` | `primer` + side-by-side compare | a *probability* recurrence has **no `1+`**, ends 1·0 | the inclusive complement to the trap: name it qualitatively *before* tiles |
| 9 | `win-prob-tiles` | `equationTiles` (**2-state HH/HT**) | build the P-recurrence at lowest load | retarget off the cyclic 5-state system (review's cut); show `1/8` via ruler+sim, not a 5-row solve |
| 10 | `non-transitive-loop` | DominanceWheel (narrative) | every pattern has a beater (4-cycle) | pre-teach transitivity first; signal the cycle, never gate it |
| 11 | `recap` | `recap` | race ≠ wait; second-mover rule | generate-then-reveal |

**Misconceptions:** "faster wait ⇒ wins the race" (refute at `open-bet`); "there's a strongest
pattern"; "add a `1+` to a probability" (defused by beat 8 *before* the tiles).

---

<a name="l3"></a>
## 6. L3 — Gambler's Ruin: "How a fair game still breaks you"

**Quant grounding (kept):** Grinstead & Snell Ch. 12, Green Book Ch. 5, Joshi/Mosteller. Headline math
(engine-verified, corrected per the L3 review): fair `N=4`, start `i=2` → `P(reach $4)=½`,
`P(ruin)=½`, `E[duration]=4=2·(4−2)`; biased `p=0.4`, `i=2` → `P=4/13`, ruin `9/13`, `D=50/13`; guard
`r=q/p=1` (the `0/0` fair case). Detailed math: `audits/ideation/plan-L3-gamblers-ruin.md`.

**Hook:** keep nearly as-is — it's the **accessibility model** for the whole course (concrete,
dollars, no jargon): *"You have \$2. Flip a fair coin: heads +\$1, tails −\$1, until you hit \$4 or
\$0. The coin is fair — so what's the chance you go broke first, and how long will it take?"* Optional
warmth: "You don't need any probability for this yet — just a guess."

**"Why it matters" — default:** "Even in a *fair* game, the player with less money tends to go broke
first — and the tiniest edge for the house turns 'fair' into 'almost certain to lose.' It's why the
casino always wins." **"For the interview":** "The most-asked first-passage / Markov problem; the
prototype for risk-of-ruin and stop-loss/target reasoning."

**Inclusive beat sequence (~11 beats):**

| # | beatId | interaction | Teaches | Inclusive notes |
|---|--------|-------------|---------|-----------------|
| 1 | `recall-overlap` | retrieval (graded) | retrieve that a near-miss for `HH` resets | retrieval opener (§2.5) |
| 2 | `open-bet` | `prediction` (per-option) | P(broke first)? (trap: "fair ⇒ safe") | refute "0%/always 50-50" |
| 3 | `gamblers-fallacy` | `primer` / refutation | "after 3 losses you're **not** due for a win" | **the unaddressed bug** — name & refute (§2.4); re-elicits on the walk |
| 4 | `walk-once` | WalkBoard (single walker) | one token random-walks to a wall | the concrete body of the abstraction |
| 5 | `boundary-edge` | `stateTap` | H→`i+1`, T→`i−1`; the two walls absorb | "the number line is a state machine" primer first |
| 6 | `ground-both` | hand-tally (micro) | P = share of walks that reach top; D = average steps | grounds *both* quantities before symbols (§2.2) |
| 7 | `prob-tiles` | `equationTiles` (**fair only**) | P-recurrence: **no `1+`**, boundary 1·0 | keep ratios `q/p` out of graded tiles |
| 8 | `duration-tiles` | `equationTiles` (**fair only**) | D-recurrence: `1+` returns, boundary 0 | teach the **two** differences as two signaled contrasts (the `1+`; *and* boundary 1·0 vs 0·0) |
| 9 | `guided-solve` | `substitution` | solve to `P=½`, `D=4` | plain-language steps |
| 10 | `house-edge` | WalkBoard + WalkerSwarm + RuinLandscape | a small edge is catastrophic | slow-first; land the concrete ("60/40 → broke ~69%") *before* the `(1−r^i)/(1−r^N)` form; "average ≠ typical" at the fat-tailed histogram |
| 11 | `recap` | `recap` | `P=i/N`, `D=i(N−i)`; fair still ruins you | generate-then-reveal; mid-course `three-lessons-complete` |

**Note:** the probability-vs-duration contrast is the course's best built-in interleaving — keep the
two recurrences **in one lesson, side by side**; do not split into separate lessons.

---

<a name="l4"></a>
## 7. L4 — Mixed Review & Streaks (repurposed)

**Change of role:** with `E[H]=2` now taught in L0, re-deriving it here would be *massed
re-teaching*. Repurpose the slot (keep `lessonId: lesson-states-streaks` to avoid ID churn) into an
**interleaved mixed-review checkpoint** — the higher-value desirable difficulty (mixed practice
≫ blocked). It is the course's spaced-retrieval hinge and a diagnostic of weak nodes.

**Hook:** *"You've waited for patterns, raced them, and walked to ruin. Let's see how it all connects
— mixed together, the way a real problem arrives."*

**Beat sequence (~6–8 interleaved beats):**

| # | beatId | interaction | Teaches | Inclusive notes |
|---|--------|-------------|---------|-----------------|
| 1 | `retrieval-grid` | retrievalGrid (graded) | match `{2,4,6,8,10,7/8,i(N−i)}` → lessons | spaced retrieval at expanding gap |
| 2 | `which-waits-longest` | ranked tap (mixed set) | rank `{H,HT,THH,HH,HTH,HHH}` by wait | forces discrimination, not single recall |
| 3 | `race-or-wait` | mixed `prediction` | who's-first (L2) vs how-long (L1) | interleave the most-confused contrast |
| 4 | `plus-one-or-not` | mixed tiles | probability-recurrence vs duration shape | re-confront the `1+` trap (L3) |
| 5 | `weak-node` | re-test (adaptive) | the beat the learner most struggled on (L1–L3) | the corrective loop (§2.6) |
| 6 | `recap-streak` | `recap` | connections + streak; award milestone | generate-then-reveal |

**Milestone:** keep `first-pattern-cracked` (id stable; consider re-toning its *description* to
"patterns connected"). `E[H]=2` reappears here as **one card among many** (retrieval, not
re-derivation).

---

<a name="l5"></a>
## 8. L5 — Longer Patterns & Overlap (transfer)

**Role unchanged — the transfer test.** Novel pair **`THH` vs `HTH`** (`E=8` vs `10`) with **no
HH/HT recap** in the opener and **faded scaffolding**. Headline math: `THH` borders `{3}`→`2³=8`;
`HTH` borders `{1,3}`→`2¹+2³=10` (the `H_H` shift-1, like HT's self-loop). Detailed:
`audits/ideation/plan-L6-longer-patterns.md` (note legacy filename L6).

**Inclusive deltas:**
- **Keep the concrete discovery first.** Do **not** cut `overlap-ruler` (sliding `THH`/`HTH` over
  themselves) to save beats — it's the concrete on-ramp to *why* the extra 2 flips exist, and belongs
  ahead of the graded setup beats.
- **Faded hints, but never a dead-end.** `maxHintLevel: 2` is right for the expert signal; for a
  beginner who hits the cap and is still wrong, offer a one-time "walk me through it" path (records
  `needsReview`, forfeits the badge, doesn't dead-end). Better: the adaptive override (§2.3) lifts the
  cap on struggle. Fairness over signal-purity, since `transferAttained` is non-gating.
- **`overlap-compare` becomes an articulation**, not a narration: side-by-side 4-node graphs (nearly
  free via `OverlapBeat`) + a one-tap "what's the single difference?" (HTH keeps a matched `H`; THH
  doesn't).
- **Border-sum chips before the `Σ` symbol** (one chip per overlap found), `Σ` named last.
- **Transfer signal:** `transferAttained = true` iff the learner clears `failure-edge` **and**
  `equation-tiles` for **both** `THH` and `HTH` without hitting the cap → "Fully mastered" vs
  "Completed". (Requires per-pattern split + a persisted hint **high-water mark** — see [§10](#engine).)

---

<a name="l6"></a>
## 9. L6 — The Overlap Shortcut (capstone, last)

**Role unchanged — the cumulative retrieval capstone.** Re-derives `6,4,8,10` a new way, so it lands
only after the learner computed them the long way. **The most idealized content in the course belongs
here, last** (concreteness fading). Headline: `E[wait] = Σ 2^(overlap length)`, proved by a fair-coin
martingale. Verified table (kept):

| Pattern | borders | `Σ 2^L` | engine `E0` |
|---|---|---|---|
| `HT` | {2} | 4 | 4 ✓ |
| `HH` | {2,1} | 4+2 = **6** | 6 ✓ |
| `THH` | {3} | 8 | 8 ✓ |
| `HTH` | {3,1} | 8+2 = **10** | 10 ✓ |
| `HHH` | {3,2,1} | 8+4+2 = **14** | 14 ✓ |
| `HTHT` | {4,2} | 16+4 = **20** | — |

Detailed: `audits/ideation/plan-L4-overlap-shortcut.md` (legacy filename L4).

**Hook — before → after:**
> *Before:* "You solved four linear systems to get 6, 4, 8, 10. A quant hands you HTHT and 30 seconds.
> There's a one-line rule — let's earn it…"
> *After:* "By now you've worked out four of these waiting times the long way: 6, 4, 8, and 10. What
> if there were a **one-line shortcut** that gives you all four in seconds — with a genuinely fun
> reason *why*, involving a casino that can never turn a profit? Let's earn it together."
(Drops the stranger-evaluator + 30-second stopwatch — the choking trigger; keeps the shortcut tease
and the casino anchor.)

**"Why it matters" — default:** "In a game nobody can beat, the money going in must equal the money
coming out — one of the most powerful tricks in all of probability. It's the same instinct used to
price financial options." **"For the interview":** "Martingales, optional stopping, and no-arbitrage —
the ABRACADABRA problem (Li 1980); the move from grinding a recurrence to *seeing the structure*."

**Inclusive deltas:**
- **Gate behind an exponent primer** ("powers of two: 2, 4, 8, 16"); the `SumTiles` widget already
  de-symbolizes `Σ` into a running sum — lean on it; show `6 = 4+2 = Σ2^L` as the fade.
- **Give the martingale the fullest ladder** (it's the hardest reification in the course): lead with
  the *deterministic-payout* intuition on **one short stream** (money in = `$1`/flip; money out = the
  few surviving stacks), **show running mean(in) and mean(out) converge** *before* asserting
  `E[T]=Σ2^L`; defer the words "martingale/optional stopping" to an expert note.
- **Retrieval-first opener** recalling *all* prior numbers at the longest gap; **triangulation**
  (recurrence = martingale = simulation) framed as a prediction ("will the three agree?") then a
  snap-together reveal.

---

<a name="engine"></a>
## 10. Engine, schema & infra additions

All pure, dependency-free, golden-testable, **no AI** (Phase-1 constraint holds — all checks are
client-side against the engine; all primers are hand-authored micro-interactions).

**Lesson math engines (unchanged from prior plans):**

```ts
// src/engine/race.ts        (L2)  buildRaceAutomaton, conwayLeadingNumbers, penneyOdds, simulateRace, winMatrix
// src/engine/walk.ts        (L3)  buildWalk(N,p), simulateWalk, batchWalkStats   // solve P (no +1, bdry 1·0) and D (+1, bdry 0)
// src/engine/correlation.ts (L6)  correlation, expectedWaitFair, gamblerLedger   // expectedWaitFair === buildAutomaton(p,0.5).E0
// src/engine/automaton.ts   (L0)  buildAutomaton("H", 0.5) → E0 = 2  (add golden test)
```

**New infra for inclusivity (the part this redesign adds):**

| Item | Purpose | Notes |
|---|---|---|
| **Graded recall variant** (`mcq` / `retrievalGrid`) | retrieval openers, mixed review, the diagnostic pre-check | `prediction` is ungraded by design; this is reused ≥5× (L2/L3/L4/L6 + pre-check) |
| **`primer` / `concept-card` beat type** | JIT micro-interaction primers (½, average, state, exponents) and the notation ladder | narrative-class; can piggyback the recap/overlap render path; never `required`, never sets `needsReview` |
| **Per-option feedback** (`Feedback.byOption`) | refutational prediction (§2.4) | branch on the selected option in `PredictionBeat` |
| **`track: 'A' \| 'B'`** on user/progress | two-track render mode | set by the pre-check; renderer chooses density + default-collapsed depth |
| **`beat.density` / variant (or beginner-only beat group)** | render split vs merged beats by track (e.g. L1 `simulate`) | avoids duplicate fixtures |
| **Collapsible content blocks** (`primer` / `expertNote`) | "Going deeper / For the interview" + collapsed primers | default-collapsed; never `required` |
| **Persisted hint high-water mark** (`maxHintLevelByBeat`) | the light mastery signal (§2.6) and `transferAttained` (L5) | `onCorrect` currently resets level → 0; record the high-water mark instead |
| **Generalized `transferAttained` → per-lesson mastery** | drive spaced re-surfacing | reuses `ProgressDerived` + "Fully mastered" UI |

**Authoring blocker to clear first (flagged by every prior review):** `equationDiagnosis.ts` per-slot
hint copy is **hardwired to HH's `{E0,E2}` target**, and `EquationTilesBeat` overrides authored hints
with it — so authored `byPattern` hints are dead for non-HH and learners get misleading nudges. Make
the copy fixture-authored (this doubles as the §2.2 "fade + prefix↔id bridge" hook) **before** any new
`equationTiles` beat ships.

---

<a name="course-path"></a>
## 11. Course-path integration

| Order | lessonId | title | milestoneId | unlocks |
|---|---|---|---|---|
| **L0** | `lesson-first-heads` *(optional)* | The First Heads | `first-heads-found` *(optional, non-gating)* or none | `lesson-pattern-hitting-times` |
| L1 | `lesson-pattern-hitting-times` | Pattern Hitting Times | `hh-ht-mastered` | `lesson-penneys-game` |
| L2 | `lesson-penneys-game` | Penney's Game | `penneys-game-won` | `lesson-gamblers-ruin` |
| L3 | `lesson-gamblers-ruin` | Gambler's Ruin | `gamblers-ruin-solved` | `lesson-states-streaks` |
| L4 | `lesson-states-streaks` | Mixed Review & Streaks | `first-pattern-cracked` | `lesson-longer-patterns` |
| L5 | `lesson-longer-patterns` | Longer Patterns & Overlap | `state-machine-builder` | `lesson-overlap-shortcut` |
| L6 | `lesson-overlap-shortcut` | The Overlap Shortcut | `martingale-mastered` | `null` |

- **Mid-course milestone:** `three-lessons-complete` after L1–L3. **Completion:** `six-lessons-complete`
  after L6. L0 is optional and does not gate L1 (a beginner who completes L0 is routed to L1; an expert
  reaches L1 directly).
- **Ordering reconciliation (action item):** adopt this PRD/CONTEXT canonical order everywhere; update
  `docs/future_ideas.md` (currently lists Overlap Shortcut at L4) and rename the legacy
  `audits/ideation/plan-L4/L5/L6` files' L-numbers (or add a note) so the docs stop disagreeing.
- **patternOptions:** L0 `["H"]`; L1 `["HH","HT"]`; L2 the length-3 words; L3 parameter-driven (`N`,`p`);
  L4 retrieval set `["H","HT","THH","HH","HTH","HHH"]`; L5 `["THH","HTH"]`; L6 `["HH","HT","THH","HTH"]`.

---

<a name="open"></a>
## 12. Open questions & tradeoffs (for the human)

These are genuine decisions the research surfaced; they are *not* resolved here.

1. **L0 as a separate lesson vs a Track-A beat-group inside L1.** Separate lesson = cleanest pedagogy
   + clean expert skip, but one more fixture before the gate. Beat-group = no new node, but edits the
   built flagship. Recommendation: separate, optional L0; fallback to a beat-group if the gate is at
   risk.
2. **Branching/diagnostic in scope for Phase 1?** The two-track design needs a graded `mcq` variant +
   a `track` flag + conditional rendering. If that's too much for the gate, ship inclusivity as
   *always-on, dismissible JIT primers* (simpler, slightly noisier for experts) and add the pre-check
   later.
3. **Depth vs accessibility / who maintains two copy registers?** The "For the interview" notes ≈
   double authoring on jargon-heavy beats. Start with the worst offenders (L2/L3/L6 "why" lines, L1
   `guided-solve`/`equation-tiles`), not every beat.
4. **Non-blocking mastery vs real mastery.** Should the mid-course (L3) checkpoint be the *one* place a
   soft corrective re-test is (gently) required, to get a Bloom-style loop without a hard gate
   everywhere?
5. **Milestone churn.** Repurposing L4 changes `first-pattern-cracked`'s meaning; renaming risks ID
   churn across the fixture/Functions/`CONTEXT.md`. Keep the id, re-tone the description.
6. **Animation spectacle vs structural clarity (the Kaminski tension).** "Lean + mapped + slow-first"
   is recommended, but how lean per widget is a brand-vs-pedagogy judgment.
7. **Warmth vs the "serious notebook" voice.** Adopt the de-gatekeeping (high confidence); tune warmth
   conservatively so it never reads bubbly.
8. **The biggest validity risk:** the persona literally selected *against* the beginners we now want
   to serve, so we have **no novices in the user pool to test with**. Every calibration above (where's
   the ZPD cliff, does H-before-HH actually help, pre-check accuracy) needs testing with real
   beginners. The planned `answer_submitted {first_try, hintLevel}` and reveal-rate KPIs are a usable
   load/difficulty proxy — treat high reveal/hint rates on a beat as evidence of an un-budgeted load
   spike to fix.

---

<a name="sources"></a>
## 13. Sources

Full citations (with years, effect sizes, and per-beat grounding) live in the five research memos:
- `audits/ideation/inclusive-research-1-cognitive-load.md` — Sweller CLT & element interactivity;
  Cowan ~4 chunks; Kalyuga expertise-reversal + 2025 meta-analysis; Renkl/Atkinson faded worked
  examples; Mayer pretraining/segmenting/signaling; Kapur productive-failure-needs-a-floor.
- `audits/ideation/inclusive-research-2-prerequisites-misconceptions.md` — Ausubel; Vygotsky ZPD;
  Wood/Bruner/Ross scaffolding; Meyer & Land threshold concepts; Kahneman & Tversky; Konold outcome
  approach; Lecoutre equiprobability; Posner conceptual change; refutation texts; Kapur.
- `audits/ideation/inclusive-research-3-representations-cra.md` — CRA/Bruner; concreteness fading
  (Fyfe/Goldstone); Kaminski caution + Trninic rebuttal; Ainsworth DeFT; Paivio/Mayer; Gick–Holyoak &
  Gentner; Sfard reification; Nathan & Koedinger expert blind spot.
- `audits/ideation/inclusive-research-4-motivation-anxiety.md` — Ashcraft math anxiety; Bandura
  self-efficacy; Keller ARCS; Deci & Ryan SDT; Eccles/Wigfield expectancy-value-cost; Dweck/Moser;
  Bjork desirable difficulties; Steele / Walton & Cohen belonging.
- `audits/ideation/inclusive-research-5-progression-assessment.md` — Clements & Sarama learning
  trajectories; Bloom mastery / 2-sigma; Roediger & Karpicke testing effect; Cepeda spacing; Rohrer &
  Taylor interleaving; Black & Wiliam / Hattie feedback; Koedinger & Aleven assistance dilemma;
  VanLehn; Koedinger doer effect.

Math values cross-checked against the repo engine golden tests at `p = 0.5`
(`E[H]=2, E[HH]=6, E[HT]=4, E[THH]=8, E[HTH]=10, E[HHH]=14`).
