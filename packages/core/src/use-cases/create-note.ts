import type { Result } from '@locus/shared'
import { err, ok } from '@locus/shared'
import { type CreateNoteInput, createNote, createNoteSchema, type Note } from '../domain/note.js'
import type { NoteRepository } from '../ports/note-repository.js'

export async function createNoteUseCase(
  repo: NoteRepository,
  input: CreateNoteInput,
): Promise<Result<Note, Error>> {
  const parsed = createNoteSchema.safeParse(input)
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Invalid input'))
  }

  const note = createNote(parsed.data)
  try {
    await repo.save(note)
    return ok(note)
  } catch (e) {
    return err(e instanceof Error ? e : new Error('Failed to save note'))
  }
}
