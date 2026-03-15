import type { UiEntityType } from '@locus/ui'
import { getEntityTypeIcon } from '@locus/ui'
import { useEffect, useRef } from 'react'

export interface EntityMentionItem {
  id: string
  label: string
  entityTypeSlug?: string
  trashed?: boolean
}

export interface EntityMentionSuggestionListProps {
  items: EntityMentionItem[]
  selectedIndex: number
  onSelect: (item: EntityMentionItem) => void
  clientRect: (() => DOMRect | null) | null
  entityTypes?: UiEntityType[]
}

export function EntityMentionSuggestionList({
  items,
  selectedIndex,
  onSelect,
  clientRect,
  entityTypes = [],
}: EntityMentionSuggestionListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const selected = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (items.length === 0) return null

  const rect = clientRect?.() ?? null
  const style: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        zIndex: 99999,
      }
    : {}

  return (
    <div
      ref={listRef}
      role="listbox"
      className="max-h-60 min-w-[200px] overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-xl"
      style={style}
    >
      {items.map((item, i) => {
        const entityType = item.entityTypeSlug
          ? entityTypes.find((t) => t.slug === item.entityTypeSlug)
          : null
        const Icon = getEntityTypeIcon(item.entityTypeSlug ?? 'tag', entityType?.icon ?? null)
        return (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={i === selectedIndex}
            data-index={i}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
              i === selectedIndex
                ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
            } ${item.trashed ? 'opacity-60' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(item)
            }}
          >
            <Icon size={14} className="shrink-0 text-[var(--color-text-muted)]" aria-hidden />
            <span className="flex-1 truncate">{item.label}</span>
            {item.trashed && (
              <span className="shrink-0 text-[10px] text-[var(--color-danger)]">Trashed</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
