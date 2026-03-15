import type { UiEntity, UiEntityType } from '@locus/ui'
import { EntityMentionPopup } from '@locus/ui'
import Mention from '@tiptap/extension-mention'
import type { Editor, NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { createElement, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { entitiesGet, entitiesList, entitiesSearch } from '../../tauri/commands.js'
import { EntityMentionSuggestionList } from './EntityMentionSuggestionList.js'

const SUGGESTION_LIMIT = 10

export interface EntityMentionExtensionOptions {
  entityTypes: UiEntityType[]
  onOpenEntity?: (entity: UiEntity) => void
}

function MentionChipView({ node, editor }: NodeViewProps) {
  const id = node.attrs.id as string
  const label = (node.attrs.label as string) ?? '…'
  const trashed = node.attrs.trashed === true

  const [popupOpen, setPopupOpen] = useState(false)
  const [popupEntity, setPopupEntity] = useState<UiEntity | null>(null)
  const [popupEntityType, setPopupEntityType] = useState<UiEntityType | null>(null)
  const [popupLoading, setPopupLoading] = useState(false)
  const [popupAnchor, setPopupAnchor] = useState<DOMRect | null>(null)

  const storage = editor.storage as {
    entityMention?: { entityTypes: UiEntityType[]; onOpenEntity?: (e: UiEntity) => void }
  }
  const entityTypes = storage.entityMention?.entityTypes ?? []
  const onOpenEntity = storage.entityMention?.onOpenEntity as ((e: UiEntity) => void) | undefined

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editor.isEditable) return
      e.preventDefault()
      setPopupAnchor((e.currentTarget as HTMLElement).getBoundingClientRect())
      setPopupOpen(true)
      setPopupEntity(null)
      setPopupEntityType(null)
      setPopupLoading(true)
    },
    [editor.isEditable],
  )

  useEffect(() => {
    if (!popupOpen || !id || !popupLoading) return
    let cancelled = false
    entitiesGet(id).then((entity) => {
      if (cancelled) return
      if (entity) {
        const et = entityTypes.find((t) => t.slug === entity.entityTypeSlug)
        setPopupEntity({
          id: entity.id,
          entityTypeId: entity.entityTypeId,
          entityTypeSlug: entity.entityTypeSlug,
          name: entity.name,
          fields: entity.fields,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
          trashedAt: entity.trashedAt,
        })
        setPopupEntityType(et ?? null)
      }
      setPopupLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [popupOpen, id, popupLoading, entityTypes])

  const chipClass = [
    'inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
    trashed
      ? 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)]'
      : 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  ].join(' ')

  return (
    <NodeViewWrapper as="span" className="mention-chip-wrapper">
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
        @{label}
      </button>
      {popupOpen && (
        <>
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setPopupOpen(false)}
            aria-hidden
          />
          <EntityMentionPopup
            entity={popupEntity}
            entityType={popupEntityType}
            loading={popupLoading}
            onOpen={onOpenEntity}
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

export function createEntityMentionExtension(options: EntityMentionExtensionOptions) {
  const suggestionState: {
    selectedIndex: number
    items: { id: string; label: string; entityTypeSlug?: string; trashed?: boolean }[]
    command:
      | ((item: { id: string; label: string; entityTypeSlug?: string; trashed?: boolean }) => void)
      | null
    clientRect: (() => DOMRect | null) | null
    range: { from: number; to: number } | null
    root: ReturnType<typeof createRoot> | null
    container: HTMLDivElement | null
    render: () => void
  } = {
    selectedIndex: 0,
    items: [],
    command: null,
    clientRect: null,
    range: null,
    root: null,
    container: null,
    render: () => {},
  }

  return Mention.extend({
    name: 'entityMention',

    addStorage() {
      return {
        entityTypes: options.entityTypes,
        onOpenEntity: options.onOpenEntity,
      }
    },

    addAttributes() {
      return {
        ...this.parent?.(),
        entityTypeSlug: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-entity-type-slug'),
          renderHTML: (attrs) =>
            attrs.entityTypeSlug ? { 'data-entity-type-slug': attrs.entityTypeSlug } : {},
        },
        trashed: {
          default: false,
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-trashed') === 'true',
          renderHTML: (attrs) => (attrs.trashed ? { 'data-trashed': 'true' } : {}),
        },
      }
    },

    addNodeView() {
      return ReactNodeViewRenderer(MentionChipView)
    },

    addOptions() {
      const parent = this.parent?.()
      const base = { ...parent }
      return {
        ...base,
        HTMLAttributes: { 'data-type': 'entityMention' },
        deleteTriggerWithBackspace: base.deleteTriggerWithBackspace ?? true,
        suggestions: base.suggestions ?? [],
        renderText:
          (base.renderText as
            | ((p: { node: { attrs: { label?: string; id?: string } } }) => string)
            | undefined) ??
          (({ node }: { node: { attrs: { label?: string; id?: string } } }) =>
            `@${node.attrs.label ?? node.attrs.id ?? ''}`),
        renderHTML: base.renderHTML ?? (() => ['span', { 'data-type': 'entityMention' }, 0]),
        suggestion: {
          char: '@',
          allowSpaces: true,
          items: async ({
            query,
          }: {
            query: string
          }): Promise<
            { id: string; label: string; entityTypeSlug?: string; trashed?: boolean }[]
          > => {
            if (!query.trim()) {
              const page = await entitiesList({ limit: SUGGESTION_LIMIT })
              return page.items.map((e) => ({
                id: e.id,
                label: e.name || 'Untitled',
                entityTypeSlug: e.entityTypeSlug,
                trashed: e.trashedAt != null,
              }))
            }
            const results = await entitiesSearch({ query, limit: SUGGESTION_LIMIT })
            return results.map((e) => ({
              id: e.id,
              label: e.name || 'Untitled',
              entityTypeSlug: e.entityTypeSlug,
              trashed: e.trashedAt != null,
            }))
          },
          command: ({
            editor,
            range,
            props,
          }: {
            editor: Editor
            range: { from: number; to: number }
            props: Record<string, unknown>
          }) => {
            const id = String(props.id ?? '')
            const label = String(props.label ?? 'Untitled')
            const attrs = {
              id,
              label,
              entityTypeSlug: (props.entityTypeSlug as string | undefined) ?? null,
              trashed: (props.trashed as boolean | undefined) ?? false,
            }
            const r = suggestionState.range ?? range
            const { view, state } = editor
            const node = state.schema.nodes.entityMention!.create(attrs)
            const tr = state.tr.replaceWith(r.from, r.to, node)
            view.dispatch(tr)
            editor.commands.focus()
          },
          render: () => ({
            onStart: (props: {
              items: { id: string; label: string; entityTypeSlug?: string; trashed?: boolean }[]
              command: (item: {
                id: string
                label: string
                entityTypeSlug?: string
                trashed?: boolean
              }) => void
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
                  createElement(EntityMentionSuggestionList, {
                    items: suggestionState.items,
                    selectedIndex: suggestionState.selectedIndex,
                    onSelect: (item) => {
                      suggestionState.command?.(item)
                    },
                    entityTypes: options.entityTypes,
                    clientRect: suggestionState.clientRect,
                  }),
                )
              }
              suggestionState.render()
            },
            onUpdate: (props: {
              items: { id: string; label: string; entityTypeSlug?: string; trashed?: boolean }[]
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
        },
        // biome-ignore lint/suspicious/noExplicitAny: TipTap Mention addOptions has strict types; our suggestion override is valid
      } as any
    },
  })
}
