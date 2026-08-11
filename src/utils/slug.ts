import type { Wine } from '../types.js'

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function wineSlug(wine: Wine): string {
  return wine.slug ?? toSlug(wine.name)
}
