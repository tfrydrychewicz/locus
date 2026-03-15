import { useTranslation } from '@locus/i18n'
import { NoteList } from '@locus/ui'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Note } from '../tauri/commands.js'
import { notesCreate, notesList, notesSearch } from '../tauri/commands.js'

const LIST_LIMIT = 50

export interface NoteListPanelProps {
  selectedId: string | null
  onSelectNote: (note: Note | null) => void
  /** Shift-click: open in new pane to the right */
  onOpenInNewPane?: (note: Note) => void
  /** Cmd-click: open in new tab */
  onOpenInNewTab?: (note: Note) => void
  className?: string
}

export interface NoteListPanelHandle {
  createNote: () => Promise<void>
  focusSearch: () => void
  refreshNotes: () => void
}

export const NoteListPanel = forwardRef<NoteListPanelHandle, NoteListPanelProps>(
  function NoteListPanel(
    { selectedId, onSelectNote, onOpenInNewPane, onOpenInNewTab, className = '' },
    ref,
  ) {
    const { t } = useTranslation('notes')
    const [notes, setNotes] = useState<Note[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const initialLoadDone = useRef(false)
    const panelRef = useRef<HTMLDivElement>(null)

    const loadNotes = useCallback(async (query: string) => {
      setLoading(true)
      try {
        if (query.trim()) {
          const results = await notesSearch({ query: query.trim(), limit: LIST_LIMIT })
          setNotes(results.map((r) => r.note))
        } else {
          const page = await notesList({ limit: LIST_LIMIT })
          setNotes(page.items)
        }
      } finally {
        setLoading(false)
      }
    }, [])

    const handleNoteClick = useCallback(
      (note: { id: string }, e: React.MouseEvent) => {
        const fullNote = notes.find((n) => n.id === note.id)
        if (!fullNote) return
        if (e.shiftKey && onOpenInNewPane) {
          e.preventDefault()
          onOpenInNewPane(fullNote)
          return
        }
        if ((e.metaKey || e.ctrlKey) && onOpenInNewTab) {
          e.preventDefault()
          onOpenInNewTab(fullNote)
          return
        }
        onSelectNote(fullNote)
      },
      [notes, onSelectNote, onOpenInNewPane, onOpenInNewTab],
    )

    const handleNewNote = useCallback(async () => {
      const note = await notesCreate({ title: t('untitled'), body: '' })
      setNotes((prev) => [note, ...prev])
      onSelectNote(note)
    }, [onSelectNote, t])

    useImperativeHandle(
      ref,
      () => ({
        createNote: handleNewNote,
        focusSearch: () => {
          panelRef.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
        },
        refreshNotes: () => loadNotes(searchQuery),
      }),
      [handleNewNote, loadNotes, searchQuery],
    )

    useEffect(() => {
      if (!initialLoadDone.current) {
        initialLoadDone.current = true
        loadNotes('')
      }
    }, [loadNotes])

    return (
      <div
        ref={panelRef}
        className={[
          'flex h-full w-72 shrink-0 flex-col border-r border-[var(--color-border)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <NoteList
          notes={notes}
          search={searchQuery}
          loading={loading}
          selectedNoteId={selectedId}
          onSearch={(q) => {
            setSearchQuery(q)
            loadNotes(q)
          }}
          onSelectNote={handleNoteClick}
          onCreateNote={handleNewNote}
          labels={{
            newNote: t('newNote'),
            searchPlaceholder: t('searchPlaceholder'),
            emptyTitle: t('emptyTitle'),
            emptyDescription: t('emptyDescription'),
            emptySearchTitle: t('emptySearchTitle'),
            emptySearchDescription: t('emptySearchDescription'),
            untitled: t('untitled'),
          }}
        />
      </div>
    )
  },
)
