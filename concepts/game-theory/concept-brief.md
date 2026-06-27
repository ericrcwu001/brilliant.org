# Concept: Game Theory  (course-game-theory)

## Green Book anchor
- **Strategic / backward-induction brain teasers** — Green Book (Xinfeng Zhou, *A Practical Guide to
  Quantitative Finance Interviews*), Ch.2 "Brain Teasers": **"Screwy pirates" p.3** (the pirate
  split — the canonical quant strategy teaser, "If you have not studied game theory … this strategy
  problem may appear daunting"), **"Tiger and sheep" p.4** (parity by backward induction),
  **"Chocolate bar problem"** (invariant). Beyond the Green Book, dominance/Nash/mixed/minimax and
  Nim/"race-to-N"/coins-on-a-table winning-strategy questions are standard quant-interview canon
  (Mark Joshi *QJIQ&A*; brainstellar; techinterview.org; Palacios-Huerta's penalty-kick minimax
  study). Full sourcing + exact answers + contested-answer caveats: `source-dossier.md`.

## One-line promise
**A rational player asks not "what's best for me?" but "what's best for me given what everyone else
will do?" — and that fixed point (the equilibrium) is computable.**

## Catalog fields  (auto-registers the concept in the macro home when seeded)
- **domain:** `Combinatorics & Games`
- **domainOrder:** `1`
- **order:** `2`   (domain slots: combinatorics 0, optimal-stopping 1, game-theory 2)
- **status:** `live`
- **tagline:** `Find equilibria where no one wants to deviate.`  (46 chars)
- **accent:** `ch2`
- **vizKey:** `twoNode`   (2-player game graph thumbnail; valid `MathVizKind`)
- **completionMilestoneId:** `game-theory-complete`
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-game-theory-1 | Strategic Dominance | ch2 | [lesson-game-theory-1, lesson-game-theory-2] |
| ch-game-theory-2 | Randomize & Minimize | ch4 | [lesson-game-theory-3, lesson-game-theory-4] |
| ch-game-theory-3 | Sequence & Symmetry | ch1 | [lesson-game-theory-5, lesson-game-theory-6] |

## Lessons (ordered)

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | milestoneId | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|-------------|----------------|
| L1 | lesson-game-theory-1 | Dominance & the Prisoner's Dilemma | A strictly dominant strategy beats every alternative no matter what others do — and mutual rationality can trap both players below the cooperative outcome. | — | ≻ | twoNode | game-theory-dominance | PD (Wikipedia); guess-⅔-average; traveler's dilemma |
| L2 | lesson-game-theory-2 | Nash Equilibrium | When no one has a dominant strategy, look for a profile where every player is simultaneously best-responding — a cell no one wants to leave. | L1 | NE | fourNode | game-theory-nash | best-response method; Stag Hunt; Battle of the Sexes; Chicken |
| L3 | lesson-game-theory-3 | Mixed Strategies | Some games have no pure equilibrium — you must randomize, mixing exactly so your opponent is indifferent. | L2 | p* | dice | game-theory-mixed | Matching Pennies; Rock-Paper-Scissors; AKQ bluff (indifference) |
| L4 | lesson-game-theory-4 | Zero-Sum & Minimax | In a pure conflict, every finite game has a value: the most you can guarantee equals the least your opponent can hold you to (maximin = minimax). | L3 | V | twoNode | game-theory-minimax | saddle point; minimax theorem; 2×2 value formula; Two-finger Morra |
| L5 | lesson-game-theory-5 | Sequential Games & Backward Induction | When players move in turn, fold the game tree from the end: each player anticipates the other's optimal future reply. | L4 | ⤵ | raceLanes | game-theory-sequential | **Pirate game (GB p.3)**; Tiger & sheep (GB p.4); centipede; Stackelberg |
| L6 | lesson-game-theory-6 | Winning Strategies: Nim & Symmetry | In impartial take-away games, positions are either winning or losing; the nim-sum (XOR) and parity/symmetry arguments tell you which — and the exact winning move. | L5 | ⊕ | coin | game-theory-combinatorial | **Nim** (XOR); 21/subtraction (mod k+1); coins-on-a-table; chocolate-bar invariant (GB) |

## Concept arc (Bet → Explore → Model → Prove, across lessons)
- **Ch1 Strategic Dominance** — *simultaneous one-shot games, the "easy" structure.* L1: dominance
  (one player's choice is forced). L2: when nothing is forced, the **mutual best-response** fixed point.
- **Ch2 Randomize & Minimize** — *what to do when there's no pure equilibrium.* L3: randomize via the
  **indifference principle**. L4: pure-conflict (zero-sum) games have a **guaranteed value** (minimax).
- **Ch3 Sequence & Symmetry** — *games that unfold in time / impartial games.* L5: **backward
  induction** on sequential games (pirates). L6: **winning strategies** via nim-sum & symmetry.

## New engine / widgets anticipated (for Wave 0)
- **engine:** `src/engine/gameTheory.ts` — pure, exact (rationals as `{n,d}`, integers, XOR; NO
  floats). Computes pure-Nash, IESDS/dominance, mixed-Nash (2×2), zero-sum value (saddle + 2×2
  formula), backward induction over a finite tree, the pirate-game allocation, and Nim / subtraction
  P-N positions + winning moves. Full signatures frozen in `wave0-contracts.md`.
- **interaction type(s) — 3 new, each folding multiple presentations (codebase convention, cf.
  `chainBoard`/`bayesUpdate`):**
  - `payoffMatrix` — the normal-form bimatrix grid (Firestore-safe `matrix: [{cells:[{row,col}]}]`);
    `task` ∈ `dominance | bestResponse | nash | value | mix` (the `mix` task adds the
    indifference slider). Used L1, L2, L3, L4.
  - `gameTree` — finite extensive-form tree; tap to fold by backward induction → the SPE path. L5.
  - `nimBoard` — heaps of tokens to take from; `task` ∈ `nim | subtraction`; surfaces P/N status &
    the winning move. L6.
  - All three follow the `chainBoard` precedent: **NOT** in `GRADED_TYPES`/`HERO_TYPES`/`mastery.ts`;
    they carry an engine-reproducible `headline` cross-checked by `validate-fixtures.ts`. Each lesson's
    *official* graded beats are the existing `retrievalGrid` opener + `answerEntry` + `masteryChallenge`.

## Reuse (no new build)
`retrievalGrid` (openers/interleaving), `prediction` (byOption bets), `primer` (custom JIT cards),
`answerEntry` (typed exact answers), `masteryChallenge` (capstones), `tripletReveal` (three-lens
model beats), `recap` (closers). Penney's `dominanceWheel` is recalled, not rebuilt.
