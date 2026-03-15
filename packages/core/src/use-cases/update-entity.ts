import { err, ok, type Result, type ULID } from '@locus/shared'
import type { Entity } from '../domain/entity.js'
import { applyEntityUpdate, type UpdateEntityInput, updateEntitySchema } from '../domain/entity.js'
import type { EntityRepository } from '../ports/entity-repository.js'

export async function updateEntityUseCase(
  repo: EntityRepository,
  input: UpdateEntityInput,
): Promise<Result<Entity, Error>> {
  const parsed = updateEntitySchema.safeParse(input)
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Validation failed'))
  }

  const existing = await repo.findById(parsed.data.id as ULID)
  if (!existing) return err(new Error(`Entity '${parsed.data.id}' not found`))

  const updated = applyEntityUpdate(existing, parsed.data)
  await repo.save(updated)
  return ok(updated)
}
