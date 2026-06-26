# Lesson Brief: Hitting Times & Absorption  (lesson-markov-chains-5)

## Hook  (the bet)

"Same drunken stagger between two walls — money \$0 to \$4, you start at \$2. I'm going to ask you
**two** questions about it: **(a)** how many flips until you slam into a wall, and **(b)** the chance you
hit the **right** wall (\$4) before going broke. You've solved *both* before — gambler's ruin, Penney's,
`E[HH]`. So here's the bet: **one** of those two equations carries a **"+1" on every step** and the
other has **no +1, just a split**. Which is which — and can you write *both* as the **same** matrix?"

## Core promise (one idea)

The first-step recurrences you already wrote are one matrix equation: split the chain into its transient
block `Q` and absorbing block `R`, and the single fundamental matrix `N=(I−Q)⁻¹` prices **everything** —
absorption probabilities `B=(I−Q)⁻¹R` (no +1, just a split) and expected hitting times `t` solving
`(I−Q)t=1` (the +1 is the `1`) — so this lesson **recalls and lifts**, it never re-derives.

## Display fields

- **glyphKey:** `(I−Q)⁻¹`
- **vizKey:** randomWalk

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Gambler's ruin, states {0,1,2,3}, up 2/3 / down 1/3, 0 & 3 absorbing: P(reach \$3 \| start \$1) | **4/7**  (and a₂ = **6/7**) | GB **p.54–55 §5.1** (text shows "4/7", "1/3", "2/3"; a₂=6/7) | [ ] engine [x] source |
| Symmetric walk {0,1,2,3,4}, 0 & 4 absorbing, ½/½: P(reach 4 \| start i) = i/4 | **(1/4, 1/2, 3/4)** | Grinstead & Snell **Ex.11.13–15** — https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf | [ ] engine [x] source |
| Same symmetric walk: expected steps to absorption = i(N−i) | **(3, 4, 3)** | Grinstead & Snell **Ex.11.15** — same URL | [ ] engine [x] source |
| Dice 4-state chain {S, 7, 7·7, 12} (per-roll P(7)=6/36, P(12)=1/36, other 29/36): P(**single 12 first**) | **7/13**  ( P(**two consecutive 7s first**) = **6/13**, complement ) | GB **p.55–56 §5.1** + 5 web cross-checks (Math.SE 4494380, 2325821, 1300430, 1204067; ernie55ernie) | [ ] engine [x] source |
| Coin: P(HHH before THH), fair coin | **1/8** (only first-three = HHH) | GB **p.56 §5.1** | [ ] engine [x] source |
| Expected tosses E[THH] | **8** | GB **p.56 §5.1** | [ ] engine [x] source |
| E[n heads in a row] = 2ⁿ⁺¹−2 → E[HH]=6, E[HHH]=14 | **6**, **14** | GB **p.60–61 §5.2** | [ ] engine [x] source |
| Drunk man, symmetric walk on 100-m bridge, start 17: P(reach 100-end first) | **17/100** | GB **p.59 §5.2** (printed "0.17") | [ ] engine [x] source |
| …same: expected steps to absorption = i(N−i) = 17·83 | **1411** | GB **p.59 §5.2** ⚠️ **OCR shows "1441"; intended 17·83=1411** | [ ] engine [~] source |

> Exact-rational check (Stage-2 will reproduce in `markov.ts` via `solveLinearSystem` / `totalExpectation`
> / `penneyOdds`; **no floats on any graded path**): gambler's ruin `a₁=⅓a₀+⅔a₂`, `a₂=⅓a₁+⅔a₃`,
> `a₀=0, a₃=1` ⇒ a₁ = **4/7**, a₂ = **6/7**. Symmetric walk `B=(I−Q)⁻¹R` ⇒ i/4; `(I−Q)t=1` ⇒ i(4−i) =
> **(3,4,3)**. Dice: the 4-state absorption split is **7/13 (12-first) / 6/13 (two-7s-first)** — *state
> the event precisely*. THH: `(I−Q)t=1` on {∅,T,TH,THH} ⇒ **8**.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-first-step` | Reactivate the 3 first-step recurrences + the "+1-or-not" split (retrieval warm-up) | bridge from PHT/gambler's/EV-4 — the springboard, not new teaching | "every recurrence needs a +1" | yes (easy) | both | REUSE `retrievalGrid` |
| 2 | `time-or-prob-bet` | Commit: which of (a) duration, (b) win-chance carries the "+1 per step"? | frames hitting **time** vs hitting **probability** (the corpus's most-reused discrimination) | "both need +1" / "neither does" | no (`byOption`) | both | REUSE `prediction` |
| 3 | `lift-to-matrix` | Name `Q`, `R`, `I`, the fundamental matrix `N=(I−Q)⁻¹` — **the only net-new idea** | `B=(I−Q)⁻¹R` and `(I−Q)t=1` as the *same* first-step eqns, stacked | "the matrix is a different/new method" | no (JIT primer) | A | REUSE `primer` |
| 4 | `walk-recall` | Replay the fair \$0–\$4 gambler's-ruin walk; watch absorption at the walls | re-surface "win-chance = a split, no +1" on a walk you built in PHT | "a symmetric walk is 50/50 from anywhere" | no (recall) | both | REUSE `walkBoard` |
| 5 | `iN-early-win` | Read P(reach \$4 \| start \$i) off the symmetric walk via `(I−Q)⁻¹R` | the easiest matrix case: symmetric ⇒ i/N = **(1/4,1/2,3/4)** | "the start doesn't change the chance" | **yes (easy — guaranteed early win)** | both | REUSE `answerEntry` |
| 6 | `race-recall` | Replay Penney's: two patterns race one stream — who-first is a split | cite Penney's (`penneyOdds`) as *the* worked absorption-probability instance; bridge to asymmetry | "racing patterns needs a brand-new tool" | no (recall) | both | REUSE `raceSim` |
| 7 | `solve-matrix` | **Hero:** build `N=(I−Q)⁻¹` for the asymmetric gambler's ruin and watch it resolve | `B=(I−Q)⁻¹R` ⇒ **4/7** (a₂=6/7); same `N` gives expected times `(I−Q)t=1` → E[THH]=8, walk (3,4,3) | "asymmetric (up 2/3) breaks the formula" | **yes (hero)** | both | **NEW `chainBoard:matrix`** |
| 8 | `triplet-reveal` | Show three lenses agree on the same number | recurrence = matrix solve = simulation; **martingale only as an optional aside** | "the matrix answer is a coincidence of one method" | no | both | REUSE `tripletReveal` |
| 9 | `time-vs-prob` | Interleave on the **same** walk: which read gets the "+1"? | hitting **time** i(N−i) = **(3,4,3)**, +1 each step ↔ hitting **probability** i/N = **(1/4,1/2,3/4)**, no +1 | "expected-time and absorption-prob use the same recurrence" | yes | both | REUSE `retrievalGrid` |
| 10 | `mastery-dice` | **(required, before recap)** novel absorption needing the matrix form | dice {S,7,7·7,12} → P(**single 12 first**) = **7/13** ( **6/13** two-7s) | "7/13 is the two-7s probability" (event mis-mapping) | **yes (harder)** | both | REUSE `masteryChallenge` |
| 11 | `recap` | Retrieval-first recap: recall, then lift to one matrix | consolidate `N=(I−Q)⁻¹` prices time **and** probability; scale-up aside → drunk-man 17/100, 1411 | — | no | both | REUSE `recap` |

> **Hero block** (`solve-matrix`, b7): `slowFirst: true` + `structuralReadout: "N = (I−Q)⁻¹ → B = NR"` +
> `reducedMotionFinalFrame: true`. Per `validate-fixtures.ts` `HERO_TYPES`
> (`raceSim`/`walkBoard`/`gamblerLedger`), `walk-recall` (b4) and `race-recall` (b6) **also** must
> carry a `hero` block — set `slowFirst: false` on both (they are *replays*), reserving the true
> watch-it-resolve hero for the `chainBoard` solve. (See DoR: `chainBoard` must be added to `HERO_TYPES`.)
> Graded beats `required: true`, `track: both`; the JIT primer (`lift-to-matrix`) is `track: A`,
> `required: false`.

## Misconceptions (Specialist)

- **"Every recurrence needs a +1."** → fires at `recall-first-step` / `time-or-prob-bet`. Refutation
  (`byOption`): *"Only **duration** pays +1 per step (`tᵢ = 1 + Σⱼ pᵢⱼtⱼ`). A **probability**
  recurrence has **no** +1 — it just splits and ends at 1 (you win) or 0 (you don't). In matrix form
  that +1 is exactly the `1` on the right of `(I−Q)t=1`; it's simply absent from `B=(I−Q)⁻¹R`."*
- **"A symmetric walk is 50/50 from anywhere."** → fires at `walk-recall` / `iN-early-win`. Refutation:
  *"Symmetric means each **step** is ½/½, not that the **outcome** is ½. From \$1 of \$4 you're one
  slip from broke — P=i/N=1/4, not 1/2. The start sets the split."*
- **"Asymmetric (up 2/3) breaks the formula."** → fires at `solve-matrix`. Refutation: *"Nothing breaks —
  `Q` just holds 2/3 and 1/3 instead of ½,½. The **same** `N=(I−Q)⁻¹` gives `B=NR=` **4/7**. The
  matrix doesn't care whether the coin is fair."*
- **"The matrix is a different method that could disagree with first-step analysis."** → fires at
  `lift-to-matrix` / `triplet-reveal`. Refutation: *"`(I−Q)⁻¹R` **is** first-step analysis — your
  `a₂=⅓a₁+⅔a₃` equations written as `(I−Q)a=R`. Recurrence, matrix solve, and simulation all land on
  the same fraction (the triplet) because they're the same bookkeeping."*
- **"7/13 is the two-consecutive-7s probability."** → fires at `mastery-dice`. Refutation: *"Read the
  event: **7/13** is P(**a single 12 first**); the **two-7s-first** event is its complement, **6/13**.
  Same {S,7,7·7,12} chain — opposite labels. Name the absorbing state you're solving for **before**
  you compute."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener** (`recall-first-step`, from `continuity-report.md` **L5 row**): a `retrievalGrid`
  recalling the recurrences the learner already wrote — `E0 = 1 + ½E1 + ½E0` (PHT
  `lesson-pattern-hitting-times` **`equation-tiles`**), the no-+1 split `P₂ = ½P₃ + ½P₁` / `P=i/N`
  (gambler's-ruin **`prob-tiles`**) vs the +1 duration `D₂ = 1 + ½D₃ + ½D₁` (**`duration-tiles`**),
  `E[X] = Σ E[X|case]P(case)` with `E[HH]=6` "condition on the first flip" (EV-4 **`ev4-recall`**), **plus**
  the time-vs-probability discrimination (Penney's **`win-prob-tiles`** / states-streaks
  **`plus-one-or-not`**: *"+1 every flip" ↔ "no +1, just a split"*). **The only net-new is the matrix lift.**
- **guaranteed early win:** `iN-early-win` (b5) — symmetric walk ⇒ i/N = **(1/4,1/2,3/4)**; the easiest
  case of the just-named matrix form, so the first *compute* is a near-certain hit (the opener `recall-first-step`
  is the graded-easy warm-up that precedes it).
- **mastery challenge (required, before recap):** `mastery-dice` (b10) — the dice 4-state chain
  {S,7,7·7,12} → P(**single 12 first**) = **7/13** (and **6/13** two-7s-first); a novel absorption
  problem that *forces* the matrix form and rewards only the learner who maps the event to the right
  absorbing state.
- **spacing/interleaving** (from `continuity-report.md`): **first-step analysis** re-surfaces across
  **L3** (Chapman–Kolmogorov), **L5** (here), **L6** (`πP=π` as the same one-step relation at its
  fixed point) — three spaced hits. The mid-lesson **interleave** (`time-vs-prob`, b9) reuses the
  `win-prob-tiles` grid as *"expected hitting time vs absorption probability"* on one chain. Reuse the
  `tripletReveal` design (recurrence = matrix solve = simulation); keep the **martingale an optional
  aside** only. Exact-rational fluency (PHT `7/8`, `i/N`; EV; Bayes posteriors) continues through the
  `(I−Q)⁻¹` entries — same `Rational` toolkit, same "answers stay exact fractions" habit.
