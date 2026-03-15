import type { ULID } from '@locus/shared'
import { err, ok, type Result } from '@locus/shared'
import type { Entity } from '../domain/entity.js'
import type { EntityRepository } from '../ports/entity-repository.js'

export async function getEntityUseCase(
  repo: EntityRepository,
  id: ULID,
): Promise<Result<Entity, Error>> {
  const entity = await repo.findById(id)
  if (!entity) return err(new Error(`Entity '${id}' not found`))
  return ok(entity)
}
