import { test, expect } from '@playwright/test'

// Concept Catalog e2e acceptance spec.
//
// ── HOW TO RUN ────────────────────────────────────────────────────────────────
//
// Group A: '/path redirects to /' — runs today against the unauthenticated SPA
//   with just `npm run dev` (no emulator).  The auth guard redirects every
//   unauthenticated visitor from /path to /.
//
// Group B: the four catalog tests under test.describe.skip — target a
//   /dev/catalog dev-harness route that does NOT exist yet.  Before enabling
//   these tests:
//
//   1.  Create src/pages/DevCatalogPage.tsx (mirror DevHomePage.tsx) that
//       renders <ConceptCatalog> with the committed fixture courses + a mock
//       ProgressMap and Streak, using a navigate stub that performs real
//       window.history.pushState so the URL tests work.
//   2.  Wire it into DevRoutes.tsx:
//         if (path === '/dev/catalog') return <DevCatalogPage />
//   3.  Remove the `test.describe.skip` wrapper below and run:
//         npx playwright test e2e/concept-catalog.spec.ts
//
//   The fixture must include at least one live concept and at least one
//   coming_soon concept so all assertions below can find their targets.
//
// ── CSS class / ARIA contract (asserted here) ─────────────────────────────────
//   .ergo-resume-hero                  — resume hero section
//   .ergo-shelf                        — domain shelf (one per DomainSection)
//   main[aria-label="Concepts"]        — catalog main landmark
//   .ergo-concept-card                 — every concept card (live + coming_soon)
//   .ergo-concept-card--coming-soon    — modifier for coming_soon cards
//   [aria-disabled="true"]             — coming_soon card attribute

// ── Redirect (no auth / emulator needed) ─────────────────────────────────────

test('/path redirects to / for unauthenticated visitors', async ({ page }) => {
  // The SPA auth guard treats /path as a protected route and bounces
  // unauthenticated users to the landing page (/).
  await page.goto('/path')
  await expect(page).toHaveURL('/')
})

// ── Catalog rendering + interactions (requires /dev/catalog harness) ──────────

test.describe.skip('concept catalog dev harness — /dev/catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/catalog')
  })

  test('renders the catalog main landmark, resume hero, and at least one shelf', async ({
    page,
  }) => {
    await expect(page.locator('main[aria-label="Concepts"]')).toBeVisible()
    // Resume hero: present when at least one live concept exists in the fixture.
    await expect(page.locator('.ergo-resume-hero')).toBeVisible()
    // At least one domain shelf rendered.
    const shelfCount = await page.locator('.ergo-shelf').count()
    expect(shelfCount).toBeGreaterThanOrEqual(1)
  })

  test('clicking a live concept card navigates to /concept/:conceptId', async ({
    page,
  }) => {
    // Target the first live (non-coming-soon) card.
    const liveCard = page
      .locator('.ergo-concept-card:not(.ergo-concept-card--coming-soon)')
      .first()
    await expect(liveCard).toBeVisible()
    await liveCard.click()
    // The SPA router should push /concept/<id> into history.
    await expect(page).toHaveURL(/^\/concept\/[^/]+$/)
  })

  test('coming-soon card is aria-disabled and does not navigate on click', async ({
    page,
  }) => {
    const comingSoonCard = page.locator('.ergo-concept-card--coming-soon').first()
    await expect(comingSoonCard).toBeVisible()
    // Accessibility contract: aria-disabled="true" (set in ConceptCardItem).
    await expect(comingSoonCard).toHaveAttribute('aria-disabled', 'true')

    const urlBefore = page.url()
    // Force the click to bypass Playwright's hit-testing (the card has no
    // pointer-events guard; the JS handler is simply absent for coming_soon).
    await comingSoonCard.click({ force: true })
    // Brief wait: gives the router a tick to react if it incorrectly navigated.
    await page.waitForTimeout(150)
    expect(page.url()).toBe(urlBefore)
  })

  test('the resume hero CTA navigates to /concept/:conceptId', async ({ page }) => {
    const heroCta = page.locator('.ergo-resume-hero__cta')
    await expect(heroCta).toBeVisible()
    await heroCta.click()
    await expect(page).toHaveURL(/^\/concept\/[^/]+$/)
  })
})
