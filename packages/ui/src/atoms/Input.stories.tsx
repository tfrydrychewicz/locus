import type { Meta, StoryObj } from '@storybook/react'
import { Search } from 'lucide-react'
import { Input } from './Input.js'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
}

export const WithIcon: Story = {
  args: { placeholder: 'Search notes...', icon: Search },
}

export const WithError: Story = {
  args: { placeholder: 'Enter title', error: 'Title is required', id: 'title' },
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled input', disabled: true },
}

export const Small: Story = {
  args: { placeholder: 'Small input', inputSize: 'sm' },
}
