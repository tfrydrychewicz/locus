import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NavItem } from './NavItem.js'

const icon = <span data-testid="icon">★</span>

describe('NavItem', () => {
  it('renders label and icon', () => {
    render(<NavItem icon={icon} label="Notes" />)
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('sets aria-current="page" when active', () => {
    render(<NavItem icon={icon} label="Notes" active />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-current', 'page')
  })

  it('has no aria-current when inactive', () => {
    render(<NavItem icon={icon} label="Notes" />)
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-current')
  })

  it('is disabled when disabled prop is set', () => {
    render(<NavItem icon={icon} label="Notes" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<NavItem icon={icon} label="Notes" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows badge when badge > 0', () => {
    render(<NavItem icon={icon} label="Notes" badge={5} />)
    expect(screen.getByLabelText('5 items')).toBeInTheDocument()
  })

  it('truncates badge at 99+', () => {
    render(<NavItem icon={icon} label="Notes" badge={150} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not show badge when badge is 0', () => {
    render(<NavItem icon={icon} label="Notes" badge={0} />)
    expect(screen.queryByLabelText(/items/)).not.toBeInTheDocument()
  })
})
