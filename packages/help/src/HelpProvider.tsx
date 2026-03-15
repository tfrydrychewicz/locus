import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react'
import type { HelpTopicId } from './help-registry.js'

export interface HelpContextValue {
  isOpen: boolean
  activeTopic: HelpTopicId | null
  openHelp: (topic: HelpTopicId) => void
  closeHelp: () => void
  toggleHelp: (topic: HelpTopicId) => void
}

export const HelpContext = createContext<HelpContextValue | null>(null)

interface HelpProviderProps {
  children: ReactNode
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTopic, setActiveTopic] = useState<HelpTopicId | null>(null)

  const openHelp = useCallback((topic: HelpTopicId) => {
    setActiveTopic(topic)
    setIsOpen(true)
  }, [])

  const closeHelp = useCallback(() => {
    setIsOpen(false)
    setActiveTopic(null)
  }, [])

  const toggleHelp = useCallback(
    (topic: HelpTopicId) => {
      if (isOpen && activeTopic === topic) {
        closeHelp()
      } else {
        openHelp(topic)
      }
    },
    [isOpen, activeTopic, openHelp, closeHelp],
  )

  const value = useMemo(
    () => ({ isOpen, activeTopic, openHelp, closeHelp, toggleHelp }),
    [isOpen, activeTopic, openHelp, closeHelp, toggleHelp],
  )

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>
}
