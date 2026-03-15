import { useEffect, useRef } from 'react'

export interface NoteLinkItem {
  id: string
  label: string
  archived?: boolean
}

export interface NoteLinkSuggestionListProps {
  items: NoteLinkItem[]
  selectedIndex: number
  onSelect: (item: NoteLinkItem) => void
  clientRect: (() => DOMRect | null) | null
}

export function NoteLinkSuggestionList({
  items,
  selectedIndex,
  onSelect,
  clientRect,
}: NoteLinkSuggestionListProps) {
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
      {items.map((item, i) => (
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
          } ${item.archived ? 'opacity-60' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item)
          }}
        >
          <span className="flex-1 truncate">{item.label}</span>
          {item.archived && (
            <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">Archived</span>
          )}
        </button>
      ))}
    </div>
  )
}
