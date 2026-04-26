import { useState, useEffect, useRef } from 'react'

// useMemo can't be used here: React Strict Mode revokes URLs during its
// simulated unmount but doesn't re-run memos on remount, leaving stale blob refs.
// useEffect does re-run on remount, so URLs are recreated correctly.
export function useObjectUrls(items: { id: string; blob: Blob }[]) {
  const urlMapRef = useRef<Map<string, string>>(new Map())
  const [, tick] = useState(0)

  useEffect(() => {
    const currentIds = new Set(items.map(i => i.id))
    let changed = false

    for (const [id, url] of urlMapRef.current) {
      if (!currentIds.has(id)) {
        URL.revokeObjectURL(url)
        urlMapRef.current.delete(id)
        changed = true
      }
    }
    for (const item of items) {
      if (!urlMapRef.current.has(item.id)) {
        urlMapRef.current.set(item.id, URL.createObjectURL(item.blob))
        changed = true
      }
    }
    if (changed) tick(n => n + 1)
  }, [items])

  // Revoke all on unmount
  useEffect(() => () => {
    for (const url of urlMapRef.current.values()) URL.revokeObjectURL(url)
    urlMapRef.current.clear()
  }, [])

  return (id: string) => urlMapRef.current.get(id)
}
