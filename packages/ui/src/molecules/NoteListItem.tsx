import type { ReactNode } from 'react'

export interface NoteListItemProps {
  title: string
  excerpt?: string
  updatedAt: string
  onClick?: () => void
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
    'flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left',
    'transition-colors duration-150',
    'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
    selected && 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]',
    archived && 'opacity-70',
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
        <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">{excerpt}</p>
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
        onClick={onClick}
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
