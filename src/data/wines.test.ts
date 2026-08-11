import { describe, expect, it } from 'vitest'
import { wines } from './wines.js'
import { wineSlug } from '../utils/slug.js'

describe('wines data', () => {
  it('holds the five published wines', () => {
    expect(wines).toHaveLength(5)
  })

  it('derives a non-empty slug for every wine', () => {
    // An empty slug would emit dist/wines/.html — see the Greek-name case in slug.test.ts.
    for (const wine of wines) {
      expect(wineSlug(wine), `slug for ${wine.name}`).not.toBe('')
    }
  })

  it('derives a unique slug for every wine', () => {
    // closeBundle writes one file per wine keyed on the slug, so a collision would
    // silently overwrite another wine's page and ship four instead of five.
    const slugs = wines.map(wineSlug)
    expect(new Set(slugs).size).toBe(wines.length)
  })

  it('derives url-safe slugs', () => {
    // renderWinePage interpolates the slug into the canonical href without escaping it,
    // and an explicit `slug` bypasses toSlug entirely, so pin the character set here.
    for (const wine of wines) {
      expect(wineSlug(wine)).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('carries the label fields every wine page renders', () => {
    for (const wine of wines) {
      expect(wine.name, 'name').toBeTruthy()
      expect(wine.grape, 'grape').toBeTruthy()
      expect(wine.alcohol, 'alcohol').toBeTruthy()
      expect(wine.nutrition, `nutrition for ${wine.name}`).toBeDefined()
      expect(wine.ingredientsEl, `ingredientsEl for ${wine.name}`).toBeTruthy()
    }
  })

  it('states alcohol as a percentage string', () => {
    for (const wine of wines) {
      expect(wine.alcohol).toMatch(/^\d+(?:\.\d+)?%$/)
    }
  })

  it('states every nutrition figure as a finite, non-negative number', () => {
    for (const wine of wines) {
      const n = wine.nutrition
      if (!n) throw new Error(`${wine.name} has no nutrition`)
      const figures = [
        n.energy.kj,
        n.energy.kcal,
        n.fat,
        n.saturatedFat,
        n.carbohydrates,
        n.sugars,
        n.protein,
        n.salt,
      ]
      for (const figure of figures) {
        expect(Number.isFinite(figure)).toBe(true)
        expect(figure).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('never reports more saturated fat than fat, or more sugars than carbohydrates', () => {
    for (const wine of wines) {
      const n = wine.nutrition
      if (!n) throw new Error(`${wine.name} has no nutrition`)
      expect(n.saturatedFat, `saturatedFat for ${wine.name}`).toBeLessThanOrEqual(n.fat)
      expect(n.sugars, `sugars for ${wine.name}`).toBeLessThanOrEqual(n.carbohydrates)
    }
  })
})
