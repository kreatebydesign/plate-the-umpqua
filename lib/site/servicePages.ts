import type { Metadata } from 'next'
import { absoluteSiteUrl } from '@/lib/site/siteUrl'

export const SERVICE_AREA_LABELS = [
  'Roseburg, Oregon',
  'Umpqua Valley',
  'Southern Oregon',
] as const

export type ServicePageSlug =
  | 'private-chef'
  | 'private-dining'
  | 'private-events'
  | 'catering'

export type ServiceFaq = {
  question: string
  answer: string
}

export type ServicePageConfig = {
  slug: ServicePageSlug
  href: `/${ServicePageSlug}`
  navLabel: string
  eyebrow: string
  headline: string
  supporting: string
  primaryCtaLabel: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  inquirySource: ServicePageSlug
  heroImage: string
  heroImageAlt: string
  introEyebrow: string
  introHeadline: string
  introCopy: string[]
  forWhomEyebrow: string
  forWhomHeadline: string
  forWhomItems: string[]
  experienceEyebrow: string
  experienceHeadline: string
  experienceCopy: string
  experienceImage: string
  experienceImageAlt: string
  planningEyebrow: string
  planningHeadline: string
  planningSteps: { title: string; copy: string }[]
  whereEyebrow: string
  whereHeadline: string
  whereCopy: string
  differenceEyebrow: string
  differenceHeadline: string
  differenceCopy: string[]
  relatedLinks: { label: string; href: string; description: string }[]
  faqs: ServiceFaq[]
  ctaEyebrow: string
  ctaHeadline: string
  ctaCopy: string
  seo: {
    title: string
    description: string
  }
}

const sharedPlanning = [
  {
    title: 'Share the occasion',
    copy: 'Tell us who the evening is for, where it will take place, and what feeling you want guests to leave with.',
  },
  {
    title: 'Shape the experience',
    copy: 'Martin follows up directly to refine the menu, pacing, guest count, and hospitality details around your setting.',
  },
  {
    title: 'Host the evening',
    copy: 'You stay present with your guests. The table, service, and atmosphere are handled as a private hospitality experience.',
  },
] as const

export const SERVICE_PAGES: ServicePageConfig[] = [
  {
    slug: 'private-chef',
    href: '/private-chef',
    navLabel: 'Private Chef',
    eyebrow: 'Private Chef • Roseburg & Umpqua Valley',
    headline: 'A private chef for evenings that deserve the table.',
    supporting:
      'Chef Martin brings chef-led private dining into homes, vineyards, estates, and retreats across Roseburg, the Umpqua Valley, and Southern Oregon.',
    primaryCtaLabel: 'Request Availability',
    secondaryCtaLabel: 'View Packages',
    secondaryCtaHref: '/packages',
    inquirySource: 'private-chef',
    heroImage: '/content/images/umpqua-private-dining6.jpg',
    heroImageAlt:
      'Private chef dining experience by Plate The Umpqua in the Umpqua Valley',
    introEyebrow: 'What It Is',
    introHeadline: 'Hired hospitality, not a restaurant reservation.',
    introCopy: [
      'Plate The Umpqua is Chef Martin’s private chef hospitality practice — designed for hosts who want an elevated evening without leaving their own setting.',
      'The work is chef-led and occasion-driven: the menu, pacing, and atmosphere are shaped around your guests and the room itself.',
      'This is private hospitality for homes, wine country gatherings, celebrations, and professional entertaining — not a public dining room and not generic buffet catering.',
    ],
    forWhomEyebrow: 'Who It Is For',
    forWhomHeadline: 'Hosts who want the evening handled with quiet precision.',
    forWhomItems: [
      'Private dinners at home',
      'Anniversaries, birthdays, and proposals',
      'Wine country and winery evenings',
      'Estate and retreat hospitality',
      'Realtor and professional client entertaining',
      'Intimate celebrations and executive gatherings',
    ],
    experienceEyebrow: 'The Experience',
    experienceHeadline: 'Designed around the room, not the kitchen line.',
    experienceCopy:
      'Arrival, atmosphere, service, food, and conversation are paced intentionally so the evening feels considered rather than managed. Guests experience hospitality that stays personal to the setting — whether that is a private home, vineyard, estate, or retreat.',
    experienceImage: '/content/images/umpqua-private-dining1.jpg',
    experienceImageAlt: 'Chef-led private table experience in Roseburg, Oregon',
    planningEyebrow: 'How Planning Works',
    planningHeadline: 'A direct path from inquiry to the table.',
    planningSteps: [...sharedPlanning],
    whereEyebrow: 'Where Martin Serves',
    whereHeadline: 'Roseburg, the Umpqua Valley, and Southern Oregon.',
    whereCopy:
      'Experiences are rooted in Roseburg and the Umpqua Valley, with hospitality across appropriate Southern Oregon settings — private homes, estates, wineries, retreats, and other private environments suited to chef-led dining.',
    differenceEyebrow: 'Why It Feels Different',
    differenceHeadline: 'A private hospitality layer, not a catering drop-off.',
    differenceCopy: [
      'A restaurant asks guests to come to the kitchen’s schedule. A private chef evening is built around your table, your guests, and the reason the night matters.',
      'Plate The Umpqua is intentionally paced and setting-aware — closer to private hospitality than to production catering or a public reservation.',
    ],
    relatedLinks: [
      {
        label: 'Private Dining',
        href: '/private-dining',
        description: 'In-home and estate dining shaped around the evening.',
      },
      {
        label: 'Private Events',
        href: '/private-events',
        description: 'Celebrations, gatherings, and host-led occasions.',
      },
      {
        label: 'Wine Country Experiences',
        href: '/experiences',
        description: 'See how private table and estate evenings are paced.',
      },
    ],
    faqs: [
      {
        question: 'Is Plate The Umpqua a restaurant?',
        answer:
          'No. Plate The Umpqua is a private chef hospitality practice. Chef Martin brings the experience to homes, vineyards, estates, retreats, and other private settings across Roseburg and the Umpqua Valley.',
      },
      {
        question: 'What kinds of evenings can a private chef inquiry cover?',
        answer:
          'Hosts commonly inquire about private dinners, anniversaries, birthdays, proposals, wine country evenings, estate gatherings, realtor hospitality, wedding weekends, and corporate or executive entertaining.',
      },
      {
        question: 'Where does Chef Martin serve?',
        answer:
          'Service is rooted in Roseburg, the Umpqua Valley, and Southern Oregon — including private homes, estates, wineries, retreats, and other private settings suited to chef-led hospitality.',
      },
      {
        question: 'How do I inquire?',
        answer:
          'Submit an availability request with the occasion, setting, guest details, and timing. Martin follows up directly to shape the experience. You can also email hello@platetheumpqua.com.',
      },
    ],
    ctaEyebrow: 'Availability',
    ctaHeadline: 'Request a private chef evening.',
    ctaCopy:
      'Limited bookings are accepted each month for private homes, wineries, estates, retreats, and concierge hospitality experiences.',
    seo: {
      title: 'Private Chef in Roseburg & the Umpqua Valley',
      description:
        'Hire Chef Martin for private chef dining in homes, vineyards, estates, and retreats across Roseburg, the Umpqua Valley, and Southern Oregon.',
    },
  },
  {
    slug: 'private-dining',
    href: '/private-dining',
    navLabel: 'Private Dining',
    eyebrow: 'Private Dining • Roseburg & Southern Oregon',
    headline: 'Private dining built around your guests and your room.',
    supporting:
      'Intimate chef-led dinners for homes, celebrations, wine country evenings, and gatherings where the table becomes the center of the experience.',
    primaryCtaLabel: 'Request Private Booking',
    secondaryCtaLabel: 'Explore Experiences',
    secondaryCtaHref: '/experiences',
    inquirySource: 'private-dining',
    heroImage: '/content/images/umpqua-private-dining12.jpg',
    heroImageAlt:
      'Private dining table experience with Plate The Umpqua in Southern Oregon',
    introEyebrow: 'What It Is',
    introHeadline: 'An evening paced for presence, not turnover.',
    introCopy: [
      'Private dining with Plate The Umpqua is a chef-led experience shaped around the setting, the guests, and the reason the evening matters.',
      'Menus, pacing, and atmosphere are designed for the room you already have — a private home, estate, vineyard, or retreat — rather than for a public dining floor.',
      'The goal is elevated hospitality that feels calm, personal, and memorable after the evening ends.',
    ],
    forWhomEyebrow: 'Occasions',
    forWhomHeadline: 'Evenings that deserve more than a reservation.',
    forWhomItems: [
      'Intimate private dinners',
      'Date nights and anniversaries',
      'Birthday celebrations',
      'Proposal and engagement evenings',
      'Wine country private dining',
      'Hosted gatherings for clients or close friends',
    ],
    experienceEyebrow: 'What Guests Experience',
    experienceHeadline: 'Food, fire, conversation, and unhurried hospitality.',
    experienceCopy:
      'Guests arrive to an evening already considered: atmosphere, service, and seasonal cooking paced so conversation can lead. The hospitality stays rooted in the Umpqua Valley’s slower rhythm — elevated without feeling staged.',
    experienceImage: '/content/images/umpqua-private-dining18.jpg',
    experienceImageAlt: 'Wine country private dining atmosphere in the Umpqua Valley',
    planningEyebrow: 'How Planning Works',
    planningHeadline: 'From first note to the final course.',
    planningSteps: [...sharedPlanning],
    whereEyebrow: 'Service Area',
    whereHeadline: 'Private tables across Roseburg and the Umpqua Valley.',
    whereCopy:
      'Private dining experiences are offered across Roseburg, the Umpqua Valley, and Southern Oregon in settings that support chef-led hospitality — including private homes, estates, wineries, and retreats.',
    differenceEyebrow: 'Private Dining vs. a Restaurant',
    differenceHeadline: 'Your table. Your guests. Your evening.',
    differenceCopy: [
      'Restaurant dining asks you to fit into a public service model. Private dining brings the hospitality layer to your setting so the evening can feel personal from the start.',
      'Plate The Umpqua is built as a private hospitality practice — chef-led, occasion-aware, and designed for gatherings that should not feel transactional.',
    ],
    relatedLinks: [
      {
        label: 'Private Chef',
        href: '/private-chef',
        description: 'Learn how Chef Martin works as a hired private chef.',
      },
      {
        label: 'Packages',
        href: '/packages',
        description: 'Review private table and estate hospitality packages.',
      },
      {
        label: 'Partner Concierge',
        href: '/partner-concierge',
        description: 'Prepaid private dining gifts for professional relationships.',
      },
    ],
    faqs: [
      {
        question: 'What is private dining with Plate The Umpqua?',
        answer:
          'It is a chef-led dining experience hosted in a private setting — typically a home, estate, winery, or retreat — shaped around your guests and the tone of the evening.',
      },
      {
        question: 'Can private dining happen at a winery or estate?',
        answer:
          'Yes. Estate and wine country gatherings are a core part of the hospitality practice, alongside in-home private dinners across Roseburg and the Umpqua Valley.',
      },
      {
        question: 'How does an inquiry turn into a dinner?',
        answer:
          'After you request availability, Martin follows up to refine the occasion, setting, guest details, and hospitality approach. The experience is then planned directly with you — no public reservation system.',
      },
      {
        question: 'Is this the same as Partner Concierge?',
        answer:
          'Private dining is the hospitality experience itself. Partner Concierge is the prepaid professional gifting program used by realtors and other partners to give private dining experiences to clients.',
      },
    ],
    ctaEyebrow: 'Start Planning',
    ctaHeadline: 'Plan a private dining evening.',
    ctaCopy:
      'Share the occasion and setting. Martin will follow up to shape a private dining experience around your table.',
    seo: {
      title: 'Private Dining in Roseburg & the Umpqua Valley',
      description:
        'Chef-led private dining for homes, estates, and wine country evenings across Roseburg, the Umpqua Valley, and Southern Oregon.',
    },
  },
  {
    slug: 'private-events',
    href: '/private-events',
    navLabel: 'Private Events',
    eyebrow: 'Private Events • Roseburg & Umpqua Valley',
    headline: 'Private events with the feel of a hosted evening.',
    supporting:
      'Chef-led hospitality for celebrations, wedding weekends, corporate gatherings, and intimate events where the table and atmosphere matter as much as the menu.',
    primaryCtaLabel: 'Plan Your Event',
    secondaryCtaLabel: 'View Packages',
    secondaryCtaHref: '/packages',
    inquirySource: 'private-events',
    heroImage: '/content/images/umpqua-private-dining24.jpg',
    heroImageAlt:
      'Private event hospitality with Plate The Umpqua in Southern Oregon',
    introEyebrow: 'What It Is',
    introHeadline: 'Occasion-driven hospitality for private gatherings.',
    introCopy: [
      'Private events with Plate The Umpqua are chef-led evenings designed for celebrations and gatherings that deserve more attention than a standard venue meal.',
      'The focus stays on the guests, the setting, and the feeling of the occasion — whether that is a wedding weekend dinner, a corporate gathering, or an intimate celebration at home or in wine country.',
      'Martin shapes the hospitality as a private experience rather than as generic event production.',
    ],
    forWhomEyebrow: 'Event Types',
    forWhomHeadline: 'Gatherings that call for considered hospitality.',
    forWhomItems: [
      'Intimate celebrations and custom occasions',
      'Wedding weekend dining',
      'Anniversary and milestone evenings',
      'Corporate and executive gatherings',
      'Client and partner entertaining',
      'Estate, winery, and retreat events',
    ],
    experienceEyebrow: 'What The Evening Feels Like',
    experienceHeadline: 'Elevated, personal, and paced for the room.',
    experienceCopy:
      'Private events are planned around the host’s intention: who is gathering, why the evening matters, and how the setting should feel. Guests experience hospitality that stays refined without becoming impersonal.',
    experienceImage: '/content/images/umpqua-private-dining30.jpg',
    experienceImageAlt: 'Private celebration dining atmosphere in Roseburg, Oregon',
    planningEyebrow: 'How Planning Works',
    planningHeadline: 'Clarify the occasion. Shape the hospitality.',
    planningSteps: [...sharedPlanning],
    whereEyebrow: 'Where Events Happen',
    whereHeadline: 'Private settings across Southern Oregon wine country.',
    whereCopy:
      'Events are hosted in private homes, estates, wineries, retreats, and other private environments across Roseburg, the Umpqua Valley, and Southern Oregon — wherever the setting supports chef-led hospitality.',
    differenceEyebrow: 'A Different Kind Of Event Meal',
    differenceHeadline: 'Hospitality first. Production second.',
    differenceCopy: [
      'Many event meals are built for volume and logistics. Plate The Umpqua is built for presence — chef-led pacing, seasonal cooking, and an evening that still feels personal.',
      'That makes the practice especially suited to intimate weddings and celebrations, rehearsal-style dinners within a wedding weekend, and private corporate gatherings where relationship matters.',
    ],
    relatedLinks: [
      {
        label: 'Private Chef',
        href: '/private-chef',
        description: 'Start with Chef Martin’s private chef hospitality.',
      },
      {
        label: 'Catering',
        href: '/catering',
        description: 'See how elevated private catering is positioned here.',
      },
      {
        label: 'Concierge',
        href: '/concierge',
        description: 'Priority coordination for hosts and professional partners.',
      },
    ],
    faqs: [
      {
        question: 'What kinds of private events does Plate The Umpqua handle?',
        answer:
          'Inquiries commonly include celebrations, wedding weekend dining, anniversaries, corporate and executive gatherings, client entertainment, and custom occasions in private homes, estates, wineries, and retreats.',
      },
      {
        question: 'Do you handle large production events?',
        answer:
          'Plate The Umpqua is positioned as a private hospitality layer — best suited to intimate, chef-led gatherings rather than high-volume production catering.',
      },
      {
        question: 'Can a private event take place at a winery?',
        answer:
          'Yes. Wine country and estate gatherings are part of the hospitality practice, alongside private homes and retreat settings across the Umpqua Valley.',
      },
      {
        question: 'What happens after I inquire?',
        answer:
          'Martin follows up directly to understand the occasion, setting, guests, and timing, then shapes a hospitality approach for the evening.',
      },
    ],
    ctaEyebrow: 'Plan Your Event',
    ctaHeadline: 'Request private event hospitality.',
    ctaCopy:
      'Share the occasion, setting, and timing. Martin will follow up to plan a chef-led private event experience.',
    seo: {
      title: 'Private Events in Roseburg & the Umpqua Valley',
      description:
        'Chef-led private events for celebrations, wedding weekends, and corporate gatherings across Roseburg, the Umpqua Valley, and Southern Oregon.',
    },
  },
  {
    slug: 'catering',
    href: '/catering',
    navLabel: 'Catering',
    eyebrow: 'Private Catering • Roseburg, Oregon',
    headline: 'Elevated catering for private tables — not buffet logistics.',
    supporting:
      'Chef-led private catering for homes, estates, wineries, and intimate gatherings across Roseburg and the Umpqua Valley, shaped as hospitality rather than production catering.',
    primaryCtaLabel: 'Request Availability',
    secondaryCtaLabel: 'Private Events',
    secondaryCtaHref: '/private-events',
    inquirySource: 'catering',
    heroImage: '/content/images/umpqua-private-dining3.jpg',
    heroImageAlt:
      'Elevated private catering and chef-led dining by Plate The Umpqua',
    introEyebrow: 'What This Catering Is',
    introHeadline: 'Private catering with a chef at the center.',
    introCopy: [
      'When people search for catering in Roseburg, they are often looking for someone to feed an occasion well. Plate The Umpqua answers that need through chef-led private hospitality — not generic drop-off catering.',
      'The catering work here is occasion-driven: seasonal cooking, considered pacing, and service designed for private homes, estates, wineries, and intimate gatherings.',
      'If you want a buffet production model, this is not that. If you want elevated private catering that still feels personal, this is the inquiry path.',
    ],
    forWhomEyebrow: 'Best Fit',
    forWhomHeadline: 'Private gatherings that need elevated food and presence.',
    forWhomItems: [
      'In-home private catering',
      'Estate and winery gatherings',
      'Intimate celebrations',
      'Wedding weekend dining',
      'Corporate and executive entertaining',
      'Client appreciation evenings',
    ],
    experienceEyebrow: 'What Guests Notice',
    experienceHeadline: 'Cooking and hospitality that stay personal.',
    experienceCopy:
      'Guests experience food and service shaped around the evening rather than around a standardized catering package. The atmosphere stays closer to private dining than to banquet logistics.',
    experienceImage: '/content/images/umpqua-private-dining14.jpg',
    experienceImageAlt: 'Chef-led private catering detail for a Roseburg gathering',
    planningEyebrow: 'How Planning Works',
    planningHeadline: 'Clarify the occasion before the menu.',
    planningSteps: [...sharedPlanning],
    whereEyebrow: 'Local Service',
    whereHeadline: 'Catering rooted in Roseburg and the Umpqua Valley.',
    whereCopy:
      'Private catering inquiries are welcomed for Roseburg, the Umpqua Valley, and Southern Oregon settings that support chef-led hospitality — including private homes, estates, wineries, and retreats.',
    differenceEyebrow: 'Not Typical Catering',
    differenceHeadline: 'A private hospitality layer for the table.',
    differenceCopy: [
      'Typical catering is often built for volume, transport, and standardized service. Plate The Umpqua is built for chef-led private evenings where the table, pacing, and guests come first.',
      'That distinction is intentional. The brand rejects generic catering while still serving hosts who need elevated private catering for meaningful gatherings.',
    ],
    relatedLinks: [
      {
        label: 'Private Dining',
        href: '/private-dining',
        description: 'Explore intimate chef-led dining experiences.',
      },
      {
        label: 'Private Events',
        href: '/private-events',
        description: 'Plan celebrations and private gatherings.',
      },
      {
        label: 'Packages',
        href: '/packages',
        description: 'Review private hospitality package starting points.',
      },
    ],
    faqs: [
      {
        question: 'Do you offer catering in Roseburg, Oregon?',
        answer:
          'Yes — as chef-led private catering for homes, estates, wineries, and intimate gatherings across Roseburg and the Umpqua Valley. It is positioned as private hospitality rather than generic buffet catering.',
      },
      {
        question: 'How is this different from restaurant catering?',
        answer:
          'Restaurant catering often extends a public kitchen model into an event. Plate The Umpqua designs each evening as a private chef hospitality experience shaped around the setting and guests.',
      },
      {
        question: 'What occasions fit this catering approach?',
        answer:
          'Private dinners, celebrations, wedding weekend dining, corporate entertaining, client appreciation, and wine country gatherings are common inquiry types.',
      },
      {
        question: 'How do I request catering?',
        answer:
          'Submit an availability request with your occasion, location, guest details, and timing. Martin follows up directly to determine whether the gathering is a fit and how to shape the hospitality.',
      },
    ],
    ctaEyebrow: 'Request Catering',
    ctaHeadline: 'Inquire about private catering for your gathering.',
    ctaCopy:
      'Tell us about the occasion and setting. Martin will follow up to shape an elevated private catering experience.',
    seo: {
      title: 'Private Catering in Roseburg & the Umpqua Valley',
      description:
        'Chef-led private catering for homes, estates, and intimate gatherings in Roseburg, the Umpqua Valley, and Southern Oregon — hospitality, not buffet logistics.',
    },
  },
]

export function getServicePage(slug: ServicePageSlug): ServicePageConfig {
  const page = SERVICE_PAGES.find((item) => item.slug === slug)
  if (!page) {
    throw new Error(`Unknown service page: ${slug}`)
  }
  return page
}

export function servicePageMetadata(slug: ServicePageSlug): Metadata {
  const page = getServicePage(slug)
  const url = absoluteSiteUrl(page.href)

  return {
    title: page.seo.title,
    description: page.seo.description,
    openGraph: {
      title: `${page.seo.title} | Plate The Umpqua`,
      description: page.seo.description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.seo.title} | Plate The Umpqua`,
      description: page.seo.description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export function serviceInquiryHref(slug: ServicePageSlug): string {
  return `/inquiry?source=${slug}`
}
