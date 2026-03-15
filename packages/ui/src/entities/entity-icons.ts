import {
  Box,
  Briefcase,
  Building2,
  CheckSquare,
  Cpu,
  Database,
  FileText,
  Flag,
  Folder,
  Globe,
  Heart,
  Layers,
  Lightbulb,
  Link,
  List,
  type LucideIcon,
  Map as MapIcon,
  MessageSquare,
  Scale,
  Settings,
  Star,
  Tag,
  Target,
  User,
  Users,
  Zap,
} from 'lucide-react'

/** Lucide icons available for entity type selection. */
export const ENTITY_TYPE_ICON_OPTIONS: Array<{ name: string; icon: LucideIcon }> = [
  { name: 'user', icon: User },
  { name: 'users', icon: Users },
  { name: 'folder', icon: Folder },
  { name: 'briefcase', icon: Briefcase },
  { name: 'building2', icon: Building2 },
  { name: 'target', icon: Target },
  { name: 'scale', icon: Scale },
  { name: 'flag', icon: Flag },
  { name: 'star', icon: Star },
  { name: 'heart', icon: Heart },
  { name: 'lightbulb', icon: Lightbulb },
  { name: 'layers', icon: Layers },
  { name: 'list', icon: List },
  { name: 'tag', icon: Tag },
  { name: 'box', icon: Box },
  { name: 'zap', icon: Zap },
  { name: 'link', icon: Link },
  { name: 'globe', icon: Globe },
  { name: 'database', icon: Database },
  { name: 'file-text', icon: FileText },
  { name: 'message-square', icon: MessageSquare },
  { name: 'check-square', icon: CheckSquare },
  { name: 'settings', icon: Settings },
  { name: 'cpu', icon: Cpu },
  { name: 'map', icon: MapIcon },
]

const ICON_BY_NAME = new Map<string, LucideIcon>(
  ENTITY_TYPE_ICON_OPTIONS.map(({ name, icon }) => [name, icon]),
)

/** Built-in slug → icon mapping so the UI never shows emojis. */
const SLUG_ICONS: Record<string, LucideIcon> = {
  person: User,
  project: Folder,
  team: Users,
  decision: Scale,
  okr: Target,
}

/** Slug → icon name for Select/IconPicker when stored icon is empty. */
const SLUG_TO_ICON_NAME: Record<string, string> = {
  person: 'user',
  project: 'folder',
  team: 'users',
  decision: 'scale',
  okr: 'target',
}

/**
 * Returns the default icon name for a built-in slug when no icon is stored.
 * Use when initializing IconPicker value for entity types that may have empty icon.
 */
export function getDefaultIconNameForSlug(slug: string): string {
  return SLUG_TO_ICON_NAME[slug] ?? 'tag'
}

/**
 * Returns the Lucide icon for an entity type.
 * Prefers the stored icon name if it resolves to a known icon,
 * then falls back to the slug map, then Tag.
 */
export function getEntityTypeIcon(slug: string, iconName?: string | null): LucideIcon {
  if (iconName) {
    const resolved = ICON_BY_NAME.get(iconName)
    if (resolved) return resolved
  }
  return SLUG_ICONS[slug] ?? Tag
}
