import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'

export interface ChipProps {
  label: string
  color?: string
  icon?: LucideIcon
  onClick?: () => void
  onRemove?: () => void
  className?: string
}

export function Chip({ label, color, icon: Icon, onClick, onRemove, className = '' }: ChipProps) {
  const isClickable = !!onClick

  const colorDot = color ? (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  ) : null

  const content = (
    <>
      {colorDot}
      {Icon && <Icon size={12} aria-hidden="true" />}
      <span className="truncate">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-[var(--color-bg-elevated)] cursor-pointer"
          aria-label={`Remove ${label}`}
        >
          <X size={10} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </>
  )

  const baseClass = [
    'inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)]',
    'bg-[var(--color-bg-surface)] px-2.5 py-1',
    'text-xs text-[var(--color-text-secondary)]',
    'transition-colors duration-150',
    isClickable &&
      'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (isClickable) {
    return (
      <button type="button" onClick={onClick} className={baseClass}>
        {content}
      </button>
    )
  }

  return <span className={baseClass}>{content}</span>
}
