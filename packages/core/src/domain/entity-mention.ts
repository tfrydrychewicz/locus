import { generateId, type ULID } from '@locus/shared'
import { z } from 'zod'

// ── EntityMention ─────────────────────────────────────────────────────────────

export type MentionType =
  | 'inline' // @mention typed directly in note body
  | 'property' // entity stored in a relation field

export interface EntityMention {
  readonly id: ULID
  readonly noteId: ULID
  readonly entityId: ULID
  readonly mentionType: MentionType
  readonly offset?: number // character offset in note body (inline only)
  readonly createdAt: string // ISO 8601
}

// ── NoteRelation ──────────────────────────────────────────────────────────────

export type NoteRelationType =
  | 'link' // [[note link]] typed in body
  | 'embed' // embedded inline
  | 'reference' // back-reference (auto-created when note A links to note B)

export interface NoteRelation {
  readonly id: ULID
  readonly fromNoteId: ULID
  readonly toNoteId: ULID
  readonly relationType: NoteRelationType
  readonly createdAt: string
}

// ── Schemas ───────────────────────────────────────────────────────────────────

export const createEntityMentionSchema = z.object({
  noteId: z.string().min(1),
  entityId: z.string().min(1),
  mentionType: z.enum(['inline', 'property']).default('inline'),
  offset: z.number().int().min(0).optional(),
})

export type CreateEntityMentionInput = z.input<typeof createEntityMentionSchema>

export const createNoteRelationSchema = z.object({
  fromNoteId: z.string().min(1),
  toNoteId: z.string().min(1),
  relationType: z.enum(['link', 'embed', 'reference']).default('link'),
})

export type CreateNoteRelationInput = z.input<typeof createNoteRelationSchema>

// ── Factory functions ─────────────────────────────────────────────────────────

export function createEntityMention(input: CreateEntityMentionInput): EntityMention {
  const parsed = createEntityMentionSchema.parse(input)
  return {
    id: generateId(),
    noteId: parsed.noteId as ULID,
    entityId: parsed.entityId as ULID,
    mentionType: parsed.mentionType,
    offset: parsed.offset,
    createdAt: new Date().toISOString(),
  }
}

export function createNoteRelation(input: CreateNoteRelationInput): NoteRelation {
  const parsed = createNoteRelationSchema.parse(input)
  return {
    id: generateId(),
    fromNoteId: parsed.fromNoteId as ULID,
    toNoteId: parsed.toNoteId as ULID,
    relationType: parsed.relationType,
    createdAt: new Date().toISOString(),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function mentionsForNote(mentions: readonly EntityMention[], noteId: ULID): EntityMention[] {
  return mentions.filter((m) => m.noteId === noteId)
}

export function relationsFromNote(
  relations: readonly NoteRelation[],
  fromNoteId: ULID,
): NoteRelation[] {
  return relations.filter((r) => r.fromNoteId === fromNoteId)
}
