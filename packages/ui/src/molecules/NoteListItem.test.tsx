import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NoteListItem } from './NoteListItem.js'

describe('NoteListItem', () => {
  it('renders title, excerpt and updatedAt', () => {
    render(<NoteListItem title="My note" excerpt="Short preview" updatedAt="Today" />)
    expect(screen.getByText('My note')).toBeDefined()
    expect(screen.getByText('Short preview')).toBeDefined()
    expect(screen.getByText('Today')).toBeDefined()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<NoteListItem title="Clickable" updatedAt="Now" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clickable' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders as button when onClick is provided', () => {
    render(<NoteListItem title="Note" updatedAt="Now" onClick={() => {}} />)
    const btn = screen.getByRole('button', { name: 'Note' })
    expect(btn).toBeDefined()
  })

  it('renders as div when onClick is not provided', () => {
    render(<NoteListItem title="Note" updatedAt="Now" />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Note')).toBeDefined()
  })

  it('sets aria-pressed when selected', () => {
    render(<NoteListItem title="Selected" updatedAt="Now" onClick={() => {}} selected />)
    expect(screen.getByRole('button', { name: 'Selected' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
  })

  it('shows Untitled when title is empty', () => {
    render(<NoteListItem title="" updatedAt="Now" />)
    expect(screen.getByText('Untitled')).toBeDefined()
  })
})
