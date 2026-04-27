import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function useStorageSize() {
  return useLiveQuery(async () => {
    const [recipes, images] = await Promise.all([
      db.recipes.toArray(),
      db.images.toArray(),
    ])
    const recipeBytes = new TextEncoder().encode(JSON.stringify(recipes)).length
    const imageBytes = images.reduce((sum, img) => sum + img.blob.size, 0)
    return formatBytes(recipeBytes + imageBytes)
  }, [])
}
