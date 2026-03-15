import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button.js'
import { Tooltip } from './Tooltip.js'

const meta = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-24 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Top: Story = {
  args: {
    content: 'Save your work',
    position: 'top',
    children: <Button variant="secondary">Hover me (top)</Button>,
  },
}

export const Bottom: Story = {
  args: {
    content: 'Additional info',
    position: 'bottom',
    children: <Button variant="secondary">Hover me (bottom)</Button>,
  },
}

export const Left: Story = {
  args: {
    content: 'Go back',
    position: 'left',
    children: <Button variant="secondary">Hover me (left)</Button>,
  },
}

export const Right: Story = {
  args: {
    content: 'Next step',
    position: 'right',
    children: <Button variant="secondary">Hover me (right)</Button>,
  },
}

export const AllPositions: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Tooltip content="Top" position="top">
        <Button variant="ghost">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom" position="bottom">
        <Button variant="ghost">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left" position="left">
        <Button variant="ghost">Left</Button>
      </Tooltip>
      <Tooltip content="Right" position="right">
        <Button variant="ghost">Right</Button>
      </Tooltip>
    </div>
  ),
}
