import type { Result, ULID } from '@locus/shared'
import { err, ok } from '@locus/shared'
import {
  applyNoteUpdate,
  type Note,
  type UpdateNoteInput,
  updateNoteSchema,
} from '../domain/note.js'
import type { NoteRepository } from '../ports/note-repository.js'

export async function updateNoteUseCase(
  repo: NoteRepository,
  input: UpdateNoteInput,
): Promise<Result<Note, Error>> {
  const parsed = updateNoteSchema.safeParse(input)
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Invalid input'))
  }

  const noteId = parsed.data.id as ULID

  try {
    const existing = await repo.findById(noteId)
    if (!existing) {
      return err(new Error(`Note not found: ${noteId}`))
    }

    const { id: _, ...updates } = parsed.data
    const updated = applyNoteUpdate(existing, updates)
    await repo.save(updated)
    return ok(updated)
  } catch (e) {
    return err(e instanceof Error ? e : new Error('Failed to update note'))
  }
}
