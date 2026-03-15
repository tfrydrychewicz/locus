import { NavItem, type NavItemProps } from './NavItem.js'

export interface NavItemConfig extends Omit<NavItemProps, 'onClick' | 'collapsed'> {
  id: string
}

export interface SidebarProps {
  /** Main nav groups — each inner array is separated by a divider */
  sections: NavItemConfig[][]
  /** Items pinned to the bottom (Settings, Ask AI, etc.) */
  bottomSection?: NavItemConfig[]
  onItemClick?: (id: string) => void
  /** Controlled collapsed state — show icons only when true */
  collapsed?: boolean
  className?: string
}

export function Sidebar({
  sections,
  bottomSection,
  onItemClick,
  collapsed = false,
  className = '',
}: SidebarProps) {
  const itemProps = (item: NavItemConfig) => ({
    icon: item.icon,
    label: item.label,
    active: item.active,
    disabled: item.disabled,
    badge: item.badge,
    collapsed,
    onClick: () => onItemClick?.(item.id),
  })

  return (
    <nav
      aria-label="Main navigation"
      className={[
        'flex h-full shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)] py-2 transition-[width] duration-200',
        collapsed ? 'w-12 overflow-hidden' : 'w-[200px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Main sections */}
      <div className={['flex flex-1 flex-col gap-0', collapsed ? 'px-1' : 'px-2'].join(' ')}>
        {sections.map((group, gi) => (
          <div key={group[0]?.id ?? gi}>
            {gi > 0 && <hr className="my-1.5 border-t border-[var(--color-border)]" />}
            <div className="flex flex-col gap-0.5">
              {group.map((item) => (
                <NavItem key={item.id} {...itemProps(item)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      {bottomSection && bottomSection.length > 0 && (
        <>
          <hr
            className={[
              'my-1.5 border-t border-[var(--color-border)]',
              collapsed ? 'mx-1' : 'mx-2',
            ].join(' ')}
          />
          <div className={['flex flex-col gap-0.5', collapsed ? 'px-1' : 'px-2'].join(' ')}>
            {bottomSection.map((item) => (
              <NavItem key={item.id} {...itemProps(item)} />
            ))}
          </div>
        </>
      )}
    </nav>
  )
}
