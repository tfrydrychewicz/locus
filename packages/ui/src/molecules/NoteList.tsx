import { FileText, Plus } from 'lucide-react'
import { Button } from '../atoms/Button.js'
import { Spinner } from '../atoms/Spinner.js'
import { EmptyState } from './EmptyState.js'
import { NoteListItem } from './NoteListItem.js'
import { SearchBar } from './SearchBar.js'

export interface NoteListNote {
  id: string
  title: string
  bodyPlain?: string
  updatedAt: string
  archivedAt?: string | null
}

export interface NoteListProps {
  notes: NoteListNote[]
  search: string
  loading: boolean
  selectedNoteId?: string | null
  onSearch: (query: string) => void
  onSelectNote: (note: NoteListNote, e: React.MouseEvent) => void
  onCreateNote: () => void
  /** i18n strings — supply from consumer to keep component unaware of i18n lib */
  labels?: {
    newNote?: string
    searchPlaceholder?: string
    emptyTitle?: string
    emptyDescription?: string
    emptySearchTitle?: string
    emptySearchDescription?: string
    untitled?: string
  }
  className?: string
}

const DEFAULT_LABELS = {
  newNote: 'New note',
  searchPlaceholder: 'Search notes…',
  emptyTitle: 'No notes yet',
  emptyDescription: 'Create your first note.',
  emptySearchTitle: 'No results',
  emptySearchDescription: 'No notes match your search.',
  untitled: 'Untitled',
}

export function NoteList({
  notes,
  search,
  loading,
  selectedNoteId,
  onSearch,
  onSelectNote,
  onCreateNote,
  labels: labelsProp,
  className = '',
}: NoteListProps) {
  const L = { ...DEFAULT_LABELS, ...labelsProp }

  const isEmpty = !loading && notes.length === 0

  return (
    <div
      className={['flex h-full flex-col overflow-hidden', className].filter(Boolean).join(' ')}
      data-testid="note-list"
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-3">
        <SearchBar
          value={search}
          onChange={onSearch}
          placeholder={L.searchPlaceholder}
          loading={loading}
          className="flex-1"
          aria-label={L.searchPlaceholder}
        />
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onCreateNote}
          className="ml-2 shrink-0 !p-0 !h-8 !w-8"
          aria-label={L.newNote}
          title={L.newNote}
        />
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && notes.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isEmpty && search && (
          <EmptyState
            icon={FileText}
            title={L.emptySearchTitle}
            description={L.emptySearchDescription}
          />
        )}

        {isEmpty && !search && (
          <EmptyState
            icon={FileText}
            title={L.emptyTitle}
            description={L.emptyDescription}
            action={
              <Button variant="primary" size="sm" icon={Plus} onClick={onCreateNote}>
                {L.newNote}
              </Button>
            }
          />
        )}

        {notes.length > 0 && (
          <ul className="flex w-full flex-col gap-1.5 p-3">
            {notes.map((note) => (
              <li key={note.id} className="w-full min-w-0">
                <NoteListItem
                  title={note.title || L.untitled}
                  excerpt={note.bodyPlain?.slice(0, 80)}
                  updatedAt={note.updatedAt}
                  archived={note.archivedAt != null}
                  selected={note.id === selectedNoteId}
                  onClick={(e) => onSelectNote(note, e)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
