# Lesson Brief: The Counting Principle  (lesson-combinatorics-1)

## Hook  (the bet)
"You flip a coin 10 times and write the H/T string you get. How many *different* strings
could come out?" Most people answer something small — "about 10," "maybe 20," "around 100."
The answer is **1,024**. The bet front-loads the wrong mental model (you *add* the choices, or
you count *heads* instead of *sequences*) so the multiplication rule can demolish it: ten
independent 2-way choices multiply to `2¹⁰ = 1024`, a set far too big to ever write out. (This is
exactly the coin world the learner just left in *Pattern Hitting Times* — now we *count* it.)

## Core promise (one idea)
When a thing is built from a sequence of **independent choices**, you **multiply** the number of
options at each step — so you can size a set without ever listing it (and a *full arrangement* of
`n` things is just the multiplication rule with shrinking choices: `n!`).

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `×`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Number of length-`n` outcome sequences from a 2-way choice (e.g. H/T): how many distinct length-10 strings? | `2¹⁰ = 1024` (general `2ⁿ`; `2³ = 8`) | Green Book p.33 §4.2 ("Basic principle of counting: Let S be a set of length-k sequences …") | ☑ engine ☑ source |
| Number of full arrangements (orderings) of `n` distinct objects | `n!` (e.g. `5! = 120`, `3! = 6`) | Green Book p.33 §4.2 (Permutation property: there are `n!` rearrangements of `n` objects) | ☑ engine ☑ source |
| 3 bags, each bag's coin can be one of 3 weights (−1/0/+1) → how many weight-combinations? | `3³ = 27` | Green Book p.12 §2 (counterfeit-coin base-3 weighing: "we are going to have 3³ = 27 possible combinations") | ☑ engine ☑ source |
| A class of `n` people, 365-day year: how many birthday sequences are there *at all*? | `365ⁿ` (n=3 → `48,627,125`) | Green Book p.36 §4.2 ("the basic principle of counting tells us that there are 365ⁿ possible sequences") | ☑ engine ☑ source |
| Same class: how many birthday sequences have **no two** people sharing a day? (mastery transfer) | `365·364·…·(365−n+1)` (n=3 → `365·364·363 = 48,228,180`) | Green Book p.36 §4.2 ("365×364×⋯×(365−n+1) possible sequences where no two individuals have the same birthday") | ☑ engine ☑ source |
| Hook (engagement, ungraded): two guards, one liar one truth-teller, one yes/no question — pick the door to the offer | one question works (ask either guard what the *other* would say, then take the opposite door) | Green Book p.7 §2 "Door to offer" | ☑ source |
| Hook (engagement, ungraded): bag of 20 blue + 14 red balls, draw-two / replace rule — color of the last ball? | **blue** (red count drops by 0 or 2, so its even parity never flips) | Green Book p.7–8 §2 "Last ball" | ☑ source |
| Hook (engagement, ungraded): 10 bags of coins, one counterfeit — find it in **one** weighing | take `1,2,…,10` coins from the bags (`1+2+⋯+10 = 45` coins); the weight deficit names the bag | Green Book p.10 §2 "Counterfeit coins" | ☑ source |

> All graded counts are exact integers reproducible by the planned `src/engine/combinatorics.ts`
> (`factorial`, a `2ⁿ`/product helper, and `nPk` for the shrinking-product birthday count). No
> floats. No `⚠️ NEEDS-WEB-SOURCE` rows — every problem is Green-Book-anchored.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l1-recall` | Retrieval opener: recall the implicit "count the ways" from *lesson-first-heads* / *lesson-pattern-hitting-times* | 2 coin flips have 4 outcomes (HH, HT, TH, TT) — listing works while small | "outcomes are too many / random to count" — refuted by listing a tiny case | yes (light) | both |
| 2 | `l1-bet` | The bet (prediction hook): size a set too big to list | a 10-flip H/T string has `2¹⁰` possibilities | **add-not-multiply** & "count heads, not sequences" (picks ~10/~100) | no | both |
| 3 | `l1-win` | Guaranteed early win: multiply a tiny chain of choices | `2×2×2 = 8` length-3 sequences (`countingTree`) | "I have to enumerate to be sure" — refuted by the tree's running product | yes | both |
| 4 | `l1-explore` | Explore (direct manipulation): grow the product tree and watch the count compound | each added independent step multiplies the running product → `2ⁿ`; also a mixed-fanout branch (e.g. `2×3×2`) | "the count grows by adding a step's options" — refuted live | no | both |
| 5 | `l1-multadd` | Interleave **multiply vs add**: independent choices multiply; mutually-exclusive cases add | `3³ = 27` (independent, multiply) vs an either/or case (add) | **multiply vs add** confusion (the core L1 trap) | yes (check) | both |
| 6 | `l1-model` | Model: name the multiplication rule; derive `n!` as the shrinking-choice product | full arrangement of `n` distinct objects `= n·(n−1)·⋯·1 = n!` (`5! = 120`) | "arranging is a new, separate idea" — refuted: it's the *same* rule with choices that shrink | no | both |
| 7 | `l1-prove` | Prove / mastery challenge (required): a harder transfer where the choices **shrink** | birthdays with no repeat `= 365·364·363` vs all sequences `= 365ⁿ` (`answerEntry`) | "independent vs dependent choices use different rules" — refuted (both multiply; only the per-step count differs) | yes | both |
| 8 | `l1-recap` | Recap: retrieval-first close + bridge to ordering | multiplication rule + `n!`; bridge: "when order is the *only* thing that matters → Permutations (L2)" | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **Add-not-multiply** → `l1-bet`, `l1-multadd` → Independent choices *multiply*: ten 2-way flips give `2×2×…=2¹⁰=1,024`, not `2+2+…=20`.
2. **Count heads/flips, not whole strings** → `l1-bet` → You're counting entire H/T sequences; each of the 10 positions independently doubles the total.
3. **Powers-of-two miscount (`2ⁿ` vs `n²`)** → `l1-recall`, `l1-bet` → Each added flip *doubles* the count (2,4,8,…`=2ⁿ`); it doesn't square it.
4. **Multiply vs add** → `l1-multadd` → Chain independent choices with `×`; only mutually-exclusive either/or cases get `+`.
5. **`nᵏ` vs shrinking product** → `l1-prove` → Both rules multiply; no-repeat birthdays just give each next person one fewer day (`365·364·363`).

**Per-option feedback** (✓ = `feedback.correct`; ✗ distractor notes → wire as refutational `hints[0]`, since `answerEntry` has no per-value field today):
- `l1-bet` (prediction): ✗ "About 10" → "That's counting flips, not strings — each of the 10 flips doubles the possibilities, so they explode past 10." · ✗ "About 100" → "Bigger is right, but not 10×10 — ten independent doublings compound to 2¹⁰. Let's count it." · ✓ "About 1,024" → "Yes — ten 2-way choices multiply: 2×2×…=2¹⁰=1,024, too big to ever list."
- `l1-win` (answerEntry, accept `8`): ✓ "Right — 2×2×2 = 8; each flip multiplies the running count." · ✗ `6` → "You added (2+2+2). Independent choices multiply: 2×2×2 = 8." · ✗ `3` → "That's the flip count, not sequences — each flip branches ×2 → 2³ = 8." · ✗ `9` → "Right shape, wrong base: 2³ = 8, not 3²."
- `l1-multadd` (check, accept `27`): ✓ "Right — 3³ = 27; three independent bags, 3 weights each, multiply." · ✗ `9` → "You added the bags (3+3+3); they're independent, so multiply: 3³ = 27." · ✗ `6` → "Not 3×2 — three independent 3-way choices give 3³ = 27."
- `l1-prove` (mastery, accept `48,228,180` = `365·364·363`): ✓ "Exactly — 365·364·363; same rule, each next person has one fewer day." · ✗ `365³` → "That counts *all* sequences. 'No two alike' shrinks each step: 365·364·363." · ✗ `1095` → "Don't scale by 3 — chain the shrinking choices 365·364·363."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** the implicit "count the ways" from `lesson-first-heads` / `lesson-pattern-hitting-times` → `l1-recall` (graded `retrievalGrid` matching {1,2,3 flips} → {2,4,8} outcomes; also seeds the `2ⁿ` ladder reused in L3).
- **guaranteed early win:** `l1-win` — `2×2×2 = 8` length-3 sequences on the `countingTree`; small enough to verify by listing, so success is guaranteed.
- **mastery challenge (required, before recap):** `l1-prove` — no-repeat birthdays `365·364·363 = 48,228,180` vs all sequences `365³` (GB p.36); certifies the multiplication rule generalizes to **dependent / shrinking-choice** counts.
- **spacing/interleaving:** `l1-multadd` mixes **add-vs-multiply** unlabeled (`3³` multiply vs an either/or add), mirroring `lesson-states-streaks`; the pair re-surfaces at `l4-recall`. `2ⁿ` planted here re-surfaces at `l3-recall`/`l3-explore` (length-n binary strings `=2ⁿ` → Pascal row sum `=2ⁿ`). The multiplication rule is the spine into L2/L3/L4.
- **mastery signal:** first-try, zero-hint on `l1-prove` certifies the learner abstracted "multiply the options at each step" (handles independent *and* dependent chains). `computeMastered` keys on a clean run of {`l1-recall`,`l1-win`,`l1-prove`}.
- **graded? per beat:** `l1-recall:yes(light)`, `l1-bet:no`, `l1-win:yes`, `l1-explore:no`, `l1-multadd:yes(check)`, `l1-model:no`, `l1-prove:yes(required)`, `l1-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `l1-recall` must be interaction type `retrievalGrid` (the first graded beat must be a retrieval opener, else the inclusivity gate fails); `l1-prove` must be `masteryChallenge` + `required`, immediately before `l1-recap` (leave `beat.pattern` unset → the answer is verified by `src/engine/combinatorics.ts`, not the H/T automaton); this lesson still needs **≥1 `primer` beat + ≥1 Track-A scaffold + ≥1 `interviewNote`** (Dept 2 Interaction Spec owns these); add `lesson-combinatorics-1…4` to `MASTERY_LESSONS` + the inclusivity `GATED` set in `scripts/validate-fixtures.ts` (Dept 3) or the gates never fire.
