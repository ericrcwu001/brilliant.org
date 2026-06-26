# Interaction Spec: Multi-Step Transitions  (lesson-markov-chains-3)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type, the
> `src/engine/markov.ts` engine, and the validate-fixtures edits live in `../wave0-contracts.md` (§1, §3,
> §4, §6) — this spec maps every Dept-1 beat to a real interaction type and supplies the per-beat feedback
> ladder, a11y, and Definition-of-Ready. L3's two `chainBoard` beats use `display:'powers'`, which is
> **DOM/SVG + CSS** (no Konva — `ChainGraph` is the `diagram`-only widget).
>
> **Lesson-level fixture facts** (see wave0 §5a): `courseId:'course-markov-chains'`,
> `patternOptions:["H"]` (safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])`
> and no Markov beat reads the automaton; no `chainBoard`/reuse beat triggers the `buildAutomaton`
> cross-check), `milestoneId:'markov-chains-multistep'`, `unlocks:'lesson-markov-chains-4'`,
> `schemaVersion:1`. Glyph `Pⁿ`, viz `fourNode`.
>
> **Worked chains.** Land of Oz `P_oz = [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]`, labels
> `["Rain","Nice","Snow"]` (Grinstead & Snell Ch.11, Table 11.1). Two-state warm-up
> `P_wx = [[3/5,2/5],[3/10,7/10]]`, labels `["Clear","Rainy"]` (Math.SE 3336273). Every graded number is an
> exact rational reproduced by `markov.ts matrixPower`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-total-prob` | Tap a move on the left → pick its match on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag targets ≥44px; `aria-live` status mirror (renderer built-in) | none (tap) | both |
| 2 | `predict-two-day-snow` | Pick one chip (`1/8` / `1/4` / `1/16` / `3/8`) → per-option note appears → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-chapman-kolmogorov` | Read/expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A |
| 4 | `warmup-two-step` | Type `(P²) Clear→Clear` as a fraction → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` | text input ≥44px; Enter submits; `FeedbackStrip` `aria-live` | none | both |
| 5 | `explore-powers` | Step `n` from 1 → 2; each `P²` cell fills as a sum of path-products; the Rain→Snow cell resolves to `3/8` → Continue | `chainBoard` `display:'powers'` | **NEW** | `display`,`matrix`(`P_oz`),`labels`,`task:'entry'`,`step:2`,`cell:{row:0,col:2}`,`interactive:true`,`headline:'3/8'` + beat-level `hero` | step control = range/buttons ≥44px (arrow-key steppable); cells ≥44px; visually-hidden `aria-live` Pⁿ-entry mirror; reduced-motion → final collapsed `P²` | DOM/SVG `Pⁿ` grid, CSS cell-fill transition; slow-first per `hero.slowFirst` | both |
| 6 | `prove-two-day-snow` | Type `(P²) Rain→Snow` as a fraction → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` | text input ≥44px; Enter submits; `aria-live` | none | both |
| 7 | `read-another-entry` | Tap the Rain→Rain cell of `P²` → it expands into its three path-products → commit/Check the value `7/16` | `chainBoard` `display:'powers'` | **NEW** | `display`,`matrix`(`P_oz`),`labels`,`task:'entry'`,`step:2`,`cell:{row:0,col:0}`,`interactive:true`,`headline:'7/16'` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | tapped cell = button ≥44px; `aria-live` entry mirror; reduced-motion → static `P²` grid | DOM/SVG grid; CSS tap-expand highlight | both |
| 8 | `model-ck-three-ways` | Reveal each of three lenses → they converge on `3/8` | `tripletReveal` | reuse | `value:'3/8'`, `lenses:[{label,body}]` (×3), `display:'cards'` + beat-level `interviewNote` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 9 | `mastery-three-day-snow` | Type `P(Snow in 3 days \| Rain) = (P³)Rain,Snow` → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

## Remaps vs. Dept-1 brief

The Dept-1 brief's beat-by-beat type assignments are followed **1:1** — no surprising remaps. The two design
decisions worth stating explicitly (all consistent with wave0 §1):

- **Numeric PROVE / warm-up beats are type-in `answerEntry`, not `chainBoard`.** `warmup-two-step` (12/25) and
  `prove-two-day-snow` (3/8) require the learner to **produce the exact rational**, so they are graded type-ins
  with the standard hint ladder. `chainBoard:powers` is the **explore/read** surface (watch `Pⁿ` fill / read an
  entry), not a fraction type-in — keeping the two mechanics distinct mirrors the Bayes split between
  `answerEntry` (compute) and `bayesUpdate` (manipulate).
- **`explore-powers` and `read-another-entry` are the `chainBoard:powers` surface.** `explore-powers` carries
  the `hero` block ⇒ ungraded "watch it resolve" (primary = Continue); `read-another-entry` omits `hero` ⇒
  graded (primary = Check, the renderer cross-checks the tapped-cell value against `matrixPower` truth). This is
  the wave0 §1 grading rule (graded ⇔ no `hero`), reused exactly as `bayesUpdate` does — no new flag.
- **`mastery-three-day-snow` is a PURE `masteryChallenge` type-in — NOT a `chainBoard`, and no `pattern`.** L3's
  brief never asked to "wrap" mastery over `chainBoard` (that §1 note targets L2/L4/L8/L9 only), so the
  penultimate beat is a plain gate-required type-in of `(P³)Rain,Snow = 25/64`. `masteryChallenge` and
  `chainBoard` are distinct schema members and are never combined in one beat (wave0 §1; R-4: leaving `pattern`
  unset skips the `buildAutomaton(pattern).E0 ∈ accept` mastery cross-check, which a Markov fraction would fail).

No other remaps in L3. Every other beat maps 1:1 to an existing real type.

## New interaction types (Wave 0)

**`chainBoard` `display:'powers'` — the only NEW type used in this lesson** (everything else reuses a shipped
renderer). Frozen shape in `../wave0-contracts.md` §1; do **not** widen it.

- **Used by 2 beats**, both `task:'entry'` on the Land of Oz chain `P_oz`, `labels:["Rain","Nice","Snow"]`,
  `step:2`:
  - `explore-powers` — `hero` (ungraded), `cell:{row:0,col:2}` (Rain→Snow), `headline:'3/8'`, `interactive:true`.
  - `read-another-entry` — graded (no `hero`), `cell:{row:0,col:0}` (Rain→Rain), `headline:'7/16'`,
    `interactive:true`, `feedback{correct,hints[3]}`.
- **Renderer `ChainBoardBeat.tsx`** (wave0 §3): the `powers` sub-view is a **DOM/SVG grid** that iterates
  `matrixPower(P, k)` for `k = 1…step` with CSS cell-fill transitions; a tapped `cell` expands into its
  `row i · column j` path-products and reads the engine value (never hardcoded; formatted by `formatRational`).
  Hero mode = slow-first iterate `P¹ → P²`, primary Continue, writes nothing graded; graded mode = primary
  Check, hint ladder via `useHintLadder` + `FeedbackStrip`, reaching reveal calls `reportNeedsReview`. **No
  Konva** for `powers` (`ChainGraph.tsx` serves `display:'diagram'` only). Dispatcher `case 'chainBoard'`
  (wave0 §2) routes both beats.
- **Engine `markov.ts matrixPower(P, n)`** (wave0 §4): exact-rational `Pⁿ` (Chapman–Kolmogorov);
  `matrixPower(P,0)=I`, `matrixPower(P,1)=P`. One engine fn covers all four graded numbers this lesson.
- **Gate / validation:** `chainBoard` is **NOT** in `HERO_TYPES` or `GRADED_TYPES` (wave0 §6). Every
  `chainBoard` beat with a `headline` is recomputed and asserted by the §6c cross-check (including the hero).

## Feedback + hint ladders (actual copy)

Hint-ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]` = Hint 1 (gentle),
`hints[1]` = Hint 2 (the misconception refutation), `hints[2]` = Hint 3 = the **revealed answer** (label flips to
"Answer"; "Try again" resets). `required` graded beats that ever reach reveal report `needsReview`.

**1 · `recall-total-prob`** — `correct` + `hints[3]` + pairs
- correct: "A multi-step chance is **not** one product — you condition on the first step and sum over where you land. That's the law of total probability; net-new this lesson is that **matrix powers do that summing automatically, at every step**."
- hints: `["Warm-up from Penney's first-step analysis and Bayes — no pressure.", "A multi-step chance isn't a single path's product: split on the first step and add the cases.", "First-step split = total probability = the move Pⁿ automates."]`
- pairs: `"Condition on the first step (Penney's)"→"split a multi-step chance by where step 1 lands"`, `"Law of total probability (Bayes, count-the-defects)"→"P(E) = Σᵢ P(E | caseᵢ)·P(caseᵢ)"`, `"bayes.ts sequentialPosterior"→"apply one step, then total-probability over where you land"`

**2 · `predict-two-day-snow`** — `byOption` (+ fallback `hints`)
- `"1/8 — it's the one story Rain→Nice→Snow"` → `{note:"Rain→Nice→Snow is one way, worth 1/8 — but snow-in-two-days can also come Rain→Rain→Snow (1/8) and Rain→Snow→Snow (1/8). It's all three: 1/8+1/8+1/8 = 3/8.", correct:false}`
- `"1/4 — that's P(Rain→Snow) in one day"` → `{note:"1/4 is the ONE-step chance. Two days means an intermediate day you must pass through and sum over — that's P², not P.", correct:false}`
- `"1/16 — square the one-step chance"` → `{note:"(1/4)² = 1/16 is 'square each entry'. But (P²)ᵢⱼ is row·column — a sum of products, not a square.", correct:false}`
- `"3/8 — add up all three two-day paths"` → `{note:"Right — sum the three Rain→Snow paths (each 1/8) → 3/8. (Pⁿ)ᵢⱼ is the bookkeeping that never lets you drop a path.", correct:true}`
- hints: `["No wrong guess yet — commit and we'll trace the paths.", "Snow in two days has more than one route — one path vs the sum.", "Three paths, each 1/8 → 3/8."]`

**3 · `name-chapman-kolmogorov`** (primer; copy = caption/aria)
- correct: "n-step transition probability = (Pⁿ)ᵢⱼ. Chapman–Kolmogorov: Pᵐ⁺ⁿ = Pᵐ·Pⁿ."
- hints: `["One step is P; n steps is Pⁿ.", "(Pⁿ)ᵢⱼ already sums every length-n path i→j — that's Chapman–Kolmogorov.", "Compose by multiplying (Pᵐ⁺ⁿ = Pᵐ Pⁿ), not by adding."]`
- title: "n-step probabilities: Pⁿ and Chapman–Kolmogorov"
- body: "The chance of going from state *i* to state *j* in exactly *n* steps is a single entry of the matrix power: **(Pⁿ)ᵢⱼ**. It already adds up every length-*n* path from *i* to *j*, because matrix multiplication applies the law of total probability one step at a time. **Chapman–Kolmogorov** names this: Pᵐ⁺ⁿ = Pᵐ·Pⁿ — split an (m+n)-step trip at the intermediate state and sum over it."

**4 · `warmup-two-step`** — graded `correct` + `hints[3]` + field
- correct: "(P²)cc = (3/5·3/5) + (2/5·3/10) = 9/25 + 3/25 = **12/25**. Two ways to be clear in two days: stay clear, or detour through rainy."
- hints: `["Two days Clear→Clear: list the ways the MIDDLE day could go.", "(P²)cc isn't (3/5)² = 9/25 — that's only Clear→Clear→Clear; you dropped the via-rainy path.", "Add Clear→Rainy→Clear (2/5·3/10 = 3/25): 9/25 + 3/25 = 12/25."]`
- field: `{id:"cc", label:"(P²) Clear→Clear", accept:["12/25"], placeholder:"e.g. 2/5"}`

**5 · `explore-powers`** (ungraded hero; copy = aria/caption)
- correct: "Watch P¹ become P²: each entry fills as a **sum of path-products**, and every row still sums to 1. The Rain→Snow entry lands at 3/8 — the three two-day paths, added."
- hints: `["Step n from 1 to 2 and watch the Rain→Snow cell fill.", "Pⁿ ≠ square each entry, and ≠ P+P — you compose by MULTIPLYING (P·P); squaring or adding breaks the row-sum-to-1 law.", "Each (P²)ᵢⱼ = row i · column j; the Rain→Snow cell sums to 3/8."]`
- `hero` = `{slowFirst:true, structuralReadout:"(P²)Rain,Snow = (½·¼) + (¼·½) + (¼·½) = 1/8+1/8+1/8 = 3/8 — three paths, one entry.", reducedMotionFinalFrame:true}`

**6 · `prove-two-day-snow`** — graded `correct` + `hints[3]` + field
- correct: "Decompose by the middle day: R→R→S (½·¼) + R→N→S (¼·½) + R→S→S (¼·½) = 1/8+1/8+1/8 = **3/8**. The intermediate state is exactly what you sum over."
- hints: `["List the three middle days — the chain can pass through Rain, Nice, or Snow.", "Don't stop at one path (1/8): Rain→Nice→Snow is just one of three two-day routes to snow.", "1/8 + 1/8 + 1/8 = 3/8."]`
- field: `{id:"rs2", label:"(P²) Rain→Snow", accept:["3/8"], placeholder:"e.g. 1/4"}`

**7 · `read-another-entry`** — graded `correct` + `hints[3]` (chainBoard `powers`, tapped cell)
- correct: "(P²)Rain,Rain = (½·½) + (¼·½) + (¼·¼) = 1/4 + 1/8 + 1/16 = **7/16**. Even the diagonal is a path-sum, not just 'stay put' — and row Rain of P² = (7/16, 3/16, 3/8) sums to 1."
- hints: `["Tap the Rain→Rain cell of P² and read what it sums.", "The 2-step diagonal isn't only Rain→Rain→Rain (1/4): add the come-back paths Rain→Nice→Rain and Rain→Snow→Rain.", "1/4 + 1/8 + 1/16 = 7/16."]`
- graded manipulation: the learner taps the `cell:{row:0,col:0}` of the `P²` grid; it expands into its three `row·column` path-products and the value resolves; Check confirms the entry against `matrixPower(P_oz,2)[0][0]` (= `headline:'7/16'`). aria-live mirror: "(P²) Rain to Rain = 7 in 16, summed from three paths."

**8 · `model-ck-three-ways`** (ungraded reveal; tripletReveal) + interviewNote
- correct: "Sum-over-paths, the row × column matrix product, and one-step total probability are the **same computation** — all land on (P²)Rain,Snow = **3/8**."
- hints: `["Reveal each lens.", "Matrix powers aren't a new trick — they're total probability, composed (the same move you used in Bayes).", "All three roads give 3/8."]`
- lenses: `{label:"Sum over paths", body:"R→R→S + R→N→S + R→S→S = ½·¼ + ¼·½ + ¼·½ = 1/8+1/8+1/8 = 3/8"}`, `{label:"Row × column", body:"(P²)Rain,Snow = (row Rain of P)·(col Snow of P) = [½,¼,¼]·[¼,½,½]ᵀ = 3/8"}`, `{label:"One step of total probability", body:"P(Snow in 2 | Rain) = Σₖ P(Rain→k)·P(k→Snow) — condition on the middle day, then add (cf. bayes.ts sequentialPosterior)"}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L3): "The n-step transition probability is the (i,j) entry of Pⁿ — interviewers check that you **sum over the intermediate state**, not just multiply one path. (P²)ᵢⱼ = Σₖ pᵢₖpₖⱼ is the law of total probability with the middle step as the cases."

**9 · `mastery-three-day-snow`** — graded `correct` + `hints[3]` + scenario + field
- correct: "Let Pⁿ do the summing: (P³)R,S = (P²·P)R,S = 7/16·¼ + 3/16·½ + 6/16·½ = 7/64 + 6/64 + 12/64 = **25/64** (the sum of all nine length-3 Rain→Snow paths)."
- hints: `["Three days = one more step. Reuse the P² row for Rain you just found: (7/16, 3/16, 6/16).", "Three steps isn't picking one 3-edge path — sum over BOTH intermediate days, or just do one more P·P.", "7/16·¼ + 3/16·½ + 6/16·½ = 25/64."]`
- scenario: "Same Land of Oz chain. It **rained today**. Three days from now, what's the chance it's **snowing**? — i.e. (P³)Rain,Snow."
- field: `{id:"rs3", label:"P(Snow in 3 days | Rain) = (P³)Rain,Snow", accept:["25/64"], placeholder:"e.g. 3/8"}` — **no `pattern`**

**10 · `recap`** (generate-then-reveal; `correct` = principle, `hints` = takeaways)
- correct: "The chance of getting from *i* to *j* in *n* steps is one number — **(Pⁿ)ᵢⱼ** — and it already sums every length-*n* path, because matrix multiplication is the law of total probability applied one step at a time."
- hints: `["Two-day snow after rain is 3/8 — three paths of 1/8, not the single 1/8 story.", "Every Pⁿ entry is a row·column path-sum; the rows always sum to 1.", "Next up: keep multiplying and Pⁿ settles — the rows converge to one stationary distribution."]`

## Build decomposition

- **Engine (`src/engine/markov.ts`).** L3 needs exactly one engine call: `matrixPower(P, n)` (exact rational,
  Chapman–Kolmogorov). `markov.test.ts` pins this lesson's goldens (wave0 §4 rows 2–4, 6):
  `matrixPower(oz,2)[0][2] = '3/8'`, `matrixPower(oz,2)[0][0] = '7/16'`,
  `matrixPower(weather,2)[0][0] = '12/25'`, `matrixPower(oz,3)[0][2] = '25/64'`. Plus `formatRational` for the
  cross-check. All four graded numbers (warm-up, prove, read, mastery) are `matrixPower` reads — one fn, whole
  lesson.
- **Schema (`src/content/schema.ts`).** No edit beyond the frozen `chainBoard` append (wave0 §1; reuses
  `RationalSchema`, no new primitive). L3 uses `display:'powers'`, `matrix`, `labels`, `task:'entry'`, `step`,
  `cell`, `interactive`, `headline` (+ beat-level `hero`/`feedback`). Reuse members unchanged: `retrievalGrid`,
  `prediction` (+`byOption` feedback), `primer`, `answerEntry`, `tripletReveal`, `masteryChallenge`, `recap`.
- **Renderer / widget (`src/lesson/beats/ChainBoardBeat.tsx`).** `powers` sub-view = DOM/SVG grid iterating
  `matrixPower(P,k)` for `k = 1…step` with CSS cell-fill transitions; a tapped `cell` expands into its
  `row·column` path-products and reads the value. `explore-powers` (hero): slow-first `P¹→P²`, primary
  Continue. `read-another-entry` (graded): primary Check, `useHintLadder` + `FeedbackStrip`, tapped-cell value
  cross-checked vs `matrixPower` truth, reveal → `reportNeedsReview`. Reduced-motion → final collapsed `P²`.
  Dispatcher `case 'chainBoard'` (wave0 §2) already routes both.
- **Fixture (`fixtures/lesson-markov-chains-3.json`).** Header per wave0 §5a (`course-markov-chains`,
  `["H"]`, `markov-chains-multistep`, `lesson-markov-chains-4`, `schemaVersion:1`). 10 beats as above; both
  `chainBoard:powers` beats carry `matrix = P_oz`, `labels = ["Rain","Nice","Snow"]`, `task:"entry"`,
  `step:2`; `explore-powers` adds `cell:{row:0,col:2}` + `hero` + `headline:"3/8"`; `read-another-entry` adds
  `cell:{row:0,col:0}` + `headline:"7/16"`. Course node carries `glyphKey:"Pⁿ"`, `vizKey:"fourNode"` in
  `course-markov-chains.json` (wave0 §5b).

## Definition-of-Ready checklist

| beatId | verified + sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|----------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-total-prob | n/a (recall of Penney's / Bayes) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| predict-two-day-snow | 3/8 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-chapman-kolmogorov | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| warmup-two-step | 12/25 ✔ engine (`matrixPower(weather,2)[0][0]`) | type fraction ✔ | triple ✔ | ✔ |
| explore-powers | 3/8 ✔ engine (`matrixPower(oz,2)[0][2]`) | step n + tap cells ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| prove-two-day-snow | 3/8 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| read-another-entry | 7/16 ✔ engine (`matrixPower(oz,2)[0][0]`) | tap P² cell ✔ | triple ✔ | aria-live entry mirror + final frame ✔ |
| model-ck-three-ways | 3/8 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-three-day-snow | 25/64 ✔ engine (`matrixPower(oz,3)[0][2]`) — constructed, engine-verify | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** The mastery answer **25/64** is a *construction* on the **sourced** G&S Land of Oz chain
(brief table; Ch.11), not a separately-cited source — but the brief **states the exact answer and its
derivation** ((P²·P)R,S = 7/64+6/64+12/64 = 25/64), and `markov.ts matrixPower(oz,3)[0][2]` reproduces it
(wave0 §4 golden row 6). It ships **engine-verified with the answer stated ⇒ Ready** (do not kick back). All
other numbers are source-stated: 3/8 and 7/16 (G&S Table 11.1), 1/8 (GB p.53 §5.1 path-probability rule), and
the 12/25 warm-up chain (Math.SE 3336273, P² value engine-computed).

## Gate notes

- **GATED inclusivity** (after adding `lesson-markov-chains-3`): ≥1 `primer` ✔ (`name-chapman-kolmogorov`,
  `track:A`, `required:false`); every `prediction` uses `byOption` ✔ (`predict-two-day-snow`); an
  `interviewNote` ✔ (`model-ck-three-ways`); the first graded beat is the `retrievalGrid` opener ✔
  (`recall-total-prob`); **no `introducesSymbol` tags** ⇒ the notation-ladder check is **vacuously satisfied**
  (the only candidate grounding is the track-A-only `name-*` primer; tagging a `track:both` beat would fail the
  gate in track B — wave0 §6f).
- **MASTERY_LESSONS**: the last beat is `recap` ✔; the penult is `masteryChallenge` `required:true` with **no
  `pattern`** ✔ (`mastery-three-day-snow` — 25/64 is a Markov fraction, not a hitting-time, so the
  `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped; R-4).
- **chainBoard cross-check** (wave0 §6c — runs for every `chainBoard` beat with a `headline`, hero or not;
  `task:'entry'` → `matrixPower(P, step ?? 1)[cell.row ?? 0][cell.col ?? 0]`):
  - `read-another-entry` (graded): `headline:"7/16"` = `formatRational(matrixPower(P_oz,2)[0][0])` ✔.
  - `explore-powers` (hero, ungraded for the learner but still validated): `headline:"3/8"` =
    `formatRational(matrixPower(P_oz,2)[0][2])` ✔.
- **HERO / GRADED split**: `explore-powers` carries the `hero` block
  (`slowFirst:true`, `structuralReadout`, `reducedMotionFinalFrame:true`) ⇒ ungraded;
  `read-another-entry` omits `hero` ⇒ graded. `chainBoard` is **NOT** in `HERO_TYPES`/`GRADED_TYPES` (wave0 §6),
  so neither gate asserts on it; the graded `retrievalGrid` opener already satisfies the early-win invariant.
