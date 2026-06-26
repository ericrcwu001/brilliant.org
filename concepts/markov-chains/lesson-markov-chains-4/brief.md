# Lesson Brief: Classifying States  (lesson-markov-chains-4)

## Hook  (the bet)

"You're standing on one state of a chain. Take one step, then another, forever. **Will you come back
to where you started — for sure, or might you wander off and never return?** Some states pull you
back every time; some let you slip away; and one kind, once you arrive, **never lets you leave**."

## Core promise (one idea)

A state's whole fate is decided by one question — *what's the chance you ever return?* **Recurrent** =
you return for sure (return prob = 1); **transient** = you might never come back (return prob < 1);
**absorbing** = you can't leave at all; and states that can reach each other form one **communicating
class** whose **period** = gcd of its return-step lengths. Structure, not arithmetic, decides where a
chain ends up.

## Display fields

- **glyphKey:** `R/T/A`
- **vizKey:** stateMachine

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| The matched-pattern state (PHT) and the \$0/\$N barriers (gambler's ruin) — what *kind* of state are they? | **absorbing** (label) | GB p.54–55 §5.1 (absorbing defn); PHT `lesson-first-heads` `l0-flip` (feedback names the absorbing matched state), `lesson-gamblers-ruin` `boundary-edge` (absorbing \$0/\$N); `src/engine/types.ts` `AutomatonState.absorbing` | [ ] engine (n/a — categorical) [x] source |
| Classify gambler's ruin {0,1,2,3}, up 2/3 / down 1/3, 0 & 3 absorbing. | **{0} absorbing · {3} absorbing · {1,2} transient (one communicating class)** | GB p.54–55 §5.1 — "classifies the gambler's-ruin chain (0 & N absorbing, interior transient)" | [ ] engine (`classifyStates`) [x] source |
| Classify the hero chain `P=[[0,1/2,0,1/2],[0,0,1,0],[0,1,0,0],[0,0,0,1]]` and name its communicating classes. | **{1} transient · {2,3} recurrent (closed, period 2) · {4} absorbing** | GB p.54–55 §5.1 (communicate/recurrent/transient/absorbing defns); **chain CONSTRUCTED** to instantiate all three kinds | [ ] engine (`classifyStates`) [ ] source (constructed; defns sourced) |
| "Cloudy town" `P=[[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]]` — communicating classes & periodicity? | **one class (all communicate), aperiodic (period 1), ergodic** | WEB — Rochester ECE440 HW5 #2, https://www.hajim.rochester.edu/ece/sites/gmateos/ECE440/Homework/hw_5_markov_chains_solution.pdf | [ ] engine (`classifyStates`) [x] source |
| **[NUMERIC]** Period of the Ehrenfest m=2 chain `P=[[0,1,0],[1/2,0,1/2],[0,1,0]]`? | **2** (exact integer) | WEB — stats.libretexts 16.8, https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/16%3A_Markov_Processes/16.08%3A_The_Ehrenfest_Chains | [ ] engine (`classifyStates`.period) [x] source |
| **[NUMERIC]** Chain `P=[[0,1,0],[1/2,0,1/2],[0,0,1]]` (state 3 absorbing): P(ever return to state 1 \| start 1)? | **1/2** (exact rational < 1) | **CONSTRUCTED** (transient/return-prob defn GB p.54–55); engine-verify via `absorptionProbabilities` (make state 1 absorbing) | [ ] engine [ ] source (constructed) |
| **[MASTERY — NUMERIC + categorical]** Gambler's ruin {0,1,2,3} (up 2/3 / down 1/3, 0 & 3 absorbing): (i) classify all states + communicating classes; (ii) P(ever return to state 1 \| start 1)? | (i) **{0},{3} absorbing/recurrent · {1,2} transient communicating**; (ii) **2/9** (exact rational < 1) | (i) GB p.54–55 §5.1 (classes); (ii) **CONSTRUCTED** from the GB chain — engine-verify | [ ] engine [x] source (classes) / [ ] source (2/9 constructed) |

> Exact-rational check (Stage 2 reproduces in `markov.ts`; first-return = one step out × P(ever reach
> home), home made absorbing): **return prob 1/2** — from 1 you must step to 2 (prob 1); from 2 you hit
> 1 (½ → return) or absorbing 3 (½ → gone) ⇒ `f₁₁ = 1·(1/2) = 1/2`. **Mastery 2/9** — from 1: down to 0
> (⅓, absorbed, no return) or up to 2 (⅔); from 2 you reach 1 before 3 only by stepping down (prob ⅓)
> ⇒ `f₁₁ = (1/3)·0 + (2/3)·(1/3) = 2/9`. Both are `< 1` (states 1 are transient).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-absorbing` | Reactivate "an absorbing state never lets you leave" (the early win) | retrieval bridge from PHT `l0-flip` / `boundary-edge` + `types.ts absorbing` | "absorbing = just a state you visit a lot" | yes (easy) | both | `retrievalGrid` (REUSE) |
| 2 | `open-bet` | Commit a gut answer: return for sure, or maybe never? | sets up recurrent vs transient | "if you can reach a state, you'll always return to it" | no (`byOption`) | both | `prediction` (REUSE) |
| 3 | `name-the-classes` | Name recurrent / transient / absorbing / communicating / period just-in-time | vocabulary before symbols | — (JIT primer) | no | A | `primer` (REUSE) |
| 4 | `classify-first` | Tap the absorbing state in a small chain (guaranteed early win) | apply "self-loop prob 1 = can't leave" | "the most-visited state is the absorbing one" | yes (easy) | both | NEW `chainBoard:diagram` |
| 5 | `classify-board` | Tap-to-classify a transient+recurrent+absorbing chain; toggle to see period (Ehrenfest m=2) | the three kinds felt; period preview | "if you can leave a state, it must be transient" | no (hero) | both | NEW `chainBoard:diagram` |
| 6 | `classify-and-group` | Classify each state **and** name the communicating classes of the hero 4-state chain | classes = mutual-reachability groups | "every state in one chain communicates → one class" | yes | both | NEW `chainBoard:diagram` |
| 7 | `model-period` | Name: recurrent ⇔ return-prob 1 ⇔ visited infinitely often; period = gcd of return lengths | triangulate the recurrence definition | "recurrent and absorbing are the same thing" | no | both | `tripletReveal` (REUSE) |
| 8 | `ehrenfest-period` | Compute the period of Ehrenfest m=2 → **2** | period = gcd of return-step lengths | "every chain is aperiodic / period is always 1" | yes (numeric) | both | NEW `chainBoard:diagram` |
| 9 | `transient-vs-recurrent` | **(interleave)** A chain with both: classify, then compute P(ever return) for the transient state → **1/2** | transient ⇔ return prob < 1; absorbing never forgets | "transient means you *never* return" | yes (numeric) | both | NEW `chainBoard:diagram` (+`answerEntry` 1/2) |
| 10 | `mastery-challenge` | **(required, before recap)** Fully classify gambler's ruin {0,1,2,3} **and** P(ever return to 1) → **2/9** | classes + a real return probability | "interior states are recurrent because the walk is symmetric" | yes (harder) | both | `masteryChallenge` (REUSE; wraps `chainBoard:diagram` + `answerEntry`) |
| 11 | `recap` | Retrieval-first recap: R / T / A, communicating classes, period | consolidate the structure | — | no | both | `recap` (REUSE) |

Notes: graded beats `required: true`, `track: both`; the track-A primer (`name-the-classes`) is
`required: false`. `classify-board` carries the `hero` block (slowFirst + structuralReadout — the
gcd-of-return-lengths readout — + reducedMotionFinalFrame), per HERO_TYPES. All `chainBoard:diagram`
beats depend on `markov.ts` `classifyStates`/`absorptionProbabilities`; the numeric inputs on beats
8/9/10 use the folded `answerEntry`/period readout. Put one `interviewNote` on `classify-and-group`
("recurrent vs transient — *will the chain ever come back?* — is the structural question behind every
absorption interview problem").

## Misconceptions (Specialist)

- **"An absorbing state is just one you visit a lot."** Fires at `recall-absorbing` / `classify-first`.
  Refutation (`byOption`): *"Visiting often isn't the test — leaving is. An absorbing state has a
  self-loop of probability 1: once you arrive, every future step stays put. It's the extreme recurrent
  state, not the popular one."*
- **"If you can reach a state, you'll always return to it."** Fires at `open-bet`. Refutation: *"Not if
  the chain can leak elsewhere first. From a transient state there's a positive chance you wander into
  another class (or get absorbed) and can never come back — return probability < 1."*
- **"If you can leave a state, it must be transient."** Fires at `classify-board` / `classify-and-group`.
  Refutation: *"Recurrent states you leave all the time — you just always come back. {2,3} here bounce
  between each other forever (return prob 1). Transient means there's a real escape route you take with
  positive probability."*
- **"Every state in one chain communicates → it's all one class."** Fires at `classify-and-group`.
  Refutation: *"Communication is **mutual** reachability. State 1 can reach {2,3}, but {2,3} can't reach
  back to 1 → they're different classes. Cloudy-town is one class only because every state reaches every
  other."*
- **"Every chain is aperiodic / the period is always 1."** Fires at `ehrenfest-period`. Refutation:
  *"In Ehrenfest m=2 you can only return to a state in an **even** number of steps — return lengths are
  {2,4,6,…}, and gcd = **2**. Period 1 needs an odd return length somewhere (e.g. a self-loop)."*
- **"Transient means you never return."** Fires at `transient-vs-recurrent`. Refutation: *"Transient
  means return prob **< 1**, not 0. Here you return with probability exactly **1/2** — you may even
  return several times — but each visit risks the escape, so eventually you leave for good."*
- **"Absorbing is the same as 'settles down' / ergodic."** Fires at the interleave/recap (seed for L7).
  Refutation: *"Absorbing **never forgets** — it's stuck at one state. An ergodic chain forgets where it
  started and settles into a spread. Same memorylessness, opposite long-run fate — that's L7."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-absorbing` — recalls **absorbing states** from PHT `lesson-first-heads`
  `l0-flip` (the absorbing matched state) and `lesson-gamblers-ruin` `boundary-edge` (absorbing \$0/\$N),
  plus `src/engine/types.ts` `absorbing` (Continuity Report, L4 row), reframed as "absorbing is the
  extreme case — now meet recurrent, transient, periodic, communicating."
- **guaranteed early win:** `recall-absorbing` (graded recall) and `classify-first` (tap the absorbing
  state) — both easy, both built on just-named/already-known vocabulary, before any classification work.
- **mastery challenge (required, before recap):** `mastery-challenge` — fully classify gambler's ruin
  {0,1,2,3} (**{0},{3} absorbing/recurrent · {1,2} transient communicating**) **and** compute the
  return probability of interior state 1 = **2/9**; a transfer that only the learner who grasped
  "transient ⇒ return prob < 1" can finish.
- **spacing/interleaving:** INTERLEAVE **"transient vs recurrent"** at `transient-vs-recurrent` (a chain
  with both kinds). **Memorylessness (L1) is CONTRASTED** here ("absorbing never forgets — it's stuck"),
  which **SEEDS L7's** "absorbing (stuck) vs ergodic (forgets the start)." Net-new vocabulary = transient
  / recurrent / periodic / communicating. Exact-fraction fluency (return probs **1/2**, **2/9**, period
  **2**) continues the corpus's "answers stay exact rationals" thread into the `Rational` toolkit.
