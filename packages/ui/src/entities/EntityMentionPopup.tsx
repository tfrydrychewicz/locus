import { ExternalLink, X } from 'lucide-react'
import { Button } from '../atoms/Button.js'
import { Spinner } from '../atoms/Spinner.js'
import type { UiEntity, UiEntityType } from './types.js'
import { parseFields, parseFieldValues } from './types.js'

export interface EntityMentionPopupProps {
  entity: UiEntity | null
  entityType: UiEntityType | null
  loading?: boolean
  onOpen?: (entity: UiEntity) => void
  onClose?: () => void
  labels?: {
    openEntity?: string
    trashedNotice?: string
    loading?: string
  }
  /** CSS position for the popup (e.g. { top: 120, left: 80 }) */
  style?: React.CSSProperties
  className?: string
}

const DEFAULTS = {
  openEntity: 'Open entity',
  trashedNotice: 'This entity has been trashed.',
  loading: 'Loading…',
}

/** Max number of field values shown in the popup preview */
const PREVIEW_FIELDS = 3

export function EntityMentionPopup({
  entity,
  entityType,
  loading = false,
  onOpen,
  onClose,
  labels: labelsProp,
  style,
  className = '',
}: EntityMentionPopupProps) {
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

  if (!entity || !entityType) return null

  const isTrashed = entity.trashedAt !== null
  const typeColor = entityType.color ?? undefined
  const fields = parseFields(entityType.fields)
  const values = parseFieldValues(entity.fields)
  const previewFields = fields
    .filter((f) => f.type !== 'computed_query' && f.type !== 'relation')
    .sort((a, b) => a.order - b.order)
    .slice(0, PREVIEW_FIELDS)

  return (
    <div className={baseClass} style={style} data-testid="entity-mention-popup">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            {entityType.icon && (
              <span className="text-sm" aria-hidden>
                {entityType.icon}
              </span>
            )}
            <span className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {entity.name || 'Untitled'}
            </span>
          </div>
          <span
            className="inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: typeColor ? `${typeColor}20` : 'var(--color-bg-surface)',
              color: typeColor ?? 'var(--color-text-muted)',
            }}
          >
            {entityType.name}
          </span>
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

      {/* Trashed notice */}
      {isTrashed && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
          {L.trashedNotice}
        </div>
      )}

      {/* Field preview */}
      {previewFields.length > 0 && (
        <div className="flex flex-col gap-1.5 px-3 py-2.5">
          {previewFields.map((f) => {
            const val = values[f.id]
            if (val === null || val === undefined || val === '') return null
            return (
              <div key={f.id} className="flex items-baseline gap-2 text-xs">
                <span className="shrink-0 text-[var(--color-text-muted)]">{f.label}</span>
                <span className="truncate text-[var(--color-text-secondary)]">{String(val)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {onOpen && !isTrashed && (
        <div className="border-t border-[var(--color-border)] px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            icon={ExternalLink}
            onClick={() => onOpen(entity)}
            className="w-full justify-start"
          >
            {L.openEntity}
          </Button>
        </div>
      )}
    </div>
  )
}
