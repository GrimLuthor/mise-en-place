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
    this.version(2).stores({
      recipes: 'id, title, createdAt, updatedAt, *tags',
      images: 'id, recipeId, order',
    }).upgrade(tx => tx.table('recipes').toCollection().modify((recipe: any) => {
      recipe.ingredients = (recipe.ingredients ?? []).map((ing: any) => ({
        id: ing.id,
        text: [
          ing.quantity != null ? String(ing.quantity) : '',
          ing.unit ?? '',
          ing.name ?? '',
          ing.note ? `(${ing.note})` : '',
        ].filter(Boolean).join(' ') || ing.text || '',
      }))
    }))
  }
}

export const db = new RecipeDatabase()
