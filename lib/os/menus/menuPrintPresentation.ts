/**
 * Plate The Umpqua OS branded menu print — client-visible projection helpers.
 * Print preview must share the same allowlist as secure client review.
 */

import {
  buildPublicMenuReviewPayload,
  type PublicMenuReviewPayload,
} from '@/lib/os/menus/publicReviewPayload'

export const MENU_PRINT_STYLES = [
  'classic',
  'event',
  'minimal',
] as const

export type MenuPrintStyle = (typeof MENU_PRINT_STYLES)[number]

export const MENU_PRINT_STYLE_LABELS: Record<MenuPrintStyle, string> = {
  classic: 'Classic Dinner',
  event: 'Private Event',
  minimal: 'Minimal Luxury',
}

export const MENU_PRINT_STYLE_HINTS: Record<MenuPrintStyle, string> = {
  classic: 'Formal editorial composition for multi-course private dinners.',
  event: 'Structured occasion hierarchy for celebrations and corporate events.',
  minimal: 'Restrained modern layout with strong typography and whitespace.',
}

export const DEFAULT_MENU_PRINT_STYLE: MenuPrintStyle = 'classic'

/** Fields intentionally rendered on the printed menu (allowlist). */
export const MENU_PRINT_FIELD_ALLOWLIST = [
  'brandName',
  'occasionTitle',
  'serviceDateLabel',
  'guestCount',
  'introductoryMessage',
  'sections',
  'sections.name',
  'sections.items.title',
  'sections.items.description',
  'sections.items.dietaryLabels',
  'sections.items.allergenLabels',
  'pricingPresentation',
  'displayInvestment',
] as const

/** Operational / public-payload keys that must never appear in print output. */
export const MENU_PRINT_EXCLUDED_RENDER_KEYS = [
  'version',
  'status',
  'internalName',
  'internalNotes',
  'internalItemNotes',
  'id',
  'clientId',
  'clientName',
  'clientEmail',
  'inquiryId',
  'eventId',
  'reviewTokenHash',
  'reviews',
  'revisionHistory',
] as const

export function isMenuPrintStyle(value: unknown): value is MenuPrintStyle {
  return (
    typeof value === 'string' &&
    (MENU_PRINT_STYLES as readonly string[]).includes(value)
  )
}

export function parseMenuPrintStyle(
  value: string | string[] | undefined | null,
): MenuPrintStyle {
  const raw = Array.isArray(value) ? value[0] : value
  if (isMenuPrintStyle(raw)) return raw
  return DEFAULT_MENU_PRINT_STYLE
}

type MenuDetailLike = {
  occasionTitle: string
  serviceDate: string | null
  guestCount: number | null
  introductoryMessage: string | null
  pricingPresentation: string | null
  displayInvestment: number | null
  version: number
  status: string
  sections: Array<{
    sectionName: string
    items: Array<{
      clientTitle: string
      clientDescription: string | null
      showDietary: boolean
      dietaryDisplay: string | null
      allergenDisplay: string | null
    }>
  }>
}

/**
 * Project a saved MenuDetail into the shared client-visible payload.
 * Identical mapping to Menu Studio preview / review presentation.
 */
export function buildMenuPrintPayload(
  menu: MenuDetailLike,
): PublicMenuReviewPayload {
  return buildPublicMenuReviewPayload({
    occasionTitle: menu.occasionTitle,
    serviceDate: menu.serviceDate,
    guestCount: menu.guestCount,
    introductoryMessage: menu.introductoryMessage,
    pricingPresentation: menu.pricingPresentation,
    displayInvestment: menu.displayInvestment,
    version: menu.version,
    status: menu.status,
    sections: menu.sections.map((section) => ({
      sectionName: section.sectionName,
      items: section.items.map((item) => ({
        clientTitle: item.clientTitle,
        clientDescription: item.clientDescription,
        showDietary: item.showDietary,
        dietaryDisplay: item.dietaryDisplay,
        allergenDisplay: item.allergenDisplay,
      })),
    })),
  })
}

export function menuPrintHasInvestment(
  menu: PublicMenuReviewPayload,
): boolean {
  return Boolean(menu.pricingPresentation || menu.displayInvestment)
}

export function menuPrintIsEmpty(menu: PublicMenuReviewPayload): boolean {
  return menu.sections.length === 0
}

/** Contact line already established elsewhere in the repository. */
export const MENU_PRINT_BRAND_FOOTER =
  'Private hospitality · Roseburg & the Umpqua Valley'

export const MENU_PRINT_WEBSITE = 'PlateTheUmpqua.com'
export const MENU_PRINT_EMAIL = 'info@platetheumpqua.com'

/** Typography wordmark only — circular logo assets remain in the repo unused here. */
export const MENU_PRINT_WORDMARK = 'Plate The Umpqua'
