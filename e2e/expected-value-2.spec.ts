import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-expected-value-2 (Linearity of Expectation)
// at /dev/lesson/lesson-expected-value-2, in BOTH tracks, using only DOM/tap
// interactions so each runs across chromium, mobile (tap-only), and
// reduced-motion projects. Mirrors the pattern in remaining-lessons.spec.ts.
// Do NOT run automatically — part of the build-wave e2e suite.

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function primaryClick(page: Page) {
  const p = primaryOf(page)
  await expect(p).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.click({ force: true })
}

const answerEntry = async (page: Page, values: string[]) => {
  const inputs = page.locator('.answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i])
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

const predict = async (page: Page, name: RegExp) => {
  await page.getByRole('radio', { name }).first().click()
  await primaryClick(page) // Continue
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

// Step through the noodleLoops chart until Continue/Finish appears.
const stepThroughNoodles = async (page: Page) => {
  const stepBtn = page.getByRole('button', { name: 'Step', exact: true })
  // Step through all 100 ties is slow; instead drive to completion via the
  // primary action which flips to Continue after the final step.
  while (await stepBtn.isVisible()) {
    await stepBtn.click()
  }
  await primaryClick(page)
}

const tapAllThenContinue = async (page: Page, selector: string) => {
  const els = page.locator(selector)
  const n = await els.count()
  for (let i = 0; i < n; i++) await els.nth(i).click()
  await primaryClick(page)
}

const done = (page: Page) =>
  expect(page.locator('.done-note')).toContainText('Lesson complete')

function urlFor(track: 'A' | 'B') {
  return `/dev/lesson/lesson-expected-value-2${track === 'A' ? '?track=A' : ''}`
}

async function completeEV2(page: Page, track: 'A' | 'B') {
  await matchGrid(page, ['0', '0'])               // ev2-recall
  await predict(page, /Just a handful/)           // ev2-bet
  await answerEntry(page, ['7'])                  // ev2-win
  await stepThroughNoodles(page)                  // ev2-explore (noodleLoops)
  await tapAllThenContinue(page, '.triplet__card') // ev2-model
  await primer(page)                              // ev2-sum-primer
  if (track === 'A') await primer(page)           // ev2-tie-scaffold (Track A only)
  await answerEntry(page, ['4/3'])                // ev2-noodles
  await masteryChallenge(page, ['23/15'])         // ev2-prove
  await recapFinish(page)                         // ev2-recap
  await done(page)
}

for (const track of ['B', 'A'] as const) {
  test(`EV L2 Linearity of Expectation is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor(track))
    await completeEV2(page, track)
  })
}
