import { useTranslation } from '@locus/i18n'
import { Button, EmptyState, NoteListItem, SearchBar } from '@locus/ui'
import { FileText } from 'lucide-react'
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

    const handleSearchChange = useCallback(
      (value: string) => {
        setSearchQuery(value)
        loadNotes(value)
      },
      [loadNotes],
    )

    const handleNoteClick = useCallback(
      (e: React.MouseEvent, note: Note) => {
        if (e.shiftKey && onOpenInNewPane) {
          e.preventDefault()
          onOpenInNewPane(note)
          return
        }
        if ((e.metaKey || e.ctrlKey) && onOpenInNewTab) {
          e.preventDefault()
          onOpenInNewTab(note)
          return
        }
        onSelectNote(note)
      },
      [onSelectNote, onOpenInNewPane, onOpenInNewTab],
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
      }),
      [handleNewNote],
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
          'flex h-full w-[240px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex shrink-0 flex-col gap-2 border-b border-[var(--color-border)] p-2">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('searchPlaceholder')}
            loading={loading}
          />
          <Button variant="primary" size="sm" className="w-full" onClick={handleNewNote}>
            {t('newNote')}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {notes.length === 0 && !loading ? (
            <EmptyState
              icon={FileText}
              title={t('emptyTitle')}
              description={t('emptyDescription')}
              action={
                <Button variant="primary" size="sm" onClick={handleNewNote}>
                  {t('newNote')}
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {notes.map((note) => (
                <li key={note.id}>
                  <NoteListItem
                    title={note.title || t('untitled')}
                    excerpt={note.bodyPlain?.slice(0, 80)}
                    updatedAt={note.updatedAt}
                    onClick={(e) => handleNoteClick(e, note)}
                    selected={selectedId === note.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  },
)
