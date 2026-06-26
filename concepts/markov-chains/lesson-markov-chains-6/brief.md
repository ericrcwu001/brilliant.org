# Lesson Brief: The Stationary Distribution  (lesson-markov-chains-6)

## Hook  (the bet)

"Two towns live under the **same** weather rules. Monday in Aria is **clear**; Monday in Brume is **rainy**. Fast-forward a thousand days and tally each town's clear days. Is Aria's long-run share of clear weather **higher** (it started sunnier) — or do the two towns end up with the **exact same** climate?"

## Core promise (one idea)

A regular chain **forgets where it started**: the long-run share of time it spends in each state converges to the *one* distribution `π` solving `πP=π` with `Σπ=1` — and that same share fixes how often each state returns, once every `1/πᵢ` steps (Kac).

## Display fields

- **glyphKey:** `πP=π`
- **vizKey:** fourNode

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Clear/Rainy 2-state `P=[[3/5,2/5],[3/10,7/10]]`; solve `πP=π`, `Σπ=1` → long-run share | π = **(3/7, 4/7)** (clear, rainy) | Math.SE 3336273 — https://math.stackexchange.com/questions/3336273/clear-days-rainy-days-markov-chain-problem | [ ] engine [x] source |
| Weather 2-state `P=[[7/10,3/10],[4/10,6/10]]` → `π` (early-win read-off) | π = **(4/7, 3/7)** | GeeksforGeeks — https://www.geeksforgeeks.org/engineering-mathematics/how-to-find-stationary-distribution-of-markov-chain/ | [ ] engine [x] source |
| Asymmetric 2-state `P=[[1/4,3/4],[1/5,4/5]]` → `π` (enrichment instance of the formula) | π = **(4/19, 15/19)** | Rochester ECE440 HW5 #1 — https://www.hajim.rochester.edu/ece/sites/gmateos/ECE440/Homework/hw_5_markov_chains_solution.pdf | [ ] engine [x] source |
| General 2-state `P=[[1−a,a],[b,1−b]]` → closed-form `π` | π = **(b/(a+b), a/(a+b))** | Math.SE 259852 — https://math.stackexchange.com/questions/259852/how-to-compute-the-stationary-distribution-of-a-2-times-2-transition-probabili | [ ] engine [x] source |
| **Mastery** 3-state cloudy-town `P=[[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]]`; solve `πP=π` by rational elimination | π = **(1/5, 2/5, 2/5)** (sunny, cloudy, rainy) | Rochester ECE440 HW5 #2 — https://www.hajim.rochester.edu/ece/sites/gmateos/ECE440/Homework/hw_5_markov_chains_solution.pdf | [ ] engine [x] source |
| Kac mean return time to state `i` `= 1/πᵢ`: sunny (share `1/5`) and a clear day (share `3/7`) | sunny = **5** days; clear = **7/3** days | Kac's formula; sunny via Rochester HW5 #2 (same URL); clear **derived** from `(3/7,4/7)` [Math.SE 3336273] | [ ] engine [x] source |
| Opener recall — geometric wait: a chance-`p` event recurs every `1/p` (2-state success + self-loop) | e.g. `p=1/5` → **5** | EV-5 `ev5-recall` / `ev5-primer-geom` (`E=1/p`), per `continuity-report.md` | [ ] engine [x] source |
| Interleave — absorbing chain's `πP=π` (stuck point-mass) vs a regular chain's spread | absorbing **(0,1)** vs regular **(3/7,4/7)** | L5 absorbing / GB gambler's-ruin classes (`continuity-report.md`); regular [Math.SE 3336273] | [ ] engine [x] source |

> Exact-rational check (Stage 2 reproduces in `markov.ts stationaryDistribution` / `kacReturnTime`): clear/rainy `(2/5)π_c=(3/10)π_r ⇒ π_c:π_r = 3:4 ⇒ (3/7,4/7)`; cloudy-town column-by-column `π_s=¼(1−π_s) ⇒ π_s=1/5`, then `(3/2)π_c=3/5 ⇒ π_c=2/5, π_r=2/5 ⇒ (1/5,2/5,2/5)`; Kac `1/π_sunny=1/(1/5)=5`, `1/π_clear=1/(3/7)=7/3`; general `π=(b/(a+b),a/(a+b))` with `a=3/4,b=1/5 ⇒ (4/19,15/19)`.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-geometric` | Reactivate "a chance-`p` event recurs every `1/p`" → bridge to Kac (graded retrieval opener) | EV-5 geometric wait `E=1/p` (2-state) → reveal Kac `1/πᵢ` | "return time is about one edge's probability, not the long-run share" | yes (easy) | both | `retrievalGrid` (reuse) |
| 2 | `settle-bet` | Commit: does the long-run mix depend on where you start? | sets up convergence to a unique `π` | "different starts ⇒ different long-run mix" / "it gets stuck in one state" | no (`byOption`) | both | `prediction` (reuse) |
| 3 | `name-stationary` | Name the *stationary distribution* `π` and the balance `πP=π`, `Σπ=1`, just-in-time | vocabulary before symbols | — (JIT primer) | no | A | `primer` (reuse) |
| 4 | `read-the-share` | Read the long-run fraction off a distribution that has stopped moving → `4/7` (guaranteed early win) | `π` = long-run share of time per state | "the long-run answer must be one single state" | yes (easy) | both | `chainBoard:distribution` (NEW) |
| 5 | `watch-it-settle` | Watch any start converge to the same `π`, then the solver shows `πP=π` is the fixed point | convergence + the fixed-point equation, felt | "the start determines the limit" | no (hero) | both | `chainBoard:distribution→stationary` (NEW, hero) |
| 6 | `solve-pi` | Solve the 2-state `πP=π` with `Σπ=1` → `(3/7,4/7)` | balance `π₁=π₁p₁₁+π₂p₂₁` + normalize | "`πP=π` ⇒ `π` is uniform `(½,½)`" | yes | both | `answerEntry` (reuse) |
| 7 | `kac-return` | Apply Kac: a clear day (share `3/7`) recurs every `1/πᵢ` → `7/3` days | mean return time `= 1/πᵢ` | "return time `= 1/`(single-step prob)" | yes | both | `answerEntry` (reuse) |
| 8 | `triangulate-pi` | Three lenses agree on `(3/7,4/7)`: solve `πP=π` / watch `Pⁿ` settle / simulated long-run frequency `= 1/`(Kac time) | robustness of `π` (simulation lens via `theorySimChart`) | "the fraction is an artifact of one method" | no | both | `tripletReveal` (reuse) |
| 9 | `absorbing-vs-stationary` | Discriminate: absorbing chain's fixed point is a stuck point-mass `(0,1)` vs a regular chain's spread `(3/7,4/7)` | same `πP=π` lens, opposite meaning (interleave L5) | "stationary = where the chain gets stuck" | yes | both | `retrievalGrid` (reuse) |
| 10 | `mastery-cloudy-town` | **(required, before recap)** Solve the 3-state cloudy-town `πP=π` by rational elimination → `(1/5,2/5,2/5)`; Kac sunny `= 5` | transfer to 3 states + Kac capstone | "more states ⇒ no exact answer, must simulate" | yes (hard) | both | `masteryChallenge` (reuse) |
| 11 | `recap` | Retrieval-first recap: `π` solves `πP=π`, `Σπ=1`; `π` = long-run share; return time `1/πᵢ` | consolidate the rule | — | no | both | `recap` (reuse) |

Notes: graded beats `required: true`, `track: both`; the track-A primer `name-stationary` is `required: false`. `read-the-share` and `watch-it-settle` use the folded `chainBoard` type (Manager decision 3 — lean FOLD): `display:'distribution'` for the settling bars, `display:'stationary'` for the `πP=π` solver. `watch-it-settle` carries the `hero` block (slowFirst + structuralReadout + reducedMotionFinalFrame) per HERO_TYPES. `solve-pi`/`kac-return`/`mastery-cloudy-town` reuse `answerEntry`/`masteryChallenge` (exact-fraction entry); `recall-geometric`/`absorbing-vs-stationary` reuse `retrievalGrid`; `triangulate-pi` reuses `tripletReveal`; `settle-bet` reuses `prediction` (`byOption`). Put one `interviewNote` on `mastery-cloudy-town` ("the 3-state stationary solve is the canonical interview example"). All `π` values are Stage-2 engine truth — `markov.ts stationaryDistribution`/`kacReturnTime` must reproduce them before ship.

## Misconceptions (Specialist)

- **"The long-run mix depends on where you start."** Fires at `settle-bet`/`watch-it-settle`. Refutation (`byOption`): *"For a regular chain, no — every start converges to the **same** `π`. Run it from clear or from rainy and the long-run share of clear days is identical (`3/7` either way). The chain forgets its start — that's the whole point, and the hook of L7."*
- **"The chain settles *on* one state (a 'sink')."** Fires at `settle-bet`/`absorbing-vs-stationary`. Refutation: *"That's an **absorbing** chain (L5), where `πP=π` is the trivial point-mass `(0,1)`. A regular chain never stops moving — it keeps switching forever; what stabilizes is the **fraction of time** in each state (the spread `π`), not a resting place."*
- **"`πP=π` means nothing changes, so `π` must be uniform `(½,½)`."** Fires at `solve-pi`. Refutation: *"`π` is **un**changed by one more step, not **flat**. Balance `π₁=π₁p₁₁+π₂p₂₁` weights each state by how its neighbors feed it: clear/rainy gives `(3/7,4/7)`, not `(½,½)`. Uniform only happens when the structure is symmetric."*
- **"Mean return time `= 1/`(single-step probability)."** Fires at `recall-geometric`/`kac-return`. Refutation: *"Kac uses the long-run **share**, not one edge. A state visited a fraction `πᵢ` of the time recurs every `1/πᵢ` steps — sunny at share `1/5` returns every `5` days; a clear day at share `3/7` every `7/3`. It's the reciprocal of the **stationary** probability, not of a transition entry."*
- **"With 3+ states there's no clean answer — you must simulate."** Fires at `mastery-cloudy-town`. Refutation: *"`πP=π, Σπ=1` is a linear system; rational Gaussian elimination gives **exact** fractions. Cloudy-town solves to `(1/5,2/5,2/5)` on the nose — simulation only **approximates** what the algebra nails."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-geometric` — recalls **EV-5's** geometric wait `E=1/p` (`ev5-recall` / `ev5-primer-geom`, per `continuity-report.md`) and reframes it as Kac's `1/πᵢ`; **EV-1's** `ev1-deepen` / `expectationScale` (LLN balance beam — the long-run weighted average) frames `π` as the long-run share. *Net-new = the `πP=π` fixed point.*
- **guaranteed early win:** `read-the-share` (graded, easy) — read the settled long-run fraction `4/7` straight off a distribution; the first Markov-content win, not a derivation. (The opener `recall-geometric` is also an easy graded recall.)
- **mastery challenge (required, before recap):** `mastery-cloudy-town` — 3-state cloudy-town `πP=π` → **(1/5,2/5,2/5)** by rational elimination, then Kac → sunny recurs every **5** days; a harder transfer that seeds L7/L8/L9.
- **spacing/interleaving:** **first-step analysis recurs** here — `πP=π` is the same one-step relation read at its fixed point (three spaced hits across L3 / L5 / L6, per `continuity-report.md`); **interleave absorbing (L5, stuck at a wall) vs stationary (settles to `π`)** — same fixed-point lens, opposite meaning; `π` (long-run share) is the foundation **L7** (convergence / forgetting the start), **L8** (detailed balance), and **L9** (PageRank) all build on; exact-fraction fluency (`3/7,4/7`; `1/5,2/5,2/5`) continues the corpus thread.
