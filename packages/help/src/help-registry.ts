export interface HelpTopic {
  readonly title: string
  readonly titleKey: string
  readonly namespace: string
  readonly file: string
  readonly relatedTopics?: readonly string[]
}

const helpTopics = {
  'getting-started': {
    title: 'Getting Started',
    titleKey: 'help:topics.gettingStarted',
    namespace: 'help',
    file: 'getting-started',
  },
  'notes.editor': {
    title: 'Note Editor',
    titleKey: 'help:topics.notes',
    namespace: 'notes',
    file: 'notes/editor',
    relatedTopics: ['notes.mentions', 'notes.search'],
  },
  'notes.mentions': {
    title: '@Mentions',
    titleKey: 'help:topics.notes',
    namespace: 'notes',
    file: 'notes/mentions',
    relatedTopics: ['notes.editor'],
  },
  'notes.search': {
    title: 'Semantic Search',
    titleKey: 'help:topics.search',
    namespace: 'search',
    file: 'notes/search',
    relatedTopics: ['notes.editor'],
  },
  'tasks.gtd': {
    title: 'Task Management',
    titleKey: 'help:topics.tasks',
    namespace: 'tasks',
    file: 'tasks/gtd',
    relatedTopics: ['tasks.pinch'],
  },
  'tasks.pinch': {
    title: 'PINCH Scoring',
    titleKey: 'help:topics.tasks',
    namespace: 'tasks',
    file: 'tasks/pinch',
    relatedTopics: ['tasks.gtd', 'cognitive.energy'],
  },
  'cognitive.energy': {
    title: 'Energy Tracking',
    titleKey: 'help:topics.cognitive',
    namespace: 'cognitive',
    file: 'cognitive/energy',
    relatedTopics: ['cognitive.jitai'],
  },
  'cognitive.jitai': {
    title: 'Smart Nudges',
    titleKey: 'help:topics.cognitive',
    namespace: 'cognitive',
    file: 'cognitive/jitai',
    relatedTopics: ['cognitive.energy'],
  },
  'settings.ai': {
    title: 'AI Providers',
    titleKey: 'help:topics.ai',
    namespace: 'settings',
    file: 'settings/ai-providers',
  },
  'settings.calendar': {
    title: 'Calendar Sync',
    titleKey: 'help:topics.calendar',
    namespace: 'settings',
    file: 'settings/calendar-sync',
  },
  'settings.general': {
    title: 'Settings',
    titleKey: 'help:topics.settings',
    namespace: 'settings',
    file: 'settings/general',
  },
  'settings.overview': {
    title: 'Settings Overview',
    titleKey: 'help:topics.settings',
    namespace: 'settings',
    file: 'settings/overview',
    relatedTopics: ['settings.general', 'settings.ai'],
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    titleKey: 'help:topics.shortcuts',
    namespace: 'help',
    file: 'shortcuts',
  },
} as const satisfies Record<string, HelpTopic>

export type HelpTopicId = keyof typeof helpTopics

export { helpTopics }

export const ALL_TOPIC_IDS = Object.keys(helpTopics) as HelpTopicId[]

const topicMap: Record<HelpTopicId, HelpTopic> = helpTopics

function isValidTopicId(id: string): id is HelpTopicId {
  return id in helpTopics
}

export function getHelpTopic(id: HelpTopicId): HelpTopic {
  return topicMap[id]
}

export function getRelatedTopics(id: HelpTopicId): HelpTopic[] {
  const topic = topicMap[id]
  if (!topic.relatedTopics) return []
  return topic.relatedTopics.filter(isValidTopicId).map((relId) => topicMap[relId])
}

export function searchTopics(query: string): Array<{ id: HelpTopicId; topic: HelpTopic }> {
  const lower = query.toLowerCase()
  return ALL_TOPIC_IDS.filter((id) => {
    const topic = topicMap[id]
    return topic.title.toLowerCase().includes(lower) || id.toLowerCase().includes(lower)
  }).map((id) => ({ id, topic: topicMap[id] }))
}
