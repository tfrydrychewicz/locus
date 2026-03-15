import { useTranslation } from '@locus/i18n'
import { Zap } from 'lucide-react'

export function TodayPage() {
  const { t } = useTranslation('common')

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-muted)]">
          <Zap size={28} className="text-[var(--color-accent)]" />
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {t('nav.today')}
        </h1>
        <p className="max-w-xs text-sm text-[var(--color-text-muted)]">
          Command Center coming soon — your daily focus view, energy tracker, and task queue.
        </p>
      </div>
    </div>
  )
}
