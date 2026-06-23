import { test, expect } from '@playwright/test'

// Smoke test for the harness pipeline (pinned-port vite + browser + SPA route)
// that also doubles as the first real O1 check: beat 1 (open-bet) must gate
// Continue until a prediction is selected (design-system CTA matrix, beat 1).
test('flagship lesson loads and the opening bet gates Continue', async ({
  page,
}) => {
  await page.goto('/dev/lesson')

  await expect(page.locator('.prompt__text')).toContainText('Which wait is longer')

  const continueBtn = page.getByRole('button', { name: 'Continue' })
  await expect(continueBtn).toBeDisabled()

  await page
    .getByRole('radio', { name: /Waiting for HH takes longer/ })
    .click()
  await expect(continueBtn).toBeEnabled()
})
