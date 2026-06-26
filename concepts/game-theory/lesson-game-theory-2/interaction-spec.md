# Lesson Spec — L2: Nash Equilibrium (pure strategies)  (lesson-game-theory-2)

## Objective
When no one has a dominant strategy, find a **Nash equilibrium**: a strategy profile where every
player is simultaneously **best-responding** — a cell no one wants to unilaterally leave. Learn the
**best-response method** and that a game can have 0, 1, or 2+ pure equilibria.

## Sourced problems & answers (engine-verified)
| problem | answer | source | engine |
|---|---|---|---|
| Stag Hunt `[[(3,3),(0,1)],[(1,0),(1,1)]]` | **two** pure NE: (Stag,Stag)=(0,0) & (Hare,Hare)=(1,1) | Wikipedia Stag hunt; dossier L2.1 | `pureNashEquilibria=[{0,0},{1,1}]` |
| Battle of the Sexes `[[(3,2),(0,0)],[(0,0),(2,3)]]` | two pure NE: (0,0) & (1,1) | Wikipedia BoS; dossier L2.2 | `pureNashEquilibria=[{0,0},{1,1}]` |
| Chicken `[[(4,4),(2,5)],[(5,2),(1,1)]]` | two pure NE: (Swerve,Straight)=(0,1) & (Straight,Swerve)=(1,0) | Wikipedia Chicken; dossier L2.3 | `pureNashEquilibria=[{0,1},{1,0}]` |
| Matching Pennies (preview) | **no** pure NE | dossier L3.1 | `pureNashEquilibria=[]` |

## Beats (10)
| # | beatId | type | required | gist / engine anchor |
|---|--------|------|----------|----------------------|
| 1 | l2-recall | retrievalGrid | true | recall L1: "dominant strategy"→def; "PD unique outcome"→"(Defect,Defect)"; "best move whatever others do"→"dominant". |
| 2 | l2-bet | prediction (byOption) | true | Stag Hunt: "How many stable outcomes?" opts 0/1/**2**. Refute "1": both (Stag,Stag) and (Hare,Hare) are self-enforcing. |
| 3 | l2-primer | primer (custom, collapsible, track A) | false | "Best response & Nash equilibrium": your best response = the action maximizing your payoff given the opponent's; a Nash equilibrium = a cell that is a mutual best response. |
| 4 | l2-win | payoffMatrix task=`bestResponse` (interactive) | true | Stag Hunt; tap to mark each player's best response per opponent action; the two doubly-marked cells = the equilibria. hero. (ungraded explore / guaranteed engagement). |
| 5 | l2-scaffold | payoffMatrix task=`nash` (track A, simpler 2×2 with ONE NE) | false, track A | a coordination 2×2 with a single NE; tap it. `headline` = that cell. |
| 6 | l2-explore | payoffMatrix task=`nash` (Stag Hunt or Chicken) | true | tap ALL pure NE cells; `headline:"0,0;1,1"` (Stag) or `"0,1;1,0"` (Chicken). hero. |
| 7 | l2-model | tripletReveal (cards) | true | three lenses: **payoff-dominant** (Stag,Stag) · **risk-dominant** (Hare,Hare) · **selection** (which one? needs a focal point). |
| 8 | l2-interleave | retrievalGrid + interviewNote | true | match games→#pure NE: PD→1, Stag Hunt→2, Matching Pennies→0. interviewNote: "find all pure NE by best-response marking; if none exist, you must mix (L3)." |
| 9 | l2-prove | masteryChallenge | true (penult) | Given Chicken `[[(4,4),(2,5)],[(5,2),(1,1)]]`: field A "# of pure NE" accept `["2"]`; field B "payoff to the driver who goes Straight while the other Swerves" accept `["5"]`. no `pattern`. |
| 10 | l2-recap | recap | true | pure NE via mutual best response; some games (Matching Pennies) have none → randomize (L3). |

## Misconceptions
- "A Nash equilibrium must be the best joint outcome." → no; it's only "no one wants to deviate alone."
- "Every game has exactly one equilibrium." → 0 (Matching Pennies), 1 (PD), or 2 (coordination).
- "Two pure NE ⇒ the game is solved." → equilibrium *selection* (focal points) is a separate problem.

## a11y / motion
payoffMatrix bestResponse: tap row/col headers to toggle BR highlights (44px), aria-live count of
marked cells; nash task: tap candidate cells, check against engine NE set via hint ladder.
