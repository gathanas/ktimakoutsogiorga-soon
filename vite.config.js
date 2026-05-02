import { defineConfig } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { wines } from './src/data/wines.js'
import { wineSlug } from './src/utils/slug.js'
import { renderWinePage } from './src/render/winePage.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function winePages() {
  return {
    name: 'wine-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = req.url?.match(/^\/wines\/([^/?#]+)\/?(?:\?.*)?$/)
        if (!m) return next()
        const wine = wines.find((w) => wineSlug(w) === m[1])
        if (!wine) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(renderWinePage(wine))
      })
    },
    closeBundle() {
      const dir = resolve(__dirname, 'dist/wines')
      mkdirSync(dir, { recursive: true })
      for (const wine of wines) {
        writeFileSync(resolve(dir, `${wineSlug(wine)}.html`), renderWinePage(wine))
      }
    },
  }
}

export default defineConfig({
  plugins: [winePages()],
  build: {
    modulePreload: { polyfill: false },
  },
})
