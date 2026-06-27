import { describe, it, expect } from 'vitest'
import { METHODS, MethodIdSchema, CONFUSABLE, type MethodId } from './methods'

describe('method registry (Foundation B, spec-00)', () => {
  it('MethodIdSchema accepts a registry id and rejects an unknown string', () => {
    expect(MethodIdSchema.safeParse('first-step-analysis').success).toBe(true)
    expect(MethodIdSchema.safeParse('not-a-method').success).toBe(false)
  })

  it('CONFUSABLE keys and values are all valid MethodIds with no self-pairing or dupes', () => {
    const ids = new Set(Object.keys(METHODS))
    for (const [k, vs] of Object.entries(CONFUSABLE)) {
      expect(ids.has(k)).toBe(true)
      expect(new Set(vs).size).toBe(vs.length) // no duplicates
      for (const v of vs) {
        expect(ids.has(v)).toBe(true)
        expect(v).not.toBe(k) // no self-pairing
      }
    }
  })

  it('CONFUSABLE is a symmetric relation (A lists B ⟺ B lists A)', () => {
    for (const [k, vs] of Object.entries(CONFUSABLE) as [MethodId, MethodId[]][]) {
      for (const v of vs) {
        expect(CONFUSABLE[v], `${v} should list ${k} back`).toBeDefined()
        expect(CONFUSABLE[v].includes(k), `${v} ↔ ${k} symmetry`).toBe(true)
      }
    }
  })

  it('every MethodId has a CONFUSABLE entry (an empty foil list is a conscious choice)', () => {
    for (const id of Object.keys(METHODS)) {
      expect(CONFUSABLE[id as MethodId], `${id} missing CONFUSABLE entry`).toBeDefined()
    }
  })
})
