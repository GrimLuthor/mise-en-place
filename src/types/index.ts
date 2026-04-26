export type UnitType =
  | 'metric_mass'
  | 'metric_volume'
  | 'imperial_mass'
  | 'imperial_volume'
  | 'count'
  | 'custom'
  | 'none'

export interface Ingredient {
  id: string
  quantity?: number
  unit?: string
  unitType: UnitType
  name: string
  note?: string
}

export interface Step {
  id: string
  text: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  tags: string[]
  ingredients: Ingredient[]
  steps: Step[]
  sourceUrls: string[]
  servings?: number
  prepTime?: number
  cookTime?: number
  createdAt: number
  updatedAt: number
  notes?: string
}

export interface RecipeImage {
  id: string
  recipeId: string
  blob: Blob
  caption?: string
  order: number
}
