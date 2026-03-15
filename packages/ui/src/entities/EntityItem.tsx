import type { ReactNode } from 'react'
import { Icon } from '../atoms/Icon.js'
import { getEntityTypeIcon } from './entity-icons.js'
import type { UiEntityType } from './types.js'

export interface EntityItemProps {
  name: string
  entityType: Pick<UiEntityType, 'slug' | 'name' | 'icon' | 'color'>
  updatedAt: string
  selected?: boolean
  trashed?: boolean
  trashedLabel?: string
  onClick?: (e: React.MouseEvent) => void
  className?: string
  trailing?: ReactNode
}

export function EntityItem({
  name,
  entityType,
  updatedAt,
  selected = false,
  trashed = false,
  trashedLabel = 'Trashed',
  onClick,
  className = '',
  trailing,
}: EntityItemProps) {
  const baseClass = [
    'flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left',
    'transition-colors duration-150',
    'border-[var(--color-border)] bg-[var(--color-bg-surface)]',
    selected && 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]',
    trashed && 'opacity-60',
    onClick &&
      'cursor-pointer hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-text-muted)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const TypeIcon = getEntityTypeIcon(entityType.slug, entityType.icon)

  const content = (
    <>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {name || 'Untitled'}
        </span>
        {trailing}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: entityType.color
              ? `${entityType.color}20`
              : 'var(--color-bg-elevated)',
            color: entityType.color ?? 'var(--color-text-muted)',
          }}
        >
          <Icon icon={TypeIcon} size={10} aria-hidden />
          {entityType.name}
        </span>

        {trashed && (
          <span className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]">
            {trashedLabel}
          </span>
        )}
      </div>

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
        aria-label={name || 'Untitled entity'}
      >
        {content}
      </button>
    )
  }

  return <div className={baseClass}>{content}</div>
}
