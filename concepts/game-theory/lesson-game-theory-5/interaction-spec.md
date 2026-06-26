# Lesson Spec — L5: Sequential Games & Backward Induction  (lesson-game-theory-5)

## Objective
When players move **in turn**, solve the game tree from the **end**: each player anticipates the
other's optimal future reply (**subgame-perfect equilibrium**). The Green Book's **pirate game** is
the canonical quant instance.

## Sourced problems & answers (engine-verified)
| problem | answer | source | engine |
|---|---|---|---|
| Pirate game (5 pirates, 100 gold, ≥50% + proposer tie-break, indifferent votes NO) | **(98, 0, 1, 0, 1)** senior→junior | **Green Book p.3 "Screwy pirates"**; Joshi; Wikipedia; dossier L5.1 | `pirateGame(5,100)=[98,0,1,0,1]`; `pirateGame(3,100)=[99,0,1]` |
| Tiger & sheep (100 tigers, 1 sheep) | **not eaten** (even ⇒ safe; odd ⇒ eaten) | **Green Book p.4**; dossier L5.2 | parity: `n%2===0 ⇒ not eaten` (factcheck) |
| Centipede (small, doubling) | unique SPE = **Take immediately** | Wikipedia; MIT 14.12; dossier L5.4 | `backwardInduction(tree).path=["Take"]`, payoff `[1,0]` |

### Centipede tree (concrete; engine `backwardInduction` must reproduce)
- A (player 0): Take→leaf `[1,0]` | Pass→B
- B (player 1): Take→leaf `[0,2]` | Pass→C
- C (player 0): Take→leaf `[3,0]` | Pass→D
- D (player 1): Take→leaf `[0,4]` | Pass→leaf `[2,2]`

BI: D→Take `[0,4]` (4>2); C→Take `[3,0]` (3>0); B→Take `[0,2]` (2>0); A→Take `[1,0]` (1>0).
**SPE payoff `[1,0]`, path `["Take"]`** — both would be better at `[2,2]` (the tragedy). headline `"1,0"`.

## Beats (10)
| # | beatId | type | required | gist / engine anchor |
|---|--------|------|----------|----------------------|
| 1 | l5-recall | retrievalGrid | true | recall L1 PD (one-shot) + Penney second-mover: "going second can win"→"7:1"; "solve a sequential game from the…"→"end". |
| 2 | l5-bet | prediction (byOption) | true | Pirate game: "5 pirates, 100 gold, senior proposes, ≥50% passes. Senior keeps?" opts "≈20 (fair)" / "0 (tossed)" / **"98"**. |
| 3 | l5-primer | primer (custom, collapsible, track A) | false | "Backward induction": solve the LAST move first; each player picks anticipating the optimal future; the result is subgame-perfect (credible). |
| 4 | l5-win | gameTree (small 2-decision tree) | true | fold a tiny entry-deterrence / take-pass tree to its SPE; `headline` = SPE payoff vector. hero. early win. |
| 5 | l5-scaffold | gameTree (1-decision) OR primer | false, track A | a single decision node: pick the higher leaf. |
| 6 | l5-explore | gameTree (centipede above) | true | tap Take/Pass folding from the right; SPE = Take now. `headline:"1,0"`. hero (fold animation). |
| 7 | l5-model | tripletReveal (cards) | true | three lenses: **SPE vs Nash** (credible threats) · **anticipate the future** · **the pirate logic** (buy the cheapest votes). |
| 8 | l5-apply | answerEntry + interviewNote | true | Pirate (5,100): field A "senior keeps" accept `["98"]`; field B "most-junior pirate gets" accept `["1"]`. interviewNote: **GB p.3**; tie-break + indifferent-votes-NO conventions; general 2n+1 ⇒ keep 100−n; quantt.co.uk prints a wrong vector — derive it. |
| 9 | l5-prove | masteryChallenge | true (penult) | field A "Pirate (3 pirates,100): senior keeps" accept `["99"]`; field B "the bribed junior gets" accept `["1"]`; field C "Tiger & sheep, 100 tigers: is the sheep eaten? (yes/no)" accept `["no"]` (GB p.4). no `pattern`. |
| 10 | l5-recap | recap | true | fold from the end; this same "winning/losing position" logic powers impartial games (L6). |

## Misconceptions
- "The senior pirate is in danger." → with backward induction he keeps 98 by buying 2 cheap votes.
- "Backward induction means greedy now." → it means anticipate the *whole* future, then act.
- "Centipede: rational players cooperate to get rich." → SPE is Take immediately; cooperation is not subgame-perfect.

## a11y / motion
gameTree: 44px node/branch tap targets; fold reveals the chosen child + running payoff via aria-live;
reduced-motion → fully-folded final frame (SPE path highlighted).
