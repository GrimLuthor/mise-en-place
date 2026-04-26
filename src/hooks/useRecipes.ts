import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function useRecipes() {
  return useLiveQuery(() => db.recipes.orderBy('createdAt').reverse().toArray(), [])
}

// Returns undefined (loading) | null (not found) | Recipe (found)
export function useRecipe(id: string | undefined) {
  return useLiveQuery(async () => {
    if (!id) return null
    const recipe = await db.recipes.get(id)
    return recipe ?? null
  }, [id])
}
