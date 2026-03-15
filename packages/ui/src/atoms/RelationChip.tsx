import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'

export interface RelationChipProps {
  id: string
  label: string
  /** Optional secondary line (e.g. entity type name, note excerpt) */
  subtitle?: string
  icon?: LucideIcon
  color?: string
  onRemove?: () => void
  /** When set, chip is clickable (e.g. to open popup). Receives the click event for positioning. */
  onClick?: (e: React.MouseEvent) => void
  className?: string
}

/**
 * Atom for displaying a single relation item (note or entity).
 * Shows label, optional subtitle, optional icon/color, and remove button.
 */
export function RelationChip({
  id,
  label,
  subtitle,
  icon: Icon,
  color,
  onRemove,
  onClick,
  className = '',
}: RelationChipProps) {
  const isClickable = !!onClick

  const content = (
    <>
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon size={12} aria-hidden="true" className="shrink-0" />}
      <span className="min-w-0 flex flex-col">
        <span className="truncate">{label || 'Untitled'}</span>
        {subtitle && (
          <span className="truncate text-[10px] text-[var(--color-text-muted)]">{subtitle}</span>
        )}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 shrink-0 rounded p-0.5 transition-colors hover:bg-[var(--color-bg-elevated)]"
          aria-label={`Remove ${label}`}
        >
          <X size={10} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </>
  )

  const baseClass = [
    'inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)]',
    'bg-[var(--color-bg-surface)] px-2.5 py-1.5',
    'text-xs text-[var(--color-text-secondary)]',
    'transition-colors duration-150',
    isClickable &&
      'cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (isClickable && onClick) {
    return (
      <button type="button" onClick={(e) => onClick(e)} className={baseClass} aria-label={label}>
        {content}
      </button>
    )
  }

  return (
    <span className={baseClass} data-relation-id={id}>
      {content}
    </span>
  )
}
