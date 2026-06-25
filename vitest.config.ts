import { defineConfig } from 'vitest/config'

// Group A tests are pure TypeScript (engine + content). They run in a plain
// node environment without the React Compiler Babel transform.
// tsx files (e.g. component smoke tests) are included here; they use
// react-dom/server renderToString so they work without jsdom.
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
  },
})
