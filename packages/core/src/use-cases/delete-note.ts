import type { Result, ULID } from '@locus/shared'
import { err, ok } from '@locus/shared'
import type { NoteRepository } from '../ports/note-repository.js'

export async function deleteNoteUseCase(
  repo: NoteRepository,
  id: ULID,
  hard = false,
): Promise<Result<void, Error>> {
  try {
    const existing = await repo.findById(id)
    if (!existing) {
      return err(new Error(`Note not found: ${id}`))
    }

    if (hard) {
      await repo.hardDelete(id)
    } else {
      await repo.softDelete(id)
    }
    return ok(undefined)
  } catch (e) {
    return err(e instanceof Error ? e : new Error('Failed to delete note'))
  }
}
