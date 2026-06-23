import { defineConfig } from 'vitest/config'

// Group A tests are pure TypeScript (engine + content). They run in a plain
// node environment without the React Compiler Babel transform.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
