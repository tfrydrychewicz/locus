import type { Meta, StoryObj } from '@storybook/react'
import { EntityTypeModal } from './EntityTypeModal.js'
import type { UiEntityType } from './types.js'

const PERSON_TYPE: UiEntityType = {
  id: '01J00000000000000000000001',
  slug: 'person',
  name: 'Person',
  icon: '👤',
  color: '#3b82f6',
  fields: JSON.stringify([
    { id: 'email', label: 'Email', type: 'email', order: 0 },
    { id: 'role', label: 'Role', type: 'text', order: 1 },
  ]),
  isBuiltIn: true,
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-01-01T00:00:00',
  trashedAt: null,
}

const CUSTOM_TYPE: UiEntityType = {
  id: 'custom1',
  slug: 'vendor',
  name: 'Vendor',
  icon: '🏢',
  color: '#10b981',
  fields: JSON.stringify([
    { id: 'website', label: 'Website', type: 'url', order: 0 },
    {
      id: 'tier',
      label: 'Tier',
      type: 'enum',
      order: 1,
      options: [
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
      ],
    },
  ]),
  isBuiltIn: false,
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-01-01T00:00:00',
  trashedAt: null,
}

const meta = {
  title: 'Entities/EntityTypeModal',
  component: EntityTypeModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="relative h-[700px] bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityTypeModal>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  args: {
    entityType: undefined,
    onSave: (data) => console.log('save', data),
    onClose: () => console.log('close'),
  },
}

export const Edit: Story = {
  args: {
    entityType: CUSTOM_TYPE,
    onSave: (data) => console.log('save', data),
    onClose: () => console.log('close'),
  },
}

export const BuiltIn: Story = {
  args: {
    entityType: PERSON_TYPE,
    onSave: (data) => console.log('save', data),
    onClose: () => console.log('close'),
  },
}
