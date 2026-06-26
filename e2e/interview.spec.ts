// Playwright e2e for the /dev/interview stub harness (Phase 6).
// The stub uses a fixture ClientQuestion and a scripted transport that replays
// a pre-canned transcript — no Firebase auth, no OpenAI call, no cost.
//
// Run (warm Vite first):
//   npm run dev -- --port 4321 --strictPort &
//   ./node_modules/.bin/playwright test e2e/interview.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Interview flow (/dev/interview stub)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/interview')
  })

  test('ready state: shows question prompt area and Start button', async ({ page }) => {
    await expect(page.locator('.iv-ready')).toBeVisible()
    await expect(page.getByRole('button', { name: /Start interview/ })).toBeVisible()
  })

  test('ready state: Start button is present', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Start interview/ })
    await expect(btn).toBeVisible()
  })

  test('live state: transcript aria-live region is present after starting', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    await expect(page.locator('[aria-live="polite"]')).toBeVisible()
  })

  test('live state: countdown is visible during live session', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    await expect(page.locator('.iv-countdown')).toBeVisible()
  })

  test('live state: typed fallback input and Send button are present', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    await expect(page.locator('.iv-typed-input')).toBeVisible()
    await expect(page.getByRole('button', { name: /Send/ })).toBeVisible()
  })

  test('typed fallback: text input echoes the submitted turn in the transcript', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    const input = page.locator('.iv-typed-input')
    await input.fill('My answer is 42.')
    await page.getByRole('button', { name: /Send/ }).click()
    await expect(page.locator('[aria-live="polite"]')).toContainText('My answer is 42.')
  })

  test('report state: all five dimension labels and hire signal render', async ({ page }) => {
    await page.getByRole('button', { name: /Start interview/ }).click()
    // The stub transport advances to the report after the session ends.
    // End the session by clicking the "End interview" button.
    await expect(page.locator('.iv-countdown')).toBeVisible()
    await page.getByRole('button', { name: /End interview/ }).click()
    await expect(page.locator('.iv-report')).toBeVisible({ timeout: 10_000 })
    for (const label of ['Correctness', 'Approach', 'Rigor', 'Communication', 'Speed']) {
      await expect(page.locator('.iv-report')).toContainText(label)
    }
    await expect(page.locator('.iv-signal')).toBeVisible()
  })
})

test.describe('Orb accessibility (all projects)', () => {
  test('Orb container is aria-hidden during the live state', async ({ page }) => {
    await page.goto('/dev/interview')
    await page.getByRole('button', { name: /Start interview/ }).click()
    await expect(page.locator('.iv-countdown')).toBeVisible()
    const orb = page.locator('.iv-orb')
    await expect(orb).toHaveAttribute('aria-hidden', 'true')
  })
})
