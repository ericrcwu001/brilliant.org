# Wave-0 Contracts — concept-optimal-stopping

Frozen once, before any per-lesson build, so all five lessons build against a stable contract.

## §1 Engine — `src/engine/optimalStopping.ts` (pure, exact BigInt, no floats)

```ts
export type BigRational = { n: bigint; d: bigint }
export function reduce(n: bigint, d: bigint): BigRational
export function secretarySuccess(n: number, r: number): BigRational  // pₙ(r), the look-then-leap win prob
export function naiveSuccess(n: number): BigRational                  // = 1/n
export function successCurve(n: number): BigRational[]                // [pₙ(1)…pₙ(n)]
export function optimalCutoff(n: number): { r: number; p: BigRational } // argmax, smallest-r tiebreak
export function runStrategy(order: number[], cutoff: number):        // replay one deterministic run
  { selectedIndex: number; selectedRank: number; win: boolean }
export function formatRational(r: BigRational): string               // "n" | "n/d" (reduced)
export function ratToNumber(r: BigRational): number                  // display-only decimal (never graded)
```
Goldens (`optimalStopping.test.ts`) brute-force-enumerate every permutation for n≤7 and assert the
engine matches; pin the famous table (n=3→1/2, n=4→11/24, n=5→13/30, n=10→3349/8400).

## §2 Interaction type — `stoppingBoard` (ONE new type, three displays)

Appended to `InteractionSchema` in `src/content/schema.ts`:
```ts
z.object({
  type: z.literal('stoppingBoard'),
  display: z.enum(['sequence', 'cutoff', 'convergence']),
  n: z.number().int().positive(),
  cutoff: z.number().int().positive().optional(),     // r (reject first r−1)
  order: z.array(z.number().int().positive()).optional(), // sequence: true ranks at each arrival position
  nValues: z.array(z.number().int().positive()).optional(), // convergence: the n's charted toward 1/e
  interactive: z.boolean().optional(),
  headline: z.string().optional(),                    // engine-reproducible validation anchor
})
```
- Dispatcher slot in `src/lesson/beats/index.tsx`: `case 'stoppingBoard': return <StoppingBoardBeat .../>`.
- Renderer `src/lesson/beats/StoppingBoardBeat.tsx` (DOM/SVG, NOT graded, NOT a HERO_TYPE). Every
  displayed value computed via the engine; reduced-motion → final frame; `aria-live` mirror.
- CSS surface `src/styles/surfaces/optimal-stopping.css` (+ one `@import` in `src/styles/app.css`).

## §3 validate-fixtures wiring (`scripts/validate-fixtures.ts`)
- Import the engine; add the 5 lessonIds to **`GATED`** and **`MASTERY_LESSONS`**.
- Add a **§3d stoppingBoard cross-check** block (mirrors §3c chainBoard): for each `stoppingBoard`
  beat with a `headline`, recompute and compare:
  - `sequence` → `runStrategy(order, cutoff)` → `'win'|'miss'` (or `String(selectedRank)`).
  - `cutoff`   → `formatRational(cutoff!=null ? secretarySuccess(n,cutoff) : optimalCutoff(n).p)`.
  - `convergence` → `String(optimalCutoff(max(nValues)).r)`.
- `stoppingBoard` is **NOT** added to `GRADED_TYPES`/`HERO_TYPES` (graded reads use `retrievalGrid` /
  `answerEntry` / `masteryChallenge`; the first graded beat in every lesson is the `retrievalGrid` opener).
- The §7 chapters-coverage gate runs automatically once `course-optimal-stopping.json` declares
  `chapters[]` covering all five built lessons.

## §4 Per-lesson factcheck tests — `src/content/lesson-optimal-stopping-N.factcheck.test.ts`
Each recomputes its lesson's graded answers (answerEntry/masteryChallenge `accept`, stoppingBoard
`headline`) from `src/engine/optimalStopping.ts`, mirroring `lesson-combinatorics-1.factcheck.test.ts`.

## §5 Display keys (no code edits needed — data-driven)
- `course.lessons[].glyphKey`/`vizKey` drive the catalog (studyDesk.model `resolveNodes`).
- `course.chapters[]` drives the journey (`resolveChapters`); badges via `conceptBadges` (generic path).
- Add the 5 lessonIds → `ch3` in `src/lesson/chapters.ts` `LESSON_CHAPTER` (lesson-shell accent only).
- (Optional polish) bespoke medallions in `src/habit/MilestoneIcon.tsx`; falls back to glyph otherwise.
