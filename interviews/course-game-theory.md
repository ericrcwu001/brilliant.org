# Interview Pack — Game Theory (course-game-theory)

> Dormant capstone asset (ADR-0005/0008): committed but NOT seeded or deployed. This is the
> human-readable mirror of the canonical JSON. Regenerate with
> `./node_modules/.bin/tsx interviews/_build/render-game-theory-md.ts`.

**Green Book anchor:** Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — Ch.2 Brain Teasers: “Screwy pirates” (p.3), “Tiger and sheep” (p.4), “Chocolate bar problem”; plus the standard dominance / Nash / mixed / minimax / backward-induction / Nim quant-interview canon (Joshi QJIQ&A; brainstellar; techinterview; Palacios-Huerta minimax).

**Engine:** `src/engine/gameTheory.ts` (every templated answer is reproduced exactly).

**Counts:** 51 questions — hard 16 / harder 25 / brutal 10; 40 templated, 11 free-form.

## Templates

- **tmpl-pure-nash** — Find all pure Nash equilibria (best-response method). Mark each player’s best responses; mutual best-response cells are the pure NE.  
  _Source:_ Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.
- **tmpl-iesds** — Iterated elimination of strictly dominated strategies. Remove strictly dominated strategies repeatedly until a single cell survives.  
  _Source:_ Gibbons / Osborne IGT (IESDS); GB Ch.2 strategy teasers.
- **tmpl-saddle-value** — Value of a zero-sum game with a saddle point. A saddle (row-min = col-max) gives the pure value of the zero-sum game.  
  _Source:_ Ferguson, Game Theory (UCLA); ZIB Lecture 2 Matrix Games. GB Ch.2.
- **tmpl-mixed-value** — Value of a 2×2 zero-sum game with no saddle. No saddle ⇒ both mix; v = (ad−bc)/(a+d−b−c).  
  _Source:_ Notre Dame Lecture 29 (2×2 value formula); UMass Morra. GB Ch.2.
- **tmpl-mixed-prob** — Optimal mixing probability (indifference). Mix so the opponent is indifferent; p = (d−c)/(a+d−b−c) for row 0.  
  _Source:_ Berkeley econ160 (mixed NE); UMass Morra. GB Ch.2.
- **tmpl-pirate** — Pirate game (backward induction). Backward induction over proposals; ≥50% with proposer tie-break, indifferent pirate votes NO.  
  _Source:_ Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **tmpl-nim-sum** — Nim — the nim-sum (XOR) rule. First player wins iff the XOR of heap sizes is non-zero.  
  _Source:_ Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **tmpl-subtraction** — Subtraction game (take 1..k, last takes wins). P-positions (mover loses) are the multiples of (k+1).  
  _Source:_ NYU take-away notes; Wikipedia Nim §subtraction / §21 game; Bachet. GB Ch.2.
- **tmpl-backward-induction** — Backward induction on a game tree (SPE). Fold the tree from the leaves; each player picks the branch maximizing their own payoff.  
  _Source:_ Wikipedia Centipede game; MIT 14.12; Yale ECON 159 (Stackelberg). GB Ch.2.

## Questions

### Tier: hard (16)

#### tmpl-pure-nash#pd

- **Prompt:** Two suspects each Cooperate or Defect with payoffs (C,C)=(3,3), (C,D)=(0,5), (D,C)=(5,0), (D,D)=(1,1). Find every pure-strategy Nash equilibrium.
- **Answer:** `1,1`
- **Source:** Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.
- **Template:** `tmpl-pure-nash`
- **Engine check:** `tmpl-pure-nash({"payoffs":[[[3,3],[0,5]],[[5,0],[1,1]]]}) → 1,1` — verified: true
- **Approaches:** Mark each player’s best response to every opponent action; the doubly-marked cells are the equilibria. / Check each cell: is the row a best reply to that column AND the column a best reply to that row?
- **Follow-ups:** What if there were no pure equilibrium — what would you do? → Which equilibrium would the players actually coordinate on, and why?

#### tmpl-pure-nash#stag

- **Prompt:** Stag Hunt: (Stag,Stag)=(3,3), (Stag,Hare)=(0,1), (Hare,Stag)=(1,0), (Hare,Hare)=(1,1). Find every pure Nash equilibrium.
- **Answer:** `0,0;1,1`
- **Source:** Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.
- **Template:** `tmpl-pure-nash`
- **Engine check:** `tmpl-pure-nash({"payoffs":[[[3,3],[0,1]],[[1,0],[1,1]]]}) → 0,0;1,1` — verified: true
- **Approaches:** Mark each player’s best response to every opponent action; the doubly-marked cells are the equilibria. / Check each cell: is the row a best reply to that column AND the column a best reply to that row?
- **Follow-ups:** What if there were no pure equilibrium — what would you do? → Which equilibrium would the players actually coordinate on, and why?

#### tmpl-iesds#pd

- **Prompt:** In the Prisoner’s Dilemma (C,C)=(3,3), (C,D)=(0,5), (D,C)=(5,0), (D,D)=(1,1), which single cell survives iterated elimination of strictly dominated strategies?
- **Answer:** `1,1`
- **Source:** Gibbons / Osborne IGT (IESDS); GB Ch.2 strategy teasers.
- **Template:** `tmpl-iesds`
- **Engine check:** `tmpl-iesds({"payoffs":[[[3,3],[0,5]],[[5,0],[1,1]]]}) → 1,1` — verified: true
- **Approaches:** Eliminate any strategy that is strictly worse than another for all opponent choices; repeat as new dominations appear. / Track the surviving rows/cols round by round.
- **Follow-ups:** Does the order of elimination change the survivor under strict dominance? → How does this connect to the guess-⅔-of-the-average game?

#### tmpl-saddle-value#a

- **Prompt:** Zero-sum game, row’s payoffs [[3,5],[2,4]] (column gets the negative). What is the value of the game?
- **Answer:** `3`
- **Source:** Ferguson, Game Theory (UCLA); ZIB Lecture 2 Matrix Games. GB Ch.2.
- **Template:** `tmpl-saddle-value`
- **Engine check:** `tmpl-saddle-value({"matrix":[[3,5],[2,4]]}) → 3` — verified: true
- **Approaches:** Compute each row’s minimum and each column’s maximum; a cell that is both is the value. / Check maximin = minimax.
- **Follow-ups:** What if no saddle existed — how would you find the value? → Why is the saddle entry an equilibrium in pure strategies?

#### tmpl-saddle-value#b

- **Prompt:** Zero-sum game, row’s payoffs [[4,6],[3,5]]. What is the value of the game?
- **Answer:** `4`
- **Source:** Ferguson, Game Theory (UCLA); ZIB Lecture 2 Matrix Games. GB Ch.2.
- **Template:** `tmpl-saddle-value`
- **Engine check:** `tmpl-saddle-value({"matrix":[[4,6],[3,5]]}) → 4` — verified: true
- **Approaches:** Compute each row’s minimum and each column’s maximum; a cell that is both is the value. / Check maximin = minimax.
- **Follow-ups:** What if no saddle existed — how would you find the value? → Why is the saddle entry an equilibrium in pure strategies?

#### tmpl-mixed-prob#mp

- **Prompt:** Matching Pennies, row’s payoffs [[1,-1],[-1,1]]. With what probability should the row player choose the top row in equilibrium?
- **Answer:** `1/2`
- **Source:** Berkeley econ160 (mixed NE); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-prob`
- **Engine check:** `tmpl-mixed-prob({"matrix":[[1,-1],[-1,1]]}) → 1/2` — verified: true
- **Approaches:** Set the opponent’s expected payoffs from their two replies equal and solve for your mix. / Use p=(d−c)/(a+d−b−c).
- **Follow-ups:** What is the resulting value of the game? → What is the opponent’s optimal mix?

#### tmpl-pirate#3-100

- **Prompt:** 3 rational pirates split 100 gold under the standard rules (≥50%, proposer tie-break, indifferent votes no). Give the full senior-to-junior allocation.
- **Answer:** `99,0,1`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **Template:** `tmpl-pirate`
- **Engine check:** `tmpl-pirate({"pirates":3,"coins":100}) → 99,0,1` — verified: true
- **Approaches:** Solve the 1-, 2-, 3-… pirate subgames in turn; each pirate compares your offer to the fallback if you’re thrown overboard. / Bribe the cheapest votes you need, one coin each.
- **Follow-ups:** Generalize: with 2n+1 pirates, how much does the captain keep? → What changes if an indifferent pirate votes YES instead?

#### tmpl-pirate#4-100

- **Prompt:** 4 pirates, 100 gold, standard rules. Give the full senior-to-junior allocation.
- **Answer:** `99,0,1,0`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **Template:** `tmpl-pirate`
- **Engine check:** `tmpl-pirate({"pirates":4,"coins":100}) → 99,0,1,0` — verified: true
- **Approaches:** Solve the 1-, 2-, 3-… pirate subgames in turn; each pirate compares your offer to the fallback if you’re thrown overboard. / Bribe the cheapest votes you need, one coin each.
- **Follow-ups:** Generalize: with 2n+1 pirates, how much does the captain keep? → What changes if an indifferent pirate votes YES instead?

#### tmpl-nim-sum#3-4-5

- **Prompt:** Nim with heaps (3,4,5), last to take wins. What is the nim-sum (and hence who wins)? Report the nim-sum.
- **Answer:** `2`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[3,4,5]}) → 2` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### tmpl-subtraction#12-3

- **Prompt:** A pile of 12; each turn remove 1–3; last to take wins. Report your winning first move (0 means the position is losing for you).
- **Answer:** `0`
- **Source:** NYU take-away notes; Wikipedia Nim §subtraction / §21 game; Bachet. GB Ch.2.
- **Template:** `tmpl-subtraction`
- **Engine check:** `tmpl-subtraction({"pile":12,"maxRemove":3}) → 0` — verified: true
- **Approaches:** Find positions from which every move hands the opponent a winning position. / Land the opponent on a multiple of (k+1).
- **Follow-ups:** How many tokens do you take on your first move? → How does the verbal “21” (misère) version differ?

#### tmpl-backward-induction#entry

- **Prompt:** Entry deterrence: the entrant chooses Enter or Stay out; if Enter, the incumbent chooses Fight ([-1,-1]) or Accommodate ([2,1]); Stay out gives [0,3]. What is the subgame-perfect payoff?
- **Answer:** `2,1`
- **Source:** Wikipedia Centipede game; MIT 14.12; Yale ECON 159 (Stackelberg). GB Ch.2.
- **Template:** `tmpl-backward-induction`
- **Engine check:** `tmpl-backward-induction({"tree":{"kind":"decision","player":0,"moves":[{"label":"Enter","child":{"kind":"decision","player":1,"moves":[{"label":"Fight","child":{"kind":"leaf","payoff":[{"n":-1,"d":1},{"n":-1,"d":1}]}},{"label":"Accommodate","child":{"kind":"leaf","payoff":[{"n":2,"d":1},{"n":1,"d":1}]}}]}},{"label":"Stay out","child":{"kind":"leaf","payoff":[{"n":0,"d":1},{"n":3,"d":1}]}}]}}) → 2,1` — verified: true
- **Approaches:** Solve the last decision first, then replace each subtree by its backward-induction payoff. / Propagate the chosen branches up to the root.
- **Follow-ups:** Is the SPE outcome Pareto-efficient here? → Which Nash equilibria are ruled out by subgame perfection?

#### tmpl-saddle-value#d

- **Prompt:** Zero-sum game, row’s payoffs [[7,9],[6,8]]. What is the value of the game?
- **Answer:** `7`
- **Source:** Ferguson, Game Theory (UCLA); ZIB Lecture 2 Matrix Games. GB Ch.2.
- **Template:** `tmpl-saddle-value`
- **Engine check:** `tmpl-saddle-value({"matrix":[[7,9],[6,8]]}) → 7` — verified: true
- **Approaches:** Compute each row’s minimum and each column’s maximum; a cell that is both is the value. / Check maximin = minimax.
- **Follow-ups:** What if no saddle existed — how would you find the value? → Why is the saddle entry an equilibrium in pure strategies?

#### ff-tiger-sheep-100

- **Prompt:** 100 tigers and 1 sheep live on an island with only grass. Any tiger that eats the sheep itself becomes a sheep (and is then edible). All tigers are rational and value survival first. Is the sheep eaten?
- **Answer:** `safe`
- **Source:** Green Book Ch.2 “Tiger and sheep” p.4.
- **Engine check:** `tigerSheepEaten(100) === false` — verified: true
- **Approaches:** Backward induction on the count: with 1 tiger the sheep is eaten; this flips with each added tiger. / Parity: even count ⇒ safe, odd ⇒ eaten.
- **Follow-ups:** What about 99 tigers? → State the general rule by parity.

#### ff-chocolate-6x8

- **Prompt:** A 6×8 chocolate bar (48 unit squares). Each break splits one rectangular piece into two along a grid line. What is the minimum number of breaks to reduce it to 48 unit squares?
- **Answer:** `47`
- **Source:** Green Book Ch.2 “Chocolate bar problem.”
- **Engine check:** `6 * 8 - 1 === 47` — verified: true
- **Approaches:** Track an invariant: every break increases the number of pieces by exactly one. / Start with one piece, end with mn pieces.
- **Follow-ups:** Does the order of breaks change the count? → Generalize to an m×n bar.

#### ff-guess-23-average

- **Prompt:** Everyone picks a real number in [0,100]; the winner is closest to 2/3 of the average of all picks. Under common knowledge of rationality, what is the unique Nash-equilibrium guess?
- **Answer:** `0`
- **Source:** Wikipedia “Guess 2/3 of the average”; Nagel (1995); Keynes’s beauty contest.
- **Engine check:** `iterated dominance fixed point of x = (2/3)·avg` — verified: true
- **Approaches:** Iterated elimination: nobody picks above 2/3·100, then above 2/3 of that, … / Find the fixed point of the best-response map.
- **Follow-ups:** Why do real players land near 20–35? → How is this a metaphor for markets?

#### ff-rps-mix

- **Prompt:** In Rock-Paper-Scissors (win +1, lose −1, tie 0), what is the unique equilibrium strategy?
- **Answer:** `1/3`
- **Source:** UNC-Charlotte ECON3161; Berkeley econ160 (RPS mixed NE).
- **Engine check:** `pureNashEquilibria(RPS) === [] (no pure NE); uniform mix by symmetry` — verified: true
- **Approaches:** By symmetry each action is played with equal probability. / Make the opponent indifferent across all three actions.
- **Follow-ups:** What is the value of the game? → How would you exploit a biased human opponent?

### Tier: harder (25)

#### tmpl-pure-nash#bos

- **Prompt:** Battle of the Sexes: matching at venue 1 gives (3,2), matching at venue 2 gives (2,3), mismatching gives (0,0). Find every pure Nash equilibrium.
- **Answer:** `0,0;1,1`
- **Source:** Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.
- **Template:** `tmpl-pure-nash`
- **Engine check:** `tmpl-pure-nash({"payoffs":[[[3,2],[0,0]],[[0,0],[2,3]]]}) → 0,0;1,1` — verified: true
- **Approaches:** Mark each player’s best response to every opponent action; the doubly-marked cells are the equilibria. / Check each cell: is the row a best reply to that column AND the column a best reply to that row?
- **Follow-ups:** What if there were no pure equilibrium — what would you do? → Which equilibrium would the players actually coordinate on, and why?

#### tmpl-pure-nash#chicken

- **Prompt:** Chicken: (Swerve,Swerve)=(4,4), (Swerve,Straight)=(2,5), (Straight,Swerve)=(5,2), (Straight,Straight)=(1,1). Find every pure Nash equilibrium.
- **Answer:** `0,1;1,0`
- **Source:** Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.
- **Template:** `tmpl-pure-nash`
- **Engine check:** `tmpl-pure-nash({"payoffs":[[[4,4],[2,5]],[[5,2],[1,1]]]}) → 0,1;1,0` — verified: true
- **Approaches:** Mark each player’s best response to every opponent action; the doubly-marked cells are the equilibria. / Check each cell: is the row a best reply to that column AND the column a best reply to that row?
- **Follow-ups:** What if there were no pure equilibrium — what would you do? → Which equilibrium would the players actually coordinate on, and why?

#### tmpl-pure-nash#mp

- **Prompt:** Matching Pennies (zero-sum): the row player wins +1 on a match, the column player wins +1 on a mismatch. How many pure Nash equilibria are there?
- **Answer:** `none`
- **Source:** Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.
- **Template:** `tmpl-pure-nash`
- **Engine check:** `tmpl-pure-nash({"payoffs":[[[1,-1],[-1,1]],[[-1,1],[1,-1]]]}) → none` — verified: true
- **Approaches:** Mark each player’s best response to every opponent action; the doubly-marked cells are the equilibria. / Check each cell: is the row a best reply to that column AND the column a best reply to that row?
- **Follow-ups:** What if there were no pure equilibrium — what would you do? → Which equilibrium would the players actually coordinate on, and why?

#### tmpl-saddle-value#c

- **Prompt:** Zero-sum game, row’s payoffs [[8,5,6],[2,4,3],[7,9,1]]. Find the value (look for a saddle point).
- **Answer:** `mixed`
- **Source:** Ferguson, Game Theory (UCLA); ZIB Lecture 2 Matrix Games. GB Ch.2.
- **Template:** `tmpl-saddle-value`
- **Engine check:** `tmpl-saddle-value({"matrix":[[8,5,6],[2,4,3],[7,9,1]]}) → mixed` — verified: true
- **Approaches:** Compute each row’s minimum and each column’s maximum; a cell that is both is the value. / Check maximin = minimax.
- **Follow-ups:** What if no saddle existed — how would you find the value? → Why is the saddle entry an equilibrium in pure strategies?

#### tmpl-mixed-value#mp

- **Prompt:** Matching Pennies, row’s payoffs [[1,-1],[-1,1]] (zero-sum). What is the value of the game?
- **Answer:** `0`
- **Source:** Notre Dame Lecture 29 (2×2 value formula); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-value`
- **Engine check:** `tmpl-mixed-value({"matrix":[[1,-1],[-1,1]]}) → 0` — verified: true
- **Approaches:** Confirm no saddle, then apply the 2×2 value formula. / Set the opponent indifferent between their columns and solve.
- **Follow-ups:** What mix achieves this value? → How does the value change if you add a constant to every payoff?

#### tmpl-mixed-value#morra

- **Prompt:** Two-finger Morra (zero-sum), row’s payoffs [[2,-3],[-3,4]]. What is the value of the game?
- **Answer:** `-1/12`
- **Source:** Notre Dame Lecture 29 (2×2 value formula); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-value`
- **Engine check:** `tmpl-mixed-value({"matrix":[[2,-3],[-3,4]]}) → -1/12` — verified: true
- **Approaches:** Confirm no saddle, then apply the 2×2 value formula. / Set the opponent indifferent between their columns and solve.
- **Follow-ups:** What mix achieves this value? → How does the value change if you add a constant to every payoff?

#### tmpl-mixed-value#nosaddle

- **Prompt:** Zero-sum game with no saddle, row’s payoffs [[1,3],[4,2]]. What is the value of the game?
- **Answer:** `5/2`
- **Source:** Notre Dame Lecture 29 (2×2 value formula); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-value`
- **Engine check:** `tmpl-mixed-value({"matrix":[[1,3],[4,2]]}) → 5/2` — verified: true
- **Approaches:** Confirm no saddle, then apply the 2×2 value formula. / Set the opponent indifferent between their columns and solve.
- **Follow-ups:** What mix achieves this value? → How does the value change if you add a constant to every payoff?

#### tmpl-mixed-prob#morra

- **Prompt:** Two-finger Morra, row’s payoffs [[2,-3],[-3,4]]. With what probability should the row player show one finger (top row) in equilibrium?
- **Answer:** `7/12`
- **Source:** Berkeley econ160 (mixed NE); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-prob`
- **Engine check:** `tmpl-mixed-prob({"matrix":[[2,-3],[-3,4]]}) → 7/12` — verified: true
- **Approaches:** Set the opponent’s expected payoffs from their two replies equal and solve for your mix. / Use p=(d−c)/(a+d−b−c).
- **Follow-ups:** What is the resulting value of the game? → What is the opponent’s optimal mix?

#### tmpl-mixed-prob#nosaddle

- **Prompt:** Zero-sum game, row’s payoffs [[1,3],[4,2]]. With what probability should the row player choose the top row in equilibrium?
- **Answer:** `1/2`
- **Source:** Berkeley econ160 (mixed NE); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-prob`
- **Engine check:** `tmpl-mixed-prob({"matrix":[[1,3],[4,2]]}) → 1/2` — verified: true
- **Approaches:** Set the opponent’s expected payoffs from their two replies equal and solve for your mix. / Use p=(d−c)/(a+d−b−c).
- **Follow-ups:** What is the resulting value of the game? → What is the opponent’s optimal mix?

#### tmpl-pirate#5-100

- **Prompt:** 5 rational pirates split 100 gold; the most senior proposes, all vote, ≥50% (proposer breaks ties) passes or he’s thrown overboard. An indifferent pirate votes no. Give the full senior-to-junior allocation.
- **Answer:** `98,0,1,0,1`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **Template:** `tmpl-pirate`
- **Engine check:** `tmpl-pirate({"pirates":5,"coins":100}) → 98,0,1,0,1` — verified: true
- **Approaches:** Solve the 1-, 2-, 3-… pirate subgames in turn; each pirate compares your offer to the fallback if you’re thrown overboard. / Bribe the cheapest votes you need, one coin each.
- **Follow-ups:** Generalize: with 2n+1 pirates, how much does the captain keep? → What changes if an indifferent pirate votes YES instead?

#### tmpl-pirate#5-10

- **Prompt:** 5 pirates split only 10 gold under the standard rules. Give the full senior-to-junior allocation.
- **Answer:** `8,0,1,0,1`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **Template:** `tmpl-pirate`
- **Engine check:** `tmpl-pirate({"pirates":5,"coins":10}) → 8,0,1,0,1` — verified: true
- **Approaches:** Solve the 1-, 2-, 3-… pirate subgames in turn; each pirate compares your offer to the fallback if you’re thrown overboard. / Bribe the cheapest votes you need, one coin each.
- **Follow-ups:** Generalize: with 2n+1 pirates, how much does the captain keep? → What changes if an indifferent pirate votes YES instead?

#### tmpl-nim-sum#1-4-5

- **Prompt:** Nim with heaps (1,4,5). Report the nim-sum (a value of 0 means the player to move loses).
- **Answer:** `0`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[1,4,5]}) → 0` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### tmpl-nim-sum#1-2-3

- **Prompt:** Nim with heaps (1,2,3). Report the nim-sum.
- **Answer:** `0`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[1,2,3]}) → 0` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### tmpl-subtraction#21-4

- **Prompt:** A pile of 21; each turn remove 1–4; last to take wins. Report your winning first move (0 = losing position).
- **Answer:** `1`
- **Source:** NYU take-away notes; Wikipedia Nim §subtraction / §21 game; Bachet. GB Ch.2.
- **Template:** `tmpl-subtraction`
- **Engine check:** `tmpl-subtraction({"pile":21,"maxRemove":4}) → 1` — verified: true
- **Approaches:** Find positions from which every move hands the opponent a winning position. / Land the opponent on a multiple of (k+1).
- **Follow-ups:** How many tokens do you take on your first move? → How does the verbal “21” (misère) version differ?

#### tmpl-subtraction#100-10

- **Prompt:** Race to 100: a running total reaches 100; each turn add 1–10; the one who hits 100 wins. Report the first player’s winning opening move (0 = losing).
- **Answer:** `1`
- **Source:** NYU take-away notes; Wikipedia Nim §subtraction / §21 game; Bachet. GB Ch.2.
- **Template:** `tmpl-subtraction`
- **Engine check:** `tmpl-subtraction({"pile":100,"maxRemove":10}) → 1` — verified: true
- **Approaches:** Find positions from which every move hands the opponent a winning position. / Land the opponent on a multiple of (k+1).
- **Follow-ups:** How many tokens do you take on your first move? → How does the verbal “21” (misère) version differ?

#### tmpl-subtraction#15-4

- **Prompt:** A pile of 15; remove 1–4 each turn; last to take wins. Report your winning first move (0 = losing).
- **Answer:** `0`
- **Source:** NYU take-away notes; Wikipedia Nim §subtraction / §21 game; Bachet. GB Ch.2.
- **Template:** `tmpl-subtraction`
- **Engine check:** `tmpl-subtraction({"pile":15,"maxRemove":4}) → 0` — verified: true
- **Approaches:** Find positions from which every move hands the opponent a winning position. / Land the opponent on a multiple of (k+1).
- **Follow-ups:** How many tokens do you take on your first move? → How does the verbal “21” (misère) version differ?

#### tmpl-backward-induction#centipede

- **Prompt:** A 4-move centipede: at each node a player can Take (ending the game) or Pass (growing the pot); Take/Pass leaves are [1,0],[0,2],[3,0],[0,4] and final Pass gives [2,2]. What is the subgame-perfect payoff?
- **Answer:** `1,0`
- **Source:** Wikipedia Centipede game; MIT 14.12; Yale ECON 159 (Stackelberg). GB Ch.2.
- **Template:** `tmpl-backward-induction`
- **Engine check:** `tmpl-backward-induction({"tree":{"kind":"decision","player":0,"moves":[{"label":"Take","child":{"kind":"leaf","payoff":[{"n":1,"d":1},{"n":0,"d":1}]}},{"label":"Pass","child":{"kind":"decision","player":1,"moves":[{"label":"Take","child":{"kind":"leaf","payoff":[{"n":0,"d":1},{"n":2,"d":1}]}},{"label":"Pass","child":{"kind":"decision","player":0,"moves":[{"label":"Take","child":{"kind":"leaf","payoff":[{"n":3,"d":1},{"n":0,"d":1}]}},{"label":"Pass","child":{"kind":"decision","player":1,"moves":[{"label":"Take","child":{"kind":"leaf","payoff":[{"n":0,"d":1},{"n":4,"d":1}]}},{"label":"Pass","child":{"kind":"leaf","payoff":[{"n":2,"d":1},{"n":2,"d":1}]}}]}}]}}]}}]}}) → 1,0` — verified: true
- **Approaches:** Solve the last decision first, then replace each subtree by its backward-induction payoff. / Propagate the chosen branches up to the root.
- **Follow-ups:** Is the SPE outcome Pareto-efficient here? → Which Nash equilibria are ruled out by subgame perfection?

#### tmpl-mixed-value#5-1-2-4

- **Prompt:** Zero-sum game, row’s payoffs [[5,1],[2,4]] (no saddle). What is the value of the game?
- **Answer:** `3`
- **Source:** Notre Dame Lecture 29 (2×2 value formula); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-value`
- **Engine check:** `tmpl-mixed-value({"matrix":[[5,1],[2,4]]}) → 3` — verified: true
- **Approaches:** Confirm no saddle, then apply the 2×2 value formula. / Set the opponent indifferent between their columns and solve.
- **Follow-ups:** What mix achieves this value? → How does the value change if you add a constant to every payoff?

#### tmpl-nim-sum#4-8-12

- **Prompt:** Nim with heaps (4,8,12). Report the nim-sum.
- **Answer:** `0`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[4,8,12]}) → 0` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### tmpl-subtraction#30-5

- **Prompt:** A pile of 30; remove 1–5 each turn; last to take wins. Report your winning first move (0 = losing position).
- **Answer:** `0`
- **Source:** NYU take-away notes; Wikipedia Nim §subtraction / §21 game; Bachet. GB Ch.2.
- **Template:** `tmpl-subtraction`
- **Engine check:** `tmpl-subtraction({"pile":30,"maxRemove":5}) → 0` — verified: true
- **Approaches:** Find positions from which every move hands the opponent a winning position. / Land the opponent on a multiple of (k+1).
- **Follow-ups:** How many tokens do you take on your first move? → How does the verbal “21” (misère) version differ?

#### ff-tiger-sheep-99

- **Prompt:** Same island rules as the tiger-and-sheep puzzle, but now there are 99 tigers and 1 sheep. Is the sheep eaten?
- **Answer:** `eaten`
- **Source:** Green Book Ch.2 “Tiger and sheep” p.4.
- **Engine check:** `tigerSheepEaten(99) === true` — verified: true
- **Approaches:** Apply the parity rule from the 100-tiger case. / Backward induction from one tiger.
- **Follow-ups:** Prove the parity rule by induction.

#### ff-pirate-2n1-keep

- **Prompt:** With 2n+1 perfectly rational pirates and 100 gold under the standard rules (≥50%, proposer tie-break, indifferent votes no), how much does the captain keep when n=2 (i.e. 5 pirates)?
- **Answer:** `98`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Wikipedia Pirate game.
- **Engine check:** `pirateGame(5,100)[0] === 98` — verified: true
- **Approaches:** General rule: keep 100−n, bribing n juniors one coin each. / Backward induction over the subgames.
- **Follow-ups:** What is the allocation vector for 5 pirates? → How does it grow as n increases?

#### ff-coins-on-table

- **Prompt:** Two players alternately place identical coins (no overlap, fully on the table) on a circular table; the player who cannot move loses. Do you move first or second, and what is the strategy?
- **Answer:** `center`
- **Source:** techinterview.org “Coin on a Table”; ThatsMaths “The Beer-Mat Game.”
- **Engine check:** `central-symmetry strategy-stealing (geometry)` — verified: true
- **Approaches:** Exploit the table’s center of symmetry. / Mirror the opponent through the center after a first central move.
- **Follow-ups:** Why does this fail for an asymmetric table? → Relate it to the strategy-stealing argument.

#### ff-minimax-theorem

- **Prompt:** Does every finite two-player zero-sum game have a well-defined value (the most the row player can guarantee equals the least the column player can hold them to)?
- **Answer:** `yes`
- **Source:** von Neumann (1928) minimax theorem; Ferguson, Game Theory.
- **Engine check:** `maximin = minimax for any finite zero-sum game (von Neumann)` — verified: true
- **Approaches:** Cite the minimax theorem: maximin = minimax with mixed strategies. / In zero-sum games Nash equilibrium coincides with the minimax/maximin solution.
- **Follow-ups:** Who proved it, and when? → How do you compute the value for a large game?

#### ff-centipede-spe

- **Prompt:** In a finite centipede game where passing always grows the pot, what does backward induction predict the first player does?
- **Answer:** `take`
- **Source:** Wikipedia Centipede game; MIT 14.12.
- **Engine check:** `backward induction folds to Take at the first node` — verified: true
- **Approaches:** Fold from the last node: each mover prefers Take to the future they’d face. / The unravelling reaches the first node.
- **Follow-ups:** Why is cooperation not subgame-perfect here? → How do humans actually play it?

### Tier: brutal (10)

#### tmpl-iesds#3x3

- **Prompt:** A 3×3 game has row payoffs [[0,1,9],[2,3,1],[1,1,1]] and column payoffs [[3,1,0],[3,1,0],[0,5,0]] (cells are (row,col)). Which single (row,col) cell survives iterated elimination of strictly dominated strategies?
- **Answer:** `1,0`
- **Source:** Gibbons / Osborne IGT (IESDS); GB Ch.2 strategy teasers.
- **Template:** `tmpl-iesds`
- **Engine check:** `tmpl-iesds({"payoffs":[[[0,3],[1,1],[9,0]],[[2,3],[3,1],[1,0]],[[1,0],[1,5],[1,0]]]}) → 1,0` — verified: true
- **Approaches:** Eliminate any strategy that is strictly worse than another for all opponent choices; repeat as new dominations appear. / Track the surviving rows/cols round by round.
- **Follow-ups:** Does the order of elimination change the survivor under strict dominance? → How does this connect to the guess-⅔-of-the-average game?

#### tmpl-mixed-value#brutal

- **Prompt:** Zero-sum game, row’s payoffs [[0,-2],[-5,3]] (no saddle). What is the value of the game?
- **Answer:** `-1`
- **Source:** Notre Dame Lecture 29 (2×2 value formula); UMass Morra. GB Ch.2.
- **Template:** `tmpl-mixed-value`
- **Engine check:** `tmpl-mixed-value({"matrix":[[0,-2],[-5,3]]}) → -1` — verified: true
- **Approaches:** Confirm no saddle, then apply the 2×2 value formula. / Set the opponent indifferent between their columns and solve.
- **Follow-ups:** What mix achieves this value? → How does the value change if you add a constant to every payoff?

#### tmpl-pirate#7-100

- **Prompt:** 7 pirates, 100 gold, standard rules. Give the full senior-to-junior allocation.
- **Answer:** `97,0,1,0,1,0,1`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **Template:** `tmpl-pirate`
- **Engine check:** `tmpl-pirate({"pirates":7,"coins":100}) → 97,0,1,0,1,0,1` — verified: true
- **Approaches:** Solve the 1-, 2-, 3-… pirate subgames in turn; each pirate compares your offer to the fallback if you’re thrown overboard. / Bribe the cheapest votes you need, one coin each.
- **Follow-ups:** Generalize: with 2n+1 pirates, how much does the captain keep? → What changes if an indifferent pirate votes YES instead?

#### tmpl-nim-sum#5-7-9

- **Prompt:** Nim with heaps (5,7,9). Report the nim-sum.
- **Answer:** `11`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[5,7,9]}) → 11` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### tmpl-nim-sum#2-3-4-5

- **Prompt:** Nim with four heaps (2,3,4,5). Report the nim-sum.
- **Answer:** `0`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[2,3,4,5]}) → 0` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### tmpl-backward-induction#stackelberg

- **Prompt:** A leader picks Low or High; the follower then picks Low or High. Leaf payoffs: Low/Low [2,2], Low/High [3,1], High/Low [1,3], High/High [0,0]. What is the subgame-perfect payoff?
- **Answer:** `2,2`
- **Source:** Wikipedia Centipede game; MIT 14.12; Yale ECON 159 (Stackelberg). GB Ch.2.
- **Template:** `tmpl-backward-induction`
- **Engine check:** `tmpl-backward-induction({"tree":{"kind":"decision","player":0,"moves":[{"label":"Low","child":{"kind":"decision","player":1,"moves":[{"label":"Low","child":{"kind":"leaf","payoff":[{"n":2,"d":1},{"n":2,"d":1}]}},{"label":"High","child":{"kind":"leaf","payoff":[{"n":3,"d":1},{"n":1,"d":1}]}}]}},{"label":"High","child":{"kind":"decision","player":1,"moves":[{"label":"Low","child":{"kind":"leaf","payoff":[{"n":1,"d":1},{"n":3,"d":1}]}},{"label":"High","child":{"kind":"leaf","payoff":[{"n":0,"d":1},{"n":0,"d":1}]}}]}}]}}) → 2,2` — verified: true
- **Approaches:** Solve the last decision first, then replace each subtree by its backward-induction payoff. / Propagate the chosen branches up to the root.
- **Follow-ups:** Is the SPE outcome Pareto-efficient here? → Which Nash equilibria are ruled out by subgame perfection?

#### tmpl-pirate#6-100

- **Prompt:** 6 pirates, 100 gold, standard rules (≥50%, proposer tie-break, indifferent votes no). Give the full senior-to-junior allocation.
- **Answer:** `98,0,1,0,1,0`
- **Source:** Green Book Ch.2 “Screwy pirates” p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.
- **Template:** `tmpl-pirate`
- **Engine check:** `tmpl-pirate({"pirates":6,"coins":100}) → 98,0,1,0,1,0` — verified: true
- **Approaches:** Solve the 1-, 2-, 3-… pirate subgames in turn; each pirate compares your offer to the fallback if you’re thrown overboard. / Bribe the cheapest votes you need, one coin each.
- **Follow-ups:** Generalize: with 2n+1 pirates, how much does the captain keep? → What changes if an indifferent pirate votes YES instead?

#### tmpl-nim-sum#7-11-13

- **Prompt:** Nim with heaps (7,11,13). Report the nim-sum.
- **Answer:** `1`
- **Source:** Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.
- **Template:** `tmpl-nim-sum`
- **Engine check:** `tmpl-nim-sum({"heaps":[7,11,13]}) → 1` — verified: true
- **Approaches:** Compute the bitwise XOR of all heap sizes. / A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.
- **Follow-ups:** What is the actual winning move from here? → How does misère Nim change the endgame?

#### ff-misere-nim

- **Prompt:** In misère Nim (last to take LOSES), when all heaps have more than one token, is the optimal strategy the same as normal Nim (last to take wins)?
- **Answer:** `yes`
- **Source:** Wikipedia Nim §Misère; Bouton (1901).
- **Engine check:** `misère Nim plays identically to normal Nim until heaps are all ≤1` — verified: true
- **Approaches:** Play the normal nim-sum strategy until exactly one heap exceeds one token, then deviate. / Only the endgame differs between normal and misère.
- **Follow-ups:** Describe the endgame switch precisely. → When exactly do you deviate from the nim-sum move?

#### ff-traveler-dilemma

- **Prompt:** Two travelers each claim an integer dollar amount between 2 and 100; both are paid the lower claim, with a +2 bonus to the lower claimant and a −2 penalty to the higher. What is the unique Nash equilibrium claim?
- **Answer:** `2`
- **Source:** Kaushik Basu, “The Traveler’s Dilemma” (Scientific American); Wikipedia.
- **Engine check:** `iterated (weak) dominance collapses to the minimum claim` — verified: true
- **Approaches:** Undercutting any common claim k by one dollar pays k+1 > k — iterate down. / Find the only profile with no profitable deviation.
- **Follow-ups:** Why do people not play the equilibrium? → How does the bonus/penalty size affect behavior?

