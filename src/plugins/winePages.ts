import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { wines } from '../data/wines.js'
import { wineSlug } from '../utils/slug.js'
import { renderWinePage } from '../render/winePage.js'

// The output directory is injected rather than derived from import.meta.url, because this
// module no longer sits next to dist/. It also lets the tests write to a temp directory.
export function winePages(outDir: string): Plugin {
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
      mkdirSync(outDir, { recursive: true })
      for (const wine of wines) {
        writeFileSync(resolve(outDir, `${wineSlug(wine)}.html`), renderWinePage(wine))
      }
    },
  }
}
