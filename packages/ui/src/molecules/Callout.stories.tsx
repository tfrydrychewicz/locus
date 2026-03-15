import type { Meta, StoryObj } from '@storybook/react'
import { Callout } from './Callout.js'

const meta = {
  title: 'Molecules/Callout',
  component: Callout,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational callout. Use it for tips or neutral notes.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'This is a warning. Use it when something needs attention.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'This is a success message. Use it for confirmations or positive outcomes.',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'This is a danger callout. Use it for errors or critical information.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Callout variant="info">Info callout content.</Callout>
      <Callout variant="warning">Warning callout content.</Callout>
      <Callout variant="success">Success callout content.</Callout>
      <Callout variant="danger">Danger callout content.</Callout>
    </div>
  ),
}
