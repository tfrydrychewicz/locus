import type { Result, ULID } from '@locus/shared'
import { err, ok } from '@locus/shared'
import type { Note } from '../domain/note.js'
import type { NoteRepository } from '../ports/note-repository.js'

export async function getNoteUseCase(repo: NoteRepository, id: ULID): Promise<Result<Note, Error>> {
  try {
    const note = await repo.findById(id)
    if (!note) {
      return err(new Error(`Note not found: ${id}`))
    }
    return ok(note)
  } catch (e) {
    return err(e instanceof Error ? e : new Error('Failed to get note'))
  }
}
