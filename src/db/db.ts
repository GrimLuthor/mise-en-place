import Dexie, { type Table } from 'dexie'
import type { Recipe, RecipeImage } from '../types'

export class RecipeDatabase extends Dexie {
  recipes!: Table<Recipe>
  images!: Table<RecipeImage>

  constructor() {
    super('mise-en-place')
    this.version(1).stores({
      // *tags creates a multi-entry index so we can query by individual tags
      recipes: 'id, title, createdAt, updatedAt, *tags',
      images: 'id, recipeId, order',
    })
  }
}

export const db = new RecipeDatabase()
