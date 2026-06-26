# Lesson Brief: Coupon Collector  (lesson-expected-value-5)

## Hook  (the bet)
"A cereal brand hides one of **6** equally likely toys in every box. You want the whole set. How many
boxes do you expect to buy — six? eight? a dozen?" The bet (most learners guess "a few more than 6")
under-counts badly: the answer is `147/10 = 14.7`. The reason is the engine of this lesson — collecting
a full set is a **sum of waits**, and each new type is *harder to find than the last*. The first toy is
free, but the final missing one shows up only `1/6` of the time, so you wait `6` boxes for it alone.
Add up the geometric waits (`E = 1/p` each, recalled from PHT) and you get `N·H_N`.

## Core promise (one idea)
A full collection is a **sum of geometric waits** — each new type has hit-probability `(N−k)/N`, so it
costs `N/(N−k)` boxes on average — and summing them gives `E[full set] = N·H_N`.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `N·Hₙ`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Retrieval (continuity): expected trials to the first success of a `p`-coin (recall, not re-derived) | geometric `E = 1/p` (`E[H]=2` was `p=½`) | shipped `lesson-first-heads` (`E[H]=2`); GB p.44 §4.4 Table 4.2 geometric `E=1/p` | ☑ source (recall) |
| **The definition** (the model): expected boxes for a complete set of `N` types | `E[full set] = Σ_{i=1}^{N} N/(N−i+1) = N·H_N` | Green Book p.49–50 §4.5 *Coupon collection* (each new type is geometric, `p=(N−i+1)/N`, `E[X_i]=N/(N−i+1)`) | ☑ engine ☑ source |
| **Early win:** you hold 5 of the 6 types — expected boxes for the **last** one | `p = 1/6 ⇒ E = 1/p = 6` | Green Book p.49–50 §4.5 (last stage `E[X_N] = N/1 = N`) | ☑ engine ☑ source |
| Interleave check (**unlabeled count→weight**): you hold 2 of 6 — expected boxes for the **next new** type | new-type count `= 4 of 6 ⇒ p = 4/6 = 2/3`, so `E = N/(N−k) = 6/4 = 3/2` | Green Book p.49–50 §4.5 (`E[X_i]=N/(N−i+1)`); per-stage `(N−k)/N` weight by counting | ☑ engine ☑ source |
| **Mastery (core mechanic):** full set of **N = 6** | `E = 6·H_6 = 6·(49/20) = 147/10 = 14.7` | Green Book p.49–50 §4.5 *Coupon collection* part A (`N·H_N`) | ☑ engine ☑ source |

> Exact-rational, reproduced by `src/engine/expectation.ts` (`harmonic(n)`, `couponCollector(n)=n·H_n`,
> `expectedValue`): last-type `6`, next-of-2 `3/2`, full set `147/10` (`H_6 = 49/20`). Wave-0 goldens,
> hand-verified here. L5 is the **spaced payoff of L2 + L3**: a full set is a *sum* (linearity, L2) of
> *geometric waits* whose stage probabilities are *counts* (the count→weight tool); part B's distinct
> count (L3 indicators) is the same problem from the other side. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `ev5-recall` | Retrieval opener (`retrievalGrid`): recall geometric wait `E = 1/p` + counting | a "wait for one success" costs `1/p`; a full set chains several such waits | "each type takes the same number of boxes" — later types are rarer | yes (light) | both |
| 2 | `ev5-bet` | The bet (`prediction`): boxes to collect all 6 toys — ~6? ~8? | the **last** few types dominate the cost | **"a bit more than 6"** — the tail (rare last types) more than doubles it | no | both |
| 3 | `ev5-win` | Guaranteed early win (`answerEntry`): the final missing type | `p = 1/6 ⇒ E = 6` — one geometric wait, straight from PHT | **"the last type is as quick as the first"** — it's the slowest (`6` vs `1`) | yes | both |
| 4 | `ev5-explore` | Explore (`couponCollectorSim`, NEW): draw boxes until complete | watch the running `Σ N/(N−i+1)` climb as the per-stage hit-prob `(N−k)/N` shrinks toward `1/6` | "progress is steady" — the simulated wait visibly stalls near the end | no | both |
| 5 | `ev5-model` | Model: formalize the sum | `E[full set] = Σ N/(N−i+1) = N·H_N` (GB p.49–50) — linearity (L2) over geometric waits | **"`E[full set]` ≈ `N` (one box per type)"** — refuted; rarity inflates each later wait | no | both |
| 6 | `ev5-stage` | Interleave check (`answerEntry`; **unlabeled count→weight**): expected boxes for the next new type when holding 2 of 6 | count new types `= 4/6 ⇒ p = 2/3 ⇒ E = 3/2` | **"prob a box is new = 1/6 regardless"** — it's `(N−k)/N`, falling as you collect | yes (check) | both |
| 7 | `ev5-prove` | Mastery challenge (`masteryChallenge`, REQUIRED): the full `N=6` set | `E = 6·H_6 = 6·(49/20) = 147/10 = 14.7` | **"double the types ⇒ double the boxes"** — it grows like `N·ln N`, faster than linear | yes (required) | both |
| 8 | `ev5-recap` | Recap: retrieval-first close | "a collection = a sum of ever-longer waits"; sets up L6 (extremes of many draws) | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"A full set costs ~`N` boxes (one per type)"** → `ev5-bet`, `ev5-model` → Later types are rare → total `N·H_N` (≈14.7 for N=6), not `N`.
2. **"Each new type takes the same number of boxes"** → `ev5-recall`, `ev5-win` → The first is near-instant; the last averages `N` boxes.
3. **"The last type is as quick as the first"** → `ev5-win` → Only 1 of 6 boxes helps at the end → last averages `6` vs `1`.
4. **"The chance a box is new stays 1/6"** → `ev5-stage` → It's `(N−k)/N`, falling as you collect; holding 2 of 6, a new type hits w.p. `4/6`.
5. **"A collection isn't a sum of waits"** → `ev5-model` → It's exactly a sum of geometric waits, each `N/(N−k)`, added by linearity.
6. **"Double the types ⇒ double the boxes"** → `ev5-prove` → Cost grows like `N·ln N`, faster than linear.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `ev5-bet` (prediction): ✗ "Just over 6" → "Let's test it — the first toys come fast, but the last ones drag, more than doubling the total." · ✗ "About 8" → "Let's test it — closer, but the rare final toys push it higher." · ✓ "Around 12–15" → "Good instinct — let's prove it by summing the ever-longer waits for each new toy."
- `ev5-win` (answerEntry, accept `6`): ✗ `hints[0]` → "Only 1 of 6 boxes now helps, so the last type isn't quick: E=1/p=6."
- `ev5-stage` (check, accept `3/2`): ✗ `hints[0]` → "With 2 types held, 4 of 6 boxes are new, so p=4/6 and E=3/2."
- `ev5-prove` (mastery, accept `147/10`): ✗ `hints[0]` → "Cost grows like N·ln N, not linearly. Sum the six waits: 6·H₆=6·(49/20)=147/10."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** geometric wait `E=1/p` (`lesson-first-heads`; `E[H]=2` was `p=½`) → `ev5-recall` (graded `retrievalGrid` matching {"wait for one success at rate `p`" → `1/p`}; a full set chains several such waits — GB p.44).
- **guaranteed early win:** `ev5-win` — the final missing type `p=1/6 ⇒ E=1/p=6` (GB p.49–50); one geometric wait, straight from PHT. Refutes "the last type is as quick as the first."
- **mastery challenge (required, before recap):** `ev5-prove` — the full `N=6` set `E=6·H_6=6·(49/20)=147/10=14.7` (GB p.49–50). Certifies "a collection = a sum of ever-longer waits, `N·H_N`."
- **spacing/interleaving:** `ev5-stage` is the **unlabeled count→weight** tool-interleave: hold 2 of 6 ⇒ new-type count `=4/6 ⇒ p=2/3 ⇒ E=N/(N−k)=3/2` (tool-interleave 2 of 3; mirrors `lesson-states-streaks`). L5 is the spaced payoff of **L2** (linearity sum) + **L3** (the coupon indicator from the other side). Geometric `1/p` recalled from PHT.
- **mastery signal:** first-try, zero-hint on `ev5-prove` certifies chaining geometric waits via linearity (later types dominate; growth `~N ln N`). `computeMastered` keys on {`ev5-recall`,`ev5-win`,`ev5-stage`,`ev5-prove`}.
- **graded? per beat:** `ev5-recall:yes(light)`, `ev5-bet:no`, `ev5-win:yes`, `ev5-explore:no`, `ev5-model:no`, `ev5-stage:yes(check)`, `ev5-prove:yes(required)`, `ev5-recap:no`.
- **gate/DoR notes:** `ev5-recall` = `retrievalGrid` (first graded); `ev5-prove` = `masteryChallenge` + `required` before `ev5-recap`, **`beat.pattern` unset** → verified by `src/engine/expectation.ts` (`harmonic(6)=49/20`, `couponCollector(6)=147/10`; next-of-2 `3/2`, last `6`). Needs **≥1 `primer` + ≥1 Track-A scaffold + ≥1 `interviewNote` (the `N·H_N ~ N ln N` tail — the rare last type alone costs `N` boxes)** (Dept 2). Register `lesson-expected-value-1…6` in `MASTERY_LESSONS` + `GATED` (Dept 3).
