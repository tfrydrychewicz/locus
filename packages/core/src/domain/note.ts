import type { ULID } from '@locus/shared'
import { generateId } from '@locus/shared'
import { z } from 'zod'

export interface Note {
  readonly id: ULID
  readonly title: string
  readonly body: string
  readonly bodyPlain: string
  readonly templateId?: ULID
  readonly embeddingDirty: boolean
  readonly createdAt: string
  readonly updatedAt: string
  readonly archivedAt?: string
}

export interface NoteSearchResult {
  readonly note: Note
  readonly rank: number
  readonly snippet?: string
}

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title must not be empty').optional(),
  body: z.string().optional().default(''),
  templateId: z.string().optional(),
})

export type CreateNoteInput = z.input<typeof createNoteSchema>

export const updateNoteSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, 'Title must not be empty').optional(),
  body: z.string().optional(),
  bodyPlain: z.string().optional(),
})

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>

export function createNote(input: CreateNoteInput): Note {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: input.title ?? 'Untitled',
    body: input.body ?? '',
    bodyPlain: '',
    templateId: input.templateId as ULID | undefined,
    embeddingDirty: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyNoteUpdate(note: Note, input: Omit<UpdateNoteInput, 'id'>): Note {
  return {
    ...note,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.body !== undefined && { body: input.body, embeddingDirty: true }),
    ...(input.bodyPlain !== undefined && { bodyPlain: input.bodyPlain }),
    updatedAt: new Date().toISOString(),
  }
}

export function archiveNote(note: Note): Note {
  return {
    ...note,
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function isArchived(note: Note): boolean {
  return note.archivedAt !== undefined
}
