import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar.js'

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeDefined()
  })

  it('shows value', () => {
    render(<SearchBar value="hello" onChange={() => {}} />)
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(input.value).toBe('hello')
  })

  it('calls onChange after debounce when user types', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'a' } })
    expect(onChange).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(300)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('debounces rapid typing and calls onChange once with final value', async () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.change(input, { target: { value: 'abc' } })
    await vi.advanceTimersByTimeAsync(300)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('abc')
  })

  it('shows loading state', () => {
    render(<SearchBar value="" onChange={() => {}} loading />)
    expect(screen.getByRole('status', { hidden: true })).toBeDefined()
  })
})
