import type { Meta, StoryObj } from '@storybook/react'
import { ComputedFieldDisplay } from './ComputedFieldDisplay.js'
import type { UiEntity, UiEntityType } from './types.js'

const PERSON_TYPE: UiEntityType = {
  id: '01J00000000000000000000001',
  slug: 'person',
  name: 'Person',
  icon: '👤',
  color: '#3b82f6',
  fields: '[]',
  isBuiltIn: true,
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-01-01T00:00:00',
  trashedAt: null,
}

const ENTITIES: UiEntity[] = [
  {
    id: 'e1',
    entityTypeId: PERSON_TYPE.id,
    entityTypeSlug: 'person',
    name: 'Alice Johnson',
    fields: '{}',
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
    trashedAt: null,
  },
  {
    id: 'e2',
    entityTypeId: PERSON_TYPE.id,
    entityTypeSlug: 'person',
    name: 'Bob Smith',
    fields: '{}',
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
    trashedAt: null,
  },
  {
    id: 'e3',
    entityTypeId: PERSON_TYPE.id,
    entityTypeSlug: 'person',
    name: 'Carol White',
    fields: '{}',
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
    trashedAt: null,
  },
]

const meta = {
  title: 'Entities/ComputedFieldDisplay',
  component: ComputedFieldDisplay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96 p-4 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ComputedFieldDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const WithResults: Story = {
  args: {
    entities: ENTITIES,
    entityTypes: [PERSON_TYPE],
    loading: false,
    onEntityClick: (e) => console.log('click', e.name),
  },
}

export const Loading: Story = {
  args: {
    entities: null,
    entityTypes: [],
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    entities: [],
    entityTypes: [],
    loading: false,
  },
}

export const WithError: Story = {
  args: {
    entities: null,
    entityTypes: [],
    loading: false,
    error: 'Syntax error: unexpected token after expression',
  },
}
