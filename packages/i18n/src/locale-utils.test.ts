import { describe, expect, it } from 'vitest'
import {
  getAILocaleInstruction,
  getLocaleDirection,
  getLocaleDisplayName,
  isSupportedLocale,
} from './locale-utils.js'

describe('locale-utils', () => {
  describe('isSupportedLocale', () => {
    it('returns true for en', () => {
      expect(isSupportedLocale('en')).toBe(true)
    })

    it('returns true for pl', () => {
      expect(isSupportedLocale('pl')).toBe(true)
    })

    it('returns false for unsupported locales', () => {
      expect(isSupportedLocale('de')).toBe(false)
      expect(isSupportedLocale('fr')).toBe(false)
      expect(isSupportedLocale('')).toBe(false)
    })
  })

  describe('getLocaleDisplayName', () => {
    it('returns display name for en in en', () => {
      const name = getLocaleDisplayName('en', 'en')
      expect(name.toLowerCase()).toContain('english')
    })

    it('returns display name for pl in en', () => {
      const name = getLocaleDisplayName('pl', 'en')
      expect(name.toLowerCase()).toContain('polish')
    })

    it('returns display name for pl in pl', () => {
      const name = getLocaleDisplayName('pl', 'pl')
      expect(name.toLowerCase()).toContain('polski')
    })
  })

  describe('getLocaleDirection', () => {
    it('returns ltr for en', () => {
      expect(getLocaleDirection('en')).toBe('ltr')
    })

    it('returns ltr for pl', () => {
      expect(getLocaleDirection('pl')).toBe('ltr')
    })
  })

  describe('getAILocaleInstruction', () => {
    it('returns null for en', () => {
      expect(getAILocaleInstruction('en')).toBeNull()
    })

    it('returns instruction for pl', () => {
      const instruction = getAILocaleInstruction('pl')
      expect(instruction).toContain('Respond in')
      expect(instruction?.toLowerCase()).toContain('polish')
    })
  })
})
