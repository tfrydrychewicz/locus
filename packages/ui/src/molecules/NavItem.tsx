export interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  /** Numeric badge shown on the right (e.g. unread count) */
  badge?: number
  onClick?: () => void
  className?: string
}

export function NavItem({
  icon,
  label,
  active = false,
  disabled = false,
  badge,
  onClick,
  className = '',
}: NavItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
        active
          ? 'bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className="flex shrink-0 items-center text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto shrink-0 rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
          <span aria-hidden="true">{badge > 99 ? '99+' : badge}</span>
          <span className="sr-only">{badge} items</span>
        </span>
      )}
    </button>
  )
}
