import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { HelpProvider } from './HelpProvider.js'
import { useHelp } from './useHelp.js'

function wrapper({ children }: { children: ReactNode }) {
  return <HelpProvider>{children}</HelpProvider>
}

describe('HelpProvider + useHelp', () => {
  it('starts with help closed', () => {
    const { result } = renderHook(() => useHelp(), { wrapper })
    expect(result.current.isOpen).toBe(false)
    expect(result.current.activeTopic).toBeNull()
  })

  it('openHelp sets topic and opens', () => {
    const { result } = renderHook(() => useHelp(), { wrapper })

    act(() => {
      result.current.openHelp('notes.editor')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.activeTopic).toBe('notes.editor')
  })

  it('closeHelp resets state', () => {
    const { result } = renderHook(() => useHelp(), { wrapper })

    act(() => {
      result.current.openHelp('tasks.gtd')
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.closeHelp()
    })
    expect(result.current.isOpen).toBe(false)
    expect(result.current.activeTopic).toBeNull()
  })

  it('toggleHelp opens when closed', () => {
    const { result } = renderHook(() => useHelp(), { wrapper })

    act(() => {
      result.current.toggleHelp('cognitive.energy')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.activeTopic).toBe('cognitive.energy')
  })

  it('toggleHelp closes when same topic is open', () => {
    const { result } = renderHook(() => useHelp(), { wrapper })

    act(() => {
      result.current.openHelp('cognitive.energy')
    })

    act(() => {
      result.current.toggleHelp('cognitive.energy')
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('toggleHelp switches topic when different topic is open', () => {
    const { result } = renderHook(() => useHelp(), { wrapper })

    act(() => {
      result.current.openHelp('notes.editor')
    })

    act(() => {
      result.current.toggleHelp('tasks.gtd')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.activeTopic).toBe('tasks.gtd')
  })

  it('useHelp throws without provider', () => {
    expect(() => {
      renderHook(() => useHelp())
    }).toThrow('useHelp must be used within a <HelpProvider>')
  })
})
