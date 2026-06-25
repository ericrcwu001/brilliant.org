import { chromium } from '@playwright/test'

const shots = [
  ['http://localhost:4399/dev/lesson', 'mock/ergo-lesson-flagship.png'],
  ['http://localhost:4399/dev/lesson/lesson-penneys-game', 'mock/ergo-lesson-penneys.png'],
]

const browser = await chromium.launch()
for (const [url, out] of shots) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2,
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.locator('section.prompt').waitFor({ state: 'visible', timeout: 15000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: out })
  console.log('shot', out)
  await page.close()
}
await browser.close()
console.log('ok')
