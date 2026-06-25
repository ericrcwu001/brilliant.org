import { test, expect, type Page } from '@playwright/test'

/**
 * Visual-regression baseline for Firebase-less dev routes.
 * Run with --update-snapshots to capture; run without to verify stability.
 * Snapshots land in e2e/vr/__screenshots__/{projectName}/.
 */

const SCREENSHOT_OPTS = {
  fullPage: true,
  animations: 'disabled',
  caret: 'hide',
  maxDiffPixelRatio: 0.02,
} as const

async function stabilize(page: Page, anchorSelector: string) {
  await page.waitForLoadState('load')
  await page.evaluate(() => document.fonts.ready)
  await page.locator(anchorSelector).waitFor({ state: 'visible' })
  // Let Konva/canvas settle after fonts + DOM are ready.
  await page.waitForTimeout(300)
}

test('dev-home', async ({ page }) => {
  await page.goto('/dev/home')
  await stabilize(page, '.ergo-journey')
  await expect(page).toHaveScreenshot('dev-home.png', SCREENSHOT_OPTS)
})

test('dev-lesson-flagship', async ({ page }) => {
  await page.goto('/dev/lesson')
  await stabilize(page, 'section.prompt')
  await expect(page).toHaveScreenshot('dev-lesson-flagship.png', SCREENSHOT_OPTS)
})

test('dev-lesson-penneys', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-penneys-game')
  await stabilize(page, 'section.prompt')
  await expect(page).toHaveScreenshot('dev-lesson-penneys.png', SCREENSHOT_OPTS)
})
