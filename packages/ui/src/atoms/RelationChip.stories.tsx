import type { Meta, StoryObj } from '@storybook/react'
import { FileText, User } from 'lucide-react'
import { RelationChip } from './RelationChip.js'

const meta = {
  title: 'Atoms/RelationChip',
  component: RelationChip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex gap-2 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RelationChip>

export default meta
type Story = StoryObj<typeof meta>

export const Note: Story = {
  args: {
    id: 'note-1',
    label: 'Meeting notes',
    subtitle: 'Note',
    icon: FileText,
    onRemove: () => {},
  },
}

export const Entity: Story = {
  args: {
    id: 'entity-1',
    label: 'Alice Johnson',
    subtitle: 'Person',
    icon: User,
    color: '#3b82f6',
    onRemove: () => {},
  },
}

export const Clickable: Story = {
  args: {
    id: 'entity-2',
    label: 'Project Alpha',
    subtitle: 'Project',
    color: '#8b5cf6',
    onClick: (_e) => alert('Clicked'),
  },
}

export const NoRemove: Story = {
  args: {
    id: 'note-2',
    label: 'Read-only relation',
    icon: FileText,
  },
}
