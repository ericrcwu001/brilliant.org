# Lesson Brief: Stacking Evidence  (lesson-bayes-rule-3)

## Hook  (the bet)

"Yesterday one positive test left you at a nervous **50/50**. Today you take a **second, independent**
99% test — also **positive**. Where does your belief land now?" (And: how many heads in a row would it
take to expose that 1-in-1000 trick coin?)

## Core promise (one idea)

Independent evidence **multiplies**: **today's posterior becomes tomorrow's prior**, so
**posterior odds = prior odds × ∏ likelihood ratios**. Repeated clues compound — a "barely 50/50" can
race to near-certainty, and even a very rare hypothesis is exposed once enough evidence stacks up.

## Display fields

- **glyphKey:** `2ᵏ`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| 1000 coins, 1 double-headed; after **k heads** in a row, P(double-headed \| k H)? | **2ᵏ / (2ᵏ + 999)** | Green Book p.38 §"Conditional Probability and Bayes' Formula" (sequential view of the "Unfair coin" problem) | ☐ engine ☑ source |
| …the **k = 10** value of that sequence (the L2 headline, reached step by step) | **1024/2023 ≈ 0.506** | Green Book p.38 (same problem; 2¹⁰ = 1024) | ☐ engine ☑ source |
| Two coins (fair + two-headed); after **k heads**, P(two-headed \| k H)? | **2ᵏ / (2ᵏ + 1)**  (k=1→2/3, k=2→4/5, k=3→8/9) | Sequential extension of the cited two-coin problem (https://stats.stackexchange.com/questions/514627); engine-verified | ☐ engine ☑ source |
| Disease 1% prior; **two independent** 99%/99% tests, both positive. P(disease \| ++)? | **99/100 (99%)** | https://www.quantblueprint.com/glossary/bayes-theorem (LR = 99 per test; prior odds 1/99 × 99 × 99 = 99) | ☐ engine ☑ source |
| **Mastery (transfer):** smallest k such that the 1-in-1000 coin is **more likely than not** after k heads. | **k = 10**  (2⁹ = 512 < 999 < 1024 = 2¹⁰) | Green Book p.38 (solve 2ᵏ > 999); engine-verified | ☐ engine ☑ source |

> Exact-rational check (Stage 2, `bayes.ts`): sequential 1000-coin posterior =
> (1·1/1000)/(1·1/1000 + (1/2)ᵏ·999/1000) = 2ᵏ/(2ᵏ+999) → k=1: 2/1001, k=5: 32/1031, k=10: 1024/2023.
> Two 99% tests in odds form: prior odds 1/99, LR = 0.99/0.01 = 99; after one → 1/99·99 = 1 (=50%, the
> L2 anchor), after two → 1·99 = 99 → **99/100**. "More likely than not" ⇔ 2ᵏ > 999 ⇔ **k ≥ 10**.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-base-rate` | Recall L2: "one 99% test on a 1% disease → only 50%" (the early win) | retrieval bridge from L2 | "a single positive already settled it" | yes (easy) | both |
| 2 | `open-bet` | Commit a gut answer to the second positive test | sets up compounding | "a second test just re-confirms 50%" | no (`byOption`) | both |
| 3 | `posterior-is-prior` | Name "today's posterior is tomorrow's prior" + independence ⇒ multiply | the chaining rule, JIT | — (JIT primer) | no | A |
| 4 | `due-vs-evidence` | Contrast gambler's-fallacy "never due" vs "each head IS evidence" | interleaving: future-outcome vs hypothesis | "if not 'due,' then heads tell me nothing" | no (`comparison`) | both |
| 5 | `explore-sequence` | Flip the 1000-coin repeatedly; watch the posterior climb 2/1001 → … → 1024/2023 → ~1 | compounding made visible | "belief jumps straight to certain or stays flat" | no (hero) | both |
| 6 | `two-tests` | Compute two independent positives: 1% → 99/100 via odds × LR × LR | likelihood ratios multiply | "two 50%s average to 50%" | yes | both |
| 7 | `coin-ladder` | Match k heads → posterior for the two-coin (2/3, 4/5, 8/9) | the 2ᵏ/(2ᵏ+1) ladder | "each head adds the same fixed amount" | yes | both |
| 8 | `triangulate-k10` | Three lenses (odds doubling / 2ᵏ vs 999 / formula) → crosses ½ at k = 10 | why exactly the 10th head | "it should flip past 50% much sooner" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** smallest k with 2ᵏ > 999 → **10** | transfer + capstone synthesis | "a 1-in-1000 prior needs far more than 10 heads" | yes | both |
| 10 | `recap` | Course capstone recap: posterior odds = prior odds × ∏ likelihood ratios | consolidate the through-line | — | no | both |

Notes: `explore-sequence` uses the new `bayesUpdate` type `display: 'sequence'` (+ `hero` block);
`due-vs-evidence` reuses `primer` with `comparison: true` (the gambler's-fallacy interleave from the
Continuity Report); `two-tests`, `mastery-challenge` reuse `answerEntry`/`masteryChallenge`;
`coin-ladder` reuses `retrievalGrid`; `triangulate-k10` reuses `tripletReveal`; opener reuses
`retrievalGrid`. Include an `interviewNote` (odds-form Bayes / log-likelihood evidence accumulation is
the trading-signal mental model).

## Misconceptions (Specialist)

- **"Two 50%s average to 50%" (or "a second test just re-confirms").** Fires at `open-bet`/`two-tests`.
  Refutation (`byOption`): *"Independent evidence multiplies, it doesn't average. Each positive multiplies
  the odds by the likelihood ratio 99: odds 1/99 → 1 → 99, i.e. 50% → 99%."*
- **"If I'm never 'due' for a head, then heads carry no information" (fallacy/independence confusion).**
  Fires at `due-vs-evidence`. Refutation: *"Two different objects. Given the coin, the next flip is
  independent — you're never 'due.' But the heads you've already seen update **which coin you're holding**.
  Independence of outcomes is exactly why their likelihoods multiply."*
- **"Each head adds a fixed amount to the probability."** Fires at `coin-ladder`/`explore-sequence`.
  Refutation: *"It's multiplicative in odds, not additive in probability: 2/3, 4/5, 8/9 — big early jumps,
  then diminishing as it nears 1."*
- **"A 1-in-1000 prior needs hundreds of heads to overturn."** Fires at `mastery-challenge`. Refutation:
  *"Each head doubles the odds (×2). You only need 2ᵏ > 999 — that's k = 10. Strong evidence compounds fast."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-base-rate` — recalls L2's headline (one 99% test on a 1% disease → 50%)
  (Continuity Report: L2 → L3 opener), the launch point for the second test.
- **guaranteed early win:** `recall-base-rate` (graded recall of L2, not a compounding computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — smallest k with the 1-in-1000
  coin more likely than not → **k = 10**; ties the whole concept together (prior odds, likelihood ratio,
  compounding) and reuses the GB anchor.
- **spacing/interleaving:** `due-vs-evidence` interleaves the **gambler's-fallacy "never due"** primer
  from `lesson-gamblers-ruin` (independence) against Bayesian updating — the corpus's sharpest confusable
  pair; the GB 1000-coins re-surfaces a third time (L2 base-rate snapshot → L3 full sequence), spaced
  across two lessons; exact-fraction/odds answers (2/3, 4/5, 8/9, 99/100, k=10) close the concept's
  fraction-fluency thread that began with PHT's 7/8 and i/N.
