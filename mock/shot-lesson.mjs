import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
})
await page.goto('http://localhost:4321/dev/lesson', { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)
await page.screenshot({ path: 'mock/dev-lesson-now.png' })
await browser.close()
console.log('ok')
