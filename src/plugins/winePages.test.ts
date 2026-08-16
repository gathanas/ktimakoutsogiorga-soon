import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Plugin } from 'vite'
import { winePages } from './winePages.js'
import { wines } from '../data/wines.js'
import { wineSlug } from '../utils/slug.js'
import { renderWinePage } from '../render/winePage.js'

type Middleware = (
  req: { url?: string },
  res: { setHeader: (k: string, v: string) => void; end: (body: string) => void },
  next: () => void,
) => void

type FakeServer = { middlewares: { use: (fn: Middleware) => void } }

// Vite types both hooks as ObjectHook — either a function or a { handler } object — and gives
// them a Rollup plugin-context `this`. We author them as plain functions that never touch
// `this`, so unwrap to a bare signature instead of fabricating a context we do not use.
function hook<T>(candidate: unknown): T {
  if (typeof candidate !== 'function') throw new Error('expected a function hook')
  return candidate as T
}

function middlewareOf(plugin: Plugin): Middleware {
  let captured: Middleware | undefined
  const server: FakeServer = {
    middlewares: {
      use: (fn) => {
        captured = fn
      },
    },
  }
  hook<(server: FakeServer) => void>(plugin.configureServer)(server)
  if (!captured) throw new Error('plugin registered no middleware')
  return captured
}

function request(url: string | undefined) {
  const res = { setHeader: vi.fn(), end: vi.fn() }
  const next = vi.fn()
  middlewareOf(winePages('/unused'))({ url }, res, next)
  return { res, next }
}

describe('winePages dev middleware', () => {
  it('serves a wine page as utf-8 html', () => {
    const { res, next } = request('/i/oenous/')

    expect(next).not.toHaveBeenCalled()
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8')
    expect(res.end).toHaveBeenCalledTimes(1)
    expect(res.end.mock.calls[0]?.[0]).toContain('<title>Οινούς')
  })

  // The printed URL is /i/<slug>/; the rest are the shapes that were published before the
  // labels existed, or that a hand-typed guess lands on. Dev answers all of them so a QR
  // pointed at `npm run dev-host` exercises the same path the bottle will.
  it.each(['/i/oenous/', '/i/oenous', '/wines/oenous', '/wines/oenous/', '/wines/oenous.html'])(
    'serves %s',
    (url) => {
      const { res, next } = request(url)
      expect(next).not.toHaveBeenCalled()
      expect(res.end).toHaveBeenCalledTimes(1)
    },
  )

  it('serves the page with a query string', () => {
    const { res, next } = request('/i/oenous/?utm_source=qr')
    expect(next).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalledTimes(1)
  })

  it('serves every published wine', () => {
    for (const wine of wines) {
      const { res, next } = request(`/i/${wineSlug(wine)}/`)
      expect(next, wineSlug(wine)).not.toHaveBeenCalled()
      expect(res.end.mock.calls[0]?.[0]).toBe(renderWinePage(wine))
    }
  })

  it.each([
    '/i/nope',
    '/i/',
    '/i',
    '/i/oenous/extra',
    '/wines/nope',
    '/wines/',
    '/wines',
    '/about',
    '/',
    '/wines/oenous/extra',
  ])('falls through for %s', (url) => {
    const { res, next } = request(url)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.end).not.toHaveBeenCalled()
  })

  it('falls through when the request has no url', () => {
    const { res, next } = request(undefined)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.end).not.toHaveBeenCalled()
  })
})

describe('winePages build output', () => {
  let outDir: string

  beforeEach(() => {
    outDir = mkdtempSync(join(tmpdir(), 'wine-pages-'))
  })

  afterEach(() => {
    rmSync(outDir, { recursive: true, force: true })
  })

  function build() {
    hook<() => void>(winePages(outDir).closeBundle)()
  }

  it('writes the printed url as a directory with an index, one per wine', () => {
    // /i/<slug>/ has to be a real directory: nginx on Papaki has no rewrite that could
    // resolve an extensionless path to a file.
    build()
    expect(readdirSync(resolve(outDir, 'i')).sort()).toEqual([
      'kato-rachi',
      'kores',
      'livias-rose',
      'mandolino',
      'oenous',
    ])
    for (const wine of wines) {
      expect(readdirSync(resolve(outDir, 'i', wineSlug(wine)))).toEqual(['index.html'])
    }
  })

  it('keeps writing the legacy .html page per wine', () => {
    // The FTP deploy prunes whatever leaves dist/, and there is no rewrite to redirect
    // with, so dropping these would 404 every URL published before the labels existed.
    build()
    expect(readdirSync(resolve(outDir, 'wines')).sort()).toEqual([
      'kato-rachi.html',
      'kores.html',
      'livias-rose.html',
      'mandolino.html',
      'oenous.html',
    ])
  })

  it('writes the same rendered page to both urls', () => {
    build()
    for (const wine of wines) {
      const html = renderWinePage(wine)
      expect(readFileSync(resolve(outDir, 'i', wineSlug(wine), 'index.html'), 'utf8')).toBe(html)
      expect(readFileSync(resolve(outDir, 'wines', `${wineSlug(wine)}.html`), 'utf8')).toBe(html)
    }
  })

  it('creates the output directory when it does not exist yet', () => {
    const nested = join(outDir, 'dist')
    hook<() => void>(winePages(nested).closeBundle)()
    expect(readdirSync(nested).sort()).toEqual(['i', 'wines'])
    expect(readdirSync(join(nested, 'wines'))).toHaveLength(wines.length)
  })
})
