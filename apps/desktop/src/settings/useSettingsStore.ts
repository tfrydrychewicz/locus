import { changeLocale, type SupportedLocale } from '@locus/i18n'
import { useCallback, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'
export type AppLanguage = SupportedLocale

export interface AppSettings {
  theme: Theme
  language: AppLanguage
}

const STORAGE_KEY = 'locus.settings'
const DEFAULT_SETTINGS: AppSettings = { theme: 'system', language: 'en' }

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system — follow OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

export function useSettingsStore() {
  const [saved, setSaved] = useState<AppSettings>(() => {
    const s = loadSettings()
    applyTheme(s.theme)
    return s
  })

  const [pending, setPending] = useState<AppSettings>(saved)

  const isDirty = saved.theme !== pending.theme || saved.language !== pending.language

  const set = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setPending((p) => ({ ...p, [key]: value }))
  }, [])

  const save = useCallback(async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
    applyTheme(pending.theme)
    if (pending.language !== saved.language) {
      await changeLocale(pending.language)
    }
    setSaved(pending)
  }, [pending, saved.language])

  const discard = useCallback(() => {
    setPending(saved)
  }, [saved])

  return { settings: pending, savedSettings: saved, isDirty, set, save, discard }
}
