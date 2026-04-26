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

  const logout = () => { clearDriveCache(); clearAuth() }

  return { token, isSignedIn: !!token, login, logout, getToken }
}
