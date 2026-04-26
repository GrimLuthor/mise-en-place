import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { loadAllFromDrive, getDrivePendingPush } from '../lib/drive'

const SYNC_COOLDOWN_MS = 30_000

// Re-syncs from Drive whenever the tab becomes visible or the window regains focus.
export function useDriveSync() {
  const token = useAuthStore(s => {
    if (!s.accessToken || !s.tokenExpiry || Date.now() >= s.tokenExpiry) return null
    return s.accessToken
  })
  const syncingRef = useRef(false)
  const lastSyncRef = useRef(0)

  useEffect(() => {
    if (!token) return

    const sync = async () => {
      if (syncingRef.current) return
      if (Date.now() - lastSyncRef.current < SYNC_COOLDOWN_MS) return
      // If a local save is currently pushing to Drive, wait for it to finish
      // then skip the load — local DB is already authoritative.
      const pending = getDrivePendingPush()
      if (pending) { await pending; return }
      syncingRef.current = true
      lastSyncRef.current = Date.now()
      try { await loadAllFromDrive(token) } catch { /* silent */ }
      finally { syncingRef.current = false }
    }

    const onVisible = () => { if (document.visibilityState === 'visible') sync() }

    sync() // sync immediately on mount (covers page reload)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', sync)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', sync)
    }
  }, [token])
}
