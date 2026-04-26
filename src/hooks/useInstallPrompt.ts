import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window { __installPrompt?: BeforeInstallPromptEvent }
}

export function useInstallPrompt() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as any).standalone === true)

  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => isStandalone ? null : (window.__installPrompt ?? null)
  )

  useEffect(() => {
    if (isStandalone) return

    // Pick up any event captured before React mounted
    if (window.__installPrompt && !prompt) setPrompt(window.__installPrompt)

    const handler = (e: Event) => {
      e.preventDefault()
      window.__installPrompt = e as BeforeInstallPromptEvent
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      window.__installPrompt = undefined
      setPrompt(null)
    }
  }

  return { canInstall: !isStandalone && !!prompt, install }
}
