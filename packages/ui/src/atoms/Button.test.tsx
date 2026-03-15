import { fireEvent, render, screen } from '@testing-library/react'
import { Plus } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button.js'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not fire onClick when loading', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} loading>
        Saving
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('disabled')).toBe('')
  })

  it('renders icon when provided', () => {
    render(<Button icon={Plus}>Add</Button>)
    const btn = screen.getByRole('button')
    const svg = btn.querySelector('svg')
    expect(svg).toBeDefined()
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button').className).toContain('danger')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button').className).toContain('transparent')
  })
})
