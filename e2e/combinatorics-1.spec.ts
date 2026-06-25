import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of lesson-combinatorics-1 (The Counting Principle) at
// /dev/lesson/lesson-combinatorics-1, in Track A and Track B. All interactions
// are tap-only (no drag). Mirrors the pattern from remaining-lessons.spec.ts.

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function primaryClick(page: Page) {
  const p = primaryOf(page)
  await expect(p).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.click({ force: true })
}

// Drive a retrievalGrid beat: click each left slot then its matching right value.
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

// Drive a prediction beat: tap one option chip then Continue.
async function predict(page: Page, name: RegExp) {
  await page.getByRole('radio', { name }).first().click()
  await primaryClick(page)
}

// Drive a primer beat (just Continue).
const primer = (page: Page) => primaryClick(page)

// Expand all levels of a countingTree beat then Continue (ungraded).
async function expandTree(page: Page, levelCount: number) {
  const btns = page.locator('.counting-tree__expand-btn:not(:disabled)')
  for (let i = 0; i < levelCount; i++) {
    await btns.first().click()
  }
  await primaryClick(page)
}

// Expand all levels then type and submit the graded answer.
async function expandTreeAndAnswer(page: Page, levelCount: number, answer: string) {
  const btns = page.locator('.counting-tree__expand-btn:not(:disabled)')
  for (let i = 0; i < levelCount; i++) {
    await btns.first().click()
  }
  await page.locator('.counting-tree__input').fill(answer)
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

// Drive an answerEntry beat.
async function answerEntry(page: Page, value: string) {
  await page.locator('.answer-entry__input').first().fill(value)
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

// Drive the masteryChallenge beat.
async function masteryChallenge(page: Page, value: string) {
  await page.locator('.mastery .answer-entry__input').first().fill(value)
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

// Drive the recap closer.
async function recapFinish(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: 'Reveal recap' }).click({ force: true })
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: /^(Finish|Continue)$/ }).click({ force: true })
}

const done = (page: Page) =>
  expect(page.locator('.done-note')).toContainText('Lesson complete')

function urlFor(lessonId: string, track: 'A' | 'B') {
  return `/dev/lesson/${lessonId}${track === 'A' ? '?track=A' : ''}`
}

// ── Lesson completion scripts ──────────────────────────────────────────────

async function completeC1(page: Page, track: 'A' | 'B') {
  // Beat 1: l1-recall (retrievalGrid — match flips→outcomes)
  await matchGrid(page, ['2', '4', '8'])

  // Beat 2: l1-bet (prediction — pick "About 1,024")
  await predict(page, /About 1,024/)

  // Beat 3: l1-primer (primer — Continue)
  await primer(page)

  // Beat 4: l1-win (countingTree graded — expand 3 levels, type 8)
  await expandTreeAndAnswer(page, 3, '8')

  // Beat 5: l1-scaffold (Track A only — countingTree ungraded, 4 levels)
  if (track === 'A') {
    await expandTree(page, 4)
  }

  // Beat 6: l1-explore (countingTree ungraded, 3 levels)
  await expandTree(page, 3)

  // Beat 7: l1-multadd (answerEntry)
  await answerEntry(page, '27')

  // Beat 8: l1-model (countingTree ungraded, 3 levels)
  await expandTree(page, 3)

  // Beat 9: l1-prove (masteryChallenge)
  await masteryChallenge(page, '48228180')

  // Beat 10: l1-recap
  await recapFinish(page)

  await done(page)
}

for (const track of ['B', 'A'] as const) {
  test(`Counting Principle is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-combinatorics-1', track))
    await completeC1(page, track)
  })
}
