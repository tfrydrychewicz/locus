import { useState } from 'react'
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
  /** Start collapsed (icon-only). Defaults to false. */
  defaultCollapsed?: boolean
  className?: string
}

export function Sidebar({
  sections,
  bottomSection,
  onItemClick,
  defaultCollapsed = false,
  className = '',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

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
      {/* Toggle button */}
      <div className={['mb-1 flex', collapsed ? 'justify-center px-0' : 'px-2'].join(' ')}>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
        >
          {/* Chevron icon — points left when expanded, right when collapsed */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className={['transition-transform duration-200', collapsed ? 'rotate-180' : ''].join(
              ' ',
            )}
          >
            <path
              d="M9 3L5 7L9 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

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
