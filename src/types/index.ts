export interface Ingredient {
  id: string
  text: string
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
