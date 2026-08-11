import { defineConfig } from 'vitest/config'

// Standalone rather than a `test` block in vite.config.ts: this keeps the winePages plugin,
// and the dev-server middleware it registers, out of the test run entirely.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
