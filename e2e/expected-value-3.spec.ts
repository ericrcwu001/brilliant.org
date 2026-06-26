import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-expected-value-3 (Indicator Variables)
// at /dev/lesson/lesson-expected-value-3, in both tracks.
// Mirrors the pattern in e2e/expected-value-2.spec.ts.
// Do NOT run automatically — part of the build-wave e2e suite.

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function primaryClick(page: Page) {
  const p = primaryOf(page)
  await expect(p).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.click({ force: true })
}

const primer = (page: Page) => primaryClick(page)

const matchGrid = async (page: Page, rights: string[]) => {
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

const predict = async (page: Page, name: RegExp) => {
  await page.getByRole('radio', { name }).first().click()
  await primaryClick(page)
}

const answerEntry = async (page: Page, values: string[]) => {
  const inputs = page.locator('.answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i])
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

const coinSimDraw = async (page: Page, n: number) => {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: 'Draw card', exact: true }).first().click()
  }
  await primaryClick(page)
}

const masteryChallenge = async (page: Page, values: string[]) => {
  const inputs = page.locator('.mastery .answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i])
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

const recapFinish = async (page: Page) => {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: 'Reveal recap' }).click({ force: true })
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: /^(Finish|Continue)$/ }).click({ force: true })
}

const done = (page: Page) =>
  expect(page.locator('.done-note')).toContainText('Lesson complete')

function urlFor(track: 'A' | 'B') {
  return `/dev/lesson/lesson-expected-value-3${track === 'A' ? '?track=A' : ''}`
}

async function completeEV3(page: Page, track: 'A' | 'B') {
  // ev3-indicator-primer (primer — required:false)
  await primer(page)
  // ev3-recall (retrievalGrid)
  await matchGrid(page, ['i/N', '7/8', 'favorable/total'])
  // ev3-bet (prediction — ungraded; any option advances)
  await predict(page, /Around card 10/)
  // ev3-win (answerEntry)
  await answerEntry(page, ['1/13'])
  // ev3-explore (coinSim biased — draw 3+ then Continue)
  await coinSimDraw(page, 3)
  // ev3-model (primer)
  await primer(page)
  // ev3-scaffold (primer — Track A only)
  if (track === 'A') await primer(page)
  // ev3-count (answerEntry)
  await answerEntry(page, ['11/6'])
  // ev3-prove (masteryChallenge)
  await masteryChallenge(page, ['53/5'])
  // ev3-recap
  await recapFinish(page)
  await done(page)
}

for (const track of ['B', 'A'] as const) {
  test(`EV L3 Indicator Variables is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor(track))
    await completeEV3(page, track)
  })
}
