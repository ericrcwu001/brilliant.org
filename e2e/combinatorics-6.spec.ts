import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-combinatorics-6 (Counting Probabilities)
// at /dev/lesson/lesson-combinatorics-6, in BOTH tracks.
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

const predict = async (page: Page, name: string) => {
  await page.getByRole('radio', { name, exact: true }).first().click()
  await primaryClick(page)
}

const answerEntry = async (page: Page, values: string[]) => {
  const inputs = page.locator('.answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]!)
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

// Tap all chips in a probabilityCounter beat and continue.
const tapAllChips = async (page: Page) => {
  const chips = page.locator('.prob-counter__chip')
  const n = await chips.count()
  for (let i = 0; i < n; i++) await chips.nth(i).click()
  await primaryClick(page) // Continue
}

// Rank two hands by tapping them in the correct order (rarest first).
const rankHands = async (page: Page, orderedLabels: string[]) => {
  for (const label of orderedLabels) {
    await page.locator('.hand-ranker__card').filter({ hasText: label }).click()
  }
  // Auto-submits when all placed; wait for feedback then continue.
  await primaryClick(page) // Continue (after correct)
}

const masteryChallenge = async (page: Page, values: string[]) => {
  const inputs = page.locator('.mastery .answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]!)
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

async function completeL6Combinatorics(page: Page, track: 'A' | 'B') {
  await primer(page) // l6-primer
  await matchGrid(page, ['1/4165', '5/54', 'favorable ÷ total']) // l6-recall
  await predict(page, 'Four-of-a-kind → full house → two pairs') // l6-bet (correct option)
  await answerEntry(page, ['1/4165']) // l6-win
  await tapAllChips(page) // l6-explore (probabilityCounter)
  await tapAllThenContinue(page, '.triplet__card') // l6-model
  await rankHands(page, ['Four of a kind', 'Full house']) // l6-rank (rarestFirst)
  if (track === 'A') {
    await tapAllChips(page) // l6-pairs-scaffold (Track A only)
  }
  await masteryChallenge(page, ['123552', '198/4165']) // l6-prove
  await recapFinish(page) // l6-recap
  await done(page)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

for (const track of ['B', 'A'] as const) {
  test(`lesson-combinatorics-6 is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-combinatorics-6', track))
    await completeL6Combinatorics(page, track)
  })
}

test('probabilityCounter chips build the correct product (l6-explore)', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-combinatorics-6')
  await primer(page) // l6-primer
  await matchGrid(page, ['1/4165', '5/54', 'favorable ÷ total']) // l6-recall
  await predict(page, 'Four-of-a-kind → full house → two pairs') // l6-bet
  await answerEntry(page, ['1/4165']) // l6-win
  // Now on l6-explore.

  // Tap the first chip and check the live region updates.
  await page.locator('.prob-counter__chip').first().click()
  const liveRegion = page.locator('[aria-live="polite"]').first()
  await expect(liveRegion).toContainText('Favorable')
})

test('handRanker places cards in the correct ranked slots (l6-rank)', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-combinatorics-6')
  await primer(page)
  await matchGrid(page, ['1/4165', '5/54', 'favorable ÷ total'])
  await predict(page, 'Four-of-a-kind → full house → two pairs')
  await answerEntry(page, ['1/4165'])
  await tapAllChips(page) // l6-explore
  await tapAllThenContinue(page, '.triplet__card') // l6-model
  // Now on l6-rank.

  // Tap four-of-a-kind first (rarest), then full house.
  await page.locator('.hand-ranker__card').filter({ hasText: 'Four of a kind' }).click()
  // First slot should now be filled.
  await expect(page.locator('.hand-ranker__slot').first()).toContainText('Four of a kind')
})
