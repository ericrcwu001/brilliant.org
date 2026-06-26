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

import { extractGradeJson } from './interview'

describe('extractGradeJson', () => {
  it('returns the JSON string from a message item when output[0] is a reasoning item', () => {
    const data = {
      output: [
        { type: 'reasoning' },
        {
          type: 'message',
          content: [{ type: 'output_text', text: '{"hireSignal":"Yes"}' }],
        },
      ],
    }
    expect(extractGradeJson(data)).toBe('{"hireSignal":"Yes"}')
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
