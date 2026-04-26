import { db } from '../db/db'
import type { Recipe } from '../types'

const FILE_NAME = 'mise-en-place-recipes.json'
const BASE = 'https://www.googleapis.com'

async function findFileId(token: string): Promise<string | null> {
  const res = await fetch(
    `${BASE}/drive/v3/files?spaces=appDataFolder&q=name%3D'${FILE_NAME}'&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  const data = await res.json() as { files: { id: string }[] }
  return data.files?.[0]?.id ?? null
}

export async function loadFromDrive(token: string): Promise<Recipe[] | null> {
  try {
    const fileId = await findFileId(token)
    if (!fileId) return null
    const res = await fetch(
      `${BASE}/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return null
    return await res.json() as Recipe[]
  } catch {
    return null
  }
}

export async function syncToDrive(token: string): Promise<void> {
  const recipes = await db.recipes.toArray()
  const body = JSON.stringify(recipes)
  const fileId = await findFileId(token)

  if (!fileId) {
    const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })
    const form = new FormData()
    form.append('metadata', new Blob([metadata], { type: 'application/json' }))
    form.append('media', new Blob([body], { type: 'application/json' }))
    await fetch(
      `${BASE}/upload/drive/v3/files?uploadType=multipart`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
    )
  } else {
    await fetch(
      `${BASE}/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body,
      }
    )
  }
}
