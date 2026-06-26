# Lesson Brief: PageRank  (lesson-markov-chains-9)

## Hook  (the bet)

"Four web pages link to each other. Page **1** is pointed at by *three* of the others; page **2** by only two. 'Most links in wins,' you say — so page 1 is the web's most important page. But the page that *sends* a link matters as much as how many you collect: a nod from a focused, important page is worth more than a crowd of weak ones. **Which page does PageRank actually crown #1 — and why isn't it page 1?**"

## Core promise (one idea)

PageRank turns a web of links into a Markov chain — a **random surfer** who clicks a random out-link with probability `d` and **teleports** to a uniformly random page with probability `1−d` — and a page's importance is nothing new: it's the **stationary distribution** `π` of that chain (`πG = π`, `Σπ = 1`), the long-run share of time the surfer spends there. Ranking the web = solving the same fixed point you met in L6.

## Display fields

- **glyphKey:** `PR`
- **vizKey:** fourNode

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| 3-page cycle A→B→C→A, random surfer with damping `d` (`G = d·M + (1−d)/3·J`). Long-run share of each page, for **any** rational `d` (incl. `d=85/100`, `d=1/2`)? | **`(1/3, 1/3, 1/3)`** (by symmetry, damping-invariant) | theorempath.com — PageRank (https://theorempath.com/topics/pagerank-algorithm); askfilo 3-page-cycle (corroborating) | [ ] engine [x] source |
| 4-page link graph 1→2, 2→{1,4}, 3→{1,4}, 4→{1,2,3}; column-stochastic `A`, `d=1` (no teleport). Solve `x = Ax`, `Σx=1`; rank the pages. | **`(4/13, 5/13, 1/13, 3/13)`**, ranking **2 > 1 > 4 > 3** | EECS 398 / practicaldsc.org — PageRank (https://practicaldsc.org/wn25/guides/linear-algebra/pagerank/) | [ ] engine [x] source |
| PageRank recurrence (the algorithm definition / Stage-1 source): `PR = (1−d)/N + d·Σ PR/L` | formula (defines `G`; the exact vector is Stage-2 engine truth) | Wikipedia — PageRank (https://en.wikipedia.org/wiki/PageRank); arXiv math/0612079 (damping rationale) | [ ] engine [x] source |
| **[ENRICHMENT ONLY — NOT GRADED]** constructed 3-node 1→{2,3}, 2→3, 3→1, damped `d=1/2`: `r = d·M·r + (1−d)/3` | **`(14/39, 10/39, 15/39)`** | **CONSTRUCTED** via Wikipedia formula + arXiv math/0612079; **recompute in `markov.ts` before ship** | [ ] engine [ ] source |

> **Exact-rational check (Stage 2 reproduces in `markov.ts pagerank()`).**
> **3-cycle (any `d`):** out-links A→B, B→C, C→A give column-stochastic `M = [[0,0,1],[1,0,0],[0,1,0]]`. For `u=(1/3,1/3,1/3)`: `M·u = u` (a permutation preserves uniform) and `J·u = (1,1,1)`, so `G·u = d·u + (1−d)/3·(1,1,1) = u` for **every** `d` → `π = (1/3,1/3,1/3)`. *(This is the clean teaching case: damping cannot tilt a symmetric ranking.)*
> **4-node (`d=1`):** column-stochastic `A = [[0,1/2,1/2,1/3],[1,0,0,1/3],[0,0,0,1/3],[0,1/2,1/2,0]]`. Solving `x=Ax`: `x₃=⅓x₄`, `x₄=⅗x₂`, `x₃=⅕x₂`, `x₁=⅘x₂`; normalize `(⅘+1+⅕+⅗)x₂ = (13/5)x₂ = 1` → `x₂=5/13` → **`(4/13, 5/13, 1/13, 3/13)`**. **Payoff:** page 1 has **3** in-links (from 2,3,4) but page 2 (only 2 in-links) ranks **first** — because page 1's single out-link funnels *all* its rank to page 2.
> **Enrichment `d=1/2`:** `(14/39,10/39,15/39)` is a construction, not a stated source — flagged `[ ] engine`; if `markov.ts` disagrees, drop the aside.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-no-champion` | Reactivate "you can rank without a single champion" + "the shares renormalize" (the early win) | retrieval bridge from Penney's `non-transitive-loop` + `bayes.ts bayesPosterior` renormalization | "ranking needs one undisputed winner" | yes (easy) | both | REUSE `dominanceWheel` + `retrievalGrid` |
| 2 | `open-bet` | Commit which of the 4 pages is most important | surfaces the in-link-count trap | "the page with the most in-links wins" | no (`byOption`) | both | REUSE `prediction` |
| 3 | `name-the-surfer` | Name the random surfer, damping `d`, Google matrix `G = d·M + (1−d)/n·J` | vocabulary: surfer / teleport / damping; "rank = stationary `π` (L6)" | — (JIT primer) | no | A | REUSE `primer` |
| 4 | `weight-by-source` | Tap which endorsement carries more rank (the focused link from an important page) | PageRank weights a link by the **rank of its source** — refutes the bet | "every in-link counts the same" | yes (easy) | both | NEW `chainBoard:diagram` |
| 5 | `explore-damping` | Drag the damping dial on the symmetric 3-cycle; watch `π` stay `(1/3,1/3,1/3)` | what damping *does*, felt; the surfer + teleport | "damping changes the ranking" | no (hero) | both | NEW `chainBoard:stationary` + `damping` (**hero**) |
| 6 | `confirm-symmetry` | Enter `π` for the 3-cycle at `d=85/100` and `d=1/2` → `(1/3,1/3,1/3)` both | symmetry ⇒ damping-invariant stationary (exact rational, sourced) | "a different `d` must give a different `π`" | yes | both | REUSE `answerEntry` |
| 7 | `triplet-pagerank` | Three lenses — solve `πG=π` / iterate `Gⁿ→π` / simulate the surfer — all agree | PageRank **is** the stationary of `G` (robust); power-iteration = L7 convergence | "PageRank is a bespoke algorithm, not a stationary dist" | no | both | REUSE `tripletReveal` |
| 8 | `damping-saves-sink` | On a dangling-node / 2-cycle **rank sink**, toggle damping: does a unique `π` exist? | damping `(1−d)/n·J` restores irreducibility ⇒ unique `π` (ties to L7) | "PageRank works fine without damping" | yes (`byOption`) | both | NEW `chainBoard:stationary` + `damping` |
| 9 | `mastery-fourNode` | **(required, before recap)** compute the 4-node PageRank and rank the pages | `(4/13,5/13,1/13,3/13)`, rank **2 > 1 > 4 > 3** — most-in-links ≠ #1 | "page 1 (most in-links) is #1" | yes (harder) | both | REUSE `masteryChallenge` over NEW `chainBoard:stationary` |
| 10 | `recap` | Retrieval-first recap: rank = stationary share of the damped surfer | consolidate `πG=π`, the role of damping | — | no | both | REUSE `recap` |

Notes: graded beats `required: true`, `track: both`; the JIT primer (`name-the-surfer`) is `required: false`, `track: A`. **`explore-damping` carries the `hero`** (slowFirst + structuralReadout + reducedMotionFinalFrame, per the HERO_TYPES rule) as `chainBoard:stationary` with `damping: Rational`, and hosts the **enrichment aside** — drag `d→1/2` on the *constructed* 3-node (1→{2,3}, 2→3, 3→1) and the engine shows `(14/39,10/39,15/39)` to prove damping *can* shift an **asymmetric** ranking; this aside is **NOT graded** and is gated on engine verification ("CONSTRUCTED, not source-stated"). Per **Manager decision #3**, `chainBoard:stationary[+damping]` is the **lean-FOLD** of the PageRank surface (honor the one-presentation-type convention) — ratify at Wave 0. Put one `interviewNote` on `mastery-fourNode`: *"PageRank — a web of links as a Markov chain whose stationary distribution is the ranking — is the canonical 'Markov in the wild' interview story."*

## Misconceptions (Specialist)

- **"The page with the most in-links wins."** Fires at `open-bet` / `weight-by-source` / `mastery-fourNode`. Refutation (`byOption`): *"Count the links and page 1 leads with three. But PageRank weights each link by the importance of its sender. Page 1's only out-link pours **all** of page 1's rank into page 2, so page 2 wins `5/13 > 4/13` — more in-links, fewer 'rank dollars.'"*
- **"Damping is an arbitrary fudge that changes the ranking."** Fires at `explore-damping` / `confirm-symmetry`. Refutation: *"Slide `d` anywhere on the symmetric 3-cycle and `π` never moves off `(1/3,1/3,1/3)`. Damping doesn't tilt a fair ranking — it exists to **guarantee a unique answer exists**, not to bias one."*
- **"PageRank works without damping."** Fires at `damping-saves-sink`. Refutation: *"A page with no out-links (a dangling node) or a 2-cycle trap is a **rank sink** — the surfer gets stuck, the chain is reducible, and `π` isn't unique. The `(1−d)/n` teleport makes every page reachable (irreducible + aperiodic = regular), so a single `π` exists — exactly the convergence condition from L7."*
- **"PageRank is a brand-new algorithm I have to learn."** Fires at `name-the-surfer` / `triplet-pagerank`. Refutation: *"It's the **stationary distribution `πG=π` from L6** of a chain you build from the link graph. Solve it, power-iterate it (L7), or simulate the surfer — all three give the same ranking."*
- **"The scores are independent numbers, not a distribution."** Fires at `recall-no-champion` / `recap`. Refutation: *"They're long-run visit shares — a probability distribution that **renormalizes to 1**, the same renormalization move as the Bayes posterior. No page's score stands alone."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-no-champion` — recalls Penney's **`dominanceWheel`** *"non-transitive — ranking without a single champion"* (cite prior beatId **`non-transitive-loop`** in `lesson-penneys-game`) **and** `bayes.ts bayesPosterior` **renormalization**; reframed as *"rank by long-run visit share, and let the shares renormalize."* Also re-surfaces the **½/½ split (L2)** → the surfer's **uniform out-links** (closes the L2→L9 thread). PageRank **= the stationary distribution of L6** (reuse, not re-teach).
- **guaranteed early win:** `recall-no-champion` (graded recall, the familiar `dominanceWheel`/renormalization match — not a PageRank computation); `weight-by-source` is the second, still-easy graded win that resolves the bet.
- **mastery challenge (required, before recap):** `mastery-fourNode` — the 4-node link graph at `d=1` → **`(4/13, 5/13, 1/13, 3/13)`**, rank **2 > 1 > 4 > 3** (sourced: practicaldsc.org). It pays off the hook: the page with the **most** in-links is **not** #1.
- **spacing/interleaving:** PageRank **= stationary (L6)** of a specially-built chain → re-fires `πP=π`; **damping restores the convergence/uniqueness conditions of L7** (regular chain ⇒ unique `π`), interleaving *"rank sink (stuck) vs ergodic (unique long-run share)"*; the **½/½ transition split (L2)** resurfaces as the surfer's uniform out-links; Penney's **`dominanceWheel` "no champion"** recurs as *"ranking without a champion."* Exact-fraction fluency continues (`1/3`, `4/13`, `5/13`, `1/13`, `3/13`). **Net-new** = damping and *"ranking = stationary distribution."*
