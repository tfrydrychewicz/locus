import { describe, expect, it } from 'vitest'
import { applyEntityUpdate, createEntity, isTrashed, restoreEntity, trashEntity } from './entity.js'

describe('createEntity', () => {
  it('creates an entity with the given fields', () => {
    const entity = createEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
      entityTypeSlug: 'person',
      name: 'Alice',
      fields: { role: 'engineer', team: null },
    })

    expect(entity.name).toBe('Alice')
    expect(entity.entityTypeSlug).toBe('person')
    expect(entity.fields.role).toBe('engineer')
    expect(entity.fields.team).toBeNull()
    expect(entity.id).toBeTruthy()
    expect(entity.trashedAt).toBeUndefined()
  })

  it('defaults fields to an empty object', () => {
    const entity = createEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
      entityTypeSlug: 'project',
      name: 'Project X',
    })
    expect(entity.fields).toEqual({})
  })

  it('rejects an empty name', () => {
    expect(() =>
      createEntity({
        entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
        entityTypeSlug: 'person',
        name: '  ',
      }),
    ).toThrow()
  })
})

describe('applyEntityUpdate', () => {
  it('updates name and merges fields', () => {
    const entity = createEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
      entityTypeSlug: 'person',
      name: 'Alice',
      fields: { role: 'engineer', city: 'Berlin' },
    })

    const updated = applyEntityUpdate(entity, {
      id: entity.id,
      name: 'Alice Smith',
      fields: { role: 'lead' },
    })

    expect(updated.name).toBe('Alice Smith')
    expect(updated.fields.role).toBe('lead')
    expect(updated.fields.city).toBe('Berlin') // preserved
    expect(updated.updatedAt >= entity.updatedAt).toBe(true)
  })

  it('allows clearing a field by setting it to null', () => {
    const entity = createEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
      entityTypeSlug: 'person',
      name: 'Bob',
      fields: { city: 'Berlin' },
    })
    const updated = applyEntityUpdate(entity, { id: entity.id, fields: { city: null } })
    expect(updated.fields.city).toBeNull()
  })
})

describe('trashEntity / restoreEntity', () => {
  it('sets trashedAt on trash', () => {
    const entity = createEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
      entityTypeSlug: 'person',
      name: 'Carol',
    })
    const trashed = trashEntity(entity)
    expect(isTrashed(trashed)).toBe(true)
    expect(trashed.trashedAt).toBeDefined()
  })

  it('clears trashedAt on restore', () => {
    const entity = createEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
      entityTypeSlug: 'person',
      name: 'Dan',
    })
    const trashed = trashEntity(entity)
    const restored = restoreEntity(trashed)
    expect(isTrashed(restored)).toBe(false)
    expect(restored.trashedAt).toBeUndefined()
  })
})
