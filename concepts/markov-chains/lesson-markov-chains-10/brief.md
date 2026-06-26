# Lesson Brief: Markov in the Wild  (lesson-markov-chains-10)

## Hook  (the bet)

"Three chains land on your desk with the labels torn off: **balls rattling between two boxes**, a city's
sky cycling **sun → cloud → rain**, a **drunk weaving between a ditch and a wall**. You've spent nine
lessons forging the tools — `(I−Q)⁻¹R`, `(I−Q)t=1`, `πP=π` — but a real problem never arrives stamped
with which one to use. **Here's the bet:** *before* you compute a single thing, can you sort each chain
into **'heads for an exit and stops'** vs. **'mixes forever'** — and name the **one question** that
decides it?"

## Core promise (one idea)

Every question a chain can pose forks on a single structural test — *is there a state the chain can
**never leave**?* **Yes → it's absorbing:** ask *which* exit (absorption probability `(I−Q)⁻¹R`) and
*how long* until it's trapped (hitting time `(I−Q)t=1`). **No → it mixes forever (ergodic):** ask the
*long-run share* (`πP=π`, Kac return time `1/πᵢ`). Read the **structure, not the story**, and the tool
picks itself.

## Display fields

- **glyphKey:** `mix`
- **vizKey:** dice

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| **[absorbing]** Drunkard's symmetric walk {0,1,2,3,4}, 0 & 4 absorbing, ½/½: P(reach 4 \| start i) = i/4 | **(1/4, 1/2, 3/4)** | Grinstead & Snell **Ex.11.13–15** — https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf *(reuse L5)* | [ ] engine [x] source |
| **[absorbing]** Same walk: expected steps to absorption = i(N−i) | **(3, 4, 3)** | Grinstead & Snell **Ex.11.15** — same URL *(reuse L5)* | [ ] engine [x] source |
| **[absorbing]** Gambler's ruin {0,1,2,3}, up 2/3 / down 1/3, 0 & 3 absorbing: P(reach \$3 \| start \$1) | **4/7** (a₂ = **6/7**) | GB **p.54–55 §5.1** *(reuse L5)* | [ ] engine [x] source |
| **[ergodic]** Weather (clear/rainy) `P=[[3/5,2/5],[3/10,7/10]]`: long-run share | **(3/7, 4/7)** | Math.SE **3336273** — https://math.stackexchange.com/questions/3336273 *(reuse L6)* | [ ] engine [x] source |
| **[ergodic]** Cloudy-town `P=[[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]]`: long-run share | **(1/5, 2/5, 2/5)** | Rochester **ECE440 HW5 #2** — https://www.hajim.rochester.edu/ece/sites/gmateos/ECE440/Homework/hw_5_markov_chains_solution.pdf *(reuse L6)* | [ ] engine [x] source |
| **[ergodic, reversible]** Ehrenfest m=2 `P=[[0,1,0],[1/2,0,1/2],[0,1,0]]`: long-run **time-share** = C(2,i)/2² | **(1/4, 1/2, 1/4)** | stats.libretexts **16.8** — https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/16%3A_Markov_Processes/16.08%3A_The_Ehrenfest_Chains *(reuse L8)*  ⚠️ **period 2** — time-average, *not* `Pⁿ`-convergence | [ ] engine [x] source |
| **[optional enrichment]** PageRank 4-node, d=1: stationary = rank | **(4/13, 5/13, 1/13, 3/13)** | practicaldsc.org PageRank — https://practicaldsc.org/wn25/guides/linear-algebra/pagerank/ *(reuse L9; **sourced-only**, Manager #2)* | [ ] engine [x] source |

> Exact-rational check (Stage-2 reproduces in `markov.ts` via `absorptionProbabilities` /
> `expectedAbsorptionTime` / `stationaryDistribution` / `classifyStates`, all over `solveLinearSystem`;
> **no floats on any graded path**): drunkard `B=(I−Q)⁻¹R` ⇒ i/4 = **(1/4,1/2,3/4)**; `(I−Q)t=1` ⇒
> i(4−i) = **(3,4,3)**. Gambler `a₁=⅓a₀+⅔a₂, a₂=⅓a₁+⅔a₃` ⇒ **4/7**. Weather `πP=π, Σπ=1` ⇒ **(3/7,4/7)**;
> cloudy-town ⇒ **(1/5,2/5,2/5)**. Ehrenfest detailed balance `πᵢpᵢⱼ=πⱼpⱼᵢ` ⇒ **(1/4,1/2,1/4)** = the
> **long-run fraction of time** (holds for any irreducible chain by the ergodic theorem); since the chain
> is **periodic (period 2)** the step-`n` distribution oscillates and does **not** converge — `πP=π` is
> answerable, `Pⁿ→π` (L7) is not. **Every graded numeric beat below is an exact rational from a small
> rational chain.**

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-pick-the-tool` | Reactivate the whole toolkit — match each headline **result** to the **tool** that made it (graded warm-up) | retrieval bridge from L5/L6 — the springboard, not new teaching | "every chain question runs through the same one formula" | yes (easy) | both | REUSE `retrievalGrid` |
| 2 | `which-tool-bet` | Commit a gut pick: for the **unlabeled Ehrenfest urn**, *which* tool? | frames absorbing-vs-ergodic as a tool **choice** | "balls bouncing forever must end up stuck → absorption" | no (`byOption`) | both | REUSE `prediction` |
| 3 | `name-the-rubric` | Name the decision rubric JIT: absorbing → time/prob, ergodic → stationary | **the lesson's one teachable idea** (the fork + its formulas) | — (JIT primer) | no | A | REUSE `primer` |
| 4 | `classify-one` | Tap "ergodic → stationary share" on the **weather** chain (guaranteed early win) | apply the rubric's easy branch (no absorbing state ⇒ mixes forever) | "a 'bad-weather' state is where the chain gets stuck" | yes (easy) | both | REUSE `chainBoard:diagram` |
| 5 | `walk-recall` | Replay the **absorbing drunkard** slamming into a wall — re-surface L5's tools | "walls = absorbing ⇒ ask *which*/*when*," felt again | "a symmetric walk has a long-run share of the middle" | no (replay) | both | REUSE `walkBoard` |
| 6 | `explore-mixed` | **Hero:** cycle Ehrenfest / weather / drunkard, classify each, watch the right tool resolve to its exact rational | the rubric across all three families; mixed discrimination, felt | "the surface story (urn/weather/walk) tells you the tool" | no (hero) | both | REUSE `chainBoard:diagram` |
| 7 | `discriminate` | **(model)** Match each structural **cue** to its **tool** — name the discriminating question for each | the rubric as a graded reflex (cue → tool) | "absorption probability and hitting time are one computation" | yes | both | REUSE `retrievalGrid` |
| 8 | `interleave-A-vs-B` | **(interleave)** Unlabeled Part A vs Part B — decide the tool **first**, then compute | absorbing (drunkard ⇒ i/N = **1/4**) vs ergodic (weather ⇒ π = **3/7**), side by side | "pick the tool by the cover story" | yes | both | REUSE `masteryChallenge` |
| 9 | `mastery-challenge` | **(required, before recap)** Fresh unlabeled walk — classify **and** solve, rejecting the stationary trap | absorbing classify + absorption vector **(1/4,1/2,3/4)** | "it runs a long time, so ask its long-run share" | yes (harder) | both | REUSE `masteryChallenge` |
| 10 | `recap` | Retrieval-first recap: one fork, three tools, exact rationals | consolidate the discriminating rubric | — | no | both | REUSE `recap` |

> **Hero block** (`explore-mixed`, b6): `slowFirst: true` + `structuralReadout: "no exit ⇒ πP=π · has an
> exit ⇒ (I−Q)⁻¹R / (I−Q)t=1"` + `reducedMotionFinalFrame: true`. Per `validate-fixtures.ts` `HERO_TYPES`,
> **once `chainBoard` is added to `HERO_TYPES`** (DoR, already flagged by L4/L5) the *other* hero-type
> beats must each carry a hero block with `slowFirst: false` — `classify-one` (b4, `chainBoard`, an early
> win) and `walk-recall` (b5, `walkBoard`, a replay) — reserving the true watch-it-resolve hero for
> `explore-mixed`. Graded beats `required: true`, `track: both`; the JIT primer (`name-the-rubric`) is
> `track: A`, `required: false`. This lesson is **all REUSE** — no new interaction type. Put one
> `interviewNote` on `discriminate` ("the first move on *any* chain problem is to classify it — absorbing
> or ergodic — because that single fork decides whether you set up `(I−Q)⁻¹` or `πP=π`").

## Misconceptions (Specialist)

- **"A chain that runs forever must eventually get stuck somewhere → absorption."** → fires at
  `which-tool-bet` / `classify-one`. Refutation (`byOption`): *"Bouncing forever is the **opposite** of
  stuck. The Ehrenfest balls (and the weather) have **no** absorbing state — every state leads back out,
  so there's nothing to be absorbed *into*. 'When/where absorbed' is the wrong question; ask the long-run
  **share**, `πP=π`."*
- **"It has walls/exits, so ask its long-run share."** → fires at `walk-recall` / `interleave-A-vs-B` /
  `mastery-challenge`. Refutation: *"Walls are **absorbing** — once the drunkard hits \$0 or \$4 he
  **never leaves**, so there's no long-run share of the interior; the chain *ends*. Ask **which** wall
  (i/N = **(1/4,1/2,3/4)**) and **when** (i(N−i) = **(3,4,3)**)."*
- **"Stationary share means the chain converges (`Pⁿ→π`)."** → fires at `which-tool-bet` (Ehrenfest) /
  `recap`. Refutation: *"The long-run **fraction of time** exists for any chain that keeps mixing
  (irreducible) — Ehrenfest's is **(1/4,1/2,1/4)**. But Ehrenfest is **periodic** (period 2), so `Pⁿ`
  never settles — it flips parity forever. '*What fraction of the time*' (`πP=π`) is answerable; '*the
  distribution at step n*' (convergence, L7) needs aperiodicity."*
- **"Absorption probability and hitting time are the same computation."** → fires at `discriminate` /
  `interleave-A-vs-B`. Refutation: *"Same chain, **different question**. Absorption probability
  `(I−Q)⁻¹R` splits the end-states (**no +1**) ⇒ i/N. Hitting time `(I−Q)t=1` counts steps (**+1 each**)
  ⇒ i(N−i). The '+1' is the *only* difference — pick by what's asked: *which* end, or *how long*."*
- **"Pick the tool from the cover story (weather / urn / walk)."** → fires at `explore-mixed` /
  `interleave-A-vs-B` / `mastery-challenge`. Refutation: *"The story is a costume. Weather and the
  Ehrenfest urn look nothing alike but both **mix forever** ⇒ stationary share. The drunkard and a
  gambler both have **walls** ⇒ absorption. Classify by **structure** — *is there a state you can't
  leave?* — not by the words."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-pick-the-tool` — the **L10 row** of `continuity-report.md` ("a mixed
  recall of the whole toolkit → L10 opener `recall-pick-the-tool`"), modeled on `lesson-states-streaks`
  `retrieval-grid` + `mixed-primer`. A `retrievalGrid` matching prior **headlines** to their **tool**:
  *4/7 (gambler reaches \$3 first) → absorption probability* · *(3,4,3) (drunkard's steps to a wall) →
  hitting time* · *(3/7,4/7) (long-run clear/rainy share) → stationary share*. Pure recall of L5/L6 — no
  new teaching.
- **guaranteed early win:** `classify-one` (b4) — tap **"ergodic → stationary share"** on the weather
  chain (no absorbing state ⇒ mixes forever), the just-named rubric's easiest branch; the opener (b1) is
  the graded-easy warm-up that precedes it.
- **mastery challenge (required, before recap):** `mastery-challenge` (b9) — a **fresh unlabeled
  absorbing walk** (re-skinned drunkard: a frog on lily pads 0–4, pads 0 & 4 are "sink" pads). The
  learner must **classify** it (absorbing — *reject* the "long-run share" trap) **and solve** the
  absorption vector: P(reach far pad \| start 1) = **1/4**, P(… \| start 3) = **3/4** (the full
  **(1/4,1/2,3/4)**). Harder than the interleave's single value, and only the learner who reads the
  *structure* over the *story* gets it.
- **spacing/interleaving:** the **course-level pick-the-tool capstone**, copying the
  `lesson-states-streaks` **design** (mixed-primer + mastery Part A/B "pick-the-tool, unlabeled"), not its
  content (`continuity-report.md`, L10 row). **ALL prior tools re-surface:** hitting time / absorption
  **(L5)** (`walk-recall`, `discriminate`, interleave Part A, mastery), stationary **(L6)** (`classify-one`,
  interleave Part B), **ergodic vs absorbing (L4/L7)** (the whole rubric), **reversibility / Ehrenfest
  (L8)** (`which-tool-bet`, `explore-mixed`), **PageRank-as-stationary (L9, optional enrichment)**. The
  governing **"is this chain absorbing or ergodic?"** question folds in the **L1 memorylessness → L7
  forgetting** contrast (absorbing *never forgets* — it's stuck; ergodic *forgets the start* — it mixes).
  Exact-rational fluency (`(1/4,1/2,3/4)`, `(3/7,4/7)`, `(1/5,2/5,2/5)`) continues the corpus's
  "answers stay exact fractions" thread through the same `Rational` toolkit.
