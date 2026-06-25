# Lesson Brief: Permutations & Combinations  (lesson-combinatorics-2)

## Hook  (the bet)
"From 5 candidates you pick 3. **Case A:** they become President, VP, and Treasurer. **Case B:**
they're just '3 people on a committee.' Same number of ways — or different?" Most learners say
*same* (or can't say why they'd differ). They differ by a factor of `3!`: the ordered count is
`nPk(5,3) = 60`, the unordered count is `nCk(5,3) = 10`. The bet exposes the single decision the
whole lesson turns on — **does order matter?** — and shows the answer is the *same selection*,
just `×k!` apart.

## Core promise (one idea)
Selecting `k` from `n` has **two** answers depending on whether order matters: ordered selection
`nPk = n!/(n−k)!`, and unordered selection `nCk = n!/(k!(n−k)!) = nPk / k!` — so deciding "does
order matter?" *is* the whole game, and dividing a count by a count turns it into an exact fraction.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `(n k)`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| 3 distinct dice values — in how many **orders** can they appear? (the denominator behind the dice problem) | `3! = 6` | Green Book p.40 §4.2 "Dice order" ("one specific sequence out of all possible permutations … 1/3! = 1/6") | ☑ engine ☑ source |
| Throw 3 dice — probability they come up in **strictly increasing** order (count → exact fraction) | ordering factor `= 1/3! = 1/6`; full `P = C(6,3)/6³ = 20/216 = 5/54` | Green Book p.40 §4.2 "Dice order" | ☑ engine ☑ source |
| Ordered selection: arrange `k` of `n` distinct objects (e.g. seat 3 of 5 in ranked slots) | `nPk = n!/(n−k)!` (`nPk(5,3) = 5·4·3 = 60`) | Green Book p.33–34 §4.2 (Permutation property) | ☑ engine ☑ source |
| Unordered selection: choose `k` of `n` (committee) | `nCk = n!/(k!(n−k)!)` (`nCk(5,3) = 10`; note `60/3! = 10`) | Green Book p.33 §4.2 (Combination property: "there are `C(n,k)` combinations of `n` objects taken `k` at a time") | ☑ engine ☑ source |
| How many distinct 5-card poker hands from a 52-card deck? (headline unordered count) | `C(52,5) = 2,598,960` | Green Book p.34 §4.2 "Poker hands" ("number of 5-element subsets of a 52-element set = C(52,5) = 2,598,960") | ☑ engine ☑ source |
| Deal 52 cards to 4 players (13 each); count the ways to place the **4 aces into the 4 distinct piles** (mastery transfer) | `4! = 24` arrangements | Green Book p.42 §4.2 ("we can distribute the aces first, which has 4! ways") | ☑ engine ☑ source |
| Enrichment callback: shuffle a 52-card deck so every order is equally likely — how many orders? | `n! = 52!` equally-likely orderings | Green Book p.89 §5 "Random permutation" / Knuth (Fisher–Yates) shuffle ("every possible order out of `n!` … is equally likely") | ☑ source |

> Every count is an exact integer/fraction reproducible by `src/engine/combinatorics.ts`
> (`factorial`, `nPk`, `nCk`); `5/54 = nCk(6,3)/6³` and `nCk(5,3) = nPk(5,3)/3!` are the two-stage
> fact-check anchors. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l2-recall` | Retrieval opener: recall **L1** (multiplication rule & `n!`) | "arranging `n` distinct things `= n!`" — quick `4! = 24` | "factorials were a one-off" — refuted; they're the backbone of `nPk` | yes (light) | both |
| 2 | `l2-bet` | The bet (prediction hook): does order change the count? | President/VP/Treasurer vs committee from 5 pick 3 | **"ordered = unordered"** (the central trap) | no | both |
| 3 | `l2-win` | Guaranteed early win: an **ordered** count via shrinking choices | `nPk(5,3) = 5·4·3 = 60` (`answerEntry`/`selectionGrid` ordered) | "I must list arrangements" — refuted by the product | yes | both |
| 4 | `l2-explore` | Explore (direct manipulation): toggle **order on/off** on the same selection | `selectionGrid` with order toggle: order-ON counts sequences (`nPk`), order-OFF counts sets (`nCk`); the gap is exactly `×k!` | "removing order changes *which* items, not just the count" — refuted live | no | both |
| 5 | `l2-model` | Model: formalize both formulas and their link | `nPk = n!/(n−k)!`, `nCk = nPk/k! = n!/(k!(n−k)!)`; headline `C(52,5) = 2,598,960` | "`nCk` is unrelated to `nPk`" — refuted (`nCk = nPk/k!`) | no | both |
| 6 | `l2-fraction` | Interleave **count → exact fraction** (continuity: exact-fraction habit) | dice strictly-increasing: `1` good order out of `3! = 6` ⇒ `1/3! = 1/6`; full `20/216 = 5/54` | **order vs unordered inside a probability** (when to divide by `k!`) | yes (check) | both |
| 7 | `l2-prove` | Prove / mastery challenge (required): apply an ordered count to a real deal | place 4 aces into 4 distinct piles `= 4! = 24` (GB p.42) | "the 4 identical-rank aces give 1 way" — refuted: the **piles** are distinct, so order matters → `4!` | yes | both |
| 8 | `l2-recap` | Recap: retrieval-first close + bridge to coefficients | "order matters → `nPk`; order doesn't → `nCk`"; enrichment: `52!` shuffle orders (p.89); bridge: "these `nCk` are the binomial coefficients (L3)" | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **Order-matters confusion / "ordered = unordered"** (central trap) → `l2-bet`, `l2-explore`, `l2-win`, `l2-prove` → The *same* selection counts `k!` times more when order matters: ordered `=` unordered `×k!`.
2. **`nCk` vs `nᵏ` vs `n·k` / with-vs-without replacement** → `l2-win` → A chosen person can't be reused → shrinking product `5·4·3=60`, not `5³` or `5×3`.
3. **Forgetting to divide by `k!`** (double-counting orderings) → `l2-explore`, `l2-fraction` → `nCk = nPk/k!`; dividing by `k!` removes the `k!` re-orderings of each set.
4. **Dividing by `k` instead of `k!`** (in a probability) → `l2-fraction` → 3 values have `3!=6` orderings, only 1 increasing → `1/3!=1/6`, not `1/3`.
5. **"Identical items → 1 way"** (destinations are distinct) → `l2-prove` → The 4 piles are distinct slots, so the 4 aces arrange `4!=24` ways.

**Per-option feedback** (✓ = `feedback.correct`; ✗ distractor notes → refutational `hints[0]` for `answerEntry`):
- `l2-bet` (prediction): ✗ "Same number of ways" → "The classic trap — roles make order matter, so ranked slots count k!=6× more than a committee." · ✓ "Different — the roles version is bigger" → "Right — ranked roles distinguish orderings: 60 ordered vs 10 unordered, ×3! apart." · ✗ "Different — the committee is bigger" → "They differ, but adding order can only *raise* the count: 60 ordered > 10 unordered."
- `l2-win` (answerEntry, accept `60`): ✓ "Yes — 5·4·3 = 60; ranked slots mean order matters, each pick shrinks the pool." · ✗ `125` → "That's 5³ (reusing people); they can't repeat → 5·4·3 = 60." · ✗ `10` → "That's the *unordered* C(5,3); ranked slots make order matter → ×3! = 60." · ✗ `15` → "Not 5×3 — multiply the shrinking choices 5·4·3 = 60."
- `l2-fraction` (check, accept `1/6` then `5/54`): ✓ "Right — only 1 of 3!=6 orderings is increasing → 1/6; full P = 20/216 = 5/54." · ✗ `1/3` → "You divided by k, not k! — three values have 3!=6 orderings, 1 increasing → 1/6." · ✗ `1/2` → "Order isn't 50/50 — three values have 6 equally likely orders → 1/6."
- `l2-prove` (mastery, accept `24`): ✓ "Exactly — 4! = 24; the piles are distinct destinations, so the aces' order matters." · ✗ `1` → "The aces look identical, but the four piles are distinct → 4! = 24." · ✗ `16` → "Not 4² — each ace lands in a different pile → 4·3·2·1 = 24." · ✗ `256` → "That's 4⁴ (reusing piles); each pile gets one ace → 4! = 24."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** L1's multiplication rule & `n!` → `l2-recall` (graded `retrievalGrid` matching {3!,4!,5!} → {6,24,120}; spaced re-surfacing of L1, primes `nPk` as a shrinking product).
- **guaranteed early win:** `l2-win` — ordered `nPk(5,3) = 5·4·3 = 60`; the just-recalled shrinking-product rule with small numbers, *before* the `nCk` complication lands.
- **mastery challenge (required, before recap):** `l2-prove` — four aces into **4 distinct piles** `= 4! = 24` (GB p.42), then turn the count into an exact fraction; certifies "**does order matter?**" recognition in disguise (identical-rank aces, distinct piles).
- **spacing/interleaving:** `l2-explore` is the **nPk-vs-nCk** confusable pair — an order on/off toggle on the *same* selection forces the discrimination **unlabeled** (`×k!` apart), mirroring `lesson-states-streaks`; assessed at `l2-fraction`/`l2-prove`. `l2-fraction` is the **count→exact-fraction** bridge (`1/3!=1/6`; `20/216=5/54`), retrieving the prior course's exact-fraction habit and re-surfacing at L4.
- **mastery signal:** passing `l2-prove` certifies the central L2 decision — pick `nPk` vs `nCk` in a novel framing *and* convert count→exact fraction. `computeMastered` keys on {`l2-recall`,`l2-win`,`l2-fraction`,`l2-prove`}.
- **graded? per beat:** `l2-recall:yes(light)`, `l2-bet:no`, `l2-win:yes`, `l2-explore:no`, `l2-model:no`, `l2-fraction:yes(check)`, `l2-prove:yes(required)`, `l2-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `l2-recall` must be interaction type `retrievalGrid` (first graded beat = retrieval opener); `l2-prove` must be `masteryChallenge` + `required`, immediately before `l2-recap` (leave `beat.pattern` unset → answer verified by `src/engine/combinatorics.ts`); this lesson needs **≥1 `primer` (e.g. "what `n!` / a fraction is") + ≥1 Track-A scaffold + ≥1 `interviewNote` (e.g. the `52!` shuffle / poker)** (Dept 2); register `lesson-combinatorics-1…4` in `MASTERY_LESSONS` + `GATED` in `scripts/validate-fixtures.ts` (Dept 3).
