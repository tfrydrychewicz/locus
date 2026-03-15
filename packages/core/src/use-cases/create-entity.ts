import { err, ok, type Result } from '@locus/shared'
import { type CreateEntityInput, createEntity, createEntitySchema } from '../domain/entity.js'
import type { EntityRepository, EntityTypeRepository } from '../ports/entity-repository.js'

export async function createEntityUseCase(
  entityRepo: EntityRepository,
  entityTypeRepo: EntityTypeRepository,
  input: CreateEntityInput,
): Promise<Result<ReturnType<typeof createEntity>, Error>> {
  const parsed = createEntitySchema.safeParse(input)
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Validation failed'))
  }

  const entityType = await entityTypeRepo.findBySlug(parsed.data.entityTypeSlug)
  if (!entityType) {
    return err(new Error(`Entity type '${parsed.data.entityTypeSlug}' not found`))
  }

  const entity = createEntity(parsed.data)
  await entityRepo.save(entity)
  return ok(entity)
}
