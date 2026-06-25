import { defineConfig, devices } from '@playwright/test'

// Separate VR config — does NOT modify playwright.config.ts or e2e/*.spec.ts.
// Baseline snapshots live in e2e/vr/__screenshots__/{projectName}/{testName}.png.

const PORT = 4321
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e/vr',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  snapshotPathTemplate:
    'e2e/vr/__screenshots__/{projectName}/{arg}{ext}',
  projects: [
    {
      name: 'vr-desktop',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
    {
      name: 'vr-mobile',
      use: { ...devices['Pixel 5'], reducedMotion: 'reduce' },
    },
  ],
  webServer: {
    command: `./node_modules/.bin/vite --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
