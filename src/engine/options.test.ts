import { describe, expect, it } from 'vitest'
import {
  type BigRational,
  reduce,
  toBig,
  fromBig,
  formatRational,
  ratToNumber,
  callPayoff,
  putPayoff,
  legPayoff,
  spreadPayoff,
  parityGap,
  paritySolve,
  parityArbLeg,
  callBounds,
  putBounds,
  riskNeutralQ,
  binomialPrice,
  replicate,
  treeTerminals,
  treeWeights,
  pathCount,
  hedgeRatio,
  minVarWeights,
  oneTouchPrice,
  greekSign,
  blackScholesCall,
  continuousGreek,
} from './options'

// Convenience: build a BigRational from plain integers.
const r = (n: number, d = 1): BigRational => reduce(BigInt(n), BigInt(d))

describe('options engine', () => {
  // ── Bridge ───────────────────────────────────────────────────────────────────

  describe('toBig / fromBig', () => {
    it('round-trips plain rationals', () => {
      expect(fromBig(toBig({ n: 3, d: 4 }))).toEqual({ n: 3, d: 4 })
      expect(fromBig(toBig({ n: -2, d: 6 }))).toEqual({ n: -1, d: 3 })
    })
  })

  describe('formatRational / ratToNumber', () => {
    it('formats integers and fractions', () => {
      expect(formatRational(r(3))).toBe('3')
      expect(formatRational(r(1, 2))).toBe('1/2')
      expect(formatRational(r(-1, 2))).toBe('-1/2')
    })
    it('ratToNumber is a display-only approximation', () => {
      expect(ratToNumber(r(1, 4))).toBeCloseTo(0.25)
    })
  })

  // ── L1 — Payoffs ─────────────────────────────────────────────────────────────

  describe('callPayoff / putPayoff', () => {
    it('callPayoff(130,100)=30; callPayoff(70,100)=0', () => {
      expect(formatRational(callPayoff(r(130), r(100)))).toBe('30')
      expect(formatRational(callPayoff(r(70), r(100)))).toBe('0')
    })
    it('putPayoff(70,100)=30; putPayoff(130,100)=0', () => {
      expect(formatRational(putPayoff(r(70), r(100)))).toBe('30')
      expect(formatRational(putPayoff(r(130), r(100)))).toBe('0')
    })
  })

  describe('legPayoff', () => {
    it('stock leg returns ST', () => {
      expect(formatRational(legPayoff({ kind: 'stock', qty: r(1) }, r(75)))).toBe('75')
    })
    it('bond leg returns K (face value)', () => {
      expect(formatRational(legPayoff({ kind: 'bond', K: r(100), qty: r(1) }, r(50)))).toBe('100')
    })
    it('bond leg without K defaults to 1', () => {
      expect(formatRational(legPayoff({ kind: 'bond', qty: r(1) }, r(50)))).toBe('1')
    })
  })

  describe('spreadPayoff', () => {
    it('protective put: stock + put(K=100)', () => {
      const legs = [
        { kind: 'stock' as const, qty: r(1) },
        { kind: 'put' as const, K: r(100), qty: r(1) },
      ]
      expect(formatRational(spreadPayoff(legs, r(130)))).toBe('130')
      expect(formatRational(spreadPayoff(legs, r(80)))).toBe('100')
    })

    it('straddle: call(K=100) + put(K=100)', () => {
      const legs = [
        { kind: 'call' as const, K: r(100), qty: r(1) },
        { kind: 'put' as const, K: r(100), qty: r(1) },
      ]
      expect(formatRational(spreadPayoff(legs, r(130)))).toBe('30')
      expect(formatRational(spreadPayoff(legs, r(70)))).toBe('30')
    })

    it('bull spread: call(K=100) − call(K=120)', () => {
      const legs = [
        { kind: 'call' as const, K: r(100), qty: r(1) },
        { kind: 'call' as const, K: r(120), qty: r(-1) },
      ]
      expect(formatRational(spreadPayoff(legs, r(130)))).toBe('20')
      expect(formatRational(spreadPayoff(legs, r(110)))).toBe('10')
      expect(formatRational(spreadPayoff(legs, r(90)))).toBe('0')
    })

    it('butterfly: call(K=90) − 2·call(K=100) + call(K=110)', () => {
      const legs = [
        { kind: 'call' as const, K: r(90), qty: r(1) },
        { kind: 'call' as const, K: r(100), qty: r(-2) },
        { kind: 'call' as const, K: r(110), qty: r(1) },
      ]
      expect(formatRational(spreadPayoff(legs, r(100)))).toBe('10')
      expect(formatRational(spreadPayoff(legs, r(90)))).toBe('0')
      expect(formatRational(spreadPayoff(legs, r(110)))).toBe('0')
    })

    it('strangle: put(K=90) + call(K=110)', () => {
      const legs = [
        { kind: 'put' as const, K: r(90), qty: r(1) },
        { kind: 'call' as const, K: r(110), qty: r(1) },
      ]
      expect(formatRational(spreadPayoff(legs, r(130)))).toBe('20')
      expect(formatRational(spreadPayoff(legs, r(100)))).toBe('0')
      expect(formatRational(spreadPayoff(legs, r(70)))).toBe('20')
    })
  })

  // ── L2 — Parity & bounds ──────────────────────────────────────────────────────

  describe('parityGap', () => {
    it('parityGap(8,2,100,95,1)=1', () => {
      expect(formatRational(parityGap(r(8), r(2), r(100), r(95), r(1)))).toBe('1')
    })
  })

  describe('paritySolve', () => {
    it('solves for missing C: P=3,S=50,K=44,D=10/11 → C=13', () => {
      expect(
        formatRational(paritySolve({ P: r(3), S: r(50), K: r(44), D: r(10, 11) })),
      ).toBe('13')
    })
    it('solves for missing P: C=10,S=100,K=100,D=1 → P=10', () => {
      expect(
        formatRational(paritySolve({ C: r(10), S: r(100), K: r(100), D: r(1) })),
      ).toBe('10')
    })
  })

  describe('parityArbLeg', () => {
    it('gap=1 → profitToday=1, trade.length>0', () => {
      const { trade, profitToday } = parityArbLeg(r(8), r(2), r(100), r(95), r(1))
      expect(formatRational(profitToday)).toBe('1')
      expect(trade.length).toBeGreaterThan(0)
    })
  })

  describe('callBounds / putBounds', () => {
    it('callBounds(100,90,1) → lo=10, hi=100', () => {
      const { lo, hi } = callBounds(r(100), r(90), r(1))
      expect(formatRational(lo)).toBe('10')
      expect(formatRational(hi)).toBe('100')
    })
    it('putBounds(90,100,1) → lo=10, hi=100', () => {
      const { lo, hi } = putBounds(r(90), r(100), r(1))
      expect(formatRational(lo)).toBe('10')
      expect(formatRational(hi)).toBe('100')
    })
  })

  // ── L4 — One-step binomial ────────────────────────────────────────────────────

  describe('canonical one-step (S=100, u=6/5, d=4/5, R=1, K=100)', () => {
    const S = r(100)
    const u = r(6, 5)
    const d = r(4, 5)
    const R = r(1)
    const K = r(100)

    it('riskNeutralQ=1/2', () => {
      expect(formatRational(riskNeutralQ(u, d, R))).toBe('1/2')
    })
    it('call price=10', () => {
      expect(formatRational(binomialPrice(S, u, d, R, K, 1, 'call'))).toBe('10')
    })
    it('call replicate: delta=1/2, bond=-40', () => {
      const { delta, bond } = replicate(S, u, d, R, K, 'call')
      expect(formatRational(delta)).toBe('1/2')
      expect(formatRational(bond)).toBe('-40')
    })
    it('put price=10', () => {
      expect(formatRational(binomialPrice(S, u, d, R, K, 1, 'put'))).toBe('10')
    })
    it('put replicate: delta=-1/2, bond=60', () => {
      const { delta, bond } = replicate(S, u, d, R, K, 'put')
      expect(formatRational(delta)).toBe('-1/2')
      expect(formatRational(bond)).toBe('60')
    })
  })

  describe('twin one-step (S=100, u=7/4, d=3/4, R=5/4, K=100)', () => {
    const S = r(100)
    const u = r(7, 4)
    const d = r(3, 4)
    const R = r(5, 4)
    const K = r(100)

    it('riskNeutralQ=1/2', () => {
      expect(formatRational(riskNeutralQ(u, d, R))).toBe('1/2')
    })
    it('call price=30', () => {
      expect(formatRational(binomialPrice(S, u, d, R, K, 1, 'call'))).toBe('30')
    })
    it('call replicate: delta=3/4, bond=-45', () => {
      const { delta, bond } = replicate(S, u, d, R, K, 'call')
      expect(formatRational(delta)).toBe('3/4')
      expect(formatRational(bond)).toBe('-45')
    })
  })

  describe('q-drill: riskNeutralQ(3/2, 1/2, 11/10)=3/5', () => {
    it('computes correctly', () => {
      expect(formatRational(riskNeutralQ(r(3, 2), r(1, 2), r(11, 10)))).toBe('3/5')
    })
  })

  // ── L5 — Multi-step tree ──────────────────────────────────────────────────────

  describe('two-step tree (S=100, u=6/5, d=4/5, R=1, K=100)', () => {
    const S = r(100)
    const u = r(6, 5)
    const d = r(4, 5)
    const R = r(1)
    const K = r(100)

    it('treeTerminals n=2: 144,96,64', () => {
      expect(treeTerminals(S, u, d, 2).map(formatRational).join(',')).toBe('144,96,64')
    })
    it('treeWeights(1/2,2): 1/4,1/2,1/4', () => {
      expect(treeWeights(r(1, 2), 2).map(formatRational).join(',')).toBe('1/4,1/2,1/4')
    })
    it('treeWeights sum=1', () => {
      const ws = treeWeights(r(1, 2), 2)
      const sum = ws.reduce<BigRational>((a, b) => {
        return reduce(a.n * b.d + b.n * a.d, a.d * b.d)
      }, r(0))
      expect(formatRational(sum)).toBe('1')
    })
    it('binomialPrice n=2 call=11', () => {
      expect(formatRational(binomialPrice(S, u, d, R, K, 2, 'call'))).toBe('11')
    })
    it('pathCount(2,1)===2n, pathCount(2,0)===1n, pathCount(2,2)===1n, pathCount(3,3)===1n', () => {
      expect(pathCount(2, 1)).toBe(2n)
      expect(pathCount(2, 0)).toBe(1n)
      expect(pathCount(2, 2)).toBe(1n)
      expect(pathCount(3, 3)).toBe(1n)
    })
    it('treeTerminals n=3 highest=864/5', () => {
      expect(formatRational(treeTerminals(S, u, d, 3)[0])).toBe('864/5')
    })
  })

  // ── L6 — Hedging / exotic / greek signs ──────────────────────────────────────

  describe('hedgeRatio', () => {
    it('hedgeRatio(6,9)=2/3', () => {
      expect(formatRational(hedgeRatio(r(6), r(9)))).toBe('2/3')
    })
    it('hedgeRatio(-6,9)=-2/3', () => {
      expect(formatRational(hedgeRatio(r(-6), r(9)))).toBe('-2/3')
    })
  })

  describe('minVarWeights(1/25, 9/100, 3/100)', () => {
    it('wA=6/7, wB=1/7, varMin=27/700', () => {
      const { wA, wB, varMin } = minVarWeights(r(1, 25), r(9, 100), r(3, 100))
      expect(formatRational(wA)).toBe('6/7')
      expect(formatRational(wB)).toBe('1/7')
      expect(formatRational(varMin)).toBe('27/700')
    })
  })

  describe('oneTouchPrice', () => {
    it('oneTouchPrice(5/4)=4/5', () => {
      expect(formatRational(oneTouchPrice(r(5, 4)))).toBe('4/5')
    })
    it('oneTouchPrice(2)=1/2', () => {
      expect(formatRational(oneTouchPrice(r(2)))).toBe('1/2')
    })
  })

  describe('greekSign', () => {
    it('delta: call=1, put=-1', () => {
      expect(greekSign('delta', 'call')).toBe(1)
      expect(greekSign('delta', 'put')).toBe(-1)
    })
    it('gamma: call=1, put=1', () => {
      expect(greekSign('gamma', 'call')).toBe(1)
      expect(greekSign('gamma', 'put')).toBe(1)
    })
    it('vega: call=1', () => {
      expect(greekSign('vega', 'call')).toBe(1)
    })
    it('theta: call=-1', () => {
      expect(greekSign('theta', 'call')).toBe(-1)
    })
    it('rho: call=1, put=-1', () => {
      expect(greekSign('rho', 'call')).toBe(1)
      expect(greekSign('rho', 'put')).toBe(-1)
    })
  })

  // ── DISPLAY-ONLY sanity ───────────────────────────────────────────────────────

  describe('blackScholesCall (display-only sanity)', () => {
    it('is finite and positive for S=K=100, r=0, σ=0.2, T=1', () => {
      const c = blackScholesCall(100, 100, 0, 0.2, 1)
      expect(Number.isFinite(c)).toBe(true)
      expect(c).toBeGreaterThan(0)
    })
  })

  describe('continuousGreek (display-only sanity)', () => {
    it('call delta is between 0 and 1', () => {
      const delta = continuousGreek('delta', 100, 100, 0, 0.2, 1, 'call')
      expect(delta).toBeGreaterThan(0)
      expect(delta).toBeLessThan(1)
    })
    it('gamma is positive', () => {
      expect(continuousGreek('gamma', 100, 100, 0, 0.2, 1, 'call')).toBeGreaterThan(0)
    })
  })
})
