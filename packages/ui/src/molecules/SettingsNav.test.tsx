import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SettingsNav } from './SettingsNav.js'

const icon = <span data-testid="icon">●</span>

const categories = [
  { id: 'appearance', icon, label: 'Appearance' },
  { id: 'editor', icon, label: 'Editor' },
  {
    id: 'ai',
    icon,
    label: 'AI',
    subcategories: [
      { id: 'ai.provider', label: 'Provider' },
      { id: 'ai.models', label: 'Models' },
    ],
  },
]

describe('SettingsNav', () => {
  it('renders all category labels', () => {
    render(<SettingsNav categories={categories} activeId="appearance" onSelect={() => {}} />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('marks active category with aria-current="page"', () => {
    render(<SettingsNav categories={categories} activeId="editor" onSelect={() => {}} />)
    const btn = screen.getByRole('button', { name: /editor/i })
    expect(btn).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark inactive categories with aria-current', () => {
    render(<SettingsNav categories={categories} activeId="editor" onSelect={() => {}} />)
    const btn = screen.getByRole('button', { name: /appearance/i })
    expect(btn).not.toHaveAttribute('aria-current')
  })

  it('calls onSelect with category id when clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<SettingsNav categories={categories} activeId="appearance" onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: /editor/i }))
    expect(onSelect).toHaveBeenCalledWith('editor')
  })

  it('renders subcategories when present', () => {
    render(<SettingsNav categories={categories} activeId="appearance" onSelect={() => {}} />)
    expect(screen.getByText('Provider')).toBeInTheDocument()
    expect(screen.getByText('Models')).toBeInTheDocument()
  })

  it('marks active subcategory with aria-current="page"', () => {
    render(<SettingsNav categories={categories} activeId="ai.provider" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: 'Provider' })).toHaveAttribute('aria-current', 'page')
  })

  it('calls onSelect with subcategory id when clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<SettingsNav categories={categories} activeId="appearance" onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: 'Models' }))
    expect(onSelect).toHaveBeenCalledWith('ai.models')
  })

  it('has accessible nav landmark', () => {
    render(<SettingsNav categories={categories} activeId="appearance" onSelect={() => {}} />)
    expect(screen.getByRole('navigation', { name: 'Settings categories' })).toBeInTheDocument()
  })
})
