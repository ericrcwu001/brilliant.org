# Game Theory — Source Dossier (Source Miner / Fact-checker)

> Verified, cited, answer-checked problem set for the **Game Theory** concept (6 lessons L1–L6).
> Ground truth = the canonical quant-interview books (Green Book, Mark Joshi, Heard on the Street)
> + reputable quant-puzzle sites (brainstellar, techinterview, quantt) + authoritative
> game-theory references (Wikipedia, Osborne *IGT*, Ferguson *Game Theory*, von Neumann minimax,
> Palacios-Huerta *Professionals Play Minimax*).
>
> **Iron rules honored:** every problem reads like a real quant/trading-interview question or comes
> straight from the canonical books; every record carries an exact canonical answer + at least one
> real source (URL or book/section); nothing invented. Every answer is flagged for whether the
> lesson app's exact-arithmetic engine can independently recompute it, and with which routine.
> Contested / assumption-dependent answers are flagged inline **and** consolidated in §7.
>
> **Note on Green Book access.** The brief warned that the Green Book's full text would not be
> available. In fact, full-text web copies *were* fetchable (yumpu.com doc `65965041`;
> usermanual.wiki doc `604244935`), so the three Green Book items below (**Screwy pirates**,
> **Tiger and sheep**, **Chocolate bar problem**, all in Ch.2 "Brain Teasers") are quoted/verified
> against those copies rather than cited only by reputation. They are treated as web-corroborated.

---

## 0. Concept anchor (for the concept brief)

**Game theory is well-trodden, legitimate quant-interview territory.** The single most famous
"strategy" brain teaser in the quant canon — the **Pirate / treasure-splitting problem** — is
literally Problem 1 of Chapter 2 ("Brain Teasers") of Xinfeng Zhou's *A Practical Guide to
Quantitative Finance Interviews* (the **Green Book**), under the name **"Screwy pirates,"** whose
own solution says *"If you have not studied game theory or dynamic programming, this strategy
problem may appear to be daunting."* The same backward-induction family is covered in **Mark
Joshi, Nick Denson & Andrew Downes, *Quant Job Interview Questions and Answers*** (2008), and the
pirates puzzle headlines **brainstellar.com's "Strategy puzzles"** album ("Puzzles from Quant
Interviews") and modern firm-specific guides that list it among real **SIG / Jane Street / Optiver
/ IMC / Citadel / HRT** questions (quantt.co.uk). Beyond pirates, the interview canon routinely
asks **Nim and "race-to-21/100" winning-strategy** questions, the **coins-on-a-round-table** game
(techinterview.org's classic), and zero-sum/mixed-strategy reasoning (penalty-kick / "bluffing"
intuition; Palacios-Huerta's penalty-kick study is the textbook real-world test of von Neumann's
minimax theorem, *Review of Economic Studies* 70(2), 2003). **Heard on the Street** (Timothy Crack)
and the broader brain-teaser literature round out the same logic-and-strategy material. So the six
lessons below are not invented puzzles — they are the standard dominance / Nash / mixed-strategy /
zero-sum / backward-induction / combinatorial-game toolkit that these books and desks actually test.

**Anchor sources:** Green Book Ch.2 (Screwy pirates, p.3) · Mark Joshi *QJIQ&A* (2008) ·
brainstellar.com/puzzles/strategy/2 · quantt.co.uk/resources/quant-brain-teasers ·
techinterview.org · Palacios-Huerta, *RES* 70(2) 2003.

---

## 1. How to read this dossier

Per-problem fields: **Statement** · **Answer (exact)** · **Source(s)** · **Engine-verifiable?** ·
**Notes/subtleties**. Engine-routine tags (per the brief's engine spec):

| Tag | Engine routine |
|---|---|
| `pure-Nash` | enumerate best responses, find pure-strategy Nash equilibria of a small matrix |
| `IESDS` | iterated elimination of (strictly/weakly) dominated strategies |
| `mixed-prob` | solve the indifference equations → exact mixing fractions |
| `game-value` | value of a 2×2 (or small) zero-sum game (saddle point, or `v=(ad−bc)/(a+d−b−c)`) |
| `nim-sum` | XOR of heap sizes / mod-(k+1) residue → winning position & move |
| `backward-induction` | fold a finite game tree / sequential proposal to a subgame-perfect outcome |
| `invariant` | monovariant/parity counting argument (e.g. chocolate breaks) |

"Exact?" = **Y** when the headline answer is an exact integer/rational a small exact-arithmetic
engine reproduces; **partly** when the *structure* is exact but a specific number is empirical or
non-rational.

---

## L1 — Dominance & the Prisoner's Dilemma

*Concepts: strict/weak dominance, dominant strategies, iterated elimination (IESDS), why mutual
rationality can trap both players below the cooperative outcome.*

### L1.1 — The Prisoner's Dilemma (strict dominance)
- **Statement.** Two suspects are interrogated separately. Each may **Cooperate** (stay silent) or
  **Defect** (confess). Payoffs (higher = better): both cooperate → **(3,3)**; both defect →
  **(1,1)**; if one defects while the other cooperates → defector **5**, cooperator **0**. What does
  each rational player do, and what is the outcome?
- **Answer.** **Defect** strictly dominates Cooperate for both (5>3 and 1>0). The unique Nash
  equilibrium is **(Defect, Defect) = (1,1)** — even though **(Cooperate, Cooperate) = (3,3)**
  Pareto-dominates it. Generic PD requires `T > R > P > S` (5>3>1>0) and `2R > T+S`.
- **Source(s).** Wikipedia *Prisoner's dilemma*; straylight IPD talk (`maths.straylight.co.uk/edb_files/ipd_talk.pdf`,
  payoffs 3/1/4/0 variant + Tit-for-Tat). It is *the* opening example in essentially every
  game-theory text and quant brain-teaser deck.
- **Engine-verifiable?** **Y** — `pure-Nash` + `IESDS` (defect is a strictly dominant strategy;
  unique pure NE). Exact integers.
- **Notes.** The one-shot result is unambiguous. The **finitely-iterated** PD still unravels to
  all-Defect by backward induction; **infinitely/indefinitely** repeated play supports cooperation
  (Tit-for-Tat) — keep the one-shot vs repeated distinction crisp.

### L1.2 — Guess 2/3 of the average (Keynesian beauty contest)
- **Statement.** Each of *n* players simultaneously picks a real number in **[0, 100]**. The winner
  is whoever is closest to **2/3 of the average** of all picks. What number should you choose?
- **Answer.** **0.** Iterated dominance: nobody rational picks above ⅔·100 = 66.7; given that, nobody
  picks above ⅔·66.7 = 44.4; … the only fixed point / unique Nash equilibrium is everyone picks
  **0**.
- **Source(s).** Wikipedia *Guess 2/3 of the average*; Trifunović, *IJoES* 2012
  (`iises.net/.../pp117-137`); Davy.ie "the two-thirds game" (Keynes' beauty-contest framing);
  Nagel (1995) experiments.
- **Engine-verifiable?** **Y** — `IESDS` → unique pure NE = 0 (engine can show each elimination
  round and the fixed point). The "winner" depends on others' picks, but the **equilibrium** is the
  exact value 0.
- **Notes (assumption-dependent — see §7).** Equilibrium 0 requires **common knowledge of
  rationality**. The first round removes only *strictly* dominated picks (>66.7); subsequent rounds
  use **weak** dominance. Real humans land ~20–35 (finite "k-level" reasoning), so the *winning
  guess* in practice ≠ 0 — this is the lesson's whole point and is the Keynesian-markets analogy.

### L1.3 — Traveler's dilemma
- **Statement.** Two travelers' identical antiques are lost; each independently writes a claim
  **between $2 and $100**. Both are paid the **lower** claim; the lower claimant additionally gets a
  **+$2** bonus and the higher claimant a **−$2** penalty. What do you claim?
- **Answer.** Unique Nash equilibrium **(2, 2)** — both claim the minimum. (Any common claim k>2 is
  beaten by undercutting to k−1: you get (k−1)+2 = k+1 > k.)
- **Source(s).** Wikipedia *Traveler's dilemma*; **Kaushik Basu** (originator), *Scientific American*
  "The Traveler's Dilemma"; Investopedia *Traveler's dilemma*; SciELO "On Rationality in the TD."
- **Engine-verifiable?** **Y** — `IESDS`/`pure-Nash` (iterated *weak* dominance collapses to the
  single equilibrium (2,2)). Exact integers.
- **Notes (assumption-dependent — see §7).** A "paradox of rationality": the Nash answer (2,2) is
  far worse than naive (100,100). Relies on iterated **weak** dominance + common-knowledge
  rationality; experimentally violated (people play near 100, especially with small bonus/penalty).
  Same family as the centipede game (L5.4).

*(L1 has 3 strong canonical problems; PD covers strict dominance, 2/3-average and traveler's
dilemma cover IESDS / weak dominance. The Green Book's "Tiger and sheep" parity problem (L5.2) is
also a clean iterated-reasoning item if a 4th is wanted.)*

---

## L2 — Nash Equilibrium (pure strategies)

*Concepts: best response, finding all pure Nash equilibria of small games, coordination games with
multiple equilibria, focal points.*

### L2.1 — Stag Hunt (assurance / coordination)
- **Statement.** Two hunters each choose **Stag** or **Hare**. A stag needs *both* (big shared
  reward); a hare can be caught alone (small sure reward). Payoffs e.g. Stag/Stag **(3,3)**,
  Hare/Hare **(1,1)**, Stag/Hare **(0,1)**, Hare/Stag **(1,0)** (generic: `a>b≥d>c`). Find the pure
  equilibria.
- **Answer.** **Two pure Nash equilibria:** **(Stag, Stag)** — payoff-dominant — and **(Hare, Hare)**
  — risk-dominant. (Plus one mixed NE.)
- **Source(s).** Wikipedia *Stag hunt*; arvindvenkatadri.com coordinated-games notes (payoff matrix
  + marked NE).
- **Engine-verifiable?** **Y** — `pure-Nash` (two cells are mutual best responses). The mixed NE is
  payoff-dependent (`mixed-prob`).
- **Notes.** Contrast with PD: here cooperation *(Stag,Stag)* **is** an equilibrium — the problem is
  equilibrium **selection** (safety vs reward), not dominance.

### L2.2 — Battle of the Sexes (coordination with conflict)
- **Statement.** A couple prefer being together but disagree on the venue (Boxing vs Ballet / Bach
  vs Stravinsky). Each gets their favored joint event **(say 3)**, the other joint event **(2)**, and
  **0** if they miss each other. Find all equilibria.
- **Answer.** **Two pure Nash equilibria:** both at venue 1 and both at venue 2. Plus a **mixed** NE
  (for the standard 3/2/0 payoffs each player puts probability **3/5** on their own preferred venue).
- **Source(s).** Wikipedia *Battle of the sexes (game theory)* (Luce & Raiffa, 1957); Grokipedia
  *Battle of the sexes*.
- **Engine-verifiable?** **Y** — `pure-Nash` (two pure NE) and `mixed-prob` (3/5, 2/5) for the stated
  payoffs.
- **Notes (see §7).** No unique prediction without a **focal point**; the exact mixed probabilities
  depend on the specific payoff numbers (different textbooks list different matrices → different
  mixes). State the matrix explicitly before asking for the mix.

### L2.3 — Chicken / Hawk–Dove
- **Statement.** Two drivers speed toward each other; each **Swerves** or goes **Straight**. Mutual
  Straight = crash (worst for both); Swerve/Straight = the straight driver "wins." E.g. Swerve/Swerve
  **(4,4)**, Straight/Swerve **(5,2)**, Swerve/Straight **(2,5)**, Straight/Straight **(1,1)**
  (generic: `T>R>S>P`). Find the pure equilibria.
- **Answer.** **Two pure Nash equilibria:** **(Straight, Swerve)** and **(Swerve, Straight)** — the
  two anti-coordinated cells. (Plus a symmetric mixed NE.)
- **Source(s).** Wikipedia *Chicken (game)* / *Hawk–Dove*; arvindvenkatadri.com (Chicken payoff
  matrix + NE); metricgate Mixed-NE 2×2 docs (Hawk–Dove listed).
- **Engine-verifiable?** **Y** — `pure-Nash` (two asymmetric pure NE); mixed NE via `mixed-prob`.
- **Notes.** Same 2×2 "two pure equilibria + one mixed" skeleton as Stag Hunt / BoS but with the
  *off-diagonal* cells as the pure equilibria. Hawk–Dove is the biology framing.

### L2.4 — Generic "find all pure NE in this matrix" (best-response method)
- **Statement.** Given a small bimatrix (2×2 or 3×3) of payoffs, mark each player's best response to
  every opponent action; cells that are mutual best responses are the pure Nash equilibria. (The
  interviewer's "here's a payoff matrix — find the equilibria.")
- **Answer.** The set of cells where row's choice is a best response to the column **and** vice
  versa. A 2×2 may have 0 (Matching Pennies → none, see L3.1), 1 (PD), or 2 (coordination) pure NE.
- **Source(s).** metricgate "Mixed-Strategy Nash Equilibrium (2×2) Calculator" docs; standard
  best-response definition (Osborne *IGT*).
- **Engine-verifiable?** **Y** — `pure-Nash` is the engine's core routine; deterministic and exact.
- **Notes.** This is the reusable skill the three named games above instantiate; the engine should
  also report "no pure NE" (→ go mixed, L3).

---

## L3 — Mixed Strategies

*Concepts: games with no pure NE, the indifference principle (mix so the opponent is indifferent),
exact mixing fractions and game value.*

### L3.1 — Matching Pennies
- **Statement.** Each player secretly turns a penny H or T. Row wins (+1) if the pennies **match**;
  Column wins (+1) if they **differ** (zero-sum). What's the equilibrium?
- **Answer.** **No pure NE.** Unique mixed NE: each plays **H with probability 1/2** (½, ½). **Game
  value = 0.**
- **Source(s).** Berkeley Stadelis *econ160_mixed.pdf*; metricgate zero-sum/mixed docs.
- **Engine-verifiable?** **Y** — `mixed-prob` (½) + `game-value` (0). Exact.
- **Notes.** The cleanest "you must randomize / be unpredictable" example; the indifference
  principle in its simplest form.

### L3.2 — Rock–Paper–Scissors
- **Statement.** Simultaneous Rock/Paper/Scissors; win +1, lose −1, tie 0 (zero-sum). Optimal play?
- **Answer.** Unique mixed NE: **(1/3, 1/3, 1/3)** for both players. **Game value = 0.**
- **Source(s).** UNC-Charlotte *ECON3161* mixed-NE notes (derives p=⅓ each, EV 0); Berkeley
  *econ160_mixed.pdf*.
- **Engine-verifiable?** **Y** — `mixed-prob` (⅓ each) + `game-value` (0). Exact.
- **Notes.** Symmetric 3×3 zero-sum; each player mixes to make the opponent indifferent across all
  three actions. Real humans show exploitable biases (avoid repeating, etc.).

### L3.3 — Simplified poker / the "AKQ" bluffing game (indifference + bluff frequency)
- **Statement.** Three-card deck **A>K>Q**; two players ante; one player may **bet** or **check** a
  fixed size into the pot, the other may **call** or **fold**. How should you bet/bluff/call?
- **Answer (canonical, pot-sized bet, half-street model).** Bettor **value-bets A always, checks K,
  bluffs Q at frequency 1/3**; caller **calls a bet with K at frequency 1/3** (always call A, fold Q).
  This makes each opponent **indifferent**. The bet range is then **2:1 value:bluff** (bluff fraction
  = bet/(2·bet+pot) = **1/3** for a pot-sized bet).
- **Source(s).** irishlucky.com "AKQ Game Decision Tree" (A 100% bet, Q 33.3% bluff, K 33.3% call);
  **Viewpoint Investment Partners** "Strategic Bluffs: Game Theory in Action" (an investment firm
  teaching the AKQ game — direct quant relevance); pokerexplore "GTO Demystified — Toy Games";
  ecavan (Medium) "Mathematics behind GTO poker."
- **Engine-verifiable?** **Y** — `mixed-prob` via indifference (1/3, 2/3 for the stated sizing); exact
  rationals.
- **Notes (see §7).** The exact frequencies are **bet-size / pot-odds dependent** (bluff fraction
  = bet/(bet+pot+bet); call fraction = pot-odds). State the bet size and the action order
  (who checks to whom) precisely — many "1/3" claims silently assume a pot-sized half-street bet.

### L3.4 — Penalty kicks (the real-world minimax test)
- **Statement.** Kicker shoots **Left/Right**; goalkeeper dives **Left/Right** simultaneously. Scoring
  probabilities differ by cell (a kicker scores more often to his "natural" side, and more often when
  the keeper guesses wrong). It's an (approximately) 2×2 zero-sum game — how should each side play?
- **Answer.** **No pure NE; both must mix.** Each side randomizes so the opponent is indifferent
  across sides; empirically the mixing matches the minimax prediction closely (aggregate kicker ≈
  **L 40% / R 60%**, keeper ≈ **L 38% / R 62%** in Palacios-Huerta's large samples; scoring rate ≈
  equal across the kicker's two sides, ≈ 80%).
- **Source(s).** **Ignacio Palacios-Huerta, "Professionals Play Minimax," *Review of Economic
  Studies* 70(2), 2003, pp.395–415, DOI 10.1111/1467-937X.00249** (palacios-huerta.com/docs/professionals.pdf);
  LSE research-impact case study.
- **Engine-verifiable?** **partly** — the *structure* (no pure NE → mix; indifference) is `mixed-prob`,
  but the **specific frequencies are empirical, not exact rationals** (they come from measured scoring
  %). The engine can verify the *method* on a stated payoff matrix, not the field data.
- **Notes.** Best motivation that mixed strategies are real (experts actually play minimax) and the
  canonical empirical confirmation of **von Neumann's minimax theorem** (ties L3↔L4). Use a
  *stylized* exact-fraction matrix for engine checks; cite the study for the real-world hook.

---

## L4 — Zero-Sum Games & Minimax

*Concepts: value of a game, saddle points (pure value), maximin = minimax (von Neumann 1928),
mixed value of a 2×2 zero-sum game via `v=(ad−bc)/(a+d−b−c)`, hide-and-seek matrices.*

### L4.1 — Saddle point (pure value of a zero-sum game)
- **Statement.** Given a zero-sum payoff matrix (row maximizes, column minimizes), when is there a
  pure-strategy solution, and what is the value? Example: a matrix whose entry is simultaneously the
  **minimum of its row and the maximum of its column** is a saddle point.
- **Answer.** A **saddle point** exists iff **maximin = minimax**; that common entry is the **value**
  and the pure row/column choices are optimal (a pure-strategy NE). If maximin < minimax, there is no
  saddle and the players must randomize (→ L4.3).
- **Source(s).** ZIB *Lecture2 Matrix Games* (saddle-point def + `μ_r ≤ μ_c`, equality iff saddle);
  Ferguson, *Game Theory* (UCLA), Part II (CMU mirror `cs.cmu.edu/.../mat.pdf`); metricgate zero-sum
  docs.
- **Engine-verifiable?** **Y** — `game-value` (compute row minima / column maxima; check equality).
  Exact.
- **Notes.** Always check for a saddle point *first*; only if none exists do you apply the 2×2 mixed
  formula.

### L4.2 — The minimax theorem (value exists for every finite zero-sum game)
- **Statement.** Does every finite two-person zero-sum game have a well-defined "value"?
- **Answer.** **Yes (von Neumann, 1928).** There is a number **V** and mixed strategies such that Row
  can guarantee average gain **≥ V** and Column can hold Row to **≤ V**; i.e.
  **max_p min_q pᵀAq = min_q max_p pᵀAq = V**.
- **Source(s).** Ferguson *Game Theory* (statement of the Minimax Theorem); Notre Dame *Lecture29*;
  metricgate zero-sum solver docs; UvA *gt5.pdf* (minimax = maximin = NE in zero-sum).
- **Engine-verifiable?** **Y (conceptual)** — for any concrete small matrix the engine returns the
  exact value V and optimal mixes (LP / 2×2 formula). The theorem itself is the guarantee that V
  exists.
- **Notes.** In zero-sum games, **Nash equilibrium ⇔ each player plays a minimax/maximin strategy**;
  this is what makes the value well-defined (unlike general-sum games).

### L4.3 — 2×2 zero-sum value formula (no saddle point)
- **Statement.** For a 2×2 zero-sum matrix `[[a, b], [c, d]]` with **no** saddle point, give the value
  and optimal mixes.
- **Answer.** **Value** `v = (ad − bc) / (a + d − b − c)`; **Row** plays row 1 with `p = (d − c)/(a+d−b−c)`;
  **Column** plays col 1 with `q = (d − b)/(a+d−b−c)`. (Equivalent form `v=(ad−bc)/(a−b−c+d)`.)
- **Source(s).** **Notre Dame *Lecture29*** (states `ν = (ad−bc)/(a−b−c+d)` for matrix rows (a,b),(c,d)
  — exact match to the brief); Ferguson *Game Theory* (derivation; note Ferguson's `(ac−bd)/(a−b+c−d)`
  uses a different cell labeling — same theorem); metricgate; UvA *gt5.pdf*.
- **Engine-verifiable?** **Y** — `game-value` + `mixed-prob`, exact rationals (the formula *is* the
  engine routine).
- **Notes (see §7).** The formula is only valid when there is **no saddle point** (otherwise use the
  pure value, L4.1). **Sign/labeling matters**: the formula assumes the matrix is written rows
  (a,b),(c,d); transposing or relabeling flips terms (the source of Ferguson's different-looking
  expression). Always fix the convention first.

### L4.4 — Two-finger Morra (worked 2×2 + the historical 4-strategy game)
- **Statement.** Two players simultaneously show **1 or 2 fingers**. *(Simplified 2×2 teaching
  version, UMass:)* payoff to Row `[[+2, −3], [−3, +4]]` (rows/cols = show 1 / show 2). What's the
  value and optimal mix? *(Classic 4-strategy version:* also guess the opponent's count; correct sole
  guesser wins the sum of fingers.)*
- **Answer.** *Simplified 2×2:* **value = −1/12**, both play **"show 1" with probability 7/12** (and
  "2" with 5/12) — exactly the 2×2 formula:
  `v=(2·4−(−3)(−3))/(2+4+3+3)=(8−9)/12=−1/12`, `p=(4−(−3))/12=7/12`.
  *Classic 4-strategy Morra:* symmetric ⇒ **value = 0** (with a known family of optimal mixes over
  the (hide,guess) strategies).
- **Source(s).** UMass *CMPSCI 240 Lec21/22/23* (2×2 Morra, mix 7/12 & 5/12); Brown
  *am121 game_121.pdf* (4-strategy Morra, value 0, via LP); UNAM *math340 matrix-games* (Morra,
  anti-symmetric ⇒ value 0).
- **Engine-verifiable?** **Y** — simplified 2×2: `game-value` (−1/12) + `mixed-prob` (7/12) via the
  L4.3 formula; full game: `game-value` (0) by anti-symmetry. Exact.
- **Notes.** Excellent end-to-end engine demo: a non-trivial 2×2 with a clean non-zero rational value.
  Beware that "Morra" denotes several payoff conventions (UMass even uses a `[[2,−3],[−2,4]]` variant
  → value 2/11, mix 6/11 & 7/11); **state the matrix explicitly.**

### L4.5 — Hide-and-seek matrix game
- **Statement.** A hider picks a location and a seeker picks a location to search; payoffs depend on
  whether/where they coincide (a von Neumann–style search matrix). Find the value and optimal mixed
  strategies.
- **Answer.** No pure value in general → unique **mixed** value and optimal randomized
  hiding/seeking, computed from the matrix (small symmetric instances often have **value 0** by
  anti-symmetry).
- **Source(s).** Brown *am121 game_121.pdf* ("The game hide and seek was considered by von Neumann …");
  general matrix-game machinery (Ferguson; ZIB).
- **Engine-verifiable?** **Y** — `game-value` + `mixed-prob` on the stated matrix. Exact for rational
  payoffs.
- **Notes.** Generalizes Matching Pennies to asymmetric search; good "pick where to hide / where to
  look" interview framing. Exact answer depends entirely on the specified matrix — pin it down.

---

## L5 — Sequential Games & Backward Induction

*Concepts: game trees, subgame-perfect equilibrium (SPE), backward induction, the Pirate game,
ultimatum, centipede, Stackelberg leader–follower.*

### L5.1 — The Pirate game ("Screwy pirates") — THE classic
- **Statement.** **5 pirates**, ranked by seniority, split **100 gold coins**. The most senior
  proposes a split; **all** (including the proposer) vote. If **≥ 50%** approve (proposer breaks
  ties), it passes; else the proposer is thrown overboard and the next-most-senior proposes. Pirates
  are perfectly rational, greedy, value survival first, and (tie-break) prefer fewer pirates aboard.
  What does the senior pirate propose?
- **Answer.** **(98, 0, 1, 0, 1)** read most-senior → most-junior: the proposer **keeps 98** and gives
  **1 coin each to the two pirates who would get nothing** if the proposal failed (the 3rd- and
  5th-most-senior). Those two plus the proposer = 3 of 5 votes. *(General odd case: with `2n+1`
  pirates the proposer keeps `100−n` and gives 1 coin to alternating juniors.)*
- **Source(s).** **Green Book "Screwy pirates," Ch.2 Brain Teasers, p.3** (verified full text:
  yumpu `65965041`, usermanual.wiki `604244935` — "offer pirate 1 and pirate 3 one coin … keep 98");
  **Mark Joshi *QJIQ&A*** (backward-induction family); **brainstellar.com/puzzles/strategy/2**;
  Wikipedia *Pirate game* (A..E, A=98,B=0,C=1,D=0,E=1); techinterview.org; mathsisfun 5-pirates;
  quantt.co.uk quant-brain-teasers (#16, lists SIG/Jane Street/Optiver/etc.).
- **Engine-verifiable?** **Y** — `backward-induction` over the 1→5-pirate subgames; exact integer
  allocation vector.
- **Notes (contested — see §7).** The headline "**98 to the proposer**" is universal, but the exact
  **0/1 bribe pattern depends on conventions**: (i) "≥50% with proposer tie-break," and (ii) the
  *bloodthirsty/indifference* rule that an indifferent pirate votes **no** (so you must bribe with a
  *strictly positive* 1 coin, not 0). Some sources botch the vector — e.g. quantt.co.uk prints
  **(98,0,1,2,0)** (a 2 appears; inconsistent under standard rules). Use **(98,0,1,0,1)**; state the
  tie-break and indifference rules explicitly.

### L5.2 — Tiger and sheep (parity by backward induction)
- **Statement.** **100 tigers** and **1 sheep** on an island with only grass. A tiger would rather
  eat the sheep, but **any tiger that eats the sheep itself becomes a sheep** (then edible). All
  tigers are rational and want to survive. Is the sheep eaten?
- **Answer.** **No** (for 100). Parity: with an **odd** number of tigers the sheep is eaten; with an
  **even** number it is safe. 100 is even ⇒ **sheep survives**.
- **Source(s).** **Green Book "Tiger and sheep," Ch.2 Brain Teasers, p.4** (verified full text, same
  copies as L5.1: "if the number of tigers is even, the sheep will not be eaten … For n=100, the
  sheep will not be eaten").
- **Engine-verifiable?** **Y** — `backward-induction`/parity recursion on n; exact (boolean by parity).
- **Notes.** Same backward-induction logic as the pirates but the "state" is just the count; a clean
  second backward-induction item straight from the Green Book.

### L5.3 — Ultimatum game
- **Statement.** Player 1 proposes how to split **$1** (offers `x` to Player 2, keeps `1−x`); Player 2
  **accepts** (split stands) or **rejects** (both get **0**). What's the subgame-perfect equilibrium?
- **Answer.** **SPE: Player 1 offers (essentially) 0 and Player 2 accepts.** With a continuous pie the
  unique SPE is **offer 0, accept everything**; with a smallest money unit there are two SPEs (offer
  0 & accept; or offer one unit), Player 1 keeping (almost) everything.
- **Source(s).** Osborne, *Intro to Game Theory*, Ch.6 (economics.utoronto.ca/osborne/igt/igtChapter6.pdf
  — "only SPE: person 1 offers 0 and person 2 accepts"); jasoncollins behavioural-econ notes;
  reference-global *slgr-2017-0016*.
- **Engine-verifiable?** **Y** — `backward-induction` (responder accepts any `x>0` ⇒ proposer drives
  `x→0`). Exact.
- **Notes (contested — see §7).** Discrete vs continuous changes uniqueness (the `x=0` indifference).
  Strongly violated empirically (responders reject "unfair" low offers; offers cluster near 40–50%).
  Great contrast: rational SPE vs observed fairness.

### L5.4 — Centipede game
- **Statement.** Two players alternately choose **Take** (grab the larger share of a growing pot and
  end the game) or **Pass** (the pot grows and the move goes to the other), for a finite number of
  rounds. What does backward induction predict?
- **Answer.** **Unique SPE: Take immediately** (Player 1 defects at the very first node), even though
  passing several times would make both far richer.
- **Source(s).** Wikipedia *Centipede game* ("Defection by the first player is the unique subgame
  perfect equilibrium … established by backward induction"); MIT 14.12 lecture notes (`web.mit.edu/14.12`);
  jasoncollins sequential-games notes.
- **Engine-verifiable?** **Y** — `backward-induction` (fold from the last node). Exact.
- **Notes (contested — see §7).** There are **many Nash equilibria**; only the **SPE refinement**
  pins down "take immediately." Like the traveler's dilemma, naive cooperation beats the SPE and
  humans routinely pass for several rounds.

### L5.5 — Stackelberg leader–follower (first-mover advantage)
- **Statement.** Duopoly with inverse demand `P = a − (q₁+q₂)`, zero cost. The **leader** sets `q₁`
  first; the **follower** observes it and sets `q₂`. Solve by backward induction.
- **Answer.** Follower's reaction `q₂ = (a−q₁)/2`; substituting, leader picks **q₁ = a/2**, follower
  **q₂ = a/4** (total `3a/4`, price `a/4`). Leader profit `a²/8` **>** follower `a²/16` ⇒
  **first-mover advantage**. (Compare simultaneous **Cournot**: each `a/3`, profit `a²/9`.)
- **Source(s).** Wikipedia *Stackelberg competition* (solved by backward induction); **Yale Open
  Courses ECON 159 (Ben Polak), Lecture 14** (`oyc.yale.edu/economics/econ-159/lecture-14`:
  `q₁=(A−c)/2B`, `q₂=(A−c)/4B`); Muñoz-García IO slides (leader `a/2`, follower `a/4`).
- **Engine-verifiable?** **Y** — `backward-induction` on the reaction function; with concrete numbers
  the engine returns exact quantities/profits (e.g. the electraradioti worked example: leader **200**,
  follower **100**, total **Q=300**, price **220**).
- **Notes.** The continuous/economic face of backward induction (vs the discrete pirates/centipede).
  The "advantage" comes from **commitment + observability**, not timing per se (Yale L14).

---

## L6 — Combinatorial Games (Nim & winning strategies)

*Concepts: impartial games, P/N positions, the Nim XOR (nim-sum) rule, subtraction/"race" games
(mod k+1), symmetry/strategy-stealing winning arguments.*

### L6.1 — Nim (the nim-sum / XOR rule)
- **Statement.** Several heaps of stones; players alternate removing **any positive number from a
  single heap**; **last to take wins** (normal play). Who wins from a given position, and how?
- **Answer.** Compute the **nim-sum = XOR of heap sizes**. **First player wins iff nim-sum ≠ 0**; the
  winning move makes the nim-sum **0** (find a heap `h` with `h⊕X < h` and reduce it to `h⊕X`).
  *Concrete:* heaps **(3,4,5)** → `X = 3⊕4⊕5 = 2 ≠ 0` ⇒ first player wins; the unique winning move is
  to change the 3-heap to `3⊕2 = 1`, leaving **(1,4,5)** with nim-sum `1⊕4⊕5 = 0`. From **(1,4,5)**
  (nim-sum 0) the mover **loses** against optimal play.
- **Source(s).** Wikipedia *Nim* (Bouton's theorem; example `3⊕4⊕5=2`); Brilliant.org *Nim* wiki;
  GeeksforGeeks "Game of Nim"; USACO Guide *Game Theory*.
- **Engine-verifiable?** **Y** — `nim-sum` (XOR), exact; engine reports win/lose **and** the specific
  winning move (the heap `h` with `h⊕X<h`).
- **Notes (see §7).** Stated rule is for **normal play** (last move **wins**). **Misère** Nim (last
  move **loses**) is *almost* identical — same XOR strategy until heaps are all size ≤1, then invert.

### L6.2 — Subtraction game: "21 game" / race-to-100 / Bachet's game
- **Statement.** From a pile of `n` (or a running total to a target), each turn remove **1…k** tokens;
  **last to take wins** (normal). Who wins and how? (Verbal "21": players count up by 1–3, the one
  forced to say 21 **loses** — misère.)
- **Answer.** **P-positions (losing for the mover) are the multiples of `k+1`.** First player wins iff
  `n` is **not** a multiple of `k+1`, by always moving to the nearest lower multiple of `k+1`. For
  `k=3`: losing positions are **multiples of 4**; "race to 100" with steps 1–10 → key numbers
  `100−11m` = 89, 78, …, 12, 1.
- **Source(s).** NYU "A Take-Away Game" notes (`cs.nyu.edu/~anupamg/251-notes/games.pdf` — P-positions
  ≡ 0 mod (k+1)); Wikipedia *Nim* §"The subtraction game"/§"The 21 game"; Bachet's game (zxc.wiki,
  target-100, "key numbers separated by 11").
- **Engine-verifiable?** **Y** — `nim-sum`/mod-(k+1) residue; exact, with the explicit "subtract
  `n mod (k+1)`" move.
- **Notes (contested — see §7).** **Normal vs misère flips the answer**: with "last to take **loses**"
  (the verbal "21"), P-positions shift to `n ≡ 1 (mod k+1)`, so the first mover who must start at 1 is
  in a losing line. State "wins/loses by taking the last" explicitly.

### L6.3 — Coins on a round table (symmetry / first-mover win)
- **Statement.** Two players alternately place identical coins (no overlap, fully on the table) on a
  perfectly **circular** table; the player who **cannot move loses** (equivalently, last to place
  wins). Move first or second, and what's the strategy?
- **Answer.** **Go first.** Place the first coin at the **exact center**, then **mirror** every
  opponent coin through the center (180° rotation). Symmetry guarantees your reply is always legal, so
  the opponent runs out of space first — **first player wins**.
- **Source(s).** techinterview.org "Coin on a Table" (center + mirror; strategy-stealing remark);
  GeeksforGeeks "Round table coin game"; math.stackexchange 1538496; ThatsMaths "The Beer Mat Game";
  placewit (Medium) "Quarters on a Table."
- **Engine-verifiable?** **partly** — the *winner* (P1) and the symmetry strategy are exact and
  provable, but this is a continuous-geometry argument, not an arithmetic recomputation; the engine
  verifies the **logic** (central symmetry ⇒ reply always exists), not a number.
- **Notes (see §7).** Crucially depends on the table having a **center of symmetry** (circle, or any
  centrally-symmetric shape). ThatsMaths shows **non-symmetric tables can be second-player wins** —
  don't overclaim "first player always wins" for arbitrary shapes.

### L6.4 — Chomp (strategy-stealing)
- **Statement.** An `m×n` chocolate grid; the **top-left** square is poisoned. Players alternately
  pick a square and **eat it plus everything below and to the right**; whoever eats the poisoned
  square **loses**. Who wins?
- **Answer.** **The first player wins for every board except 1×1** — proved by a **strategy-stealing
  argument** (if the second player had a winning reply to "eat only the bottom-right square," the
  first player could have played that reply directly). Explicit strategies are known for **square**
  boards (open with the L-shape, then mirror) and **n×2** boards; the general winning *move* is
  **unknown** (the proof is non-constructive).
- **Source(s).** Wikipedia *Chomp* (+ *Strategy-stealing argument*, invented by Nash for Hex); IMSc
  "Game of Chomp" outreach notes; Gale's formulation.
- **Engine-verifiable?** **partly** — for **small** boards the engine can compute P/N positions
  exactly by search (`backward-induction` over positions); the *general* first-player-win is an
  existence proof, not an arithmetic value.
- **Notes (see §7).** "First player wins" is **non-constructive** for general `m×n` — know *that*
  P1 wins without knowing the move (great teaching point on existence vs construction). Square/2×n
  are the constructive cases.

### L6.5 — Chocolate-bar breaking (an invariant, not a strategy)
- **Statement.** A chocolate bar of `6×8 = 48` unit squares; each break splits one rectangle into two
  along a grid line. **Minimum number of breaks** to reduce it to 48 unit squares?
- **Answer.** **47** — and in fact **every** sequence of breaks uses exactly `mn − 1` breaks
  (here `48 − 1 = 47`), because each break increases the piece count by exactly 1 (start 1 piece, end
  `mn` pieces).
- **Source(s).** **Green Book "Chocolate bar problem," Ch.2 Brain Teasers** (verified full text:
  "the number of breaks must be mn − 1 … For m=6 and n=8, the number of breaks is 47").
- **Engine-verifiable?** **Y** — `invariant` (monovariant: pieces = breaks + 1); exact integer 47.
- **Notes.** Not a two-player win/lose game but the canonical **invariant/monovariant** argument that
  underlies combinatorial-game reasoning (and it's a genuine Green Book brain teaser), so it belongs
  in the "winning-strategy / counting" lesson as the "there is no strategy — it's forced" counterpoint
  to Nim/Chomp.

---

## 7. Contested / assumption-dependent answers (handle carefully)

| # | Problem | What's robust | What's contested / assumption-dependent |
|---|---|---|---|
| 1 | **Pirate game** (L5.1) | Proposer keeps **98** | Exact bribe vector **(98,0,1,0,1)** needs "≥50% + proposer tie-break" **and** "indifferent pirate votes NO ⇒ bribe = 1 (not 0)." Sources disagree on the 0/1 pattern; **quantt.co.uk prints (98,0,1,2,0)** (wrong). Fix conventions before stating. |
| 2 | **Guess 2/3 average** (L1.2) | Unique NE = **0** under common-knowledge rationality | Real play ≠ 0 (k-level reasoning → ~20–35). Round 1 uses *strict* dominance; later rounds *weak* dominance. |
| 3 | **Traveler's dilemma** (L1.3) | Unique NE **(2,2)** | Relies on iterated **weak** dominance + CK rationality; famously violated empirically; "naive beats rational." |
| 4 | **Ultimatum** (L5.3) | Proposer keeps ≈ everything (SPE) | **Discrete** (offer 0 *or* one unit — two SPEs) vs **continuous** (unique: offer 0, accept). Strongly violated by fairness behavior. |
| 5 | **Centipede** (L5.4) | SPE = **take immediately** | Many *Nash* equilibria; "take now" needs the **SPE refinement**; humans pass for rounds. |
| 6 | **Nim** (L6.1) | XOR ≠ 0 ⇒ first player wins | **Normal vs misère**: misère only changes the endgame (all-heaps-≤1). State which. |
| 7 | **21 / subtraction** (L6.2) | P-positions = multiples of **k+1** | **Normal** (last wins): 0 mod (k+1). **Misère** (verbal "21," last loses): **1 mod (k+1)** — different! |
| 8 | **Coins on a table** (L6.3) | First player wins on a **circle** | Needs central symmetry; **asymmetric tables can flip to 2nd-player win** (don't generalize). |
| 9 | **Chomp** (L6.4) | First player wins (≠1×1) | **Non-constructive** for general boards (know *that*, not *how*); explicit only for square / n×2. |
| 10 | **Battle of the Sexes / coordination** (L2.1–2.3) | Two pure NE exist | **No unique prediction** without a focal point; the **mixed** NE probabilities depend on the exact payoff matrix. |
| 11 | **Penalty kick** (L3.4) | No pure NE → both mix (minimax) | Mixing **frequencies are empirical, not exact rationals**; engine can't reproduce the field numbers (use a stylized matrix). |
| 12 | **AKQ bluffing** (L3.3) | Mix to make opponent indifferent | The **1/3 bluff / 1/3 call** values are **bet-size/pot-odds specific** (pot-sized half-street). State sizing. |

---

## 8. Engine-verifiability summary

| Lesson | Fully engine-exact (`Y`) | Partial / structure-only |
|---|---|---|
| L1 Dominance/PD | PD `pure-Nash`+`IESDS`; 2/3-avg `IESDS`→0; traveler `IESDS`→(2,2) | — |
| L2 Pure Nash | Stag Hunt / BoS / Chicken `pure-Nash`; generic `pure-Nash` | mixed parts depend on stated payoffs |
| L3 Mixed | Matching Pennies (½, v=0); RPS (⅓, v=0); AKQ (⅓) `mixed-prob` | Penalty kick (empirical freqs) — structure only |
| L4 Zero-sum/Minimax | saddle `game-value`; 2×2 `v=(ad−bc)/(a+d−b−c)`; Morra 2×2 (−1/12, 7/12); Morra/hide-seek value 0 | minimax theorem = existence guarantee |
| L5 Sequential | Pirates (98,0,1,0,1); tiger-sheep parity; ultimatum; centipede; Stackelberg `backward-induction` | — |
| L6 Combinatorial | Nim `nim-sum`; 21/Bachet mod-(k+1); chocolate `invariant`=47 | Coins-on-table (geometry); Chomp general (non-constructive; small boards exact) |

**Bottom line:** ~20 of the ~24 records have an **exactly computable** answer (Nash cells, exact
mixing fractions, game values, nim-sums, backward-induction vectors, the 47-break invariant). The
only non-exact items are the **penalty-kick field frequencies** (empirical) and the **continuous-
geometry / non-constructive** parts of coins-on-a-table and general Chomp — flagged above.

---

## 9. Citations (deduplicated)

**Canonical quant-interview books**
- Green Book — Xinfeng Zhou, *A Practical Guide to Quantitative Finance Interviews* (2008), Ch.2
  "Brain Teasers": **Screwy pirates** (p.3), **Tiger and sheep** (p.4), **Chocolate bar problem**.
  Verified full-text web copies: https://www.yumpu.com/en/document/view/65965041 ·
  https://usermanual.wiki/Document/Practical20Guide20To20Quantitative20Finance20Interview.604244935.pdf
- Mark Joshi, Nick Denson, Andrew Downes, *Quant Job Interview Questions and Answers* (2008) — backward-induction family (pirates). Ref: techinterview.org; scribd doc 442416493.
- Timothy Crack, *Heard on the Street* — broad brain-teaser/logic coverage (tradermath.org review).

**Quant-puzzle sites (legitimacy + pirates/Nim)**
- https://brainstellar.com/puzzles/  ·  https://brainstellar.com/puzzles/strategy/2/ (Pirates & The Treasure)
- https://www.quantt.co.uk/resources/quant-brain-teasers (#16 the 5 pirates — NB prints wrong vector)
- https://www.quantt.co.uk/resources/green-book-quant-guide ; https://quantprep.io/practical-guide-to-quantitative-finance-interviews ; https://www.tradermath.org/knowledge-base/best-books-for-trading-quantitative-finance-interviews
- https://www.techinterview.org/post/3233474755/pirates-dividing-gold-game-theory-interview/ ; https://www.techinterview.org/post/518739862/coin-on-a-table/

**L1 — Dominance / PD**
- https://en.wikipedia.org/wiki/Prisoner%27s_dilemma ; http://maths.straylight.co.uk/edb_files/ipd_talk.pdf
- https://en.wikipedia.org/wiki/Guess_2/3_of_the_average ; https://www.iises.net/download/Soubory/soubory-puvodni/pp117-137_ijoes_2012V1N2.pdf ; https://www.davy.ie/market-and-insights/insights/investing-insights/2023/what-does-the-two-thirds-game-explain-about-financial-markets.html
- https://en.wikipedia.org/wiki/Traveler%27s_dilemma ; https://www.scientificamerican.com/article/the-travelers-dilemma/ ; https://www.investopedia.com/terms/t/travelers-dilemma.asp ; https://www.scielo.org.mx/scielo.php?pid=S0011-15032018000100055&script=sci_arttext

**L2 — Pure Nash / coordination**
- https://en.wikipedia.org/wiki/Stag_hunt ; https://en.wikipedia.org/wiki/Battle_of_the_sexes_(game_theory) ; https://grokipedia.com/page/Battle_of_the_sexes_(game_theory) ; https://en.wikipedia.org/wiki/Chicken_(game)
- https://arvindvenkatadri.com/teaching/3-order-and-chaos/modules/3-coordinated-games/ ; https://metricgate.com/docs/nash-equilibrium-mixed-2x2/

**L3 — Mixed strategies**
- https://faculty.haas.berkeley.edu/stadelis/Game%20Theory/econ160_mixed.pdf ; http://belkcollegeofbusiness.charlotte.edu/azillant/wp-content/uploads/sites/846/2014/12/ECON3161_UNCCgt3out.pdf
- AKQ bluffing: https://irishlucky.com/poker/math/akq-game-decision-tree/ ; https://viewpointinvestment.ca/strategic-bluffs-game-theory-in-action/ ; https://pokerexplore.com/en/books/originals/gto-demystified/toy-games/ ; https://ecavan.medium.com/the-mathematics-behind-game-theory-optimal-poker-24d0d57bed8b
- Penalty kick: Palacios-Huerta, "Professionals Play Minimax," *Review of Economic Studies* 70(2) (2003) 395–415, DOI 10.1111/1467-937X.00249 — http://www.palacios-huerta.com/docs/professionals.pdf ; https://www.lse.ac.uk/research/research-impact-case-studies/improving-odds-winning-professional-football

**L4 — Zero-sum / minimax**
- Ferguson, *Game Theory* (UCLA) mirror: https://www.cs.cmu.edu/afs/cs/academic/class/15859-f01/www/notes/mat.pdf
- 2×2 formula: https://academicweb.nd.edu/~andyp/teaching/2023FallMath10120/Schedule/Lecture29.pdf ; https://metricgate.com/docs/zero-sum-game-solver/ ; https://www.zib.de/userpage/sagnol/uploads/games/Lecture2_MatrixGames.pdf ; https://staff.science.uva.nl/u.endriss/teaching/game-theory/slides/gt5.pdf
- Morra / hide-and-seek: https://people.cs.umass.edu/~mcgregor/240S17/lec21.pdf ; https://www.dam.brown.edu/people/huiwang/classes/am121/Archive/game_121.pdf ; https://www.matem.unam.mx/~omar/math340/matrix-games.html

**L5 — Sequential / backward induction**
- https://en.wikipedia.org/wiki/Pirate_game ; https://www.mathsisfun.com/puzzles/5-pirates-solution.html ; https://www.quantfinanceprep.com/problems/five-pirates-and-100-coins-rational-backward-induction-split/1662/
- Ultimatum: https://www.economics.utoronto.ca/osborne/igt/igtChapter6.pdf ; https://behaviouraleconomics.jasoncollins.blog/game-theory/sequential-games
- Centipede: https://en.wikipedia.org/wiki/Centipede_game ; https://web.mit.edu/14.12/www/02F_lecture7-9.pdf
- Stackelberg: https://en.wikipedia.org/wiki/Stackelberg_competition ; https://oyc.yale.edu/economics/econ-159/lecture-14 ; https://felixmunozgarcia.com/wp-content/uploads/2020/09/ioms2_chap04.pdf

**L6 — Combinatorial games**
- Nim: https://en.wikipedia.org/wiki/Nim ; https://brilliant.org/wiki/nim/ ; https://www.geeksforgeeks.org/dsa/combinatorial-game-theory-set-2-game-nim/ ; https://usaco.guide/adv/game-theory
- Subtraction/21/Bachet: https://cs.nyu.edu/~anupamg/251-notes/games.pdf ; https://de.zxc.wiki/wiki/Bachet%E2%80%99sches_Spiel
- Coins on a table: https://www.geeksforgeeks.org/aptitude/puzzle-round-table-coin-game/ ; https://math.stackexchange.com/questions/1538496/ ; https://thatsmaths.com/2017/06/22/the-beer-mat-game/
- Chomp / strategy-stealing: https://en.wikipedia.org/wiki/Chomp ; https://en.wikipedia.org/wiki/Strategy-stealing_argument ; https://www.imsc.res.in/outreach/OpenDay2025/game-of-chomp.html

---

*Compiled by the Source Miner / Fact-checker. Every problem above is either lifted from a canonical
quant-interview book or is the standard textbook instance of the named concept, with a real source
and an exact (or explicitly flagged) answer. Drop nothing into a lesson without re-checking the
matching §7 caveat.*
