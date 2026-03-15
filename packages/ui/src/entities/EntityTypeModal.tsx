import {
  AlignLeft,
  Binary,
  Braces,
  Calendar,
  GripVertical,
  Hash,
  Link2,
  List,
  Mail,
  Plus,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '../atoms/Button.js'
import { Input } from '../atoms/Input.js'
import type { SelectOption } from '../atoms/Select.js'
import { Select } from '../atoms/Select.js'
import { FormField } from '../molecules/FormField.js'
import { IconPicker } from '../molecules/IconPicker.js'
import { ENTITY_TYPE_ICON_OPTIONS, getDefaultIconNameForSlug } from './entity-icons.js'
import type { EnumOption, FieldDef, FieldType, UiEntityType } from './types.js'
import { PRESET_COLORS, parseFields } from './types.js'

const FIELD_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text', label: 'Text', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'boolean', label: 'Boolean', icon: Binary },
  { value: 'url', label: 'URL', icon: Link2 },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'enum', label: 'Select', icon: List },
  { value: 'relation', label: 'Relation', icon: Share2 },
  { value: 'computed_query', label: 'Computed query', icon: Braces },
]

export interface EntityTypeFormData {
  name: string
  slug: string
  icon: string
  color: string
  fields: FieldDef[]
}

export interface EntityTypeModalProps {
  /** Existing entity type to edit; undefined = create new */
  entityType?: UiEntityType
  /** All entity types (for relation field target selector). Pass when editing. */
  entityTypes?: UiEntityType[]
  onSave: (data: EntityTypeFormData) => void
  onClose: () => void
  labels?: {
    createTitle?: string
    editTitle?: string
    nameLabel?: string
    namePlaceholder?: string
    slugLabel?: string
    slugPlaceholder?: string
    iconLabel?: string
    colorLabel?: string
    fieldsLabel?: string
    addField?: string
    fieldIdLabel?: string
    fieldLabelLabel?: string
    fieldTypeLabel?: string
    removeField?: string
    fieldIdHint?: string
    relationTargetLabel?: string
    relationTargetNote?: string
    relationTargetEntity?: string
    relationEntityTypeLabel?: string
    relationCardinalityLabel?: string
    relationCardinalityOne?: string
    relationCardinalityMany?: string
    saveLabel?: string
    cancelLabel?: string
  }
}

const DEFAULT_LABELS = {
  createTitle: 'New entity type',
  editTitle: 'Edit type',
  nameLabel: 'Display name',
  namePlaceholder: 'e.g. Contact',
  slugLabel: 'Slug',
  slugPlaceholder: 'e.g. contact',
  iconLabel: 'Icon',
  colorLabel: 'Color',
  fieldsLabel: 'Fields',
  addField: 'Add field',
  fieldIdLabel: 'ID',
  fieldLabelLabel: 'Label',
  fieldTypeLabel: 'Type',
  removeField: 'Remove',
  fieldIdHint: 'Lowercase letters and underscores only',
  relationTargetLabel: 'Relation to',
  relationTargetNote: 'Note',
  relationTargetEntity: 'Entity',
  relationEntityTypeLabel: 'Entity type',
  relationCardinalityLabel: 'Cardinality',
  relationCardinalityOne: 'One',
  relationCardinalityMany: 'Many',
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '')
}

interface FieldRowItem extends FieldDef {
  _key: string
}

function newField(order: number): FieldRowItem {
  return {
    id: `field_${order + 1}`,
    label: `Field ${order + 1}`,
    type: 'text',
    order,
    _key: crypto.randomUUID(),
  }
}

export function EntityTypeModal({
  entityType,
  entityTypes = [],
  onSave,
  onClose,
  labels: labelsProp,
}: EntityTypeModalProps) {
  const L = { ...DEFAULT_LABELS, ...labelsProp }
  const isEdit = !!entityType
  const isBuiltIn = entityType?.isBuiltIn ?? false

  const [name, setName] = useState(entityType?.name ?? '')
  const [slug, setSlug] = useState(entityType?.slug ?? '')
  const [icon, setIcon] = useState(() => {
    const stored = entityType?.icon?.trim()
    const isKnownIcon = stored && ENTITY_TYPE_ICON_OPTIONS.some((o) => o.name === stored)
    if (isKnownIcon) return stored
    if (entityType?.slug) return getDefaultIconNameForSlug(entityType.slug)
    return ''
  })
  const [color, setColor] = useState(entityType?.color ?? PRESET_COLORS[0] ?? '#3b82f6')
  const [fields, setFields] = useState<FieldRowItem[]>(() =>
    entityType
      ? parseFields(entityType.fields).map((f) => ({ ...f, _key: crypto.randomUUID() }))
      : [],
  )
  const [slugManual, setSlugManual] = useState(isEdit)

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugManual) setSlug(slugify(v))
  }

  const addField = useCallback(() => {
    setFields((prev) => [...prev, newField(prev.length)])
  }, [])

  const removeField = useCallback((idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, order: i })))
  }, [])

  const updateField = useCallback((idx: number, patch: Partial<FieldDef>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)))
  }, [])

  const handleSave = () => {
    // Strip the internal _key before passing to onSave
    const cleanFields: FieldDef[] = fields.map(({ _key: _ignored, ...rest }) => rest)
    onSave({ name, slug, icon, color, fields: cleanFields })
  }

  const canSave = name.trim().length > 0 && slug.trim().length > 0

  const title = isEdit ? `${L.editTitle}: ${entityType?.name ?? ''}` : L.createTitle

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Dialog panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
            aria-label="Close"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {/* Name */}
            <FormField label={L.nameLabel} htmlFor="et-name">
              <Input
                id="et-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={L.namePlaceholder}
              />
            </FormField>

            {/* Slug — read-only for built-in types to preserve nav mapping */}
            <FormField label={`${L.slugLabel} (${L.fieldIdHint})`} htmlFor="et-slug">
              <Input
                id="et-slug"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true)
                  setSlug(slugify(e.target.value))
                }}
                placeholder={L.slugPlaceholder}
                disabled={isBuiltIn}
                title={isBuiltIn ? 'Slug cannot be changed for built-in types' : undefined}
              />
            </FormField>

            {/* Icon + Color in a row */}
            <div className="flex gap-3">
              {/* Icon picker */}
              <FormField label={L.iconLabel} htmlFor="et-icon">
                <IconPicker id="et-icon" value={icon} onChange={setIcon} selectSize="md" />
              </FormField>

              <FormField label={L.colorLabel} htmlFor="et-color" className="flex-1">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={[
                        'h-6 w-6 rounded-full border-2 transition-transform',
                        color === c
                          ? 'border-white scale-110 shadow'
                          : 'border-transparent hover:scale-105',
                      ].join(' ')}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                      aria-pressed={color === c}
                    />
                  ))}
                </div>
              </FormField>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {L.fieldsLabel}
                </span>
                <Button variant="ghost" size="sm" icon={Plus} onClick={addField}>
                  {L.addField}
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] italic">
                  No custom fields yet.
                </p>
              )}

              {fields.map((field, idx) => (
                <FieldRow
                  key={field._key}
                  field={field}
                  entityTypes={entityTypes}
                  onChange={(patch) => updateField(idx, patch)}
                  onRemove={() => removeField(idx)}
                  labels={{
                    idLabel: L.fieldIdLabel,
                    labelLabel: L.fieldLabelLabel,
                    typeLabel: L.fieldTypeLabel,
                    removeLabel: L.removeField,
                    relationTargetLabel: L.relationTargetLabel,
                    relationTargetNote: L.relationTargetNote,
                    relationTargetEntity: L.relationTargetEntity,
                    relationEntityTypeLabel: L.relationEntityTypeLabel,
                    relationCardinalityLabel: L.relationCardinalityLabel,
                    relationCardinalityOne: L.relationCardinalityOne,
                    relationCardinalityMany: L.relationCardinalityMany,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {L.cancelLabel}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!canSave}>
            {L.saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FieldRow({
  field,
  entityTypes = [],
  disabled = false,
  onChange,
  onRemove,
  labels,
}: {
  field: FieldRowItem
  entityTypes?: UiEntityType[]
  disabled?: boolean
  onChange: (patch: Partial<FieldDef>) => void
  onRemove: () => void
  labels: {
    idLabel: string
    labelLabel: string
    typeLabel: string
    removeLabel: string
    relationTargetLabel?: string
    relationTargetNote?: string
    relationTargetEntity?: string
    relationEntityTypeLabel?: string
    relationCardinalityLabel?: string
    relationCardinalityOne?: string
    relationCardinalityMany?: string
  }
}) {
  const rowKey = field._key.replace(/-/g, '').slice(0, 8)
  const idInputId = `fr-id-${rowKey}`
  const labelInputId = `fr-lbl-${rowKey}`
  const typeSelectId = `fr-type-${rowKey}`
  const queryInputId = `fr-query-${rowKey}`
  const optInputId = `fr-opts-${rowKey}`
  const relTargetId = `fr-rel-target-${rowKey}`
  const relEntityId = `fr-rel-entity-${rowKey}`
  const relCardId = `fr-rel-card-${rowKey}`

  const relationTargetOpts = [
    { value: 'note', label: labels.relationTargetNote ?? 'Note' },
    { value: 'entity', label: labels.relationTargetEntity ?? 'Entity' },
  ]
  const entityTypeOpts = entityTypes.map((et) => ({ value: et.slug, label: et.name }))
  const relationCardOpts = [
    { value: 'one', label: labels.relationCardinalityOne ?? 'One' },
    { value: 'many', label: labels.relationCardinalityMany ?? 'Many' },
  ]

  return (
    <div className="flex items-start gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-2">
      <span className="mt-2 shrink-0 text-[var(--color-text-muted)]" aria-hidden>
        <GripVertical size={14} />
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {/* ID */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <label htmlFor={idInputId} className="text-[10px] text-[var(--color-text-muted)]">
            {labels.idLabel}
          </label>
          <Input
            id={idInputId}
            inputSize="sm"
            value={field.id}
            onChange={(e) => onChange({ id: e.target.value.replace(/[^a-z0-9_]/g, '_') })}
            placeholder="field_id"
            disabled={disabled}
            className="font-mono"
          />
        </div>

        {/* Label */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <label htmlFor={labelInputId} className="text-[10px] text-[var(--color-text-muted)]">
            {labels.labelLabel}
          </label>
          <Input
            id={labelInputId}
            inputSize="sm"
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Field label"
            disabled={disabled}
          />
        </div>

        {/* Type */}
        <div className="flex w-36 shrink-0 flex-col gap-0.5">
          <label htmlFor={typeSelectId} className="text-[10px] text-[var(--color-text-muted)]">
            {labels.typeLabel}
          </label>
          <Select
            id={typeSelectId}
            options={FIELD_TYPE_OPTIONS}
            value={field.type}
            onChange={(v) => {
              const newType = v as FieldType
              if (newType === 'relation') {
                onChange({
                  type: newType,
                  relationTarget: field.relationTarget ?? 'entity',
                  relationCardinality: field.relationCardinality ?? 'one',
                })
              } else {
                onChange({ type: newType })
              }
            }}
            disabled={disabled}
            selectSize="sm"
          />
        </div>

        {/* Query (for computed_query) */}
        {field.type === 'computed_query' && (
          <div className="w-full flex flex-col gap-0.5">
            <label htmlFor={queryInputId} className="text-[10px] text-[var(--color-text-muted)]">
              LQL query
            </label>
            <Input
              id={queryInputId}
              inputSize="sm"
              value={field.query ?? ''}
              onChange={(e) => onChange({ query: e.target.value })}
              placeholder="entity_type = 'person' and team = {this}"
              disabled={disabled}
              className="font-mono"
            />
          </div>
        )}

        {/* Enum options (simple comma-separated) */}
        {field.type === 'enum' && (
          <div className="w-full flex flex-col gap-0.5">
            <label htmlFor={optInputId} className="text-[10px] text-[var(--color-text-muted)]">
              Options (comma-separated)
            </label>
            <Input
              id={optInputId}
              inputSize="sm"
              value={(field.options ?? []).map((o) => o.value).join(', ')}
              onChange={(e) => {
                const opts: EnumOption[] = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((v) => ({ value: v, label: v }))
                onChange({ options: opts })
              }}
              placeholder="option1, option2, option3"
              disabled={disabled}
            />
          </div>
        )}

        {/* Relation config */}
        {field.type === 'relation' && (
          <>
            <div className="flex w-28 shrink-0 flex-col gap-0.5">
              <label htmlFor={relTargetId} className="text-[10px] text-[var(--color-text-muted)]">
                {labels.relationTargetLabel ?? 'Relation to'}
              </label>
              <Select
                id={relTargetId}
                options={relationTargetOpts}
                value={field.relationTarget ?? 'entity'}
                onChange={(v) =>
                  onChange({
                    relationTarget: v as 'note' | 'entity',
                    ...(v === 'note' ? { relatedTypeSlug: undefined } : {}),
                  })
                }
                disabled={disabled}
                selectSize="sm"
              />
            </div>
            {field.relationTarget === 'entity' && entityTypes.length > 0 && (
              <div className="flex w-32 shrink-0 flex-col gap-0.5">
                <label htmlFor={relEntityId} className="text-[10px] text-[var(--color-text-muted)]">
                  {labels.relationEntityTypeLabel ?? 'Entity type'}
                </label>
                <Select
                  id={relEntityId}
                  options={entityTypeOpts}
                  value={field.relatedTypeSlug ?? entityTypes[0]?.slug ?? ''}
                  onChange={(v) => onChange({ relatedTypeSlug: v || undefined })}
                  disabled={disabled}
                  selectSize="sm"
                />
              </div>
            )}
            <div className="flex w-24 shrink-0 flex-col gap-0.5">
              <label htmlFor={relCardId} className="text-[10px] text-[var(--color-text-muted)]">
                {labels.relationCardinalityLabel ?? 'Cardinality'}
              </label>
              <Select
                id={relCardId}
                options={relationCardOpts}
                value={field.relationCardinality ?? 'one'}
                onChange={(v) => onChange({ relationCardinality: v as 'one' | 'many' })}
                disabled={disabled}
                selectSize="sm"
              />
            </div>
          </>
        )}
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-1 shrink-0 rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-danger,#ef4444)]"
          aria-label={labels.removeLabel}
        >
          <Trash2 size={14} aria-hidden />
        </button>
      )}
    </div>
  )
}
