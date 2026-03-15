import { describe, expect, it } from 'vitest'
import {
  ALL_TOPIC_IDS,
  getHelpTopic,
  getRelatedTopics,
  helpTopics,
  searchTopics,
} from './help-registry.js'

describe('help-registry', () => {
  it('exports all topic IDs', () => {
    expect(ALL_TOPIC_IDS.length).toBeGreaterThan(0)
    expect(ALL_TOPIC_IDS).toContain('getting-started')
    expect(ALL_TOPIC_IDS).toContain('notes.editor')
    expect(ALL_TOPIC_IDS).toContain('tasks.gtd')
  })

  it('every topic has required fields', () => {
    for (const id of ALL_TOPIC_IDS) {
      const topic = helpTopics[id]
      expect(topic.title).toBeTruthy()
      expect(topic.titleKey).toBeTruthy()
      expect(topic.namespace).toBeTruthy()
      expect(topic.file).toBeTruthy()
    }
  })

  it('getHelpTopic returns correct topic', () => {
    const topic = getHelpTopic('notes.editor')
    expect(topic.title).toBe('Note Editor')
    expect(topic.namespace).toBe('notes')
  })

  it('getRelatedTopics returns related topics', () => {
    const related = getRelatedTopics('notes.editor')
    expect(related.length).toBeGreaterThan(0)
    expect(related.some((t) => t.title === '@Mentions')).toBe(true)
  })

  it('getRelatedTopics returns empty for topics without related', () => {
    const related = getRelatedTopics('getting-started')
    expect(related).toEqual([])
  })

  it('related topic references are valid topic IDs', () => {
    for (const id of ALL_TOPIC_IDS) {
      const topic = helpTopics[id]
      if (topic.relatedTopics) {
        for (const relId of topic.relatedTopics) {
          expect(ALL_TOPIC_IDS).toContain(relId)
        }
      }
    }
  })

  describe('searchTopics', () => {
    it('finds topics by title', () => {
      const results = searchTopics('editor')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.id === 'notes.editor')).toBe(true)
    })

    it('finds topics by ID', () => {
      const results = searchTopics('tasks.gtd')
      expect(results.some((r) => r.id === 'tasks.gtd')).toBe(true)
    })

    it('returns empty for no matches', () => {
      const results = searchTopics('xyznonexistent')
      expect(results).toEqual([])
    })

    it('is case-insensitive', () => {
      const results = searchTopics('ENERGY')
      expect(results.some((r) => r.id === 'cognitive.energy')).toBe(true)
    })
  })
})
