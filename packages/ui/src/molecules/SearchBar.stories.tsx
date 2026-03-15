import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './SearchBar.js'

const meta = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search notes...',
  },
}

export const WithQuery: Story = {
  args: {
    value: 'meeting notes',
    onChange: () => {},
    placeholder: 'Search notes...',
  },
}

export const Loading: Story = {
  args: {
    value: 'meeting',
    onChange: () => {},
    placeholder: 'Search notes...',
    loading: true,
  },
}
