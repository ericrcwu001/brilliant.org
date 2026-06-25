import { type Page, expect } from '@playwright/test'

// Drives the flagship lesson end-to-end using only DOM/tap interactions (no drag,
// no canvas hit-testing) so it works across the chromium, mobile (tap-only), and
// reduced-motion projects. Asserts the design-system CTA "enabled when" gates at
// each beat as it goes, so a single run is also a broad O1 functional check.

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function clickPrimary(page: Page, label: string) {
  const primary = primaryOf(page)
  // Assert the CTA gate (label + enabled) — this IS the O1 "enabled when" check.
  await expect(primary).toHaveText(label)
  await expect(primary).toBeEnabled()
  // The button is verified reachable, but Playwright re-scrolls the sticky bar
  // during its pre-click actionability pass, transiently floating it over the
  // palette on short viewports. Since enabled+visible are already asserted, force
  // past that hit-test quirk rather than masking it with retries.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await primary.click({ force: true })
}

// State tiles (E0/E1/E2) render `E` + <sub>n</sub>, so their accessible name is
// "E 0" (with a space); pass a regex for those. const/prob tiles use exact text.
async function placeTile(page: Page, token: string | RegExp, slotIdx: number) {
  await page
    .locator('.token-row')
    .getByRole('button', { name: token, exact: typeof token === 'string' })
    .click()
  await page.locator('.eqline--build .slot').nth(slotIdx).click()
}

export async function completeLesson(page: Page) {
  const primary = primaryOf(page)
  await page.goto('/dev/lesson')

  // 1 open-bet (prediction): Continue gated until a choice is made.
  await expect(primary).toBeDisabled()
  await page.getByRole('radio', { name: /Waiting for HH takes longer/ }).click()
  await clickPrimary(page, 'Continue')

  // 2 pattern-pick (compare): Continue always enabled.
  await clickPrimary(page, 'Continue')

  // 3 simulate (coinSim): flip past the gate, run the scripted near-miss replay.
  const flip = page.getByRole('button', { name: 'Flip', exact: true })
  for (let i = 0; i < 12; i++) await flip.click()
  await expect(primary).toHaveText('Continue') // gate met -> Flip swaps to Continue
  await primary.click() // starts the guided replay
  await expect(page.locator('.hint-note--mark')).toBeVisible() // replay reached the near-miss
  await clickPrimary(page, 'Continue')

  // 4 failure-edge (stateTap): E1 on T -> E0 (reset), E1 on H -> E2 (advance).
  const cards = page.locator('.tap-card')
  await cards.nth(0).getByRole('radio', { name: /E0/ }).click()
  await cards.nth(1).getByRole('radio', { name: /E2/ }).click()
  await clickPrimary(page, 'Check')
  await clickPrimary(page, 'Continue')

  // 5 equation-tiles: build E1 = 1 + 1/2 E2 + 1/2 E0.
  await placeTile(page, '1', 0)
  await placeTile(page, '1/2', 1)
  await placeTile(page, /^E\s*2$/, 2)
  await placeTile(page, '1/2', 3)
  await placeTile(page, /^E\s*0$/, 4)
  await clickPrimary(page, 'Check')
  await clickPrimary(page, 'Continue')

  // 6 refine-prediction (slider): keyboard-drive the range (works on all projects).
  const range = page.locator('.numline__range')
  await range.focus()
  await range.press('Home')
  for (let i = 0; i < 4; i++) await range.press('ArrowRight')
  await clickPrimary(page, 'Lock prediction')
  await clickPrimary(page, 'Continue')

  // 7 guided-solve (balanceSolve): drive the range to balance at 6, then continue.
  // Domain: min=0 max=12 step=1; Home→0, 6×ArrowRight→6 (the balance point).
  const balanceRange = page.locator('.balance__range')
  await balanceRange.focus()
  await balanceRange.press('Home')
  for (let i = 0; i < 6; i++) await balanceRange.press('ArrowRight')
  await clickPrimary(page, 'Continue')

  // 8 theory-vs-sim: run a batch, then continue (secondary while running / primary in reduced motion).
  await page.getByRole('button', { name: /Run \d+ simulations/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  // 9 overlap: narrative, Continue always enabled.
  await clickPrimary(page, 'Continue')

  // 10 bias-sandbox (Extension): never blocks completion.
  await clickPrimary(page, 'Continue')

  // 11 recap: reconstruct the cause, then Finish.
  await page.getByRole('radio', { name: /near-miss resets HH/ }).click()
  await clickPrimary(page, 'Finish')

  await expect(page.locator('.done-note')).toContainText('Lesson complete')
}

// Track A (the inclusive, scaffolded path): same lesson with the additive
// primers + name-the-overlap, the split (segmented) simulate, the staged/faded
// equation build, and the interactive overlap comparison. Drives /dev/lesson
// with ?track=A. Tap-only + reduced-motion safe like the Track-B helper.
export async function completeLessonTrackA(page: Page) {
  const primary = primaryOf(page)
  await page.goto('/dev/lesson?track=A')

  // open-bet
  await expect(primary).toBeDisabled()
  await page.getByRole('radio', { name: /Waiting for HH takes longer/ }).click()
  await clickPrimary(page, 'Continue')

  // pattern-pick, then the two prerequisite primers (Track A)
  await clickPrimary(page, 'Continue') // pattern-pick
  await clickPrimary(page, 'Continue') // primer: ½
  await clickPrimary(page, 'Continue') // primer: state
  await clickPrimary(page, 'Continue') // primer: graph

  // simulate (split): graph visible from load -> gate -> single-step replay
  const flip = page.getByRole('button', { name: 'Flip', exact: true })
  for (let i = 0; i < 12; i++) await flip.click()
  await expect(primary).toHaveText('Continue')
  await primary.click() // begin the single-stepped replay
  await clickPrimary(page, 'Step')
  // The near-miss annotation always appears in the done state (a gambler's-
  // fallacy note may also be present, so target this one specifically).
  await expect(
    page.locator('.hint-note--mark', { hasText: 'Near-miss' }),
  ).toBeVisible()
  await clickPrimary(page, 'Continue')

  // failure-edge
  const cards = page.locator('.tap-card')
  await cards.nth(0).getByRole('radio', { name: /E0/ }).click()
  await cards.nth(1).getByRole('radio', { name: /E2/ }).click()
  await clickPrimary(page, 'Check')
  await clickPrimary(page, 'Continue')

  // name-the-overlap (Track A reflection primer)
  await clickPrimary(page, 'Continue')

  // equation-tiles (split + faded): reveal the build, then fill only the last term.
  await clickPrimary(page, 'Now your turn')
  await placeTile(page, /^E\s*0$/, 4)
  await clickPrimary(page, 'Check')
  await clickPrimary(page, 'Continue')

  // ground-ev (EV grounding primer): Continue is always enabled.
  await clickPrimary(page, 'Continue')

  // refine-prediction (slider)
  const range = page.locator('.numline__range')
  await range.focus()
  await range.press('Home')
  for (let i = 0; i < 4; i++) await range.press('ArrowRight')
  await clickPrimary(page, 'Lock prediction')
  await clickPrimary(page, 'Continue')

  // guided-solve (balanceSolve): drive the range to balance at 6, then continue.
  const balanceRange = page.locator('.balance__range')
  await balanceRange.focus()
  await balanceRange.press('Home')
  for (let i = 0; i < 6; i++) await balanceRange.press('ArrowRight')
  await clickPrimary(page, 'Continue')

  // theory-vs-sim
  await page.getByRole('button', { name: /Run \d+ simulations/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()

  // overlap (split): tap the pattern whose near-miss keeps progress (HT).
  await page.locator('.overlap__tap .statechip', { hasText: 'HT' }).click()
  await clickPrimary(page, 'Check')
  await clickPrimary(page, 'Continue')

  // bias-sandbox (Extension)
  await clickPrimary(page, 'Continue')

  // recap
  await page.getByRole('radio', { name: /near-miss resets HH/ }).click()
  await clickPrimary(page, 'Finish')

  await expect(page.locator('.done-note')).toContainText('Lesson complete')
}
