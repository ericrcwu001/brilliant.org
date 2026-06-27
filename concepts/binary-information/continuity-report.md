# Continuity Report — concept-binary-information

> Owner: Dept-1 Corpus Cartographer. Produced **before** the Concept Brief is finalized; feeds the
> Architect (no redundant lessons) + the Assessment Designer (every overlap becomes deliberate recall).
> Survey scope = the **committed worktree** corpus (`/Users/ericwu/Developer/lf-binary-information`,
> branch `concept/binary-information`). 7 shipped concepts, 52 lesson fixtures.

## Existing corpus surveyed

Shipped concepts (each `course-*.json` + its `lesson-*.json` fixtures), with catalog coordinates:

| courseId | domain | domainOrder | order | tagline | #L | accent | vizKey |
|----------|--------|:-----------:|:-----:|---------|:--:|--------|--------|
| course-pattern-hitting-times | Probability | 0 | 0 | How long until a pattern first appears? | 7 | ch1 | stateMachine |
| course-expected-value | Probability | 0 | 1 | What do you gain, on average, each play? | 6 | ch4 | sum |
| course-markov-chains | Probability | 0 | 2 | Where does a memoryless process settle? | 10 | ch3 | fourNode |
| course-bayes-rule | Probability | 0 | 3 | Update your beliefs when new evidence arrives. | 8 | ch2 | twoNode |
| course-combinatorics | Combinatorics & Games | 1 | 0 | Count cleverly to avoid counting everything. | 6 | ch5 | dice |
| course-optimal-stopping | Combinatorics & Games | 1 | 1 | Know when to commit for the best outcome. | 5 | ch3 | raceLanes |
| course-game-theory | Combinatorics & Games | 1 | 2 | Find equilibria where no one wants to deviate. | 6 | ch2 | twoNode |

Only two domains exist today: **Probability** (domainOrder 0) and **Combinatorics & Games**
(domainOrder 1). There is **no** "Information / Algorithms / Logic" domain. (See the Concept Brief for
the domain recommendation + Manager arbitration flag.)

No in-dev branches other than this one were surveyed (the factory's Firestore/MCP survey is out of
scope for this read-only worktree pass). The committed corpus is authoritative for de-duplication.

## The two load-bearing overlaps (deep-dive)

These two existing lessons **already teach** ideas the candidate scope listed as "teach." They MUST be
recalled, not re-taught.

### `lesson-combinatorics-1` — "The Counting Principle"
The multiplication rule, taught from a **coin-flip / binary-string** entry point.

| beatId | interaction | what it teaches | headline numbers |
|--------|-------------|-----------------|------------------|
| l1-recall | retrievalGrid | # distinct H/T strings of length n | 1 flip→2, 2→4, 3→8 |
| l1-bet | prediction | exponential growth of binary strings | 2¹⁰ = **1024** |
| l1-primer | primer | independent choices **multiply** (not add) | — |
| l1-win | countingTree | 2×2×2 fan-out | 8 |
| l1-scaffold | countingTree | add a 4th binary level — the doubling **is** 2ⁿ | 16 |
| l1-explore | countingTree | mixed fan-out (2 shirts × 3 pants × 2 shoes) | 12 |
| l1-multadd | answerEntry | the 3-bags × 3-weights counterfeit-coin example | 3³ = **27** |
| l1-model | countingTree | shrinking product → n! | 3! = 6 |
| l1-prove | masteryChallenge | distinct birthdays | 365·364·363 = 48,228,180 |
| l1-recap | recap | independent→multiply; shrinking→factorial | — |

**Already taught here:** that there are **2ⁿ binary strings of length n** (and 2¹⁰=1024), framed as
the product rule over n independent 2-way choices. **NOT taught here:** binary *representation* (a
number as a sum of distinct powers of 2), the *information* meaning of a bit, or the **inverse**
direction ⌈log₂N⌉. The 3³=27 counterfeit-coin example is a *teaser*, not a weighing lesson.

### `lesson-combinatorics-5` — "The Pigeon Hole Principle"
Pigeonhole as an **existence** tool, with the ceiling function.

| beatId | interaction | what it teaches | headline |
|--------|-------------|-----------------|----------|
| l5-recall | retrievalGrid | pick the right tool (multiply / nCk / pigeonhole) | — |
| l5-bet | prediction | count holes, not pile sizes | 4 |
| l5-primer | primer | pigeons/holes; ceiling ⌈·⌉ | ⌈4/3⌉=2, ⌈7/3⌉=3 |
| l5-win | answerEntry | 3 holes + 4 items force a pair | 4 |
| l5-explore | pigeonholeBoard | collision is forced | — |
| l5-scaffold | pigeonholeBoard | ⌈N/H⌉ scales | ⌈7/3⌉=3 |
| l5-model | tripletReveal | existence, not enumeration | — |
| l5-apply | answerEntry | 26 people, 25 handshake counts | forced collision |
| l5-prove | masteryChallenge | 51 ants in 25 grid cells | ⌈51/25⌉=3 |
| l5-recap | recap | N>H forces existence | — |

**Already taught here:** the pigeonhole principle, ⌈N/H⌉, and **existence vs enumeration**. Its
`interviewNote` already links to the counterfeit-coin teaser (3³=27 combos vs 7 distinct sums →
`forcesCollision(9,7)=true`). **NOT taught here:** that pigeonhole supplies the **information lower
bound** ("k bits = 2ᵏ outcome-boxes ⇒ distinguishing N things needs 2ᵏ≥N, i.e. k≥⌈log₂N⌉"). That
*inversion* is the new concept's L2 core.

## Other corpus touchpoints (lighter)

| existing | touchpoint | relevance |
|----------|-----------|-----------|
| `lesson-game-theory-6` (Nim) | **XOR / nim-sum** is the winning-position invariant (3⊕4⊕5=2) | GT *uses* XOR as a number op; it never explains XOR as **bitwise, independent per-bit parity**. The new bit-tricks lesson teaches *why* XOR works and recalls Nim as the payoff. |
| `lesson-combinatorics-3` (Pascal) | Pascal **row sums = 2ⁿ** | Another face of 2ⁿ; a one-line interleave callback, no new teaching. |
| `lesson-overlap-shortcut` (PHT L6) | E[T] = **Σ 2^L** over self-overlaps; an `exponent` primer | Powers of two recur; interleave as "doubling shows up everywhere," no re-teach. |
| `lesson-optimal-stopping-1/2` | "information" used informally (use early candidates to beat 1/n) | The new concept **formalizes** information as bits; a one-line callback, not a dependency. |
| `lesson-bayes-rule-3` | "2ᵏ > 999" doubling-odds step (k=10) | Tangential; the same 2¹⁰≈10³ landmark. Optional interleave. |

No existing lesson teaches: binary **representation** (sum of distinct powers of 2), **⌈log₂N⌉** as an
information bound, **group testing** (poisoned-wine), **balance-scale base-3** weighing as a full
topic, or **bit-manipulation tricks** (`x&(x-1)`, shift-multiply). These are the genuinely new core.

## Overlap analysis — verdicts

| existing lesson/beat | overlapping idea | verdict | action in the new concept |
|----------------------|------------------|---------|----------------------------|
| combinatorics-1 (l1-recall/l1-bet/l1-scaffold) | **2ⁿ binary strings / 2¹⁰=1024** | **reuse-as-recall** | L1 opens with a graded `retrievalGrid` recalling "n flips → 2ⁿ strings," then *pivots meaning*: those 2ⁿ strings are exactly the 2ⁿ numbers n bits can **name**. Do NOT re-derive 2ⁿ. |
| combinatorics-5 (l5-primer/l5-model) | **pigeonhole + ⌈N/H⌉, existence** | **reuse-as-recall (then invert)** | L2 opens recalling pigeonhole, then uses it as the *engine* of the ⌈log₂N⌉ lower bound (k bits ⇒ 2ᵏ boxes; need 2ᵏ≥N). Reference the principle; do NOT re-teach ⌈·⌉. |
| combinatorics-1 (l1-multadd, 3³=27 coins) | **counterfeit-coin / weighing teaser** | **dedupe → promote** | L4 (balance scale) recalls the 3³=27 teaser as its hook, then teaches the real base-3 weighing topic the teaser only gestured at. The teaser line itself is referenced, not repeated. |
| game-theory-6 (Nim, XOR) | **XOR as a bit operation** | **reuse-as-recall (interleave)** | L5 opens recalling "nim-sum = XOR," then teaches XOR *bitwise* (per-bit, no-carry parity) and why it powers the find-the-single-number trick. |
| combinatorics-3 (Pascal row sums) ; overlap-shortcut (Σ2^L) | **powers of two recur** | **interleave** | L6 capstone surfaces 2ⁿ across contexts (strings, Pascal rows, overlap waits) as one idea: "doubling is the unit of information." One mixed beat; no re-teach. |
| optimal-stopping-1/2 (informal "information") | **information, informally** | **dedupe → formalize** | L1/L2 give a one-line callback ("you already used information to beat 1/n — here's the unit"), then define the bit. Not a prereq. |

## Active-recall plan (learning science — `inclusive-research-5`)

Every overlap above is wired to a concrete beat. The first graded beat of **every** lesson is a
`retrievalGrid` opener (this is also the inclusivity-gate "early-win" requirement), so each lesson
*starts* by retrieving prior knowledge.

- **Retrieval warm-ups (graded `retrievalGrid` openers):**
  - L1 ← combinatorics-1: "n flips → how many distinct strings?" (2,4,8,1024) — then reframed as "how
    many numbers can n bits name?"
  - L2 ← combinatorics-5: "N items, H boxes → some box holds ≥ ___" (pigeonhole/⌈N/H⌉ recall).
  - L3 ← L1/L2 of *this* concept: "n bits distinguish how many outcomes?" (interleaved self-recall
    before group testing).
  - L4 ← combinatorics-1: "3 bags × 3 weights → how many combos?" (3³=27 counterfeit-coin recall) →
    pivots to base-3 weighing.
  - L5 ← game-theory-6: "nim-sum of {3,4,5}?" (XOR recall = 2) → pivots to bitwise XOR.
  - L6 ← mixed: match each scenario to its tool (binary label / log₂ bound / ternary weighing / XOR).

- **Interleaving (confusable pairs surfaced together):**
  - **2ⁿ (forward, counting) vs ⌈log₂N⌉ (inverse, bits-needed)** — the central L1↔L2 confusable; an
    interleaved beat in L2 and again in L6.
  - **base-2 bits (yes/no test) vs base-3 weighings (left/right/balance)** — L3↔L4 confusable; the L6
    capstone forces a choice between ⌈log₂N⌉ and ⌈log₃N⌉ framings.
  - **AND-mask `x&(x-1)` (clears lowest set bit) vs XOR (per-bit parity)** — L5 internal interleave.

- **Spaced re-surfacing:**
  - **2ⁿ / powers of two** seeded in combinatorics-1, recalled in L1, re-surfaced in L3 (2ᵏ tests),
    L5 (shift = ×2), and unified in L6 (Pascal rows, Σ2^L overlap) — four spaced encounters.
  - **Pigeonhole** (combinatorics-5) recurs as the *proof* of the lower bound in L2 and again as the
    "why ⌈log₂N⌉ is a floor you can't beat" callback in the L6 capstone.
  - **XOR** (game-theory-6) recurs in L5 (taught bitwise) and L6 (missing-number synthesis).
