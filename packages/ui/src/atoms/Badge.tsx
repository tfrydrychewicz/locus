import type { ReactNode } from 'react'

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger'
  children: ReactNode
  className?: string
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default:
    'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
  success: 'bg-[rgba(52,211,153,0.1)] text-[var(--color-success)] border-[var(--color-success)]',
  warning: 'bg-[rgba(245,158,11,0.1)] text-[var(--color-warning)] border-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border-[var(--color-danger)]',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5',
        'text-xs font-medium leading-none',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
