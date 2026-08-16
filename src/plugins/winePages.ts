import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { wines } from '../data/wines.js'
import { wineSlug } from '../utils/slug.js'
import { renderWinePage } from '../render/winePage.js'

// Two copies of every page, because the bottles carry a printed URL that can never move.
//
//   i/<slug>/index.html   the URL on the label, https://ktimakoutsogiorga.gr/i/<slug>/
//   wines/<slug>.html     the URL published before the labels existed
//
// nginx on Papaki serves dist/ with no rewrites available, so an extensionless path only
// resolves if it is a real directory with an index.html — hence the first form. The second
// stays because the FTP deploy prunes whatever leaves dist/, and with no rewrite to redirect
// with, a dropped .html is a permanent 404 for every link already published. Both files are
// the same render, so the canonical inside them points search engines at the /i/ form.
const ROUTES = [
  /^\/i\/([^/?#]+)\/?(?:\?.*)?$/,
  /^\/wines\/([^/?#]+?)(?:\.html)?\/?(?:\?.*)?$/,
]

function routeSlug(url: string | undefined): string | undefined {
  if (url === undefined) return undefined
  for (const route of ROUTES) {
    const m = url.match(route)
    if (m) return m[1]
  }
  return undefined
}

function write(path: string, body: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, body)
}

// The output directory is injected rather than derived from import.meta.url, because this
// module no longer sits next to dist/. It also lets the tests write to a temp directory.
export function winePages(outDir: string): Plugin {
  return {
    name: 'wine-pages',
    configureServer(server) {
      // Dev serves both shapes so a QR scanned against `npm run dev-host` exercises the
      // same path the label will.
      server.middlewares.use((req, res, next) => {
        const slug = routeSlug(req.url)
        if (slug === undefined) return next()
        const wine = wines.find((w) => wineSlug(w) === slug)
        if (!wine) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(renderWinePage(wine))
      })
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true })
      for (const wine of wines) {
        const html = renderWinePage(wine)
        write(resolve(outDir, 'i', wineSlug(wine), 'index.html'), html)
        write(resolve(outDir, 'wines', `${wineSlug(wine)}.html`), html)
      }
    },
  }
}
