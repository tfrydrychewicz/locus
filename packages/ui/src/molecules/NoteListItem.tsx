import type { ReactNode } from 'react'

export interface NoteListItemProps {
  title: string
  excerpt?: string
  updatedAt: string
  /** Called on click. Use event.shiftKey / event.metaKey for new pane / new tab. */
  onClick?: (e: React.MouseEvent) => void
  selected?: boolean
  archived?: boolean
  className?: string
  /** Optional right-side content (e.g. menu trigger) */
  trailing?: ReactNode
}

export function NoteListItem({
  title,
  excerpt,
  updatedAt,
  onClick,
  selected = false,
  archived = false,
  className = '',
  trailing,
}: NoteListItemProps) {
  const baseClass = [
    'flex w-full min-w-0 max-w-full flex-col gap-1 overflow-hidden rounded-lg border px-3 py-2.5 text-left',
    'transition-colors duration-150',
    'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
    selected && 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]',
    archived && 'opacity-60',
    onClick &&
      'cursor-pointer hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-text-muted)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {title || 'Untitled'}
        </span>
        {trailing}
      </div>
      {excerpt !== undefined && excerpt !== '' && (
        <p className="min-w-0 overflow-hidden text-xs text-[var(--color-text-muted)] line-clamp-2 break-all">
          {excerpt}
        </p>
      )}
      <time className="text-xs text-[var(--color-text-muted)]" dateTime={updatedAt}>
        {updatedAt}
      </time>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => onClick(e)}
        className={baseClass}
        aria-pressed={selected}
        aria-label={title || 'Untitled note'}
      >
        {content}
      </button>
    )
  }

  return <div className={baseClass}>{content}</div>
}
