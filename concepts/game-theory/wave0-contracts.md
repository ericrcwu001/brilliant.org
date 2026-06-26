# Wave-0 Contracts — concept-game-theory (FROZEN)

> Shared contracts frozen once, before any per-lesson build. Everything below is the single source of
> truth the engine, renderers, fixtures, `validate-fixtures.ts`, and factcheck tests build against.
> Pure / exact / **no floats** (rationals `{n,d}`, integers, XOR).

## 1. Engine — `src/engine/gameTheory.ts`

```ts
import type { Rational } from './types'           // { n: number; d: number }

export type Cell = { row: Rational; col: Rational }   // payoff pair (row player, col player)
export type Game = Cell[][]                            // game[i][j] when row plays i, col plays j

// ── rational helpers (self-contained; exact) ──
export function reduce(n: number, d: number): Rational
export function formatRational(r: Rational): string   // reduced "n/d"; "n" when d|n; "0" for zero
export function formatVector(rs: Rational[]): string  // comma-joined formatRational

// ── pure-strategy analysis (any size) ──
export function rowBestResponses(g: Game): number[][] // [colj] -> row indices maximizing row payoff
export function colBestResponses(g: Game): number[][] // [rowi] -> col indices maximizing col payoff
export function pureNashEquilibria(g: Game): { row: number; col: number }[] // sorted (row,then col)

// ── dominance / IESDS (strict, pure dominators; any size) ──
export function strictlyDominatedRows(g: Game): number[]
export function strictlyDominatedCols(g: Game): number[]
export function iteratedElimination(g: Game): { rows: number[]; cols: number[] } // SURVIVING indices
export function iesdsSolution(g: Game): { row: number; col: number } | null      // unique survivor or null

// ── zero-sum (M[i][j] = ROW's payoff; col's = -that) ──
export function saddlePoint(M: Rational[][]): { row: number; col: number; value: Rational } | null
export function mixedValue2x2(M: Rational[][]): { value: Rational; p: Rational; q: Rational }
//   v=(ad−bc)/(a+d−b−c); p=Prob(row plays row0)=(d−c)/Δ; q=Prob(col plays col0)=(d−b)/Δ. (Δ≠0)

// ── general-sum mixed Nash (fully-mixed 2×2) ──
export function mixedNash2x2(g: Game): { p: Rational; q: Rational } | null
//   p=Prob(row0) makes COL indifferent; q=Prob(col0) makes ROW indifferent; null if degenerate.

// ── sequential / extensive form ──
export type GameTreeNode =
  | { kind: 'leaf'; label?: string; payoff: Rational[] }
  | { kind: 'decision'; player: number; label?: string; moves: { label: string; child: GameTreeNode }[] }
export function backwardInduction(root: GameTreeNode): { payoff: Rational[]; path: string[] }
//   SPE: each decision node picks the move maximizing THAT node's player's payoff (ties → first move).

// ── pirate game (Green Book "Screwy pirates") ──
// ≥50% approval with proposer breaking ties; an indifferent pirate votes NO (bribe = strictly +1).
export function pirateGame(nPirates: number, coins: number): number[] // senior→junior allocation
//   pirateGame(5,100) === [98,0,1,0,1]; (4,100)=[99,0,1,0]; (3,100)=[99,0,1]; (2,100)=[100,0]; (1,c)=[c]

// ── combinatorial games ──
export function nimSum(heaps: number[]): number                 // XOR of heap sizes
export function nimIsWinning(heaps: number[]): boolean          // nimSum !== 0 (normal play)
export function nimWinningMoves(heaps: number[]): { heap: number; removeTo: number }[]
export function subtractionIsWinning(n: number, k: number): boolean      // n % (k+1) !== 0 (normal play)
export function subtractionWinningMove(n: number, k: number): number | null // n%(k+1) if winning else null
```

### Engine goldens (hand-verified; asserted in `gameTheory.test.ts` + `validate-fixtures.ts`)
- **PD** `[[(3,3),(0,5)],[(5,0),(1,1)]]` (row0/col0 = Cooperate): `strictlyDominatedRows=[0]`,
  `strictlyDominatedCols=[0]`, `iesdsSolution={1,1}`, `pureNashEquilibria=[{1,1}]`.
- **Stag Hunt** `[[(3,3),(0,1)],[(1,0),(1,1)]]`: `pureNashEquilibria=[{0,0},{1,1}]`.
- **Matching Pennies** row-payoff `M=[[1,-1],[-1,1]]`: `saddlePoint=null`; `mixedValue2x2 → {value:0, p:1/2, q:1/2}`.
- **Matching Pennies** bimatrix: `mixedNash2x2 → {p:1/2, q:1/2}`. **RPS** (3×3 zero-sum): `pureNashEquilibria=[]`.
- **Two-finger Morra 2×2** `M=[[2,-3],[-3,4]]`: `saddlePoint=null`; `mixedValue2x2 → {value:-1/12, p:7/12, q:7/12}`.
- **Pirate** `pirateGame(5,100)=[98,0,1,0,1]`.
- **Centipede (4-node, doubling pot)** SPE → first player Takes immediately (payoff golden in L5 factcheck).
- **Nim** `nimSum([3,4,5])=2`, `nimIsWinning([3,4,5])=true`, `nimWinningMoves([3,4,5])=[{heap:0,removeTo:1}]`,
  `nimIsWinning([1,4,5])=false`.
- **Subtraction** `subtractionWinningMove(10,3)=2`, `subtractionIsWinning(12,3)=false`.

## 2. New interaction types — `src/content/schema.ts` (append to `InteractionSchema` union)

All Firestore-safe (no directly-nested arrays). All three are **NOT** added to `GRADED_TYPES`,
`HERO_TYPES`, or `src/lesson/mastery.ts` (mirrors `chainBoard`). They carry an engine-reproducible
`headline` cross-checked by `validate-fixtures.ts`. Renderers MAY grade internally vs `headline`.

```ts
// payoffMatrix — normal-form bimatrix. tasks fold dominance/bestResponse/nash/value/mix.
z.object({
  type: z.literal('payoffMatrix'),
  rows: z.array(z.string()).min(2),
  cols: z.array(z.string()).min(2),
  matrix: z.array(z.object({ cells: z.array(z.object({ row: RationalSchema, col: RationalSchema })) })),
  task: z.enum(['dominance', 'bestResponse', 'nash', 'value', 'mix']),
  rowPlayer: z.string().optional(),
  colPlayer: z.string().optional(),
  zeroSum: z.boolean().optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),
}),
// gameTree — finite extensive form; fold by backward induction.
z.object({
  type: z.literal('gameTree'),
  root: GameTreeNodeSchema,        // z.lazy recursive union of leaf | decision (see schema.ts)
  players: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(), // SPE payoff vector, formatVector(backwardInduction(root).payoff)
}),
// nimBoard — heaps to take from; nim | subtraction.
z.object({
  type: z.literal('nimBoard'),
  heaps: z.array(z.number().int().nonnegative()).min(1),
  task: z.enum(['nim', 'subtraction']).optional(),   // default 'nim'
  maxRemove: z.number().int().positive().optional(), // subtraction k; pile = heaps[0]
  lastTakeWins: z.boolean().optional(),              // default true (normal play) — copy only
  interactive: z.boolean().optional(),
  headline: z.string().optional(),
}),
```

### `headline` cross-check formats (recomputed in `validate-fixtures.ts`)
| type / task | engine recompute | example |
|---|---|---|
| payoffMatrix `nash` | `pureNashEquilibria(g).map(e=>`${e.row},${e.col}`).join(';')` or `'none'` | PD `"1,1"`; Stag `"0,0;1,1"`; MP `"none"` |
| payoffMatrix `dominance` | `iesdsSolution(g)` → `"r,c"` or `'none'` | PD `"1,1"` |
| payoffMatrix `value` | `saddlePoint(rowM)` → `formatRational(value)` or `'mixed'` | saddle `"3"`; no-saddle `"mixed"` |
| payoffMatrix `mix` | `formatRational(mixedValue2x2(rowM).value)` | MP `"0"`; Morra `"-1/12"` |
| payoffMatrix `bestResponse` | (no headline — ungraded explore) | — |
| gameTree | `formatVector(backwardInduction(root).payoff)` | centipede `"2,0"` (example) |
| nimBoard `nim` | `String(nimSum(heaps))` (0 ⇒ mover loses) | `[3,4,5]` → `"2"`; `[1,4,5]` → `"0"` |
| nimBoard `subtraction` | `String(heaps[0] % (maxRemove+1))` (0 ⇒ mover loses) | `(10,k=3)` → `"2"`; `(12,k=3)` → `"0"` |

`rowM` = `matrix.map(r => r.cells.map(c => c.row))` (zero-sum row payoffs; col = −row).

## 3. Dispatcher — `src/lesson/beats/index.tsx`
Add imports + `case 'payoffMatrix' | 'gameTree' | 'nimBoard'`. Wave 0: route to `ContinueStub`;
build wave replaces each with the real renderer (`PayoffMatrixBeat` / `GameTreeBeat` / `NimBoardBeat`).

## 4. `scripts/validate-fixtures.ts` wiring
- Import `{ ...named, formatRational as gtFmt, formatVector as gtVec }` from `../src/engine/gameTheory`.
- Add all six `lesson-game-theory-{1..6}` to **`GATED`** and **`MASTERY_LESSONS`**.
- New **engine self-check block** (Stage-2 anchor) asserting every golden in §1.
- New **per-fixture headline cross-check** loop for `courseId === 'course-game-theory'` per the table in §2.
- **Do NOT** touch `GRADED_TYPES`, `HERO_TYPES`, `HARDEST_TYPES`, or `mastery.ts`.
- The existing **chapters-coverage gate** auto-covers `course-game-theory` once it declares chapters.

## 5. Per-lesson fixture contract (every lesson, to pass the gates)
- `patternOptions: ["H"]`; `courseId: "course-game-theory"`; `schemaVersion: 1`.
- **10 beats**, beat[0] = a graded `retrievalGrid` (the retrieval opener / guaranteed early win).
- ≥1 `primer` (custom variant); ≥1 `interviewNote`; every `prediction` uses `byOption` feedback.
- penultimate beat = required `masteryChallenge`; last beat = `recap`. No `pattern` on any beat
  (avoids the automaton mastery cross-check).
- Marquee interactive beat(s) use `payoffMatrix` / `gameTree` / `nimBoard` with a `headline`.
- CSS: `src/styles/surfaces/game-theory.css` (one file), `@import` added to `src/styles/app.css`.

## 6. Files (new) and shared-file edits
- **new:** `src/engine/gameTheory.ts` (+`.test.ts`); `src/lesson/beats/{PayoffMatrix,GameTree,NimBoard}Beat.tsx`
  (+`.test.tsx`); `fixtures/lesson-game-theory-{1..6}.json`; `src/content/lesson-game-theory-{1..6}.factcheck.test.ts`;
  `src/styles/surfaces/game-theory.css`; `e2e/game-theory-{1..6}.spec.ts`; `interviews/course-game-theory.{json,md}`.
- **shared edits (Manager-owned, serialized):** `src/content/schema.ts`, `src/lesson/beats/index.tsx`,
  `scripts/validate-fixtures.ts`, `src/styles/app.css`, `fixtures/course-game-theory.json`.
