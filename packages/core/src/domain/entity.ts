import { generateId, type ULID } from '@locus/shared'
import { z } from 'zod'
import type { FieldValue } from './field-definition.js'

// ── Entity domain model ───────────────────────────────────────────────────────

export interface Entity {
  readonly id: ULID
  readonly entityTypeId: ULID
  readonly entityTypeSlug: string // denormalized for fast lookup / display
  readonly name: string
  readonly fields: Readonly<Record<string, FieldValue>>
  readonly createdAt: string // ISO 8601
  readonly updatedAt: string
  readonly trashedAt?: string
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const fieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
])

export const createEntitySchema = z.object({
  entityTypeId: z.string().min(1),
  entityTypeSlug: z.string().min(1),
  name: z.string().trim().min(1, 'Name must not be empty'),
  fields: z.record(z.string(), fieldValueSchema).default({}),
})

export type CreateEntityInput = z.input<typeof createEntitySchema>

export const updateEntitySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  // Partial merge — provided keys overwrite, absent keys are preserved
  fields: z.record(z.string(), fieldValueSchema).optional(),
})

export type UpdateEntityInput = z.infer<typeof updateEntitySchema>

// ── Factory functions ─────────────────────────────────────────────────────────

export function createEntity(input: CreateEntityInput): Entity {
  const parsed = createEntitySchema.parse(input)
  const now = new Date().toISOString()
  return {
    id: generateId(),
    entityTypeId: parsed.entityTypeId as ULID,
    entityTypeSlug: parsed.entityTypeSlug,
    name: parsed.name,
    fields: parsed.fields,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyEntityUpdate(entity: Entity, input: UpdateEntityInput): Entity {
  const parsed = updateEntitySchema.parse(input)
  return {
    ...entity,
    ...(parsed.name !== undefined ? { name: parsed.name } : {}),
    // Merge: new values overwrite existing; set a key to null to clear it
    ...(parsed.fields !== undefined ? { fields: { ...entity.fields, ...parsed.fields } } : {}),
    updatedAt: new Date().toISOString(),
  }
}

export function trashEntity(entity: Entity): Entity {
  return { ...entity, trashedAt: new Date().toISOString() }
}

export function restoreEntity(entity: Entity): Entity {
  // Spread then omit trashedAt by destructuring
  const { trashedAt: _removed, ...rest } = entity
  return { ...rest, updatedAt: new Date().toISOString() }
}

export function isTrashed(entity: Entity): boolean {
  return entity.trashedAt !== undefined
}
