import { ChevronRight, Info, X } from 'lucide-react'
import { useMemo } from 'react'
import { getHelpContent } from './help-content.js'
import { getHelpTopic, getRelatedTopics, type HelpTopicId } from './help-registry.js'
import { useHelp } from './useHelp.js'

interface HelpPanelProps {
  locale?: string
}

export function HelpPanel({ locale = 'en' }: HelpPanelProps) {
  const { isOpen, activeTopic, closeHelp, openHelp } = useHelp()

  const topic = useMemo(() => (activeTopic ? getHelpTopic(activeTopic) : null), [activeTopic])

  const article = useMemo(
    () => (activeTopic ? getHelpContent(activeTopic, locale) : null),
    [activeTopic, locale],
  )

  const relatedEntries = useMemo(() => {
    if (!activeTopic || !topic) return []
    const topics = getRelatedTopics(activeTopic)
    const ids = (topic.relatedTopics ?? []) as HelpTopicId[]
    return ids.map((id, i) => ({ id, topic: topics[i] })).filter((e) => e.topic)
  }, [activeTopic, topic])

  if (!isOpen || !activeTopic || !topic) return null

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 flex w-[400px] flex-col overflow-hidden border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl"
      aria-label="Help panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
          {article?.title ?? topic.title}
        </h2>
        <button
          type="button"
          onClick={closeHelp}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] cursor-pointer"
          aria-label="Close help"
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {article ? (
          <div className="space-y-5">
            {/* Quick answer */}
            <p className="text-[var(--color-text-secondary)] leading-relaxed text-[14px]">
              {article.quickAnswer}
            </p>

            {/* Expandable sections */}
            <div className="space-y-1">
              {article.sections.map((section) => (
                <details key={section.heading} className="group rounded-md">
                  <summary className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface)]">
                    <ChevronRight
                      size={12}
                      strokeWidth={2}
                      className="text-[var(--color-text-muted)] transition-transform group-open:rotate-90"
                      aria-hidden="true"
                    />
                    {section.heading}
                  </summary>
                  <div className="ml-5 mt-1 mb-2 border-l-2 border-[var(--color-border)] pl-3">
                    <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                      {section.content}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            {/* ADHD Tip */}
            {article.adhdTip && (
              <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-muted)] p-4">
                <div className="flex items-start gap-2">
                  <Info
                    size={16}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                      ADHD Tip
                    </span>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-primary)]">
                      {article.adhdTip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[var(--color-text-muted)] text-[14px]">
              No help content available for this topic.
            </p>
          </div>
        )}

        {/* Related topics */}
        {relatedEntries.length > 0 && (
          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Related topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => openHelp(entry.id)}
                  className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
                >
                  {entry.topic?.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
