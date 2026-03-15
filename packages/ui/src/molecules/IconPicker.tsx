import { Select } from '../atoms/Select.js'
import { ENTITY_TYPE_ICON_OPTIONS } from '../entities/entity-icons.js'

const ICON_SELECT_OPTIONS = ENTITY_TYPE_ICON_OPTIONS.map(({ name, icon }) => ({
  value: name,
  label: name,
  icon,
}))

export interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
  disabled?: boolean
  id?: string
  selectSize?: 'sm' | 'md'
  placeholder?: string
}

/**
 * Searchable Lucide icon picker built on top of the Select atom.
 * Stores the icon name string (e.g. "user", "folder") as the value.
 */
export function IconPicker({
  value,
  onChange,
  disabled = false,
  id,
  selectSize = 'sm',
  placeholder = 'Choose icon…',
}: IconPickerProps) {
  return (
    <Select
      id={id}
      options={ICON_SELECT_OPTIONS}
      value={value}
      onChange={onChange}
      searchable
      searchPlaceholder="Search icons…"
      placeholder={placeholder}
      disabled={disabled}
      selectSize={selectSize}
    />
  )
}
