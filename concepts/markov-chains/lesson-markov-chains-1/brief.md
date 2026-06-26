# Lesson Brief: The Markov Property  (lesson-markov-chains-1)

## Hook  (the bet)

"It has rained **nine days straight**. A friend says, *'It's got to clear up tomorrow — we're due.'*
But the weather model gives tomorrow the **same 7/10 chance of rain** it gives after a *single* wet
day. Who's right — does the weather **remember** its streak, or only know that today is wet?"

## Core promise (one idea)

A process is **memoryless** (Markov) when the next state depends *only* on where you are **now** — not
on the path that got you there. The entire past collapses into a single current state, so
`P(next | whole history) = P(next | now)`. (Nine wet days or one, rainy-today is rainy-today: `7/10`.)

## Display fields

- **glyphKey:** `P(·|now)`
- **vizKey:** twoNode

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| What makes a process "memoryless" / Markov? (identify: next depends only on the current state) | conceptual — *"once the current state is known, past history has no bearing on the future"* | Green Book **p.53 §5.1** (Markov Chain) | [x] source · engine n/a |
| Two-state weather chain `P=[[3/5,2/5],[3/10,7/10]]` (rows = today {Clear, Rainy}) — is it a valid Markov chain? | yes — each row sums to 1; next day depends only on today | Math.SE 3336273 — https://math.stackexchange.com/questions/3336273/clear-days-rainy-days-markov-chain-problem | [x] source · [ ] engine |
| P(rain tomorrow \| rain today)? | **7/10** | Math.SE 3336273 (same chain, row Rainy) | [x] source · [ ] engine |
| P(clear tomorrow \| clear today)? | **3/5** | Math.SE 3336273 (row Clear) | [x] source · [ ] engine |
| P(rain tomorrow \| clear today)? | **2/5** | Math.SE 3336273 (row Clear) | [x] source · [ ] engine |
| Classify: "tomorrow depends only on today" vs "tomorrow depends on the last **3** days" | Markov  vs  **not** Markov (on the raw state) | Green Book p.53 §5.1 (the property is the test) | [x] source · engine n/a |
| **Mastery (transfer):** "sticky weather" — rain tomorrow w.p. **4/5** if it rained *both* today & yesterday, else **1/5**. (a) Markov on {Clear, Rainy}? (b) fix it. (c) P(rain tomorrow \| state = RR)? | (a) **no** (b) redefine state = **(yesterday, today)** → 4-state Markov chain (c) **4/5** | **[CONSTRUCTED]** — augmentation principle anchored to GB p.53 §5.1; the rule + value are constructed, not source-stated | [ ] source (constructed) · [ ] engine |

> **Exact-rational check (Stage 2 reproduces in `markov.ts`).** Weather `P=[[3/5,2/5],[3/10,7/10]]`,
> rows = today's state: `3/5+2/5=1`, `3/10+7/10=1` (stochastic). One-step reads are *literal matrix
> entries* — no float, no computation: `P(rain|rain)=7/10`, `P(clear|clear)=3/5`, `P(rain|clear)=2/5`.
> **Mastery (constructed):** on the raw state "rainy," P(rain tomorrow) is `4/5` after **RR** but `1/5`
> after **CR** → *ill-defined* → not Markov; on state `(yesterday, today) ∈ {CC,CR,RC,RR}` the 4-state
> chain is Markov and `P(rain | RR)=4/5`. **Engine-verify the 4/5 and the augmented chain's validity.**

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track | type (reuse/NEW chainBoard) |
|---|--------|------------------------|---------|--------------------------------|---------|-------|------------------------------|
| 1 | `recall-no-memory` | Reactivate "the coin has no memory" and lift it to "next depends only on now" (the early recall) | retrieval bridge: memorylessness from PHT/Bayes | "a streak makes an outcome 'due'" (gambler's fallacy) | yes (easy) | both | **retrievalGrid** (reuse) |
| 2 | `streak-bet` | Commit a gut call: does a long rain streak lower tomorrow's rain odds? | sets up memoryless vs "remembers the streak" | "the weather/coin remembers its run" | no (`byOption`) | both | **prediction** (reuse) |
| 3 | `name-markov` | Name *Markov property / memorylessness* just-in-time | vocabulary: state · memoryless · `P(next\|now)` | — (JIT primer) | no | A (`required:false`) | **primer** (reuse) |
| 4 | `read-the-edge` | Read a one-step probability off the weather chain (the guaranteed win) | how to read a transition prob from the chain | "read the column / confuse `P(rain\|rain)` with `P(rain\|clear)`" | yes (easy) | both | **chainBoard:diagram** (NEW) |
| 5 | `step-the-weather` | Step the 2-state chain; watch the next state drawn **only** from the current row | memorylessness, *felt*: only the current row fires | "the path so far biases the next draw" | no (**hero**) | both | **chainBoard:diagram** (NEW, hero) |
| 6 | `name-memoryless` | Triangulate diagram-edge / matrix-row / simulation-draw → all use only "now" ⇒ `P(Xₙ₊₁\|past)=P(Xₙ₊₁\|Xₙ)` | the formal Markov property | "memoryless = independent (today doesn't matter either)" | no | both | **tripletReveal** (reuse) |
| 7 | `markov-or-not` | Classify stories Markov vs NOT (only-today vs last-3-days vs running-max) | spotting the property in words | "*any* dependence on the past breaks Markov" | yes | both | **retrievalGrid** (reuse) |
| 8 | `remembers-vs-forgets` | (optional deepen) Contrast a memoryless story with one that *never forgets* — seed L4/L7 | forward link: absorbing (never forgets) vs ergodic (forgets the start) | "a memoryless process can't get permanently stuck" | no | B (`required:false`) | **prediction** (reuse) |
| 9 | `mastery-augment` | **(required, before recap)** A last-two-days process isn't Markov on {C,R}, but is on `(yesterday,today)`; spot the fix + read **4/5** | deep transfer: **state augmentation** | "depends on 2 days ⇒ permanently non-Markov" | yes (hard) | both | **masteryChallenge** (reuse) |
| 10 | `recap-now` | Generate-then-reveal: "only *now* matters; fold any needed history into the state" | consolidate memorylessness | — | no | both | **recap** (reuse) |

Notes: graded beats (`1,4,7,9`) are `required:true`, `track:both`; the JIT primer (`name-markov`) and
the forward-seed interleave (`remembers-vs-forgets`) are `required:false`. `read-the-edge` and
`step-the-weather` are the debut of the new folded **`chainBoard`** type (`display:'diagram'`) — the
read mode renders the static 2-node graph and grades a tapped/typed edge value; the step mode animates
drawing the next state from the current row. `step-the-weather` carries the **`hero`** block
(`slowFirst` + `structuralReadout` + `reducedMotionFinalFrame`), per the HERO_TYPES rule. Beats `1,7`
reuse `retrievalGrid`; `2,8` reuse `prediction` (`byOption`); `6` reuses `tripletReveal` (ungraded);
`9` reuses `masteryChallenge`; `10` reuses `recap`. Put one `interviewNote` on `name-memoryless`
("memorylessness — *the* defining property — is the first thing a quant interview probes about a chain").

## Misconceptions (Specialist)

- **"The weather/coin remembers its streak — after 9 wet days it's *due* to clear."** Fires at
  `streak-bet` / `recall-no-memory`. Refutation (`byOption`): *"A Markov process keeps no tally of its
  run. P(rain tomorrow | rain today) = 7/10 whether it's rained one day or ten — the streak length is
  not part of the state. 'Due' is the gambler's fallacy."*
- **"Memoryless means the past is erased — tomorrow is independent of today too."** Fires at
  `name-markov` / `name-memoryless`. Refutation: *"Memoryless ≠ independent. Today matters a lot —
  7/10 after rain vs 2/5 after clear. What's discarded is everything *before* today, not today itself."*
- **"Read the rainy column to get P(rain | rain)."** Fires at `read-the-edge`. Refutation: *"Condition on
  *today*, so read today's **row**. Rainy-today is the second row `[3/10, 7/10]`; the entry for
  rain-tomorrow is 7/10. Rows are 'where you are now,' columns are 'where you go.'"*
- **"Any dependence on the past makes a process non-Markov."** Fires at `markov-or-not`. Refutation:
  *"Depending on the past is fine — depending on more than the current **state** is the problem. Fold the
  history you need into the state and it's Markov again."*
- **"A process driven by the last two days can never be Markov."** Fires at `mastery-augment`.
  Refutation: *"Only on the raw {Clear, Rainy} state — there P(rain | today rainy) is ambiguous (4/5
  after RR, 1/5 after CR). Redefine the state as the ordered pair (yesterday, today) and the *same*
  process is a clean 4-state Markov chain. Augmentation is the fix."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-no-memory` — recalls **"the coin has no memory"** from PHT
  `lesson-first-heads` `l0-flip` `gamblerNote`, reinforced by `lesson-gamblers-ruin` `gamblers-fallacy`
  and Bayes-3 `due-vs-evidence` (continuity-report L1 row). *Net-new* = lifting "the coin has no memory"
  to **"the next state depends only on the current state."**
- **guaranteed early win:** `read-the-edge` (beat 4) — an easy, exact-rational read off the weather
  chain (`P(rain|rain)=7/10`); the first graded touch of the new material is a single-cell lookup, not a
  derivation. (The graded recall at beat 1 is a second, even-earlier win.)
- **mastery challenge (required, before recap):** `mastery-augment` — the **state-augmentation**
  transfer: a last-two-days "sticky weather" rule is **not** Markov on {Clear, Rainy} (P(rain | today
  rainy) is `4/5` after RR but `1/5` after CR), but becomes a 4-state Markov chain on state
  `(yesterday, today)`; read `P(rain | RR) = 4/5`. Tests the deep idea, not the body's single-step read.
- **spacing/interleaving:** **memorylessness is INTRODUCED here (L1)**, **CONTRASTED at L4** (absorbing
  states *never forget* — they get stuck), and **RE-SURFACED at L7** (ergodic chains *forget the start*,
  `Pⁿ→π`). Beat 8 (`remembers-vs-forgets`) plants that forward seed. Exact-fraction fluency (7/10, 3/5,
  2/5, 4/5) continues the corpus's "answers stay exact rationals" habit (PHT `7/8`, `i/N`; Bayes `2/3`).
