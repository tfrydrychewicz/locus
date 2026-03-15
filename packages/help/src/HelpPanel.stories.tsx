import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { HelpButton } from './HelpButton.js'
import { HelpPanel } from './HelpPanel.js'
import { HelpProvider } from './HelpProvider.js'
import { useHelp } from './useHelp.js'

function AutoOpenHelper({ topic }: { topic: string }) {
  const { openHelp } = useHelp()
  useEffect(() => {
    openHelp(topic as Parameters<typeof openHelp>[0])
  }, [openHelp, topic])
  return null
}

function StoryShell({ children, locale }: { children: React.ReactNode; locale: string }) {
  return (
    <div className="relative h-[700px] w-full overflow-hidden bg-[var(--color-bg)]">
      {children}
      <HelpPanel locale={locale} />
    </div>
  )
}

const meta = {
  title: 'Help/HelpPanel',
  component: HelpPanel,
  decorators: [
    (Story, context) => {
      const locale = (context.globals as Record<string, string>).locale ?? 'en'
      return (
        <HelpProvider>
          <StoryShell locale={locale}>
            <Story />
          </StoryShell>
        </HelpProvider>
      )
    },
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof HelpPanel>

export default meta
type Story = StoryObj<typeof meta>

export const GettingStarted: Story = {
  name: 'Open — Getting Started',
  render: () => (
    <>
      <AutoOpenHelper topic="getting-started" />
      <div className="p-8 pr-[420px]">
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-3">
          Main Content Area
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] max-w-md leading-relaxed">
          The help panel slides in from the right. It shows a quick answer, expandable sections, and
          an ADHD tip. Click the × to close.
        </p>
      </div>
    </>
  ),
}

export const WithHelpButton: Story = {
  name: 'Interactive — With Button',
  render: () => (
    <div className="p-8">
      <header className="flex items-center justify-between max-w-md border-b border-[var(--color-border)] pb-3 mb-4">
        <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Note Editor</h2>
        <HelpButton topic="getting-started" />
      </header>
      <p className="text-[14px] text-[var(--color-text-secondary)] max-w-md leading-relaxed">
        Click the <strong>?</strong> button above to open the help panel. Click it again to close.
      </p>
    </div>
  ),
}

export const EmptyContent: Story = {
  name: 'Open — No Content',
  render: () => (
    <>
      <AutoOpenHelper topic="shortcuts" />
      <div className="p-8 pr-[420px]">
        <p className="text-[14px] text-[var(--color-text-secondary)] max-w-md">
          This topic has no content registered yet — shows a fallback message.
        </p>
      </div>
    </>
  ),
}
