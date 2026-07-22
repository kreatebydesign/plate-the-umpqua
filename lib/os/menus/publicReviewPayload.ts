/**
 * Public client menu-review payload builders.
 * Never include internal notes, costs, recipe internals, IDs of other records,
 * or operational metadata beyond what the presentation requires.
 */

export type PublicMenuItem = {
  title: string
  description: string | null
  dietaryLabels: string[]
  allergenLabels: string[]
}

export type PublicMenuSection = {
  name: string
  items: PublicMenuItem[]
}

export type PublicMenuReviewPayload = {
  occasionTitle: string
  serviceDateLabel: string | null
  guestCount: number | null
  introductoryMessage: string | null
  pricingPresentation: string | null
  displayInvestment: string | null
  version: number
  status: 'pending' | 'approved' | 'revisionRequested'
  sections: PublicMenuSection[]
  brandName: string
}

const FORBIDDEN_PUBLIC_KEYS = [
  'internalNotes',
  'internalCostNotes',
  'internalPricingNotes',
  'chefNotes',
  'platingNotes',
  'storageNotes',
  'ingredients',
  'steps',
  'recipe',
  'client',
  'inquiry',
  'event',
  'reviewTokenHash',
  'reviewTokenExpiresAt',
  'reviewTokenRevokedAt',
  'reviews',
  'revisionHistory',
  'relationshipNotes',
  'internalStrategyNotes',
  'estimatedFoodCost',
  'suggestedClientPrice',
  'foodCost',
  'clientPrice',
  'estimatedProfit',
  'password',
  'hash',
  'salt',
] as const

export function assertNoSensitivePublicKeys(
  label: string,
  payload: unknown,
): void {
  const serialized = JSON.stringify(payload)
  for (const key of FORBIDDEN_PUBLIC_KEYS) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`${label}: sensitive key leaked: ${key}`)
    }
  }
}

type RawItem = {
  clientTitle?: string | null
  clientDescription?: string | null
  showDietary?: boolean | null
  dietaryDisplay?: string | null
  allergenDisplay?: string | null
  internalItemNotes?: string | null
  recipe?: unknown
}

type RawSection = {
  sectionName?: string | null
  items?: RawItem[] | null
}

type RawMenuForPublic = {
  occasionTitle?: string | null
  serviceDate?: string | null
  guestCount?: number | null
  introductoryMessage?: string | null
  pricingPresentation?: string | null
  displayInvestment?: number | null
  version?: number | null
  status?: string | null
  sections?: RawSection[] | null
}

function splitLabels(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(/[,;|/]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function formatServiceDate(value?: string | null): string | null {
  if (!value) return null
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(ms))
  } catch {
    return null
  }
}

function formatInvestment(value?: number | null): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return null
  }
}

function publicStatus(
  status?: string | null,
): PublicMenuReviewPayload['status'] {
  if (status === 'approved') return 'approved'
  if (status === 'revisionRequested') return 'revisionRequested'
  return 'pending'
}

/**
 * Strip a menu document down to client-safe presentation fields.
 */
export function buildPublicMenuReviewPayload(
  menu: RawMenuForPublic,
): PublicMenuReviewPayload {
  const sections: PublicMenuSection[] = []

  for (const section of menu.sections || []) {
    const name = section.sectionName?.trim()
    if (!name) continue

    const items: PublicMenuItem[] = []
    for (const item of section.items || []) {
      const title = item.clientTitle?.trim()
      if (!title) continue

      const showDietary = Boolean(item.showDietary)
      items.push({
        title,
        description: item.clientDescription?.trim() || null,
        dietaryLabels: showDietary ? splitLabels(item.dietaryDisplay) : [],
        allergenLabels: showDietary ? splitLabels(item.allergenDisplay) : [],
      })
    }

    if (items.length === 0) continue
    sections.push({ name, items })
  }

  return {
    occasionTitle:
      menu.occasionTitle?.trim() || 'Private dining menu',
    serviceDateLabel: formatServiceDate(menu.serviceDate),
    guestCount:
      typeof menu.guestCount === 'number' && Number.isFinite(menu.guestCount)
        ? menu.guestCount
        : null,
    introductoryMessage: menu.introductoryMessage?.trim() || null,
    pricingPresentation: menu.pricingPresentation?.trim() || null,
    displayInvestment: formatInvestment(menu.displayInvestment),
    version:
      typeof menu.version === 'number' && menu.version > 0 ? menu.version : 1,
    status: publicStatus(menu.status),
    sections,
    brandName: 'Plate The Umpqua',
  }
}

export { FORBIDDEN_PUBLIC_KEYS }
