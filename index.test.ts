import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Window } from 'happy-dom'
import { describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('./', import.meta.url))
const PUBLIC_DIR = join(ROOT, 'public')
const ORIGIN = 'https://ktimakoutsogiorga.gr'
const FORM_ENDPOINT = 'https://formsubmit.co/couchellwinery@gmail.com'

const html = readFileSync(join(ROOT, 'index.html'), 'utf8')

// Parsed with happy-dom directly rather than running this file in the happy-dom
// environment: that environment gives import.meta.url a non-file scheme, which breaks the
// path handling these tests need to reach public/.
const window = new Window()
window.document.write(html)
const doc = window.document

// public/ is copied to the document root as-is, so a root-relative path in the page has
// to correspond to a real file in there.
const exists = (url: string) => existsSync(join(PUBLIC_DIR, url))
const attr = (selector: string, name: string) =>
  doc.querySelector(selector)?.getAttribute(name) ?? undefined

describe('landing page document', () => {
  it('declares the doctype and greek as the language', () => {
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(doc.documentElement.getAttribute('lang')).toBe('el')
  })

  it('sets charset and viewport', () => {
    expect(attr('meta[charset]', 'charset')).toBe('UTF-8')
    expect(attr('meta[name="viewport"]', 'content')).toContain('width=device-width')
  })

  it('has a title and a description', () => {
    expect(doc.querySelector('title')?.textContent).toBe(
      'Ορεινό Κτήμα Κουτσόγιωργα — Coming Soon',
    )
    expect(attr('meta[name="description"]', 'content')).toBeTruthy()
  })

  it('points canonical and og:url at the same bare origin', () => {
    // The wine pages canonicalise to /wines/<slug>.html on this same host; a mismatch
    // between these two is the kind of thing only a crawler notices.
    expect(attr('link[rel="canonical"]', 'href')).toBe(`${ORIGIN}/`)
    expect(attr('meta[property="og:url"]', 'content')).toBe(`${ORIGIN}/`)
  })

  it('loads the signup script as a module', () => {
    expect(attr('script[type="module"]', 'src')).toBe('/src/main.ts')
  })
})

// main.ts asserts both of these nodes exist, with non-null assertions rather than guards,
// so renaming either id here breaks the signup at runtime with no build error. These tests
// are the other half of the contract that src/main.test.ts exercises against a fixture.
describe('signup form contract', () => {
  const slot = doc.querySelector('#signup-slot')
  const form = doc.querySelector('#signup-form')

  it('provides the slot main.ts writes the confirmation into', () => {
    expect(slot).not.toBeNull()
  })

  it('nests the form inside that slot', () => {
    // showConfirmation() replaces the slot's innerHTML, which is what removes the form.
    // If the form sat outside the slot it would survive and stay submittable.
    expect(form).not.toBeNull()
    expect(slot?.contains(form!)).toBe(true)
  })

  it('posts to the formsubmit endpoint', () => {
    expect(form?.getAttribute('method')?.toUpperCase()).toBe('POST')
    expect(form?.getAttribute('action')).toBe(FORM_ENDPOINT)
  })

  it('preconnects to the origin the form posts to', () => {
    const preconnect = attr('link[rel="preconnect"]', 'href')
    expect(preconnect).toBe(new URL(FORM_ENDPOINT).origin)
  })

  it('carries a required email field named for the endpoint', () => {
    const email = doc.querySelector('#signup-form input[name="email"]')
    expect(email).not.toBeNull()
    expect(email?.getAttribute('type')).toBe('email')
    expect(email?.hasAttribute('required')).toBe(true)
    // No visible label, so the field needs an accessible name of its own.
    expect(email?.getAttribute('aria-label')).toBeTruthy()
  })

  it('disables the formsubmit captcha', () => {
    // Left on, formsubmit answers the POST with a captcha page instead of accepting it,
    // and every signup fails while the form still looks like it worked.
    expect(attr('input[name="_captcha"]', 'value')).toBe('false')
  })

  it('names the notification email subject', () => {
    expect(attr('input[name="_subject"]', 'value')).toBeTruthy()
  })

  it('has a submit button', () => {
    expect(doc.querySelector('#signup-form button[type="submit"]')).not.toBeNull()
  })
})

describe('landing page assets', () => {
  const localRefs = [
    ...[...doc.querySelectorAll('[href]')].map((el) => el.getAttribute('href')!),
    ...[...doc.querySelectorAll('[src]')].map((el) => el.getAttribute('src')!),
  ].filter((ref) => ref.startsWith('/') && ref !== '/' && !ref.startsWith('/src/'))

  it('references only local files that exist in public/', () => {
    expect(localRefs.length).toBeGreaterThan(0)
    for (const ref of localRefs) {
      expect(exists(ref), `${ref} is missing from public/`).toBe(true)
    }
  })

  it('serves the social card image from a real file', () => {
    // Absolute rather than root-relative, because scrapers do not resolve relative urls.
    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      const url = attr(selector, 'content')
      expect(url?.startsWith(`${ORIGIN}/`), `${selector} must be absolute`).toBe(true)
      expect(exists(new URL(url!).pathname), `${url} is missing from public/`).toBe(true)
    }
  })

  it('marks every font preload crossorigin', () => {
    // Fonts are fetched in CORS mode, so a preload without crossorigin is discarded and
    // the file is downloaded a second time.
    const fontPreloads = [...doc.querySelectorAll('link[rel="preload"][as="font"]')]
    expect(fontPreloads).toHaveLength(2)
    for (const link of fontPreloads) {
      expect(link.hasAttribute('crossorigin'), link.getAttribute('href') ?? '').toBe(true)
    }
  })

  it('preloads the background image it then paints', () => {
    const preloaded = attr('link[rel="preload"][as="image"]', 'href')
    expect(preloaded).toBe('/background.webp')
    expect(html).toContain(`url('${preloaded}')`)
  })

  it('reserves layout space for the emblem', () => {
    // Without both attributes the card reflows when the image lands, and this emblem is
    // deliberately served at a size that matches its box.
    const emblem = doc.querySelector('img.emblem')
    expect(emblem?.getAttribute('width')).toBeTruthy()
    expect(emblem?.getAttribute('height')).toBeTruthy()
  })

  it('gives the decorative emblem an empty alt', () => {
    expect(doc.querySelector('img.emblem')?.getAttribute('alt')).toBe('')
  })
})
