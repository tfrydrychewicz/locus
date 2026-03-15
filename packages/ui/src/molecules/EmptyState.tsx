import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Icon } from '../atoms/Icon.js'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={['flex w-full min-w-0 flex-col items-center justify-center py-16 px-6', className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={title}
    >
      <div
        className={[
          'flex w-full min-w-[22rem] max-w-lg flex-col items-center gap-6 rounded-2xl border border-[var(--color-border)]',
          'bg-[var(--color-bg-surface)] px-8 py-10 text-center shadow-sm',
        ].join(' ')}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
          aria-hidden="true"
        >
          <Icon icon={icon} size={24} />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  )
}
