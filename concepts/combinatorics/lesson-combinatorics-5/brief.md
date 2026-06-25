# Lesson Brief: The Pigeon Hole Principle  (lesson-combinatorics-5)

## Hook  (the bet)
"It's pitch dark. Your drawer holds **2 red, 20 yellow, and 31 blue** socks. You grab socks one at
a time — how many must you pull to be *certain* you're holding a matching pair? 20? 32? Half of
them?" The pile sizes beg you to think big, but the answer is a tiny **4**. With only **3 colors**
to land in, a 4th sock has nowhere new to go — two must share a color. The bet ("surely the big
piles matter") sets up the lesson's engine: stop counting *how many ways* and start counting *what's
guaranteed* — with more pigeons than holes, some hole must hold two.

## Core promise (one idea)
If you drop **N items (pigeons) into H containers (holes)** and `N > H`, at least one container holds
≥2 — and in general some hole must hold at least `⌈N/H⌉`. This is *existence* counting: you don't
enumerate the arrangements, you prove one must exist.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `n+1`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Matching socks: dark drawer of 2 red / 20 yellow / 31 blue; minimum socks grabbed to **guarantee** a same-color pair | **4** — 3 colors = 3 holes, so `holes + 1 = 4` socks force two into one color (3 socks can still be all-different) | Green Book p.11 §2.6 ("3 colors (3 pigeon holes) … 3+1 = 4 socks (4 pigeons) to guarantee … at least two socks have the same color") | ☑ engine ☑ source |
| Handshakes: welcome party of **you + 25 members = 26 people**; everyone shakes your hand. Must two people have shaken the *same number* of hands? | **Yes** — each person's count lies in `{1, …, 25}` (25 holes); 26 people (pigeons) and `26 > 25` forces a tie | Green Book p.11 §2.6 ("26 pigeons and 25 holes … at least two people must have shaken hands with exactly the same number of people") | ☑ engine ☑ source |
| Ants on a square: **51 ants** on a unit square; can a glass of radius `1/7` always be placed to cover **≥3** ants? | **Yes** — cut the square into a `5 × 5 = 25`-region grid (holes); `⌈51/25⌉ = 3` ⇒ some region holds ≥3 ants, and radius `1/7` covers a side-`1/5` square | Green Book p.12 §2.6 ("separate the square into 25 smaller areas … at least one of the areas must have at least 3 ants") | ☑ engine ☑ source |
| Counterfeit coins II (9 sums into 7 holes): 1 coin from bag 1 + 2 coins from bag 2 give `3 × 3 = 9` weight combos whose sums span `−3 … 3` | **Collision forced** — 9 combos (pigeons) into 7 possible sums (holes); `9 > 7` ⇒ two combos share a sum and can't be told apart (so 2 coins are too few) | Green Book p.12 §2.6 ("sum … ranges from −3 to 3 (7 pigeon holes) … 9 (3×3) … at least two … same final sum") | ☑ engine ☑ source |

> Every verdict is exact-integer reproducible by `src/engine/combinatorics.ts`
> (`pigeonholeMin(items,holes) = ⌈items/holes⌉`, `forcesCollision(items,holes) = items > holes`):
> socks `forcesCollision(4,3) = true` vs `forcesCollision(3,3) = false` (threshold `4 = holes+1`);
> handshakes `forcesCollision(26,25) = true`; ants `pigeonholeMin(51,25) = 3`; coins
> `forcesCollision(9,7) = true`. No `⚠️ NEEDS-WEB-SOURCE` rows — every problem is Green-Book-anchored
> (GB §2.6, p.11–12).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l5-recall` | Retrieval opener: recall **L1** "count the ways" (multiply) and **L2** `nCk` selection, then pivot to *existence* | counting *enumerates* outcomes; pigeonhole *guarantees* one — a different question | "every counting question asks 'how many ways'" (vs "what must occur") | yes (light) | both |
| 2 | `l5-bet` | The bet (prediction hook): the dark sock drawer | the answer is `holes + 1`, set by the # of colors — not the pile sizes | **anchor on the big piles (20 / 31 / "half")** — only the count of colors matters | no | both |
| 3 | `l5-win` | Guaranteed early win: 3 colors ⇒ 4 socks | `holes + 1` forces a repeat (`answerEntry`, accept `4`) | "more socks in a pile ⇒ need to grab more" — refuted; only colors (holes) count | yes | both |
| 4 | `l5-explore` | Explore (direct manipulation): feel the forced collision | `pigeonholeBoard`: drag socks into 3 color-boxes; the 4th drop *must* double up, highlighting the collision | "if I'm careful I can always avoid a repeat" — refuted live | no | both |
| 5 | `l5-model` | Model: generalize to N pigeons into H holes | `N > H` ⇒ a repeat; in general some hole holds ≥ `⌈N/H⌉` | "pigeonhole only ever gives *two* in one hole" — refuted; `⌈N/H⌉` can be ≥3 | no | both |
| 6 | `l5-apply` | Interleave (graded check): **construct the holes** — handshakes | the holes are the *possible counts* `{1..25}`; `26 > 25` ⇒ two people tie | **can't see what the "holes" are** when they aren't handed to you | yes (check) | both |
| 7 | `l5-prove` | Prove / mastery challenge (required, `masteryChallenge`): ants on a square | partition into `25` regions; `⌈51/25⌉ = 3` ⇒ some region holds ≥3 ants | "51 ants over a big square can just spread out evenly" — refuted by `⌈N/H⌉` | yes (required) | both |
| 8 | `l5-recap` | Recap: counting *what's guaranteed* — pigeons, holes, `⌈N/H⌉`; contrast existence vs enumeration | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **Anchor on the big piles ("20 / 32 / half")** → `l5-bet`, `l5-win` → Pile sizes are decoys; only the 3 **colors** are holes, so `holes+1 = 4` socks force a match.
2. **"If I'm careful I can avoid a repeat"** → `l5-explore`, `l5-win` → After one sock per color, the next has nowhere new to land — the collision is *forced*, not a matter of care.
3. **"Pigeonhole only ever puts two in a hole"** → `l5-model`, `l5-prove` → With `N ≫ H` some hole holds `⌈N/H⌉`; 51 ants in 25 regions force **≥3**, not 2.
4. **Can't see what the "holes" are** when not handed them → `l5-apply`, `l5-prove` → Holes are the *possible values* — handshake counts `{1..25}`, or 25 grid regions — not the people/ants.
5. **"Counting always means 'how many ways'"** (enumeration vs existence) → `l5-recall`, `l5-bet` → Pigeonhole proves something *must exist*; it never enumerates, so don't reach for multiply or `nCk`.

**Per-option feedback** (✓ = `feedback.correct`; ✗ distractor notes → refutational `hints[0]` for `answerEntry`/`masteryChallenge`):
- `l5-bet` (prediction): ✓ "4 socks" → "Good instinct — let's prove it: with only 3 colors, a 4th sock has to match." · ✗ "20 socks" → "Let's test it — that's just the yellow pile, and pile size won't decide the answer." · ✗ "32 socks" → "Let's test it — anchoring on the biggest pile overshoots; the colors are what matter." · ✗ "About half (~27)" → "Let's test it — you'll need far fewer than half once you count colors."
- `l5-win` (answerEntry, accept `4`): ✓ "Exactly — 3 colors are 3 holes, so 4 socks force two to match. Pile sizes never mattered." · ✗ `hints[0]` → "Tempting to use 20 or 31 — but pile size is a decoy. Count the *colors*: that's the number of holes."
- `l5-apply` (check — construct the holes, handshakes 26/25): ✓ "Yes — 26 people into 25 count-slots {1..25}; 26 > 25 forces two to share a number." · ✗ `hints[0]` → "Don't count people (the pigeons) — the holes are the 25 possible handshake counts {1..25}."
- `l5-prove` (mastery, accept `3`): ✓ "Exactly — 25 regions, ⌈51/25⌉ = 3, so some region holds ≥3 ants; a radius-1/7 glass covers it." · ✗ `hints[0]` → "Even perfectly spread, 51 ants can't fit ≤2 per region: 25×2=50<51. Some region is forced to 3."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** L1 "count the ways" (multiplication) AND L2 `nCk` → `l5-recall` (graded `retrievalGrid` matching {independent choices → multiply, choose `k` of `n` → `nCk`} — the two "*how many ways*" modes — then **pivot to existence**: a third question asking *what must occur*). Wires Continuity-Report bridge #3 (the implicit "count the ways"), here retrieved and contrasted.
- **guaranteed early win:** `l5-win` — dark drawer, **3 colors ⇒ 4 socks** (`holes+1`; `answerEntry`, accept `4`; GB p.11); a tiny answer despite the 20/31 piles, refuting "more socks in a pile ⇒ grab more."
- **mastery challenge (required, before recap):** `l5-prove` — **51 ants on a unit square**, partition into a `5×5 = 25`-region grid, `⌈51/25⌉ = 3` ⇒ a region holds ≥3 (GB p.12); certifies *building the partition yourself* AND the general `⌈N/H⌉` (beyond the `N>H` two-in-one base case).
- **spacing/interleaving:** `l5-apply` is the **construct-the-holes** interleave (handshakes 26/25 — the holes are the possible counts, not the people), the L5 analog of the unlabeled tool-pick (mirrors `lesson-states-streaks`); `⌈N/H⌉≥3` deepens `l5-model`→`l5-apply`→`l5-prove`. In-concept callback: the GB §2.6 counterfeit-coin world re-surfaces L1's `3³=27` as a *collision* (9 combos → 7 sums, `forcesCollision(9,7)`) at `l5-model`/`l5-explore`.
- **mastery signal:** first-try, zero-hint on `l5-prove` certifies constructing the holes + applying `⌈N/H⌉`-existence on a novel problem (not just the base case). `computeMastered` keys on {`l5-recall`,`l5-win`,`l5-apply`,`l5-prove`}.
- **graded? per beat:** `l5-recall:yes(light)`, `l5-bet:no`, `l5-win:yes`, `l5-explore:no`, `l5-model:no`, `l5-apply:yes(check)`, `l5-prove:yes(required)`, `l5-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `l5-recall` must be interaction type `retrievalGrid` (first graded beat = retrieval opener); `l5-prove` must be `masteryChallenge` + `required`, immediately before `l5-recap` (leave `beat.pattern` unset → answer verified by `src/engine/combinatorics.ts`: `pigeonholeMin(51,25)=3`, `forcesCollision(4,3)=true` vs `forcesCollision(3,3)=false`, `forcesCollision(26,25)=true`); this lesson needs **≥1 `primer` (e.g. "what `⌈·⌉` ceiling / pigeons vs holes means") + ≥1 Track-A scaffold + ≥1 `interviewNote`** (Dept 2); register `lesson-combinatorics-1…6` in `MASTERY_LESSONS` + `GATED` in `scripts/validate-fixtures.ts` (Dept 3) — both currently hold only the probability-course lessons.
