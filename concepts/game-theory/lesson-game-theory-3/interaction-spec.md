# Lesson Spec — L3: Mixed Strategies  (lesson-game-theory-3)

## Objective
When a game has **no pure equilibrium**, you must **randomize**. The **indifference principle**: mix
exactly so your opponent is indifferent among their options — otherwise they exploit you. Compute
exact mixing fractions and the game value.

## Sourced problems & answers (engine-verified)
| problem | answer | source | engine |
|---|---|---|---|
| Matching Pennies (zero-sum) `M_row=[[1,-1],[-1,1]]` | no pure NE; mix **½**; value **0** | Berkeley; dossier L3.1 | `pureNash=[]`; `mixedValue2x2 → {0, ½, ½}` |
| Rock–Paper–Scissors (3×3) | mix **⅓** each; value **0** | UNCC/Berkeley; dossier L3.2 | `pureNashEquilibria=[]` (mix 1/3 by symmetry) |
| Two-finger Morra (zero-sum) `M_row=[[2,-3],[-3,4]]` | value **−1/12**; "1 finger" prob **7/12** | UMass; dossier L4.4 | `mixedValue2x2 → {−1/12, 7/12, 7/12}` |
| Battle of the Sexes mixed NE `[[(3,2),(0,0)],[(0,0),(2,3)]]` | own-venue prob **3/5** (row), **2/5** (col) | Wikipedia; dossier L2.2 | `mixedNash2x2 → {p:3/5, q:2/5}` |

## Beats (10)
| # | beatId | type | required | gist / engine anchor |
|---|--------|------|----------|----------------------|
| 1 | l3-recall | retrievalGrid | true | recall L2: "Matching Pennies # pure NE"→"0"; "no pure best move ⇒"→"randomize"; "Penney/RPS champion"→"none". |
| 2 | l3-bet | prediction (byOption) | true | RPS best strategy: "Always Rock" / "Counter your last loss" / **"Each ⅓ at random"**. Refute patterns = exploitable. |
| 3 | l3-primer | primer (custom, collapsible, track A) | false | "Indifference principle": in a mixed equilibrium you randomize so the opponent gains the same from any reply (no profitable deviation). |
| 4 | l3-win | payoffMatrix task=`mix` (Matching Pennies) | true | drag your H-probability; the two opponent expected-payoff lines cross at p=½. `headline:"0"` (game value). hero. early win (symmetry → ½). |
| 5 | l3-scaffold | primer (custom, track A) OR answerEntry RPS | false, track A | "RPS by symmetry → ⅓ each; expected score 0." |
| 6 | l3-explore | payoffMatrix task=`mix` (Two-finger Morra `[[2,-3],[-3,4]]`) | true | non-symmetric mix: indifference at **7/12**; `headline:"-1/12"` (value). hero. |
| 7 | l3-model | tripletReveal (cards) | true | three lenses on mixing: **unpredictability** · **indifference** (opponent can't exploit) · **value** (what you guarantee). |
| 8 | l3-apply | answerEntry + interviewNote | true | Battle of the Sexes mixed NE: "probability you put on YOUR preferred venue?" accept `["3/5"]`. interviewNote: poker bluff freq = ⅓ at a pot-size bet (AKQ, indifference); Palacios-Huerta — pros play minimax in penalty kicks. |
| 9 | l3-prove | masteryChallenge | true (penult) | Two-finger Morra `[[2,-3],[-3,4]]`: field A "probability on '1 finger'" accept `["7/12"]`; field B "value of the game" accept `["-1/12"]`. LaTeX. no `pattern`. |
| 10 | l3-recap | recap | true | mixing via indifference; in pure-conflict (zero-sum) games this value is guaranteed (L4 minimax). |

## Misconceptions
- "Randomizing means 50/50." → only when symmetric; Morra mixes 7/12.
- "Mix to maximize my own payoff." → mix to make the *opponent indifferent* (that's what's unexploitable).
- "RPS has a clever deterministic counter." → any pattern is exploitable; ⅓ each is the only equilibrium.

## a11y / motion
payoffMatrix `mix`: a 44px slider for the mixing probability; two `aria-live` payoff readouts that
converge at indifference; reduced-motion → static frame at the crossing point.
