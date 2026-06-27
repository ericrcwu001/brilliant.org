// Stage-2 fact-check: every graded number in lesson-optimal-stopping-3.json is
// reproduced by src/engine/optimalStopping.ts. Fails fast if a fixture author
// transcribes a wrong number.

import { describe, it, expect } from 'vitest'
import { optimalCutoff, formatRational } from '../engine/optimalStopping'
import fixture from '../../fixtures/lesson-optimal-stopping-3.json'
import type { Lesson } from './schema'

const lesson = fixture as unknown as Lesson

function beatById(id: string) {
  const b = lesson.beats.find((beat) => beat.beatId === id)
  if (!b) throw new Error(`beat "${id}" not found in fixture`)
  return b
}

describe('lesson-optimal-stopping-3 fact-check', () => {
  it('l3-recall pairs are the optimal win probabilities for n=3,4,5', () => {
    const beat = beatById('l3-recall')
    if (beat.interaction.type !== 'retrievalGrid') throw new Error('wrong type')
    const map = Object.fromEntries(beat.interaction.pairs.map((p) => [p.left, p.right]))
    expect(map['Best chance, 3 candidates']).toBe(formatRational(optimalCutoff(3).p))
    expect(map['Best chance, 4 candidates']).toBe(formatRational(optimalCutoff(4).p))
    expect(map['Best chance, 5 candidates']).toBe(formatRational(optimalCutoff(5).p))
  })

  it('l3-bet correct option = "about 37%" and Math.round(100/Math.E) === 37', () => {
    const beat = beatById('l3-bet')
    if (beat.interaction.type !== 'prediction') throw new Error('wrong type')
    if (!('byOption' in beat.feedback)) throw new Error('expected byOption feedback')
    const correct = Object.entries(beat.feedback.byOption).find(([, v]) => v.correct)?.[0]
    expect(correct).toBe('about 37%')
    expect(Math.round(100 / Math.E)).toBe(37)
  })

  it('l3-watch headline = String(optimalCutoff(50).r) = "19"', () => {
    const beat = beatById('l3-watch')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(String(optimalCutoff(50).r))
    expect(beat.interaction.headline).toBe('19')
  })

  it('l3-explore headline = formatRational(optimalCutoff(10).p) = "3349/8400"', () => {
    const beat = beatById('l3-explore')
    if (beat.interaction.type !== 'stoppingBoard') throw new Error('wrong type')
    expect(beat.interaction.headline).toBe(formatRational(optimalCutoff(10).p))
    expect(beat.interaction.headline).toBe('3349/8400')
  })

  it('l3-cutoff10 r accept = optimalCutoff(10).r = "4"; pctn accept = "40"', () => {
    const beat = beatById('l3-cutoff10')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.r).toContain(String(optimalCutoff(10).r))
    expect(fields.pctn).toContain('40')
  })

  it('l3-model tripletReveal value is "1/e"', () => {
    const beat = beatById('l3-model')
    if (beat.interaction.type !== 'tripletReveal') throw new Error('wrong type')
    expect(beat.interaction.value).toBe('1/e')
  })

  it('l3-bignote pct accept includes "37" and optimalCutoff(100).r === 38', () => {
    const beat = beatById('l3-bignote')
    if (beat.interaction.type !== 'answerEntry') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.pct).toContain('37')
    expect(optimalCutoff(100).r).toBe(38)
  })

  it('l3-prove skip and win accept include "37" and optimalCutoff(100).r - 1 === 37', () => {
    const beat = beatById('l3-prove')
    if (beat.interaction.type !== 'masteryChallenge') throw new Error('wrong type')
    const fields = Object.fromEntries(beat.interaction.fields.map((f) => [f.id, f.accept]))
    expect(fields.skip).toContain('37')
    expect(fields.win).toContain('37')
    expect(optimalCutoff(100).r - 1).toBe(37)
  })

  it('engine goldens: formatRational(optimalCutoff(10).p) = "3349/8400", optimalCutoff(100).r = 38', () => {
    expect(formatRational(optimalCutoff(10).p)).toBe('3349/8400')
    expect(optimalCutoff(100).r).toBe(38)
  })
})
