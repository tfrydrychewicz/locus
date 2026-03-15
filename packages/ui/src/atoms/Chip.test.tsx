import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chip } from './Chip.js'

describe('Chip', () => {
  it('renders label', () => {
    render(<Chip label="Frontend" />)
    expect(screen.getByText('Frontend')).toBeDefined()
  })

  it('calls onClick when clickable', () => {
    const onClick = vi.fn()
    render(<Chip label="Click me" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Click me/ }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<Chip label="Tag" onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Tag' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('renders color dot when color is provided', () => {
    const { container } = render(<Chip label="Red" color="#ef4444" />)
    const dot = container.querySelector('span[style]')
    expect(dot).toBeDefined()
  })

  it('renders as span when not clickable', () => {
    const { container } = render(<Chip label="Static" />)
    const span = container.querySelector('span')
    expect(span?.textContent).toContain('Static')
  })
})
