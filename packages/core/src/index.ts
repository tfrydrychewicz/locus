// ── Notes ─────────────────────────────────────────────────────────────────────

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

// ── Entities ──────────────────────────────────────────────────────────────────

export {
  applyEntityUpdate,
  type CreateEntityInput,
  createEntity,
  createEntitySchema,
  type Entity,
  isTrashed,
  restoreEntity,
  trashEntity,
  type UpdateEntityInput,
  updateEntitySchema,
} from './domain/entity.js'
export {
  type CreateEntityMentionInput,
  type CreateNoteRelationInput,
  createEntityMention,
  createNoteRelation,
  type EntityMention,
  type MentionType,
  mentionsForNote,
  type NoteRelation,
  type NoteRelationType,
  relationsFromNote,
} from './domain/entity-mention.js'
export {
  applyEntityTypeUpdate,
  BUILT_IN_ENTITY_TYPE_SLUGS,
  type BuiltInEntityTypeSlug,
  type CreateEntityTypeInput,
  createEntityType,
  createEntityTypeSchema,
  type EntityType,
  isTrashedEntityType,
  trashEntityType,
  type UpdateEntityTypeInput,
  updateEntityTypeSchema,
  validateFieldIds,
} from './domain/entity-type.js'
export {
  type BooleanField,
  type ComputedQueryField,
  type DateField,
  type EmailField,
  type EnumField,
  type EnumOption,
  enumOptionSchema,
  type FieldDefinition,
  type FieldType,
  type FieldValue,
  fieldDefinitionSchema,
  isComputedField,
  isRelationField,
  type NumberField,
  type RelationField,
  type TextField,
  type UrlField,
  validateFieldDefinition,
} from './domain/field-definition.js'

export type {
  EntityFilter,
  EntityMentionRepository,
  EntityRepository,
  EntityTypeRepository,
  NoteRelationRepository,
} from './ports/entity-repository.js'

export { createEntityUseCase } from './use-cases/create-entity.js'
export {
  createEntityTypeUseCase,
  hardDeleteEntityTypeUseCase,
  trashEntityTypeUseCase,
  updateEntityTypeUseCase,
} from './use-cases/entity-type-use-cases.js'
export { getEntityUseCase } from './use-cases/get-entity.js'
export { listEntitiesUseCase, searchEntitiesUseCase } from './use-cases/search-entities.js'
export {
  hardDeleteEntityUseCase,
  restoreEntityUseCase,
  trashEntityUseCase,
} from './use-cases/trash-restore-entity.js'
export { updateEntityUseCase } from './use-cases/update-entity.js'

// ── LQL ───────────────────────────────────────────────────────────────────────

export {
  type ComparisonOp,
  evaluateLQL,
  type LQLContext,
  LQLEvalError,
  type LQLExpr,
  LQLParseError,
  type LQLQuery,
  parseLQL,
  runLQL,
  validateLQL,
} from './lql/index.js'
