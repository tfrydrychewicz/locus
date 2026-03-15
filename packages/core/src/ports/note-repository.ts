import type { Page, PaginationParams, ULID } from '@locus/shared'
import type { Note, NoteSearchResult } from '../domain/note.js'
import type { NoteFilter } from '../domain/note-filter.js'

export interface NoteRepository {
  findById(id: ULID): Promise<Note | null>
  findAll(filter?: NoteFilter, page?: PaginationParams): Promise<Page<Note>>
  save(note: Note): Promise<void>
  softDelete(id: ULID): Promise<void>
  hardDelete(id: ULID): Promise<void>
  searchFTS(query: string, limit?: number): Promise<NoteSearchResult[]>
  countByFilter(filter?: NoteFilter): Promise<number>
}
