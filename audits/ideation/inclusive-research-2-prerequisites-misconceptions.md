# Inclusive Research — Agent 2: Prerequisite Knowledge, Misconceptions & Just-in-Time Foundations

> One of five parallel inclusivity audits. Lens: **what the course silently assumes the
> learner already knows, the wrong models they walk in with, and when/how to supply
> foundations** so a near-zero-foundation learner (no fluency with ½, "expected value,"
> probability, or basic algebra; possible math anxiety) can succeed without gutting the
> depth the quant-interview persona needs. Grounded in the repo (the built L1 fixture
> `fixtures/lesson-pattern-hitting-times.json`, `docs/mvp_prd.md`, the L2–L6 plans in
> `audits/ideation/plan-L*.md`) and the learning-science literature. A coordinator will
> synthesize all five; this file edits nothing else.

---

## 1. Lens & TL;DR

**Lens in one line:** The course is a *prerequisite avalanche* — it assumes ~14 concepts
(sample space, ½ as multiply, "average," expected value, variables, solving & self-referential
equations, reading a state diagram, Σ, 2^L) and front-loads almost all of them into one
3-state flagship beat sequence, while leaving the most damaging probability *misconceptions*
(gambler's fallacy, equiprobability bias, the outcome approach, "average = typical") completely
un-elicited and unconfronted.

**Top recommendations (most impact first):**

1. **The simplest case must come first, not fourth.** The planned *States & Streaks* lesson
   (single `H`, two states, `E[H]=2`, no overlap) is the natural *first* worked instance of the
   whole method, yet the canonical order buries it at **L4** (after Penney's and Gambler's Ruin).
   For near-zero learners, ship its content as an **optional pre-L1 "on-ramp" (Lesson 0)** or
   re-sequence. This single move converts the hardest possible entry (3 states + recurrence +
   EV all at once) into a gentle one.

2. **Add a 5-question diagnostic placement check** (≈60s) that routes near-zero learners to a
   short Foundations module and lets fluent learners skip it. This is the only way to serve
   *both* personas without boring the Green-Book reader or stranding the novice.

3. **Make `prediction` beats respond to the specific misconception picked.** Today
   `PredictionBeat` shows the same "Good guess!" note for every option (verified in
   `src/lesson/beats/PredictionBeat.tsx`). Conceptual change *requires* eliciting-then-confronting
   the exact wrong model (Posner 1982; refutation texts). Wire per-option feedback.

4. **Insert just-in-time (JIT) micro-primers at the exact beats where a prerequisite first
   "bites,"** not a wall of upfront teaching. Highest-priority primers: "what ½ E1 means"
   (before `equation-tiles`), "what 'on average' means" (before `refine-prediction`), "why an
   equation can have E0 on both sides" (inside `equation-tiles`).

5. **Confront the gambler's fallacy explicitly** the first time a learner watches a run of
   heads (L1 `simulate`) and again on the L3 walk. Left un-named, it silently corrupts how a
   novice reads *every* simulation in the course.

6. **Name and refute the "expected wait = 1/P" trap** as its own micro-beat. The L1 `open-bet`
   "tie — both take 4 flips" option already encodes it, but the lesson never says the words or
   explains why `HT` *does* land on 4 while `HH` does not.

7. **Use productive failure for the *concepts* and JIT primers for the *tools*.** Kapur (2008)
   productive failure (predict-first beats) is the right structure for thresholds like expected
   value and overlap — but only works when the learner has the *tools* (½, "average") to generate
   a representation. Don't ask a learner who can't read ½ to "productively fail" at building
   `½ E1 + ½ E0`.

8. **Flag and resolve the course-order discrepancy** (see §6): it changes *when each prerequisite
   first bites* and currently makes Penney's L2 depend on "3 lessons of muscle memory" the learner
   won't have.

---

## 2. Learning-science findings

Each finding pairs a sourced framework with a one-line "so what for this product."

| # | Framework / finding | Source | So what for Pattern Hitting Times |
|---|---|---|---|
| F1 | **Prior knowledge is the single biggest predictor of new learning**: "The most important single factor influencing learning is what the learner already knows. Ascertain this and teach him accordingly." Advance organizers bridge new material to existing schema. | Ausubel, *Educational Psychology: A Cognitive View* (1968) | The course never *ascertains* prior knowledge. A diagnostic + advance organizer ("expected value = average if you did this 100 times") is the highest-leverage missing piece. |
| F2 | **Zone of Proximal Development**: learning happens in the gap between what a learner can do alone vs. with guidance; instruction must target that gap. | Vygotsky, *Mind in Society* (1978) | A single 3-level hint ladder assumes one ZPD for everyone. For a near-zero learner the gap from "hint" to "required action" at `equation-tiles` exceeds the ZPD. |
| F3 | **Contingent scaffolding & fading**: effective tutors give *more* support after failure, *less* after success, and fade as competence grows ("scaffolding" coined here). | Wood, Bruner & Ross, "The role of tutoring in problem solving," *J. Child Psychol. Psychiatry* 17 (1976) | The hint ladder is contingent (escalates on wrong `Check`) — good. But `maxHintLevel: 2` faded scaffolding (transfer beats) can *strand* a novice, not just challenge an expert. Fading must be learner-relative. |
| F4 | **Threshold concepts**: certain ideas are *transformative, irreversible, integrative, and troublesome*; learners get stuck in a "liminal" state of partial understanding. | Meyer & Land, "Threshold Concepts and Troublesome Knowledge" (2003, 2006) | **Expected value**, **the self-referential recurrence**, and **state/Markov memory** are textbook thresholds. They need dwelling time and multiple representations, not one beat each. |
| F5 | **Representativeness heuristic & "law of small numbers"**: people expect short random sequences to "look random," producing the **gambler's fallacy** (a tail is "due" after heads). | Kahneman & Tversky, *Cognitive Psychology* 3 (1972); Tversky & Kahneman, *Science* 185 (1974); Tversky & Kahneman, "Belief in the law of small numbers," *Psych. Bulletin* (1971) | A novice watching `HHHH` in L1 `simulate` or the L3 walk *will* think a `T` is overdue. Unconfronted, it poisons their reading of the simulation that's supposed to *teach* them. |
| F6 | **Equiprobability bias**: novices judge outcomes of a "random" process as equally likely regardless of structure. | Lecoutre, "Cognitive models and problem spaces in 'purely random' situations," *Educ. Studies in Math.* 23 (1992) | The "they tie — both take 4 flips" option in L1 `open-bet` *is* equiprobability bias. The lesson exploits it but never names or generalizes it, so it recurs in Penney's (HH vs HT tie) and beyond. |
| F7 | **The "outcome approach"**: non-statistically-trained people interpret probability questions as *predicting the single next outcome*, not reasoning about distributions. | Konold, "Informal conceptions of probability," *Cognition and Instruction* 6 (1989) | A near-zero learner at `simulate` / `theory-vs-sim` tries to call the next flip rather than reason about a long-run mean. The whole "average converges" beat assumes the distributional frame they lack. |
| F8 | **Conditions for conceptual change**: a learner replaces a misconception only when there is (1) dissatisfaction with the old idea, (2) the new idea is intelligible, (3) plausible, (4) fruitful. | Posner, Strike, Hewson & Gertzog, "Accommodation of a scientific conception," *Science Education* 66 (1982) | The course does (1) weakly (predict-then-reveal) but jumps straight to formal machinery for (2) "intelligible" — which a novice can't parse, so no accommodation happens. |
| F9 | **Refutation texts beat standard exposition for misconceptions**: explicitly stating the wrong idea, marking it false, and explaining why outperforms neutral explanation. | Guzzetti, Snyder, Glass & Gamas, "Promoting conceptual change…," *Reading Research Quarterly* 28 (1993, meta-analysis); Tippett (2010) | Foreground refutations ("You might think both take 4 — here's exactly why HH doesn't") instead of burying them in hint level 2. |
| F10 | **Productive failure**: novices who attempt to *generate* solutions to a well-designed problem *before* instruction learn deeper — provided the problem is within reach and is followed by consolidation. | Kapur, "Productive failure," *Cognition and Instruction* 26 (2008); Kapur (2012, 2016) | The predict-first beats (`open-bet`, `refine-prediction`) are productive failure done right — for the *concept*. But productive failure fails if the learner lacks the *tools* to represent the problem at all (½, "average"). |
| F11 | **Cognitive Load Theory & the worked-example effect**: novice performance collapses with high *element interactivity*; worked examples reduce extraneous load vs. unguided problem solving. | Sweller (1988, 1994); Sweller & Cooper (1985) | `equation-tiles` has very high element interactivity for a novice (variables × coefficients × operators × self-reference). The pre-worked `E0` row (graded:false) is a worked example — *keep and extend that pattern*. |
| F12 | **Expert–novice difference**: experts categorize problems by deep structure; novices by surface features. | Chi, Feltovich & Glaser, *Cognitive Science* 5 (1981) | "Both are length 2" is the novice surface read the lesson must overturn; the deep structure is overlap. The persona split *is* an expert/novice split — design for both. |
| F13 | **Naive theories are suppressed, not replaced**: even after instruction, intuitive misconceptions persist and resurface under load. | Shtulman & Valcarcel, "Scientific knowledge suppresses but does not supplant…," *Cognition* 124 (2012) | Gambler's fallacy / equiprobability won't be "cured" by one beat. Re-elicit and re-confront them across lessons (spaced), especially under time pressure (Penney's, the L4 "interview clock"). |
| F14 | **Statistics-specific misconceptions are robust**: "average" is read as typical/middle/mode; law of large numbers is misunderstood; base rates neglected. | Garfield, "How students learn statistics," *Int. Stat. Review* 63 (1995); Kahneman & Tversky, "On the psychology of prediction," *Psych. Review* (1973) | The mean wait (6) is *not* the typical run; the duration distribution (esp. Gambler's Ruin) is fat-tailed. A novice reading `theory-vs-sim` thinks "6 = what usually happens." Must address "average ≠ typical." |
| F15 | **Concept image vs. concept definition**: learners operate on an intuitive "concept image" that can conflict with the formal definition (classic for limits, functions, expectation). | Tall & Vinner, *Educ. Studies in Math.* 12 (1981) | The learner's image of "expected value" is "the likely result," not "the long-run mean of a random quantity." Build the image *before* the symbol `E0`. |

---

## 3. Diagnosis — where the current product fails a near-zero learner (through this lens)

### 3a. Prerequisite-knowledge map (the core deliverable)

For each silently-assumed concept: **where it first bites** (exact beat + quoted copy), whether
it's truly assumed, and how to supply it. "Bite beat" uses the built L1 fixture unless noted.

| Concept | Assumed? | First bites at (exact beat / quote) | Threshold? (F4) | Recommended supply |
|---|---|---|---|---|
| **Sample space / "outcomes"** | Yes, silently | L1 `open-bet`: *"You flip a fair coin until you see HH."* | no | One line in an on-ramp: the only outcomes are H/T. |
| **Randomness + independence (no "due")** | Yes, silently | L1 `simulate`: *"Flip the coin and watch… Where does progress go on each flip?"* | **yes** | Refutation micro-beat confronting gambler's fallacy (F5). |
| **Probability as a number / long-run frequency** | Yes | L1 `simulate` → `theory-vs-sim`: *"watch the empirical average converge toward the theory line."* | **yes** | JIT: "probability = the fraction over many trials." Anchor to the sim. |
| **Fraction ½ and "½ of N"** | **Yes, hard** | L1 `equation-tiles`: the `1/2` prob tile; *"then split by the coin."* | no (but troublesome) | JIT fraction primer at first `1/2` tile; "½ E1 = half of E1." |
| **Juxtaposition = multiplication (`½ E1`)** | Yes, silently | L1 `equation-tiles` bank (`prob 1/2` next to `state E1`) | no | Same primer; show `½ × E1`. |
| **"Average" / arithmetic mean** | Yes | L1 `open-bet` option *"both take 4 flips on average"*; `refine-prediction`: *"how many flips, on average"* | **yes** | On-ramp: average of a short list; then average of many trials. |
| **Expected value / expectation** | **Yes — the master assumption** | L1 `open-bet` (the entire bet is about E); explicit at `refine-prediction`: *"commit to a number: how many flips, on average, until HH?"* | **yes (master threshold)** | This is what the *whole* on-ramp/States-&-Streaks case should build first. |
| **Variables / symbolic unknown (`E0`, `E1`)** | Yes | L1 `failure-edge` (states named `E1`,`E0`); load spikes at `equation-tiles` | **yes** | JIT: "E0 = a box for the answer-we-don't-know-yet: the average wait *from here*." |
| **Reading a state/transition diagram** | Yes | L1 `simulate`: *"watch the state machine… the active state chip"*; `failure-edge`: *"Where does the state machine go?"* | **yes (Markov memory)** | On-ramp with the 2-node `H` graph (planned States & Streaks hero) before the 3-node one. |
| **What an equation *is* / both sides equal** | Yes | L1 `equation-tiles` | no | Covered by fraction/variable primer. |
| **Self-referential recurrence (`E0` on both sides)** | **Yes, silently** | L1 `equation-tiles` target `E0 = 1 + ½E1 + ½E0` | **yes** | JIT: "why it's not circular" + the worked `E0` row already shown (keep it). |
| **Weighted average / law of total expectation** | Yes, silently | L1 `equation-tiles`: *"every flip costs 1, then split by the coin"* | **yes** | Name it concretely: "1 for this flip, then on average it depends on where you land." |
| **Solving a linear equation / isolating a variable** | Yes | L1 `guided-solve` hint: *"Solving 1/2 E0 = 3 gives E0 = 6."* | no | Tap-through stepper already low-load; add a "why subtract ½E0" aside. |
| **System of equations + substitution** | Yes | L1 `guided-solve`: *"solve the system for E0"* | no | The stepper handles it; ensure each step's *why* is visible. |
| **Convergence / law of large numbers** | Yes | L1 `theory-vs-sim`: *"empirical average converge toward the theory line"* | **yes** | Tie to the "average of many trials" image; confront "small samples are reliable" (F5). |
| **Exponents `2^L`** | Yes (later) | Overlap Shortcut (canonical **L6**) `sum-it`/`apply-*`: `Σ 2^L`, `HH → 4+2` | no | JIT exponent primer in that lesson; `2^3 = 8` shown. |
| **Summation Σ** | Yes (later) | Overlap Shortcut (L6): *"`E[wait] = Σ 2^(overlap length)`"* | no | Render the Σ as the SumTiles running sum (the widget already de-symbolizes it). |
| **Ratios / `q/p`, `i/N`, `i(N−i)`** | Yes (later) | Gambler's Ruin (canonical **L3**) closed forms `P_i=i/N`, `(1−r^i)/(1−r^N)` | no | Keep tile work fair-coin only (the grader already forces this); ratios live in charts. |
| **Transitive relations (to *feel* non-transitivity)** | Yes (later) | Penney's (canonical **L2**) `non-transitive-loop` | no | Pre-teach "beats" as a chain (A beats B beats C → expect A beats C) before breaking it. |

**The headline diagnosis:** Of the ~14 assumed concepts, **at least 9 first bite inside L1, and
6 of those cluster in three adjacent beats** (`equation-tiles`, `refine-prediction`, `guided-solve`).
A near-zero learner hits expected value, fractions-as-multiplication, variables, weighted average,
self-referential recurrence, and equation-solving *in one screen sequence on a 3-state machine* —
the single highest element-interactivity load (F11) at the single hardest entry point. This is the
opposite of "simplest example first" (F4 dwelling time, Sweller worked-example scaffolding).

### 3b. Misconception inventory (tied to exact beats)

"Authored" = the fixture/plan already targets it. "Unaddressed" = a near-zero learner brings it and
nothing confronts it.

| Misconception | Status | Beat where it fires (quote) | Fix (this lens) |
|---|---|---|---|
| **"Both length-2 ⇒ both wait 4" (equiprobability/representativeness, F6/F5)** | Authored (weakly) | L1 `open-bet` option *"They tie — both take 4 flips on average"*; hint *"Most people pick the tie. Notice the trap…"* | Promote the refutation out of hint-2 into the reveal; make `prediction` respond per-option (F8/F9). |
| **"Expected wait = 1/P(pattern)" → 4 for both** | Implicit only | Same "tie at 4" option encodes `1/P=1/(1/4)=4`. Never named. PRD lists it as a target misconception but no beat owns it. | A dedicated micro-beat: "1/P works for *one* flip (`H`→2) but not for overlapping patterns — here's why `HT`=4 but `HH`=6." Note the trap: `HT` genuinely *is* 4, which makes the wrong answer half-right and confusing. |
| **Gambler's fallacy ("a T is due after HHHH", F5/F13)** | **Unaddressed** | L1 `simulate` (watching the live stream); L3 Gambler's Ruin walk (`walk-once`, `ruin-board`) | Add a refutation beat at first long run; re-elicit on the L3 walk. This is the most damaging unhandled bug for a novice. |
| **Outcome approach ("just predict the next flip", F7)** | **Unaddressed** | L1 `simulate`, `theory-vs-sim` (*"empirical average converge"*) | Frame the sim as "we're counting *how long*, many times," not "guess the next flip." |
| **"Average = typical/most common" (F14)** | **Unaddressed** | L1 `theory-vs-sim` (mean 6 ≠ modal run); acute in L3 duration (fat tail, the plan's DistributionHistogram) | One line at `theory-vs-sim`: "6 is the *average* — most runs are shorter, a few are long." |
| **Forgetting the `1 +` flip cost** | Authored | L1 `equation-tiles` hint *"Each non-absorbing state starts with the 1 flip cost"* | Keep; add the *why* ("the flip you're about to make always counts as 1"). |
| **Self-loop reset target (HT `½E1` vs `½E0`)** | Authored | L1 `equation-tiles` correct: *"The 1/2 E0 term in E1 is HH's penalty"* | Keep; this is well done. |
| **Absorbing state `E2` treated as nonzero** | Authored | L1 `equation-tiles` row `E2 = 0` | Keep; add "0 because you're already done — no more flips needed." |
| **"Self-referential equation is circular/impossible"** | **Unaddressed** | L1 `equation-tiles` target `E0 = 1 + ½E1 + ½E0` | JIT note inside the beat: "E0 on both sides is allowed — it's an *equation to solve*, like `x = 1 + ½x`." |
| **"Faster expected wait ⇒ wins the race"** | Authored (L2) | Penney's `open-bet`: *"Pick HT because 4<6"* | Sound — but it presumes the learner *has* solid expected-wait, which under canonical order they barely do (only L1). See §6. |
| **"Adding a `1+` to a probability recurrence"** | Authored (L2/L3) | Penney's `win-prob-tiles` (*"3 lessons of habit"*); Gambler's Ruin `ruin-tiles` | The "3 lessons of habit" assumption is false under canonical order (Penney's is L2). Re-scope the framing. |
| **"Fair game ⇒ safe / can't go broke" (gambler's fallacy cousin)** | Authored (L3) | Gambler's Ruin `open-bet`: *"0% — it's fair" / "always 50/50"* | Good trap; pair with the explicit gambler's-fallacy refutation (same root, F5). |
| **"Only the full overlap counts" (omit k=1)** | Authored (L4/L6) | Overlap Shortcut `sum-it`: *"Omit the k=1 term → get 4 (known-wrong for HH)"* | Good — but requires exponents (`2^1`) the novice may lack; gate behind an exponent primer. |
| **"Longer pattern ⇒ longer wait"** | Authored (L4/L6) | Overlap Shortcut `surprise-HHH` (`HHH`=14 vs `THH`=8) | Good desirable-difficulty surprise; keep. |
| **"P(H)=½ so wait = 1 flip"** | Authored (States & Streaks) | `open-hook`: *"1 flip — it's 50/50 on the first try"* (trap) vs correct *"2 flips"* | This is the *perfect* novice on-ramp trap — another reason to move this lesson first (§6). |

### 3c. Structural failures of the supply mechanisms

- **`prediction` cannot do conceptual change.** Verified in `src/lesson/beats/PredictionBeat.tsx`:
  any selection yields the same `{ kind: 'note', label: 'Good guess!' }` using `fb.hints[2]`. So
  a learner who picks the *equiprobability trap* and one who picks the *correct* answer get
  identical acknowledgement. Posner's "dissatisfaction" (F8) and refutation (F9) require
  responding to the *specific* wrong model. This is a one-component fix with outsized payoff.
- **Hint ladder is uniform, not learner-relative (F2/F3).** `useHintLadder` escalates only on a
  wrong `Check` and tops out at 3 authored strings. For a near-zero learner the *first* required
  action at `equation-tiles` is already past their ZPD, and three text hints don't add a missing
  prerequisite (e.g., what ½ means). Hints assume the tools; they can't supply them.
- **No advance organizer / prior-knowledge activation (F1).** The learner is dropped into the bet
  with zero bridging. For the novice there is little correct prior knowledge to anchor to and much
  *incorrect* prior knowledge (F5–F7) left active.
- **Prompt over-asks vs. options.** `open-bet` asks *"Which wait is longer, **and by how much**?"*
  but no option answers "by how much" (the answer is "by 2"). A novice reads the question, finds no
  matching answer, and is quietly destabilized. Minor, but it's a clarity tax on the least-confident
  learner.

---

## 4. Recommendations for `docs/proposed-lessons.md` (L2–L6)

Concrete, per-lesson. Lessons named (canonical L-number per PRD/CONTEXT; see §6 for the numbering
conflict that affects all of these).

### Penney's Game (canonical L2)
- **Add a primer beat 0: "what does 'who's first' mean vs 'how long'?"** Before `open-bet`, a
  10-second concrete card: two friends watch the *same* stream; one wins when their pattern shows
  first. Novices conflate "first" and "how long" because they never solidified "how long" (F12).
- **Re-scope the `win-prob-tiles` framing.** The plan leans on "3 lessons of muscle memory" to set
  up the no-`1+` trap. Under canonical order this is **L2** — only L1 precedes it. Reword to "in
  L1 every flip cost 1; *here we're asking a yes/no question, so there's no cost.*" Don't claim a
  habit the learner lacks.
- **Pre-teach transitivity before `non-transitive-loop`.** Add one sentence/visual: "Normally if A
  beats B and B beats C, you'd bet A beats C." A novice can't feel the paradox without the rule it
  violates (F4 troublesome/integrative).
- **Defer the 5-state algebra (the reviewer's own cut).** The plan's own Opus review says beats 7–9
  are a "wall of algebra"; for inclusivity this is doubly true — fold to "Conway + simulation" and
  make `win-prob-tiles` the 2-state HH/HT case. Less prerequisite load, same insight.

### Gambler's Ruin (canonical L3)
- **Add an explicit gambler's-fallacy refutation beat** right after `walk-once`. The whole lesson
  ("fair ≠ safe") rides on a misconception (F5) it never names. Elicit it ("after three losses, are
  you due for a win?"), refute it (F9), then let the swarm prove it. This makes the emotional core
  *land* for a novice instead of confirming their fallacy.
- **Address "average ≠ typical" at the duration histogram (F14).** The plan's DistributionHistogram
  is the perfect place: "the *average* duration is 4, but look — most games are short and a few drag
  on." Make this an explicit takeaway, not a side visual.
- **Keep equation tiles fair-coin only** (the grader already forces `1/2`; ratios `q/p` are
  chart-only). Good for inclusivity — do not let `i/N`, `r^i` leak into a graded tile beat.
- **Split the two recurrences with a "what are we even asking?" framing.** Probability vs duration
  is a deep distinction novices conflate; label each build with its plain-English question
  ("chance of X" vs "how many steps") before the symbols.

### Overlap Shortcut (canonical L6 — the martingale capstone)
- **Gate the lesson behind an exponent primer.** `Σ 2^L` needs both Σ and exponents; a near-zero
  learner may not know `2^3 = 8`. Add a 20-second "powers of two" card (`2,4,8,16`) before
  `self-overlap`. The SumTiles widget already de-symbolizes Σ into a running sum — lean on it.
- **Soften the martingale.** The plan itself flags optional stopping as the most abstract idea. For
  inclusivity, lead with the *deterministic-payout* intuition the plan's reviewer recommends ("the
  survivors are the same every run; only the flip count changes; a fair game can't make money → the
  two must be equal") and show running `mean(T)` immediately. Avoid the word "martingale" until the
  recap.
- **This lesson is the *most* prerequisite-dependent** (it re-derives 6/4/8/10 a new way). For a
  near-zero learner who limped through L1, it will collapse. Recommend it carry an explicit "you'll
  want to be comfortable with L1's answers first" gate and a quick recall warm-up (it already plans
  `recall-grid`).

### States & Streaks (canonical L4) — **reposition (see §6)**
- This lesson's content (single `H`, 2 states, `E[H]=2`, the "1 flip vs 2 flips" trap) is the
  **ideal first experience for a near-zero learner**, not a fourth-lesson consolidation. Its
  `open-hook` trap *"1 flip — it's 50/50"* is the cleanest possible elicitation of the
  expected-value threshold (F4). **Recommend: clone its core (3–4 beats) as the pre-L1 on-ramp**
  (see §6), and keep the full lesson as the planned multi-lens consolidation for everyone.
- Demote Kac (the plan's own math reviewer flags it): for a novice, "hitting time = recurrence time"
  is a *new misconception* L5/L6 must undo. Keep the trio {first-step, geometric 1/p, overlap Σ2^L}.

### Longer Patterns (canonical L5) — the transfer lesson
- **Faded scaffolding (`maxHintLevel: 2`) is right for the expert and risky for the novice (F3).**
  A near-zero learner who reaches the cap is *stranded with no reveal* on a graded beat. Because
  `transferAttained` is non-gating, consider: keep the cap for the badge, but **let a learner who
  has hit the cap and is still wrong access a one-time "walk me through it" path** (records
  `needsReview`, forfeits the badge, but doesn't dead-end). Fairness over purity for the novice.
- **Don't reopen prerequisites here** (the plan's "no HH/HT recap" is correct for transfer) — but
  ensure the novice arrives having actually *learned* L1, which the on-ramp + JIT primers secure.

### Cross-L2–L6 authoring rule
- **Every new graded interaction needs an authored, per-misconception wrong-path string**, not just
  the generic ladder. The plans already note `equationDiagnosis.ts` is HH-hardcoded; for inclusivity
  the bigger issue is that wrong-answer copy must *refute* (F9), e.g. "You added a `1+` — but we're
  asking a probability, which has no per-flip cost," not "Try again."

---

## 5. Recommendations for the implemented L1 lesson (`fixtures/lesson-pattern-hitting-times.json`)

Per-beat, with engine/component implications. Most are fixture-only or small component changes;
two need new beat types (schema is a closed discriminated union → schema + dispatcher edits).

| Beat | Change | Why (lens) | Implementation |
|---|---|---|---|
| **(new) on-ramp, pre-`open-bet`** | Insert an optional 3–4 beat "first H, E[H]=2" warm-up (clone States & Streaks core) shown only to learners who fail the diagnostic. | Simplest-case-first; build the EV concept image (F4/F15) on 2 states before 3. | New lesson `lesson-foundations` or a `kind: "onramp"` flag; gated by diagnostic result. Engine already supports `buildAutomaton("H",0.5)` (`E0=2`). |
| **`open-bet`** | (1) Make feedback **per-option** (refute the tie pick directly). (2) Reconcile prompt "by how much" with the options (drop it or add a magnitude option). | Conceptual change needs eliciting + refuting the *specific* model (F8/F9). Prompt/option mismatch taxes the least-confident learner. | `PredictionBeat.tsx` currently shows one note for all picks; add `feedback.byOption` (schema `Interaction.prediction` + `Feedback`), branch on `selected`. |
| **(new) primer after `open-bet`** | "What 'on average' means" micro-card (average of a short list → average of many trials). | "Average" and EV are thresholds (F4/F14) assumed by `open-bet` and `refine-prediction`. | New `primer`/`concept-card` beat type (narrative; can piggyback the `recap`/`overlap` render path), or a `coinSim` pre-roll. |
| **`pattern-pick`** | Low prerequisite load — keep. Add one line defining "pattern" plainly. | Minor; "pattern" is jargon for a novice. | Fixture copy only. |
| **`simulate`** | Add an explicit **gambler's-fallacy refutation** the first time a run of ≥3 same-face appears; reframe as "we're measuring *how long*, repeatedly," not "guess the next flip." | F5/F7/F13 — the unhandled bug that corrupts how a novice reads every sim. | `CoinSimBeat` can detect a run and surface a one-time aria-live note; copy in fixture. No engine change. |
| **(new) primer before `equation-tiles`** | "½ E1 means half of E1" fraction/multiplication card; "E0 = a box for the average wait from here" variable card. | The load cliff: ½-as-multiply + variables both bite here (F11). | New `primer` beat or inline panel in `EquationTilesBeat`. The `1/2` tile is already a fixed token (PRD), so no checker change. |
| **`equation-tiles`** | (1) Keep the pre-worked `E0` row (graded:false) — it's a worked example (F11), great. (2) Add an inline "why E0 on both sides isn't circular" aside. (3) Make the first hint *supply the prerequisite*, not just nudge. | Self-referential recurrence is a threshold (F4); current hints assume the tools (F2). | Fixture hint copy; optional small `EquationTilesBeat` aside panel. The worked `E0` row already exists in the fixture — preserve it. |
| **`refine-prediction`** | Add a sentence connecting the slider to "average over many tries" (the image you just built). | Ties the EV concept image (F15) to the numeric commit; productive failure works only if the concept is reachable (F10). | Fixture copy only. |
| **`guided-solve`** | Surface the *why* of each step ("subtract ½E0 from both sides because…"), not just the result. Keep tap-through (low load). | Equation-solving is assumed; the stepper is good but currently result-focused. | Fixture `substitution` step copy; the stepper already exists. |
| **`theory-vs-sim`** | Add "6 is the *average* — most runs are shorter, a few long" (average ≠ typical) and "more trials = steadier, not 'due'" (anti-gambler's-fallacy). | F14 + F5: the convergence beat assumes the distributional frame the novice lacks (F7). | Fixture copy; optionally annotate the chart. No engine change. |
| **`overlap`** | Keep — strong. Add a plain-language restatement before the expert "Σ 2^i" note. | The narrative is good; the expert note (Σ) is a prerequisite spike if shown to a novice. | Fixture copy; keep expert note collapsible. |
| **`recap`** | Add a "what you now know" list that *names* the concepts crossed (expected value, states, recurrence) — consolidation per Kapur (F10). | Productive failure requires an explicit consolidation/assembly phase. | Fixture/`RecapBeat` copy. |

**Net engine/component implications for L1 inclusivity:**
- **No core engine math changes.** `buildAutomaton` already produces everything (including the `H`
  case `E0=2` for an on-ramp).
- **One high-value component change:** per-option feedback in `PredictionBeat` (+ `Feedback`/schema).
- **One or two new beat types** (`primer`/`concept-card`, and a graded `mcq`/diagnostic) — both are
  schema-union + `beats/index.tsx` dispatcher additions; the plans already anticipate similar new
  variants. Reduced-motion/tap-only paths must be authored for each (the codebase convention).
- **Most changes are fixture copy** (refutation framing, JIT primers as narrative beats) — cheap and
  reversible, the right place to start.

---

## 6. Cross-cutting / structural proposals

### 6a. Resolve the course-order discrepancy (it governs the whole prerequisite map)
Three docs disagree, and the difference changes *when each prerequisite first bites*:

- **Canonical (per the brief; `docs/mvp_prd.md`, `CONTEXT.md`):**
  L1 Pattern Hitting Times → L2 Penney's → L3 Gambler's Ruin → **L4 States & Streaks** →
  **L5 Longer Patterns** → **L6 Overlap Shortcut**.
- **`docs/future_ideas.md`:** L1 → L2 Penney's → L3 Gambler's Ruin → **L4 Overlap Shortcut** →
  **L5 States & Streaks** → **L6 Longer Patterns**.
- **`docs/proposed-lessons.md`:** uses legacy section anchors (`§L4 Penney's`, `§L5 Gambler's`,
  `§L6 Overlap Shortcut`). The **plan files inherit `future_ideas` numbering**: `plan-L3` says
  "before L4 Overlap Shortcut"; `plan-L5-states-streaks` says "States & Streaks is L5, after the
  Overlap Shortcut"; `plan-L6-longer-patterns` is the final transfer.

I followed the brief's instruction to treat **PRD/CONTEXT as canonical**. The coordinator must pick
one and propagate it, because two lesson plans (`plan-L4-overlap-shortcut`, `plan-L5-states-streaks`)
are written assuming the *other* order and reference prerequisites accordingly (e.g. Overlap Shortcut
"after L1–L3," States & Streaks "after L1–L4 incl. Overlap Shortcut"). **For my lens the conflict is
not cosmetic:** it determines whether the simplest case (States & Streaks) is the learner's 4th or
5th experience, and whether Overlap Shortcut's `Σ2^L` lands before or after the transfer lesson.

### 6b. The simplest case belongs first (the biggest inclusivity lever)
Both the curriculum agent (`agent-5-curriculum.md`) and the `plan-L5` Opus review independently
conclude the prerequisite-optimal sequence is **H → HH → HT → …**, and that L1 (HH, 3 states,
reset edge) is "a heavier cognitive entry point than necessary." The blocker is that **L1 is already
built as the flagship gate**, so re-sequencing is costly. For near-zero inclusivity, my concrete
proposal:

> **Ship the States & Streaks core (single `H`, `E[H]=2`, the "1 vs 2 flips" trap) as an optional,
> diagnostic-gated pre-L1 "Lesson 0 / On-ramp," reusing the engine's existing `buildAutomaton("H")`.**

This gives the novice the gentlest possible first contact with *every* threshold (EV, states,
recurrence, average) on 2 nodes, then re-uses the *identical* machinery at 3 nodes in L1 — exactly
the worked-example→problem fade (F11) and "simplest example first" (F4) the literature wants. The
expert skips it via the diagnostic.

### 6c. Diagnostic placement + dual-track, not a mandatory Lesson 0
A *mandatory* Foundations module bores the Green-Book persona (F12 — they have the schema already)
and gates them behind ½-and-average drills. A *no-foundations* course loses the novice. Resolution:

- **A 5-item diagnostic** (≈60s) at course start: (1) "½ of 8 = ?"; (2) "the average of 2, 4, 6?";
  (3) read a one-node→one-node arrow; (4) "you flip a fair coin; after H,H,H, is T more likely
  next?" (gambler's-fallacy probe); (5) "on average, how many flips to get one H?" (EV probe).
- **Route**: ≥4 correct → straight to L1; else → the On-ramp + JIT primers turned on.
- Implementation note: there is **no graded single-select MCQ beat type** today (`prediction` is
  ungraded — verified). The diagnostic needs a small new `mcq`/`diagnostic` variant (schema +
  dispatcher). This is the one genuinely new piece of infrastructure my lens requires.

### 6d. Foundations module contents (if/when built)
Keep it tiny and concrete; each maps to a bite-point in §3a:
- **F-coin:** fair coin, independence, *no "due"* — refutation-text style (F5/F9).
- **F-avg:** "average" of a short list → average of many trials (bridge to EV, F14/F15).
- **F-half:** ½ = 1 of 2; ½ of 8 = 4; `½ E` = half of E (fractions + juxtaposition).
- **F-box:** a variable as "a box for the unknown answer" (pre-algebra for `E0`).
- **F-map:** reading a state map (you're "at" a node; arrows are flips) (Markov memory, F4).
(Σ and exponents are best taught JIT inside the Overlap Shortcut, not upfront — they don't bite
until L6.)

### 6e. Just-in-time over upfront; productive failure for concepts only
- **JIT primers for *tools*** (½, average, variable, exponent): deliver at the exact bite-beat
  (§3a), dismissible, re-openable. Upfront teaching of tools the learner won't use for three beats
  violates contiguity and is forgotten.
- **Productive failure for *concepts*** (EV, overlap, race-vs-wait): the predict-first beats are
  already this (F10). Preserve and extend them — but only *after* the tools are in place, or the
  "failure" is unproductive (the learner can't even represent the problem).
- **Spaced re-confrontation of misconceptions (F13):** gambler's fallacy and equiprobability bias
  must be re-elicited across L1 (sim), L2 (HH/HT tie), L3 (walk). One beat never cures them.

### 6f. Make wrong-answer feedback refutational course-wide
Every graded beat's hint level 1 should *name the likely wrong model and mark it false* (F9), not
just nudge. This is a copy/authoring standard, cheap to adopt, and the single most evidence-backed
change for misconception repair.

---

## 7. Tradeoffs & open questions

- **Depth vs. accessibility (the core tension).** Every primer/refutation beat adds length and risks
  the Brilliant "one concept per screen" snappiness — and risks condescending to the expert. The
  diagnostic dual-track is my proposed resolution, but it adds the *only* new infra my lens needs (a
  graded MCQ type) and a branching content path. **Open question for the human:** is a branching,
  diagnostic-gated course in scope for Phase 1, or should inclusivity ship as always-on, dismissible
  JIT primers (simpler, slightly noisier for experts)?
- **Re-sequencing vs. an on-ramp.** Teaching H before HH is pedagogically cleanest but reopens the
  built flagship and the gate definition. The on-ramp avoids touching L1 but adds a lesson. **Open:**
  is the flagship gate (`hh-ht-mastered`) allowed to be preceded by an ungated Lesson 0?
- **Productive failure vs. cognitive overload.** Kapur (F10) says let novices struggle first; Sweller
  (F11) says novices drown in high element interactivity. They reconcile *only* if the struggle is
  within the ZPD. **Open:** where exactly is the near-zero learner's ZPD boundary — is `equation-tiles`
  recoverable with primers, or does it need to be split into more sub-beats? Worth a usability test.
- **Naming misconceptions vs. planting them.** Refutation texts (F9) require *stating* the wrong idea
  — but there's a documented (small) risk of reinforcing it if the refutation is weak. Mitigate with
  strong, immediate, concrete refutation; don't leave the wrong model as the last thing on screen.
- **The "tie at 4" trap is half-correct.** `HT` genuinely is 4, so a learner who later anchors on "4"
  is partly right. **Open:** does this aid (HT=4 is a real landmark) or confuse (why was my wrong
  answer right?) a novice? Test the per-option feedback copy here especially.
- **`transferAttained` cap fairness.** Hard `maxHintLevel: 2` is a clean expert signal but can
  dead-end a novice on a graded beat. My "cap the badge, not the help" proposal trades signal purity
  for inclusivity. **Open:** acceptable to the product owner, given the badge is already non-gating?
- **Diagnostic mis-routing.** A 5-item check is coarse; it may route a shaky learner past Foundations
  or vice versa. Keep primers re-openable from any beat so routing errors are recoverable.

---

## 8. Sources

Learning science:
- Ausubel, D. (1968). *Educational Psychology: A Cognitive View.* (Prior knowledge; advance organizers.)
- Vygotsky, L. (1978). *Mind in Society.* (Zone of Proximal Development.)
- Wood, D., Bruner, J., & Ross, G. (1976). "The role of tutoring in problem solving." *J. Child Psychology and Psychiatry* 17(2). (Scaffolding; contingent support; fading.)
- Meyer, J., & Land, R. (2003, 2006). *Threshold Concepts and Troublesome Knowledge.* (Transformative/irreversible/integrative/troublesome; liminality.)
- Kahneman, D., & Tversky, A. (1972). "Subjective probability: A judgment of representativeness." *Cognitive Psychology* 3. (Representativeness.)
- Tversky, A., & Kahneman, D. (1971). "Belief in the law of small numbers." *Psychological Bulletin* 76. (Gambler's fallacy roots.)
- Tversky, A., & Kahneman, D. (1974). "Judgment under uncertainty: Heuristics and biases." *Science* 185.
- Kahneman, D., & Tversky, A. (1973). "On the psychology of prediction." *Psychological Review* 80. (Base-rate neglect.)
- Konold, C. (1989). "Informal conceptions of probability." *Cognition and Instruction* 6(1). (The "outcome approach.")
- Lecoutre, M.-P. (1992). "Cognitive models and problem spaces in 'purely random' situations." *Educational Studies in Mathematics* 23. (Equiprobability bias.)
- Posner, G., Strike, K., Hewson, P., & Gertzog, W. (1982). "Accommodation of a scientific conception: Toward a theory of conceptual change." *Science Education* 66(2).
- Guzzetti, B., Snyder, T., Glass, G., & Gamas, W. (1993). "Promoting conceptual change in science." *Reading Research Quarterly* 28. (Refutation-text meta-analysis.)
- Kapur, M. (2008). "Productive failure." *Cognition and Instruction* 26(3). (And Kapur 2012, 2016.)
- Sweller, J. (1988, 1994). Cognitive Load Theory; Sweller & Cooper (1985), worked-example effect. *Cognitive Science / Learning and Instruction.*
- Chi, M., Feltovich, P., & Glaser, R. (1981). "Categorization and representation of physics problems by experts and novices." *Cognitive Science* 5.
- Shtulman, A., & Valcarcel, J. (2012). "Scientific knowledge suppresses but does not supplant earlier intuitions." *Cognition* 124.
- Garfield, J. (1995). "How students learn statistics." *International Statistical Review* 63(1). (And Garfield & Ben-Zvi 2007.)
- Tall, D., & Vinner, S. (1981). "Concept image and concept definition in mathematics." *Educational Studies in Mathematics* 12.
- Bransford, J., Brown, A., & Cocking, R. (2000). *How People Learn.* (Preconceptions; prior knowledge.)
- Fischbein, E. (1975). *The Intuitive Sources of Probabilistic Thinking in Children.*

Repo artifacts cited:
- `fixtures/lesson-pattern-hitting-times.json` (built L1; all L1 beat quotes).
- `src/lesson/beats/PredictionBeat.tsx`, `src/lesson/feedback.ts` (ungraded prediction; hint ladder).
- `docs/mvp_prd.md`, `CONTEXT.md` (canonical order, authored misconceptions, data contracts).
- `docs/proposed-lessons.md`, `docs/future_ideas.md` (L2–L6 specs; ordering conflict).
- `audits/ideation/agent-5-curriculum.md`, `plan-L2-penneys-game.md`, `plan-L3-gamblers-ruin.md`, `plan-L4-overlap-shortcut.md`, `plan-L5-states-streaks.md`, `plan-L6-longer-patterns.md` (beat-level specs and their own pedagogy reviews; the "simplest case first" convergence).
