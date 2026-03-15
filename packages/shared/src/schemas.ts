import { z } from 'zod'

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/

export const ulidSchema = z.string().regex(ULID_REGEX, 'Invalid ULID format')

export const dateTimeSchema = z.string().datetime({ message: 'Invalid ISO 8601 datetime' })

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format')

export const nonEmptyStringSchema = z.string().trim().min(1, 'Must not be empty')

export const positiveIntSchema = z.number().int().positive()

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
})

export type PaginationParams = z.infer<typeof paginationSchema>

export interface Page<T> {
  items: T[]
  cursor: string | null
  totalEstimate?: number
}

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Expected hex color (#RRGGBB)')

export const emailSchema = z.string().email('Invalid email address')

export const urlSchema = z.string().url('Invalid URL')
