import { NavItem, type NavItemProps } from './NavItem.js'

export interface NavItemConfig extends Omit<NavItemProps, 'onClick'> {
  id: string
}

export interface SidebarProps {
  /** Main nav groups — each inner array is separated by a divider */
  sections: NavItemConfig[][]
  /** Items pinned to the bottom (Settings, Ask AI, etc.) */
  bottomSection?: NavItemConfig[]
  onItemClick?: (id: string) => void
  className?: string
}

export function Sidebar({ sections, bottomSection, onItemClick, className = '' }: SidebarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={[
        'flex h-full w-[200px] shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] py-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Main sections */}
      <div className="flex flex-1 flex-col gap-0 px-2">
        {sections.map((group, gi) => (
          <div key={group[0]?.id ?? gi}>
            {gi > 0 && <hr className="my-1.5 border-t border-[var(--color-border)]" />}
            <div className="flex flex-col gap-0.5">
              {group.map((item) => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                  disabled={item.disabled}
                  badge={item.badge}
                  onClick={() => onItemClick?.(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      {bottomSection && bottomSection.length > 0 && (
        <>
          <hr className="mx-2 my-1.5 border-t border-[var(--color-border)]" />
          <div className="flex flex-col gap-0.5 px-2">
            {bottomSection.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={item.active}
                disabled={item.disabled}
                badge={item.badge}
                onClick={() => onItemClick?.(item.id)}
              />
            ))}
          </div>
        </>
      )}
    </nav>
  )
}
