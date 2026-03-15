import type { Meta, StoryObj } from '@storybook/react'
import { FileText } from 'lucide-react'
import { Button } from '../atoms/Button.js'
import { EmptyState } from './EmptyState.js'

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[320px] min-w-[480px] w-full bg-[var(--color-bg)] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const WithAction: Story = {
  args: {
    icon: FileText,
    title: 'No notes yet',
    description: 'Create your first note to get started.',
    action: <Button variant="primary">New note</Button>,
  },
}

export const WithoutAction: Story = {
  args: {
    icon: FileText,
    title: 'No results',
    description: 'Try a different search term or filter.',
  },
}

export const TitleOnly: Story = {
  args: {
    icon: FileText,
    title: 'Nothing here',
  },
}
