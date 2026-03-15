import { RotateCcw, Trash2 } from 'lucide-react'

export interface TrashItemProps {
  label: string
  icon?: React.ReactNode
  onRestore: () => void
  onDeletePermanently: () => void
  restoreLabel: string
  deleteLabel: string
}

export function TrashItem({
  label,
  icon,
  onRestore,
  onDeletePermanently,
  restoreLabel,
  deleteLabel,
}: TrashItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon}
        <span className="truncate text-sm text-[var(--color-text-primary)]">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRestore()
          }}
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]"
        >
          <RotateCcw size={12} aria-hidden />
          {restoreLabel}
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDeletePermanently()
          }}
          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
        >
          <Trash2 size={12} aria-hidden />
          {deleteLabel}
        </button>
      </div>
    </li>
  )
}
