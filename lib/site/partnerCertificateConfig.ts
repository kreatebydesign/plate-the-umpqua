/**
 * Partner Concierge physical gift certificate — design/print config only.
 * One visual system; industry variants differ by occasion language only.
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

export type PartnerCertificateSampleData = {
  certificateNumber: string
  presentedByName: string
  presentedByCompany: string
  /** Leave empty / omit when certificate is unassigned */
  recipientName?: string
  /** Future: bound QR target. Design uses a visual placeholder only. */
  redemptionUrlPlaceholder: string
}

/** Shared copy for every certificate face. */
export const CERTIFICATE_SHARED_COPY = {
  brand: 'Plate The Umpqua',
  brandTag: 'Private Dining Experiences',
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
  questionsHeading: 'Questions',
  termsHeading: 'Terms',
  terms: [
    'One private dining experience within included household guest limits.',
    'Travel, alcohol, rentals, gratuity, specialty ingredients, and major customizations quoted separately when applicable.',
    'Scheduling subject to availability. Non-transferable without written confirmation.',
  ],
  contactSite: 'PlateTheUmpqua.com',
  contactEmail: 'hello@platetheumpqua.com',
  presentedLabel: 'Presented By',
  recipientLabel: 'Prepared For',
  certificateLabel: 'Certificate',
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
    previewLabel: 'Real Estate · Closing Gift',
    seoTitle: 'Welcome Home Gift Certificate | Print Preview',
  },
  builders: {
    slug: 'builders',
    title: 'Home Completion',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate the completion of your new space.',
    previewLabel: 'Builders · Completion Gift',
    seoTitle: 'Home Completion Gift Certificate | Print Preview',
  },
  medical: {
    slug: 'medical',
    title: 'With Appreciation',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate your care, dedication, and impact.',
    previewLabel: 'Medical · Appreciation Gift',
    seoTitle: 'Medical Appreciation Gift Certificate | Print Preview',
  },
  legal: {
    slug: 'legal',
    title: 'With Appreciation',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate partnership, trust, and results.',
    previewLabel: 'Legal · Appreciation Gift',
    seoTitle: 'Legal Appreciation Gift Certificate | Print Preview',
  },
  sales: {
    slug: 'sales',
    title: 'Exceptional Performance',
    subtitle: 'Private Dining Experience',
    supportingLine: 'An evening at home, prepared for you.',
    occasionCopy:
      'Presented to celebrate outstanding performance and achievement.',
    previewLabel: 'Sales · Performance Gift',
    seoTitle: 'Sales Performance Gift Certificate | Print Preview',
  },
}

/** Tasteful sample data for design QA only — not production issuance. */
export const CERTIFICATE_SAMPLE_DATA: PartnerCertificateSampleData = {
  certificateNumber: 'PTU-WH-000184',
  presentedByName: 'Jane Smith',
  presentedByCompany: 'Premier Realty Group',
  recipientName: 'The Williams Family',
  // Future QR binding target — visual placeholder only in this design pass.
  redemptionUrlPlaceholder: 'platetheumpqua.com/experience',
}

export const CERTIFICATE_PRINT = {
  widthIn: 7,
  heightIn: 5,
  label: '7″ × 5″ landscape',
  /** Minimum distance from trim for essential typography */
  safeAreaIn: 0.25,
  /** Character count (including spaces) at which headline uses the long-title print class */
  longTitleThreshold: 17,
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
