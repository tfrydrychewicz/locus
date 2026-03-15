import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../atoms/Input.js'
import { FormField } from './FormField.js'

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const WithInput: Story = {
  args: {
    label: 'Title',
    htmlFor: 'title',
    children: <Input id="title" placeholder="Enter title..." />,
  },
}

export const WithSelect: Story = {
  args: {
    label: 'Category',
    htmlFor: 'category',
    children: (
      <select
        id="category"
        className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-primary)]"
      >
        <option value="">Select...</option>
        <option value="work">Work</option>
        <option value="personal">Personal</option>
      </select>
    ),
  },
}

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Please enter a valid email address',
    htmlFor: 'email',
    children: <Input id="email" placeholder="you@example.com" />,
  },
}

export const Required: Story = {
  args: {
    label: 'Name',
    required: true,
    htmlFor: 'name',
    children: <Input id="name" placeholder="Your name" />,
  },
}
