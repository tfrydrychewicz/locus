import i18next, { type i18n as I18nInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources.js'
import { DEFAULT_LOCALE, DEFAULT_NAMESPACE, NAMESPACES, SUPPORTED_LOCALES } from './types.js'

export const i18n: I18nInstance = i18next.createInstance()

export async function initI18n(locale?: string): Promise<I18nInstance> {
  await i18n.use(initReactI18next).init({
    resources: resources as unknown as Record<string, Record<string, Record<string, string>>>,
    lng: locale ?? DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [...NAMESPACES],
    supportedLngs: [...SUPPORTED_LOCALES],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

  return i18n
}
