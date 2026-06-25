import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
})
await page.goto('file:///Users/ericwu/Developer/brilliant.org/mock/ergo-home.html', {
  waitUntil: 'networkidle',
})
// give web fonts a beat to swap in
await page.waitForTimeout(1000)
await page.screenshot({ path: 'mock/ergo-home-shot.png', fullPage: true })
await browser.close()
console.log('ok')
