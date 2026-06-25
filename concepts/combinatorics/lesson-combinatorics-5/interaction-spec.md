# Interaction Spec: The Pigeon Hole Principle  (lesson-combinatorics-5)

Chapter accent: `--ch3` coral (`#F0584A` / `--ch3-tint` `#FEF0EF`). L5 belongs to chapter `ch-combinatorics-3 "Existence & Probability"` per `concept-brief.md`. **Note:** the final accent depends on Dept-1 assigning L5/L6 to that chapter in the `chapters[]` array; `ch3` coral is provisional until that seed runs. All token names from `docs/ui_design_system.md`.

---

| # | beatId | mechanic (manipulate → respond → loop) + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|------------------------------------------------|------------------|--------------|--------------------------|------|------------------------|-------|
| 1 | `l5-recall` | Tap a left scenario card, tap its matching right card (counting tool or existence verdict); widget shuffles right column; loop until all 3 pairs matched. Third pair (`N > H socks`) pivots from "how many ways" to "what must occur." `comparison:true`. **required:true** | `retrievalGrid` | reuse | **correct:** "Three tools, three questions — multiply for independent choices, nCk when order doesn't matter, pigeonhole when N > H forces a repeat. Today: existence." **h1:** "Tap a scenario on the left, then its match on the right." **h2:** "Outfits → multiply; poker hands → nCk; 4 socks, 3 colors → some color must repeat." **h3:** "The third pair introduces existence: not 'how many ways' but 'what must happen.'" | Tap targets ≥44px per card; keyboard Tab/Enter navigates both columns; `role="grid"`; color + label, never color alone | `--ergo-surface` cards, `--ch3` 2px active border, `--r-md`, `--shadow-sm`; match-flash `--ok-tint` border (compositor `opacity`); reduced-motion → instant color swap | both |
| 2 | `l5-bet` | Tap one of four option chips to commit a prediction; chip locks immediately; per-option refutation reveals inline (no advance until read). Elicits "pile sizes decide the answer" misconception before l5-win demolishes it. **required:true** | `prediction` | reuse | **byOption** (verbatim from brief): `"4 socks"` → note: "Good instinct — let's prove it: with only 3 colors, a 4th sock has to match." (correct:true) · `"20 socks"` → note: "Let's test it — that's just the yellow pile, and pile size won't decide the answer." · `"32 socks"` → note: "Let's test it — anchoring on the biggest pile overshoots; the colors are what matter." · `"About half (~27)"` → note: "Let's test it — you'll need far fewer than half once you count colors." | 44px chip tap targets; `role="radiogroup"` with `role="radio"` per chip; keyboard ArrowUp/Down selects, Enter commits; locked chip `aria-disabled="true"` | `--ergo-surface-2` chip bg, `--ch3` ring on selected, `--r-pill`; correct chip → `--ok-tint` bg; wrong chip → `--bad-tint` bg; `--dur-base` opacity transition | both |
| 3 | `l5-primer` | Tap to read (or collapse) the "pigeons, holes, and ⌈·⌉" JIT explainer card; always skippable. Fires JIT between l5-bet (prediction lock) and l5-win (type-in) so vocabulary is named before the formula. **required:false** | `primer` | reuse | **correct:** "Keep that in mind — every existence argument below names pigeons, counts holes, and checks N > H." **h1:** "A pigeon is any item placed; a hole is any container." **h2:** "When N > H, some hole holds ≥2. In general, some hole holds ≥⌈N/H⌉ (ceiling, rounded up)." **h3:** "Read and tap Continue." | `<button aria-expanded="true/false">` with 44px hit target controls collapsible body (`aria-hidden` when collapsed); body text selectable | `--ergo-surface`, 4px `--ch3` left accent bar, `--r-md`, `--shadow-sm`; collapse/expand `--dur-slow` height transition (reduced-motion → instant); static otherwise | both |
| 4 | `l5-win` ★ | Type the minimum number of socks needed to guarantee a matching pair; submit. The early win: 3 colors (holes) → 4 socks. Refutes "pile sizes decide." **required:true** | `answerEntry` | reuse | **correct:** "Exactly — 3 colors are 3 holes, so 4 socks force two to match. Pile sizes never mattered." **h1:** "Tempting to use 20 or 31 — but pile size is a decoy. Count the *colors*: that's the number of holes." **h2:** "With 3 colors (3 holes), 3 socks can still be all-different — one per color. What must happen to the 4th?" **h3:** "The 4th sock must share a color with one of the first three. So 3 + 1 = 4 socks guarantee a match." | 44px input height; `inputmode="numeric"`; ARIA label matches field label; Enter submits; wrong → error flash before hint | `--ergo-surface` input, `--r-md`, `--ch3` focus ring, `--ergo-line-2` border; correct → `--ok-tint` flash; wrong → short horizontal shake + `--bad` border (reduced-motion: color only, no shake) | both |
| 5 | `l5-explore` ★ | Tap to select a sock, then tap a hole to place it — OR drag (additive only). After 3 socks fill each color bin, the 4th triggers a forced-collision highlight on the doubled-up bin. Loop: try every ordering; the collision is always forced. **Wow (hero):** on mount the board auto-places socks one at a time at `--dur-tell` — the (H+1)-th sock finds NO new bin — the collision lights up in `--mark-tint`. The single cinematic moment for this screen. `reducedMotionFinalFrame:true`. **required:true** | `pigeonholeBoard` | **NEW** | **correct:** "The 4th sock has nowhere new to go — the collision is forced. That's the pigeonhole principle in action." **h1:** "Try to place all 4 socks so no bin holds two — you'll find it's impossible." **h2:** "Once each color (Red, Yellow, Blue) holds one sock, the 4th has no new color to go to." **h3:** "3 holes, 4 pigeons — some hole must hold ≥⌈4/3⌉ = 2." | Tap targets ≥44px for both items and holes; keyboard Tab to cycle items, Enter selects; Tab again to cycle holes, Enter places; `aria-live="polite"` announces items-placed count; `aria-live="assertive"` fires on forced-collision moment ("Collision forced in [label]!") and on max-in-any-hole; reduced-motion → skip hero, render static final frame (board filled, collision hole glowing) | **hero:** items auto-place sequentially at `--dur-tell`; (H+1)-th placement triggers `--dur-base` scale 1.05→1.0 pulse on collision hole + `--mark-tint` bg flash + `--mark` 3px ring; item tokens: `--ch3-tint` bg, `--ch3` 2px border, `--r-pill`, ≥44×44px; selected item: `--ch3` 3px ring; hole cards: `--ergo-surface` bg, `--ch3` 2px border, `--r-md`, `--shadow-sm`; items-placed counter: JetBrains Mono 700 `--ch3` top-right; reduced-motion final frame: board filled, collision hole `--mark-tint` + `--mark` ring, no animation | both |
| 6 | `l5-scaffold` | Same pigeonholeBoard mechanic but items=7, holes=3. No hero. Place 7 socks into 3 color bins; forced-collision fires early; a second collision appears — ⌈7/3⌉ = 3 in one bin. Refutes "pigeonhole only ever puts two in one hole" before l5-model names the formula. **required:false, track:'A'** | `pigeonholeBoard` | **NEW** | **correct:** "7 socks, 3 colors — no matter how you place them, some color holds ≥ 3 = ⌈7/3⌉. The principle scales past 'just two.'" **h1:** "Place all 7 socks — try to keep bins even." **h2:** "With 3 holes and 7 socks, 7 ÷ 3 = 2.33…, so some hole holds at least 3." **h3:** "⌈7/3⌉ = 3. Some color-sock pile is forced to 3 or more." | Same as l5-explore (44px, keyboard, aria-live); Track A screen only; no hero | No hero; same token language as l5-explore; `--ch3` color on items-placed counter; second collision highlights same `--mark-tint` / `--mark` ring; `--dur-base` transition | A |
| 7 | `l5-model` | Tap each of 3 lens cards to reveal how the base case, the general formula, and the existence distinction converge on ⌈N/H⌉. After all three cards revealed, a `--ch3-tint` notation badge "⌈N/H⌉" fades in. Ungraded. `introducesSymbol:"⌈N/H⌉"` grounded by `["l5-win","l5-explore"]`. **required:true** | `tripletReveal` | reuse | **correct:** "Three views, one tool — N > H forces a repeat; ⌈N/H⌉ tells how many must pile up. Existence, not enumeration." **h1:** "Tap each card — what does the base case say? The general formula? The key distinction?" **h2:** "Base case: 4 > 3 → 2 in one bin. General: ⌈7/3⌉ = 3. Existence: we never list arrangements." **h3:** "Read all three lenses, then Continue." | Same as existing `tripletReveal` usage; cards ≥44px tap targets; keyboard Tab/Enter reveals each card; `aria-live="polite"` announces card label on reveal; notation badge `aria-label="ceiling of N over H"` | `--ergo-surface` cards, `--ch3` 2px header accent, `--r-md`, `--shadow-sm`; card reveal: compositor `opacity` 0→1 + `translateY` 8px→0px at `--dur-slow`; notation badge: `--ch3-tint` `--r-sm` pill, fades in at `--dur-slow` after all three revealed (compositor `opacity`); reduced-motion → instant reveal | both |
| 8 | `l5-apply` | Read the handshakes scenario; type the number of possible count-values (25), then type verdict (yes); submit. The "construct the holes" graded check — learner must identify holes as possible VALUES, not people. **required:true** | `answerEntry` | reuse | **correct:** "Yes — 26 people into 25 count-slots {1..25}; 26 > 25 forces two to share a number." **h1:** "Don't count people (the pigeons) — the holes are the 25 possible handshake counts {1..25}." **h2:** "26 people each have a count in {1, 2, …, 25}: 26 pigeons, 25 holes — is 26 > 25? Yes." **h3:** "forcesCollision(26, 25) = true — two people must share a count. Verdict: yes." | 44px input heights; `inputmode="numeric"` on field 1; ARIA labels match field labels; Tab moves between fields; Enter submits; wrong flash before hint | `--ergo-surface` inputs, `--r-md`, `--ch3` focus ring, `--ergo-line-2` border; correct → `--ok-tint` flash; wrong → shake + `--bad` border (reduced-motion: color only); both fields inline before the submit button | both |
| 9 | `l5-prove` | Read scenario (51 ants, unit square, 5×5 grid, radius-1/7 glass); type the minimum guaranteed ant-count in the most-crowded region; submit. `masteryChallenge`. Certifies: build the partition → apply ⌈N/H⌉ → conclude existence. **required:true, penultimate.** | `masteryChallenge` | reuse | **correct:** "Exactly — 25 regions, ⌈51/25⌉ = 3, so some region holds ≥3 ants; a radius-1/7 glass covers it." **h1:** "Even perfectly spread, 51 ants can't fit ≤2 per region: 25 × 2 = 50 < 51. Some region is forced to 3." **h2:** "Use the formula: ⌈51/25⌉ = ceiling(51 ÷ 25) = ceiling(2.04) = 3. Some region must hold at least 3." **h3:** "51 ants, 25 regions → ⌈51/25⌉ = 3. A radius-1/7 glass covers a side-1/5 square. Yes, always." | 44px input; `inputmode="numeric"`; ARIA label: "Minimum ant-count in the most-crowded region"; keyboard submit; scenario block separate from field | Scenario block: `--ergo-surface-2` bg, `--r-md`, 4px `--ch3-tint` left bar; field: `--ergo-surface`, `--ch3` focus ring; correct → `--ok-tint`; wrong → `--bad` border | both |
| 10 | `l5-recap` | Tap to reveal recap cards (existence principle, ⌈N/H⌉ formula, enumeration vs existence contrast, bridge to L6 counting probabilities). Last beat. **required:true** | `recap` | reuse | **correct:** "Pigeons + holes + ⌈N/H⌉ — guarantee existence without listing a single arrangement. Next: turn counts into odds → Counting Probabilities (L6)." **h1:** "N > H → forcesCollision = true → some hole holds ≥2." **h2:** "In general, some hole holds ≥⌈N/H⌉ — ceiling of N ÷ H." **h3:** "Bridge: L6 — now that we can count guaranteed outcomes, we can compute exact probabilities." | Standard recap; tap-to-reveal each card; keyboard accessible; no motion requirement | `--ergo-surface` cards; `--ch3` accent on first rule-card header; `--r-lg`; static | both |

---

## New interaction types (for Wave 0)

- **`pigeonholeBoard`** — drop N items (pigeons) into H holes (containers). When N > H a collision is FORCED; the widget highlights the doubled-up hole. The learner tries to place items and discovers a repeat is unavoidable. DOM/SVG; tap to place (tap an item, then a hole) OR drag (drag additive only).

  **Schema (frozen Zod — do not diverge):**
  ```ts
  z.object({
    type: z.literal('pigeonholeBoard'),
    items: z.number().int().positive(),          // pigeons (e.g. 4 socks)
    holes: z.number().int().positive(),          // containers (e.g. 3 colors)
    holeLabels: z.array(z.string()).optional(),  // e.g. ["Red","Yellow","Blue"]
    itemLabel: z.string().optional(),            // singular noun for aria copy, e.g. "sock"
    accept: z.array(z.string()).optional(),      // optional graded read-off (UNGRADED in L5 — omit)
  })
  ```

  **Renderer:** `src/lesson/beats/PigeonholeBoardBeat.tsx`
  **Engine dep:** `src/engine/combinatorics.ts` → `pigeonholeMin(items, holes)` + `forcesCollision(items, holes)`
  **Registration:** add to `InteractionSchema` discriminated union; do NOT add to `GRADED_TYPES` in L5 (ungraded — `accept` omitted); add `case 'pigeonholeBoard': return <PigeonholeBoardBeat …/>` to `src/lesson/beats/index.tsx`.

---

## Build decomposition (Technical Planner — for Dept 3)

### engine: `src/engine/combinatorics.ts`

Pure, dependency-free. New functions for L5 use integer arithmetic only (no floats — INTEGER ceiling formula):

```ts
export function pigeonholeMin(items: number, holes: number): number
// INTEGER ceiling: (items + holes - 1) / holes (integer division, no float)
// pigeonholeMin(4, 3)  → 2   (⌈4/3⌉   = 1.33… → 2)
// pigeonholeMin(7, 3)  → 3   (⌈7/3⌉   = 2.33… → 3)
// pigeonholeMin(51, 25) → 3  (⌈51/25⌉ = 2.04  → 3)
// pigeonholeMin(9, 7)  → 2   (⌈9/7⌉   = 1.28… → 2)
// Implementation: Math.floor((items + holes - 1) / holes)
//   OR integer: (items + holes - 1) / holes | 0  (both give the same integer result)

export function forcesCollision(items: number, holes: number): boolean
// items > holes
// forcesCollision(4, 3)  → true    (l5-win threshold)
// forcesCollision(3, 3)  → false   (boundary case — 3 socks can still be all-different)
// forcesCollision(26, 25) → true   (l5-apply handshakes)
// forcesCollision(9, 7)  → true    (l5-model coin-combo callback)
```

Existing functions reused from prior lessons (must already be in `combinatorics.ts`):

```ts
export function factorial(n: number): bigint
export function nCk(n: number, k: number): bigint
// nCk(4, 2) → 6n  (l5-recall retrieval pair)
// nCk(52, 5) → 2_598_960n  (l5-recall retrieval pair, GB p.34)
```

**Golden values required by this lesson's cross-checks:**

| expression | expected |
|-----------|---------|
| `pigeonholeMin(4, 3)` | `2` |
| `pigeonholeMin(7, 3)` | `3` |
| `pigeonholeMin(51, 25)` | `3` |
| `pigeonholeMin(9, 7)` | `2` |
| `forcesCollision(4, 3)` | `true` |
| `forcesCollision(3, 3)` | `false` |
| `forcesCollision(26, 25)` | `true` |
| `forcesCollision(9, 7)` | `true` |
| `nCk(4, 2)` | `6n` |

### schema: `src/content/schema.ts`

Add `pigeonholeBoard` to the `InteractionSchema` discriminated union (after the existing `retrievalGrid` entry):

```ts
z.object({
  type: z.literal('pigeonholeBoard'),
  items: z.number().int().positive(),
  holes: z.number().int().positive(),
  holeLabels: z.array(z.string()).optional(),
  itemLabel: z.string().optional(),
  accept: z.array(z.string()).optional(),
}),
```

Beats where `accept` is absent (ungraded in L5): `l5-explore`, `l5-scaffold`. `pigeonholeBoard` is NOT in `GRADED_TYPES` for L5.

### renderer/widget: `PigeonholeBoardBeat.tsx`

**Props:** `items: number`, `holes: number`, `holeLabels?: string[]`, `itemLabel?: string`, `accept?: string[]`, plus standard beat props (`onComplete`, `onHint`, `hintLevel`, `hero?`).

**Layout (DOM + SVG — NOT Konva):**
- **Items strip (top):** a horizontal flex-wrap row of N item tokens. Each token: `--ch3-tint` bg pill, `--ch3` 2px border, `--r-pill`, `--shadow-sm`, min 44×44px tap target, displays itemLabel (e.g. "sock") + index. Selected token: `--ch3` 3px ring + `--dur-base` scale 1.02→1.0 pulse. Placed tokens move visually into their hole (compositor `translateY`, `--dur-base`); in reduced-motion: instant transfer.
- **Holes grid (below):** H hole-cards in a flex-wrap row. Each hole-card: `--ergo-surface` bg, `--ch3` 2px border, `--r-md`, `--shadow-sm`, min 80px wide, min 64px tall; shows label (holeLabels[i] or "Hole i+1") and stacks placed item tokens inside.
- **Items-placed counter:** top-right of board, Space Grotesk 700 label + JetBrains Mono 700 count, `--ch3` color; `aria-live="polite"` announces "N of M placed" on each placement.
- **Collision state:** when a hole receives its 2nd (or Nth-over-expected) item, `forcesCollision` returns true for the board overall → the triggering hole and its doubled item flash `--mark-tint` bg + `--mark` 3px ring at `--dur-base` scale 1.05→1.0; `aria-live="assertive"` announces "Collision forced in [label]! Two socks share this color." A separate `aria-live="polite"` region updates "Maximum in any hole: N."
- **Completion:** when all `items` are placed → `onComplete()` fires → feedback correct copy shows.

**Interaction flow:**
1. Tap an unplaced item token to select it (ring appears). Keyboard: Tab to cycle items, Enter selects.
2. Tap a hole-card to place the selected item into it. Keyboard: Tab to cycle holes, Enter places.
3. Drag support (additive only): drag an item token directly onto a hole-card; `dragover` accepted, `drop` places. Drag NEVER removes or repositions already-placed items.
4. On forced-collision: highlight fires (see above). Learner can continue placing remaining items.
5. When all N items placed: `onComplete()`.

**Hero variant** (l5-explore only):
- On mount: auto-place items one at a time with `--dur-tell` delay between each placement, producing the cinematic "watch it resolve" sequence.
- After the (holes+1)-th auto-placement the collision fires and the collision highlight dwells for 2× `--dur-slow` before the remaining items auto-place.
- After auto-play completes the board becomes interactive (learner can reset and try again).
- `prefers-reduced-motion`: skip hero entirely; render static final frame immediately — board filled (e.g., Red: 2 socks, Yellow: 1, Blue: 1), collision hole (Red) highlighted in `--mark-tint` + `--mark` ring, no animation.

**Keyboard path (tap + keyboard PRIMARY; drag ADDITIVE only):**
- Tab sequence: item 1 → item 2 → … → item N (cycle) → Tab to hole section → hole 1 → hole 2 → … → hole H.
- Select item: Enter (or Space) on focused item.
- Place into hole: Enter (or Space) on focused hole while an item is selected.
- `--ring-focus` visible on every focused element.

### fixture: beat JSON shape

Mirroring `fixtures/lesson-overlap-shortcut.json` shape. Full examples for the key beats:

**`l5-explore`** (hero pigeonholeBoard, ungraded):

```json
{
  "beatId": "l5-explore",
  "required": true,
  "prompt": "Place the 4 socks into the 3 color bins. Try to avoid putting two socks in the same bin.",
  "interaction": {
    "type": "pigeonholeBoard",
    "items": 4,
    "holes": 3,
    "holeLabels": ["Red", "Yellow", "Blue"],
    "itemLabel": "sock"
  },
  "feedback": {
    "correct": "The 4th sock has nowhere new to go — the collision is forced. That's the pigeonhole principle in action.",
    "hints": [
      "Try to place all 4 socks so no bin holds two — you'll find it's impossible.",
      "Once each color (Red, Yellow, Blue) holds one sock, the 4th has no new color to go to.",
      "3 holes, 4 pigeons — some hole must hold ≥⌈4/3⌉ = 2."
    ]
  },
  "hero": {
    "slowFirst": true,
    "structuralReadout": "After 3 socks fill every color, the 4th sock has nowhere new to go — the collision lights up.",
    "reducedMotionFinalFrame": true
  }
}
```

**`l5-win`** (answerEntry, graded, early win):

```json
{
  "beatId": "l5-win",
  "required": true,
  "prompt": "Your drawer has 2 red, 20 yellow, and 31 blue socks. It's pitch dark. How many socks must you grab to guarantee a matching pair?",
  "interaction": {
    "type": "answerEntry",
    "fields": [
      {
        "id": "min-socks",
        "label": "Minimum socks to guarantee a match",
        "accept": ["4"],
        "placeholder": "?",
        "suffix": "socks"
      }
    ]
  },
  "feedback": {
    "correct": "Exactly — 3 colors are 3 holes, so 4 socks force two to match. Pile sizes never mattered.",
    "hints": [
      "Tempting to use 20 or 31 — but pile size is a decoy. Count the colors: that's the number of holes.",
      "With 3 colors (3 holes), 3 socks can still be all-different — one per color. What must happen to the 4th?",
      "The 4th sock must share a color with one of the first three. So 3 + 1 = 4 socks guarantee a match."
    ]
  }
}
```

**`l5-apply`** (answerEntry 2-field, graded, construct-the-holes):

```json
{
  "beatId": "l5-apply",
  "required": true,
  "prompt": "A welcome party: 25 members join plus you — 26 people total. Everyone shakes hands with at least 1 and at most 25 others. First, identify the holes. Then decide: must two people have shaken exactly the same number of hands?",
  "interaction": {
    "type": "answerEntry",
    "fields": [
      {
        "id": "holes",
        "label": "How many distinct handshake-count values are possible?",
        "accept": ["25"],
        "placeholder": "?",
        "suffix": "possible counts"
      },
      {
        "id": "verdict",
        "label": "Must two people share a count?",
        "accept": ["yes", "Yes", "YES"],
        "placeholder": "yes or no"
      }
    ]
  },
  "feedback": {
    "correct": "Yes — 26 people into 25 count-slots {1..25}; 26 > 25 forces two to share a number.",
    "hints": [
      "Don't count people (the pigeons) — the holes are the 25 possible handshake counts {1..25}.",
      "26 people each have a count in {1, 2, …, 25}: 26 pigeons, 25 holes — is 26 > 25? Yes.",
      "forcesCollision(26, 25) = true — two people must share a count. Verdict: yes."
    ]
  }
}
```

**`l5-prove`** (masteryChallenge, required, penultimate):

```json
{
  "beatId": "l5-prove",
  "required": true,
  "prompt": "51 ants wander onto a unit square. You cut the square into a 5×5 grid of 25 equal smaller squares. You have a circular glass of radius 1/7. What is the minimum number of ants that must share one of the 25 regions?",
  "interaction": {
    "type": "masteryChallenge",
    "scenario": "Remember: once you name the holes and count pigeons, ⌈N/H⌉ gives the guaranteed minimum. Here the partition is handed to you — 25 regions.",
    "fields": [
      {
        "id": "min-per-region",
        "label": "Minimum ants in the most-crowded region",
        "accept": ["3"],
        "placeholder": "?",
        "suffix": "ants"
      }
    ]
  },
  "feedback": {
    "correct": "Exactly — 25 regions, ⌈51/25⌉ = 3, so some region holds ≥3 ants; a radius-1/7 glass covers it.",
    "hints": [
      "Even perfectly spread, 51 ants can't fit ≤2 per region: 25 × 2 = 50 < 51. Some region is forced to 3.",
      "Use the formula: ⌈51/25⌉ = ceiling(51 ÷ 25) = ceiling(2.04) = 3. Some region must hold at least 3.",
      "51 ants, 25 regions → ⌈51/25⌉ = 3. A radius-1/7 glass covers a side-1/5 square. Yes, always."
    ]
  }
}
```

**Fields used across the lesson fixture:**

| field | beats where present |
|-------|---------------------|
| `beatId`, `required`, `prompt`, `interaction`, `feedback` | all |
| `hero` | l5-explore only |
| `track:'A'` | l5-scaffold |
| `introducesSymbol`, `groundedBy` | l5-model |
| `comparison:true` | l5-recall |
| `interviewNote` | l5-model |
| `pattern` | **UNSET on all beats** (l5-prove verified by combinatorics engine, not H/T automaton) |

### validate-fixtures additions

```ts
// scripts/validate-fixtures.ts

// 1. Extend GATED + MASTERY_LESSONS to include L5/L6 (and L1–L4 if not already present)
const GATED = [...existingGated,
  'lesson-combinatorics-1', 'lesson-combinatorics-2',
  'lesson-combinatorics-3', 'lesson-combinatorics-4',
  'lesson-combinatorics-5', 'lesson-combinatorics-6']
const MASTERY_LESSONS = [...existingMastery,
  'lesson-combinatorics-1', 'lesson-combinatorics-2',
  'lesson-combinatorics-3', 'lesson-combinatorics-4',
  'lesson-combinatorics-5', 'lesson-combinatorics-6']

// 2. pigeonholeBoard is NOT in GRADED_TYPES for L5 (accept absent → ungraded)
// (no GRADED_TYPES change needed for this lesson)

// 3. Engine cross-check: l5-prove masteryChallenge accept
if (beat.beatId === 'l5-prove' && beat.interaction.type === 'masteryChallenge') {
  const expected = pigeonholeMin(51, 25).toString()  // "3"
  const actual = beat.interaction.fields[0].accept[0]
  assert(actual === expected,
    `l5-prove: accept "${actual}" ≠ pigeonholeMin(51,25)="${expected}"`)
}

// 4. Engine cross-check: l5-win answerEntry accept
if (beat.beatId === 'l5-win' && beat.interaction.type === 'answerEntry') {
  // forcesCollision boundary: 4 socks (true) vs 3 socks (false)
  assert(forcesCollision(4, 3) === true,  'forcesCollision(4,3) must be true')
  assert(forcesCollision(3, 3) === false, 'forcesCollision(3,3) must be false')
  const expected = '4'  // holes+1 = 3+1
  const actual = beat.interaction.fields[0].accept[0]
  assert(actual === expected,
    `l5-win: accept "${actual}" ≠ "4" (holes+1 for 3 colors)`)
}

// 5. Engine cross-check: l5-apply answerEntry accept (field 1 = holes count)
if (beat.beatId === 'l5-apply' && beat.interaction.type === 'answerEntry') {
  assert(forcesCollision(26, 25) === true, 'forcesCollision(26,25) must be true')
  assert(beat.interaction.fields[0].accept[0] === '25',
    `l5-apply field 0: accept "${beat.interaction.fields[0].accept[0]}" ≠ "25" (25 possible handshake counts)`)
}

// 6. pigeonholeBoard items/holes cross-check (l5-explore, l5-scaffold)
if (beat.interaction.type === 'pigeonholeBoard') {
  const { items, holes } = beat.interaction
  const collision = forcesCollision(items, holes)
  assert(collision === true,
    `${beat.beatId}: pigeonholeBoard items=${items} holes=${holes} — forcesCollision must be true (N>H required for the lesson)`)
  const minMax = pigeonholeMin(items, holes)
  // structural sanity: minMax ≥ 2
  assert(minMax >= 2,
    `${beat.beatId}: pigeonholeMin(${items},${holes})=${minMax} — must be ≥2 for pedagogic collision`)
}
```

---

## DoR gap closures (Dept-1 flagged)

- **primer:** `l5-primer` (beat #3), `variant:'custom'`, title: "Pigeons, holes, and the ceiling ⌈·⌉", body: "A **pigeon** is any item you're placing; a **hole** is any container it can land in. When you have more pigeons than holes — **N > H** — at least one hole must hold two pigeons. In general, with N pigeons and H holes, some hole holds at least **⌈N/H⌉** (ceiling: divide N by H and round UP to the next whole number). Examples: ⌈4/3⌉ = 2 (four 3-ways forces a pair); ⌈7/3⌉ = 3 (seven into three forces a triple). Pigeonhole is an *existence* tool — it proves something must occur, without listing arrangements." `collapsible:true`. Placed JIT between l5-bet (prediction lock) and l5-win (socks type-in) so the vocabulary (pigeons, holes, ceiling, existence) is named before the formula fires. Never graded, never required.

- **Track-A scaffold:** `l5-scaffold` (beat #6), `track:'A'`, `required:false` — a pigeonholeBoard with items=7, holes=3, holeLabels=["Red","Yellow","Blue"], itemLabel="sock", no hero, no accept (ungraded). Placed between l5-explore and l5-model. Track A learners place 7 socks and see ⌈7/3⌉ = 3 (some bin holds ≥3 socks), directly refuting the "pigeonhole only ever puts two in one hole" misconception before l5-model names the general formula. Track B learners skip to l5-model. The pigeonholeBoard widget is already built from l5-explore — zero net renderer cost for the scaffold.

- **interviewNote:** `l5-model` (beat #7): `"In quant interviews, the pigeonhole skill that matters is identifying the holes when they aren't handed to you. The pigeons are usually obvious (people, socks, coin combinations). The trap is recognizing what the holes ARE — not the 26 people at the party but their 25 possible handshake counts {1..25}; not the 51 ants but the 25 grid regions they scatter into. Once you see the holes, the argument is one line: if N > H, forcesCollision = true; for the guaranteed minimum, compute ⌈N/H⌉. Callback to L1: the 3 counterfeit-coin bags (3 × 3 = 9 combos, 7 possible sums) reappear here — forcesCollision(9, 7) = true, so 2 coins per bag can't uniquely identify all 27 weight combos. Same engine, different holes."` Additionally, `l5-model` carries `introducesSymbol:"⌈N/H⌉"` with `groundedBy:["l5-win","l5-explore"]` (both precede l5-model in every track, satisfying the notation-ladder ordering gate in validate-fixtures).

---

## Definition-of-Ready checklist (every beat)

| beat | (a) verified+sourced problem (brief row cited) | (b) concrete direct-manipulation mechanic | (c) instant feedback + 3-level hints | (d) a11y: 44px, reduced-motion, aria-live |
|------|-----------------------------------------------|------------------------------------------|--------------------------------------|-------------------------------------------|
| `l5-recall` | ✅ L1 multiply (GB p.33 §4.2) + L2 nCk/C(52,5) (GB p.33–34) + existence pivot (GB p.11 §2.6) — brief assessment row | ✅ tap-match retrievalGrid, 3 pairs | ✅ correct + 3 hints | ✅ 44px, color+label, keyboard, reduced-motion instant swap |
| `l5-bet` | ✅ socks drawer: 2 red / 20 yellow / 31 blue — GB p.11 §2.6 (brief verified-problems row 1); all 4 per-option notes verbatim from brief misconceptions section | ✅ tap-chip prediction; 4 options | ✅ byOption per-option refutation (4 options, 1 correct) — HARD GATE | ✅ 44px chips, radiogroup role, keyboard |
| `l5-primer` | N/A (structural; no graded problem) | ✅ collapsible tap-to-read card | ✅ dismiss copy present (not graded) | ✅ aria-expanded, 44px toggle |
| `l5-win` | ✅ 3 colors → 4 socks — GB p.11 §2.6 (brief row 1 + assessment/early-win note); ✓ and ✗ feedback verbatim from brief per-option section | ✅ single-field answerEntry; `inputmode="numeric"` | ✅ correct + 3 hints | ✅ 44px input, inputmode, ARIA label, no-shake reduced-motion |
| `l5-explore` | ✅ forcesCollision(4,3)=true; socks/3 colors — GB p.11 §2.6 (brief row 1) | ✅ pigeonholeBoard tap-to-place + drag (additive); hero cinematic | ✅ correct + 3 hints; aria-live assertive on collision | ✅ 44px items+holes, keyboard tab/enter full path, aria-live polite (count) + assertive (collision), reduced-motion static frame |
| `l5-scaffold` | ✅ pigeonholeMin(7,3)=3; extends brief's ⌈N/H⌉≥3 refutation (brief misconceptions #3) | ✅ pigeonholeBoard tap-to-place + drag (ungraded, no hero) | ✅ correct + 3 hints | ✅ same as l5-explore; Track A screen only |
| `l5-model` | ✅ base case (4,3)+general (7,3)=⌈7/3⌉=3 + existence vs enumeration — GB p.11–12 §2.6 (brief row 1 + assessment/spacing note) | ✅ tripletReveal tap-to-reveal 3 lens cards; notation badge after all revealed | ✅ correct + 3 hints; notation badge aria-labeled | ✅ 44px cards, keyboard Tab/Enter reveals, aria-live card label, reduced-motion instant reveal |
| `l5-apply` | ✅ handshakes 26/25 — GB p.11 §2.6 (brief verified-problems row 2); ✓ and ✗ feedback verbatim from brief per-option section | ✅ 2-field answerEntry (holes:25, verdict:yes); Tab between fields | ✅ correct + 3 hints | ✅ 44px inputs, ARIA labels per field, keyboard submit |
| `l5-prove` | ✅ ants 51/25: pigeonholeMin(51,25)=3 — GB p.12 §2.6 (brief verified-problems row 3); mastery feedback verbatim from brief; `pattern` UNSET per gate requirement | ✅ masteryChallenge type-in + submit; scenario block shown | ✅ correct + 3 hints | ✅ 44px input, ARIA field label, keyboard submit |
| `l5-recap` | N/A (structural; no graded problem) | ✅ tap-to-reveal recap cards; L6 bridge copy | ✅ correct + 3 hints (review copy) | ✅ standard recap a11y |

---

## Dept1↔Dept2 readiness check

| beat | (a) verified+sourced problem in brief? | (b) concrete mechanic + feedback in this spec? | kickback? |
|------|----------------------------------------|-----------------------------------------------|-----------|
| `l5-recall` | ✅ Brief assessment row: L1 multiply (GB p.33) + L2 nCk (GB p.33–34) + existence pivot (GB p.11 §2.6); all three retrievalGrid pairs derivable from cited sources | ✅ retrievalGrid + 3 hints; comparison:true marks the enumeration→existence pivot | — |
| `l5-bet` | ✅ Brief verified-problems row 1 (2 red/20 yellow/31 blue/3 colors); all 4 per-option refutation notes verbatim from brief misconceptions section | ✅ prediction byOption; all 4 options encoded | — |
| `l5-primer` | N/A (primer) | ✅ JIT card mechanic; placed between bet and win | — |
| `l5-win` | ✅ Brief row 1 (3 colors → 4 socks; GB p.11); ✓ answer copy verbatim from brief; ✗ distractor hint encoded as hints[0] | ✅ answerEntry accept:["4"]; 3-hint ladder; engine cross-check: forcesCollision(4,3)=true, (3,3)=false | — |
| `l5-explore` | ✅ Brief beat #4 + row 1 (pigeonholeBoard items=4 holes=3; GB p.11); hero = cinematic collision | ✅ pigeonholeBoard NEW type; hero block; aria-live assertive on collision; reduced-motion final frame | — |
| `l5-scaffold` | ✅ Brief misconceptions #3 (⌈N/H⌉≥3; derivable from pigeonholeMin(7,3)=3) | ✅ pigeonholeBoard track:'A'; engine cross-check pigeonholeMin(7,3)=3 | — |
| `l5-model` | ✅ Brief beat #5 + spacing note (⌈N/H⌉ generalization; GB p.11–12); interviewNote + introducesSymbol grounded by l5-win+l5-explore | ✅ tripletReveal display:'cards'; notation badge; interviewNote present; notation-ladder gate satisfied | — |
| `l5-apply` | ✅ Brief verified-problems row 2 (handshakes 26/25; GB p.11); 2-field design covers "identify the holes" pedagogical move; ✓ and ✗ feedback verbatim from brief | ✅ answerEntry 2-field (holes:25, verdict:yes); engine cross-check forcesCollision(26,25)=true | — |
| `l5-prove` | ✅ Brief verified-problems row 3 (51 ants, 25 regions, ⌈51/25⌉=3; GB p.12); mastery feedback verbatim from brief; pattern UNSET per gate requirement | ✅ masteryChallenge accept:["3"]; engine cross-check pigeonholeMin(51,25)=3; required:true; penultimate | — |
| `l5-recap` | N/A (recap) | ✅ recap cards + L6 bridge copy | — |

**VERDICT = READY.** No kickbacks to Dept 1. All 10 beats have verified+sourced problems (or are non-graded structural beats), concrete tap/type/drag direct-manipulation mechanics, instant feedback with 3-level hint ladders, and full a11y coverage. The `pigeonholeBoard` type is Wave-0-ready with the frozen Zod schema above; all engine golden values are exact integers derivable from `src/engine/combinatorics.ts`. The two new engine surfaces (`pigeonholeMin`, `forcesCollision`) are minimal, pure, and integer-only. One new renderer (`PigeonholeBoardBeat.tsx`) and one schema addition are the complete Wave-0 surface for L5.
