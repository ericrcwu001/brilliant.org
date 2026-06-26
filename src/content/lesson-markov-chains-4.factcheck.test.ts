// Stage-2 fact-check: every graded number in lesson-markov-chains-4.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { classifyStates, absorptionProbabilities, formatRational } from '../engine/markov'
import { ratAdd, ratMul } from '../engine/automaton'

const r = (n: number, d = 1) => ({ n, d })

// ── Matrices (typed so the returnProb helper type-checks) ────────────────────

const C3: { n: number; d: number }[][] = [
  [r(1, 2), r(1, 2), r(0)],
  [r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(1)],
]

const C4: { n: number; d: number }[][] = [
  [r(0), r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(1), r(0)],
  [r(0), r(1), r(0), r(0)],
  [r(0), r(0), r(0), r(1)],
]

const E2: { n: number; d: number }[][] = [
  [r(0), r(1), r(0)],
  [r(1, 2), r(0), r(1, 2)],
  [r(0), r(1), r(0)],
]

const R3: { n: number; d: number }[][] = [
  [r(0), r(1), r(0)],
  [r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(1)],
]

const gr: { n: number; d: number }[][] = [
  [r(1), r(0), r(0), r(0)],
  [r(1, 3), r(0), r(2, 3), r(0)],
  [r(0), r(1, 3), r(0), r(2, 3)],
  [r(0), r(0), r(0), r(1)],
]

// ── Return-probability helper (home-absorbing construction) ──────────────────

function returnProb(
  P: { n: number; d: number }[][],
  home: number,
  walls: number[],
): { n: number; d: number } {
  const n = P.length
  const absorbing = [home, ...walls.filter((w) => w !== home)]
  const Pmod = P.map((row, i) =>
    i === home ? row.map((_, j) => ({ n: j === home ? 1 : 0, d: 1 })) : row,
  )
  const B = absorptionProbabilities(Pmod, absorbing)
  const transient = P.map((_, i) => i).filter((i) => !absorbing.includes(i))
  const rowOf = new Map(transient.map((s, idx) => [s, idx]))
  let f = { n: 0, d: 1 }
  for (let j = 0; j < n; j++) {
    if (P[home][j].n === 0) continue
    const g: { n: number; d: number } =
      j === home
        ? { n: 1, d: 1 }
        : absorbing.includes(j)
          ? { n: 0, d: 1 }
          : B[rowOf.get(j)!][0]
    f = ratAdd(f, ratMul(P[home][j], g))
  }
  return f
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('lesson-markov-chains-4 fact-check', () => {
  it('classify-first: classifyStates(C3)[2].kind === "absorbing"', () => {
    expect(classifyStates(C3)[2].kind).toBe('absorbing')
  })

  it('classify-board: classifyStates(C4)[1].period === 2', () => {
    expect(classifyStates(C4)[1].period).toBe(2)
  })

  it('classify-and-group: classifyStates(C4).map(c=>c.kind).join(",") === "transient,recurrent,recurrent,absorbing"', () => {
    expect(classifyStates(C4).map((c) => c.kind).join(',')).toBe(
      'transient,recurrent,recurrent,absorbing',
    )
  })

  it('ehrenfest-period: classifyStates(E2)[0].period === 2', () => {
    expect(classifyStates(E2)[0].period).toBe(2)
  })

  it('transient-vs-recurrent: returnProb(R3, 0, [2]) === "1/2"', () => {
    expect(formatRational(returnProb(R3, 0, [2]))).toBe('1/2')
  })

  it('mastery-challenge return prob: returnProb(gr, 1, [0,3]) === "2/9"', () => {
    expect(formatRational(returnProb(gr, 1, [0, 3]))).toBe('2/9')
  })
})
