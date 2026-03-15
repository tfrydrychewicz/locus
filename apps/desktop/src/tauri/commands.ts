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
