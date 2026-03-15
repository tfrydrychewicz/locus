import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '../atoms/Button.js'
import { EditableText } from '../atoms/EditableText.js'
import { Input } from '../atoms/Input.js'
import { Select } from '../atoms/Select.js'
import { FormField } from '../molecules/FormField.js'
import type { FieldDef, FieldValues, UiEntity, UiEntityType } from './types.js'
import { parseFields, parseFieldValues } from './types.js'

export interface EntityDetailProps {
  entity: UiEntity
  entityType: UiEntityType
  onSave: (updates: { name: string; fields: string }) => void
  onTrash: () => void
  /** Render prop for computed_query fields — keeps this component Tauri-free */
  renderComputedField?: (fieldId: string, query: string, entityId: string) => ReactNode
  /** Render prop for relation fields — parent provides RelationField with picker logic */
  renderRelationField?: (
    fieldId: string,
    field: FieldDef,
    value: string | null,
    onChange: (value: string | null) => void,
  ) => ReactNode
  labels?: {
    saveLabel?: string
    trashLabel?: string
    nameLabel?: string
    unsavedDot?: string
  }
  className?: string
}

const DEFAULTS = {
  saveLabel: 'Save',
  trashLabel: 'Move to trash',
  nameLabel: 'Name',
  unsavedDot: '●',
}

export function EntityDetail({
  entity,
  entityType,
  onSave,
  onTrash,
  renderComputedField,
  renderRelationField,
  labels: labelsProp,
  className = '',
}: EntityDetailProps) {
  const L = { ...DEFAULTS, ...labelsProp }
  const fields = parseFields(entityType.fields)
  const initialValues = parseFieldValues(entity.fields)

  const [name, setName] = useState(entity.name)
  const [values, setValues] = useState<FieldValues>(initialValues)

  const isDirty = name !== entity.name || JSON.stringify(values) !== JSON.stringify(initialValues)

  const handleSave = () => {
    onSave({ name, fields: JSON.stringify(values) })
  }

  const setField = (id: string, value: FieldValues[string]) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  // Reset if entity changes
  const entityRef = entity.id + entity.updatedAt
  const [lastEntityRef, setLastEntityRef] = useState(entityRef)
  if (entityRef !== lastEntityRef) {
    setLastEntityRef(entityRef)
    setName(entity.name)
    setValues(initialValues)
  }

  return (
    <div
      className={['flex h-full flex-col overflow-hidden', className].filter(Boolean).join(' ')}
      data-testid="entity-detail"
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <EditableText
            value={name}
            onChange={setName}
            placeholder="Untitled"
            size="lg"
            editLabel={L.nameLabel}
          />
          {isDirty && (
            <span
              className="shrink-0 text-xs text-[var(--color-accent)]"
              title="Unsaved changes"
              role="status"
              aria-live="polite"
            >
              {L.unsavedDot}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={onTrash}
            aria-label={L.trashLabel}
            title={L.trashLabel}
          />
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!isDirty}>
            {L.saveLabel}
          </Button>
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Dynamic fields */}
          {fields
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={values[field.id] ?? null}
                onChange={(v) => setField(field.id, v)}
                entityId={entity.id}
                renderComputedField={renderComputedField}
                renderRelationField={renderRelationField}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

function DynamicField({
  field,
  value,
  onChange,
  entityId,
  renderComputedField,
  renderRelationField,
}: {
  field: FieldDef
  value: FieldValues[string]
  onChange: (v: FieldValues[string]) => void
  entityId: string
  renderComputedField?: EntityDetailProps['renderComputedField']
  renderRelationField?: EntityDetailProps['renderRelationField']
}) {
  const id = `field-${field.id}`

  if (field.type === 'computed_query') {
    return (
      <FormField label={field.label} htmlFor={id} key={field.id}>
        {renderComputedField ? (
          renderComputedField(field.id, field.query ?? '', entityId)
        ) : (
          <span className="text-xs text-[var(--color-text-muted)] italic">
            Computed field (query: {field.query ?? '—'})
          </span>
        )}
      </FormField>
    )
  }

  if (field.type === 'boolean') {
    return (
      <FormField label={field.label} htmlFor={id} key={field.id}>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
          />
        </div>
      </FormField>
    )
  }

  if (field.type === 'enum') {
    const options = field.options ?? []
    const selectOptions = [
      { value: '', label: '—' },
      ...options.map((opt) => ({ value: opt.value, label: opt.label })),
    ]
    return (
      <FormField label={field.label} htmlFor={id} key={field.id}>
        <Select
          id={id}
          options={selectOptions}
          value={String(value ?? '')}
          onChange={(v) => onChange(v || null)}
        />
      </FormField>
    )
  }

  if (field.type === 'relation') {
    return (
      <FormField label={field.label} htmlFor={id} key={field.id}>
        {renderRelationField ? (
          renderRelationField(field.id, field, value != null ? String(value) : null, (v) =>
            onChange(v),
          )
        ) : (
          <span className="text-xs text-[var(--color-text-muted)] italic">
            {value ? String(value) : '—'}
          </span>
        )}
      </FormField>
    )
  }

  const inputType: React.HTMLInputTypeAttribute =
    field.type === 'number'
      ? 'number'
      : field.type === 'date'
        ? 'date'
        : field.type === 'url'
          ? 'url'
          : field.type === 'email'
            ? 'email'
            : 'text'

  return (
    <FormField label={field.label} htmlFor={id} key={field.id}>
      <Input
        id={id}
        type={inputType}
        value={value !== null && value !== undefined ? String(value) : ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={`Enter ${field.label.toLowerCase()}…`}
        required={field.required}
      />
    </FormField>
  )
}
