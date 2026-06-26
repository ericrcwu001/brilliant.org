import { test, expect, type Page } from '@playwright/test'

// Basic completion flow for lesson-expected-value-4 in both tracks.
// Mirrors the pattern in e2e/expected-value-1.spec.ts.
// Do NOT run this file during the current wave — it requires the full
// renderer stack (dispatcher wired, app.css @import added by the Lead).

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function primaryClick(page: Page) {
  const p = primaryOf(page)
  await expect(p).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.click({ force: true })
}

async function matchGrid(page: Page, rights: string[]) {
  for (let i = 0; i < rights.length; i++) {
    await page.locator('.retgrid__slot').nth(i).click()
    await page
      .locator('.retgrid__palette')
      .getByRole('button', { name: rights[i], exact: true })
      .click()
  }
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

async function predict(page: Page, name: RegExp) {
  await page.getByRole('radio', { name }).first().click()
  await primaryClick(page)
}

async function primer(page: Page) {
  await primaryClick(page)
}

async function answerEntry(page: Page, values: string[]) {
  const inputs = page.locator('.answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i])
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

// Expand both branches of the conditionalTree, then wait for solve and Continue.
async function conditionalTree(page: Page) {
  await page
    .getByRole('button', { name: /Roll \{1, 2, 3\}/ })
    .click({ force: true })
  await page
    .getByRole('button', { name: /Roll \{4, 5, 6\}/ })
    .click({ force: true })
  // Wait for equation solve animation and Continue button to enable
  await expect(primaryOf(page)).toBeEnabled({ timeout: 5000 })
  await primaryClick(page)
}

async function masteryChallenge(page: Page, values: string[]) {
  const inputs = page.locator('.mastery .answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i])
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

async function recapFinish(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: 'Reveal recap' }).click({ force: true })
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: /^(Finish|Continue)$/ }).click({ force: true })
}

async function completeEV4(page: Page, track: 'A' | 'B') {
  // ev4-recall (retrievalGrid)
  await matchGrid(page, ['6', 'condition on first flip'])
  // ev4-bet (prediction — ungraded; any option advances)
  await predict(page, /About \$7/)
  // ev4-win (answerEntry)
  await answerEntry(page, ['7/4'])
  // ev4-explore (conditionalTree — NEW renderer)
  await conditionalTree(page)
  // ev4-model (primer)
  await primer(page)
  // ev4-firststep (answerEntry)
  await answerEntry(page, ['5+E[X]'])
  // ev4-isolate (primer — Track A only; Track B skips)
  if (track === 'A') {
    await primer(page)
  }
  // ev4-prove (masteryChallenge)
  await masteryChallenge(page, ['7'])
  // ev4-recap
  await recapFinish(page)
  await expect(page.locator('.done-note')).toContainText('Lesson complete')
}

for (const track of ['B', 'A'] as const) {
  test(`EV4 Conditional & Total Expectation is completable (Track ${track})`, async ({ page }) => {
    await page.goto(
      `/dev/lesson/lesson-expected-value-4${track === 'A' ? '?track=A' : ''}`,
    )
    await completeEV4(page, track)
  })
}
