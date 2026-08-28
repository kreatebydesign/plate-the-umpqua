/**
 * Public Partner Concierge pricing — single experiences and prepaid professional packs.
 * Single source of truth for marketing pages, inquiry flows, and structured data.
 */

export type ExperienceTier = {
  title: string
  price: string
  desc: string
  features: string[]
}

export type PrepaidPartnerPackage = {
  title: string
  tableCount: number
  price: string
  priceCents: number
  perExperiencePrice: string
  savingsLabel: string | null
  inquiryPackageValue: string
  inquiryBudgetValue: string
  desc: string
  features: string[]
}

/** Household guest rules for every Partner Concierge experience. */
export const PARTNER_GUEST_RULES = {
  includedAdults: 2,
  includedChildren: 3,
  includedSummary: "up to 2 adults + 3 children from the recipient household",
  additionalPersonPrice: "$100",
  additionalPersonPriceCents: 10000,
  additionalHouseholdNote:
    "Additional household members are $100 per person and should be prepaid by the gifting professional.",
  optionalGuestNote:
    "If the recipient later invites optional guests beyond their household, those guests are $100 per person.",
  prepaidFraming:
    "The professional gifts a fully prepaid household experience within the included limits — the recipient should never feel like they received a partially paid gift.",
} as const

/** Individual private dining tiers — standard per-experience pricing. */
export const EXPERIENCE_TIERS: ExperienceTier[] = [
  {
    title: "Signature Dinner",
    price: "Starting at $425",
    desc: "An intimate chef-led dinner for the recipient household — ideal for closing gifts, referral thank-yous, and one-to-one professional appreciation.",
    features: [
      "In-home or private venue service",
      "Seasonal multi-course menu",
      "Up to 2 adults + 3 children included",
      "Gift-ready presentation",
    ],
  },
  {
    title: "Estate Experience",
    price: "Starting at $750–$1,500",
    desc: "Elevated hospitality at estates, private residences, and retreat properties — built for hosts who need the evening handled beautifully.",
    features: [
      "Estate or private residence setting",
      "Extended coursed dining",
      "Wine and pacing guidance",
      "Full service coordination",
    ],
  },
  {
    title: "Wine Country Experience",
    price: "Starting at $1,200–$2,500",
    desc: "A curated Umpqua Valley evening shaped around vineyard settings, regional wine, and the rhythm of wine country hospitality.",
    features: [
      "Vineyard or wine country venue",
      "Wine-focused menu pacing",
      "Regional sourcing emphasis",
      "Guest experience curation",
    ],
  },
  {
    title: "Executive Concierge Experience",
    price: "Starting at $2,000+",
    desc: "The full Partner Concierge layer — priority access, white-glove coordination, and hospitality designed for high-value professional relationships.",
    features: [
      "Priority scheduling access",
      "White-glove coordination",
      "Custom occasion design",
      "Ongoing partner relationship",
    ],
  },
]

/**
 * Partner gifting packages — prepaid professional offerings.
 * Single Experience + volume packs for relationship-driven industries.
 */
export const PREPAID_PARTNER_PACKAGES: PrepaidPartnerPackage[] = [
  {
    title: "Single Experience",
    tableCount: 1,
    price: "$425",
    priceCents: 42500,
    perExperiencePrice: "$425",
    savingsLabel: null,
    inquiryPackageValue: "Single Experience",
    inquiryBudgetValue: "partner-425",
    desc: "One fully prepaid private dining experience for a recipient household — presented by you, executed by Plate The Umpqua.",
    features: [
      "One prepaid chef-led experience",
      "Up to 2 adults + 3 children included",
      "Fully prepaid within household limits",
      "Concierge coordination for the occasion",
    ],
  },
  {
    title: "Professional 5-Pack",
    tableCount: 5,
    price: "$1,750",
    priceCents: 175000,
    perExperiencePrice: "$350",
    savingsLabel: "Save $375",
    inquiryPackageValue: "Professional 5-Pack",
    inquiryBudgetValue: "partner-1750",
    desc: "Five prepaid private dining experiences at preferred partner pricing — for professionals who gift relationship hospitality throughout the year.",
    features: [
      "Five prepaid experiences at $350 each",
      "Up to 2 adults + 3 children per experience",
      "Priority scheduling for partner bookings",
      "Fully prepaid household experiences within included limits",
    ],
  },
  {
    title: "Professional 10-Pack",
    tableCount: 10,
    price: "$3,400",
    priceCents: 340000,
    perExperiencePrice: "$340",
    savingsLabel: "Save $850",
    inquiryPackageValue: "Professional 10-Pack",
    inquiryBudgetValue: "partner-3400",
    desc: "Ten prepaid private dining experiences for teams and practices that need a reserved hospitality layer across closings, milestones, and recognition moments.",
    features: [
      "Ten prepaid experiences at $340 each",
      "Up to 2 adults + 3 children per experience",
      "Priority scheduling and partner coordination",
      "Reserved capacity for high-value relationships",
    ],
  },
]

export const PREPAID_PARTNER_QUALIFIED_INDUSTRIES = [
  "Real estate agents & brokerages",
  "Doctors & medical practices",
  "Attorneys & law firms",
  "Builders, contractors & remodelers",
  "Sales professionals & sales teams",
  "Financial advisors & wealth managers",
  "Insurance agencies",
  "Business owners & executive teams",
] as const

export const PREPAID_PARTNER_COMMITMENT_POINTS = [
  "Purchased and paid upfront before experiences are scheduled",
  "Each experience includes up to 2 adults + 3 children from the recipient household",
  "Additional household members are $100 per person and should be prepaid by the gifting professional",
  "Optional guests beyond the household are $100 per person — so the recipient never feels the gift was partially paid",
  "Designed for client appreciation, closing gifts, referral thank-yous, staff recognition, and professional relationship-building",
  "Travel beyond the standard service radius, alcohol, rentals, gratuity, specialty ingredients, and major customizations are quoted separately",
  "Availability is limited — partner packages are offered selectively, not as public dining",
] as const

export const PARTNER_INQUIRY_HREF = "/inquiry?source=partner-concierge"

export type PartnerPackageId = "single" | "five-pack" | "ten-pack"

export const PARTNER_PACKAGE_ID_BY_TITLE: Record<string, PartnerPackageId> = {
  "Single Experience": "single",
  "Professional 5-Pack": "five-pack",
  "Professional 10-Pack": "ten-pack",
}

export function partnerPackageIdForTitle(title: string): PartnerPackageId | null {
  return PARTNER_PACKAGE_ID_BY_TITLE[title] ?? null
}

export function partnerPackagePurchaseHref(
  packageId: PartnerPackageId,
  industrySlug?: string,
) {
  const params = new URLSearchParams({ package: packageId })
  if (industrySlug) {
    params.set("industry", industrySlug)
  }
  return `/partner-concierge/purchase?${params.toString()}`
}

export function partnerPackageInquiryHref(
  packageValue: string,
  industrySlug?: string,
) {
  const params = new URLSearchParams({
    source: "partner-concierge",
    package: packageValue,
  })
  if (industrySlug) {
    params.set("industry", industrySlug)
  }
  return `/inquiry?${params.toString()}`
}
