import fs from 'fs'
import path from 'path'
import katex from 'katex'
import { describe, it, expect } from 'vitest'

const MATH_RE = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(collectStrings)
  if (value !== null && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(collectStrings)
  }
  return []
}

const fixtureDir = 'fixtures'
const files = fs
  .readdirSync(fixtureDir)
  .filter((f) => f.startsWith('lesson-') && f.endsWith('.json'))
  .map((f) => path.join(fixtureDir, f))

describe('mastery-latex fixture guard', () => {
  for (const file of files) {
    it(`${path.basename(file)} contains only valid KaTeX`, () => {
      const data: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
      const strings = collectStrings(data)

      for (const s of strings) {
        MATH_RE.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = MATH_RE.exec(s)) !== null) {
          const isDisplay = match[1] !== undefined
          const inner = isDisplay ? match[1] : match[2]
          expect(() =>
            katex.renderToString(inner, { displayMode: isDisplay, throwOnError: true }),
          ).not.toThrow()
        }
      }
    })
  }
})
