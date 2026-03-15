/** Lightweight entity data types used across entity UI components.
 *  These mirror the shapes returned by the Tauri IPC layer. */

export interface UiEntityType {
  id: string
  slug: string
  name: string
  icon: string | null
  color: string | null
  /** JSON string encoding a FieldDef[] array */
  fields: string
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
  trashedAt: string | null
}

export interface UiEntity {
  id: string
  entityTypeId: string
  entityTypeSlug: string
  name: string
  /** JSON string encoding a Record<fieldId, value> object */
  fields: string
  createdAt: string
  updatedAt: string
  trashedAt: string | null
}

export interface UiNote {
  id: string
  title: string
  body: string
  bodyPlain: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

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

export interface EnumOption {
  value: string
  label: string
}

export interface FieldDef {
  id: string
  label: string
  type: FieldType
  required?: boolean
  order: number
  description?: string
  /** For enum fields */
  options?: EnumOption[]
  /** For computed_query fields */
  query?: string
  /** For relation fields */
  relationTarget?: 'note' | 'entity'
  relatedTypeSlug?: string
  relationCardinality?: 'one' | 'many'
}

export type FieldValues = Record<string, string | number | boolean | null>

export function parseFields(jsonStr: string): FieldDef[] {
  try {
    const parsed = JSON.parse(jsonStr)
    return Array.isArray(parsed) ? (parsed as FieldDef[]) : []
  } catch {
    return []
  }
}

export function parseFieldValues(jsonStr: string): FieldValues {
  try {
    const parsed = JSON.parse(jsonStr)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as FieldValues)
      : {}
  } catch {
    return {}
  }
}

/** Parse relation field value to array of IDs. One = [id], many = [id1, id2, ...]. */
export function parseRelationValue(value: string | number | boolean | null): string[] {
  if (value == null || value === '') return []
  const s = String(value).trim()
  if (!s) return []
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s) as unknown
      return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  }
  return [s]
}

/** Serialize relation IDs to stored value. One = "id", many = '["id1","id2"]'. */
export function serializeRelationValue(ids: string[], cardinality: 'one' | 'many'): string | null {
  if (ids.length === 0) return null
  if (cardinality === 'one') return ids[0] ?? null
  return JSON.stringify(ids)
}

export const PRESET_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]
