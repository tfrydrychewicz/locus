import { describe, expect, it } from 'vitest'
import { resources } from './resources.js'
import { NAMESPACES, SUPPORTED_LOCALES } from './types.js'

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys.sort()
}

describe('locale key parity', () => {
  const enResources = resources.en

  for (const ns of NAMESPACES) {
    describe(`namespace: ${ns}`, () => {
      it('EN namespace file is not empty', () => {
        const keys = flattenKeys(enResources[ns] as unknown as Record<string, unknown>)
        expect(keys.length).toBeGreaterThan(0)
      })

      for (const locale of SUPPORTED_LOCALES) {
        if (locale === 'en') continue

        it(`${locale.toUpperCase()} has all keys from EN`, () => {
          const enKeys = flattenKeys(enResources[ns] as unknown as Record<string, unknown>)
          const localeResources = resources[locale]
          const localeKeys = flattenKeys(localeResources[ns] as unknown as Record<string, unknown>)

          const missingKeys = enKeys.filter((k) => !localeKeys.includes(k))

          expect(missingKeys, `Missing keys in ${locale}/${ns}: ${missingKeys.join(', ')}`).toEqual(
            [],
          )
        })

        it(`${locale.toUpperCase()} has no extra keys beyond EN`, () => {
          const enKeys = flattenKeys(enResources[ns] as unknown as Record<string, unknown>)
          const localeResources = resources[locale]
          const localeKeys = flattenKeys(localeResources[ns] as unknown as Record<string, unknown>)

          const extraKeys = localeKeys.filter((k) => !enKeys.includes(k))

          expect(extraKeys, `Extra keys in ${locale}/${ns}: ${extraKeys.join(', ')}`).toEqual([])
        })
      }
    })
  }

  it('all supported locales have all namespaces', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const ns of NAMESPACES) {
        expect(resources[locale][ns], `Missing namespace ${ns} for locale ${locale}`).toBeDefined()
      }
    }
  })
})
