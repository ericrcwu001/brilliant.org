import { describe, it, expect } from 'vitest'
import { InterviewPackSchema } from './interviewPack'
import evPack from '../../interviews/course-expected-value.json'

describe('InterviewPackSchema', () => {
  it('parses the canonical EV pack without error', () => {
    expect(() => InterviewPackSchema.parse(evPack)).not.toThrow()
  })

  it('rejects a pack missing the version field', () => {
    const bad = Object.fromEntries(
      Object.entries(evPack as unknown as Record<string, unknown>).filter(
        ([k]) => k !== 'version',
      ),
    )
    expect(InterviewPackSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects an empty object', () => {
    expect(InterviewPackSchema.safeParse({}).success).toBe(false)
  })
})
