import { test, expect, type Page } from '@playwright/test'

// Basic completion flow for lesson-expected-value-1 in both tracks.
// Mirrors the pattern in e2e/remaining-lessons.spec.ts.
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

// Tap all 6 outcome circles on the expectationScale beam, then Continue.
async function tapBeamOutcomes(page: Page) {
  for (const label of ['1', '2', '3', '4', '5', '6']) {
    await page
      .getByRole('button', { name: new RegExp(`Outcome ${label}`) })
      .click()
  }
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

async function completeEV1(page: Page, track: 'A' | 'B') {
  // ev1-recall (retrievalGrid)
  await matchGrid(page, ['E[H] = 2', '1/2'])
  // ev1-bet (prediction — ungraded; any option advances)
  await predict(page, /good deal/)
  // ev1-primer (primer)
  await primer(page)
  // ev1-win (answerEntry)
  await answerEntry(page, ['7/2'])
  // ev1-explore (expectationScale — NEW renderer)
  await tapBeamOutcomes(page)
  // ev1-model (primer)
  await primer(page)
  // ev1-deepen (theorySimChart — Track A only; Track B skips)
  if (track === 'A') {
    await primaryClick(page)
  }
  // ev1-pmf (answerEntry, 2 fields)
  await answerEntry(page, ['1/9', '5'])
  // ev1-prove (masteryChallenge)
  await masteryChallenge(page, ['7'])
  // ev1-recap
  await recapFinish(page)
  await expect(page.locator('.done-note')).toContainText('Lesson complete')
}

for (const track of ['B', 'A'] as const) {
  test(`EV1 What is Expected Value? is completable (Track ${track})`, async ({ page }) => {
    await page.goto(
      `/dev/lesson/lesson-expected-value-1${track === 'A' ? '?track=A' : ''}`,
    )
    await completeEV1(page, track)
  })
}
