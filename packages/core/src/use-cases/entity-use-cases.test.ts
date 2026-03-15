import type { Page, PaginationParams } from '@locus/shared'
import { isErr, isOk } from '@locus/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Entity } from '../domain/entity.js'
import { createEntity } from '../domain/entity.js'
import type { EntityType } from '../domain/entity-type.js'
import { createEntityType } from '../domain/entity-type.js'
import type {
  EntityFilter,
  EntityRepository,
  EntityTypeRepository,
} from '../ports/entity-repository.js'
import { createEntityUseCase } from './create-entity.js'
import { createEntityTypeUseCase, trashEntityTypeUseCase } from './entity-type-use-cases.js'
import { getEntityUseCase } from './get-entity.js'
import { searchEntitiesUseCase } from './search-entities.js'
import {
  hardDeleteEntityUseCase,
  restoreEntityUseCase,
  trashEntityUseCase,
} from './trash-restore-entity.js'
import { updateEntityUseCase } from './update-entity.js'

// ── In-memory repository stubs ────────────────────────────────────────────────

function makeEntityRepo(initial: Entity[] = []): EntityRepository {
  const store = new Map<string, Entity>(initial.map((e) => [e.id, e]))
  return {
    findById: async (id) => store.get(id) ?? null,
    findAll: async (_filter?: EntityFilter, _page?: PaginationParams): Promise<Page<Entity>> => ({
      items: [...store.values()],
      cursor: null,
    }),
    save: async (entity) => {
      store.set(entity.id, entity)
    },
    softDelete: async (id) => {
      const e = store.get(id)
      if (e) store.set(id, { ...e, trashedAt: new Date().toISOString() })
    },
    hardDelete: async (id) => {
      store.delete(id)
    },
    searchFTS: async (query) =>
      [...store.values()].filter((e) => e.name.toLowerCase().includes(query.toLowerCase())),
    findByFieldValue: async (fieldId, value) =>
      [...store.values()].filter((e) => String(e.fields[fieldId]) === value),
    countByFilter: async () => store.size,
  }
}

function makeEntityTypeRepo(initial: EntityType[] = []): EntityTypeRepository {
  const store = new Map<string, EntityType>(initial.map((t) => [t.id, t]))
  return {
    findById: async (id) => store.get(id) ?? null,
    findBySlug: async (slug) => [...store.values()].find((t) => t.slug === slug) ?? null,
    findAll: async () => [...store.values()],
    save: async (et) => {
      store.set(et.id, et)
    },
    softDelete: async (id) => {
      const t = store.get(id)
      if (t) store.set(id, { ...t, trashedAt: new Date().toISOString() })
    },
    hardDelete: async (id) => {
      store.delete(id)
    },
  }
}

// ── Test fixtures ─────────────────────────────────────────────────────────────

let entityRepo: EntityRepository
let entityTypeRepo: EntityTypeRepository
let personType: EntityType

beforeEach(() => {
  personType = createEntityType({ slug: 'person', name: 'Person' })
  entityTypeRepo = makeEntityTypeRepo([personType])
  entityRepo = makeEntityRepo()
})

// ── createEntityUseCase ───────────────────────────────────────────────────────

describe('createEntityUseCase', () => {
  it('creates and saves an entity', async () => {
    const result = await createEntityUseCase(entityRepo, entityTypeRepo, {
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Alice',
    })
    expect(isOk(result)).toBe(true)
    if (isOk(result)) expect(result.value.name).toBe('Alice')
  })

  it('returns error for unknown entity type slug', async () => {
    const result = await createEntityUseCase(entityRepo, entityTypeRepo, {
      entityTypeId: personType.id,
      entityTypeSlug: 'unknown_type',
      name: 'Alice',
    })
    expect(isErr(result)).toBe(true)
    if (isErr(result)) expect(result.error.message).toContain('not found')
  })
})

// ── getEntityUseCase ──────────────────────────────────────────────────────────

describe('getEntityUseCase', () => {
  it('returns the entity by id', async () => {
    const entity = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Bob',
    })
    entityRepo = makeEntityRepo([entity])
    const result = await getEntityUseCase(entityRepo, entity.id)
    expect(isOk(result)).toBe(true)
    if (isOk(result)) expect(result.value.id).toBe(entity.id)
  })

  it('returns error for missing entity', async () => {
    const result = await getEntityUseCase(entityRepo, '01ZZZZZZZZZZZZZZZZZZZZZZZ0')
    expect(isErr(result)).toBe(true)
  })
})

// ── updateEntityUseCase ───────────────────────────────────────────────────────

describe('updateEntityUseCase', () => {
  it('updates the entity name', async () => {
    const entity = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Carol',
    })
    entityRepo = makeEntityRepo([entity])
    const result = await updateEntityUseCase(entityRepo, { id: entity.id, name: 'Carol Smith' })
    expect(isOk(result)).toBe(true)
    if (isOk(result)) expect(result.value.name).toBe('Carol Smith')
  })
})

// ── trashEntityUseCase / restoreEntityUseCase ─────────────────────────────────

describe('trashEntityUseCase / restoreEntityUseCase', () => {
  it('trashes and restores an entity', async () => {
    const entity = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Dan',
    })
    entityRepo = makeEntityRepo([entity])

    const trashResult = await trashEntityUseCase(entityRepo, entity.id)
    expect(isOk(trashResult)).toBe(true)
    if (isOk(trashResult)) expect(trashResult.value.trashedAt).toBeDefined()

    const restoreResult = await restoreEntityUseCase(entityRepo, entity.id)
    expect(isOk(restoreResult)).toBe(true)
    if (isOk(restoreResult)) expect(restoreResult.value.trashedAt).toBeUndefined()
  })

  it('cannot trash an already-trashed entity', async () => {
    const entity = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Eve',
    })
    entityRepo = makeEntityRepo([entity])
    await trashEntityUseCase(entityRepo, entity.id)
    const result = await trashEntityUseCase(entityRepo, entity.id)
    expect(isErr(result)).toBe(true)
  })
})

// ── hardDeleteEntityUseCase ───────────────────────────────────────────────────

describe('hardDeleteEntityUseCase', () => {
  it('permanently removes an entity', async () => {
    const entity = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Frank',
    })
    entityRepo = makeEntityRepo([entity])
    const deleteResult = await hardDeleteEntityUseCase(entityRepo, entity.id)
    expect(isOk(deleteResult)).toBe(true)

    const getResult = await getEntityUseCase(entityRepo, entity.id)
    expect(isErr(getResult)).toBe(true)
  })
})

// ── searchEntitiesUseCase ─────────────────────────────────────────────────────

describe('searchEntitiesUseCase', () => {
  it('returns matching entities', async () => {
    const alice = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Alice',
    })
    const bob = createEntity({
      entityTypeId: personType.id,
      entityTypeSlug: 'person',
      name: 'Bob',
    })
    entityRepo = makeEntityRepo([alice, bob])
    const result = await searchEntitiesUseCase(entityRepo, 'alice')
    expect(isOk(result)).toBe(true)
    if (isOk(result)) {
      expect(result.value).toHaveLength(1)
      expect(result.value[0].name).toBe('Alice')
    }
  })
})

// ── createEntityTypeUseCase ───────────────────────────────────────────────────

describe('createEntityTypeUseCase', () => {
  it('creates a new entity type', async () => {
    const result = await createEntityTypeUseCase(entityTypeRepo, {
      slug: 'department',
      name: 'Department',
    })
    expect(isOk(result)).toBe(true)
    if (isOk(result)) expect(result.value.slug).toBe('department')
  })

  it('rejects duplicate slugs', async () => {
    const result = await createEntityTypeUseCase(entityTypeRepo, {
      slug: 'person',
      name: 'Person Again',
    })
    expect(isErr(result)).toBe(true)
    if (isErr(result)) expect(result.error.message).toContain('already exists')
  })
})

// ── trashEntityTypeUseCase ────────────────────────────────────────────────────

describe('trashEntityTypeUseCase', () => {
  it('cannot trash a built-in entity type', async () => {
    const builtIn = createEntityType({ slug: 'okr', name: 'OKR' }, true)
    entityTypeRepo = makeEntityTypeRepo([builtIn])
    const result = await trashEntityTypeUseCase(entityTypeRepo, builtIn.id)
    expect(isErr(result)).toBe(true)
    if (isErr(result)) expect(result.error.message).toContain('Built-in')
  })

  it('trashes a custom entity type', async () => {
    const custom = createEntityType({ slug: 'vendor', name: 'Vendor' }, false)
    entityTypeRepo = makeEntityTypeRepo([custom])
    const result = await trashEntityTypeUseCase(entityTypeRepo, custom.id)
    expect(isOk(result)).toBe(true)
  })
})
