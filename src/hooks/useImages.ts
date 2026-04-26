import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export function useRecipeImages(recipeId: string | undefined) {
  return useLiveQuery(async () => {
    if (!recipeId) return []
    return db.images.where('recipeId').equals(recipeId).sortBy('order')
  }, [recipeId])
}

export function useCoverImage(recipeId: string) {
  return useLiveQuery(async () => {
    const imgs = await db.images.where('recipeId').equals(recipeId).sortBy('order')
    return imgs[0] ?? null
  }, [recipeId])
}
