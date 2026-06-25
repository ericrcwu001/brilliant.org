# Interaction Spec: Permutations & Combinations  (lesson-combinatorics-2)

**Chapter:** ch-combinatorics-1 · accent `--ch5` violet `#7C5CF0` / `--ch5-tint`  
**Beat order (10 beats):** l2-primer → l2-recall → l2-bet → l2-win → l2-scaffold → l2-explore → l2-model → l2-fraction → l2-prove → l2-recap  
**Mastery signal:** `computeMastered` keys on {l2-recall, l2-win, l2-fraction, l2-prove}  
**Hard gates:** l2-recall = first graded beat (retrievalGrid) · l2-prove = masteryChallenge required:true penultimate · l2-recap = recap last

---

| # | beatId | mechanic (manipulate → respond → loop) + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|------------------------------------------------|-----------------|--------------|--------------------------|------|------------------------|-------|
| 1 | `l2-primer` | Read collapsible card → tap chevron to expand/collapse → tap Continue | `primer` (variant `custom`) | reuse | correct: "Two tools ready — n! and exact fractions." · hints: ["Read the card, then tap Continue.", "n! = n·(n−1)·…·1. Table: 3!=6, 4!=24, 5!=120.", "A fraction like 5/54 is exact: 5 favourable out of 54 total."] | ≥44px Continue CTA; chevron keyboard-accessible (Enter toggles); collapsible card not drag-only | `--ergo-surface-2` well; `--ch5` on factorial examples in body text; collapsible chevron `--ergo-ink-3`; `--r-md` card | both |
| 2 | `l2-recall` | Tap a left item (3!, 4!, 5!) → tap its matching right value (6, 24, 120) → matched pair snaps and locks; loop until all 3 correct | `retrievalGrid` | reuse | correct: "3!=6, 4!=24, 5!=120 — the shrinking products that power nPk." · hints: ["Multiply down from n: 3·2·1=?", "4! = 4·3·2·1 = 24.", "3!=6, 4!=24, 5!=120."] | ≥44px tap cells; keyboard: arrow keys navigate grid, Enter selects; wrong pair: horizontal shake + `--bad-tint` flash; `aria-live="polite"` announces each match | `--ch5` border on matched pairs; `--ok-tint` flash on correct pair; `--bad` shake on mismatch; pairs shuffle on mount; `--shadow-sm` cell lift on hover | both |
| 3 | `l2-bet` | Tap one of 3 option chips → chip highlights; byOption note fades in below (ungraded, no loop, continue enabled immediately) | `prediction` | reuse | `byOption` (hard gate — verbatim from brief): "Same number of ways" → {note: "The classic trap — roles make order matter, so ranked slots count k!=6× more than a committee."} · "Different — the roles version is bigger" → {note: "Right — ranked roles distinguish orderings: 60 ordered vs 10 unordered, ×3! apart.", correct: true} · "Different — the committee is bigger" → {note: "They differ, but adding order can only raise the count: 60 ordered > 10 unordered."} | ≥44px option chips; keyboard: arrow keys + Enter to select; note region `aria-live="polite"` on reveal; no color-only feedback (text labels required) | `--ch5-tint` wash on selected chip; note fades in `--ergo-ink-2` below; no `--ok`/`--bad` borders (ungraded prediction); `--r-md` chips | both |
| 4 | `l2-win` | Tap items in the n=5 pool to select k=3 for ordered slots; count badge updates live with each tap; when count shows 60, tap Submit | `selectionGrid` (order=`on`) | **NEW** | correct: "Yes — 5·4·3=60; ranked slots mean order matters, each pick shrinks the pool." · hints: ["How many choices for slot 1? For slot 2? For slot 3?", "The pool shrinks with each pick: 5 choices, then 4, then 3 — multiply them.", "5·4·3 = 60."] · distractor refutations: 125→"That's 5³ (reusing people); they can't repeat → 5·4·3=60."; 10→"That's unordered C(5,3); ranked slots make order matter → ×3!=60."; 15→"Not 5×3 — multiply shrinking choices 5·4·3=60." | `aria-live="polite"` on count badge; ≥44px grid cells; Space/Enter toggles selection; Tab navigates pool → submit; no drag-only; submit btn ≥48px | Count badge `--ch5` bold JetBrains Mono `tabular-nums`; selected cells `--ch5-tint` fill + `--ch5` 2px border; deselected `--ergo-surface-2`; on correct: `--ok-tint` flash; submit btn `--ch5` fill `--r-md` `--shadow-sm` | both |
| 5 | `l2-scaffold` | Read collapsible worked example "nPk(5,3)=5·4·3" with step annotations → collapse | `primer` (variant `custom`, track A) | reuse | correct: "nPk = n!/(n−k)! — the shrinking-product formula." · hints: ["Slot 1: 5 choices; slot 2: 4 remain; slot 3: 3 remain.", "5·4·3=60 = 5!/(5−3)! = 5!/2!.", "Continue."] | ≥44px CTA; collapsible keyboard (Enter); `required:false` (track-exclusive gate) | Faded formula `--ergo-ink-3` `--font-mono`; multiplication steps highlighted `--ch5` as learner reads; `--ergo-surface-2` well; `--r-md` | A |
| 6 | `l2-explore` | Select any 3 items; flip order toggle ON↔OFF; count badge springs between 60 and 10; read the ×k! label; "wow" hero: toggle fans 3!=6 orderings out then collapses | `selectionGrid` (order=`toggle`) | **NEW** | correct: "Order ON=60(nPk), OFF=10(nCk). Gap=×3!=6 — each set of 3 has exactly 6 ordered versions." · hints: ["Set order ON first and count; then flip the toggle OFF.", "Order OFF groups k! re-orderings of each set into one — count shrinks by k!=3!=6.", "nPk(5,3)=60 ÷ 3! = 10 = nCk(5,3)."] | `aria-live="polite"` on count; `aria-live="assertive"` on the ×k! label when toggle fires; toggle = `<button role="switch" aria-checked>`; reduced-motion: skip fan, instant count update, show static final frame; ≥44px toggle + cells | **WOW / `hero`**: toggling fans 6 orderings of the selected set as ghost-cards (`transform: translateX + rotate`, compositor-only, `--dur-tell`/`--ease-spring`); count badge springs 10↔60; `--ch5` toggle control; reduced-motion final frame shows both counts in static layout. `hero:{slowFirst:true, structuralReadout:"Order ON → 60 (nPk); Order OFF → 10 (nCk); 60÷10=3!=6.", reducedMotionFinalFrame:true}`. `comparison:true`. | both |
| 7 | `l2-model` | Tap each of 3 lens cards (nPk / nCk / ×k! link) to flip and reveal body copy; all 3 revealed = convergence on value C(52,5)=2,598,960 | `tripletReveal` (display=`cards`) | reuse | correct: "nPk ordered, nCk=nPk/k! unordered. C(52,5)=2,598,960 five-card hands — the formula scales." · hints: ["Reveal the nPk card first.", "nCk = nPk/k! — divides out the k! orderings of each set.", "×k! link: nPk = nCk × k!."] | ≥44px card tap targets; keyboard: Tab to card, Enter to flip; `aria-label` per card; `aria-live` announces revealed body; all 3 cards keyboard-reachable before advance | 3-card grid `--ergo-surface`+`--shadow-sm`; card flip `--dur-slow`/`--ease-out`; all 3 revealed → `--ch5-tint` wash behind value badge; `introducesSymbol:"nPk, nCk"` `groundedBy:["l2-win","l2-explore"]` | both |
| 8 | `l2-fraction` | Type fraction for step 1 (ordering factor 1/6) → confirmed with `--ok-tint` flash; type fraction for step 2 (full prob 5/54) → confirmed; 2-step sequential, each field graded independently | `answerEntry` | reuse | correct: "Right — only 1 of 3!=6 orderings is increasing → 1/6; full P = C(6,3)/6³ = 20/216 = 5/54." · hints: ["Three distinct values have 3!=6 equally likely orderings; exactly 1 is strictly increasing → 1/3!=1/6.", "P(one specific order) = 1/6. Full prob: C(6,3)=20 triples of distinct values from 6; total outcomes 6³=216.", "Step 1: 1/6. Step 2: 20/216 = 5/54."] · distractors: 1/3→"You divided by k not k! — three values have 3!=6 orderings, 1 increasing → 1/6."; 1/2→"Order isn't 50/50 — three values have 6 equally likely orders → 1/6." | ≥48px input height; `--ring-focus` on focus; Enter advances to next field; `--bad-tint` bg on wrong; label above each field; `aria-invalid` + `aria-describedby` for error; placeholder in `--ergo-ink-3` | `--r-md` inputs; correct field: `--ok-tint` bg + `--ok` 2px border flash; fraction labels `--font-mono`; step-2 locked until step-1 correct; `maxHintLevel:3` | both |
| 9 | `l2-prove` | Read scenario (4 aces, 4 distinct piles); type answer 24; submit — **required mastery gate**; `pattern` unset (engine cross-check via combinatorics.ts) | `masteryChallenge` | reuse | correct: "Exactly — 4!=24; the piles are distinct destinations, so the aces' order matters." · hints: ["Each ace lands in a different pile — are the 4 piles distinguishable?", "The piles are distinct (each player's hand) → 4 distinct slots → 4! = 4·3·2·1.", "4! = 24."] · distractors: 1→"The aces look identical, but the four piles are distinct → 4!=24."; 16→"Not 4² — each ace lands in a different pile → 4·3·2·1=24."; 256→"That's 4⁴ (reusing piles); each pile gets one ace → 4!=24." | ≥48px input; Enter submits; `--ring-focus`; `--bad-tint` on wrong; scenario card `aria-label`; `required:true` enforced by Cloud Function; `maxHintLevel:3` | Scenario card `--ergo-surface-2` `--r-md`; on correct: `--ch5` mastery badge + `--ok-tint` flash; `--bad` shake on wrong; `pattern` field **absent** in fixture | both |
| 10 | `l2-recap` | Tap/scroll recap cards; read bridge text to L3 (binomial coefficients + enrichment 52! shuffle) | `recap` | reuse | correct: "Order matters → nPk; order doesn't → nCk=nPk/k!. These nCk are the binomial coefficients — L3 builds Pascal's triangle from them." · hints: ["Order matters → nPk = n!/(n−k)!.", "Order doesn't → nCk = nPk/k! = n!/(k!(n−k)!).", "L3 preview: every nCk is a binomial coefficient."] | ≥44px recap cards; keyboard: Tab to each card, Enter reveals; `aria-label` per card; full lesson completable at zero motion | Cards `--ergo-surface`+`--shadow-sm`; `--ch5` accent on formula tokens `--font-mono`; quiet `--dur-base` fade-in stagger on enter; lesson-complete: `--ch5` light-streak arc (GSAP, compositor-only, `--celebrate-beat`); NO confetti | both |

---

## New interaction types (for Wave 0)

### `selectionGrid`

**Purpose:** Pick k of n with an order on/off toggle so the learner *feels* nPk vs nCk on the *same* selection — always exactly ×k! apart. DOM/SVG grid; tap to select; toggle recomputes the count live via the engine.

**Frozen Zod schema (verbatim — do not diverge):**

```ts
z.object({
  type: z.literal('selectionGrid'),
  n: z.number().int().positive(),           // pool size (e.g. 5)
  k: z.number().int().positive(),           // choose k (e.g. 3)
  order: z.enum(['toggle', 'on', 'off']),   // 'toggle' = learner flips order on/off
  labels: z.array(z.string()).optional(),   // item labels; default 1..n
  accept: z.array(z.string()).optional(),   // present → graded on current count (normalized)
})
```

**Renderer:** `SelectionGridBeat.tsx`  
**Engine dep:** `src/engine/combinatorics.ts` — `factorial(n)`, `nPk(n,k)`, `nCk(n,k)`, `reduce(n,d):{n,d}`

**Used in this lesson:**

| beat | order | accept | graded? |
|------|-------|--------|---------|
| l2-win | `on` | `["60"]` | yes — submits ordered count |
| l2-explore | `toggle` | absent | no — ungraded exploration; hero beat |

**Wave 0 registration checklist:**
- Add `selectionGrid` variant to `InteractionSchema` discriminated union in `src/content/schema.ts`
- Add `selectionGrid` to `GRADED_TYPES` set in `scripts/validate-fixtures.ts` (conditional on `accept` present)
- Add `SelectionGridBeat` to the `BeatView` dispatcher switch in `src/lesson/beats/index.tsx`
- Add `SelectionGridBeat.tsx` renderer in `src/lesson/beats/`
- Add `lesson-combinatorics-1`, `lesson-combinatorics-2`, `lesson-combinatorics-3`, `lesson-combinatorics-4` to `GATED` and `MASTERY_LESSONS` in `scripts/validate-fixtures.ts`
- Extend `validate-fixtures` to engine-cross-check the combinatorics `accept` values (call `nPk`/`nCk`/`reduce` from the engine and compare against fixture `accept` strings)

---

## Build decomposition (for Dept 3)

### Engine: `src/engine/combinatorics.ts`

Pure, dependency-free, BigInt, exact integers — no floats. Matches the engine discipline of `src/engine/kmp.ts`.

| function | signature | golden values (two-stage fact-check) |
|----------|-----------|--------------------------------------|
| `factorial(n)` | `(n: number): bigint` | `factorial(3)=6n`; `factorial(4)=24n`; `factorial(5)=120n` |
| `nPk(n, k)` | `(n: number, k: number): bigint` | `nPk(5,3)=60n` (GB p.33–34) |
| `nCk(n, k)` | `(n: number, k: number): bigint` | `nCk(5,3)=10n`; `nCk(6,3)=20n`; `nCk(52,5)=2598960n` (GB p.34) |
| `reduce(n, d)` | `(n: bigint, d: bigint): {n: bigint, d: bigint}` | `reduce(20n,216n)={n:5n,d:54n}`; `reduce(1n,6n)={n:1n,d:6n}` |

Cross-check anchors:
- `nCk(5,3) === nPk(5,3) / factorial(3)` → `10 === 60 / 6` ✓
- `reduce(nCk(6,3), 6n**3n)` → `reduce(20n, 216n) = {n:5n,d:54n}` ✓ (GB p.40)
- `factorial(4) === 24n` ✓ (GB p.42)
- `nCk(52n,5n) === 2598960n` ✓ (GB p.34)

### Schema: `src/content/schema.ts`

Add the frozen `selectionGrid` variant (see above) to the `InteractionSchema` `z.discriminatedUnion`. No other changes.

### Renderer + props: `src/lesson/beats/SelectionGridBeat.tsx`

**Component interface (props):**

```ts
interface SelectionGridBeatProps {
  n: number                        // pool size
  k: number                        // choose k
  order: 'toggle' | 'on' | 'off'  // order mode
  labels?: string[]                // item labels; default ["1","2",…,"n"]
  accept?: string[]                // present → graded; absent → advance CTA
  onSubmit: (count: string) => void
  onAdvance: () => void
  hintLevel: number                // 0–3; drives hint ladder
}
```

**Internal state:** `selected: Set<number>` (0-indexed item indices); `orderedMode: boolean` (true when `order==='on'` or toggle-currently-on).

**Count computation (live, pure):**
- Selection size < k: count = "—" (incomplete selection)
- Selection size === k, orderedMode true: `nPk(n, k)`
- Selection size === k, orderedMode false: `nCk(n, k)`
- Count is computed in a `useMemo` and displayed in the count badge; `aria-live="polite"` on that element

**Order toggle recompute (l2-explore hero):**
1. User clicks toggle → `setOrderedMode(!orderedMode)`
2. On each toggle, if selection is complete (size===k): trigger the fan animation
3. Fan animation: render `k!` ghost-card clones of the k selected items, each animated with `transform: translateX(…) rotate(…) opacity(0→1→0)` at staggered `--dur-tell`/`--ease-spring` delays (compositor-only via `motion`)
4. Count badge: spring transition between `nCk` ↔ `nPk` values with `--dur-base`/`--ease-spring`
5. `aria-live="assertive"` fires on the ×k! label ("×3!=6") after the transition
6. Reduced motion: skip fan entirely; count updates instantly; show static label with both values

**Keyboard contract:**
- Pool items: `role="checkbox"`, `aria-checked`, Space/Enter toggles selection
- Order toggle: `role="switch"`, `aria-checked={orderedMode}`, Space/Enter flips
- Tab order: pool items left-to-right, then toggle (if present), then submit/advance
- Focus ring: `--ring-focus` (`0 0 0 3px rgba(79,70,229,.35)`)

**Recommended DOM structure:**

```html
<section aria-label="Selection grid">
  <div role="group" aria-label="Pool — choose {k}">
    <!-- n buttons -->
    <button role="checkbox" aria-checked="false" class="pool-item">Anya</button>
    …
  </div>

  <!-- only when order==='toggle' -->
  <button role="switch" aria-checked="true" class="order-toggle">
    Order: ON
  </button>

  <p aria-live="polite" class="count-badge">Count: 60</p>

  <!-- only when accept present (graded) -->
  <button class="submit-btn">Submit</button>
</section>
```

### Fixture fields (match `lesson-overlap-shortcut.json` shape)

**Top-level lesson document `fixtures/lesson-combinatorics-2.json`:**

```json
{
  "lessonId": "lesson-combinatorics-2",
  "courseId": "course-combinatorics",
  "title": "Permutations & Combinations",
  "patternOptions": [],
  "milestoneId": "combinatorics-perms-mastered",
  "unlocks": "lesson-combinatorics-3",
  "schemaVersion": 1,
  "beats": [...]
}
```

**Key fields per beat type:**

| beat | notable fixture fields |
|------|----------------------|
| l2-primer | `required:false`, `interaction:{type:"primer",variant:"custom",title:"n! and fractions — a quick refresh",body:"…",collapsible:true}`, no `track` (defaults to both) |
| l2-recall | `required:true`, `interaction:{type:"retrievalGrid",pairs:[{left:"3!",right:"6"},{left:"4!",right:"24"},{left:"5!",right:"120"}]}` |
| l2-bet | `required:true`, `interaction:{type:"prediction",options:["Same number of ways","Different — the roles version is bigger","Different — the committee is bigger"]}`, `feedback:{byOption:{…}}` |
| l2-win | `required:true`, `interaction:{type:"selectionGrid",n:5,k:3,order:"on",labels:["Anya","Ben","Cara","Dan","Eva"],accept:["60"]}`, `maxHintLevel:3`, `interviewNote:"…"` |
| l2-scaffold | `required:false`, `track:"A"`, `interaction:{type:"primer",variant:"custom",…}` |
| l2-explore | `required:false`, `interaction:{type:"selectionGrid",n:5,k:3,order:"toggle",labels:["Anya","Ben","Cara","Dan","Eva"]}`, `hero:{slowFirst:true,structuralReadout:"Order ON → 60 (nPk); Order OFF → 10 (nCk). 60÷10=3!=6.",reducedMotionFinalFrame:true}`, `comparison:true` |
| l2-model | `required:false`, `interaction:{type:"tripletReveal",value:"C(52,5)=2,598,960",display:"cards",lenses:[…]}`, `introducesSymbol:"nPk, nCk"`, `groundedBy:["l2-win","l2-explore"]`, `interviewNote:"…"` |
| l2-fraction | `required:true`, `interaction:{type:"answerEntry",fields:[{id:"step1",label:"P(one specific order of 3 values)",accept:["1/6"],placeholder:"?/?",suffix:""},{id:"step2",label:"P(strictly increasing)",accept:["5/54","20/216"],placeholder:"?/?",suffix:""}]}`, `maxHintLevel:3` |
| l2-prove | `required:true`, `interaction:{type:"masteryChallenge",scenario:"The aces look identical in rank — but the 4 piles are distinct destinations. Does order matter here?",fields:[{id:"aces",label:"Number of arrangements",accept:["24"],placeholder:"?",suffix:"arrangements"}]}`, `maxHintLevel:3`, **`pattern` field absent** |
| l2-recap | `required:true`, `interaction:{type:"recap"}` |

---

## DoR gap closures

### 1. Primer (variant `custom`) — required by spec

**`l2-primer`** (beat 1, both tracks, `required:false`):
- **title:** "n! and fractions — a quick refresh"
- **body:** "**n! (n factorial)** = n·(n−1)·…·1. Quick table: 3!=6, 4!=24, 5!=120. An **exact fraction** like 5/54 means 5 favourable outcomes out of 54 total — no decimals, no rounding. These two tools power everything in this lesson."
- **collapsible:** true (collapses after first read; Track B learners can skip)

### 2. Track-A scaffold (track:`A`, required:`false`) — required by spec

**`l2-scaffold`** (beat 5, track A only):
- **title:** "nPk(5,3) = 5·4·3 — the shrinking-product structure"
- **body:** "Slot 1: 5 choices. Slot 2: 4 remain (the chosen person can't reappear). Slot 3: 3 remain. Product: 5·4·3 = 60. General: nPk = n·(n−1)·…·(n−k+1) = n!/(n−k)!."
- **visual treatment:** faded formula in `--ergo-ink-3`/`--font-mono`; multiplication steps highlighted `--ch5` in sequence; `--ergo-surface-2` well
- **placement rationale:** sits after `l2-win` (beat 4) so Track A learners can anchor the formula before the toggle exploration. Track B jumps directly to `l2-explore`.

### 3. `interviewNote` (≥1 per lesson — hard gate)

**`l2-win`** (beat 4):
> "The 52! possible orderings of a full 52-card deck (Knuth/Fisher–Yates shuffle, GB p.89) are nP52 = 52! — nPk with k=n. Every permutation equally likely. That's the natural scale-up from 5·4·3 = 60."

**`l2-model`** (beat 7):
> "C(52,5) = 2,598,960 total five-card hands (GB p.34). Four-of-a-kind = 13 × 48 = 624 (13 ranks × 48 remaining cards). Any combinatorics interview question about card games bottoms out at C(52,5) and these counts."

---

## Definition-of-Ready checklist (every beat)

| beat | ☑ verified+sourced problem | ☑ concrete interactive mechanic | ☑ instant feedback + 3-level hints | ☑ a11y (44px / reduced-motion / aria-live) |
|------|---------------------------|--------------------------------|-------------------------------------|---------------------------------------------|
| l2-primer | N/A (prerequisite concept primer; no problem) | Expand/collapse card + Continue CTA | correct + 3 hints provided | ≥44px CTA; collapsible keyboard-accessible |
| l2-recall | GB p.33 §4.2 (3!=6, 4!=24, 5!=120) | Tap-match retrievalGrid | correct + 3 hints | ≥44px cells; keyboard nav; aria-live matches |
| l2-bet | GB p.33–34; per-option copy verbatim from brief | Tap prediction option chip | byOption (hard gate — 3 options) | ≥44px chips; keyboard; aria-live note reveal |
| l2-win | GB p.33–34 nPk(5,3)=60 ☑ engine ☑ source | selectionGrid order=on; tap-select + submit | correct + 3 hints + distractor refutations | aria-live count; ≥44px cells; Space/Enter |
| l2-scaffold | GB p.33–34 nPk formula (derived from l2-win) | Expand/collapse primer | correct + 3 hints | ≥44px CTA; keyboard |
| l2-explore | GB p.33–34 nPk=60, nCk=10 ☑ engine; ×k! gap | selectionGrid order=toggle + hero animation | correct + 3 hints | aria-live count+label; toggle keyboard; reduced-motion final frame |
| l2-model | GB p.33–34; C(52,5)=2,598,960 GB p.34 ☑ source | Tap-reveal tripletReveal cards (3 lenses) | correct + 3 hints | ≥44px cards; keyboard reveal; aria-live |
| l2-fraction | GB p.40 §4.2 "Dice order" 1/3!=1/6; 20/216=5/54 ☑ engine ☑ source | 2-field answerEntry sequential | correct + 3 hints + distractor refutations | ≥48px inputs; --ring-focus; aria-invalid |
| l2-prove | GB p.42 §4.2 "aces into piles" 4!=24 ☑ engine ☑ source | masteryChallenge type-in (required) | correct + 3 hints + distractor refutations | ≥48px; Enter submit; aria-label on scenario |
| l2-recap | Bridge to L3 in brief (binomial coefficients) | Tap/swipe recap cards | correct + 3 hints | ≥44px cards; keyboard scroll |

**All 10 beats: ☑ ☑ ☑ ☑**

---

## Dept 1 ↔ Dept 2 Readiness Check

### Per-beat

| beat | (a) Dept 1 problem verified+sourced | (b) Dept 2 mechanic designable |
|------|-------------------------------------|-------------------------------|
| l2-primer | ✅ prerequisite concepts (n!, fractions) scoped from L1 continuity — no new source needed | ✅ primer variant custom; spec authorizes this beat |
| l2-recall | ✅ GB p.33 §4.2 — 3!=6, 4!=24, 5!=120 confirmed | ✅ retrievalGrid; 3 pairs defined |
| l2-bet | ✅ GB p.33–34; all 3 per-option feedback strings verbatim in brief | ✅ prediction; byOption satisfied; option strings match keys |
| l2-win | ✅ GB p.33–34 nPk(5,3)=60 ☑ engine ☑ source; per-option copy in brief | ✅ selectionGrid order=on; accept=["60"]; graded |
| l2-scaffold | ✅ derived from l2-win content (same GB source); no new problem | ✅ primer variant custom track A; required:false |
| l2-explore | ✅ GB p.33–34 nPk=60, nCk=10 ☑ engine; ×3!=6 relationship | ✅ selectionGrid order=toggle; hero block designed; comparison:true |
| l2-model | ✅ GB p.33–34 formulas + C(52,5)=2,598,960 GB p.34 ☑ source | ✅ tripletReveal cards; introducesSymbol + groundedBy set |
| l2-fraction | ✅ GB p.40 §4.2 "Dice order": 1/3!=1/6; 5/54=nCk(6,3)/6³ ☑ engine ☑ source | ✅ answerEntry; 2 fields; accept=["1/6"], ["5/54","20/216"] |
| l2-prove | ✅ GB p.42 §4.2 "four aces into four piles" = 4!=24 ☑ engine ☑ source | ✅ masteryChallenge required:true; pattern absent; scenario copy ready |
| l2-recap | ✅ bridge to L3 (binomial coefficients) confirmed in brief | ✅ recap; last beat |

### Kickbacks to Dept 1

**None.** The brief is complete in all material respects:
- All 8 original beats carry verified+sourced problems (two-stage ☑ engine ☑ source checks pass).
- Per-option feedback copy for `l2-bet` is verbatim in the brief's misconceptions section and is used without modification.
- The mastery challenge answer (24) and the dice-probability answers (1/6, 5/54) are engine-verified and source-verified.
- `l2-primer` and `l2-scaffold` are Dept 2 insertions authorized by the spec; they reuse existing content from L1 and l2-win respectively and do not require new Dept 1 source problems.

### VERDICT: **READY**

All 10 beats satisfy DoR. No Dept 1 fixes needed before Dept 3 implementation begins.

**Wave 0 items to freeze before Dept 3 starts:**
1. Engine fns: `factorial(n)`, `nPk(n,k)`, `nCk(n,k)`, `reduce(n,d)` in `src/engine/combinatorics.ts` — BigInt, exact, no floats
2. Schema: `selectionGrid` variant added to `InteractionSchema` union in `src/content/schema.ts`
3. Renderer: `SelectionGridBeat.tsx` with tap/keyboard, `aria-live` count, order toggle, hero fan animation, reduced-motion final frame
4. Validate-fixtures: `selectionGrid` → `GRADED_TYPES`; `lesson-combinatorics-1..4` → `GATED` + `MASTERY_LESSONS`; engine cross-check for combinatorics `accept` values
