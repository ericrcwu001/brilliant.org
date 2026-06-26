# Lesson Brief: Convergence: Forgetting the Start  (lesson-markov-chains-7)

## Hook  (the bet)

"Two forecasters run the **same** weather chain. Ana starts it on a **clear** day; Ben starts it on a
**rainy** day. They each let it run for weeks. When you finally ask each of them *"what fraction of days
are clear?"* — do their answers stay **different** (Ana's head start sticks), do they land on the
**same** number (the start washes out), or does it **depend on the chain**?"

## Core promise (one idea)

For a **regular** chain (one where some power `Pⁿ` has all-positive entries — irreducible **and**
aperiodic), **every row of `Pⁿ` marches to the same vector `π`**, so the chain *forgets where it
started*: the long run is decided by `P` alone, never by `X₀`. (The catch L6 didn't tell you: a
**periodic** chain can have a stationary `π` and still **never converge** to it — `Pⁿ` oscillates
forever.)

## Display fields

- **glyphKey:** `Pⁿ→π`
- **vizKey:** twoNode

## Verified problems & answers  (anchor-and-source — REQUIRED · WEB-ONLY, absent from Green Book)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| 2-state weather `P=[[3/5,2/5],[3/10,7/10]]` (Clear,Rainy): finite power `(P²)_clear,clear`? (an exact rational that *approaches* π) | **12/25** | Math.SE 3336273 (chain) https://math.stackexchange.com/questions/3336273 — finite-power computation | [ ] engine [x] source |
| Same chain: the *other* start row, `(P²)_rainy,clear`? (squeezes toward π from below) | **39/100** | Math.SE 3336273 (same chain) — finite-power computation | [ ] engine [x] source |
| Same chain: limit row of `Pⁿ` (BOTH rows, as `n→∞`) = `π`? | **(3/7, 4/7)** | Math.SE 3336273 https://math.stackexchange.com/questions/3336273 | [ ] engine [x] source |
| Land of Oz `P=[[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]` (Rain,Nice,Snow): as `n` grows ALL rows of `Pⁿ` converge to the same `w`, regardless of start = ? | **(2/5, 1/5, 2/5)** | Grinstead & Snell Ch.11, Ex.11.1–11.2, Table 11.1 https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf | [ ] engine [x] source |
| Land of Oz: `P²` row Rain (exact **dyadic** rational at finite `n`)? | **(7/16, 3/16, 3/8)** | Grinstead & Snell Ch.11, Table 11.1 (same URL) | [ ] engine [x] source |
| **Counterexample** — Ehrenfest m=2 `P=[[0,1,0],[1/2,0,1/2],[0,1,0]]` (period 2, from L4): does `Pⁿ` converge? Does a stationary `π` exist? | `π` **= (1/4, 1/2, 1/4)** EXISTS, but `Pⁿ` does **NOT** converge — it oscillates forever (`P^even=[[1/2,0,1/2],[0,1,0],[1/2,0,1/2]]`, `P^odd=P`) | stats.libretexts 16.8 (Ehrenfest, period 2) https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/16%3A_Markov_Processes/16.08%3A_The_Ehrenfest_Chains | [ ] engine [x] source |

> **Exact-rational check (Stage 2 reproduces in `markov.ts` — `matrixPower` / `stationaryDistribution` / `classifyStates.period`):**
> 2-state `P²`: `(clear,clear) = (3/5)(3/5)+(2/5)(3/10) = 9/25+3/25 = `**`12/25`**` = .48`; `(rainy,clear) = (3/10)(3/5)+(7/10)(3/10) = 18/100+21/100 = `**`39/100`**` = .39`. Both squeeze toward `π_clear = b/(a+b) = (3/10)/(2/5+3/10) = (3/10)/(7/10) = `**`3/7`**` ≈ .4286` (one from above, one from below) ⇒ **forgetting**. Engine sanity: `(P⁶)_clear,clear = 107247/250000 ≈ .42899`, `(P¹²)_clear,clear ≈ .428572` → `3/7`. Land of Oz `P²` row Rain `= (7/16,3/16,3/8)`; `P⁸` rows all ≈ `(.40001,.20001,.39999)` → **`(2/5,1/5,2/5)`**. Ehrenfest m=2: `πP = (1/4,1/2,1/4)` ✓ stationary, yet `Pⁿ` alternates `P^odd=P` / `P^even=[[1/2,0,1/2],[0,1,0],[1/2,0,1/2]]` and never settles (the time-/Cesàro-average still equals `π`, but the instantaneous `Pⁿ` does not).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-LLN` | Reactivate "long-run frequency = expectation" (LLN) + "the past doesn't matter" (graded warm-up) | retrieval bridge: EV-1 `ev1-deepen` (LLN) + `expectationScale` + L1 memorylessness → reveal the **ergodic theorem** (time-avg = space-avg = π) | "long-run behavior is luck/streaks, not a fixed average" | yes (easy) | both | REUSE `retrievalGrid` (no chainBoard) |
| 2 | `open-bet` | Commit a gut answer: does the starting state leave a permanent imprint? | sets up convergence vs initial-condition dependence | "where you start changes where you settle" | no (`byOption`) | both | REUSE `prediction` (byOption) |
| 3 | `name-regular-ergodic` | Name *regular / aperiodic / ergodic* just-in-time | regular = some `Pⁿ` all-positive ⇔ irreducible + aperiodic; `Pⁿ→π` | — (JIT primer) | no | A | REUSE `primer` |
| 4 | `early-power` | Compute ONE finite `Pⁿ` entry — the guaranteed easy numeric win | finite powers are **exact rationals**: `(P²)_clear,clear = 12/25` | "a finite `Pⁿ` already equals π" | yes (easy) | both | REUSE `chainBoard:powers` (L3) + `answerEntry` |
| 5 | `explore-collapse` | Iterate `Pⁿ` and watch **every row collapse to one identical row** | `Pⁿ→π` felt; rows merge regardless of start (2-state → Land of Oz) | "different start rows stay different forever" | no (**hero**) | both | REUSE `chainBoard:powers→distribution` (L3) — **HERO** |
| 6 | `model-ergodic` | Name `Pⁿ→π` via three lenses | regular ⇒ `Pⁿ→π`; ergodic theorem (time-avg = space-avg = π) | "convergence means the chain freezes / stops moving" | no | both | REUSE `tripletReveal` |
| 7 | `approach-pi` | Read the limit row = `π` and watch the finite entry march to it | limit `Pⁿ` row = `π = (3/7,4/7)`; `3/5→12/25→…→3/7` | "the entry jumps straight to π" / "it never actually reaches it" | yes | both | REUSE `chainBoard:distribution` + `answerEntry` |
| 8 | `periodic-trap` | Show a chain with `π` but **no convergence** — classify regular vs periodic (the critical contrast) | Ehrenfest m=2: `π=(1/4,1/2,1/4)` exists, `Pⁿ` oscillates; regular ⇔ converges | "having a stationary π guarantees `Pⁿ→π`" | yes | both | REUSE `chainBoard:powers` (L3) + `byOption` |
| 9 | `interleave-forgets` | Sort chains: "forgets the start (ergodic)" vs "never forgets (absorbing — stuck)" | interleave L4/L5 absorbing vs ergodic; folds L1 memorylessness at the distribution level | "every chain forgets its start" / "absorbing chains also settle to an interior π" | yes | both | REUSE `retrievalGrid` (interleave) |
| 10 | `mastery-challenge` | **(required, before recap)** Show **both** rows of the 2-state `Pⁿ` converge to the SAME `(3/7,4/7)` regardless of start | the title payoff — the chain forgets where it started | "the higher-probability start keeps a long-run edge" | yes (hard) | both | REUSE `masteryChallenge` + `chainBoard:distribution` |
| 11 | `recap` | Retrieval-first recap: regular ⇒ `Pⁿ→π` ⇒ forgets the start; periodic ⇒ oscillates | consolidate | — | no | both | REUSE `recap` |

Notes: graded beats `required: true`, `track: both`; the track-A primer (`name-regular-ergodic`) is `required: false`. **No new `chainBoard` display is needed** — L7 reuses `powers` (from **L3**) and `distribution` (from **L6**), honoring the lean-FOLD decision. `explore-collapse` carries the `hero` block (slowFirst + structuralReadout + reducedMotionFinalFrame, per HERO_TYPES) and is the only `hero`; lead its viz with the 2-state chain (`vizKey: twoNode` — two rows visibly merging) then escalate to Land of Oz's three rows collapsing. Put one `interviewNote` on `periodic-trap` ("'a stationary π exists' ≠ '`Pⁿ` converges' — aperiodicity is the missing hypothesis"). `mastery-challenge` may run a two-part variant (Part A: both rows → `(3/7,4/7)`; Part B: Ehrenfest m=2 does **not** converge despite its `π`) modeled on PHT `lesson-states-streaks` Part A/B.

## Misconceptions (Specialist)

- **"Where you start changes where you settle — the head start sticks."** Fires at `open-bet` / `explore-collapse`. Refutation (`byOption`): *"For a regular chain every row of `Pⁿ` marches to the **same** vector. Start clear → the (clear,clear) entry falls 3/5 → 12/25 → … → 3/7; start rainy → the (rainy,clear) entry rises 3/10 → 39/100 → … → 3/7. By a handful of steps both rows read `(3/7,4/7)`. Only `P` decides the long run, never `X₀`."*
- **"A stationary `π` exists, so `Pⁿ` must converge to it."** (the L6→L7 conflation — the heart of the lesson.) Fires at `periodic-trap` / `mastery-challenge`. Refutation: *"`π` only has to satisfy `πP=π`; it can exist without `Pⁿ` settling. Ehrenfest m=2 has `π=(1/4,1/2,1/4)`, yet `Pⁿ` flips forever — odd powers `=P`, even powers `=[[1/2,0,1/2],[0,1,0],[1/2,0,1/2]]`. Existence of `π` ≠ convergence to `π`; you also need **aperiodicity** (regularity)."*
- **"A finite `Pⁿ` already equals `π`."** Fires at `early-power` / `approach-pi`. Refutation: *"Finite powers are exact rationals that **approach** `π` but aren't equal to it: `(P²)_clear,clear = 12/25 = .48`, not `3/7 ≈ .4286`. Convergence is the `n→∞` limit — every finite `n` is exact and a little off."*
- **"Convergence means the chain freezes / stops moving."** Fires at `model-ergodic`. Refutation: *"The **distribution** converges, not the chain. The system keeps hopping between states forever; what stabilizes is the long-run **fraction** of time in each state — and each row of `Pⁿ`. It's memorylessness (L1) showing up at the distribution level: the present mix, not the history, fixes the future mix."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-LLN` — recalls the **Law of Large Numbers / "long-run frequency = expectation"** headline from **EV-1 `ev1-deepen`** (+ the `ev1-explore` `expectationScale` balance beam) and **L1 memorylessness** (Continuity Report, L7 row), then reveals it as the **ergodic theorem**: time-average = space-average = `π`. Net-new = convergence / ergodicity.
- **guaranteed early win:** `early-power` (beat 4) — the first **numeric** success, a single dot-product `(P²)_clear,clear = 12/25` scaffolded on the `chainBoard:powers` surface (the graded easy beat right before the hero). The opener `recall-LLN` is the easy graded *retrieval* warm-up that precedes it.
- **mastery challenge (required, before recap):** `mastery-challenge` — show **both** rows of the 2-state `Pⁿ` converge to the SAME stationary vector regardless of start → **`(3/7, 4/7)`** (finite check `(P²)_clear,clear=12/25` vs `(P²)_rainy,clear=39/100`, both → `3/7`); the "forgetting" payoff. Optional Part B (`states-streaks`-style discriminator): the Ehrenfest m=2 chain does **NOT** converge despite `π=(1/4,1/2,1/4)` — only the learner who grasped *why* `Pⁿ→π` (regularity, not mere existence of `π`) gets it right, and it plants L8's reversibility question.
- **spacing/interleaving:** INTERLEAVE **"absorbing (never forgets — stuck, L4/L5) vs ergodic (forgets the start)"** at `interleave-forgets` — the contrast **is** the lesson; it folds in **L1 memorylessness** and the **L4 absorbing seed**. **Reuses the `chainBoard:powers` surface from L3** (iterate `Pⁿ`, watch rows collapse). **Memorylessness (L1) re-surfaces here at the distribution level** ("the present mix, not the path, fixes the long-run mix"). Exact-fraction fluency continues (`12/25`, `39/100`, `(3/7,4/7)`, `(2/5,1/5,2/5)`, dyadic Land-of-Oz rows), same `Rational` toolkit thread running from PHT/EV/Bayes. Seeds **L9 (PageRank)** — convergence of `Pⁿ→π` is what makes the random surfer's ranking well-defined.
