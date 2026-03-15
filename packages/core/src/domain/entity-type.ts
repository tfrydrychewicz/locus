import type { ULID } from '@locus/shared'
import { generateId } from '@locus/shared'
import { z } from 'zod'
import { type FieldDefinition, fieldDefinitionSchema } from './field-definition.js'

// ── EntityType domain model ───────────────────────────────────────────────────

export interface EntityType {
  readonly id: ULID
  readonly slug: string // unique snake_case key, e.g. 'person'
  readonly name: string // display name, e.g. 'Person'
  readonly icon?: string // emoji or icon identifier
  readonly color?: string // hex color for chips, e.g. '#3b82f6'
  readonly fields: readonly FieldDefinition[]
  readonly isBuiltIn: boolean
  readonly createdAt: string // ISO 8601
  readonly updatedAt: string
  readonly trashedAt?: string
}

// ── Built-in types ────────────────────────────────────────────────────────────

export const BUILT_IN_ENTITY_TYPE_SLUGS = ['person', 'project', 'team', 'decision', 'okr'] as const

export type BuiltInEntityTypeSlug = (typeof BUILT_IN_ENTITY_TYPE_SLUGS)[number]

// ── Schemas ───────────────────────────────────────────────────────────────────

export const createEntityTypeSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, 'Slug must be lowercase snake_case'),
  name: z.string().trim().min(1, 'Name must not be empty'),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Expected hex color')
    .optional(),
  fields: z.array(fieldDefinitionSchema).default([]),
})

export type CreateEntityTypeInput = z.input<typeof createEntityTypeSchema>

export const updateEntityTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  fields: z.array(fieldDefinitionSchema).optional(),
})

export type UpdateEntityTypeInput = z.infer<typeof updateEntityTypeSchema>

// ── Factory functions ─────────────────────────────────────────────────────────

export function createEntityType(input: CreateEntityTypeInput, isBuiltIn = false): EntityType {
  const parsed = createEntityTypeSchema.parse(input)
  const now = new Date().toISOString()
  return {
    id: generateId(),
    slug: parsed.slug,
    name: parsed.name,
    icon: parsed.icon,
    color: parsed.color,
    fields: parsed.fields,
    isBuiltIn,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyEntityTypeUpdate(
  entityType: EntityType,
  input: UpdateEntityTypeInput,
): EntityType {
  const parsed = updateEntityTypeSchema.parse(input)
  return {
    ...entityType,
    ...(parsed.name !== undefined ? { name: parsed.name } : {}),
    ...(parsed.icon !== undefined ? { icon: parsed.icon } : {}),
    ...(parsed.color !== undefined ? { color: parsed.color } : {}),
    ...(parsed.fields !== undefined ? { fields: parsed.fields } : {}),
    updatedAt: new Date().toISOString(),
  }
}

export function trashEntityType(entityType: EntityType): EntityType {
  return { ...entityType, trashedAt: new Date().toISOString() }
}

export function isTrashedEntityType(entityType: EntityType): boolean {
  return entityType.trashedAt !== undefined
}

// ── Validation helpers ────────────────────────────────────────────────────────

/** Checks that all field ids are unique within the entity type. */
export function validateFieldIds(fields: readonly FieldDefinition[]): string | null {
  const seen = new Set<string>()
  for (const field of fields) {
    if (seen.has(field.id)) return `Duplicate field id: '${field.id}'`
    seen.add(field.id)
  }
  return null
}
