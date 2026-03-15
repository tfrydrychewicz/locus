import type { Page, PaginationParams } from '@locus/shared'
import { ok, type Result } from '@locus/shared'
import type { Entity } from '../domain/entity.js'
import type { EntityFilter, EntityRepository } from '../ports/entity-repository.js'

const FTS_RESULT_LIMIT = 50

export async function searchEntitiesUseCase(
  repo: EntityRepository,
  query: string,
  limit = FTS_RESULT_LIMIT,
): Promise<Result<Entity[], Error>> {
  const results = await repo.searchFTS(query.trim(), limit)
  return ok(results)
}

export async function listEntitiesUseCase(
  repo: EntityRepository,
  filter?: EntityFilter,
  page?: PaginationParams,
): Promise<Result<Page<Entity>, Error>> {
  const result = await repo.findAll(filter, page)
  return ok(result)
}
