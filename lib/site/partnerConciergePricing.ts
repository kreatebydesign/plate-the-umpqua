/**
 * Public Partner Concierge pricing — individual experience tiers and prepaid bulk packages.
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
  inquiryPackageValue: string
  inquiryBudgetValue: string
  desc: string
  features: string[]
}

/** Individual private dining tiers — standard per-experience pricing. */
export const EXPERIENCE_TIERS: ExperienceTier[] = [
  {
    title: "Signature Dinner",
    price: "Starting at $425",
    desc: "An intimate chef-led dinner for two to six guests — ideal for closing gifts, referral thank-yous, and one-to-one client appreciation.",
    features: [
      "In-home or private venue service",
      "Seasonal multi-course menu",
      "Concierge coordination",
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

/** Limited prepaid bulk packages for qualified professional partners. */
export const PREPAID_PARTNER_PACKAGES: PrepaidPartnerPackage[] = [
  {
    title: "Realtor Concierge",
    tableCount: 5,
    price: "$1,500",
    priceCents: 150000,
    inquiryPackageValue: "Realtor Concierge",
    inquiryBudgetValue: "partner-1500",
    desc: "A prepaid five-table partner package for professionals who want closing gifts, referral thank-yous, and client appreciation handled with one upfront volume commitment.",
    features: [
      "Five prepaid private table experiences",
      "Priority scheduling for partner bookings",
      "Defined guest limits and service parameters",
      "Concierge coordination for each occasion",
    ],
  },
  {
    title: "Preferred Access",
    tableCount: 10,
    price: "$2,800",
    priceCents: 280000,
    inquiryPackageValue: "Preferred Access",
    inquiryBudgetValue: "partner-2800",
    desc: "A prepaid ten-table partner package for teams and practices that need a reserved hospitality layer — client appreciation, staff recognition, and relationship-building across the year.",
    features: [
      "Ten prepaid private table experiences",
      "Priority scheduling and partner coordination",
      "Defined guest limits and service parameters",
      "Reserved capacity for high-value relationships",
    ],
  },
]

export const PREPAID_PARTNER_QUALIFIED_INDUSTRIES = [
  "Realtors & luxury real estate teams",
  "Financial advisors & wealth managers",
  "Doctors, dentists & medical practices",
  "Attorneys & legal practices",
  "CPAs & accounting firms",
  "Insurance agencies",
  "Wineries & estate partners",
  "Business owners & executive teams",
] as const

export const PREPAID_PARTNER_COMMITMENT_POINTS = [
  "Purchased and paid upfront before experiences are scheduled",
  "Designed for client appreciation, closing gifts, referral thank-yous, staff recognition, and professional relationship-building",
  "Priority scheduling within defined partner parameters",
  "Clear guest limits and service scope for each prepaid table",
  "Travel beyond the standard service radius, alcohol, rentals, gratuity, specialty ingredients, and major customizations are quoted separately",
  "Availability is limited — partner packages are offered selectively, not as public dining",
] as const

export const PARTNER_INQUIRY_HREF = "/inquiry?source=partner-concierge"

export function partnerPackageInquiryHref(packageValue: string) {
  const params = new URLSearchParams({
    source: "partner-concierge",
    package: packageValue,
  })
  return `/inquiry?${params.toString()}`
}
