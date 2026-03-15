import './styles.css'
import { HelpProvider } from '@locus/help'
import { I18nProvider } from '@locus/i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.js'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <HelpProvider>
        <App />
      </HelpProvider>
    </I18nProvider>
  </StrictMode>,
)
