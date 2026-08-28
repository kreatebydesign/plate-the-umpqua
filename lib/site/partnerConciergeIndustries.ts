/**
 * Industry-specific Partner Concierge landing content.
 * Shared template consumes this config — keep pages thin.
 */

import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

export type PartnerIndustrySlug =
  | "real-estate"
  | "medical"
  | "legal"
  | "builders"
  | "sales"

export type PartnerIndustryFaq = {
  question: string
  answer: string
}

export type PartnerIndustryUseCase = {
  title: string
  desc: string
}

export type PartnerIndustryConfig = {
  slug: PartnerIndustrySlug
  href: string
  navLabel: string
  eyebrow: string
  headline: string
  supporting: string
  heroImage: string
  heroImageAlt: string
  primaryCta: string
  secondaryCta: string
  featured?: boolean
  featuredLabel?: string
  cardSummary: string
  conceptEyebrow: string
  conceptHeadline: string
  conceptBody: string[]
  useCasesEyebrow: string
  useCasesHeadline: string
  useCases: PartnerIndustryUseCase[]
  howItWorksHeadline: string
  howItWorks: { num: string; title: string; desc: string }[]
  faqs: PartnerIndustryFaq[]
  finalHeadline: string
  finalSupporting: string
  seo: {
    title: string
    description: string
  }
}

export const PARTNER_INDUSTRIES: PartnerIndustryConfig[] = [
  {
    slug: "real-estate",
    href: "/partner-concierge/real-estate",
    navLabel: "Real Estate",
    eyebrow: "Realtor Closing Gifts",
    headline: "A closing gift they'll actually remember.",
    supporting:
      "Turn every closing into a Welcome Home experience — a premium private dining gift you personally present to the homeowner, not another basket left on the counter.",
    heroImage: "/content/images/umpqua-private-dining33.jpg",
    heroImageAlt: "Private dining closing gift for real estate clients",
    primaryCta: "Request Realtor Partner Access",
    secondaryCta: "View Partner Packages",
    featured: true,
    featuredLabel: "Most popular",
    cardSummary:
      "Luxury closing gifts and Welcome Home private dining — presented by you at closing.",
    conceptEyebrow: "You Own The Gifting Moment",
    conceptHeadline: "You present the gift. We handle the evening.",
    conceptBody: [
      "You purchase a premium private dining experience and personally present the physical gift certificate to the homeowner at closing. Plate The Umpqua does not send the gift for you — the Realtor owns that moment.",
      "The homeowner later redeems a chef-led Welcome Home experience in their own kitchen. You get credit for a gesture that builds retention, referrals, and a reputation for taste.",
      "Gift baskets, wine, and hardware-store cards disappear into the noise of moving week. A private chef dinner becomes the story they tell their friends.",
    ],
    useCasesEyebrow: "When Realtors Use It",
    useCasesHeadline: "Luxury closing gifts that earn the referral.",
    useCases: [
      {
        title: "Closing gifts",
        desc: "Present a Welcome Home certificate at the table when keys change hands — a gesture that feels personal, elevated, and entirely yours.",
      },
      {
        title: "Client retention",
        desc: "Stay top-of-mind long after the transaction with an evening that reinforces trust and the quality of your representation.",
      },
      {
        title: "Referral relationships",
        desc: "Thank the people who send you business with hospitality worth talking about — not branded merchandise.",
      },
      {
        title: "Post-closing experience",
        desc: "Give new homeowners a memorable first dinner in their home — paced, chef-led, and free of the logistics they would rather not manage.",
      },
      {
        title: "Luxury alternative",
        desc: "A better answer than gift baskets, bottle drops, or store cards — hospitality that signals discernment.",
      },
      {
        title: "Team & brokerage programs",
        desc: "Equip your agents with prepaid 5-packs and 10-packs so every closing can carry the same standard of care.",
      },
    ],
    howItWorksHeadline: "From closing table to Welcome Home evening.",
    howItWorks: [
      {
        num: "01",
        title: "You purchase the experience",
        desc: "Choose a Single Experience, Professional 5-Pack, or Professional 10-Pack — prepaid, with clear household guest limits.",
      },
      {
        num: "02",
        title: "You present the certificate",
        desc: "At closing, you hand the homeowner a luxury physical gift certificate. The moment belongs to you.",
      },
      {
        num: "03",
        title: "They redeem when ready",
        desc: "The homeowner schedules a Welcome Home private dining experience. Menu, date, and details are coordinated with Plate The Umpqua.",
      },
      {
        num: "04",
        title: "The evening lands",
        desc: "A chef-led dinner in their home — fully prepaid within included household limits — and a memory tied back to you.",
      },
    ],
    faqs: [
      {
        question: "Who presents the gift?",
        answer:
          "You do. The Realtor purchases the experience and personally presents the physical certificate at closing. Plate The Umpqua handles the dining experience after redemption — not the initial gifting moment.",
      },
      {
        question: "Who is included in each experience?",
        answer:
          "Each experience includes up to 2 adults and 3 children from the recipient household. Additional household members are $100 per person and should be prepaid by you so the gift feels complete.",
      },
      {
        question: "What if they invite friends later?",
        answer:
          "Optional guests beyond the household are $100 per person. That keeps the gifted household experience fully prepaid within the included limits — the recipient should never feel the gift was only partially covered.",
      },
    ],
    finalHeadline: "Ready to turn closings into Welcome Home moments?",
    finalSupporting:
      "Partner packages are reviewed around volume, timing, and service area. Request access and we will shape a Realtor Concierge program around your book of business.",
    seo: {
      title: "Realtor Closing Gifts | Partner Concierge",
      description:
        "Luxury realtor closing gifts and Welcome Home private dining for Roseburg and the Umpqua Valley. Present a chef-led experience at closing — a memorable alternative to gift baskets.",
    },
  },
  {
    slug: "medical",
    href: "/partner-concierge/medical",
    navLabel: "Medical",
    eyebrow: "Medical Practice Hospitality",
    headline: "Recognition that feels like care — not a catalog gift.",
    supporting:
      "Physician partner appreciation, staff recognition, and referral thank-yous — chef-led hospitality for the people who carry your practice forward.",
    heroImage: "/content/images/umpqua-private-dining22.jpg",
    heroImageAlt: "Private dining for medical practice appreciation",
    primaryCta: "Request Medical Partner Access",
    secondaryCta: "View Partner Packages",
    cardSummary:
      "Physician partner appreciation, staff recognition, and referral thank-yous — not patient gifting.",
    conceptEyebrow: "Built For Practices",
    conceptHeadline: "Honor the relationships that keep a practice strong.",
    conceptBody: [
      "This program is not designed for gifting patients dinner. It is built for the professional relationships inside and around a medical practice — partners, referring clinicians, leadership, and the teams who deliver care every day.",
      "A private chef experience says gratitude without performance. It creates space for recognition that feels personal, discreet, and equal to the trust those relationships carry.",
    ],
    useCasesEyebrow: "When Practices Use It",
    useCasesHeadline: "Appreciation for partners, teams, and milestones.",
    useCases: [
      {
        title: "Physician partner appreciation",
        desc: "Recognize colleagues and practice partners with hospitality that respects their time and the weight of their work.",
      },
      {
        title: "Staff recognition",
        desc: "Thank nurses, administrators, and clinical teams with an evening designed around presence — not a plaque in the break room.",
      },
      {
        title: "Referral-partner thank-you",
        desc: "Acknowledge referring physicians and specialists with a gesture that strengthens professional trust.",
      },
      {
        title: "Practice milestones",
        desc: "Mark anniversaries, expansions, and achievements with a private table that feels considered.",
      },
      {
        title: "Leadership recognition",
        desc: "Honor medical directors, partners, and department leads with white-glove hospitality.",
      },
      {
        title: "Retirement & achievement gifts",
        desc: "Celebrate careers and accomplishments with an experience people remember longer than any engraved award.",
      },
    ],
    howItWorksHeadline: "From practice decision to a handled evening.",
    howItWorks: [
      {
        num: "01",
        title: "Choose the occasion",
        desc: "Partner appreciation, staff recognition, referral thank-you, or a milestone — we shape the experience around your intent.",
      },
      {
        num: "02",
        title: "Purchase prepaid access",
        desc: "Single Experience, Professional 5-Pack, or Professional 10-Pack — with clear household guest parameters.",
      },
      {
        num: "03",
        title: "Present or assign the gift",
        desc: "You control how recognition is delivered. Plate The Umpqua coordinates the dining experience once the recipient is ready.",
      },
      {
        num: "04",
        title: "We execute quietly",
        desc: "Chef-led hospitality, fully prepaid within included limits — so the focus stays on gratitude, not logistics.",
      },
    ],
    faqs: [
      {
        question: "Is this for gifting patients?",
        answer:
          "No. Partner Concierge for medical practices is designed for physician partners, staff, referral sources, leadership, and professional milestones — not patient entertainment.",
      },
      {
        question: "What does each experience include?",
        answer:
          "Up to 2 adults and 3 children from the recipient household. Additional household members are $100 per person and should be prepaid by the practice so the gift feels complete.",
      },
    ],
    finalHeadline: "Ready to elevate how your practice shows appreciation?",
    finalSupporting:
      "Tell us about your practice, the relationships you want to honor, and the volume of experiences you need. We will follow up directly.",
    seo: {
      title: "Medical Practice Appreciation Gifts | Partner Concierge",
      description:
        "Chef-led private dining for physician partner appreciation, staff recognition, and referral thank-yous across Roseburg and the Umpqua Valley.",
    },
  },
  {
    slug: "legal",
    href: "/partner-concierge/legal",
    navLabel: "Legal",
    eyebrow: "Law Firm Hospitality",
    headline: "Client appreciation with the gravity the relationship deserves.",
    supporting:
      "Referral thank-yous, partner recognition, and matter-completion gifts — private dining hospitality for firms that understand how trust is built.",
    heroImage: "/content/images/umpqua-private-dining18.jpg",
    heroImageAlt: "Private dining for law firm client appreciation",
    primaryCta: "Request Legal Partner Access",
    secondaryCta: "View Partner Packages",
    cardSummary:
      "Client appreciation, referral thank-yous, and firm milestone hospitality.",
    conceptEyebrow: "Built For Firms",
    conceptHeadline: "A table that signals how carefully you handle relationships.",
    conceptBody: [
      "Law firm relationships run on discretion, outcomes, and trust. A private chef dinner gives you a way to mark those moments without the emptiness of generic corporate gifts.",
      "Whether you are thanking a referral source, recognizing a partner, or celebrating a major matter, the experience is designed to feel considered — and fully prepaid within clear household limits.",
    ],
    useCasesEyebrow: "When Firms Use It",
    useCasesHeadline: "Appreciation for clients, partners, and teams.",
    useCases: [
      {
        title: "Client appreciation",
        desc: "Reward valued clients with hospitality that reflects the care you bring to their matters.",
      },
      {
        title: "Referral-source thank-you",
        desc: "Acknowledge the introductions that grow your practice with an evening worth remembering.",
      },
      {
        title: "Partner recognition",
        desc: "Honor firm partners and of counsel with a private table that feels personal, not promotional.",
      },
      {
        title: "Major matter completion",
        desc: "Mark closings, settlements, and complex wins with a celebration that lands quietly and well.",
      },
      {
        title: "Staff recognition",
        desc: "Thank associates, paralegals, and support teams with chef-led hospitality instead of another gift card.",
      },
      {
        title: "Firm milestones",
        desc: "Anniversaries, promotions, and practice achievements — paced with intention.",
      },
    ],
    howItWorksHeadline: "From firm decision to an evening handled with care.",
    howItWorks: [
      {
        num: "01",
        title: "Define the relationship moment",
        desc: "Client, referral, partner, staff, or milestone — we shape the tone around your firm and the occasion.",
      },
      {
        num: "02",
        title: "Select a prepaid package",
        desc: "Single Experience, Professional 5-Pack, or Professional 10-Pack with transparent household guest rules.",
      },
      {
        num: "03",
        title: "Present the gift",
        desc: "You control the presentation. Plate The Umpqua coordinates the dining experience when the recipient is ready.",
      },
      {
        num: "04",
        title: "White-glove execution",
        desc: "A fully prepaid household experience within included limits — logistics handled so the relationship stays the focus.",
      },
    ],
    faqs: [
      {
        question: "Who pays for additional guests?",
        answer:
          "Additional household members and optional guests beyond the household are $100 per person. Professionals should prepay household additions so the recipient never feels the gift was incomplete.",
      },
      {
        question: "Can we buy packs for the firm?",
        answer:
          "Yes. Professional 5-Packs and 10-Packs are designed for firms that want reserved hospitality capacity across client appreciation and internal recognition.",
      },
    ],
    finalHeadline: "Ready to elevate firm hospitality?",
    finalSupporting:
      "Share the occasion, guest profile, and how many experiences you need. We will follow up to design a Partner Concierge path for your firm.",
    seo: {
      title: "Law Firm Client Appreciation Gifts | Partner Concierge",
      description:
        "Private dining hospitality for law firm client appreciation, referral thank-yous, partner recognition, and staff milestones in the Umpqua Valley.",
    },
  },
  {
    slug: "builders",
    href: "/partner-concierge/builders",
    navLabel: "Builders & Contractors",
    eyebrow: "Builder & Contractor Client Gifts",
    headline: "Hand over the keys. Leave them with one more reason to remember you.",
    supporting:
      "When the home, remodel, or major project is complete, present a private dining experience — a project-completion gift that earns referrals long after the final walkthrough.",
    heroImage: "/content/images/umpqua-private-dining12.jpg",
    heroImageAlt: "Private dining gift for custom home and remodel clients",
    primaryCta: "Request Builder Partner Access",
    secondaryCta: "View Partner Packages",
    featured: true,
    featuredLabel: "Strong fit",
    cardSummary:
      "Project-completion gifts for custom homes, remodels, and premium trades — presented by you.",
    conceptEyebrow: "You Built The Home. Own The Final Gesture.",
    conceptHeadline: "A completion gift that outlasts the punch list.",
    conceptBody: [
      "When a builder or contractor finishes a home, renovation, remodel, addition, or major project, the handoff is a relationship moment. Presenting a private dining experience gives homeowners one more reason to remember who built it — and who to recommend.",
      "You purchase the experience and present it. Plate The Umpqua executes the chef-led evening later. The gift feels complete within household limits, and the referral conversation starts at the table.",
    ],
    useCasesEyebrow: "When Builders Use It",
    useCasesHeadline: "Project-completion hospitality that drives referrals.",
    useCases: [
      {
        title: "Custom home completions",
        desc: "Celebrate the handoff with a Welcome Home private dining experience the homeowner will talk about for years.",
      },
      {
        title: "Remodels & renovations",
        desc: "Mark the end of disruption with an evening that restores calm — and your reputation for finishing well.",
      },
      {
        title: "Additions & major projects",
        desc: "Give clients a considered thank-you after months of trust, decisions, and craftsmanship.",
      },
      {
        title: "Developer & community handoffs",
        desc: "Elevate buyer appreciation with hospitality that matches the quality of the build.",
      },
      {
        title: "Designers & premium trades",
        desc: "Architects, interior designers, and specialty trades — gift an experience equal to the work.",
      },
      {
        title: "Referral retention",
        desc: "A memorable final gesture keeps your name first when friends ask who to hire.",
      },
    ],
    howItWorksHeadline: "From final walkthrough to a table they remember.",
    howItWorks: [
      {
        num: "01",
        title: "Purchase the experience",
        desc: "Single Experience for one project — or Professional packs when you complete multiple homes a year.",
      },
      {
        num: "02",
        title: "Present at completion",
        desc: "Hand the homeowner a luxury gift certificate when you turn over the keys or close out the project.",
      },
      {
        num: "03",
        title: "They schedule when ready",
        desc: "After the dust settles, they redeem a private dining experience. You already get credit for the gesture.",
      },
      {
        num: "04",
        title: "We deliver the evening",
        desc: "Chef-led hospitality, fully prepaid within included household limits — a referral story waiting to happen.",
      },
    ],
    faqs: [
      {
        question: "Who presents the gift?",
        answer:
          "You do — the builder, contractor, or project lead. Plate The Umpqua executes the dining experience after the homeowner redeems; we do not replace your handoff moment.",
      },
      {
        question: "What guest limits apply?",
        answer:
          "Each experience includes up to 2 adults and 3 children from the recipient household. Additional household members are $100 per person and should be prepaid by you.",
      },
    ],
    finalHeadline: "Ready to make project completion unforgettable?",
    finalSupporting:
      "Tell us about your project volume and service area. We will shape a Partner Concierge package for builders and contractors who want every handoff to earn the next referral.",
    seo: {
      title: "Builder & Contractor Client Gifts | Partner Concierge",
      description:
        "Home completion and remodel client appreciation gifts — private chef dining for custom home builders, contractors, and premium trades in the Umpqua Valley.",
    },
  },
  {
    slug: "sales",
    href: "/partner-concierge/sales",
    navLabel: "Sales Teams",
    eyebrow: "Sales Professional Recognition",
    headline: "Recognize top performers with an evening — not another plaque.",
    supporting:
      "Sales contests, major account wins, and President’s Club-style recognition — private dining hospitality for sales professionals and teams who earn it.",
    heroImage: "/content/images/umpqua-private-dining6.jpg",
    heroImageAlt: "Private dining recognition for sales professionals",
    primaryCta: "Request Sales Partner Access",
    secondaryCta: "View Partner Packages",
    cardSummary:
      "Top performer recognition, sales contests, and account-win hospitality.",
    conceptEyebrow: "Built For Performance Cultures",
    conceptHeadline: "Hospitality that matches the standard you set for the team.",
    conceptBody: [
      "Sales professionals and sales teams run on recognition that feels earned. A private chef experience elevates monthly, quarterly, and annual awards beyond another certificate on the wall.",
      "From automotive and insurance to solar, home improvement, luxury retail, and B2B organizations — Partner Concierge gives leaders a premium way to celebrate top performers and major wins.",
    ],
    useCasesEyebrow: "When Sales Leaders Use It",
    useCasesHeadline: "Recognition for the people who close.",
    useCases: [
      {
        title: "Top performer of the month / quarter / year",
        desc: "Celebrate the leaders on your board with an experience that feels equal to the number they posted.",
      },
      {
        title: "Major account wins",
        desc: "Mark the deals that move the business with hospitality your top closers will actually talk about.",
      },
      {
        title: "Sales contests",
        desc: "Make the prize memorable — a private dining experience that motivates the next sprint.",
      },
      {
        title: "President’s Club-style recognition",
        desc: "Give annual qualifiers a gift of presence and craft, not another logoed item.",
      },
      {
        title: "Team & manager appreciation",
        desc: "Recognize sales managers and supporting teams who carry the culture behind the numbers.",
      },
      {
        title: "Cross-industry performance orgs",
        desc: "Automotive, insurance, solar, home improvement, luxury retail, B2B — any team that rewards excellence.",
      },
    ],
    howItWorksHeadline: "From leaderboard to a private table.",
    howItWorks: [
      {
        num: "01",
        title: "Define the recognition moment",
        desc: "Contest prize, account win, monthly award, or annual club — we shape the experience around your culture.",
      },
      {
        num: "02",
        title: "Purchase prepaid packs",
        desc: "Single Experience for one winner — or Professional 5-Pack and 10-Pack for ongoing recognition calendars.",
      },
      {
        num: "03",
        title: "Present to the winner",
        desc: "You own the recognition moment. Plate The Umpqua coordinates the dining experience when they are ready.",
      },
      {
        num: "04",
        title: "Deliver the evening",
        desc: "A fully prepaid household experience within included limits — recognition that feels premium, not transactional.",
      },
    ],
    faqs: [
      {
        question: "Who is this for?",
        answer:
          "Sales professionals, sales teams, and performance-driven organizations — including automotive, insurance, solar, home improvement, luxury retail, and B2B sales.",
      },
      {
        question: "What is included per experience?",
        answer:
          "Up to 2 adults and 3 children from the recipient household. Additional household members are $100 per person and should be prepaid by the gifting organization.",
      },
    ],
    finalHeadline: "Ready to raise the standard of sales recognition?",
    finalSupporting:
      "Tell us about your team size, contest calendar, and how many experiences you need. We will follow up with Partner Concierge options for sales leaders.",
    seo: {
      title: "Sales Team Recognition Gifts | Partner Concierge",
      description:
        "Private dining recognition for sales professionals and sales teams — top performer awards, contests, and President’s Club-style hospitality in the Umpqua Valley.",
    },
  },
]

export function getPartnerIndustry(
  slug: string,
): PartnerIndustryConfig | undefined {
  return PARTNER_INDUSTRIES.find((industry) => industry.slug === slug)
}

export function partnerIndustryMetadata(slug: PartnerIndustrySlug): Metadata {
  const industry = getPartnerIndustry(slug)!
  return {
    title: industry.seo.title,
    description: industry.seo.description,
    openGraph: {
      title: `${industry.seo.title} | Plate The Umpqua`,
      description: industry.seo.description,
      url: absoluteSiteUrl(industry.href),
    },
    alternates: {
      canonical: absoluteSiteUrl(industry.href),
    },
  }
}

export function partnerIndustryInquiryHref(slug: PartnerIndustrySlug) {
  const params = new URLSearchParams({
    source: "partner-concierge",
    industry: slug,
  })
  return `/inquiry?${params.toString()}`
}
