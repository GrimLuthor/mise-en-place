import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { loadAllFromDrive } from '../lib/drive'

// Re-syncs from Drive whenever the tab becomes visible or the window regains focus.
export function useDriveSync() {
  const token = useAuthStore(s => {
    if (!s.accessToken || !s.tokenExpiry || Date.now() >= s.tokenExpiry) return null
    return s.accessToken
  })
  const syncingRef = useRef(false)

  useEffect(() => {
    if (!token) return

    const sync = async () => {
      if (syncingRef.current) return
      syncingRef.current = true
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
