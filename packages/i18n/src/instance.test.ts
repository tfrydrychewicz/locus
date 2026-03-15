import { afterEach, describe, expect, it } from 'vitest'
import { i18n, initI18n } from './instance.js'

describe('i18n instance', () => {
  afterEach(() => {
    if (i18n.isInitialized) {
      i18n.changeLanguage('en')
    }
  })

  it('initializes with default locale (en)', async () => {
    await initI18n()
    expect(i18n.language).toBe('en')
    expect(i18n.isInitialized).toBe(true)
  })

  it('initializes with specified locale (pl)', async () => {
    if (i18n.isInitialized) {
      await i18n.changeLanguage('pl')
    } else {
      await initI18n('pl')
    }
    expect(i18n.language).toBe('pl')
  })

  it('translates common namespace keys in EN', async () => {
    if (!i18n.isInitialized) await initI18n()
    await i18n.changeLanguage('en')
    expect(i18n.t('common:save')).toBe('Save')
    expect(i18n.t('common:cancel')).toBe('Cancel')
    expect(i18n.t('common:delete')).toBe('Delete')
  })

  it('translates common namespace keys in PL', async () => {
    if (!i18n.isInitialized) await initI18n()
    await i18n.changeLanguage('pl')
    expect(i18n.t('common:save')).toBe('Zapisz')
    expect(i18n.t('common:cancel')).toBe('Anuluj')
    expect(i18n.t('common:delete')).toBe('Usuń')
  })

  it('translates nested keys', async () => {
    if (!i18n.isInitialized) await initI18n()
    await i18n.changeLanguage('en')
    expect(i18n.t('common:error.generic')).toBe('Something went wrong. Please try again.')
  })

  it('translates across namespaces', async () => {
    if (!i18n.isInitialized) await initI18n()
    await i18n.changeLanguage('en')
    expect(i18n.t('notes:newNote')).toBe('New note')
    expect(i18n.t('tasks:newTask')).toBe('New task')
    expect(i18n.t('calendar:today')).toBe('Today')
    expect(i18n.t('search:placeholder')).toBe('Search everything…')
    expect(i18n.t('ai:chat.title')).toBe('AI Assistant')
    expect(i18n.t('settings:title')).toBe('Settings')
    expect(i18n.t('cognitive:energy.title')).toBe('Energy Level')
    expect(i18n.t('help:panel.title')).toBe('Help')
  })

  it('falls back to EN for unknown locale', async () => {
    if (!i18n.isInitialized) await initI18n()
    await i18n.changeLanguage('de')
    expect(i18n.t('common:save')).toBe('Save')
  })
})
