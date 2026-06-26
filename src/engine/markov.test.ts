import { describe, it, expect } from 'vitest'
import type { Rational } from './types'
import {
  buildChain,
  matrixPower,
  classifyStates,
  absorptionProbabilities,
  expectedAbsorptionTime,
  stationaryDistribution,
  kacReturnTime,
  detailedBalance,
  pagerank,
  simulateChain,
  formatRational,
  formatVector,
} from './markov'

const r = (n: number, d = 1): Rational => ({ n, d })

// ── Matrix definitions ─────────────────────────────────────────────────────

const weather: Rational[][] = [
  [r(3, 5), r(2, 5)],
  [r(3, 10), r(7, 10)],
]

const oz: Rational[][] = [
  [r(1, 2), r(1, 4), r(1, 4)],
  [r(1, 2), r(0), r(1, 2)],
  [r(1, 4), r(1, 4), r(1, 2)],
]

const gr: Rational[][] = [
  [r(1), r(0), r(0), r(0)],
  [r(1, 3), r(0), r(2, 3), r(0)],
  [r(0), r(1, 3), r(0), r(2, 3)],
  [r(0), r(0), r(0), r(1)],
]

const sym5: Rational[][] = [
  [r(1), r(0), r(0), r(0), r(0)],
  [r(1, 2), r(0), r(1, 2), r(0), r(0)],
  [r(0), r(1, 2), r(0), r(1, 2), r(0)],
  [r(0), r(0), r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(0), r(0), r(1)],
]

const dice4: Rational[][] = [
  [r(29, 36), r(1, 6), r(1, 36), r(0)],
  [r(29, 36), r(0), r(1, 36), r(1, 6)],
  [r(0), r(0), r(1), r(0)],
  [r(0), r(0), r(0), r(1)],
]

const thh: Rational[][] = [
  [r(1, 2), r(1, 2), r(0), r(0)],
  [r(0), r(1, 2), r(1, 2), r(0)],
  [r(0), r(1, 2), r(0), r(1, 2)],
  [r(0), r(0), r(0), r(1)],
]

const gfg: Rational[][] = [
  [r(7, 10), r(3, 10)],
  [r(4, 10), r(6, 10)],
]

const cloudy: Rational[][] = [
  [r(0), r(1, 2), r(1, 2)],
  [r(1, 4), r(1, 2), r(1, 4)],
  [r(1, 4), r(1, 4), r(1, 2)],
]

const ehr2: Rational[][] = [
  [r(0), r(1), r(0)],
  [r(1, 2), r(0), r(1, 2)],
  [r(0), r(1), r(0)],
]

const ehr3: Rational[][] = [
  [r(0), r(1), r(0), r(0)],
  [r(1, 3), r(0), r(2, 3), r(0)],
  [r(0), r(2, 3), r(0), r(1, 3)],
  [r(0), r(0), r(1), r(0)],
]

const cyc3: Rational[][] = [
  [r(0), r(1), r(0)],
  [r(0), r(0), r(1)],
  [r(1), r(0), r(0)],
]

const link4: Rational[][] = [
  [r(0), r(1), r(0), r(0)],
  [r(1, 2), r(0), r(0), r(1, 2)],
  [r(1, 2), r(0), r(0), r(1, 2)],
  [r(1, 3), r(1, 3), r(1, 3), r(0)],
]

const link3: Rational[][] = [
  [r(0), r(1, 2), r(1, 2)],
  [r(0), r(0), r(1)],
  [r(1), r(0), r(0)],
]

const asym2: Rational[][] = [
  [r(1, 4), r(3, 4)],
  [r(1, 5), r(4, 5)],
]

// Symmetric random walk on states 0..100 with reflecting barriers.
const sym100: Rational[][] = Array.from({ length: 101 }, (_, i) => {
  const row: Rational[] = Array.from({ length: 101 }, () => r(0))
  if (i === 0) { row[0] = r(1); return row }
  if (i === 100) { row[100] = r(1); return row }
  row[i - 1] = r(1, 2)
  row[i + 1] = r(1, 2)
  return row
})

// M13: state 0, 1out (transient), 2=absorbing, 1in=absorbing(3)
const M13: Rational[][] = [
  [r(0), r(0), r(0), r(1)],
  [r(1, 2), r(0), r(1, 2), r(0)],
  [r(0), r(0), r(1), r(0)],
  [r(0), r(0), r(0), r(1)],
]

// M14: state 0(absorbing), 1out, 2, 3(absorbing), 4=1in(absorbing)
const M14: Rational[][] = [
  [r(1), r(0), r(0), r(0), r(0)],
  [r(2, 3), r(0), r(1, 3), r(0), r(0)],
  [r(0), r(0), r(0), r(1, 3), r(2, 3)],
  [r(0), r(0), r(0), r(1), r(0)],
  [r(0), r(0), r(0), r(0), r(1)],
]

// ── Golden tests ───────────────────────────────────────────────────────────

describe('Markov engine – 27 goldens', () => {
  it('G1: matrixPower(weather,1)[1][1]', () => {
    expect(formatRational(matrixPower(weather, 1)[1][1])).toBe('7/10')
  })

  it('G2: matrixPower(oz,2)[0][2]', () => {
    expect(formatRational(matrixPower(oz, 2)[0][2])).toBe('3/8')
  })

  it('G3: matrixPower(oz,2)[0][0]', () => {
    expect(formatRational(matrixPower(oz, 2)[0][0])).toBe('7/16')
  })

  it('G4: matrixPower(weather,2)[0][0]', () => {
    expect(formatRational(matrixPower(weather, 2)[0][0])).toBe('12/25')
  })

  it('G5: matrixPower(weather,2)[1][0]', () => {
    expect(formatRational(matrixPower(weather, 2)[1][0])).toBe('39/100')
  })

  it('G6: matrixPower(oz,3)[0][2]', () => {
    expect(formatRational(matrixPower(oz, 3)[0][2])).toBe('25/64')
  })

  it('G7: absorptionProbabilities(gr,[0,3]) column 1', () => {
    const B7 = absorptionProbabilities(gr, [0, 3])
    expect(formatVector([B7[0][1], B7[1][1]])).toBe('4/7,6/7')
  })

  it('G8: absorptionProbabilities(sym5,[0,4]) column 1', () => {
    const B8 = absorptionProbabilities(sym5, [0, 4])
    expect(formatVector([B8[0][1], B8[1][1], B8[2][1]])).toBe('1/4,1/2,3/4')
  })

  it('G9: expectedAbsorptionTime(sym5,[0,4])', () => {
    expect(formatVector(expectedAbsorptionTime(sym5, [0, 4]))).toBe('3,4,3')
  })

  it('G10: absorptionProbabilities(dice4,[2,3]) from Start', () => {
    const B10 = absorptionProbabilities(dice4, [2, 3])
    expect(formatRational(B10[0][0])).toBe('7/13')
    expect(formatRational(B10[0][1])).toBe('6/13')
  })

  it('G11: expectedAbsorptionTime(thh,[3])[0]', () => {
    expect(formatRational(expectedAbsorptionTime(thh, [3])[0])).toBe('8')
  })

  it('G12: expectedAbsorptionTime(sym100,[0,100])[16]', () => {
    expect(formatRational(expectedAbsorptionTime(sym100, [0, 100])[16])).toBe('1411')
  })

  it('G13: absorptionProbabilities(M13,[2,3]) B[1][1]', () => {
    const B13 = absorptionProbabilities(M13, [2, 3])
    expect(formatRational(B13[1][1])).toBe('1/2')
  })

  it('G14: absorptionProbabilities(M14,[0,3,4]) B[0][2]', () => {
    const B14 = absorptionProbabilities(M14, [0, 3, 4])
    expect(formatRational(B14[0][2])).toBe('2/9')
  })

  it('G15: period of ehr2 state 0 and weather state 0', () => {
    expect(classifyStates(ehr2)[0].period).toBe(2)
    expect(classifyStates(weather)[0].period).toBe(1)
  })

  it('G16: stationaryDistribution(weather)', () => {
    expect(formatVector(stationaryDistribution(weather))).toBe('3/7,4/7')
  })

  it('G17: stationaryDistribution(gfg)', () => {
    expect(formatVector(stationaryDistribution(gfg))).toBe('4/7,3/7')
    expect(formatRational(stationaryDistribution(gfg)[0])).toBe('4/7')
  })

  it('G18: stationaryDistribution(asym2)', () => {
    expect(formatVector(stationaryDistribution(asym2))).toBe('4/19,15/19')
  })

  it('G19: stationaryDistribution(cloudy)', () => {
    expect(formatVector(stationaryDistribution(cloudy))).toBe('1/5,2/5,2/5')
  })

  it('G20: kacReturnTime for cloudy and weather', () => {
    expect(formatRational(kacReturnTime(cloudy, 0))).toBe('5')
    expect(formatRational(kacReturnTime(weather, 0))).toBe('7/3')
  })

  it('G21: stationaryDistribution(oz)', () => {
    expect(formatVector(stationaryDistribution(oz))).toBe('2/5,1/5,2/5')
  })

  it('G22: detailedBalance(ehr2) reversible with pi=1/4,1/2,1/4', () => {
    const db22 = detailedBalance(ehr2)
    expect(db22.reversible).toBe(true)
    expect(formatVector(db22.pi)).toBe('1/4,1/2,1/4')
  })

  it('G23: detailedBalance(ehr3) reversible with pi=1/8,3/8,3/8,1/8', () => {
    const db23 = detailedBalance(ehr3)
    expect(db23.reversible).toBe(true)
    expect(formatVector(db23.pi)).toBe('1/8,3/8,3/8,1/8')
  })

  it('G24: detailedBalance(cyc3) not reversible, pi=1/3,1/3,1/3', () => {
    const db24 = detailedBalance(cyc3)
    expect(db24.reversible).toBe(false)
    expect(formatVector(db24.pi)).toBe('1/3,1/3,1/3')
  })

  it('G25: pagerank(cyc3) uniform for any damping', () => {
    expect(formatVector(pagerank(cyc3, r(85, 100)))).toBe('1/3,1/3,1/3')
    expect(formatVector(pagerank(cyc3, r(1, 2)))).toBe('1/3,1/3,1/3')
  })

  it('G26: pagerank(link4, d=1)', () => {
    expect(formatVector(pagerank(link4, r(1)))).toBe('4/13,5/13,1/13,3/13')
  })

  it('G27: pagerank(link3, d=1/2)', () => {
    // 15/39 reduces to 5/13; formatRational always reduces to lowest terms.
    expect(formatVector(pagerank(link3, r(1, 2)))).toBe('14/39,10/39,5/13')
  })
})

// ── Structural smoke tests ─────────────────────────────────────────────────

describe('Markov engine – structural smokes', () => {
  it('buildChain throws on non-stochastic row', () => {
    expect(() => buildChain([[r(1), r(1)], [r(0), r(1)]], ['a', 'b'])).toThrow()
  })

  it('buildChain accepts weather', () => {
    expect(() => buildChain(weather, ['Sunny', 'Rainy'])).not.toThrow()
  })

  it('simulateChain returns length steps+1 with valid states', () => {
    const path = simulateChain(weather, 0, 5)
    expect(path.length).toBe(6)
    expect(path.every(s => s === 0 || s === 1)).toBe(true)
  })

  it('classifyStates(gr): states 0 and 3 absorbing, 1 and 2 transient', () => {
    const cs = classifyStates(gr)
    expect(cs[0].kind).toBe('absorbing')
    expect(cs[3].kind).toBe('absorbing')
    expect(cs[1].kind).toBe('transient')
    expect(cs[2].kind).toBe('transient')
  })
})
