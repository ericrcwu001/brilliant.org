// Tests for extractGradeJson.
// We mock firebase-admin/firestore, firebase-functions/v2/https, and
// firebase-functions/params so that importing interview.ts under vitest does
// not trigger firebase-admin initialisation (same strategy used by the leak
// test: avoid touching firebase runtime code, only test the pure helper).
import { vi, describe, it, expect } from 'vitest'

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  FieldValue: { serverTimestamp: vi.fn() },
}))
vi.mock('firebase-functions/v2/https', () => ({
  onCall: vi.fn(() => undefined),
  HttpsError: class HttpsError extends Error {},
}))
vi.mock('firebase-functions/params', () => ({
  defineSecret: vi.fn(() => ({ value: vi.fn(() => '') })),
}))
vi.mock('./interviewDraw', () => ({ drawQuestion: vi.fn() }))
vi.mock('./streaks', () => ({
  localDateInTimezone: vi.fn(),
  isValidTimezone: vi.fn(),
}))
vi.mock('./interviewPack', () => ({
  InterviewPackSchema: { parse: vi.fn() },
  toClientQuestion: vi.fn(),
}))

import {
  extractGradeJson,
  buildGraderPrompt,
  resolveTierFloor,
  applyCorrectnessAnchor,
  INTERVIEW_REPORT_SCHEMA,
} from './interview'
import type { Question, InterviewReport } from './interviewPack'

// Minimal stub question per tier — only the fields buildGraderPrompt reads.
function stubQuestion(tier: 'hard' | 'harder' | 'brutal'): Question {
  return {
    id: `q-${tier}`,
    tier,
    fingerprint: 'fp',
    prompt: 'Stub prompt',
    source: 'stub',
    engineCheck: { module: 'm', calls: [], answer: '42', verified: true },
    hidden: {
      answer: '42',
      approaches: ['approach a'],
      wrongTurns: ['wrong w'],
      hintLadder: ['h1', 'h2', 'h3'],
      rubric: {
        correctness: 'c',
        approach: 'a',
        rigor: 'r',
        communication: 'm',
        speed: 's',
      },
    },
    followUps: [],
  } as Question
}

describe('buildGraderPrompt — tier-aware rubric scaling (spec-22)', () => {
  it.each(['hard', 'harder', 'brutal'] as const)(
    'states the tier and its calibration band for %s',
    (tier) => {
      const prompt = buildGraderPrompt(stubQuestion(tier), [])
      expect(prompt).toContain(`This question is tier: ${tier}`)
      // The matching calibration band is keyed off a tier-specific phrase.
      const bandMarker =
        tier === 'hard'
          ? 'Standard interview difficulty'
          : tier === 'harder'
            ? 'Above standard'
            : 'Top-tier / brain-teaser difficulty'
      expect(prompt).toContain(bandMarker)
    },
  )

  it('asks the grader for a forward-looking pressureNote', () => {
    const prompt = buildGraderPrompt(stubQuestion('hard'), [])
    expect(prompt).toContain('pressureNote')
    expect(prompt).toContain('under-pressure retrieval')
  })

  it('asks the grader to extract candidateFinalAnswer verbatim (anchor)', () => {
    const prompt = buildGraderPrompt(stubQuestion('hard'), [])
    expect(prompt).toContain('candidateFinalAnswer')
    expect(prompt).toContain('VERBATIM')
  })

  it('instructs scaling the 1–5 scores to the difficulty tier', () => {
    const prompt = buildGraderPrompt(stubQuestion('brutal'), [])
    expect(prompt).toContain('scaling the 1–5 scores to the difficulty tier')
  })
})

describe('resolveTierFloor (spec-22)', () => {
  it.each([
    ['brutal', 'brutal'],
    ['harder', 'harder'],
    ['hard', 'hard'],
    [undefined, 'hard'],
    ['garbage', 'hard'],
    ['', 'hard'],
    [null, 'hard'],
    [3, 'hard'],
  ])('resolves %s → %s', (input, expected) => {
    expect(resolveTierFloor(input)).toBe(expected)
  })
})

describe('INTERVIEW_REPORT_SCHEMA (spec-22)', () => {
  it('requires tier and pressureNote, keeps additionalProperties false', () => {
    expect(INTERVIEW_REPORT_SCHEMA.required).toContain('tier')
    expect(INTERVIEW_REPORT_SCHEMA.required).toContain('pressureNote')
    expect(INTERVIEW_REPORT_SCHEMA.additionalProperties).toBe(false)
    expect(INTERVIEW_REPORT_SCHEMA.properties.tier.enum).toEqual([
      'hard',
      'harder',
      'brutal',
    ])
  })
})

describe('INTERVIEW_REPORT_SCHEMA — correctness anchor extraction field', () => {
  it('requires candidateFinalAnswer and types it as a string|null union (strict)', () => {
    expect(INTERVIEW_REPORT_SCHEMA.required).toContain('candidateFinalAnswer')
    expect(INTERVIEW_REPORT_SCHEMA.properties.candidateFinalAnswer.type).toEqual([
      'string',
      'null',
    ])
  })
})

describe('applyCorrectnessAnchor — deterministic hard override (mentor feedback)', () => {
  const dim = (score: number) => ({ score: score as 1 | 2 | 3 | 4 | 5, evidence: 'e' })
  function stubReport(correctness = 3): InterviewReport {
    return {
      dimensions: {
        correctness: dim(correctness),
        approach: dim(3),
        rigor: dim(3),
        communication: dim(3),
        speed: dim(3),
      },
      summary: 's',
      strengths: [],
      fixes: [],
      tier: 'hard',
      pressureNote: 'p',
    }
  }

  it('exact match → correctness forced to 5 (even across equivalent forms)', () => {
    const r = stubReport(2)
    applyCorrectnessAnchor(r, '1/2', '0.5')
    expect(r.dimensions.correctness.score).toBe(5)
    expect(r.correctnessAnchor).toMatchObject({ applied: true, verdict: 'match' })
    expect(r.dimensions.correctness.evidence).toContain('verified against the engine')
  })

  it('concrete wrong number → correctness forced to 1 (no flattery)', () => {
    const r = stubReport(5) // LLM was lenient
    applyCorrectnessAnchor(r, '1/2', '1/3')
    expect(r.dimensions.correctness.score).toBe(1)
    expect(r.correctnessAnchor).toMatchObject({ applied: true, verdict: 'mismatch' })
    expect(r.dimensions.correctness.evidence).toContain('engine answer is 1/2')
  })

  it('prose / multi-part ground truth → na, LLM score untouched', () => {
    const r = stubReport(4)
    applyCorrectnessAnchor(r, '(a) 11/30; (b) 19/30', '11/30')
    expect(r.dimensions.correctness.score).toBe(4)
    expect(r.correctnessAnchor).toMatchObject({ applied: false, verdict: 'na' })
  })

  it('no committed final answer → na, LLM score untouched', () => {
    const r = stubReport(3)
    applyCorrectnessAnchor(r, '1/2', null)
    expect(r.dimensions.correctness.score).toBe(3)
    expect(r.correctnessAnchor).toMatchObject({ applied: false, verdict: 'na' })
    expect(r.correctnessAnchor?.extracted).toBeNull()
  })
})

describe('INTERVIEW_REPORT_SCHEMA (spec-23 — hireSignal removed / D11)', () => {
  // Assert presence/absence per-key, NOT a whole-array equality, because spec-22
  // additively adds tier/pressureNote to the same array (README §5 merge).
  it('does NOT carry the hireSignal property or required entry (no verdict)', () => {
    expect('hireSignal' in INTERVIEW_REPORT_SCHEMA.properties).toBe(false)
    expect(INTERVIEW_REPORT_SCHEMA.required).not.toContain('hireSignal')
  })

  it('still requires the feed-forward report fields', () => {
    for (const key of ['dimensions', 'summary', 'strengths', 'fixes']) {
      expect(INTERVIEW_REPORT_SCHEMA.required).toContain(key)
    }
  })
})

describe('extractGradeJson', () => {
  it('returns the JSON string from a message item when output[0] is a reasoning item', () => {
    const data = {
      output: [
        { type: 'reasoning' },
        {
          type: 'message',
          content: [{ type: 'output_text', text: '{"dimensions":{}}' }],
        },
      ],
    }
    expect(extractGradeJson(data)).toBe('{"dimensions":{}}')
  })

  it('prefers output_text at the top level when present', () => {
    const data = { output_text: '{"a":1}' }
    expect(extractGradeJson(data)).toBe('{"a":1}')
  })

  it('returns empty string when output contains only a reasoning item', () => {
    const data = { output: [{ type: 'reasoning' }] }
    expect(extractGradeJson(data)).toBe('')
  })

  it('returns empty string for an empty object', () => {
    expect(extractGradeJson({})).toBe('')
  })
})
