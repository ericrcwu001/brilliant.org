// Build the Game Theory capstone Interview Pack (dormant, committed-but-NOT-
// deployed future-feature asset — ADR-0005/0008). Every answer is COMPUTED by
// src/engine/gameTheory.ts (never hand-transcribed), then the script SELF-VERIFIES
// the emitted JSON: re-parses it against InterviewPackSchema, recomputes every
// answer the same way scripts/validate-interview-packs.ts → recomputeGameTheory
// does, and runs the NO-LEAK guard on hint rungs 2 & 3. Run:
//   ./node_modules/.bin/tsx interviews/_build/build-game-theory-pack.ts
//
// (The global `validate:interviews` currently can't reach this pack because the
// older bayes/combinatorics/markov packs fail the strict InterviewPackSchema
// first; this script is therefore the authoritative verifier for this pack.)

import { writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  pureNashEquilibria,
  iesdsSolution,
  saddlePoint,
  mixedValue2x2,
  backwardInduction,
  pirateGame,
  nimSum,
  formatRational,
  formatVector,
  type Game,
  type GameTreeNode,
} from '../../src/engine/gameTheory'
import { InterviewPackSchema, type Question } from '../../src/content/interviewPack'
import { z } from 'zod'

const here = dirname(fileURLToPath(import.meta.url))
const outJson = join(here, '..', 'course-game-theory.json')

// ── engine adapters (params → engine shapes) ──────────────────────────────────
const toGame = (payoffs: number[][][]): Game =>
  payoffs.map((row) => row.map(([r, c]) => ({ row: { n: r, d: 1 }, col: { n: c, d: 1 } })))
const toM = (m: number[][]) => m.map((row) => row.map((x) => ({ n: x, d: 1 })))
const leaf = (...nums: number[]): GameTreeNode => ({
  kind: 'leaf',
  payoff: nums.map((n) => ({ n, d: 1 })),
})
const dec = (player: number, moves: { label: string; child: GameTreeNode }[]): GameTreeNode => ({
  kind: 'decision',
  player,
  moves,
})

type Params = Record<string, unknown>

function answerFor(templateId: string, p: Params): string {
  switch (templateId) {
    case 'tmpl-pure-nash': {
      const e = pureNashEquilibria(toGame(p.payoffs as number[][][]))
      return e.length ? e.map((x) => `${x.row},${x.col}`).join(';') : 'none'
    }
    case 'tmpl-iesds': {
      const s = iesdsSolution(toGame(p.payoffs as number[][][]))
      return s ? `${s.row},${s.col}` : 'none'
    }
    case 'tmpl-saddle-value': {
      const sp = saddlePoint(toM(p.matrix as number[][]))
      return sp ? formatRational(sp.value) : 'mixed'
    }
    case 'tmpl-mixed-value':
      return formatRational(mixedValue2x2(toM(p.matrix as number[][])).value)
    case 'tmpl-mixed-prob':
      return formatRational(mixedValue2x2(toM(p.matrix as number[][])).p)
    case 'tmpl-pirate':
      return pirateGame(Number(p.pirates), Number(p.coins)).join(',')
    case 'tmpl-nim-sum':
      return String(nimSum(p.heaps as number[]))
    case 'tmpl-subtraction':
      return String(Number(p.pile) % (Number(p.maxRemove) + 1))
    case 'tmpl-backward-induction':
      return formatVector(backwardInduction(p.tree as GameTreeNode).payoff)
    default:
      throw new Error(`answerFor: unknown template ${templateId}`)
  }
}

// ── shared rubric + per-template hidden scaffolding (hints are METHOD-ONLY) ────
const RUBRIC = {
  correctness: 'States the exact equilibrium / value / move and justifies why it is optimal.',
  approach: 'Uses the right tool (best response, dominance, indifference, minimax, backward induction, or nim-sum) rather than guessing.',
  rigor: 'Checks every case / column, states assumptions (rationality, normal play, tie-breaking), and avoids unjustified independence.',
  communication: 'Thinks aloud, names the structure before computing, and explains the intuition.',
  speed: 'Reaches the answer without flailing; hard tier allows more synthesis time.',
}

type TplMeta = {
  title: string
  source: string
  description: string
  approaches: string[]
  wrongTurns: string[]
  hints: [string, string, string]
  followUps: string[]
}

const TPL: Record<string, TplMeta> = {
  'tmpl-pure-nash': {
    title: 'Find all pure Nash equilibria (best-response method)',
    source: 'Osborne, Intro to Game Theory (best response); Wikipedia (Stag hunt / Battle of the sexes / Chicken). GB-anchored to Ch.2 strategy teasers.',
    description: 'Mark each player\u2019s best responses; mutual best-response cells are the pure NE.',
    approaches: ['Mark each player\u2019s best response to every opponent action; the doubly-marked cells are the equilibria.', 'Check each cell: is the row a best reply to that column AND the column a best reply to that row?'],
    wrongTurns: ['Picking the Pareto-best cell instead of a stable one.', 'Reporting one equilibrium when there are two (coordination games).'],
    hints: [
      'Find each player\u2019s best response to every option of the other.',
      'A pure Nash equilibrium is a cell where both players are simultaneously best-responding.',
      'Go cell by cell \u2014 the row a best reply to its column and the column a best reply to its row; the intersections are your equilibria.',
    ],
    followUps: ['What if there were no pure equilibrium \u2014 what would you do?', 'Which equilibrium would the players actually coordinate on, and why?'],
  },
  'tmpl-iesds': {
    title: 'Iterated elimination of strictly dominated strategies',
    source: 'Gibbons / Osborne IGT (IESDS); GB Ch.2 strategy teasers.',
    description: 'Remove strictly dominated strategies repeatedly until a single cell survives.',
    approaches: ['Eliminate any strategy that is strictly worse than another for all opponent choices; repeat as new dominations appear.', 'Track the surviving rows/cols round by round.'],
    wrongTurns: ['Eliminating a weakly (not strictly) dominated strategy too early.', 'Stopping after one round and missing the cascade.'],
    hints: [
      'Look for a strategy that is worse than another no matter what the opponent does.',
      'Eliminate strictly dominated strategies one at a time \u2014 new dominations can appear after each removal.',
      'Iterate the elimination until a single cell remains; that survivor is the prediction.',
    ],
    followUps: ['Does the order of elimination change the survivor under strict dominance?', 'How does this connect to the guess-\u2154-of-the-average game?'],
  },
  'tmpl-saddle-value': {
    title: 'Value of a zero-sum game with a saddle point',
    source: 'Ferguson, Game Theory (UCLA); ZIB Lecture 2 Matrix Games. GB Ch.2.',
    description: 'A saddle (row-min = col-max) gives the pure value of the zero-sum game.',
    approaches: ['Compute each row\u2019s minimum and each column\u2019s maximum; a cell that is both is the value.', 'Check maximin = minimax.'],
    wrongTurns: ['Randomizing when a pure saddle already exists.', 'Confusing row-min with column-min.'],
    hints: [
      'In a zero-sum game, scan for a saddle point first.',
      'A saddle is an entry that is the smallest in its row and the largest in its column.',
      'If the largest row-minimum equals the smallest column-maximum, that common entry is the game\u2019s value (pure play).',
    ],
    followUps: ['What if no saddle existed \u2014 how would you find the value?', 'Why is the saddle entry an equilibrium in pure strategies?'],
  },
  'tmpl-mixed-value': {
    title: 'Value of a 2\u00d72 zero-sum game with no saddle',
    source: 'Notre Dame Lecture 29 (2\u00d72 value formula); UMass Morra. GB Ch.2.',
    description: 'No saddle \u21d2 both mix; v = (ad\u2212bc)/(a+d\u2212b\u2212c).',
    approaches: ['Confirm no saddle, then apply the 2\u00d72 value formula.', 'Set the opponent indifferent between their columns and solve.'],
    wrongTurns: ['Applying the formula when a saddle exists.', 'Mislabelling the matrix so the terms transpose.'],
    hints: [
      'With no saddle point, both players must randomize.',
      'Make the opponent indifferent between their options \u2014 set their two expected payoffs equal.',
      'Use the 2\u00d72 value formula v=(ad\u2212bc)/(a+d\u2212b\u2212c) on the row-payoff entries.',
    ],
    followUps: ['What mix achieves this value?', 'How does the value change if you add a constant to every payoff?'],
  },
  'tmpl-mixed-prob': {
    title: 'Optimal mixing probability (indifference)',
    source: 'Berkeley econ160 (mixed NE); UMass Morra. GB Ch.2.',
    description: 'Mix so the opponent is indifferent; p = (d\u2212c)/(a+d\u2212b\u2212c) for row 0.',
    approaches: ['Set the opponent\u2019s expected payoffs from their two replies equal and solve for your mix.', 'Use p=(d\u2212c)/(a+d\u2212b\u2212c).'],
    wrongTurns: ['Mixing to maximize your own payoff instead of making the opponent indifferent.', 'Assuming 50/50 when the game is asymmetric.'],
    hints: [
      'The right mix makes your opponent unable to exploit you.',
      'Choose your randomization so the opponent is indifferent between their two replies.',
      'Set the opponent\u2019s two expected payoffs equal and solve the resulting linear equation for your probability.',
    ],
    followUps: ['What is the resulting value of the game?', 'What is the opponent\u2019s optimal mix?'],
  },
  'tmpl-pirate': {
    title: 'Pirate game (backward induction)',
    source: 'Green Book Ch.2 \u201cScrewy pirates\u201d p.3; Mark Joshi QJIQ&A; Wikipedia Pirate game.',
    description: 'Backward induction over proposals; \u226550% with proposer tie-break, indifferent pirate votes NO.',
    approaches: ['Solve the 1-, 2-, 3-\u2026 pirate subgames in turn; each pirate compares your offer to the fallback if you\u2019re thrown overboard.', 'Bribe the cheapest votes you need, one coin each.'],
    wrongTurns: ['Assuming a fair split.', 'Forgetting that an indifferent pirate votes NO (so a bribe must be strictly positive).'],
    hints: [
      'Work backwards from the smallest crew that could be left.',
      'Each pirate compares your offer to what they\u2019d get if your proposal fails and you go overboard.',
      'You need just over half the votes including your own \u2014 buy the minimum number of pirates who\u2019d otherwise get nothing, one coin each, and keep the rest.',
    ],
    followUps: ['Generalize: with 2n+1 pirates, how much does the captain keep?', 'What changes if an indifferent pirate votes YES instead?'],
  },
  'tmpl-nim-sum': {
    title: 'Nim \u2014 the nim-sum (XOR) rule',
    source: 'Wikipedia Nim (Bouton); Brilliant.org Nim; USACO Guide. GB Ch.2.',
    description: 'First player wins iff the XOR of heap sizes is non-zero.',
    approaches: ['Compute the bitwise XOR of all heap sizes.', 'A non-zero nim-sum is a win for the mover; reduce a heap to make the nim-sum vanish.'],
    wrongTurns: ['Thinking the largest heap decides it.', 'Confusing normal play with mis\u00e8re play.'],
    hints: [
      'Translate each heap to binary and think XOR.',
      'Compute the nim-sum \u2014 the bitwise XOR of the heap sizes \u2014 and recall what a vanishing nim-sum means for the player to move.',
      'If the XOR of all heaps vanishes the position is losing for the mover; otherwise some move makes it vanish.',
    ],
    followUps: ['What is the actual winning move from here?', 'How does mis\u00e8re Nim change the endgame?'],
  },
  'tmpl-subtraction': {
    title: 'Subtraction game (take 1..k, last takes wins)',
    source: 'NYU take-away notes; Wikipedia Nim \u00a7subtraction / \u00a721 game; Bachet. GB Ch.2.',
    description: 'P-positions (mover loses) are the multiples of (k+1).',
    approaches: ['Find positions from which every move hands the opponent a winning position.', 'Land the opponent on a multiple of (k+1).'],
    wrongTurns: ['Greedily taking the maximum each turn.', 'Forgetting mis\u00e8re (\u201clast loses\u201d) shifts the losing positions.'],
    hints: [
      'Find the positions from which every legal move hands the opponent a winning position.',
      'Those losing positions are the multiples of (the most you can take + 1).',
      'Remove the pile\u2019s remainder modulo (max+1) to drop the opponent onto the nearest losing multiple \u2014 a vanishing remainder means you are already losing.',
    ],
    followUps: ['How many tokens do you take on your first move?', 'How does the verbal \u201c21\u201d (mis\u00e8re) version differ?'],
  },
  'tmpl-backward-induction': {
    title: 'Backward induction on a game tree (SPE)',
    source: 'Wikipedia Centipede game; MIT 14.12; Yale ECON 159 (Stackelberg). GB Ch.2.',
    description: 'Fold the tree from the leaves; each player picks the branch maximizing their own payoff.',
    approaches: ['Solve the last decision first, then replace each subtree by its backward-induction payoff.', 'Propagate the chosen branches up to the root.'],
    wrongTurns: ['Assuming players cooperate for a better joint outcome.', 'Treating a non-credible threat as binding.'],
    hints: [
      'Solve the last decision first, then fold backward.',
      'At each node the player to move picks the branch maximizing their OWN payoff, anticipating optimal future play.',
      'Replace each subtree by its backward-induction payoff and propagate up to the root \u2014 the root\u2019s chosen branch is the subgame-perfect equilibrium.',
    ],
    followUps: ['Is the SPE outcome Pareto-efficient here?', 'Which Nash equilibria are ruled out by subgame perfection?'],
  },
}

// ── question specs ────────────────────────────────────────────────────────────
type Tier = 'hard' | 'harder' | 'brutal'
type Spec = { id: string; tier: Tier; template: string; params: Params; fp: string; prompt: string; source?: string }

const PD: number[][][] = [[[3, 3], [0, 5]], [[5, 0], [1, 1]]]
const STAG: number[][][] = [[[3, 3], [0, 1]], [[1, 0], [1, 1]]]
const BOS: number[][][] = [[[3, 2], [0, 0]], [[0, 0], [2, 3]]]
const CHICKEN: number[][][] = [[[4, 4], [2, 5]], [[5, 2], [1, 1]]]
const MP: number[][][] = [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]]
const IESDS3: number[][][] = [
  [[0, 3], [1, 1], [9, 0]],
  [[2, 3], [3, 1], [1, 0]],
  [[1, 0], [1, 5], [1, 0]],
]
const centipede: GameTreeNode = dec(0, [
  { label: 'Take', child: leaf(1, 0) },
  {
    label: 'Pass',
    child: dec(1, [
      { label: 'Take', child: leaf(0, 2) },
      {
        label: 'Pass',
        child: dec(0, [
          { label: 'Take', child: leaf(3, 0) },
          {
            label: 'Pass',
            child: dec(1, [
              { label: 'Take', child: leaf(0, 4) },
              { label: 'Pass', child: leaf(2, 2) },
            ]),
          },
        ]),
      },
    ]),
  },
])
const entryTree: GameTreeNode = dec(0, [
  {
    label: 'Enter',
    child: dec(1, [
      { label: 'Fight', child: leaf(-1, -1) },
      { label: 'Accommodate', child: leaf(2, 1) },
    ]),
  },
  { label: 'Stay out', child: leaf(0, 3) },
])
const stackTree: GameTreeNode = dec(0, [
  { label: 'Low', child: dec(1, [{ label: 'Low', child: leaf(2, 2) }, { label: 'High', child: leaf(3, 1) }]) },
  { label: 'High', child: dec(1, [{ label: 'Low', child: leaf(1, 3) }, { label: 'High', child: leaf(0, 0) }]) },
])

const SPECS: Spec[] = [
  // pure Nash
  { id: 'tmpl-pure-nash#pd', tier: 'hard', template: 'tmpl-pure-nash', params: { payoffs: PD }, fp: 'pure-nash:pd', prompt: 'Two suspects each Cooperate or Defect with payoffs (C,C)=(3,3), (C,D)=(0,5), (D,C)=(5,0), (D,D)=(1,1). Find every pure-strategy Nash equilibrium.' },
  { id: 'tmpl-pure-nash#stag', tier: 'hard', template: 'tmpl-pure-nash', params: { payoffs: STAG }, fp: 'pure-nash:stag', prompt: 'Stag Hunt: (Stag,Stag)=(3,3), (Stag,Hare)=(0,1), (Hare,Stag)=(1,0), (Hare,Hare)=(1,1). Find every pure Nash equilibrium.' },
  { id: 'tmpl-pure-nash#bos', tier: 'harder', template: 'tmpl-pure-nash', params: { payoffs: BOS }, fp: 'pure-nash:bos', prompt: 'Battle of the Sexes: matching at venue 1 gives (3,2), matching at venue 2 gives (2,3), mismatching gives (0,0). Find every pure Nash equilibrium.' },
  { id: 'tmpl-pure-nash#chicken', tier: 'harder', template: 'tmpl-pure-nash', params: { payoffs: CHICKEN }, fp: 'pure-nash:chicken', prompt: 'Chicken: (Swerve,Swerve)=(4,4), (Swerve,Straight)=(2,5), (Straight,Swerve)=(5,2), (Straight,Straight)=(1,1). Find every pure Nash equilibrium.' },
  { id: 'tmpl-pure-nash#mp', tier: 'harder', template: 'tmpl-pure-nash', params: { payoffs: MP }, fp: 'pure-nash:mp', prompt: 'Matching Pennies (zero-sum): the row player wins +1 on a match, the column player wins +1 on a mismatch. How many pure Nash equilibria are there?' },
  // IESDS
  { id: 'tmpl-iesds#pd', tier: 'hard', template: 'tmpl-iesds', params: { payoffs: PD }, fp: 'iesds:pd', prompt: 'In the Prisoner\u2019s Dilemma (C,C)=(3,3), (C,D)=(0,5), (D,C)=(5,0), (D,D)=(1,1), which single cell survives iterated elimination of strictly dominated strategies?' },
  { id: 'tmpl-iesds#3x3', tier: 'brutal', template: 'tmpl-iesds', params: { payoffs: IESDS3 }, fp: 'iesds:3x3', prompt: 'A 3\u00d73 game has row payoffs [[0,1,9],[2,3,1],[1,1,1]] and column payoffs [[3,1,0],[3,1,0],[0,5,0]] (cells are (row,col)). Which single (row,col) cell survives iterated elimination of strictly dominated strategies?' },
  // saddle value
  { id: 'tmpl-saddle-value#a', tier: 'hard', template: 'tmpl-saddle-value', params: { matrix: [[3, 5], [2, 4]] }, fp: 'saddle:3-5-2-4', prompt: 'Zero-sum game, row\u2019s payoffs [[3,5],[2,4]] (column gets the negative). What is the value of the game?' },
  { id: 'tmpl-saddle-value#b', tier: 'hard', template: 'tmpl-saddle-value', params: { matrix: [[4, 6], [3, 5]] }, fp: 'saddle:4-6-3-5', prompt: 'Zero-sum game, row\u2019s payoffs [[4,6],[3,5]]. What is the value of the game?' },
  { id: 'tmpl-saddle-value#c', tier: 'harder', template: 'tmpl-saddle-value', params: { matrix: [[8, 5, 6], [2, 4, 3], [7, 9, 1]] }, fp: 'saddle:3x3-a', prompt: 'Zero-sum game, row\u2019s payoffs [[8,5,6],[2,4,3],[7,9,1]]. Find the value (look for a saddle point).' },
  // mixed value
  { id: 'tmpl-mixed-value#mp', tier: 'harder', template: 'tmpl-mixed-value', params: { matrix: [[1, -1], [-1, 1]] }, fp: 'mixed-value:mp', prompt: 'Matching Pennies, row\u2019s payoffs [[1,-1],[-1,1]] (zero-sum). What is the value of the game?' },
  { id: 'tmpl-mixed-value#morra', tier: 'harder', template: 'tmpl-mixed-value', params: { matrix: [[2, -3], [-3, 4]] }, fp: 'mixed-value:morra', prompt: 'Two-finger Morra (zero-sum), row\u2019s payoffs [[2,-3],[-3,4]]. What is the value of the game?' },
  { id: 'tmpl-mixed-value#nosaddle', tier: 'harder', template: 'tmpl-mixed-value', params: { matrix: [[1, 3], [4, 2]] }, fp: 'mixed-value:1-3-4-2', prompt: 'Zero-sum game with no saddle, row\u2019s payoffs [[1,3],[4,2]]. What is the value of the game?' },
  { id: 'tmpl-mixed-value#brutal', tier: 'brutal', template: 'tmpl-mixed-value', params: { matrix: [[0, -2], [-5, 3]] }, fp: 'mixed-value:0-n2-n5-3', prompt: 'Zero-sum game, row\u2019s payoffs [[0,-2],[-5,3]] (no saddle). What is the value of the game?' },
  // mixed prob
  { id: 'tmpl-mixed-prob#mp', tier: 'hard', template: 'tmpl-mixed-prob', params: { matrix: [[1, -1], [-1, 1]] }, fp: 'mixed-prob:mp', prompt: 'Matching Pennies, row\u2019s payoffs [[1,-1],[-1,1]]. With what probability should the row player choose the top row in equilibrium?' },
  { id: 'tmpl-mixed-prob#morra', tier: 'harder', template: 'tmpl-mixed-prob', params: { matrix: [[2, -3], [-3, 4]] }, fp: 'mixed-prob:morra', prompt: 'Two-finger Morra, row\u2019s payoffs [[2,-3],[-3,4]]. With what probability should the row player show one finger (top row) in equilibrium?' },
  { id: 'tmpl-mixed-prob#nosaddle', tier: 'harder', template: 'tmpl-mixed-prob', params: { matrix: [[1, 3], [4, 2]] }, fp: 'mixed-prob:1-3-4-2', prompt: 'Zero-sum game, row\u2019s payoffs [[1,3],[4,2]]. With what probability should the row player choose the top row in equilibrium?' },
  // pirate
  { id: 'tmpl-pirate#5-100', tier: 'harder', template: 'tmpl-pirate', params: { pirates: 5, coins: 100 }, fp: 'pirate:5-100', prompt: '5 rational pirates split 100 gold; the most senior proposes, all vote, \u226550% (proposer breaks ties) passes or he\u2019s thrown overboard. An indifferent pirate votes no. Give the full senior-to-junior allocation.' },
  { id: 'tmpl-pirate#3-100', tier: 'hard', template: 'tmpl-pirate', params: { pirates: 3, coins: 100 }, fp: 'pirate:3-100', prompt: '3 rational pirates split 100 gold under the standard rules (\u226550%, proposer tie-break, indifferent votes no). Give the full senior-to-junior allocation.' },
  { id: 'tmpl-pirate#4-100', tier: 'hard', template: 'tmpl-pirate', params: { pirates: 4, coins: 100 }, fp: 'pirate:4-100', prompt: '4 pirates, 100 gold, standard rules. Give the full senior-to-junior allocation.' },
  { id: 'tmpl-pirate#7-100', tier: 'brutal', template: 'tmpl-pirate', params: { pirates: 7, coins: 100 }, fp: 'pirate:7-100', prompt: '7 pirates, 100 gold, standard rules. Give the full senior-to-junior allocation.' },
  { id: 'tmpl-pirate#5-10', tier: 'harder', template: 'tmpl-pirate', params: { pirates: 5, coins: 10 }, fp: 'pirate:5-10', prompt: '5 pirates split only 10 gold under the standard rules. Give the full senior-to-junior allocation.' },
  // nim
  { id: 'tmpl-nim-sum#3-4-5', tier: 'hard', template: 'tmpl-nim-sum', params: { heaps: [3, 4, 5] }, fp: 'nim:3-4-5', prompt: 'Nim with heaps (3,4,5), last to take wins. What is the nim-sum (and hence who wins)? Report the nim-sum.' },
  { id: 'tmpl-nim-sum#1-4-5', tier: 'harder', template: 'tmpl-nim-sum', params: { heaps: [1, 4, 5] }, fp: 'nim:1-4-5', prompt: 'Nim with heaps (1,4,5). Report the nim-sum (a value of 0 means the player to move loses).' },
  { id: 'tmpl-nim-sum#1-2-3', tier: 'harder', template: 'tmpl-nim-sum', params: { heaps: [1, 2, 3] }, fp: 'nim:1-2-3', prompt: 'Nim with heaps (1,2,3). Report the nim-sum.' },
  { id: 'tmpl-nim-sum#5-7-9', tier: 'brutal', template: 'tmpl-nim-sum', params: { heaps: [5, 7, 9] }, fp: 'nim:5-7-9', prompt: 'Nim with heaps (5,7,9). Report the nim-sum.' },
  { id: 'tmpl-nim-sum#2-3-4-5', tier: 'brutal', template: 'tmpl-nim-sum', params: { heaps: [2, 3, 4, 5] }, fp: 'nim:2-3-4-5', prompt: 'Nim with four heaps (2,3,4,5). Report the nim-sum.' },
  // subtraction
  { id: 'tmpl-subtraction#12-3', tier: 'hard', template: 'tmpl-subtraction', params: { pile: 12, maxRemove: 3 }, fp: 'sub:12-3', prompt: 'A pile of 12; each turn remove 1\u20133; last to take wins. Report your winning first move (0 means the position is losing for you).' },
  { id: 'tmpl-subtraction#21-4', tier: 'harder', template: 'tmpl-subtraction', params: { pile: 21, maxRemove: 4 }, fp: 'sub:21-4', prompt: 'A pile of 21; each turn remove 1\u20134; last to take wins. Report your winning first move (0 = losing position).' },
  { id: 'tmpl-subtraction#100-10', tier: 'harder', template: 'tmpl-subtraction', params: { pile: 100, maxRemove: 10 }, fp: 'sub:100-10', prompt: 'Race to 100: a running total reaches 100; each turn add 1\u201310; the one who hits 100 wins. Report the first player\u2019s winning opening move (0 = losing).' },
  { id: 'tmpl-subtraction#15-4', tier: 'harder', template: 'tmpl-subtraction', params: { pile: 15, maxRemove: 4 }, fp: 'sub:15-4', prompt: 'A pile of 15; remove 1\u20134 each turn; last to take wins. Report your winning first move (0 = losing).' },
  // backward induction
  { id: 'tmpl-backward-induction#centipede', tier: 'harder', template: 'tmpl-backward-induction', params: { tree: centipede }, fp: 'bi:centipede', prompt: 'A 4-move centipede: at each node a player can Take (ending the game) or Pass (growing the pot); Take/Pass leaves are [1,0],[0,2],[3,0],[0,4] and final Pass gives [2,2]. What is the subgame-perfect payoff?' },
  { id: 'tmpl-backward-induction#entry', tier: 'hard', template: 'tmpl-backward-induction', params: { tree: entryTree }, fp: 'bi:entry', prompt: 'Entry deterrence: the entrant chooses Enter or Stay out; if Enter, the incumbent chooses Fight ([-1,-1]) or Accommodate ([2,1]); Stay out gives [0,3]. What is the subgame-perfect payoff?' },
  { id: 'tmpl-backward-induction#stackelberg', tier: 'brutal', template: 'tmpl-backward-induction', params: { tree: stackTree }, fp: 'bi:stack', prompt: 'A leader picks Low or High; the follower then picks Low or High. Leaf payoffs: Low/Low [2,2], Low/High [3,1], High/Low [1,3], High/High [0,0]. What is the subgame-perfect payoff?' },
  // extra templated questions (all engine-computed) to round out the pool
  { id: 'tmpl-saddle-value#d', tier: 'hard', template: 'tmpl-saddle-value', params: { matrix: [[7, 9], [6, 8]] }, fp: 'saddle:7-9-6-8', prompt: 'Zero-sum game, row\u2019s payoffs [[7,9],[6,8]]. What is the value of the game?' },
  { id: 'tmpl-mixed-value#5-1-2-4', tier: 'harder', template: 'tmpl-mixed-value', params: { matrix: [[5, 1], [2, 4]] }, fp: 'mixed-value:5-1-2-4', prompt: 'Zero-sum game, row\u2019s payoffs [[5,1],[2,4]] (no saddle). What is the value of the game?' },
  { id: 'tmpl-pirate#6-100', tier: 'brutal', template: 'tmpl-pirate', params: { pirates: 6, coins: 100 }, fp: 'pirate:6-100', prompt: '6 pirates, 100 gold, standard rules (\u226550%, proposer tie-break, indifferent votes no). Give the full senior-to-junior allocation.' },
  { id: 'tmpl-nim-sum#7-11-13', tier: 'brutal', template: 'tmpl-nim-sum', params: { heaps: [7, 11, 13] }, fp: 'nim:7-11-13', prompt: 'Nim with heaps (7,11,13). Report the nim-sum.' },
  { id: 'tmpl-nim-sum#4-8-12', tier: 'harder', template: 'tmpl-nim-sum', params: { heaps: [4, 8, 12] }, fp: 'nim:4-8-12', prompt: 'Nim with heaps (4,8,12). Report the nim-sum.' },
  { id: 'tmpl-subtraction#30-5', tier: 'harder', template: 'tmpl-subtraction', params: { pile: 30, maxRemove: 5 }, fp: 'sub:30-5', prompt: 'A pile of 30; remove 1\u20135 each turn; last to take wins. Report your winning first move (0 = losing position).' },
]

// free-form (engine-computable ones are recomputed by the validator; conceptual
// ones are sourced + reasoned). Each carries its own hidden record + answer.
type FreeSpec = {
  id: string; tier: Tier; prompt: string; source: string; answer: string; calls: string[]
  approaches: string[]; wrongTurns: string[]; hints: [string, string, string]; followUps: string[]
}
const FREE: FreeSpec[] = [
  {
    id: 'ff-tiger-sheep-100', tier: 'hard',
    prompt: '100 tigers and 1 sheep live on an island with only grass. Any tiger that eats the sheep itself becomes a sheep (and is then edible). All tigers are rational and value survival first. Is the sheep eaten?',
    source: 'Green Book Ch.2 \u201cTiger and sheep\u201d p.4.', answer: 'safe', calls: ['tigerSheepEaten(100) === false'],
    approaches: ['Backward induction on the count: with 1 tiger the sheep is eaten; this flips with each added tiger.', 'Parity: even count \u21d2 safe, odd \u21d2 eaten.'],
    wrongTurns: ['Assuming a tiger always eats when it can.', 'Ignoring that eating turns the eater into prey.'],
    hints: ['Start from the simplest case: one tiger and the sheep.', 'Ask what each added tiger anticipates the others will do.', 'The outcome alternates with the number of tigers \u2014 reason about the parity of 100.'],
    followUps: ['What about 99 tigers?', 'State the general rule by parity.'],
  },
  {
    id: 'ff-tiger-sheep-99', tier: 'harder',
    prompt: 'Same island rules as the tiger-and-sheep puzzle, but now there are 99 tigers and 1 sheep. Is the sheep eaten?',
    source: 'Green Book Ch.2 \u201cTiger and sheep\u201d p.4.', answer: 'eaten', calls: ['tigerSheepEaten(99) === true'],
    approaches: ['Apply the parity rule from the 100-tiger case.', 'Backward induction from one tiger.'],
    wrongTurns: ['Forgetting the answer flips with parity.'],
    hints: ['Use the parity rule you derived for the even case.', 'An odd number of tigers behaves oppositely to an even number.', 'Reason about whether 99 is even or odd and what that implies for the first eater.'],
    followUps: ['Prove the parity rule by induction.'],
  },
  {
    id: 'ff-chocolate-6x8', tier: 'hard',
    prompt: 'A 6\u00d78 chocolate bar (48 unit squares). Each break splits one rectangular piece into two along a grid line. What is the minimum number of breaks to reduce it to 48 unit squares?',
    source: 'Green Book Ch.2 \u201cChocolate bar problem.\u201d', answer: '47', calls: ['6 * 8 - 1 === 47'],
    approaches: ['Track an invariant: every break increases the number of pieces by exactly one.', 'Start with one piece, end with mn pieces.'],
    wrongTurns: ['Trying to optimize the break order (it doesn\u2019t matter).', 'Off-by-one on pieces vs breaks.'],
    hints: ['Count what each break does to the number of pieces.', 'You begin with one piece and must end with every unit square separate.', 'Pieces minus one equals breaks \u2014 it is forced, not strategic.'],
    followUps: ['Does the order of breaks change the count?', 'Generalize to an m\u00d7n bar.'],
  },
  {
    id: 'ff-pirate-2n1-keep', tier: 'harder',
    prompt: 'With 2n+1 perfectly rational pirates and 100 gold under the standard rules (\u226550%, proposer tie-break, indifferent votes no), how much does the captain keep when n=2 (i.e. 5 pirates)?',
    source: 'Green Book Ch.2 \u201cScrewy pirates\u201d p.3; Wikipedia Pirate game.', answer: '98', calls: ['pirateGame(5,100)[0] === 98'],
    approaches: ['General rule: keep 100\u2212n, bribing n juniors one coin each.', 'Backward induction over the subgames.'],
    wrongTurns: ['Confusing the count of bribes.', 'Assuming a fair split.'],
    hints: ['Use the general 2n+1 result.', 'The captain bribes the cheapest n votes one coin each.', 'Keep everything except the coins spent buying the votes you need.'],
    followUps: ['What is the allocation vector for 5 pirates?', 'How does it grow as n increases?'],
  },
  {
    id: 'ff-guess-23-average', tier: 'hard',
    prompt: 'Everyone picks a real number in [0,100]; the winner is closest to 2/3 of the average of all picks. Under common knowledge of rationality, what is the unique Nash-equilibrium guess?',
    source: 'Wikipedia \u201cGuess 2/3 of the average\u201d; Nagel (1995); Keynes\u2019s beauty contest.', answer: '0', calls: ['iterated dominance fixed point of x = (2/3)\u00b7avg'],
    approaches: ['Iterated elimination: nobody picks above 2/3\u00b7100, then above 2/3 of that, \u2026', 'Find the fixed point of the best-response map.'],
    wrongTurns: ['Stopping after one round of elimination.', 'Confusing the equilibrium with the empirically-winning guess (~20\u201335).'],
    hints: ['Ask what the largest sensible guess could be.', 'Now iterate: given that ceiling, what is the new ceiling?', 'The chain of eliminations converges to a single fixed point.'],
    followUps: ['Why do real players land near 20\u201335?', 'How is this a metaphor for markets?'],
  },
  {
    id: 'ff-rps-mix', tier: 'hard',
    prompt: 'In Rock-Paper-Scissors (win +1, lose \u22121, tie 0), what is the unique equilibrium strategy?',
    source: 'UNC-Charlotte ECON3161; Berkeley econ160 (RPS mixed NE).', answer: '1/3', calls: ['pureNashEquilibria(RPS) === [] (no pure NE); uniform mix by symmetry'],
    approaches: ['By symmetry each action is played with equal probability.', 'Make the opponent indifferent across all three actions.'],
    wrongTurns: ['Believing a deterministic counter exists.', 'Reusing your last move predictably.'],
    hints: ['There is no pure best move \u2014 any pattern is exploitable.', 'Mix so the opponent is indifferent across all three replies.', 'Symmetry forces equal weight on each action.'],
    followUps: ['What is the value of the game?', 'How would you exploit a biased human opponent?'],
  },
  {
    id: 'ff-coins-on-table', tier: 'harder',
    prompt: 'Two players alternately place identical coins (no overlap, fully on the table) on a circular table; the player who cannot move loses. Do you move first or second, and what is the strategy?',
    source: 'techinterview.org \u201cCoin on a Table\u201d; ThatsMaths \u201cThe Beer-Mat Game.\u201d', answer: 'center', calls: ['central-symmetry strategy-stealing (geometry)'],
    approaches: ['Exploit the table\u2019s center of symmetry.', 'Mirror the opponent through the center after a first central move.'],
    wrongTurns: ['Going second.', 'Assuming it works for any (non-symmetric) table shape.'],
    hints: ['The circular table has a special point.', 'After your first move, can you always copy the opponent\u2019s move somewhere?', 'Use the table\u2019s symmetry so your reply is always legal \u2014 the opponent runs out of room first.'],
    followUps: ['Why does this fail for an asymmetric table?', 'Relate it to the strategy-stealing argument.'],
  },
  {
    id: 'ff-minimax-theorem', tier: 'harder',
    prompt: 'Does every finite two-player zero-sum game have a well-defined value (the most the row player can guarantee equals the least the column player can hold them to)?',
    source: 'von Neumann (1928) minimax theorem; Ferguson, Game Theory.', answer: 'yes', calls: ['maximin = minimax for any finite zero-sum game (von Neumann)'],
    approaches: ['Cite the minimax theorem: maximin = minimax with mixed strategies.', 'In zero-sum games Nash equilibrium coincides with the minimax/maximin solution.'],
    wrongTurns: ['Confusing pure-strategy value (may not exist) with mixed-strategy value (always exists).'],
    hints: ['Pure strategies may not suffice \u2014 what about mixed?', 'Recall the named theorem about maximin versus minimax.', 'With mixed strategies the two coincide for every finite zero-sum game.'],
    followUps: ['Who proved it, and when?', 'How do you compute the value for a large game?'],
  },
  {
    id: 'ff-misere-nim', tier: 'brutal',
    prompt: 'In mis\u00e8re Nim (last to take LOSES), when all heaps have more than one token, is the optimal strategy the same as normal Nim (last to take wins)?',
    source: 'Wikipedia Nim \u00a7Mis\u00e8re; Bouton (1901).', answer: 'yes', calls: ['mis\u00e8re Nim plays identically to normal Nim until heaps are all \u22641'],
    approaches: ['Play the normal nim-sum strategy until exactly one heap exceeds one token, then deviate.', 'Only the endgame differs between normal and mis\u00e8re.'],
    wrongTurns: ['Believing mis\u00e8re needs a totally different strategy throughout.'],
    hints: ['Compare normal and mis\u00e8re play away from the endgame.', 'Where do the two versions actually diverge?', 'They agree until the heaps are all of size at most one \u2014 only then does mis\u00e8re invert.'],
    followUps: ['Describe the endgame switch precisely.', 'When exactly do you deviate from the nim-sum move?'],
  },
  {
    id: 'ff-centipede-spe', tier: 'harder',
    prompt: 'In a finite centipede game where passing always grows the pot, what does backward induction predict the first player does?',
    source: 'Wikipedia Centipede game; MIT 14.12.', answer: 'take', calls: ['backward induction folds to Take at the first node'],
    approaches: ['Fold from the last node: each mover prefers Take to the future they\u2019d face.', 'The unravelling reaches the first node.'],
    wrongTurns: ['Expecting rational players to keep passing for the larger joint pot.', 'Confusing the SPE with the many other Nash equilibria.'],
    hints: ['Solve the very last decision first.', 'Given that, what does the second-to-last mover do?', 'The unravelling propagates all the way to the first node.'],
    followUps: ['Why is cooperation not subgame-perfect here?', 'How do humans actually play it?'],
  },
  {
    id: 'ff-traveler-dilemma', tier: 'brutal',
    prompt: 'Two travelers each claim an integer dollar amount between 2 and 100; both are paid the lower claim, with a +2 bonus to the lower claimant and a \u22122 penalty to the higher. What is the unique Nash equilibrium claim?',
    source: 'Kaushik Basu, \u201cThe Traveler\u2019s Dilemma\u201d (Scientific American); Wikipedia.', answer: '2', calls: ['iterated (weak) dominance collapses to the minimum claim'],
    approaches: ['Undercutting any common claim k by one dollar pays k+1 > k \u2014 iterate down.', 'Find the only profile with no profitable deviation.'],
    wrongTurns: ['Claiming 100 (the naive, jointly-better choice).', 'Stopping the undercutting chain early.'],
    hints: ['What happens if you claim one dollar less than your opponent?', 'Iterate that undercutting incentive.', 'The chain bottoms out at the smallest allowed claim.'],
    followUps: ['Why do people not play the equilibrium?', 'How does the bonus/penalty size affect behavior?'],
  },
]

// ── assemble ──────────────────────────────────────────────────────────────────
function buildTemplated(s: Spec): Question {
  const meta = TPL[s.template]
  const answer = answerFor(s.template, s.params)
  return {
    id: s.id,
    tier: s.tier,
    fingerprint: `${s.template}:${s.fp}`,
    template: { id: s.template, params: s.params },
    prompt: s.prompt,
    source: s.source ?? meta.source,
    engineCheck: {
      module: 'src/engine/gameTheory.ts',
      calls: [`${s.template}(${JSON.stringify(s.params)}) \u2192 ${answer}`],
      answer,
      verified: true,
    },
    hidden: {
      answer,
      approaches: meta.approaches,
      wrongTurns: meta.wrongTurns,
      hintLadder: meta.hints,
      rubric: RUBRIC,
    },
    followUps: meta.followUps,
  }
}

function buildFree(f: FreeSpec): Question {
  return {
    id: f.id,
    tier: f.tier,
    fingerprint: `sem:${f.id}`,
    prompt: f.prompt,
    source: f.source,
    engineCheck: { module: 'src/engine/gameTheory.ts', calls: f.calls, answer: f.answer, verified: true },
    hidden: { answer: f.answer, approaches: f.approaches, wrongTurns: f.wrongTurns, hintLadder: f.hints, rubric: RUBRIC },
    followUps: f.followUps,
  }
}

const questions: Question[] = [...SPECS.map(buildTemplated), ...FREE.map(buildFree)]
const byTier = { hard: 0, harder: 0, brutal: 0 }
questions.forEach((q) => byTier[q.tier]++)
const templated = questions.filter((q) => q.template).length
const freeForm = questions.filter((q) => !q.template).length

const templates = Object.entries(TPL).map(([id, m]) => ({
  id,
  title: m.title,
  source: m.source,
  description: m.description,
  engineModule: 'src/engine/gameTheory.ts',
}))

const INTERVIEWER_PROMPT = [
  'ROLE',
  'You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), running a live mock interview on GAME THEORY. Be professional, probing, and fair-but-pressured. You are interviewing one candidate, right now, on the single question below.',
  '',
  'THE QUESTION (injected at runtime)',
  '- Prompt: {{prompt}}',
  '- Tier: {{tier}} (hard | harder | brutal \u2014 calibrate pressure and follow-up depth)',
  '- Source: {{source}} (your context only; never read it aloud)',
  '',
  'PROTOCOL',
  '1. Ask the question once from {{prompt}}, then let the candidate drive. ONE question at a time \u2014 never surface follow-ups early.',
  '2. Make them think ALOUD: which solution concept applies (dominance, best response / Nash, the indifference principle, minimax/saddle, backward induction, or nim-sum/parity)? Reward naming the structure before computing.',
  '3. Probe, don\u2019t solve. Ask whether they checked every column/case, stated the tie-breaking and play conventions (normal vs mis\u00e8re; \u226550% with proposer tie-break; indifferent-votes-no), and distinguished Nash from subgame-perfect.',
  '4. Release hints only when genuinely stuck or asked (see HINTS).',
  '5. After they COMMIT, work the follow-up chain (see FOLLOW-UPS), then close (see SCORING).',
  '',
  'HINTS \u2014 escalating, ONLY when stuck',
  'Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, only after a stuck-signal. The near-reveal points at the METHOD only \u2014 it must NOT state the final number.',
  '',
  'NO-ANSWER-LEAK (critical)',
  'Before the candidate commits, NEVER state, approximate, confirm, deny, or narrow the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record. If asked \u201cis that right?\u201d mid-solve, redirect.',
  '',
  'GROUNDING (critical)',
  'Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH \u2014 verified by this concept\u2019s exact engine (src/engine/gameTheory.ts). Do NOT re-derive or \u201ccorrect\u201d the ground truth; if your mental arithmetic disagrees, you are wrong. Accept any mathematically-equivalent exact form (e.g. an unreduced equal fraction, an equal cell written (row,col), an equivalent allocation). Use {{hidden.wrongTurns}} to RECOGNIZE misconceptions, not to lead the candidate into them. Grade ONLY against the rubric.',
  '',
  'FOLLOW-UPS \u2014 after they commit',
  'Ask {{followUps}} in order, one at a time (bias a payoff, generalize to N, change normal\u2194mis\u00e8re, or ask for the supporting strategy / intuition), with the no-leak and hint rules still in force.',
  '',
  'SCORING \u2014 close the interview',
  'Give structured feedback, then rate each axis of {{hidden.rubric}} 1\u20135 (correctness, approach, rigor, communication, speed) with one line each, then an overall 1\u20135 hire-signal. Tie every judgment to a specific moment.',
  '',
  'INJECTION NOTE',
  'At runtime the feature replaces every {{...}} with the drawn question\u2019s fields; treat the filled-in values as the entire ground truth for this interview.',
].join('\n')

const GENERATOR_PROMPT = [
  'ROLE',
  'You generate ONE fresh, hard, real-quant-style GAME-THEORY interview question on demand to top up a pool without repeating one a student has seen. Every question must be (a) a realistic quant-interview question anchored to this concept\u2019s Green-Book topics and the quant canon, (b) engine-verifiable before it is served, and (c) structurally new vs an avoid-list. Otherwise REFUSE. Output is a single JSON object and nothing else.',
  '',
  'SCOPE \u2014 only these Game-Theory topics',
  'Strict/iterated dominance (IESDS); pure Nash via best response (incl. coordination games); mixed strategies & the indifference principle; zero-sum saddle points & the 2\u00d72 minimax value; sequential games & backward induction (incl. the pirate game and parity teasers); impartial games (Nim nim-sum, subtraction games mod (k+1)).',
  '',
  'REAL-QUANT-STYLE (mandatory \u2014 ADR-0005)',
  'Model every question on the actual quant-interview canon (prisoner\u2019s dilemma, matching pennies, pirates, Nim, the 21/race game). It must read like something genuinely asked on a desk \u2014 never an arbitrary puzzle that merely happens to be engine-solvable.',
  '',
  'PREFER TEMPLATES (first choice); free-form only as a fallback. Engine-backed forms (src/engine/gameTheory.ts):',
  '- tmpl-pure-nash {payoffs:number[][][]}        \u2192 pureNashEquilibria',
  '- tmpl-iesds {payoffs}                          \u2192 iesdsSolution',
  '- tmpl-saddle-value {matrix:number[][]}         \u2192 saddlePoint(value)',
  '- tmpl-mixed-value {matrix} / tmpl-mixed-prob   \u2192 mixedValue2x2(value | p)',
  '- tmpl-pirate {pirates,coins}                   \u2192 pirateGame',
  '- tmpl-nim-sum {heaps:number[]}                 \u2192 nimSum',
  '- tmpl-subtraction {pile,maxRemove}            \u2192 pile % (maxRemove+1)',
  '- tmpl-backward-induction {tree}               \u2192 backwardInduction(payoff)',
  'Emit a free-form question ONLY if no template fits \u2014 and it STILL must pass engine verification, with fingerprint \u201csem:<hash>\u201d.',
  '',
  'ENGINE-VERIFY-BEFORE-SERVE (mandatory \u2014 ADR-0005)',
  'Output the exact data to reproduce the answer with src/engine/gameTheory.ts so the live feature can RUN the engine and REJECT anything it cannot verify. engineCheck = { module:"src/engine/gameTheory.ts", calls:[exact call(s)], answer:<exact string the engine returns> }. The engine is exact (integers / rationals {n,d} / XOR) \u2014 every graded answer is a clean cell, vector, integer, or reduced fraction. State play conventions explicitly (normal play; \u226550% + proposer tie-break + indifferent-votes-no).',
  '',
  'AVOID-LIST / NO-OVERLAP',
  'You are given avoidList (the student\u2019s seen-set \u222a the global pool). Your fingerprint MUST NOT be in it. Fingerprint = \u201c<templateId>:<normalized-params>\u201d or \u201csem:<hash>\u201d. Change structure/params until new, or REFUSE.',
  '',
  'HINTS: exactly 3 rungs (nudge \u2192 stronger \u2192 near-reveal); the near-reveal gives METHOD ONLY and must not state the final number. FOLLOW-UPS: \u22651. hidden.answer MUST equal engineCheck.answer.',
  '',
  'SELF-REJECTION: if you cannot produce a question that is real-quant-style + Green-Book-anchored, engine-verifiable, and structurally new, output exactly { "refusal": true, "reason": "<which fence failed>" }. An honest refusal beats an unverifiable or repeated question.',
].join('\n')

const pack = {
  version: 1 as const,
  kind: 'interview-pack' as const,
  courseId: 'course-game-theory',
  concept: 'Game Theory',
  greenBookAnchor:
    'Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews \u2014 Ch.2 Brain Teasers: \u201cScrewy pirates\u201d (p.3), \u201cTiger and sheep\u201d (p.4), \u201cChocolate bar problem\u201d; plus the standard dominance / Nash / mixed / minimax / backward-induction / Nim quant-interview canon (Joshi QJIQ&A; brainstellar; techinterview; Palacios-Huerta minimax).',
  engineModule: 'src/engine/gameTheory.ts',
  generator: 'interviews/_build/build-game-theory-pack.ts',
  note: 'Dormant capstone asset: committed but NOT seeded/deployed (the seed glob matches only fixtures/course-*.json | fixtures/lesson-*.json; this lives under interviews/). Self-describing via `version`. Every templated answer is reproduced by src/engine/gameTheory.ts (exact: cells, vectors, integers, XOR, reduced rationals \u2014 no floats); conceptual free-form answers are sourced + reasoned.',
  counts: { total: questions.length, byTier, templated, freeForm },
  interviewerPrompt: INTERVIEWER_PROMPT,
  generatorPrompt: GENERATOR_PROMPT,
  templates,
  questions,
}

writeFileSync(outJson, JSON.stringify(pack, null, 2) + '\n')

// ── SELF-VERIFY ───────────────────────────────────────────────────────────────
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function hintRungLeaks(answer: string, rungText: string): boolean {
  const esc = escapeRegExp(answer)
  if (answer.includes('/')) return new RegExp(`(?<![\\d/])${esc}(?![\\d/])`).test(rungText)
  const statedResult = new RegExp(`(?:=|\u21d2|is\\s+|:\\s*)\\s*${esc}\\b`).test(rungText)
  const trailingResult = new RegExp(`[=:]\\s*${esc}$`).test(rungText.trim())
  return statedResult || trailingResult
}

const reloaded = JSON.parse(readFileSync(outJson, 'utf8'))
const parsed = InterviewPackSchema.safeParse(reloaded)
if (!parsed.success) {
  console.error(z.prettifyError(parsed.error))
  throw new Error('SELF-VERIFY: emitted pack failed InterviewPackSchema')
}
const fps = new Set<string>()
for (const q of parsed.data.questions) {
  if (fps.has(q.fingerprint)) throw new Error(`SELF-VERIFY: duplicate fingerprint ${q.fingerprint}`)
  fps.add(q.fingerprint)
  if (q.template) {
    const recomputed = answerFor(q.template.id, q.template.params as Params)
    if (recomputed !== q.engineCheck.answer) {
      throw new Error(`SELF-VERIFY: ${q.id} engine="${recomputed}" answer="${q.engineCheck.answer}"`)
    }
  }
  if (q.hidden.answer !== q.engineCheck.answer) throw new Error(`SELF-VERIFY: ${q.id} hidden.answer != engineCheck.answer`)
  if (hintRungLeaks(q.engineCheck.answer, q.hidden.hintLadder[1])) throw new Error(`SELF-VERIFY: ${q.id} hint rung 2 leaks answer`)
  if (hintRungLeaks(q.engineCheck.answer, q.hidden.hintLadder[2])) throw new Error(`SELF-VERIFY: ${q.id} hint rung 3 leaks answer`)
}
if (parsed.data.counts.total !== questions.length) throw new Error('SELF-VERIFY: counts.total mismatch')

const recomputedCount = parsed.data.questions.filter((q) => q.template).length
console.log(`\u2713 wrote ${outJson}`)
console.log(`\u2713 ${questions.length} questions (hard ${byTier.hard} / harder ${byTier.harder} / brutal ${byTier.brutal}); templated ${templated}, free-form ${freeForm}`)
console.log(`\u2713 SELF-VERIFY: schema OK; ${recomputedCount} templated answers reproduced by gameTheory.ts; ${fps.size} unique fingerprints; no hint leaks`)
console.log('\u2713 PASS')
