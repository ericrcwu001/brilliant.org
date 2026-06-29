import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Lightweight end-to-end coverage for the six course-options lessons at
// /dev/lesson/lesson-options-N (the auth/Firebase-free dev harness). Each lesson:
//   1. renders (the lesson shell + progress rail appear, not the not-found fallback),
//   2. advances (the cold retrieval opener completes and the rail moves forward),
//   3. grades an answer (the graded retrievalGrid recall — and, for L1/L4, a graded
//      answerEntry type-in — accept the engine-exact answer with no wrong-feedback).
// Data-driven: the recall pairs are read from the bundled fixture, so the walk
// adapts to the authored copy. Full per-beat completion lives in the unit/engine
// cross-checks (validate-fixtures §3h/§6d) — this is the render+advance+grade net.
// DO NOT run directly — requires the Vite server (see playwright.config webServer).

const FIXTURE_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

type Field = { id: string; accept: string[] }
type Beat = {
  beatId: string
  interaction: { type: string; pairs?: { left: string; right: string }[]; fields?: Field[] }
}
type Fixture = { lessonId: string; beats: Beat[] }

function load(n: number): Fixture {
  return JSON.parse(readFileSync(`${FIXTURE_DIR}/lesson-options-${n}.json`, 'utf8')) as Fixture
}

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function primaryClick(page: Page) {
  const p = primaryOf(page)
  await expect(p).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await p.click({ force: true })
}

// Drive a retrievalGrid: tap slot i, then the palette card whose label is the
// i-th pair's `right`. Duplicate right-values (e.g. L3's two "30"s) are fine —
// any card with that text is a correct match for that slot; `.first()` avoids a
// strict-mode violation and matched cards are consumed.
async function matchGrid(page: Page, rights: string[]) {
  for (let i = 0; i < rights.length; i++) {
    await page.locator('.retgrid__slot').nth(i).click()
    await page
      .locator('.retgrid__palette')
      .getByRole('button', { name: rights[i]!, exact: true })
      .first()
      .click()
  }
  await primaryClick(page) // Check
  await expect(page.locator('.feedback--wrong')).toHaveCount(0) // graded correct
  await primaryClick(page) // Continue
}

async function predictFirst(page: Page) {
  await page.getByRole('radio').first().click()
  await primaryClick(page)
}

async function answerEntry(page: Page, values: string[]) {
  const inputs = page.locator('.answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]!)
  await primaryClick(page) // Check
  await expect(page.locator('.feedback--wrong')).toHaveCount(0) // graded correct
  await primaryClick(page) // Continue
}

const firstOf = (beats: Beat[], type: string) => beats.find((b) => b.interaction.type === type)

for (const n of [1, 2, 3, 4, 5, 6] as const) {
  test(`lesson-options-${n}: renders, advances, and grades the recall`, async ({ page }) => {
    const fx = load(n)
    await page.goto(`/dev/lesson/lesson-options-${n}`)

    // 1. Renders (shell + rail, not the "Lesson not found" fallback).
    await expect(page.locator('.rail')).toBeVisible()
    await expect(page.locator('.rail__seg--current')).toHaveCount(1)
    await expect(page.locator('.rail__seg--complete')).toHaveCount(0)

    // 2/3. Advance + grade the cold retrieval opener (rights read from the fixture).
    const recall = firstOf(fx.beats, 'retrievalGrid')!
    await matchGrid(page, recall.interaction.pairs!.map((p) => p.right))

    // The rail moved forward — at least the opener is now complete.
    await expect(page.locator('.rail__seg--complete')).not.toHaveCount(0)
  })
}

// Deeper graded type-in checks on the two answerEntry "win" beats (L1 payoff read,
// L4 the marquee risk-neutral q). Walk recall → bet → explore → primer → win.
for (const n of [1, 4] as const) {
  test(`lesson-options-${n}: graded answerEntry win accepts the engine answer`, async ({ page }) => {
    const fx = load(n)
    await page.goto(`/dev/lesson/lesson-options-${n}`)
    await expect(page.locator('.rail')).toBeVisible()

    await matchGrid(page, firstOf(fx.beats, 'retrievalGrid')!.interaction.pairs!.map((p) => p.right))
    await predictFirst(page) // ungraded opening bet
    await primaryClick(page) // optionBoard explore (Continue)
    await primaryClick(page) // primer model card (Continue)

    const win = firstOf(fx.beats, 'answerEntry')!
    await answerEntry(page, win.interaction.fields!.map((f) => f.accept[0]!))
  })
}
