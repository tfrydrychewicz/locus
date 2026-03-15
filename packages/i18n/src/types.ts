import type aiEn from './locales/en/ai.json'
import type calendarEn from './locales/en/calendar.json'
import type cognitiveEn from './locales/en/cognitive.json'
import type commonEn from './locales/en/common.json'
import type entitiesEn from './locales/en/entities.json'
import type helpEn from './locales/en/help.json'
import type notesEn from './locales/en/notes.json'
import type searchEn from './locales/en/search.json'
import type settingsEn from './locales/en/settings.json'
import type tasksEn from './locales/en/tasks.json'

export const NAMESPACES = [
  'common',
  'notes',
  'tasks',
  'calendar',
  'search',
  'ai',
  'settings',
  'cognitive',
  'help',
  'entities',
] as const

export type Namespace = (typeof NAMESPACES)[number]

export const SUPPORTED_LOCALES = ['en', 'pl'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'
export const DEFAULT_NAMESPACE: Namespace = 'common'

export interface LocusResources {
  common: typeof commonEn
  notes: typeof notesEn
  tasks: typeof tasksEn
  calendar: typeof calendarEn
  search: typeof searchEn
  ai: typeof aiEn
  settings: typeof settingsEn
  cognitive: typeof cognitiveEn
  help: typeof helpEn
  entities: typeof entitiesEn
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: LocusResources
  }
}
