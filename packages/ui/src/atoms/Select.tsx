import type { LucideIcon } from 'lucide-react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface SelectOption {
  value: string
  label: string
  icon?: LucideIcon
}

export interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Renders a search input inside the dropdown to filter options. */
  searchable?: boolean
  searchPlaceholder?: string
  disabled?: boolean
  error?: string
  selectSize?: 'sm' | 'md'
  id?: string
  className?: string
}

const SIZE = {
  sm: {
    trigger: 'h-8 px-2.5 text-xs gap-1.5 rounded-md',
    optText: 'text-xs',
    icon: 14,
    chevron: 12,
  },
  md: { trigger: 'h-9 px-3 text-sm gap-2 rounded-lg', optText: 'text-sm', icon: 16, chevron: 14 },
} as const

/** Max height of the dropdown panel in pixels. Kept short so the list scrolls. */
const PANEL_MAX_H = 180
/** Gap between trigger bottom/top and panel edge. */
const PANEL_GAP = 4

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = false,
  searchPlaceholder = 'Search…',
  disabled = false,
  error,
  selectSize = 'md',
  id,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIdx, setActiveIdx] = useState(-1)
  /** Fixed-position style for the portal panel, computed on open. */
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({})

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const errorId = useId()

  const selected = options.find((o) => o.value === value)
  const SelectedIcon = selected?.icon

  const filtered =
    searchable && search.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
      : options

  const computePanelStyle = useCallback((): React.CSSProperties => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return {}
    const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP
    const spaceAbove = rect.top - PANEL_GAP
    // Body has overflow:hidden and clips. Open upward when: not enough space below,
    // or trigger is in lower half of viewport (common for modals).
    const openUpward =
      spaceBelow < PANEL_MAX_H || spaceAbove >= spaceBelow || rect.bottom > window.innerHeight / 2

    if (openUpward) {
      return {
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        bottom: window.innerHeight - rect.top + PANEL_GAP,
        maxHeight: Math.min(PANEL_MAX_H, spaceAbove),
      }
    }
    return {
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      top: rect.bottom + PANEL_GAP,
      maxHeight: Math.min(PANEL_MAX_H, spaceBelow),
    }
  }, [])

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setSearch('')
    setActiveIdx(-1)
  }, [])

  function openDropdown() {
    setPanelStyle(computePanelStyle())
    setOpen(true)
  }

  function choose(val: string) {
    onChange(val)
    closeDropdown()
  }

  // Allow dropdown to escape body overflow:hidden (body clips portaled content otherwise)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'visible'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Close on outside click (panel is in portal so we listen on document)
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node
      const inTrigger = triggerRef.current?.contains(target)
      const inPanel = panelRef.current?.contains(target)
      if (!inTrigger && !inPanel) closeDropdown()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, closeDropdown])

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return
    function reposition() {
      setPanelStyle(computePanelStyle())
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, computePanelStyle])

  // Auto-focus the search input when opened
  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus()
    }
  }, [open, searchable])

  // Reset keyboard highlight when filtered list changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on search change
  useEffect(() => {
    setActiveIdx(-1)
  }, [search])

  function handleTriggerKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openDropdown()
    } else if (e.key === 'Escape') {
      closeDropdown()
    }
  }

  function handleNavKey(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (activeIdx >= 0) {
          const opt = filtered[activeIdx]
          if (opt) choose(opt.value)
        }
        break
      case 'Escape':
        closeDropdown()
        break
    }
  }

  const sz = SIZE[selectSize]
  const activeOptionId = activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          id={listboxId}
          role="listbox"
          aria-label="Options"
          style={panelStyle}
          className="z-[99999] list-none overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-xl"
        >
          {searchable && (
            <div role="presentation" className="px-2 pb-1 pt-1.5">
              <div className="relative">
                <Search
                  size={12}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-2 my-auto text-[var(--color-text-muted)]"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleNavKey}
                  placeholder={searchPlaceholder}
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-1 pl-6 pr-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div role="presentation" className="px-3 py-2 text-xs text-[var(--color-text-muted)]">
              No results
            </div>
          ) : (
            filtered.map((opt, idx) => {
              const isSelected = opt.value === value
              const isActive = idx === activeIdx
              const OptIcon = opt.icon
              return (
                <div
                  key={opt.value}
                  id={`${listboxId}-opt-${idx}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onClick={() => choose(opt.value)}
                  onKeyDown={handleNavKey}
                  className={[
                    'flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors',
                    sz.optText,
                    isActive || isSelected
                      ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]',
                    isSelected ? 'font-medium' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {OptIcon && <OptIcon size={14} aria-hidden className="shrink-0" />}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected && (
                    <Check size={12} aria-hidden className="shrink-0 text-[var(--color-accent)]" />
                  )}
                </div>
              )
            })
          )}
        </div>,
        document.body,
      )
    : null

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={() => !disabled && (open ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKey}
        className={[
          'flex w-full items-center justify-between',
          'border bg-[var(--color-bg-surface)]',
          'text-[var(--color-text-primary)] transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open
            ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
            : error
              ? 'border-[var(--color-danger)]'
              : 'border-[var(--color-border)]',
          sz.trigger,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {SelectedIcon && (
            <SelectedIcon
              size={sz.icon}
              aria-hidden
              className="shrink-0 text-[var(--color-text-muted)]"
            />
          )}
          <span className={`truncate ${!selected ? 'text-[var(--color-text-muted)]' : ''}`}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={sz.chevron}
          aria-hidden
          className={`ml-1 shrink-0 text-[var(--color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {panel}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  )
}
