import { test, expect, type Page } from '@playwright/test'

// Basic completion flow for lesson-expected-value-6 in both tracks.
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

async function predict(page: Page, name: string) {
  await page.getByRole('radio', { name, exact: true }).first().click()
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

async function runAntsSim(page: Page) {
  await page.getByRole('button', { name: 'Run simulation' }).click()
  // Wait for the aria-live mirror to confirm all ants fell off (reduced-motion in CI)
  await expect(page.getByRole('log')).toContainText('All 500 ants', { timeout: 10000 })
  await primaryClick(page) // Continue
}

async function dragSlider(page: Page) {
  const slider = page.locator('.numline__range')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  // For the order-stat slider there is no "Lock" needed — just move and continue
  // (the slider either uses lock or direct continue depending on the beat config)
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

async function completeEV6(page: Page, track: 'A' | 'B') {
  if (track === 'A') await primer(page)                            // ev6-primer (track A)
  await matchGrid(page, ['n!', 'nPk = n!/(n\u2212k)!'])           // ev6-recall
  await predict(page, 'About 1 minute')                            // ev6-bet
  await answerEntry(page, ['2/3', '1/3'])                          // ev6-win
  await runAntsSim(page)                                           // ev6-explore
  await dragSlider(page)                                           // ev6-model
  if (track === 'A') await primer(page)                            // ev6-derive (track A)
  await answerEntry(page, ['1/5'])                                  // ev6-min
  await masteryChallenge(page, ['500/501'])                        // ev6-prove
  await recapFinish(page)                                          // ev6-recap
  await expect(page.locator('.done-note')).toContainText('Lesson complete')
}

for (const track of ['B', 'A'] as const) {
  test(`EV6 Order Statistics & Extremes is completable (Track ${track})`, async ({ page }) => {
    await page.goto(
      `/dev/lesson/lesson-expected-value-6${track === 'A' ? '?track=A' : ''}`,
    )
    await completeEV6(page, track)
  })
}
