import { ExternalLink, X } from 'lucide-react'
import { Button } from '../atoms/Button.js'
import { Spinner } from '../atoms/Spinner.js'
import type { UiNote } from './types.js'

export interface NoteLinkPopupProps {
  note: UiNote | null
  loading?: boolean
  onOpen?: (note: UiNote) => void
  onClose?: () => void
  labels?: {
    openNote?: string
    archivedNotice?: string
    loading?: string
  }
  style?: React.CSSProperties
  className?: string
}

const DEFAULTS = {
  openNote: 'Open note',
  archivedNotice: 'This note has been archived.',
  loading: 'Loading…',
}

const EXCERPT_MAX = 120

export function NoteLinkPopup({
  note,
  loading = false,
  onOpen,
  onClose,
  labels: labelsProp,
  style,
  className = '',
}: NoteLinkPopupProps) {
  const L = { ...DEFAULTS, ...labelsProp }

  const baseClass = [
    'z-50 w-72 rounded-xl border border-[var(--color-border)]',
    'bg-[var(--color-bg-elevated)] shadow-xl',
    'flex flex-col overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (loading) {
    return (
      <div className={baseClass} style={style} role="status">
        <div className="flex items-center justify-center p-6">
          <Spinner size="sm" />
        </div>
      </div>
    )
  }

  if (!note) return null

  const isArchived = note.archivedAt !== null
  const excerpt =
    note.bodyPlain.length > EXCERPT_MAX
      ? `${note.bodyPlain.slice(0, EXCERPT_MAX)}…`
      : note.bodyPlain

  return (
    <div className={baseClass} style={style} data-testid="note-link-popup">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {note.title || 'Untitled'}
          </span>
          <time className="text-[10px] text-[var(--color-text-muted)]" dateTime={note.updatedAt}>
            {note.updatedAt}
          </time>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)]"
            aria-label="Close"
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>

      {/* Archived notice */}
      {isArchived && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
          {L.archivedNotice}
        </div>
      )}

      {/* Excerpt */}
      {excerpt && (
        <div className="px-3 py-2.5">
          <p className="line-clamp-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {excerpt}
          </p>
        </div>
      )}

      {/* Footer */}
      {onOpen && !isArchived && (
        <div className="border-t border-[var(--color-border)] px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ExternalLink}
            onClick={() => onOpen(note)}
            className="w-full justify-start"
          >
            {L.openNote}
          </Button>
        </div>
      )}
    </div>
  )
}
