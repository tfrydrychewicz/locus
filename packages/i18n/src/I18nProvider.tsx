import { type ReactNode, useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { i18n, initI18n } from './instance.js'
import type { SupportedLocale } from './types.js'

interface I18nProviderProps {
  locale?: SupportedLocale
  children: ReactNode
}

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const [ready, setReady] = useState(i18n.isInitialized)

  useEffect(() => {
    if (!i18n.isInitialized) {
      initI18n(locale).then(() => setReady(true))
    } else if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  if (!ready) return null

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
