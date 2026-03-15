import type { Meta, StoryObj } from '@storybook/react'
import { EntityMentionPopup } from './EntityMentionPopup.js'
import type { UiEntity, UiEntityType } from './types.js'

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

const ENTITY: UiEntity = {
  id: 'e1',
  entityTypeId: PERSON_TYPE.id,
  entityTypeSlug: 'person',
  name: 'Alice Johnson',
  fields: JSON.stringify({ email: 'alice@example.com', role: 'Product Designer' }),
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-03-10T14:30:00',
  trashedAt: null,
}

const TRASHED_ENTITY: UiEntity = {
  ...ENTITY,
  id: 'e2',
  trashedAt: '2025-02-01T00:00:00',
}

const meta = {
  title: 'Entities/EntityMentionPopup',
  component: EntityMentionPopup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityMentionPopup>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: {
    entity: ENTITY,
    entityType: PERSON_TYPE,
    loading: false,
    onOpen: (e) => console.log('open', e.name),
    onClose: () => console.log('close'),
  },
}

export const Trashed: Story = {
  args: {
    entity: TRASHED_ENTITY,
    entityType: PERSON_TYPE,
    loading: false,
    onClose: () => console.log('close'),
  },
}

export const Loading: Story = {
  args: {
    entity: null,
    entityType: null,
    loading: true,
  },
}
