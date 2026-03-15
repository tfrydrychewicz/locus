import './styles.css'
import { HelpProvider } from '@locus/help'
import { I18nProvider } from '@locus/i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import { applyTheme, loadSettings } from './settings/useSettingsStore.js'

// Apply persisted settings before first paint to avoid flash of wrong theme/language
const initialSettings = loadSettings()
applyTheme(initialSettings.theme)

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <I18nProvider locale={initialSettings.language}>
      <HelpProvider>
        <App />
      </HelpProvider>
    </I18nProvider>
  </StrictMode>,
)
