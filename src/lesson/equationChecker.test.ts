import { describe, expect, it } from 'vitest'
import { buildAutomaton } from '../engine/automaton'
import { checkRow, checkRows } from './equationChecker'

const HH = buildAutomaton('HH', 0.5)
const HT = buildAutomaton('HT', 0.5)

// Convenience: the static "+" separators are part of the token sequence.
const seq = (...tokens: (string | null)[]) => tokens

describe('checkRow', () => {
  it('accepts the correct HH E0 sequence', () => {
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'prob:1/2', 'var:E0')
    expect(checkRow(tokens, HH.recurrences.E0)).toEqual({ ok: true })
  })

  it('accepts the correct HH E1 sequence', () => {
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E2', 'op:+', 'prob:1/2', 'var:E0')
    expect(checkRow(tokens, HH.recurrences.E1)).toEqual({ ok: true })
  })

  it('accepts the HT E1 self-loop (1 + 1/2 E1 + 1/2 E2)', () => {
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'prob:1/2', 'var:E2')
    expect(checkRow(tokens, HT.recurrences.E1)).toEqual({ ok: true })
  })

  it('accepts an additive reorder (1 + 1/2 E0 + 1/2 E1 for HH E0)', () => {
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E0', 'op:+', 'prob:1/2', 'var:E1')
    expect(checkRow(tokens, HH.recurrences.E0)).toEqual({ ok: true })
  })

  it('rejects a wrong coefficient with reason wrong-coeff', () => {
    // E0 with a bare E0 (implicit coeff 1) instead of 1/2 E0 — vars match, coeff differs.
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'var:E0')
    expect(checkRow(tokens, HH.recurrences.E0)).toEqual({ ok: false, reason: 'wrong-coeff' })
  })

  it('rejects a wrong state var with reason wrong-var', () => {
    // HH E1 target is 1 + 1/2 E2 + 1/2 E0; here the tail points at E1 instead of E0.
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E2', 'op:+', 'prob:1/2', 'var:E1')
    expect(checkRow(tokens, HH.recurrences.E1)).toEqual({ ok: false, reason: 'wrong-var' })
  })

  it('rejects a wrong constant with reason wrong-constant', () => {
    const tokens = seq('const:0', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'prob:1/2', 'var:E0')
    expect(checkRow(tokens, HH.recurrences.E0)).toEqual({ ok: false, reason: 'wrong-constant' })
  })

  it('does not grade an empty/partial row as correct (incomplete)', () => {
    const tokens = seq('const:1', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'prob:1/2', null)
    expect(checkRow(tokens, HH.recurrences.E0)).toEqual({ ok: false, reason: 'incomplete' })
  })
})

describe('checkRows', () => {
  it('passes when all graded rows are correct and skips non-graded rows', () => {
    const rows = [
      { lhs: 'E0' as const, target: HH.recurrences.E0, graded: true },
      { lhs: 'E1' as const, target: HH.recurrences.E1, graded: true },
      { lhs: 'E2' as const, target: HH.recurrences.E2, graded: false },
    ]
    const result = checkRows(rows, {
      E0: ['const:1', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'prob:1/2', 'var:E0'],
      E1: ['const:1', 'op:+', 'prob:1/2', 'var:E2', 'op:+', 'prob:1/2', 'var:E0'],
    })
    expect(result.ok).toBe(true)
    expect(result.results.E2).toBeUndefined()
  })

  it('fails the batch when any graded row is wrong', () => {
    const rows = [
      { lhs: 'E0' as const, target: HH.recurrences.E0, graded: true },
      { lhs: 'E1' as const, target: HH.recurrences.E1, graded: true },
    ]
    const result = checkRows(rows, {
      E0: ['const:1', 'op:+', 'prob:1/2', 'var:E1', 'op:+', 'prob:1/2', 'var:E0'],
      E1: ['const:1', 'op:+', 'prob:1/2', 'var:E2', 'op:+', 'prob:1/2', 'var:E1'],
    })
    expect(result.ok).toBe(false)
    expect(result.results.E0).toEqual({ ok: true })
    expect(result.results.E1).toEqual({ ok: false, reason: 'wrong-var' })
  })
})
