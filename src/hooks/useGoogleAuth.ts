import { useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuthStore, getToken } from '../store/authStore'
import { loadAllFromDrive, clearDriveCache } from '../lib/drive'

export function useGoogleAuth() {
  const setAuth = useAuthStore(s => s.setAuth)
  const clearAuth = useAuthStore(s => s.clearAuth)
  const token = useAuthStore(s => {
    if (!s.accessToken || !s.tokenExpiry || Date.now() >= s.tokenExpiry) return null
    return s.accessToken
  })

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    onSuccess: async response => {
      setAuth(response.access_token, response.expires_in)
      await loadAllFromDrive(response.access_token)
    },
  })

  // Silent refresh: no UI shown — succeeds if Google session is still active
  const silentLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    prompt: 'none',
    onSuccess: async response => {
      setAuth(response.access_token, response.expires_in)
      await loadAllFromDrive(response.access_token)
    },
    onError: () => clearAuth(), // clear stale expired token so UI shows "Sign in"
  })

  // On mount: if we have a stored-but-expired token, try to refresh silently
  useEffect(() => {
    const { accessToken, tokenExpiry } = useAuthStore.getState()
    if (accessToken && tokenExpiry && Date.now() >= tokenExpiry) {
      silentLogin()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => { clearDriveCache(); clearAuth() }

  return { token, isSignedIn: !!token, login, logout, getToken }
}
