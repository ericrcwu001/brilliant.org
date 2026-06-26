import { test, expect, type Page } from '@playwright/test'

// E2E completion tests for the Bayes' Rule concept lessons (L1–L3).
// Route: /dev/lesson/:lessonId (Track B, the default — no ?track=A).
// Asserts each lesson loads, the bayesUpdate beats (bars/tree/sequence) render,
// a graded beat accepts a correct answer, and the lesson reaches its end.
//
// NOT autonomously runnable: playwright.config.ts webServer uses `npm run dev`
// which is unavailable in this worktree. Run against a built preview or a
// separately-started dev server. Selectors are verified against BayesUpdateBeat.tsx.

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

const tapAllThenContinue = async (page: Page, selector: string) => {
  const els = page.locator(selector)
  const n = await els.count()
  for (let i = 0; i < n; i++) await els.nth(i).click()
  await primaryClick(page)
}

const lessonDone = (page: Page) =>
  expect(page.locator('.done-note')).toContainText('Lesson complete')

// ── L1: The Update Rule ──────────────────────────────────────────────────────

async function completeBayesL1(page: Page) {
  await page.goto('/dev/lesson/lesson-bayes-rule-1')
  await expect(primaryOf(page)).toBeVisible()

  // 1. recall-prob-split (retrievalGrid)
  await matchGrid(page, ['A split between outcomes — no +1', '+1 on every flip'])

  // 2. open-bet (prediction)
  await predict(page, /More likely the two-headed coin/)

  // [beat 3: name-the-parts primer is track-A-only — not shown in default track B]

  // 4. explore-update (bayesUpdate bars) — assert bars display renders, interact,
  //    then Continue (enabled after first interaction via the range input).
  await expect(page.locator('.bayes-bars')).toBeVisible()
  const barsRange = page.locator('.bayes-bars__range')
  await barsRange.focus()
  await barsRange.press('ArrowLeft')
  await primaryClick(page) // Continue

  // 5. count-the-heads (bayesUpdate tree, graded) — assert icon array renders,
  //    tap the 2 focal icons (population=3, focalCount=2 from posterior 2/3),
  //    Check, Continue.
  await expect(page.locator('.bayes-icons')).toBeVisible()
  const icons = page.locator('.bayes-icons__icon')
  await icons.nth(0).click()
  await icons.nth(1).click()
  await primaryClick(page) // Check
  await primaryClick(page) // Continue

  // 6. compute-posterior (answerEntry)
  await answerEntry(page, ['2/3'])

  // 7. framing-flip (answerEntry, two fields)
  await answerEntry(page, ['1/3', '1/2'])

  // 8. triangulate-23 (tripletReveal) — reveal all 3 cards, then Continue
  await tapAllThenContinue(page, '.triplet__card')

  // 9. mastery-challenge
  await masteryChallenge(page, ['4/5'])

  // 10. recap
  await recapFinish(page)
  await lessonDone(page)
}

// ── L2: The Base-Rate Trap ───────────────────────────────────────────────────

async function completeBayesL2(page: Page) {
  await page.goto('/dev/lesson/lesson-bayes-rule-2')
  await expect(primaryOf(page)).toBeVisible()

  // 1. recall-update (retrievalGrid)
  await matchGrid(page, ['Rescale the prior by the likelihood', 'Starts with a low prior'])

  // 2. open-bet (prediction)
  await predict(page, /Much lower — around 50%/)

  // [beat 3: name-base-rate primer is track-A-only — not shown in default track B]

  // 4. explore-frequencies (bayesUpdate tree, hero) — assert confusion grid
  //    renders, interact with prevalence range, Continue.
  await expect(page.locator('.bayes-tree')).toBeVisible()
  const treeRange = page.locator('.bayes-tree__range')
  await treeRange.focus()
  await treeRange.press('ArrowRight')
  await primaryClick(page) // Continue

  // 5. compute-ppv (answerEntry)
  await answerEntry(page, ['1/2'])

  // 6. ten-heads (answerEntry)
  await answerEntry(page, ['1024/2023'])

  // 7. base-rate-sweep (answerEntry, three fields)
  await answerEntry(page, ['1/2', '11/12', '33/34'])

  // 8. triangulate-half (tripletReveal)
  await tapAllThenContinue(page, '.triplet__card')

  // 9. mastery-challenge
  await masteryChallenge(page, ['19/118'])

  // 10. recap
  await recapFinish(page)
  await lessonDone(page)
}

// ── L3: Stacking Evidence ────────────────────────────────────────────────────

async function completeBayesL3(page: Page) {
  await page.goto('/dev/lesson/lesson-bayes-rule-3')
  await expect(primaryOf(page)).toBeVisible()

  // 1. recall-base-rate (retrievalGrid)
  await matchGrid(page, ['Only 50%', 'What evidence must overcome'])

  // 2. open-bet (prediction)
  await predict(page, /Much higher — near 99%/)

  // [beat 3: posterior-is-prior primer is track-A-only — not shown in default track B]

  // 4. due-vs-evidence (primer, track:both, optional) — advance past it.
  await primer(page)

  // 5. explore-sequence (bayesUpdate sequence, hero) — assert sequence bar renders,
  //    flip 10 times to reach done state (step >= steps), then Continue.
  await expect(page.locator('.bayes-seq')).toBeVisible()
  const flipBtn = page.getByRole('button', { name: /^Flip/ })
  for (let i = 0; i < 10; i++) await flipBtn.click()
  await primaryClick(page) // Continue (enabled once all 10 steps are done)

  // 6. two-tests (answerEntry)
  await answerEntry(page, ['99/100'])

  // 7. coin-ladder (retrievalGrid)
  await matchGrid(page, ['2/3', '4/5', '8/9'])

  // 8. triangulate-k10 (tripletReveal)
  await tapAllThenContinue(page, '.triplet__card')

  // 9. mastery-challenge
  await masteryChallenge(page, ['10'])

  // 10. recap
  await recapFinish(page)
  await lessonDone(page)
}

// ── Specs ─────────────────────────────────────────────────────────────────────

test("Bayes' Rule L1 (The Update Rule) is completable", async ({ page }) => {
  await completeBayesL1(page)
})

test("Bayes' Rule L2 (The Base-Rate Trap) is completable", async ({ page }) => {
  await completeBayesL2(page)
})

test("Bayes' Rule L3 (Stacking Evidence) is completable", async ({ page }) => {
  await completeBayesL3(page)
})
