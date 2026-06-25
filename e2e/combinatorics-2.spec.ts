import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-combinatorics-2 (Permutations & Combinations)
// at /dev/lesson/lesson-combinatorics-2, in BOTH tracks.
// Tap-only (no drag), reduced-motion-safe.
// DO NOT run this file directly — it requires the full Vite dev server.

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

// Drive the selectionGrid beat: tap k items then submit.
const selectionGrid = async (page: Page, labels: string[], accept: boolean) => {
  for (const label of labels) {
    await page.getByRole('checkbox', { name: label }).click()
  }
  if (accept) {
    await primaryClick(page) // Submit
    await primaryClick(page) // Continue
  } else {
    await primaryClick(page) // Continue (ungraded)
  }
}

// Drive the selectionGrid explore beat: tap items, flip toggle, continue.
const selectionGridExplore = async (page: Page, labels: string[]) => {
  for (const label of labels) {
    await page.getByRole('checkbox', { name: label }).click()
  }
  // Flip the order toggle on and off to observe the count change.
  const toggle = page.getByRole('switch')
  await toggle.click() // OFF
  await toggle.click() // ON
  await primaryClick(page) // Continue
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

async function completeL2Combinatorics(page: Page, track: 'A' | 'B') {
  await primer(page) // l2-primer
  await matchGrid(page, ['6', '24', '120']) // l2-recall
  await predict(page, /the roles version is bigger/) // l2-bet
  // l2-win: tap Anya, Ben, Cara → submit (ordered count = 60)
  await selectionGrid(page, ['Anya', 'Ben', 'Cara'], true)
  if (track === 'A') {
    await primer(page) // l2-scaffold (Track A only)
  }
  // l2-explore: toggle exploration (ungraded)
  await selectionGridExplore(page, ['Anya', 'Ben', 'Cara'])
  // l2-model: tap all three lens cards
  await tapAllThenContinue(page, '.triplet__card')
  // l2-fraction: 1/6 then 5/54
  await answerEntry(page, ['1/6', '5/54'])
  // l2-prove: 24
  await masteryChallenge(page, ['24'])
  // l2-recap
  await recapFinish(page)
  await done(page)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

for (const track of ['B', 'A'] as const) {
  test(`lesson-combinatorics-2 is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-combinatorics-2', track))
    await completeL2Combinatorics(page, track)
  })
}

test('selectionGrid count badge updates when items are tapped (l2-win)', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-combinatorics-2')
  await primer(page) // l2-primer
  await matchGrid(page, ['6', '24', '120']) // l2-recall
  await predict(page, /the roles version is bigger/) // l2-bet

  // Now on l2-win selectionGrid beat.
  const countBadge = page.locator('.sel-grid__count')
  await expect(countBadge).toContainText('—') // nothing selected yet

  await page.getByRole('checkbox', { name: 'Anya' }).click()
  await expect(countBadge).toContainText('—') // only 1 of 3 selected

  await page.getByRole('checkbox', { name: 'Ben' }).click()
  await expect(countBadge).toContainText('—') // only 2 of 3 selected

  await page.getByRole('checkbox', { name: 'Cara' }).click()
  await expect(countBadge).toContainText('60') // 3 of 3 selected → nPk(5,3) = 60
})

test('selectionGrid toggle flips count between 60 and 10 (l2-explore)', async ({
  page,
}) => {
  await page.goto('/dev/lesson/lesson-combinatorics-2')
  await primer(page) // l2-primer
  await matchGrid(page, ['6', '24', '120']) // l2-recall
  await predict(page, /the roles version is bigger/) // l2-bet
  await selectionGrid(page, ['Anya', 'Ben', 'Cara'], true) // l2-win
  // Now on l2-explore.

  const countBadge = page.locator('.sel-grid__count')
  const toggle = page.getByRole('switch')

  await page.getByRole('checkbox', { name: 'Anya' }).click()
  await page.getByRole('checkbox', { name: 'Ben' }).click()
  await page.getByRole('checkbox', { name: 'Cara' }).click()

  // Order ON (default for toggle) → nPk(5,3) = 60
  await expect(countBadge).toContainText('60')

  // Flip order OFF → nCk(5,3) = 10
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await expect(countBadge).toContainText('10')

  // Flip order back ON → 60
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await expect(countBadge).toContainText('60')
})
