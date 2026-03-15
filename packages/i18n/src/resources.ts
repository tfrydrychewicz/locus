import aiEn from './locales/en/ai.json'
import calendarEn from './locales/en/calendar.json'
import cognitiveEn from './locales/en/cognitive.json'
import commonEn from './locales/en/common.json'
import entitiesEn from './locales/en/entities.json'
import helpEn from './locales/en/help.json'
import notesEn from './locales/en/notes.json'
import searchEn from './locales/en/search.json'
import settingsEn from './locales/en/settings.json'
import tasksEn from './locales/en/tasks.json'
import aiPl from './locales/pl/ai.json'
import calendarPl from './locales/pl/calendar.json'
import cognitivePl from './locales/pl/cognitive.json'
import commonPl from './locales/pl/common.json'
import entitiesPl from './locales/pl/entities.json'
import helpPl from './locales/pl/help.json'
import notesPl from './locales/pl/notes.json'
import searchPl from './locales/pl/search.json'
import settingsPl from './locales/pl/settings.json'
import tasksPl from './locales/pl/tasks.json'
import type { LocusResources, SupportedLocale } from './types.js'

export const resources: Record<SupportedLocale, LocusResources> = {
  en: {
    common: commonEn,
    notes: notesEn,
    tasks: tasksEn,
    calendar: calendarEn,
    search: searchEn,
    ai: aiEn,
    settings: settingsEn,
    cognitive: cognitiveEn,
    help: helpEn,
    entities: entitiesEn,
  },
  pl: {
    common: commonPl,
    notes: notesPl,
    tasks: tasksPl,
    calendar: calendarPl,
    search: searchPl,
    ai: aiPl,
    settings: settingsPl,
    cognitive: cognitivePl,
    help: helpPl,
    entities: entitiesPl,
  },
}
