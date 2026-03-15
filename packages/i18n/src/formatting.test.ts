import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  formatCompact,
  formatDate,
  formatDuration,
  formatListJoin,
  formatNumber,
  formatPercent,
} from './formatting.js'
import { i18n, initI18n } from './instance.js'

describe('formatting', () => {
  beforeAll(async () => {
    if (!i18n.isInitialized) await initI18n('en')
  })

  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  describe('formatDate', () => {
    it('formats a date in EN', () => {
      const result = formatDate(new Date(2025, 0, 15))
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('formats a date in PL', async () => {
      await i18n.changeLanguage('pl')
      const result = formatDate(new Date(2025, 0, 15))
      expect(result).toContain('sty')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })
  })

  describe('formatNumber', () => {
    it('formats a number in EN', () => {
      const result = formatNumber(1234567.89)
      expect(result).toContain('1')
      expect(result).toContain('234')
    })

    it('formats a number in PL', async () => {
      await i18n.changeLanguage('pl')
      const result = formatNumber(1234567.89)
      expect(result).toBeTruthy()
    })
  })

  describe('formatPercent', () => {
    it('formats as percentage', () => {
      const result = formatPercent(0.75)
      expect(result).toContain('75')
      expect(result).toContain('%')
    })
  })

  describe('formatCompact', () => {
    it('formats large numbers compactly', () => {
      const result = formatCompact(1500)
      expect(result).toBeTruthy()
    })
  })

  describe('formatDuration', () => {
    it('formats minutes only', () => {
      expect(formatDuration(45)).toBe('45m')
    })

    it('formats hours only', () => {
      expect(formatDuration(120)).toBe('2h')
    })

    it('formats hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m')
    })
  })

  describe('formatListJoin', () => {
    it('joins a list in EN', () => {
      const result = formatListJoin(['Alice', 'Bob', 'Charlie'])
      expect(result).toContain('Alice')
      expect(result).toContain('Bob')
      expect(result).toContain('Charlie')
    })

    it('joins a list in PL', async () => {
      await i18n.changeLanguage('pl')
      const result = formatListJoin(['Ala', 'Ola', 'Ela'])
      expect(result).toContain('Ala')
      expect(result).toContain('Ola')
      expect(result).toContain('Ela')
    })
  })
})
