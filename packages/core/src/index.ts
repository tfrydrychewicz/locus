export {
  applyNoteUpdate,
  archiveNote,
  type CreateNoteInput,
  createNote,
  createNoteSchema,
  isArchived,
  type Note,
  type NoteSearchResult,
  type UpdateNoteInput,
  updateNoteSchema,
} from './domain/note.js'

export { matchesFilter, type NoteFilter } from './domain/note-filter.js'

export type { NoteRepository } from './ports/note-repository.js'

export { createNoteUseCase } from './use-cases/create-note.js'
export { deleteNoteUseCase } from './use-cases/delete-note.js'
export { getNoteUseCase } from './use-cases/get-note.js'
export { listNotesUseCase, searchNotesUseCase } from './use-cases/search-notes.js'
export { updateNoteUseCase } from './use-cases/update-note.js'
