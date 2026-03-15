import { i18n } from './instance.js'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from './types.js'

export function getCurrentLocale(): SupportedLocale {
  return (i18n.language as SupportedLocale) ?? DEFAULT_LOCALE
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

export async function changeLocale(locale: SupportedLocale): Promise<void> {
  await i18n.changeLanguage(locale)
}

export function getLocaleDisplayName(locale: SupportedLocale, inLocale?: SupportedLocale): string {
  const displayNames = new Intl.DisplayNames([inLocale ?? locale], { type: 'language' })
  return displayNames.of(locale) ?? locale
}

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

export function getLocaleDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}

export function getAILocaleInstruction(locale: SupportedLocale): string | null {
  if (locale === 'en') return null
  const displayName = getLocaleDisplayName(locale, 'en')
  return `Respond in ${displayName}.`
}
