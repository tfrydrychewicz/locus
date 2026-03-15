import { describe, expect, it } from 'vitest'
import { getHelpContent, registerHelpContent } from './help-content.js'

describe('help-content', () => {
  it('returns EN content for getting-started', () => {
    const article = getHelpContent('getting-started', 'en')
    expect(article).not.toBeNull()
    expect(article?.title).toBe('Getting Started with Locus')
    expect(article?.quickAnswer).toBeTruthy()
    expect(article?.sections.length).toBeGreaterThan(0)
  })

  it('returns PL content for getting-started', () => {
    const article = getHelpContent('getting-started', 'pl')
    expect(article).not.toBeNull()
    expect(article?.title).toBe('Pierwsze kroki z Locus')
    expect(article?.quickAnswer).toBeTruthy()
  })

  it('EN and PL have same number of sections', () => {
    const en = getHelpContent('getting-started', 'en')
    const pl = getHelpContent('getting-started', 'pl')
    expect(en?.sections.length).toBe(pl?.sections.length)
  })

  it('both locales have ADHD tips', () => {
    const en = getHelpContent('getting-started', 'en')
    const pl = getHelpContent('getting-started', 'pl')
    expect(en?.adhdTip).toBeTruthy()
    expect(pl?.adhdTip).toBeTruthy()
  })

  it('falls back to EN for unknown locale', () => {
    const article = getHelpContent('getting-started', 'de')
    expect(article).not.toBeNull()
    expect(article?.title).toBe('Getting Started with Locus')
  })

  it('returns @Mentions content for notes.mentions', () => {
    const article = getHelpContent('notes.mentions', 'en')
    expect(article).not.toBeNull()
    expect(article?.title).toBe('@Mentions & Note Links')
    expect(article?.quickAnswer).toContain('@')
  })

  it('registerHelpContent adds new content', () => {
    registerHelpContent('en', 'notes.editor', {
      title: 'Note Editor',
      quickAnswer: 'Write and format notes with rich text.',
      sections: [],
    })
    const article = getHelpContent('notes.editor', 'en')
    expect(article).not.toBeNull()
    expect(article?.title).toBe('Note Editor')
  })
})
