# Lesson Brief: The Transition Matrix  (lesson-markov-chains-2)

## Hook  (the bet)

"You already drew the weather as a diagram — arrows out of **Clear** and **Rainy**, each labeled with a probability. Now I hand you the *same* chain as a **grid of numbers**, but one cell is rubbed out: the **Clear** row reads `[3/5, ?]`. Do you need to know anything about the weather to fill that blank — or is the answer already forced?"

## Core promise (one idea)

A transition matrix is just the diagram rewritten: each state's outgoing arrows become **one row** of `P`, and because from where you are now you always go *somewhere* next, **every row sums to 1** — so the diagram and the matrix are one object, and a missing entry is never free, it's `1 − (the rest)`.

## Display fields

- **glyphKey:** `Σrow=1`
- **vizKey:** stateMachine

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| A Markov chain on M states is fully described by an M×M transition matrix `P` (+ initial probs); each **row** is a state's outgoing probabilities and **sums to 1**; the transition graph (Fig 5.1) is its picture. | valid `P`, every row = 1 | GB p.53–54 §5.1 (`references/green-book.txt`) | [ ] engine [x] source |
| Out-edges of a state sum to 1: fair coin H ½ / T `?`; biased gambler up 2/5 / down `?` (recall). | `1/2`; `3/5` | PHT `lesson-pattern-hitting-times:equation-tiles` (½/½) + `:primer-graph`; `lesson-gamblers-ruin:house-edge` (`p=2/5`) | [ ] engine [x] source |
| Clear/Rainy chain, **Clear** row `[3/5, ?]` — fill the missing entry. | `2/5` | Math.SE 3336273 — https://math.stackexchange.com/questions/3336273 (`P=[[3/5,2/5],[3/10,7/10]]`) | [ ] engine [x] source |
| Same chain, **Rainy** row `[3/10, ?]` — predict the missing entry. | `7/10` | Math.SE 3336273 (same chain) | [ ] engine [x] source |
| Which is **not** a valid `P`? `[[3/5,2/5],[3/10,6/10]]` — flag the bad row and fix it. | Rainy row sums to `9/10` (invalid); fix `6/10 → 7/10` | constructed distractor from the Math.SE 3336273 valid chain (engine = `buildChain` must **reject** it) | [ ] engine [x] source |
| Story → valid 2-state `P` (Sunny/Rainy): "sunny→sunny `7/10`, rainy→sunny `4/10`." | `[[7/10,3/10],[4/10,6/10]]` (rows = 1) | GeeksforGeeks — https://www.geeksforgeeks.org/engineering-mathematics/how-to-find-stationary-distribution-of-markov-chain/ | [ ] engine [x] source |
| **Mastery (3-state):** multi-sentence Land-of-Oz story → `P` (Rain/Nice/Snow); verify every row = 1. | `[[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]` — seeds L3 (`(P²)_Rain,Snow = 3/8`) | Grinstead & Snell Ch.11, Table 11.1 — https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf | [ ] engine [x] source |

> Exact-rational check (Stage 2 reproduces in `markov.ts`, all row-stochastic): `1 − 3/5 = 2/5`; `1 − 3/10 = 7/10`; `1 − 4/10 = 6/10`; invalid row `3/10 + 6/10 = 9/10 ≠ 1` (rejected by `buildChain`). Land of Oz rows: `1/2+1/4+1/4 = 1`, `1/2+0+1/2 = 1`, `1/4+1/4+1/2 = 1`; and `(P²)_Rain,Snow = (1/2)(1/4)+(1/4)(1/2)+(1/4)(1/2) = 3/8` (the L3 seed).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-rows-sum-to-1` | Reactivate "the arrows leaving a state always sum to 1" (graded retrieval opener) | retrieval bridge from PHT ½/½ split + gambler's-ruin biased `p` | "out-edges can be any numbers / needn't total 1" | yes (easy) | both | REUSE `retrievalGrid` |
| 2 | `predict-the-missing-edge` | Commit a guess for a row's missing entry — does it sum to 1? | sets up rows-as-distributions (BET) | "the missing edge needs the story" / "it equals the other entry" | no (`byOption`) | both | REUSE `prediction` |
| 3 | `name-the-matrix` | Name *transition matrix*: each state's out-probabilities become a row (JIT) | vocabulary before symbols (`P`, row = a state's exits) | — (JIT primer) | no | A | REUSE `primer` |
| 4 | `fill-the-row` | Fill a missing entry so the row sums to 1 (guaranteed early win) | a row is a probability distribution; `? = 1 − rest` → `2/5` | "you can't find it without more info" | yes (easy) | both | REUSE `answerEntry` |
| 5 | `build-the-board` | Build/edit the graph and watch its rows populate the matrix (**hero**) | diagram ↔ matrix are one object; rows-sum-to-1 enforced (felt) | "the diagram and the matrix are separate things" | no (hero) | both | **NEW `chainBoard:diagram↔matrix`** |
| 6 | `read-as-one` | Name the M×M matrix `P`; read diagram = matrix = stochastic rows (MODEL) | `P`, rows sum to 1, Fig 5.1 — the formalization | "columns sum to 1, not rows" | no | both | REUSE `tripletReveal` |
| 7 | `spot-the-invalid` | Flag the matrix whose row ≠ 1, then fix the bad entry (interleave) | the stochastic constraint as a validity test → fix `7/10` | "any grid of probabilities is a transition matrix" | yes | both | REUSE `retrievalGrid` |
| 8 | `build-from-story` | Construct a valid **2-state** `P` from a short story (PROVE) | translate a story → rows; self-loops are diagonal entries → `[[7/10,3/10],[4/10,6/10]]` | "staying put isn't a transition / isn't in `P`" | yes | both | **NEW `chainBoard:matrix`** |
| 9 | `mastery-challenge` | **(required, before recap)** Build a **3-state** `P` from a multi-sentence story; verify every row = 1 | transfer to 3 states, all exact rationals → Land of Oz (seeds L3) | "a third state breaks the row rule / rows needn't all sum to 1" | yes (harder) | both | REUSE `masteryChallenge` (folds `chainBoard:matrix` build) |
| 10 | `recap` | Retrieval-first recap: stack each state's exits into rows; every row sums to 1 | consolidate (diagram = matrix; `Σrow = 1`) | — | no | both | REUSE `recap` |

Notes: graded beats are `required: true, track: both`; the JIT primer `name-the-matrix` is `required: false, track: A`. `build-the-board` carries the `hero` block (**slowFirst + structuralReadout + reducedMotionFinalFrame**) per HERO_TYPES. The `chainBoard` **reuses PHT's `stateMachine` viz + `stateTap`** (reuse-as-pattern) and enforces rows-sum-to-1 with the diagram and matrix dyna-linked. Per **Manager decision #3 (lean FOLD)**, the 2-state build (8) and the 3-state mastery build (9) both fold into the one `chainBoard` (`display:'matrix'`) rather than spawning a sibling builder type; `read-as-one` is a `tripletReveal` over the *one object, three views* triangulation (diagram · matrix · "each row = 1"), not the L-later recurrence/sim triplet.

## Misconceptions (Specialist)

- **"The arrows out of a state can be any numbers — they don't have to total 1."** → fires at `recall-rows-sum-to-1` / `fill-the-row` / `spot-the-invalid`. Refutation (`byOption`): *"From where you are now you go somewhere next with certainty, so a state's outgoing probabilities are a full menu that must add to 1. A row summing to 9/10 means the chain vanishes a tenth of the time; 11/10 means it's in two places at once."*
- **"The missing entry needs the story / could be anything."** → fires at `predict-the-missing-edge` / `fill-the-row`. Refutation: *"You never need the story for the LAST entry — the row must total 1, so it's forced: `? = 1 − (the rest) = 1 − 3/5 = 2/5`."*
- **"The two out-edges must be equal (symmetry)."** → fires at `predict-the-missing-edge`. Refutation: *"Out-edges only have to *sum* to 1, not match. From Clear it's `3/5` to stay and `2/5` to flip — different numbers, same row."*
- **"The diagram and the matrix are two separate things to memorize."** → fires at `build-the-board` / `read-as-one`. Refutation: *"They're one object in two outfits. Every arrow `i→j` labeled `p` IS the cell `P[i][j]`; all the arrows out of a node ARE that node's row. Drag an edge and the matrix moves with it."*
- **"Columns sum to 1, not rows."** → fires at `read-as-one` / `spot-the-invalid`. Refutation: *"A row is ONE starting state's options, so it sums to 1. A column gathers arrows from different starting states into one destination — there's no reason that totals anything. (Row-stochastic is the Green Book convention, p.53.)"*
- **"Staying in the same state isn't a transition, so it's not in `P`."** → fires at `build-from-story`. Refutation: *"'Sunny stays sunny 7/10' is a real step Sunny→Sunny — it's the diagonal entry `P[Sunny][Sunny]=7/10`, and it counts toward that row's sum like any other arrow."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-rows-sum-to-1` — recalls the per-state **½/½ split** (`lesson-pattern-hitting-times:equation-tiles` / `:primer-graph`) and the **biased `p`** the learner already built (`:bias-sandbox`; `lesson-gamblers-ruin:house-edge`, `p=2/5`), reframed as: *those splits are the **rows** of a matrix, and each one sums to 1.*
- **guaranteed early win:** `fill-the-row` (graded, easy) — fill the Clear row `[3/5, ?] → 2/5`; the first graded touch of the new content, forced purely by rows-sum-to-1 (no story needed).
- **mastery challenge (required, before recap):** `mastery-challenge` — build the **3-state Land-of-Oz** `P = [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]` (Rain/Nice/Snow) from a multi-sentence story and verify every row = 1; harder (3 states, a `0` entry, dyadic fractions) and it **plants L3**, whose opener uses this exact chain's `(P²)_Rain,Snow = 3/8`.
- **spacing/interleaving:** the **½/½ transition split** (PHT) → **matrix rows (L2)** → the **random surfer's uniform out-links (L9)** — closing the "where do the probabilities come from" loop (continuity-report). The `stateMachine`/`stateTap` design is **reused-as-pattern** from PHT. `spot-the-invalid` interleaves **valid vs invalid stochastic matrix** (rows-sum-to-1 as a test). Exact-fraction fluency (`2/5`, `7/10`, the Land-of-Oz dyadics) continues the corpus's "answers stay exact rationals" habit.
