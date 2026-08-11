import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { winePages } from './src/plugins/winePages.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [winePages(resolve(__dirname, 'dist/wines'))],
  build: {
    modulePreload: { polyfill: false },
  },
})
