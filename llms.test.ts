import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { wines } from './src/data/wines.js'
import { renderWinePage } from './src/render/winePage.js'

const ROOT = fileURLToPath(new URL('./', import.meta.url))
const llms = readFileSync(join(ROOT, 'public', 'llms.txt'), 'utf8')

// The '## Wines' section is the only place outside the renderer that hardcodes a public wine
// URL, so it is the only place that can silently drift when the printed URL changes. The
// links on the bottles cannot be reissued, which is what makes that drift worth a test.
function wineLinks(): string[] {
  const section = /^## Wines$([\s\S]*?)^## /m.exec(llms)?.[1] ?? ''
  return [...section.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1] ?? '')
}

function canonicalOf(html: string): string {
  return /rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? ''
}

describe('llms.txt', () => {
  it('lists every wine exactly once', () => {
    expect(wineLinks()).toHaveLength(wines.length)
  })

  it('links each wine at the url its own page declares canonical', () => {
    expect(wineLinks().sort()).toEqual(wines.map((w) => canonicalOf(renderWinePage(w))).sort())
  })
})
