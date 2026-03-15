import type { Meta, StoryObj } from '@storybook/react'
import { EntityItem } from './EntityItem.js'

const personType = { name: 'Person', icon: '👤', color: '#3b82f6' }
const projectType = { name: 'Project', icon: '📁', color: '#8b5cf6' }

const meta = {
  title: 'Entities/EntityItem',
  component: EntityItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Alice Johnson',
    entityType: personType,
    updatedAt: '2 hours ago',
    onClick: () => {},
  },
}

export const Selected: Story = {
  args: {
    name: 'Locus Redesign',
    entityType: projectType,
    updatedAt: 'Yesterday',
    selected: true,
    onClick: () => {},
  },
}

export const Trashed: Story = {
  args: {
    name: 'Bob Smith',
    entityType: personType,
    updatedAt: 'Last week',
    trashed: true,
    trashedLabel: 'Trashed',
    onClick: () => {},
  },
}

export const NoTypeColor: Story = {
  args: {
    name: 'Custom entity',
    entityType: { name: 'Custom', icon: null, color: null },
    updatedAt: '5 min ago',
    onClick: () => {},
  },
}

export const WithoutTypeBadge: Story = {
  args: {
    name: 'Alice Johnson',
    entityType: personType,
    updatedAt: '2 hours ago',
    showTypeBadge: false,
    onClick: () => {},
  },
}
