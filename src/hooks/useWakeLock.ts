import { useEffect, useRef } from 'react'

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    const acquire = async () => {
      try {
        lockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // Not supported or permission denied — continue without it
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      lockRef.current?.release().catch(() => {})
    }
  }, [])
}
