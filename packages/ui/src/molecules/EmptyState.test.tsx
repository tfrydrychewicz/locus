import { fireEvent, render, screen } from '@testing-library/react'
import { FileQuestion } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../atoms/Button.js'
import { EmptyState } from './EmptyState.js'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState icon={FileQuestion} title="No notes" description="Create one to get started." />,
    )
    expect(screen.getByRole('status', { name: 'No notes' })).toBeDefined()
    expect(screen.getByText('No notes')).toBeDefined()
    expect(screen.getByText('Create one to get started.')).toBeDefined()
  })

  it('renders action and calls click handler when action is clicked', () => {
    const onAction = vi.fn()
    render(
      <EmptyState
        icon={FileQuestion}
        title="Empty"
        action={<Button onClick={onAction}>Create</Button>}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders without description or action', () => {
    render(<EmptyState icon={FileQuestion} title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeDefined()
  })
})
