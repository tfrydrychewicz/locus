import { useTranslation } from '@locus/i18n'
import { type NavItemConfig, Sidebar } from '@locus/ui'
import {
  Calendar,
  FileText,
  Folder,
  MessageSquare,
  PanelLeft,
  Scale,
  Search,
  Settings,
  Target,
  Trash2,
  User,
  Users,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CommandPalette, type PageId } from './components/CommandPalette.js'
import { NotesPage } from './pages/NotesPage.js'
import { SettingsPage } from './pages/SettingsPage.js'
import { TodayPage } from './pages/TodayPage.js'
import type { Note } from './tauri/commands.js'
import type { PaneState, TabState } from './view-pane/types.js'

function makePane(content: PaneState['content'] = { type: 'empty' }, label = 'New Tab'): PaneState {
  return { id: crypto.randomUUID(), label, content }
}

function makeTab(note?: Note, fallbackLabel = 'New Tab'): TabState {
  const pane = makePane(
    note ? { type: 'note', noteId: note.id } : { type: 'empty' },
    note?.title || fallbackLabel,
  )
  return {
    id: crypto.randomUUID(),
    label: note?.title || fallbackLabel,
    panes: [pane],
    activePaneId: pane.id,
  }
}

export function App() {
  const { t } = useTranslation('common')
  const newTabLabel = t('newTab')
  const [activePage, setActivePage] = useState<PageId>('today')
  const [tabs, setTabs] = useState<TabState[]>(() => [makeTab()])
  const [activeTabId, setActiveTabId] = useState<string | null>(() => tabs[0]?.id ?? null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? null

  const updateActiveTab = useCallback(
    (updater: (tab: TabState) => TabState) => {
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? updater(t) : t)))
    },
    [activeTabId],
  )

  const openNoteInTab = useCallback(
    (note: Note) => {
      // Switch to notes page and open note in current tab
      setActivePage('notes')
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTabId) return tab
          const pane = makePane({ type: 'note', noteId: note.id }, note.title || newTabLabel)
          return { ...tab, label: note.title || newTabLabel, panes: [pane], activePaneId: pane.id }
        }),
      )
    },
    [activeTabId, newTabLabel],
  )

  const openInNewTab = useCallback(
    (note: Note) => {
      const tab = makeTab(note, newTabLabel)
      setTabs((prev) => [...prev, tab])
      setActiveTabId(tab.id)
      setActivePage('notes')
    },
    [newTabLabel],
  )

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === tabId)
        const next = prev.filter((t) => t.id !== tabId)
        if (next.length === 0) {
          const fresh = makeTab(undefined, newTabLabel)
          setActiveTabId(fresh.id)
          return [fresh]
        }
        if (activeTabId === tabId) {
          const nextActive = next[idx]?.id ?? next[idx - 1]?.id ?? null
          setActiveTabId(nextActive)
        }
        return next
      })
    },
    [activeTabId, newTabLabel],
  )

  // Cmd+K → open command palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Build sidebar items
  const mainSections: NavItemConfig[][] = [
    [
      {
        id: 'today',
        icon: <Zap size={16} />,
        label: t('nav.today'),
        active: activePage === 'today',
      },
      {
        id: 'notes',
        icon: <FileText size={16} />,
        label: t('nav.notes'),
        active: activePage === 'notes',
      },
    ],
    [
      { id: 'people', icon: <User size={16} />, label: t('nav.people'), disabled: true },
      { id: 'projects', icon: <Folder size={16} />, label: t('nav.projects'), disabled: true },
      { id: 'team', icon: <Users size={16} />, label: t('nav.team'), disabled: true },
      { id: 'decisions', icon: <Scale size={16} />, label: t('nav.decisions'), disabled: true },
      { id: 'okrs', icon: <Target size={16} />, label: t('nav.okrs'), disabled: true },
    ],
    [
      { id: 'calendar', icon: <Calendar size={16} />, label: t('nav.calendar'), disabled: true },
      {
        id: 'search',
        icon: <Search size={16} />,
        label: t('nav.search'),
        active: activePage === 'search',
      },
      { id: 'trash', icon: <Trash2 size={16} />, label: t('nav.trash'), disabled: true },
    ],
  ]

  const bottomSection: NavItemConfig[] = [
    { id: 'askAi', icon: <MessageSquare size={16} />, label: t('nav.askAi'), disabled: true },
    {
      id: 'settings',
      icon: <Settings size={16} />,
      label: t('nav.settings'),
      active: activePage === 'settings',
    },
  ]

  const handleNavClick = useCallback((id: string) => {
    const navigable: PageId[] = ['today', 'notes', 'settings', 'search']
    if (navigable.includes(id as PageId)) {
      setActivePage(id as PageId)
    }
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* ── Top bar ── */}
      <header
        className="flex h-9 shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)]"
        data-tauri-drag-region=""
      >
        {/* App name */}
        <span className="shrink-0 px-4 text-[13px] font-semibold text-[var(--color-text-primary)]">
          Locus
        </span>

        {/* Sidebar toggle */}
        <button
          type="button"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed((c) => !c)}
          className={[
            'mr-1 flex shrink-0 items-center justify-center rounded p-1.5 transition-colors',
            sidebarCollapsed
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
          ].join(' ')}
        >
          <PanelLeft size={15} aria-hidden />
        </button>

        {/* Separator */}
        <div className="h-4 w-px shrink-0 bg-[var(--color-border)]" aria-hidden="true" />

        {/* Tabs — only meaningful on notes page */}
        <div className="flex min-w-0 flex-1 items-center overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div key={tab.id} className="flex shrink-0 items-center">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={[
                    'max-w-[180px] truncate rounded px-3 py-1 text-[13px] transition-colors',
                    isActive
                      ? 'bg-[var(--color-bg-elevated)] font-medium text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                  onClick={() => {
                    setActiveTabId(tab.id)
                    setActivePage('notes')
                  }}
                >
                  {tab.label}
                </button>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Close ${tab.label}`}
                    className="ml-0.5 rounded p-0.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* New tab button */}
        <button
          type="button"
          aria-label="New tab"
          title="New tab"
          className="mr-2 shrink-0 rounded px-2 py-0.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
          onClick={() => {
            const tab = makeTab(undefined, newTabLabel)
            setTabs((prev) => [...prev, tab])
            setActiveTabId(tab.id)
            setActivePage('notes')
          }}
        >
          +
        </button>

        {/* Cmd+K hint */}
        <button
          type="button"
          aria-label="Open command palette"
          title="Command palette (⌘K)"
          className="mr-3 flex shrink-0 items-center gap-1 rounded border border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]"
          onClick={() => setPaletteOpen(true)}
        >
          <Search size={11} aria-hidden />
          <span>⌘K</span>
        </button>
      </header>

      {/* ── Body: Sidebar + Page ── */}
      <div className="flex min-h-0 flex-1">
        <Sidebar
          sections={mainSections}
          bottomSection={bottomSection}
          onItemClick={handleNavClick}
          collapsed={sidebarCollapsed}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activePage === 'today' && <TodayPage />}
          {activePage === 'notes' && activeTab && (
            <NotesPage
              tab={activeTab}
              onTabChange={updateActiveTab}
              onOpenInNewTab={openInNewTab}
            />
          )}
          {activePage === 'settings' && <SettingsPage />}
          {activePage === 'search' && (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
              {t('search.placeholder', { defaultValue: 'Search coming soon…' })}
            </div>
          )}
        </main>
      </div>

      {/* ── Command Palette ── */}
      {paletteOpen && (
        <CommandPalette
          onNavigate={(page) => {
            setActivePage(page)
            setPaletteOpen(false)
          }}
          onOpenNote={openNoteInTab}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  )
}
