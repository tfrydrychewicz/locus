import { describe, expect, it } from 'vitest'
import { matchesFilter } from './note-filter.js'

const baseNote = {
  createdAt: '2025-06-15T10:00:00.000Z',
  updatedAt: '2025-06-16T12:00:00.000Z',
  templateId: 'tmpl_001',
}

describe('NoteFilter', () => {
  describe('matchesFilter', () => {
    it('matches with empty filter', () => {
      expect(matchesFilter(baseNote, {})).toBe(true)
    })

    it('filters archived=false excludes archived notes', () => {
      const archived = { ...baseNote, archivedAt: '2025-06-17T00:00:00.000Z' }
      expect(matchesFilter(archived, { archived: false })).toBe(false)
    })

    it('filters archived=false includes active notes', () => {
      expect(matchesFilter(baseNote, { archived: false })).toBe(true)
    })

    it('filters archived=true includes archived notes', () => {
      const archived = { ...baseNote, archivedAt: '2025-06-17T00:00:00.000Z' }
      expect(matchesFilter(archived, { archived: true })).toBe(true)
    })

    it('filters archived=true excludes active notes', () => {
      expect(matchesFilter(baseNote, { archived: true })).toBe(false)
    })

    it('filters by createdAfter', () => {
      expect(matchesFilter(baseNote, { createdAfter: '2025-06-14T00:00:00.000Z' })).toBe(true)
      expect(matchesFilter(baseNote, { createdAfter: '2025-06-16T00:00:00.000Z' })).toBe(false)
    })

    it('filters by createdBefore', () => {
      expect(matchesFilter(baseNote, { createdBefore: '2025-06-16T00:00:00.000Z' })).toBe(true)
      expect(matchesFilter(baseNote, { createdBefore: '2025-06-14T00:00:00.000Z' })).toBe(false)
    })

    it('filters by updatedAfter', () => {
      expect(matchesFilter(baseNote, { updatedAfter: '2025-06-15T00:00:00.000Z' })).toBe(true)
      expect(matchesFilter(baseNote, { updatedAfter: '2025-06-17T00:00:00.000Z' })).toBe(false)
    })

    it('filters by updatedBefore', () => {
      expect(matchesFilter(baseNote, { updatedBefore: '2025-06-17T00:00:00.000Z' })).toBe(true)
      expect(matchesFilter(baseNote, { updatedBefore: '2025-06-15T00:00:00.000Z' })).toBe(false)
    })

    it('filters by templateId', () => {
      expect(matchesFilter(baseNote, { templateId: 'tmpl_001' })).toBe(true)
      expect(matchesFilter(baseNote, { templateId: 'tmpl_999' })).toBe(false)
    })

    it('combines multiple filters', () => {
      expect(
        matchesFilter(baseNote, {
          archived: false,
          createdAfter: '2025-06-14T00:00:00.000Z',
          templateId: 'tmpl_001',
        }),
      ).toBe(true)

      expect(
        matchesFilter(baseNote, {
          archived: false,
          createdAfter: '2025-06-14T00:00:00.000Z',
          templateId: 'tmpl_wrong',
        }),
      ).toBe(false)
    })
  })
})
