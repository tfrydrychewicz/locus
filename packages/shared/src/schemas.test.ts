import { describe, expect, it } from 'vitest'
import {
  dateStringSchema,
  dateTimeSchema,
  emailSchema,
  hexColorSchema,
  nonEmptyStringSchema,
  paginationSchema,
  positiveIntSchema,
  ulidSchema,
  urlSchema,
} from './schemas.js'

describe('Zod schemas', () => {
  describe('ulidSchema', () => {
    it('accepts a valid ULID', () => {
      expect(ulidSchema.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAV').success).toBe(true)
    })

    it('rejects lowercase', () => {
      expect(ulidSchema.safeParse('01arz3ndektsv4rrffq69g5fav').success).toBe(false)
    })

    it('rejects wrong length', () => {
      expect(ulidSchema.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FA').success).toBe(false)
    })

    it('rejects invalid characters (I, L, O, U)', () => {
      expect(ulidSchema.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAI').success).toBe(false)
      expect(ulidSchema.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAL').success).toBe(false)
      expect(ulidSchema.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAO').success).toBe(false)
      expect(ulidSchema.safeParse('01ARZ3NDEKTSV4RRFFQ69G5FAU').success).toBe(false)
    })
  })

  describe('dateTimeSchema', () => {
    it('accepts valid ISO 8601 datetime', () => {
      expect(dateTimeSchema.safeParse('2025-01-15T14:30:00Z').success).toBe(true)
      expect(dateTimeSchema.safeParse('2025-01-15T14:30:00.000Z').success).toBe(true)
    })

    it('rejects invalid datetime', () => {
      expect(dateTimeSchema.safeParse('2025-01-15').success).toBe(false)
      expect(dateTimeSchema.safeParse('not-a-date').success).toBe(false)
    })
  })

  describe('dateStringSchema', () => {
    it('accepts YYYY-MM-DD', () => {
      expect(dateStringSchema.safeParse('2025-01-15').success).toBe(true)
    })

    it('rejects other formats', () => {
      expect(dateStringSchema.safeParse('01/15/2025').success).toBe(false)
      expect(dateStringSchema.safeParse('2025-1-15').success).toBe(false)
    })
  })

  describe('nonEmptyStringSchema', () => {
    it('accepts non-empty strings', () => {
      expect(nonEmptyStringSchema.safeParse('hello').success).toBe(true)
    })

    it('rejects empty string', () => {
      expect(nonEmptyStringSchema.safeParse('').success).toBe(false)
    })

    it('rejects whitespace-only (after trim)', () => {
      expect(nonEmptyStringSchema.safeParse('   ').success).toBe(false)
    })
  })

  describe('positiveIntSchema', () => {
    it('accepts positive integers', () => {
      expect(positiveIntSchema.safeParse(1).success).toBe(true)
      expect(positiveIntSchema.safeParse(100).success).toBe(true)
    })

    it('rejects zero and negatives', () => {
      expect(positiveIntSchema.safeParse(0).success).toBe(false)
      expect(positiveIntSchema.safeParse(-1).success).toBe(false)
    })

    it('rejects floats', () => {
      expect(positiveIntSchema.safeParse(1.5).success).toBe(false)
    })
  })

  describe('paginationSchema', () => {
    it('accepts valid pagination params', () => {
      const result = paginationSchema.safeParse({ cursor: 'abc', limit: 20 })
      expect(result.success).toBe(true)
    })

    it('applies default limit of 50', () => {
      const result = paginationSchema.parse({})
      expect(result.limit).toBe(50)
    })

    it('rejects limit over 200', () => {
      expect(paginationSchema.safeParse({ limit: 201 }).success).toBe(false)
    })

    it('rejects limit under 1', () => {
      expect(paginationSchema.safeParse({ limit: 0 }).success).toBe(false)
    })
  })

  describe('hexColorSchema', () => {
    it('accepts valid hex colors', () => {
      expect(hexColorSchema.safeParse('#ff0000').success).toBe(true)
      expect(hexColorSchema.safeParse('#5B8DEF').success).toBe(true)
    })

    it('rejects shorthand hex', () => {
      expect(hexColorSchema.safeParse('#fff').success).toBe(false)
    })

    it('rejects missing hash', () => {
      expect(hexColorSchema.safeParse('ff0000').success).toBe(false)
    })
  })

  describe('emailSchema', () => {
    it('accepts valid emails', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(emailSchema.safeParse('not-an-email').success).toBe(false)
    })
  })

  describe('urlSchema', () => {
    it('accepts valid URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true)
    })

    it('rejects invalid URLs', () => {
      expect(urlSchema.safeParse('not-a-url').success).toBe(false)
    })
  })
})
