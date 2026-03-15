import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { Button } from '../atoms/Button.js'
import { RelationChip } from '../atoms/RelationChip.js'

export interface RelationItem {
  id: string
  label: string
  subtitle?: string
  icon?: LucideIcon
  color?: string
}

export interface RelationFieldProps {
  /** Currently selected items (resolved with labels by parent) */
  selectedItems: RelationItem[]
  /** Called when user removes an item */
  onRemove: (id: string) => void
  /** Called when user clicks Add or Change — parent opens picker */
  onAddClick: () => void
  /** Relation cardinality: one = single selection, many = multiple */
  cardinality: 'one' | 'many'
  /** Placeholder when empty */
  emptyLabel?: string
  /** Label for add button (many) */
  addLabel?: string
  /** Label for change button (one, when selected) */
  changeLabel?: string
  /** Optional click handler for chips (e.g. open popup). Receives id and event for positioning. */
  onItemClick?: (id: string, event?: React.MouseEvent) => void
  disabled?: boolean
  className?: string
}

const DEFAULTS = {
  emptyLabel: 'None selected',
  addLabel: 'Add',
  changeLabel: 'Change',
}

/**
 * Molecule for editing relation-type fields.
 * Displays selected items as chips and an Add/Change button.
 * Parent provides resolved items and handles the picker UI (modal/dropdown).
 */
export function RelationField({
  selectedItems,
  onRemove,
  onAddClick,
  cardinality,
  emptyLabel = DEFAULTS.emptyLabel,
  addLabel = DEFAULTS.addLabel,
  changeLabel = DEFAULTS.changeLabel,
  onItemClick,
  disabled = false,
  className = '',
}: RelationFieldProps) {
  const isEmpty = selectedItems.length === 0
  const isOne = cardinality === 'one'
  const showChangeButton = isOne && !isEmpty

  return (
    <div
      className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}
      data-testid="relation-field"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedItems.map((item) => (
          <RelationChip
            key={item.id}
            id={item.id}
            label={item.label}
            subtitle={item.subtitle}
            icon={item.icon}
            color={item.color}
            onRemove={disabled ? undefined : () => onRemove(item.id)}
            onClick={onItemClick ? (e) => onItemClick(item.id, e) : undefined}
          />
        ))}
        {isEmpty && (
          <span className="text-xs italic text-[var(--color-text-muted)]">{emptyLabel}</span>
        )}
      </div>
      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={onAddClick}
          aria-label={showChangeButton ? changeLabel : addLabel}
        >
          {showChangeButton ? changeLabel : addLabel}
        </Button>
      )}
    </div>
  )
}
