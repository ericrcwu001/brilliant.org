// Stage-2 fact-check: every graded number in lesson-markov-chains-9.json is
// reproduced by src/engine/markov.ts. Fails fast with a clear message if a
// fixture author transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { pagerank, formatVector } from '../engine/markov'
import type { Rational } from '../engine/types'
import fixture from '../../fixtures/lesson-markov-chains-9.json'
import type { Lesson } from './schema'

// Cast through unknown so we don't need exact TS inference of the JSON literal.
const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

function r(n: number, d = 1): Rational {
  return { n, d }
}

// ── 4-node link graph M (row-stochastic surfer matrix) ──────────────────────
// Links: 1→2; 2→{1,4}; 3→{1,4}; 4→{1,2,3}
const link4: Rational[][] = [
  [r(0, 1), r(1, 1), r(0, 1), r(0, 1)],
  [r(1, 2), r(0, 1), r(0, 1), r(1, 2)],
  [r(1, 2), r(0, 1), r(0, 1), r(1, 2)],
  [r(1, 3), r(1, 3), r(1, 3), r(0, 1)],
]

// ── Symmetric 3-cycle A→B→C→A ───────────────────────────────────────────────
const cyc3: Rational[][] = [
  [r(0, 1), r(1, 1), r(0, 1)],
  [r(0, 1), r(0, 1), r(1, 1)],
  [r(1, 1), r(0, 1), r(0, 1)],
]

// ── Dangling-node rank sink 1→2→3→∅ ─────────────────────────────────────────
// Row 2 (page 3) is all zeros — legal only because damping is present (wave0 R-3).
const sink: Rational[][] = [
  [r(0, 1), r(1, 1), r(0, 1)],
  [r(0, 1), r(0, 1), r(1, 1)],
  [r(0, 1), r(0, 1), r(0, 1)],
]

describe('lesson-markov-chains-9 fact-check', () => {
  // ── weight-by-source headline "2" ──────────────────────────────────────────
  it('weight-by-source headline "2": argmax(pagerank(link4,{1,1})) is index 1, labels[1]="2"', () => {
    const pr = pagerank(link4, r(1, 1))
    let best = 0
    for (let i = 1; i < pr.length; i++) {
      if (pr[i].n * pr[best].d > pr[best].n * pr[i].d) best = i
    }
    const labels = ['1', '2', '3', '4']
    expect(labels[best]).toBe('2')
    // fixture cross-check
    const beat = beatById('weight-by-source')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe('2')
  })

  // ── explore-damping headline "1/3,1/3,1/3" ─────────────────────────────────
  it('explore-damping: formatVector(pagerank(cyc3,{85,100})) === "1/3,1/3,1/3"', () => {
    expect(formatVector(pagerank(cyc3, r(85, 100)))).toBe('1/3,1/3,1/3')
  })

  // ── confirm-symmetry: same π at d=1/2 ──────────────────────────────────────
  it('confirm-symmetry: formatVector(pagerank(cyc3,{1,2})) === "1/3,1/3,1/3"', () => {
    expect(formatVector(pagerank(cyc3, r(1, 2)))).toBe('1/3,1/3,1/3')
  })

  // ── mastery-fourNode scores "4/13,5/13,1/13,3/13" ─────────────────────────
  it('mastery-fourNode: formatVector(pagerank(link4,{1,1})) === "4/13,5/13,1/13,3/13"', () => {
    expect(formatVector(pagerank(link4, r(1, 1)))).toBe('4/13,5/13,1/13,3/13')
    // fixture cross-check
    const beat = beatById('mastery-fourNode')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    expect(beat.interaction.fields[0].accept[0]).toBe('4/13,5/13,1/13,3/13')
  })

  // ── damping-saves-sink "unique": well-defined π exists ────────────────────
  it('damping-saves-sink "unique": pagerank(sink,{85,100}) returns 3 components summing to 1', () => {
    const ps = pagerank(sink, r(85, 100))
    expect(ps.length).toBe(3)
    // Σ ps[i] = 1 via cross-multiply: a/b + c/d + e/f = 1
    // ↔  a·d·f + c·b·f + e·b·d = b·d·f
    const [a, b, c] = ps
    const lhs = a.n * b.d * c.d + b.n * a.d * c.d + c.n * a.d * b.d
    const rhs = a.d * b.d * c.d
    expect(lhs).toBe(rhs)
  })

  // ── Structural checks ──────────────────────────────────────────────────────
  it('explore-damping carries hero block with slowFirst:true', () => {
    const beat = beatById('explore-damping')
    expect(beat.hero).toBeDefined()
    expect(beat.hero?.slowFirst).toBe(true)
  })

  it('damping-saves-sink has dangling row kept (all zeros) and damping present', () => {
    const beat = beatById('damping-saves-sink')
    if (beat.interaction.type !== 'chainBoard') throw new Error('wrong type')
    const row2 = beat.interaction.matrix[2].cells
    const isAllZero = row2.every((c) => c.n === 0)
    expect(isAllZero).toBe(true)
    expect(beat.interaction.damping).toBeDefined()
  })

  it('mastery-fourNode has no pattern (avoids buildAutomaton cross-check)', () => {
    const beat = beatById('mastery-fourNode')
    expect((beat as { pattern?: unknown }).pattern).toBeUndefined()
  })

  it('mastery-fourNode carries interviewNote', () => {
    const beat = beatById('mastery-fourNode')
    expect(beat.interviewNote).toBeDefined()
  })

  it('lesson has exactly 11 beats in spec order', () => {
    const ids = lesson.beats.map((b) => b.beatId)
    expect(ids).toEqual([
      'recall-no-champion',
      'open-bet',
      'name-the-surfer',
      'weight-by-source',
      'explore-damping',
      'confirm-symmetry',
      'triplet-pagerank',
      'damping-saves-sink',
      'transfer-heldout',
      'mastery-fourNode',
      'recap',
    ])
  })

  it('penultimate beat is mastery-fourNode (required), last beat is recap', () => {
    const beats = lesson.beats
    expect(beats[beats.length - 2].beatId).toBe('mastery-fourNode')
    expect(beats[beats.length - 2].required).toBe(true)
    expect(beats[beats.length - 1].beatId).toBe('recap')
  })
})
