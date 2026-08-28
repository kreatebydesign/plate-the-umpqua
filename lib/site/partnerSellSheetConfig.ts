/**
 * Partner Concierge B2B sell-sheet content — print collateral only.
 * One shared design system; industry variants differ by copy and photography.
 * Pricing imported from partnerConciergePricing at render time.
 */

import type { PartnerCertificateSlug } from '@/lib/site/partnerCertificateConfig'

export type PartnerSellSheetSlug =
  | 'real-estate'
  | 'builders'
  | 'medical'
  | 'legal'
  | 'sales'

export type PartnerSellSheetStep = {
  title: string
  desc: string
}

export type PartnerSellSheetVariant = {
  slug: PartnerSellSheetSlug
  certificateSlug: PartnerCertificateSlug
  previewLabel: string
  seoTitle: string
  eyebrow: string
  headline: string
  supporting: string
  storyLead: string
  /** Authentic repo photography — industry communicated through copy */
  heroImage: string
  heroImageAlt: string
  detailImage: string
  detailImageAlt: string
  presentStepDesc: string
  whyHeadline: string
  whyLead: string
  whyPoints: string[]
  benefits: string[]
  ctaHeadline: string
  ctaLabel: string
  ctaPath: string
}

export const SELL_SHEET_SHARED = {
  brand: 'Plate The Umpqua',
  brandTag: 'Partner Concierge',
  programLine: 'Private Dining Gifting Program',
  contactSite: 'PlateTheUmpqua.com',
  contactEmail: 'hello@platetheumpqua.com',
  stepsEyebrow: 'How It Works',
  packagesEyebrow: 'Partner Packages',
  inclusionLine1: 'Each experience includes up to',
  inclusionLine2: '2 adults + 3 children',
  inclusionLine3: 'from the recipient household',
  additionalGuestNote:
    'Additional household members: $100 per person, prepaid by the gifting professional.',
  certificateCaption: 'What Your Client Receives',
  benefitsEyebrow: 'Why It Matters',
} as const

export const SELL_SHEET_STEPS: PartnerSellSheetStep[] = [
  {
    title: 'Purchase',
    desc: 'Choose a Single, 5-Pack, or 10-Pack.',
  },
  {
    title: 'Present',
    desc: '', // filled per industry via presentStepDesc on step 2
  },
  {
    title: 'We Handle the Rest',
    desc: 'Your client connects with Plate The Umpqua to arrange their private dining experience.',
  },
]

export const SELL_SHEET_PRINT = {
  widthIn: 8.5,
  heightIn: 11,
  label: '8.5″ × 11″ portrait',
  safeAreaIn: 0.32,
} as const

export const PARTNER_SELL_SHEET_VARIANTS: Record<
  PartnerSellSheetSlug,
  PartnerSellSheetVariant
> = {
  'real-estate': {
    slug: 'real-estate',
    certificateSlug: 'real-estate',
    previewLabel: 'Real Estate · Sell Sheet',
    seoTitle: 'Realtor Partner Concierge Sell Sheet | Print Preview',
    eyebrow: 'Realtor Closing Gifts',
    headline: "A CLOSING GIFT THEY'LL ACTUALLY REMEMBER.",
    supporting:
      'Turn the moment they receive the keys into an experience they will remember long after closing.',
    storyLead:
      'Plate The Umpqua gives real estate professionals a more personal way to thank their clients: a private dining experience prepared in the client\'s new home. You purchase the experience. At closing, you personally present a premium Welcome Home certificate. Your client redeems when ready — we handle the evening.',
    heroImage: '/content/images/umpqua-private-dining33.jpg',
    heroImageAlt: 'Private chef dining in a residential setting',
    detailImage: '/content/images/umpqua-private-dining10.jpg',
    detailImageAlt: 'Plated cuisine from a private dining experience',
    presentStepDesc:
      'Personally give your client their Welcome Home certificate at closing.',
    whyHeadline: 'Closing gifts get forgotten. Experiences do not.',
    whyLead:
      'This is not another bottle of wine, gift basket, or generic gift card. You are creating a final memorable touchpoint after one of the largest purchases of your client\'s life.',
    whyPoints: [
      'Memorable closing experience',
      'Personal relationship building',
      'Client appreciation',
      'Premium differentiation',
      'A reason clients remember who helped them buy their home',
    ],
    benefits: [
      'Memorable closing experience',
      'Stronger client relationships',
      'Premium differentiation',
    ],
    ctaHeadline: 'MAKE YOUR NEXT CLOSING UNFORGETTABLE.',
    ctaLabel: 'Explore Partner Concierge',
    ctaPath: '/partner-concierge/real-estate',
  },
  builders: {
    slug: 'builders',
    certificateSlug: 'builders',
    previewLabel: 'Builders · Sell Sheet',
    seoTitle: 'Builder Partner Concierge Sell Sheet | Print Preview',
    eyebrow: 'Builder & Contractor Gifts',
    headline: 'THE PROJECT IS COMPLETE. THE EXPERIENCE DOESN\'T HAVE TO END THERE.',
    supporting:
      'After handing over a completed home, remodel, or major project, present a private dining experience in the space they just finished.',
    storyLead:
      'Custom builders, remodelers, and premium trades use Partner Concierge to mark project completion with hospitality — not another branded item left on the counter. You purchase the experience and present the certificate at handoff. Plate The Umpqua executes the chef-led evening when your client is ready.',
    heroImage: '/content/images/umpqua-private-dining12.jpg',
    heroImageAlt: 'Private dining in a completed residential space',
    detailImage: '/content/images/umpqua-private-dining25.jpg',
    detailImageAlt: 'Chef-led private dining hospitality',
    presentStepDesc:
      'Present your client their Home Completion certificate at project handoff.',
    whyHeadline: 'The handoff is a relationship moment.',
    whyLead:
      'When the punch list is done, the gesture you leave behind determines whether they remember who built it — and who to recommend.',
    whyPoints: [
      'Project-completion appreciation',
      'Client relationship retention',
      'Premium differentiation among trades',
      'A memorable final touchpoint',
    ],
    benefits: [
      'Project-completion appreciation',
      'Stronger client relationships',
      'Premium differentiation',
    ],
    ctaHeadline: 'MAKE YOUR NEXT HANDOFF UNFORGETTABLE.',
    ctaLabel: 'Explore Partner Concierge',
    ctaPath: '/partner-concierge/builders',
  },
  medical: {
    slug: 'medical',
    certificateSlug: 'medical',
    previewLabel: 'Medical · Sell Sheet',
    seoTitle: 'Medical Partner Concierge Sell Sheet | Print Preview',
    eyebrow: 'Medical Practice Hospitality',
    headline: 'RECOGNITION THAT FEELS LIKE CARE — NOT A CATALOG GIFT.',
    supporting:
      'Physician partner appreciation, referral thank-yous, staff recognition, and leadership milestones — chef-led hospitality for the people who carry your practice forward.',
    storyLead:
      'This program is not designed for gifting patients dinner. It is built for professional relationships inside and around a medical practice. Purchase prepaid experiences and present certificates when the moment calls for gratitude that feels personal and equal to the trust those relationships carry.',
    heroImage: '/content/images/umpqua-private-dining22.jpg',
    heroImageAlt: 'Intimate private dining table setting',
    detailImage: '/content/images/umpqua-private-dining14.jpg',
    detailImageAlt: 'Plated private dining course',
    presentStepDesc:
      'Personally present a With Appreciation certificate to the partner, team member, or colleague you wish to honor.',
    whyHeadline: 'Gratitude without performance.',
    whyLead:
      'Recognition that feels discreet, considered, and worthy of the relationships that keep a practice strong.',
    whyPoints: [
      'Physician partner appreciation',
      'Staff and leadership recognition',
      'Referral-partner thank-yous',
      'Milestone and achievement hospitality',
    ],
    benefits: [
      'Partner and staff appreciation',
      'Referral relationship building',
      'Discreet milestone recognition',
    ],
    ctaHeadline: 'ELEVATE HOW YOUR PRACTICE SHOWS APPRECIATION.',
    ctaLabel: 'Explore Partner Concierge',
    ctaPath: '/partner-concierge/medical',
  },
  legal: {
    slug: 'legal',
    certificateSlug: 'legal',
    previewLabel: 'Legal · Sell Sheet',
    seoTitle: 'Legal Partner Concierge Sell Sheet | Print Preview',
    eyebrow: 'Law Firm Hospitality',
    headline: 'CLIENT APPRECIATION WITH THE GRAVITY THE RELATIONSHIP DESERVES.',
    supporting:
      'Referral thank-yous, partner recognition, staff milestones, and matter-completion hospitality — private dining for firms that understand how trust is built.',
    storyLead:
      'Law firm relationships run on discretion, outcomes, and trust. A private chef dinner marks those moments without the emptiness of generic corporate gifts. You purchase prepaid access and control how recognition is delivered. Plate The Umpqua coordinates the dining experience when the recipient is ready.',
    heroImage: '/content/images/umpqua-private-dining18.jpg',
    heroImageAlt: 'Private dining hospitality setting',
    detailImage: '/content/images/umpqua-private-dining16.jpg',
    detailImageAlt: 'Chef-prepared private dining course',
    presentStepDesc:
      'Personally present a With Appreciation certificate to the client, partner, or colleague you wish to honor.',
    whyHeadline: 'A table that signals how carefully you handle relationships.',
    whyLead:
      'Whether thanking a referral source, recognizing a partner, or marking a major matter — hospitality that feels considered, not promotional.',
    whyPoints: [
      'Client appreciation where appropriate',
      'Referral and partner recognition',
      'Staff and milestone hospitality',
      'Discretion equal to the relationship',
    ],
    benefits: [
      'Client and referral appreciation',
      'Partner recognition',
      'Professional discretion',
    ],
    ctaHeadline: 'ELEVATE FIRM HOSPITALITY.',
    ctaLabel: 'Explore Partner Concierge',
    ctaPath: '/partner-concierge/legal',
  },
  sales: {
    slug: 'sales',
    certificateSlug: 'sales',
    previewLabel: 'Sales · Sell Sheet',
    seoTitle: 'Sales Partner Concierge Sell Sheet | Print Preview',
    eyebrow: 'Sales & Performance Recognition',
    headline: 'RECOGNIZE TOP PERFORMERS WITH AN EVENING — NOT ANOTHER PLAQUE.',
    supporting:
      'Sales contests, major account wins, and leadership recognition — private dining hospitality for performance-driven organizations.',
    storyLead:
      'From automotive and insurance to solar, home improvement, luxury retail, and B2B — Partner Concierge gives leaders a premium way to celebrate top performers and major wins. Purchase prepaid packs, present certificates when the moment lands, and let Plate The Umpqua deliver the evening.',
    heroImage: '/content/images/umpqua-private-dining6.jpg',
    heroImageAlt: 'Private chef dining experience',
    detailImage: '/content/images/umpqua-private-dining29.jpg',
    detailImageAlt: 'Plated cuisine at a private table',
    presentStepDesc:
      'Personally present an Exceptional Performance certificate to your top performer or team member.',
    whyHeadline: 'Recognition that feels earned.',
    whyLead:
      'Elevate monthly, quarterly, and annual awards beyond another certificate on the wall — hospitality that matches the standard you set for the team.',
    whyPoints: [
      'Top performer recognition',
      'Major account wins',
      'Sales contests and team achievement',
      'Leadership and manager appreciation',
    ],
    benefits: [
      'Top performer recognition',
      'Contest and win celebration',
      'Leadership appreciation',
    ],
    ctaHeadline: 'RAISE THE STANDARD OF SALES RECOGNITION.',
    ctaLabel: 'Explore Partner Concierge',
    ctaPath: '/partner-concierge/sales',
  },
}

export function getPartnerSellSheetVariant(
  slug: string,
): PartnerSellSheetVariant | undefined {
  if (slug in PARTNER_SELL_SHEET_VARIANTS) {
    return PARTNER_SELL_SHEET_VARIANTS[slug as PartnerSellSheetSlug]
  }
  return undefined
}

export const PARTNER_SELL_SHEET_SLUGS = Object.keys(
  PARTNER_SELL_SHEET_VARIANTS,
) as PartnerSellSheetSlug[]
