// Predeploy step (referenced from firebase.json functions.predeploy): copy the
// committed interview packs from interviews/course-*.json into functions/packs/
// so the deployed Functions runtime can fs.readFileSync them (loadPack in
// functions/src/interview.ts). The packs are NOT TypeScript source — they are
// data — so they live outside functions/src (rootDir) and are bundled here at
// deploy time. functions/packs/ is gitignored; this script regenerates it.
//
// Usage: node scripts/copy-interview-packs.mjs "$RESOURCE_DIR"
//   $RESOURCE_DIR is the functions directory (firebase passes it for predeploy).
//   Falls back to ./functions relative to cwd when run manually.

import { cpSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const resourceDir = resolve(process.argv[2] ?? 'functions')
const srcDir = join(resourceDir, '..', 'interviews')
const dstDir = join(resourceDir, 'packs')

mkdirSync(dstDir, { recursive: true })

const packs = readdirSync(srcDir).filter((name) => /^course-.*\.json$/.test(name))
for (const name of packs) {
  cpSync(join(srcDir, name), join(dstDir, name))
}

console.log(`Copied ${packs.length} interview pack(s) to ${dstDir}: ${packs.join(', ') || '(none)'}`)
