# Lesson Spec — L6: Winning Strategies: Nim & Symmetry  (lesson-game-theory-6)  — CONCEPT FINALE

## Objective
In **impartial take-away games**, every position is either **winning (N)** or **losing (P)** for the
mover. The **nim-sum (XOR)** decides Nim; the **mod-(k+1)** residue decides subtraction games; and
**symmetry / strategy-stealing** decide others. Some "games" are actually **forced** (no strategy).

## Sourced problems & answers (engine-verified)
| problem | answer | source | engine |
|---|---|---|---|
| Nim heaps (3,4,5), last takes wins | nim-sum = **2 ≠ 0** ⇒ first player wins; move 3→1 (leave (1,4,5)) | Wikipedia Nim (Bouton); dossier L6.1 | `nimSum([3,4,5])=2`; `nimWinningMoves=[{heap:0,removeTo:1}]`; `nimIsWinning([1,4,5])=false` |
| Subtraction (take 1–3, last wins), pile 12 | **multiple of 4 ⇒ first player LOSES** | NYU notes; Wikipedia §21; dossier L6.2 | `subtractionIsWinning(12,3)=false`; `subtractionWinningMove(10,3)=2` |
| Coins on a round table, move first | **place at center, then mirror** ⇒ first player wins | techinterview.org; dossier L6.3 | logic (symmetry); prediction beat |
| Chocolate bar 6×8 → 48 unit squares | exactly **47** breaks (mn−1, forced) | **Green Book**; dossier L6.5 | factcheck `6*8-1===47` |

## Beats (10)
| # | beatId | type | required | gist / engine anchor |
|---|--------|------|----------|----------------------|
| 1 | l6-recall | retrievalGrid | true | recall L5: "solve from the end"→"backward induction"; "a position the mover loses"→"P-position"; "Pirate senior keeps"→"98". |
| 2 | l6-bet | prediction (byOption) | true | "Take 1–3, last to take wins. Pile of 12. First player…" opts "wins" / **"loses"** / "depends". (12 = multiple of 4 = P-position.) |
| 3 | l6-primer | primer (custom, collapsible, track A) | false | "P-positions & N-positions": a P(revious-player-wins) position has ALL moves leading to N-positions; you win by always moving onto a P-position. |
| 4 | l6-win | nimBoard task=`subtraction` (pile 10, k=3) | true | take 1–3; winning move = 10 mod 4 = **2** → leave 8 (P). `headline:"2"`. hero. early win. |
| 5 | l6-scaffold | nimBoard task=`subtraction` (smaller) OR primer | false, track A | a tiny pile to feel the "land on multiple of 4" rule. |
| 6 | l6-explore | nimBoard task=`nim` (heaps 3,4,5) | true | XOR reveal: nim-sum 3⊕4⊕5 = **2** ⇒ winning; reduce the 3-heap to 1. `headline:"2"`. hero. |
| 7 | l6-model | tripletReveal (cards) | true | three lenses: **nim-sum=0 ⇔ losing** · **XOR balances heaps** · **mirror to a P-position**. |
| 8 | l6-apply | answerEntry + interviewNote | true | Chocolate bar 6×8: "minimum breaks to 48 squares?" accept `["47"]`. interviewNote: **GB chocolate-bar** invariant (every break +1 piece ⇒ mn−1, *forced* — no strategy); coins-on-a-table symmetry / strategy-stealing (techinterview); **normal vs misère** flips Nim/21 endings. |
| 9 | l6-prove | masteryChallenge | true (penult) | Nim (1,4,5): field A "nim-sum" accept `["0"]`; field B "does the player to move win? (yes/no)" accept `["no"]`. LaTeX XOR. no `pattern`. |
| 10 | l6-recap | recap | true | nim-sum / parity / symmetry decide impartial games — and the whole Game Theory arc: dominance → Nash → mixing → minimax → backward induction → winning positions. |

## Misconceptions
- "Bigger heaps win." → it's the XOR, not the size: (1,4,5) loses despite a 5-heap.
- "Always go first." → only N-positions win; from a P-position the mover loses.
- "Every game has a clever strategy." → chocolate-breaking is *forced* (mn−1) — counting, not strategy.

## a11y / motion
nimBoard: 44px token rows; tap tokens to remove (or a stepper), aria-live announces the nim-sum /
residue + win/lose; reduced-motion → static frame with the winning move highlighted.
