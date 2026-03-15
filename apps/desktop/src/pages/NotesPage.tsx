import { useTranslation } from '@locus/i18n'
import { Input } from '@locus/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NoteListPanel, type NoteListPanelHandle } from '../components/NoteListPanel.js'
import { NoteEditor } from '../editor/NoteEditor.js'
import { syncMentionsAndRelations } from '../editor/syncMentionsAndRelations.js'
import type { Note } from '../tauri/commands.js'
import { entityTypesList, notesGet, notesUpdate } from '../tauri/commands.js'
import type { PaneState, TabState, ViewContent } from '../view-pane/types.js'
import { ViewPane } from '../view-pane/ViewPane.js'

const SAVE_DEBOUNCE_MS = 500

function makePane(content: ViewContent = { type: 'empty' }, label = 'New Pane'): PaneState {
  return { id: crypto.randomUUID(), label, content }
}

export interface NotesPageProps {
  tab: TabState
  onTabChange: (updater: (tab: TabState) => TabState) => void
  /** Cmd-click: open note in a brand-new top-level tab */
  onOpenInNewTab: (note: Note) => void
}

export function NotesPage({ tab, onTabChange, onOpenInNewTab }: NotesPageProps) {
  const { t } = useTranslation('notes')
  const listPanelRef = useRef<NoteListPanelHandle>(null)
  const [activePaneId, setActivePaneId] = useState<string | null>(() => tab.activePaneId)
  const [entityTypes, setEntityTypes] = useState<Awaited<ReturnType<typeof entityTypesList>>>([])
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    entityTypesList().then(setEntityTypes)
  }, [])

  // Sync activePaneId when the tab itself changes (different tab selected)
  useEffect(() => {
    setActivePaneId(tab.activePaneId)
  }, [tab.activePaneId])

  const flushSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
  }, [])

  const scheduleSave = useCallback(
    (noteId: string, title: string, body: string, bodyPlain: string) => {
      flushSave()
      saveTimeoutRef.current = setTimeout(async () => {
        saveTimeoutRef.current = null
        await notesUpdate({ id: noteId, title, body, bodyPlain })
        await syncMentionsAndRelations(noteId, body)
      }, SAVE_DEBOUNCE_MS)
    },
    [flushSave],
  )

  useEffect(() => () => flushSave(), [flushSave])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault()
        listPanelRef.current?.createNote()
      }
      if (e.metaKey && e.key === 'f') {
        e.preventDefault()
        listPanelRef.current?.focusSearch()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  /** Replace the active pane's content. (Regular click) */
  const openInCurrentPane = useCallback(
    (note: Note) => {
      onTabChange((tab) => ({
        ...tab,
        label: note.title || t('untitled'),
        panes: tab.panes.map((p) =>
          p.id === activePaneId
            ? {
                ...p,
                label: note.title || t('untitled'),
                content: { type: 'note' as const, noteId: note.id },
              }
            : p,
        ),
      }))
    },
    [activePaneId, onTabChange, t],
  )

  /** Add a new pane to the right. (Shift-click) */
  const openInNewPane = useCallback(
    (note: Note) => {
      const pane = makePane({ type: 'note', noteId: note.id }, note.title || t('untitled'))
      onTabChange((tab) => ({ ...tab, panes: [...tab.panes, pane] }))
      setActivePaneId(pane.id)
    },
    [onTabChange, t],
  )

  const handleClosePane = useCallback(
    (paneId: string) => {
      onTabChange((tab) => {
        const idx = tab.panes.findIndex((p) => p.id === paneId)
        const next = tab.panes.filter((p) => p.id !== paneId)
        if (next.length === 0) return tab // never close the last pane
        const nextActiveId =
          activePaneId === paneId ? (next[idx]?.id ?? next[idx - 1]?.id ?? null) : activePaneId
        setActivePaneId(nextActiveId)
        return { ...tab, panes: next }
      })
    },
    [activePaneId, onTabChange],
  )

  /** Note highlighted in the list — whichever note is in the active pane */
  const selectedNoteId = (() => {
    const pane = tab.panes.find((p) => p.id === activePaneId)
    if (pane?.content.type === 'note') return pane.content.noteId
    return null
  })()

  const multiPane = tab.panes.length > 1

  return (
    <div className="flex h-full flex-1">
      <NoteListPanel
        ref={listPanelRef}
        selectedId={selectedNoteId}
        onSelectNote={(noteOrNull) => {
          if (noteOrNull) openInCurrentPane(noteOrNull)
        }}
        onOpenInNewPane={openInNewPane}
        onOpenInNewTab={onOpenInNewTab}
      />

      {/* Split panes — horizontal flex within the active tab */}
      <div className="flex min-w-0 flex-1">
        {tab.panes.map((pane, i) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: pane container uses mousedown for focus tracking
          <div
            key={pane.id}
            className={[
              'flex min-w-0 flex-1 flex-col',
              i > 0 ? 'border-l border-[var(--color-border)]' : '',
            ].join(' ')}
            onMouseDown={() => setActivePaneId(pane.id)}
          >
            <ViewPane
              content={pane.content}
              label={pane.label}
              isActive={pane.id === activePaneId}
              showClose={multiPane}
              onClose={() => handleClosePane(pane.id)}
            >
              {(content) => (
                <PaneContent
                  key={pane.id}
                  content={content}
                  onSave={scheduleSave}
                  entityTypes={entityTypes}
                  onOpenNote={openInCurrentPane}
                />
              )}
            </ViewPane>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PaneContent ─────────────────────────────────────────────────────────────

interface PaneContentProps {
  content: ViewContent
  onSave: (noteId: string, title: string, body: string, bodyPlain: string) => void
  entityTypes: Awaited<ReturnType<typeof entityTypesList>>
  onOpenNote: (note: Note) => void
}

function PaneContent({ content, onSave, entityTypes, onOpenNote }: PaneContentProps) {
  const { t } = useTranslation('notes')
  const { t: tCommon } = useTranslation('common')
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const noteId = content.type === 'note' ? content.noteId : null

  useEffect(() => {
    if (!noteId) {
      setNote(null)
      setTitle('')
      setBody('')
      return
    }
    let cancelled = false
    notesGet(noteId).then((n) => {
      if (!cancelled && n) {
        setNote(n)
        setTitle(n.title)
        setBody(n.body)
      }
    })
    return () => {
      cancelled = true
    }
  }, [noteId])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      setTitle(next)
      if (note) onSave(note.id, next, body, note.bodyPlain ?? '')
    },
    [note, body, onSave],
  )

  const handleEditorUpdate = useCallback(
    (nextBody: string, plainText: string) => {
      setBody(nextBody)
      if (note) onSave(note.id, title, nextBody, plainText)
    },
    [note, title, onSave],
  )

  if (content.type === 'empty') {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
        {t('selectNote')}
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-text-muted)]">
        {tCommon('loading')}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--color-bg)]">
      <div className="shrink-0 border-b border-[var(--color-border)] px-4 py-2">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder={t('titlePlaceholder')}
          className="border-0 bg-transparent text-lg font-semibold shadow-none focus:ring-0"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-0">
        <NoteEditor
          content={body}
          onUpdate={handleEditorUpdate}
          placeholder={t('bodyPlaceholder')}
          className="h-full rounded-none border-0"
          entityTypes={entityTypes}
          onOpenNote={(n) =>
            onOpenNote({
              id: n.id,
              title: n.title,
              body: n.body,
              bodyPlain: n.bodyPlain ?? '',
              templateId: null,
              embeddingDirty: false,
              createdAt: n.createdAt,
              updatedAt: n.updatedAt,
              archivedAt: n.archivedAt,
            } as Note)
          }
        />
      </div>
    </div>
  )
}
