// Unit tests for the deterministic correctness-anchor comparator. The hard
// override in gradeInterview() relies on these guarantees: equivalent scalar
// forms match, and ANYTHING ambiguous resolves to 'na' (never a false verdict).
import { describe, it, expect } from 'vitest'
import { parseCanonical, compareAnswers } from './answerCheck'

describe('parseCanonical', () => {
  it('parses integers, signs, and zero to reduced rationals', () => {
    expect(parseCanonical('10')).toEqual({ n: 10, d: 1 })
    expect(parseCanonical('-2')).toEqual({ n: -2, d: 1 })
    expect(parseCanonical('0')).toEqual({ n: 0, d: 1 })
    expect(parseCanonical('-0')).toEqual({ n: 0, d: 1 })
  })

  it('parses fractions and reduces to lowest terms with positive denominator', () => {
    expect(parseCanonical('1/2')).toEqual({ n: 1, d: 2 })
    expect(parseCanonical('2/4')).toEqual({ n: 1, d: 2 })
    expect(parseCanonical('-1/12')).toEqual({ n: -1, d: 12 })
    expect(parseCanonical('1/-2')).toEqual({ n: -1, d: 2 }) // sign normalized
    expect(parseCanonical('6/2')).toEqual({ n: 3, d: 1 })
  })

  it('parses terminating decimals as exact rationals', () => {
    expect(parseCanonical('0.5')).toEqual({ n: 1, d: 2 })
    expect(parseCanonical('0.50')).toEqual({ n: 1, d: 2 })
    expect(parseCanonical('-0.25')).toEqual({ n: -1, d: 4 })
  })

  it('parses trailing-percent forms', () => {
    expect(parseCanonical('50%')).toEqual({ n: 1, d: 2 })
    expect(parseCanonical('100%')).toEqual({ n: 1, d: 1 })
    expect(parseCanonical('12.5%')).toEqual({ n: 1, d: 8 })
  })

  it('handles whitespace', () => {
    expect(parseCanonical('  1/2  ')).toEqual({ n: 1, d: 2 })
  })

  it('returns null for non-scalar / ambiguous answers', () => {
    expect(parseCanonical('')).toBeNull()
    expect(parseCanonical('1/0')).toBeNull() // zero denominator
    expect(parseCanonical('1/3,1/3,1/3')).toBeNull() // vector
    expect(parseCanonical('0,0;1,1')).toBeNull() // matrix / strategy profile
    expect(parseCanonical('(a) 11/30; (b) 19/30')).toBeNull() // multi-part prose
    expect(parseCanonical('1/e ≈ 0.368')).toBeNull() // approximation
    expect(parseCanonical('about 0.37')).toBeNull()
    expect(parseCanonical('√2/5')).toBeNull()
  })
})

describe('compareAnswers', () => {
  it('matches across equivalent scalar forms', () => {
    expect(compareAnswers('1/2', '0.5')).toBe('match')
    expect(compareAnswers('1/2', '50%')).toBe('match')
    expect(compareAnswers('1/2', '2/4')).toBe('match')
    expect(compareAnswers('3', '6/2')).toBe('match')
    expect(compareAnswers('-1/12', '-1/12')).toBe('match')
  })

  it('flags a concrete wrong scalar as mismatch', () => {
    expect(compareAnswers('1/2', '1/3')).toBe('mismatch')
    expect(compareAnswers('1/2', '0.4')).toBe('mismatch')
    expect(compareAnswers('10', '11')).toBe('mismatch')
  })

  it('is na when either side is missing or non-scalar', () => {
    expect(compareAnswers('1/2', null)).toBe('na')
    expect(compareAnswers('1/2', undefined)).toBe('na')
    expect(compareAnswers('1/2', 'about a half')).toBe('na')
    expect(compareAnswers('(a) 11/30; (b) 19/30', '11/30')).toBe('na') // prose ground truth
    expect(compareAnswers('1/3,1/3,1/3', '1/3,1/3,1/3')).toBe('na') // vector
  })
})
