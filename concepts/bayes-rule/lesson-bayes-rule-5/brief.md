# Lesson Brief: The Host's Clue  (lesson-bayes-rule-5)

## Hook  (the bet)

"Three doors: a car behind one, goats behind the other two. You pick **Door 1**. The host — who
**knows** where the car is and **always** opens a different door to reveal a goat — opens **Door 3**.
He offers you the switch to Door 2. **Stay or switch** — or doesn't it matter?"

## Core promise (one idea)

The host's **action is the evidence**, and its likelihood depends on **his rules**: when the car is
behind your door he's free to open either goat door (½ each), but when it's behind the other door he's
**forced** to open the one he opened (probability 1). Run the 3-hypothesis update and that forcing pushes
the door he left closed to **2/3** — switch.

## Display fields

- **glyphKey:** `door`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Pick Door 1; host opens Door 3 (goat). P(car behind Door 2) — i.e. P(switch wins)? | **2/3** | Green Book **p.40** §"Monty Hall problem" (→ 2/3); en.wikipedia.org/wiki/Monty_Hall_problem; interview pack `showcase-monty-hall` (#35) | ☑ engine ☑ source |
| …same. P(car behind Door 1) — i.e. P(stay wins)? | **1/3** | Green Book p.40 (your door keeps its original 1/3) | ☑ engine ☑ source |
| **100 doors**: pick 1; host opens 98 goat doors; switch to the last closed door. P(win)? | **99/100** | en.wikipedia.org/wiki/Monty_Hall_problem (vos Savant's N-door intuition pump) | ☑ engine ☑ source |
| Pick Door 1; host opens **Door 2** instead. P(car behind Door 3) — switch wins? | **2/3** | Green Book p.40 (symmetry — the opened door is irrelevant; the rule is unchanged) | ☑ engine ☑ source |
| **Mastery (transfer):** host opens a remaining door **at random** and it *happens* to show a goat. P(switch wins)? | **1/2** | J. Rosenthal, "Monty Hall, Monty Fall, Monty Crawl" (Math Horizons, 2008); en.wikipedia.org/wiki/Monty_Hall_problem §Other host behaviors | ☑ engine ☑ source |

> Exact-rational check (`bayesPosterior`, **all confirmed**): hypotheses = car behind {switch-door,
> your-door, opened-door}, priors [1/3,1/3,1/3]. Standard Monty likelihoods of "host opens that door"
> = [1, 1/2, 0] → posteriors **[2/3, 1/3, 0]** (focal = switch = 2/3). 100-door: priors 1/100 each,
> likelihoods "leave this door closed" = [1, 1/99, 0,…] → switch = **99/100**. Random ("Monty Fall")
> host: a goat-reveal is equally likely whether the car is behind your door or the other → likelihoods
> [1/2, 1/2, 0] → **[1/2, 1/2, 0]** = no advantage. The intent in the host's rule is the whole edge.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-n-update` | Recall L4/L1: "rescale each of N hypotheses by its likelihood, renormalize" (the early win) | retrieval bridge from L4 (+L1) | "with 3 doors the rule changes" | yes (easy) | both |
| 2 | `open-bet` | Commit stay / switch / doesn't matter | surfaces the 50/50 trap | "two doors left ⇒ 50/50" | no (`byOption`) | both |
| 3 | `name-the-protocol` | Name "the likelihood of the host's action comes from his **rules**" | vocabulary: protocol → likelihood | — (JIT primer) | no | A |
| 4 | `explore-doors` | Watch the reveal collapse the opened door to 0 and push the switch door to 2/3 (3 bars) | the host's action as evidence, felt | "the opened door's probability splits evenly onto the other two" | no (hero) | both |
| 5 | `host-likelihood` | Fill P(host opens 3 \| car behind each door): [½, 1, 0] | the crux — forcing is information | "the host's choice is unconstrained / random" | yes | both |
| 6 | `compute-23` | Assemble priorᵢ × Lᵢ ÷ total → switch = 2/3 | the 3-hypothesis update on numbers | "switching is superstition" | yes | both |
| 7 | `hundred-doors` | Scale to 100 doors → switch = 99/100 | the rule generalizes; intuition pump | "more doors makes switching matter less" | yes | both |
| 8 | `triangulate-23` | Three lenses (likelihood table / enumerate 3 car spots / odds: your door 1/3, rest funnels to one) → 2/3 | robustness of 2/3 | "2/3 is a wording trick" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** random "Monty Fall" host → 1/2 | transfer that probes *why* it was 2/3 | "any goat-reveal makes switching 2/3" | yes | both |
| 10 | `recap` | Retrieval-first recap: the action is the evidence; its likelihood is the host's rule | consolidate | — | no | both |

Notes: `explore-doors` uses the new `bayesUpdate` type `display: 'bars'` **rendering n = 3 hypotheses**,
including a **zero-likelihood bar** (the opened door → `0/1`) the renderer must draw at zero height; it
carries the `hero` block, and `hypotheses[0]` = the **switch** door so the validator's
`bayesPosterior(...)[0]` anchor reads `2/3`. `host-likelihood`, `compute-23`, `hundred-doors`,
`mastery-challenge` reuse `answerEntry`/`retrievalGrid`/`masteryChallenge`; `triangulate-23` reuses
`tripletReveal`; opener reuses `retrievalGrid`. Put one `interviewNote` on `compute-23` ("Monty Hall —
treating the host's action as evidence — is a canonical Bayes interview question").

## Misconceptions (Specialist)

- **"Two doors are left, so it's 50/50."** Fires at `open-bet`/`explore-doors`. Refutation (`byOption`):
  *"The doors aren't symmetric. Your door was fixed at 1/3 **before** the host acted, and his hands were
  tied by where the car is. All the leftover 2/3 funnels onto the single door he chose to leave closed."*
- **"The host opening a goat tells you nothing — there's always a goat to open."** Fires at
  `host-likelihood`. Refutation: *"There's always *a* goat, but *which* one he can open is the clue. Car
  behind Door 2 ⇒ he's **forced** to open Door 3 (likelihood 1); car behind your door ⇒ he opens 3 only
  half the time. 1 vs ½ is the evidence."*
- **"Switching is just superstition / it can't matter."** Fires at `compute-23`. Refutation: *"Enumerate
  the 3 equally-likely car positions: switching wins in 2 of them. It matters in exactly 2/3 of games."*
- **"Any host who reveals a goat makes switching 2/3."** Fires at `mastery-challenge`. Refutation: *"Only
  a host who **must** avoid the car does. If he opens at random and it merely happens to be a goat, the
  reveal is equally likely under both live doors (½ each) → no update → 1/2. His **intent** is the edge."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-n-update` — recalls **L4's** N-way update (rescale each, renormalize) and
  **L1's** "likelihood = how well a hypothesis predicted the evidence" (Continuity Report: L4 headline →
  L5 opener), here applied to three doors.
- **guaranteed early win:** `recall-n-update` (graded recall, not the Monty computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — the **random "Monty Fall" host →
  1/2**; a transfer that only the learner who grasped *why* it was 2/3 (the host's constrained rule) can
  get right, and which **plants the question L6 answers** ("the protocol behind the clue determines the
  update").
- **spacing/interleaving:** re-applies **L4's** 3-hypothesis machinery and **L1's** likelihood idea
  (recall, not re-teach); `hundred-doors` re-surfaces "the same rule scales with N"; the Monty-Fall
  mastery is the **spaced seed for L6** (what exactly is the evidence?); exact-fraction posteriors (2/3,
  1/3, 99/100, 1/2) continue the corpus's fraction-fluency thread.
