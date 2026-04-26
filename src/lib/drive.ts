import { db } from '../db/db'
import type { Recipe } from '../types'

const BASE = 'https://www.googleapis.com'
const RECIPES_FILE = 'mise-en-place-recipes.json'
const IMG_META_FILE = 'mise-en-place-images-meta.json'
const IMG_PREFIX = 'mise-en-place-image-'

interface ImageMeta { id: string; recipeId: string; caption?: string; order: number }

// ── Low-level helpers ─────────────────────────────────────────────────────────

async function findFileId(token: string, name: string): Promise<string | null> {
  const q = encodeURIComponent(`name = '${name}'`)
  const res = await fetch(
    `${BASE}/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  const data = await res.json() as { files: { id: string }[] }
  return data.files?.[0]?.id ?? null
}

async function upsertJson(token: string, name: string, data: unknown): Promise<void> {
  const body = JSON.stringify(data)
  const fileId = await findFileId(token, name)
  if (!fileId) {
    const meta = JSON.stringify({ name, parents: ['appDataFolder'] })
    const form = new FormData()
    form.append('metadata', new Blob([meta], { type: 'application/json' }))
    form.append('media', new Blob([body], { type: 'application/json' }))
    await fetch(`${BASE}/upload/drive/v3/files?uploadType=multipart`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
    })
  } else {
    await fetch(`${BASE}/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
  }
}

async function readJson<T>(token: string, name: string): Promise<T | null> {
  try {
    const fileId = await findFileId(token, name)
    if (!fileId) return null
    const res = await fetch(`${BASE}/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok ? (await res.json() as T) : null
  } catch { return null }
}

async function listImageFileIds(token: string): Promise<Map<string, string>> {
  const q = encodeURIComponent(`name contains '${IMG_PREFIX}'`)
  const res = await fetch(
    `${BASE}/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name)&pageSize=1000`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const map = new Map<string, string>()
  if (!res.ok) return map
  const data = await res.json() as { files: { id: string; name: string }[] }
  for (const f of data.files ?? []) map.set(f.name.slice(IMG_PREFIX.length), f.id)
  return map
}

// ── Recipes ───────────────────────────────────────────────────────────────────

async function saveRecipes(token: string): Promise<void> {
  await upsertJson(token, RECIPES_FILE, await db.recipes.toArray())
}

export async function loadRecipesFromDrive(token: string): Promise<Recipe[] | null> {
  return readJson<Recipe[]>(token, RECIPES_FILE)
}

// ── Images ────────────────────────────────────────────────────────────────────

async function saveImageMeta(token: string): Promise<void> {
  const all = await db.images.toArray()
  const meta: ImageMeta[] = all.map(({ id, recipeId, caption, order }) => ({ id, recipeId, caption, order }))
  await upsertJson(token, IMG_META_FILE, meta)
}

export async function loadImagesFromDrive(token: string): Promise<void> {
  const meta = await readJson<ImageMeta[]>(token, IMG_META_FILE)
  if (!meta?.length) return

  const localIds = new Set((await db.images.toArray()).map(i => i.id))
  const driveMap = await listImageFileIds(token)

  await Promise.all(
    meta
      .filter(m => !localIds.has(m.id) && driveMap.has(m.id))
      .map(async m => {
        const res = await fetch(`${BASE}/drive/v3/files/${driveMap.get(m.id)}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        await db.images.put({ ...m, blob: await res.blob() })
      })
  )
}

// ── Coordinated sync ──────────────────────────────────────────────────────────

// Call after any save/delete. deletedImageIds: blobs to remove from Drive.
export async function syncAllToDrive(token: string, deletedImageIds: string[] = []): Promise<void> {
  const [allImages, driveMap] = await Promise.all([db.images.toArray(), listImageFileIds(token)])

  // Remove deleted image blobs from Drive
  await Promise.all(deletedImageIds.map(async id => {
    const fid = driveMap.get(id)
    if (fid) await fetch(`${BASE}/drive/v3/files/${fid}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
  }))

  // Upload new image blobs not yet in Drive
  await Promise.all(
    allImages
      .filter(img => !driveMap.has(img.id))
      .map(async img => {
        const form = new FormData()
        form.append('metadata', new Blob(
          [JSON.stringify({ name: `${IMG_PREFIX}${img.id}`, parents: ['appDataFolder'] })],
          { type: 'application/json' }
        ))
        form.append('media', img.blob)
        await fetch(`${BASE}/upload/drive/v3/files?uploadType=multipart`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
        })
      })
  )

  await Promise.all([saveRecipes(token), saveImageMeta(token)])
}

// Call on login and on tab-focus. Recipes update immediately; images load in background.
export async function loadAllFromDrive(token: string): Promise<void> {
  const recipes = await loadRecipesFromDrive(token)
  if (recipes) {
    await db.transaction('rw', db.recipes, async () => {
      await db.recipes.clear()
      await db.recipes.bulkPut(recipes)
    })
  }
  // Images download in background so UI is not blocked
  loadImagesFromDrive(token).catch(() => {})
}
