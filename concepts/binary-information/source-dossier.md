# Source Dossier — concept-binary-information

> Owner: Dept-1 Source Miner. **Anchor-and-source, never invent.** Every problem below is either a
> Green-Book problem (page-cited, statement + stated answer quoted from `references/green-book.txt`,
> verified by grep) **or** a real quant/SWE-interview look-alike found by web search (source URL +
> stated answer recorded). Every answer is an **exact integer / rational / bit-pattern**, so a future
> pure bit/integer engine (`src/engine/binary.ts`) can reproduce it (no floats).
>
> **Verification legend:** `src✓` = stated answer seen at the cited source. `eng☐` = must still be
> reproduced by the engine in the build wave (Stage-2 math gate). The Green Book OCR
> (`green-book.txt`) is messy; page numbers and the *math* were confirmed by grep, and exact prose is
> quoted as cleanly as the OCR allows.

## Green Book anchors (primary — Xinfeng Zhou, *A Practical Guide To Quantitative Finance Interviews*)

§7.2 **"The Power of Two"** (p.92) is the spine. Ch.2 **"Brain Teasers"** supplies the weighing
anchor (p.4–5). Grep-verified page markers: PAGE 4/5 ≈ lines 370–472; PAGE 92 ≈ line 14158.

| GB# | section / page | problem (quoted/condensed) | exact stated answer | verify |
|----:|----------------|----------------------------|---------------------|--------|
| GB1 | §7.2 p.92 | "How do you determine whether an integer is a power of 2?" | `(x & (x−1)) == 0` (true ⇔ power of two; x>0). Because 2ⁿ has a single set bit and 2ⁿ−1 is all-ones below it, so they share no bits. Ex: 4=`100`, 3=`011`, 4&3=0. | src✓ eng☐ |
| GB2 | §7.2 p.92 | "What is the … way to multiply an integer by 7 without using the multiplication (\*) operator?" | `(x << 3) − x`  (since `x<<3` = 8x, so 8x − x = 7x). | src✓ eng☐ |
| GB3 | §7.2 p.92 | **Poisonous wine.** 1000 bottles, exactly one poisoned; poison kills in ~18h; 10 lab mice; 20h before the party. Find the poisoned bottle? | **Yes — 10 mice suffice.** Label bottles 1…1000 in 10-bit binary (1000 = `1111101000₂` = 2⁹+2⁸+2⁷+2⁶+2⁵+2³). Mouse *i* sips from every bottle whose bit *i* is 1. After 18h, read the dead(1)/alive(0) pattern across the 10 mice as a binary number → the bottle index. (10 mice cover up to 2¹⁰ = **1024** bottles.) | src✓ eng☐ |
| GB4 | §7.2 p.92 | **Probability simulation.** Given a fair coin, design a game that wins with arbitrary probability p ∈ (0,1). | Write p in **binary** `0.b₁b₂b₃…`. Toss the coin (H=1, T=0) to generate bits bᵢ; at the first position where your bit differs from pᵢ, you **win iff** your bit < pᵢ. Terminating-binary p (e.g. 1/4 = `0.01`) is exact. | src✓ eng☐ (rational p) |
| GB5 | Ch.2 p.4–5 "Defective ball" | "You have **12** identical balls. One is heavier **OR** lighter (you don't know which). Using a balance, determine the defective ball in **3** measurements." | **3 weighings.** Split into three groups of 4; the 3-way outcome (left<right / balance / left>right) is a **base-3** digit. General bound (quoted): with direction **unknown** you can find the defective among up to **(3ⁿ−3)/2** balls in n weighings; with direction **known**, up to **3ⁿ**. (n=3 ⇒ 12 covered by (27−3)/2=12.) | src✓ eng☐ |
| GB6 | §7.2 p.92 (binary repr.) | The poisoned-wine solution states the representation fact directly: "1000 = 2⁹+2⁸+2⁷+2⁶+2⁵+2³ = `1111101000`." Every integer is a **unique sum of distinct powers of 2.** | 1000 = `1111101000₂`; the lowest set bit / trailing-zero structure reads off divisibility by 2. | src✓ eng☐ |

## Sourced quant / SWE-interview look-alikes (secondary — each with URL + stated answer)

| #  | area | problem (condensed) | exact answer | source (name — URL) | answer kind |
|---:|:----:|---------------------|--------------|---------------------|-------------|
| S1 | L1 | Gold rod of **7** units; pay a worker +1 unit/day for 7 days with the **fewest cuts**; what cut sizes? | **2 cuts → pieces 1, 2, 4** (binary; every daily total 1…7 is a subset sum). ⚠️ *2 cuts, not 3* — sources unanimous. | GeeksforGeeks "Pay an employee using a gold rod of 7 units" — geeksforgeeks.org/aptitude/puzzle-4-pay-an-employee-using-a-gold-rod-of-7-units/ | integers |
| S2 | L1/L2 | Guess a secret number **1–100** with higher/lower questions; worst-case minimum questions? | **7** ( ⌈log₂100⌉, 2⁷=128≥100 ) | programmerinterview.com/puzzles/minimum-guesses-1-100/ | integer |
| S3 | L2 | Find a number **1–1,000,000** with higher/lower hints; minimum questions? | **20** ( 2²⁰=1,048,576>10⁶ ) | Aaronson, "Twenty Questions" — aaronson.org/blog/twenty-questions | integer |
| S4 | L2 | Meta interview: numbers **1–1000**, minimum guesses with higher/lower hint? | **10** ( ⌈log₂1000⌉, 2¹⁰=1024 ) | Glassdoor (Meta) interview Q; programmerinterview.com (same page as S2) | integer |
| S5 | L3 | **9 balls**, one heavier; identify with a balance used only **twice**. | **2 weighings** ( three groups of 3; 3²=9 ) | Math Is Fun "Weighing 9 Balls" — mathsisfun.com/puzzles/weighing-9-balls-solution.html | integer |
| S6 | L3 | **8 balls**, one slightly heavier; fewest balance weighings. | **2 weighings** ( ⌈log₃8⌉=2 ) | suresolv.com/brain-teaser/find-heavier-among-8-identical-balls-2-weighing-puzzle | integer |
| S7 | L3 | **2 eggs, 100-floor** building; minimum drops to find the highest safe floor (worst case). | **14** ( smallest x with x(x+1)/2 ≥ 100 ) | GeeksforGeeks "2 Eggs and 100 Floors" — geeksforgeeks.org/aptitude/puzzle-set-35-2-eggs-and-100-floors/ ; gurmeet.net/puzzles/two-eggs-and-a-building/ | integer |
| S8 | L3 | Poisoned-wine family: 1000 bottles, 1 poisoned, animals die after a delay; minimum testers. | **10** ( ⌈log₂1000⌉ ) — matches GB3. | Brainstellar "Poisonous wine" #31 — brainstellar.com/puzzles/31/ | integer |
| S9 | L4 | **12 coins**, one counterfeit (heavier **or** lighter, unknown); find it **and** say heavy/light. Minimum weighings? | **3 weighings** ( 3³=27 ≥ 2·12+1=25 ). Max coins (unknown dir.) in n weighings = ½(3ⁿ−1) ⇒ n=3 → 13. | Wikipedia "Balance puzzle" — en.wikipedia.org/wiki/Balance_puzzle ; cut-the-knot.org/blue/weight1.shtml | integer |
| S10 | L4 | **Bachet's weights:** fewest weights to weigh every integer mass **1…40** on a two-pan balance (weights allowed on either pan)? | **4 weights: 1, 3, 9, 27** (powers of 3 — balanced ternary; coefficients ∈ {−1,0,+1}). | arXiv 1010.5486 "Bachet's Problem"; Wolfram MathWorld "Weighing" — mathworld.wolfram.com/Weighing.html | integers |
| S11 | L5 | **Single Number.** Array where every element appears twice except one; find the unique element. | **XOR of all elements.** Ex `[2,2,1]`→**1**; `[4,1,2,1,2]`→**4**. | LeetCode 136 "Single Number" — leetcode.com/problems/single-number/ | integer |
| S12 | L5 | **Power of Two** (LeetCode form of GB1). Is n a power of two? | True ⇔ n>0 and `(n&(n−1))==0`. Ex n=16→**true** (2⁴), n=5→false. | LeetCode 231 "Power of Two" — leetcode.com/problems/power-of-two/ | boolean/bits |
| S13 | L5 | **Number of 1 Bits** (Hamming weight) of n. | count of set bits. Ex n=11=`1011₂`→**3**; n=128→**1**. (Kernighan: repeatedly `n & (n−1)`.) | LeetCode 191 "Number of 1 Bits" — leetcode.com/problems/number-of-1-bits/ | integer |
| S14 | L5 | **XOR swap** — exchange two integers without a temp. | `a^=b; b^=a; a^=b;`. Ex (5,7)→**(7,5)**. | XOR swap algorithm — en.wikipedia.org/wiki/XOR_swap_algorithm | bit-pattern |
| S15 | L6 | **Missing Number.** n distinct numbers from [0,n] with one missing; find it. | **XOR of all indices 0…n with all values.** Ex `[3,0,1]`→**2**; `[9,6,4,2,3,5,7,0,1]`→**8**. | LeetCode 268 "Missing Number" — leetcode.com/problems/missing-number/ | integer |
| S16 | L6 | **Power of Four.** Is n a power of 4? | True ⇔ power of two **and** the single set bit is in an even position. Ex n=16→**true** (4²), n=5→false. | LeetCode 342 "Power of Four" — leetcode.com/problems/power-of-four/ | boolean/bits |
| S17 | L1 | Express 100 in binary; what is 2¹⁰? (drill facts backing the representation lesson) | 100 = `1100100₂`; 2¹⁰ = **1024**. | arithmetic, corroborated across binary-search refs (kirupa, programmerinterview) | bits/integer |
| S18 | L5 | **Reverse Bits** of a 32-bit unsigned integer. | Ex 43261596 (`…11010011100`) → **964176192**. ⚠️ re-confirm the exact example values against the page when authoring. | LeetCode 190 "Reverse Bits" — leetcode.com/problems/reverse-bits/ | bit-pattern |

## Problem → candidate-lesson allocation

≥12 verified problems, mapped so each lesson has a sourced hook, a worked example, a mastery
challenge, and a **held-out transfer** (fresh surface, same method as the mastery challenge).

| lesson | hook / recall | worked / explore | mastery challenge | held-out transfer (fresh surface) |
|--------|---------------|------------------|-------------------|-----------------------------------|
| **L1** Binary representation | S17 (2¹⁰=1024), combinatorics-1 recall | GB6 (1000=`1111101000`), S1 gold rod (1,2,4) | "write N in binary / which powers of 2 sum to N" (GB6) | a different N (e.g. 100=`1100100`, S17) — same "subset-of-powers" method |
| **L2** Bits as information, ⌈log₂N⌉ | S2 (1–100→7), combinatorics-5 pigeonhole recall | S4 (1–1000→10), S3 (1–10⁶→20) | "min yes/no questions for N outcomes = ⌈log₂N⌉" | new N (e.g. 1–500→9) — same ⌈log₂N⌉ method |
| **L3** Group testing / poisoned wine | GB3 / S8 (1000 bottles, 10 mice) | S5/S6 (9 or 8 balls → 2), S7 (2 eggs 100 floors → 14) | "k mice cover up to 2ᵏ bottles; bottle ↔ binary label" | "how many mice for ≤ M bottles" with a new M — same 2ᵏ≥M method |
| **L4** Balance-scale / base-3 | combinatorics-1 (3³=27 coins) recall, GB5 hook | S9 (12 coins → 3), GB5 bound (3ⁿ−3)/2 | "min weighings for N coins, direction unknown" (base-3) | S10 Bachet weights 1,3,9,27 (balanced-ternary surface, same base-3 method) |
| **L5** Bit-manipulation tricks | game-theory-6 nim-sum (XOR) recall | GB1/S12 power-of-2 test, GB2/S14 shift & swap, S13 popcount | S11 Single Number (XOR all) | S16 Power-of-Four / S18 reverse-bits (fresh bit-trick surface) |
| **L6** Synthesis / mixed review | mixed retrieval across S2/S9/S11/GB3 | interleave: 2ⁿ in strings (combo-1) / Pascal rows (combo-3) / Σ2^L (overlap-shortcut) | S15 Missing Number (XOR synthesis) | a binary↔ternary "which encoding?" transfer (GB3 vs GB5 framing) |

## Notes, caveats, and corrections for the Architect

1. **S1 gold rod = 2 cuts, not 3.** The candidate scope said "3 cuts." Every source says **2 cuts →
   3 pieces (1,2,4)**. Author L1 to "2 cuts." (The *3 pieces* are the powers of two 2⁰,2¹,2².)
2. **GB3 vs S8 testers.** GB uses **mice**; Brainstellar uses the same structure. Use the GB framing
   (mice) as primary; S8 is the corroborating quant-puzzle-site citation. The number is **10** either
   way (2¹⁰=1024≥1000).
3. **GB5/S9 give a true GB anchor for the weighing lesson** — better than relying on web sources
   alone. The base-3 lower bound (3ⁿ−3)/2 (unknown direction) / 3ⁿ (known direction) is GB-stated and
   must be engine-reproduced (`weighingsNeeded(n, directionKnown)`).
4. **Engine reproducibility:** every answer here is an exact integer / boolean / bit-pattern, or (GB4)
   a rational p with terminating binary. The Wave-0 `src/engine/binary.ts` must reproduce: `toBinary`,
   `popcount`, `isPowerOfTwo` (`x&(x-1)`), `isPowerOfFour`, `xorAll`, `bitsNeeded`=⌈log₂N⌉,
   `weighingsForN`=⌈log₃(2N+1)⌉, `bachetWeights`, `multiplyByShift`. Goldens = the answers in this
   table (Stage-2 gate, mirroring the bayes/markov/gameTheory self-checks in `validate-fixtures.ts`).
5. **S18 reverse-bits** example values flagged for re-confirmation at the source before locking into a
   fixture. **S16/S18** are optional/secondary surfaces; the core L5 mastery is S11 (Single Number).
