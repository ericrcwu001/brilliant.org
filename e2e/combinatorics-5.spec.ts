import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-combinatorics-5 (The Pigeon Hole Principle)
// at /dev/lesson/lesson-combinatorics-5, in BOTH tracks.
// Tap-only (no drag), reduced-motion-safe.
// DO NOT run this file directly — it requires the full Vite dev server.
//
// Note: l5-explore and l5-scaffold (pigeonholeBoard) route to ContinueStub in
// the worktree build. The test uses primaryClick for those beats.

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

const tapAllThenContinue = async (page: Page, selector: string) => {
  const els = page.locator(selector)
  const n = await els.count()
  for (let i = 0; i < n; i++) await els.nth(i).click()
  await primaryClick(page)
}

const done = (page: Page) =>
  expect(page.locator('.done-note')).toContainText('Lesson complete')

function urlFor(lessonId: string, track: 'A' | 'B') {
  return `/dev/lesson/${lessonId}${track === 'A' ? '?track=A' : ''}`
}

async function completeL5Combinatorics(page: Page, track: 'A' | 'B') {
  await matchGrid(page, ['multiply', '2,598,960', 'some color repeats']) // l5-recall
  await predict(page, /4 socks/)                                          // l5-bet
  await primer(page)                                                       // l5-primer
  await answerEntry(page, ['4'])                                           // l5-win
  await primaryClick(page)                                                 // l5-explore (pigeonholeBoard / ContinueStub)
  if (track === 'A') {
    await primaryClick(page)                                               // l5-scaffold (Track A only)
  }
  await tapAllThenContinue(page, '.triplet__card')                         // l5-model
  await answerEntry(page, ['25', 'yes'])                                   // l5-apply
  await masteryChallenge(page, ['3'])                                      // l5-prove
  await recapFinish(page)                                                  // l5-recap
  await done(page)
}

for (const track of ['B', 'A'] as const) {
  test(`lesson-combinatorics-5 is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-combinatorics-5', track))
    await completeL5Combinatorics(page, track)
  })
}

test('l5-prove mastery challenge accept "3"', async ({ page }) => {
  await page.goto(urlFor('lesson-combinatorics-5', 'B'))
  await matchGrid(page, ['multiply', '2,598,960', 'some color repeats']) // l5-recall
  await predict(page, /4 socks/)                                          // l5-bet
  await primer(page)                                                       // l5-primer
  await answerEntry(page, ['4'])                                           // l5-win
  await primaryClick(page)                                                 // l5-explore
  await tapAllThenContinue(page, '.triplet__card')                         // l5-model
  await answerEntry(page, ['25', 'yes'])                                   // l5-apply

  const inputs = page.locator('.mastery .answer-entry__input')
  const primary = primaryOf(page)
  await inputs.nth(0).fill('3')
  await expect(primary).toBeEnabled()
})
