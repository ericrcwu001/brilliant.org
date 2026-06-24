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
// The MVP gate ships only L1 built; the general unlock/priority logic is exercised
// against a variant where every node is built (post-gate shape).
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

  it('first visit: L1 available, the other five locked ghosts', () => {
    const nodes = resolveNodes(course, {})
    expect(nodes).toHaveLength(6)
    expect(nodes[0].state).toBe('available')
    expect(nodes.slice(1).every((n) => n.state === 'locked')).toBe(true)
  })

  it('first visit recommends Start on the focused L1 node', () => {
    const nodes = resolveNodes(course, {})
    const action = recommendedAction(nodes, {})
    expect(action).toEqual({ kind: 'start', lessonId: L1 })
    expect(statusLine(action, nodes)).toBe('Start Pattern Hitting Times')
    expect(reviewNote(action, nodes)).toBeNull()
    expect(nodeCtaLabel(nodes[0], undefined)).toBe('Start')
  })

  it('an unbuilt lesson stays locked even if the server reports it unlocked', () => {
    const progress: Record<string, Progress> = { [L2]: { unlockedAt: 1 } }
    const nodes = resolveNodes(course, progress)
    expect(nodes[1].state).toBe('locked')
    expect(nodeCtaLabel(nodes[1], progress[L2])).toBeNull()
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
    expect(nodeCtaLabel(nodes[0], progress[L1])).toBe('Resume')
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
    expect(nodes[0].state).toBe('needsReview')
    expect(nodeCtaLabel(nodes[0], progress[L1])).toBe('Review')
    expect(reviewNote(action, nodes)).toBeNull()
  })

  it('completing a lesson unlocks the next as the Start target', () => {
    const progress: Record<string, Progress> = {
      [L1]: { completionStatus: 'completed' },
      [L2]: { unlockedAt: 1 },
    }
    const nodes = resolveNodes(builtCourse, progress)
    expect(nodes[0].state).toBe('completed')
    expect(nodes[1].state).toBe('available')
    expect(nodes[2].state).toBe('locked') // only the immediate next unlocks
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
