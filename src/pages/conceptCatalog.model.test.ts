import { describe, it, expect } from 'vitest'
import { buildCatalogModel, type ProgressMap } from './conceptCatalog.model'
import { COURSE_ID } from '../content/courseIds'
import type { Course } from '../content/schema'

// Minimal valid Course factory.  Only the fields read by buildCatalogModel need
// real values; the rest are structurally-valid placeholders so the TypeScript
// type is satisfied without importing/validating the full Zod schema.
function makeCourse(
  courseId: string,
  title: string,
  lessonIds: string[] = [],
  overrides: Partial<Course> = {},
): Course {
  return {
    courseId,
    title,
    description: `Description for ${title}`,
    persona: 'explorer',
    lessons: lessonIds.map((id) => ({
      lessonId: id,
      title: `Lesson ${id}`,
      summary: '',
      milestoneId: `m-${id}`,
      built: true,
    })),
    roadmap: [],
    completionMilestoneId: 'c-main',
    schemaVersion: 1,
    ...overrides,
  }
}

// ── Domain grouping + ordering ────────────────────────────────────────────────

describe('buildCatalogModel — domain grouping + ordering', () => {
  it('sections are ordered by domainOrder ascending', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', [], { domain: 'Probability', domainOrder: 2, order: 1 }),
      makeCourse('c2', 'C2', [], { domain: 'Statistics', domainOrder: 1, order: 1 }),
    ]
    const { sections } = buildCatalogModel(courses, {})
    expect(sections).toHaveLength(2)
    expect(sections[0].domain).toBe('Statistics')  // domainOrder 1 first
    expect(sections[1].domain).toBe('Probability') // domainOrder 2 second
  })

  it('focusArea domain floats to the top when provided', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', [], { domain: 'Probability', domainOrder: 1, order: 1 }),
      makeCourse('c2', 'C2', [], { domain: 'Combinatorics', domainOrder: 2, order: 1 }),
    ]
    const { sections } = buildCatalogModel(courses, {}, undefined, 'Combinatorics')
    expect(sections[0].domain).toBe('Combinatorics')
    expect(sections[1].domain).toBe('Probability')
  })

  it('focusArea already at top: sections unchanged', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', [], { domain: 'Probability', domainOrder: 1, order: 1 }),
      makeCourse('c2', 'C2', [], { domain: 'Combinatorics', domainOrder: 2, order: 1 }),
    ]
    const { sections } = buildCatalogModel(courses, {}, undefined, 'Probability')
    expect(sections[0].domain).toBe('Probability')
  })

  it('unknown focusArea has no effect on ordering', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', [], { domain: 'Probability', domainOrder: 1, order: 1 }),
    ]
    const { sections } = buildCatalogModel(courses, {}, undefined, 'Unknown')
    expect(sections[0].domain).toBe('Probability')
  })

  it('section.order equals the domainOrder value', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', [], { domain: 'Math', domainOrder: 3 }),
    ]
    const { sections } = buildCatalogModel(courses, {})
    expect(sections[0].order).toBe(3)
  })

  it('concepts within a section are ordered by course.order ascending', () => {
    const courses: Course[] = [
      makeCourse('c-b', 'B', [], { domain: 'Math', domainOrder: 1, order: 2 }),
      makeCourse('c-a', 'A', [], { domain: 'Math', domainOrder: 1, order: 1 }),
    ]
    const { sections } = buildCatalogModel(courses, {})
    expect(sections[0].concepts[0].conceptId).toBe('c-a')
    expect(sections[0].concepts[1].conceptId).toBe('c-b')
  })

  it('courses sharing a domain land in one section', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', [], { domain: 'Math', domainOrder: 1 }),
      makeCourse('c2', 'C2', [], { domain: 'Math', domainOrder: 1 }),
      makeCourse('c3', 'C3', [], { domain: 'Science', domainOrder: 2 }),
    ]
    const { sections } = buildCatalogModel(courses, {})
    expect(sections).toHaveLength(2)
    expect(sections[0].concepts).toHaveLength(2)
    expect(sections[1].concepts).toHaveLength(1)
  })
})

// ── Per-concept progress aggregation ─────────────────────────────────────────

describe('buildCatalogModel — per-concept progress aggregation', () => {
  it('not_started: no progress entries → state not_started, percent 0', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2', 'l3'])
    const { sections } = buildCatalogModel([course], {})
    const card = sections[0].concepts[0]
    expect(card.progress.state).toBe('not_started')
    expect(card.progress.percent).toBe(0)
    expect(card.lessonCount).toBe(3)
  })

  it('in_progress: a lesson with completionStatus in_progress (none completed) → percent 0', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2'])
    const progress: ProgressMap = { l1: { completionStatus: 'in_progress' } }
    const { sections } = buildCatalogModel([course], progress)
    const card = sections[0].concepts[0]
    expect(card.progress.state).toBe('in_progress')
    expect(card.progress.percent).toBe(0) // 0 completed out of 2
  })

  it('in_progress: 1 of 3 completed → percent 33 (Math.round(1/3 * 100))', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2', 'l3'])
    const progress: ProgressMap = { l1: { completionStatus: 'completed' } }
    const { sections } = buildCatalogModel([course], progress)
    const card = sections[0].concepts[0]
    expect(card.progress.state).toBe('in_progress')
    expect(card.progress.percent).toBe(33)
  })

  it('in_progress: 2 of 4 completed → percent 50', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2', 'l3', 'l4'])
    const progress: ProgressMap = {
      l1: { completionStatus: 'completed' },
      l2: { completionStatus: 'completed' },
    }
    const { sections } = buildCatalogModel([course], progress)
    const card = sections[0].concepts[0]
    expect(card.progress.state).toBe('in_progress')
    expect(card.progress.percent).toBe(50)
  })

  it('mastered: all lessons completed → state mastered, percent 100', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2'])
    const progress: ProgressMap = {
      l1: { completionStatus: 'completed' },
      l2: { completionStatus: 'completed' },
    }
    const { sections } = buildCatalogModel([course], progress)
    const card = sections[0].concepts[0]
    expect(card.progress.state).toBe('mastered')
    expect(card.progress.percent).toBe(100)
  })

  it('lessonCount matches the course.lessons array length', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2', 'l3', 'l4', 'l5'])
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].lessonCount).toBe(5)
  })

  it('progress entries for lesson IDs not in this course are ignored', () => {
    const course = makeCourse('c1', 'C1', ['l1'])
    const progress: ProgressMap = { 'other-lesson': { completionStatus: 'completed' } }
    const { sections } = buildCatalogModel([course], progress)
    expect(sections[0].concepts[0].progress.state).toBe('not_started')
  })
})

// ── Resume pick ───────────────────────────────────────────────────────────────

describe('buildCatalogModel — resume pick', () => {
  it('in_progress concept is chosen even when not_started appears earlier in sections', () => {
    // c-first (order 1) is not_started; c-inprog (order 2) has a lesson in_progress.
    // The resume logic scans for in_progress first, so c-inprog wins despite its
    // later position.
    const courses: Course[] = [
      makeCourse('c-first', 'First', ['l1'], { order: 1 }),
      makeCourse('c-inprog', 'InProg', ['l2'], { order: 2 }),
    ]
    const progress: ProgressMap = { l2: { completionStatus: 'in_progress' } }
    const { resume } = buildCatalogModel(courses, progress)
    expect(resume?.conceptId).toBe('c-inprog')
    expect(resume?.progress.state).toBe('in_progress')
  })

  it('falls back to the first not_started live concept when none is in_progress', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', ['l1'], { order: 1 }),
      makeCourse('c2', 'C2', ['l2'], { order: 2 }),
    ]
    const { resume } = buildCatalogModel(courses, {})
    expect(resume?.conceptId).toBe('c1')
    expect(resume?.progress.state).toBe('not_started')
  })

  it('falls back to the first mastered live concept when all are mastered', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', ['l1'], { order: 1 }),
      makeCourse('c2', 'C2', ['l2'], { order: 2 }),
    ]
    const progress: ProgressMap = {
      l1: { completionStatus: 'completed' },
      l2: { completionStatus: 'completed' },
    }
    const { resume } = buildCatalogModel(courses, progress)
    expect(resume?.conceptId).toBe('c1')
    expect(resume?.progress.state).toBe('mastered')
  })

  it('resume is undefined when only coming_soon concepts exist', () => {
    const course = makeCourse('c1', 'C1', ['l1'], { status: 'coming_soon' })
    const { resume } = buildCatalogModel([course], {})
    expect(resume).toBeUndefined()
  })

  it('coming_soon concept is not picked as resume over a live not_started concept', () => {
    const courses: Course[] = [
      makeCourse('soon', 'Soon', ['l1'], { status: 'coming_soon', order: 1 }),
      makeCourse('live', 'Live', ['l2'], { order: 2 }),
    ]
    const { resume } = buildCatalogModel(courses, {})
    expect(resume?.conceptId).toBe('live')
  })
})

// ── Recommended-start hero (ADR-0006) ─────────────────────────────────────────

describe('buildCatalogModel — recommended start hero', () => {
  it('no-progress learner with recommendedConceptId gets a recommendedStart hero', () => {
    const courses: Course[] = [
      makeCourse('c-rec', 'Rec', ['l1'], { status: 'live', order: 1 }),
      makeCourse('c-other', 'Other', ['l2'], { status: 'live', order: 2 }),
    ]
    const { resume, recommendedStart } = buildCatalogModel(courses, {}, 'c-rec')
    expect(resume?.conceptId).toBe('c-rec')
    expect(recommendedStart).toBe(true)
  })

  it('learner with in_progress progress uses regular resume (not recommendedStart)', () => {
    const courses: Course[] = [
      makeCourse('c-rec', 'Rec', ['l1'], { status: 'live', order: 1 }),
      makeCourse('c-inprog', 'InProg', ['l2'], { status: 'live', order: 2 }),
    ]
    const progress: ProgressMap = { l2: { completionStatus: 'in_progress' } }
    const { resume, recommendedStart } = buildCatalogModel(courses, progress, 'c-rec')
    expect(resume?.conceptId).toBe('c-inprog')
    expect(recommendedStart).toBe(false)
  })

  it('recommended concept is coming_soon → falls back to flagship', () => {
    const courses: Course[] = [
      makeCourse(COURSE_ID, 'Flagship', ['l1'], { status: 'live', order: 1 }),
      makeCourse('c-soon', 'Soon', ['l2'], { status: 'coming_soon', order: 2 }),
    ]
    const { resume, recommendedStart } = buildCatalogModel(courses, {}, 'c-soon')
    expect(resume?.conceptId).toBe(COURSE_ID)
    expect(recommendedStart).toBe(true)
  })

  it('focusAreaComingSoon is true when all focusArea concepts are coming_soon', () => {
    const courses: Course[] = [
      makeCourse(COURSE_ID, 'Flagship', ['l1'], { domain: 'Math', domainOrder: 1, order: 1, status: 'live' }),
      makeCourse('c-soon', 'Soon', ['l2'], { domain: 'Probability', domainOrder: 2, order: 1, status: 'coming_soon' }),
    ]
    const { focusAreaComingSoon } = buildCatalogModel(courses, {}, COURSE_ID, 'Probability')
    expect(focusAreaComingSoon).toBe(true)
  })

  it('focusAreaComingSoon is false/absent when at least one live concept in focus area', () => {
    const courses: Course[] = [
      makeCourse('c-live', 'Live', ['l1'], { domain: 'Probability', domainOrder: 1, order: 1, status: 'live' }),
    ]
    const { focusAreaComingSoon } = buildCatalogModel(courses, {}, 'c-live', 'Probability')
    expect(focusAreaComingSoon).toBeFalsy()
  })

  it('no recommendedConceptId → resume picks first live not_started as usual', () => {
    const courses: Course[] = [
      makeCourse('c1', 'C1', ['l1'], { order: 1 }),
    ]
    const { resume } = buildCatalogModel(courses, {})
    expect(resume?.conceptId).toBe('c1')
  })
})

// ── Coming-soon handling ──────────────────────────────────────────────────────

describe('buildCatalogModel — coming_soon handling', () => {
  it('coming_soon concepts appear in sections with status coming_soon', () => {
    const course = makeCourse('c1', 'C1', ['l1'], { status: 'coming_soon' })
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].status).toBe('coming_soon')
  })

  it('coming_soon concepts have progress not_started/0 regardless of progress map entries', () => {
    const course = makeCourse('c1', 'C1', ['l1'], { status: 'coming_soon' })
    // Simulate stale progress entries — should be ignored for coming_soon.
    const progress: ProgressMap = { l1: { completionStatus: 'completed' } }
    const { sections } = buildCatalogModel([course], progress)
    const card = sections[0].concepts[0]
    expect(card.progress.state).toBe('not_started')
    expect(card.progress.percent).toBe(0)
  })

  it('coming_soon lessonCount still reflects the authored lesson list length', () => {
    const course = makeCourse('c1', 'C1', ['l1', 'l2', 'l3'], { status: 'coming_soon' })
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].lessonCount).toBe(3)
  })
})

// ── Default field fallbacks ───────────────────────────────────────────────────

describe('buildCatalogModel — default field fallbacks', () => {
  it('missing domain → "Other" with domainOrder 999', () => {
    const course = makeCourse('c1', 'C1', [])
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].domain).toBe('Other')
    expect(sections[0].order).toBe(999)
  })

  it('missing status → "live"', () => {
    const course = makeCourse('c1', 'C1', [])
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].status).toBe('live')
  })

  it('missing tagline falls back to description (trimmed)', () => {
    const course = makeCourse('c1', 'C1', [], { description: '  Fallback description  ' })
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].tagline).toBe('Fallback description')
  })

  it('explicit tagline takes precedence over description', () => {
    const course = makeCourse('c1', 'C1', [], {
      description: 'Long description',
      tagline: 'Catchy tagline',
    })
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].tagline).toBe('Catchy tagline')
  })

  it('missing accent cycles through ACCENT_CYCLE (ch1→ch5) by forEach index', () => {
    // Six courses without explicit accent; accent = ACCENT_CYCLE[index % 5].
    const courses: Course[] = Array.from({ length: 6 }, (_, i) =>
      makeCourse(`c${i}`, `C${i}`, []),
    )
    const { sections } = buildCatalogModel(courses, {})
    const byId = Object.fromEntries(
      sections.flatMap((s) => s.concepts).map((c) => [c.conceptId, c]),
    )
    expect(byId['c0'].accent).toBe('ch1') // 0 % 5 = 0
    expect(byId['c1'].accent).toBe('ch2') // 1 % 5 = 1
    expect(byId['c4'].accent).toBe('ch5') // 4 % 5 = 4
    expect(byId['c5'].accent).toBe('ch1') // 5 % 5 = 0 (wraps)
  })

  it('explicit accent overrides the cycle', () => {
    const course = makeCourse('c0', 'C0', [], { accent: 'ch4' })
    const { sections } = buildCatalogModel([course], {})
    expect(sections[0].concepts[0].accent).toBe('ch4')
  })
})

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('buildCatalogModel — edge cases', () => {
  it('zero-lesson live course: percent 0, state not_started (no divide-by-zero)', () => {
    // buildCatalogModel guards on `lessonCount > 0` before computing percent, so
    // the division never executes.
    const course = makeCourse('c1', 'C1', [])
    const { sections } = buildCatalogModel([course], {})
    const card = sections[0].concepts[0]
    expect(card.lessonCount).toBe(0)
    expect(card.progress.percent).toBe(0)
    expect(card.progress.state).toBe('not_started')
  })

  it('empty course list → no sections, no resume', () => {
    const { resume, sections } = buildCatalogModel([], {})
    expect(sections).toHaveLength(0)
    expect(resume).toBeUndefined()
  })
})
