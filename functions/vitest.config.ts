import { defineConfig } from 'vitest/config'

// Unit tests for the pure progression logic (streak day math). The callable
// wrappers that touch Firestore are exercised against the emulator separately.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
