/** Plate OS Client Menu Builder — enums, labels, bounds, allowlists */

export const MENU_PAGE_SIZE_DEFAULT = 20
export const MENU_PAGE_SIZE_MAX = 50
export const MENU_SEARCH_MAX = 80

export const MENU_STATUS_VALUES = [
  'draft',
  'readyForReview',
  'sent',
  'revisionRequested',
  'approved',
  'archived',
] as const

export type MenuStatusValue = (typeof MENU_STATUS_VALUES)[number]

export const MENU_STATUS_LABELS: Record<MenuStatusValue, string> = {
  draft: 'Draft',
  readyForReview: 'Ready for review',
  sent: 'Sent',
  revisionRequested: 'Revision requested',
  approved: 'Approved',
  archived: 'Archived',
}

export const MENU_SECTION_PRESETS = [
  'Welcome',
  'Appetizers',
  'First Course',
  'Main Course',
  'Sides',
  'Dessert',
  'Beverages',
  'Additional Services',
] as const

/** Optional section starters for new menus — names/order only. */
export const MENU_STRUCTURE_PRESETS = [
  {
    id: 'privateDinner',
    label: 'Private Dinner',
    description: 'Welcome through dessert',
    sections: ['Welcome', 'First Course', 'Main Course', 'Dessert'],
  },
  {
    id: 'cocktailReception',
    label: 'Cocktail Reception',
    description: 'Passed bites and beverages',
    sections: ['Passed Bites', 'Small Plates', 'Beverages'],
  },
  {
    id: 'celebration',
    label: 'Celebration',
    description: 'Full hospitality arc',
    sections: ['Welcome', 'Appetizers', 'Main Course', 'Sides', 'Dessert'],
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Begin with an empty structure',
    sections: [] as string[],
  },
] as const

export type MenuStructurePresetId =
  (typeof MENU_STRUCTURE_PRESETS)[number]['id']

export function isMenuStructurePresetId(
  value: string,
): value is MenuStructurePresetId {
  return MENU_STRUCTURE_PRESETS.some((preset) => preset.id === value)
}

export function menuWorkflowGuidance(status?: string | null): {
  statusLabel: string
  nextAction: string
} {
  const value = (status || 'draft') as MenuStatusValue
  const statusLabel = MENU_STATUS_LABELS[value] || status || 'Draft'

  switch (value) {
    case 'draft':
      return {
        statusLabel,
        nextAction: 'Finish composing the menu, then preview the client presentation.',
      }
    case 'readyForReview':
      return {
        statusLabel,
        nextAction: 'Create or send the secure client review link when you are ready.',
      }
    case 'sent':
      return {
        statusLabel,
        nextAction: 'Waiting for the client to approve or request revisions.',
      }
    case 'revisionRequested':
      return {
        statusLabel,
        nextAction: 'Review client feedback, revise the menu, then send an updated link.',
      }
    case 'approved':
      return {
        statusLabel,
        nextAction: 'This menu is approved. Archive it when the hospitality date is complete.',
      }
    case 'archived':
      return {
        statusLabel,
        nextAction: 'This menu is archived for reference.',
      }
    default:
      return {
        statusLabel,
        nextAction: 'Continue composing this menu.',
      }
  }
}

export const MENU_REVIEW_ACTION_VALUES = ['approve', 'requestRevision'] as const

export type MenuReviewActionValue = (typeof MENU_REVIEW_ACTION_VALUES)[number]

export type MenuListView =
  | 'all'
  | 'draft'
  | 'inReview'
  | 'approved'
  | 'archived'

export const MENU_VIEW_OPTIONS: Array<{ value: MenuListView; label: string }> = [
  { value: 'all', label: 'All menus' },
  { value: 'draft', label: 'Drafts' },
  { value: 'inReview', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
]

export type MenuSortValue = 'newest' | 'oldest' | 'serviceDate'

export const MENU_SORT_OPTIONS: Array<{ value: MenuSortValue; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'serviceDate', label: 'Service date' },
]

/** Default review-link lifetime (14 days). */
export const MENU_REVIEW_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000

/** Max reviews retained on a menu document. */
export const MENU_REVIEW_HISTORY_MAX = 40

/** Max revision snapshots retained. */
export const MENU_REVISION_HISTORY_MAX = 25

/** Fields allowed on OS menu create/update mutations. */
export const MENU_MUTATION_ALLOWLIST = [
  'internalName',
  'client',
  'inquiry',
  'event',
  'occasionTitle',
  'serviceDate',
  'guestCount',
  'introductoryMessage',
  'sections',
  'pricingPresentation',
  'displayInvestment',
  'internalNotes',
  'status',
] as const

export type MenuMutationField = (typeof MENU_MUTATION_ALLOWLIST)[number]

export function isMenuStatus(value: string): value is MenuStatusValue {
  return (MENU_STATUS_VALUES as readonly string[]).includes(value)
}

export function isMenuReviewAction(
  value: string,
): value is MenuReviewActionValue {
  return (MENU_REVIEW_ACTION_VALUES as readonly string[]).includes(value)
}

export function isMenuListView(value: string): value is MenuListView {
  return ['all', 'draft', 'inReview', 'approved', 'archived'].includes(value)
}

export function isMenuSort(value: string): value is MenuSortValue {
  return value === 'newest' || value === 'oldest' || value === 'serviceDate'
}

export function menuStatusLabel(value?: string | null) {
  if (!value) return '—'
  return MENU_STATUS_LABELS[value as MenuStatusValue] || value
}

export function clampMenuPage(raw: string | null | undefined): number {
  const n = Number.parseInt(String(raw || ''), 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, 10_000)
}

export function clampMenuLimit(raw: string | null | undefined): number {
  const n = Number.parseInt(String(raw || ''), 10)
  if (!Number.isFinite(n) || n < 1) return MENU_PAGE_SIZE_DEFAULT
  return Math.min(n, MENU_PAGE_SIZE_MAX)
}

export function normalizeMenuSearch(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().slice(0, MENU_SEARCH_MAX)
}

export function menuViewStatuses(
  view: MenuListView,
): readonly string[] | null {
  switch (view) {
    case 'draft':
      return ['draft', 'readyForReview']
    case 'inReview':
      return ['sent', 'revisionRequested']
    case 'approved':
      return ['approved']
    case 'archived':
      return ['archived']
    default:
      return null
  }
}

/** Mongo / Payload document id shape used across OS. */
export function isOsDocumentId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value)
}
