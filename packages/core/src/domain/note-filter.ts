export interface NoteFilter {
  readonly archived?: boolean
  readonly createdAfter?: string
  readonly createdBefore?: string
  readonly updatedAfter?: string
  readonly updatedBefore?: string
  readonly templateId?: string
  readonly searchQuery?: string
}

export function matchesFilter(
  note: { archivedAt?: string; createdAt: string; updatedAt: string; templateId?: string },
  filter: NoteFilter,
): boolean {
  if (filter.archived === false && note.archivedAt !== undefined) return false
  if (filter.archived === true && note.archivedAt === undefined) return false

  if (filter.createdAfter && note.createdAt < filter.createdAfter) return false
  if (filter.createdBefore && note.createdAt > filter.createdBefore) return false

  if (filter.updatedAfter && note.updatedAt < filter.updatedAfter) return false
  if (filter.updatedBefore && note.updatedAt > filter.updatedBefore) return false

  if (filter.templateId && note.templateId !== filter.templateId) return false

  return true
}
