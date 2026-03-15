import { describe, expect, it } from 'vitest'
import {
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isWithinRange,
  startOfDay,
  startOfWeek,
  toISODateString,
} from './date-utils.js'

describe('date-utils', () => {
  const jan15 = new Date(2025, 0, 15, 14, 30, 0)

  describe('startOfDay / endOfDay', () => {
    it('returns midnight of the same day', () => {
      const result = startOfDay(jan15)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('returns 23:59:59.999 of the same day', () => {
      const result = endOfDay(jan15)
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('startOfWeek', () => {
    it('returns Monday for weekStartsOn=1', () => {
      const wed = new Date(2025, 0, 15)
      const result = startOfWeek(wed, 1)
      expect(result.getDay()).toBe(1)
      expect(result.getDate()).toBe(13)
    })

    it('returns Sunday for weekStartsOn=0', () => {
      const wed = new Date(2025, 0, 15)
      const result = startOfWeek(wed, 0)
      expect(result.getDay()).toBe(0)
      expect(result.getDate()).toBe(12)
    })
  })

  describe('addDays / addMinutes / addHours', () => {
    it('adds days correctly', () => {
      const result = addDays(jan15, 5)
      expect(result.getDate()).toBe(20)
    })

    it('subtracts days with negative value', () => {
      const result = addDays(jan15, -10)
      expect(result.getDate()).toBe(5)
    })

    it('adds minutes correctly', () => {
      const result = addMinutes(jan15, 45)
      expect(result.getHours()).toBe(15)
      expect(result.getMinutes()).toBe(15)
    })

    it('adds hours correctly', () => {
      const result = addHours(jan15, 3)
      expect(result.getHours()).toBe(17)
      expect(result.getMinutes()).toBe(30)
    })
  })

  describe('isSameDay', () => {
    it('returns true for same day different times', () => {
      const a = new Date(2025, 0, 15, 10, 0)
      const b = new Date(2025, 0, 15, 22, 0)
      expect(isSameDay(a, b)).toBe(true)
    })

    it('returns false for different days', () => {
      const a = new Date(2025, 0, 15)
      const b = new Date(2025, 0, 16)
      expect(isSameDay(a, b)).toBe(false)
    })
  })

  describe('isBefore / isAfter', () => {
    it('detects before correctly', () => {
      const a = new Date(2025, 0, 10)
      const b = new Date(2025, 0, 15)
      expect(isBefore(a, b)).toBe(true)
      expect(isBefore(b, a)).toBe(false)
    })

    it('detects after correctly', () => {
      const a = new Date(2025, 0, 20)
      const b = new Date(2025, 0, 15)
      expect(isAfter(a, b)).toBe(true)
      expect(isAfter(b, a)).toBe(false)
    })
  })

  describe('isWithinRange', () => {
    it('returns true when date is in range', () => {
      const start = new Date(2025, 0, 10)
      const end = new Date(2025, 0, 20)
      expect(isWithinRange(jan15, start, end)).toBe(true)
    })

    it('returns true at boundaries', () => {
      const start = new Date(2025, 0, 15, 14, 30, 0)
      const end = new Date(2025, 0, 20)
      expect(isWithinRange(jan15, start, end)).toBe(true)
    })

    it('returns false outside range', () => {
      const start = new Date(2025, 0, 16)
      const end = new Date(2025, 0, 20)
      expect(isWithinRange(jan15, start, end)).toBe(false)
    })
  })

  describe('difference functions', () => {
    it('calculates minutes difference', () => {
      const a = new Date(2025, 0, 15, 14, 0)
      const b = new Date(2025, 0, 15, 13, 0)
      expect(differenceInMinutes(a, b)).toBe(60)
    })

    it('calculates hours difference', () => {
      const a = new Date(2025, 0, 15, 17, 0)
      const b = new Date(2025, 0, 15, 14, 0)
      expect(differenceInHours(a, b)).toBe(3)
    })

    it('calculates days difference', () => {
      const a = new Date(2025, 0, 20)
      const b = new Date(2025, 0, 15)
      expect(differenceInDays(a, b)).toBe(5)
    })

    it('returns negative for reverse order', () => {
      const a = new Date(2025, 0, 10)
      const b = new Date(2025, 0, 15)
      expect(differenceInDays(a, b)).toBe(-5)
    })
  })

  describe('toISODateString', () => {
    it('formats as YYYY-MM-DD', () => {
      expect(toISODateString(jan15)).toBe('2025-01-15')
    })

    it('pads single-digit months and days', () => {
      const date = new Date(2025, 2, 5)
      expect(toISODateString(date)).toBe('2025-03-05')
    })
  })

  describe('DateLike input types', () => {
    it('accepts Date object', () => {
      expect(toISODateString(new Date(2025, 5, 15))).toBe('2025-06-15')
    })

    it('accepts ISO string', () => {
      expect(toISODateString('2025-06-15T00:00:00.000Z')).toBeDefined()
    })

    it('accepts timestamp number', () => {
      const ts = new Date(2025, 5, 15).getTime()
      expect(toISODateString(ts)).toBe('2025-06-15')
    })
  })
})
