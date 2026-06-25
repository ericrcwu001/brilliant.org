# Lesson Brief: The Question Behind the Clue  (lesson-bayes-rule-6)

## Hook  (the bet)

"A family has two children. I tell you **at least one is a boy**. Probability both are boys? Most
people say 1/2. Now I change one word — **the older one is a boy** — and the answer changes. **Same
family, different clue, different answer.** How can a word do that?"

## Core promise (one idea)

The update is set by the **exact event you condition on** — not by a vibe about "the other child."
Write the clue as a precise subset of the sample space and the math is forced: "at least one boy"
→ **1/3**, "this specific child is a boy" → **1/2**, a black card face → **2/3**.

## Display fields

- **glyphKey:** `1/3`
- **vizKey:** `twoNode`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Two children, **at least one is a boy**. P(both boys)? | **1/3** | Green Book **p.37–38** §"Conditional Probability and Bayes' Formula" (boys-and-girls); interview pack `two-children` (#7) | ☑ engine ☑ source |
| Two children, **you meet one and he is a boy** (a specific child). P(both boys)? | **1/2** | Green Book **p.37–38** (the "Mr. Parker / meet a boy" contrast); interview pack `two-children` (#8) | ☑ engine ☑ source |
| **Bertrand's box**: 3 cards (BB, WW, BW); draw one, see a random face = **black**. P(other side black)? | **2/3** | en.wikipedia.org/wiki/Bertrand%27s_box_paradox; GB p.37 §Bayes' formula; interview pack `showcase-bertrand-box` | ☑ engine ☑ source |
| Four children, **at least one is a boy**. P(all four boys)? | **1/15** | Green Book p.37–38 (boys-and-girls, extended); interview pack `two-children` (#23) | ☑ engine ☑ source |
| **Mastery (transfer):** three children, **at least one is a boy**. P(all three boys)? | **1/7** | Green Book p.37–38 (boys-and-girls, extended); interview pack `two-children` (#22) | ☑ engine ☑ source |

> Exact-rational check (`bayesUpdate`/`bayesPosterior`, **all confirmed**): "≥1 boy" =
> `bayesUpdate(1/4, 1, 2/3)` = **1/3** (of {BB,BG,GB,GG}, the clue removes GG → BB is 1 of 3);
> "this child a boy" = `bayesUpdate(1/4, 1, 1/3)` = **1/2** (you singled out a child); Bertrand =
> `bayesPosterior([1/3,1/3,1/3],[1,1/2,0])[0]` = **2/3** (count the 3 equally-likely black **faces**, not
> the 2 cards); 3-children `bayesUpdate(1/8, 1, 6/7)` = **1/7**; 4-children `bayesUpdate(1/16, 1, 14/15)`
> = **1/15**. (Rows 1–2 are the wave-0 frozen goldens.)

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-monty` | Recall L5/L1: "the host's *choice* was the evidence" + the L1 framing-flip (1/3 vs 1/2) (the early win) | retrieval bridge from L5 (+L1) | "the clue's wording is just flavor" | yes (easy) | both |
| 2 | `open-bet` | Commit 1/2 or 1/3 to "≥1 boy → both boys?" | surfaces the framing trap | "the other child is 50/50, so 1/2" | no (`byOption`) | both |
| 3 | `name-the-condition` | Name "you condition on an **event** — a subset of outcomes, written down" | vocabulary before the partition | — (JIT primer) | no | A |
| 4 | `explore-children` | Toggle the clue over the 4 outcomes BB/BG/GB/GG; watch the surviving set (and 1/3 vs 1/2) | conditioning = which outcomes survive | "both clues mean the same thing" | no (hero) | both |
| 5 | `count-the-families` | Count survivors per clue → 1/3 ("≥1 boy") and 1/2 ("this child") | the answer is forced by the event | "the count can't depend on phrasing" | yes | both |
| 6 | `bertrand` | New costume: count black **faces** (3) not cards → 2/3 | conditioning on a face, not a card | "two cards left, so 1/2" | yes | both |
| 7 | `clue-match` | Interleave: match each clue to its update (≥1 boy→1/3, this-child→1/2, Bertrand black→2/3, **Monty host→2/3**) | one principle across costumes | "these are unrelated puzzles" | yes | both |
| 8 | `triangulate-13` | Three lenses (enumerate / conditional formula / 400-family frequency) → 1/3 | robustness of 1/3 | "1/3 is a sophistry" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** three children, ≥1 boy → all boys = 1/7 | transfer of the conditioning move | "three children ≥1 boy is also 1/3" | yes | both |
| 10 | `recap` | Retrieval-first recap: name the event before you update | consolidate | — | no | both |

Notes: `explore-children` reuses the `bayesUpdate` type `display: 'tree'` with `population: 4` (the four
equally-likely families as an icon array the learner partitions on the clue) and carries the `hero` block;
**no n>2 rendering needed here** — Bertrand's 3-card case is stated via `answerEntry`/`tripletReveal`
(`bayes-rule-6` keeps the widget at n = 2), though `bertrand` may optionally adopt the n = 3 bars added in
L4/L5 once they exist. `count-the-families`, `bertrand`, `mastery-challenge` reuse
`answerEntry`/`masteryChallenge`; `clue-match` reuses `retrievalGrid`; `triangulate-13` reuses
`tripletReveal`; opener reuses `retrievalGrid`. Put one `interviewNote` on `bertrand` ("two-children /
Bertrand's-box conditioning is a classic interview trap — `two-children`, `showcase-bertrand-box`").

## Misconceptions (Specialist)

- **"≥1 boy → the other child is 50/50 → 1/2."** Fires at `open-bet`/`explore-children`. Refutation
  (`byOption`): *"List the equally-likely families {BB, BG, GB, GG}. 'At least one boy' keeps {BB, BG,
  GB} — BB is 1 of 3 → **1/3**. 'The other child' secretly assumes you already singled out one child,
  which is a different clue."*
- **"'At least one is a boy' is the same as 'the older is a boy'."** Fires at `count-the-families`.
  Refutation: *"Different events. 'Older is a boy' keeps {BB, BG} → 1/2; 'at least one' keeps {BB, BG, GB}
  → 1/3. The word changes which outcomes survive."*
- **"Bertrand: I see black, so it's the BB or BW card → 1/2."** Fires at `bertrand`. Refutation: *"Count
  **faces**, not cards. Three equally-likely black faces (two on BB, one on BW); two of them have black
  on the back → **2/3**. Seeing a face is stronger evidence for the all-black card."*
- **"Three children with ≥1 boy is 1/3, like the two-child case."** Fires at `mastery-challenge`.
  Refutation: *"Re-enumerate the 8 families; '≥1 boy' keeps 7; only BBB is all boys → **1/7**. The clue's
  *form* is reused, but you must recount for the new sample space."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-monty` — recalls **L5** ("the host's *choice* was the evidence") and
  **L1's** `framing-flip` (boys-and-girls 1/3 vs 1/2) (Continuity Report: L5 headline + L1 framing → L6
  opener), set up as "the clue's exact wording controls the update."
- **guaranteed early win:** `recall-monty` (graded recall, not a conditioning computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — three children, ≥1 boy → **1/7**;
  a transfer that forces a fresh enumeration of the conditioning event.
- **spacing/interleaving:** `clue-match` is the interleave — it folds **L5's Monty** ("the host's
  protocol was the clue") into the same "what did you condition on?" frame as two-children and Bertrand,
  and re-surfaces **L1's `framing-flip`** spaced two chapters later (recall, not re-teach); exact-fraction
  posteriors (1/3, 1/2, 2/3, 1/7, 1/15) continue the corpus's fraction-fluency thread.
