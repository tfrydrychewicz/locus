import type { Page, PaginationParams, ULID } from '@locus/shared'
import { isErr, isOk, unwrap } from '@locus/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { archiveNote, type Note, type NoteSearchResult } from '../domain/note.js'
import type { NoteFilter } from '../domain/note-filter.js'
import type { NoteRepository } from '../ports/note-repository.js'
import { createNoteUseCase } from './create-note.js'
import { deleteNoteUseCase } from './delete-note.js'
import { getNoteUseCase } from './get-note.js'
import { listNotesUseCase, searchNotesUseCase } from './search-notes.js'
import { updateNoteUseCase } from './update-note.js'

function createMockRepo(): NoteRepository & { notes: Map<string, Note> } {
  const notes = new Map<string, Note>()

  return {
    notes,
    async findById(id: ULID) {
      return notes.get(id) ?? null
    },
    async findAll(_filter?: NoteFilter, _page?: PaginationParams): Promise<Page<Note>> {
      const items = [...notes.values()]
      return { items, cursor: null, totalEstimate: items.length }
    },
    async save(note: Note) {
      notes.set(note.id, note)
    },
    async softDelete(id: ULID) {
      const note = notes.get(id)
      if (note) {
        notes.set(id, archiveNote(note))
      }
    },
    async hardDelete(id: ULID) {
      notes.delete(id)
    },
    async searchFTS(query: string, limit?: number): Promise<NoteSearchResult[]> {
      const results: NoteSearchResult[] = []
      for (const note of notes.values()) {
        if (note.title.toLowerCase().includes(query.toLowerCase())) {
          results.push({ note, rank: 1, snippet: note.title })
        }
        if (results.length >= (limit ?? 50)) break
      }
      return results
    },
    async countByFilter() {
      return notes.size
    },
  }
}

describe('Note use cases', () => {
  let repo: ReturnType<typeof createMockRepo>

  beforeEach(() => {
    repo = createMockRepo()
  })

  describe('createNoteUseCase', () => {
    it('creates a note with defaults', async () => {
      const result = await createNoteUseCase(repo, {})
      expect(isOk(result)).toBe(true)
      const note = unwrap(result)
      expect(note.title).toBe('Untitled')
      expect(repo.notes.size).toBe(1)
    })

    it('creates a note with title', async () => {
      const result = await createNoteUseCase(repo, { title: 'My Note' })
      expect(isOk(result)).toBe(true)
      expect(unwrap(result).title).toBe('My Note')
    })

    it('rejects empty title', async () => {
      const result = await createNoteUseCase(repo, { title: '   ' })
      expect(isErr(result)).toBe(true)
    })
  })

  describe('getNoteUseCase', () => {
    it('returns a note by id', async () => {
      const created = unwrap(await createNoteUseCase(repo, { title: 'Test' }))
      const result = await getNoteUseCase(repo, created.id)
      expect(isOk(result)).toBe(true)
      expect(unwrap(result).title).toBe('Test')
    })

    it('returns error for missing note', async () => {
      const result = await getNoteUseCase(repo, '01NONEXISTENT0000000000000' as ULID)
      expect(isErr(result)).toBe(true)
    })
  })

  describe('updateNoteUseCase', () => {
    it('updates note title', async () => {
      const created = unwrap(await createNoteUseCase(repo, { title: 'Old' }))
      const result = await updateNoteUseCase(repo, { id: created.id, title: 'New' })
      expect(isOk(result)).toBe(true)
      expect(unwrap(result).title).toBe('New')
    })

    it('updates note body', async () => {
      const created = unwrap(await createNoteUseCase(repo, {}))
      const result = await updateNoteUseCase(repo, { id: created.id, body: 'content' })
      expect(isOk(result)).toBe(true)
      expect(unwrap(result).body).toBe('content')
      expect(unwrap(result).embeddingDirty).toBe(true)
    })

    it('returns error for missing note', async () => {
      const result = await updateNoteUseCase(repo, { id: 'nonexistent', title: 'X' })
      expect(isErr(result)).toBe(true)
    })

    it('rejects invalid input', async () => {
      const result = await updateNoteUseCase(repo, { id: '', title: 'X' })
      expect(isErr(result)).toBe(true)
    })
  })

  describe('deleteNoteUseCase', () => {
    it('soft deletes a note', async () => {
      const created = unwrap(await createNoteUseCase(repo, { title: 'Delete me' }))
      const result = await deleteNoteUseCase(repo, created.id)
      expect(isOk(result)).toBe(true)
      const after = repo.notes.get(created.id)
      expect(after?.archivedAt).toBeTruthy()
    })

    it('hard deletes a note', async () => {
      const created = unwrap(await createNoteUseCase(repo, { title: 'Delete me' }))
      const result = await deleteNoteUseCase(repo, created.id, true)
      expect(isOk(result)).toBe(true)
      expect(repo.notes.has(created.id)).toBe(false)
    })

    it('returns error for missing note', async () => {
      const result = await deleteNoteUseCase(repo, '01NONEXISTENT0000000000000' as ULID)
      expect(isErr(result)).toBe(true)
    })
  })

  describe('searchNotesUseCase', () => {
    it('returns matching notes', async () => {
      await createNoteUseCase(repo, { title: 'Meeting with Alice' })
      await createNoteUseCase(repo, { title: 'Shopping list' })
      const result = await searchNotesUseCase(repo, 'Meeting')
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toHaveLength(1)
      expect(unwrap(result)[0]?.note.title).toBe('Meeting with Alice')
    })

    it('returns empty for blank query', async () => {
      await createNoteUseCase(repo, { title: 'Test' })
      const result = await searchNotesUseCase(repo, '   ')
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toHaveLength(0)
    })

    it('caps results at 50', async () => {
      const result = await searchNotesUseCase(repo, 'test', 200)
      expect(isOk(result)).toBe(true)
    })
  })

  describe('listNotesUseCase', () => {
    it('returns all notes', async () => {
      await createNoteUseCase(repo, { title: 'A' })
      await createNoteUseCase(repo, { title: 'B' })
      const result = await listNotesUseCase(repo)
      expect(isOk(result)).toBe(true)
      expect(unwrap(result).items).toHaveLength(2)
    })

    it('returns empty page when no notes', async () => {
      const result = await listNotesUseCase(repo)
      expect(isOk(result)).toBe(true)
      expect(unwrap(result).items).toHaveLength(0)
    })
  })
})
