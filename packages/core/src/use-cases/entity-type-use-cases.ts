import { err, ok, type Result, type ULID } from '@locus/shared'
import {
  applyEntityTypeUpdate,
  type CreateEntityTypeInput,
  createEntityType,
  createEntityTypeSchema,
  type EntityType,
  trashEntityType,
  type UpdateEntityTypeInput,
  updateEntityTypeSchema,
  validateFieldIds,
} from '../domain/entity-type.js'
import type { EntityTypeRepository } from '../ports/entity-repository.js'

export async function createEntityTypeUseCase(
  repo: EntityTypeRepository,
  input: CreateEntityTypeInput,
): Promise<Result<EntityType, Error>> {
  const parsed = createEntityTypeSchema.safeParse(input)
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Validation failed'))
  }

  const existing = await repo.findBySlug(parsed.data.slug)
  if (existing) return err(new Error(`Entity type with slug '${parsed.data.slug}' already exists`))

  const fieldError = validateFieldIds(parsed.data.fields)
  if (fieldError) return err(new Error(fieldError))

  const entityType = createEntityType(parsed.data)
  await repo.save(entityType)
  return ok(entityType)
}

export async function updateEntityTypeUseCase(
  repo: EntityTypeRepository,
  input: UpdateEntityTypeInput,
): Promise<Result<EntityType, Error>> {
  const parsed = updateEntityTypeSchema.safeParse(input)
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Validation failed'))
  }

  const existing = await repo.findById(parsed.data.id as ULID)
  if (!existing) return err(new Error(`Entity type '${parsed.data.id}' not found`))
  if (existing.isBuiltIn && parsed.data.fields !== undefined) {
    return err(new Error('Cannot modify fields on a built-in entity type'))
  }

  const fieldError = parsed.data.fields ? validateFieldIds(parsed.data.fields) : null
  if (fieldError) return err(new Error(fieldError))

  const updated = applyEntityTypeUpdate(existing, parsed.data)
  await repo.save(updated)
  return ok(updated)
}

export async function trashEntityTypeUseCase(
  repo: EntityTypeRepository,
  id: ULID,
): Promise<Result<EntityType, Error>> {
  const entityType = await repo.findById(id)
  if (!entityType) return err(new Error(`Entity type '${id}' not found`))
  if (entityType.isBuiltIn) return err(new Error('Built-in entity types cannot be trashed'))
  if (entityType.trashedAt) return err(new Error(`Entity type '${id}' is already trashed`))

  const trashed = trashEntityType(entityType)
  await repo.save(trashed)
  return ok(trashed)
}

export async function hardDeleteEntityTypeUseCase(
  repo: EntityTypeRepository,
  id: ULID,
): Promise<Result<void, Error>> {
  const entityType = await repo.findById(id)
  if (!entityType) return err(new Error(`Entity type '${id}' not found`))
  if (entityType.isBuiltIn) return err(new Error('Built-in entity types cannot be deleted'))

  await repo.hardDelete(id)
  return ok(undefined)
}
