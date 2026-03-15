import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { QueryFieldEditor } from './QueryFieldEditor.js'

const meta = {
  title: 'Entities/QueryFieldEditor',
  component: QueryFieldEditor,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96 p-4 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QueryFieldEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return <QueryFieldEditor value={value} onChange={setValue} />
  },
}

export const WithQuery: Story = {
  render: () => {
    const [value, setValue] = useState("entity_type = 'person' and name contains 'alice'")
    return (
      <QueryFieldEditor
        value={value}
        onChange={setValue}
        onValidate={async (q) => {
          // Simulate valid query
          return q.includes('=') ? null : 'Missing comparison operator'
        }}
      />
    )
  },
}

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('entity_type =')
    return (
      <QueryFieldEditor
        value={value}
        onChange={setValue}
        onValidate={async () => 'unexpected end of expression'}
      />
    )
  },
}
