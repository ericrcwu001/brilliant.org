# Lesson Brief: What is Expected Value?  (lesson-expected-value-1)

## Hook  (the bet)
"You already did this. Back in *Watch the First Heads* you found that the first heads takes **2 flips
on average** — you computed an expected value without ever naming it. Now a casino offers you **one
roll of a fair die**, paid that many dollars. Before computing anything: is a **$3 ticket** to play a
good deal, a bad deal, or exactly fair?" The bet (most learners anchor on "$3 — that's the middle of
1–6") sets up the engine of the whole concept: an average is **not** the middle of the *labels*, it is
the **probability-weighted sum** of the outcomes — `E[X] = Σ x·P(x)` — and for a fair die that is
`7/2 = $3.50`, so the $3 ticket is a steal. The same move that hid inside `E[H] = 2` runs every
expected-value question you will ever meet.

## Core promise (one idea)
Every "what's it worth on average?" question is the **same single move** — list the outcomes, weight
each by its probability, and add (`E[X] = Σ x·P(x)`): the **balance point of the distribution**, not
the midpoint of the labels.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `E[X]`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Retrieval (continuity): flip a fair coin until the first heads — average flips? (recall, not re-derived) | `E[H] = 2` | shipped `lesson-first-heads` (`E[H]=2`); geometric `E = 1/p`, `p = ½` — Green Book p.44 §4.4 Table 4.2 | ☑ source (recall) |
| **The definition** (the model): the weighted average of a discrete random variable | `E[X] = Σ x·P(x)` | Green Book p.44 §4.4 Table 4.2 "Probability mass function, expected value and variance of discrete random variables" | ☑ engine ☑ source |
| **Early win (core mechanic):** one roll of a fair die, paid the face value — expected payoff? | `E = (1+2+3+4+5+6)/6 = 21/6 = 7/2 = $3.50` | Green Book p.62 §5.x DP dice game ("a simple dice game with one roll … 1,2,3,4,5,6 each have 1/6 probability and your expected payoff [is] $3.5") | ☑ engine ☑ source |
| Interleave check (unlabeled count→weight): build a pmf, then average — e.g. two dice, `P(sum=5)` | `P(sum=5) = 4/36 = 1/9` (an unlabeled count of the 4 ways), then a short `Σ x·P(x)` | counting / combinatorics tool-interleave (the `P(x)` weights) + GB p.44 §4.4 definition | ☑ engine ☑ source |
| **Mastery (second rational toy):** sum of two fair dice via the full non-uniform pmf `{2…12}` | `E = Σ x·P(x) = 252/36 = 7` (triangular weights `1,2,3,4,5,6,5,4,3,2,1`/36) | **derived & GB-anchored** — GB p.62 (single die `7/2`) + GB p.47 §4.5 linearity (`7/2+7/2`); pmf weights by counting | ☑ engine ☑ source (derived) |
| Continuous analogue — **conceptual mention ONLY, NEVER graded** | `E[X\|X>0] = √(2/π)` for `X~N(0,1)` — **irrational** | Green Book p.21 §3 (worked integral `∫ x f(x) dx`) | ☑ source · ✗ engine (irrational — never an answer) |

> Every graded number is **exact-rational** and reproduces from the planned pure
> `src/engine/expectation.ts` (`expectedValue(pmf)` over the `Rational` type): fair die `7/2`,
> two-dice `252/36 = 7`, `P(sum=5) = 1/9`. These are the Wave-0 goldens (hand-verified here;
> `expectation.ts` is built in Wave 0). The p.21 `√(2/π)` is the deliberate **counter-example** —
> it shows EV need not be rational — and is shown *conceptually only*, never as a graded answer.
> **No `⚠️ NEEDS-WEB-SOURCE` rows:** the second rational toy (two-dice `E=7`) is cleanly anchored to
> GB p.62 + p.47, so no web source is needed.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `ev1-recall` | Retrieval opener (`retrievalGrid`): recall PHT `E[H]=2` — "you already computed an expected value" | a probability-weighted average was lurking inside `E[H]=2`; we're about to name it | "an average is just the middle of the labels" (carried in from intuition) | yes (light) | both |
| 2 | `ev1-bet` | The bet (`prediction`): is a **$3 ticket** for one fair-die roll good / bad / fair? | the fair price of a bet **is** its expected payoff | **"$3 — the middle of 1–6"** (ignores weighting; misses the half-dollar) | no | both |
| 3 | `ev1-win` | Guaranteed early win (`answerEntry`): one fair-die roll | `E = (1+…+6)/6 = 7/2 = $3.50` — a clean first `Σ x·P(x)` (uniform pmf) | **"the average must be a value you can actually roll"** — refuted (3.5 is unrollable) | yes | both |
| 4 | `ev1-explore` | Explore (`expectationScale`, NEW): the weighted-average balance beam | drag each outcome's weight `P(x)` onto the beam; the fulcrum slides to `E[X]=Σ x·P(x)` — EV as the **balance point** | "equal-looking spacing ⇒ midpoint" — heavier weights pull the fulcrum off-center | no | both |
| 5 | `ev1-model` | Model: formalize the one definition | `E[X]=Σ x·P(x)` (GB p.44); name the continuous analogue `∫ x f(x)dx` and its **irrational** `√(2/π)` as a *concept-only* aside | **"EV is always a 'nice' rational / representable number"** — refuted conceptually | no | both |
| 6 | `ev1-pmf` | Interleave check (`answerEntry`; **unlabeled count→weight**): build a pmf, then average | an unlabeled combinatorics micro-count gives `P(x)` (e.g. two dice `P(sum=5)=4/36`), then `Σ x·P(x)` on a short pmf | **"every outcome is equally likely"** (uniform-pmf trap) — the counts differ | yes (check) | both |
| 7 | `ev1-prove` | Mastery challenge (`masteryChallenge`, REQUIRED): two-dice sum the *hard* way | non-uniform pmf `{2…12}` with triangular weights; `E = Σ x·P(x) = 252/36 = 7` | **"sum-of-two-dice average = 6 (middle of 2–12)"** — the triangular weighting lands it at 7 | yes (required) | both |
| 8 | `ev1-recap` | Recap: retrieval-first close + forward-teaser | the three-step move (list → weight → add); 1-line **variance teaser** (EV = center; spread is the next concept) | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"An average is the middle of the value labels"** → `ev1-recall`, `ev1-bet` → The average weights each outcome by its probability — the *balance point*, not the midpoint of the range.
2. **"E[X] = the most likely outcome"** (mean = mode) → `ev1-bet`, `ev1-explore` → Every outcome contributes in proportion to its probability; the mean can sit where no likeliest value does.
3. **"The average must be an outcome you can actually get"** → `ev1-win`, `ev1-model` → A balance point can fall between outcomes — `3.5` is the die's average though no face reads 3.5.
4. **"Equal-looking spacing ⇒ fulcrum at the midpoint"** → `ev1-explore` → Heavier probability weights pull the balance point toward them.
5. **"Every outcome is equally likely"** (uniform-pmf trap) → `ev1-pmf` → Composite outcomes (a dice-sum) have different counts, so different weights `P(x)`.
6. **"EV is always a 'nice' rational"** → `ev1-model` → The continuous `E[X|X>0]=√(2/π)` is irrational; clean rationals here are a feature of these toys.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]` for answerEntry/masteryChallenge):
- `ev1-bet` (prediction): ✓ "A good deal" → "Good instinct — let's prove it: compute the average payoff and check it beats the $3 ticket." · ✗ "A bad deal" → "Let's test it — if the average payoff tops $3, the ticket's a bargain. Let's compute it." · ✗ "Exactly fair" → "Let's test it — '$3 is the middle of 1–6' skips the weighting; the balance point sits a half-dollar higher."
- `ev1-win` (answerEntry, accept `7/2`): ✗ `hints[0]` → "The average needn't be rollable. Sum 1+…+6 = 21, divide by 6 → 3.5."
- `ev1-pmf` (check): ✗ `hints[0]` → "The eleven sums aren't equally likely. Count the ways each sum happens, then weight by those counts."
- `ev1-prove` (mastery, accept `7`): ✗ `hints[0]` → "Eyeballing the middle gives 6, but the weights peak at 7. Sum x·P(x) over the triangular pmf."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** PHT `E[H]=2` (`lesson-first-heads`) → `ev1-recall` (graded `retrievalGrid` matching {"flip till first H" → `E[H]=2`}, then reveal it was an `E[X]=Σ x·P(x)` all along — GB p.44). Reuse-as-recall; never re-derive the geometric series.
- **guaranteed early win:** `ev1-win` — one fair-die roll `E=21/6=7/2=$3.50` (GB p.62); a clean uniform `Σ x·P(x)`, hand-verifiable. Refutes "the average must be rollable."
- **mastery challenge (required, before recap):** `ev1-prove` — two-dice sum the hard way: non-uniform pmf `{2…12}` (triangular weights) ⇒ `E=252/36=7` (GB p.62 + p.47). Certifies the one move generalizes from a uniform to a non-uniform pmf.
- **spacing/interleaving:** `ev1-pmf` is the **unlabeled count→weight** tool-interleave (combinatorics): `P(sum=5)=4/36=1/9` then a short `Σ x·P(x)` (mirrors `lesson-states-streaks`; tool-interleave 1 of 3). The weighted-average definition re-surfaces in every later lesson; the `E=7` re-surfaces immediately at `ev2-win`.
- **mastery signal:** first-try, zero-hint on `ev1-prove` certifies "list → weight → add" (uniform *and* non-uniform pmfs). `computeMastered` keys on {`ev1-recall`,`ev1-win`,`ev1-pmf`,`ev1-prove`}.
- **graded? per beat:** `ev1-recall:yes(light)`, `ev1-bet:no`, `ev1-win:yes`, `ev1-explore:no`, `ev1-model:no`, `ev1-pmf:yes(check)`, `ev1-prove:yes(required)`, `ev1-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `ev1-recall` must be interaction type `retrievalGrid` (first graded beat = retrieval opener); `ev1-prove` must be `masteryChallenge` + `required`, immediately before `ev1-recap`, with **`beat.pattern` unset** → the answer is verified by `src/engine/expectation.ts` (`expectedValue`: two-dice `252/36=7`, die `7/2`, `P(sum=5)=1/9`), NOT `buildAutomaton`. Needs **≥1 `primer` + ≥1 Track-A scaffold + ≥1 `interviewNote` (e.g. the `$3.50` fair price / the `√(2/π)` "EV need not be rational" aside)** (Dept 2). Register `lesson-expected-value-1…6` in `MASTERY_LESSONS` + the inclusivity `GATED` set in `scripts/validate-fixtures.ts` (Dept 3) or the gates never fire.
