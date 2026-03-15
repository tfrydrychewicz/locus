import { useTranslation } from '@locus/i18n'
import { Database, FileText, Plus, Search, Settings, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Note } from '../tauri/commands.js'
import { notesCreate, notesSearch } from '../tauri/commands.js'

export type PageId = 'today' | 'notes' | 'settings' | 'search' | 'entities' | 'trash'

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  section: 'commands'
  action: () => void | Promise<void>
}

interface NoteItem {
  id: string
  label: string
  icon: React.ReactNode
  section: 'notes'
  note: Note
  action: () => void
}

type PaletteItem = CommandItem | NoteItem

export interface CommandPaletteProps {
  onNavigate: (page: PageId) => void
  onOpenNote: (note: Note) => void
  onClose: () => void
}

export function CommandPalette({ onNavigate, onOpenNote, onClose }: CommandPaletteProps) {
  const { t } = useTranslation('common')
  const [query, setQuery] = useState('')
  const [noteResults, setNoteResults] = useState<Note[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Debounced note search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!query.trim()) {
      setNoteResults([])
      return
    }
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await notesSearch({ query: query.trim(), limit: 5 })
      setNoteResults(results.map((r) => r.note))
    }, 200)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [query])

  const baseCommands: CommandItem[] = [
    {
      id: 'go-today',
      label: t('commandPalette.commands.goToToday'),
      icon: <Zap size={15} />,
      section: 'commands',
      action: () => {
        onNavigate('today')
        onClose()
      },
    },
    {
      id: 'go-notes',
      label: t('commandPalette.commands.goToNotes'),
      icon: <FileText size={15} />,
      section: 'commands',
      action: () => {
        onNavigate('notes')
        onClose()
      },
    },
    {
      id: 'go-entities',
      label: t('commandPalette.commands.goToEntities'),
      icon: <Database size={15} />,
      section: 'commands',
      action: () => {
        onNavigate('entities')
        onClose()
      },
    },
    {
      id: 'go-search',
      label: t('commandPalette.commands.goToSearch'),
      icon: <Search size={15} />,
      section: 'commands',
      action: () => {
        onNavigate('search')
        onClose()
      },
    },
    {
      id: 'go-settings',
      label: t('commandPalette.commands.goToSettings'),
      icon: <Settings size={15} />,
      section: 'commands',
      action: () => {
        onNavigate('settings')
        onClose()
      },
    },
    {
      id: 'new-note',
      label: t('commandPalette.commands.newNote'),
      icon: <Plus size={15} />,
      section: 'commands',
      action: async () => {
        const note = await notesCreate({ title: '', body: '' })
        onOpenNote(note)
        onClose()
      },
    },
  ]

  // Filter commands by query
  const filteredCommands = query.trim()
    ? baseCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : baseCommands

  const noteItems: NoteItem[] = noteResults.map((note) => ({
    id: `note-${note.id}`,
    label: note.title || t('notes.untitled', { defaultValue: 'Untitled' }),
    icon: <FileText size={15} />,
    section: 'notes',
    note,
    action: () => {
      onOpenNote(note)
      onClose()
    },
  }))

  const allItems: PaletteItem[] = [...filteredCommands, ...noteItems]
  const totalItems = allItems.length

  // Keep a ref so handleKeyDown always reads the latest list without needing it as a dep
  const allItemsRef = useRef(allItems)
  allItemsRef.current = allItems

  // Clamp selectedIndex whenever list length changes
  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(totalItems - 1, 0)))
  }, [totalItems])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const items = allItemsRef.current
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        items[selectedIndex]?.action()
      }
    },
    [onClose, selectedIndex],
  )

  const commandSection = filteredCommands
  const noteSection = noteItems

  return (
    /* biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop closes on outside click */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search size={16} className="shrink-0 text-[var(--color-text-muted)]" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-label={t('commandPalette.placeholder')}
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)]">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div role="listbox" aria-label="Results" className="max-h-[360px] overflow-y-auto py-1">
          {allItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              {t('commandPalette.noResults')}
            </p>
          ) : (
            <>
              {commandSection.length > 0 && (
                <ResultSection
                  heading={t('commandPalette.sections.commands')}
                  items={commandSection}
                  allItems={allItems}
                  selectedIndex={selectedIndex}
                  onSelect={(item) => item.action()}
                  onHover={(item) => setSelectedIndex(allItems.indexOf(item))}
                />
              )}
              {noteSection.length > 0 && (
                <ResultSection
                  heading={t('commandPalette.sections.notes')}
                  items={noteSection}
                  allItems={allItems}
                  selectedIndex={selectedIndex}
                  onSelect={(item) => item.action()}
                  onHover={(item) => setSelectedIndex(allItems.indexOf(item))}
                />
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-2">
          <span className="text-[11px] text-[var(--color-text-muted)]">
            <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5">↑↓</kbd>{' '}
            navigate
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5">↵</kbd> select
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}

interface ResultSectionProps {
  heading: string
  items: PaletteItem[]
  allItems: PaletteItem[]
  selectedIndex: number
  onSelect: (item: PaletteItem) => void
  onHover: (item: PaletteItem) => void
}

function ResultSection({
  heading,
  items,
  allItems,
  selectedIndex,
  onSelect,
  onHover,
}: ResultSectionProps) {
  return (
    <div>
      <p className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {heading}
      </p>
      {items.map((item) => {
        const globalIdx = allItems.indexOf(item)
        const isSelected = globalIdx === selectedIndex
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={[
              'flex w-full items-center gap-3 px-4 py-2 text-[13px] transition-colors',
              isSelected
                ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]',
            ].join(' ')}
            onClick={() => onSelect(item)}
            onMouseEnter={() => onHover(item)}
          >
            <span className="shrink-0 text-[var(--color-text-muted)]" aria-hidden="true">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
            {item.section === 'notes' && (
              <span className="ml-auto shrink-0 text-[11px] text-[var(--color-text-muted)]">
                note
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
