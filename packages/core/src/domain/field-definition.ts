import { z } from 'zod'

// ── Field Types ───────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'url'
  | 'email'
  | 'enum'
  | 'relation'
  | 'computed_query'

// ── Enum option ───────────────────────────────────────────────────────────────

export interface EnumOption {
  readonly id: string
  readonly label: string
  readonly color?: string // hex color e.g. '#3b82f6'
}

// ── Field definition variants ─────────────────────────────────────────────────

interface FieldBase {
  readonly id: string // slug, snake_case, e.g. 'due_date'
  readonly label: string
  readonly required?: boolean
  readonly order: number
}

export interface TextField extends FieldBase {
  readonly type: 'text'
  readonly multiline?: boolean
}

export interface NumberField extends FieldBase {
  readonly type: 'number'
  readonly min?: number
  readonly max?: number
  readonly unit?: string
}

export interface DateField extends FieldBase {
  readonly type: 'date'
  readonly includeTime?: boolean
}

export interface BooleanField extends FieldBase {
  readonly type: 'boolean'
}

export interface UrlField extends FieldBase {
  readonly type: 'url'
}

export interface EmailField extends FieldBase {
  readonly type: 'email'
}

export interface EnumField extends FieldBase {
  readonly type: 'enum'
  readonly options: readonly EnumOption[]
  readonly multiSelect?: boolean
}

export interface RelationField extends FieldBase {
  readonly type: 'relation'
  readonly targetEntityTypeSlug: string
  readonly multiValue?: boolean
}

/** Read-only computed field — its value is derived by evaluating `query` (LQL) at runtime. */
export interface ComputedQueryField extends FieldBase {
  readonly type: 'computed_query'
  readonly query: string // LQL expression, e.g. 'entity_type = "person" AND team = {this}'
  readonly targetEntityTypeSlug?: string // optional type filter on result
}

export type FieldDefinition =
  | TextField
  | NumberField
  | DateField
  | BooleanField
  | UrlField
  | EmailField
  | EnumField
  | RelationField
  | ComputedQueryField

/** Runtime value stored for a field. `string[]` covers multi-select and multi-relation. */
export type FieldValue = string | number | boolean | string[] | null

// ── Zod schemas ───────────────────────────────────────────────────────────────

const fieldBaseSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, 'Field id must be lowercase snake_case'),
  label: z.string().trim().min(1, 'Label must not be empty'),
  required: z.boolean().optional(),
  order: z.number().int().min(0),
})

export const enumOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Expected hex color')
    .optional(),
})

export const fieldDefinitionSchema: z.ZodType<FieldDefinition> = z.discriminatedUnion('type', [
  fieldBaseSchema.extend({ type: z.literal('text'), multiline: z.boolean().optional() }),
  fieldBaseSchema.extend({
    type: z.literal('number'),
    min: z.number().optional(),
    max: z.number().optional(),
    unit: z.string().optional(),
  }),
  fieldBaseSchema.extend({ type: z.literal('date'), includeTime: z.boolean().optional() }),
  fieldBaseSchema.extend({ type: z.literal('boolean') }),
  fieldBaseSchema.extend({ type: z.literal('url') }),
  fieldBaseSchema.extend({ type: z.literal('email') }),
  fieldBaseSchema.extend({
    type: z.literal('enum'),
    options: z.array(enumOptionSchema).min(1, 'Enum must have at least one option'),
    multiSelect: z.boolean().optional(),
  }),
  fieldBaseSchema.extend({
    type: z.literal('relation'),
    targetEntityTypeSlug: z.string().trim().min(1),
    multiValue: z.boolean().optional(),
  }),
  fieldBaseSchema.extend({
    type: z.literal('computed_query'),
    query: z.string().trim().min(1, 'Computed query must not be empty'),
    targetEntityTypeSlug: z.string().optional(),
  }),
])

export function validateFieldDefinition(value: unknown): FieldDefinition {
  return fieldDefinitionSchema.parse(value)
}

export function isComputedField(field: FieldDefinition): field is ComputedQueryField {
  return field.type === 'computed_query'
}

export function isRelationField(field: FieldDefinition): field is RelationField {
  return field.type === 'relation'
}
