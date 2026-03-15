import { HelpButton } from '@locus/help'
import { useTranslation } from '@locus/i18n'
import {
  ComputedFieldDisplay,
  EntityDetail,
  EntityList,
  type EntityTypeFormData,
  EntityTypeModal,
  getEntityTypeIcon,
  type UiEntity,
  type UiEntityType,
} from '@locus/ui'
import { Pencil, Plus, Settings2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Entity, EntityType } from '../tauri/commands.js'
import {
  entitiesCreate,
  entitiesEvaluateComputed,
  entitiesList,
  entitiesSearch,
  entitiesTrash,
  entitiesUpdate,
  entityTypesCreate,
  entityTypesList,
  entityTypesUpdate,
} from '../tauri/commands.js'

type View = 'list' | 'detail'

const toUiEntityType = (et: EntityType): UiEntityType => et as UiEntityType
const toUiEntity = (e: Entity): UiEntity => e as UiEntity

const DEBOUNCE_MS = 300
const PAGE_LIMIT = 50

export interface EntitiesPageProps {
  /** Pre-select a type filter, e.g. 'person' from the sidebar nav */
  initialTypeSlug?: string | null
}

export function EntitiesPage({ initialTypeSlug = null }: EntitiesPageProps) {
  const { t } = useTranslation('entities')
  const { t: tc } = useTranslation('common')
  /** When navigated from a sidebar type item, lock the view to that type only. */
  const isLocked = initialTypeSlug !== null

  const [entityTypes, setEntityTypes] = useState<EntityType[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [typeSlug, setTypeSlug] = useState<string | null>(initialTypeSlug)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>('list')
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<EntityType | null>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadEntityTypes = useCallback(async () => {
    try {
      const types = await entityTypesList()
      setEntityTypes(types)
    } catch (err) {
      console.error('Failed to load entity types', err)
    }
  }, [])

  const loadEntities = useCallback(async (query: string, slugFilter: string | null) => {
    setLoadingList(true)
    try {
      if (query.trim()) {
        const results = await entitiesSearch({
          query,
          entityTypeSlug: slugFilter ?? undefined,
          limit: PAGE_LIMIT,
        })
        setEntities(results)
      } else {
        const page = await entitiesList({
          filter: { entityTypeSlug: slugFilter ?? undefined },
          limit: PAGE_LIMIT,
        })
        setEntities(page.items)
      }
    } catch (err) {
      console.error('Failed to load entities', err)
      setEntities([])
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    void loadEntityTypes()
  }, [loadEntityTypes])

  // biome-ignore lint/correctness/useExhaustiveDependencies: search changes handled by handleSearch
  useEffect(() => {
    void loadEntities(search, typeSlug)
  }, [loadEntities, typeSlug])

  const handleSearch = useCallback(
    (q: string) => {
      setSearch(q)
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      searchTimerRef.current = setTimeout(() => {
        void loadEntities(q, typeSlug)
      }, DEBOUNCE_MS)
    },
    [loadEntities, typeSlug],
  )

  const handleTypeFilter = useCallback(
    (slug: string | null) => {
      setTypeSlug(slug)
      void loadEntities(search, slug)
    },
    [loadEntities, search],
  )

  const handleSelectEntity = useCallback((entity: Entity) => {
    setSelectedEntityId(entity.id)
    setView('detail')
    setSelectedEntity(entity)
  }, [])

  const handleCreateEntity = useCallback(async () => {
    const targetTypeId = entityTypes.find((et) => et.slug === typeSlug)?.id ?? entityTypes[0]?.id
    if (!targetTypeId) return
    try {
      const created = await entitiesCreate({ entityTypeId: targetTypeId, name: '' })
      setEntities((prev) => [created, ...prev])
      setSelectedEntityId(created.id)
      setSelectedEntity(created)
      setView('detail')
    } catch (err) {
      console.error('Failed to create entity', err)
    }
  }, [entityTypes, typeSlug])

  const handleSave = useCallback(
    async (updates: { name: string; fields: string }) => {
      if (!selectedEntityId) return
      try {
        const updated = await entitiesUpdate({ id: selectedEntityId, ...updates })
        setSelectedEntity(updated)
        setEntities((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      } catch (err) {
        console.error('Failed to save entity', err)
      }
    },
    [selectedEntityId],
  )

  const handleTrash = useCallback(async () => {
    if (!selectedEntityId) return
    try {
      await entitiesTrash(selectedEntityId)
      setEntities((prev) => prev.filter((e) => e.id !== selectedEntityId))
      setSelectedEntityId(null)
      setSelectedEntity(null)
      setView('list')
    } catch (err) {
      console.error('Failed to trash entity', err)
    }
  }, [selectedEntityId])

  const renderComputedField = useCallback(
    (_fieldId: string, query: string, entityId: string) => {
      return <ComputedFieldContainer query={query} entityId={entityId} entityTypes={entityTypes} />
    },
    [entityTypes],
  )

  const handleSaveType = useCallback(
    async (data: EntityTypeFormData) => {
      try {
        if (editingType) {
          await entityTypesUpdate({
            id: editingType.id,
            name: data.name,
            icon: data.icon || undefined,
            color: data.color || undefined,
            fields: JSON.stringify(data.fields),
          })
        } else {
          await entityTypesCreate({
            slug: data.slug,
            name: data.name,
            icon: data.icon || undefined,
            color: data.color || undefined,
            fields: JSON.stringify(data.fields),
          })
        }
        await loadEntityTypes()
        setTypeModalOpen(false)
        setEditingType(null)
      } catch (err) {
        console.error('Failed to save entity type', err)
      }
    },
    [editingType, loadEntityTypes],
  )

  const selectedType = selectedEntity
    ? entityTypes.find((et) => et.id === selectedEntity.entityTypeId)
    : null

  const labels = {
    allTypes: t('allTypes'),
    newEntity: t('newEntity'),
    searchPlaceholder: t('searchPlaceholder'),
    emptyTitle: t('emptyTitle'),
    emptyDescription: t('emptyDescription'),
    emptySearchTitle: t('emptySearchTitle'),
    emptySearchDescription: t('emptySearchDescription'),
    trashedBadge: t('trashedBadge'),
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {(() => {
            const lockedType = isLocked
              ? entityTypes.find((et) => et.slug === initialTypeSlug)
              : null
            if (lockedType) {
              const TypeIcon = getEntityTypeIcon(lockedType.slug, lockedType.icon)
              return (
                <>
                  <TypeIcon
                    size={15}
                    aria-hidden
                    style={{ color: lockedType.color ?? undefined }}
                  />
                  {lockedType.name}
                </>
              )
            }
            return t('title')
          })()}
        </h1>
        <div className="flex items-center gap-1.5">
          {isLocked ? (
            // Edit the current entity type
            <button
              type="button"
              onClick={() => {
                const lockedType = entityTypes.find((et) => et.slug === initialTypeSlug) ?? null
                setEditingType(lockedType)
                setTypeModalOpen(true)
              }}
              className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              title={t('typeModal.editTitle', {
                name: entityTypes.find((et) => et.slug === initialTypeSlug)?.name ?? '',
              })}
            >
              <Pencil size={14} aria-hidden />
            </button>
          ) : (
            // Create a new entity type
            <button
              type="button"
              onClick={() => {
                setEditingType(null)
                setTypeModalOpen(true)
              }}
              className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              title="Manage entity types"
            >
              <Settings2 size={14} aria-hidden />
            </button>
          )}
          <HelpButton topic="entities.overview" />
        </div>
      </header>

      {/* Body: list panel + detail panel */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: entity list */}
        <div className="w-72 shrink-0 border-r border-[var(--color-border)]">
          <EntityList
            entities={entities.map(toUiEntity)}
            entityTypes={entityTypes.map(toUiEntityType)}
            selectedTypeSlug={typeSlug}
            search={search}
            loading={loadingList}
            selectedEntityId={selectedEntityId}
            showTypeTabs={!isLocked}
            onTypeFilter={handleTypeFilter}
            onSearch={handleSearch}
            onSelectEntity={(e) => {
              const raw = entities.find((ent) => ent.id === e.id)
              if (raw) void handleSelectEntity(raw)
            }}
            onCreateEntity={() => void handleCreateEntity()}
            labels={labels}
          />
        </div>

        {/* Right: entity detail or empty state */}
        <main className="min-w-0 flex-1 overflow-hidden">
          {view === 'detail' && selectedEntity && selectedType ? (
            <EntityDetail
              entity={toUiEntity(selectedEntity)}
              entityType={toUiEntityType(selectedType)}
              onSave={(u) => void handleSave(u)}
              onTrash={() => void handleTrash()}
              renderComputedField={renderComputedField}
              labels={{
                saveLabel: tc('save'),
                trashLabel: tc('delete'),
                nameLabel: t('fields.name'),
              }}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[var(--color-text-muted)]">
              <Plus size={32} className="opacity-30" aria-hidden />
              <span>{t('newEntity')}</span>
            </div>
          )}
        </main>
      </div>

      {/* Entity type modal */}
      {typeModalOpen && (
        <EntityTypeModal
          entityType={editingType ? toUiEntityType(editingType) : undefined}
          onSave={(data) => void handleSaveType(data)}
          onClose={() => {
            setTypeModalOpen(false)
            setEditingType(null)
          }}
          labels={{
            createTitle: t('typeModal.createTitle'),
            editTitle: t('typeModal.editTitle', { name: editingType?.name ?? '' }),
            nameLabel: t('typeModal.nameLabel'),
            namePlaceholder: t('typeModal.namePlaceholder'),
            slugLabel: t('typeModal.slugLabel'),
            slugPlaceholder: t('typeModal.slugPlaceholder'),
            iconLabel: t('typeModal.iconLabel'),
            colorLabel: t('typeModal.colorLabel'),
            fieldsLabel: t('typeModal.fieldsLabel'),
            addField: t('typeModal.addField'),
            fieldIdLabel: t('typeModal.fieldIdLabel'),
            fieldLabelLabel: t('typeModal.fieldLabelLabel'),
            fieldTypeLabel: t('typeModal.fieldTypeLabel'),
            removeField: t('typeModal.removeField'),
            builtInWarning: t('typeModal.builtInWarning'),
            saveLabel: tc('save'),
            cancelLabel: tc('cancel'),
          }}
        />
      )}
    </div>
  )
}

/** Container component that fetches computed field results from Tauri */
function ComputedFieldContainer({
  query,
  entityId,
  entityTypes,
}: {
  query: string
  entityId: string
  entityTypes: EntityType[]
}) {
  const [entities, setEntities] = useState<Entity[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setEntities([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    entitiesEvaluateComputed({ query, thisEntityId: entityId, limit: 20 })
      .then((page) => {
        setEntities(page.items)
        setLoading(false)
      })
      .catch((err) => {
        setError(String(err))
        setLoading(false)
      })
  }, [query, entityId])

  return (
    <ComputedFieldDisplay
      entities={entities?.map((e) => e as UiEntity) ?? null}
      entityTypes={entityTypes.map((et) => et as UiEntityType)}
      loading={loading}
      error={error}
    />
  )
}
