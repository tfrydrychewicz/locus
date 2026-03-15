import { animation, colors, layout, spacing, typography } from '@locus/tokens'
import type { Meta, StoryObj } from '@storybook/react'

function ColorSwatch({ name, value }: { name: string; value: string }) {
  const isVar = value.startsWith('var(') || value.startsWith('rgba')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          backgroundColor: value,
          border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
          {isVar ? value : value}
        </div>
      </div>
    </div>
  )
}

function ColorGroup({ title, entries }: { title: string; entries: Record<string, string> }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 12,
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h3>
      {Object.entries(entries).map(([key, val]) => (
        <ColorSwatch key={key} name={key} value={val} />
      ))}
    </div>
  )
}

function TokenValue({ name, value }: { name: string; value: string | number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        borderBottom: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      <span style={{ fontWeight: 500, fontSize: 13 }}>{name}</span>
      <code style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
        {String(value)}
      </code>
    </div>
  )
}

function TokenSection({
  title,
  entries,
}: {
  title: string
  entries: Record<string, string | number>
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 12,
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h3>
      {Object.entries(entries).map(([key, val]) => (
        <TokenValue key={key} name={key} value={val} />
      ))}
    </div>
  )
}

function SpacingPreview() {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 12,
          color: 'var(--color-text-primary)',
        }}
      >
        Spacing
      </h3>
      {Object.entries(spacing).map(([key, val]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <code
            style={{
              width: 40,
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              fontFamily: 'monospace',
            }}
          >
            {key}
          </code>
          <div
            style={{
              height: 16,
              width: val,
              backgroundColor: 'var(--color-accent)',
              borderRadius: 3,
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

function TokenCatalog() {
  return (
    <div
      style={{ padding: 32, maxWidth: 800, backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          color: 'var(--color-text-primary)',
        }}
      >
        Locus Design Tokens
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
        All design tokens exported from @locus/tokens. Toggle theme in the toolbar above.
      </p>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 16,
          color: 'var(--color-text-primary)',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: 8,
        }}
      >
        Colors
      </h2>

      <ColorGroup title="Semantic — Background" entries={colors.dark.bg} />
      <ColorGroup title="Semantic — Text" entries={colors.dark.text} />
      <ColorGroup title="Accent" entries={colors.accent} />
      <ColorGroup title="Danger" entries={colors.danger} />
      <ColorGroup title="Energy States" entries={colors.energy} />
      <ColorGroup title="Cognitive Modes" entries={colors.mode} />

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 16,
          marginTop: 32,
          color: 'var(--color-text-primary)',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: 8,
        }}
      >
        Spacing & Layout
      </h2>

      <SpacingPreview />

      <TokenSection
        title="Layout"
        entries={{
          'sidebar.width': layout.sidebar.width,
          'panel.width': layout.panel.width,
          'chat.width': layout.chat.width,
          'editor.maxWidth': layout.editor.maxWidth,
        }}
      />

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 16,
          marginTop: 32,
          color: 'var(--color-text-primary)',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: 8,
        }}
      >
        Typography
      </h2>

      <TokenSection title="Font Families" entries={typography.fontFamily} />
      <TokenSection title="Font Sizes" entries={typography.fontSize} />
      <TokenSection title="Font Weights" entries={typography.fontWeight} />
      <TokenSection title="Line Heights" entries={typography.lineHeight} />

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 16,
          marginTop: 32,
          color: 'var(--color-text-primary)',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: 8,
        }}
      >
        Animation
      </h2>

      <TokenSection title="Durations" entries={animation.duration} />
      <TokenSection title="Easings" entries={animation.easing} />
    </div>
  )
}

const meta: Meta<typeof TokenCatalog> = {
  component: TokenCatalog,
  title: 'Design System/Token Catalog',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta

type Story = StoryObj<typeof TokenCatalog>

export const Default: Story = {}
