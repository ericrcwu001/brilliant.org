# Lesson Spec — L1: Dominance & the Prisoner's Dilemma  (lesson-game-theory-1)

> Build packet (doubles as Dept-1 brief + Dept-2 interaction spec). Every number engine-verified by
> `src/engine/gameTheory.ts`; every problem sourced in `../source-dossier.md`.

## Objective
A **strictly dominant strategy** yields a strictly higher payoff than any alternative *no matter what
the opponent does* — so a rational player plays it. The Prisoner's Dilemma shows mutual rationality
can trap both players below the cooperative outcome; **iterated elimination of dominated strategies
(IESDS)** extends the idea.

## Sourced problems & answers (engine-verified)
| problem | answer | source | engine |
|---|---|---|---|
| Prisoner's Dilemma `[[(3,3),(0,5)],[(5,0),(1,1)]]` (row/col 0=Cooperate, 1=Defect) | Defect strictly dominates; unique NE **(Defect,Defect) = (1,1)**; (3,3) is Pareto-better but unstable | Wikipedia PD; dossier L1.1 | `strictlyDominatedRows=[0]`, `iesdsSolution={1,1}`, `pureNashEquilibria=[{1,1}]` |
| Guess ⅔ of the average ([0,100]) | unique NE **0** (IESDS) | Wikipedia; Nagel 1995; dossier L1.2 | conceptual IESDS → 0 (answerEntry accept "0") |
| Traveler's dilemma ($2–$100) | unique NE **(2,2)** | Basu; Wikipedia; dossier L1.3 | answerEntry accept "2" |

## Beats (10) — beat[0] graded retrievalGrid; penult masteryChallenge; last recap
| # | beatId | type | required | gist / engine anchor |
|---|--------|------|----------|----------------------|
| 1 | l1-recall | retrievalGrid | true | match: "Penney's game best pattern"→"none (non-transitive)"; "a move that's best whatever others do"→"dominant strategy"; "value of a 50/50 of +2/0"→"1". Recalls Penney non-transitivity (continuity). |
| 2 | l1-bet | prediction (byOption) | true | "Two rational suspects, payoffs as shown. What happens?" opts: "Both stay silent (3,3)" / "Both confess (1,1)" / "Mixed". correct=Both confess. Refute "both silent" = not an equilibrium (each tempted to deviate to 5). |
| 3 | l1-primer | primer (custom, collapsible, track A) | false | "Strict dominance": strategy X strictly dominates Y if X pays more than Y against *every* opponent move. A dominant strategy strictly dominates all others. |
| 4 | l1-win | payoffMatrix task=`dominance` | true | PD matrix; learner taps the dominated strategy / surviving cell. `headline:"1,1"`. hero block (slowFirst, "Defect out-pays Cooperate in BOTH columns → both defect → (1,1)"). Guaranteed early win (obvious dominance). |
| 5 | l1-scaffold | payoffMatrix task=`bestResponse` (interactive, no headline) | false, track A | same PD; toggle to highlight each player's best response per column → both point to Defect. |
| 6 | l1-explore | payoffMatrix task=`dominance` (3×3 IESDS) | true | a 3×3 general-sum game that IESDS-collapses to a unique cell; `headline` = that cell (AUTHOR: choose a concrete 3×3 and set headline = `iesdsSolution`; engine-verify). hero. |
| 7 | l1-model | tripletReveal (cards) | true | three lenses on PD: **Dominant** (Defect beats Cooperate always) · **Nash** ((D,D) no one deviates) · **Pareto** ((C,C) better for both but unstable). `introducesSymbol` optional. |
| 8 | l1-apply | answerEntry + interviewNote | true | Guess-⅔-average: "the unique equilibrium guess?" accept `["0"]`. interviewNote: Keynesian beauty contest / markets; real play lands ~20–35 (k-level), equilibrium needs common-knowledge rationality. |
| 9 | l1-prove | masteryChallenge | true (penult) | Given a PD `[[(3,3),(0,5)],[(5,0),(1,1)]]`: field A "NE payoff to each player" accept `["1"]`; field B "payoff each would get if both cooperated" accept `["3"]`. LaTeX worked derivation. no `pattern`. |
| 10 | l1-recap | recap | true | dominance → if no one has a dominant strategy, find the mutual best response (L2). |

## Misconceptions
- "Rational players cooperate for the better (3,3)." → (3,3) isn't stable: each can deviate to 5.
- "Dominant = best outcome." → dominant = best *response regardless of others*; the outcome can be bad.
- "Everyone is rational ⇒ 2/3-average winner picks 0." → equilibrium is 0, but humans don't; that gap is the lesson.

## a11y / motion
payoffMatrix: 44px tap cells/row-headers; `aria-live` announces the running best-response/elimination;
reduced-motion → final highlighted frame. All graded checks via the hint ladder.
