import { test } from '@playwright/test'
import { completeLessonTrackA } from './helpers'

// L1 inclusive redesign: the Track-A (scaffolded) path must also complete
// end-to-end across the chromium, mobile (tap-only), and reduced-motion
// projects — exercising the primers, the split simulate, the staged/faded
// equation build, and the interactive overlap comparison.
test('Track-A lesson is completable end-to-end (tap-only)', async ({ page }) => {
  await completeLessonTrackA(page)
})
