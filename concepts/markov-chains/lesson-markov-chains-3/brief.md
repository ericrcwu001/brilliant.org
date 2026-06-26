# Lesson Brief: Multi-Step Transitions  (lesson-markov-chains-3)

## Hook  (the bet)

In **Grinstead & Snell's "Land of Oz,"** the weather hops between **Rain, Nice, Snow** by a fixed daily rule — and it's so dreary that it's *never Nice two days running* (P(Nice→Nice) = 0). It **rained today**. Two days from now, what's the chance it's **snowing**? Trace one story — rain, then nice, then snow — and you get **1/8**. But snow-in-two-days can also arrive *rain→rain→snow* or *rain→snow→snow*. So is the answer 1/8… or did you forget to add up the other ways in?

## Core promise (one idea)

The chance of getting from state *i* to state *j* in *n* steps is a **single entry of the matrix power, (Pⁿ)ᵢⱼ** — and that one entry already **sums every length-*n* path** from *i* to *j*, because matrix multiplication *is* the law of total probability applied one step at a time (Chapman–Kolmogorov).

## Display fields

- **glyphKey:** `Pⁿ`
- **vizKey:** fourNode  *(lesson/catalog emblem; the worked chains are 2-state weather + 3-state Land of Oz — all within the 2–4-state rule)*

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| One 2-step path `Rain→Nice→Snow` in Land of Oz `P=[[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]`: `p_RN·p_NS` (the trap = "one path") | **1/8** | GB **p.53 §5.1** — path-probability rule `P(X₀=i,X₁=j,…)=pᵢⱼ·pⱼₖ·⋯`, applied to the G&S Land of Oz chain | `[ ] engine  [x] source` |
| 2 days after rain, P(snow) = sum of all three `Rain→Snow` 2-step paths: `(P²)_Rain,Snow` | **3/8** | Grinstead & Snell Ch.11 **Table 11.1** (entry .375) https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf · UC Davis dis6 https://www.cs.ucdavis.edu/~amenta/w04/dis6.pdf | `[ ] engine  [x] source` |
| A different P² entry: `(P²)_Rain,Rain` (full P² row Rain = `(7/16, 3/16, 3/8)`, sums to 1) | **7/16** | Grinstead & Snell Ch.11 **Table 11.1** https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf | `[ ] engine  [x] source` |
| 2-state weather warm-up `P=[[3/5,2/5],[3/10,7/10]]` (Clear/Rainy): `(P²)_clear,clear = 3/5·3/5 + 2/5·3/10` | **12/25** | chain: Math.SE 3336273 https://math.stackexchange.com/questions/3336273 · **P² value engine-computed** | `[ ] engine  [ ] source` |
| **Mastery (3-step):** 3 days after rain, P(snow) = `(P³)_Rain,Snow` (sum of 9 length-3 paths, or `P²·P`) | **25/64** | **Construction** on the sourced G&S Land of Oz chain (Ch.11) — *not* source-stated; engine-verify | `[ ] engine  [ ] source` |

> **Exact-rational check** (Stage 2 reproduces in `markov.ts`; every Pⁿ keeps rows summing to 1):
> - The three 2-step `Rain→Snow` paths: `R→R→S = ½·¼ = 1/8`, `R→N→S = ¼·½ = 1/8`, `R→S→S = ¼·½ = 1/8` → **(P²)_R,S = 1/8+1/8+1/8 = 3/8** (the "one path" trap stops at a single 1/8).
> - **(P²)_R,R** = `½·½ + ¼·½ + ¼·¼` = `1/4 + 1/8 + 1/16` = **7/16** (row R of P² = 7/16, 3/16, 6/16 ✓).
> - **(P²)_clear,clear** = `9/25 + (2/5·3/10)` = `9/25 + 3/25` = **12/25**.
> - **(P³)_R,S** = `(P²·P)_R,S` = `7/16·¼ + 3/16·½ + 6/16·½` = `7/64 + 6/64 + 12/64` = **25/64** (= the sum of all 9 length-3 R→S paths; **constructed — engine-verify**).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse / NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|-------------------------------|
| 1 | `recall-total-prob` | Re-fire "condition on the first step → `P(E)=Σ P(E\|case)·P(case)`" (early recall win) | retrieval bridge: first-step split = law of total probability | "a multi-step chance is one product, no summing" | yes (easy) | both | REUSE `retrievalGrid` |
| 2 | `predict-two-day-snow` | Commit a gut answer for P(Snow in 2 days \| Rain today) | sets up one-path-vs-all-paths | "2-step = one path (1/8)" / "= the one-step entry (1/4)" / "= (1/4)² (1/16)" | no (`byOption`) | both | REUSE `prediction` |
| 3 | `name-chapman-kolmogorov` | Name the n-step entry `(Pⁿ)ᵢⱼ` and Chapman–Kolmogorov, just-in-time | vocabulary: n-step probability, `Pⁿ`, CK relation | — (JIT primer) | no | A | REUSE `primer` |
| 4 | `warmup-two-step` | First multi-step win on the tiny 2-state chain: `(P²)_clear,clear = 12/25` | sum the 2 paths `c→c→c` + `c→r→c` | "(P²)cc = (3/5)² = 9/25 (drop the via-rainy path)" | yes (easy) | both | REUSE `answerEntry` |
| 5 | `explore-powers` | Iterate Pⁿ on Land of Oz; watch each entry fill as a sum of path-products | **Pⁿ = bookkeeping for all length-n paths** (hero) | "Pⁿ = square each entry" / "compose by adding P+P" | no (hero) | both | **NEW `chainBoard:powers`** |
| 6 | `prove-two-day-snow` | Decompose `(P²)_Rain,Snow` into its 3 paths and sum → **3/8** (the PROVE) | n-step prob = Σ over intermediate state | "stop at one path → 1/8" | yes | both | REUSE `answerEntry` |
| 7 | `read-another-entry` | Trust the surface: read `(P²)_Rain,Rain = 7/16` off P² | every entry is its own path-sum; row sums to 1 | "diagonal 2-step = stay-put path only = 1/4" | yes | both | **NEW `chainBoard:powers`** |
| 8 | `model-ck-three-ways` | CK three lenses: sum-over-paths = row·column matrix product = LTP one step at a time | the MODEL + Bayes interleave (cite `bayes.ts sequentialPosterior`) | "matrix power is a new trick unrelated to total probability" | no | both | REUSE `tripletReveal` |
| 9 | `mastery-three-day-snow` | **(required, penultimate)** P(Snow in 3 days \| Rain) = `(P³)_Rain,Snow = 25/64` | transfer to 3 steps (9 paths, or reuse `P²·P`) | "3 steps = pick one 3-edge path" | **yes (required)** | both | REUSE `masteryChallenge` |
| 10 | `recap` | Generate-then-reveal: n-step = `(Pⁿ)ᵢⱼ` = sum over all length-n paths | consolidate the one idea | — | no | both | REUSE `recap` |

Notes: graded beats are `required: true`, `track: both`; the JIT primer `name-chapman-kolmogorov` is `required: false`, `track: A`. `explore-powers` (hero) and `read-another-entry` use the **NEW `chainBoard`** type with `display: 'powers'` (engine dep `markov.ts matrixPower`); `explore-powers` carries the `hero` block (**slowFirst + structuralReadout + reducedMotionFinalFrame**) per HERO_TYPES. Reused types: `retrievalGrid` (opener), `prediction`/`byOption` (bet), `primer`, `answerEntry` (warm-up, prove), `tripletReveal` (model), `masteryChallenge`, `recap`. Put one `interviewNote` on `model-ck-three-ways`: *"the n-step transition probability is the (i,j) entry of Pⁿ — interviewers check that you **sum over the intermediate state**, not just multiply one path."* The `chainBoard:powers` surface built here is **spaced-reused at L7** to show `Pⁿ→π`.

## Misconceptions (Specialist)

- **"A multi-step chance is one path's product — forget to sum."** Fires at `predict-two-day-snow` / `prove-two-day-snow`. Refutation (`byOption` on **1/8**): *"Rain→Nice→Snow is one way, worth 1/8 — but you can also go Rain→Rain→Snow (1/8) and Rain→Snow→Snow (1/8). Two-days-to-snow is **all three**: 1/8+1/8+1/8 = 3/8. (Pⁿ)ᵢⱼ is the bookkeeping that never lets you drop a path."*
- **"Two days out = the one-step entry."** Fires at `predict-two-day-snow` (option **1/4**). Refutation: *"1/4 is P(Rain→Snow) in a **single** day. Two days means an intermediate day you must pass through and sum over — that's P², not P."*
- **"Pⁿ means raise each entry to the n-th power."** Fires at `explore-powers` / `read-another-entry` (option **1/16**). Refutation: *"(P²)ᵢⱼ is **row i · column j** — a sum of products, not (pᵢⱼ)². (P²)Rain,Snow = (½·¼)+(¼·½)+(¼·½) = 3/8, not (1/4)² = 1/16."*
- **"Compose steps by adding matrices (P+P) / doubling."** Fires at `explore-powers`. Refutation: *"Chaining conditional steps **multiplies**: P²=P·P. Adding P to itself would make rows sum to 2; every Pⁿ still has rows summing to 1, because total probability is conserved at each step."*
- **"The 2-step diagonal is the stay-put path only."** Fires at `read-another-entry` (option **1/4**). Refutation: *"(P²)Rain,Rain isn't just Rain→Rain→Rain (1/4); add Rain→Nice→Rain (1/8) and Rain→Snow→Rain (1/16): 1/4+1/8+1/16 = 7/16."*
- **(warm-up) "(P²)cc = (3/5)²."** Fires at `warmup-two-step`. Refutation: *"9/25 is only Clear→Clear→Clear. Add Clear→Rainy→Clear (2/5·3/10 = 3/25): 9/25 + 3/25 = 12/25."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-total-prob` — recalls **"condition on the first step"** from Penney's `lesson-penneys-game` / `first-step-split` and **"the law of total probability `P(E)=Σ P(E|Hᵢ)P(Hᵢ)`"** from Bayes `lesson-bayes-rule-4` / `count-the-defects`, and cites `bayes.ts sequentialPosterior` as the same *"apply one step, then total-probability over where you land"* move (Continuity Report, L3 row). **Net-new = matrix powers as the bookkeeping for every path.**
- **guaranteed early win:** `warmup-two-step` (beat 4) — the first **new-skill** success on the smallest possible chain (2 states, 2 paths → `12/25`). (The graded opener `recall-total-prob` is an even earlier easy win, but on *familiar* material.)
- **mastery challenge (required, before recap):** `mastery-three-day-snow` — P(Snow in 3 days | Rain) = `(P³)_Rain,Snow` = **25/64**; a 3-step transfer (9 paths, or one more `P·P`) that rewards *"let Pⁿ do the summing"* and **seeds L7** (the same `chainBoard:powers` surface will show `Pⁿ→π`).
- **spacing/interleaving:** **first-step analysis re-surfaces here** (Chapman–Kolmogorov = multi-step first-step) and recurs at **L5** (absorption) and **L6** (`πP=π` is the same one-step relation at its fixed point) — three spaced hits; the **`chainBoard:powers` surface returns at L7** (convergence, `Pⁿ→π`); the **Bayes link** (LTP / `sequentialPosterior`) is the cross-concept interleave folded into `model-ck-three-ways`; **exact-rational/dyadic fluency** (3/8, 7/16, 25/64; plus 12/25) continues the corpus's "answers stay exact fractions" habit.
