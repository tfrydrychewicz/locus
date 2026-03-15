import { useTranslation } from '@locus/i18n'
import { Settings } from 'lucide-react'

export function SettingsPage() {
  const { t } = useTranslation('common')

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)]">
          <Settings size={28} className="text-[var(--color-text-secondary)]" />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {t('nav.settings')}
        </h1>
        <p className="max-w-xs text-sm text-[var(--color-text-muted)]">
          Appearance, language, AI providers, and more — coming in Phase 1.8.
        </p>
      </div>
    </div>
  )
}
