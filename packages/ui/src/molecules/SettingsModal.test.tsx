import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SettingsModal } from './SettingsModal.js'

const baseProps = {
  title: 'Settings',
  nav: <nav>Nav</nav>,
  content: <div>Content pane</div>,
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
  isDirty: false,
  onSave: vi.fn(),
  onCancel: vi.fn(),
}

describe('SettingsModal', () => {
  it('renders title, nav and content', () => {
    render(<SettingsModal {...baseProps} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Nav')).toBeInTheDocument()
    expect(screen.getByText('Content pane')).toBeInTheDocument()
  })

  it('renders Save and Cancel buttons', () => {
    render(<SettingsModal {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('Save button is disabled when not dirty', () => {
    render(<SettingsModal {...baseProps} isDirty={false} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('Save button is enabled when dirty', () => {
    render(<SettingsModal {...baseProps} isDirty={true} />)
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
  })

  it('shows dirty label when isDirty and dirtyLabel provided', () => {
    render(<SettingsModal {...baseProps} isDirty={true} dirtyLabel="Unsaved changes" />)
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })

  it('does not show dirty label when not dirty', () => {
    render(<SettingsModal {...baseProps} isDirty={false} dirtyLabel="Unsaved changes" />)
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
  })

  it('calls onSave when Save is clicked', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<SettingsModal {...baseProps} isDirty={true} onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<SettingsModal {...baseProps} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('has dialog role and aria-label', () => {
    render(<SettingsModal {...baseProps} />)
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
  })
})
