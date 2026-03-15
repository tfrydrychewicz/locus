import type { Meta, StoryObj } from '@storybook/react'
import { FileText, User } from 'lucide-react'
import { Chip } from './Chip.js'

const meta = {
  title: 'Atoms/Chip',
  component: Chip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const EntityChip: Story = {
  args: { label: 'John Smith', icon: User, color: '#5b8def' },
}

export const NoteChip: Story = {
  args: { label: 'Meeting Notes', icon: FileText, color: '#50c0a0' },
}

export const Removable: Story = {
  args: {
    label: 'Tag: ADHD',
    onRemove: () => {},
  },
}

export const Clickable: Story = {
  args: {
    label: 'Project Alpha',
    icon: FileText,
    onClick: () => {},
  },
}

export const WithColor: Story = {
  args: { label: 'Team Red', color: '#ef4444' },
}
