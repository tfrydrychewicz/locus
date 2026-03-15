import { Database, Plus } from 'lucide-react'
import { Button } from '../atoms/Button.js'
import { Spinner } from '../atoms/Spinner.js'
import { EmptyState } from '../molecules/EmptyState.js'
import { SearchBar } from '../molecules/SearchBar.js'
import { EntityItem } from './EntityItem.js'
import type { UiEntity, UiEntityType } from './types.js'

export interface EntityListProps {
  entities: UiEntity[]
  entityTypes: UiEntityType[]
  selectedTypeSlug: string | null
  search: string
  loading: boolean
  selectedEntityId?: string | null
  onTypeFilter: (slug: string | null) => void
  onSearch: (query: string) => void
  onSelectEntity: (entity: UiEntity, e: React.MouseEvent) => void
  onCreateEntity: () => void
  /**
   * When false the type-filter tab bar is hidden.
   * Pass false when the view is already locked to a single type (e.g. navigated from sidebar).
   */
  showTypeTabs?: boolean
  /** i18n strings — supply from consumer to keep component unaware of i18n lib */
  labels?: {
    allTypes?: string
    newEntity?: string
    searchPlaceholder?: string
    emptyTitle?: string
    emptyDescription?: string
    emptySearchTitle?: string
    emptySearchDescription?: string
    trashedBadge?: string
  }
  className?: string
}

const DEFAULT_LABELS = {
  allTypes: 'All types',
  newEntity: 'New entity',
  searchPlaceholder: 'Search entities…',
  emptyTitle: 'No entities yet',
  emptyDescription: 'Create your first entity.',
  emptySearchTitle: 'No results',
  emptySearchDescription: 'No entities match your search.',
  trashedBadge: 'Trashed',
}

export function EntityList({
  entities,
  entityTypes,
  selectedTypeSlug,
  search,
  loading,
  selectedEntityId,
  onTypeFilter,
  onSearch,
  onSelectEntity,
  onCreateEntity,
  showTypeTabs = true,
  labels: labelsProp,
  className = '',
}: EntityListProps) {
  const L = { ...DEFAULT_LABELS, ...labelsProp }

  const typeForEntity = (e: UiEntity): UiEntityType =>
    entityTypes.find((t) => t.slug === e.entityTypeSlug) ?? {
      id: '',
      slug: e.entityTypeSlug,
      name: e.entityTypeSlug,
      icon: null,
      color: null,
      fields: '[]',
      isBuiltIn: false,
      createdAt: '',
      updatedAt: '',
      trashedAt: null,
    }

  const isEmpty = !loading && entities.length === 0

  return (
    <div
      className={['flex h-full flex-col overflow-hidden', className].filter(Boolean).join(' ')}
      data-testid="entity-list"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        <SearchBar
          value={search}
          onChange={onSearch}
          placeholder={L.searchPlaceholder}
          loading={loading}
          className="flex-1"
          aria-label={L.searchPlaceholder}
        />
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onCreateEntity}
          className="ml-2 shrink-0"
          aria-label={L.newEntity}
        >
          {L.newEntity}
        </Button>
      </div>

      {/* Type filter tabs */}
      {showTypeTabs && entityTypes.length > 0 && (
        <div
          className="flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--color-border)] px-3 py-1.5"
          role="tablist"
          aria-label="Filter by entity type"
        >
          <TypeTab
            label={L.allTypes}
            active={selectedTypeSlug === null}
            onClick={() => onTypeFilter(null)}
          />
          {entityTypes.map((et) => (
            <TypeTab
              key={et.slug}
              label={et.name}
              icon={et.icon}
              color={et.color}
              active={selectedTypeSlug === et.slug}
              onClick={() => onTypeFilter(et.slug)}
            />
          ))}
        </div>
      )}

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && entities.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isEmpty && search && (
          <EmptyState
            icon={Database}
            title={L.emptySearchTitle}
            description={L.emptySearchDescription}
          />
        )}

        {isEmpty && !search && (
          <EmptyState
            icon={Database}
            title={L.emptyTitle}
            description={L.emptyDescription}
            action={
              <Button variant="primary" size="sm" icon={Plus} onClick={onCreateEntity}>
                {L.newEntity}
              </Button>
            }
          />
        )}

        {entities.length > 0 && (
          <ul className="flex flex-col gap-1.5 p-3">
            {entities.map((entity) => {
              const et = typeForEntity(entity)
              return (
                <li key={entity.id}>
                  <EntityItem
                    name={entity.name}
                    entityType={et}
                    updatedAt={entity.updatedAt}
                    selected={entity.id === selectedEntityId}
                    trashed={entity.trashedAt !== null}
                    trashedLabel={L.trashedBadge}
                    onClick={(e) => onSelectEntity(entity, e)}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function TypeTab({
  label,
  icon,
  color,
  active,
  onClick,
}: {
  label: string
  icon?: string | null
  color?: string | null
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-[var(--color-accent)] text-white'
          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
      ].join(' ')}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {color && !icon && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      {label}
    </button>
  )
}
