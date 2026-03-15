import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Tooltip } from './Tooltip.js'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('does not show tooltip by default', () => {
    render(
      <Tooltip content="Help text">
        <button type="button">Hover</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('shows tooltip on hover after delay', () => {
    const { container } = render(
      <Tooltip content="Help text">
        <button type="button">Hover</button>
      </Tooltip>,
    )

    const wrapper = container.firstElementChild as HTMLElement
    fireEvent.mouseEnter(wrapper)
    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(screen.getByRole('tooltip').textContent).toBe('Help text')
  })

  it('hides tooltip on mouse leave', () => {
    const { container } = render(
      <Tooltip content="Bye">
        <button type="button">Hover</button>
      </Tooltip>,
    )

    const wrapper = container.firstElementChild as HTMLElement
    fireEvent.mouseEnter(wrapper)
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(screen.getByRole('tooltip')).toBeDefined()

    fireEvent.mouseLeave(wrapper)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
