// Nutrition figures are declared per 100 ml, matching the EU label requirement
// that renderWinePage() reproduces.
export interface Nutrition {
  energy: { kj: number; kcal: number }
  fat: number
  saturatedFat: number
  carbohydrates: number
  sugars: number
  protein: number
  salt: number
}

export interface Wine {
  // Only set where the derived slug would be wrong: toSlug('Oinous') gives 'oinous',
  // but the published URL is /i/oenous/.
  slug?: string
  name: string
  nameEl?: string
  grape: string
  descriptionEl?: string
  // No wine currently sets `ingredients`; it stays declared because renderWinePage()
  // falls back to it, which keeps the door open for a Latin-only label.
  ingredients?: string
  ingredientsEl?: string
  // A string, not a number: this carries the unit, e.g. '13.5%'.
  alcohol: string
  nutrition?: Nutrition
}
