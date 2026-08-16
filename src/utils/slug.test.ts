import { describe, expect, it } from 'vitest'
import { toSlug, wineSlug } from './slug.js'

describe('toSlug', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(toSlug('Kato Rachi')).toBe('kato-rachi')
    expect(toSlug('Mandolino')).toBe('mandolino')
  })

  it('strips combining marks left by NFD normalisation', () => {
    expect(toSlug('Rosé')).toBe('rose')
    expect(toSlug('Ürüñ')).toBe('urun')
  })

  it('removes apostrophes without leaving a hyphen in their place', () => {
    // Both forms matter: the data file uses the straight quote, but copy pasted from a
    // word processor would carry the curly one.
    expect(toSlug("Livia's Rosé")).toBe('livias-rose')
    expect(toSlug('Livia’s Rosé')).toBe('livias-rose')
    expect(toSlug('Livia‘s Rosé')).toBe('livias-rose')
  })

  it('collapses runs of punctuation and whitespace into a single hyphen', () => {
    expect(toSlug('A -- B')).toBe('a-b')
    expect(toSlug('A   B')).toBe('a-b')
    expect(toSlug('Grand & Reserve')).toBe('grand-reserve')
  })

  it('trims leading and trailing hyphens', () => {
    expect(toSlug(' Mandolino ')).toBe('mandolino')
    expect(toSlug('!Mandolino!')).toBe('mandolino')
  })

  it('keeps digits', () => {
    expect(toSlug('Cuvée 2019')).toBe('cuvee-2019')
  })

  it('returns an empty string when there are no latin alphanumerics', () => {
    // Documented rather than discovered: a wine whose `name` is Greek would slug to '',
    // producing dist/i//index.html and a canonical URL of /i//. The data-integrity suite
    // in src/data/wines.test.ts is what actually guards against this shipping.
    expect(toSlug('Οινούς')).toBe('')
    expect(toSlug('Κάτω Ράχη')).toBe('')
    expect(toSlug('')).toBe('')
  })
})

describe('wineSlug', () => {
  const base = { name: 'Oinous', grape: 'Ασύρτικο', alcohol: '13%' }

  it('prefers an explicit slug over the derived one', () => {
    expect(wineSlug({ ...base, slug: 'oenous' })).toBe('oenous')
  })

  it('derives the slug from name when none is set', () => {
    expect(wineSlug(base)).toBe('oinous')
  })

  it('derives from the latin name, never the greek nameEl', () => {
    // nameEl would slug to '', which is exactly why the real Oinous entry carries an
    // explicit slug: 'oenous' override.
    expect(wineSlug({ ...base, nameEl: 'Οινούς' })).toBe('oinous')
  })
})
