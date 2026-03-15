import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Button } from './Button.js'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { children: 'Save changes', variant: 'primary' },
}

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
}

export const Ghost: Story = {
  args: { children: 'Learn more', variant: 'ghost' },
}

export const Danger: Story = {
  args: { children: 'Delete', variant: 'danger', icon: Trash2 },
}

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
}

export const Loading: Story = {
  args: { children: 'Saving...', loading: true },
}

export const WithIcon: Story = {
  args: { children: 'New note', icon: Plus },
}

export const IconRight: Story = {
  args: { children: 'Save', icon: Save, iconPosition: 'right' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}
