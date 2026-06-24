import { describe, it, expect } from 'vitest'
import courseFixture from '../../fixtures/course-pattern-hitting-times.json'
import { CourseSchema, type Course, type Progress } from '../content/schema'
import {
  glyphFor,
  resolveNodes,
  recommendedAction,
  statusLine,
  reviewNote,
  nodeCtaLabel,
} from './studyDesk.model'

const course = CourseSchema.parse(courseFixture)
// The course now ships L0–L6 built; the unlock/priority logic is exercised against
// a variant where every node is built (the unbuilt-gate is tested separately with
// a synthetic unbuilt node).
const builtCourse: Course = {
  ...course,
  lessons: course.lessons.map((l) => ({ ...l, built: true })),
}

const L1 = 'lesson-pattern-hitting-times'
const L2 = 'lesson-penneys-game'

describe('studyDesk model — gate (L1-only)', () => {
  it('maps every lesson to its mono glyph', () => {
    expect(glyphFor(L1)).toBe('HH')
    expect(glyphFor('lesson-overlap-shortcut')).toBe('Σ2ᴸ')
    expect(glyphFor('unknown')).toBe('·')
  })

  it('first visit: the optional L0 on-ramp + the flagship are available, rest locked', () => {
    const nodes = resolveNodes(course, {})
    expect(nodes).toHaveLength(7)
    expect(nodes[0].state).toBe('available') // L0 on-ramp (optional)
    expect(nodes[0].optional).toBe(true)
    expect(nodes[1].state).toBe('available') // L1 flagship
    expect(nodes.slice(2).every((n) => n.state === 'locked')).toBe(true)
  })

  it('first visit recommends Start on the flagship, skipping the optional on-ramp', () => {
    const nodes = resolveNodes(course, {})
    const action = recommendedAction(nodes, {})
    expect(action).toEqual({ kind: 'start', lessonId: L1 })
    expect(statusLine(action, nodes)).toBe('Start Pattern Hitting Times')
    expect(reviewNote(action, nodes)).toBeNull()
    expect(nodeCtaLabel(nodes[1], undefined)).toBe('Start')
  })

  it('an unbuilt lesson stays locked even if the server reports it unlocked', () => {
    // All shipped lessons are now built, so force one unbuilt to test the gate.
    const unbuiltCourse: Course = {
      ...course,
      lessons: course.lessons.map((l) =>
        l.lessonId === L2 ? { ...l, built: false } : l,
      ),
    }
    const progress: Record<string, Progress> = { [L2]: { unlockedAt: 1 } }
    const nodes = resolveNodes(unbuiltCourse, progress)
    expect(nodes[2].state).toBe('locked')
    expect(nodeCtaLabel(nodes[2], progress[L2])).toBeNull()
  })
})

describe('studyDesk model — recommended-action priority (Q9)', () => {
  it('an in-progress lesson is resumed (Resume always wins)', () => {
    const progress: Record<string, Progress> = {
      [L1]: { completionStatus: 'in_progress' },
    }
    const nodes = resolveNodes(builtCourse, progress)
    const action = recommendedAction(nodes, progress)
    expect(action).toEqual({ kind: 'resume', lessonId: L1 })
    expect(nodeCtaLabel(nodes[1], progress[L1])).toBe('Resume')
  })

  it('Resume beats a separate needsReview, which surfaces as a quiet note', () => {
    const progress: Record<string, Progress> = {
      [L1]: { completionStatus: 'completed', needsReview: true },
      [L2]: { completionStatus: 'in_progress', unlockedAt: 1 },
    }
    const nodes = resolveNodes(builtCourse, progress)
    const action = recommendedAction(nodes, progress)
    expect(action.kind).toBe('resume')
    expect(action.lessonId).toBe(L2)
    expect(reviewNote(action, nodes)).toBe(
      'Worth another look: Pattern Hitting Times.',
    )
  })

  it('Review is focused only between lessons (no in-progress session)', () => {
    const progress: Record<string, Progress> = {
      [L1]: { completionStatus: 'completed', needsReview: true },
    }
    const nodes = resolveNodes(builtCourse, progress)
    const action = recommendedAction(nodes, progress)
    expect(action).toEqual({ kind: 'review', lessonId: L1 })
    expect(nodes[1].state).toBe('needsReview')
    expect(nodeCtaLabel(nodes[1], progress[L1])).toBe('Review')
    expect(reviewNote(action, nodes)).toBeNull()
  })

  it('completing a lesson unlocks the next as the Start target', () => {
    const progress: Record<string, Progress> = {
      [L1]: { completionStatus: 'completed' },
      [L2]: { unlockedAt: 1 },
    }
    const nodes = resolveNodes(builtCourse, progress)
    expect(nodes[1].state).toBe('completed') // L1
    expect(nodes[2].state).toBe('available') // L2 unlocked
    expect(nodes[3].state).toBe('locked') // only the immediate next unlocks
    const action = recommendedAction(nodes, progress)
    expect(action).toEqual({ kind: 'start', lessonId: L2 })
  })

  it('all lessons mastered → Replay / course complete', () => {
    const progress: Record<string, Progress> = Object.fromEntries(
      builtCourse.lessons.map((l) => [
        l.lessonId,
        { completionStatus: 'completed' } as Progress,
      ]),
    )
    const nodes = resolveNodes(builtCourse, progress)
    const action = recommendedAction(nodes, progress)
    expect(action.kind).toBe('replay')
    expect(statusLine(action, nodes)).toBe(
      'Course complete — every lesson mastered.',
    )
  })
})
