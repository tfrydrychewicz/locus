import type { UiNote } from '@locus/ui'
import { NoteLinkPopup } from '@locus/ui'
import { Node } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import type { Editor, NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Suggestion } from '@tiptap/suggestion'
import { createElement, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { notesGet, notesList, notesSearch } from '../../tauri/commands.js'
import { NoteLinkSuggestionList } from './NoteLinkSuggestionList.js'

const SUGGESTION_LIMIT = 10
const NOTE_LINK_PLUGIN_KEY = new PluginKey('noteLink')

export interface NoteLinkExtensionOptions {
  onOpenNote?: (note: UiNote) => void
}

function NoteLinkChipView({ node, editor }: NodeViewProps) {
  const id = node.attrs.id as string
  const label = (node.attrs.label as string) ?? '…'
  const archived = node.attrs.archived === true

  const [popupOpen, setPopupOpen] = useState(false)
  const [popupNote, setPopupNote] = useState<UiNote | null>(null)
  const [popupLoading, setPopupLoading] = useState(false)
  const [popupAnchor, setPopupAnchor] = useState<DOMRect | null>(null)

  const storage = editor.storage as { noteLink?: { onOpenNote?: (n: UiNote) => void } }
  const onOpenNote = storage.noteLink?.onOpenNote

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editor.isEditable) return
      e.preventDefault()
      setPopupAnchor((e.currentTarget as HTMLElement).getBoundingClientRect())
      setPopupOpen(true)
      setPopupNote(null)
      setPopupLoading(true)
    },
    [editor.isEditable],
  )

  useEffect(() => {
    if (!popupOpen || !id || !popupLoading) return
    let cancelled = false
    notesGet(id).then((note) => {
      if (cancelled) return
      if (note) {
        setPopupNote({
          id: note.id,
          title: note.title,
          body: note.body,
          bodyPlain: note.bodyPlain ?? '',
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          archivedAt: note.archivedAt,
        })
      }
      setPopupLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [popupOpen, id, popupLoading])

  const chipClass = [
    'inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
    archived
      ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'
      : 'bg-[rgba(52,211,153,0.15)] text-[var(--color-success)]',
  ].join(' ')

  return (
    <NodeViewWrapper as="span" className="note-link-chip-wrapper">
      <button
        type="button"
        className={chipClass}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick(e as unknown as React.MouseEvent)
          }
        }}
      >
        [[{label}]]
      </button>
      {popupOpen && (
        <>
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setPopupOpen(false)}
            aria-hidden
          />
          <NoteLinkPopup
            note={popupNote}
            loading={popupLoading}
            onOpen={onOpenNote}
            onClose={() => setPopupOpen(false)}
            style={
              popupAnchor
                ? {
                    position: 'fixed',
                    top: popupAnchor.bottom + 6,
                    left: popupAnchor.left,
                    zIndex: 99999,
                  }
                : undefined
            }
          />
        </>
      )}
    </NodeViewWrapper>
  )
}

export function createNoteLinkExtension(options: NoteLinkExtensionOptions) {
  const suggestionState = {
    selectedIndex: 0,
    items: [] as { id: string; label: string; archived?: boolean }[],
    command: null as ((item: { id: string; label: string; archived?: boolean }) => void) | null,
    clientRect: null as (() => DOMRect | null) | null,
    range: null as { from: number; to: number } | null,
    root: null as ReturnType<typeof createRoot> | null,
    container: null as HTMLDivElement | null,
    render: () => {},
  }

  return Node.create({
    name: 'noteLink',

    addStorage() {
      return {
        onOpenNote: options.onOpenNote,
      }
    },

    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,

    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-id'),
          renderHTML: (attrs) => (attrs.id ? { 'data-id': attrs.id } : {}),
        },
        label: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-label'),
          renderHTML: (attrs) => (attrs.label ? { 'data-label': attrs.label } : {}),
        },
        archived: {
          default: false,
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-archived') === 'true',
          renderHTML: (attrs) => (attrs.archived ? { 'data-archived': 'true' } : {}),
        },
      }
    },

    parseHTML() {
      return [{ tag: `span[data-type="${this.name}"]` }]
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        'span',
        { ...HTMLAttributes, 'data-type': this.name },
        `[[${node.attrs.label ?? node.attrs.id ?? ''}]]`,
      ]
    },

    addNodeView() {
      return ReactNodeViewRenderer(NoteLinkChipView)
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          pluginKey: NOTE_LINK_PLUGIN_KEY,
          char: '[[',
          allowSpaces: true,
          items: async ({
            query,
          }: {
            query: string
          }): Promise<{ id: string; label: string; archived?: boolean }[]> => {
            if (!query.trim()) {
              const page = await notesList({ limit: SUGGESTION_LIMIT })
              return page.items.map((n) => ({
                id: n.id,
                label: n.title || 'Untitled',
                archived: n.archivedAt != null,
              }))
            }
            const results = await notesSearch({ query, limit: SUGGESTION_LIMIT })
            return results.map((r) => ({
              id: r.note.id,
              label: r.note.title || 'Untitled',
              archived: r.note.archivedAt != null,
            }))
          },
          command: ({
            editor: ed,
            range,
            props,
          }: {
            editor: Editor
            range: { from: number; to: number }
            props: Record<string, unknown>
          }) => {
            const id = String(props.id ?? '')
            const label = String(props.label ?? 'Untitled')
            const archived = (props.archived as boolean | undefined) ?? false
            const r = suggestionState.range ?? range
            const { view, state } = ed
            const nodeType = state.schema.nodes.noteLink
            if (!nodeType) return
            const node = nodeType.create({ id, label, archived })
            const tr = state.tr.replaceWith(r.from, r.to, node)
            view.dispatch(tr)
            ed.commands.focus()
          },
          render: () => ({
            onStart: (props: {
              items: { id: string; label: string; archived?: boolean }[]
              command: (item: { id: string; label: string; archived?: boolean }) => void
              clientRect?: (() => DOMRect | null) | null
              range?: { from: number; to: number }
            }) => {
              suggestionState.selectedIndex = 0
              suggestionState.items = props.items
              suggestionState.command = props.command
              suggestionState.range = props.range ?? null
              suggestionState.clientRect = props.clientRect ?? null
              suggestionState.container = document.createElement('div')
              document.body.appendChild(suggestionState.container)
              suggestionState.root = createRoot(suggestionState.container)
              suggestionState.render = () => {
                suggestionState.root?.render(
                  createElement(NoteLinkSuggestionList, {
                    items: suggestionState.items,
                    selectedIndex: suggestionState.selectedIndex,
                    onSelect: (item) => suggestionState.command?.(item),
                    clientRect: suggestionState.clientRect,
                  }),
                )
              }
              suggestionState.render()
            },
            onUpdate: (props: {
              items: { id: string; label: string; archived?: boolean }[]
              clientRect?: (() => DOMRect | null) | null
              range?: { from: number; to: number }
            }) => {
              suggestionState.items = props.items
              suggestionState.clientRect = props.clientRect ?? suggestionState.clientRect
              suggestionState.range = props.range ?? suggestionState.range
              suggestionState.selectedIndex = Math.min(
                suggestionState.selectedIndex,
                Math.max(0, props.items.length - 1),
              )
              suggestionState.render()
            },
            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                suggestionState.selectedIndex = Math.min(
                  suggestionState.selectedIndex + 1,
                  suggestionState.items.length - 1,
                )
                suggestionState.render()
                return true
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                suggestionState.selectedIndex = Math.max(suggestionState.selectedIndex - 1, 0)
                suggestionState.render()
                return true
              }
              if (event.key === 'Enter') {
                event.preventDefault()
                const item = suggestionState.items[suggestionState.selectedIndex]
                if (item) suggestionState.command?.(item)
                return true
              }
              return false
            },
            onExit: () => {
              suggestionState.root?.unmount()
              suggestionState.container?.remove()
              suggestionState.root = null
              suggestionState.container = null
              suggestionState.command = null
              suggestionState.range = null
            },
          }),
        }),
      ]
    },
  })
}
