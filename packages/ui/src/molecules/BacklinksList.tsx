import { ChevronDown, ChevronRight, FileText } from 'lucide-react'

export interface BacklinkItem {
  fromNoteId: string
  title: string
}

export interface BacklinksListProps {
  /** Backlink items to display */
  items: BacklinkItem[]
  /** Whether the list is expanded */
  expanded: boolean
  /** Whether data is loading */
  loading?: boolean
  /** Label when loading (e.g. "Backlinks") */
  loadingLabel: string
  /** Label with count (e.g. "3 backlinks") */
  countLabel: string
  /** Label when empty (e.g. "No backlinks to this note.") */
  emptyLabel: string
  /** Toggle expand/collapse */
  onToggle: () => void
  /** Called when user clicks a backlink */
  onItemClick: (fromNoteId: string) => void
}

export function BacklinksList({
  items,
  expanded,
  loading = false,
  loadingLabel,
  countLabel,
  emptyLabel,
  onToggle,
  onItemClick,
}: BacklinksListProps) {
  return (
    <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
      >
        {expanded ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
        <FileText size={14} aria-hidden />
        <span>{loading ? loadingLabel : countLabel}</span>
      </button>
      {expanded && (
        <ul className="max-h-40 overflow-auto border-t border-[var(--color-border)] px-4 py-2">
          {items.length === 0 ? (
            <li className="py-2 text-sm text-[var(--color-text-muted)]">{emptyLabel}</li>
          ) : (
            items.map((item) => (
              <li key={item.fromNoteId}>
                <button
                  type="button"
                  onClick={() => onItemClick(item.fromNoteId)}
                  className="w-full truncate py-1.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-accent)]"
                >
                  {item.title}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
