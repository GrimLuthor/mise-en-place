import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../hooks/useTheme'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2c0 5-6 7-6 13a6 6 0 0012 0c0-6-6-8-6-13z" />
      <path d="M12 12c0 2.5-2 4-2 5.5a2 2 0 004 0C14 16 12 14.5 12 12z" />
    </svg>
  )
}

const icons: Record<Theme, React.ReactNode> = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  warm: <FlameIcon />,
}

const labels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  warm: 'Warm',
}

export default function ThemeToggleButton() {
  const { theme, cycleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`${labels[theme]} theme — click to change`}
      aria-label="Toggle color theme"
      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-accent hover:bg-surface transition-colors"
    >
      {icons[theme]}
    </button>
  )
}
