import { HelpButton } from '@locus/help'
import { useTranslation } from '@locus/i18n'
import { SettingsModal, SettingsNav } from '@locus/ui'
import { Brush, Globe } from 'lucide-react'
import { useState } from 'react'
import { type AppSettings, type Theme, useSettingsStore } from '../settings/useSettingsStore.js'

type AppLanguage = AppSettings['language']

// ─── Appearance section content ─────────────────────────────────────────────

function AppearanceContent({
  settings,
  onChange,
}: {
  settings: AppSettings
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}) {
  const { t } = useTranslation('settings')

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: t('appearance.themeOptions.system') },
    { value: 'light', label: t('appearance.themeOptions.light') },
    { value: 'dark', label: t('appearance.themeOptions.dark') },
  ]

  const languages: { value: AppLanguage; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'pl', label: 'Polski' },
  ]

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Theme */}
      <section>
        <h3 className="mb-0.5 text-sm font-semibold text-[var(--color-text-primary)]">
          {t('appearance.theme')}
        </h3>
        <fieldset className="mt-3 flex gap-2 border-0 p-0">
          <legend className="sr-only">{t('appearance.theme')}</legend>
          {themes.map(({ value, label }) => (
            <label
              key={value}
              className={[
                'cursor-pointer rounded-md border px-4 py-2 text-[13px] transition-colors',
                settings.theme === value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              ].join(' ')}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={settings.theme === value}
                onChange={() => onChange('theme', value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </fieldset>
      </section>

      {/* Language */}
      <section>
        <h3 className="mb-0.5 text-sm font-semibold text-[var(--color-text-primary)]">
          {t('general.language')}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">{t('general.languageDescription')}</p>
        <fieldset className="mt-3 flex gap-2 border-0 p-0">
          <legend className="sr-only">{t('general.language')}</legend>
          {languages.map(({ value, label }) => (
            <label
              key={value}
              className={[
                'cursor-pointer rounded-md border px-4 py-2 text-[13px] transition-colors',
                settings.language === value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
              ].join(' ')}
            >
              <input
                type="radio"
                name="language"
                value={value}
                checked={settings.language === value}
                onChange={() => onChange('language', value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </fieldset>
      </section>
    </div>
  )
}

// ─── Confirmation dialog ─────────────────────────────────────────────────────

function DiscardDialog({
  onDiscard,
  onKeepEditing,
}: {
  onDiscard: () => void
  onKeepEditing: () => void
}) {
  const { t } = useTranslation('common')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label={t('unsavedChanges.title')}
    >
      <div className="w-[360px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-lg">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {t('unsavedChanges.title')}
        </h3>
        <p className="mb-5 text-[13px] text-[var(--color-text-secondary)]">
          {t('unsavedChanges.message')}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onKeepEditing}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
          >
            {t('unsavedChanges.cancel')}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-subtle)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
          >
            {t('unsavedChanges.discard')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const { settings, isDirty, set, save, discard } = useSettingsStore()

  const [activeCategory, setActiveCategory] = useState('appearance')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const categories = [
    {
      id: 'appearance',
      icon: <Brush size={15} />,
      label: t('categories.appearance'),
    },
    {
      id: 'general',
      icon: <Globe size={15} />,
      label: t('categories.general'),
    },
  ]

  const handleCancelClick = () => {
    if (isDirty) {
      setConfirmDiscard(true)
    }
  }

  const handleConfirmDiscard = () => {
    discard()
    setConfirmDiscard(false)
  }

  const contentPane = (
    <div className="flex h-full flex-col">
      {/* Content header with HelpButton */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          {categories.find((c) => c.id === activeCategory)?.label}
        </span>
        <HelpButton topic="settings.overview" />
      </div>

      {/* Section content */}
      {activeCategory === 'appearance' || activeCategory === 'general' ? (
        <AppearanceContent settings={settings} onChange={set} />
      ) : (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--color-text-muted)]">
          Coming soon
        </div>
      )}
    </div>
  )

  return (
    <>
      <SettingsModal
        title={t('title')}
        nav={
          <SettingsNav
            categories={categories}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
        }
        content={contentPane}
        saveLabel={t('save')}
        cancelLabel={tCommon('cancel')}
        isDirty={isDirty}
        dirtyLabel={t('unsavedChanges')}
        onSave={save}
        onCancel={handleCancelClick}
      />

      {confirmDiscard && (
        <DiscardDialog
          onDiscard={handleConfirmDiscard}
          onKeepEditing={() => setConfirmDiscard(false)}
        />
      )}
    </>
  )
}
