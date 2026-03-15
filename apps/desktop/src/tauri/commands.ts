import { invoke } from '@tauri-apps/api/core'

export interface CommandError {
  code: string
  message: string
}

export interface Page<T> {
  items: T[]
  cursor: string | null
  hasMore: boolean
  totalEstimate: number
}

export interface PaginationParams {
  cursor?: string | null
  limit?: number
}

export interface DbStatus {
  version: number
  pageSize: number
  walMode: boolean
  cacheSize: number
  mmapSize: number
  tableCount: number
}

export interface Note {
  id: string
  title: string
  body: string
  bodyPlain: string
  templateId: string | null
  embeddingDirty: boolean
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}

export interface NoteSearchResult {
  note: Note
  rank: number
  snippet: string | null
}

export interface NoteFilter {
  archived?: boolean
  createdAfter?: string
  createdBefore?: string
  updatedAfter?: string
  updatedBefore?: string
  templateId?: string
}

export async function ping(): Promise<string> {
  return invoke<string>('ping')
}

export async function getDbStatus(): Promise<DbStatus> {
  return invoke<DbStatus>('get_db_status')
}

export async function notesCreate(params: {
  title?: string
  body?: string
  templateId?: string
}): Promise<Note> {
  return invoke<Note>('notes_create', { params })
}

export async function notesGet(id: string): Promise<Note | null> {
  return invoke<Note | null>('notes_get', { id })
}

export async function notesList(params?: {
  filter?: NoteFilter
  cursor?: string | null
  limit?: number
}): Promise<Page<Note>> {
  return invoke<Page<Note>>('notes_list', { params: params ?? {} })
}

export async function notesUpdate(params: {
  id: string
  title?: string
  body?: string
  bodyPlain?: string
}): Promise<Note> {
  return invoke<Note>('notes_update', { params })
}

export async function notesDelete(id: string, hard?: boolean): Promise<void> {
  return invoke<void>('notes_delete', { id, hard })
}

export async function notesSearch(params: {
  query: string
  limit?: number
}): Promise<NoteSearchResult[]> {
  return invoke<NoteSearchResult[]>('notes_search', { params })
}

// ── Entity Types ──────────────────────────────────────────────────────────────

export interface EntityType {
  id: string
  slug: string
  name: string
  icon: string | null
  color: string | null
  /** JSON array of FieldDefinition objects */
  fields: string
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
  trashedAt: string | null
}

export async function entityTypesList(): Promise<EntityType[]> {
  return invoke<EntityType[]>('entity_types_list')
}

export async function entityTypesGet(id: string): Promise<EntityType | null> {
  return invoke<EntityType | null>('entity_types_get', { id })
}

export async function entityTypesGetBySlug(slug: string): Promise<EntityType | null> {
  return invoke<EntityType | null>('entity_types_get_by_slug', { slug })
}

export async function entityTypesCreate(params: {
  slug: string
  name: string
  icon?: string
  color?: string
  fields?: string
}): Promise<EntityType> {
  return invoke<EntityType>('entity_types_create', { params })
}

export async function entityTypesUpdate(params: {
  id: string
  name?: string
  icon?: string
  color?: string
  fields?: string
}): Promise<EntityType> {
  return invoke<EntityType>('entity_types_update', { params })
}

export async function entityTypesTrash(id: string): Promise<void> {
  return invoke<void>('entity_types_trash', { id })
}

export async function entityTypesHardDelete(id: string): Promise<void> {
  return invoke<void>('entity_types_hard_delete', { id })
}

// ── Entities ──────────────────────────────────────────────────────────────────

export interface Entity {
  id: string
  entityTypeId: string
  entityTypeSlug: string
  name: string
  /** JSON object of field values */
  fields: string
  createdAt: string
  updatedAt: string
  trashedAt: string | null
}

export interface EntityFilter {
  entityTypeSlug?: string
  entityTypeId?: string
  trashed?: boolean
  updatedAfter?: string
  updatedBefore?: string
}

export async function entitiesCreate(params: {
  entityTypeId: string
  name: string
  fields?: string
}): Promise<Entity> {
  return invoke<Entity>('entities_create', { params })
}

export async function entitiesGet(id: string): Promise<Entity | null> {
  return invoke<Entity | null>('entities_get', { id })
}

export async function entitiesList(params?: {
  filter?: EntityFilter
  cursor?: string | null
  limit?: number
}): Promise<Page<Entity>> {
  return invoke<Page<Entity>>('entities_list', { params: params ?? {} })
}

export async function entitiesUpdate(params: {
  id: string
  name?: string
  fields?: string
}): Promise<Entity> {
  return invoke<Entity>('entities_update', { params })
}

export async function entitiesTrash(id: string): Promise<void> {
  return invoke<void>('entities_trash', { id })
}

export async function entitiesRestore(id: string): Promise<void> {
  return invoke<void>('entities_restore', { id })
}

export async function entitiesHardDelete(id: string): Promise<void> {
  return invoke<void>('entities_hard_delete', { id })
}

export async function entitiesSearch(params: {
  query: string
  entityTypeSlug?: string
  limit?: number
}): Promise<Entity[]> {
  return invoke<Entity[]>('entities_search', { params })
}

export async function entitiesEvaluateComputed(params: {
  query: string
  thisEntityId?: string
  cursor?: string | null
  limit?: number
}): Promise<Page<Entity>> {
  return invoke<Page<Entity>>('entities_evaluate_computed', { params })
}

export async function entitiesParseQuery(query: string): Promise<boolean> {
  return invoke<boolean>('entities_parse_query', { query })
}

// ── Entity Mentions ───────────────────────────────────────────────────────────

export interface EntityMention {
  id: string
  noteId: string
  entityId: string
  mentionType: string
  offset: number | null
  createdAt: string
}

export interface MentionInput {
  entityId: string
  mentionType: string
  offset?: number
}

export async function entityMentionsReplace(params: {
  noteId: string
  mentions: MentionInput[]
}): Promise<EntityMention[]> {
  return invoke<EntityMention[]>('entity_mentions_replace', { params })
}

export async function entityMentionsForNote(noteId: string): Promise<EntityMention[]> {
  return invoke<EntityMention[]>('entity_mentions_for_note', { noteId })
}

export async function entityMentionsForEntity(entityId: string): Promise<EntityMention[]> {
  return invoke<EntityMention[]>('entity_mentions_for_entity', { entityId })
}

// ── Note Relations ────────────────────────────────────────────────────────────

export interface NoteRelation {
  id: string
  fromNoteId: string
  toNoteId: string
  relationType: string
  createdAt: string
}

export interface RelationInput {
  toNoteId: string
  relationType: string
}

export async function noteRelationsReplace(params: {
  fromNoteId: string
  relations: RelationInput[]
}): Promise<NoteRelation[]> {
  return invoke<NoteRelation[]>('note_relations_replace', { params })
}

export async function noteRelationsForNote(fromNoteId: string): Promise<NoteRelation[]> {
  return invoke<NoteRelation[]>('note_relations_for_note', { fromNoteId })
}

export async function noteBacklinks(toNoteId: string): Promise<NoteRelation[]> {
  return invoke<NoteRelation[]>('note_backlinks', { toNoteId })
}
