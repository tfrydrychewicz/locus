import type { Page, PaginationParams, ULID } from '@locus/shared'
import type { Entity } from '../domain/entity.js'
import type { EntityMention, NoteRelation } from '../domain/entity-mention.js'
import type { EntityType } from '../domain/entity-type.js'

// ── Entity filter ─────────────────────────────────────────────────────────────

export interface EntityFilter {
  readonly entityTypeId?: ULID
  readonly entityTypeSlug?: string
  readonly nameContains?: string
  readonly includeTrashed?: boolean
  readonly createdAfter?: string
  readonly createdBefore?: string
}

// ── EntityRepository port ─────────────────────────────────────────────────────

export interface EntityRepository {
  findById(id: ULID): Promise<Entity | null>
  findAll(filter?: EntityFilter, page?: PaginationParams): Promise<Page<Entity>>
  save(entity: Entity): Promise<void>
  /** Soft-delete: sets trashedAt. */
  softDelete(id: ULID): Promise<void>
  /** Permanently remove from the database. */
  hardDelete(id: ULID): Promise<void>
  /** Full-text search over entity names and field values. */
  searchFTS(query: string, limit?: number): Promise<Entity[]>
  /** Return all entities that mention the given entity in their fields. */
  findByFieldValue(fieldId: string, value: string): Promise<Entity[]>
  countByFilter(filter?: EntityFilter): Promise<number>
}

// ── EntityTypeRepository port ─────────────────────────────────────────────────

export interface EntityTypeRepository {
  findById(id: ULID): Promise<EntityType | null>
  findBySlug(slug: string): Promise<EntityType | null>
  findAll(includeBuiltIn?: boolean): Promise<EntityType[]>
  save(entityType: EntityType): Promise<void>
  /** Soft-delete (non-destructive). Built-in types cannot be trashed. */
  softDelete(id: ULID): Promise<void>
  hardDelete(id: ULID): Promise<void>
}

// ── EntityMentionRepository port ─────────────────────────────────────────────

export interface EntityMentionRepository {
  findByNoteId(noteId: ULID): Promise<EntityMention[]>
  findByEntityId(entityId: ULID): Promise<EntityMention[]>
  /** Replace all inline mentions for a note (called on every note save). */
  replaceForNote(noteId: ULID, mentions: EntityMention[]): Promise<void>
  countForEntity(entityId: ULID): Promise<number>
}

// ── NoteRelationRepository port ───────────────────────────────────────────────

export interface NoteRelationRepository {
  findByFromNoteId(fromNoteId: ULID): Promise<NoteRelation[]>
  findByToNoteId(toNoteId: ULID): Promise<NoteRelation[]>
  /** Replace all relations emitted from a note (called on every note save). */
  replaceForNote(fromNoteId: ULID, relations: NoteRelation[]): Promise<void>
  countBacklinksForNote(toNoteId: ULID): Promise<number>
}
