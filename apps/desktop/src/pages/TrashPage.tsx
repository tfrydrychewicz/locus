import { HelpButton } from '@locus/help'
import { useTranslation } from '@locus/i18n'
import { EmptyState, getEntityTypeIcon, TrashItem } from '@locus/ui'
import { FileText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { Entity, EntityType, Note } from '../tauri/commands.js'
import {
  entitiesHardDelete,
  entitiesList,
  entitiesRestore,
  entityTypesList,
  notesDelete,
  notesList,
  notesRestore,
} from '../tauri/commands.js'
import { confirmAction } from '../tauri/confirm.js'

const LIST_LIMIT = 100

export function TrashPage() {
  const { t } = useTranslation('common')
  const { t: tNotes } = useTranslation('notes')
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([])
  const [trashedEntities, setTrashedEntities] = useState<Entity[]>([])
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([])
  const [loading, setLoading] = useState(true)

  const loadTrash = useCallback(async () => {
    setLoading(true)
    try {
      const [notesPage, entitiesPage, types] = await Promise.all([
        notesList({ filter: { archived: true }, limit: LIST_LIMIT }),
        entitiesList({ filter: { trashed: true }, limit: LIST_LIMIT }),
        entityTypesList(),
      ])
      setArchivedNotes(notesPage.items)
      setTrashedEntities(entitiesPage.items)
      setEntityTypes(types)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTrash()
  }, [loadTrash])

  const handleRestoreNote = useCallback(async (id: string) => {
    await notesRestore(id)
    setArchivedNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const handleDeleteNotePermanently = useCallback(
    async (id: string) => {
      const ok = await confirmAction(t('confirm_delete.message'), {
        title: t('confirm_delete.title'),
        okLabel: t('confirm_delete.confirm'),
        cancelLabel: t('confirm_delete.cancel'),
      })
      if (!ok) return
      try {
        await notesDelete(id, true)
        setArchivedNotes((prev) => prev.filter((n) => n.id !== id))
      } catch (err) {
        console.error('notesDelete failed:', err)
        window.alert(err instanceof Error ? err.message : String(err))
      }
    },
    [t],
  )

  const handleRestoreEntity = useCallback(async (id: string) => {
    await entitiesRestore(id)
    setTrashedEntities((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const handleDeleteEntityPermanently = useCallback(
    async (id: string) => {
      const ok = await confirmAction(t('confirm_delete.message'), {
        title: t('confirm_delete.title'),
        okLabel: t('confirm_delete.confirm'),
        cancelLabel: t('confirm_delete.cancel'),
      })
      if (!ok) return
      try {
        await entitiesHardDelete(id)
        setTrashedEntities((prev) => prev.filter((e) => e.id !== id))
      } catch (err) {
        console.error('entitiesHardDelete failed:', err)
        window.alert(err instanceof Error ? err.message : String(err))
      }
    },
    [t],
  )

  const isEmpty = !loading && archivedNotes.length === 0 && trashedEntities.length === 0

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--color-bg)]">
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {t('trash.title')}
        </h1>
        <HelpButton topic="trash.overview" />
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-[var(--color-text-muted)]">
            {t('loading')}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={FileText}
            title={t('trash.emptyTitle')}
            description={t('trash.emptyDescription')}
          />
        ) : (
          <div className="flex flex-col gap-8">
            {archivedNotes.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                  {t('trash.archivedNotes')}
                </h2>
                <ul className="flex flex-col gap-2">
                  {archivedNotes.map((note) => (
                    <TrashItem
                      key={note.id}
                      label={note.title || tNotes('untitled')}
                      onRestore={() => handleRestoreNote(note.id)}
                      onDeletePermanently={() => handleDeleteNotePermanently(note.id)}
                      restoreLabel={t('trash.restore')}
                      deleteLabel={t('trash.deletePermanently')}
                    />
                  ))}
                </ul>
              </section>
            )}

            {trashedEntities.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
                  {t('trash.trashedEntities')}
                </h2>
                <ul className="flex flex-col gap-2">
                  {trashedEntities.map((entity) => {
                    const et = entityTypes.find((t) => t.slug === entity.entityTypeSlug)
                    const Icon = getEntityTypeIcon(entity.entityTypeSlug, et?.icon ?? null)
                    return (
                      <TrashItem
                        key={entity.id}
                        label={entity.name}
                        icon={<Icon size={14} className="shrink-0" aria-hidden />}
                        onRestore={() => handleRestoreEntity(entity.id)}
                        onDeletePermanently={() => handleDeleteEntityPermanently(entity.id)}
                        restoreLabel={t('trash.restore')}
                        deleteLabel={t('trash.deletePermanently')}
                      />
                    )
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
