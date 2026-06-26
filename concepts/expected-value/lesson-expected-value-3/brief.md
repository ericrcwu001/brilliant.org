# Lesson Brief: Indicator Variables  (lesson-expected-value-3)

## Hook  (the bet)
"Shuffle a standard 52-card deck and flip cards one at a time. How deep do you expect to dig before
the **first ace** turns up — about halfway, at the 26th card?" The bet (most learners say "around 26
— an ace is rare, so it takes a while") is off by more than half: the answer is `53/5 = 10.6`. The
trick that gets there with **no messy sum** is the humblest object in probability — the **indicator
variable**, a 0/1 switch that is `1` when an event happens. Its expected value is just the event's
probability (`E[1_A] = P(A)`), so a *count* becomes a *sum of probabilities* you already know how to
compute.

## Core promise (one idea)
A 0/1 **indicator's expected value is exactly the event's probability** — `E[1_A] = P(A)` — so any
"how many … on average?" count collapses to `1 + Σ E[I_i]`, a sum of plain probabilities.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `𝟙ₐ`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Retrieval (continuity): probabilities you already computed — gambler's-ruin `P(win)`, a streak `P`, a counted `P` (recall, not re-derived) | `i/N`, `7/8`, `favorable/total` — each is secretly `E[1_A]` | shipped `lesson-gamblers-ruin` (`i/N`), PHT streaks (`7/8`), `lesson-combinatorics-6` (`favorable/total`) | ☑ source (recall) |
| **The definition** (the model): the expected value of a 0/1 indicator | `E[1_A] = P(A)` (the mean of a binary dummy is the event's probability) | Green Book p.31 §2.7 "indicator variable (a binary dummy) … expected value of `1_A` is `P(A)`" | ☑ engine ☑ source |
| **Early win:** draw one card — indicator that it's an ace | `E[1_ace] = P(ace) = 4/52 = 1/13` | Green Book p.31 §2.7 (indicator `E[1_A]=P(A)`) | ☑ engine ☑ source |
| Interleave check (count → sum of indicators): after **m = 2** draws from **N = 6** coupon types, expected **distinct** types | `E[distinct] = N(1 − ((N−1)/N)^m) = 6(1 − (5/6)^2) = 6·11/36 = 11/6` | Green Book p.49–50 §4.5 *Coupon collection* part B (indicators `E[I_i]=1−((N−1)/N)^m`) | ☑ engine ☑ source |
| **Mastery (core mechanic):** cards turned to the **first ace**, via indicators | `E = 1 + Σ_{i=1}^{48} E[I_i] = 1 + 48·(1/5) = 53/5 = 10.6`; each non-ace precedes all 4 aces w.p. `1/5` | Green Book p.48 §4.5 *Card game / first ace* (each card in one of 5 regions ⇒ `E[X_i]=1/5`) + p.31 (`E[1_A]=P(A)`) | ☑ engine ☑ source |

> Exact-rational, reproduced by `src/engine/expectation.ts` (`indicatorExpectation(p)`,
> `distinctAfterDraws(N,m)`, `expectedValue`): `1/13`, `11/6`, first-ace `53/5`. Wave-0 goldens,
> hand-verified here. L3 **completes** the first-ace story L2 started: L2 used linearity to say the
> total is a *sum* `1 + Σ X_i`; L3 supplies the missing **why each piece `= 1/5`** via `E[1_A]=P(A)`.
> The coupon part-B indicator count is the bridge into L5. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `ev3-recall` | Retrieval opener (`retrievalGrid`): recall probabilities already computed (`i/N`, `7/8`, `favorable/total`) | each probability you've computed **is** the expected value of a 0/1 indicator | "probability and expectation are different machines" — they're the same for a 0/1 variable | yes (light) | both |
| 2 | `ev3-bet` | The bet (`prediction`): how deep to the **first ace** — ~26? | a "count until" question is an expectation in disguise | **"~26 (halfway) — aces are rare"** — the first ace comes far sooner (`10.6`) | no | both |
| 3 | `ev3-win` | Guaranteed early win (`answerEntry`): indicator that a drawn card is an ace | `E[1_ace] = P(ace) = 4/52 = 1/13` — the definition in one step | **"expected value needs many outcomes / a long sum"** — a 0/1 variable's mean is just `P` | yes | both |
| 4 | `ev3-explore` | Explore (direct manipulation, `dice` viz): toggle an indicator across trials | flip the 0/1 switch over many draws; its running average settles to `P(A)` | "averaging 0s and 1s gives something other than the hit-rate" — it *is* the hit-rate | no | both |
| 5 | `ev3-model` | Model: formalize the trick | `E[1_A]=P(A)` (GB p.31); a count `= Σ` indicators `⇒ E[count] = Σ E[I_i] = Σ P(A_i)` (linearity from L2) | **"you can only add indicators if the events are independent"** — refuted (linearity, L2) | no | both |
| 6 | `ev3-count` | Interleave check (`answerEntry`): distinct coupon types after `m=2` of `N=6` | count distinct via indicators `I_i` = "type i seen"; `E = 6(1−(5/6)^2) = 11/6` | **"distinct types after 2 draws = 2"** — collisions are possible, so it's below 2 | yes (check) | both |
| 7 | `ev3-prove` | Mastery challenge (`masteryChallenge`, REQUIRED): first ace via indicators | `E = 1 + 48·(1/5) = 53/5`; each non-ace precedes all 4 aces w.p. `1/5` (5 equal gaps) | **"each non-ace adds a full card to the wait"** — it adds only its `1/5` chance of being early | yes (required) | both |
| 8 | `ev3-recap` | Recap: retrieval-first close | indicators are the bridge **probability → expectation**; sets up L5 (a full set = a sum of waits) | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"Probability and expectation are different machines"** → `ev3-recall`, `ev3-win` → For a 0/1 indicator they coincide: `E[1_A]=P(A)`.
2. **"An indicator's expectation is more than `P(A)`"** → `ev3-win` → Its only nonzero value is 1, taken w.p. `P(A)`, so its mean is just `P(A)`.
3. **"First ace sits ~card 26 (halfway)"** → `ev3-bet` → Four aces cut the deck into five equal gaps → first ace averages `53/5≈10.6`.
4. **"A count can't become an expectation"** → `ev3-model`, `ev3-prove` → Any count is a sum of 0/1 indicators → its expectation is the sum of their probabilities.
5. **"Can only add indicators if events are independent"** → `ev3-model`, `ev3-count` → Linearity adds expectations regardless of dependence.
6. **"Distinct types after 2 draws = 2"** → `ev3-count` → The draws can repeat a type → expected distinct `< 2` (here `11/6`).

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `ev3-bet` (prediction): ✗ "Around card 26" → "Let's test it — 'halfway' assumes one ace, but four aces split the deck, pulling the first one much earlier." · ✗ "Around card 13" → "Let's test it — warmer; four aces make five equal gaps, so the first ace averages near card 11." · ✓ "Around card 10" → "Good instinct — let's prove it: five equal gaps from four aces put the first ace near 10.6."
- `ev3-win` (answerEntry, accept `1/13`): ✗ `hints[0]` → "A 0/1 variable needs no long sum. Its mean is just P(ace)=4/52=1/13."
- `ev3-count` (check, accept `11/6`): ✗ `hints[0]` → "The two draws might repeat a type. Sum each type's chance of appearing: 6(1−(5/6)²)=11/6."
- `ev3-prove` (mastery, accept `53/5`): ✗ `hints[0]` → "Each non-ace adds only its 1/5 chance of preceding every ace, not a full card. That gives 53/5."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** the exact probabilities already computed — `i/N`, `7/8`, `favorable/total` (`lesson-gamblers-ruin`, PHT streaks, `lesson-combinatorics-6`) → `ev3-recall` (graded `retrievalGrid`; each is secretly `E[1_A]` — GB p.31).
- **guaranteed early win:** `ev3-win` — draw one card, indicator it's an ace: `E[1_ace]=P(ace)=4/52=1/13` (GB p.31); the definition in one step. Refutes "EV needs a long sum."
- **mastery challenge (required, before recap):** `ev3-prove` — first ace via indicators `E=1+48·(1/5)=53/5=10.6`; each non-ace precedes all 4 aces w.p. `1/5` (5 equal gaps) — GB p.48 + p.31. Certifies `1 + Σ E[I_i]`.
- **spacing/interleaving:** linearity from L2 re-surfaces as "a count = `Σ` indicators ⇒ `E[count]=Σ E[I_i]`" (`ev3-model`). `ev3-count` is the coupon distinct-after-`m=2`-of-`N=6` check (`11/6`) — bridges forward into L5 (same coupon problem from the other side). L3 completes the first-ace story L2 started (supplies *why each piece = 1/5*).
- **mastery signal:** first-try, zero-hint on `ev3-prove` certifies the indicator bridge (probability → expectation) and that indicators add without independence. `computeMastered` keys on {`ev3-recall`,`ev3-win`,`ev3-count`,`ev3-prove`}.
- **graded? per beat:** `ev3-recall:yes(light)`, `ev3-bet:no`, `ev3-win:yes`, `ev3-explore:no`, `ev3-model:no`, `ev3-count:yes(check)`, `ev3-prove:yes(required)`, `ev3-recap:no`.
- **gate/DoR notes:** `ev3-recall` = `retrievalGrid` (first graded); `ev3-prove` = `masteryChallenge` + `required` before `ev3-recap`, **`beat.pattern` unset** → verified by `src/engine/expectation.ts` (`indicatorExpectation`, `distinctAfterDraws(6,2)=11/6`, first-ace `53/5`; win `1/13`). Needs **≥1 `primer` (what a 0/1 indicator is) + ≥1 Track-A scaffold + ≥1 `interviewNote` (the 5-equal-gaps argument)** (Dept 2). Register `lesson-expected-value-1…6` in `MASTERY_LESSONS` + `GATED` (Dept 3).
