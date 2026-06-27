# L4 — The Overlap Shortcut (`lesson-overlap-shortcut`)

> **STALE NUMBERING (annotated 2026-06-27).** This file's "L4" and "Unlocks L5 States & Streaks" use the
> retired ordering. **Canonical:** `lesson-overlap-shortcut` is the **final lesson, L6** (the martingale
> retrieval capstone). See `CONTEXT.md` → "Lesson order (L1–L6)" and `docs/proposed-lessons.md §1`. The file
> is not renamed to avoid breaking references; trust the canonical order, not the filename.

**Agent 3 of 5 · Ideation plan · 2026-06-23**

**Course position:** L4 on `course-pattern-hitting-times` (after L1 Pattern Hitting Times, L2 Penney's Game, L3 Gambler's Ruin). Unlocks L5 States & Streaks.

**One-line:** Read expected wait off the pattern: `E[wait] = Σ 2^(overlap length)`, proved by a fair-casino martingale; re-derives `6, 4, 8, 10` in one line.

**Milestone:** `martingale-mastered`

**Pattern options (fixture):** `["HH", "HT", "THH", "HTH", "HHH"]` — retrieval set from L1/L6; capstone adds `HHH` surprise and optional Extension `HTHT`.

---

## Table of contents

1. [Course arc & prerequisites](#1-course-arc--prerequisites)
2. [Learning promise & quant interview hook](#2-learning-promise--quant-interview-hook)
3. [The math (worked, engine-verifiable)](#3-the-math-worked-engine-verifiable)
4. [Engine contract](#4-engine-contract)
5. [Signature visual moment](#5-signature-visual-moment)
6. [Widget specifications](#6-widget-specifications)
7. [Beat-by-beat (12 beats)](#7-beat-by-beat-12-beats)
8. [Feedback, hints & transfer signal](#8-feedback-hints--transfer-signal)
9. [Schema & fixture sketch](#9-schema--fixture-sketch)
10. [Golden tests & correctness contract](#10-golden-tests--correctness-contract)
11. [Misconceptions targeted](#11-misconceptions-targeted)
12. [Cut lines & extensions](#12-cut-lines--extensions)
13. [Sources & cross-checks](#13-sources--cross-checks)

---

<a name="1-course-arc--prerequisites"></a>
## 1. Course arc & prerequisites

### What the learner already knows (retrieval targets)

| Prior lesson | Installed skill | L4 retrieval use |
|---|---|---|
| **L1** Pattern Hitting Times | States, first-step recurrences, overlap-as-memory, `E[HH]=6`, `E[HT]=4` | Beat 1 grid; HH/HT ruler beats; flagship near-miss ↔ border bridge |
| **L2** Penney's Game | Cross-correlation (`AB`, `BA`), Conway numbers in *race* mode | AutocorrelationRuler reused in **self** mode; "same widget, different question" |
| **L3** Gambler's Ruin | Fair game ≠ safe; probability recurrence has no `1+`; optional stopping intuition from "money can't leak" | GamblerLedger fairness meter; martingale proof lands because L3 already taught "fair ⇒ balance" |

### The one-variable change (A5 curriculum frame)

```
L1: vary nothing      — learn the machine
L2: vary the QUESTION — how long → who's first
L3: vary the ARENA    — coin patterns → random walk
L4: vary the METHOD   — linear system → one-line closed form + martingale proof  ← THIS LESSON
```

L4 is deliberately **retrieval-heavy**: it re-solves problems the learner already proved the long way. The shortcut only lands once `6, 4, 8, 10` are muscle memory from L1 and L6 prep.

### Thread through the engine

The flagship's `prefixFunction` in `src/engine/automaton.ts` already computes KMP borders — the same objects as autocorrelation overlap lengths. L4 makes that identity explicit: *(review: `overlapHighlights` is **not** the border set — it is the per-state near-miss **failure edge** (ℓ−1 of them, one per non-start prefix state E1…E_{ℓ−1}). The border set comes from `prefixFunction`'s border chain; see the Implementation section.)*

```60:69:src/engine/automaton.ts
function prefixFunction(pattern: string): number[] {
  const pi = new Array<number>(pattern.length).fill(0)
  for (let i = 1; i < pattern.length; i++) {
    let k = pi[i - 1]
    while (k > 0 && pattern[i] !== pattern[k]) k = pi[k - 1]
    if (pattern[i] === pattern[k]) k++
    pi[i] = k
  }
  return pi
}
```

Border lengths `{L : prefix_L = suffix_L}` (always including `L = ℓ`) are exactly the indices where the autocorrelation bit is `1`.

---

<a name="2-learning-promise--quant-interview-hook"></a>
## 2. Learning promise & quant interview hook

### Hook (Beat 1 prompt)

*"You solved four linear systems to get `6, 4, 8, 10`. A quant interviewer hands you `THTH` and 30 seconds. There's a one-line rule — let's earn it, and prove it with a casino that can't make a profit."*

### Core learning promise (one idea)

For a fair coin, expected wait until pattern `w` first appears is

**`E[w] = Σ 2^L`** over every overlap length `L` (prefix of length `L` equals suffix of length `L`, including the full pattern).

A **fair-betting martingale** proves why: money in at stop time `= T` flips; money out `= Σ 2^L` (only overlap-aligned gamblers survive); optional stopping ⇒ `E[T] = Σ 2^L`.

### Quant interview deliverable

After L4 the learner can, under time pressure:

1. Slide `THTH` over itself → overlaps `{4, 2}` → **`E = 16 + 4 = 20`** in ~10 seconds.
2. Explain *why* the sum is exact (fair casino / no-arbitrage), not just memorize it.
3. Triangulate: shortcut value = recurrence solve = simulation mean (three methods, one number).

Green Book / Heard-on-the-Street pattern: "Expected flips until pattern X?" — recurrence is the grind; autocorrelation is the interview flex.

---

<a name="3-the-math-worked-engine-verifiable"></a>
## 3. The math (worked, engine-verifiable)

### 3.1 Autocorrelation / borders (Guibas–Odlyzko)

For word `w` of length `ℓ`, the **autocorrelation vector** `(c₀,…,c_{ℓ−1})` has `cᵢ = 1` iff the length-`(ℓ−i)` prefix equals the length-`(ℓ−i)` suffix (a *border*). Always `c₀ = 1`. Equivalently: slide a copy of `w` under itself; at shift `k`, bit `1` iff all overlapping cells match.

**Conway leading number (CLN):** read the bit string as binary (MSB = full overlap). For fair coin:

> **`E[w] = 2 · CLN(w) = Σ_{borders L} 2^L`**

Sources: Guibas & Odlyzko, *String overlaps, pattern matching, and nontransitive games*, J. Combin. Theory A **30** (1981) 183–208; companion *Periods in strings*, JCTA **30** (1981) 19–42; arXiv:2009.06080 §2 (*The Penney's Game with Group Action*) — `E = q^ℓ · c(1/q)`, hence `E = 2·CLN` at `q = 2`.

### 3.2 Worked table (cross-checked against `buildAutomaton(pattern, 0.5).expectedTimes.E0`)

| Pattern | Shifts with match (shift → overlap len L) | Borders L | Σ 2^L | CLN (binary) | 2·CLN | Engine E0 |
|---|---|---|---|---|---|---|
| `HT` | 0→2 | {2} | **4** | `10₂`=2 | 4 | 4 ✓ |
| `HH` | 0→2, 1→1 | {2,1} | 4+2 = **6** | `11₂`=3 | 6 | 6 ✓ |
| `THH` | 0→3 only | {3} | **8** | `100₂`=4 | 8 | 8 ✓ |
| `HTH` | 0→3, 2→1 | {3,1} | 8+2 = **10** | `101₂`=5 | 10 | 10 ✓ |
| `HHH` | 0→3, 1→2, 2→1 | {3,2,1} | 8+4+2 = **14** | `111₂`=7 | 14 | 14 ✓ |
| `HTHT` | 0→4, 2→2 | {4,2} | 16+4 = **20** | `1010₂`=10 | 20 | 20 ✓ |

**Flagship callback:** `HH`'s extra `2¹` term is the length-1 border — the same fact as the `E1 + T → E0` reset edge in L1. `HT`'s missing `2¹` is the self-loop on `E1`.

**HHH surprise:** same length as `THH` (3 flips) but `14` vs `8` — overlap structure dominates length.

### 3.3 Martingale proof (Li 1980)

**Setup.** Before each flip, a new gambler enters with $1 and bets on completing the target pattern from the current stream suffix, parlaying the full stack at fair 2:1 odds each correct letter. On first wrong letter, that gambler busts. Stop at flip `T` when the pattern first completes.

**Money in:** one gambler per flip ⇒ total wagered **= T** ⇒ `E[in] = E[T]`.

**Money out:** at stop, gambler who entered `L` flips before completion holds **$2^L** iff their run-so-far is a prefix of `w` that is also a suffix of `w` — i.e. iff length `L` is a border. Payout **= Σ_{borders L} 2^L**.

**Fairness:** the casino's net position is a martingale (fair odds). Optional stopping (Li 1980; Williams *Probability with Martingales*) ⇒ `E[in] = E[out]`, so **`E[T] = Σ 2^L`**.

Worked ledgers:
- `HH` → survivors at lengths 2, 1 → **$4 + $2 = 6**
- `HT` → only length 2 → **$4**
- `HHH` → **$8 + $4 + $2 = 14**
- `ABRACADABRA` (q=26): borders at 11, 4, 1 → **26¹¹ + 26⁴ + 26¹** (Gardner; Li 1980)

Source: S.-Y. R. Li, *A martingale approach to the study of occurrence of sequence patterns in repeated experiments*, Ann. Probability **8**(6) (1980) 1171–1176, DOI [10.1214/aop/1176994578](https://doi.org/10.1214/aop/1176994578). Li explicitly generalizes Feller and Conway's "leading number" algorithm.

### 3.4 Generalizations (Extension beats)

| Alphabet | Formula | Worked |
|---|---|---|
| Fair q-ary | `E = Σ q^L` over borders | Die until `66`: q=6, borders {2,1} → **6² + 6¹ = 42** |
| Biased binary | `E = Σ (1/p)^L` over borders | Out of L4 Required scope; tease in Extension |

Generating-function backbone (for authors, not taught): avoiding-word OGF gives `E = q^ℓ · c(1/q)` where `c(z)` is the autocorrelation polynomial (Guibas–Odlyzko 1981; Flajolet–Sedgewick *Analytic Combinatorics* §I.4.2).

### 3.5 Wrong values to reject

One expository preprint (PRIMES-STEP 2020) prints `E[HHH]=16`, `E[HTH]=14`. **Use rigorous `2·CLN`:** 14 and 10. arXiv:2006.13002 Table 12 also misstates HTH/THT as 14 (correct: HTH=10, THT=10).

---

<a name="4-engine-contract"></a>
## 4. Engine contract

New module `src/engine/correlation.ts` — pure, dependency-free, golden-testable, matching `automaton.ts` style.

```ts
/** Self- or cross-correlation bit vector (length = pattern length).
 *  bits[i] = 1 iff suffix/prefix of length (n-i) match when v shifted under w. */
export function correlation(v: string, w: string): {
  bits: number[]           // e.g. HH → [1,1]; HT → [1,0]
  cln: number              // binary value of bits (Conway leading number for v=w)
  overlaps: number[]       // border lengths L where bit=1, descending or ascending (document one convention)
}

/** Fair-coin closed form: Σ 2^L over overlaps. */
export function expectedWaitFair(pattern: string): number

/** Deterministic martingale ledger for a fixed flip stream. */
export function gamblerLedger(
  pattern: string,
  stream: string,
): {
  rows: Array<{
    enter: number       // flip index gambler joined (0-based)
    stack: number     // parlayed stack at stop (0 if bust)
    alive: boolean    // still holding at pattern completion
    borderLength?: number  // if alive, which overlap length
  }>
  stopFlip: number    // T — number of flips to first completion (1-based count, not a 0-based index)
  moneyIn: number     // = stopFlip (one gambler per flip); RANDOM per stream
  payout: number      // Σ 2^L over alive rows — DETERMINISTIC; === expectedWaitFair(pattern) for any stream
}
```

**Implementation notes (~80 lines total):**

- `borders(pattern)` from existing `prefixFunction` via the **border chain** *(review: the draft's `{ℓ} ∪ {i : pi[i-1] > 0}` is WRONG — it drops the length-1 border of `HTH`/`HHH`, yielding E[HTH]=8 and E[HHH]=12 instead of 10/14; verified empirically below)*: start at `ℓ`, then follow `pi` to the bottom — `const out=[ℓ]; let k=pi[ℓ-1]; while(k>0){out.push(k); k=pi[k-1]}`. Gives `HHH→[3,2,1]`, `HTH→[3,1]`, `HT→[2]`. Cross-check against brute-force shift matching.
- `correlation(v,w)`: for each shift `k = 0..ℓ-1`, compare the length-`(ℓ-k)` **suffix of `v`** with the length-`(ℓ-k)` **prefix of `w`** — i.e. `v.slice(k) === w.slice(0, ℓ-k)` *(review: the draft's `v.slice(ℓ-k-1, ℓ-k)` is a single character and can never equal a length-`(ℓ-k)` prefix)*; handle unequal lengths for cross-mode reuse in L2.
- `gamblerLedger`: simulate KMP progress per gambler row; at stop, `alive ⟺ matched-prefix length is a border`.

**Golden contract (must pass in CI):**

```ts
expectedWaitFair(p) === buildAutomaton(p, 0.5).expectedTimes.E0
gamblerLedger(p, stream).payout === expectedWaitFair(p)  // when stream reaches first match
```

Curated patterns for golden suite: `HT`, `HH`, `THH`, `HTH`, `HHH`, `HTHT`, `HHT`, `TTTT`.

---

<a name="5-signature-visual-moment"></a>
## 5. Signature visual moment

**Triangulation + gambler army + convergence** (Beat 11, Required)

On a single horizontal value axis (**TriangulationStrip**):

1. **Recurrence marker** — pre-computed from `buildAutomaton` (grey quill pin): "the system you solved in L1."
2. **Martingale marker** — SumTiles / GamblerLedger chip stack height (gold `--mark`): "the casino payout."
3. **Simulation line** — `theorySimChart` empirical mean (heads blue) crawling then **snapping** to the same tick.

Around the axis, **GamblerLedger** plays as a city skyline: parlay stacks rise row-by-row, busts collapse grey, overlap-aligned survivors glow gold at stop. The **fairness meter** (thin SimChart variant) shows mean(money-in) and mean(money-out) converging to one number across batch runs.

Copy at snap: *"Three methods. One answer. Overlap is the whole story."*

Reduced motion: all three markers appear instantly at the correct abscissa; `aria-live` reads "Recurrence 10, Martingale 10, Simulation 10.02 — match."

---

<a name="6-widget-specifications"></a>
## 6. Widget specifications

### 6.1 AutocorrelationRuler (self mode) — `interaction.type: "autocorrelationRuler"`

**Size:** small hero (DOM-primary, 44px cells)

**Layout:** fixed top row = pattern; bottom row = draggable copy. Controls: `◀ Shift` / `Shift ▶` (tap-only path).

**Manipulate → respond → feedback:**

| Learner action | Response |
|---|---|
| Shift bottom row one cell | Overlapping columns highlight; shift index updates |
| Tap match / no-match on active column | Bit drops into autocorrelation register; wrong tap → 3-step ladder |
| Each registered `1` | Animate `2^L` chip into running total (SumTiles preview) |

**Engine:** `correlation(pattern, pattern)` drives grading.

**Modes:** `mode: "self"` (L4) vs `mode: "cross"` (L2 Penney's — same component).

**a11y:** `aria-live` reads "Shift 1: no match" / "Shift 1: match, add 2¹"; reduced motion snaps without travel.

### 6.2 SumTiles / TermLedger — `interaction.type: "sumTiles"`

**Size:** small

**Generalizes** `equationTiles` from one equation to a **series sum**.

**Bank tiles:** `2^1`, `2^2`, `2^3`, … (dynamic up to pattern length), `+`, `=`.

**Manipulate:** tap a power tile for each overlap length into the ledger slots (ordered or unordered — accept any order if multiset matches).

**Respond:** running partial sum; on complete, snap to theory value with `--correct` flash.

**Feedback:** reject duplicate/wrong exponent ("That shift didn't match — no 2³ term for THH"); hint ladder surfaces the missed border (usually the k=1 trap for HH/HTH).

**Engine target:** `expectedWaitFair(pattern)`.

### 6.3 GamblerLedger + fairness meter — `interaction.type: "gamblerLedger"`

**Size:** medium (Konva chips + DOM tap grid)

**Layout:**
- Top: shared `CoinStream` ribbon (reuse L1).
- Body: grid — row `t` = gambler entering before flip `t`; columns show parlay stack or bust.
- Bottom: payout tally vs flip count; optional **fairness meter** mini-chart.

**Manipulate:**
- `Flip` / `Run until match` drives stream.
- At stop: **tap survivors** (graded vs `gamblerLedger.alive`).
- **Place `2^L` chips** into payout total (SumTiles coupling on Beats 5–6).

**Respond:** stacks double on win (`$1→$2→$4…`), busts grey out, survivors glow `--mark`. Fairness meter: batch 200 runs, plot mean(in) and mean(out) converging.

**Engine:** `gamblerLedger(pattern, stream)`.

**Mobile:** window visible rows (last 12 gamblers + scroll); stop frame always pinned.

### 6.4 TriangulationStrip — `interaction.type: "triangulationStrip"` (variant of `theorySimChart`)

**Size:** small

**Layout:** horizontal axis 0..max(E)+buffer; three labeled markers + simulation convergence line.

**Props:** `{ pattern, recurrenceValue, martingaleValue, simSeed }` — first two from engine, third from `empiricalMean`. *(review: these are derived **component** props computed at render via `buildAutomaton(pattern,0.5).expectedTimes.E0` and `expectedWaitFair(pattern)`; the schema variant stores only `pattern` + sim params, never the numeric values, to avoid fixture↔engine drift.)*

**Animate:** sequential drop (recurrence → martingale → sim converge → snap + haptic-style pulse on axis).

**Reuse:** `SimChart` axis theme, `mulberry32` seed, reduced-motion instant render.

---

<a name="7-beat-by-beat-12-beats"></a>
## 7. Beat-by-beat (12 beats)

| # | beatId | Required | Phase | Interaction | Teaches (one thing) | Wrong-path manufactured |
|---|--------|----------|-------|-------------|---------------------|-------------------------|
| 1 | `recall-grid` | ✓ | Bet | `prediction` (match grid) | Spaced retrieval: match `6,4,8,10` to patterns | Misremember one → instant correction + "you'll re-derive these" |
| 2 | `interview-clock` | ✓ | Bet | `prediction` + timer UI | **`THTH` under 30s** — commit before tools | Guess 16 (length×4) or 18; set up the need for a shortcut |
| 3 | `self-overlap` | ✓ | Explore | `autocorrelationRuler` (HH) | Overlaps = shifts where prefix = suffix | Only count full overlap; miss shift-1 on HH |
| 4 | `contrast-HT` | ✓ | Explore | `autocorrelationRuler` (HT) | Missing border ⇒ missing term ⇒ faster wait | Expect same overlaps as HH |
| 5 | `overlap-to-power` | ✓ | Model | `autocorrelationRuler` grade-step *(review: NOT `stateTap` — that type is bound to StateGraph transitions)* | Each overlap length `L` contributes **`2^L`** | Assign power to non-match shift |
| 6 | `sum-it-HH` | ✓ | Model | `sumTiles` | **`E = Σ 2^L`**; HH → 4+2 = **6** | Omit k=1 → get 4 (known wrong from L1) |
| 7 | `casino-intuition` | ✓ | Explore | `gamblerLedger` | Why: money in = T, money out = Σ2^L | Think payout is random; tap busted gambler |
| 8 | `who-survives` | ✓ | Model | `gamblerLedger` (`tapSurvivors`) *(review: NOT `stateTap`)* | Survivors ≡ overlaps (same borders as ruler) | Tap gambler whose run broke before stop |
| 9 | `apply-THH-HTH` | ✓ | Model | ruler + `sumTiles` | Transfer: THH→8, HTH→10 (maxHintLevel 2) | Invent spurious overlaps; miss HTH shift-1 |
| 10 | `surprise-HHH` | ✓ | Prove | `prediction` + ruler + sumTiles | **HHH → 14** vs THH=8 (length trap) | Predict ~8 by length |
| 11 | `triangulation` | ✓ | Prove | `triangulationStrip` + `gamblerLedger` fairness meter | Three methods agree on HTH (or learner-chosen) | "New trick ≈ approximate" |
| 12 | `recap` | ✓ | Prove | `recap` | Course capstone card: Σ2^L, casino proof, interview THTH=20 | — |

**Optional Extension (not Required, never blocks completion):**

| beatId | Interaction | Content |
|---|---|---|
| `ext-THTH` | ruler + sumTiles | Resolve Beat 2: THTH → {4,2} → **20** |
| `ext-dice-66` | sumTiles (base 6) | q=6: **42** flips until double-six |
| `ext-abracadabra` | gamblerLedger (cameo) | 26¹¹+26⁴+26 — martingale scales |

### Beat copy & interaction detail

**Beat 1 — `recall-grid`**

- Prompt: *"Before the shortcut: match each pattern to the expected wait you derived in Lesson 1."*
- Options: drag/match HH→6, HT→4, THH→8, HTH→10 (shuffle order).
- Correct: *"Good — you already know the answers. This lesson gives you a faster way to *recompute* them, and a proof that can't be wrong."*

**Beat 2 — `interview-clock`**

- Prompt: *"Interview mode: expected flips until `THTH`? You have 30 seconds."*
- `prediction` numeric or bucket: {8, 12, 16, 20, 24}.
- No ruler yet. Correct path: 20. Wrong 16 trap: *"That's 4×4 — treats flips as independent blocks. Overlap matters."*
- Defer full solve to Extension; tease: *"By the end you'll do this in one slide."*

**Beat 3 — `self-overlap` (HH)**

- Prompt: *"Slide `HH` over itself. Tap each shift: match or no match?"*
- Shifts 0 and 1 both match → register `11₂`.
- Bridge copy on Continue: *"These matches are the same borders your state machine used — near-miss memory from Lesson 1."*

**Beat 4 — `contrast-HT`**

- Side-by-side HH vs HT registers after HT slide.
- Takeaway: *"HT's missing 2¹ term is exactly why HT=4 < HH=6."*

**Beat 5 — `overlap-to-power`**

- Prompt: *"Each matching shift of length L adds a term 2^L to the expected wait. Tap the powers for HH."*
- Graded taps on ruler-derived lengths {2, 1}.

**Beat 6 — `sum-it-HH`**

- SumTiles: place `2²` + `2¹` → 6.
- Explicit wrong-path feedback if only `2²`: *"You got 4 — that's E[HT], not E[HH]. HH has a length-1 overlap."*

**Beat 7 — `casino-intuition`**

- Prompt: *"A fair casino: new gambler every flip, parlay on your pattern. Flip until `HH` completes. Watch the skyline."*
- Run scripted stream `…HTH**HH**` or learner-driven; stop at first HH.
- Show money-in counter = flip count at stop.

**Beat 8 — `who-survives`**

- Prompt: *"Tap every gambler still holding money at the stop."*
- Grade against alive rows; ladder links to border lengths.

**Beat 9 — `apply-THH-HTH`**

- Two-part beat (same screen, sequential checks):
  1. THH ruler → single overlap → SumTiles → **8**
  2. HTH ruler → overlaps {3,1} → SumTiles → **10**
- `maxHintLevel: 2` on both (no reveal — retrieval).

**Beat 10 — `surprise-HHH`**

- Prompt: *"Same length as THH. Predict E[HHH] before you slide."*
- Slider or buckets; then ruler → {3,2,1} → **14**.
- Copy: *"All-H patterns are overlap-heavy: HHH is the slowest length-3 pattern."*

**Beat 11 — `triangulation`**

- Pattern: **HTH** (retrieval from Beat 9) or learner pick from {THH, HTH, HHH}.
- Run 500 sims; watch three markers snap to **10** (or 8/14).
- Fairness meter batch: mean(in) ≈ mean(out) ≈ E.

**Beat 12 — `recap`**

- Retrieval-first bullets:
  - Rule: **E = Σ 2^L** over self-overlaps
  - Proof sketch: fair casino ⇒ E[T] = payout sum
  - Interview: **THTH = 20**
  - Link: overlaps = KMP borders = near-miss edges = surviving gamblers
- Milestone stamp: **Martingale Mastered**

---

<a name="8-feedback-hints--transfer-signal"></a>
## 8. Feedback, hints & transfer signal

### Hint ladder (standard)

1. Conceptual nudge (*"Compare the first k letters to the last k letters."*)
2. Highlight mismatching cells / wrong gambler row
3. Reveal bit or survivor set with explanation

### Faded scaffolding

- `maxHintLevel: 2` on Beat 9 (`apply-THH-HTH`) — mirrors L6 transfer lesson; no level-3 reveal.
- Cap hints on Beat 6 if learner already missed k=1 once in Beat 3–4.

### Transfer signal

```ts
derived.transferAttained = true
```

iff Beat 9 completes **both** THH and HTH SumTiles checks without hitting hint cap on either part.

Does **not** gate unlock (completion = mastery); surfaces on course path as quality badge.

### `needsReview`

Standard rule: reveal on any Required beat, or ≥3 wrong checks on a Required beat.

---

<a name="9-schema--fixture-sketch"></a>
## 9. Schema & fixture sketch

### New interaction types (add to `src/content/schema.ts`)

```ts
| { type: "autocorrelationRuler"; pattern: string; mode: "self" | "cross"; partner?: string }
| { type: "sumTiles"; pattern: string; base?: 2 /* default fair coin */ }
| { type: "gamblerLedger"; pattern: string; mode: "single" | "batchFairness"; scriptedStream?: string }
| { type: "triangulationStrip"; pattern: string; simRuns?: number }
```

*(review: four corrections, detailed in the Implementation section. (1) These variants embed a per-beat `pattern` — a deliberate departure from L1, where beats read `pattern` from `BeatProps`; each widget therefore builds its own `automaton`/`correlation` from `interaction.pattern`. (2) `gamblerLedger.mode` must add a survivor-tap grading mode (e.g. `"tapSurvivors"`) for Beat 8, which previously claimed `stateTap`. (3) `sumTiles.base` should be `z.number().int().min(2)` not the literal `2`, so the dice-66 extension (base 6) validates. (4) Persistence: add `LessonState.sumTiles` + `Snapshot.interactionState.sumTiles`, keyed by `beatId` since L4 reuses the same pattern string across beats.)*

### Fixture header

```json
{
  "lessonId": "lesson-overlap-shortcut",
  "courseId": "course-pattern-hitting-times",
  "title": "The Overlap Shortcut: Read the Wait Off the Pattern",
  "patternOptions": ["HH", "HT", "THH", "HTH", "HHH"],
  "milestoneId": "martingale-mastered",
  "unlocks": "lesson-states-streaks",
  "schemaVersion": 1
}
```

### Authoring caveat

`equationDiagnosis.ts` is HH-hardcoded — SumTiles needs its own `sumTilesDiagnosis.ts` or generic power-term checker (do not reuse E0/E2 copy).

---

<a name="10-golden-tests--correctness-contract"></a>
## 10. Golden tests & correctness contract

### `src/engine/correlation.test.ts`

```ts
correlation('HH','HH')  → { bits: [1,1], cln: 3, overlaps: [1,2] }
correlation('HT','HT')  → { bits: [1,0], cln: 2, overlaps: [2] }
correlation('HTH','HTH') → overlaps include 1 and 3
expectedWaitFair('HH') === 6
expectedWaitFair('HTHT') === 20
expectedWaitFair(p) === buildAutomaton(p, 0.5).expectedTimes.E0
  for p in ['HT','HH','THH','HTH','HHH','HTHT','HHT']
```

### `src/engine/gamblerLedger.test.ts`

- Fixed stream reaching first match: `payout === expectedWaitFair(p)`.
- HH scripted: exactly 2 alive gamblers; HT scripted: exactly 1.

### Simulation cross-check (lesson runtime)

Beat 11: `|empiricalMean - expectedWaitFair(p)| < 0.5` after 500 runs (seeded `mulberry32`).

---

<a name="11-misconceptions-targeted"></a>
## 11. Misconceptions targeted

| Misconception | Where surfaced | Correction |
|---|---|---|
| `E = 1/P(pattern) = 2^ℓ` so HH takes 4 | Beats 1, 6 | Need overlap sum; HH needs +2¹ |
| Only full pattern overlap counts | Beats 3–4, 6 | HH shift-1; HTH shift-1 |
| Longer pattern ⇒ longer wait | Beats 2, 9–10 | THH=8 vs HHH=14; THTH=20 vs HTHH=18 |
| Shortcut is approximate | Beat 11 | Triangulation snap — exact rational match |
| Martingale payout is random | Beats 7–8 | Survivors determined by borders |
| Fair game can't yield clean expectation | Beat 11 fairness meter | Optional stopping ⇒ equality of means |

---

<a name="12-cut-lines--extensions"></a>
## 12. Cut lines & extensions

### If schedule slips (drop to 10 beats)

Drop Beat 2 (`interview-clock`) and merge Beats 3–4 into one HH/HT ruler beat. Keep triangulation (Beat 11) — it's the signature moment.

### If schedule slips further (≤9 beats)

Drop Extension entirely; collapse Beat 9 to THH only (drop HTH half); keep HH martingale + triangulation.

### Extension path (post-L4 roadmap)

- **Weighted Coins & Dice** (`lesson-weighted-coins`): generalize to `Σ q^L` and biased `Σ (1/p)^L`.
- Cross-mode AutocorrelationRuler links back to L2 Penney's Conway odds.

---

<a name="13-sources--cross-checks"></a>
## 13. Sources & cross-checks

| Topic | Source | Use in lesson |
|---|---|---|
| Autocorrelation / correlation polynomial | Guibas & Odlyzko, JCTA **30** (1981) 183–208; *Periods in strings* JCTA **30** (1981) 19–42 | Rigorous backing for Σ2^L; cite in recap expert note |
| Conway leading number, E = 2·CLN | Gardner, *Scientific American* (1974); arXiv:2009.06080 §2; arXiv:2006.13002 §5.1 | Slide algorithm; CLN column in Beat 3 register |
| Martingale / optional stopping | Li, Ann. Probability **8** (1980) 1171–1176; Williams, *Probability with Martingales*; Grimmett–Stirzaker | Beats 7–8, 11 proof sketch |
| ABRACADABRA | Gardner; Li 1980; Lutsko expository note | Extension beat |
| No-arbitrage framing | *Penney's game odds from no-arbitrage*, Theory and Decision (Springer 2026) | Optional recap link to L2 |
| Engine golden values | `src/engine/automaton.test.ts`, `buildAutomaton(p,0.5).expectedTimes.E0` | Triangulation recurrence pin |
| KMP borders | `prefixFunction` in `src/engine/automaton.ts` | overlapHighlights bridge in Beat 3 |

**Engine verification (run when implementing):**

```
HH=6, HT=4, THH=8, HTH=10, HHH=14, HTHT=20
Die 66: expectedWaitFair with base 6 → 42 (Extension)
ABRACADABRA: overlaps 11,4,1 → 26^11+26^4+26 (Extension, engine may use general alphabet helper)
```

---

## Implementation checklist (Phase 22)

- [ ] `src/engine/correlation.ts` + tests
- [ ] `src/engine/gamblerLedger.ts` (or same module) + tests
- [ ] Widgets: AutocorrelationRuler, SumTiles, GamblerLedger, TriangulationStrip
- [ ] `fixtures/lesson-overlap-shortcut.json` — 12 beats + 3 Extension
- [ ] `scripts/validate-fixtures.ts` — cross-check sum targets
- [ ] Seed + milestone `martingale-mastered`
- [ ] Manual: complete L4 tap-only + reduced-motion; Beat 11 snap verified

---

## Plan assessment (Opus 4.8 review)

**Verdict: Strong** — ship-worthy lesson design with fully verified math. The only blockers are two engine-sketch bugs and a beat-type misassignment (all corrected inline above); none touch the pedagogy or the curated values.

### Pedagogy
- **The arc earns the shortcut.** Retrieve L1's `6/4/8/10` (Beats 1–2) → *discover* overlaps by sliding (3–4) → map each overlap→`2^L` and sum (5–6) → *prove* with the casino (7–8) → transfer (9) → break the length trap with HHH (10) → triangulate (11). Rule-first, proof-as-enrichment is the right order: a learner can wield `Σ2^L` without the martingale, and the martingale answers "why."
- **HHH→14 lands.** Same length as THH (8) but ~2× the wait; Beat 10's predict-before-slide makes "overlap dominates length" visceral.
- **Casino clarity — the one soft spot.** Optional stopping is necessarily informal for this audience. The proof is sharpest if it leans on the **deterministic-payout** insight: the survivors (hence Σ2^L) are the *same every run* — only the flip count `T` is random — so "a fair game can't create or destroy money on average ⇒ E[T] = the fixed payout." Recommend Beat 7 show the running **mean(T)** immediately (not just one run) so the equality is *felt* before Beat 8 asserts it; the Beat 11 fairness meter currently arrives after the rule is already trusted.
- Retrieval load (1–2) and faded scaffolding (`maxHintLevel:2` on Beat 9) match L1/L6 conventions; `transferAttained` reuses the existing `ProgressDerived` field.

### Verified math
Every binary value cross-checked **two ways** on 2026-06-23: `buildAutomaton(p,0.5).expectedTimes.E0` (engine) **and** an independent border-chain `Σ q^L`.

| Claim | Borders | Σ 2^L | Engine E0 | ✓/✗ |
|---|---|---|---|---|
| HT | {2} | 4 | 4 | ✓ |
| HH | {2,1} | 6 | 6 | ✓ |
| THH | {3} | 8 | 8 | ✓ |
| HTH | {3,1} | 10 | 10 | ✓ |
| HHH | {3,2,1} | 14 | 14 | ✓ |
| HTHT | {4,2} | 20 | 20 | ✓ |
| THTH | {4,2} | 20 | 20 | ✓ |
| HTHH | {4,1} | 18 | 18 | ✓ |
| HHT | {3} | 8 | 8 | ✓ |
| TTTT | {4,3,2,1} | 30 | 30 | ✓ |

- **E = 2·CLN** confirmed: CLN(HH)=3, CLN(HTH)=5 → 2·3=6, 2·5=10. CLN = Σ2^(L−1) over borders = the autocorrelation read as binary (MSB = full overlap); doubling shifts each term up to 2^L. ✓
- **Die "66" (q=6)** = 6²+6¹ = **42** ✓ (hand + closed form; the engine is H/T-only so it *cannot* check this — flag for the dice extension).
- **ABRACADABRA** borders {11,4,1} → 26¹¹+26⁴+26¹ ✓.
- **Rejected wrong values confirmed:** HHH≠16, HTH≠14 (correct 14/10); THT={3,1}=**10** ✓ — §3.5 is right.
- **Draft-sketch math caught (inline):** the border formula `{ℓ}∪{i:pi[i-1]>0}` computes E[HTH]=8 and E[HHH]=12, both wrong — corrected to the prefix-function border chain.

### Scope & cut line
12 required beats is acceptable; the **real** scope risk is **4 brand-new widgets + a new engine module + a new grader + new persistence**, not the beat count. Build cheapest-first — **SumTiles → AutocorrelationRuler (self-only) → TriangulationStrip → GamblerLedger** — and treat the plan's 10-beat cut (drop Beat 2, merge 3–4) as the default if time slips; keep Beat 11 (signature). Ship the ruler **self-mode only**; defer `cross` to L2.

### Beat-by-beat flags
- **Beats 5, 8** ❌ `stateTap` is invalid (it renders the StateGraph and grades against `automaton.transitions`). Fold "assign 2^L" into `autocorrelationRuler` and "tap survivors" into `gamblerLedger` (fixed inline).
- **Beats 3,4,9,10** per-beat `pattern` ≠ lesson `pattern` → each widget must build its own `automaton`/`correlation` from `interaction.pattern`.
- **Beat 11** fairness meter = `SimChart` with a **flat** theory line at Σ2^L and a converging mean(T) curve (money-out is constant, only money-in converges). Draw it that way — free reuse.
- **Beat 2** answer 20 is deferred to `ext-THTH`; fine.

### Prioritized recommendations
1. **Border extraction → prefix-function border chain** (done inline). The correctness lynchpin; the golden test guards it.
2. **Reassign Beats 5 & 8** off `stateTap` into widget-internal grading modes (done inline).
3. **Add the golden contract test** `expectedWaitFair(p) === buildAutomaton(p,0.5).expectedTimes.E0` + the `gamblerLedger` payout-invariance test.
4. **Make the deterministic-payout idea explicit** in Beats 7–8; show running mean(T) in Beat 7.
5. **Persist SumTiles** via new `LessonState.sumTiles` keyed by `beatId`.
6. Default to the 10-beat cut; build widgets cheapest-first.

---

## Implementation in the tech stack

Conventions observed in the live code (match them): every file mounting a Konva `<Stage>` begins with `'use no memo'`; canvas layers are `listening={false}` and **taps live in parallel DOM buttons** (`StateTapBeat`); colors come only from `konva/theme.ts` (`C`, `FONT_MONO`); width via `useElementWidth`; animation via `Konva.Animation`/`node.to(...)` mutating refs and cancelled on unmount; a11y via a `role="status"`/`aria-live` DOM mirror (`CoinStream`, `SimChart`). Each beat composes `<BeatShell primary/secondary/tertiary feedback>` and grades through `useHintLadder` + `resolveFeedback`. The dispatcher in `beats/index.tsx` switches on `interaction.type`, so each new type needs a `case` + a new `<XxxBeat>`.

### AutocorrelationRuler — `type: "autocorrelationRuler"`
- **Reuse:** new `konva/AutocorrelationRuler.tsx` (`'use no memo'`); borrow `CoinStream`'s letter-chip styling, `useElementWidth`, `C`/`FONT_MONO`. Grading via `correlation()`.
- **Konva sketch:** props `{ pattern, shift, confirmed:Set<number>, width, height, reducedMotion }`. `cellW = clamp(40,56,width/(ℓ+2))`. Top row = ℓ fixed cells at `xCell(i)=padX+i*cellW`. Bottom row = one `<Group ref={slideRef}>` of letter cells with `x = shift*cellW`. Behind each overlapping column a `<Rect>` tinted `C.correct`/`C.markWash` (match) or faint `C.wrong` (mismatch). Right-side **register** of ℓ bit boxes; confirming a full-match shift `k` flips bit `k` and animates a `2^(ℓ-k)` chip toward the SumTiles total.
- **Animation:** `slideRef.current.to({ x: shift*cellW, duration:0.18, easing:Konva.Easings.EaseInOut })`; match flash via per-cell `to({scaleX:1.12...})`. Discrete steps → no rAF.
- **Reduced motion:** set `x` synchronously, no flash; bits render filled.
- **a11y / tap:** DOM `◀ Shift`/`Shift ▶` set React `shift`; per shift, DOM `Match`/`No match` buttons grade against `correlation(pattern).bits[shift]`. `role="status"`: `Shift ${shift}: ${match ? 'match — adds 2^'+(ℓ-shift) : 'no match'}`.
- **Schema/state:** `grade: 'slideOnly' | 'assignPowers'` (Beat 5 = `assignPowers`). `shift`/`confirmed` ephemeral (re-derivable).
- **Effort M · Risk M.** Self-mode only for L4; the sliding-group + register geometry is the novel work.

### SumTiles / TermLedger — `type: "sumTiles"`
- **Reuse:** DOM-first; mirrors `EquationTilesBeat`'s tap-tile-then-slot flow and `.token`/`.slot` CSS (no Konva needed; an optional `node.to` snap is flourish). Target from `expectedWaitFair(pattern)`/`borders(pattern)`.
- **Layout:** bank of chips `2¹…2^ℓ` (DOM buttons) → ordered ledger of placed terms with `+` separators and a live running-sum chip; tap chip to append, tap placed term to remove.
- **Grade:** placed-exponent **multiset** vs `borders(pattern)` (order-free, like equationDiagnosis's reorder tolerance). On complete+correct, `--correct` flash to the theory value. Targeted hint for the common `k=1` miss: "HH has a length-1 overlap; you're missing 2¹" / "no 2³ term for THH."
- **Reduced motion:** show final sum, no snap. **a11y/tap:** each chip `aria-label="add 2 to the power 1 (=2)"`, running sum in `role="status"`. Fully tap-only.
- **Schema/state:** `base: z.number().int().min(2)` (default 2; lets dice-66 use 6). **New** `LessonState.sumTiles?: Record<beatId,(string|null)[]>` + `Snapshot.interactionState.sumTiles` (round-trip like equationTiles). Needs a ~30-line `sumTilesDiagnosis.ts` — do **not** reuse the HH-hardcoded equation copy (L4 avoids equationTiles entirely, so that path is moot).
- **Effort S · Risk L.** Cheapest widget — build first.

### GamblerLedger + fairness meter — `type: "gamblerLedger"`
- **Reuse:** `CoinStream` (top ribbon, DOM); **`SimChart` verbatim** for the fairness meter (theory=`expectedWaitFair`, points=running mean(T)); `mulberry32` for seeded/scripted runs; new `konva/GamblerLedger.tsx` for stacks.
- **Konva sketch:** props `{ pattern, stream, stopFlip, rows, reducedMotion, width, height }` from `gamblerLedger(pattern, stream)`. Gambler row `r` = vertical chip stack at `x=colX(r)`; a gambler matching `m` letters shows `m` chips ($2^m) rising from baseline; on bust collapse to `C.graphiteSoft`; at stop, alive (border-aligned) stacks glow `C.mark`. Money-in counter = `stopFlip`; payout tally = Σ alive.
- **Live play:** `stream` in state; each `Flip`/`Run until match` appends a symbol and advances per-gambler KMP cursors held in **refs**; `setState` batched per flip. Cancel rAF on unmount. Reduced motion → render the final ledger from `gamblerLedger()` instantly.
- **a11y / tap:** survivor tap (Beat 8, `mode:"tapSurvivors"`) = **parallel DOM button grid** over the canvas (one per visible gambler, like `StateTapBeat`), graded vs `rows[i].alive`. `role="status"`: "Stopped at flip T=…; survivors at lengths {…} pay Σ = …."
- **Mobile:** window last ~12 columns + pin the stop frame.
- **Schema:** `mode: "watch" | "tapSurvivors" | "batchFairness"`; `scriptedStream` for determinism.
- **Effort L · Risk H.** Biggest surface (incremental per-gambler KMP, animated stacks, survivor grading, fairness meter, windowing). De-risk: ship **scripted-stream** play first; make the fairness meter literally `<SimChart theory={expectedWaitFair(pattern)} .../>`.

### TriangulationStrip — `type: "triangulationStrip"`
- **Reuse:** thin variant of `SimChart` (axis/ticks/theme); `empiricalMean`+`mulberry32` for the sim line.
- **Konva sketch:** props `{ pattern, recurrenceValue, martingaleValue, simRuns, simSeed }` (first two derived). One horizontal axis `0…max(E)+buffer`. Since all three equal E they share one abscissa → stack three labeled markers at small y-offsets: recurrence pin (`C.graphite`), martingale chip (`C.mark`), simulation bead (`C.quill`) crawling from a wrong guess and snapping to the tick.
- **Animation:** sequential `node.to` drops (recurrence → martingale → sim-converge → pulse). Reduced motion: all three at final x; `aria-live` "Recurrence 10, Martingale 10, Simulation 10.02 — match."
- **a11y / tap:** auto-plays on a `Run` press; completable by tapping Continue.
- **Effort S–M · Risk L–M.** Mostly axis reuse; only multi-marker layout is new.

### Schema & engine changes (consolidated)

**New `InteractionSchema` variants** (append to the closed `z.discriminatedUnion('type', […])` in `src/content/schema.ts`; `pattern`/`partner`/`scriptedStream` use `/^[HT]+$/`, optional fields match house style):

```ts
z.object({
  type: z.literal('autocorrelationRuler'),
  pattern: z.string().regex(/^[HT]+$/),
  mode: z.enum(['self', 'cross']),
  partner: z.string().regex(/^[HT]+$/).optional(), // required iff mode==='cross' (enforce in validate-fixtures)
  grade: z.enum(['slideOnly', 'assignPowers']).optional(), // default 'slideOnly'; Beat 5 = 'assignPowers'
}),
z.object({
  type: z.literal('sumTiles'),
  pattern: z.string().regex(/^[HT]+$/),
  base: z.number().int().min(2).optional(), // default 2; dice-66 = 6
}),
z.object({
  type: z.literal('gamblerLedger'),
  pattern: z.string().regex(/^[HT]+$/),
  mode: z.enum(['watch', 'tapSurvivors', 'batchFairness']),
  scriptedStream: z.string().regex(/^[HT]+$/).optional(),
}),
z.object({
  type: z.literal('triangulationStrip'),
  pattern: z.string().regex(/^[HT]+$/),
  simRuns: z.number().int().positive().optional(), // default 500
  simSeed: z.number().int().optional(),
}),
```

**Persistence** (`schema.ts`): add `sumTiles?: z.record(z.string(), z.array(z.string().nullable()))` to `SnapshotSchema.interactionState`, and `sumTiles?: Record<string,(string|null)[]>` to `LessonState` (`beats/types.ts`), keyed by `beatId`. `triangulationStrip`/`gamblerLedger` results reuse existing `theoreticalValue`/`empiricalMean`/`simRuns`/`finalPrediction` in `ProgressDerived` — no new derived fields needed.

**`src/engine/correlation.ts`** (pure, dependency-free; mirrors `automaton.ts`). Needs `prefixFunction` — recommend adding `export` to it in `automaton.ts` (one word, single source of truth) and importing; else duplicate the ~10 lines.

```ts
export function borders(pattern: string): number[]
//   all border lengths incl. ℓ, descending: HHH→[3,2,1], HTH→[3,1], HT→[2]
export function leadingNumber(pattern: string): number
//   Conway leading number = Σ 2^(L-1) over borders = autocorrelation as binary
export function expectedWaitFair(pattern: string, base = 2): number
//   = Σ base^L over borders = 2*leadingNumber when base===2
export function correlation(v: string, w: string = v): {
  bits: number[]      // bits[i]=1 iff length-(ℓ-i) suffix(v) === prefix(w)
  overlaps: number[]  // lengths where bit=1, descending
  value: number       // bits as binary, MSB=full overlap (=== leadingNumber when w===v)
}
export function gamblerLedger(pattern: string, stream: string): {
  rows: Array<{ enter: number; stack: number; alive: boolean; borderLength?: number }>
  stopFlip: number; moneyIn: number; payout: number // payout deterministic === expectedWaitFair(pattern)
}
```

**Golden contract** (`src/engine/correlation.test.ts`):

```ts
const GOLDEN = ['HT','HH','THH','HTH','HHH','HTHT','THTH','HHT','TTTT']
it('closed form === engine recurrence at p=1/2', () => {
  for (const p of GOLDEN)
    expect(expectedWaitFair(p)).toBe(buildAutomaton(p, 0.5).expectedTimes.E0)
})
it('border chain (guards the dropped-border bug)', () => {
  expect(borders('HTH')).toEqual([3,1]); expect(borders('HHH')).toEqual([3,2,1])
})
it('payout is stream-independent and equals E', () => {
  expect(gamblerLedger('HH','TTHTHH').payout).toBe(6)
  expect(gamblerLedger('HH','TTHTHH').rows.filter(r=>r.alive).length).toBe(2)
  expect(gamblerLedger('HT','HHHT').rows.filter(r=>r.alive).length).toBe(1)
})
```

**`scripts/validate-fixtures.ts` new check** — after validating `lesson-overlap-shortcut.json` against `LessonSchema`, gather every `patternOptions` entry plus each beat's `interaction.pattern`/`partner`, and assert for each `p`: `expectedWaitFair(p) === buildAutomaton(p,0.5).expectedTimes.E0`. (The existing `equation-tiles` cross-check is L1-specific — `beats.find(b=>b.beatId==='equation-tiles')` — so guard it by lessonId so L4, which has no equationTiles beat, doesn't trip it.)

### Risks & open questions
1. **Border chain is the lynchpin** (corrected inline). Guarded by the golden test; add a brute-force shift-match cross-check inside `correlation.test.ts`.
2. **`stateTap` cannot be reused** for Beats 5/8 (bound to `automaton.transitions` + StateGraph). Grading folds into the widgets' own types (reassigned inline).
3. **Per-beat `pattern`** is a new convention: widgets compute `buildAutomaton(interaction.pattern,0.5)`/`correlation(interaction.pattern)` locally rather than trust `BeatProps.automaton` (built for one lesson pattern). Confirm `LessonPlayer` still type-checks (set the lesson-level `pattern` to the retrieval set's first entry).
4. **`prefixFunction` is private** in `automaton.ts`; recommend a one-word `export` (vs duplicating) to keep a single source of truth.
5. **Engine is H/T-only**: dice-66 (q=6→42) and ABRACADABRA (q=26) extensions can't be cross-checked by `buildAutomaton`; `expectedWaitFair`/`borders` take a `base`/alphabet so the closed form still self-tests, while the engine-equality golden stays binary.
6. **Widget-heavy, mostly non-equationTiles:** 4 new variants + new Konva files + new engine module + new grader + new persistence — the dominant cost. Build cheapest-first; default to the 10-beat cut.
7. **Fairness-meter framing:** money-out is constant (Σ2^L); only money-in (mean T) converges → draw as flat target + converging curve (`SimChart`). Both correct and cheap.
8. **Open:** does `cross`-mode AutocorrelationRuler belong in L4 at all? Recommend self-only here; wire `cross` when L2 is built.

---

*End of plan — `audits/ideation/plan-L4-overlap-shortcut.md`*
