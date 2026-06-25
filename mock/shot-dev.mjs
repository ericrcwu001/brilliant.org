import { chromium } from '@playwright/test'

const browser = await chromium.launch()

// Desktop
const desktop = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
})
await desktop.goto('http://localhost:4321/dev/home', { waitUntil: 'networkidle' })
await desktop.waitForTimeout(1500)
await desktop.screenshot({ path: 'mock/dev-home-desktop.png', fullPage: true })

// Mobile
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
})
await mobile.goto('http://localhost:4321/dev/home', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(1500)
await mobile.screenshot({ path: 'mock/dev-home-mobile.png', fullPage: true })

await browser.close()
console.log('ok')
