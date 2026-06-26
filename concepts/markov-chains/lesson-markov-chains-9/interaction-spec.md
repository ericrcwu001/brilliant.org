# Interaction Spec: PageRank  (lesson-markov-chains-9)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> the dispatcher (`src/lesson/beats/index.tsx`), and the reuse renderers. The frozen `chainBoard` type, the
> `src/engine/markov.ts` engine, the Konva `ChainGraph.tsx` widget, and the validate-fixtures edits are the
> single source of truth in `../wave0-contracts.md` (§1 field-usage matrix incl. `damping` + the `pagerank`
> task, §3 renderer, §4 engine + PageRank goldens #25–#27, §6 validator, §9 beat map) — this spec maps every
> Dept-1 beat to a real interaction type and supplies the per-beat feedback ladder, a11y, build decomposition,
> and Definition-of-Ready.
>
> **This is the PageRank lesson — three `chainBoard` beats spanning two displays:** `weight-by-source`
> (`display:'diagram'`, graded, tap the focused endorsement), `explore-damping` (`display:'stationary'` +
> `damping`, the hero damping dial), and `damping-saves-sink` (`display:'stationary'` + `damping`, graded
> uniqueness choice). Everything else reuses shipped renderers (`retrievalGrid`, `prediction`, `primer`,
> `answerEntry`, `tripletReveal`, `masteryChallenge`, `recap`). **The penult `mastery-fourNode` is a pure
> `masteryChallenge` type-in — NOT a `chainBoard`** (wave0 §1 mastery note).
>
> **Lesson-level fixture facts** (wave0 §5a): `courseId:'course-markov-chains'`, `patternOptions:["H"]` (the
> safe H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])` and **no Markov beat reads
> the automaton**; no `chainBoard`/`masteryChallenge` here carries `pattern`, so the `buildAutomaton`
> cross-check never fires), `milestoneId:'markov-chains-pagerank'`, `unlocks:'lesson-markov-chains-10'`,
> `schemaVersion:1`. Course lesson-node display keys: glyph `PR`, viz `fourNode`; L9 sits in chapter
> `ch-markov-chains-4` ("Ranking & Synthesis") with L10.
>
> **Worked chains (row-stochastic surfer matrices `M`, aligned to `labels`; the engine's `pagerank()` damps
> each into `G = d·M + (1−d)/n·J` and solves `πG = π`).** 4-node link graph `1→2, 2→{1,4}, 3→{1,4},
> 4→{1,2,3}` → `M = [[0,1,0,0],[1/2,0,0,1/2],[1/2,0,0,1/2],[1/3,1/3,1/3,0]]`, labels `["1","2","3","4"]`
> (this is the transpose of the brief's column-stochastic `A`). Symmetric 3-cycle `A→B→C→A` →
> `M = [[0,1,0],[0,0,1],[1,0,0]]`, labels `["A","B","C"]`. Dangling-node rank sink `1→2, 2→3, 3→∅` →
> `M = [[0,1,0],[0,0,1],[0,0,0]]` (the all-zero dangling row is legal **only** because `damping` is present —
> wave0 R-3), labels `["1","2","3"]`.
>
> **Manager #2 (BINDING — graded answers are sourced only).** L9's **graded** PageRank answers are the
> **sourced** symmetric 3-cycle `(1/3,1/3,1/3)` (theorempath; any `d`, golden #25) and the **sourced** 4-node
> `d=1` `(4/13,5/13,1/13,3/13)`, rank `2 > 1 > 4 > 3` (practicaldsc, golden #26). The damped `d=1/2`
> `(14/39,10/39,15/39)` (golden #27) is a **CONSTRUCTION, not a stated source** — it ships **only** as the
> `explore-damping` **enrichment aside** (engine-verified before ship), is **never** a graded `headline`, and
> appears nowhere in the graded path.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-no-champion` | Tap a familiar idea on the left → pick its "rank without a single champion / renormalize" match on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag targets ≥44px; `aria-live` mirrors "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `open-bet` | Pick one page chip (Page 1 / Page 2 / Page 4) → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` (×3) + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-the-surfer` | Expand the JIT primer (random surfer, teleport, damping `d`, Google matrix `G = d·M + (1−d)/n·J`) → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A · required:false |
| 4 | `weight-by-source` | Tap the endorsement that carries more rank (the focused out-link from an important page) → Check → hint ladder | `chainBoard` `display:'diagram'` | **NEW** | `display:'diagram'`,`matrix` (4×4 link `M`),`labels:["1","2","3","4"]`,`task:'pagerank'`,`damping:{n:1,d:1}`,`headline:"2"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | nodes/edges = `<button>` ≥44px; visually-hidden `aria-live` "Page 1's only out-link sends all its rank to page 2"; reduced-motion → static link graph | Konva `ChainGraph`; one-shot edge pulse on the page 1→2 link | both |
| 5 | `explore-damping` | Drag the damping dial on the symmetric 3-cycle → bars stay (1/3,1/3,1/3); the Google-matrix mix `d·M + (1−d)/n·J` re-weights live → loop | `chainBoard` `display:'stationary'` + `damping` | **NEW** (hero) | `display:'stationary'`,`matrix` (3×3 cyc3),`labels:["A","B","C"]`,`task:'pagerank'`,`damping:{n:85,d:100}`,`interactive:true`,`headline:"1/3,1/3,1/3"` + beat-level `hero{slowFirst,structuralReadout,reducedMotionFinalFrame:true}` (⇒ ungraded) | damping = `<input type="range">` ≥44px, arrow-key steppable; bars non-interactive; `aria-live` "Damping 85/100: A 1 in 3, B 1 in 3, C 1 in 3"; reduced-motion → settled bars | DOM bars + damping control + Google-matrix mix readout, CSS width; slow-first per `hero.slowFirst` | both |
| 6 | `confirm-symmetry` | Type `π` for the 3-cycle at `d=85/100` and at `d=1/2` (both → 1/3,1/3,1/3) → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` (×2) | text inputs ≥44px; Enter submits; `FeedbackStrip` `aria-live` | none | both |
| 7 | `triplet-pagerank` | Reveal each of three lenses (solve `πG=π` / iterate `Gⁿ→π` / simulate the surfer) → they converge on the same `π` | `tripletReveal` | reuse | `value:'πG=π'`, `lenses:[{label,body}]` (×3), `display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 8 | `damping-saves-sink` | On the dangling-node rank sink, toggle damping off→on, then pick "unique π exists?" → Check → hint ladder | `chainBoard` `display:'stationary'` + `damping` | **NEW** | `display:'stationary'`,`matrix` (3×3 dangling sink),`labels:["1","2","3"]`,`task:'pagerank'`,`damping:{n:85,d:100}`,`headline:"unique"` (no `hero` ⇒ graded) + `feedback{correct,hints[3]}` | damping toggle + unique/not-unique chips = `<button>` ≥44px; `aria-live` "Without damping page 3 traps the surfer; with damping a unique π exists"; reduced-motion → settled bars | DOM bars + damping toggle + Google-matrix mix; CSS; no token motion | both |
| 9 | `mastery-fourNode` | Read the 4-node link scenario → type the PageRank vector **and** the rank order → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept,placeholder}]` (×2) — **no `pattern`** + beat-level `interviewNote` | badge card; two inputs ≥44px; Enter submits; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

Graded beats `1, 4, 6, 8, 9` are `required:true`, `track:'both'`. The JIT primer `name-the-surfer` (track A)
is `required:false` (track-exclusive beats must be, per the `BeatSchema.track` comment). The hero
`explore-damping`, the bet `open-bet`, the reveal `triplet-pagerank`, and `recap` are `track:'both'`,
`required:true`. Exactly one `hero` block (`explore-damping`) and exactly one `interviewNote`
(`mastery-fourNode`).

## Remaps vs. Dept-1 brief (explicit)

- **`recall-no-champion` (b1) is a pure `retrievalGrid` — the `dominanceWheel` is recalled in the copy, NOT
  rendered.** The Dept-1 brief sketched b1 as "REUSE `dominanceWheel` + `retrievalGrid`". The frozen
  invariant is that **every Markov lesson's first graded beat is its `retrievalGrid` opener** (wave0
  §1/§6/§9), so b1 is realized as a `retrievalGrid` whose pairs *recall* Penney's `dominanceWheel`
  "non-transitive — ranking without a single champion" (cite prior beatId `non-transitive-loop` in
  `lesson-penneys-game`) **and** `bayes.ts bayesPosterior` renormalization. There is **no separately rendered
  `dominanceWheel` beat** in L9 (consistent with the wave0 §9 L9 reuse list, which omits `dominanceWheel`).
  This keeps the first-graded-opener gate satisfied.
- **`weight-by-source` (b4) and `damping-saves-sink` (b8) grade via the `chainBoard` `pagerank` cross-check,
  not a sibling type-in.** The brief's "tap which endorsement carries more rank" (b4) and "toggle damping:
  does a unique `π` exist?" (b8) are the `chainBoard`'s own direct-manipulation grade (tapped edge / toggle +
  categorical choice), checked in `ChainBoardBeat` against `markov.ts pagerank()` via the §6c cross-check —
  there is **no separate `answerEntry`/`prediction`** for these numerics. The brief labeled b8 "byOption"; per
  the **frozen grading rule** (graded ⇔ no `hero`), a graded `chainBoard` runs the standard `{correct,
  hints[3]}` hint ladder (`useHintLadder` + `FeedbackStrip`), **not** the `prediction`-only `byOption` shape.
  The learner's unique/not-unique choice is the graded manipulation; `byOption` stays reserved for the one
  real `prediction` beat (`open-bet`).
- **`mastery-fourNode` (b9) is a PURE `masteryChallenge` type-in — NOT a `chainBoard`.** The brief sketched b9
  as "REUSE `masteryChallenge` over NEW `chainBoard:stationary`". Per the frozen wave0 §1 note — "Mastery
  beats are NOT chainBoard … the penult beat is a pure `masteryChallenge` type-in (gate-required, no
  `pattern`); the chainBoard surface lives in that lesson's preceding hero/solve beat" — the "over chainBoard"
  is realized as the **preceding chainBoard surfaces** (`weight-by-source` → `explore-damping` →
  `damping-saves-sink` give the hands-on PageRank practice) **plus a type-in penult**. Beat 9 renders no
  chainBoard: it grades the typed vector `4/13,5/13,1/13,3/13` and the rank `2 > 1 > 4 > 3` against `accept`
  lists. The 4-node graph is *described* in `scenario` and engine-verified offline (golden #26), never
  re-rendered, and carries **no `pattern`** (avoids the `buildAutomaton(pattern).E0 ∈ accept` cross-check, R-4).
- **The three `chainBoard` beats — display + task + damping (pinned to wave0 §1):**
  - `weight-by-source` → `display:'diagram'`, `task:'pagerank'`, `damping:{n:1,d:1}`, **no `hero` ⇒ graded**.
    `headline:"2"` is the **top-ranked page label** (the simplest engine-derivable anchor for a single tap):
    `labels[argmax(pagerank(link4, {1,1}))] = labels[1] = "2"` — see "Gate notes" for the exact derivation.
  - `explore-damping` → `display:'stationary'`, `task:'pagerank'`, `damping:{n:85,d:100}`, `interactive:true`,
    **carries `hero` ⇒ ungraded**. `headline:"1/3,1/3,1/3"` is `formatVector(pagerank(cyc3, d))`, which is the
    **same for every `d`** (symmetry / golden #25), so the stored `{n:85,d:100}` is just the dial's initial
    position. Hosts the enrichment aside (below).
  - `damping-saves-sink` → `display:'stationary'`, `task:'pagerank'`, `damping:{n:85,d:100}`, **no `hero` ⇒
    graded**. `headline:"unique"` is the categorical existence/uniqueness anchor (wave0 §6 lists `unique` as a
    recognized categorical headline) — derived from `G` being regular when `d<1`; see "Gate notes".
- **`interactive` is reserved for the hero (matches wave0 §1).** Per wave0 §3 the renderer's **graded**
  `pagerank` mode already provides the tap-the-edge (b4) and toggle-damping + categorical-choice (b8) inputs
  inherently, so the graded chainBoard beats omit `interactive` (matching the §1 field-usage rows). Only the
  hero `explore-damping` sets `interactive:true` for its draggable damping dial.
- **The enrichment aside ships as the hero's caption/readout copy — NOT a second `chainBoard` matrix.** The
  brief asks `explore-damping` to "drag `d→1/2` on the constructed 3-node `1→{2,3}, 2→3, 3→1`" to show
  `(14/39,10/39,15/39)`. The frozen schema allows **one `matrix` per `chainBoard` beat**, and that slot holds
  the symmetric 3-cycle (the graded-anchor surface). So the asymmetric-graph aside is realized as the hero's
  **enrichment readout/caption copy** stating the engine-verified `(14/39,10/39,15/39)` (golden #27), proving
  damping *can* tilt an **asymmetric** ranking. It is **engine-verified before ship**, **never graded**, and
  **never a `headline`** — fully consistent with Manager #2.
- No other remaps. Every other beat (`open-bet`, `name-the-surfer`, `confirm-symmetry`, `triplet-pagerank`,
  `recap`) maps 1:1 to the brief's stated reuse type.

## New interaction types (for Wave 0)

**`chainBoard` (`display:'diagram'` and `display:'stationary'` + `damping`, all three beats `task:'pagerank'`).**
Restating the relevant schema line — the **frozen full definition is wave0-contracts.md §1** (appended as the
last member of the `InteractionSchema` discriminated union in `src/content/schema.ts`, reusing the existing
`RationalSchema`):

```ts
z.object({
  type: z.literal('chainBoard'),
  display: z.enum(['diagram', 'matrix', 'powers', 'distribution', 'stationary']), // L9 uses 'diagram' + 'stationary'
  matrix: z.array(z.array(RationalSchema)),       // row-stochastic surfer M; a dangling (all-zero) row is legal ONLY with `damping`
  labels: z.array(z.string()).min(2),             // ["1","2","3","4"] / ["A","B","C"] / ["1","2","3"]
  task: z.enum(['entry','build','classify','absorption','stationary','balance','pagerank']).optional(), // L9: 'pagerank'
  damping: RationalSchema.optional(),             // PageRank: d (follow a link w.p. d, teleport w.p. 1−d)
  interactive: z.boolean().optional(),            // hero explore-damping only
  headline: z.string().optional(),                // engine-reproducible anchor "2" / "1/3,1/3,1/3" / "unique"
  // (layout / step / start / absorbing / cell unused this lesson)
}),
```

- **Grading rule (wave0 §1, FROZEN):** a `chainBoard` beat is **graded iff its beat-level `hero` block is
  absent**. `weight-by-source` and `damping-saves-sink` omit `hero` ⇒ graded (standard `useHintLadder` +
  `FeedbackStrip`). `explore-damping` carries `hero` ⇒ ungraded "drag it / watch it resolve" (primary =
  Continue).
- **`chainBoard` is NOT in `HERO_TYPES` and NOT in `GRADED_TYPES`** (wave0 §1/§6): the hero/graded split rides
  the beat-level `hero` block + the §6c engine cross-check, exactly like `bayesUpdate`. (The graded
  `weight-by-source`/`damping-saves-sink` must **not** carry a `hero` block; the early-win/retrieval-opener
  invariant is held by `recall-no-champion`, not by chainBoard.)
- **Renderer `src/lesson/beats/ChainBoardBeat.tsx`** (wave0 §3): narrows `props.beat.interaction` to the
  `chainBoard` member (early-return `null` otherwise), ignores `automaton`/`pattern`, composes `<BeatShell>`.
  `display:'diagram'` → **`ChainGraph`** (the link graph; read mode taps an edge/endorsement for the graded
  `pagerank` check). `display:'stationary'` + `task:'pagerank'` → DOM **bars** + a **damping control** + the
  **Google-matrix mix** readout `G = d·M + (1−d)/n·J` (no Konva — DOM/SVG + CSS, mirroring `BayesUpdateBeat`
  bars). Graded mode (no `hero`): primary `Check`, wires `resolveFeedback(beat.feedback, pattern)` +
  `useHintLadder(...)`; reaching reveal calls `reportNeedsReview`. Hero mode (`explore-damping`): primary
  `{ label: isLast ? 'Finish' : 'Continue' }`.
- **Konva `ChainGraph.tsx`** (NEW, sibling to `StateGraph.tsx` — reuse-as-pattern, do **not** mutate the
  H/T-bound `StateGraph`): renders the arbitrary link graph — `n` nodes (free layout), rational edge labels,
  self-loops — with the `ch3` accent (`chapterColor(lessonId)` → `#F05A4A`). For `task:'pagerank'`
  (`display:'diagram'`, b4) it lets the learner tap an out-link/endorsement and reports it for the graded
  check. Imports `konva/theme.ts` (`C`, `accentFor`, `hexToRgba`, `FONT_MONO`). `reducedMotion` → static link
  graph. The `stationary` damping surfaces (b5, b8) need **no Konva**.
- **Engine dep `src/engine/markov.ts`** (NEW, pure/exact-rational, wave0 §4): `pagerank(linkGraph, damping)` =
  the stationary of `G = d·M + (1−d)/n·J` (a dangling/all-zero row → uniform teleport). All three beats read
  it; `formatVector`/`formatRational` format the §6c headline asserts.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle nudge),
`hints[1]`=Hint 2 (**the misconception refutation**, drawn from the brief's Misconceptions section),
`hints[2]`=Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again" resets). `required` graded
beats that ever reach reveal report `needsReview`. `prediction` beats use `byOption` per-option notes
(`correct` flag) instead of a ladder.

**1 · `recall-no-champion`** — graded `correct` + `hints[3]`
- correct: "Two moves you already own: rank a whole field with **no single champion** (Penney's non-transitive loop) and let the shares **renormalize to sum to 1** (the Bayes posterior). PageRank ranks pages by their long-run share of a random surfer's visits — a distribution, not standalone scores."
- hints: `["Warm-up — you ranked a no-champion field in Penney's (the non-transitive loop) and renormalized a posterior in Bayes. No PageRank computation yet.", "Ranking doesn't need one undisputed winner, and the scores aren't independent numbers — they're a probability distribution that renormalizes to sum to 1 (the same move as the Bayes posterior). No page's score stands alone.", "Penney's loop → rank without a champion; Bayes posterior → renormalize to 1; a page with k out-links → 1/k each."]`
- pairs: `"Penney's non-transitive loop (every pattern has a beater)"→"rank a whole field with no single champion"`, `"The Bayes posterior, renormalized"→"scores rescale to sum to 1 — a distribution"`, `"A page with k out-links splits its rank"→"1/k each — uniform out-links (the L2 ½/½ split)"`

**2 · `open-bet`** — `byOption` (4-node graph: 1→2, 2→{1,4}, 3→{1,4}, 4→{1,2,3}; + fallback `hints`)
- `"Page 1 — it collects the most links (three)"` → `{note:"That's the in-link-count trap. Counting links, page 1 leads with three — but PageRank weighs each link by the importance of its sender, and page 1's single out-link pours all of its own rank into page 2. More links collected, fewer 'rank dollars' kept.", correct:false}`
- `"Page 2"` → `{note:"Hold that instinct. Page 2 has only two in-links, but one of them is page 1's entire rank, funneled through page 1's single out-link. We'll prove page 2 wins 5/13 > 4/13.", correct:true}`
- `"Page 4"` → `{note:"Page 4 is a hub with three out-links, but spreading its rank three ways dilutes each endorsement. It lands third (3/13), behind pages 2 and 1.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll weigh each link by its sender.", "Most in-links doesn't win: a link's worth is the rank of the page that sent it, divided among that page's out-links.", "Page 2 wins (5/13) — page 1's focused out-link crowns it."]`

**3 · `name-the-surfer`** (primer; copy = caption/aria)
- correct: "Random surfer, teleport, damping `d`, Google matrix `G = d·M + (1−d)/n·J` — and PageRank `π` is just the stationary distribution of `G` from L6."
- hints: `["A surfer clicks a random out-link most of the time, and occasionally jumps to a random page.", "Damping d = how often she follows a link; 1−d = how often she teleports. Teleport is what guarantees a unique answer.", "PageRank π solves πG = π, Σπ = 1 — the L6 stationary distribution of the damped chain."]`
- title: "The random surfer, damping, and the Google matrix" · body: "Model the web as a **random surfer**: each step she follows a uniformly random **out-link** with probability **`d`** (the **damping factor**), or **teleports** to a uniformly random page with probability **`1 − d`**. Stack the link choices into the row-stochastic **`M`** and the teleport into the all-ones **`J`**; the surfer's chain is the **Google matrix `G = d·M + (1−d)/n·J`**. A page's PageRank is nothing new — it's the **stationary distribution `π` of `G` (`πG = π`, `Σπ = 1`)** from L6: the long-run share of time the surfer spends there."

**4 · `weight-by-source`** — graded `correct` + `hints[3]`
- correct: "Count links and page 1 leads with three in-links. But PageRank weighs each link by its **sender's** rank, and page 1's **single** out-link funnels **all** of page 1's rank into page 2. That one focused endorsement outweighs page 4's three split ones, so page 2 ranks #1 (5/13 > 4/13). **Most in-links ≠ most important.**"
- hints: `["Don't just count in-links — ask how important each sender is, and how many other pages it also points to.", "Most in-links doesn't win. A link from a high-rank page that points only at you is worth more than a crowd of links from pages that spray their rank everywhere. Page 1 has 3 in-links, but its one out-link hands page 2 all of page 1's rank.", "Tap page 1's single out-link to page 2 — it carries all of page 1's rank. Page 2 ranks #1."]`
- chainBoard fields: `display:'diagram'`, `matrix:[[0,1,0,0],[1/2,0,0,1/2],[1/2,0,0,1/2],[1/3,1/3,1/3,0]]` = `[[{n:0,d:1},{n:1,d:1},{n:0,d:1},{n:0,d:1}],[{n:1,d:2},{n:0,d:1},{n:0,d:1},{n:1,d:2}],[{n:1,d:2},{n:0,d:1},{n:0,d:1},{n:1,d:2}],[{n:1,d:3},{n:1,d:3},{n:1,d:3},{n:0,d:1}]]`, `labels:["1","2","3","4"]`, `task:'pagerank'`, `damping:{n:1,d:1}`, `headline:"2"` (no `hero` ⇒ graded). Sourced: practicaldsc.org (golden #26).

**5 · `explore-damping`** (ungraded hero; copy = aria/caption)
- correct: "Drag the damping dial anywhere from 0 to 1 and `π` never leaves **(1/3, 1/3, 1/3)**. The three pages are perfectly symmetric, so no amount of teleport can tilt the ranking — damping isn't there to bias a fair race, it's there to **guarantee a unique answer exists**."
- hints: `["Drag the damping dial and watch all three shares — and the Google-matrix mix d·M + (1−d)/n·J re-weight live.", "Damping does NOT change a fair ranking. On this symmetric cycle every page is interchangeable, so π stays (1/3,1/3,1/3) for every d — damping exists to guarantee a unique π, not to bias one. (On an asymmetric graph it CAN shift the ranking — see the aside.)", "By symmetry, πG = π = (1/3, 1/3, 1/3) for any d."]`
- `hero.structuralReadout`: "A 3-cycle is symmetric, so the damped Google matrix `G = d·M + (1−d)/3·J` fixes `π = (1/3, 1/3, 1/3)` for every damping `d` — the dial never moves the ranking."
- **enrichment aside** (hero caption/readout copy; engine-verified golden #27; **NOT graded**, **NOT a headline**): "Enrichment — on the **asymmetric** constructed graph `1→{2,3}, 2→3, 3→1` (`M=[[0,1/2,1/2],[0,0,1],[1,0,0]]`), dragging `d→1/2` *does* shift the ranking to **(14/39, 10/39, 15/39)** — proof that damping can tilt an *unfair* ranking while leaving a symmetric one untouched. Ships **only** if `pagerank()` reproduces it exactly (it does — golden #27)."
- `hero`: `{slowFirst:true, structuralReadout:"…", reducedMotionFinalFrame:true}` · chainBoard fields: `display:'stationary'`, `matrix:[[0,1,0],[0,0,1],[1,0,0]]` = `[[{n:0,d:1},{n:1,d:1},{n:0,d:1}],[{n:0,d:1},{n:0,d:1},{n:1,d:1}],[{n:1,d:1},{n:0,d:1},{n:0,d:1}]]`, `labels:["A","B","C"]`, `task:'pagerank'`, `damping:{n:85,d:100}`, `interactive:true`, `headline:"1/3,1/3,1/3"`. Sourced: theorempath.com (golden #25, damping-invariant).

**6 · `confirm-symmetry`** — graded `correct` + `hints[3]`
- correct: "Different `d`, same `π`. At `d = 85/100` and at `d = 1/2` the symmetric 3-cycle gives the **same** (1/3, 1/3, 1/3) — symmetry makes the stationary distribution damping-invariant."
- hints: `["You just watched the dial; type what π was at each setting.", "A different d does NOT force a different π. Damping only trades weight between links and teleport, but on a symmetric graph both are uniform — so π = (1/3,1/3,1/3) at every d.", "Both settings give (1/3, 1/3, 1/3)."]`
- fields: `{id:"pi85", label:"π for the 3-cycle at d = 85/100 (shares of A, B, C)", accept:["1/3,1/3,1/3","1/3, 1/3, 1/3","(1/3,1/3,1/3)"], placeholder:"e.g. 1/3,1/3,1/3"}`, `{id:"pi50", label:"π at d = 1/2 (shares of A, B, C)", accept:["1/3,1/3,1/3","1/3, 1/3, 1/3","(1/3,1/3,1/3)"]}`. Sourced: theorempath.com (golden #25).

**7 · `triplet-pagerank`** (ungraded reveal)
- correct: "Solve, iterate, or simulate — all three land on the **same `π`**. PageRank isn't a bespoke algorithm; it's the **stationary distribution of the damped surfer's chain (L6)**, made unique by damping (L7 convergence)."
- hints: `["Reveal each lens — solve, iterate, simulate.", "PageRank is NOT a brand-new algorithm. It's the stationary distribution πG = π you met in L6, on a chain you build from the link graph.", "All three roads give the same π."]`
- `value:"πG=π"` · `display:'cards'` · lenses: `{label:"Solve πG=π", body:"Form G = d·M + (1−d)/n·J and solve the L6 fixed point πG = π, Σπ = 1 — one linear system."}`, `{label:"Iterate Gⁿ", body:"Start anywhere and apply G over and over; the distribution converges to π (L7 convergence — damping makes G regular)."}`, `{label:"Simulate the surfer", body:"Turn one surfer loose for millions of clicks (follow a link w.p. d, teleport w.p. 1−d); the fraction of time on each page approaches π."}`

**8 · `damping-saves-sink`** — graded `correct` + `hints[3]`
- correct: "Without damping, page 3 is a **dangling node** — the surfer lands there with nowhere to click, so rank pools at the sink and no proper `π` exists. Switch damping on and the `(1−d)/n` teleport gives every page an escape: `G` becomes **regular** (irreducible + aperiodic), so a **unique** `π` exists — exactly L7's convergence condition."
- hints: `["Toggle damping off, then on. With it off, where does the surfer go once she reaches page 3?", "PageRank does NOT work fine without damping. A dangling node (or a 2-cycle trap) is a rank sink: the surfer gets stuck, the chain is reducible, and π isn't unique. The teleport (1−d)/n makes every page reachable — irreducible + aperiodic = regular — so a single π exists.", "With damping on, a unique π exists; without it, the sink breaks uniqueness."]`
- chainBoard fields: `display:'stationary'`, `matrix:[[0,1,0],[0,0,1],[0,0,0]]` = `[[{n:0,d:1},{n:1,d:1},{n:0,d:1}],[{n:0,d:1},{n:0,d:1},{n:1,d:1}],[{n:0,d:1},{n:0,d:1},{n:0,d:1}]]`, `labels:["1","2","3"]`, `task:'pagerank'`, `damping:{n:85,d:100}`, `headline:"unique"` (no `hero` ⇒ graded). The all-zero row 3 (dangling) is legal only because `damping` is present (wave0 R-3); `pagerank()` treats it as uniform teleport.

**9 · `mastery-fourNode`** — graded `correct` + `hints[3]`
- correct: "Solve `πG = π` at `d = 1` (no teleport needed — the graph is already strongly connected, so a unique `π` exists): `π = (4/13, 5/13, 1/13, 3/13)`, ranking **2 > 1 > 4 > 3**. Page 1 has the **most** in-links (three) yet loses to page 2, because page 1's single out-link funnels **all** of its rank into page 2."
- hints: `["Build the surfer's row-stochastic matrix (each page splits 1 over its out-links) and solve πG = π with Σπ = 1.", "Don't crown page 1 for having the most in-links. Trace the rank: page 1's only out-link sends ALL of its rank to page 2, so page 2 (5/13) edges out page 1 (4/13).", "π = (4/13, 5/13, 1/13, 3/13); rank 2 > 1 > 4 > 3."]`
- scenario: "Four pages link like this: **1→2; 2→{1,4}; 3→{1,4}; 4→{1,2,3}**. With damping **d = 1** (no teleport — the graph is strongly connected, so a unique `π` exists) the surfer follows a uniformly random out-link. (i) Compute each page's PageRank. (ii) Rank the four pages, most → least important."
- fields: `{id:"scores", label:"PageRank of pages 1, 2, 3, 4", accept:["4/13,5/13,1/13,3/13","4/13, 5/13, 1/13, 3/13","(4/13,5/13,1/13,3/13)"], placeholder:"e.g. 4/13,5/13,1/13,3/13"}`, `{id:"rank", label:"Rank the pages (most → least important)", accept:["2,1,4,3","2 > 1 > 4 > 3","2>1>4>3","2 1 4 3"]}` — **no `pattern`**. Sourced: practicaldsc.org (golden #26).
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L9): "PageRank — a web of links recast as a Markov chain whose stationary distribution is the ranking — is the canonical 'Markov in the wild' interview story. Say it in one breath: build the row-stochastic link matrix `M`, damp it into `G = d·M + (1−d)/n·J` for irreducibility, and the ranking is the stationary `π` (`πG = π`)."

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "A page's importance is its long-run share of a random surfer's visits — the **stationary distribution `π` of the Google matrix `G = d·M + (1−d)/n·J`** (`πG = π`). PageRank is L6's stationary distribution wearing a web crown; **damping** just guarantees one unique answer exists."
- hints: `["Most in-links doesn't win: page 1 (three in-links) loses to page 2 because page 1's focused out-link hands page 2 all its rank — 5/13 > 4/13.", "Damping doesn't tilt a fair ranking (the symmetric 3-cycle stays 1/3,1/3,1/3 at every d) — it guarantees a unique π by making G regular, rescuing dangling-node sinks.", "Next up: Markov in the Wild — where these chains show up beyond the textbook."]`

## Build decomposition (Technical Planner — for Dept 3)

**Engine (`src/engine/markov.ts`, wave0 §4).** L9 exercises exactly one engine function plus the offline
mastery/enrichment verifies:
- `pagerank(linkGraph, damping)` = stationary of `G = d·M + (1−d)/n·J` (a dangling/all-zero row → uniform
  teleport). Goldens to pin in `markov.test.ts`:
  - **#25 (sourced):** `pagerank(cyc3, {n:85,d:100}) = pagerank(cyc3, {n:1,d:2}) = (1/3, 1/3, 1/3)` on
    `M=[[0,1,0],[0,0,1],[1,0,0]]` — damping-invariant by symmetry. Anchors `explore-damping` and
    `confirm-symmetry`.
  - **#26 (sourced):** `pagerank(link4, {n:1,d:1}) = (4/13, 5/13, 1/13, 3/13)` on
    `M=[[0,1,0,0],[1/2,0,0,1/2],[1/2,0,0,1/2],[1/3,1/3,1/3,0]]` — at `d=1`, `G=M` and the graph is
    strongly connected (irreducible) and aperiodic (cycles of length 2 and 3 ⇒ gcd 1), so `π` is the unique
    stationary. Top-ranked page = `labels[argmax] = "2"` (anchors `weight-by-source`); the full vector + rank
    `2 > 1 > 4 > 3` anchor `mastery-fourNode`.
  - **dangling/uniqueness:** `pagerank(sink, {n:85,d:100})` on `M=[[0,1,0],[0,0,1],[0,0,0]]` returns a single
    well-defined vector — the **dangling row → uniform teleport** path, and `d<1` makes `G` positive
    (regular) ⇒ exactly one stationary. Anchors `damping-saves-sink` (categorical `"unique"`).
  - **#27 (CONSTRUCTED, enrichment-only — verify BEFORE the aside ships, NOT graded):**
    `pagerank(link3, {n:1,d:2}) = (14/39, 10/39, 15/39)` on `M=[[0,1/2,1/2],[0,0,1],[1,0,0]]`. Hand-verified
    in this spec (`πG = π` holds column-by-column: 14/39, 10/39, 15/39). It feeds **only** the
    `explore-damping` enrichment caption — if `markov.ts` disagrees, drop the aside; it is never a graded
    `headline`.
- `formatVector` / `formatRational` — format `{n,d}` vectors → `"4/13,5/13,1/13,3/13"`, `"1/3,1/3,1/3"`, and
  the page-index / categorical anchors for the §6c headline asserts.
- **No floats on any graded path.** `simulateChain` is *not* needed (the L9 `stationary` surfaces are bar
  readouts, not animated tokens; the triplet's "simulate the surfer" lens is descriptive copy).

**Schema (`src/content/schema.ts`, wave0 §1).**
- `chainBoard` fields used — `weight-by-source`: `type`, `display:'diagram'`, `matrix` (4×4), `labels` (×4),
  `task:'pagerank'`, `damping:{n:1,d:1}`, `headline`. `explore-damping`: `display:'stationary'`, `matrix`
  (3×3), `labels`, `task:'pagerank'`, `damping:{n:85,d:100}`, `interactive`, `headline` + beat-level `hero`.
  `damping-saves-sink`: `display:'stationary'`, `matrix` (3×3 w/ a dangling row), `labels`, `task:'pagerank'`,
  `damping:{n:85,d:100}`, `headline`.
- Reuse types: `retrievalGrid{pairs:[{left,right}]}` (×1), `prediction{options}` + `FeedbackSchema.byOption`
  (×1), `primer{variant:'custom',title,body,collapsible}`, `answerEntry{fields:[{id,label,accept,placeholder?}]}`
  (×1), `tripletReveal{value,lenses:[{label,body}],display:'cards'}`,
  `masteryChallenge{scenario,fields:[{id,label,accept}]}` (**no `pattern`**) + beat-level `interviewNote`,
  `recap{type:'recap'}`. **No `dominanceWheel` member is authored** (its "no champion" idea lives in the
  `recall-no-champion` pairs/copy).

**Renderer / widget (`ChainBoardBeat.tsx` + `ChainGraph.tsx`, wave0 §3).**
- `ChainBoardBeat` narrows to the `chainBoard` member (early-return `null` otherwise), composes `<BeatShell>`.
  Graded mode (`weight-by-source`, `damping-saves-sink`; no `hero`): primary `Check`, wires
  `resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)`; reaching reveal calls `reportNeedsReview`.
  Hero mode (`explore-damping`): primary `{ label: isLast ? 'Finish' : 'Continue' }`.
- `display:'diagram'` (b4) → `<ChainGraph>`: the 4-node link graph, rational edge labels; the graded
  `pagerank` tap reads the page 1→2 endorsement and checks the top-ranked page against `markov.ts`.
- `display:'stationary'` + `task:'pagerank'` (b5, b8) → DOM **bars** + a **damping control**
  (`<input type="range">` on the hero; a toggle + unique/not chips on the graded sink) + the **Google-matrix
  mix** readout `G = d·M + (1−d)/n·J`; every displayed/graded value from `pagerank()`, never hardcoded.
- **a11y:** every node/edge/chip/toggle is a native `<button>` ≥44px; the damping dial is an arrow-key
  steppable `<input type="range">` ≥44px; bars are non-interactive `<div>`s; a visually-hidden
  `<p role="status" aria-live="polite">` mirrors the readout on each manipulation; `reducedMotion` renders the
  final frame (bars settled, token-free), honoring `hero.reducedMotionFinalFrame`.

**Fixture (wave0 §5).**
- `fixtures/lesson-markov-chains-9.json`: `lessonId:"lesson-markov-chains-9"`,
  `courseId:"course-markov-chains"`, `title:"PageRank"`, `patternOptions:["H"]`,
  `milestoneId:"markov-chains-pagerank"`, `unlocks:"lesson-markov-chains-10"`, `schemaVersion:1`, the 10 beats
  above (each `chainBoard` rational encoded as `{n,d}`).
- `fixtures/course-markov-chains.json` lesson node: `glyphKey:"PR"`, `vizKey:"fourNode"`, `built:true`; this
  lessonId is the first member of chapter `ch-markov-chains-4` ("Ranking & Synthesis", with
  `lesson-markov-chains-10`).

## Definition-of-Ready checklist (every beat)

| beatId | verified+sourced problem | concrete interactive mechanic | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|-------------------------------|----------------------------------|----------------------------------------|
| recall-no-champion | n/a — recall of Penney's `dominanceWheel` "no champion" + `bayes.ts bayesPosterior` renorm ✔ | tap/drag match (×3) ✔ | triple ✔ | ✔ (renderer) |
| open-bet | n/a — in-link-count trap bet ✔ | chip pick (×3) ✔ | byOption (×3) ✔ | ✔ |
| name-the-surfer | n/a — JIT primer ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| weight-by-source | **2** ✔ engine (`argmax pagerank(link4,{1,1})`; sourced practicaldsc, golden #26) | tap the page 1→2 endorsement ✔ | triple ✔ | aria-live edge mirror + static-graph reduced-motion ✔ |
| explore-damping | **1/3,1/3,1/3** ✔ engine (`pagerank(cyc3,d)` any d; sourced theorempath, golden #25) | drag the damping dial ✔ | hero readout + caption ✔ | aria-live + final-frame ✔ |
| confirm-symmetry | **1/3,1/3,1/3** at d=85/100 & d=1/2 ✔ engine (sourced theorempath, golden #25) | type ×2 ✔ | triple ✔ | ✔ |
| triplet-pagerank | n/a — triangulate solve/iterate/simulate ✔ | reveal 3 lenses ✔ | reveal copy ✔ | aria-live ✔ |
| damping-saves-sink | **unique** ✔ engine (`pagerank(sink,d)` regular ⇒ unique; structural) | toggle damping + pick unique/not ✔ | triple ✔ | aria-live uniqueness mirror ✔ |
| mastery-fourNode | **4/13,5/13,1/13,3/13**, rank **2 > 1 > 4 > 3** ✔ engine (sourced practicaldsc, golden #26) | type vector + rank ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle + takeaways ✔ | ✔ |

**Kickbacks: none.** Every **graded** number is a sourced exact rational or an engine-derivable structural
anchor: `(1/3,1/3,1/3)` (theorempath, golden #25), `(4/13,5/13,1/13,3/13)` + rank `2 > 1 > 4 > 3`
(practicaldsc, golden #26), the page-index `"2"` (argmax of the sourced #26 vector), and `"unique"`
(Perron–Frobenius on the regular `G`). Per **Manager #2**, the damped `d=1/2` `(14/39,10/39,15/39)` is
**CONSTRUCTED, not sourced** — but it is **NOT graded** (it ships only as the `explore-damping` enrichment
caption), so it is **not a kickback**; it ships **only if `pagerank()` engine-reproduces it** (golden #27,
hand-verified in this spec). Every chainBoard beat has a real direct-manipulation mechanic (tap an
endorsement / drag the damping dial / toggle damping + categorical choice).

## Gate notes (this lesson)

- **GATED** (after appending `lesson-markov-chains-9` to the gate set, wave0 §6b): ≥1 `primer` ✔
  (`name-the-surfer`, `track:A, required:false`); every `prediction` uses `byOption` ✔ (`open-bet`); exactly
  one `interviewNote` ✔ (`mastery-fourNode`); the **first graded beat is the `retrievalGrid` opener** ✔
  (`recall-no-champion` — the `dominanceWheel` "no champion" is recalled in its pairs/copy, **not** a rendered
  `dominanceWheel`, so the opener gate holds); **no `introducesSymbol` tags** ⇒ the per-track notation-ladder
  check is **vacuously satisfied** (the only candidate grounding is the track-A-only `name-the-surfer` primer;
  tagging a `track:both` beat would fail the gate in track B — same reasoning as Bayes §6f).
- **MASTERY** (wave0 §6b): the last beat is `recap` ✔; the penult is a `masteryChallenge` `required:true` with
  **no `pattern`** ✔ (`mastery-fourNode`), so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped
  — `(4/13,5/13,1/13,3/13)` is a PageRank vector, not a hitting-time. It carries **no `chainBoard`** (wave0 §1
  mastery rule).
- **chainBoard engine cross-check** (wave0 §6c; `chainBoard` is **not** in `HERO_TYPES`/`GRADED_TYPES`) — every
  L9 `chainBoard` beat declares a `headline` recomputed via `markov.ts pagerank()`:
  - `explore-damping` `task:'pagerank'`, `damping:{n:85,d:100}`, `headline:"1/3,1/3,1/3"` — the **generic**
    §6c pagerank path: `formatVector(pagerank(cyc3, {85,100})) = "1/3,1/3,1/3"` matches directly (and is the
    same for any `d` — golden #25). Validated even though it is the (ungraded) hero, per the "every chainBoard
    beat with a `headline` is recomputed" rule.
  - `weight-by-source` `task:'pagerank'`, `damping:{n:1,d:1}`, `headline:"2"` — a **specialized** anchor (the
    generic `formatVector(pagerank(link4,{1,1}))` would be `"4/13,5/13,1/13,3/13"`). Per the wave0 §6 note
    ("L9 `weight-by-source` → page index … each spec states the exact derivation"), this beat's cross-check is
    the **top-ranked page label**: `labels[argmax(pagerank(link4, {1,1}))] = labels[1] = "2"`. The underlying
    sourced vector `(4/13,5/13,1/13,3/13)` is itself pinned separately as golden #26.
  - `damping-saves-sink` `task:'pagerank'`, `damping:{n:85,d:100}`, `headline:"unique"` — a **categorical**
    anchor (wave0 §6 lists `unique` among the categorical headlines string-matched against the formatted
    engine output). Derivation: with `d<1`, `G = d·M + (1−d)/n·J` is a **positive** matrix (the dangling row →
    uniform teleport, then every entry > 0) ⇒ irreducible + aperiodic (**regular**) ⇒ by Perron–Frobenius a
    **single** stationary `π` exists ⇒ the validator confirms `pagerank()` returns one well-defined vector and
    anchors `"unique"`.
- **Manager #2 (graded = sourced-only) — confirmed.** Graded PageRank answers are exactly the sourced
  `(1/3,1/3,1/3)` (`confirm-symmetry`; and the `explore-damping` headline) and the sourced
  `(4/13,5/13,1/13,3/13)` / rank `2 > 1 > 4 > 3` (`mastery-fourNode`; and the argmax page-index `"2"` for
  `weight-by-source`); `damping-saves-sink` grades the structural `"unique"`. The CONSTRUCTED `d=1/2`
  `(14/39,10/39,15/39)` is **enrichment-only** (the `explore-damping` aside), **engine-verified before ship**,
  and **never** a graded `headline`.
