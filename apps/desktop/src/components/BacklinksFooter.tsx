import { useTranslation } from '@locus/i18n'
import { BacklinksList } from '@locus/ui'
import { useCallback, useEffect, useState } from 'react'
import type { Note } from '../tauri/commands.js'
import { noteBacklinks, notesGet } from '../tauri/commands.js'

export interface BacklinksFooterProps {
  /** Current note ID — backlinks are notes that link TO this note */
  noteId: string
  /** Called when user clicks a backlink to open that note */
  onOpenNote: (note: Note) => void
  /** Refetch when this changes (e.g. after save) */
  refreshKey?: string
}

export function BacklinksFooter({ noteId, onOpenNote, refreshKey }: BacklinksFooterProps) {
  const { t } = useTranslation('notes')
  const [expanded, setExpanded] = useState(false)
  const [items, setItems] = useState<{ fromNoteId: string; title: string }[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBacklinks = useCallback(async () => {
    setLoading(true)
    try {
      const relations = await noteBacklinks(noteId)
      const uniqueFromIds = [...new Set(relations.map((r) => r.fromNoteId))]
      const notes = await Promise.all(
        uniqueFromIds.map((id) => notesGet(id).then((n) => (n ? { id, title: n.title } : null))),
      )
      setItems(
        notes
          .filter((n): n is { id: string; title: string } => n != null)
          .map((n) => ({ fromNoteId: n.id, title: n.title || t('untitled') })),
      )
    } finally {
      setLoading(false)
    }
  }, [noteId, t])

  useEffect(() => {
    fetchBacklinks()
    // refreshKey: when parent passes new value, we refetch (e.g. after save)
    // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers refetch
  }, [fetchBacklinks, refreshKey])

  const handleClick = useCallback(
    async (fromNoteId: string) => {
      const note = await notesGet(fromNoteId)
      if (note) onOpenNote(note)
    },
    [onOpenNote],
  )

  const count = items.length

  return (
    <BacklinksList
      items={items}
      expanded={expanded}
      loading={loading}
      loadingLabel={t('backlinks')}
      countLabel={t('backlinksCount', { count })}
      emptyLabel={t('noBacklinks')}
      onToggle={() => setExpanded((e) => !e)}
      onItemClick={handleClick}
    />
  )
}
