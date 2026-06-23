import { test } from '@playwright/test'
import { completeLesson } from './helpers'

// O1 (functional) + O3 (accessibility): the flagship lesson must be completable
// end-to-end. Running this across the chromium, mobile (tap-only), and
// reduced-motion projects proves the tap-only and reduced-motion paths complete,
// per docs/ui_design_system.md Accessibility + the PRD acceptance criteria.
test('flagship lesson is completable end-to-end (tap-only)', async ({ page }) => {
  await completeLesson(page)
})
