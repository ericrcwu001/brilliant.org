# Interview Pack — Binary & Information (course-binary-information)

> Dormant capstone asset (ADR-0005/0008): committed but NOT seeded or deployed. This is the
> human-readable mirror of the canonical JSON. Regenerate with
> `./node_modules/.bin/tsx /private/tmp/claude-501/-Users-ericwu-Developer-brilliant-org/26af04cc-0576-407e-93ce-03c30cd206e9/scratchpad/render-binary-md.ts`.

**Green Book anchor:** Green Book §7.2 (p.92) + Ch.2 Defective Ball (p.4–5)

**Engine:** `src/engine/binary.ts` (every templated answer is reproduced exactly).

**Counts:** 88 questions — hard 33 / harder 30 / brutal 25; 79 templated, 9 free-form.

## Templates

- **tmpl-binary-repr** — Binary representation of an integer. Write n big-endian in base 2; each set bit is a power of two summing to n.  
  _Source:_ Green Book §7.2 p.92 (GB6, "1000 = 1111101000"); dossier S17.
- **tmpl-powers-subset** — Distinct powers of two summing to n. List the set bits of n as powers of two, largest first (the gold-rod / subset-sum form).  
  _Source:_ Green Book §7.2 p.92 (unique sum of powers of two, GB6); dossier S1.
- **tmpl-bits-needed** — Minimum yes/no questions = ⌈log₂N⌉. Smallest k with 2^k ≥ N: each yes/no answer is one bit, so the worst case needs ⌈log₂N⌉.  
  _Source:_ Green Book §7.2 p.92 (information bound); dossier S2/S3/S4.
- **tmpl-weighings** — Minimum balance weighings (base-3 bound). A balance is ternary: 3^n cases (direction known) or (3^n−3)/2 (unknown); find the smallest n covering N.  
  _Source:_ Green Book Ch.2 p.4–5 (GB5, defective ball); dossier S5/S6/S9.
- **tmpl-popcount** — Hamming weight (number of set bits). Count the 1 bits of n by clearing the lowest set bit repeatedly.  
  _Source:_ Green Book §7.2 p.92 (Kernighan n&(n−1)); dossier S13 (LeetCode 191).
- **tmpl-power-of-two** — Is n a power of two? ((n&(n−1))==0). A power of two has one set bit: n>0 and n&(n−1)==0.  
  _Source:_ Green Book §7.2 p.92 (GB1); dossier S12 (LeetCode 231).
- **tmpl-power-of-four** — Is n a power of four?. A power of two whose single set bit is in an even position (2^0, 2^2, …).  
  _Source:_ Green Book §7.2 p.92 (bit tricks); dossier S16 (LeetCode 342).
- **tmpl-single-number** — Single Number (XOR all). Every value paired except one; XOR all, paired duplicates cancel.  
  _Source:_ Green Book §7.2 p.92 (XOR identity); dossier S11 (LeetCode 136).
- **tmpl-missing-number** — Missing Number (XOR range with values). XOR 0..n with the values; the unmatched index is the missing number.  
  _Source:_ Green Book §7.2 p.92 (XOR synthesis); dossier S15 (LeetCode 268).
- **tmpl-bachet-weights** — Bachet's weights (balanced ternary). Two-pan weights with coefficients {−1,0,+1}: powers of 3 covering 1..maxMass.  
  _Source:_ Green Book Ch.2 (base-3 weighing); dossier S10 (MathWorld "Weighing").
- **tmpl-egg-drops** — 2-egg, F-floor worst-case drops. Smallest x with x(x+1)/2 ≥ floors (decreasing-step strategy, not binary search).  
  _Source:_ Green Book Ch.2 (search bounds); dossier S7 (2 eggs, 100 floors → 14).
- **tmpl-multiply-shift** — Multiply via shift (and optional subtract). x·2^k is x<<k; subtract one copy of x for the ×7 form.  
  _Source:_ Green Book §7.2 p.92 (GB2, 7x = (x<<3)−x); dossier S14.
- **tmpl-balanced-ternary** — Balanced-ternary weight placement. Signed coefficients {−1,0,+1} over descending powers of 3 summing to the target.  
  _Source:_ Green Book Ch.2 (base-3 weighing); dossier S10 (balanced ternary).

## Questions

### Tier: hard (33)

#### tmpl-binary-repr#n-100

- **Prompt:** On the desk we encode order IDs as raw bit-strings. Write the integer 100 in base 2 (big-endian, no leading zeros). What is its binary representation?
- **Answer:** `1100100`
- **Source:** Green Book §7.2 p.92 (binary representation, GB6: "1000 = 1111101000"); dossier S17.
- **Template:** `tmpl-binary-repr`
- **Engine check:** `toBinary(100n) → "1100100"` — verified: true
- **Approaches:** Subtract the largest power of two ≤ n repeatedly, placing a 1 in each consumed position (greedy / repeated halving). / Repeatedly divide by 2 and read the remainders bottom-up, or AND/shift the value bit by bit.
- **Follow-ups:** What is 100 in hexadecimal, reading the binary in nibbles? → How would you recover n from this bit-string, and what does the lowest set bit tell you about divisibility by 2?

#### tmpl-binary-repr#n-73

- **Prompt:** On the desk we encode order IDs as raw bit-strings. Write the integer 73 in base 2 (big-endian, no leading zeros). What is its binary representation?
- **Answer:** `1001001`
- **Source:** Green Book §7.2 p.92 (binary representation, GB6: "1000 = 1111101000"); dossier S17.
- **Template:** `tmpl-binary-repr`
- **Engine check:** `toBinary(73n) → "1001001"` — verified: true
- **Approaches:** Subtract the largest power of two ≤ n repeatedly, placing a 1 in each consumed position (greedy / repeated halving). / Repeatedly divide by 2 and read the remainders bottom-up, or AND/shift the value bit by bit.
- **Follow-ups:** What is 73 in hexadecimal, reading the binary in nibbles? → How would you recover n from this bit-string, and what does the lowest set bit tell you about divisibility by 2?

#### tmpl-binary-repr#n-42

- **Prompt:** On the desk we encode order IDs as raw bit-strings. Write the integer 42 in base 2 (big-endian, no leading zeros). What is its binary representation?
- **Answer:** `101010`
- **Source:** Green Book §7.2 p.92 (binary representation, GB6: "1000 = 1111101000"); dossier S17.
- **Template:** `tmpl-binary-repr`
- **Engine check:** `toBinary(42n) → "101010"` — verified: true
- **Approaches:** Subtract the largest power of two ≤ n repeatedly, placing a 1 in each consumed position (greedy / repeated halving). / Repeatedly divide by 2 and read the remainders bottom-up, or AND/shift the value bit by bit.
- **Follow-ups:** What is 42 in hexadecimal, reading the binary in nibbles? → How would you recover n from this bit-string, and what does the lowest set bit tell you about divisibility by 2?

#### tmpl-powers-subset#n-7

- **Prompt:** A coin tray holds one weight of each power of two (1, 2, 4, 8, …). Using each at most once, which weights sum to exactly 7? List the distinct powers of two (largest first).
- **Answer:** `4+2+1`
- **Source:** Green Book §7.2 p.92 (every integer is a unique sum of distinct powers of two, GB6); dossier S1 (gold-rod).
- **Template:** `tmpl-powers-subset`
- **Engine check:** `powersOfTwo(7n).join("+") → "4+2+1"` — verified: true
- **Approaches:** Greedily take the largest power of two not exceeding the remainder; subtract and repeat. / Write n in binary; each 1 bit names exactly one power of two in the subset.
- **Follow-ups:** If this were a gold rod of 7 units paid out one unit per day, what cut sizes minimize the number of cuts? → Why is this subset of powers of two unique for every positive integer?

#### tmpl-powers-subset#n-23

- **Prompt:** A coin tray holds one weight of each power of two (1, 2, 4, 8, …). Using each at most once, which weights sum to exactly 23? List the distinct powers of two (largest first).
- **Answer:** `16+4+2+1`
- **Source:** Green Book §7.2 p.92 (every integer is a unique sum of distinct powers of two, GB6); dossier S1 (gold-rod).
- **Template:** `tmpl-powers-subset`
- **Engine check:** `powersOfTwo(23n).join("+") → "16+4+2+1"` — verified: true
- **Approaches:** Greedily take the largest power of two not exceeding the remainder; subtract and repeat. / Write n in binary; each 1 bit names exactly one power of two in the subset.
- **Follow-ups:** If this were a gold rod of 23 units paid out one unit per day, what cut sizes minimize the number of cuts? → Why is this subset of powers of two unique for every positive integer?

#### tmpl-powers-subset#n-73

- **Prompt:** A coin tray holds one weight of each power of two (1, 2, 4, 8, …). Using each at most once, which weights sum to exactly 73? List the distinct powers of two (largest first).
- **Answer:** `64+8+1`
- **Source:** Green Book §7.2 p.92 (every integer is a unique sum of distinct powers of two, GB6); dossier S1 (gold-rod).
- **Template:** `tmpl-powers-subset`
- **Engine check:** `powersOfTwo(73n).join("+") → "64+8+1"` — verified: true
- **Approaches:** Greedily take the largest power of two not exceeding the remainder; subtract and repeat. / Write n in binary; each 1 bit names exactly one power of two in the subset.
- **Follow-ups:** If this were a gold rod of 73 units paid out one unit per day, what cut sizes minimize the number of cuts? → Why is this subset of powers of two unique for every positive integer?

#### tmpl-bits-needed#N-100

- **Prompt:** A counterparty picks a secret integer from 1 to 100; each query returns only "higher" or "lower". What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `7`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(100n) → 7` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 100 by doubling 1,2,4,8,… until it reaches or passes 100.
- **Follow-ups:** What if the range were doubled to 200 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-bits-needed#N-52

- **Prompt:** You must pin down one card out of a 52-card deck using only yes/no questions. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `6`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(52n) → 6` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 52 by doubling 1,2,4,8,… until it reaches or passes 52.
- **Follow-ups:** What if the range were doubled to 104 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-bits-needed#N-365

- **Prompt:** You must identify one calendar day of a 365-day year with yes/no questions. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `9`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(365n) → 9` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 365 by doubling 1,2,4,8,… until it reaches or passes 365.
- **Follow-ups:** What if the range were doubled to 730 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-weighings#N-9-dk-true

- **Prompt:** You have 9 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You already know the defective is HEAVIER than the rest. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `2`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(9n, true) → 2` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction known ⇒ smallest n with 3^n ≥ N: multiply 1×3×3… until it reaches N.
- **Follow-ups:** What if you did NOT know whether the defective was heavier or lighter — does 2 still suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-weighings#N-8-dk-true

- **Prompt:** You have 8 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You already know the defective is HEAVIER than the rest. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `2`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(8n, true) → 2` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction known ⇒ smallest n with 3^n ≥ N: multiply 1×3×3… until it reaches N.
- **Follow-ups:** What if you did NOT know whether the defective was heavier or lighter — does 2 still suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-popcount#n-11

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 11 have in binary?
- **Answer:** `3`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(11n) → 3` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 11 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-popcount#n-128

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 128 have in binary?
- **Answer:** `1`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(128n) → 1` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 128 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-popcount#n-255

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 255 have in binary?
- **Answer:** `8`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(255n) → 8` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 255 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-power-of-two#n-16

- **Prompt:** A capacity field must be a power of two for alignment. Is 16 a power of two? Answer true or false and justify with a single bit operation.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (GB1: power-of-two test (x & (x−1))==0); dossier S12 (LeetCode 231).
- **Template:** `tmpl-power-of-two`
- **Engine check:** `isPowerOfTwo(16n) → true` — verified: true
- **Approaches:** A power of two has exactly one set bit, so n > 0 and (n & (n−1)) == 0 iff it is a power of two. / Equivalently, popcount(n) == 1.
- **Follow-ups:** What is the nearest power of two above 16? → How would you adapt the test to detect a power of four?

#### tmpl-power-of-two#n-5

- **Prompt:** A capacity field must be a power of two for alignment. Is 5 a power of two? Answer true or false and justify with a single bit operation.
- **Answer:** `false`
- **Source:** Green Book §7.2 p.92 (GB1: power-of-two test (x & (x−1))==0); dossier S12 (LeetCode 231).
- **Template:** `tmpl-power-of-two`
- **Engine check:** `isPowerOfTwo(5n) → false` — verified: true
- **Approaches:** A power of two has exactly one set bit, so n > 0 and (n & (n−1)) == 0 iff it is a power of two. / Equivalently, popcount(n) == 1.
- **Follow-ups:** What is the nearest power of two above 5? → How would you adapt the test to detect a power of four?

#### tmpl-power-of-two#n-1024

- **Prompt:** A capacity field must be a power of two for alignment. Is 1024 a power of two? Answer true or false and justify with a single bit operation.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (GB1: power-of-two test (x & (x−1))==0); dossier S12 (LeetCode 231).
- **Template:** `tmpl-power-of-two`
- **Engine check:** `isPowerOfTwo(1024n) → true` — verified: true
- **Approaches:** A power of two has exactly one set bit, so n > 0 and (n & (n−1)) == 0 iff it is a power of two. / Equivalently, popcount(n) == 1.
- **Follow-ups:** What is the nearest power of two above 1024? → How would you adapt the test to detect a power of four?

#### tmpl-power-of-four#n-16

- **Prompt:** Is 16 a power of four? Answer true or false and explain the bit condition that distinguishes powers of four from other powers of two.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S16 (Power of Four, LeetCode 342).
- **Template:** `tmpl-power-of-four`
- **Engine check:** `isPowerOfFour(16n) → true` — verified: true
- **Approaches:** A power of four is a power of two whose single set bit sits in an even position (2^0, 2^2, 2^4, …). / Test isPowerOfTwo(n) AND that the bit index is even.
- **Follow-ups:** Is 16 a power of two but not a power of four — and if so, what is the smallest power of four above it? → Generalize the parity-of-position idea to powers of eight.

#### tmpl-power-of-four#n-8

- **Prompt:** Is 8 a power of four? Answer true or false and explain the bit condition that distinguishes powers of four from other powers of two.
- **Answer:** `false`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S16 (Power of Four, LeetCode 342).
- **Template:** `tmpl-power-of-four`
- **Engine check:** `isPowerOfFour(8n) → false` — verified: true
- **Approaches:** A power of four is a power of two whose single set bit sits in an even position (2^0, 2^2, 2^4, …). / Test isPowerOfTwo(n) AND that the bit index is even.
- **Follow-ups:** Is 8 a power of two but not a power of four — and if so, what is the smallest power of four above it? → Generalize the parity-of-position idea to powers of eight.

#### tmpl-power-of-four#n-2

- **Prompt:** Is 2 a power of four? Answer true or false and explain the bit condition that distinguishes powers of four from other powers of two.
- **Answer:** `false`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S16 (Power of Four, LeetCode 342).
- **Template:** `tmpl-power-of-four`
- **Engine check:** `isPowerOfFour(2n) → false` — verified: true
- **Approaches:** A power of four is a power of two whose single set bit sits in an even position (2^0, 2^2, 2^4, …). / Test isPowerOfTwo(n) AND that the bit index is even.
- **Follow-ups:** Is 2 a power of two but not a power of four — and if so, what is the smallest power of four above it? → Generalize the parity-of-position idea to powers of eight.

#### tmpl-single-number#2-2-1

- **Prompt:** Every value in the stream [2, 2, 1] appears exactly twice except one, which appears once. In O(1) extra space, which value is the singleton?
- **Answer:** `1`
- **Source:** Green Book §7.2 p.92 (XOR identity); dossier S11 (Single Number, LeetCode 136).
- **Template:** `tmpl-single-number`
- **Engine check:** `xorAll([2,2,1].map(BigInt)) → 1` — verified: true
- **Approaches:** XOR all the values: each duplicated pair cancels (x ⊕ x = 0), leaving the unique value. / XOR is commutative and associative with identity 0, so order does not matter.
- **Follow-ups:** What if exactly TWO numbers appeared once instead of one — how would you separate them? → What if every number appeared three times except one — does XOR still work?

#### tmpl-single-number#4-1-2-1-2

- **Prompt:** Every value in the stream [4, 1, 2, 1, 2] appears exactly twice except one, which appears once. In O(1) extra space, which value is the singleton?
- **Answer:** `4`
- **Source:** Green Book §7.2 p.92 (XOR identity); dossier S11 (Single Number, LeetCode 136).
- **Template:** `tmpl-single-number`
- **Engine check:** `xorAll([4,1,2,1,2].map(BigInt)) → 4` — verified: true
- **Approaches:** XOR all the values: each duplicated pair cancels (x ⊕ x = 0), leaving the unique value. / XOR is commutative and associative with identity 0, so order does not matter.
- **Follow-ups:** What if exactly TWO numbers appeared once instead of one — how would you separate them? → What if every number appeared three times except one — does XOR still work?

#### tmpl-missing-number#3-0-1

- **Prompt:** The array [3, 0, 1] contains all but one of the integers 0..3. Using only O(1) extra space, which integer is missing?
- **Answer:** `2`
- **Source:** Green Book §7.2 p.92 (XOR synthesis); dossier S15 (Missing Number, LeetCode 268).
- **Template:** `tmpl-missing-number`
- **Engine check:** `missingNumber([3,0,1].map(BigInt)) → 2` — verified: true
- **Approaches:** XOR all indices 0..n with all the array values; every present number cancels and the missing one survives. / Alternatively n(n+1)/2 minus the array sum gives the same answer (exact arithmetic).
- **Follow-ups:** Why is the XOR approach safer than the sum approach for very large n? → What if two numbers were missing — how would the method change?

#### tmpl-missing-number#0-1

- **Prompt:** The array [0, 1] contains all but one of the integers 0..2. Using only O(1) extra space, which integer is missing?
- **Answer:** `2`
- **Source:** Green Book §7.2 p.92 (XOR synthesis); dossier S15 (Missing Number, LeetCode 268).
- **Template:** `tmpl-missing-number`
- **Engine check:** `missingNumber([0,1].map(BigInt)) → 2` — verified: true
- **Approaches:** XOR all indices 0..n with all the array values; every present number cancels and the missing one survives. / Alternatively n(n+1)/2 minus the array sum gives the same answer (exact arithmetic).
- **Follow-ups:** Why is the XOR approach safer than the sum approach for very large n? → What if two numbers were missing — how would the method change?

#### tmpl-egg-drops#f-36

- **Prompt:** You have 2 identical eggs and a 36-floor building; an egg breaks above some unknown safe floor (and survives at or below it). What is the minimum number of drops that guarantees finding the highest safe floor in the worst case?
- **Answer:** `8`
- **Source:** Green Book Ch.2 (search bounds); dossier S7 (2 eggs, 100 floors → 14, GeeksforGeeks).
- **Template:** `tmpl-egg-drops`
- **Engine check:** `eggDrops(36n) → 8` — verified: true
- **Approaches:** With only 2 eggs you cannot binary-search; the first egg must step in a decreasing arithmetic pattern so total worst-case cost stays flat. / Find the smallest x with x(x+1)/2 ≥ 36; that x is the answer.
- **Follow-ups:** What if you had 3 eggs instead of 2 for 36 floors — would the count drop toward log scale? → Why does the decreasing-step strategy equalize the worst case across all break points?

#### tmpl-egg-drops#f-50

- **Prompt:** You have 2 identical eggs and a 50-floor building; an egg breaks above some unknown safe floor (and survives at or below it). What is the minimum number of drops that guarantees finding the highest safe floor in the worst case?
- **Answer:** `10`
- **Source:** Green Book Ch.2 (search bounds); dossier S7 (2 eggs, 100 floors → 14, GeeksforGeeks).
- **Template:** `tmpl-egg-drops`
- **Engine check:** `eggDrops(50n) → 10` — verified: true
- **Approaches:** With only 2 eggs you cannot binary-search; the first egg must step in a decreasing arithmetic pattern so total worst-case cost stays flat. / Find the smallest x with x(x+1)/2 ≥ 50; that x is the answer.
- **Follow-ups:** What if you had 3 eggs instead of 2 for 50 floors — would the count drop toward log scale? → Why does the decreasing-step strategy equalize the worst case across all break points?

#### tmpl-multiply-shift#x-5-k-3-minus

- **Prompt:** Without using the multiplication operator, multiply 5 by 7 using only shifts and one subtraction. What is the result?
- **Answer:** `35`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(5n, 3) - 5n → 35` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 5 << 3 = 5 · 8. / Then subtract one copy of 5: 5·8 − 5 = 5·7.
- **Follow-ups:** How would you multiply 5 by 8 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-multiply-shift#x-12-k-3-minus

- **Prompt:** Without using the multiplication operator, multiply 12 by 7 using only shifts and one subtraction. What is the result?
- **Answer:** `84`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(12n, 3) - 12n → 84` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 12 << 3 = 12 · 8. / Then subtract one copy of 12: 12·8 − 12 = 12·7.
- **Follow-ups:** How would you multiply 12 by 8 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-multiply-shift#x-6-k-4-plain

- **Prompt:** Without using the multiplication operator, multiply 6 by 16 using only a left shift. What is the result?
- **Answer:** `96`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(6n, 4) → 96` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 6 << 4 = 6 · 16. / 16 is a power of two (2^4), so a single shift suffices.
- **Follow-ups:** How would you multiply 6 by 15 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### ff-poison-wine-cap-10

- **Prompt:** In the poisoned-wine setup you are given exactly 10 lab mice (each dies or lives within the deadline). Using the binary-labeling scheme, what is the maximum number of bottles you can screen with one guaranteed-poisoned bottle among them?
- **Answer:** `1024`
- **Source:** Green Book §7.2 p.92 (GB3: 10 mice cover up to 2^10 = 1024 bottles); dossier S8.
- **Engine check:** `1n << 10n → 1024` — verified: true
- **Approaches:** Each mouse contributes one bit (dead/alive), so 10 mice produce 10 bits = 2^10 distinct patterns, each labeling one bottle. / The capacity is 2^(number of mice).
- **Follow-ups:** How many mice would you need to push capacity past one million bottles? → Why is the capacity an exact power of two rather than something smaller?

#### ff-gold-rod-7

- **Prompt:** You hire a worker for 7 days and must pay exactly one unit of gold per day from a single gold rod of 7 units, settling cumulatively each day (you may take change back). To make the fewest cuts, what sizes should the resulting pieces be? List the piece sizes.
- **Answer:** `4+2+1`
- **Source:** Green Book §7.2 p.92 (binary representation); dossier S1 (gold rod of 7, GeeksforGeeks).
- **Engine check:** `powersOfTwo(7n).join("+") → "4+2+1"` — verified: true
- **Approaches:** Every daily cumulative total 1..7 must be a subset sum of the pieces; powers of two (1,2,4) cover all of them with only 2 cuts. / Cut the rod into pieces 1, 2, 4 (two cuts) and pay by exchanging change each day in binary.
- **Follow-ups:** How many cuts for a 15-day rod? A 1000-day rod? → Why does paying in binary let you settle any cumulative total with change?

#### ff-multiply-by-7

- **Prompt:** On hardware where multiplication is expensive but shifts are free, multiply 12 by 7 using only shifts and a single subtraction (no multiply operator). What is the result, and what is the trick?
- **Answer:** `84`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 = (x<<3) − x); dossier S14.
- **Engine check:** `multiplyByShift(12n, 3) - 12n → 84` — verified: true
- **Approaches:** 7x = 8x − x, and 8x is a left shift by 3, so compute (12 << 3) − 12. / Left-shift 12 by 3 to get 96, then subtract 12.
- **Follow-ups:** How would you multiply by 15 or by 9 with shifts and one add/subtract? → When is shift-and-subtract cheaper than shift-and-add for a given multiplier?

#### ff-single-number-classic

- **Prompt:** Given the array [4, 1, 2, 1, 2] where every element appears twice except one, find the single element that appears once — using only constant extra space.
- **Answer:** `4`
- **Source:** Green Book §7.2 p.92 (XOR identity); dossier S11 (Single Number, LeetCode 136).
- **Engine check:** `xorAll([4,1,2,1,2].map(BigInt)) → 4` — verified: true
- **Approaches:** XOR all elements; paired duplicates cancel (x ⊕ x = 0), leaving the unique value. / XOR is associative/commutative with identity 0, so the order is irrelevant.
- **Follow-ups:** What if two elements were unpaired — how would you recover both? → Why is XOR strictly better than sorting here?

### Tier: harder (30)

#### tmpl-binary-repr#n-1000

- **Prompt:** On the desk we encode order IDs as raw bit-strings. Write the integer 1000 in base 2 (big-endian, no leading zeros). What is its binary representation?
- **Answer:** `1111101000`
- **Source:** Green Book §7.2 p.92 (binary representation, GB6: "1000 = 1111101000"); dossier S17.
- **Template:** `tmpl-binary-repr`
- **Engine check:** `toBinary(1000n) → "1111101000"` — verified: true
- **Approaches:** Subtract the largest power of two ≤ n repeatedly, placing a 1 in each consumed position (greedy / repeated halving). / Repeatedly divide by 2 and read the remainders bottom-up, or AND/shift the value bit by bit.
- **Follow-ups:** What is 1000 in hexadecimal, reading the binary in nibbles? → How would you recover n from this bit-string, and what does the lowest set bit tell you about divisibility by 2?

#### tmpl-binary-repr#n-2024

- **Prompt:** On the desk we encode order IDs as raw bit-strings. Write the integer 2024 in base 2 (big-endian, no leading zeros). What is its binary representation?
- **Answer:** `11111101000`
- **Source:** Green Book §7.2 p.92 (binary representation, GB6: "1000 = 1111101000"); dossier S17.
- **Template:** `tmpl-binary-repr`
- **Engine check:** `toBinary(2024n) → "11111101000"` — verified: true
- **Approaches:** Subtract the largest power of two ≤ n repeatedly, placing a 1 in each consumed position (greedy / repeated halving). / Repeatedly divide by 2 and read the remainders bottom-up, or AND/shift the value bit by bit.
- **Follow-ups:** What is 2024 in hexadecimal, reading the binary in nibbles? → How would you recover n from this bit-string, and what does the lowest set bit tell you about divisibility by 2?

#### tmpl-powers-subset#n-90

- **Prompt:** A coin tray holds one weight of each power of two (1, 2, 4, 8, …). Using each at most once, which weights sum to exactly 90? List the distinct powers of two (largest first).
- **Answer:** `64+16+8+2`
- **Source:** Green Book §7.2 p.92 (every integer is a unique sum of distinct powers of two, GB6); dossier S1 (gold-rod).
- **Template:** `tmpl-powers-subset`
- **Engine check:** `powersOfTwo(90n).join("+") → "64+16+8+2"` — verified: true
- **Approaches:** Greedily take the largest power of two not exceeding the remainder; subtract and repeat. / Write n in binary; each 1 bit names exactly one power of two in the subset.
- **Follow-ups:** If this were a gold rod of 90 units paid out one unit per day, what cut sizes minimize the number of cuts? → Why is this subset of powers of two unique for every positive integer?

#### tmpl-powers-subset#n-1000

- **Prompt:** A coin tray holds one weight of each power of two (1, 2, 4, 8, …). Using each at most once, which weights sum to exactly 1000? List the distinct powers of two (largest first).
- **Answer:** `512+256+128+64+32+8`
- **Source:** Green Book §7.2 p.92 (every integer is a unique sum of distinct powers of two, GB6); dossier S1 (gold-rod).
- **Template:** `tmpl-powers-subset`
- **Engine check:** `powersOfTwo(1000n).join("+") → "512+256+128+64+32+8"` — verified: true
- **Approaches:** Greedily take the largest power of two not exceeding the remainder; subtract and repeat. / Write n in binary; each 1 bit names exactly one power of two in the subset.
- **Follow-ups:** If this were a gold rod of 1000 units paid out one unit per day, what cut sizes minimize the number of cuts? → Why is this subset of powers of two unique for every positive integer?

#### tmpl-bits-needed#N-500

- **Prompt:** A secret integer lies in 1..500; each guess returns only higher/lower. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `9`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(500n) → 9` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 500 by doubling 1,2,4,8,… until it reaches or passes 500.
- **Follow-ups:** What if the range were doubled to 1000 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-bits-needed#N-1000

- **Prompt:** A trader hides a price tick in 1..1000; each probe returns only higher/lower. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `10`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(1000n) → 10` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 1000 by doubling 1,2,4,8,… until it reaches or passes 1000.
- **Follow-ups:** What if the range were doubled to 2000 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-bits-needed#N-1025

- **Prompt:** A secret index lies in 1..1025; each query returns only higher/lower. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `11`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(1025n) → 11` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 1025 by doubling 1,2,4,8,… until it reaches or passes 1025.
- **Follow-ups:** What if the range were doubled to 2050 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-weighings#N-27-dk-true

- **Prompt:** You have 27 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You already know the defective is HEAVIER than the rest. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `3`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(27n, true) → 3` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction known ⇒ smallest n with 3^n ≥ N: multiply 1×3×3… until it reaches N.
- **Follow-ups:** What if you did NOT know whether the defective was heavier or lighter — does 3 still suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-weighings#N-12-dk-false

- **Prompt:** You have 12 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You do NOT know whether the defective is heavier or lighter. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `3`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(12n, false) → 3` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction unknown ⇒ smallest n with (3^n − 3)/2 ≥ N, since each item could be heavy or light and you must avoid the degenerate all-same outcome.
- **Follow-ups:** What if you DID know the defective was heavier — would fewer weighings suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-weighings#N-13-dk-false

- **Prompt:** You have 13 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You do NOT know whether the defective is heavier or lighter. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `4`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(13n, false) → 4` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction unknown ⇒ smallest n with (3^n − 3)/2 ≥ N, since each item could be heavy or light and you must avoid the degenerate all-same outcome.
- **Follow-ups:** What if you DID know the defective was heavier — would fewer weighings suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-popcount#n-1000

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 1000 have in binary?
- **Answer:** `6`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(1000n) → 6` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 1000 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-popcount#n-2024

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 2024 have in binary?
- **Answer:** `7`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(2024n) → 7` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 2024 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-power-of-two#n-1000

- **Prompt:** A capacity field must be a power of two for alignment. Is 1000 a power of two? Answer true or false and justify with a single bit operation.
- **Answer:** `false`
- **Source:** Green Book §7.2 p.92 (GB1: power-of-two test (x & (x−1))==0); dossier S12 (LeetCode 231).
- **Template:** `tmpl-power-of-two`
- **Engine check:** `isPowerOfTwo(1000n) → false` — verified: true
- **Approaches:** A power of two has exactly one set bit, so n > 0 and (n & (n−1)) == 0 iff it is a power of two. / Equivalently, popcount(n) == 1.
- **Follow-ups:** What is the nearest power of two above 1000? → How would you adapt the test to detect a power of four?

#### tmpl-power-of-two#n-96

- **Prompt:** A capacity field must be a power of two for alignment. Is 96 a power of two? Answer true or false and justify with a single bit operation.
- **Answer:** `false`
- **Source:** Green Book §7.2 p.92 (GB1: power-of-two test (x & (x−1))==0); dossier S12 (LeetCode 231).
- **Template:** `tmpl-power-of-two`
- **Engine check:** `isPowerOfTwo(96n) → false` — verified: true
- **Approaches:** A power of two has exactly one set bit, so n > 0 and (n & (n−1)) == 0 iff it is a power of two. / Equivalently, popcount(n) == 1.
- **Follow-ups:** What is the nearest power of two above 96? → How would you adapt the test to detect a power of four?

#### tmpl-power-of-four#n-64

- **Prompt:** Is 64 a power of four? Answer true or false and explain the bit condition that distinguishes powers of four from other powers of two.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S16 (Power of Four, LeetCode 342).
- **Template:** `tmpl-power-of-four`
- **Engine check:** `isPowerOfFour(64n) → true` — verified: true
- **Approaches:** A power of four is a power of two whose single set bit sits in an even position (2^0, 2^2, 2^4, …). / Test isPowerOfTwo(n) AND that the bit index is even.
- **Follow-ups:** Is 64 a power of two but not a power of four — and if so, what is the smallest power of four above it? → Generalize the parity-of-position idea to powers of eight.

#### tmpl-power-of-four#n-256

- **Prompt:** Is 256 a power of four? Answer true or false and explain the bit condition that distinguishes powers of four from other powers of two.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S16 (Power of Four, LeetCode 342).
- **Template:** `tmpl-power-of-four`
- **Engine check:** `isPowerOfFour(256n) → true` — verified: true
- **Approaches:** A power of four is a power of two whose single set bit sits in an even position (2^0, 2^2, 2^4, …). / Test isPowerOfTwo(n) AND that the bit index is even.
- **Follow-ups:** Is 256 a power of two but not a power of four — and if so, what is the smallest power of four above it? → Generalize the parity-of-position idea to powers of eight.

#### tmpl-single-number#7-3-7-9-3

- **Prompt:** Every value in the stream [7, 3, 7, 9, 3] appears exactly twice except one, which appears once. In O(1) extra space, which value is the singleton?
- **Answer:** `9`
- **Source:** Green Book §7.2 p.92 (XOR identity); dossier S11 (Single Number, LeetCode 136).
- **Template:** `tmpl-single-number`
- **Engine check:** `xorAll([7,3,7,9,3].map(BigInt)) → 9` — verified: true
- **Approaches:** XOR all the values: each duplicated pair cancels (x ⊕ x = 0), leaving the unique value. / XOR is commutative and associative with identity 0, so order does not matter.
- **Follow-ups:** What if exactly TWO numbers appeared once instead of one — how would you separate them? → What if every number appeared three times except one — does XOR still work?

#### tmpl-single-number#10-10-21

- **Prompt:** Every value in the stream [10, 10, 21] appears exactly twice except one, which appears once. In O(1) extra space, which value is the singleton?
- **Answer:** `21`
- **Source:** Green Book §7.2 p.92 (XOR identity); dossier S11 (Single Number, LeetCode 136).
- **Template:** `tmpl-single-number`
- **Engine check:** `xorAll([10,10,21].map(BigInt)) → 21` — verified: true
- **Approaches:** XOR all the values: each duplicated pair cancels (x ⊕ x = 0), leaving the unique value. / XOR is commutative and associative with identity 0, so order does not matter.
- **Follow-ups:** What if exactly TWO numbers appeared once instead of one — how would you separate them? → What if every number appeared three times except one — does XOR still work?

#### tmpl-missing-number#1-2-3-4-5-0-7

- **Prompt:** The array [1, 2, 3, 4, 5, 0, 7] contains all but one of the integers 0..7. Using only O(1) extra space, which integer is missing?
- **Answer:** `6`
- **Source:** Green Book §7.2 p.92 (XOR synthesis); dossier S15 (Missing Number, LeetCode 268).
- **Template:** `tmpl-missing-number`
- **Engine check:** `missingNumber([1,2,3,4,5,0,7].map(BigInt)) → 6` — verified: true
- **Approaches:** XOR all indices 0..n with all the array values; every present number cancels and the missing one survives. / Alternatively n(n+1)/2 minus the array sum gives the same answer (exact arithmetic).
- **Follow-ups:** Why is the XOR approach safer than the sum approach for very large n? → What if two numbers were missing — how would the method change?

#### tmpl-bachet-weights#m-13

- **Prompt:** On a two-pan balance you may place weights on EITHER pan. What is the smallest set of integer weights that lets you weigh every whole mass from 1 to 13? List them ascending.
- **Answer:** `1,3,9`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (Bachet's weights, MathWorld "Weighing").
- **Template:** `tmpl-bachet-weights`
- **Engine check:** `bachetWeights(13n).join(",") → "1,3,9"` — verified: true
- **Approaches:** Allowing weights on both pans gives each weight a coefficient in {−1,0,+1}, i.e. balanced ternary, so use powers of 3. / Include powers of 3 until (3^k − 1)/2 covers 13.
- **Follow-ups:** How would you weigh a mass of 13 with these weights (which pan does each go on)? → How does this set change if weights may sit on only one pan?

#### tmpl-bachet-weights#m-40

- **Prompt:** On a two-pan balance you may place weights on EITHER pan. What is the smallest set of integer weights that lets you weigh every whole mass from 1 to 40? List them ascending.
- **Answer:** `1,3,9,27`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (Bachet's weights, MathWorld "Weighing").
- **Template:** `tmpl-bachet-weights`
- **Engine check:** `bachetWeights(40n).join(",") → "1,3,9,27"` — verified: true
- **Approaches:** Allowing weights on both pans gives each weight a coefficient in {−1,0,+1}, i.e. balanced ternary, so use powers of 3. / Include powers of 3 until (3^k − 1)/2 covers 40.
- **Follow-ups:** How would you weigh a mass of 22 with these weights (which pan does each go on)? → How does this set change if weights may sit on only one pan?

#### tmpl-egg-drops#f-100

- **Prompt:** You have 2 identical eggs and a 100-floor building; an egg breaks above some unknown safe floor (and survives at or below it). What is the minimum number of drops that guarantees finding the highest safe floor in the worst case?
- **Answer:** `14`
- **Source:** Green Book Ch.2 (search bounds); dossier S7 (2 eggs, 100 floors → 14, GeeksforGeeks).
- **Template:** `tmpl-egg-drops`
- **Engine check:** `eggDrops(100n) → 14` — verified: true
- **Approaches:** With only 2 eggs you cannot binary-search; the first egg must step in a decreasing arithmetic pattern so total worst-case cost stays flat. / Find the smallest x with x(x+1)/2 ≥ 100; that x is the answer.
- **Follow-ups:** What if you had 3 eggs instead of 2 for 100 floors — would the count drop toward log scale? → Why does the decreasing-step strategy equalize the worst case across all break points?

#### tmpl-multiply-shift#x-9-k-3-minus

- **Prompt:** Without using the multiplication operator, multiply 9 by 7 using only shifts and one subtraction. What is the result?
- **Answer:** `63`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(9n, 3) - 9n → 63` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 9 << 3 = 9 · 8. / Then subtract one copy of 9: 9·8 − 9 = 9·7.
- **Follow-ups:** How would you multiply 9 by 8 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-multiply-shift#x-13-k-2-plain

- **Prompt:** Without using the multiplication operator, multiply 13 by 4 using only a left shift. What is the result?
- **Answer:** `52`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(13n, 2) → 52` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 13 << 2 = 13 · 4. / 4 is a power of two (2^2), so a single shift suffices.
- **Follow-ups:** How would you multiply 13 by 3 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-multiply-shift#x-100-k-3-minus

- **Prompt:** Without using the multiplication operator, multiply 100 by 7 using only shifts and one subtraction. What is the result?
- **Answer:** `700`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(100n, 3) - 100n → 700` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 100 << 3 = 100 · 8. / Then subtract one copy of 100: 100·8 − 100 = 100·7.
- **Follow-ups:** How would you multiply 100 by 8 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-balanced-ternary#t-11-w-9-3-1

- **Prompt:** Using Bachet weights 9, 3, 1 on a two-pan balance, you must measure a mass of 11. Give the placement of each weight from highest to lowest, where +1 = weight on the pan OPPOSITE the mass, −1 = weight on the SAME pan as the mass, 0 = weight unused, so that the signed sum of (placement × weight) equals 11.
- **Answer:** `+1,+1,-1`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (balanced ternary, Bachet's weights).
- **Template:** `tmpl-balanced-ternary`
- **Engine check:** `balancedTernary(11n, [9,3,1].map(BigInt)) → "+1,+1,-1"` — verified: true
- **Approaches:** Greedily from the largest weight: assign +1 if it helps reduce a positive remainder, −1 if the remainder is negative, else 0; then subtract its signed contribution. / This is just the balanced-ternary expansion of the target over powers of 3.
- **Follow-ups:** What is the placement for a slightly different mass, say 12? → Why is the balanced-ternary representation over distinct powers of 3 unique?

#### tmpl-balanced-ternary#t-5-w-9-3-1

- **Prompt:** Using Bachet weights 9, 3, 1 on a two-pan balance, you must measure a mass of 5. Give the placement of each weight from highest to lowest, where +1 = weight on the pan OPPOSITE the mass, −1 = weight on the SAME pan as the mass, 0 = weight unused, so that the signed sum of (placement × weight) equals 5.
- **Answer:** `+1,-1,-1`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (balanced ternary, Bachet's weights).
- **Template:** `tmpl-balanced-ternary`
- **Engine check:** `balancedTernary(5n, [9,3,1].map(BigInt)) → "+1,-1,-1"` — verified: true
- **Approaches:** Greedily from the largest weight: assign +1 if it helps reduce a positive remainder, −1 if the remainder is negative, else 0; then subtract its signed contribution. / This is just the balanced-ternary expansion of the target over powers of 3.
- **Follow-ups:** What is the placement for a slightly different mass, say 6? → Why is the balanced-ternary representation over distinct powers of 3 unique?

#### ff-poison-wine-1000

- **Prompt:** You have 1000 bottles of wine and exactly one is poisoned. The poison kills any test animal in about 18 hours, and you have 20 hours before a party. You can use lab mice, each of which you can have sip from any subset of bottles. What is the minimum number of mice that guarantees you identify the poisoned bottle?
- **Answer:** `10`
- **Source:** Green Book §7.2 p.92 (GB3, poisonous wine: label 1000 in 10-bit binary); dossier S8 (Brainstellar #31).
- **Engine check:** `bitsNeeded(1000n) → 10` — verified: true
- **Approaches:** Label the bottles 1..1000 in binary; mouse i drinks from every bottle whose bit i is 1, and the dead/alive pattern across the mice reads off the bottle index. / k mice cover up to 2^k bottles, so you need the smallest k with 2^k ≥ 1000.
- **Follow-ups:** How many bottles could you screen with one more mouse? → How does the decode step recover the exact bottle from the pattern of dead mice?

#### ff-missing-number-classic

- **Prompt:** The array [9, 6, 4, 2, 3, 5, 7, 0, 1] holds all but one of the integers 0..9. Using only constant extra space, which integer is missing?
- **Answer:** `8`
- **Source:** Green Book §7.2 p.92 (XOR synthesis); dossier S15 (Missing Number, LeetCode 268).
- **Engine check:** `missingNumber([9,6,4,2,3,5,7,0,1].map(BigInt)) → 8` — verified: true
- **Approaches:** XOR all indices 0..9 with all array values; matched numbers cancel and the missing one remains. / Or subtract the array sum from 9·10/2 = 45.
- **Follow-ups:** Why prefer XOR over the sum formula for very large ranges? → How would you find two missing numbers instead of one?

#### ff-bachet-40

- **Prompt:** A merchant wants to weigh any whole-number mass from 1 to 40 pounds on a two-pan balance, placing weights on either pan. What is the smallest set of weights that achieves this, and why? List the weights.
- **Answer:** `1,3,9,27`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (Bachet's problem, weights 1,3,9,27).
- **Engine check:** `bachetWeights(40n).join(",") → "1,3,9,27"` — verified: true
- **Approaches:** Each weight may sit with the load, against the load, or off — three states — so use balanced ternary: powers of 3. / (3^4 − 1)/2 = 40, so weights 1, 3, 9, 27 cover exactly 1..40.
- **Follow-ups:** How would you weigh a 22-pound mass with these four weights? → How far does adding an 81-pound weight extend the range?

### Tier: brutal (25)

#### tmpl-binary-repr#n-4096

- **Prompt:** On the desk we encode order IDs as raw bit-strings. Write the integer 4096 in base 2 (big-endian, no leading zeros). What is its binary representation?
- **Answer:** `1000000000000`
- **Source:** Green Book §7.2 p.92 (binary representation, GB6: "1000 = 1111101000"); dossier S17.
- **Template:** `tmpl-binary-repr`
- **Engine check:** `toBinary(4096n) → "1000000000000"` — verified: true
- **Approaches:** Subtract the largest power of two ≤ n repeatedly, placing a 1 in each consumed position (greedy / repeated halving). / Repeatedly divide by 2 and read the remainders bottom-up, or AND/shift the value bit by bit.
- **Follow-ups:** What is 4096 in hexadecimal, reading the binary in nibbles? → How would you recover n from this bit-string, and what does the lowest set bit tell you about divisibility by 2?

#### tmpl-powers-subset#n-2024

- **Prompt:** A coin tray holds one weight of each power of two (1, 2, 4, 8, …). Using each at most once, which weights sum to exactly 2024? List the distinct powers of two (largest first).
- **Answer:** `1024+512+256+128+64+32+8`
- **Source:** Green Book §7.2 p.92 (every integer is a unique sum of distinct powers of two, GB6); dossier S1 (gold-rod).
- **Template:** `tmpl-powers-subset`
- **Engine check:** `powersOfTwo(2024n).join("+") → "1024+512+256+128+64+32+8"` — verified: true
- **Approaches:** Greedily take the largest power of two not exceeding the remainder; subtract and repeat. / Write n in binary; each 1 bit names exactly one power of two in the subset.
- **Follow-ups:** If this were a gold rod of 2024 units paid out one unit per day, what cut sizes minimize the number of cuts? → Why is this subset of powers of two unique for every positive integer?

#### tmpl-bits-needed#N-10000

- **Prompt:** A secret order sits among 10,000 possibilities; each query returns one bit (higher/lower). What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `14`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(10000n) → 14` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 10000 by doubling 1,2,4,8,… until it reaches or passes 10000.
- **Follow-ups:** What if the range were doubled to 20000 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-bits-needed#N-100000

- **Prompt:** You must locate one record among 100,000 with yes/no questions only. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `17`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(100000n) → 17` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 100000 by doubling 1,2,4,8,… until it reaches or passes 100000.
- **Follow-ups:** What if the range were doubled to 200000 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-bits-needed#N-1000000

- **Prompt:** A number lies in 1..1,000,000; each question yields a single higher/lower bit. What is the minimum number of questions that guarantees the answer in the worst case?
- **Answer:** `20`
- **Source:** Green Book §7.2 p.92 (information / bits); dossier S2 (1–100→7), S3 (10^6→20), S4 (1–1000→10).
- **Template:** `tmpl-bits-needed`
- **Engine check:** `bitsNeeded(1000000n) → 20` — verified: true
- **Approaches:** Each yes/no answer is one bit and at best halves the candidate set; the worst case needs ⌈log₂N⌉ bits. / Find the smallest k with 2^k ≥ 1000000 by doubling 1,2,4,8,… until it reaches or passes 1000000.
- **Follow-ups:** What if the range were doubled to 2000000 — how does the count change? → Why is binary search optimal here, and what makes the bound both achievable and unbeatable?

#### tmpl-weighings#N-39-dk-false

- **Prompt:** You have 39 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You do NOT know whether the defective is heavier or lighter. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `4`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(39n, false) → 4` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction unknown ⇒ smallest n with (3^n − 3)/2 ≥ N, since each item could be heavy or light and you must avoid the degenerate all-same outcome.
- **Follow-ups:** What if you DID know the defective was heavier — would fewer weighings suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-weighings#N-120-dk-false

- **Prompt:** You have 120 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You do NOT know whether the defective is heavier or lighter. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `5`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(120n, false) → 5` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction unknown ⇒ smallest n with (3^n − 3)/2 ≥ N, since each item could be heavy or light and you must avoid the degenerate all-same outcome.
- **Follow-ups:** What if you DID know the defective was heavier — would fewer weighings suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-weighings#N-1000-dk-true

- **Prompt:** You have 1000 otherwise-identical coins, exactly one defective, and a two-pan balance (each weighing tells you left<right, balanced, or left>right). You already know the defective is HEAVIER than the rest. What is the minimum number of weighings that guarantees you find the defective in the worst case?
- **Answer:** `7`
- **Source:** Green Book Ch.2 p.4–5 "Defective ball" (GB5, base-3 bound); dossier S5/S6/S9.
- **Template:** `tmpl-weighings`
- **Engine check:** `weighingsForN(1000n, true) → 7` — verified: true
- **Approaches:** A balance gives a base-3 (ternary) answer per weighing, so n weighings distinguish at most 3^n outcomes. / Direction known ⇒ smallest n with 3^n ≥ N: multiply 1×3×3… until it reaches N.
- **Follow-ups:** What if you did NOT know whether the defective was heavier or lighter — does 7 still suffice? → State the general capacity formula and explain why a balance is base-3 rather than base-2.

#### tmpl-popcount#n-65535

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 65535 have in binary?
- **Answer:** `16`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(65535n) → 16` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 65535 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-popcount#n-1000000

- **Prompt:** In a risk bitmask the set bits flag active positions. How many 1 bits (the Hamming weight) does the integer 1000000 have in binary?
- **Answer:** `7`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S13 (Number of 1 Bits, LeetCode 191).
- **Template:** `tmpl-popcount`
- **Engine check:** `popcount(1000000n) → 7` — verified: true
- **Approaches:** Kernighan's trick: repeatedly clear the lowest set bit with n & (n−1) and count the iterations. / Convert to binary and count the 1 digits directly.
- **Follow-ups:** How many trailing zero bits does 1000000 have, and what does that say about the largest power of two dividing it? → Why does n & (n−1) clear precisely the lowest set bit?

#### tmpl-power-of-two#n-4096

- **Prompt:** A capacity field must be a power of two for alignment. Is 4096 a power of two? Answer true or false and justify with a single bit operation.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (GB1: power-of-two test (x & (x−1))==0); dossier S12 (LeetCode 231).
- **Template:** `tmpl-power-of-two`
- **Engine check:** `isPowerOfTwo(4096n) → true` — verified: true
- **Approaches:** A power of two has exactly one set bit, so n > 0 and (n & (n−1)) == 0 iff it is a power of two. / Equivalently, popcount(n) == 1.
- **Follow-ups:** What is the nearest power of two above 4096? → How would you adapt the test to detect a power of four?

#### tmpl-power-of-four#n-1024

- **Prompt:** Is 1024 a power of four? Answer true or false and explain the bit condition that distinguishes powers of four from other powers of two.
- **Answer:** `true`
- **Source:** Green Book §7.2 p.92 (bit tricks); dossier S16 (Power of Four, LeetCode 342).
- **Template:** `tmpl-power-of-four`
- **Engine check:** `isPowerOfFour(1024n) → true` — verified: true
- **Approaches:** A power of four is a power of two whose single set bit sits in an even position (2^0, 2^2, 2^4, …). / Test isPowerOfTwo(n) AND that the bit index is even.
- **Follow-ups:** Is 1024 a power of two but not a power of four — and if so, what is the smallest power of four above it? → Generalize the parity-of-position idea to powers of eight.

#### tmpl-single-number#5-5-8-8-99

- **Prompt:** Every value in the stream [5, 5, 8, 8, 99] appears exactly twice except one, which appears once. In O(1) extra space, which value is the singleton?
- **Answer:** `99`
- **Source:** Green Book §7.2 p.92 (XOR identity); dossier S11 (Single Number, LeetCode 136).
- **Template:** `tmpl-single-number`
- **Engine check:** `xorAll([5,5,8,8,99].map(BigInt)) → 99` — verified: true
- **Approaches:** XOR all the values: each duplicated pair cancels (x ⊕ x = 0), leaving the unique value. / XOR is commutative and associative with identity 0, so order does not matter.
- **Follow-ups:** What if exactly TWO numbers appeared once instead of one — how would you separate them? → What if every number appeared three times except one — does XOR still work?

#### tmpl-missing-number#9-6-4-2-3-5-7-0-1

- **Prompt:** The array [9, 6, 4, 2, 3, 5, 7, 0, 1] contains all but one of the integers 0..9. Using only O(1) extra space, which integer is missing?
- **Answer:** `8`
- **Source:** Green Book §7.2 p.92 (XOR synthesis); dossier S15 (Missing Number, LeetCode 268).
- **Template:** `tmpl-missing-number`
- **Engine check:** `missingNumber([9,6,4,2,3,5,7,0,1].map(BigInt)) → 8` — verified: true
- **Approaches:** XOR all indices 0..n with all the array values; every present number cancels and the missing one survives. / Alternatively n(n+1)/2 minus the array sum gives the same answer (exact arithmetic).
- **Follow-ups:** Why is the XOR approach safer than the sum approach for very large n? → What if two numbers were missing — how would the method change?

#### tmpl-bachet-weights#m-100

- **Prompt:** On a two-pan balance you may place weights on EITHER pan. What is the smallest set of integer weights that lets you weigh every whole mass from 1 to 100? List them ascending.
- **Answer:** `1,3,9,27,81`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (Bachet's weights, MathWorld "Weighing").
- **Template:** `tmpl-bachet-weights`
- **Engine check:** `bachetWeights(100n).join(",") → "1,3,9,27,81"` — verified: true
- **Approaches:** Allowing weights on both pans gives each weight a coefficient in {−1,0,+1}, i.e. balanced ternary, so use powers of 3. / Include powers of 3 until (3^k − 1)/2 covers 100.
- **Follow-ups:** How would you weigh a mass of 22 with these weights (which pan does each go on)? → How does this set change if weights may sit on only one pan?

#### tmpl-bachet-weights#m-364

- **Prompt:** On a two-pan balance you may place weights on EITHER pan. What is the smallest set of integer weights that lets you weigh every whole mass from 1 to 364? List them ascending.
- **Answer:** `1,3,9,27,81,243`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (Bachet's weights, MathWorld "Weighing").
- **Template:** `tmpl-bachet-weights`
- **Engine check:** `bachetWeights(364n).join(",") → "1,3,9,27,81,243"` — verified: true
- **Approaches:** Allowing weights on both pans gives each weight a coefficient in {−1,0,+1}, i.e. balanced ternary, so use powers of 3. / Include powers of 3 until (3^k − 1)/2 covers 364.
- **Follow-ups:** How would you weigh a mass of 22 with these weights (which pan does each go on)? → How does this set change if weights may sit on only one pan?

#### tmpl-egg-drops#f-200

- **Prompt:** You have 2 identical eggs and a 200-floor building; an egg breaks above some unknown safe floor (and survives at or below it). What is the minimum number of drops that guarantees finding the highest safe floor in the worst case?
- **Answer:** `20`
- **Source:** Green Book Ch.2 (search bounds); dossier S7 (2 eggs, 100 floors → 14, GeeksforGeeks).
- **Template:** `tmpl-egg-drops`
- **Engine check:** `eggDrops(200n) → 20` — verified: true
- **Approaches:** With only 2 eggs you cannot binary-search; the first egg must step in a decreasing arithmetic pattern so total worst-case cost stays flat. / Find the smallest x with x(x+1)/2 ≥ 200; that x is the answer.
- **Follow-ups:** What if you had 3 eggs instead of 2 for 200 floors — would the count drop toward log scale? → Why does the decreasing-step strategy equalize the worst case across all break points?

#### tmpl-egg-drops#f-1000

- **Prompt:** You have 2 identical eggs and a 1000-floor building; an egg breaks above some unknown safe floor (and survives at or below it). What is the minimum number of drops that guarantees finding the highest safe floor in the worst case?
- **Answer:** `45`
- **Source:** Green Book Ch.2 (search bounds); dossier S7 (2 eggs, 100 floors → 14, GeeksforGeeks).
- **Template:** `tmpl-egg-drops`
- **Engine check:** `eggDrops(1000n) → 45` — verified: true
- **Approaches:** With only 2 eggs you cannot binary-search; the first egg must step in a decreasing arithmetic pattern so total worst-case cost stays flat. / Find the smallest x with x(x+1)/2 ≥ 1000; that x is the answer.
- **Follow-ups:** What if you had 3 eggs instead of 2 for 1000 floors — would the count drop toward log scale? → Why does the decreasing-step strategy equalize the worst case across all break points?

#### tmpl-multiply-shift#x-25-k-3-minus

- **Prompt:** Without using the multiplication operator, multiply 25 by 7 using only shifts and one subtraction. What is the result?
- **Answer:** `175`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(25n, 3) - 25n → 175` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 25 << 3 = 25 · 8. / Then subtract one copy of 25: 25·8 − 25 = 25·7.
- **Follow-ups:** How would you multiply 25 by 8 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-multiply-shift#x-7-k-5-plain

- **Prompt:** Without using the multiplication operator, multiply 7 by 32 using only a left shift. What is the result?
- **Answer:** `224`
- **Source:** Green Book §7.2 p.92 (GB2: multiply by 7 as (x<<3)−x); dossier S14 (shift tricks).
- **Template:** `tmpl-multiply-shift`
- **Engine check:** `multiplyByShift(7n, 5) → 224` — verified: true
- **Approaches:** A left shift by k multiplies by 2^k: 7 << 5 = 7 · 32. / 32 is a power of two (2^5), so a single shift suffices.
- **Follow-ups:** How would you multiply 7 by 31 using shifts and add/subtract? → Generalize: which multipliers are cheapest in shifts-and-adds?

#### tmpl-balanced-ternary#t-22-w-27-9-3-1

- **Prompt:** Using Bachet weights 27, 9, 3, 1 on a two-pan balance, you must measure a mass of 22. Give the placement of each weight from highest to lowest, where +1 = weight on the pan OPPOSITE the mass, −1 = weight on the SAME pan as the mass, 0 = weight unused, so that the signed sum of (placement × weight) equals 22.
- **Answer:** `+1,-1,+1,+1`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (balanced ternary, Bachet's weights).
- **Template:** `tmpl-balanced-ternary`
- **Engine check:** `balancedTernary(22n, [27,9,3,1].map(BigInt)) → "+1,-1,+1,+1"` — verified: true
- **Approaches:** Greedily from the largest weight: assign +1 if it helps reduce a positive remainder, −1 if the remainder is negative, else 0; then subtract its signed contribution. / This is just the balanced-ternary expansion of the target over powers of 3.
- **Follow-ups:** What is the placement for a slightly different mass, say 23? → Why is the balanced-ternary representation over distinct powers of 3 unique?

#### tmpl-balanced-ternary#t-30-w-27-9-3-1

- **Prompt:** Using Bachet weights 27, 9, 3, 1 on a two-pan balance, you must measure a mass of 30. Give the placement of each weight from highest to lowest, where +1 = weight on the pan OPPOSITE the mass, −1 = weight on the SAME pan as the mass, 0 = weight unused, so that the signed sum of (placement × weight) equals 30.
- **Answer:** `+1,0,+1,0`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (balanced ternary, Bachet's weights).
- **Template:** `tmpl-balanced-ternary`
- **Engine check:** `balancedTernary(30n, [27,9,3,1].map(BigInt)) → "+1,0,+1,0"` — verified: true
- **Approaches:** Greedily from the largest weight: assign +1 if it helps reduce a positive remainder, −1 if the remainder is negative, else 0; then subtract its signed contribution. / This is just the balanced-ternary expansion of the target over powers of 3.
- **Follow-ups:** What is the placement for a slightly different mass, say 31? → Why is the balanced-ternary representation over distinct powers of 3 unique?

#### tmpl-balanced-ternary#t-13-w-27-9-3-1

- **Prompt:** Using Bachet weights 27, 9, 3, 1 on a two-pan balance, you must measure a mass of 13. Give the placement of each weight from highest to lowest, where +1 = weight on the pan OPPOSITE the mass, −1 = weight on the SAME pan as the mass, 0 = weight unused, so that the signed sum of (placement × weight) equals 13.
- **Answer:** `0,+1,+1,+1`
- **Source:** Green Book Ch.2 (base-3 weighing); dossier S10 (balanced ternary, Bachet's weights).
- **Template:** `tmpl-balanced-ternary`
- **Engine check:** `balancedTernary(13n, [27,9,3,1].map(BigInt)) → "0,+1,+1,+1"` — verified: true
- **Approaches:** Greedily from the largest weight: assign +1 if it helps reduce a positive remainder, −1 if the remainder is negative, else 0; then subtract its signed contribution. / This is just the balanced-ternary expansion of the target over powers of 3.
- **Follow-ups:** What is the placement for a slightly different mass, say 14? → Why is the balanced-ternary representation over distinct powers of 3 unique?

#### ff-twelve-coins-dir-unknown

- **Prompt:** You have 12 identical-looking coins; exactly one is counterfeit and is either heavier OR lighter (you do not know which). With a two-pan balance, what is the minimum number of weighings that guarantees you both find the fake AND determine whether it is heavy or light?
- **Answer:** `3`
- **Source:** Green Book Ch.2 p.4–5 (GB5, defective ball, unknown direction); dossier S9 (Wikipedia balance puzzle).
- **Engine check:** `weighingsForN(12n, false) → 3` — verified: true
- **Approaches:** A balance gives a ternary outcome; with direction unknown, n weighings distinguish (3^n − 3)/2 candidates, and (3^3 − 3)/2 = 12 ≥ 12. / Split into three groups of four and let the 3-way outcomes form base-3 digits.
- **Follow-ups:** What is the largest number of coins you could handle in 3 weighings under the unknown-direction rule? → If you also had one extra known-good reference coin, how many coins could you handle in 3 weighings?

#### ff-fair-coin-third

- **Prompt:** Using only a fair coin, design a procedure that triggers an event with probability exactly 1/3. Reading the binary expansion of 1/3 and tossing the coin to generate bits (H=1, T=0), what are the first 8 bits of that expansion (as "0.b1...b8")?
- **Answer:** `0.01010101`
- **Source:** Green Book §7.2 p.92 (GB4, simulate probability p via binary expansion of p).
- **Engine check:** `binaryExpansion({n:1,d:3}, 8) → "0.01010101"` — verified: true
- **Approaches:** Write p = 1/3 in binary by repeatedly doubling the remainder: 1/3 = 0.010101… (period "01"). / Toss the coin to generate bits; at the first index where your bit differs from the p-bit, win iff your bit is smaller — the expansion drives the comparison.
- **Follow-ups:** What is the probability that this procedure terminates within the first 8 tosses? → How would the bit pattern differ if you wanted probability 1/4 instead?

