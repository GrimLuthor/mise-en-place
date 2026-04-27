import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'warm'
const THEMES: Theme[] = ['light', 'dark', 'warm']

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    return stored && THEMES.includes(stored) ? stored : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const cycleTheme = () => setTheme(t => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length])

  return { theme, cycleTheme }
}
