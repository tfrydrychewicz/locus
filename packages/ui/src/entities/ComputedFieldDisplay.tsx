import { Spinner } from '../atoms/Spinner.js'
import type { UiEntity, UiEntityType } from './types.js'

export interface ComputedFieldDisplayProps {
  entities: UiEntity[] | null
  entityTypes?: UiEntityType[]
  loading: boolean
  error?: string | null
  onEntityClick?: (entity: UiEntity) => void
  labels?: {
    loading?: string
    empty?: string
  }
  className?: string
}

const DEFAULTS = {
  loading: 'Running query…',
  empty: 'No matching entities',
}

export function ComputedFieldDisplay({
  entities,
  entityTypes = [],
  loading,
  error,
  onEntityClick,
  labels: labelsProp,
  className = '',
}: ComputedFieldDisplayProps) {
  const L = { ...DEFAULTS, ...labelsProp }

  if (error) {
    return (
      <div
        className={[
          'rounded-md border border-[var(--color-danger,#ef4444)]/30',
          'bg-[var(--color-danger,#ef4444)]/5 px-3 py-2 text-xs text-[var(--color-danger,#ef4444)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        role="alert"
      >
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className={['flex items-center gap-2 text-xs text-[var(--color-text-muted)]', className]
          .filter(Boolean)
          .join(' ')}
      >
        <Spinner size="sm" />
        <span>{L.loading}</span>
      </div>
    )
  }

  if (!entities || entities.length === 0) {
    return (
      <p
        className={['text-xs text-[var(--color-text-muted)] italic', className]
          .filter(Boolean)
          .join(' ')}
      >
        {L.empty}
      </p>
    )
  }

  const typeForEntity = (e: UiEntity): UiEntityType | undefined =>
    entityTypes.find((t) => t.slug === e.entityTypeSlug)

  return (
    <div
      className={['flex flex-wrap gap-1.5', className].filter(Boolean).join(' ')}
      data-testid="computed-field-display"
    >
      {entities.map((entity) => {
        const et = typeForEntity(entity)
        return (
          <EntityChip
            key={entity.id}
            entity={entity}
            entityType={et}
            onClick={onEntityClick ? () => onEntityClick(entity) : undefined}
          />
        )
      })}
    </div>
  )
}

function EntityChip({
  entity,
  entityType,
  onClick,
}: {
  entity: UiEntity
  entityType?: UiEntityType
  onClick?: () => void
}) {
  const color = entityType?.color ?? null
  const icon = entityType?.icon ?? null
  const trashed = entity.trashedAt !== null

  const className = [
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
    'text-xs font-medium transition-colors',
    'border-[var(--color-border)]',
    trashed
      ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] opacity-60'
      : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]',
    onClick &&
      !trashed &&
      'cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {color && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      {icon && <span aria-hidden="true">{icon}</span>}
      <span className="max-w-[120px] truncate">{entity.name || 'Untitled'}</span>
    </>
  )

  if (onClick && !trashed) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label={entity.name}>
        {content}
      </button>
    )
  }

  return <span className={className}>{content}</span>
}
