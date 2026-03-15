import { describe, expect, it } from 'vitest'
import {
  createEntityMention,
  createNoteRelation,
  mentionsForNote,
  relationsFromNote,
} from './entity-mention.js'

const NOTE_ID = '01ABCDEFGHJKMNPQRSTVWXYZ01'
const ENTITY_ID = '01ABCDEFGHJKMNPQRSTVWXYZ02'
const NOTE_ID_2 = '01ABCDEFGHJKMNPQRSTVWXYZ03'

describe('createEntityMention', () => {
  it('creates an inline mention with defaults', () => {
    const mention = createEntityMention({ noteId: NOTE_ID, entityId: ENTITY_ID })
    expect(mention.noteId).toBe(NOTE_ID)
    expect(mention.entityId).toBe(ENTITY_ID)
    expect(mention.mentionType).toBe('inline')
    expect(mention.id).toBeTruthy()
    expect(mention.offset).toBeUndefined()
  })

  it('creates a property mention with offset', () => {
    const mention = createEntityMention({
      noteId: NOTE_ID,
      entityId: ENTITY_ID,
      mentionType: 'property',
      offset: 42,
    })
    expect(mention.mentionType).toBe('property')
    expect(mention.offset).toBe(42)
  })

  it('rejects a negative offset', () => {
    expect(() =>
      createEntityMention({ noteId: NOTE_ID, entityId: ENTITY_ID, offset: -1 }),
    ).toThrow()
  })
})

describe('createNoteRelation', () => {
  it('creates a link relation with defaults', () => {
    const rel = createNoteRelation({ fromNoteId: NOTE_ID, toNoteId: NOTE_ID_2 })
    expect(rel.fromNoteId).toBe(NOTE_ID)
    expect(rel.toNoteId).toBe(NOTE_ID_2)
    expect(rel.relationType).toBe('link')
    expect(rel.id).toBeTruthy()
  })

  it('creates an embed relation', () => {
    const rel = createNoteRelation({
      fromNoteId: NOTE_ID,
      toNoteId: NOTE_ID_2,
      relationType: 'embed',
    })
    expect(rel.relationType).toBe('embed')
  })
})

describe('mentionsForNote', () => {
  it('filters mentions by noteId', () => {
    const m1 = createEntityMention({ noteId: NOTE_ID, entityId: ENTITY_ID })
    const m2 = createEntityMention({ noteId: NOTE_ID_2, entityId: ENTITY_ID })
    expect(mentionsForNote([m1, m2], NOTE_ID)).toEqual([m1])
  })
})

describe('relationsFromNote', () => {
  it('filters relations by fromNoteId', () => {
    const r1 = createNoteRelation({ fromNoteId: NOTE_ID, toNoteId: NOTE_ID_2 })
    const r2 = createNoteRelation({ fromNoteId: NOTE_ID_2, toNoteId: NOTE_ID })
    expect(relationsFromNote([r1, r2], NOTE_ID)).toEqual([r1])
  })
})
