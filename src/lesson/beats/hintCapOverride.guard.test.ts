// R6 permanent guard (spec-21 §3.5 / Step 7). Every graded-beat view that drives a
// hint ladder MUST pass `props.hintCapOverride ?? beat.maxHintLevel` to
// useHintLadder, so a tightened/authored cap can never strand a learner: the
// runtime cap-lift to the level-3 reveal stays reachable. This static source scan
// fails CI if a future capped graded beat forgets the override (e.g. the OverlapBeat
// gap closed in this spec). It deliberately reads the source TEXT — no React/Firebase
// — so it runs in the pure node Vitest env.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'

const dir = new URL('.', import.meta.url).pathname

describe('R6: every graded beat honors hintCapOverride (no dead-end)', () => {
  const beatFiles = readdirSync(dir).filter((f) => f.endsWith('Beat.tsx'))
  // Guard the guard: if this ever finds zero ladder beats the scan is silently
  // vacuous (a refactor renamed useHintLadder or the dir resolution broke).
  let ladderCount = 0
  for (const f of beatFiles) {
    const src = readFileSync(join(dir, f), 'utf8')
    if (!src.includes('useHintLadder(')) continue
    ladderCount++
    it(`${f} passes props.hintCapOverride ?? beat.maxHintLevel`, () => {
      expect(src).toContain('props.hintCapOverride ?? beat.maxHintLevel')
    })
  }
  it('scanned at least one useHintLadder beat (guard is not vacuous)', () => {
    expect(ladderCount).toBeGreaterThan(0)
  })
})
