# Lesson Spec — L4: Zero-Sum & Minimax  (lesson-game-theory-4)

## Objective
In a **zero-sum** game (pure conflict, col's payoff = −row's), every finite game has a **value**:
the most Row can guarantee (**maximin**) equals the least Col can hold Row to (**minimax**) — von
Neumann's minimax theorem. If a **saddle point** exists the value is pure; otherwise both randomize
(the 2×2 value formula).

## Sourced problems & answers (engine-verified)
| problem | answer | source | engine |
|---|---|---|---|
| Saddle-point matrix `M=[[3,5],[2,4]]` | maximin = minimax = **3** at (0,0); pure value | ZIB; Ferguson; dossier L4.1 | `saddlePoint → {row:0,col:0,value:3}` |
| Minimax theorem | every finite zero-sum game has a value V (maximin = minimax) | von Neumann 1928; dossier L4.2 | conceptual (engine returns V on any concrete matrix) |
| No-saddle 2×2 `M=[[1,3],[4,2]]` | value **5/2**; Row plays top with **1/2**; Col plays left with **1/4** | Notre Dame formula; dossier L4.3 | `saddlePoint=null`; `mixedValue2x2 → {5/2, 1/2, 1/4}` |
| Two-finger Morra `M=[[2,-3],[-3,4]]` | value **−1/12**; mix **7/12** | UMass; dossier L4.4 | `mixedValue2x2 → {−1/12, 7/12, 7/12}` |

## Beats (10)
| # | beatId | type | required | gist / engine anchor |
|---|--------|------|----------|----------------------|
| 1 | l4-recall | retrievalGrid | true | recall L3: "no pure NE ⇒"→"mix"; "mix to make opponent…"→"indifferent"; "Matching Pennies value"→"0". |
| 2 | l4-bet | prediction (byOption) | true | "Zero-sum game WITH a saddle point — should you randomize?" opts **"No, play the saddle"** / "Yes, always mix" / "Depends on luck". |
| 3 | l4-primer | primer (custom, collapsible, track A) | false | "Maximin, minimax & value": Row's maximin = best worst-case row; Col's minimax = best worst-case col; when they're equal that common number is the game's value (a saddle). |
| 4 | l4-win | payoffMatrix task=`value` (saddle `[[3,5],[2,4]]`) | true | tap the saddle (row-min ∧ col-max). `headline:"3"`. hero. early win. |
| 5 | l4-scaffold | payoffMatrix task=`value` (another saddle) OR primer | false, track A | reinforce row-min/col-max scan. |
| 6 | l4-explore | payoffMatrix task=`mix` (no-saddle `[[1,3],[4,2]]`) | true | no saddle → 2×2 formula; `headline:"5/2"` (value); slider shows Row's ½ / Col's ¼. hero. |
| 7 | l4-model | tripletReveal (cards) | true | three lenses: **maximin** (Row guarantees ≥V) · **minimax** (Col holds Row ≤V) · **theorem** (they coincide; Nash = minimax in zero-sum). |
| 8 | l4-apply | answerEntry + interviewNote | true | Two-finger Morra value: accept `["-1/12"]`. interviewNote: von Neumann 1928; zero-sum ⇒ Nash = minimax/maximin; general games solved by LP; always check for a saddle FIRST. |
| 9 | l4-prove | masteryChallenge | true (penult) | No-saddle `[[1,3],[4,2]]`: field A "value" accept `["5/2"]`; field B "Row's probability on the TOP row" accept `["1/2"]`. LaTeX `v=(ad-bc)/(a+d-b-c)`. no `pattern`. |
| 10 | l4-recap | recap | true | zero-sum value via saddle / 2×2 formula; next, games that unfold in time (L5 backward induction). |

## Misconceptions
- "Always randomize in zero-sum." → only with no saddle; a saddle ⇒ pure optimal play.
- "Value depends on who's lucky." → the value is what each side can *guarantee*, independent of luck.
- "Sign/labeling doesn't matter." → the 2×2 formula assumes rows (a,b),(c,d) = Row's payoffs; fix the convention.

## a11y / motion
payoffMatrix `value`: tap candidate saddle cell; aria-live announces row-min and col-max; `mix`:
slider + converging payoff readouts; reduced-motion final frame.
