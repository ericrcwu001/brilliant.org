# Lesson Brief: The Update Rule  (lesson-bayes-rule-1)

## Hook  (the bet)

"I have two coins — one normal, one with **heads on both sides**. I shuffle them behind my back, pull
one out, and flip it: **heads**. Is it more likely the two-headed coin, or is it still a 50/50 toss-up?"

## Core promise (one idea)

Evidence **rescales** your prior belief in each hypothesis **in proportion to how well that hypothesis
predicted the evidence**: posterior ∝ prior × likelihood. (The two-headed coin predicted "heads" twice
as strongly as the fair coin, so a head pushes you from 1/2 to **2/3**.)

## Display fields

- **glyphKey:** `2/3`
- **vizKey:** `twoNode`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Two coins, one fair + one two-headed; pick one at random, flip once → heads. P(two-headed \| heads)? | **2/3** | https://stats.stackexchange.com/questions/514627 and https://mathproblems.info/prob16s.htm (both state 2/3) | ☐ engine ☑ source |
| Family with two children, at least one a boy. P(both boys \| ≥1 boy)? | **1/3** | Green Book p.37–38 §"Conditional Probability and Bayes' Formula" | ☐ engine ☑ source |
| Two children, you meet one who is a boy. P(both boys)? (framing-change contrast) | **1/2** | Green Book p.37–38 §"Conditional Probability and Bayes' Formula" | ☐ engine ☑ source |
| Two-urn version: Urn A = 2 red 1 blue, Urn B = 1 red 2 blue; pick an urn at random, draw → red. P(A \| red)? | **2/3** | Standard textbook conditional-probability problem; GB-anchored to Bayes' formula p.37 (same structure as two-coin) | ☐ engine ☑ source |
| **Mastery (transfer):** two coins (fair + two-headed), flip the chosen coin and see heads **twice**. P(two-headed \| HH)? | **4/5** | Transfer of the two-coin source above (likelihood (1/2)²); engine-verified — previews L3 | ☐ engine ☑ source |

> Exact-rational check (Stage 2 will reproduce in `bayes.ts`): two-coin = (½·1)/(½·1 + ½·½) = (½)/(¾) =
> **2/3**; HH = (½·1)/(½·1 + ½·¼) = (½)/(⅝) = **4/5**; boys-girls condition removes (g,g) from
> {(b,b),(b,g),(g,b),(g,g)} → **1/3**; two-urn = (½·⅔)/(½·⅔ + ½·⅓) = (⅓)/(½) = **2/3**.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-prob-split` | Reactivate "a probability is a split, not a flip-count" (the guaranteed early win) | retrieval bridge from Penney's/Gambler's | "a probability must have a +1" | yes (easy) | both |
| 2 | `open-bet` | Commit a gut answer to the two-coin flip | sets up prior vs posterior | "a head we can't rule out either coin ⇒ still 1/2" | no (`byOption`) | both |
| 3 | `name-the-parts` | Name prior / likelihood / posterior just-in-time | vocabulary before symbols | — (JIT primer) | no | A |
| 4 | `explore-update` | Drag the prior split, observe a head, watch the posterior swing | posterior ∝ prior × likelihood, felt | "evidence either proves or does nothing" | no (hero) | both |
| 5 | `count-the-heads` | Tap the heads that belong to the two-headed coin (2 of 3 equally-likely heads) | natural-frequency intuition for 2/3 | "the two H-sides are 'the same' head" | yes | both |
| 6 | `compute-posterior` | Assemble prior × likelihood ÷ total → 2/3 | the Bayes formula on numbers | "posterior = likelihood (ignore the prior)" | yes | both |
| 7 | `framing-flip` | Boys-and-girls: same evidence, different framing → 1/3 vs 1/2 | evidence framing changes the update | "P(both boys \| a boy) is obviously 1/2" | yes | both |
| 8 | `triangulate-23` | Three lenses (formula / 3-heads frequency / odds ½ doubling) all give 2/3 | robustness of the answer | "the 2/3 is a trick of one method" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** two coins, see HH → 4/5 | transfer + preview compounding | "a second head can't change a settled belief" | yes | both |
| 10 | `recap` | Retrieval-first recap: prior × likelihood, renormalize | consolidate the rule | — | no | both |

Notes: graded beats `required: true`, `track: both`; track-A primer (`name-the-parts`) is
`required: false`. `explore-update` and `count-the-heads` use the new `bayesUpdate` type
(`display: 'bars'` then a tap-partition); 5–7 reuse `answerEntry`/`retrievalGrid`; 8 reuses
`tripletReveal`; 9 reuses `masteryChallenge`. `explore-update` carries the `hero`
(slowFirst + structuralReadout + reducedMotionFinalFrame), per the HERO_TYPES rule.

## Misconceptions (Specialist)

- **"Both coins can show heads, so a head tells you nothing → still 1/2."** Fires at `open-bet`/`explore`.
  Refutation (per-option `byOption`): *"Both can show heads — but not equally often. The two-headed coin
  shows heads every time; the fair coin only half the time. Of the three equally-likely heads, two sit on
  the two-headed coin → 2/3."*
- **"Posterior = likelihood; ignore the prior."** Fires at `compute-posterior`. Refutation: *"The 100%
  likelihood isn't the answer — you must weight it by the prior (½ each) and renormalize by the total
  chance of a head (¾). (½·1)/(¾) = 2/3, not 1."*
- **"Evidence either proves a hypothesis or does nothing."** Fires at `explore-update`. Refutation:
  *"Evidence rarely settles it — it tilts the split. One head moves you 1/2 → 2/3, not to certainty."*
- **"P(both boys | I see a boy) = 1/3 too."** Fires at `framing-flip`. Refutation: *"Different evidence.
  'At least one is a boy' only removes girl-girl → 1/3. 'This specific child is a boy' is stronger
  evidence → 1/2. The framing of the clue changes the update."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-prob-split` — recalls Penney's/Gambler's *"a win-chance is a split, no
  +1"* (Continuity Report), reframed as "and a split can be **revised** by evidence."
- **guaranteed early win:** `recall-prob-split` (graded recall, not the hardest type) — first graded beat
  is a familiar match, not the Bayes compute.
- **mastery challenge (required, before recap):** `mastery-challenge` — two coins, see HH → **4/5**; a
  transfer of the cited two-coin problem that also seeds L3's "evidence compounds."
- **spacing/interleaving:** exact-fraction posteriors (2/3, 4/5) continue PHT's fraction fluency (7/8,
  i/N); the prior-vs-posterior split interleaves with Penney's/Gambler's probability-vs-time split; the
  HH mastery is the spaced hook that L3 picks up as sequential evidence.
