import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar.js'

const icon = <span>★</span>

const sections = [
  [
    { id: 'today', icon, label: 'Today', active: true },
    { id: 'notes', icon, label: 'Notes' },
  ],
  [{ id: 'tasks', icon, label: 'Tasks', disabled: true }],
]

const bottomSection = [{ id: 'settings', icon, label: 'Settings' }]

describe('Sidebar', () => {
  it('renders all nav items', () => {
    render(<Sidebar sections={sections} bottomSection={bottomSection} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('has accessible nav landmark', () => {
    render(<Sidebar sections={sections} />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('calls onItemClick with correct id', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    render(<Sidebar sections={sections} onItemClick={onItemClick} />)
    await user.click(screen.getByText('Notes'))
    expect(onItemClick).toHaveBeenCalledWith('notes')
  })

  it('does not call onItemClick for disabled items', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    render(<Sidebar sections={sections} onItemClick={onItemClick} />)
    await user.click(screen.getByText('Tasks'))
    expect(onItemClick).not.toHaveBeenCalled()
  })

  it('renders bottom section separately', () => {
    render(<Sidebar sections={sections} bottomSection={bottomSection} />)
    const buttons = screen.getAllByRole('button')
    const settingsBtn = buttons.find((b) => b.textContent?.includes('Settings'))
    expect(settingsBtn).toBeInTheDocument()
  })
})
