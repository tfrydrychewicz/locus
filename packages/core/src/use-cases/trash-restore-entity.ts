import type { ULID } from '@locus/shared'
import { err, ok, type Result } from '@locus/shared'
import type { Entity } from '../domain/entity.js'
import { restoreEntity, trashEntity } from '../domain/entity.js'
import type { EntityRepository } from '../ports/entity-repository.js'

export async function trashEntityUseCase(
  repo: EntityRepository,
  id: ULID,
): Promise<Result<Entity, Error>> {
  const entity = await repo.findById(id)
  if (!entity) return err(new Error(`Entity '${id}' not found`))
  if (entity.trashedAt) return err(new Error(`Entity '${id}' is already trashed`))

  const trashed = trashEntity(entity)
  await repo.save(trashed)
  return ok(trashed)
}

export async function restoreEntityUseCase(
  repo: EntityRepository,
  id: ULID,
): Promise<Result<Entity, Error>> {
  const entity = await repo.findById(id)
  if (!entity) return err(new Error(`Entity '${id}' not found`))
  if (!entity.trashedAt) return err(new Error(`Entity '${id}' is not trashed`))

  const restored = restoreEntity(entity)
  await repo.save(restored)
  return ok(restored)
}

export async function hardDeleteEntityUseCase(
  repo: EntityRepository,
  id: ULID,
): Promise<Result<void, Error>> {
  const entity = await repo.findById(id)
  if (!entity) return err(new Error(`Entity '${id}' not found`))

  await repo.hardDelete(id)
  return ok(undefined)
}
