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

export async function ping(): Promise<string> {
  return invoke<string>('ping')
}

export async function getDbStatus(): Promise<DbStatus> {
  return invoke<DbStatus>('get_db_status')
}
