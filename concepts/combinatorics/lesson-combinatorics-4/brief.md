# Lesson Brief: Inclusion–Exclusion  (lesson-combinatorics-4)

## Hook  (the bet)
"How many people do you need in a room before it's *more likely than not* that two share a
birthday? 183? 100? 50?" The answer is a shocking **23** — and the reason is a counting move:
counting the *complement* (everyone distinct) and subtracting overlaps. The bet ("surely you need
hundreds") sets up the lesson's engine — when sets **overlap**, naive addition double-counts, and
you must **subtract the overlap back out**: `|A∪B| = |A| + |B| − |A∩B|`.

## Core promise (one idea)
To count a union of **overlapping** sets you add the parts and **subtract what you double-counted**
— `|A∪B| = |A| + |B| − |A∩B|`, extended to the general signed sum — and this one idea is enough to
count derangements, the birthday surprise, and a poker hand.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `∪`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Birthday problem (the bet): smallest class size with `P(two share a birthday) > 1/2` | **23** (`P(all distinct) = 365·364·⋯·343 / 365²³ < 1/2`) | Green Book p.36 §4.2 "Birthday problem" ("The number is surprisingly small: 23") | ☑ engine ☑ source |
| 5 personalized letters stuffed at random into 5 envelopes: in how many of the `5!` arrangements is **letter #1** correct? (early win sub-count) | `4! = 24` (the other 4 are free) | Green Book p.36 §4.2 (mis-addressed "Application letters" problem) | ☑ engine ☑ source |
| Two-set principle (the core formula; `vennCounter` sandbox) | `|A∪B| = |A| + |B| − |A∩B|` | Green Book p.33 §4.2 ("Inclusion-Exclusion Principle: P(E₁∪E₂) = P(E₁) + P(E₂) − P(E₁E₂)") | ☑ engine ☑ source |
| General signed sum (3+ sets) | `|A∪B∪C| = Σ|Aᵢ| − Σ|Aᵢ∩Aⱼ| + |A∩B∩C|` (alternating) | Green Book p.33 §4.2 (general n-set Inclusion–Exclusion, stated) | ☑ engine ☑ source |
| Derangement: all 5 letters in the **wrong** envelope (worked via Inclusion–Exclusion) | at-least-one-correct `= 5·4! − C(5,2)·3! + C(5,3)·2! − C(5,4)·1! + 1 = 76`; **all-wrong `= 5! − 76 = D₅ = 44`**; `P(all wrong) = 44/120 = 11/30` | Green Book p.36 §4.2 ("This problem is a classic example for the Inclusion-Exclusion Principle") | ☑ engine ☑ source |
| **Poker capstone:** probability of four-of-a-kind in a 5-card hand | count `= 13 × 48 = 624`; total `= C(52,5) = 2,598,960`; `P = 624/2,598,960 = 1/4165` | Green Book p.34 §4.2 "Poker hands" ("13 choices … the 5th card any of the rest 48 … total = C(52,5) = 2,598,960") | ☑ engine ☑ source |

> Every count/fraction is exact-integer reproducible by `src/engine/combinatorics.ts`
> (`factorial`, `nCk`, `inclusionExclusion([...])`): `D₅ = 44`, `11/30`, `624 = 13×48`,
> `C(52,5) = 2,598,960`, `624/2,598,960 = 1/4165`. The birthday `P(distinct)` uses `nPk`/powers and
> the GB-sourced `23` threshold. No `⚠️ NEEDS-WEB-SOURCE` rows — every problem is Green-Book-anchored.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l4-recall` | Retrieval opener: recall **L1** (multiply vs add) and **L2** (`C(52,5) = 2,598,960`) | independent → multiply, mutually-exclusive → add; `nCk` sizes a hand | "add vs multiply" carried forward; "we already know the poker denominator" | yes (light) | both |
| 2 | `l4-bet` | The bet (prediction hook): the birthday surprise | `P(shared birthday)` crosses ½ at just **23** people | **"you need ~half of 365"** — overlaps compound far faster than intuition | no | both |
| 3 | `l4-win` | Guaranteed early win: a clean sub-count | letter #1 correct ⇒ free the other 4 ⇒ `4! = 24` (`answerEntry`) | "fixing one item is hard to count" — refuted; it's just `4!` | yes | both |
| 4 | `l4-explore` | Explore (direct manipulation): feel the double-count | `vennCounter`: drag `|A|`, `|B|`, `|A∩B|`; the overlap region is added twice, so `|A∪B| = |A|+|B|−|A∩B|` updates live | **"|A∪B| = |A| + |B|"** (forgetting to subtract overlap) | no | both |
| 5 | `l4-model` | Model: the general signed sum, applied to derangements | alternating add/subtract; `D₅ = 5! − 76 = 44`, `P(all wrong) = 11/30` | "more sets → just keep adding" — refuted; signs alternate | no | both |
| 6 | `l4-birthday` | Interleave **complement + count→fraction** (continuity: exact-fraction habit) | `P(shared) = 1 − 365·364·⋯·343/365²³`; why "count the opposite" wins | **counting the hard event directly** vs its easy complement | yes (check) | both |
| 7 | `l4-prove` | Prove / mastery challenge (required): the poker capstone | four-of-a-kind `= 13×48 = 624`; `÷ C(52,5)` ⇒ `P = 1/4165` (poker counter) | "four-of-a-kind = 13 (one per rank)" — refuted: each pairs with `48` kickers (multiply), then divide by all hands | yes | both |
| 8 | `l4-recap` | Recap: retrieval-first close + concept capstone | multiply → divide by order → subtract overlaps: the three counting moves; close the Combinatorics arc | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **`|A∪B| = |A|+|B|`** (forget to subtract overlap) → `l4-explore`, `l4-model`, `l4-prove` → Shared members get counted twice → subtract them back: `|A∪B|=|A|+|B|−|A∩B|`.
2. **"More sets → just keep adding"** (signs don't alternate) → `l4-model` → Signs alternate (`+` singles `−` pairs `+` triples…).
3. **Birthday base-rate trap ("need ~half of 365")** → `l4-bet`, `l4-birthday` → You compare every *pair*; 23 people make 253 pairs — enough to pass 50%.
4. **Count the hard event directly** (not its complement) → `l4-birthday` → "At least one shared" is messy; count the easy opposite (all distinct) and subtract from 1.
5. **Add vs multiply / "four-of-a-kind = 13"** → `l4-recall`, `l4-prove` → The rank (13) pairs with any of 48 kickers — multiply (`13×48=624`), then divide by all hands.
6. **"Fixing one item is hard to count"** → `l4-win` → Pin letter #1 and the other four shuffle freely → `4!=24`.

**Per-option feedback** (✓ = `feedback.correct`; ✗ distractor notes → refutational `hints[0]` for `answerEntry`):
- `l4-bet` (prediction, "people needed so two likely share a birthday?"): ✗ "About 183 (half of 365)" → "The 'half of 365' instinct — but you compare every pair, and pairs pile up fast. It tips at 23." · ✗ "About 50" → "Still high — 23 people already make 253 pairs, enough to pass even odds." · ✓ "Just 23" → "Surprising but true — 23 people form 253 pairs, plenty for a likely match."
- `l4-win` (answerEntry, accept `24`): ✓ "Right — 4! = 24; pin letter #1 and the other four shuffle freely." · ✗ `120` → "That's all 5!; fixing letter #1 leaves only the other 4 free → 4! = 24." · ✗ `1` → "Fixing #1 doesn't fix the rest — the remaining four rearrange → 4! = 24."
- `l4-birthday` (check, complement, accept `1 − 365·…·343/365²³`): ✓ "Right — count the easy opposite (all distinct) and subtract from 1: 1−365·364·…·343/365²³." · ✗ "add each pair's chance" → "Pairs overlap, so adding double-counts — flip it: 1 minus P(all distinct)."
- `l4-prove` (mastery, P(four-of-a-kind) accept `1/4165`; count step `624`): ✓ "Exactly — 13 ranks × 48 kickers = 624, over C(52,5)=2,598,960 → 1/4165." · ✗ `13` → "13 picks the rank, but the 5th card is any of 48 others → 13×48 = 624." · ✗ `624` → "That's the *count* of hands; divide by all hands → 624/2,598,960 = 1/4165."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** L1 **multiply-vs-add** AND L2 `C(52,5)=2,598,960` → `l4-recall` (graded `retrievalGrid` matching {independent→multiply, mutually-exclusive→add} and recalling the poker denominator; as the capstone, its opener retrieves across the whole arc — longest spacing gap).
- **guaranteed early win:** `l4-win` — fix letter #1 correct ⇒ free the other 4 ⇒ `4! = 24` (GB p.36); reduces a scary derangement setup to a tiny `4!` owned from L2.
- **mastery challenge (required, before recap):** `l4-prove` — poker four-of-a-kind `= 13×48 = 624`; `÷ C(52,5)=2,598,960 ⇒ P = 1/4165` (GB p.34); certifies the **full toolkit chained**: multiply (13×48) → choose/`nCk` sample space → count→exact fraction.
- **spacing/interleaving:** `l4-recall` re-surfaces **add-vs-multiply** from `l1-multadd` **unlabeled** (longest gap). `l4-birthday` is **complement + count→fraction** (`P(shared)=1−365·364·…·343/365²³`) and is the **course-level unlabeled tool-pick** (a probability question forcing a combinatorics count), mirroring `lesson-states-streaks`; reinforces the exact-fraction habit from `l2-fraction`.
- **mastery signal:** passing `l4-prove` certifies the capstone skill — chaining multiply → choose → exact-fraction on a multi-step real problem. `computeMastered` keys on {`l4-recall`,`l4-win`,`l4-birthday`,`l4-prove`}.
- **graded? per beat:** `l4-recall:yes(light)`, `l4-bet:no`, `l4-win:yes`, `l4-explore:no`, `l4-model:no`, `l4-birthday:yes(check)`, `l4-prove:yes(required)`, `l4-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `l4-recall` must be interaction type `retrievalGrid` (first graded beat = retrieval opener); `l4-prove` must be `masteryChallenge` + `required`, immediately before `l4-recap` (leave `beat.pattern` unset → answer verified by `src/engine/combinatorics.ts`); this lesson needs **≥1 `primer` (e.g. "what a complement / fraction is") + ≥1 Track-A scaffold + ≥1 `interviewNote` (e.g. the `1/4165`)** (Dept 2); register `lesson-combinatorics-1…4` in `MASTERY_LESSONS` + `GATED` in `scripts/validate-fixtures.ts` (Dept 3).
