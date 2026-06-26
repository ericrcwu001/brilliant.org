# Pattern Hitting Times — AI Quant Interview Pack

> **DORMANT capstone asset** — committed to the repo but **NOT** seeded or deployed. Candidate-safe mirror: hidden answers/rubric and engine answers are intentionally omitted (they live only in the JSON, server-side).

- **courseId:** course-pattern-hitting-times
- **version:** 1
- **concept:** Pattern Hitting Times
- **greenBookAnchor:** Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — §5.1 Gambler's Ruin (p.107–112); §5.2–5.3 Markov chains / hitting times / pattern probability (p.113–128); §5.4–5.5 Penney's Game + Conway leading numbers (p.129–136)
- **engineModule:** src/engine/automaton.ts

## Pool summary

**Total:** 51

| Tier | Count |
| --- | ---: |
| hard | 8 |
| harder | 28 |
| brutal | 15 |

- **templated:** 48
- **freeForm:** 3

## Templates

| id | title | source | description |
| --- | --- | --- | --- |
| tmpl-pattern-wait | Expected flips to see a pattern (fair coin, Markov recurrence) | Green Book §5.2–5.3 p.113–128 | E[flips] until an H/T pattern first appears, via the first-step state recurrence (KMP overlap). |
| tmpl-biased-wait | Expected flips to see a pattern (biased coin p ≠ 1/2) | Green Book §5.2 p.113–120 | Same hitting-time recurrence with p/q weights; exact rationals via the first-step solve. |
| tmpl-penney-race | Penney's Game — exact win probability (Conway's leading numbers) | Green Book §5.4–5.5 p.129–136 | Probability one pattern beats another on a shared fair stream; win prob ≠ expected wait. |
| tmpl-second-mover | Best counter in Penney's Game (second mover always wins) | Green Book §5.4–5.5 p.129–136 | Construct bestBeater(a) and compute its win probability — the second mover always has an edge. |
| tmpl-gamblers-ruin | Gambler's Ruin — reach probability and expected duration | Green Book §5.1 p.107–112 | Boundary-value problems on a 1-D walk: P(reach N before 0 | i) and E[steps to absorption | i]. |
| tmpl-overlap-wait | Overlap shortcut — E[wait] = Σ 2^k over self-borders | Green Book §5.3 p.121–128 | Fair-coin wait via the martingale/self-border shortcut; cross-checks the Markov recurrence. |

## Questions

**Tier: hard**

### tmpl-pattern-wait#HT  ·  hard

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=HT

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern HT first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-pattern-wait#HH  ·  hard

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=HH

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern HH first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-pattern-wait#TH  ·  hard

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=TH

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern TH first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-pattern-wait#TT  ·  hard

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=TT

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern TT first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-gamblers-ruin#N4-p1_2-i1-reach  ·  hard

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=1,pDen=2,pNum=1,query=reach

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 4 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 1, what is the probability of reaching 4 before hitting 0?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p1_2-i2-reach  ·  hard

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=2,pNum=1,query=reach

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 4 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 2, what is the probability of reaching 4 before hitting 0?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p1_2-i2-duration  ·  hard

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=2,pNum=1,query=duration

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 4 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 2, what is the expected number of steps until the walk is absorbed at 0 or 4?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N3-p1_2-i1-reach  ·  hard

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=3,i=1,pDen=2,pNum=1,query=reach

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 3 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 1, what is the probability of reaching 3 before hitting 0?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

**Tier: harder**

### tmpl-pattern-wait#HHH  ·  harder

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=HHH

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern HHH first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-pattern-wait#HHT  ·  harder

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=HHT

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern HHT first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-pattern-wait#HTT  ·  harder

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=HTT

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern HTT first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-biased-wait#HH-p1_3  ·  harder

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=3,pNum=1,pattern=HH

**Prompt:** A biased coin shows heads with probability 1/3 (tails 2/3). What is the expected number of flips until HH first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-biased-wait#HH-p1_4  ·  harder

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=4,pNum=1,pattern=HH

**Prompt:** A biased coin shows heads with probability 1/4 (tails 3/4). What is the expected number of flips until HH first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-biased-wait#HT-p1_3  ·  harder

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=3,pNum=1,pattern=HT

**Prompt:** A biased coin shows heads with probability 1/3 (tails 2/3). What is the expected number of flips until HT first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-biased-wait#HT-p1_4  ·  harder

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=4,pNum=1,pattern=HT

**Prompt:** A biased coin shows heads with probability 1/4 (tails 3/4). What is the expected number of flips until HT first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-biased-wait#TH-p1_4  ·  harder

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=4,pNum=1,pattern=TH

**Prompt:** A biased coin shows heads with probability 1/4 (tails 3/4). What is the expected number of flips until TH first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-penney-race#HHH-vs-THH  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=HHH,b=THH

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if HHH appears first, B wins if THH appears first. What is the probability that B (THH) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-penney-race#HH-vs-TH  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=HH,b=TH

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if HH appears first, B wins if TH appears first. What is the probability that B (TH) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-penney-race#HH-vs-HT  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=HH,b=HT

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if HH appears first, B wins if HT appears first. What is the probability that B (HT) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-penney-race#HHH-vs-HHT  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=HHH,b=HHT

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if HHH appears first, B wins if HHT appears first. What is the probability that B (HHT) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-second-mover#HHH  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)

**Fingerprint:** tmpl-second-mover:a=HHH

**Prompt:** Your opponent announces the length-3 pattern HHH in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Is there any length-3 pattern whose best counter wins by exactly even money?
- Does a pattern ever beat its own bestBeater?
- How large can the second-mover edge get for length-3 patterns?

### tmpl-second-mover#HTH  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)

**Fingerprint:** tmpl-second-mover:a=HTH

**Prompt:** Your opponent announces the length-3 pattern HTH in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Is there any length-3 pattern whose best counter wins by exactly even money?
- Does a pattern ever beat its own bestBeater?
- How large can the second-mover edge get for length-3 patterns?

### tmpl-second-mover#HHT  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)

**Fingerprint:** tmpl-second-mover:a=HHT

**Prompt:** Your opponent announces the length-3 pattern HHT in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Is there any length-3 pattern whose best counter wins by exactly even money?
- Does a pattern ever beat its own bestBeater?
- How large can the second-mover edge get for length-3 patterns?

### tmpl-second-mover#TTT  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)

**Fingerprint:** tmpl-second-mover:a=TTT

**Prompt:** Your opponent announces the length-3 pattern TTT in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Is there any length-3 pattern whose best counter wins by exactly even money?
- Does a pattern ever beat its own bestBeater?
- How large can the second-mover edge get for length-3 patterns?

### tmpl-gamblers-ruin#N5-p1_2-i2-reach  ·  harder

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=5,i=2,pDen=2,pNum=1,query=reach

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 5 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 2, what is the probability of reaching 5 before hitting 0?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N5-p1_2-i2-duration  ·  harder

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=5,i=2,pDen=2,pNum=1,query=duration

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 5 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 2, what is the expected number of steps until the walk is absorbed at 0 or 5?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p1_2-i3-duration  ·  harder

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=3,pDen=2,pNum=1,query=duration

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 4 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 3, what is the expected number of steps until the walk is absorbed at 0 or 4?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N6-p1_2-i3-duration  ·  harder

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=6,i=3,pDen=2,pNum=1,query=duration

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 6 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 3, what is the expected number of steps until the walk is absorbed at 0 or 6?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N10-p1_2-i5-duration  ·  harder

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=10,i=5,pDen=2,pNum=1,query=duration

**Prompt:** A gambler does a fair random walk between absorbing barriers 0 (ruin) and 10 (win), stepping +1 with probability 1/2 and −1 otherwise. Starting at 5, what is the expected number of steps until the walk is absorbed at 0 or 10?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-overlap-wait#THH  ·  harder

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=THH

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until THH first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### tmpl-overlap-wait#HTH  ·  harder

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=HTH

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until HTH first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### tmpl-overlap-wait#THT  ·  harder

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=THT

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until THT first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### tmpl-overlap-wait#TTH  ·  harder

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=TTH

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until TTH first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### tmpl-overlap-wait#TTT  ·  harder

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=TTT

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until TTT first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### ff-pht-shortest-len4  ·  harder

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** sem:9e65ba11fc02

**Prompt:** Among length-4 H/T patterns, give one with the SHORTEST expected wait on a fair coin and state that wait. Why is it the minimum?

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Which length-4 pattern waits the longest?
- How many length-4 patterns achieve this minimum?
- Does the minimum-wait pattern also win Penney races often?

### ff-pht-wait-vs-win  ·  harder

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** sem:450d4e7f595a

**Prompt:** E[THH]=8 is far below E[HHH]=14, yet the two race head-to-head on one shared fair stream. Which is more likely to appear first, and with what probability? Explain why wait time does not decide the race.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- What beats THH, and by how much (non-transitivity)?
- Generalize: does every length-3 run have an ambusher?
- Why are wait time and win probability decoupled?

**Tier: brutal**

### tmpl-pattern-wait#HHHH  ·  brutal

**Source:** Green Book §5.2–5.3 p.113–128; src/engine/automaton.test.ts

**Fingerprint:** tmpl-pattern-wait:pattern=HHHH

**Prompt:** A fair coin is flipped repeatedly. What is the expected number of flips until the pattern HHHH first appears? Set up the state recurrence and solve it — and say why overlap, not length alone, controls the answer.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Bias the coin to p ≠ 1/2 — how does the wait change?
- Compare this pattern to one of equal length with different overlap — why do they differ?
- Generalize: which length-n pattern waits the longest, and why?

### tmpl-biased-wait#TT-p1_3  ·  brutal

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=3,pNum=1,pattern=TT

**Prompt:** A biased coin shows heads with probability 1/3 (tails 2/3). What is the expected number of flips until TT first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-biased-wait#HH-p2_5  ·  brutal

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=5,pNum=2,pattern=HH

**Prompt:** A biased coin shows heads with probability 2/5 (tails 3/5). What is the expected number of flips until HH first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-biased-wait#HT-p2_5  ·  brutal

**Source:** Green Book §5.2 p.113–120; src/engine/automaton.ts (biased first-step solve)

**Fingerprint:** tmpl-biased-wait:pDen=5,pNum=2,pattern=HT

**Prompt:** A biased coin shows heads with probability 2/5 (tails 3/5). What is the expected number of flips until HT first appears? Keep the answer an exact rational.

**Engine:** src/engine/automaton.ts · verified: true

**Follow-ups:**
- Restore a fair coin and compare — which way did the bias push the wait?
- Which 2-pattern benefits most from this bias?
- Generalize the repeated-symbol wait to a length-n run.

### tmpl-penney-race#HTH-vs-HHT  ·  brutal

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=HTH,b=HHT

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if HTH appears first, B wins if HHT appears first. What is the probability that B (HHT) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-penney-race#HHT-vs-THH  ·  brutal

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=HHT,b=THH

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if HHT appears first, B wins if THH appears first. What is the probability that B (THH) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-penney-race#TTT-vs-HTT  ·  brutal

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.test.ts

**Fingerprint:** tmpl-penney-race:a=TTT,b=HTT

**Prompt:** Two players race on ONE shared stream of fair coin flips: A wins if TTT appears first, B wins if HTT appears first. What is the probability that B (HTT) wins? Note the answer is NOT determined by the expected waits.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Why does this hold even though the expected waits differ?
- Is Penney's game transitive? Exhibit or rule out a beating cycle.
- Does the second-mover advantage extend to length-4 patterns?

### tmpl-second-mover#HTT  ·  brutal

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)

**Fingerprint:** tmpl-second-mover:a=HTT

**Prompt:** Your opponent announces the length-3 pattern HTT in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Is there any length-3 pattern whose best counter wins by exactly even money?
- Does a pattern ever beat its own bestBeater?
- How large can the second-mover edge get for length-3 patterns?

### tmpl-second-mover#THH  ·  brutal

**Source:** Green Book §5.4–5.5 p.129–136; src/engine/race.ts (bestBeater + Conway odds)

**Fingerprint:** tmpl-second-mover:a=THH

**Prompt:** Your opponent announces the length-3 pattern THH in a Penney's game on a fair coin, and you choose second. Pick the pattern that maximizes your win probability and state that probability exactly.

**Engine:** src/engine/race.ts · verified: true

**Follow-ups:**
- Is there any length-3 pattern whose best counter wins by exactly even money?
- Does a pattern ever beat its own bestBeater?
- How large can the second-mover edge get for length-3 patterns?

### tmpl-gamblers-ruin#N4-p2_5-i2-reach  ·  brutal

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=5,pNum=2,query=reach

**Prompt:** A gambler does a biased (P(+1)=2/5) random walk between absorbing barriers 0 (ruin) and 4 (win), stepping +1 with probability 2/5 and −1 otherwise. Starting at 2, what is the probability of reaching 4 before hitting 0?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p2_5-i2-duration  ·  brutal

**Source:** Green Book §5.1 p.107–112; src/engine/walk.test.ts

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=5,pNum=2,query=duration

**Prompt:** A gambler does a biased (P(+1)=2/5) random walk between absorbing barriers 0 (ruin) and 4 (win), stepping +1 with probability 2/5 and −1 otherwise. Starting at 2, what is the expected number of steps until the walk is absorbed at 0 or 4?

**Engine:** src/engine/walk.ts · verified: true

**Follow-ups:**
- Generalize the fair-coin formula to arbitrary N and start i.
- Make the coin biased — does reach rise or fall from this start?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-overlap-wait#HTHT  ·  brutal

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=HTHT

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until HTHT first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### tmpl-overlap-wait#HHTT  ·  brutal

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=HHTT

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until HHTT first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### tmpl-overlap-wait#HTHH  ·  brutal

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** tmpl-overlap-wait:pattern=HTHH

**Prompt:** Using the overlap (self-border) shortcut — not a full state machine — find the expected number of fair-coin flips until HTHH first appears, and justify the shortcut with the martingale argument.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- Confirm it agrees with the Markov recurrence for this pattern.
- Design a length-4 pattern that maximizes the wait via its borders.
- Why does the martingale argument need a fair coin?

### ff-pht-longest-len4  ·  brutal

**Source:** Green Book §5.3 p.121–128; src/engine/correlation.test.ts

**Fingerprint:** sem:c763148c4f18

**Prompt:** Among all length-4 H/T patterns, which one has the LONGEST expected wait on a fair coin, and what is that wait? Explain via the self-border structure.

**Engine:** src/engine/correlation.ts · verified: true

**Follow-ups:**
- What length-4 pattern waits the SHORTEST, and why?
- Generalize the longest-wait pattern to length n.
- Confirm against the Markov recurrence.
