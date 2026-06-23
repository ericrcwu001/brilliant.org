# Agent 3 — Combinatorics on Words / Pattern Theory — Ideation

> Lens: the *combinatorics-on-words / pattern-theory* researcher. The deepest, most
> direct continuation of the flagship "Pattern Hitting Times" lesson. Goal: turn the
> single insight **"overlap is memory"** into a complete, computable toolkit — read the
> wait off the pattern (autocorrelation / Conway numbers), prove *why* it works
> (martingales), and weaponize overlap into a famous race (Penney's game).

---

## How this continues the current course

The flagship lesson ends on a true but *local* idea: for `HH` vs `HT`, a near-miss that
preserves progress (`HT`'s self-loop on `E1`) shortens the wait, and a near-miss that
resets (`HH`'s reset on `E1`) lengthens it. The engine already exposes the machinery that
makes this generalizable:

- `prefixFunction` / KMP `nextState` — the *borders* (prefix = suffix) of a pattern.
- `overlapHighlights` — exactly the non-advancing near-miss edges, i.e. the self-overlaps.
- exact `Rational` arithmetic + a Gauss–Jordan solver — keeps every result exact.
- `recurrences`, `expectedTimes`, `substitutionSteps` — the first-step-analysis solve.
- `simulate.ts` (`flipsToAbsorption`, `empiricalMean`, `mulberry32`) — theory-vs-sim.

What the current course *never does* is connect that overlap structure to a **closed form**.
That is the entire opportunity of the pattern-theory lens. The seven concepts the brief
asks me to link — states, transitions, overlap/autocorrelation, first-step analysis →
recurrences, the linear solve, simulation vs theory, parameter sensitivity — are all
*recurrence-flavored*. Pattern theory gives the **dual, overlap-flavored** view of the same
numbers, and that duality is the "aha" these next lessons sell.

---

## Research notes (with sources + worked examples)

### 1. The autocorrelation vector / correlation polynomial of a string

For a word `w` of length `ℓ`, the **autocorrelation vector** is `C(w,w) = (c₀,…,c_{ℓ-1})`
where `cᵢ = 1` iff the first `ℓ−i` letters of `w` equal the last `ℓ−i` letters (i.e. the
length-`(ℓ−i)` prefix equals the length-`(ℓ−i)` suffix — a *border*). Always `c₀ = 1`
(the whole word matches itself). The **autocorrelation polynomial** is
`c(z) = Σ cᵢ zⁱ`. [Wikipedia: *Autocorrelation (words)*; Guibas & Odlyzko 1981]

Worked vectors (these are exactly the *borders* the KMP `prefixFunction` already finds):
- `HH`: prefix "H" = suffix "H" → `c = (1,1)`, `c(z) = 1 + z`.
- `HT`: prefix "H" ≠ suffix "T" → `c = (1,0)`, `c(z) = 1`.
- `THH`: no proper border → `c = (1,0,0)`, `c(z) = 1`.
- `HTH`: prefix "H" = suffix "H" → `c = (1,0,1)`, `c(z) = 1 + z²`.
- `HHH`: borders "HH","H" → `c = (1,1,1)`, `c(z) = 1 + z + z²`.
- `HTHT`: border "HT" → `c = (1,0,1,0)`, `c(z) = 1 + z²`.

### 2. Conway's leading number (CLN) — the operational "slide" algorithm

The **Conway leading number** `wLw` is the autocorrelation vector read as a base-`q`
integer (binary for a coin), most-significant bit on the left (the full-overlap bit).
[arXiv:2009.06080 *The Penney's Game with Group Action* §2.1; Gardner 1974; Conway via
*Winning Ways*]

**Operational definition (this is the widget):** slide a second copy of the pattern
underneath the first, one shift at a time. At shift `k` (`k = 0` is full alignment), write
`1` if every overlapping cell matches, else `0`. Read the bit string as binary.

Cross-version for two different words `v, w`: the **correlation** `vLw` has bit `i = 1` iff
the length-`(ℓ−i)` *suffix of v* equals the length-`(ℓ−i)` *prefix of w*. Correlation is
**not** symmetric: `vLw ≠ wLv` in general. [arXiv:2009.06080 §2.1, Example: `C(HTH,HTHT) = (1,0,1)`]

**Worked four-number example — `A = HHH`, `B = THH`** (slide B under A etc.):
- `AA`: HHH/HHH → `111₂ = 7`.
- `AB` (slide `B=THH` under `A=HHH`): `k0` T≠H →0; `k1` "TH"≠"HH" →0; `k2` "T"≠"H" →0 ⇒ `000₂ = 0`.
- `BB`: THH/THH → `k0`✓, `k1` "TH"≠"HH"→0, `k2` "T"≠"H"→0 ⇒ `100₂ = 4`.
- `BA` (slide `A=HHH` under `B=THH`): `k0` H≠T →0; `k1` "HH"="HH" →1; `k2` "H"="H" →1 ⇒ `011₂ = 3`.

(These match Nishiyama's worked values `AA=7, AB=0, BB=4, BA=3`. [Nishiyama, *Pattern
Matching Probabilities and Paradoxes*, IJPAM 2010])

### 3. The fair-coin closed form: E[wait] = Σ 2^(overlap length) = 2·CLN

For an i.i.d. alphabet of size `q`, the expected wait until `w` first appears is
`E[T] = q^ℓ · c(1/q)`. [Guibas–Odlyzko 1981; Odlyzko *String enumeration* §4; Flajolet–
Sedgewick *Analytic Combinatorics* I.4.2]. For a fair coin `q = 2`, this collapses to a
formula you can do in your head:

> **E[A] = Σ over every self-overlap length `L` (prefix_L = suffix_L, including the full
> `L = ℓ`) of `2^L`  =  2 · (Conway leading number).**

Worked, and cross-checked against the repo's golden values (`HH=6, HT=4, THH=8, HTH=10`):

| Pattern | borders (overlap lengths inc. full) | E = Σ 2^L | 2·CLN | matches engine |
|---|---|---|---|---|
| `HT` | {2} | 4 | 2·2 | `E[HT]=4` ✓ |
| `HH` | {2,1} | 4+2 = **6** | 2·3 | `E[HH]=6` ✓ |
| `THH` | {3} | 8 | 2·4 | `E[THH]=8` ✓ |
| `HTH` | {3,1} | 8+2 = **10** | 2·5 | `E[HTH]=10` ✓ |
| `HHH` | {3,2,1} | 8+4+2 = **14** | 2·7 | (`2^{n+1}−2`) ✓ |
| `HTHT` | {4,2} | 16+4 = **20** | 2·10 | [arXiv:2009.06080 Ex.] |

Note the through-line to the flagship: the *only* reason `HH` (6) beats `HT` (4) is the
extra `2¹` term — the length-1 self-overlap that the state machine renders as `HH`'s
near-miss. **Overlap → an extra `2^L` term → a longer wait.** The "1/2 E0 reset term" the
flagship celebrates and this `+2¹` term are the same fact in two languages.

> Sanity note: one expository preprint (PRIMES-STEP 2020) prints `E[HHH]=16` and
> `E[HTH]=14`; those disagree with the rigorous `E = 2·CLN` (which gives 14 and 10) and
> with this repo's own engine. I use the rigorous values throughout.

A clean corollary worth a beat: a **non-self-overlapping** word (only border = full length,
e.g. `HT`, `THH`, `HHTHT`) has the *shortest possible* wait for its length, exactly `2^ℓ`.
Overlap can only *add* terms, never remove them — so among length-`ℓ` patterns the
all-same word (`HHHHH`) is always the slowest. [arXiv:2009.06080 §2.2]

### 4. Generating-function backbone (Guibas–Odlyzko)

The OGF of length-`n` words **avoiding** `w` is `S(z) = c(z) / (z^ℓ + (1−qz)·c(z))`, and
`E[T] = S(1/q) = q^ℓ c(1/q)` because `P(T > n) = sₙ/qⁿ` and `E[T] = Σ P(T>n) = S(1/q)`.
[Guibas–Odlyzko 1981; *Analytic Combinatorics* I.4.2; math.stackexchange 2961805 worked
`ABRACADABRA`: `c(z)=1+z⁷+z¹⁰`, `E=26¹¹+26⁴+26`]. This is the rigorous source of the
`Σ 2^L` shortcut and the two-pattern Penney odds below; for the app it stays *behind* the
slide-algorithm (we teach the algorithm, cite the GF as the "why it's exact").

### 5. The martingale / "ABRACADABRA" argument (Li 1980 / Gardner)

A team of gamblers in a **fair** casino (a correct 1-bit guess pays 2:1). Before each flip,
a *new* gambler walks in with \$1 and bets it on the pattern's first letter; on a win they
**parlay** the whole stack onto the next letter, and so on; on any wrong flip they bust.
Let `T` be the flip on which the pattern first completes.

- **Money in:** exactly one gambler enters per flip, so total wagered `= T`; `E[in] = E[T]`.
- **Money out (at the stop):** the gamblers still holding money are precisely those whose
  run-so-far is a prefix of the pattern that is *also a suffix of the whole pattern* — i.e.
  the **self-overlaps**. A gambler `L` letters in holds `2^L`. So payout `= Σ_{overlaps L} 2^L`.
- **Fairness ⇒ optional stopping:** the net is a martingale, so `E[in] = E[out]`, giving
  `E[T] = Σ 2^L`. [Li 1980, *A martingale approach to the study of occurrence of sequences
  of patterns in repeated experiments*, Ann. Prob.; Gardner 1974; Springer *Theory and
  Decision* 2026 frames it as no-arbitrage / optional stopping]

Worked ledgers:
- `HH`: alive at stop = the length-2 rider (`$4`) + the length-1 rider (`$2`) ⇒ `E=6`.
- `HT`: only the length-2 rider (`$4`) survives (a one-letter rider would need a trailing
  `H`, but the last flip is `T`) ⇒ `E=4`.
- `HHH`: `$8+$4+$2 = 14`. `ABRACADABRA` (q=26): `26¹¹+26⁴+26¹`.

This is a **second, deeper proof** of §3 that introduces the quant-canonical tools
(martingale, optional stopping, replication / no-arbitrage). It was explicitly deferred in
the MVP PRD ("Martingale method lesson" → Out of Scope), so it is a natural *post-MVP* depth
lesson.

### 6. Penney's game: Conway odds, second-player advantage, intransitivity

Two players each pick a length-`ℓ` word; flip until one appears; that player wins.

- **Conway's odds formula:** the odds that `B` beats `A` are `(AA − AB) : (BB − BA)` using
  the four Conway numbers above. [arXiv:2009.06080 §2.4; Nishiyama 2010; Springer 2026 §3.1]
  - `A=HHH, B=THH`: `(7−0):(4−3) = 7:1` ⇒ `P(THH ≺ HHH) = 7/8`. The marquee sucker bet.
  - Length-2: `P(TH ≺ HH) = 3/4` (`6:2`), derived cleanly by the no-arbitrage / betting-
    chain argument. [Springer 2026 §1, Fig. 1]
- **Second-player rule:** for Alice's `A = a₁a₂a₃`, Bob's optimal beater is
  `B = (¬a₂) a₁ a₂` (take Alice's 2nd letter, flip it, prepend to her first `ℓ−1`). This
  *always* gives Bob odds `> 1`; as `ℓ→∞` the edge → `q/(q−1)`. [arXiv:2009.06080 Thm 2.13;
  Felix 2006]. So `HHH→THH`, `HHT→THH`, `HTH→HHT`, `HTT→HHT`. (Bob's odds, length 3: 7:1,
  3:1, 2:1, 2:1.) [arXiv:2009.06080 Table 2]
- **Intransitivity:** because every word has a beater, no global "best→worst" ranking
  exists; the relation has **cycles**. Sourced demonstration: `HHT ≻ HTT`, `THH ≻ HHT`,
  yet `THH ⊁ HTT`. [arXiv:2009.06080 §1] "Most mathematicians simply cannot believe it…
  one of the finest of all sucker bets." [Gardner 1974, via Springer 2026]
- **The killer paradox (a misconception engine):** *"appears first" ≠ "shorter expected
  wait."* Two sourced, airtight cases:
  - `HHH` (E=14) vs `HHT` (E=8) are an **even 1:1 match** — both must first wait for `HH`,
    then a single coin flip decides. Wildly different waits, equal odds. [PRIMES-STEP 2020]
  - `THTH` (E=20) vs `HTHH` (E=18): the *longer*-wait pattern wins, `9/14`. [arXiv:2009.06080 Ex.]
- **Expected game length** (either pattern appears): `q · [AA·BB − AB·BA] / [(AA+BB) −
  (AB+BA)]`. [arXiv:2009.06080 §2.4] — a nice "Prove" beat that reuses the four numbers.

This is the PRD's named roadmap **Lesson 4 (Penney's Game / competing absorbing states)**,
now backed by the full overlap toolkit instead of hand-waving.

### 7. Clumping / the overlapping-words paradox (bonus thread)

The *expected number* of occurrences of `w` in a random length-`l` string is `q^{l−ℓ}` —
it depends only on length, **not** on overlap. But overlap controls the *distribution*:
self-overlapping patterns **clump** (one occurrence makes another nearby more likely),
which raises variance. [Wikipedia *Autocorrelation (words)*; Pevzner 1993 "overlapping
words paradox"]. The freshest hook: **Litt's Game (2024)** — over 100 flips, whoever's
2-pattern occurs *most often* wins; `HT` beats `HH` head-to-head even though both have the
same expected count, because `HH` clumps and `HT` spreads. [Litt 2024; Grimmett 2025;
Janson et al. 2025; Segert 2024 — all via Springer 2026 §1]

### Sources

1. L. Guibas & A. Odlyzko, *String overlaps, pattern matching, and nontransitive games*,
   J. Combin. Theory A 30 (1981) 183–208. — correlation, GF, `E=q^ℓc(1/q)`, Penney.
2. A. Odlyzko, *Enumeration of strings* (survey) — correlation `XX`, `F(2)=2·AAₜ`.
   `https://www-users.cse.umn.edu/~odlyzko/doc/arch/string.enumerate.pdf`
3. *The Penney's Game with Group Action*, arXiv:2009.06080 — CLN, `E=2·CLN`, Conway odds,
   second-player theorem, game length, worked `HTHT`/`HTH,HTHT`.
4. Y. Nishiyama, *Pattern matching probabilities and paradoxes*, IJPAM 59(3) 2010 —
   worked `AA=7,AB=0,BB=4,BA=3`, Collings' average-wait proof of Conway's odds.
5. *Penney's game odds from no-arbitrage*, Theory and Decision (Springer) 2026 —
   betting-chain / optional-stopping intuition, `P(TH≺HH)=3/4`, Litt's game, Li (1980).
6. S.-Y. R. Li, *A martingale approach…*, Ann. Probability 8 (1980) — the gambler proof.
7. Wikipedia, *Autocorrelation (words)*; Flajolet & Sedgewick, *Analytic Combinatorics*
   I.4.2; math.stackexchange 2961805 (`ABRACADABRA` worked GF).
8. M. Gardner, *Mathematical Games*, Scientific American (1974) — Penney popularization.

---

## Mapping to the existing engine + widgets

**Reusable as-is:** `prediction`, `patternPick`, `coinSim` (`StateGraph` + `CoinStream`),
`stateTap`, `equationTiles` (+ `equationChecker`/`equationDiagnosis` canonical grader),
`slider`, `substitution`, `theorySimChart` (`SimChart`), `overlap`, `recap`, `BiasChart`,
`hintLadder`, `useReducedMotion`, `useElementWidth`, `mulberry32`.

**Small pure-engine additions** (all dependency-free, exact, <100 ms, golden-testable —
matching `automaton.ts` style):

```ts
// src/engine/correlation.ts
correlation(v: string, w: string): { bits: number[]; cln: number; overlaps: number[] }
expectedWaitFair(pattern: string): number          // Σ 2^L  (== 2·autoCLN; cross-checks expectedTimes)
// src/engine/penney.ts
penneyOdds(a: string, b: string): { aBeatsB: Rational; bBeatsA: Rational } // (AA−AB):(BB−BA)
bestBeater(a: string): string                       // (¬a₂)a₁…a_{ℓ-1}
raceToWinner(a, b, rng): 'A' | 'B' | 'tie'          // shared stream, two KMP tracks
// src/engine/martingale.ts
gamblerLedger(pattern, stream): { rows: {enter:number; stack:number; alive:boolean}[]; payout:number }
// src/engine/occurrences.ts (bonus lesson)
countOccurrences(pattern, stream): number           // overlap-aware; mean = (l-ℓ+1)/2^ℓ
```

**New schema interaction types** (added to the discriminated union in `schema.ts`, same
pattern as today): `correlationRuler`, `gamblerLedger`, `penneyRace`, `occurrenceRace`.

**New Konva views** (mirroring `StateGraph`/`SimChart`: `'use no memo'`, `theme.ts` tokens,
reduced-motion branch, commit state on tap/drag-end only): `AutocorrelationRuler`,
`GamblerLedger`, `RaceTrack`. Deterministic per-mistake hints via small pure modules like
`stateTapHints.ts`/`equationDiagnosis.ts`.

---

## Candidate lessons (4, ranked)

### ⭐ L-A (rank 1) — "Conway's Shortcut: Read the Wait Off the Pattern"

**Hook.** "Last lesson you solved a 3-equation system to get `E[HH] = 6`. Watch me get it
in five seconds — without algebra — just by sliding `HH` over itself."

**Core learning promise.** For a fair coin, the expected wait is `Σ 2^(overlap length)`
(over every prefix=suffix border, including the full length) `= 2·`Conway number. You learn
to *compute any pattern's wait by hand* by sliding the pattern over itself and reading off
the overlaps.

**Explicit link to current concepts (esp. OVERLAP).** The slides where the pattern matches
itself are *exactly* `overlapHighlights` / the KMP borders. The flagship's `HH` reset edge
is the `2¹` overlap term; `HT`'s lack of it is why `HT=4`. This is the same overlap, now a
*number*. It also re-derives `E[HH]=6, E[HT]=4` (continuity) before generalizing to `THH/HTH`
(the transfer pair) and beyond — so it slots immediately after Lesson 3.

**Why it matters for quant.** Interviewers love "expected flips until `THTH`?" Recurrences
take minutes under pressure; the slide trick takes seconds and is hard to get wrong. It also
builds the *combinatorial* reflex (look at structure, not just set up algebra).

**The math, worked + what the engine computes.** `E = Σ 2^L`. Engine: `correlation(p,p)`
returns the bit vector + the list of overlap lengths; `expectedWaitFair(p)` sums `2^L` and
is golden-tested to equal the existing `expectedTimes[E0]` (this *cross-check* is the
correctness contract). Worked on-screen: `HT→{2}=4`, `HH→{2,1}=6`, `THH→{3}=8`,
`HTH→{3,1}=10`, `HHH→{3,2,1}=14`, `HTHT→{4,2}=20`.

**Beat-by-beat (10).**
1. `prediction` · **Bet** — "We got `E[HH]=6` by algebra. Could you get it *without* solving
   anything?" (commit yes/no/only-for-simple).
2. `patternPick` · **Bet** — confirm we'll re-examine `HH` then go past it (`HH,HT,THH,HTH`).
3. `correlationRuler` (NEW) · **Explore** — slide `HH` over itself; cells light match/mismatch;
   the learner *taps the bit* (1/0) at each shift before reveal.
4. `correlationRuler` (NEW) · **Explore** — same for `HT`; the missing `2¹` term is the visible
   difference. Side-by-side recap of the two registers.
5. `equationTiles` · **Model** — assemble the rule `E = Σ 2^L` from `2^(full) + 2^(borders)`
   tiles for `HH` (grades to 6) — reusing the canonical checker with `const`/power tiles.
6. `slider` · **Model** — predict `E[THH]` *before* sliding (trap: "longer ⇒ bigger than HH").
7. `correlationRuler` (NEW) · **Model** — slide `THH`: no proper border ⇒ `E=8`; contradicts the
   "longer is slower" guess. Then `HTH` ⇒ 10 (a border reappears).
8. `theorySimChart` · **Prove** — Monte-Carlo `THH`/`HTH`; empirical mean lands on the
   slide-computed value (reuses `SimChart`; the marker = the ruler total).
9. `overlap` · **Prove** — "non-self-overlapping ⇒ fastest possible (`2^ℓ`); all-same ⇒
   slowest." A 6-pattern mini-leaderboard sorted by wait, each annotated with its overlaps.
10. `recap` · **Prove** — the slide trick card; tease "*why* is it exactly `Σ2^L`?" → L-C.

**Interactable widgets.**
- **NEW — Autocorrelation Ruler ("slide-the-pattern-over-itself").** *Hero.* Two mono rows:
  fixed top pattern; a draggable/`Shift →` bottom copy. *Learner manipulates:* drags (or
  taps "Shift") the copy one cell at a time; optionally taps the predicted match-bit. *What
  responds:* overlapping cells flash `--correct`/`--wrong` with ✓/✗ glyphs (never color
  alone); a 1/0 drops into the autocorrelation register; each `1` animates a `2^L` chip into
  a running **Expected-wait total**. *Instant-feedback loop:* a wrong bit-tap triggers the
  3-step ladder ("compare these two cells" → highlight the mismatched cell → reveal the
  bit). Konva for cells/travel; DOM tap targets (44px) + `aria-live` register read-out;
  reduced motion snaps shifts. Drives engine `correlation()`. **Reused in L-B for `AB`/`BA`.**
- **Reused:** `prediction`, `patternPick`, `equationTiles` (+ diagnosis), `slider`,
  `theorySimChart`/`SimChart`, `overlap` mini-graphs, `recap`. `StateGraph` cameo to show
  the border ↔ near-miss edge correspondence.

**Feasibility.** Ruler is the only new canvas; the engine fn is ~30 lines from the existing
`prefixFunction`. Golden test: `expectedWaitFair(p) === expectedTimes[E0]` for all curated
patterns. Tap-only and reduced-motion both complete.

**Targeted misconceptions.** "`E = 1/P(pattern)` so `E[HH]=4`"; "longer pattern ⇒ longer
wait" (killed by `THH=8 < HH... ` vs `HHH=14`); "only the full match matters" (the missing
`2¹`); forgetting the full-length term entirely.

---

### ⭐ L-C (rank 2) — "The Gambler Army: Why Overlap *Is* the Wait" (martingale)

**Hook.** "A casino lets a fresh gambler in before every flip; each bets your pattern and
lets it ride. The instant your pattern shows up, freeze the table and add up the chips —
that sum *is* the expected wait. Let's see why that's not a coincidence."

**Core learning promise.** The martingale / optional-stopping proof: in a fair game, money
in `=` money out; money in `= T`; money out `= Σ 2^(overlap)`; therefore `E[T] = Σ 2^(overlap)`.
You learn *why* L-A's shortcut is exact — and meet martingales, the single most important
quant tool.

**Explicit link (esp. OVERLAP).** The gamblers still holding chips at the stop are *exactly*
the self-overlaps from L-A — the prefix-that-is-also-a-suffix riders. Same overlaps, now with
a dollar meaning. Connects "simulation vs theory" (the fairness invariant is what makes the
average exact) and the flagship's `HH` vs `HT` (the extra surviving `$2` gambler in `HH`).

**Why it matters for quant.** Martingales + optional stopping + replication/no-arbitrage are
the backbone of quant interviews and derivatives pricing. This is the canonical first example
(`ABRACADABRA`), taught by *doing* rather than lecturing. The "fund a long by selling a
short" betting-chain is literally the no-arbitrage mindset.

**The math, worked + engine.** Fair bet pays 2:1, parlay. Engine `gamblerLedger(pattern,
stream)` returns each gambler's entry flip, current stack, alive flag, and the payout sum;
`alive ⇔ run-so-far is a border of pattern`. Worked: `HH → $4+$2 = 6`; `HT → $4 = 4`;
`HHH → $8+$4+$2 = 14`; `ABRACADABRA → 26¹¹+26⁴+26`. Fairness: over many runs, mean(in) and
mean(out) converge to the same `E[T]`.

**Beat-by-beat (11).**
1. `prediction` · **Bet** — "When `HH` first appears, how much is on the table — fixed, or
   does it depend on luck?" (trap: "random / unknowable").
2. `coinSim` · **Explore** — reused `StateGraph`+`CoinStream` flips; one gambler's stack
   parlays `$1→$2→$4` and busts on a wrong flip. Builds the betting-chain intuition.
3. `gamblerLedger` (NEW) · **Explore** — the army arrives: a new row per flip; flip a few
   and watch rows climb or grey out.
4. `stateTap`-style · **Model** — at the completion flip, *tap which gamblers are still
   holding chips*. Graded against `gamblerLedger.alive` (= the overlaps).
5. `equationTiles` · **Model** — drop a `2^L` chip for each surviving gambler; the sum grades
   to `E[HH]=6` (reuses canonical checker with power tiles).
6. `prediction`/`stateTap` · **Model** — "money *in* after `T` flips?" → realize it's exactly
   `T` (one gambler per flip): the in-side of the balance.
7. `substitution` · **Model** — tap through `E[in]=E[out] ⇒ E[T]=Σ2^L` (reuses the stepper).
8. `theorySimChart` (variant) · **Prove** — run many rounds; two convergence lines,
   mean(money-in) and mean(money-out), settle onto the same value (the *fairness meter*).
9. `gamblerLedger` (NEW) · **Prove** — switch to `HT`: only the last gambler survives ⇒ `$4`.
   The contrast with `HH` reproduces the flagship `6 vs 4` from the betting side.
10. `overlap` · **Prove** — explicit bridge: "alive gamblers ≡ L-A's overlaps ≡ flagship's
    near-miss edges." One picture, three vocabularies.
11. `recap` · **Prove** — martingale card (fair game ⇒ E in = E out); tease two-pattern races → L-B.

**Interactable widgets.**
- **NEW — Martingale Gambler Ledger.** *Hero.* Shared coin stream across the top
  (`CoinStream`); a grid where row `t` is the gambler who entered before flip `t`, columns
  are flips, each cell shows the parlayed stack or a bust. *Learner manipulates:* `Flip`
  (single/batch) to drive the stream; **taps the surviving gamblers** at the stop; **places
  `2^L` chips** into the total. *What responds:* stacks double with a chip-stack animation,
  busts grey out, survivors glow `--mark`, the payout total tallies and is compared to the
  flip count. *Feedback loop:* mis-tapping a busted gambler → ladder ("did this run stay a
  prefix of the pattern?" → highlight its first wrong flip → reveal). Konva chips/coins; DOM
  tap layer + `aria-live`; reduced motion: instant stacks.
- **NEW — Fairness meter** (a thin `SimChart` variant): two converging series (in vs out)
  proving `E[in]=E[out]` empirically — reuses convergence motion the learner already trusts.
- **Reused:** `prediction`, `coinSim` (`StateGraph`/`CoinStream`), `stateTap` grading,
  `equationTiles`, `substitution`, `overlap`, `recap`.

**Feasibility.** Ledger is deterministic given stream+pattern (pure fn). The fairness meter
reuses `SimChart`. Heaviest visual is the ledger grid; cap visible rows on mobile (windowed).
Golden test: `gamblerLedger` payout `=== expectedWaitFair`.

**Targeted misconceptions.** "The payout is random/unknowable"; "only the last gambler
wins"; "money-in is some fixed mystery number" (it's just `T`); "a fair casino can't produce
a clean expectation." The whole lesson is a misconception-buster for *why averages are exact*.

---

### ⭐ L-B (rank 3) — "Penney's Game: The Bet Where Going Second Wins"

**Hook.** "Pick *any* three-flip pattern. Go ahead, pick the strongest one. Now watch me
pick second and beat you 7 to 1." (PRD roadmap Lesson 4, fully armed.)

**Core learning promise.** Pattern *races* are **non-transitive**: the second player always
has a beater, so no pattern is "best." You compute the win odds with the four Conway numbers,
`(AA−AB):(BB−BA)`, and learn the famous trap that *more likely to appear first ≠ shorter
expected wait*.

**Explicit link (esp. OVERLAP).** Autocorrelation (L-A) generalizes to **cross-correlation**
`AB` — "how the end of A feeds the start of B." The same slide ruler, now with two different
patterns. Two racing patterns = **competing absorbing states**: two KMP machines on one
shared stream — a direct extension of the flagship's single automaton.

**Why it matters for quant.** A staple brain-teaser; more deeply, it trains *relative/
conditional* event thinking and demolishes a seductive false equivalence (rate of occurrence
vs. head-to-head probability) — exactly the kind of trap interviews probe. Reuses the
betting-chain from L-C to *derive* the odds (no-arbitrage).

**The math, worked + engine.** Odds `B≻A = (AA−AB):(BB−BA)`. Engine `penneyOdds(a,b)` (exact
`Rational`), `bestBeater(a) = (¬a₂)a₁…a_{ℓ-1}`, `raceToWinner` (shared-stream MC). Worked:
`HHH` vs `THH` → `(7−0):(4−3)=7:1` ⇒ `7/8`; second-player map `HHH→THH, HHT→THH, HTH→HHT,
HTT→HHT`; intransitive chain `THH≻HHT≻HTT` but `THH⊁HTT`; paradoxes `HHH(14)` vs `HHT(8)` = 
1:1, and `THTH(20)` beats `HTHH(18)` at `9/14`. Game length `q·(AA·BB−AB·BA)/((AA+BB)−(AB+BA))`.

**Beat-by-beat (11).**
1. `prediction` · **Bet** — "If you pick first in a pattern race, can you always at least tie?"
   (trap: "yes, just pick the fastest pattern").
2. `patternPick` · **Bet** — learner picks Alice's length-3 word; `bestBeater` reveals Bob's
   counter with a small "I'll beat this" stamp.
3. `penneyRace` (NEW) · **Explore** — watch ONE race: shared stream feeds both tracks; first
   to absorb wins. Visceral, no math yet.
4. `prediction` · **Explore** — "over many races, who wins more?" commit.
5. `correlationRuler` (REUSED, cross mode) · **Model** — slide `B` under `A` to get `AB`, then
   `A` under `B` for `BA`; `AA`,`BB` recalled from L-A. The asymmetry `AB≠BA` is the reveal.
6. `equationTiles` · **Model** — assemble `(AA−AB):(BB−BA)` from the four numbers ⇒ the
   predicted odds (grades the ratio; reuses canonical checker).
7. `slider` · **Model** — set your predicted `P(B wins)` on a 0–1 line before simulating.
8. `penneyRace` (NEW) · **Prove** — Monte-Carlo many races; the win-rate bar converges to the
   computed odds; the learner's slider marker sits beside it.
9. `penneyRace` / `patternPick` · **Prove** — **intransitivity ring**: `A≻B≻C≻A` shown as a
   cycle the learner can spin; "there is no best pattern."
10. `theorySimChart` · **Prove** — the **paradox** beat: `HHH` vs `HHT` race (even odds)
    despite `E=14` vs `8`; toggle to `THTH` vs `HTHH` (longer wait wins). Kills the
    rate-vs-race conflation.
11. `recap` · **Prove** — second-player rule card; odds formula; "frequency ≠ race."

**Interactable widgets.**
- **NEW — Penney Race Track.** *Hero.* Two horizontal lanes (A top, B bottom), each a compact
  matched-prefix progress chain (a pip per matched letter, reusing `StateGraph` geometry); one
  shared `CoinStream` ribbon feeds both. *Learner manipulates:* `Flip` to run a race; `Run
  100/1000` to Monte-Carlo; pick/swap patterns. *What responds:* each lane advances/resets per
  flip (the *reset* is the overlap lesson in motion), the winner's lane flashes, a live tally
  + win-rate bar converge to the Conway odds. *Feedback loop:* predicting the wrong winner →
  ladder pointing at the cross-overlap (`AB` vs `BA`). Konva lanes/ribbon; DOM controls +
  `aria-live` "A wins / B wins"; reduced motion: instant resolve, animate only the tally.
- **REUSED — Autocorrelation Ruler in cross mode** for `AB`/`BA` (the cross-correlation
  calculator) — the L-A widget paying off again.
- **Reused:** `prediction`, `patternPick`, `equationTiles`, `slider`, `theorySimChart`,
  `recap`.

**Feasibility.** `raceToWinner` and `penneyOdds` are short pure fns; the race track is the
one substantial new canvas but shares the stream + state-chain primitives. Golden tests:
`penneyOdds(HHH,THH) = 1/7` for A, `7/1` for B; MC win-rate within tolerance of the exact
odds (seeded `mulberry32`).

**Targeted misconceptions.** The big one: "more likely to appear first ⇒ shorter expected
wait" (and its converse). Also "the game must be fair/transitive," "you can rank patterns
best→worst," "ties are impossible / common." All have dedicated beats and sourced examples.

---

### L-D (rank 4, bonus) — "Litt's Game: HT Beats HH at Frequency, Too" (clumping)

**Hook.** "Over 100 flips, does `HH` or `HT` show up more often? Their *expected* counts are
identical — but bet on which appears *more*, and one wins way over half the time."

**Core learning promise.** Expected occurrence count depends only on length (`(l−ℓ+1)/2^ℓ`),
but overlap controls the **distribution**: overlapping patterns **clump** (bursts), raising
variance and losing head-to-head "most occurrences" contests. The variance/tails complement
to L-A's mean story.

**Link (esp. OVERLAP).** Same autocorrelation, opposite consequence: the `2¹` self-overlap
that *lengthens* `HH`'s wait also makes `HH` arrive in *bursts*. Connects mean↔variance and
sets up any future "variance & tails" lesson.

**Quant relevance.** Mean is not the distribution; clumping/burstiness is a real modeling
trap (and a very current research thread). Trains distribution-level thinking.

**Beat sketch (8).** `prediction` (Bet) → `occurrenceRace` watch 100 flips (Explore) →
reveal equal *expected* counts via `equationTiles` (Model) → histogram of counts for HH vs HT
(Model) → clumping visualizer: highlight overlapping runs of HH (Model) → MC "who's more
frequent" win-rate (Prove) → tie to L-A overlap (Prove) → recap.

**NEW widget — Occurrence Race / Clumping tape:** one shared flip tape; HH and HT occurrences
underlined as they happen (overlap-aware); side histograms of per-game counts; learner taps
predicted winner, runs many games, watches the win-rate. Pure `countOccurrences`.

**Feasibility/risk.** The "why HT wins frequency" proof is subtler than Conway odds (variance
argument); keep it empirical (simulate + histogram) and *show* clumping rather than derive
it. Ranked 4th because it's slightly off the "expected wait" spine — best as a capstone.

**Misconceptions.** "Same expected count ⇒ equally likely to be more frequent"; "overlap only
affects waiting, not frequency"; "the mean tells you who wins."

---

## Recommended slate of 3 (ordered) and why they cohere

**1. L-A "Conway's Shortcut" → 2. L-C "The Gambler Army" → 3. L-B "Penney's Game."**

This is a single escalating arc on one object — *overlap* — moving through the three things a
toolkit needs: a **method**, a **proof**, and an **application**.

- **L-A gives the method.** It converts the flagship's qualitative "overlap is memory" into a
  quantitative, hand-computable law (`E = Σ 2^(overlap) = 2·CLN`) and validates it against the
  exact recurrence the learner already solved (`HH=6, HT=4, THH=8, HTH=10`). It introduces the
  cross-cutting **Autocorrelation Ruler** that the later lessons reuse.
- **L-C gives the proof and the depth.** It answers "*why* is the shortcut exact?" with the
  martingale/optional-stopping argument — the quant-canonical tool deliberately deferred from
  the MVP — and re-grounds overlap as *which gamblers survive*. Same numbers (`6 vs 4`), new,
  deeper language (fairness/no-arbitrage). This is the intellectual peak of the path.
- **L-B gives the application and the payoff.** It generalizes self-overlap to
  **cross-overlap** between two patterns (the ruler returns in cross mode), turns the betting
  chain from L-C into the odds formula `(AA−AB):(BB−BA)`, and delivers the marquee result —
  non-transitive races and the "first ≠ fastest" paradox. It is the PRD's named roadmap
  Lesson 4, now fully earned.

The through-objects make the path feel inevitable: the **overlap set** (near-miss edges →
`2^L` terms → surviving gamblers → cross-correlation bits) and the **Autocorrelation Ruler**
(self-overlap in L-A → reused for `AB/BA` in L-B) recur in every lesson, while the
**competing-automata** idea extends the flagship's single state machine into a race. By the
end the learner can, for any short pattern: read its expected wait off the page, justify it
with a martingale, and out-bet an opponent in a pattern race — the full pattern-theory toolkit
the flagship only hinted at.

*(L-D "Litt's Game / clumping" is the natural variance-themed capstone or a bridge to a
future "Variance & Tails" lesson, but sits slightly off the expected-wait spine, so it ranks
4th.)*
