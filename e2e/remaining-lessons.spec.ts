import { test, expect, type Page } from '@playwright/test'

// End-to-end completion of the remaining lessons (L2–L6) at /dev/lesson/:lessonId,
// in BOTH tracks, using only DOM/tap interactions (no drag, no canvas hit-testing)
// so each runs across the chromium, mobile (tap-only), and reduced-motion
// projects. This is the build-brief §10 "completable Track A AND B, tap-only,
// reduced-motion" gate for the new lessons.

const primaryOf = (page: Page) => page.locator('.actionbar .btn--primary')

async function primaryClick(page: Page) {
  const p = primaryOf(page)
  await expect(p).toBeEnabled()
  // The sticky action bar can float over the region on short viewports; enabled
  // is already asserted, so force past the hit-test quirk (matches the flagship
  // helper's approach).
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

// Drive a "watch it resolve" sim hero (raceSim / gamblerLedger): click the batch
// "Run N…" action — located by accessible name so it works regardless of which
// action-bar slot/variant it renders in — then the now-enabled Continue/Finish.
const runGhost = async (page: Page) => {
  await page.getByRole('button', { name: /Run \d+/ }).first().click()
  const cont = page.getByRole('button', { name: /^(Continue|Finish)$/ })
  await expect(cont).toBeEnabled()
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await cont.click({ force: true })
}

// The generic (non-flagship) recap is a two-step generate-then-reveal: the
// primary action is "Reveal recap" first, then "Finish" once revealed.
const recapFinish = async (page: Page) => {
  // The generic (non-flagship) recap is a two-step generate-then-reveal sharing
  // one primary slot whose label flips in place: "Reveal recap" -> "Finish".
  // Target each action by its exact label so a click never races the flip.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: 'Reveal recap' }).click({ force: true })
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.getByRole('button', { name: /^(Finish|Continue)$/ }).click({ force: true })
}

const masteryChallenge = async (page: Page, values: string[]) => {
  const inputs = page.locator('.mastery .answer-entry__input')
  for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i])
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

const tapAllThenContinue = async (page: Page, selector: string) => {
  const els = page.locator(selector)
  const n = await els.count()
  for (let i = 0; i < n; i++) await els.nth(i).click()
  await primaryClick(page)
}

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

const eqRows = async (
  page: Page,
  rows: (string | RegExp)[][],
  split: boolean,
) => {
  if (split) await primaryClick(page) // "Now your turn" reveal (Track A)
  // Wait for the palette to settle (avoids racing the per-beat remount).
  await expect(page.locator('.token-row')).toBeVisible()
  for (let r = 0; r < rows.length; r++) {
    const row = page.locator('.eqline--build').nth(r)
    for (let i = 0; i < rows[r].length; i++) {
      const tok = rows[r][i]
      // Slot-first: select the exact (row-scoped) slot, then fill it. Robust to
      // reordered palettes and beat transitions.
      await row.locator('.slot').nth(i).click()
      await page
        .locator('.token-row')
        .getByRole('button', { name: tok, exact: typeof tok === 'string' })
        .click()
    }
  }
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
}

const simulate = async (page: Page, split: boolean) => {
  const flip = page.getByRole('button', { name: 'Flip', exact: true })
  for (let i = 0; i < 12; i++) await flip.click()
  await primaryClick(page) // Continue → start replay
  if (split) await primaryClick(page) // Step → near-miss
  await expect(page.locator('.hint-note--mark').first()).toBeVisible()
  await primaryClick(page) // Continue → advance
}

const done = (page: Page) =>
  expect(page.locator('.done-note')).toContainText('Lesson complete')

// equationTiles palette tokens render as "E" + subscript → accessible name "E n".
const E = (n: number) => new RegExp(`^E\\s*${n}$`)
// stateTap radios render as "<label> E<n>" (e.g. "TH E2"), so match the id suffix.
const Estate = (n: number) => new RegExp(`E${n}$`)

function urlFor(lessonId: string, track: 'A' | 'B') {
  return `/dev/lesson/${lessonId}${track === 'A' ? '?track=A' : ''}`
}

// ── Per-lesson completion scripts (track-agnostic unless noted) ──────────────

async function completeL2(page: Page) {
  await matchGrid(page, ['6', '4', '2']) // recall-6-4
  await primer(page)
  await predict(page, /coin-flip tie/)
  await runGhost(page) // race-the-tie
  await matchGrid(page, ['HH wins', 'HT wins']) // first-step-split
  await answerEntry(page, ['THH']) // pick-your-counter
  await runGhost(page) // race-the-counter
  await primer(page)
  await matchGrid(page, ['No +1, just a split', '+1 every flip']) // win-prob-tiles
  await page.locator('.wheel__options .token').first().click()
  await primaryClick(page) // non-transitive-loop continue
  await masteryChallenge(page, ['HTT', '7/8'])
  await recapFinish(page)
  await done(page)
}

async function completeL3(page: Page) {
  await matchGrid(page, ['Reset to the start', 'HH complete']) // recall-overlap
  await predict(page, /About 50/)
  await primer(page)
  await primaryClick(page) // walk-once (hero)
  await matchGrid(page, ['Broke, game ends', 'Goal, game ends', 'Keep flipping']) // boundary-edge
  await primer(page)
  await eqRows(page, [['0', '1/2', E(3), '1/2', E(1)]], false) // prob-tiles
  await eqRows(page, [['1', '1/2', E(3), '1/2', E(1)]], false) // duration-tiles
  await answerEntry(page, ['1/2', '4']) // guided-solve
  await primaryClick(page) // house-edge (hero)
  await masteryChallenge(page, ['3/10', '21'])
  await recapFinish(page)
  await done(page)
}

async function completeL4(page: Page) {
  await matchGrid(page, ['6', '4', '8', '7/8']) // retrieval-grid opener
  await primer(page)
  await matchGrid(page, ['10', '8', '6']) // which-waits-longest
  await runGhost(page) // race-or-wait (raceSim)
  await matchGrid(page, ['+1 every flip', 'No +1']) // plus-one-or-not
  // weak-node (stateTap on HH): E1 on T -> E0 (reset), E1 on H -> E2 (done).
  await page.locator('.tap-card').nth(0).getByRole('radio', { name: Estate(0) }).click()
  await page.locator('.tap-card').nth(1).getByRole('radio', { name: Estate(2) }).click()
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
  await masteryChallenge(page, ['6', '3/8'])
  await recapFinish(page)
  await done(page)
}

async function completeL5(page: Page, split: boolean) {
  await predict(page, /HTH waits longer/)
  await primaryClick(page) // pattern-pick (passive)
  await primer(page) // transfer-primer
  await simulate(page, split)
  await tapAllThenContinue(page, '.ruler__row') // overlap-ruler
  await primer(page) // overlap-why deep-dive (collapsed)
  // failure-edge: E2 on H → E3, E2 on T → E1.
  await page.locator('.tap-card').nth(0).getByRole('radio', { name: Estate(3) }).click()
  await page.locator('.tap-card').nth(1).getByRole('radio', { name: Estate(1) }).click()
  await primaryClick(page) // Check
  await primaryClick(page) // Continue
  await eqRows(
    page,
    [
      ['1', '1/2', E(2), '1/2', E(1)],
      ['1', '1/2', E(3), '1/2', E(1)],
    ],
    split,
  )
  await answerEntry(page, ['8', '10']) // guided-solve
  await page.getByRole('button', { name: /Run \d+ simulations/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await tapAllThenContinue(page, '.sumtiles__chips .token') // border-sum
  await matchGrid(page, ['Resets further back', 'Keeps a matched H']) // overlap-compare
  await masteryChallenge(page, ['20'])
  await recapFinish(page)
  await done(page)
}

async function completeL6(page: Page) {
  await matchGrid(page, ['6', '4', '8', '10'])
  await tapAllThenContinue(page, '.ruler__row') // self-overlap
  await primer(page) // exponent-primer
  await tapAllThenContinue(page, '.sumtiles__chips .token') // sum-it
  await runGhost(page) // martingale (gamblerLedger)
  await tapAllThenContinue(page, '.sumtiles__chips .token') // apply-THH
  await tapAllThenContinue(page, '.sumtiles__chips .token') // apply-HTH
  await tapAllThenContinue(page, '.triplet__card') // triangulation
  await masteryChallenge(page, ['30'])
  await recapFinish(page)
  await done(page)
}

for (const track of ['B', 'A'] as const) {
  test(`L2 Penney's is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-penneys-game', track))
    await completeL2(page)
  })
  test(`L3 Gambler's Ruin is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-gamblers-ruin', track))
    await completeL3(page)
  })
  test(`L4 Mixed Review is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-states-streaks', track))
    await completeL4(page)
  })
  test(`L5 Longer Patterns is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-longer-patterns', track))
    await completeL5(page, track === 'A')
  })
  test(`L6 Overlap Shortcut is completable (Track ${track})`, async ({ page }) => {
    await page.goto(urlFor('lesson-overlap-shortcut', track))
    await completeL6(page)
  })
}

test('L0 First Heads is completable at the dev route', async ({ page }) => {
  await page.goto('/dev/lesson/lesson-first-heads')
  await predict(page, /About 2/)
  await primer(page) // ½ primer
  await simulate(page, false) // count-by-hand coinSim (single-letter H: graceful replay)
  await primer(page) // average primer
  await answerEntry(page, ['2']) // l0-count
  await done(page)
})
