/**
 * Partner Concierge physical gift certificate — design/print config only.
 * One visual system; industry variants differ by occasion language only.
 *
 * Bulk-print inventory model: cards print unassigned. The gifting
 * professional handwrites Presented To / Presented By when gifting.
 * Certificate ID is reserved for Plate The Umpqua (variable-data later).
 * No QR generation, redemption, or fulfillment logic.
 */

export type PartnerCertificateSlug =
  | 'real-estate'
  | 'medical'
  | 'legal'
  | 'builders'
  | 'sales'

export type PartnerCertificateVariant = {
  slug: PartnerCertificateSlug
  /** Main occasion headline */
  title: string
  /** Always: Private Dining Experience */
  subtitle: string
  /** Italic supporting line */
  supportingLine: string
  /** Short occasion body copy */
  occasionCopy: string
  previewLabel: string
  seoTitle: string
}

/** Shared copy for every bulk-print certificate face. */
export const CERTIFICATE_SHARED_COPY = {
  brand: 'Plate The Umpqua',
  brandTag: 'Private Dining Experiences',
  /** Handwritten by the gifting professional at presentation */
  presentedToLabel: 'Presented To',
  presentedByLabel: 'Presented By',
  includedGuestsLine1: 'Includes up to 2 adults + 3 children',
  includedGuestsLine2: 'from the household',
  guestInfoHeading: 'Guest Information',
  guestPolicyLines: [
    'Includes up to 2 adults and 3 children from the recipient household.',
    'Additional household members: $100 each, prepaid by the gifting professional.',
    'Optional guests beyond the household: $100 each.',
  ],
  redeemHeading: 'Redeem Your Experience',
  redeemSteps: [
    'Scan the code or visit the address shown.',
    'Share preferred dates and any menu notes.',
    'We coordinate your private evening.',
  ],
  scanHeading: 'Scan to Redeem',
  /**
   * Reserved for Plate-controlled unique ID (variable-data print / label).
   * Not created by the gifting professional. Not a form control.
   */
  certificateIdLabel: 'Certificate ID',
  questionsHeading: 'Questions',
  termsHeading: 'Terms',
  terms: [
    'One private dining experience within included household guest limits.',
    'Travel, alcohol, rentals, gratuity, specialty ingredients, and major customizations quoted separately when applicable.',
    'Scheduling subject to availability. Non-transferable without written confirmation.',
  ],
  contactSite: 'PlateTheUmpqua.com',
  contactEmail: 'hello@platetheumpqua.com',
  /** Shared redemption path placeholder — not certificate-specific. */
  redemptionUrlPlaceholder: 'platetheumpqua.com/experience',
} as const

export const PARTNER_CERTIFICATE_VARIANTS: Record<
  PartnerCertificateSlug,
  PartnerCertificateVariant
> = {
  'real-estate': {
    slug: 'real-estate',
    title: 'Welcome Home',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate the beginning of life in your new home.',
    previewLabel: 'Real Estate · Bulk Print Inventory',
    seoTitle: 'Welcome Home Gift Certificate | Print Preview',
  },
  builders: {
    slug: 'builders',
    title: 'Home Completion',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate the completion of your new space.',
    previewLabel: 'Builders · Bulk Print Inventory',
    seoTitle: 'Home Completion Gift Certificate | Print Preview',
  },
  medical: {
    slug: 'medical',
    title: 'With Appreciation',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate your care, dedication, and impact.',
    previewLabel: 'Medical · Bulk Print Inventory',
    seoTitle: 'Medical Appreciation Gift Certificate | Print Preview',
  },
  legal: {
    slug: 'legal',
    title: 'With Appreciation',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate partnership, trust, and results.',
    previewLabel: 'Legal · Bulk Print Inventory',
    seoTitle: 'Legal Appreciation Gift Certificate | Print Preview',
  },
  sales: {
    slug: 'sales',
    title: 'Exceptional Performance',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate outstanding performance and achievement.',
    previewLabel: 'Sales · Bulk Print Inventory',
    seoTitle: 'Sales Performance Gift Certificate | Print Preview',
  },
}

export const CERTIFICATE_PRINT = {
  widthIn: 7,
  heightIn: 5,
  label: '7″ × 5″ landscape',
  /** Minimum distance from trim for essential typography */
  safeAreaIn: 0.32,
  /** Character count (including spaces) at which headline uses the long-title print class */
  longTitleThreshold: 17,
  /** Physical width of each front handwriting line (inside ivory panel) */
  handwritingLineWidthIn: 4.75,
  /** Clear vertical lane above each writing baseline (black/blue pen) */
  handwritingLaneHeightIn: 0.34,
} as const

export function isLongCertificateTitle(title: string) {
  return title.trim().length >= CERTIFICATE_PRINT.longTitleThreshold
}

export function getPartnerCertificateVariant(
  slug: string,
): PartnerCertificateVariant | undefined {
  if (slug in PARTNER_CERTIFICATE_VARIANTS) {
    return PARTNER_CERTIFICATE_VARIANTS[slug as PartnerCertificateSlug]
  }
  return undefined
}

export const PARTNER_CERTIFICATE_SLUGS = Object.keys(
  PARTNER_CERTIFICATE_VARIANTS,
) as PartnerCertificateSlug[]
