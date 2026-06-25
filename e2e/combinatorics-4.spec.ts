import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-combinatorics-4 (Inclusion–Exclusion)
// at /dev/lesson/lesson-combinatorics-4, in BOTH tracks.
// Tap-only (no drag), reduced-motion-safe.
// DO NOT run this file directly — it requires the full Vite dev server.
//
// Note: l4-explore (vennCounter) routes to ContinueStub in the worktree build.
// The test uses primaryClick for that beat regardless of the actual renderer.

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

// ── Completion script ─────────────────────────────────────────────────────────

async function completeL4Combinatorics(page: Page, track: 'A' | 'B') {
  await primer(page)                                         // l4-primer
  await matchGrid(page, ['multiply', 'add', '2,598,960'])   // l4-recall
  await predict(page, /Just 23/)                            // l4-bet
  await answerEntry(page, ['24'])                           // l4-win
  await primaryClick(page)                                  // l4-explore (vennCounter / ContinueStub)
  await tapAllThenContinue(page, '.triplet__card')          // l4-model
  if (track === 'A') {
    await primaryClick(page)                                // l4-birthday-scaffold (Track A only)
  }
  await answerEntry(page, ['complement'])                   // l4-birthday
  await masteryChallenge(page, ['624', '1/4165'])           // l4-prove
  await recapFinish(page)                                   // l4-recap
  await done(page)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

for (const track of ['B', 'A'] as const) {
  test(`lesson-combinatorics-4 is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-combinatorics-4', track))
    await completeL4Combinatorics(page, track)
  })
}

test('l4-prove mastery challenge requires both fields', async ({ page }) => {
  await page.goto(urlFor('lesson-combinatorics-4', 'B'))
  await primer(page)                                        // l4-primer
  await matchGrid(page, ['multiply', 'add', '2,598,960'])  // l4-recall
  await predict(page, /Just 23/)                           // l4-bet
  await answerEntry(page, ['24'])                          // l4-win
  await primaryClick(page)                                 // l4-explore
  await tapAllThenContinue(page, '.triplet__card')         // l4-model
  await answerEntry(page, ['complement'])                  // l4-birthday

  // Now on l4-prove — Check button enabled only when both fields are filled.
  const inputs = page.locator('.mastery .answer-entry__input')
  const primary = primaryOf(page)

  // One field filled: Check should still be enabled (component enables it regardless).
  await inputs.nth(0).fill('624')
  // Fill second field to complete:
  await inputs.nth(1).fill('1/4165')
  await expect(primary).toBeEnabled()
})
