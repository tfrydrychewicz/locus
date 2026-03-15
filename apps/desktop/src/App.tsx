import { useEffect, useState } from 'react'
import { ping } from './tauri/commands.js'

export function App() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')

  useEffect(() => {
    ping()
      .then(() => setStatus('connected'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Titlebar drag region */}
      <header
        className="flex h-9 shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)] px-4"
        data-tauri-drag-region=""
      >
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Locus</span>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-[20px] font-bold text-[var(--color-text-primary)]">Locus</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {status === 'loading' && 'Connecting to backend...'}
            {status === 'connected' && 'Backend connected. Ready to build.'}
            {status === 'error' && 'Failed to connect to backend.'}
          </p>
        </div>
      </main>
    </div>
  )
}
