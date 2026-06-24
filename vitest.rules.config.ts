import { defineConfig } from 'vitest/config'

// Firestore security-rules tests. Separate from the default suite
// (vitest.config.ts scans src/) because these require a running Firestore
// emulator. Run via `npm run test:rules`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
})
