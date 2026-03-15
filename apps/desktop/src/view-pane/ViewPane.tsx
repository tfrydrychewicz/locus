import type { ViewContent } from './types.js'

export interface ViewPaneProps {
  content: ViewContent
  label: string
  isActive: boolean
  /** Show the close button only when multiple panes exist */
  showClose?: boolean
  onClose?: () => void
  children: (content: ViewContent) => React.ReactNode
  className?: string
}

export function ViewPane({
  content,
  label,
  isActive,
  showClose = false,
  onClose,
  children,
  className = '',
}: ViewPaneProps) {
  return (
    <div
      className={[
        'flex h-full min-w-0 flex-1 flex-col',
        isActive ? 'ring-1 ring-inset ring-[var(--color-accent)]/40' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Pane header — only visible when multiple panes exist */}
      {showClose && (
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1">
          <span className="truncate text-xs text-[var(--color-text-muted)]">{label}</span>
          <button
            type="button"
            aria-label="Close pane"
            title="Close pane"
            className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
          >
            ✕
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">{children(content)}</div>
    </div>
  )
}
