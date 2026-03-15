import type { ReactNode } from 'react'

export type CalloutVariant = 'info' | 'warning' | 'success' | 'danger'

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]',
  warning: 'border-[var(--color-warning)] bg-[rgba(245,158,11,0.1)]',
  success: 'border-[var(--color-success)] bg-[rgba(52,211,153,0.1)]',
  danger: 'border-[var(--color-danger)] bg-[var(--color-danger-subtle)]',
}

const variantLabels: Record<CalloutVariant, string> = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  danger: 'Danger',
}

export interface CalloutProps {
  variant?: CalloutVariant
  children: ReactNode
  className?: string
}

export function Callout({ variant = 'info', children, className = '' }: CalloutProps) {
  return (
    <div
      className={[
        'callout border-l-4 rounded-r-lg px-3 py-2 my-2',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="note"
    >
      <span
        className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        {variantLabels[variant]}
      </span>
      <div className="callout-content text-sm text-[var(--color-text-primary)]">{children}</div>
    </div>
  )
}
