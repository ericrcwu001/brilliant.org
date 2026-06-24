import { chromium } from '@playwright/test'

const url = 'http://localhost:5173/'
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
const page = await browser.newPage()

const isLocal = (u) =>
  u.includes('localhost') || u.includes('127.0.0.1') || u.startsWith('data:') || u.startsWith('blob:')
const externalHosts = new Set()
const localFonts = []
page.on('request', (req) => {
  const u = req.url()
  if (!isLocal(u)) {
    try { externalHosts.add(new URL(u).host) } catch { externalHosts.add(u) }
  } else if (/\.woff2?(\?|$)/.test(u)) {
    localFonts.push(u.replace(/^http:\/\/localhost:5173/, ''))
  }
})
const errors = []
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + (err.stack || err.message)))

await page.goto(url, { waitUntil: 'networkidle' }).catch((e) => errors.push('GOTO: ' + e.message))
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1200)

const info = await page.evaluate(() => ({
  bodyFont: getComputedStyle(document.body).fontFamily,
  plexLoaded: document.fonts.check("16px 'IBM Plex Sans'"),
  plexMono: document.fonts.check("16px 'IBM Plex Mono'"),
  rootLen: document.getElementById('root')?.innerHTML.length ?? 0,
}))

console.log('EXTERNAL_HOSTS:', JSON.stringify([...externalHosts]))
console.log('LOCAL_FONT_REQS:', localFonts.length)
for (const f of localFonts.slice(0, 12)) console.log('  font>', f.slice(0, 120))
console.log('BODY_FONT:', info.bodyFont)
console.log("IBM Plex Sans loaded:", info.plexLoaded, '| Mono loaded:', info.plexMono)
console.log('ROOT_LEN:', info.rootLen)
console.log('PAGEERRORS:', errors.length)
for (const e of errors) console.log('ERR>', e.slice(0, 300))

await browser.close()
