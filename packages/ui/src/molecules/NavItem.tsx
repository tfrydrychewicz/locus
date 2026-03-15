import { Tooltip } from '../atoms/Tooltip.js'

export interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  /** Numeric badge shown on the right (e.g. unread count) */
  badge?: number
  /** When true, show only the icon with a tooltip for the label */
  collapsed?: boolean
  onClick?: () => void
  className?: string
}

export function NavItem({
  icon,
  label,
  active = false,
  disabled = false,
  badge,
  collapsed = false,
  onClick,
  className = '',
}: NavItemProps) {
  const button = (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center rounded-md transition-colors',
        collapsed ? 'justify-center px-0 py-1.5' : 'gap-2.5 px-2.5 py-1.5',
        active
          ? 'bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        'text-[13px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Icon */}
      <span
        className={[
          'flex shrink-0 items-center',
          active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]',
          collapsed ? 'relative' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {icon}
        {/* Dot indicator when collapsed and badge exists */}
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        )}
      </span>

      {/* Label + badge — hidden when collapsed */}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="ml-auto shrink-0 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
              <span aria-hidden="true">{badge > 99 ? '99+' : badge}</span>
              <span className="sr-only">{badge} items</span>
            </span>
          )}
        </>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip content={label} position="right" className="w-full">
        {button}
      </Tooltip>
    )
  }

  return button
}
