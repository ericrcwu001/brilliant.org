# Markov Chains — AI Quant Interview Pack

> **DORMANT capstone asset** — committed to the repo but **NOT** seeded or deployed (the seed glob matches only `fixtures/course-*.json`; this pack lives under `interviews/`).

- **courseId:** course-markov-chains
- **version:** 1
- **concept:** Markov Chains
- **greenBookAnchor:** Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — §5.1 Markov Chain (p.53-57): Markov property, transition matrix, path probability, state classification, and first-step analysis for absorption probability and expected absorption time (gambler's ruin 4/7; dice single-12 vs two consecutive-7s 7/13 & 6/13; coin HHH-before-THH 1/8, E[THH]=8); §5.2 Martingale and Random Walk (p.58-62): symmetric random walk / drunk-man bridge (17/100, 1411) and E[n heads]=2^(n+1)-2. Stationary distribution, convergence, reversibility/detailed balance, periodicity, and PageRank are WEB-anchored (confirmed absent from the Green Book; see concepts/markov-chains/source-pack.md §3 and §5).
- **engineModule:** src/engine/markov.ts

## Pool summary

**Total:** 55

| Tier | Count |
| --- | ---: |
| hard | 15 |
| harder | 23 |
| brutal | 17 |

- **templated:** 50
- **freeForm:** 5

## Interviewer prompt

```
ROLE
You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), a specialist in Markov chains and stochastic processes, running a live mock interview on MARKOV CHAINS. Be professional, probing, and fair-but-pressured: warm enough that the candidate keeps thinking aloud, sharp enough that sloppy reasoning gets caught. You are interviewing one candidate, right now, on the single question below.

THE QUESTION (injected at runtime)
- Prompt: {{prompt}}
- Tier: {{tier}}  (hard | harder | brutal — calibrate your pressure and follow-up depth to the tier)
- Source: {{source}}  (your context only; never read it aloud)

PROTOCOL
1. Ask the question once, faithfully from {{prompt}}, then stop and let the candidate drive. ONE question at a time — never stack asks or surface the follow-ups early.
2. Make them build the MODEL first. Before any arithmetic, push: "What are the states? Is there a state the chain can never leave — so is this absorbing or ergodic? Now write the structure: the transition rows, and the recurrence or balance equation you will actually solve." Reward an explicit setup; flag a candidate who jumps straight to numbers.
3. Probe, don't solve. Ask Socratic questions that test whether they have seen the edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them and do NOT hand over the structure unless they are stuck.
4. Release hints only when genuinely stuck or explicitly asked (see HINTS).
5. After they COMMIT to a final answer, work the follow-up chain (see FOLLOW-UPS).
6. Then close (see SCORING).

EDGE CASES TO PROBE (the Markov traps that separate strong candidates — press the ones this question actually hinges on)
- Absorbing vs ergodic is the master fork: FIRST ask whether any state can never be left. A chain that mixes forever (Ehrenfest urn, weather) has NO absorbing state — ask the long-run share (piP=pi, or Kac's mean return time 1/pi_i), NEVER "when/where is it absorbed." A chain with walls (gambler's ruin, drunkard's walk) IS absorbing — ask which wall (absorption probability) and how long (expected hitting time). Picking the wrong branch is the most common failure.
- Reach probability != expected duration: absorption probability (I-Q)^-1 R is a split with NO +1 (=> i/N for a fair walk); expected hitting time solves (I-Q)t=1, the +1 per step (=> i(N-i)). Candidates conflate them constantly — make them say which object the question asks for.
- Stationary != convergence under periodicity: piP=pi needs only irreducibility, but P^n -> pi needs aperiodicity. The Ehrenfest urn has period 2, so its long-run time-fraction (1/4,1/2,1/4) is answerable while the step-n distribution OSCILLATES and never converges. Do not let "stationary" be conflated with "the distribution at step n settles."
- The start changes the absorption split: a symmetric walk is one-half / one-half per STEP, not one-half to win. From $1 of a $0-to-$4 game, P(reach $4) = 1/4, not 1/2. Press anyone who says "fifty-fifty from anywhere."
- A biased coin breaks the clean fair forms: fair reach = i/N and duration = i(N-i); biased reach = (1 - r^i)/(1 - r^N) with r = q/p (e.g. gambler's ruin from $1, up 2/3 => 4/7). Check they switch forms the moment the chain is asymmetric.
- PageRank != most-in-links: rank is the random surfer's stationary distribution, and damping handles dangling/disconnected pages; on a symmetric cycle every page ties at 1/n regardless of d. Reject "the page with the most in-links wins."
- Event mis-mapping (dice / coin chains): name the absorbing state BEFORE computing — 7/13 = P(a single 12 first), 6/13 = P(two consecutive 7s first). Make them label the target state precisely.
- Detailed balance is a shortcut, not the definition: pi_i p_ij = pi_j p_ji (reversibility) is a fast route to pi for birth-death chains, but not every stationary chain is reversible. Reward using it as a shortcut; flag treating it as the meaning of stationary.

HINTS — escalating, ONLY when stuck
Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, and only after a visible stuck-signal (a long silence, a wrong turn they cannot recover, or an explicit request). Start at the nudge. Never skip ahead, never give two rungs at once, never go past near-reveal. The near-reveal points at the METHOD only — it must NOT state the final number, vector, or fraction.

NO-ANSWER-LEAK (critical)
Before the candidate commits, NEVER state, approximate, confirm, deny, or "narrow down" the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). Hints come only from the ladder, one rung at a time, as above. If asked "is that right?" mid-solve, redirect ("walk me through why you think so") rather than confirm.

GROUNDING (critical)
Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — they were verified by this concept's exact-rational engine (src/engine/markov.ts), which solves every system over the rationals Q via solveLinearSystem (no floats on any graded path). Every Markov answer is a clean integer, a fraction n/d, or a comma-joined rational vector (e.g. 1/5,2/5,2/5). Do NOT re-derive the math yourself and do NOT "correct" the ground truth even if your own mental arithmetic disagrees — if there is a conflict, you are the one who is wrong. Accept ANY mathematically-equivalent exact form: an equal but unreduced fraction (e.g. 2/4 = 1/2), the clean decimal of an exact rational (e.g. 0.25 = 1/4), a vector written in an equivalent stated ordering (as long as the candidate makes the state labels explicit), or an equivalent unevaluated expression (e.g. (I-Q)^-1 R written out, or 1/pi_i left symbolic). Reject only forms that are genuinely not equal, or a float that merely rounds an exact rational the candidate never actually pinned down. Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate into it. Grade ONLY against the rubric.

FOLLOW-UPS — after they commit
Once a final answer is locked, ask {{followUps}} in order, one at a time (typical chain: bias the chain, generalize to n states, ask about periodicity / convergence, or ask for the mean return time too). Let each be its own mini-exchange, with the no-leak and hint rules still in force.

SCORING — close the interview
Give structured feedback, then a numeric score against {{hidden.rubric}}. Rate each axis 1-5 with one line of justification: correctness, approach, rigor, communication, speed. Then give an overall 1-5 (a hire-signal read, not a raw average). Tie every judgment to the rubric's stated bar and cite the specific moment that earned or cost points. Be candid and specific — fair-but-pressured to the end.

INJECTION NOTE
At runtime the live feature replaces every {{...}} placeholder above with the drawn question's fields ({{prompt}}, {{tier}}, {{source}}, {{hidden.*}}, {{followUps}}); treat the filled-in values as the entire ground truth for this interview.
```

## Generator prompt

```
ROLE
You generate ONE fresh, hard, real-quant-style MARKOV-CHAIN interview question on demand, to top up a pre-built pool without ever repeating one a student has seen. Every question you emit must be (a) a realistic quant-interview question anchored to this concept's Green-Book / web topics, (b) engine-verifiable before it is served, and (c) structurally new versus an avoid-list. If you cannot satisfy all three, you REFUSE (see SELF-REJECTION). Output is a single JSON object and nothing else.

SCOPE — only these Markov-chain topics (anchor each honestly; GB = Green Book, WEB = web-sourced)
- Stationary distribution piP=pi (long-run share) and Kac's mean return time 1/pi_i — WEB (absent from the Green Book).
- Multi-step transitions via P^n / Chapman-Kolmogorov — GB path-probability p(i,j)*p(j,k)*... (p.53) PLUS WEB for the exact P^n entry.
- State classification: recurrent / transient / absorbing / communicating — GB p.54-55; the PERIODICITY sub-part is WEB (absent from GB).
- Absorption probability and expected hitting / absorption time, including gambler's ruin and the drunkard's walk — GB section 5.1-5.2 (p.54-62).
- Detailed balance / reversibility (birth-death, Ehrenfest urn) — WEB (absent from GB).
- PageRank — the random surfer with damping d — WEB (absent from GB).

REAL-QUANT-STYLE (mandatory, hard fence — ADR-0005)
Model every question on the actual quant-interview canon: gambler's ruin, the weather / Land-of-Oz stationary chain, dice and coin absorption races (a single 12 vs two consecutive 7s; HHH vs THH), the Ehrenfest urn (reversibility / detailed balance), and PageRank. It must read like something genuinely asked on a Jane Street / Citadel / IMC desk. NEVER invent an arbitrary chain puzzle that merely happens to be engine-solvable — real-quant-style grounding is not optional.

PREFER TEMPLATES (first choice); free-form only as a fallback
First, try to PARAMETERIZE an engine-backed template (set template.id + template.params), since templates are inherently verifiable. The eight forms and the engine function each maps to:
- tmpl-stationary          -> stationaryDistribution(P)              (weather / cloudy-town chain; long-run share)
- tmpl-multistep           -> matrixPower(P, n), then read the (i,j) entry or a row   (Chapman-Kolmogorov)
- tmpl-absorption          -> absorptionProbabilities(P, absorbing)  (dice 12-vs-7s, coin HHH/THH, reach-a-wall)
- tmpl-expected-absorption -> expectedAbsorptionTime(P, absorbing)   (drunkard i(N-i), E[THH])
- tmpl-gamblers-ruin       -> absorptionProbabilities AND expectedAbsorptionTime on a 1-D walk   (reach prob AND duration; fair + biased)
- tmpl-detailed-balance    -> detailedBalance(P) / isReversible(P, pi)   (Ehrenfest / birth-death => stationary)
- tmpl-kac-return          -> kacReturnTime(P, i)    (= 1/pi_i)
- tmpl-pagerank            -> pagerank(linkGraph, damping)   (random surfer; row-stochastic out-link graph; left stationary of the Google matrix)
Emit a free-form question ONLY if no template fits — and it STILL must pass engine verification below, with fingerprint "sem:<hash>".

ENGINE-VERIFY-BEFORE-SERVE (second hard fence — ADR-0005)
Your output MUST carry the exact data to reproduce the answer with src/engine/markov.ts, so the live feature can RUN the engine and REJECT / regenerate anything it cannot verify. In engineCheck put: module = "src/engine/markov.ts"; calls = the exact function call(s) with concrete args (transition rows as small-denominator rationals); answer = the exact value the engine returns. The engine is EXACT-RATIONAL (solveLinearSystem over Q). Documented functions, signatures, and ranges:
- buildChain(P, labels) -> validates P is square and EVERY row sums to exactly 1 (use to assert a well-formed stochastic chain before any other call).
- stationaryDistribution(P) -> Rational[] solving piP=pi with sum(pi)=1. Requires an irreducible chain.
- matrixPower(P, n) -> Rational[][], the exact P^n; the graded answer is the asked (i,j) entry or a row.
- absorptionProbabilities(P, absorbing: number[]) -> Rational[][] = (I-Q)^-1 R; row = transient start state, column = absorbing target. The graded answer is the asked entry (or the column vector).
- expectedAbsorptionTime(P, absorbing: number[]) -> Rational[] solving (I-Q)t=1; one entry per transient state.
- classifyStates(P) -> per state {class, kind: recurrent | transient | absorbing, period}.
- detailedBalance(P) -> {reversible: boolean, pi: Rational[]};  isReversible(P, pi) -> boolean.
- kacReturnTime(P, i) -> Rational = 1/pi_i.
- pagerank(linkGraph, damping: Rational) -> Rational[], the stationary of G = d*M + (1-d)/n * J (M is the row-stochastic out-link matrix; all-zero dangling rows are replaced with a uniform row).
- Output format: answers print via formatRational / formatVector — an integer, a fraction n/d, or a comma-joined vector in the chain's state order (e.g. 1/5,2/5,2/5).
HARD RANGE RULE: every graded answer must be an exact rational, an integer, or a vector of them. Keep all transition probabilities small-denominator rationals and the chain small (<= ~12 states) so the exact-rational solve stays representable. NEVER emit a decimal approximation or an irrational. The standard damped PageRank decimals (e.g. d = 0.85 giving roughly .387/.214/.399) are NOT clean rationals — only emit a PageRank answer the engine reproduces exactly (e.g. the symmetric cycle 1/3,1/3,1/3 for any rational d, or the d = 1 four-node 4/13,5/13,1/13,3/13). If the natural answer would be irrational or out of range, switch to a parameterization whose answer is an exact rational, or REFUSE.

AVOID-LIST / NO-OVERLAP
You are given avoidList: an array of fingerprints (the student's seen-set union the global pool). Your question's fingerprint MUST NOT be in avoidList. Fingerprint = "<templateId>:<normalized-params>" for a template (sort params into a canonical order so trivial re-parameterizations collide), or "sem:<hash>" for free-form (hash the structural semantics — states, transition probabilities, and what is asked — not the wording, so reworded duplicates collide). If your first candidate's fingerprint is in avoidList, change the structure or parameters until it is new, or REFUSE.

OUTPUT SCHEMA (emit EXACTLY this one JSON object — no prose, no code fences; the comments below are explanatory only)
{
  "tier": "hard | harder | brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<hash>",
  "template": { "id": "<templateId>", "params": { } },
  "prompt": "the question text shown to the candidate",
  "source": "Green Book p.<n> section 5.x  |  <web / real quant-interview source> (mark GB-anchored or WEB-anchored)",
  "engineCheck": {
    "module": "src/engine/markov.ts",
    "calls": [ "exact call(s) with concrete rational args, e.g. stationaryDistribution([[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]])" ],
    "answer": "<exact value the engine returns, e.g. 1/5,2/5,2/5>"
  },
  "hidden": {
    "answer": "<exact answer; identical value to engineCheck.answer>",
    "approaches": [ "accepted solution path 1", "alternate accepted path 2" ],
    "wrongTurns": [ "common misconception 1", "common misconception 2" ],
    "hintLadder": [ "nudge", "stronger", "near-reveal" ],
    "rubric": {
      "correctness": "what a correct answer must contain",
      "approach": "what a strong method looks like (e.g. classify absorbing-vs-ergodic FIRST, then pick the formula)",
      "rigor": "states the irreducibility / aperiodicity assumptions; keeps exact rationals; names the absorbing target before computing",
      "communication": "clarity of the think-aloud",
      "speed": "the pace bar for this tier"
    }
  },
  "followUps": [ "first follow-up (e.g. bias the chain / generalize to n states)", "second follow-up" ]
}

FIELD RULES
- tier: tag honestly; the floor is "hard" (always harder than any lesson's mastery challenge). "harder" / "brutal" add cross-topic synthesis or nastier parameters.
- hintLadder: EXACTLY 3 rungs, escalating nudge -> stronger -> near-reveal. The near-reveal points at the METHOD / structure ONLY — it must NOT state the final number, vector, or fraction.
- hidden.answer MUST equal engineCheck.answer exactly (the verified rational or vector, in the engine's state order).
- followUps: a real chain (>=1, ideally 2-3): bias the chain, generalize to n states, ask periodicity / convergence, or ask the mean return time too.
- source: anchor to the Green-Book section the topic comes from (GB section 5.1-5.2 for path-probability, classification, absorption, hitting time, gambler's ruin), or a web / real quant-interview source for the WEB-only topics (stationary, convergence, reversibility, periodicity, PageRank) — and say which.

SELF-REJECTION (never serve an unverifiable or off-fence question)
If you cannot produce a question that is simultaneously (a) real-quant-style + GB / web-anchored, (b) engine-verifiable within the exact-rational range, and (c) structurally new vs avoidList — do NOT emit a question. Instead output exactly:
{ "refusal": true, "reason": "<one line: which fence failed — not-anchored | not-engine-verifiable | out-of-range/irrational | no-new-fingerprint>" }
An honest refusal beats an unverifiable or repeated question.
```

## Templates

| id | title | source | description |
| --- | --- | --- | --- |
| tmpl-stationary | Stationary distribution piP=pi — long-run share of a regime | WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852 | Solve piP=pi with sum(pi)=1 for the long-run time-share; interpret it and argue why a regular chain forgets its start. |
| tmpl-multistep | Multi-step transitions — entries of P^n (Chapman-Kolmogorov) | GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6) | An n-step probability is the (from,to) entry of P^n; it sums over every intermediate path, not one path. |
| tmpl-absorption | Absorption probability — which exit, via (I-Q)^-1 R / first-step analysis | GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15) | P(absorbed at one target before another) by first-step analysis B=(I-Q)^-1 R — a split with no +1; the start sets the split. |
| tmpl-expected-absorption | Expected time to absorption — (I-Q)t=1 (the +1 per step) | GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15) | Expected steps to absorption, solving (I-Q)t=1 — every step adds the +1 a probability-split lacks. |
| tmpl-gamblers-ruin | Gambler's ruin / birth-death walk — reach probability and expected duration | GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15) | Boundary-value problems on a 0..N walk with up-prob p: reach P(hit N before 0|i) and duration E[steps|i]; fair gives i/N and i(N-i), bias breaks both. |
| tmpl-detailed-balance | Reversibility & detailed balance — pi without solving the whole system | WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3 | When pi_i p_ij = pi_j p_ji holds (birth-death / 2-state), march the ratios along the ladder to read pi directly. |
| tmpl-kac-return | Kac's mean return time — 1/pi_i | WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town) | Expected steps to first return to a state = the reciprocal of its stationary share, 1/pi_i. |
| tmpl-pagerank | PageRank — stationary distribution of the damped random surfer | WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping) | Rank pages by the stationary distribution of G=d*M+(1-d)/n*J (M = row-stochastic out-links); the surfer's long-run share IS the rank. |

## Questions

**Tier: hard**

### tmpl-stationary#machine-2  ·  hard

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=machine-2

**Prompt:** A trading signal flips between **on** and **off**: an on-day stays on w.p. 1/2 (else off); an off-day stays off w.p. 2/3 (else on). Build the transition matrix from these words, then find the long-run fraction of on vs off days; show the 2-state fixed point and explain the b/(a+b) structure.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['machine-2'].P) · answer: 2/5,3/5 · verified: true

#### Hidden

**Answer:** 2/5,3/5

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of machine-2.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-stationary#clear-rainy  ·  hard

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=weather-clear-rainy

**Prompt:** You model a stock's daily regime as two states. If it's **clear** today it stays clear tomorrow w.p. 3/5 (else rainy); if **rainy** it stays rainy w.p. 7/10 (else clear). Build the transition matrix from these words, then find the long-run fraction of days in each regime — and justify why the answer does **not** depend on today's regime.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['weather-clear-rainy'].P) · answer: 3/7,4/7 · verified: true

#### Hidden

**Answer:** 3/7,4/7

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of weather-clear-rainy.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-stationary#gfg  ·  hard

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=weather-gfg

**Prompt:** A two-state system: from A -> A w.p. 7/10 (else B); from B -> B w.p. 6/10 (else A). Construct P, then compute the steady-state share of time in each state and explain what 'steady state' means operationally for a desk that only cares about long-run occupancy.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['weather-gfg'].P) · answer: 4/7,3/7 · verified: true

#### Hidden

**Answer:** 4/7,3/7

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of weather-gfg.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-stationary#snoqualmie  ·  hard

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=snoqualmie

**Prompt:** In Snoqualmie the weather is sticky: a **clear** day stays clear w.p. 4/5; a **rainy** day stays rainy w.p. 3/5. Build P and find the fraction of clear vs rainy days in the long run; show your pi is unchanged by one more day and say why that fixed-point property is the definition you need.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['snoqualmie'].P) · answer: 2/3,1/3 · verified: true

#### Hidden

**Answer:** 2/3,1/3

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of snoqualmie.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-multistep#clear-rainy-n2-c-r  ·  hard

**Source:** GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)

**Fingerprint:** tmpl-multistep:chain=weather-clear-rainy,from=0,n=2,to=1

**Prompt:** Two-state daily regime (clear->clear 3/5; rainy->rainy 7/10). Given it is **clear today**, what's the probability it is **rainy two days from now**? Build P, square it, and explain why this is not a single path's probability.

**Engine check:** src/engine/markov.ts · matrixPower(CHAINS['weather-clear-rainy'].P, 2)[0][1] · answer: 13/25 · verified: true

#### Hidden

**Answer:** 13/25

**Approaches:**
- Form P^n by repeated squaring over the rationals and read entry (from,to).
- Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.

**Wrong turns:**
- multiply one most-likely path instead of summing all intermediate states
- (P^n)_ij = (P_ij)^n — raise the entry, not the matrix
- rows of P^n stop summing to 1
- confuse the n-step transition with the stationary share

**Hint ladder:**
1. An n-step probability is the (0->1) entry of P raised to the n-th power for weather-clear-rainy, not a single path.
2. Multiply P by itself 2 times (repeated squaring is fine); the entry you want sums the probabilities of all length-2 paths from 0 to 1.
3. Read row 0, column 1 of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.

**Rubric:**
- correctness: matches the exact (from,to) entry of P^n
- approach: computes P^n (or pushes the row vector n steps) and reads the right entry
- rigor: sums over all intermediate states; entries stay exact-rational
- communication: explains Chapman-Kolmogorov as one-step total probability repeated
- speed: uses repeated squaring / one row push, not path enumeration

**Follow-ups:**
- Push n higher — what vector does this row approach, and why?
- As n->infinity does the answer depend on the starting row? Tie it to pi.
- Compute the same entry one step earlier and explain the change.

### tmpl-multistep#oz-n2-rain-rain  ·  hard

**Source:** GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)

**Fingerprint:** tmpl-multistep:chain=land-of-oz,from=0,n=2,to=0

**Prompt:** Land of Oz (Rain/Nice/Snow). Given it **rains today**, probability it **rains again exactly two days later**. Compute via P^2 and explain why you must sum over the weather on the in-between day.

**Engine check:** src/engine/markov.ts · matrixPower(CHAINS['land-of-oz'].P, 2)[0][0] · answer: 7/16 · verified: true

#### Hidden

**Answer:** 7/16

**Approaches:**
- Form P^n by repeated squaring over the rationals and read entry (from,to).
- Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.

**Wrong turns:**
- multiply one most-likely path instead of summing all intermediate states
- (P^n)_ij = (P_ij)^n — raise the entry, not the matrix
- rows of P^n stop summing to 1
- confuse the n-step transition with the stationary share

**Hint ladder:**
1. An n-step probability is the (0->0) entry of P raised to the n-th power for land-of-oz, not a single path.
2. Multiply P by itself 2 times (repeated squaring is fine); the entry you want sums the probabilities of all length-2 paths from 0 to 0.
3. Read row 0, column 0 of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.

**Rubric:**
- correctness: matches the exact (from,to) entry of P^n
- approach: computes P^n (or pushes the row vector n steps) and reads the right entry
- rigor: sums over all intermediate states; entries stay exact-rational
- communication: explains Chapman-Kolmogorov as one-step total probability repeated
- speed: uses repeated squaring / one row push, not path enumeration

**Follow-ups:**
- Push n higher — what vector does this row approach, and why?
- As n->infinity does the answer depend on the starting row? Tie it to pi.
- Compute the same entry one step earlier and explain the change.

### tmpl-absorption#gambler-1to3  ·  hard

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=gambler-0to3-up2_3,start=1,target=3

**Prompt:** A gambler holding $1 plays a game with an **edge**: each round +$1 w.p. 2/3, -$1 w.p. 1/3, stopping at $0 (broke) or $3 (cash out). Build the chain and find P(cash out at $3 before going broke | start $1). Explain why the edge does not break first-step analysis and why the **start** changes the answer.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['gambler-0to3-up2_3'].P, [0,3])[0][1] · answer: 4/7 · verified: true

#### Hidden

**Answer:** 4/7

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on gambler-0to3-up2_3 for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-absorption#drunkard-1to4  ·  hard

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=drunkard-0to4,start=1,target=4

**Prompt:** A token does a symmetric +/-1 walk on 0-4 with 0 and 4 absorbing. From state **1**, probability of absorption at 4 before 0. Build it and explain why 'each step is 1/2-1/2' does **not** mean the outcome is 50/50.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['drunkard-0to4'].P, [0,4])[0][1] · answer: 1/4 · verified: true

#### Hidden

**Answer:** 1/4

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on drunkard-0to4 for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-expected-absorption#drunkard-i2  ·  hard

**Source:** GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)

**Fingerprint:** tmpl-expected-absorption:chain=drunkard-0to4,start=2

**Prompt:** Symmetric +/-1 walk on 0-4 (ends absorbing). Expected number of steps until absorption, **starting at 2**. Build it and explain where the '+1 per step' comes from (and why a probability question wouldn't have it).

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(CHAINS['drunkard-0to4'].P, [0,4])[1] · answer: 4 · verified: true

#### Hidden

**Answer:** 4

**Approaches:**
- Write t_i = 1 + sum_j p_ij t_j (t=0 at absorbing) and solve (I-Q)t=1.
- Fair symmetric walk: t_i = i(N-i); run-length wait: cross-check against 2^(n+1)-2.

**Wrong turns:**
- drop the +1 (treat it like a probability split)
- in a run-length chain a mismatch always resets to the empty start (it falls back to the longest still-valid prefix)
- expected time and absorption probability are the same computation
- expected time is symmetric in the start even under bias

**Hint ladder:**
1. This asks 'how long until absorbed', so every transient step carries a +1 — set up t_i = 1 + (probability-weighted successors) on drunkard-0to4.
2. One unknown per non-absorbing state, absorbing states zero; remember a failed step in a run-length chain falls back to the longest still-matching prefix, not always to the start.
3. Solve from the absorbing boundary backward; the whole count is the accumulated +1's — keep them, and don't count the first step twice.

**Rubric:**
- correctness: matches the exact expected absorption time from the named start
- approach: solves t_i = 1 + sum p_ij t_j with t=0 at absorbing states
- rigor: keeps the +1 on every transient row; a run-length mismatch falls back, not always to the empty start
- communication: contrasts the +1 here with the no-+1 absorption split
- speed: solves the small system cleanly; no double-counting the first step

**Follow-ups:**
- Now give the absorption probability from the same start — drop the +1.
- Bias the coin/walk — does the time rise or fall?
- Generalize to a length-n run / N-step walk closed form.

### tmpl-expected-absorption#hh-wait  ·  hard

**Source:** GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)

**Fingerprint:** tmpl-expected-absorption:chain=hh-wait,start=0

**Prompt:** Fair coin. Expected number of flips until **HH** first appears. Build the run-length chain {empty,H,HH} and explain why a tail seen right after a single head sends you back to the empty start — and why that reset lengthens the wait.

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(CHAINS['hh-wait'].P, [2])[0] · answer: 6 · verified: true

#### Hidden

**Answer:** 6

**Approaches:**
- Write t_i = 1 + sum_j p_ij t_j (t=0 at absorbing) and solve (I-Q)t=1.
- Fair symmetric walk: t_i = i(N-i); run-length wait: cross-check against 2^(n+1)-2.

**Wrong turns:**
- drop the +1 (treat it like a probability split)
- in a run-length chain a mismatch always resets to the empty start (it falls back to the longest still-valid prefix)
- expected time and absorption probability are the same computation
- expected time is symmetric in the start even under bias

**Hint ladder:**
1. This asks 'how long until absorbed', so every transient step carries a +1 — set up t_i = 1 + (probability-weighted successors) on hh-wait.
2. One unknown per non-absorbing state, absorbing states zero; remember a failed step in a run-length chain falls back to the longest still-matching prefix, not always to the start.
3. Solve from the absorbing boundary backward; the whole count is the accumulated +1's — keep them, and don't count the first step twice.

**Rubric:**
- correctness: matches the exact expected absorption time from the named start
- approach: solves t_i = 1 + sum p_ij t_j with t=0 at absorbing states
- rigor: keeps the +1 on every transient row; a run-length mismatch falls back, not always to the empty start
- communication: contrasts the +1 here with the no-+1 absorption split
- speed: solves the small system cleanly; no double-counting the first step

**Follow-ups:**
- Now give the absorption probability from the same start — drop the +1.
- Bias the coin/walk — does the time rise or fall?
- Generalize to a length-n run / N-step walk closed form.

### tmpl-gamblers-ruin#N4-p1_2-i1-reach  ·  hard

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=1,pDen=2,pNum=1,query=reach

**Prompt:** A market-maker's inventory does a **fair** +/-1 walk between a hard floor 0 and ceiling 4 (both force a stop). From inventory **1**, probability of hitting the ceiling 4 before the floor 0. Give the closed form and justify why reach is **linear** in the start.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(buildWalk(4,1,2),[0,4])[0][1] · answer: 1/4 · verified: true

#### Hidden

**Answer:** 1/4

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p1_2-i2-duration  ·  hard

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=2,pNum=1,query=duration

**Prompt:** Same fair inventory walk on 0-4. Expected number of steps until it stops, **from 2**. Contrast this with the reach probability — which carries a +1 and why?

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(buildWalk(4,1,2),[0,4])[1] · answer: 4 · verified: true

#### Hidden

**Answer:** 4

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-detailed-balance#weather-half-3q  ·  hard

**Source:** WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3

**Fingerprint:** tmpl-detailed-balance:chain=weather-half-3q

**Prompt:** Two-state chain: A->A 1/2, B->B 3/4. **Without** solving the full eigen-system, use detailed balance to get the stationary vector in one line — and explain why **every** irreducible 2-state chain is automatically reversible.

**Engine check:** src/engine/markov.ts · detailedBalance(CHAINS['weather-half-3q'].P).pi · answer: 1/3,2/3 · verified: true

#### Hidden

**Answer:** 1/3,2/3

**Approaches:**
- Chain pi_{i+1} = pi_i * p_{i,i+1}/p_{i+1,i} from one end, then normalize sum(pi)=1 (telescopes to the binomial for Ehrenfest).
- 2-state: detailed balance is automatic; pi=(b/(a+b), a/(a+b)).

**Wrong turns:**
- every chain is reversible / detailed balance always holds
- you must solve the full piP=pi system; the balance shortcut is not allowed
- detailed balance is identical to global balance piP=pi (it is strictly stronger)
- forget to normalize the telescoped ratios to sum to 1

**Hint ladder:**
1. This chain is reversible, so skip the full solve: use detailed balance, pi_i*p_ij = pi_j*p_ji, on weather-half-3q.
2. Walk the balance equation along the birth-death ladder, expressing each state's share as a multiple of its neighbor's via the up/down probability ratio.
3. Telescope those ratios from one end and normalize so the shares sum to one — read off the (binomial) pattern rather than naming the entries.

**Rubric:**
- correctness: matches the exact stationary vector of the reversible chain
- approach: uses detailed balance along the birth-death ladder, then normalizes
- rigor: confirms reversibility before using the shortcut; exact rationals
- communication: explains why detailed balance => stationary (flows cancel edge-by-edge)
- speed: telescopes the ladder rather than solving the full eigen-system

**Follow-ups:**
- Confirm your pi also satisfies global balance piP=pi.
- Is the chain periodic? If so does P^n converge even though pi exists?
- Generalize Ehrenfest to m balls (binomial C(m,i)/2^m).

### tmpl-kac-return#clear-rainy-clear  ·  hard

**Source:** WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)

**Fingerprint:** tmpl-kac-return:chain=weather-clear-rainy,state=0

**Prompt:** Clear/rainy chain (clear->clear 3/5; rainy->rainy 7/10). What is the mean number of days between consecutive **clear** days (first return to Clear)? Use Kac and explain its link to the stationary share.

**Engine check:** src/engine/markov.ts · kacReturnTime(CHAINS['weather-clear-rainy'].P, 0) · answer: 7/3 · verified: true

#### Hidden

**Answer:** 7/3

**Approaches:**
- Solve piP=pi, take the asked state's component, return its reciprocal.
- 2-state: pi=(b/(a+b), a/(a+b)) then invert the chosen component.

**Wrong turns:**
- mean return time equals the mean hitting time from some other fixed state
- every state has the same return time
- return time is 1/pi for the WHOLE chain rather than per-state
- use the raw transition probability instead of the stationary share

**Hint ladder:**
1. Mean return time is a stationary-distribution question in disguise — first get the long-run share of state Clear in weather-clear-rainy.
2. Kac's theorem: the expected first return time to a state is the reciprocal of that state's stationary probability.
3. Compute the stationary share of state Clear, then take its reciprocal and reduce — derive the share, don't read it off the matrix.

**Rubric:**
- correctness: matches the exact mean return time 1/pi_i for the named state
- approach: find the stationary share of the state, then reciprocate (Kac)
- rigor: uses the long-run time-share (not a hitting time from a fixed other state); exact rational
- communication: explains why a rarer state has a longer mean return time
- speed: one stationary component, then its reciprocal

**Follow-ups:**
- Compare two states' return times — which recurs faster and why?
- Halve a state's pi — what happens to its return time?
- Does periodicity change the mean return time? (No — still 1/pi_i.)

### tmpl-pagerank#3cycle-d85_100  ·  hard

**Source:** WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)

**Fingerprint:** tmpl-pagerank:dDen=100,dNum=85,graph=pr-3cycle

**Prompt:** Three pages link in a cycle A->B->C->A. With the standard damping **d=0.85**, compute the PageRank vector and name the most important page. Explain the result in one sentence.

**Engine check:** src/engine/markov.ts · pagerank(GRAPHS['pr-3cycle'], reduce(85,100)) · answer: 1/3,1/3,1/3 · verified: true

#### Hidden

**Answer:** 1/3,1/3,1/3

**Approaches:**
- Form G=d*M+(1-d)/n*J from the row-stochastic link matrix, solve piG=pi, sum(pi)=1.
- If the graph is vertex-transitive (a pure cycle), argue by symmetry that pi is uniform for any d.

**Wrong turns:**
- the page with the most in-links is automatically most important
- changing the damping d changes the ranking of a symmetric graph
- PageRank is not a Markov stationary distribution
- dangling (no out-link) nodes can be left as all-zero rows

**Hint ladder:**
1. PageRank is just a stationary distribution: build the random-surfer matrix for pr-3cycle with damping d=85/100 and solve piG=pi.
2. G mixes the link-following matrix (weight d) with a uniform teleport (weight 1-d); on a fully symmetric graph both pieces are symmetric — think about what that forces.
3. Solve the stationary system of G and reduce (or invoke symmetry); rank by the resulting shares — never by raw in-link counts.

**Rubric:**
- correctness: matches the exact PageRank vector for the graph and damping d
- approach: builds G=d*M+(1-d)/n*J and solves the stationary piG=pi
- rigor: handles dangling nodes (uniform row); exact rationals; ranks by the vector, not in-degree
- communication: explains PageRank as 'importance = where a random surfer spends time'
- speed: exploits symmetry (uniform answer) when present instead of solving blindly

**Follow-ups:**
- Rank all pages and name the most important — does it match in-degree?
- Lower d toward 0 — what distribution do you approach, and why?
- Redirect one link — predict which page gains rank.

**Tier: harder**

### tmpl-stationary#weather-asym  ·  harder

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=weather-asym

**Prompt:** Regime chain: S1 -> S1 w.p. 1/4 (else S2); S2 -> S2 w.p. 4/5 (else S1). Build it and give the long-run share of each state as exact fractions; the denominators aren't pretty — explain where the 19 comes from in terms of a+b.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['weather-asym'].P) · answer: 4/19,15/19 · verified: true

#### Hidden

**Answer:** 4/19,15/19

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of weather-asym.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-stationary#cloudy-town  ·  harder

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=cloudy-town

**Prompt:** A city cycles **sunny/cloudy/rainy**: from sunny it never stays sunny (1/2 cloudy, 1/2 rainy); from cloudy it's 1/4 sunny, 1/2 cloudy, 1/4 rainy; from rainy it's 1/4 sunny, 1/4 cloudy, 1/2 rainy. Build P, find the long-run share of each weather, and argue the chain is ergodic (so the share is unique and start-independent).

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['cloudy-town'].P) · answer: 1/5,2/5,2/5 · verified: true

#### Hidden

**Answer:** 1/5,2/5,2/5

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of cloudy-town.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-stationary#land-of-oz  ·  harder

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=land-of-oz

**Prompt:** Land of Oz weather (Rain/Nice/Snow): Rain->(1/2,1/4,1/4), Nice->(1/2,0,1/2), Snow->(1/4,1/4,1/2). Build P and find the long-run share of each — then state which state is rarest and explain why 'Nice' is squeezed out structurally.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['land-of-oz'].P) · answer: 2/5,1/5,2/5 · verified: true

#### Hidden

**Answer:** 2/5,1/5,2/5

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of land-of-oz.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-multistep#oz-n2-rain-snow  ·  harder

**Source:** GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)

**Fingerprint:** tmpl-multistep:chain=land-of-oz,from=0,n=2,to=2

**Prompt:** Land of Oz: probability it **snows exactly two days after a rainy day**. Set up Chapman-Kolmogorov and explain why this 2-step probability is a sum over the intermediate state, not one path.

**Engine check:** src/engine/markov.ts · matrixPower(CHAINS['land-of-oz'].P, 2)[0][2] · answer: 3/8 · verified: true

#### Hidden

**Answer:** 3/8

**Approaches:**
- Form P^n by repeated squaring over the rationals and read entry (from,to).
- Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.

**Wrong turns:**
- multiply one most-likely path instead of summing all intermediate states
- (P^n)_ij = (P_ij)^n — raise the entry, not the matrix
- rows of P^n stop summing to 1
- confuse the n-step transition with the stationary share

**Hint ladder:**
1. An n-step probability is the (0->2) entry of P raised to the n-th power for land-of-oz, not a single path.
2. Multiply P by itself 2 times (repeated squaring is fine); the entry you want sums the probabilities of all length-2 paths from 0 to 2.
3. Read row 0, column 2 of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.

**Rubric:**
- correctness: matches the exact (from,to) entry of P^n
- approach: computes P^n (or pushes the row vector n steps) and reads the right entry
- rigor: sums over all intermediate states; entries stay exact-rational
- communication: explains Chapman-Kolmogorov as one-step total probability repeated
- speed: uses repeated squaring / one row push, not path enumeration

**Follow-ups:**
- Push n higher — what vector does this row approach, and why?
- As n->infinity does the answer depend on the starting row? Tie it to pi.
- Compute the same entry one step earlier and explain the change.

### tmpl-multistep#clear-rainy-n2-r-c  ·  harder

**Source:** GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)

**Fingerprint:** tmpl-multistep:chain=weather-clear-rainy,from=1,n=2,to=0

**Prompt:** Clear/rainy chain. Given **rainy today**, probability it is **clear two days later**. Compute (P^2) and contrast this entry with the long-run clear share — are they close, and should they be after only two steps?

**Engine check:** src/engine/markov.ts · matrixPower(CHAINS['weather-clear-rainy'].P, 2)[1][0] · answer: 39/100 · verified: true

#### Hidden

**Answer:** 39/100

**Approaches:**
- Form P^n by repeated squaring over the rationals and read entry (from,to).
- Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.

**Wrong turns:**
- multiply one most-likely path instead of summing all intermediate states
- (P^n)_ij = (P_ij)^n — raise the entry, not the matrix
- rows of P^n stop summing to 1
- confuse the n-step transition with the stationary share

**Hint ladder:**
1. An n-step probability is the (1->0) entry of P raised to the n-th power for weather-clear-rainy, not a single path.
2. Multiply P by itself 2 times (repeated squaring is fine); the entry you want sums the probabilities of all length-2 paths from 1 to 0.
3. Read row 1, column 0 of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.

**Rubric:**
- correctness: matches the exact (from,to) entry of P^n
- approach: computes P^n (or pushes the row vector n steps) and reads the right entry
- rigor: sums over all intermediate states; entries stay exact-rational
- communication: explains Chapman-Kolmogorov as one-step total probability repeated
- speed: uses repeated squaring / one row push, not path enumeration

**Follow-ups:**
- Push n higher — what vector does this row approach, and why?
- As n->infinity does the answer depend on the starting row? Tie it to pi.
- Compute the same entry one step earlier and explain the change.

### tmpl-multistep#oz-n3-rain-snow  ·  harder

**Source:** GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)

**Fingerprint:** tmpl-multistep:chain=land-of-oz,from=0,n=3,to=2

**Prompt:** Land of Oz: probability it **snows exactly three days after rain**. Compute P^3 and comment on how the Rain->Snow entry is moving relative to the n=2 value.

**Engine check:** src/engine/markov.ts · matrixPower(CHAINS['land-of-oz'].P, 3)[0][2] · answer: 25/64 · verified: true

#### Hidden

**Answer:** 25/64

**Approaches:**
- Form P^n by repeated squaring over the rationals and read entry (from,to).
- Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.

**Wrong turns:**
- multiply one most-likely path instead of summing all intermediate states
- (P^n)_ij = (P_ij)^n — raise the entry, not the matrix
- rows of P^n stop summing to 1
- confuse the n-step transition with the stationary share

**Hint ladder:**
1. An n-step probability is the (0->2) entry of P raised to the n-th power for land-of-oz, not a single path.
2. Multiply P by itself 3 times (repeated squaring is fine); the entry you want sums the probabilities of all length-3 paths from 0 to 2.
3. Read row 0, column 2 of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.

**Rubric:**
- correctness: matches the exact (from,to) entry of P^n
- approach: computes P^n (or pushes the row vector n steps) and reads the right entry
- rigor: sums over all intermediate states; entries stay exact-rational
- communication: explains Chapman-Kolmogorov as one-step total probability repeated
- speed: uses repeated squaring / one row push, not path enumeration

**Follow-ups:**
- Push n higher — what vector does this row approach, and why?
- As n->infinity does the answer depend on the starting row? Tie it to pi.
- Compute the same entry one step earlier and explain the change.

### tmpl-absorption#gambler-2to3  ·  harder

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=gambler-0to3-up2_3,start=2,target=3

**Prompt:** Same edged gambler (+$1 w.p. 2/3) on $0-$3, but starting at **$2**. P(cash out at $3 first). Explain how moving one dollar up changed the split, and why this stays an exact rational.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['gambler-0to3-up2_3'].P, [0,3])[1][1] · answer: 6/7 · verified: true

#### Hidden

**Answer:** 6/7

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on gambler-0to3-up2_3 for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-absorption#coin-thh-first  ·  harder

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=coin-hhh-thh,start=0,target=6

**Prompt:** A fair coin is flipped until **HHH** or **THH** appears (whichever first). Build the combined pattern chain and find P(**THH** appears first). Explain the 'ambush' structure that makes THH so dominant.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['coin-hhh-thh'].P, [5,6])[0][1] · answer: 7/8 · verified: true

#### Hidden

**Answer:** 7/8

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on coin-hhh-thh for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-absorption#dice-12-first  ·  harder

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=dice-12-vs-77,start=0,target=3

**Prompt:** Two dice are summed each roll. One player wins if a **single 12** appears first, the other if **two consecutive 7s** appear first. Build the {S,7,77,12} chain (per-roll P(7)=1/6, P(12)=1/36) and find P(**single 12 first**). State precisely which absorbing state you're solving for.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['dice-12-vs-77'].P, [2,3])[0][1] · answer: 7/13 · verified: true

#### Hidden

**Answer:** 7/13

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on dice-12-vs-77 for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-expected-absorption#drunkard-i1  ·  harder

**Source:** GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)

**Fingerprint:** tmpl-expected-absorption:chain=drunkard-0to4,start=1

**Prompt:** Same symmetric walk on 0-4. Expected steps to absorption **from state 1**. Build it, give the value, and explain via symmetry why starting at 1 and starting at 3 take the same expected time.

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(CHAINS['drunkard-0to4'].P, [0,4])[0] · answer: 3 · verified: true

#### Hidden

**Answer:** 3

**Approaches:**
- Write t_i = 1 + sum_j p_ij t_j (t=0 at absorbing) and solve (I-Q)t=1.
- Fair symmetric walk: t_i = i(N-i); run-length wait: cross-check against 2^(n+1)-2.

**Wrong turns:**
- drop the +1 (treat it like a probability split)
- in a run-length chain a mismatch always resets to the empty start (it falls back to the longest still-valid prefix)
- expected time and absorption probability are the same computation
- expected time is symmetric in the start even under bias

**Hint ladder:**
1. This asks 'how long until absorbed', so every transient step carries a +1 — set up t_i = 1 + (probability-weighted successors) on drunkard-0to4.
2. One unknown per non-absorbing state, absorbing states zero; remember a failed step in a run-length chain falls back to the longest still-matching prefix, not always to the start.
3. Solve from the absorbing boundary backward; the whole count is the accumulated +1's — keep them, and don't count the first step twice.

**Rubric:**
- correctness: matches the exact expected absorption time from the named start
- approach: solves t_i = 1 + sum p_ij t_j with t=0 at absorbing states
- rigor: keeps the +1 on every transient row; a run-length mismatch falls back, not always to the empty start
- communication: contrasts the +1 here with the no-+1 absorption split
- speed: solves the small system cleanly; no double-counting the first step

**Follow-ups:**
- Now give the absorption probability from the same start — drop the +1.
- Bias the coin/walk — does the time rise or fall?
- Generalize to a length-n run / N-step walk closed form.

### tmpl-expected-absorption#thh-wait  ·  harder

**Source:** GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)

**Fingerprint:** tmpl-expected-absorption:chain=thh-wait,start=0

**Prompt:** Fair coin. Expected flips until **THH**. Build {empty,T,TH,THH} and explain precisely why a mismatch from TH falls back to **T**, not to the empty start — and how that shortens the wait relative to HHH.

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(CHAINS['thh-wait'].P, [3])[0] · answer: 8 · verified: true

#### Hidden

**Answer:** 8

**Approaches:**
- Write t_i = 1 + sum_j p_ij t_j (t=0 at absorbing) and solve (I-Q)t=1.
- Fair symmetric walk: t_i = i(N-i); run-length wait: cross-check against 2^(n+1)-2.

**Wrong turns:**
- drop the +1 (treat it like a probability split)
- in a run-length chain a mismatch always resets to the empty start (it falls back to the longest still-valid prefix)
- expected time and absorption probability are the same computation
- expected time is symmetric in the start even under bias

**Hint ladder:**
1. This asks 'how long until absorbed', so every transient step carries a +1 — set up t_i = 1 + (probability-weighted successors) on thh-wait.
2. One unknown per non-absorbing state, absorbing states zero; remember a failed step in a run-length chain falls back to the longest still-matching prefix, not always to the start.
3. Solve from the absorbing boundary backward; the whole count is the accumulated +1's — keep them, and don't count the first step twice.

**Rubric:**
- correctness: matches the exact expected absorption time from the named start
- approach: solves t_i = 1 + sum p_ij t_j with t=0 at absorbing states
- rigor: keeps the +1 on every transient row; a run-length mismatch falls back, not always to the empty start
- communication: contrasts the +1 here with the no-+1 absorption split
- speed: solves the small system cleanly; no double-counting the first step

**Follow-ups:**
- Now give the absorption probability from the same start — drop the +1.
- Bias the coin/walk — does the time rise or fall?
- Generalize to a length-n run / N-step walk closed form.

### tmpl-gamblers-ruin#N6-p1_2-i3-reach  ·  harder

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=6,i=3,pDen=2,pNum=1,query=reach

**Prompt:** Fair +/-1 walk on 0-6, start at the midpoint **3**. Probability of reaching 6 before 0. Show it from the closed form and explain why the midpoint of a fair walk is exactly even money.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(buildWalk(6,1,2),[0,6])[2][1] · answer: 1/2 · verified: true

#### Hidden

**Answer:** 1/2

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N5-p1_2-i2-duration  ·  harder

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=5,i=2,pDen=2,pNum=1,query=duration

**Prompt:** Fair walk on 0-5, **start 2**. Expected steps to absorption. Use i(N-i) and explain why duration peaks in the middle of the board.

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(buildWalk(5,1,2),[0,5])[1] · answer: 6 · verified: true

#### Hidden

**Answer:** 6

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N10-p1_2-i5-duration  ·  harder

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=10,i=5,pDen=2,pNum=1,query=duration

**Prompt:** Fair walk on 0-10, **start at the middle 5**. Expected steps to absorption. Why is the duration quadratic in the start, so a wider board costs disproportionately more time?

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(buildWalk(10,1,2),[0,10])[4] · answer: 25 · verified: true

#### Hidden

**Answer:** 25

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p1_3-i2-reach  ·  harder

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=3,pNum=1,query=reach

**Prompt:** A **losing** game: +1 w.p. 1/3, -1 w.p. 2/3, barriers 0 and 4, start **2**. Probability of reaching 4 first. Show how the bias enters through r=q/p and how it collapses an even-money midpoint.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(buildWalk(4,1,3),[0,4])[1][1] · answer: 1/5 · verified: true

#### Hidden

**Answer:** 1/5

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-detailed-balance#ehrenfest-2  ·  harder

**Source:** WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3

**Fingerprint:** tmpl-detailed-balance:chain=ehrenfest-2

**Prompt:** Two balls, two urns; each tick move one random ball to the other urn. Using detailed balance **along the birth-death ladder** (not the full solve), give the long-run share of 0/1/2 balls in the left urn. Why is detailed balance guaranteed for any birth-death chain?

**Engine check:** src/engine/markov.ts · detailedBalance(CHAINS['ehrenfest-2'].P).pi · answer: 1/4,1/2,1/4 · verified: true

#### Hidden

**Answer:** 1/4,1/2,1/4

**Approaches:**
- Chain pi_{i+1} = pi_i * p_{i,i+1}/p_{i+1,i} from one end, then normalize sum(pi)=1 (telescopes to the binomial for Ehrenfest).
- 2-state: detailed balance is automatic; pi=(b/(a+b), a/(a+b)).

**Wrong turns:**
- every chain is reversible / detailed balance always holds
- you must solve the full piP=pi system; the balance shortcut is not allowed
- detailed balance is identical to global balance piP=pi (it is strictly stronger)
- forget to normalize the telescoped ratios to sum to 1

**Hint ladder:**
1. This chain is reversible, so skip the full solve: use detailed balance, pi_i*p_ij = pi_j*p_ji, on ehrenfest-2.
2. Walk the balance equation along the birth-death ladder, expressing each state's share as a multiple of its neighbor's via the up/down probability ratio.
3. Telescope those ratios from one end and normalize so the shares sum to one — read off the (binomial) pattern rather than naming the entries.

**Rubric:**
- correctness: matches the exact stationary vector of the reversible chain
- approach: uses detailed balance along the birth-death ladder, then normalizes
- rigor: confirms reversibility before using the shortcut; exact rationals
- communication: explains why detailed balance => stationary (flows cancel edge-by-edge)
- speed: telescopes the ladder rather than solving the full eigen-system

**Follow-ups:**
- Confirm your pi also satisfies global balance piP=pi.
- Is the chain periodic? If so does P^n converge even though pi exists?
- Generalize Ehrenfest to m balls (binomial C(m,i)/2^m).

### tmpl-detailed-balance#ehrenfest-3  ·  harder

**Source:** WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3

**Fingerprint:** tmpl-detailed-balance:chain=ehrenfest-3

**Prompt:** Three balls, two urns, same dynamics. Use the detailed-balance ladder to read the stationary vector, and identify the **binomial** pattern emerging in the numerators.

**Engine check:** src/engine/markov.ts · detailedBalance(CHAINS['ehrenfest-3'].P).pi · answer: 1/8,3/8,3/8,1/8 · verified: true

#### Hidden

**Answer:** 1/8,3/8,3/8,1/8

**Approaches:**
- Chain pi_{i+1} = pi_i * p_{i,i+1}/p_{i+1,i} from one end, then normalize sum(pi)=1 (telescopes to the binomial for Ehrenfest).
- 2-state: detailed balance is automatic; pi=(b/(a+b), a/(a+b)).

**Wrong turns:**
- every chain is reversible / detailed balance always holds
- you must solve the full piP=pi system; the balance shortcut is not allowed
- detailed balance is identical to global balance piP=pi (it is strictly stronger)
- forget to normalize the telescoped ratios to sum to 1

**Hint ladder:**
1. This chain is reversible, so skip the full solve: use detailed balance, pi_i*p_ij = pi_j*p_ji, on ehrenfest-3.
2. Walk the balance equation along the birth-death ladder, expressing each state's share as a multiple of its neighbor's via the up/down probability ratio.
3. Telescope those ratios from one end and normalize so the shares sum to one — read off the (binomial) pattern rather than naming the entries.

**Rubric:**
- correctness: matches the exact stationary vector of the reversible chain
- approach: uses detailed balance along the birth-death ladder, then normalizes
- rigor: confirms reversibility before using the shortcut; exact rationals
- communication: explains why detailed balance => stationary (flows cancel edge-by-edge)
- speed: telescopes the ladder rather than solving the full eigen-system

**Follow-ups:**
- Confirm your pi also satisfies global balance piP=pi.
- Is the chain periodic? If so does P^n converge even though pi exists?
- Generalize Ehrenfest to m balls (binomial C(m,i)/2^m).

### tmpl-kac-return#clear-rainy-rainy  ·  harder

**Source:** WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)

**Fingerprint:** tmpl-kac-return:chain=weather-clear-rainy,state=1

**Prompt:** Same chain — mean gap between consecutive **rainy** days. Compute via 1/pi and explain why the more common state returns faster.

**Engine check:** src/engine/markov.ts · kacReturnTime(CHAINS['weather-clear-rainy'].P, 1) · answer: 7/4 · verified: true

#### Hidden

**Answer:** 7/4

**Approaches:**
- Solve piP=pi, take the asked state's component, return its reciprocal.
- 2-state: pi=(b/(a+b), a/(a+b)) then invert the chosen component.

**Wrong turns:**
- mean return time equals the mean hitting time from some other fixed state
- every state has the same return time
- return time is 1/pi for the WHOLE chain rather than per-state
- use the raw transition probability instead of the stationary share

**Hint ladder:**
1. Mean return time is a stationary-distribution question in disguise — first get the long-run share of state Rainy in weather-clear-rainy.
2. Kac's theorem: the expected first return time to a state is the reciprocal of that state's stationary probability.
3. Compute the stationary share of state Rainy, then take its reciprocal and reduce — derive the share, don't read it off the matrix.

**Rubric:**
- correctness: matches the exact mean return time 1/pi_i for the named state
- approach: find the stationary share of the state, then reciprocate (Kac)
- rigor: uses the long-run time-share (not a hitting time from a fixed other state); exact rational
- communication: explains why a rarer state has a longer mean return time
- speed: one stationary component, then its reciprocal

**Follow-ups:**
- Compare two states' return times — which recurs faster and why?
- Halve a state's pi — what happens to its return time?
- Does periodicity change the mean return time? (No — still 1/pi_i.)

### tmpl-kac-return#cloudy-sunny  ·  harder

**Source:** WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)

**Fingerprint:** tmpl-kac-return:chain=cloudy-town,state=0

**Prompt:** Cloudy-town (sunny/cloudy/rainy, rows as given). Mean number of days between **sunny** days. Find the sunny stationary share first, then apply Kac, and say why sunny has the longest return time.

**Engine check:** src/engine/markov.ts · kacReturnTime(CHAINS['cloudy-town'].P, 0) · answer: 5 · verified: true

#### Hidden

**Answer:** 5

**Approaches:**
- Solve piP=pi, take the asked state's component, return its reciprocal.
- 2-state: pi=(b/(a+b), a/(a+b)) then invert the chosen component.

**Wrong turns:**
- mean return time equals the mean hitting time from some other fixed state
- every state has the same return time
- return time is 1/pi for the WHOLE chain rather than per-state
- use the raw transition probability instead of the stationary share

**Hint ladder:**
1. Mean return time is a stationary-distribution question in disguise — first get the long-run share of state Sunny in cloudy-town.
2. Kac's theorem: the expected first return time to a state is the reciprocal of that state's stationary probability.
3. Compute the stationary share of state Sunny, then take its reciprocal and reduce — derive the share, don't read it off the matrix.

**Rubric:**
- correctness: matches the exact mean return time 1/pi_i for the named state
- approach: find the stationary share of the state, then reciprocate (Kac)
- rigor: uses the long-run time-share (not a hitting time from a fixed other state); exact rational
- communication: explains why a rarer state has a longer mean return time
- speed: one stationary component, then its reciprocal

**Follow-ups:**
- Compare two states' return times — which recurs faster and why?
- Halve a state's pi — what happens to its return time?
- Does periodicity change the mean return time? (No — still 1/pi_i.)

### tmpl-kac-return#cloudy-cloudy  ·  harder

**Source:** WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)

**Fingerprint:** tmpl-kac-return:chain=cloudy-town,state=1

**Prompt:** Cloudy-town — mean gap between **cloudy** days. Compute via 1/pi and contrast with the sunny return time.

**Engine check:** src/engine/markov.ts · kacReturnTime(CHAINS['cloudy-town'].P, 1) · answer: 5/2 · verified: true

#### Hidden

**Answer:** 5/2

**Approaches:**
- Solve piP=pi, take the asked state's component, return its reciprocal.
- 2-state: pi=(b/(a+b), a/(a+b)) then invert the chosen component.

**Wrong turns:**
- mean return time equals the mean hitting time from some other fixed state
- every state has the same return time
- return time is 1/pi for the WHOLE chain rather than per-state
- use the raw transition probability instead of the stationary share

**Hint ladder:**
1. Mean return time is a stationary-distribution question in disguise — first get the long-run share of state Cloudy in cloudy-town.
2. Kac's theorem: the expected first return time to a state is the reciprocal of that state's stationary probability.
3. Compute the stationary share of state Cloudy, then take its reciprocal and reduce — derive the share, don't read it off the matrix.

**Rubric:**
- correctness: matches the exact mean return time 1/pi_i for the named state
- approach: find the stationary share of the state, then reciprocate (Kac)
- rigor: uses the long-run time-share (not a hitting time from a fixed other state); exact rational
- communication: explains why a rarer state has a longer mean return time
- speed: one stationary component, then its reciprocal

**Follow-ups:**
- Compare two states' return times — which recurs faster and why?
- Halve a state's pi — what happens to its return time?
- Does periodicity change the mean return time? (No — still 1/pi_i.)

### tmpl-pagerank#3cycle-d1_2  ·  harder

**Source:** WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)

**Fingerprint:** tmpl-pagerank:dDen=2,dNum=1,graph=pr-3cycle

**Prompt:** Same 3-cycle, now **d=1/2**. Does the ranking change versus d=0.85? Compute it and explain precisely why the damping is irrelevant for this graph.

**Engine check:** src/engine/markov.ts · pagerank(GRAPHS['pr-3cycle'], reduce(1,2)) · answer: 1/3,1/3,1/3 · verified: true

#### Hidden

**Answer:** 1/3,1/3,1/3

**Approaches:**
- Form G=d*M+(1-d)/n*J from the row-stochastic link matrix, solve piG=pi, sum(pi)=1.
- If the graph is vertex-transitive (a pure cycle), argue by symmetry that pi is uniform for any d.

**Wrong turns:**
- the page with the most in-links is automatically most important
- changing the damping d changes the ranking of a symmetric graph
- PageRank is not a Markov stationary distribution
- dangling (no out-link) nodes can be left as all-zero rows

**Hint ladder:**
1. PageRank is just a stationary distribution: build the random-surfer matrix for pr-3cycle with damping d=1/2 and solve piG=pi.
2. G mixes the link-following matrix (weight d) with a uniform teleport (weight 1-d); on a fully symmetric graph both pieces are symmetric — think about what that forces.
3. Solve the stationary system of G and reduce (or invoke symmetry); rank by the resulting shares — never by raw in-link counts.

**Rubric:**
- correctness: matches the exact PageRank vector for the graph and damping d
- approach: builds G=d*M+(1-d)/n*J and solves the stationary piG=pi
- rigor: handles dangling nodes (uniform row); exact rationals; ranks by the vector, not in-degree
- communication: explains PageRank as 'importance = where a random surfer spends time'
- speed: exploits symmetry (uniform answer) when present instead of solving blindly

**Follow-ups:**
- Rank all pages and name the most important — does it match in-degree?
- Lower d toward 0 — what distribution do you approach, and why?
- Redirect one link — predict which page gains rank.

### tmpl-pagerank#4node-d1  ·  harder

**Source:** WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)

**Fingerprint:** tmpl-pagerank:dDen=1,dNum=1,graph=pr-4node

**Prompt:** Four pages: 1->2; 2->{1,4}; 3->{1,4}; 4->{1,2,3}. With **no damping (d=1)** rank all four pages and name the most important. Use this to **refute** 'the page with the most in-links wins'.

**Engine check:** src/engine/markov.ts · pagerank(GRAPHS['pr-4node'], reduce(1,1)) · answer: 4/13,5/13,1/13,3/13 · verified: true

#### Hidden

**Answer:** 4/13,5/13,1/13,3/13

**Approaches:**
- Form G=d*M+(1-d)/n*J from the row-stochastic link matrix, solve piG=pi, sum(pi)=1.
- If the graph is vertex-transitive (a pure cycle), argue by symmetry that pi is uniform for any d.

**Wrong turns:**
- the page with the most in-links is automatically most important
- changing the damping d changes the ranking of a symmetric graph
- PageRank is not a Markov stationary distribution
- dangling (no out-link) nodes can be left as all-zero rows

**Hint ladder:**
1. PageRank is just a stationary distribution: build the random-surfer matrix for pr-4node with damping d=1/1 and solve piG=pi.
2. G mixes the link-following matrix (weight d) with a uniform teleport (weight 1-d); on a fully symmetric graph both pieces are symmetric — think about what that forces.
3. Solve the stationary system of G and reduce (or invoke symmetry); rank by the resulting shares — never by raw in-link counts.

**Rubric:**
- correctness: matches the exact PageRank vector for the graph and damping d
- approach: builds G=d*M+(1-d)/n*J and solves the stationary piG=pi
- rigor: handles dangling nodes (uniform row); exact rationals; ranks by the vector, not in-degree
- communication: explains PageRank as 'importance = where a random surfer spends time'
- speed: exploits symmetry (uniform answer) when present instead of solving blindly

**Follow-ups:**
- Rank all pages and name the most important — does it match in-degree?
- Lower d toward 0 — what distribution do you approach, and why?
- Redirect one link — predict which page gains rank.

### ff-absorb-prob-and-time  ·  harder

**Source:** GB §5.1 p.54-55 (gambler's ruin 4/7)

**Fingerprint:** sem:cb4d0f46506e

**Prompt:** A trader's bankroll is $1 (between a $0 wipeout and a $3 cash-out); each round +$1 w.p. 2/3, -$1 w.p. 1/3 (they have an edge). Starting at $1, compute BOTH (a) the probability they cash out at $3 before being wiped out, AND (b) the expected number of rounds until the game ends. Show the **same** fundamental matrix yields both, and point to the **single** structural difference between the two computations.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(gambler-0to3-up2_3,[0,3]) -> [start $1][target $3], expectedAbsorptionTime(gambler-0to3-up2_3,[0,3]) -> start $1 · answer: 4/7 · verified: true

#### Hidden

**Answer:** 4/7

**Approaches:**
- Both come from N=(I-Q)^-1: B=NR (split, no +1) gives the cash-out probability; (I-Q)t=1 (the +1) gives the duration (which is 15/7).
- First-step: a_1 = 1/3 a_0 + 2/3 a_2 (a_0=0, a_3=1) for (a); t_1 = 1 + 1/3 t_0 + 2/3 t_2 (t_0=t_3=0) for (b).

**Wrong turns:**
- reach probability and expected duration are the same object
- the edge (up 2/3) breaks the formula
- drop the +1 in the duration
- the start doesn't change the cash-out probability

**Hint ladder:**
1. Both parts are first-step analysis on the same transient block — set up the interior equations once, then ask two different questions.
2. For the probability, the boundaries are one (cash out) and zero (wiped out) with **no** +1; for the time, the boundaries are zero at both ends **with** a +1 on every round.
3. Solve both small systems from $1 and reduce; the only structural difference is the +1 (present for time, absent for probability) — keep the edge probabilities 2/3 and 1/3 exact.

**Rubric:**
- correctness: matches the exact cash-out probability and the exact expected duration
- approach: derives both from one fundamental matrix with correct boundaries
- rigor: keeps reach distinct from duration; handles the 2/3-1/3 bias exactly
- communication: names the +1 as the sole structural difference
- speed: reuses the interior block for both questions

**Follow-ups:**
- Recompute both from $2 instead of $1.
- Make it a fair coin — how do both answers change?
- What is the probability of being wiped out, and why does it complete the split?

**Tier: brutal**

### tmpl-stationary#ergodic-3  ·  brutal

**Source:** WEB (absent from GB): Math.SE 3336273 · GeeksforGeeks · Rochester ECE440 HW5 #2 · Math.SE 259852

**Fingerprint:** tmpl-stationary:chain=ergodic-3

**Prompt:** Three states with rows s0->(1/2,1/4,1/4), s1->(1/3,1/3,1/3), s2->(0,1/2,1/2). Build P, **first** argue it is irreducible and aperiodic (hence has a unique stationary), **then** compute the long-run share of each state. Explain why s1 and s2 end up equally occupied despite different rows.

**Engine check:** src/engine/markov.ts · stationaryDistribution(CHAINS['ergodic-3'].P) · answer: 1/4,3/8,3/8 · verified: true

#### Hidden

**Answer:** 1/4,3/8,3/8

**Approaches:**
- Write the left system (P^T - I)pi^T = 0, drop one redundant equation, close with sum(pi)=1, solve over the rationals.
- 2-state shortcut: pi=(b/(a+b), a/(a+b)) with a,b the two switching probabilities; verify sum(pi)=1.

**Wrong turns:**
- the starting state changes the long-run share
- pi is just the row of P with the biggest entries
- piP=pi implies P^n converges, even for a periodic chain
- solving the RIGHT eigenvector P*pi=pi instead of the left system piP=pi

**Hint ladder:**
1. You want the share that one more step leaves unchanged — set up piP=pi using the rows of ergodic-3.
2. Transpose to a left-eigenvector system (P^T - I)pi^T = 0; one equation is redundant, so replace it with the constraint that the shares sum to one.
3. Solve that augmented system over the rationals and reduce, then check the components sum to one — derive pi, never read it off the matrix.

**Rubric:**
- correctness: matches the exact engine stationary vector (reduced, sums to 1)
- approach: sets up the LEFT system piP=pi plus the sum(pi)=1 normalization
- rigor: keeps exact rationals; checks components sum to 1; notes uniqueness needs irreducibility
- communication: reads pi as a long-run time-share, not the single most-likely state
- speed: reduces the 2-3 state system with no decimal drift

**Follow-ups:**
- From your pi, give a state's mean return time (Kac, 1/pi_i).
- Is this chain periodic? If so does the step-n distribution still converge?
- Nudge one transition up — which way does the busiest state's share move?

### tmpl-multistep#oz-n4-rain-snow  ·  brutal

**Source:** GB §5.1 p.53 (path probability) · WEB Land of Oz (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6)

**Fingerprint:** tmpl-multistep:chain=land-of-oz,from=0,n=4,to=2

**Prompt:** Land of Oz: probability it **snows exactly four days after rain**. Compute P^4, then compare with the long-run snow share and explain what convergence of P^n rows you're starting to see.

**Engine check:** src/engine/markov.ts · matrixPower(CHAINS['land-of-oz'].P, 4)[0][2] · answer: 51/128 · verified: true

#### Hidden

**Answer:** 51/128

**Approaches:**
- Form P^n by repeated squaring over the rationals and read entry (from,to).
- Equivalently push e_from through P n times and read coordinate `to` — total probability, one step at a time.

**Wrong turns:**
- multiply one most-likely path instead of summing all intermediate states
- (P^n)_ij = (P_ij)^n — raise the entry, not the matrix
- rows of P^n stop summing to 1
- confuse the n-step transition with the stationary share

**Hint ladder:**
1. An n-step probability is the (0->2) entry of P raised to the n-th power for land-of-oz, not a single path.
2. Multiply P by itself 4 times (repeated squaring is fine); the entry you want sums the probabilities of all length-4 paths from 0 to 2.
3. Read row 0, column 2 of that power and reduce; confirm the row still sums to one — raise the matrix, not the single entry.

**Rubric:**
- correctness: matches the exact (from,to) entry of P^n
- approach: computes P^n (or pushes the row vector n steps) and reads the right entry
- rigor: sums over all intermediate states; entries stay exact-rational
- communication: explains Chapman-Kolmogorov as one-step total probability repeated
- speed: uses repeated squaring / one row push, not path enumeration

**Follow-ups:**
- Push n higher — what vector does this row approach, and why?
- As n->infinity does the answer depend on the starting row? Tie it to pi.
- Compute the same entry one step earlier and explain the change.

### tmpl-absorption#coin-hhh-first  ·  brutal

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=coin-hhh-thh,start=0,target=5

**Prompt:** Same HHH-vs-THH race on a fair coin. Find P(**HHH** appears first) and explain why it is so much smaller than the THH probability — what is the **only** way HHH can win, and why does any tail doom it?

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['coin-hhh-thh'].P, [5,6])[0][0] · answer: 1/8 · verified: true

#### Hidden

**Answer:** 1/8

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on coin-hhh-thh for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-absorption#dice-77-first  ·  brutal

**Source:** GB §5.1 p.54-57 (gambler 4/7; dice 7/13; coin 1/8) · WEB drunkard i/N (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-absorption:chain=dice-12-vs-77,start=0,target=2

**Prompt:** Same dice game. Find P(**two consecutive 7s first**). Be explicit that this is the complement event — name the absorbing state — and verify it against the single-12 probability.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(CHAINS['dice-12-vs-77'].P, [2,3])[0][0] · answer: 6/13 · verified: true

#### Hidden

**Answer:** 6/13

**Approaches:**
- Set the asked target to 1 and every other absorbing state to 0; solve interior a_s = sum p_sc a_c for the start.
- Matrix form B=(I-Q)^-1 R; read the start's row, asked-target's column.

**Wrong turns:**
- absorption probability equals the expected absorption time (adds a +1)
- the starting state does not change the split
- a symmetric walk is 50/50 to either wall from anywhere
- mis-map the event (read the two-7s column when asked for 12-first)

**Hint ladder:**
1. This is a 'which exit first' question — first-step analysis on dice-12-vs-77 for absorption probabilities, not times (no +1 here).
2. Pin the asked absorbing state to one and every other absorbing state to zero, then write each transient state as the probability-weighted average of where it steps next.
3. Solve that interior system for the start state and reduce; map the asked event to the right target before reading — split only, never add a step.

**Rubric:**
- correctness: matches the exact absorption probability for the named start and target
- approach: splits transient Q from absorbing R and solves (I-Q)B=R for the right column
- rigor: maps the WORD event to the correct absorbing state before solving; no spurious +1
- communication: explains why the start changes the split (boundary values 1/0)
- speed: solves the small system without rebuilding the whole fundamental matrix

**Follow-ups:**
- Now give the expected time to absorption from the same start — same fundamental matrix.
- Bias the chain or move the start — which way does the split shift?
- What is the probability of the OTHER exit, and why must the two sum to 1?

### tmpl-expected-absorption#hhh-wait  ·  brutal

**Source:** GB §5.1 p.54 + §5.2 p.59-61 (E[THH]=8, E[HH]=6, E[HHH]=14) · WEB drunkard i(N-i) (Grinstead & Snell Ex.11.15)

**Fingerprint:** tmpl-expected-absorption:chain=hhh-wait,start=0

**Prompt:** Fair coin. Expected flips until **HHH**. Build {empty,H,HH,HHH} and explain why HHH waits so much longer than THH despite equal length — connect it to the self-overlap / reset structure.

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(CHAINS['hhh-wait'].P, [3])[0] · answer: 14 · verified: true

#### Hidden

**Answer:** 14

**Approaches:**
- Write t_i = 1 + sum_j p_ij t_j (t=0 at absorbing) and solve (I-Q)t=1.
- Fair symmetric walk: t_i = i(N-i); run-length wait: cross-check against 2^(n+1)-2.

**Wrong turns:**
- drop the +1 (treat it like a probability split)
- in a run-length chain a mismatch always resets to the empty start (it falls back to the longest still-valid prefix)
- expected time and absorption probability are the same computation
- expected time is symmetric in the start even under bias

**Hint ladder:**
1. This asks 'how long until absorbed', so every transient step carries a +1 — set up t_i = 1 + (probability-weighted successors) on hhh-wait.
2. One unknown per non-absorbing state, absorbing states zero; remember a failed step in a run-length chain falls back to the longest still-matching prefix, not always to the start.
3. Solve from the absorbing boundary backward; the whole count is the accumulated +1's — keep them, and don't count the first step twice.

**Rubric:**
- correctness: matches the exact expected absorption time from the named start
- approach: solves t_i = 1 + sum p_ij t_j with t=0 at absorbing states
- rigor: keeps the +1 on every transient row; a run-length mismatch falls back, not always to the empty start
- communication: contrasts the +1 here with the no-+1 absorption split
- speed: solves the small system cleanly; no double-counting the first step

**Follow-ups:**
- Now give the absorption probability from the same start — drop the +1.
- Bias the coin/walk — does the time rise or fall?
- Generalize to a length-n run / N-step walk closed form.

### tmpl-gamblers-ruin#N4-p2_5-i2-reach  ·  brutal

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=5,pNum=2,query=reach

**Prompt:** Edge against you: +1 w.p. **2/5**, barriers 0 and 4, start **2**. Reach 4 first? Keep it an exact rational and locate the 13 in the (1-r^4) denominator.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(buildWalk(4,2,5),[0,4])[1][1] · answer: 4/13 · verified: true

#### Hidden

**Answer:** 4/13

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N4-p2_5-i2-duration  ·  brutal

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=4,i=2,pDen=5,pNum=2,query=duration

**Prompt:** Same biased walk (p=2/5) on 0-4, **start 2**. Expected steps to absorption — an ugly rational. Explain why a biased duration is **not** symmetric in the start, unlike the fair case.

**Engine check:** src/engine/markov.ts · expectedAbsorptionTime(buildWalk(4,2,5),[0,4])[1] · answer: 50/13 · verified: true

#### Hidden

**Answer:** 50/13

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N5-p2_3-i3-reach  ·  brutal

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=5,i=3,pDen=3,pNum=2,query=reach

**Prompt:** Edge **for** you: +1 w.p. **2/3**, barriers 0 and 5, start **3**. Probability of reaching 5 first. Show the biased closed form and explain why a positive edge pushes reach well above 3/5.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(buildWalk(5,2,3),[0,5])[2][1] · answer: 28/31 · verified: true

#### Hidden

**Answer:** 28/31

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-gamblers-ruin#N6-p1_3-i4-reach  ·  brutal

**Source:** GB §5.1 p.54-55 + §5.2 p.59 (drunk-man 17/100, 1411) · WEB drunkard i/N & i(N-i) (Grinstead & Snell Ex.11.13-15)

**Fingerprint:** tmpl-gamblers-ruin:N=6,i=4,pDen=3,pNum=1,query=reach

**Prompt:** Edge against you: +1 w.p. **1/3**, barriers 0 and 6, start **4**. Reach 6 first? Note how even a high starting stake can't rescue reach against a persistent negative drift — quantify it exactly.

**Engine check:** src/engine/markov.ts · absorptionProbabilities(buildWalk(6,1,3),[0,6])[3][1] · answer: 5/21 · verified: true

#### Hidden

**Answer:** 5/21

**Approaches:**
- Reach: P_i = p*P_{i+1} + q*P_{i-1}, P_0=0, P_N=1 => fair i/N, biased (1-r^i)/(1-r^N), r=q/p.
- Duration: D_i = 1 + p*D_{i+1} + q*D_{i-1}, D_0=D_N=0 => fair i(N-i).

**Wrong turns:**
- reach probability and expected duration are the same object
- a fair game is 50/50 to win regardless of the starting stake
- bias does not change the reach probability
- duration is symmetric in the start even under bias

**Hint ladder:**
1. Set up a boundary-value problem on the 0-to-N walk: for a reach probability fix the bottom at zero and the top at one (no +1); for a duration fix both ends at zero with a +1 on every step.
2. Fair coin: reach is linear (i/N), duration is quadratic (i(N-i)). Biased coin: form the down/up ratio r=q/p and use reach=(1-r^i)/(1-r^N); the duration loses its left-right symmetry.
3. Substitute your start into the matching closed form (or solve the small system) and reduce — keep a reach a probability and a duration a step count; never swap one form for the other.

**Rubric:**
- correctness: matches the exact reach or duration for (N,p,i)
- approach: boundary-value recurrence with correct boundaries (reach 0/1; duration 0/0 with +1)
- rigor: reach (probability) kept distinct from duration (steps); biased ratio r=q/p handled exactly
- communication: states the closed form and its boundary conditions
- speed: uses the closed form instead of re-deriving the system

**Follow-ups:**
- Generalize the fair formula to arbitrary N and start i.
- Flip the bias (p->1-p) — what happens to reach and to duration?
- Why is the fair duration quadratic in the start while reach is linear?

### tmpl-detailed-balance#ehrenfest-4  ·  brutal

**Source:** WEB (absent from GB): Ehrenfest stats.libretexts 16.8 · phys.libretexts 12.3

**Fingerprint:** tmpl-detailed-balance:chain=ehrenfest-4

**Prompt:** Four balls, two urns. Give the **full** stationary vector via detailed balance and prove it is C(4,i)/2^4 — then state why diffusion concentrates near the half-full state.

**Engine check:** src/engine/markov.ts · detailedBalance(CHAINS['ehrenfest-4'].P).pi · answer: 1/16,1/4,3/8,1/4,1/16 · verified: true

#### Hidden

**Answer:** 1/16,1/4,3/8,1/4,1/16

**Approaches:**
- Chain pi_{i+1} = pi_i * p_{i,i+1}/p_{i+1,i} from one end, then normalize sum(pi)=1 (telescopes to the binomial for Ehrenfest).
- 2-state: detailed balance is automatic; pi=(b/(a+b), a/(a+b)).

**Wrong turns:**
- every chain is reversible / detailed balance always holds
- you must solve the full piP=pi system; the balance shortcut is not allowed
- detailed balance is identical to global balance piP=pi (it is strictly stronger)
- forget to normalize the telescoped ratios to sum to 1

**Hint ladder:**
1. This chain is reversible, so skip the full solve: use detailed balance, pi_i*p_ij = pi_j*p_ji, on ehrenfest-4.
2. Walk the balance equation along the birth-death ladder, expressing each state's share as a multiple of its neighbor's via the up/down probability ratio.
3. Telescope those ratios from one end and normalize so the shares sum to one — read off the (binomial) pattern rather than naming the entries.

**Rubric:**
- correctness: matches the exact stationary vector of the reversible chain
- approach: uses detailed balance along the birth-death ladder, then normalizes
- rigor: confirms reversibility before using the shortcut; exact rationals
- communication: explains why detailed balance => stationary (flows cancel edge-by-edge)
- speed: telescopes the ladder rather than solving the full eigen-system

**Follow-ups:**
- Confirm your pi also satisfies global balance piP=pi.
- Is the chain periodic? If so does P^n converge even though pi exists?
- Generalize Ehrenfest to m balls (binomial C(m,i)/2^m).

### tmpl-kac-return#cloudy-rainy  ·  brutal

**Source:** WEB (absent from GB): Kac's recurrence theorem; pi from Math.SE 3336273 (clear/rainy) & Rochester ECE440 HW5 #2 (cloudy-town)

**Fingerprint:** tmpl-kac-return:chain=cloudy-town,state=2

**Prompt:** Cloudy-town — mean gap between **rainy** days. Give the value and **explain why cloudy and rainy share the same mean return time** (what does that say about their stationary shares?).

**Engine check:** src/engine/markov.ts · kacReturnTime(CHAINS['cloudy-town'].P, 2) · answer: 5/2 · verified: true

#### Hidden

**Answer:** 5/2

**Approaches:**
- Solve piP=pi, take the asked state's component, return its reciprocal.
- 2-state: pi=(b/(a+b), a/(a+b)) then invert the chosen component.

**Wrong turns:**
- mean return time equals the mean hitting time from some other fixed state
- every state has the same return time
- return time is 1/pi for the WHOLE chain rather than per-state
- use the raw transition probability instead of the stationary share

**Hint ladder:**
1. Mean return time is a stationary-distribution question in disguise — first get the long-run share of state Rainy in cloudy-town.
2. Kac's theorem: the expected first return time to a state is the reciprocal of that state's stationary probability.
3. Compute the stationary share of state Rainy, then take its reciprocal and reduce — derive the share, don't read it off the matrix.

**Rubric:**
- correctness: matches the exact mean return time 1/pi_i for the named state
- approach: find the stationary share of the state, then reciprocate (Kac)
- rigor: uses the long-run time-share (not a hitting time from a fixed other state); exact rational
- communication: explains why a rarer state has a longer mean return time
- speed: one stationary component, then its reciprocal

**Follow-ups:**
- Compare two states' return times — which recurs faster and why?
- Halve a state's pi — what happens to its return time?
- Does periodicity change the mean return time? (No — still 1/pi_i.)

### tmpl-pagerank#3node-d1_2  ·  brutal

**Source:** WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)

**Fingerprint:** tmpl-pagerank:dDen=2,dNum=1,graph=pr-3node

**Prompt:** Three pages: 1->{2,3}; 2->3; 3->1. With damping **d=1/2**, compute the full PageRank vector (ugly rationals) and rank the pages. Show the Google-matrix setup explicitly.

**Engine check:** src/engine/markov.ts · pagerank(GRAPHS['pr-3node'], reduce(1,2)) · answer: 14/39,10/39,5/13 · verified: true

#### Hidden

**Answer:** 14/39,10/39,5/13

**Approaches:**
- Form G=d*M+(1-d)/n*J from the row-stochastic link matrix, solve piG=pi, sum(pi)=1.
- If the graph is vertex-transitive (a pure cycle), argue by symmetry that pi is uniform for any d.

**Wrong turns:**
- the page with the most in-links is automatically most important
- changing the damping d changes the ranking of a symmetric graph
- PageRank is not a Markov stationary distribution
- dangling (no out-link) nodes can be left as all-zero rows

**Hint ladder:**
1. PageRank is just a stationary distribution: build the random-surfer matrix for pr-3node with damping d=1/2 and solve piG=pi.
2. G mixes the link-following matrix (weight d) with a uniform teleport (weight 1-d); on a fully symmetric graph both pieces are symmetric — think about what that forces.
3. Solve the stationary system of G and reduce (or invoke symmetry); rank by the resulting shares — never by raw in-link counts.

**Rubric:**
- correctness: matches the exact PageRank vector for the graph and damping d
- approach: builds G=d*M+(1-d)/n*J and solves the stationary piG=pi
- rigor: handles dangling nodes (uniform row); exact rationals; ranks by the vector, not in-degree
- communication: explains PageRank as 'importance = where a random surfer spends time'
- speed: exploits symmetry (uniform answer) when present instead of solving blindly

**Follow-ups:**
- Rank all pages and name the most important — does it match in-degree?
- Lower d toward 0 — what distribution do you approach, and why?
- Redirect one link — predict which page gains rank.

### tmpl-pagerank#3cycle-d9_10  ·  brutal

**Source:** WEB (absent from GB): theorempath.com (3-cycle) · practicaldsc.org (4-node) · Wikipedia PageRank + arXiv math/0612079 (damping)

**Fingerprint:** tmpl-pagerank:dDen=10,dNum=9,graph=pr-3cycle

**Prompt:** The same 3-cycle at **d=9/10**. Rather than re-solving, **prove** the PageRank is uniform for **any** damping d, using the graph's symmetry — then confirm it matches the solved vector.

**Engine check:** src/engine/markov.ts · pagerank(GRAPHS['pr-3cycle'], reduce(9,10)) · answer: 1/3,1/3,1/3 · verified: true

#### Hidden

**Answer:** 1/3,1/3,1/3

**Approaches:**
- Form G=d*M+(1-d)/n*J from the row-stochastic link matrix, solve piG=pi, sum(pi)=1.
- If the graph is vertex-transitive (a pure cycle), argue by symmetry that pi is uniform for any d.

**Wrong turns:**
- the page with the most in-links is automatically most important
- changing the damping d changes the ranking of a symmetric graph
- PageRank is not a Markov stationary distribution
- dangling (no out-link) nodes can be left as all-zero rows

**Hint ladder:**
1. PageRank is just a stationary distribution: build the random-surfer matrix for pr-3cycle with damping d=9/10 and solve piG=pi.
2. G mixes the link-following matrix (weight d) with a uniform teleport (weight 1-d); on a fully symmetric graph both pieces are symmetric — think about what that forces.
3. Solve the stationary system of G and reduce (or invoke symmetry); rank by the resulting shares — never by raw in-link counts.

**Rubric:**
- correctness: matches the exact PageRank vector for the graph and damping d
- approach: builds G=d*M+(1-d)/n*J and solves the stationary piG=pi
- rigor: handles dangling nodes (uniform row); exact rationals; ranks by the vector, not in-degree
- communication: explains PageRank as 'importance = where a random surfer spends time'
- speed: exploits symmetry (uniform answer) when present instead of solving blindly

**Follow-ups:**
- Rank all pages and name the most important — does it match in-degree?
- Lower d toward 0 — what distribution do you approach, and why?
- Redirect one link — predict which page gains rank.

### ff-classify-then-solve  ·  brutal

**Source:** WEB Grinstead & Snell Ex.11.13-15 (drunkard i/N) + classification GB §5.1 p.54-55

**Fingerprint:** sem:68dce289aecb

**Prompt:** A chain lands on your desk with the labels torn off: a token sits on one of five pads 0-4; from any interior pad it slips to an adjacent pad with equal probability; pads 0 and 4 are **sticky** (once there it never leaves). BEFORE computing anything, classify the chain — is there a state it can never leave? — then answer the question that classification implies: starting on pads 1, 2, and 3, the probability the token ends on pad 4 rather than pad 0. Give the full vector and explain why 'the long-run share of the middle' is the **wrong** question here.

**Engine check:** src/engine/markov.ts · classifyStates(drunkard-0to4), absorptionProbabilities(drunkard-0to4,[0,4]) -> target-4 column for starts 1,2,3 · answer: 1/4,1/2,3/4 · verified: true

#### Hidden

**Answer:** 1/4,1/2,3/4

**Approaches:**
- Classify first: pads 0 and 4 absorbing, 1-3 transient => ask absorption, not stationary. Solve a_i = 1/2 a_{i-1} + 1/2 a_{i+1}, a_0=0, a_4=1 => i/4.
- Read the target-4 column of B=(I-Q)^-1 R for the three interior pads (the expected times here are 3,4,3, a separate question).

**Wrong turns:**
- it runs a while, so ask its long-run/stationary share
- a symmetric walk is 50/50 to either end from any start
- reach probability equals the expected number of steps
- treat the sticky pads as ordinary states

**Hint ladder:**
1. First test for a state the chain can never leave — that single fork decides whether you set up piP=pi or (I-Q)^-1 R.
2. Two pads are absorbing, the three interior pads transient — so this is an absorption-probability question: pin the far pad to one and the near pad to zero, and write each interior pad as the average of its neighbors.
3. Solve that interior system for all three starts and reduce; report the vector and reject the stationary reading — once the token sticks there is no long-run interior share.

**Rubric:**
- correctness: matches the exact absorption vector for starts 1,2,3
- approach: classifies absorbing-vs-ergodic first, then solves the implied absorption system
- rigor: rejects the stationary trap; boundaries 1/0 correct; exact rationals
- communication: explains why structure (a state you can't leave), not the story, picks the tool
- speed: sees i/N immediately for the symmetric case

**Follow-ups:**
- Now give the expected number of steps to stick from each start.
- Make the slips biased — recompute the reach vector.
- If both end pads were reflecting instead of sticky, which tool would you switch to?

### ff-ehrenfest-periodic  ·  brutal

**Source:** WEB Ehrenfest stats.libretexts 16.8 (stationary) + periodicity

**Fingerprint:** sem:3932c40e2d37

**Prompt:** Two boxes hold 2 balls total; each tick you pick one of the 2 balls uniformly and move it to the other box. A colleague says 'the chain converges, so just take the limit of P^n.' Give the long-run fraction of time the left box holds 0, 1, 2 balls, AND state the chain's **period** — then settle the dispute: does P^n actually converge? Say precisely which long-run statement is valid and which is not.

**Engine check:** src/engine/markov.ts · stationaryDistribution(ehrenfest-2), classifyStates(ehrenfest-2) -> period 2 · answer: 1/4,1/2,1/4 · verified: true

#### Hidden

**Answer:** 1/4,1/2,1/4

**Approaches:**
- piP=pi (or detailed balance) gives the time-share; gcd of return-cycle lengths gives the period (here 2). The fraction-of-time exists (ergodic theorem) but P^n oscillates by parity, so it has no limit.
- Note pi=C(2,i)/2^2 and that every return to a state takes an even number of steps.

**Wrong turns:**
- a stationary distribution implies P^n converges
- periodic chains have no stationary distribution
- the time-average and the step-n distribution are the same thing
- period is the number of states

**Hint ladder:**
1. Separate two different 'long-run' claims: the fraction of time in each state versus the distribution exactly at step n.
2. Get the time-share from piP=pi (or detailed balance); get the period from the gcd of return-cycle lengths — here every return takes an even number of steps.
3. Report the share and the period, then conclude the step-n matrix flips parity forever, so its limit doesn't exist even though the time-average does — state both, don't compute a fake limit.

**Rubric:**
- correctness: matches the exact stationary share and the period
- approach: computes pi and the period and distinguishes time-average from P^n-limit
- rigor: denies P^n convergence for a periodic chain while affirming the time-share
- communication: crisply separates 'fraction of time' from 'distribution at step n'
- speed: uses the binomial/detailed-balance shortcut for pi

**Follow-ups:**
- Repeat for 3 balls — what is pi and is it still periodic?
- What minimal change (a self-loop) would make P^n converge?
- Compute the mean return time to the empty-left-box state.

### ff-cloudy-stationary-and-kac  ·  brutal

**Source:** WEB cloudy-town Rochester ECE440 HW5 #2 + Kac's theorem

**Fingerprint:** sem:5bd2a6a4c457

**Prompt:** A city's weather is a 3-state chain — sunny, cloudy, rainy: from sunny it never stays sunny (1/2 cloudy, 1/2 rainy); from cloudy it's 1/4 sunny, 1/2 cloudy, 1/4 rainy; from rainy it's 1/4 sunny, 1/4 cloudy, 1/2 rainy. Two desk questions: (a) the long-run fraction of sunny/cloudy/rainy days, and (b) the **mean number of days between consecutive sunny days**. Give both exactly and explain the relationship between them.

**Engine check:** src/engine/markov.ts · stationaryDistribution(cloudy-town), kacReturnTime(cloudy-town,0) · answer: 1/5,2/5,2/5 · verified: true

#### Hidden

**Answer:** 1/5,2/5,2/5

**Approaches:**
- Solve piP=pi, sum(pi)=1 for the shares; Kac gives the sunny mean return time as the reciprocal of the sunny share (which is 5).
- The return time is large exactly because the sunny share is the smallest.

**Wrong turns:**
- the start day changes the long-run share
- mean return time is the mean hitting time from a fixed other state
- return time = 1/pi for the whole chain
- rainy is the 'stuck' (absorbing) state

**Hint ladder:**
1. Both parts run through the stationary distribution — first solve piP=pi for the three shares.
2. For part (b), Kac's theorem makes the mean return time to sunny the reciprocal of the sunny stationary share — no separate hitting-time solve.
3. Compute the share vector, then invert the sunny component for (b), and explain that a rarer state has a longer return — derive both, state neither in advance.

**Rubric:**
- correctness: matches the exact stationary vector and the sunny mean return time
- approach: one stationary solve feeds both the shares and (via Kac) the return time
- rigor: links 1/pi to the share; exact rationals; notes no absorbing state => ergodic
- communication: explains return time = reciprocal of share
- speed: reuses pi for Kac instead of a second system

**Follow-ups:**
- Mean return time to a rainy day — bigger or smaller, and why?
- Does the answer change if it starts sunny? Why not?
- Is this chain reversible? Check detailed balance.

### ff-oz-multistep-and-convergence  ·  brutal

**Source:** WEB Land of Oz Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6

**Fingerprint:** sem:06d308faa93c

**Prompt:** Land of Oz weather (Rain, Nice, Snow): Rain->(1/2,1/4,1/4); Nice->(1/2,0,1/2); Snow->(1/4,1/4,1/2). (a) What is the probability it **snows exactly two days after a rainy day**? (b) Argue that as n->infinity **every row** of P^n approaches the **same** vector, and give that vector. Tie part (a)'s machinery to part (b)'s limit.

**Engine check:** src/engine/markov.ts · matrixPower(land-of-oz,2)[0][2], stationaryDistribution(land-of-oz) · answer: 3/8 · verified: true

#### Hidden

**Answer:** 3/8

**Approaches:**
- Part (a): the (Rain,Snow) entry of P^2 — sum over the in-between day. Part (b): the chain is regular (a power is all-positive), so P^n -> 1*pi^T; find pi from piP=pi (it is 2/5,1/5,2/5).
- Chapman-Kolmogorov for the 2-step; the regular-chain convergence theorem for the limit.

**Wrong turns:**
- the 2-step prob is one path's product (forget to sum the middle day)
- rows of P^n converge to different vectors depending on the start
- raise the entry instead of the matrix
- a periodic chain would also converge (this one is aperiodic — that matters)

**Hint ladder:**
1. Part (a) is one entry of the squared matrix; part (b) is what powers of P settle to — keep them separate but note both live in P^n.
2. For (a) sum over the intermediate day (Chapman-Kolmogorov); for (b) check the chain is regular (a power is strictly positive), which forces every row of P^n to the same stationary vector.
3. Read the (Rain,Snow) entry of P^2 and reduce, then solve piP=pi for the common limit row — derive each; the limit row is the stationary distribution, not a guess.

**Rubric:**
- correctness: matches the exact 2-step entry and the limit vector
- approach: Chapman-Kolmogorov for (a), regular-chain limit for (b)
- rigor: justifies row-convergence via regularity/aperiodicity; exact rationals
- communication: connects 'forgetting the start' to the common limit row
- speed: one entry plus one stationary solve

**Follow-ups:**
- At what n is the row essentially converged? Compute P^3, P^4 and compare.
- Why does aperiodicity matter for (b)?
- Mean return time to a snowy day?
