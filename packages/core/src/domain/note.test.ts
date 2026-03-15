import { describe, expect, it } from 'vitest'
import {
  applyNoteUpdate,
  archiveNote,
  createNote,
  createNoteSchema,
  isArchived,
  updateNoteSchema,
} from './note.js'

describe('Note domain model', () => {
  describe('createNote', () => {
    it('creates a note with defaults', () => {
      const note = createNote({})
      expect(note.id).toHaveLength(26)
      expect(note.title).toBe('Untitled')
      expect(note.body).toBe('')
      expect(note.bodyPlain).toBe('')
      expect(note.embeddingDirty).toBe(true)
      expect(note.createdAt).toBeTruthy()
      expect(note.updatedAt).toBeTruthy()
      expect(note.archivedAt).toBeUndefined()
    })

    it('creates a note with provided title', () => {
      const note = createNote({ title: 'Meeting Notes' })
      expect(note.title).toBe('Meeting Notes')
    })

    it('creates a note with body', () => {
      const note = createNote({ body: '# Hello' })
      expect(note.body).toBe('# Hello')
    })

    it('creates a note with templateId', () => {
      const note = createNote({ templateId: '01HQRX5K3M9P0G6B8V7CWDYF2N' })
      expect(note.templateId).toBe('01HQRX5K3M9P0G6B8V7CWDYF2N')
    })

    it('generates unique IDs', () => {
      const a = createNote({})
      const b = createNote({})
      expect(a.id).not.toBe(b.id)
    })
  })

  describe('applyNoteUpdate', () => {
    it('updates title', () => {
      const note = { ...createNote({ title: 'Old' }), updatedAt: '2020-01-01T00:00:00.000Z' }
      const updated = applyNoteUpdate(note, { title: 'New' })
      expect(updated.title).toBe('New')
      expect(updated.updatedAt).not.toBe(note.updatedAt)
    })

    it('updates body and marks embedding dirty', () => {
      const note = createNote({})
      const withCleanEmbedding = { ...note, embeddingDirty: false }
      const updated = applyNoteUpdate(withCleanEmbedding, { body: 'new content' })
      expect(updated.body).toBe('new content')
      expect(updated.embeddingDirty).toBe(true)
    })

    it('preserves fields not in update', () => {
      const note = createNote({ title: 'Keep', body: 'Keep body' })
      const updated = applyNoteUpdate(note, { title: 'Changed' })
      expect(updated.body).toBe('Keep body')
    })
  })

  describe('archiveNote', () => {
    it('sets archivedAt', () => {
      const note = createNote({})
      const archived = archiveNote(note)
      expect(archived.archivedAt).toBeTruthy()
    })
  })

  describe('isArchived', () => {
    it('returns false for active notes', () => {
      const note = createNote({})
      expect(isArchived(note)).toBe(false)
    })

    it('returns true for archived notes', () => {
      const note = archiveNote(createNote({}))
      expect(isArchived(note)).toBe(true)
    })
  })

  describe('createNoteSchema', () => {
    it('accepts empty input', () => {
      const result = createNoteSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts valid title', () => {
      const result = createNoteSchema.safeParse({ title: 'Hello' })
      expect(result.success).toBe(true)
    })

    it('rejects empty title when provided', () => {
      const result = createNoteSchema.safeParse({ title: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('updateNoteSchema', () => {
    it('requires id', () => {
      const result = updateNoteSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('accepts id with optional fields', () => {
      const result = updateNoteSchema.safeParse({ id: 'abc', title: 'New' })
      expect(result.success).toBe(true)
    })
  })
})
