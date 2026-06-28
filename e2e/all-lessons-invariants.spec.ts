import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

// Data-driven cross-lesson regression net. Loads EVERY bundled lesson fixture at
// /dev/lesson/:lessonId and asserts the two systemic invariants that were broken
// before this pass:
//
//  1. Progress rail (Workstream A): the rail derives from the lesson's own beat
//     sequence — one segment per visible beat, the first is `current`, none are
//     `complete` yet. (Previously the 57 non-flagship lessons rendered the
//     flagship's static segments that never advanced.)
//  2. Hint timing (Workstream B1): no hint/answer strip (`.feedback--wrong`) is
//     visible before the learner attempts anything on a fresh lesson.
//
// These run on every fixture so a newly-authored lesson is covered automatically
// and the systemic bugs can never silently regress. Per-beat completion walks
// (CTA gating, advancing, grading) live in the per-course specs.

const FIXTURE_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

type FixtureBeat = { heldOut?: boolean; track?: 'A' | 'B' | 'both' }
type Fixture = { lessonId: string; beats: FixtureBeat[] }

// Mirror LessonPlayer.visibleBeats for the dev route's default track ('B'):
// drop held-out transfer beats and any Track-A-only beats.
function visibleBeatCount(lesson: Fixture): number {
  return lesson.beats.filter(
    (b) => !b.heldOut && (!b.track || b.track === 'both' || b.track === 'B'),
  ).length
}

const lessons: Fixture[] = readdirSync(FIXTURE_DIR)
  .filter((f) => /^lesson-.*\.json$/.test(f))
  .map((f) => JSON.parse(readFileSync(join(FIXTURE_DIR, f), 'utf8')) as Fixture)
  .filter((l) => l && typeof l.lessonId === 'string' && Array.isArray(l.beats))

test.describe('all lessons — rail + hint invariants', () => {
  for (const lesson of lessons) {
    const expectedSegs = visibleBeatCount(lesson)

    test(`${lesson.lessonId}: rail tracks position, no premature hint`, async ({
      page,
    }) => {
      await page.goto(`/dev/lesson/${lesson.lessonId}`)

      // Lesson shell rendered (not the "Lesson not found" / error fallback).
      await expect(page.locator('.rail')).toBeVisible()

      // One rail segment per visible beat (the fix: was the flagship's static set).
      const segs = page.locator('.rail__seg')
      await expect(segs).toHaveCount(expectedSegs)

      // At the start: the first beat is the current step; nothing complete yet.
      await expect(segs.first()).toHaveClass(/rail__seg--current/)
      await expect(page.locator('.rail__seg--current')).toHaveCount(1)
      await expect(page.locator('[aria-current="step"]')).toHaveCount(1)
      await expect(page.locator('.rail__seg--complete')).toHaveCount(0)

      // No hint/answer strip before any attempt on a fresh lesson (B1).
      await expect(page.locator('.feedback--wrong')).toHaveCount(0)
    })
  }
})
