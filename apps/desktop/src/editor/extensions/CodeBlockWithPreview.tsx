import CodeBlock from '@tiptap/extension-code-block'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'

mermaid.initialize({ startOnLoad: false, theme: 'neutral' })

function MermaidPreview({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code.trim()) {
      setSvg(null)
      setError(null)
      return
    }
    let cancelled = false
    setError(null)
    const el = document.createElement('div')
    el.className = 'mermaid'
    el.textContent = code
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    mermaid
      .run({ nodes: [el] })
      .then(() => {
        if (cancelled) return
        const svgEl = el.querySelector('svg')
        if (svgEl) setSvg(svgEl.outerHTML)
      })
      .catch((err) => {
        if (!cancelled) setError(String((err as Error).message ?? err))
      })
      .finally(() => {
        el.remove()
      })
    return () => {
      cancelled = true
    }
  }, [code])

  // Inject the trusted mermaid SVG via the DOM ref to avoid dangerouslySetInnerHTML
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svg ?? ''
    }
  }, [svg])

  if (error) return <div className="text-xs text-[var(--color-danger)]">{error}</div>
  if (!svg) return <div className="text-xs text-[var(--color-text-muted)]">Rendering…</div>
  return (
    <div
      ref={containerRef}
      className="my-2 overflow-x-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2"
    />
  )
}

function ChartPreview({ code }: { code: string }) {
  try {
    const data = JSON.parse(code) as { x: string; y: number }[]
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="text-xs text-[var(--color-text-muted)]">Valid JSON array with x,y</div>
    }
    return (
      <div className="my-2 h-[200px] w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
        <svg viewBox="0 0 300 150" className="h-full w-full" role="img" aria-label="Chart preview">
          <title>Chart preview</title>
          {data.map((d, i) => {
            // i used for x position only, not as key
            const max = Math.max(...data.map((r) => r.y), 1)
            const h = (d.y / max) * 120
            const x = 20 + (i * 260) / data.length
            const y = 130 - h
            return (
              <g key={String(d.x)}>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(260 / data.length - 4, 2)}
                  height={h}
                  fill="var(--color-accent)"
                />
                <text
                  x={x + 260 / data.length / 2}
                  y={142}
                  fontSize="10"
                  fill="var(--color-text-muted)"
                  textAnchor="middle"
                >
                  {String(d.x)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  } catch {
    return (
      <div className="text-xs text-[var(--color-text-muted)]">
        JSON array: [{'{ "x": "A", "y": 10 }'}, ...]
      </div>
    )
  }
}

function CodeBlockNodeView({ node }: NodeViewProps) {
  const language = node.attrs.language ?? ''
  const code = node.textContent
  const [showPreview, setShowPreview] = useState(true)

  const isMermaid = language === 'mermaid'
  const isChart = language === 'chart'

  if (!isMermaid && !isChart) {
    return (
      <NodeViewWrapper
        as="pre"
        className="rounded-lg bg-[var(--color-bg-elevated)] p-3 my-2 overflow-x-auto"
      >
        <code>
          <NodeViewContent />
        </code>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="my-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-2 py-1">
        <span className="text-xs text-[var(--color-text-muted)]">{language}</span>
        <button
          type="button"
          className="text-xs text-[var(--color-accent)] hover:underline"
          onClick={() => setShowPreview((s) => !s)}
        >
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>
      {showPreview && (
        <div className="p-2">
          {isMermaid && <MermaidPreview code={code} />}
          {isChart && <ChartPreview code={code} />}
        </div>
      )}
      <pre className="m-0 border-t border-[var(--color-border)] p-2 text-sm overflow-x-auto">
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  )
}

export const CodeBlockWithPreviewExtension = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView)
  },
})
