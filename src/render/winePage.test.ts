import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { renderWinePage } from './winePage.js'
import { wines } from '../data/wines.js'
import { wineSlug } from '../utils/slug.js'
import type { Nutrition, Wine } from '../types.js'

const nutrition: Nutrition = {
  energy: { kj: 314, kcal: 75 },
  fat: 0,
  saturatedFat: 0,
  carbohydrates: 0.9,
  sugars: 0.2,
  protein: 0,
  salt: 0.1,
}

const minimal: Wine = { name: 'Test Wine', grape: 'Cabernet', alcohol: '13%' }

describe('renderWinePage', () => {
  it('renders a complete html document', () => {
    const html = renderWinePage(minimal)
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<html lang="el">')
    expect(html.trimEnd().endsWith('</html>')).toBe(true)
  })

  it('renders the subtitle from alcohol, volume and grape', () => {
    expect(renderWinePage(minimal)).toContain('13% vol. · 750ml · Cabernet')
  })

  it('always carries the sulfites allergen notice', () => {
    expect(renderWinePage(minimal)).toContain('Αλλεργιογόνα: περιέχει θειώδη')
  })

  describe('nutrition table', () => {
    it('renders energy in both kJ and kcal, unrounded', () => {
      expect(renderWinePage({ ...minimal, nutrition })).toContain('314 kJ / 75 kcal')
    })

    it('renders every other figure at two decimals', () => {
      const html = renderWinePage({ ...minimal, nutrition })
      expect(html).toContain('0.00 g') // fat, saturatedFat, protein
      expect(html).toContain('0.90 g') // carbohydrates
      expect(html).toContain('0.20 g') // sugars
      expect(html).toContain('0.10 g') // salt
    })

    it('indents only the two "of which" rows', () => {
      const html = renderWinePage({ ...minimal, nutrition })
      const indented = [...html.matchAll(/class="table-label-indent">([^<]+)</g)].map((m) => m[1])
      expect(indented).toEqual(['εκ των οποίων κορεσμένα', 'εκ των οποίων σάκχαρα'])
    })

    it('labels the table as per 100 ml', () => {
      expect(renderWinePage({ ...minimal, nutrition })).toContain('Ανά 100 ml')
    })

    it('omits the whole section when nutrition is absent', () => {
      const html = renderWinePage(minimal)
      expect(html).not.toContain('Διατροφική Δήλωση')
      expect(html).not.toContain('<table')
      expect(html).not.toContain('Ανά 100 ml')
    })
  })

  describe('ingredients section', () => {
    it('renders ingredientsEl when present', () => {
      const html = renderWinePage({ ...minimal, ingredientsEl: 'Ασύρτικο (100%)' })
      expect(html).toContain('Συστατικά')
      expect(html).toContain('Ασύρτικο (100%)')
    })

    it('falls back to ingredients when ingredientsEl is absent', () => {
      // No wine sets `ingredients` today; this is the only exercise of that fallback.
      const html = renderWinePage({ ...minimal, ingredients: 'Assyrtiko (100%)' })
      expect(html).toContain('Assyrtiko (100%)')
    })

    it('prefers ingredientsEl over ingredients', () => {
      const html = renderWinePage({
        ...minimal,
        ingredientsEl: 'Ασύρτικο',
        ingredients: 'Assyrtiko',
      })
      expect(html).toContain('Ασύρτικο')
      expect(html).not.toContain('Assyrtiko')
    })

    it('omits the section when neither field is set', () => {
      expect(renderWinePage(minimal)).not.toContain('Συστατικά')
    })
  })

  describe('name', () => {
    it('prefers nameEl in the heading and title', () => {
      const html = renderWinePage({ ...minimal, nameEl: 'Δοκιμή' })
      expect(html).toContain('<h1 class="heading">Δοκιμή</h1>')
      expect(html).toContain('<title>Δοκιμή — Ορεινό Κτήμα Κουτσόγιωργα</title>')
    })

    it('falls back to name', () => {
      expect(renderWinePage(minimal)).toContain('<h1 class="heading">Test Wine</h1>')
    })
  })

  describe('escaping', () => {
    it('escapes html in the name and title', () => {
      const html = renderWinePage({ ...minimal, name: '<script>alert(1)</script>' })
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
      expect(html).not.toContain('<script>alert(1)</script>')
    })

    it('escapes html in grape, alcohol and ingredients', () => {
      const html = renderWinePage({
        ...minimal,
        grape: 'A & B',
        alcohol: '13"%',
        ingredientsEl: "it's <b>bold</b>",
      })
      expect(html).toContain('A &amp; B')
      expect(html).toContain('13&quot;%')
      expect(html).toContain('it&#39;s &lt;b&gt;bold&lt;/b&gt;')
    })
  })

  describe('links', () => {
    // Files are served from public/ as-is, so a root-relative href in the page has to
    // correspond to a real file on disk there.
    const PUBLIC_DIR = fileURLToPath(new URL('../../public/', import.meta.url))
    const exists = (url: string) => existsSync(join(PUBLIC_DIR, url))

    const preloadTags = (html: string) => html.match(/<link rel="preload"[^>]*>/g) ?? []
    const preloadedFonts = (html: string) =>
      [...html.matchAll(/rel="preload"[^>]*href="(\/fonts\/[^"]+)"/g)].map((m) => m[1]!)
    const fontFaceUrls = (html: string) =>
      [...html.matchAll(/url\((\/fonts\/[^)]+)\)/g)].map((m) => m[1]!)

    it('links back to the landing page', () => {
      // A wine page is reached by scanning a bottle, so this is the only route into the
      // rest of the site.
      expect(renderWinePage(minimal)).toContain('<a class="link-btn" href="/">')
    })

    it('points canonical at the absolute .html url for the slug', () => {
      // Absolute, unlike every other link here: a canonical is meaningless relative.
      expect(renderWinePage({ ...minimal, slug: 'oenous' })).toContain(
        '<link rel="canonical" href="https://ktimakoutsogiorga.gr/wines/oenous.html">',
      )
    })

    it('names the file the build actually writes, for every wine', () => {
      // Pairs with the closeBundle filename test in src/plugins/winePages.test.ts: both
      // sides key off wineSlug, and this is what catches them drifting apart.
      for (const wine of wines) {
        const canonical = /rel="canonical" href="([^"]+)"/.exec(renderWinePage(wine))?.[1]
        expect(canonical).toBe(
          `https://ktimakoutsogiorga.gr/wines/${wineSlug(wine)}.html`,
        )
      }
    })

    it('preloads the three fonts needed above the fold, in priority order', () => {
      // latin-italic is declared but deliberately not preloaded: nothing italic and latin
      // renders before the user scrolls.
      expect(preloadedFonts(renderWinePage(minimal))).toEqual([
        '/fonts/piazzolla-greek.woff2',
        '/fonts/piazzolla-latin.woff2',
        '/fonts/piazzolla-greek-italic.woff2',
      ])
    })

    it('preloads only fonts that exist in public/', () => {
      for (const url of preloadedFonts(renderWinePage(minimal))) {
        expect(exists(url), `${url} is missing from public/`).toBe(true)
      }
    })

    it('declares @font-face sources that exist in public/', () => {
      // The riskier half: a renamed font file breaks the preload *and* the @font-face,
      // so the Greek copy silently falls back to Georgia.
      const urls = fontFaceUrls(renderWinePage(minimal))
      expect(urls).toHaveLength(4)
      for (const url of urls) {
        expect(exists(url), `${url} is missing from public/`).toBe(true)
      }
    })

    it('preloads nothing it does not then use in an @font-face rule', () => {
      const declared = fontFaceUrls(renderWinePage(minimal))
      for (const url of preloadedFonts(renderWinePage(minimal))) {
        expect(declared).toContain(url)
      }
    })

    it('marks every font preload crossorigin', () => {
      // Fonts are fetched in CORS mode, so a preload without crossorigin is discarded
      // and the file is downloaded twice.
      const fontPreloads = preloadTags(renderWinePage(minimal)).filter((tag) =>
        tag.includes('/fonts/'),
      )
      expect(fontPreloads).toHaveLength(3)
      for (const tag of fontPreloads) {
        expect(tag).toContain('crossorigin')
      }
    })
  })

  // Catch-all regression net over the real data. These pin the entire document, inlined
  // STYLES block included, so a CSS change churns the snapshot file: review the diff, then
  // `npx vitest -u` to accept.
  describe('published pages', () => {
    it.each(wines.map((wine) => [wineSlug(wine), wine] as const))(
      'renders %s unchanged',
      (_slug, wine) => {
        expect(renderWinePage(wine)).toMatchSnapshot()
      },
    )
  })
})
