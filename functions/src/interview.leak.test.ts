// Structural enforcement of the LEAK RULE (README §Leak mitigation).
// buildLiveInstructions is the single injection point for live-session
// instructions. It MUST NOT reference hidden.answer, hidden.approaches,
// hidden.wrongTurns, or engineCheck.answer — those are consumed only by the
// grader (buildGraderPrompt) server-side, never sent to the realtime session.
import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, it, expect } from 'vitest'

describe('buildLiveInstructions leak guard', () => {
  // Extract just the buildLiveInstructions function body (up to the next
  // top-level // ── comment block, which is // ── mintInterviewToken).
  it('does not reference hidden.answer, hidden.approaches, hidden.wrongTurns, or engineCheck.answer', () => {
    const src = readFileSync(join(__dirname, 'interview.ts'), 'utf8')

    const match = src.match(/function buildLiveInstructions[\s\S]*?(?=\n\/\/ ── )/)
    expect(match, 'buildLiveInstructions function not found in interview.ts').toBeTruthy()
    const fnBody = match![0]

    expect(
      fnBody,
      'buildLiveInstructions must not reference hidden.answer',
    ).not.toContain('hidden.answer')

    expect(
      fnBody,
      'buildLiveInstructions must not reference hidden.approaches',
    ).not.toContain('hidden.approaches')

    expect(
      fnBody,
      'buildLiveInstructions must not reference hidden.wrongTurns',
    ).not.toContain('hidden.wrongTurns')

    expect(
      fnBody,
      'buildLiveInstructions must not reference engineCheck.answer',
    ).not.toContain('engineCheck.answer')
  })

  it('does reference the allowed fields: hidden.rubric and hidden.hintLadder', () => {
    const src = readFileSync(join(__dirname, 'interview.ts'), 'utf8')
    const match = src.match(/function buildLiveInstructions[\s\S]*?(?=\n\/\/ ── )/)
    expect(match).toBeTruthy()
    const fnBody = match![0]

    // These are the only hidden fields permitted in live instructions.
    expect(fnBody).toContain('hidden.rubric')
    expect(fnBody).toContain('hidden.hintLadder')
  })
})
