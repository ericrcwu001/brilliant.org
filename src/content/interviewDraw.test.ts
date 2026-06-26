import { describe, it, expect } from 'vitest'
import { drawQuestion, markSeen, isSeen } from './interviewDraw'
import type { InterviewPack, Question } from './interviewPack'

// ── Fixture helpers ────────────────────────────────────────────────────────────

function makeQuestion(
  id: string,
  tier: 'hard' | 'harder' | 'brutal',
  fingerprint: string,
): Question {
  return {
    id,
    tier,
    fingerprint,
    prompt: `Question ${id}`,
    source: 'test',
    engineCheck: { module: 'test', calls: [], answer: '42', verified: true },
    hidden: {
      answer: '42',
      approaches: ['approach'],
      wrongTurns: [],
      hintLadder: ['hint1', 'hint2', 'hint3'],
      rubric: {
        correctness: 'test',
        approach: 'test',
        rigor: 'test',
        communication: 'test',
        speed: 'test',
      },
    },
    followUps: ['follow-up?'],
  }
}

function makePack(questions: Question[]): InterviewPack {
  const byTier = {
    hard: questions.filter((q) => q.tier === 'hard').length,
    harder: questions.filter((q) => q.tier === 'harder').length,
    brutal: questions.filter((q) => q.tier === 'brutal').length,
  }
  return {
    version: 1,
    kind: 'interview-pack',
    courseId: 'test-course',
    concept: 'Test',
    greenBookAnchor: 'test',
    engineModule: 'test',
    generator: 'test',
    note: 'test',
    counts: { total: questions.length, byTier, templated: 0, freeForm: questions.length },
    interviewerPrompt: 'test',
    generatorPrompt: 'test',
    templates: [],
    questions,
  }
}

// 5-question fixture: 2 hard, 2 harder, 1 brutal
const Q1 = makeQuestion('q1', 'hard', 'fp1')
const Q2 = makeQuestion('q2', 'hard', 'fp2')
const Q3 = makeQuestion('q3', 'harder', 'fp3')
const Q4 = makeQuestion('q4', 'harder', 'fp4')
const Q5 = makeQuestion('q5', 'brutal', 'fp5')
const PACK = makePack([Q1, Q2, Q3, Q4, Q5])

// ── drawQuestion ──────────────────────────────────────────────────────────────

describe('drawQuestion', () => {
  it('never draws a seen question id', () => {
    const seenIds = ['q1', 'q2', 'q3', 'q4']
    const result = drawQuestion(PACK, seenIds)
    expect(result).not.toBeNull()
    expect(['q1', 'q2', 'q3', 'q4']).not.toContain(result!.question.id)
    expect(result!.question.id).toBe('q5')
  })

  it('respects tierFloor:brutal — only returns brutal questions', () => {
    const result = drawQuestion(PACK, [], { tierFloor: 'brutal' })
    expect(result).not.toBeNull()
    expect(result!.question.tier).toBe('brutal')
  })

  it('returns null when brutal pool is exhausted', () => {
    // q5 is the only brutal; mark it seen
    const result = drawQuestion(PACK, ['q5'], { tierFloor: 'brutal' })
    expect(result).toBeNull()
  })

  it('returns null when all questions are seen', () => {
    const result = drawQuestion(PACK, ['q1', 'q2', 'q3', 'q4', 'q5'])
    expect(result).toBeNull()
  })

  it('drawing N times (marking each seen) yields distinct ids', () => {
    const seen: string[] = []
    const drawn: string[] = []
    for (let i = 0; i < 5; i++) {
      const result = drawQuestion(PACK, seen)
      expect(result).not.toBeNull()
      const id = result!.question.id
      expect(drawn).not.toContain(id)
      drawn.push(id)
      seen.push(id)
    }
    expect(drawn).toHaveLength(5)
    // Sixth draw must exhaust the pool
    expect(drawQuestion(PACK, seen)).toBeNull()
  })

  it('is deterministic given the same seenIds and rng', () => {
    const seenIds = ['q1']
    let counter = 0
    // Seeded sequence: 0.1, 0.5, 0.9, repeating
    const seededRng = () => [0.1, 0.5, 0.9][counter++ % 3]
    const r1 = drawQuestion(PACK, seenIds, { rng: seededRng })
    counter = 0
    const r2 = drawQuestion(PACK, seenIds, { rng: seededRng })
    expect(r1!.question.id).toBe(r2!.question.id)
  })

  it('with a single eligible question, rng:()=>0 returns that question', () => {
    // Only q5 (brutal) is eligible when tier floor is brutal and nothing is seen
    const brutals = makePack([Q5])
    const result = drawQuestion(brutals, [], { rng: () => 0 })
    expect(result).not.toBeNull()
    expect(result!.question.id).toBe('q5')
  })

  it('surfaces followUps from the drawn question', () => {
    const result = drawQuestion(PACK, [], { rng: () => 0 })
    expect(result).not.toBeNull()
    expect(result!.followUps).toEqual(result!.question.followUps)
  })
})

// ── markSeen ──────────────────────────────────────────────────────────────────

describe('markSeen', () => {
  it('appends the question id to the seen list', () => {
    const updated = markSeen(['q1'], Q2)
    expect(updated).toContain('q2')
  })

  it('is immutable — returns a new array', () => {
    const original = ['q1']
    const updated = markSeen(original, Q2)
    expect(updated).not.toBe(original)
    expect(original).toHaveLength(1)
  })

  it('is idempotent if the question is already seen', () => {
    const updated = markSeen(['q1'], Q1)
    expect(updated).toEqual(['q1'])
  })
})

// ── isSeen ────────────────────────────────────────────────────────────────────

describe('isSeen', () => {
  it('returns true when the question id is in seenIds', () => {
    expect(isSeen(Q1, ['q1'], PACK)).toBe(true)
  })

  it('returns false when the question is not seen', () => {
    expect(isSeen(Q3, ['q1', 'q2'], PACK)).toBe(false)
  })

  it('returns true when a question with the same fingerprint is in seenIds', () => {
    // Build a pack where q6 has the same fingerprint as Q1 but a different id
    const Q6 = makeQuestion('q6', 'hard', 'fp1') // same fingerprint as Q1
    const pack = makePack([Q1, Q6, Q3])
    // Q1 has been seen (by id); Q6 shares its fingerprint
    expect(isSeen(Q6, ['q1'], pack)).toBe(true)
  })
})
