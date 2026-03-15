import { useTranslation } from '@locus/i18n'
import {
  EntityMentionPopup,
  type FieldDef,
  getEntityTypeIcon,
  Input,
  NoteLinkPopup,
  parseRelationValue,
  RelationField,
  type RelationItem,
  serializeRelationValue,
  type UiEntity,
  type UiEntityType,
} from '@locus/ui'
import { FileText, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { Note } from '../tauri/commands.js'
import {
  entitiesGet,
  entitiesList,
  entitiesSearch,
  notesGet,
  notesList,
  notesSearch,
} from '../tauri/commands.js'

const PICKER_LIMIT = 20

export interface RelationFieldContainerProps {
  field: FieldDef
  value: string | null
  onChange: (value: string | null) => void
  entityTypes: UiEntityType[]
  /** Called when user clicks "Open" on a note in the popup, e.g. to navigate. Receives full note data. */
  onOpenNote?: (note: Note) => void
  /** Called when user clicks "Open" on an entity in the popup, e.g. to select it. */
  onOpenEntity?: (entity: UiEntity) => void
}

export function RelationFieldContainer({
  field,
  value,
  onChange,
  entityTypes,
  onOpenNote,
  onOpenEntity,
}: RelationFieldContainerProps) {
  const { t } = useTranslation('entities')
  const target = field.relationTarget ?? 'entity'
  const cardinality = field.relationCardinality ?? 'one'
  const relatedSlug = field.relatedTypeSlug

  const [selectedItems, setSelectedItems] = useState<RelationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pickerResults, setPickerResults] = useState<RelationItem[]>([])
  const [pickerLoading, setPickerLoading] = useState(false)
  const [popupItemId, setPopupItemId] = useState<string | null>(null)
  const [popupAnchorRect, setPopupAnchorRect] = useState<DOMRect | null>(null)
  const [popupEntity, setPopupEntity] = useState<UiEntity | null>(null)
  const [popupEntityType, setPopupEntityType] = useState<UiEntityType | null>(null)
  const [popupNote, setPopupNote] = useState<Note | null>(null)
  const [popupLoading, setPopupLoading] = useState(false)

  const ids = parseRelationValue(value)

  // Resolve IDs to RelationItems
  // biome-ignore lint/correctness/useExhaustiveDependencies: ids.join(',') is intentional — ids is a new array each render; string is stable
  useEffect(() => {
    if (ids.length === 0) {
      setSelectedItems([])
      return
    }
    let cancelled = false
    setLoading(true)
    const load = async () => {
      const items: RelationItem[] = []
      for (const id of ids) {
        if (cancelled) return
        try {
          if (target === 'note') {
            const note = await notesGet(id)
            if (note) {
              items.push({
                id: note.id,
                label: note.title || 'Untitled',
                subtitle: 'Note',
                icon: FileText,
              })
            }
          } else {
            const entity = await entitiesGet(id)
            if (entity) {
              const et = entityTypes.find((t) => t.slug === entity.entityTypeSlug)
              items.push({
                id: entity.id,
                label: entity.name || 'Untitled',
                subtitle: et?.name ?? entity.entityTypeSlug,
                icon: et ? getEntityTypeIcon(et.slug, et.icon) : undefined,
                color: et?.color ?? undefined,
              })
            }
          }
        } catch {
          items.push({ id, label: id, subtitle: '…' })
        }
      }
      if (!cancelled) setSelectedItems(items)
    }
    load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [ids.join(','), target, entityTypes])

  // Search for picker results
  useEffect(() => {
    if (!pickerOpen) return
    let cancelled = false
    setPickerLoading(true)
    const search = async () => {
      try {
        if (target === 'note') {
          const query = pickerQuery.trim()
          const notes: Note[] = query
            ? (await notesSearch({ query, limit: PICKER_LIMIT })).map((r) => r.note)
            : (await notesList({ limit: PICKER_LIMIT })).items
          if (cancelled) return
          setPickerResults(
            notes.map((n) => ({
              id: n.id,
              label: n.title || 'Untitled',
              subtitle: 'Note',
              icon: FileText,
            })),
          )
        } else {
          const query = pickerQuery.trim()
          const results = query
            ? await entitiesSearch({
                query,
                entityTypeSlug: relatedSlug ?? undefined,
                limit: PICKER_LIMIT,
              })
            : (
                await entitiesList({
                  filter: relatedSlug ? { entityTypeSlug: relatedSlug } : undefined,
                  limit: PICKER_LIMIT,
                })
              ).items
          if (cancelled) return
          setPickerResults(
            results.map((e) => {
              const et = entityTypes.find((t) => t.slug === e.entityTypeSlug)
              return {
                id: e.id,
                label: e.name || 'Untitled',
                subtitle: et?.name ?? e.entityTypeSlug,
                icon: et ? getEntityTypeIcon(et.slug, et.icon) : undefined,
                color: et?.color ?? undefined,
              }
            }),
          )
        }
      } catch {
        if (!cancelled) setPickerResults([])
      } finally {
        if (!cancelled) setPickerLoading(false)
      }
    }
    const t = setTimeout(search, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [pickerOpen, pickerQuery, target, relatedSlug, entityTypes])

  const handleRemove = useCallback(
    (id: string) => {
      const next = ids.filter((i) => i !== id)
      onChange(serializeRelationValue(next, cardinality))
    },
    [ids, cardinality, onChange],
  )

  const handleAddClick = useCallback(() => setPickerOpen(true), [])

  const handleSelect = useCallback(
    (item: RelationItem) => {
      const next = cardinality === 'one' ? [item.id] : [...ids, item.id]
      onChange(serializeRelationValue(next, cardinality))
      setPickerOpen(false)
      setPickerQuery('')
    },
    [cardinality, ids, onChange],
  )

  const handleClosePicker = useCallback(() => {
    setPickerOpen(false)
    setPickerQuery('')
  }, [])

  const handleItemClick = useCallback((id: string, e?: React.MouseEvent) => {
    const rect = e?.currentTarget ? (e.currentTarget as HTMLElement).getBoundingClientRect() : null
    setPopupItemId(id)
    setPopupAnchorRect(rect)
    setPopupEntity(null)
    setPopupEntityType(null)
    setPopupNote(null)
    setPopupLoading(true)
  }, [])

  const handleClosePopup = useCallback(() => {
    setPopupItemId(null)
    setPopupAnchorRect(null)
    setPopupEntity(null)
    setPopupEntityType(null)
    setPopupNote(null)
  }, [])

  // Fetch entity/note when popup opens
  useEffect(() => {
    if (!popupItemId) return
    let cancelled = false
    const load = async () => {
      try {
        if (target === 'note') {
          const note = await notesGet(popupItemId)
          if (cancelled) return
          setPopupNote(note)
        } else {
          const entity = await entitiesGet(popupItemId)
          if (cancelled) return
          if (entity) {
            const et = entityTypes.find((t) => t.slug === entity.entityTypeSlug)
            setPopupEntity({
              id: entity.id,
              entityTypeId: entity.entityTypeId,
              entityTypeSlug: entity.entityTypeSlug,
              name: entity.name,
              fields: entity.fields,
              createdAt: entity.createdAt,
              updatedAt: entity.updatedAt,
              trashedAt: entity.trashedAt,
            })
            setPopupEntityType(et ?? null)
          } else {
            setPopupEntity(null)
            setPopupEntityType(null)
          }
        }
      } catch {
        if (!cancelled) {
          setPopupEntity(null)
          setPopupEntityType(null)
          setPopupNote(null)
        }
      } finally {
        if (!cancelled) setPopupLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [popupItemId, target, entityTypes])

  const popupStyle: React.CSSProperties | undefined =
    popupAnchorRect != null
      ? {
          position: 'fixed',
          top: popupAnchorRect.bottom + 6,
          left: popupAnchorRect.left,
          zIndex: 99999,
        }
      : undefined

  if (loading) {
    return (
      <div className="text-xs text-[var(--color-text-muted)] italic">
        {t('relationField.loading')}
      </div>
    )
  }

  return (
    <>
      <RelationField
        selectedItems={selectedItems}
        onRemove={handleRemove}
        onAddClick={handleAddClick}
        onItemClick={handleItemClick}
        cardinality={cardinality}
        emptyLabel={
          target === 'note' ? t('relationField.emptyNote') : t('relationField.emptyEntity')
        }
        addLabel={target === 'note' ? t('relationField.addNote') : t('relationField.addEntity')}
        changeLabel={
          target === 'note' ? t('relationField.changeNote') : t('relationField.changeEntity')
        }
      />

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={
            target === 'note' ? t('relationField.selectNote') : t('relationField.selectEntity')
          }
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleClosePicker}
            aria-hidden="true"
          />
          <div className="relative z-10 flex w-full max-w-md flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {target === 'note'
                  ? t('relationField.selectNote')
                  : t('relationField.selectEntity')}
              </h3>
              <button
                type="button"
                onClick={handleClosePicker}
                className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                aria-label="Close"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <Input
              type="search"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder={t('relationField.searchPlaceholder')}
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto rounded-lg border border-[var(--color-border)]">
              {pickerLoading ? (
                <div className="flex items-center justify-center py-8 text-xs text-[var(--color-text-muted)]">
                  {t('relationField.searching')}
                </div>
              ) : pickerResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                  {t('relationField.noResults')}
                </div>
              ) : (
                <ul className="divide-y divide-[var(--color-border)]">
                  {pickerResults
                    .filter((r) => !ids.includes(r.id))
                    .map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                        >
                          {item.icon && <item.icon size={14} aria-hidden />}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.subtitle && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {item.subtitle}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popup overlay + EntityMentionPopup or NoteLinkPopup */}
      {popupItemId != null && (
        <>
          <div className="fixed inset-0 z-[99998]" onClick={handleClosePopup} aria-hidden="true" />
          {target === 'note' ? (
            <NoteLinkPopup
              note={popupNote}
              loading={popupLoading}
              onOpen={onOpenNote ? (n) => onOpenNote(n as Note) : undefined}
              onClose={handleClosePopup}
              style={popupStyle}
            />
          ) : (
            <EntityMentionPopup
              entity={popupEntity}
              entityType={popupEntityType}
              loading={popupLoading}
              onOpen={onOpenEntity}
              onClose={handleClosePopup}
              style={popupStyle}
            />
          )}
        </>
      )}
    </>
  )
}
