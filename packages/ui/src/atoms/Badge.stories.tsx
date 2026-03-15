import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge.js'

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Default' },
}

export const Success: Story = {
  args: { children: 'Active', variant: 'success' },
}

export const Warning: Story = {
  args: { children: 'Pending', variant: 'warning' },
}

export const Danger: Story = {
  args: { children: 'Overdue', variant: 'danger' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Overdue</Badge>
    </div>
  ),
}
