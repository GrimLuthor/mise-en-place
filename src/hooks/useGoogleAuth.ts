import { useGoogleLogin } from '@react-oauth/google'
import { useAuthStore, getToken } from '../store/authStore'
import { loadFromDrive } from '../lib/drive'
import { db } from '../db/db'

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
      const recipes = await loadFromDrive(response.access_token)
      if (recipes && recipes.length > 0) {
        await db.transaction('rw', db.recipes, async () => {
          await db.recipes.clear()
          await db.recipes.bulkPut(recipes)
        })
      }
    },
  })

  return { token, isSignedIn: !!token, login, logout: clearAuth, getToken }
}
