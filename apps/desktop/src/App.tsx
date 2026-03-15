import { useCallback, useState } from 'react'
import { NotesPage } from './pages/NotesPage.js'
import type { Note } from './tauri/commands.js'
import type { PaneState, TabState } from './view-pane/types.js'

function makePane(content: PaneState['content'] = { type: 'empty' }, label = 'New Tab'): PaneState {
  return { id: crypto.randomUUID(), label, content }
}

function makeTab(note?: Note): TabState {
  const pane = makePane(
    note ? { type: 'note', noteId: note.id } : { type: 'empty' },
    note?.title || 'New Tab',
  )
  return {
    id: crypto.randomUUID(),
    label: note?.title || 'New Tab',
    panes: [pane],
    activePaneId: pane.id,
  }
}

export function App() {
  const [tabs, setTabs] = useState<TabState[]>(() => [makeTab()])
  const [activeTabId, setActiveTabId] = useState<string | null>(() => tabs[0]?.id ?? null)

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? null

  const updateActiveTab = useCallback(
    (updater: (tab: TabState) => TabState) => {
      setTabs((prev) => prev.map((t) => (t.id === activeTabId ? updater(t) : t)))
    },
    [activeTabId],
  )

  const openInNewTab = useCallback((note: Note) => {
    const tab = makeTab(note)
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
  }, [])

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === tabId)
        const next = prev.filter((t) => t.id !== tabId)
        if (next.length === 0) {
          const fresh = makeTab()
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
    [activeTabId],
  )

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

        {/* Separator */}
        <div className="h-4 w-px shrink-0 bg-[var(--color-border)]" />

        {/* Tab list */}
        <div className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto">
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
                  onClick={() => setActiveTabId(tab.id)}
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
            const tab = makeTab()
            setTabs((prev) => [...prev, tab])
            setActiveTabId(tab.id)
          }}
        >
          +
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="flex min-h-0 flex-1 flex-col">
        {activeTab && (
          <NotesPage tab={activeTab} onTabChange={updateActiveTab} onOpenInNewTab={openInNewTab} />
        )}
      </main>
    </div>
  )
}
