import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  tokenExpiry: number | null  // ms timestamp
  setAuth: (token: string, expiresIn: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      tokenExpiry: null,
      setAuth: (token, expiresIn) =>
        set({ accessToken: token, tokenExpiry: Date.now() + expiresIn * 1000 }),
      clearAuth: () => set({ accessToken: null, tokenExpiry: null }),
    }),
    { name: 'mise-auth' }
  )
)

// Call outside React (e.g. in save handlers) to get token if still valid
export function getToken(): string | null {
  const { accessToken, tokenExpiry } = useAuthStore.getState()
  if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) return null
  return accessToken
}
