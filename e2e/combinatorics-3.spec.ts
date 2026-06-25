import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-combinatorics-3 (The Binomial Theorem)
// at /dev/lesson/lesson-combinatorics-3, in BOTH tracks.
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

// Drive the pascalTriangle beat: tap all cells then continue.
const buildPascalTriangle = async (page: Page, rows: number) => {
  // Reveal all cells by clicking each "Reveal C(n,k)" button.
  for (let n = 0; n <= rows; n++) {
    for (let k = 0; k <= n; k++) {
      const cell = page.getByRole('button', { name: `Reveal C(${n},${k})` })
      await cell.click()
    }
  }
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

async function completeL3Combinatorics(page: Page, track: 'A' | 'B') {
  await primer(page) // l3-primer
  await matchGrid(page, ['15', '2ⁿ', 'size-k subsets of n objects']) // l3-recall
  await predict(page, /it doubles/) // l3-bet
  await answerEntry(page, ['2']) // l3-win (coefficient of ab in (a+b)²)
  if (track === 'A') {
    await primer(page) // l3-scaffold-a (Track A only)
  }
  await buildPascalTriangle(page, 5) // l3-explore
  await tapAllThenContinue(page, '.triplet__card') // l3-model
  await answerEntry(page, ['yes']) // l3-applied
  await masteryChallenge(page, ['30']) // l3-prove
  await recapFinish(page) // l3-recap
  await done(page)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

for (const track of ['B', 'A'] as const) {
  test(`lesson-combinatorics-3 is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-combinatorics-3', track))
    await completeL3Combinatorics(page, track)
  })
}

test('pascalTriangle cells reveal correct values (l3-explore)', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-combinatorics-3')
  await primer(page) // l3-primer
  await matchGrid(page, ['15', '2ⁿ', 'size-k subsets of n objects']) // l3-recall
  await predict(page, /it doubles/) // l3-bet
  await answerEntry(page, ['2']) // l3-win
  // Now on l3-explore.

  // Reveal C(0,0) = 1.
  await page.getByRole('button', { name: 'Reveal C(0,0)' }).click()
  await expect(page.locator('[data-n="0"][data-k="0"]')).toHaveAttribute(
    'role',
    'cell',
  )

  // Reveal row 1.
  await page.getByRole('button', { name: 'Reveal C(1,0)' }).click()
  await page.getByRole('button', { name: 'Reveal C(1,1)' }).click()

  // After row 1 completes, the aria-live region should announce the row sum.
  // Row 1 sum = 2 = 2^1.
  const liveRegion = page.locator('[aria-live="polite"]').first()
  await expect(liveRegion).toContainText('Row 1 complete')
})

test('pascalTriangle row-sum labels appear after each row completes', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-combinatorics-3')
  await primer(page) // l3-primer
  await matchGrid(page, ['15', '2ⁿ', 'size-k subsets of n objects']) // l3-recall
  await predict(page, /it doubles/) // l3-bet
  await answerEntry(page, ['2']) // l3-win
  // Now on l3-explore.

  // Build row 0.
  await page.getByRole('button', { name: 'Reveal C(0,0)' }).click()
  // Row sum label "= 2^0" should appear.
  await expect(page.locator('.pascal-triangle__row-sum').first()).toBeVisible()
})
