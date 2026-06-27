import { describe, it, expect } from 'vitest'
import {
  reduce,
  formatRational,
  formatVector,
  pureNashEquilibria,
  strictlyDominatedRows,
  strictlyDominatedCols,
  iesdsSolution,
  saddlePoint,
  mixedValue2x2,
  mixedNash2x2,
  backwardInduction,
  pirateGame,
  tigerSheepEaten,
  nimSum,
  nimIsWinning,
  nimWinningMoves,
  subtractionIsWinning,
  subtractionWinningMove,
  type Game,
  type GameTreeNode,
} from './gameTheory'
import type { Rational } from './types'

const R = (n: number, d = 1): Rational => ({ n, d })
const cell = (r: number, c: number) => ({ row: R(r), col: R(c) })

// Prisoner's Dilemma — row/col 0 = Cooperate, 1 = Defect.
const PD: Game = [
  [cell(3, 3), cell(0, 5)],
  [cell(5, 0), cell(1, 1)],
]
// Stag Hunt — 0 = Stag, 1 = Hare.
const STAG: Game = [
  [cell(3, 3), cell(0, 1)],
  [cell(1, 0), cell(1, 1)],
]
// Battle of the Sexes — 0 = own venue.
const BOS: Game = [
  [cell(3, 2), cell(0, 0)],
  [cell(0, 0), cell(2, 3)],
]
// Chicken — 0 = Swerve, 1 = Straight.
const CHICKEN: Game = [
  [cell(4, 4), cell(2, 5)],
  [cell(5, 2), cell(1, 1)],
]
// Matching Pennies as a bimatrix (zero-sum) — 0 = Heads.
const MP: Game = [
  [cell(1, -1), cell(-1, 1)],
  [cell(-1, 1), cell(1, -1)],
]
// Rock-Paper-Scissors (3×3 zero-sum) — 0=R,1=P,2=S; row payoff win +1/lose −1/tie 0.
const RPS: Game = [
  [cell(0, 0), cell(-1, 1), cell(1, -1)],
  [cell(1, -1), cell(0, 0), cell(-1, 1)],
  [cell(-1, 1), cell(1, -1), cell(0, 0)],
]

describe('gameTheory — rational helpers', () => {
  it('reduce / formatRational / formatVector', () => {
    expect(reduce(2, 4)).toEqual({ n: 1, d: 2 })
    expect(reduce(-1, 12)).toEqual({ n: -1, d: 12 })
    expect(reduce(0, 5)).toEqual({ n: 0, d: 1 })
    expect(reduce(6, -3)).toEqual({ n: -2, d: 1 })
    expect(formatRational(R(7, 12))).toBe('7/12')
    expect(formatRational(R(-1, 12))).toBe('-1/12')
    expect(formatRational(R(6, 2))).toBe('3')
    expect(formatRational(R(0, 9))).toBe('0')
    expect(formatVector([R(1, 2), R(1, 2)])).toBe('1/2,1/2')
  })
})

describe('gameTheory — pure-strategy analysis', () => {
  it('Prisoner\u2019s Dilemma: Defect strictly dominates; unique NE (1,1)', () => {
    expect(strictlyDominatedRows(PD)).toEqual([0])
    expect(strictlyDominatedCols(PD)).toEqual([0])
    expect(iesdsSolution(PD)).toEqual({ row: 1, col: 1 })
    expect(pureNashEquilibria(PD)).toEqual([{ row: 1, col: 1 }])
  })
  it('Stag Hunt: two pure NE (0,0) & (1,1)', () => {
    expect(pureNashEquilibria(STAG)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ])
  })
  it('Battle of the Sexes: two pure NE (0,0) & (1,1)', () => {
    expect(pureNashEquilibria(BOS)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ])
  })
  it('Chicken: two pure NE (0,1) & (1,0)', () => {
    expect(pureNashEquilibria(CHICKEN)).toEqual([
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ])
  })
  it('Matching Pennies & RPS: no pure NE', () => {
    expect(pureNashEquilibria(MP)).toEqual([])
    expect(pureNashEquilibria(RPS)).toEqual([])
  })
})

describe('gameTheory — zero-sum value', () => {
  it('saddle point: [[3,5],[2,4]] → value 3 at (0,0)', () => {
    const sp = saddlePoint([
      [R(3), R(5)],
      [R(2), R(4)],
    ])
    expect(sp).not.toBeNull()
    expect(sp!.row).toBe(0)
    expect(sp!.col).toBe(0)
    expect(formatRational(sp!.value)).toBe('3')
  })
  it('no saddle: Matching Pennies & Morra return null', () => {
    expect(
      saddlePoint([
        [R(1), R(-1)],
        [R(-1), R(1)],
      ]),
    ).toBeNull()
    expect(
      saddlePoint([
        [R(2), R(-3)],
        [R(-3), R(4)],
      ]),
    ).toBeNull()
  })
  it('mixedValue2x2: Matching Pennies → value 0, p 1/2', () => {
    const r = mixedValue2x2([
      [R(1), R(-1)],
      [R(-1), R(1)],
    ])
    expect(formatRational(r.value)).toBe('0')
    expect(formatRational(r.p)).toBe('1/2')
    expect(formatRational(r.q)).toBe('1/2')
  })
  it('mixedValue2x2: Two-finger Morra [[2,-3],[-3,4]] → value -1/12, p 7/12', () => {
    const r = mixedValue2x2([
      [R(2), R(-3)],
      [R(-3), R(4)],
    ])
    expect(formatRational(r.value)).toBe('-1/12')
    expect(formatRational(r.p)).toBe('7/12')
    expect(formatRational(r.q)).toBe('7/12')
  })
  it('mixedValue2x2: no-saddle [[1,3],[4,2]] → value 5/2, p 1/2, q 1/4', () => {
    const r = mixedValue2x2([
      [R(1), R(3)],
      [R(4), R(2)],
    ])
    expect(formatRational(r.value)).toBe('5/2')
    expect(formatRational(r.p)).toBe('1/2')
    expect(formatRational(r.q)).toBe('1/4')
  })
})

describe('gameTheory — mixed Nash (general sum 2×2)', () => {
  it('Matching Pennies: p = q = 1/2', () => {
    const m = mixedNash2x2(MP)
    expect(m).not.toBeNull()
    expect(formatRational(m!.p)).toBe('1/2')
    expect(formatRational(m!.q)).toBe('1/2')
  })
  it('Battle of the Sexes: p = 3/5, q = 2/5', () => {
    const m = mixedNash2x2(BOS)
    expect(m).not.toBeNull()
    expect(formatRational(m!.p)).toBe('3/5')
    expect(formatRational(m!.q)).toBe('2/5')
  })
})

describe('gameTheory — backward induction', () => {
  it('centipede (doubling, leaf 2,2): SPE = Take immediately, payoff (1,0)', () => {
    const tree: GameTreeNode = {
      kind: 'decision',
      player: 0,
      moves: [
        { label: 'Take', child: { kind: 'leaf', payoff: [R(1), R(0)] } },
        {
          label: 'Pass',
          child: {
            kind: 'decision',
            player: 1,
            moves: [
              { label: 'Take', child: { kind: 'leaf', payoff: [R(0), R(2)] } },
              {
                label: 'Pass',
                child: {
                  kind: 'decision',
                  player: 0,
                  moves: [
                    { label: 'Take', child: { kind: 'leaf', payoff: [R(3), R(0)] } },
                    {
                      label: 'Pass',
                      child: {
                        kind: 'decision',
                        player: 1,
                        moves: [
                          { label: 'Take', child: { kind: 'leaf', payoff: [R(0), R(4)] } },
                          { label: 'Pass', child: { kind: 'leaf', payoff: [R(2), R(2)] } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    }
    const spe = backwardInduction(tree)
    expect(formatVector(spe.payoff)).toBe('1,0')
    expect(spe.path).toEqual(['Take'])
  })
})

describe('gameTheory — pirate game', () => {
  it('classic allocations', () => {
    expect(pirateGame(1, 100)).toEqual([100])
    expect(pirateGame(2, 100)).toEqual([100, 0])
    expect(pirateGame(3, 100)).toEqual([99, 0, 1])
    expect(pirateGame(4, 100)).toEqual([99, 0, 1, 0])
    expect(pirateGame(5, 100)).toEqual([98, 0, 1, 0, 1])
  })
  it('tiger & sheep parity', () => {
    expect(tigerSheepEaten(100)).toBe(false)
    expect(tigerSheepEaten(7)).toBe(true)
    expect(tigerSheepEaten(1)).toBe(true)
    expect(tigerSheepEaten(2)).toBe(false)
  })
})

describe('gameTheory — impartial games', () => {
  it('Nim (3,4,5): nim-sum 2, winning, unique move 3→1', () => {
    expect(nimSum([3, 4, 5])).toBe(2)
    expect(nimIsWinning([3, 4, 5])).toBe(true)
    expect(nimWinningMoves([3, 4, 5])).toEqual([{ heap: 0, removeTo: 1 }])
  })
  it('Nim (1,4,5): nim-sum 0, losing', () => {
    expect(nimSum([1, 4, 5])).toBe(0)
    expect(nimIsWinning([1, 4, 5])).toBe(false)
    expect(nimWinningMoves([1, 4, 5])).toEqual([])
  })
  it('subtraction game (take 1..3)', () => {
    expect(subtractionIsWinning(12, 3)).toBe(false) // multiple of 4 → mover loses
    expect(subtractionWinningMove(12, 3)).toBeNull()
    expect(subtractionIsWinning(10, 3)).toBe(true)
    expect(subtractionWinningMove(10, 3)).toBe(2)
  })
})
