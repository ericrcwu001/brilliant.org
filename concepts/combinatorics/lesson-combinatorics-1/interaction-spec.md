# Interaction Spec: The Counting Principle  (lesson-combinatorics-1)

Chapter accent: `--ch5` violet (`#7C5CF0` / `--ch5-tint` `#F1ECFE`). All token names below are from `docs/ui_design_system.md`.

---

| # | beatId | mechanic (manipulate → respond → loop) + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|------------------------------------------------|------------------|--------------|--------------------------|------|------------------------|-------|
| 1 | `l1-recall` | Tap a left card (flip count), tap its matching right card (outcome count); widget shuffles right column; loop until all 3 pairs matched. Refutes "outcomes are uncountable" by forcing tiny-case listing. **required:true** | `retrievalGrid` | reuse | **correct:** "2, 4, 8 — the count doubles every flip. Let's find out why." **h1:** "Count all distinct strings — HH, HT, TH, TT for 2 flips." **h2:** "1 flip → H or T = 2. 2 flips → HH,HT,TH,TT = 4. Pattern?" **h3:** "Match: 1 flip→2, 2 flips→4, 3 flips→8." | Tap targets ≥44px per card; keyboard Tab/Enter navigates both columns; `role="grid"` on widget; color+shape, never color alone | `--ergo-surface` cards, `--ch5` 2px active border, `--r-md`, `--shadow-sm`; match-flash `--ok-tint` border (compositor `opacity`); reduced-motion → instant color swap | both |
| 2 | `l1-bet` | Tap one of three option chips to commit a prediction; chip locks immediately; per-option refutation reveals inline (no advance until read). Elicits add-not-multiply and count-heads misconceptions before the tree demolishes them. **required:true** | `prediction` | reuse | **byOption** (verbatim from brief): `"About 10"` → note: "That's counting flips, not strings — each of the 10 flips doubles the possibilities, so they explode past 10." · `"About 100"` → note: "Bigger is right, but not 10×10 — ten independent doublings compound to 2¹⁰. Let's count it." · `"About 1,024"` → note: "Yes — ten 2-way choices multiply: 2×2×…=2¹⁰=1,024, too big to ever list." (correct:true) | 44px chip tap targets; `role="radiogroup"` with `role="radio"` per option; keyboard ArrowUp/Down selects, Enter commits; locked chip `aria-disabled="true"` | `--ergo-surface-2` chip bg, `--ch5` ring on selected, `--r-pill`; correct chip → `--ok-tint` bg; wrong chip → `--bad-tint` bg; `--dur-base` opacity transition | both |
| 3 | `l1-primer` | Tap to read (or collapse) the "independent choices multiply" JIT explainer card; always skippable. Fires right before the tree so the principle is named before the mechanic. **required:false** | `primer` | reuse | **correct:** "Keep that in mind — every level of the tree below is one independent choice." **h1:** "Independent means one choice doesn't shrink the next menu." **h2:** "Two 2-way choices: 2×2=4, not 2+2=4 (same number here, but wait for 3 levels)." **h3:** "Read and tap Continue." | `<button aria-expanded="true/false">` with 44px hit target controls collapsible body (`aria-hidden` when collapsed); body text selectable | `--ergo-surface`, 4px `--ch5` left accent bar, `--r-md`, `--shadow-sm`; collapse/expand `--dur-slow` height transition (reduced-motion → instant); static otherwise | both |
| 4 | `l1-win` ★ | Tap each level button to expand the flip tree; each expansion multiplies the live running product (aria-live). When all 3 levels expanded, type the final count and submit. **Wow (hero):** on mount the tree auto-expands one level at a time at `--dur-tell` — the single cinematic moment for this screen. **required:true** | `countingTree` | **NEW** | **correct:** "Right — 2×2×2 = 8; each flip multiplies the running count." **h1:** "Tap Level 1 — 2 branches appear (H, T). Running product reads 2." **h2:** "Tap Level 2 — each branch forks: 2×2 = 4 total paths." **h3:** "Tap Level 3 — doubles again: 4×2 = 8. Type 8." | Level buttons ≥44px; keyboard Tab→button→Enter expands each level in order; after all expanded, Tab moves to answer `<input>`; `aria-live="polite"` region announces "Running total: N" on each expansion; reduced-motion → skip hero, render final expanded frame immediately | **hero:** levels expand sequentially at `--dur-tell` (compositor `opacity` + `translateY`) before user acts; running product badge JetBrains Mono 700 `--ch5` with `--dur-base` scale pulse on each update; SVG branch lines `--ergo-line-2` 2px; node pills `--ergo-surface` `--shadow-sm` `--r-sm`; answer input `--r-md` `--ch5` focus ring; reduced-motion final frame: full 3-level tree + product=8 + input visible | both |
| 5 | `l1-scaffold` | Tap all 4 level buttons on a 2×2×2×2 tree; watch the product compound to 16 in one more step past the l1-win tree. Ungraded (no `accept`). Track A only — slower on-ramp before the mixed-fan-out exploration. **required:false, track:'A'** | `countingTree` | **NEW** | **correct:** "2⁴ = 16 — one more flip, twice the count. The doubling every step IS the 2ⁿ law." **h1:** "Tap Levels 1–3 first: you'll get 8, same as before." **h2:** "Now tap Level 4: 8 doubles to 16." **h3:** "2¹=2, 2²=4, 2³=8, 2⁴=16 — each step multiplies by 2." | Same as l1-win (44px, keyboard, aria-live); Track A screen only | No hero; same tree token language; `--ch5` product badge; `--dur-slow` per-level expand; static final frame | A |
| 6 | `l1-explore` | Tap 3 levels of a mixed-fan-out tree (2 shirt colors × 3 pant styles × 2 shoe types); running product updates live at each level tap. Ungraded — learner discovers 2×3×2=12 without prompting. Refutes "adding a step adds its options." **required:true** | `countingTree` | **NEW** | **correct:** "2×3×2 = 12 — different options at each step, still multiply them all." **h1:** "Tap Level 1 (shirts): 2 branches — running product = 2." **h2:** "Tap Level 2 (pants): each splits 3 ways — 2×3 = 6." **h3:** "Tap Level 3 (shoes): 6×2 = 12. Multiplication rule, mixed fan-out." | Same as l1-win; `aria-live` on product; no answer input (ungraded) | No hero; `--ch5` product; node pill width scales with `options` count (narrower for 2, wider for 3) to signal different fan-outs visually | both |
| 7 | `l1-multadd` | Read scenario (3 bags, each coin weighs −1/0/+1, bags independent), type the combination count, submit. `comparison:true` marks this as a multiply-vs-add contrast beat. **required:true** | `answerEntry` | reuse | **correct:** "Right — 3³ = 27; three independent bags, 3 weights each, multiply." **h1:** "Each bag's weight is chosen independently — picking one bag's weight doesn't restrict the others, so multiply, not add." **h2:** "3+3+3=9 counts only one-bag choices. Three independent 3-way choices: 3×3×3." **h3:** "3×3×3 = 27." | 44px input height; `inputmode="numeric"`; ARIA label matches field label; Enter submits; error flash before hint | `--ergo-surface` input `--r-md` `--ergo-line-2` border; correct → `--ok-tint` flash; wrong → short horizontal shake + `--bad` border (reduced-motion: color only, no shake) | both |
| 8 | `l1-model` | Expand a 3→2→1 shrinking countingTree (3 people picking from 3/2/1 remaining spots); after full expansion the prompt names the result "3!" and bridges to n!. Ungraded. `introducesSymbol:"n!"` grounded by `["l1-win","l1-explore"]`. **required:true** | `countingTree` | **NEW** | **correct:** "3×2×1 = 6 = 3! — same multiplication rule, option count shrinks as each person uses up a spot. Every full arrangement of n things = n!" **h1:** "Person 1 picks from 3 spots. Person 2 has 2 left. Person 3 has 1." **h2:** "3×2×1 — multiplication rule still, fan-out shrinks each level." **h3:** "That's 6. Mathematicians write it 3! ('3 factorial'). n! = n×(n−1)×…×1." | Same as l1-win; `aria-live` for product; level labels narrate "spots remaining" count | `--ch5` product; level nodes narrow each row (3 wide → 2 → 1 single node); after full expansion a `--ch5-tint` notation badge "= 3!" fades in beside product (compositor `opacity`, `--dur-slow`); interviewNote on this beat | both |
| 9 | `l1-prove` | Read scenario (3 students, 365-day year, no-repeat birthdays vs all sequences), type the no-repeat count. `pattern` UNSET — engine-verified, not H/T automaton. **required:true, penultimate.** | `masteryChallenge` | reuse | **correct:** "Exactly — 365·364·363; same rule, each next person has one fewer day." **h1:** "Same shrinking-product rule as the n! tree: each next person has one fewer available day." **h2:** "Student 1: 365 days. Student 2: 364 (one day taken). Student 3: 363." **h3:** "365×364×363 = 48,228,180." | 44px input; `inputmode="numeric"`; ARIA label: "No-repeat birthday sequences for 3 students"; keyboard submit; field labeled with formula hint | `--ergo-surface` `--ch5` focus ring on field; correct `--ok-tint`; wrong `--bad` border | both |
| 10 | `l1-recap` | Tap to reveal recap cards (multiplication rule summary, n! derivation, bridge to L2 permutations). Last beat. **required:true** | `recap` | reuse | **correct:** "Multiply the options at each step — if choices shrink, you get n!. Next: when does order matter? → Permutations (L2)." **h1:** "The rule: independent choices chain with ×." **h2:** "Shrinking options (n, n−1, …) give n! = total arrangements." **h3:** "Bridge: L2 — when does order stop mattering? That's combinations." | Standard recap; tap-to-reveal each card; keyboard accessible; no motion requirement | `--ergo-surface` cards; `--ch5` accent on rule card header; `--r-lg`; static | both |

---

## New interaction types (for Wave 0)

- **`countingTree`** — expand a product-rule tree; each tap adds a level and multiplies the live running product. Supports equal fan-out (2,2,2→8), mixed fan-out (2,3,2→12), and shrinking fan-out (3,2,1→6=3!). DOM/SVG, tap-to-expand. Graded when `accept` is present (running product normalized against accept list).

  **Schema (frozen Zod — do not diverge):**
  ```ts
  z.object({
    type: z.literal('countingTree'),
    levels: z.array(z.object({
      label: z.string(),
      options: z.number().int().positive(),
    })),
    accept: z.array(z.string()).optional(), // present → graded on running product
  })
  ```

  **Renderer:** `src/lesson/beats/CountingTreeBeat.tsx`
  **Engine dep:** `src/engine/combinatorics.ts` → `product(opts: number[]): bigint`
  **Registration:** add to `InteractionSchema` discriminated union; add `'countingTree'` to `GRADED_TYPES` in `scripts/validate-fixtures.ts` (conditional on `accept` present); add `case 'countingTree': return <CountingTreeBeat …/>` to `src/lesson/beats/index.tsx`.

---

## Build decomposition (Technical Planner — for Dept 3)

### engine: `src/engine/combinatorics.ts`

Pure, dependency-free, BigInt only (no floats). Functions needed for this lesson:

```ts
export function product(opts: number[]): bigint
// [2,2,2] → 8n   [2,3,2] → 12n   [3,3,3] → 27n   [3,2,1] → 6n

export function factorial(n: number): bigint
// factorial(3) → 6n   factorial(5) → 120n

export function nPk(n: number, k: number): bigint
// nPk(365, 3) → 48_228_180n   (= 365 × 364 × 363)
```

**Golden values required by this lesson's cross-checks:**

| expression | expected bigint |
|-----------|----------------|
| `product([2,2,2])` | `8n` |
| `product([2,3,2])` | `12n` |
| `product([3,3,3])` | `27n` |
| `product([3,2,1])` | `6n` |
| `product([2,2,2,2])` | `16n` |
| `factorial(3)` | `6n` |
| `factorial(5)` | `120n` |
| `nPk(365, 3)` | `48_228_180n` |

### schema: `src/content/schema.ts`

Add the `countingTree` Zod object to the `InteractionSchema` discriminated union (after the existing `retrievalGrid` entry):

```ts
z.object({
  type: z.literal('countingTree'),
  levels: z.array(z.object({
    label: z.string(),
    options: z.number().int().positive(),
  })),
  accept: z.array(z.string()).optional(),
}),
```

Beats where `accept` is set (graded): `l1-win` (`accept:["8"]`).
Beats where `accept` is absent (ungraded): `l1-scaffold`, `l1-explore`, `l1-model`.

### renderer/widget: `CountingTreeBeat.tsx`

**Props:** `levels: {label:string; options:number}[]`, `accept?: string[]`, plus standard beat props (`onCorrect`, `onHint`, `hintLevel`, `hero?`).

**Layout (DOM + SVG — NOT Konva):**
- A `<div>` column of level-row items. Each level row: an expand `<button>` (min 44×44px; `--r-sm`; `--ergo-surface` bg; `--ch5` border when expanded) with the level label. Below the button, a flex row of node pills (one per branch).
- An SVG `<g>` layer behind the node pills draws connector lines (`--ergo-line-2`, 2px stroke) from parent nodes to child nodes.
- A live running-product badge at the top of the tree: Space Grotesk 700 / JetBrains Mono, `--ch5` color, updates on each expansion. This element has `aria-live="polite"` and announces "Running total: {N}" to screen readers.

**Interaction flow:**
1. Levels start unexpanded (button visible, no branch nodes).
2. Tap (or Enter on focused button): expands that level — branch nodes appear with compositor-only `opacity` 0→1 + `translateY` 8px→0px at `--dur-slow`; running product updates with a `--dur-base` scale 1.05→1.0 pulse; `aria-live` region fires.
3. When all levels expanded and `accept` is set: a `<input type="text" inputmode="numeric">` field appears below the tree; Submit button activates.
4. **Grading:** normalize input (strip commas, spaces, leading zeros) and compare as string against each entry in `accept[]`. On correct → `onCorrect()`. On wrong → `onHint()` increments hint level; field border flashes `--bad`.

**Hero variant** (when beat carries `hero` block):
- On mount, auto-expand all levels sequentially: `--dur-tell` delay between each expansion, producing one slow cinematic replay.
- After the auto-play completes (or if user taps during), the level buttons become interactive normally.
- `prefers-reduced-motion`: skip the hero sequence entirely; render the tree in its fully-expanded final frame immediately (all nodes visible, running product shown, input field visible if graded).

**Keyboard path (no drag anywhere):**
- Tab sequence: level 1 button → Enter expands → level 2 button → … → answer input → Enter submits.
- `--ring-focus` visible on every focused element.

**Notation badge** (l1-model only):
- After all levels expanded, a `--ch5-tint` `--r-sm` pill badge "= 3!" fades in beside the product counter (compositor `opacity`, `--dur-slow`). Authored via a `notation?: string` prop (optional extension, leave undefined for other beats).

### fixture: beat JSON shape

Mirroring `fixtures/lesson-overlap-shortcut.json` shape. Full example for `l1-win` (the hero/graded countingTree):

```json
{
  "beatId": "l1-win",
  "required": true,
  "prompt": "Tap each level to expand the flip tree and watch the count multiply. What's the final count for 3 flips?",
  "interaction": {
    "type": "countingTree",
    "levels": [
      { "label": "Flip 1", "options": 2 },
      { "label": "Flip 2", "options": 2 },
      { "label": "Flip 3", "options": 2 }
    ],
    "accept": ["8"]
  },
  "feedback": {
    "correct": "Right — 2×2×2 = 8; each flip multiplies the running count.",
    "hints": [
      "Tap Level 1 — 2 branches appear (H, T). Running product reads 2.",
      "Tap Level 2 — each branch forks: 2×2 = 4 total paths.",
      "Tap Level 3 — doubles again: 4×2 = 8. Type 8."
    ]
  },
  "hero": {
    "slowFirst": true,
    "structuralReadout": "Each tap doubles the running count — 2 → 4 → 8.",
    "reducedMotionFinalFrame": true
  }
}
```

**Fields used across the lesson fixture:**

| field | beats where present |
|-------|---------------------|
| `beatId`, `required`, `prompt`, `interaction`, `feedback` | all |
| `hero` | l1-win only |
| `track:'A'` | l1-scaffold |
| `introducesSymbol`, `groundedBy` | l1-model |
| `comparison:true` | l1-multadd |
| `interviewNote` | l1-multadd |
| `pattern` | **UNSET on all beats** (l1-prove verified by combinatorics engine, not H/T automaton) |

### validate-fixtures additions

```ts
// scripts/validate-fixtures.ts

// 1. Add to GATED + MASTERY_LESSONS
const GATED = [...existingGated, 'lesson-combinatorics-1', 'lesson-combinatorics-2', 'lesson-combinatorics-3', 'lesson-combinatorics-4']
const MASTERY_LESSONS = [...existingMastery, 'lesson-combinatorics-1', 'lesson-combinatorics-2', 'lesson-combinatorics-3', 'lesson-combinatorics-4']

// 2. Add to GRADED_TYPES (conditional: only when accept present)
// (handle in the per-beat check: if type==='countingTree' && accept, treat as graded)

// 3. Engine cross-check for countingTree accept values
if (beat.interaction.type === 'countingTree' && beat.interaction.accept) {
  const opts = beat.interaction.levels.map((l: {options:number}) => l.options)
  const expected = product(opts).toString()
  const normalized = beat.interaction.accept[0].replace(/[,\s]/g, '')
  assert(expected === normalized,
    `${beat.beatId}: countingTree accept "${normalized}" ≠ product([${opts}])="${expected}"`)
}
```

---

## DoR gap closures (Dept-1 flagged)

- **primer:** `l1-primer` (beat #3), `variant:'custom'`, title: "Independent choices multiply", body: "Two choices are _independent_ if picking one doesn't change the options for the other — like flipping a coin twice. When you have a sequence of independent choices, the total count is their _product_: 2 options then 2 options = 2×2 = 4 total strings. Add a third: 4×2 = 8. And so on — you never add." `collapsible:true`. Placed JIT between l1-bet (prediction lock) and l1-win (tree tap) so the principle is named before the mechanic fires. Never graded, never required.

- **Track-A scaffold:** `l1-scaffold` (beat #5), `track:'A'`, `required:false` — a 4-level equal-fan-out `countingTree` (levels: `[{Flip1,2},{Flip2,2},{Flip3,2},{Flip4,2}]`, no `accept`, ungraded) placed after l1-win and before l1-explore. Track A learners see 2³=8 compound to 2⁴=16 in one additional tap, confirming the 2ⁿ doubling pattern and building confidence before the mixed-fan-out l1-explore. Track B learners skip directly to l1-explore.

- **interviewNote:** `l1-multadd` (beat #7): `"The multiply-vs-add distinction is the single most common combinatorics error in quant interviews: chain independent choices with ×; mutually-exclusive either/or cases get +. The counterfeit-coin base-3 encoding (Green Book p.12) is the canonical real-world example — 3 bags × 3 weights each = 3³ = 27 combinations, not 9."` Additionally, `l1-model` carries `introducesSymbol:"n!"` with `groundedBy:["l1-win","l1-explore"]` (both precede it in every track, satisfying the notation-ladder ordering gate).

---

## Definition-of-Ready checklist (every beat)

| beat | (a) verified+sourced problem (brief row cited) | (b) concrete direct-manipulation mechanic | (c) instant feedback + 3-level hints | (d) a11y: 44px, reduced-motion, aria-live |
|------|-----------------------------------------------|------------------------------------------|--------------------------------------|-------------------------------------------|
| `l1-recall` | ✅ {1 flip→2, 2→4, 3→8} — GB p.33 §4.2 (brief verified-problems row 1) | ✅ tap-match grid | ✅ correct + 3 hints | ✅ 44px, color+label, keyboard, reduced-motion color-only |
| `l1-bet` | ✅ 2¹⁰=1,024 — GB p.33 §4.2 (brief row 1); per-option copy verbatim from brief | ✅ tap-chip prediction | ✅ byOption per-option refutation (3 options) | ✅ 44px chips, radiogroup role, keyboard |
| `l1-primer` | N/A (structural; no graded problem) | ✅ collapsible tap-to-read card | ✅ dismiss copy present (not graded) | ✅ aria-expanded, 44px toggle |
| `l1-win` | ✅ 2³=8 — GB p.33 §4.2 (brief row 1); answer feedback verbatim from brief | ✅ tap-expand tree + type-in answer | ✅ correct + 3 hints | ✅ 44px buttons, keyboard path, aria-live product, reduced-motion final frame |
| `l1-scaffold` | ✅ 2⁴=16 (2ⁿ general — brief row 1) | ✅ tap-expand tree (ungraded) | ✅ correct + 3 hints | ✅ same as l1-win |
| `l1-explore` | ✅ 2×3×2=12 (multiplication rule, mixed fan-out — GB p.33 §4.2) | ✅ tap-expand tree (ungraded) | ✅ correct + 3 hints | ✅ same as l1-win |
| `l1-multadd` | ✅ 3³=27 — GB p.12 §2 (brief row 3); answer feedback verbatim from brief | ✅ type-in answerEntry + submit | ✅ correct + 3 hints | ✅ 44px input, inputmode numeric, ARIA label |
| `l1-model` | ✅ 3!=6, n! general — GB p.33 §4.2 (brief row 2) | ✅ tap-expand shrinking tree (ungraded) | ✅ correct + 3 hints | ✅ same as l1-win; notation badge aria-labeled |
| `l1-prove` | ✅ 365·364·363=48,228,180 — GB p.36 §4.2 (brief row 5); mastery feedback verbatim from brief | ✅ masteryChallenge type-in + submit | ✅ correct + 3 hints | ✅ 44px input, ARIA field label, keyboard submit |
| `l1-recap` | N/A (structural; no graded problem) | ✅ tap-to-reveal recap cards | ✅ correct + 3 hints (review copy) | ✅ standard recap a11y |

---

## Dept1↔Dept2 readiness check

| beat | (a) verified+sourced problem in brief? | (b) concrete mechanic + feedback in this spec? | kickback? |
|------|----------------------------------------|-----------------------------------------------|-----------|
| `l1-recall` | ✅ brief verified-problems row 1 ({1,2,3 flips}→{2,4,8}) | ✅ retrievalGrid + 3 hints | — |
| `l1-bet` | ✅ brief row 1 (2¹⁰=1,024); all 3 per-option notes verbatim from brief misconceptions section | ✅ prediction byOption | — |
| `l1-primer` | N/A (primer) | ✅ JIT card mechanic | — |
| `l1-win` | ✅ brief row 1 (2³=8); ✓ answer copy verbatim from brief; ✗ distractor notes (6="added", 3="counted flips", 9="wrong base") encoded as hint ladder | ✅ countingTree + hero | — |
| `l1-scaffold` | ✅ 2⁴=16 (extrapolated from 2ⁿ general, brief row 1) | ✅ countingTree ungraded | — |
| `l1-explore` | ✅ multiplication rule, mixed fan-out — GB p.33 §4.2; 2×3×2=12 derivable from engine `product([2,3,2])` | ✅ countingTree ungraded | — |
| `l1-multadd` | ✅ brief row 3 (3³=27, GB p.12); ✓ and ✗ answer copy verbatim from brief misconceptions section | ✅ answerEntry + 3 hints | — |
| `l1-model` | ✅ brief row 2 (3!=6, n! general, GB p.33) | ✅ countingTree shrinking + notation badge | — |
| `l1-prove` | ✅ brief row 5 (365·364·363=48,228,180, GB p.36); mastery feedback verbatim from brief; `pattern` UNSET per gate requirement | ✅ masteryChallenge + 3 hints | — |
| `l1-recap` | N/A (recap) | ✅ recap cards + L2 bridge copy | — |

**VERDICT = READY.** No kickbacks to Dept 1. All 10 beats have verified+sourced problems (or are non-graded structural beats), concrete tap/type direct-manipulation mechanics, instant feedback with 3-level hint ladders, and a11y coverage. The `countingTree` type is Wave-0-ready with the frozen Zod schema above; all engine golden values are exact BigInt integers derivable from `src/engine/combinatorics.ts`. The one new engine surface (`product`, `factorial`, `nPk`) is minimal and pure.
