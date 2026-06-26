// Smoke test: every live milestone id (lessons + completion) must have a
// bespoke SVG in ICON_SHAPES — no silent fallback to the text glyph.
// Importing JSON fixtures directly follows the pattern in milestones.test.ts.

import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { MilestoneIcon } from './MilestoneIcon'
import { CourseSchema } from '../content/schema'
import evFixture from '../../fixtures/course-expected-value.json'
import bayesFixture from '../../fixtures/course-bayes-rule.json'
import combinatoricsFixture from '../../fixtures/course-combinatorics.json'

const courses = [
  CourseSchema.parse(evFixture),
  CourseSchema.parse(bayesFixture),
  CourseSchema.parse(combinatoricsFixture),
]

describe('MilestoneIcon', () => {
  it('renders a bespoke SVG for every live milestone id', () => {
    for (const course of courses) {
      const ids = [
        ...course.lessons.map((l) => l.milestoneId),
        course.completionMilestoneId,
      ]
      for (const id of ids) {
        const html = renderToString(<MilestoneIcon id={id} glyph="?" />)
        expect(html, `${id} should render ergo-medallion__icon`).toContain(
          'ergo-medallion__icon',
        )
        expect(html, `${id} should not fall back to text glyph`).not.toContain(
          'ergo-medallion__glyph',
        )
      }
    }
  })

  it('falls back to the text glyph for an unknown milestone id', () => {
    const html = renderToString(
      <MilestoneIcon id="totally-unknown-id" glyph="★" />,
    )
    expect(html).toContain('ergo-medallion__glyph')
    expect(html).toContain('★')
  })
})
