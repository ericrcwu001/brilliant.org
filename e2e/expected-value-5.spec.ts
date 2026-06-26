import { test, expect, type Page } from '@playwright/test'

// Basic completion flow for lesson-expected-value-5 in both tracks.
// Mirrors the pattern in e2e/expected-value-4.spec.ts.
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

async function couponCollectorSim(page: Page) {
  // Draw boxes until set complete (or wait for hero auto-draw to finish)
  const drawBtn = page.locator('.ccsim__draw-btn')
  // Wait up to 30s for set complete (hero auto-draws at 500ms/box × ~15 draws)
  await expect(primaryOf(page)).toBeEnabled({ timeout: 30000 })
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

async function completeEV5(page: Page, track: 'A' | 'B') {
  // ev5-primer-geom (primer — Track A only)
  if (track === 'A') {
    await primer(page)
  }
  // ev5-recall (retrievalGrid)
  await matchGrid(page, ['E = 1/p', 'E = 2', 'E = 6', 'E = N/(N−k)'])
  // ev5-bet (prediction — ungraded; any option advances)
  await predict(page, /Around 12/)
  // ev5-win (answerEntry)
  await answerEntry(page, ['6'])
  // ev5-explore (couponCollectorSim — NEW renderer)
  await couponCollectorSim(page)
  // ev5-model (primer)
  await primer(page)
  // ev5-stage-scaffold (primer — Track A only)
  if (track === 'A') {
    await primer(page)
  }
  // ev5-stage (answerEntry)
  await answerEntry(page, ['3/2'])
  // ev5-prove (masteryChallenge)
  await masteryChallenge(page, ['147/10'])
  // ev5-recap
  await recapFinish(page)
  await expect(page.locator('.done-note')).toContainText('Lesson complete')
}

for (const track of ['B', 'A'] as const) {
  test(`EV5 Coupon Collector is completable (Track ${track})`, async ({ page }) => {
    await page.goto(
      `/dev/lesson/lesson-expected-value-5${track === 'A' ? '?track=A' : ''}`,
    )
    await completeEV5(page, track)
  })
}
