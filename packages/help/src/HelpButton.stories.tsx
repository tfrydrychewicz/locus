import type { Meta, StoryObj } from '@storybook/react'
import { HelpButton } from './HelpButton.js'
import { HelpProvider } from './HelpProvider.js'

const meta = {
  title: 'Help/HelpButton',
  component: HelpButton,
  decorators: [
    (Story) => (
      <HelpProvider>
        <div className="flex items-center gap-6 p-8 bg-[var(--color-bg)]">
          <Story />
        </div>
      </HelpProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof HelpButton>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {
  args: { topic: 'getting-started', size: 'sm' },
}

export const Medium: Story = {
  args: { topic: 'notes.editor', size: 'md' },
}

export const InHeader: Story = {
  render: () => (
    <header className="flex items-center justify-between w-full max-w-md border-b border-[var(--color-border)] pb-3">
      <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Note Editor</h2>
      <HelpButton topic="notes.editor" />
    </header>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[var(--color-text-secondary)]">Small:</span>
        <HelpButton topic="getting-started" size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[var(--color-text-secondary)]">Medium:</span>
        <HelpButton topic="getting-started" size="md" />
      </div>
    </div>
  ),
}
