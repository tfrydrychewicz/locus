export interface SettingsSubcategory {
  id: string
  label: string
}

export interface SettingsCategory {
  id: string
  icon: React.ReactNode
  label: string
  subcategories?: SettingsSubcategory[]
}

export interface SettingsNavProps {
  categories: SettingsCategory[]
  /** Currently active category or subcategory id */
  activeId: string
  onSelect: (id: string) => void
}

export function SettingsNav({ categories, activeId, onSelect }: SettingsNavProps) {
  return (
    <nav aria-label="Settings categories" className="flex flex-col gap-0.5 py-2">
      {categories.map((cat) => (
        <div key={cat.id}>
          <button
            type="button"
            aria-current={activeId === cat.id ? 'page' : undefined}
            onClick={() => onSelect(cat.id)}
            className={[
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors',
              activeId === cat.id
                ? 'bg-[var(--color-accent-muted)] font-semibold text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
            ].join(' ')}
          >
            <span aria-hidden="true" className="flex shrink-0 items-center">
              {cat.icon}
            </span>
            <span className="truncate font-medium">{cat.label}</span>
          </button>

          {/* Subcategories — indented */}
          {cat.subcategories && cat.subcategories.length > 0 && (
            <div className="mt-0.5 flex flex-col gap-0.5 pl-8">
              {cat.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  aria-current={activeId === sub.id ? 'page' : undefined}
                  onClick={() => onSelect(sub.id)}
                  className={[
                    'w-full truncate rounded-md px-2.5 py-1 text-left text-[13px] transition-colors',
                    activeId === sub.id
                      ? 'bg-[var(--color-accent-muted)] font-medium text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
