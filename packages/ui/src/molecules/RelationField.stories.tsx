import type { Meta, StoryObj } from '@storybook/react'
import { FileText, User } from 'lucide-react'
import { RelationField } from './RelationField.js'

const meta = {
  title: 'Molecules/RelationField',
  component: RelationField,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RelationField>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE_ENTITIES = [
  { id: 'e1', label: 'Alice Johnson', subtitle: 'Person', icon: User, color: '#3b82f6' },
  { id: 'e2', label: 'Project Alpha', subtitle: 'Project', color: '#8b5cf6' },
]

const SAMPLE_NOTES = [{ id: 'n1', label: 'Meeting notes', subtitle: 'Note', icon: FileText }]

export const EmptyOne: Story = {
  args: {
    selectedItems: [],
    onRemove: () => {},
    onAddClick: () => alert('Open picker'),
    cardinality: 'one',
    emptyLabel: 'No note linked',
  },
}

export const SelectedOne: Story = {
  args: {
    selectedItems: SAMPLE_NOTES,
    onRemove: () => {},
    onAddClick: () => alert('Change selection'),
    cardinality: 'one',
    emptyLabel: 'No note linked',
    changeLabel: 'Change',
  },
}

export const EmptyMany: Story = {
  args: {
    selectedItems: [],
    onRemove: () => {},
    onAddClick: () => alert('Open picker'),
    cardinality: 'many',
    emptyLabel: 'No entities linked',
    addLabel: 'Add entity',
  },
}

export const SelectedMany: Story = {
  args: {
    selectedItems: SAMPLE_ENTITIES,
    onRemove: () => {},
    onAddClick: () => alert('Add another'),
    cardinality: 'many',
    addLabel: 'Add',
  },
}

export const Disabled: Story = {
  args: {
    selectedItems: SAMPLE_ENTITIES,
    onRemove: () => {},
    onAddClick: () => {},
    cardinality: 'many',
    disabled: true,
  },
}
