import { describe, expect, it } from 'vitest'
import { buildAutomaton } from '../engine/automaton'
import {
  aggregateProgress,
  a11ySummary,
  diagnoseRow,
  hintForMistake,
  progressLine,
  type MistakeId,
} from './equationDiagnosis'

// HH E1 build row: E1 = 1 + 1/2 E2 + 1/2 E0. Slots: [const][prob][var][prob][var].
const E1 = buildAutomaton('HH', 0.5).recurrences.E1
const slots = (...s: (string | null)[]) => s

describe('diagnoseRow — correct answers', () => {
  it('grades the canonical order as fully correct', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E0'), E1)
    expect(d.ok).toBe(true)
    expect(d.slotStatus).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
    expect(d.correctCount).toBe(5)
    expect(d.mistake).toBeNull()
    expect(d.glowIndex).toBeNull()
  })

  it('accepts an additive reorder as fully correct (no swap error)', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E0', 'prob:1/2', 'var:E2'), E1)
    expect(d.ok).toBe(true)
    expect(d.correctCount).toBe(5)
    expect(d.mistake).toBeNull()
  })
})

describe('diagnoseRow — conceptual state mistakes (structurally valid)', () => {
  it('flags the signature near-miss self-loop {E1,E2} and greens the rest', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E1'), E1)
    expect(d.ok).toBe(false)
    expect(d.structurallyValid).toBe(true)
    expect(d.mistake).toBe<MistakeId>('tail-self-loop')
    // const + both weights + the E2 branch are locked green; only the E1 slot is wrong.
    expect(d.correctCount).toBe(4)
    expect(d.slotStatus[2]).toBe('correct')
    expect(d.slotStatus[4]).toBe('wrong')
    expect(d.glowIndex).toBe(4)
  })

  it('credits the correct reset branch under reorder for head-no-advance {E0,E1}', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E0', 'prob:1/2', 'var:E1'), E1)
    expect(d.mistake).toBe<MistakeId>('head-no-advance')
    expect(d.correctCount).toBe(4)
    // The E0 the learner placed matches a target term, so it stays green.
    expect(d.slotStatus[2]).toBe('correct')
    expect(d.slotStatus[4]).toBe('wrong')
  })

  it('flags both-reset {E0,E0}', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E0', 'prob:1/2', 'var:E0'), E1)
    expect(d.mistake).toBe<MistakeId>('both-reset')
  })

  it('flags both-goal {E2,E2}', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E2'), E1)
    expect(d.mistake).toBe<MistakeId>('both-goal')
  })

  it('flags both-self-loop {E1,E1} (neither state matches)', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E1', 'prob:1/2', 'var:E1'), E1)
    expect(d.mistake).toBe<MistakeId>('both-self-loop')
    expect(d.correctCount).toBe(3) // const + both weights
  })
})

describe('diagnoseRow — constant mistakes', () => {
  it('flags a zero constant while keeping the branches green', () => {
    const d = diagnoseRow(slots('const:0', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E0'), E1)
    expect(d.mistake).toBe<MistakeId>('const-zero')
    expect(d.structurallyValid).toBe(true)
    expect(d.slotStatus[0]).toBe('wrong')
    expect(d.correctCount).toBe(4)
    expect(d.glowIndex).toBe(0)
  })
})

describe('diagnoseRow — structural / type mismatches', () => {
  it('flags a probability in the lead slot', () => {
    const d = diagnoseRow(slots('prob:1/2', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E0'), E1)
    expect(d.structurallyValid).toBe(false)
    expect(d.mistake).toBe<MistakeId>('lead-prob')
    expect(d.slotStatus[0]).toBe('wrong')
  })

  it('flags a state in the lead slot', () => {
    const d = diagnoseRow(slots('var:E0', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E0'), E1)
    expect(d.mistake).toBe<MistakeId>('lead-state')
  })

  it('flags a non-probability in a weight slot', () => {
    const d = diagnoseRow(slots('const:1', 'const:0', 'var:E2', 'prob:1/2', 'var:E0'), E1)
    expect(d.structurallyValid).toBe(false)
    expect(d.mistake).toBe<MistakeId>('weight-not-prob')
  })

  it('flags a non-state in a destination slot', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'const:0', 'prob:1/2', 'var:E0'), E1)
    expect(d.structurallyValid).toBe(false)
    expect(d.mistake).toBe<MistakeId>('state-slot-not-state')
  })
})

describe('diagnoseRow — completeness', () => {
  it('treats a partially-filled row as incomplete with no mistake yet', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E2', 'prob:1/2', null), E1)
    expect(d.complete).toBe(false)
    expect(d.ok).toBe(false)
    expect(d.mistake).toBeNull()
  })
})

describe('hint copy', () => {
  const ids: MistakeId[] = [
    'lead-prob',
    'lead-state',
    'weight-not-prob',
    'state-slot-not-state',
    'tail-self-loop',
    'both-self-loop',
    'both-goal',
    'head-no-advance',
    'both-reset',
    'wrong-var-generic',
    'const-zero',
    'const-generic',
  ]

  it('provides distinct level-1 and level-2 copy for every mistake', () => {
    for (const id of ids) {
      const l1 = hintForMistake(id, 1)
      const l2 = hintForMistake(id, 2)
      expect(l1.length).toBeGreaterThan(0)
      expect(l2.length).toBeGreaterThan(0)
      expect(l1).not.toEqual(l2)
    }
  })

  it('never reveals the literal answer tiles in the hint copy', () => {
    for (const id of ids) {
      for (const level of [1, 2] as const) {
        const text = hintForMistake(id, level)
        // No literal weighted-term tokens like "1/2 E2" / "1/2 E0".
        expect(text).not.toMatch(/1\/2\s*E\d/)
        expect(text).not.toContain('E\u2082')
        expect(text).not.toContain('E\u2080')
      }
    }
  })
})

describe('progress messaging', () => {
  it('summarizes a partial, structurally-valid attempt', () => {
    const d = diagnoseRow(slots('const:1', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E1'), E1)
    const p = aggregateProgress([d])
    expect(p.correct).toBe(4)
    expect(p.fillable).toBe(5)
    expect(progressLine(p)).toContain('4 of 5')
    expect(a11ySummary(p)).toContain('4 of 5')
  })

  it('calls out a structurally invalid row distinctly', () => {
    const d = diagnoseRow(slots('prob:1/2', 'prob:1/2', 'var:E2', 'prob:1/2', 'var:E0'), E1)
    const p = aggregateProgress([d])
    expect(p.structurallyValid).toBe(false)
    expect(progressLine(p)).toMatch(/not a valid equation/i)
  })
})
