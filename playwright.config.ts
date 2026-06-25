import { defineConfig, devices } from '@playwright/test'

// Pin a dedicated port so the harness never races the user's ad-hoc `npm run dev`
// instances (which walk 5173 -> 5174 -> 5175). `--strictPort` makes vite fail
// loudly instead of silently picking another port.
const PORT = 4321
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // Visual-regression specs live in e2e/vr/ and run via playwright.vr.config.ts
  // (own snapshot path template). Keep them out of the functional suite so the
  // 42-test baseline across the 3 functional projects stays clean.
  testIgnore: ['**/vr/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // O3: the lesson must be completable on the tap-only mobile path.
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      // O3: the reduced-motion path must also complete end-to-end.
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
