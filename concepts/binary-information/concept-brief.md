# Concept: Binary & Information  (course-binary-information)

## Green Book anchor
- **§7.2 "The Power of Two"** — Green Book (Xinfeng Zhou, *A Practical Guide To Quantitative Finance
  Interviews*), **p.92**. The spine: binary representation (1000 = `1111101000₂` = a sum of distinct
  powers of 2), the **power-of-2 test** `(x&(x-1))==0`, **multiply-by-shift** `(x<<3)−x` = 7x, the
  **poisoned-wine** group-testing problem (1000 bottles, 10 mice, binary labels), and the
  **fair-coin probability simulation** (a probability written in binary, simulated bit-by-bit).
- **Ch.2 "Brain Teasers" — "Defective ball," p.4–5.** 12 balls, one heavier-or-lighter, find it in
  **3 weighings**; the GB-stated base-3 bound is "(3ⁿ−3)/2 balls in n weighings" (direction unknown).
  This anchors the balance-scale / base-3 information lesson.
- *Why legitimate to teach:* §7.2 is a named GB section explicitly about using binary as an
  interview tool ("binary representation of numbers gives some topics to test in interviews"); the
  defective-ball problem is GB-flagged as "another classic brain teaser still being asked." Full
  sourcing, exact quotes, stated answers, and the corrections (gold rod = **2** cuts not 3) live in
  `source-dossier.md`. The de-duplication vs the existing corpus lives in `continuity-report.md`.

## One-line promise
**A *bit* is one yes/no answer; stack n of them and you can name 2ⁿ things — so any question with N
possible answers needs at least ⌈log₂N⌉ bits to settle, and the cleverness is in *encoding* the
world so each test pays off a full bit.**

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)
- **domain:** `Algorithms & Information`  *(NEW domain — see arbitration flag below)*
- **domainOrder:** `2`  (after Probability=0 and Combinatorics & Games=1; the only two domains today)
- **order:** `0`  (first concept in the new domain)
- **status:** `live`
- **tagline:** `Every number is bits — and bits are information.`  (47 chars ≤ 60)
- **accent:** `ch5`  (distinct from the four existing Probability/Games accents on the macro shelf)
- **vizKey:** `sum`  (closest valid `MathVizKind`: a number as a **sum of powers of 2**; see flag #2)
- **completionMilestoneId:** `binary-information-complete`
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-binary-information-1 | Numbers as Bits | ch5 | [lesson-binary-information-1, lesson-binary-information-2] |
| ch-binary-information-2 | Tests as Information | ch1 | [lesson-binary-information-3, lesson-binary-information-4] |
| ch-binary-information-3 | Bit Tricks & Synthesis | ch3 | [lesson-binary-information-5, lesson-binary-information-6] |

> Coverage check: the three chapters cover **all six** built lessonIds exactly once
> (`-1,-2 | -3,-4 | -5,-6`), satisfying the mechanized chapters-coverage gate in
> `validate-fixtures.ts §7`. (`chapters.ts` resolves only ch1–ch4 to Konva hexes today; the per-card
> `accent` enum is ch1–ch5. ch5 already ships on `course-combinatorics`, so it is safe.)

## Lessons (ordered)

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | milestoneId | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|-------------|----------------|
| L1 | lesson-binary-information-1 | Every Number Is Bits | Every integer is a **unique sum of distinct powers of 2**; reading/writing that binary label is the whole game. | — | 2ⁿ | sum | binary-information-representation | GB §7.2 p.92 (1000=`1111101000`); S1 gold rod (1,2,4); recalls combinatorics-1 (2ⁿ strings) |
| L2 | lesson-binary-information-2 | Bits as Information | One bit = one yes/no answer; n bits name 2ⁿ outcomes, so distinguishing N things needs **≥ ⌈log₂N⌉** bits (a pigeonhole floor). | L1 | log₂ | sum | binary-information-bound | S2 (1–100→7), S4 (1–1000→10), S3 (1–10⁶→20); recalls combinatorics-5 (pigeonhole) |
| L3 | lesson-binary-information-3 | Group Testing (Poisoned Wine) | One **parallel** test per bit: k testers, binary-labelled items, read the result pattern as a number — 2ᵏ items per k tests. | L2 | 🐭 | sum | binary-information-grouptest | **GB §7.2 p.92 poisoned wine** (1000 bottles, 10 mice); S5/S6 (8–9 balls→2); S7 (2 eggs→14) |
| L4 | lesson-binary-information-4 | The Scale Speaks Base-3 | A balance answers in **three** ways (left/right/balance), so each weighing is a base-3 digit: ⌈log₃·⌉ weighings, not ⌈log₂·⌉. | L3 | ⚖ | dice | binary-information-base3 | **GB Ch.2 p.4–5 defective ball** (12→3, (3ⁿ−3)/2); S9 (12 coins→3); S10 Bachet 1,3,9,27 |
| L5 | lesson-binary-information-5 | Bit Tricks | Bitwise ops act per-bit, in parallel: `x&(x-1)` clears the lowest bit (power-of-2 test, popcount), `<<` doubles, **XOR** is no-carry parity. | L4 | & | coin | binary-information-bittricks | **GB §7.2 p.92** `(x&(x-1))==0`, `(x<<3)−x`; S11 single-number; S13 popcount; recalls game-theory-6 (XOR/Nim) |
| L6 | lesson-binary-information-6 | Encoding the Answer | Mixed review: pick the right encoding (binary test vs base-3 weighing vs XOR) and read information off it — 2ⁿ shows up everywhere. | L5 | Σ | sum | binary-information-synthesis | S15 missing-number (XOR); interleaves S2/S9/S11 + combinatorics-1/-3 & overlap-shortcut (Σ2^L) |

> `glyphKey` is free-form (falls back to `·`). Per-lesson `vizKey` must be in
> {coin, stateMachine, raceLanes, randomWalk, twoNode, fourNode, sum, dice} (else falls back to
> `coin`); `sum` (number-as-sum-of-powers) is the best fit for L1–L3/L6, `dice` reads as the 3-way
> scale for L4, `coin` (heads/tails = 1 bit) fits L5. **No new MathViz key is required** — but see
> flag #2 for the Manager's option to add a `bits` viz.

## Concept arc (Bet → Explore → Model → Prove, across lessons)
- **Ch1 Numbers as Bits** — *representation first.* **L1** (Bet: "how few gold-bar pieces pay 7
  days?") grounds binary as a **subset of powers of two** before any logarithm. **L2** inverts it:
  given N outcomes, how many bits *must* you spend? — the **⌈log₂N⌉ lower bound**, proved by recalling
  pigeonhole (2ᵏ boxes can't hold N>2ᵏ distinct labels).
- **Ch2 Tests as Information** — *each test should buy a full bit.* **L3** makes the bit physical:
  one tester per bit position, all tests run in parallel (poisoned wine). **L4** changes the alphabet:
  a balance speaks **base-3**, so the bound becomes ⌈log₃·⌉ — the L3↔L4 base-2-vs-base-3 interleave.
- **Ch3 Bit Tricks & Synthesis** — *operate on bits directly, then choose the encoding.* **L5**
  teaches the GB bitwise tricks (recalling Nim's XOR as the hook). **L6** is mixed review: a held-out
  transfer that forces the learner to *choose* the encoding and shows 2ⁿ recurring across the corpus.

## New engine(s) / widget(s) anticipated (for Wave 0)

### Engine — `src/engine/binary.ts` (pure, exact: integers / `bigint` / `{n,d}` rationals; **NO floats**)
All answers in `source-dossier.md` are exact, so the engine is exact-arithmetic. Proposed signatures
(goldens = the dossier table; cross-checked in `validate-fixtures.ts` like the combinatorics/EV
self-checks):
- `toBinary(n: bigint): string` and `fromBinary(s): bigint` — 1000 → `"1111101000"`.
- `powersOfTwo(n: bigint): bigint[]` — the distinct powers summing to n (the subset).
- `popcount(n: bigint): number` — set-bit count (Kernighan `n&(n-1)`); 11 → 3.
- `isPowerOfTwo(n: bigint): boolean` — `n>0 && (n&(n-1n))===0n`.
- `isPowerOfFour(n: bigint): boolean`.
- `xorAll(xs: bigint[]): bigint` — single-number / missing-number.
- `multiplyByShift(x, k): bigint` — `(x<<k)` and the `(x<<3)-x = 7x` identity.
- `bitsNeeded(N: bigint): number` — ⌈log₂N⌉ (exact, via repeated doubling — no `Math.log`).
- `weighingsForN(N: bigint, directionKnown: boolean): number` — ⌈log₃ N⌉ / smallest n with
  (3ⁿ−3)/2 ≥ N (GB5 bound).
- `bachetWeights(maxMass: bigint): bigint[]` — powers of 3 (balanced ternary); 40 → `[1,3,9,27]`.
- `simulateProbability(p: {n,d}): string` — GB4 binary expansion of a rational p (for the fair-coin sim).

### Interaction type(s) — reuse-first against the 38 existing types

**Strong reuse (no new build), per the Continuity Report's recall plan:**
- `retrievalGrid` — every lesson's graded opener (combinatorics/Nim recall) + L6 interleave grid.
- `prediction` — the byOption "bet" beats (e.g. "how many mice?").
- `primer` — JIT cards (a `bit`/`log₂`/`ternary` framing); use `variant:'custom'` (the enum already
  allows `'custom'`) — **no schema change needed**.
- `answerEntry` / `masteryChallenge` — every typed exact answer + the required end-of-lesson capstone
  and the held-out transfer (`required:false track:'B' heldOut:true`, placed **before** the mastery
  challenge per spec-24). *(Note: `heldOut` is not yet a `BeatSchema` field — see flag #3.)*
- `recap` — closers.
- `countingTree` (combinatorics) — reusable for L2's "n bits → 2ⁿ" doubling fan-out (binary tree).
- `sumTiles` (PHT/overlap) — reusable for L1's "build N from power-of-2 tiles" (chips = powers of 2,
  running sum snaps to N). **This is the single best reuse: it already exists and *is* the L1 model.**

**Proposed NEW types — 2 (mirroring the `chainBoard`/`payoffMatrix` precedent: one type folding
several `display`s; NOT in `GRADED_TYPES`/`HERO_TYPES`; carries an engine-reproducible `headline`
cross-checked by `validate-fixtures.ts`; Firestore-safe, no directly-nested arrays):**

1. `bitBoard` — *a row of toggleable bits* with `display` folding the binary-information presentations:
   - `'register'` — toggle bits to build/read a number (L1 representation; L5 mask `x&(x-1)`, shift,
     XOR shown as bit rows).
   - `'questions'` — the ⌈log₂N⌉ yes/no halving game; each answer fixes one bit (L2).
   - `'groupTest'` — the poisoned-wine grid: items as columns labelled in binary, testers as rows;
     light up the dead/alive pattern → read the index (L3).
   Shape sketch: `{ type:'bitBoard', display, bits?, value?, n?, items?, headline? }` — `headline` is
   the engine-reproducible answer (`toBinary`/`bitsNeeded`/the recovered index). Renderer:
   `BitBoardBeat.tsx`; engine dep: `binary.ts`.

2. `weighing` — *a two-pan balance* the learner loads and reads (L4):
   - `display:'scale'` — drag coins onto pans; the 3-way tilt is a base-3 digit; a weighings counter.
   - `display:'ternary'` — the Bachet number-line (place ±weights to balance a mass).
   Shape sketch: `{ type:'weighing', display, coins?, weights?, target?, headline? }` — `headline`
   = `weighingsForN(...)` or the balanced-ternary digits. Renderer: `WeighingBeat.tsx`; engine: `binary.ts`.

> **Reuse-first verdict:** `sumTiles` + `countingTree` + `retrievalGrid` cover L1/L2/L6 with **zero**
> new widgets if the Manager wants a minimal build; `bitBoard` is the one widget that genuinely pays
> for itself (it carries L1 register / L2 questions / L3 group-test). `weighing` (L4) is the second.
> Two new types total — fewer than combinatorics (7) or markov (1-but-heavy). Final count frozen by
> Dept-2/Dept-3 in Wave 0.

## Reuse (no new build)
`retrievalGrid`, `prediction`, `primer` (variant `custom`), `answerEntry`, `masteryChallenge`,
`recap`, `sumTiles` (L1 model = power-of-2 tiles), `countingTree` (L2 doubling tree). XOR/Nim is
*recalled* from `game-theory-6`'s `nimBoard`, not rebuilt; pigeonhole is *recalled* from
`combinatorics-5`, not rebuilt.

## Wave-0 wiring the build wave MUST do (or gates pass vacuously / break)
1. Add all six `lesson-binary-information-1..6` to **`GATED`** and **`MASTERY_LESSONS`** in
   `scripts/validate-fixtures.ts` (else the inclusivity + mastery gates skip them silently).
2. Add `bitBoard` / `weighing` to `InteractionSchema` (discriminated union) + a `BeatView` dispatch
   case each in `src/lesson/beats/index.tsx`; add an engine cross-check block for their `headline`s.
3. If `sumTiles`/`countingTree` are graded in this concept, confirm their `GRADED_TYPES` membership
   (countingTree already gated-by-`accept`; sumTiles is currently ungraded — keep it ungraded/explore).
4. Add the six lessonIds to `chapters.ts`'s `LESSON_CHAPTER` (ch5/ch1/ch3 per the chapters table) so
   the lesson shell resolves an accent hex (only ch1–ch4 have hexes today — see flag #1).
5. Author `src/engine/binary.ts` + `binary.test.ts` goldens reproducing every `source-dossier.md`
   answer (Stage-2 math gate).

## Decisions for the Manager to arbitrate
1. **NEW domain "Algorithms & Information" (domainOrder 2)** vs folding into "Combinatorics & Games"
   (order 3, domain renamed). *Recommendation: NEW domain.* Bits/encoding/search is conceptually a
   third pillar, not counting or games; it reads cleanly as the macro shelf's third row. Cost: the
   first concept in a one-concept domain (acceptable — future Cryptography/Coding-Theory land here).
   ⚠️ Also: `chapters.ts` `CHAPTER_HEX` only defines ch1–ch4; **ch5** has no Konva hex. Either add a
   ch5 hex token or assign chapter accents from {ch1,ch2,ch3,ch4} only. (The *card* `accent:'ch5'` is
   fine — `course-combinatorics` already uses it.)
2. **vizKey.** No existing key means "bits." `sum` (number = Σ powers of 2) is the honest closest
   match and is used per-card + per-lesson. *Option:* add a new `bits` `MathVizKind` (a row of 0/1
   cells) — a small Dept-2 addition that would make the catalog card unmistakable. Flagging the call.
3. **`heldOut` field (spec-24).** The held-out-transfer gate references `heldOut:true` on a beat, but
   the **committed** `BeatSchema` has no `heldOut` field (nor `schemaId`/methods — confirmed absent,
   per the hard constraint). For this build, author the transfer as a `track:'B' required:false`
   `answerEntry` placed immediately before the mastery challenge with a fresh surface; the
   `heldOut`/`REQUIRE_TRANSFER` machinery is a future state, not on our branch. Confirm the Manager
   wants the spec-24 *shape* (B-track, required:false, before mastery) without the unmodeled field.
4. **L1 scope correction:** the gold-rod puzzle is **2 cuts → pieces 1,2,4** (not 3 cuts). Locked in
   the dossier; flagging so downstream copy doesn't reintroduce "3 cuts."
