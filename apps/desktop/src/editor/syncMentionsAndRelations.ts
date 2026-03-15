import {
  entityMentionsReplace,
  type MentionInput,
  noteRelationsReplace,
  type RelationInput,
} from '../tauri/commands.js'

const MENTION_TYPE = 'reference'
const RELATION_TYPE = 'links_to'

/**
 * Extract entity mention nodes from TipTap HTML and build MentionInput[].
 */
function extractMentionsFromHtml(html: string): MentionInput[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const spans = doc.querySelectorAll('span[data-type="entityMention"][data-id]')
  const mentions: MentionInput[] = []
  spans.forEach((el) => {
    const id = (el as HTMLElement).getAttribute('data-id')
    if (id) {
      mentions.push({ entityId: id, mentionType: MENTION_TYPE })
    }
  })
  return mentions
}

/**
 * Extract note link nodes from TipTap HTML and build RelationInput[].
 */
function extractNoteLinksFromHtml(html: string): RelationInput[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const spans = doc.querySelectorAll('span[data-type="noteLink"][data-id]')
  const relations: RelationInput[] = []
  const seen = new Set<string>()
  spans.forEach((el) => {
    const id = (el as HTMLElement).getAttribute('data-id')
    if (id && !seen.has(id)) {
      seen.add(id)
      relations.push({ toNoteId: id, relationType: RELATION_TYPE })
    }
  })
  return relations
}

/**
 * Sync entity mentions and note relations from note body HTML to the database.
 * Call after saving a note.
 */
export async function syncMentionsAndRelations(noteId: string, bodyHtml: string): Promise<void> {
  await Promise.all([
    entityMentionsReplace({ noteId, mentions: extractMentionsFromHtml(bodyHtml) }),
    noteRelationsReplace({ fromNoteId: noteId, relations: extractNoteLinksFromHtml(bodyHtml) }),
  ])
}
