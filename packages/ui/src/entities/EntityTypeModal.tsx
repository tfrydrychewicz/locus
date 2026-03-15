import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '../atoms/Button.js'
import { Input } from '../atoms/Input.js'
import { FormField } from '../molecules/FormField.js'
import type { EnumOption, FieldDef, FieldType, UiEntityType } from './types.js'
import { PRESET_COLORS, parseFields } from './types.js'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'enum', label: 'Select' },
  { value: 'relation', label: 'Relation' },
  { value: 'computed_query', label: 'Computed query' },
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
    builtInWarning?: string
    fieldIdHint?: string
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
  iconLabel: 'Icon (emoji)',
  colorLabel: 'Color',
  fieldsLabel: 'Fields',
  addField: 'Add field',
  fieldIdLabel: 'ID',
  fieldLabelLabel: 'Label',
  fieldTypeLabel: 'Type',
  removeField: 'Remove',
  builtInWarning: 'Built-in entity types cannot be modified here.',
  fieldIdHint: 'Lowercase letters and underscores only',
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
  onSave,
  onClose,
  labels: labelsProp,
}: EntityTypeModalProps) {
  const L = { ...DEFAULT_LABELS, ...labelsProp }
  const isEdit = !!entityType
  const isBuiltIn = entityType?.isBuiltIn ?? false

  const [name, setName] = useState(entityType?.name ?? '')
  const [slug, setSlug] = useState(entityType?.slug ?? '')
  const [icon, setIcon] = useState(entityType?.icon ?? '')
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

  const canSave = name.trim().length > 0 && slug.trim().length > 0 && !isBuiltIn

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
          {isBuiltIn && (
            <div className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
              {L.builtInWarning}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Name */}
            <FormField label={L.nameLabel} htmlFor="et-name">
              <Input
                id="et-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={L.namePlaceholder}
                disabled={isBuiltIn}
              />
            </FormField>

            {/* Slug */}
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
              />
            </FormField>

            {/* Icon + Color in a row */}
            <div className="flex gap-3">
              <FormField label={L.iconLabel} htmlFor="et-icon" className="w-24 shrink-0">
                <Input
                  id="et-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="👤"
                  disabled={isBuiltIn}
                  className="text-center text-base"
                />
              </FormField>

              <FormField label={L.colorLabel} htmlFor="et-color" className="flex-1">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={isBuiltIn}
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
                {!isBuiltIn && (
                  <Button variant="ghost" size="sm" icon={Plus} onClick={addField}>
                    {L.addField}
                  </Button>
                )}
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
                  disabled={isBuiltIn}
                  onChange={(patch) => updateField(idx, patch)}
                  onRemove={() => removeField(idx)}
                  labels={{
                    idLabel: L.fieldIdLabel,
                    labelLabel: L.fieldLabelLabel,
                    typeLabel: L.fieldTypeLabel,
                    removeLabel: L.removeField,
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
  disabled,
  onChange,
  onRemove,
  labels,
}: {
  field: FieldRowItem
  disabled: boolean
  onChange: (patch: Partial<FieldDef>) => void
  onRemove: () => void
  labels: { idLabel: string; labelLabel: string; typeLabel: string; removeLabel: string }
}) {
  const rowKey = field._key.replace(/-/g, '').slice(0, 8)
  const idInputId = `fr-id-${rowKey}`
  const labelInputId = `fr-lbl-${rowKey}`
  const typeSelectId = `fr-type-${rowKey}`
  const queryInputId = `fr-query-${rowKey}`
  const optInputId = `fr-opts-${rowKey}`

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
        <div className="flex w-32 shrink-0 flex-col gap-0.5">
          <label htmlFor={typeSelectId} className="text-[10px] text-[var(--color-text-muted)]">
            {labels.typeLabel}
          </label>
          <select
            id={typeSelectId}
            value={field.type}
            onChange={(e) => onChange({ type: e.target.value as FieldType })}
            disabled={disabled}
            className={[
              'w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)]',
              'px-2 py-1 text-xs text-[var(--color-text-primary)] outline-none',
              'focus:border-[var(--color-accent)]',
            ].join(' ')}
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
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
