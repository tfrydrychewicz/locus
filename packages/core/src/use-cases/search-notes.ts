import type { Page, PaginationParams, Result } from '@locus/shared'
import { err, ok } from '@locus/shared'
import type { Note, NoteSearchResult } from '../domain/note.js'
import type { NoteFilter } from '../domain/note-filter.js'
import type { NoteRepository } from '../ports/note-repository.js'

const MAX_SEARCH_RESULTS = 50

export async function searchNotesUseCase(
  repo: NoteRepository,
  query: string,
  limit?: number,
): Promise<Result<NoteSearchResult[], Error>> {
  if (!query.trim()) {
    return ok([])
  }

  const effectiveLimit = Math.min(limit ?? MAX_SEARCH_RESULTS, MAX_SEARCH_RESULTS)

  try {
    const results = await repo.searchFTS(query, effectiveLimit)
    return ok(results)
  } catch (e) {
    return err(e instanceof Error ? e : new Error('Search failed'))
  }
}

export async function listNotesUseCase(
  repo: NoteRepository,
  filter?: NoteFilter,
  page?: PaginationParams,
): Promise<Result<Page<Note>, Error>> {
  try {
    const result = await repo.findAll(filter, page)
    return ok(result)
  } catch (e) {
    return err(e instanceof Error ? e : new Error('Failed to list notes'))
  }
}
