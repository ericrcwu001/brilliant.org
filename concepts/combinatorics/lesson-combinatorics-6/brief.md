# Lesson Brief: Counting Probabilities  (lesson-combinatorics-6)

## Hook  (the bet)
"Back in L4 you counted **624** four-of-a-kind hands. Now, gut-check only: rank three hands from
*rarest* to *most common* — **four-of-a-kind, full house, two pairs**." Most people rank by how
*fancy* a hand feels and get it backwards. The reveal is cleaner than any hunch: divide each count
by the `C(52,5) = 2,598,960` total hands and every probability lands over the **same denominator,
4165** — four-of-a-kind `1/4165`, full house `6/4165`, two pairs `198/4165`. The bet ("I can feel
which is rarer") sets up the engine: `P(event) = favorable count / total count` turns a vague
"rarer" into an exact, rankable fraction.

## Core promise (one idea)
When every outcome is equally likely, `P(event) = favorable count ÷ total count` — so the counting
you already know *is* the probability engine. Divide one count by another and "how many" becomes
"how likely," precise enough to **rank** events.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `k/N`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Total distinct 5-card hands (the denominator) | `C(52,5) = 2,598,960` | Green Book p.34 §4.2 "Poker hands" ("total number of hands = C(52,5) = 2,598,960") | ☑ engine ☑ source |
| **Four-of-a-kind** (retrieval from L4): probability in a 5-card hand | count `13 × 48 = 624`; `P = 624 / 2,598,960 = 1/4165` | Green Book p.34 §4.2 ("13 choices … the 5th card can be any of the rest 48 cards") | ☑ engine ☑ source |
| **Full house**: probability in a 5-card hand | count `13 · C(4,3) · 12 · C(4,2) = 13·4·12·6 = 3744`; `P = 3744 / 2,598,960 = 6/4165` | Green Book p.34 §4.2 (prints the formula: triple value `13`, triple suits `C(4,3)`, pair value `12`, pair suits `C(4,2)`) | ☑ engine ☑ source |
| **Two pairs**: probability in a 5-card hand | count `C(13,2) · C(4,2) · C(4,2) · 44 = 78·6·6·44 = 123,552`; `P = 123,552 / 2,598,960 = 198/4165` | Green Book p.34 §4.2 (prints "78×6×6×44"; the `44 = 52 − 8` is the kicker, barred from the two chosen ranks) | ☑ engine ☑ source |
| Dice in **strictly increasing** order, 3 dice (recall from L2) | `P(all different) × P(increasing given all different) = 5/9 × 1/6 = 5/54` | Green Book p.40 §4.2 "Dice order" ("strictly increasing order is simply 1/3! = 1/6 … = 5/54") | ☑ engine ☑ source |

> Every count/fraction is exact reproducible by `src/engine/combinatorics.ts` (`nCk`,
> `probabilityFromCounts(fav,total)` → reduced fraction): `nCk(52,5) = 2,598,960`;
> `probabilityFromCounts(624, 2598960) = 1/4165`; `probabilityFromCounts(3744, 2598960) = 6/4165`;
> `probabilityFromCounts(123552, 2598960) = 198/4165`; `probabilityFromCounts(20, 216) = 5/54`.
> **Source note:** the GB scan prints the two-pairs *formula* `78×6×6×44` (= **123,552**) but the OCR
> garbles the printed integer to "123,582"; the formula reduces unambiguously to `123,552 → 198/4165`
> (engine-confirmed). No `⚠️ NEEDS-WEB-SOURCE` rows — flush / straight / royal-flush counts are
> deliberately **omitted** (not stated cleanly in the GB); the finale rests on four-of-a-kind + full
> house + two pairs, all Green-Book-sourced (GB p.34, p.40).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l6-recall` | Retrieval opener: recall **L4** four-of-a-kind `1/4165` and **L2** dice `5/54` — the count→fraction habit | a probability is a *ratio of two counts* you've already made | "probability needs a brand-new formula, not the counts we have" | yes (light) | both |
| 2 | `l6-bet` | The bet (prediction hook): rank four-of-a-kind vs full house vs two pairs | ranking by "fanciness" fails; ranking by count is exact | **"a full house is rarer than four-of-a-kind"** (fancier ⇒ rarer) | no | both |
| 3 | `l6-win` | Guaranteed early win: turn the owned `624` into odds | `624 / 2,598,960 = 1/4165` — a one-step division (`answerEntry`) | "the count *is* the probability" — refuted; you must divide by the total | yes | both |
| 4 | `l6-explore` | Explore (direct manipulation): build a probability | `probabilityCounter`: assemble the full house `13·4·12·6 = 3744`, divide by `2,598,960`, watch it live-reduce to `6/4165` | "you can't reduce it / the fraction is unreadable" — refuted live | no | both |
| 5 | `l6-model` | Model: the count→probability bridge | `P(event) = favorable ÷ total` for equally-likely outcomes, reduced to lowest terms | "how you represent/order outcomes changes the probability" | no | both |
| 6 | `l6-rank` | Interleave (graded check): `handRanker` | rank four-of-a-kind `1/4165` vs full house `6/4165` — same denominator, bigger numerator ⇒ more common | **rank by hand prestige, not by `favorable/total`** | yes (check) | both |
| 7 | `l6-prove` | Prove / mastery challenge (required, `masteryChallenge`): two pairs from scratch, then re-rank | `C(13,2)·C(4,2)²·44 = 123,552 → 198/4165`; slot into `4-of-a-kind < full house < two pairs` | "two pairs ≈ one pair, so it must be common-ish" / double-counting the two ranks | yes (required) | both |
| 8 | `l6-recap` | Recap: count → divide → rank; the count→probability bridge closes the Combinatorics concept | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"Fancier hand ⇒ rarer"** (rank by prestige, not count) → `l6-bet`, `l6-rank` → A hand's *feel* proves nothing; only `favorable/total` decides rarity — count, then compare.
2. **"The count *is* the probability"** (skip dividing by the total) → `l6-win`, `l6-explore` → 624 is a *count*; the probability is `624/2,598,960 = 1/4165` — divide by all hands.
3. **"Bigger numerator ⇒ rarer"** (inverted) → `l6-rank`, `l6-prove` → Over a shared denominator (4165) a *bigger* top means *more* common: `198 > 6 > 1`, so two pairs is commonest.
4. **Double-counting the two pair-ranks** (`13×12` instead of `C(13,2)`) → `l6-prove` → "Kings & sevens" = "sevens & kings"; pick the two ranks *unordered*: `C(13,2)=78`.
5. **"Probability needs a brand-new formula"** → `l6-recall`, `l6-model` → It's the counts you already make: `P = favorable ÷ total`. No new machinery — one division.

**Per-option feedback** (✓ = `feedback.correct`; ✗ distractor notes → refutational `hints[0]` for `answerEntry`/`masteryChallenge`/`handRanker`):
- `l6-bet` (prediction, rank rarest→most-common): ✓ "Four-of-a-kind → full house → two pairs" → "Good gut — but a hunch isn't proof. Let's count each hand and watch the ranking hold up." · ✗ "Two pairs → full house → four-of-a-kind" → "Let's test it — counting may flip your gut. We'll divide each count by the total and compare." · ✗ "Full house → four-of-a-kind → two pairs" → "Let's test it — feel isn't enough; the counts pin down the true order."
- `l6-win` (answerEntry, accept `1/4165`): ✓ "Exactly — 624 / 2,598,960 reduces to 1/4165. The count became a probability with one division." · ✗ `hints[0]` → "624 is the *count*, not the odds. A probability is favorable ÷ total — divide 624 by 2,598,960."
- `l6-rank` (check, `handRanker`): ✓ "Right — same denominator (4165), so the bigger top wins: 6/4165 beats 1/4165. Full house is more common." · ✗ `hints[0]` → "Bigger numerator means *more* common, not rarer. Over 4165, 6 outranks 1 — full house beats four-of-a-kind."
- `l6-prove` (mastery, accept `198/4165`): ✓ "Exactly — 78·6·6·44 = 123,552, so 198/4165. Re-rank: 1 < 6 < 198 — two pairs is most common." · ✗ `hints[0]` → "Don't use 13×12 for the two ranks — 'kings & sevens' = 'sevens & kings.' Pick them unordered: C(13,2)=78."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** L4 **four-of-a-kind `1/4165`** AND L2 **dice `5/54`** → `l6-recall` (graded `retrievalGrid` matching {four-of-a-kind → `1/4165`, dice strictly-increasing → `5/54`} — each a *count ÷ count* — then generalize to `P = favorable ÷ total`). Wires Continuity-Report bridge #2 (the prior course's exact-fraction habit); as the concept capstone its opener retrieves across the whole arc — the longest spacing gap.
- **guaranteed early win:** `l6-win` — turn the owned `624` (from L4) into odds: `624 / 2,598,960 = 1/4165`, one division (`answerEntry`; GB p.34); refutes "the count *is* the probability."
- **mastery challenge (required, before recap):** `l6-prove` — **two pairs from scratch**: `C(13,2)·C(4,2)²·44 = 78·6·6·44 = 123,552 → 198/4165`, then **re-rank** `4-of-a-kind 1/4165 < full house 6/4165 < two pairs 198/4165` (GB p.34); the concept finale — choose+multiply → divide by `C(52,5)` → reduce → rank.
- **spacing/interleaving:** `l6-rank` is the **graded interleave** (`handRanker`): rank by `favorable/total` over the **shared denominator 4165**, NOT hand prestige (the count→probability unlabeled tool-pick, mirrors `lesson-states-streaks`). The count→exact-fraction spine re-surfaces L2 (`1/6`, `5/54`) → L4 (`1/4165`) → L6 (all three over `4165`); the shared `4165` chains `l6-win`→`l6-explore`/`l6-rank`→`l6-prove`.
- **mastery signal:** first-try, zero-hint on `l6-prove` certifies the capstone skill — build a multi-step count, convert to an exact fraction, and rank it correctly. `computeMastered` keys on {`l6-recall`,`l6-win`,`l6-rank`,`l6-prove`}.
- **graded? per beat:** `l6-recall:yes(light)`, `l6-bet:no`, `l6-win:yes`, `l6-explore:no`, `l6-model:no`, `l6-rank:yes(check)`, `l6-prove:yes(required)`, `l6-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `l6-recall` must be interaction type `retrievalGrid` (first graded beat = retrieval opener); `l6-prove` must be `masteryChallenge` + `required`, immediately before `l6-recap` (leave `beat.pattern` unset → answer verified by `src/engine/combinatorics.ts`: `probabilityFromCounts(123552,2598960)=198/4165`, `nCk(52,5)=2,598,960`, `probabilityFromCounts(624,2598960)=1/4165`); this lesson needs **≥1 `primer` (e.g. "what 'favorable/total' / reducing a fraction means") + ≥1 Track-A scaffold + ≥1 `interviewNote` (e.g. the shared-`4165` denominator)** (Dept 2); register `lesson-combinatorics-1…6` in `MASTERY_LESSONS` + `GATED` in `scripts/validate-fixtures.ts` (Dept 3).
