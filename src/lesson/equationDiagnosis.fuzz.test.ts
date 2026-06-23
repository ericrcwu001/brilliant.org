// Pass C (robustness / O2) — property/fuzz coverage for the LIVE equation grader
// used by EquationTilesBeat. The grader must never throw on arbitrary tile
// arrays and must uphold its core invariants, so malformed or adversarial
// placements can never crash the beat or mislabel a slot.

import { describe, it, expect } from 'vitest'
import {
  diagnoseRow,
  hintForMistake,
  type Recurrence,
  type MistakeId,
} from './equationDiagnosis'

// The flagship HH E1 target: E1 = 1 + 1/2 E2 + 1/2 E0.
const HH_E1: Recurrence = {
  constant: 1,
  terms: [
    { coeff: { n: 1, d: 2 }, var: 'E2' },
    { coeff: { n: 1, d: 2 }, var: 'E0' },
  ],
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const KINDS = ['const', 'prob', 'var', 'op']
const VALUES: Record<string, string[]> = {
  const: ['0', '1', '2', '-1', '1/2', 'x', ''],
  prob: ['1/2', '2/4', 'p', '1-p', '0.5', '1'],
  var: ['E0', 'E1', 'E2', 'E3', 'Ex', ''],
  op: ['+', '-', '='],
}

function randomToken(rand: () => number): string | null {
  const r = rand()
  if (r < 0.12) return null
  if (r < 0.18) return ''
  if (r < 0.24) return 'garbage-no-colon'
  const kind = KINDS[Math.floor(rand() * KINDS.length)]
  const vals = VALUES[kind]
  return `${kind}:${vals[Math.floor(rand() * vals.length)]}`
}

describe('diagnoseRow fuzz (live equation grader)', () => {
  it('never throws and upholds invariants on 8000 random slot arrays', () => {
    const rand = mulberry32(0xc0ffee)
    for (let i = 0; i < 8000; i++) {
      const len = Math.floor(rand() * 8) // 0..7 slots (incl. over/under-fill)
      const slots: (string | null)[] = []
      for (let j = 0; j < len; j++) slots.push(randomToken(rand))

      let d!: ReturnType<typeof diagnoseRow>
      expect(() => {
        d = diagnoseRow(slots, HH_E1)
      }).not.toThrow()

      expect(d.slotStatus).toHaveLength(d.fillableCount)
      expect(d.fillableCount).toBe(1 + 2 * HH_E1.terms.length)
      expect(d.correctCount).toBeGreaterThanOrEqual(0)
      expect(d.correctCount).toBeLessThanOrEqual(d.fillableCount)
      expect(d.ok).toBe(d.complete && d.slotStatus.every((s) => s === 'correct'))

      const firstWrong = d.slotStatus.indexOf('wrong')
      expect(d.glowIndex).toBe(firstWrong === -1 ? null : firstWrong)

      // A mistake is only surfaced for a complete-but-wrong row, and any surfaced
      // mistake must have authored level-1 and level-2 hint copy.
      if (d.mistake !== null) {
        expect(d.complete && !d.ok).toBe(true)
        expect(hintForMistake(d.mistake as MistakeId, 1)).toBeTruthy()
        expect(hintForMistake(d.mistake as MistakeId, 2)).toBeTruthy()
      }
    }
  })

  it('accepts the canonical fill and its additive reorder', () => {
    const canonical = ['const:1', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E0']
    expect(diagnoseRow(canonical, HH_E1).ok).toBe(true)
    const reordered = ['const:1', 'prob:1/2', 'var:E0', 'prob:1/2', 'var:E2']
    expect(diagnoseRow(reordered, HH_E1).ok).toBe(true)
  })

  it('flags a conceptual near-miss mistake without crashing', () => {
    // Tail keeps a head (E2, E1) instead of resetting (E2, E0).
    const tailLoop = ['const:1', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E1']
    const d = diagnoseRow(tailLoop, HH_E1)
    expect(d.ok).toBe(false)
    expect(d.mistake).not.toBeNull()
  })
})
