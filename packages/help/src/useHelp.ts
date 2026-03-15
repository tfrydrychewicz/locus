import { useContext } from 'react'
import { HelpContext, type HelpContextValue } from './HelpProvider.js'

export function useHelp(): HelpContextValue {
  const ctx = useContext(HelpContext)
  if (!ctx) {
    throw new Error('useHelp must be used within a <HelpProvider>')
  }
  return ctx
}
