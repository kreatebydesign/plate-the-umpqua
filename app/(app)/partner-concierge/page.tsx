"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { PARTNER_INDUSTRIES } from "@/lib/site/partnerConciergeIndustries";
import {
  EXPERIENCE_TIERS,
  PARTNER_GUEST_RULES,
  PARTNER_INQUIRY_HREF,
  PREPAID_PARTNER_COMMITMENT_POINTS,
  PREPAID_PARTNER_PACKAGES,
  partnerPackageIdForTitle,
  partnerPackageInquiryHref,
  partnerPackagePurchaseHref,
} from "@/lib/site/partnerConciergePricing";

const work = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work",
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9 },
  },
};

const audiences = [
  "Real estate agents & brokerages",
  "Doctors & medical practices",
  "Attorneys & law firms",
  "Builders, contractors & remodelers",
  "Sales professionals & sales teams",
  "Financial advisors & wealth managers",
  "Insurance agencies",
  "Business owners & executive teams",
];

const useCases = [
  {
    title: "Closing gifts",
    desc: "Turn a transaction milestone into a private evening your clients remember long after the keys change hands.",
  },
  {
    title: "VIP client appreciation",
    desc: "Reward your most valued relationships with chef-led hospitality that feels personal, not promotional.",
  },
  {
    title: "Referral thank-you gifts",
    desc: "Acknowledge the introductions that grow your practice with an experience worth talking about.",
  },
  {
    title: "Executive entertainment",
    desc: "Host prospects, partners, or leadership in a setting that signals discernment without excess.",
  },
  {
    title: "Staff appreciation",
    desc: "Recognize the people who carry your brand with an evening designed around gratitude and presence.",
  },
  {
    title: "Milestone celebrations",
    desc: "Mark anniversaries, promotions, and practice milestones with table-side ceremony and quiet precision.",
  },
];

const communityOfferings = [
  {
    title: "Resident Private Dining",
    desc: "In-home coursed dining for residents — pre-approved, seamlessly booked, and executed with estate-level care.",
  },
  {
    title: "Clubhouse Culinary Events",
    desc: "Chef-led gatherings in community clubhouses, designed to feel refined rather than catered.",
  },
  {
    title: "Wine & Chef Evenings",
    desc: "Regional wine, seasonal menus, and an atmosphere that elevates the community social calendar.",
  },
  {
    title: "Seasonal Community Gatherings",
    desc: "Spring, harvest, and holiday programming that gives residents a reason to gather with intention.",
  },
  {
    title: "Welcome Home Experiences",
    desc: "A considered culinary welcome for new homeowners — personal, memorable, and on-brand for the community.",
  },
  {
    title: "Executive & Client Entertaining",
    desc: "Resident-hosted business entertainment handled with discretion, polish, and white-glove service.",
  },
  {
    title: "Holiday Hospitality",
    desc: "Thanksgiving, Christmas, and New Year's experiences that feel like a private residence, not a banquet hall.",
  },
  {
    title: "HOA Appreciation Events",
    desc: "Board and management appreciation evenings that recognize the people who steward the community.",
  },
];

const communityPillars = [
  {
    title: "Pre-approved hospitality provider",
    desc: "One vetted partner approved by community leadership — simplifying vendor review for every resident occasion.",
  },
  {
    title: "Fully insured professional chef",
    desc: "Licensed, insured, and accountable — meeting the standards HOA boards and property managers require.",
  },
  {
    title: "Trusted by community management",
    desc: "A relationship built with boards and managers first, so resident bookings inherit that trust.",
  },
  {
    title: "Simple resident booking process",
    desc: "Residents request through a clear, concierge-style path — no vendor hunting, no uncertainty.",
  },
  {
    title: "Elevated lifestyle amenity",
    desc: "Hospitality that functions as a genuine community differentiator, not an afterthought.",
  },
  {
    title: "Clubhouse-ready experiences",
    desc: "Programming designed for amenity spaces — paced, polished, and ready for shared settings.",
  },
  {
    title: "White-glove execution",
    desc: "From menu to service flow, every detail is managed so the evening feels effortless.",
  },
  {
    title: "Local Umpqua expertise",
    desc: "Seasonal sourcing, regional wine, and a chef rooted in the valley — not flown in for the occasion.",
  },
];

const steps = [
  {
    num: "01",
    title: "Share the occasion",
    desc: "Tell us who the experience is for, what moment it marks, and the tone you want the evening to carry.",
  },
  {
    num: "02",
    title: "We design the table",
    desc: "Menu, setting, pacing, and service are shaped around your guests, your brand, and the reason the evening matters.",
  },
  {
    num: "03",
    title: "Everything is handled",
    desc: "From coordination to execution, the experience is managed with quiet precision so you can be fully present.",
  },
  {
    num: "04",
    title: "The evening lands",
    desc: "Your clients leave with a memory that reinforces trust, gratitude, and the quality of your professional relationship.",
  },
];

const COMMUNITY_INQUIRY_HREF = "/inquiry?source=community-partnership";

const reasons = [
  {
    title: "Hospitality, not catering",
    desc: "Every experience is chef-led and occasion-driven — designed to feel personal and elevated, never transactional or generic.",
  },
  {
    title: "Built for professional relationships",
    desc: "The program is structured for people whose business depends on trust, referrals, and the quality of every touchpoint.",
  },
  {
    title: "Quietly memorable",
    desc: "The best client appreciation does not announce itself. It creates an atmosphere people talk about long after the evening ends.",
  },
  {
    title: "Rooted in the Umpqua Valley",
    desc: "Seasonal sourcing, regional wine, and estate settings give each experience a sense of place that imported gifts cannot replicate.",
  },
];

export default function PartnerConciergePage() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center md:min-h-screen md:px-6 md:pt-24">
        <Image
          src="/content/images/umpqua-private-dining33.jpg"
          alt="Partner Concierge Program by Plate The Umpqua"
          fill
          priority
          className="object-cover opacity-48 saturate-[0.9] contrast-[0.96]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/54" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.14),rgba(20,18,14,0.36)_44%,#070605_100%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl"
        >
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#c4a465] sm:text-[10px] sm:tracking-[0.42em]">
            Partner Concierge Program
          </p>

          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(2.8rem,14vw,7.5rem)] leading-[0.9] tracking-[-0.055em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Client appreciation that earns the referral.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 sm:text-base md:text-lg md:leading-8">
            A premium hospitality program for professionals who understand that the right evening can deepen trust, celebrate milestones, and turn a gesture into a lasting relationship.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={PARTNER_INQUIRY_HREF}
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Partner Access
            </Link>

            <Link
              href="/concierge"
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Explore Concierge Service
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Professional Audience */}
      <section className="relative border-y border-[#c4a465]/12 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
                Built For Professionals
              </p>

              <h2
                className="mt-5 text-[clamp(2.6rem,11vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Your clients deserve more than a gift basket.
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
              <p>
                The Partner Concierge Program is designed for professionals whose business runs on relationships — people who know that a closing dinner, a referral thank-you, or a milestone celebration can carry more weight than any branded merchandise.
              </p>

              <p>
                Whether you are a realtor marking a transaction, a wealth manager hosting a valued client, or a practice owner recognizing your team, the experience is shaped to feel effortless, personal, and entirely handled.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {audiences.map((audience) => (
              <div
                key={audience}
                className="border border-[#c4a465]/14 bg-[#14120e]/40 px-5 py-4 text-sm leading-6 text-[#e9decb]/80"
              >
                {audience}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Explore by Profession */}
      <section className="relative px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Explore By Profession
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Professional gifting, shaped by your industry.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-[#e9decb]/76 md:text-base">
            Start with the vertical that matches how you build relationships — then choose a Single Experience, Professional 5-Pack, or Professional 10-Pack.
          </p>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {PARTNER_INDUSTRIES.map((industry, index) => (
              <motion.article
                key={industry.slug}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.05 }}
                className={`border bg-[#0d0b08]/55 p-6 backdrop-blur-sm transition duration-500 hover:border-[#c4a465]/42 md:p-7 ${
                  industry.featured
                    ? "border-[#c4a465]/40 md:col-span-1 lg:row-span-1"
                    : "border-[#c4a465]/16"
                } ${industry.slug === "real-estate" ? "lg:col-span-2" : ""}`}
              >
                {industry.featuredLabel ? (
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a465]">
                    {industry.featuredLabel}
                  </p>
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a465]/70">
                    Partner Vertical
                  </p>
                )}

                <h3
                  className={`mt-4 tracking-[-0.03em] text-[#efe6d4] ${
                    industry.slug === "real-estate"
                      ? "text-[2.15rem] leading-[0.96] md:text-4xl"
                      : "text-[1.75rem] leading-[1.02] md:text-2xl"
                  }`}
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {industry.navLabel}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#e9decb]/78">
                  {industry.cardSummary}
                </p>

                <Link
                  href={industry.href}
                  className="mt-7 inline-block text-[11px] uppercase tracking-[0.24em] text-[#c4a465] transition hover:text-[#efe6d4]"
                >
                  Explore {industry.navLabel}
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Use Cases */}
      <section className="relative px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            When To Use It
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Every occasion is a relationship moment.
          </h2>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {useCases.map((item) => (
              <article
                key={item.title}
                className="border border-[#c4a465]/16 bg-[#0d0b08]/55 p-6 backdrop-blur-sm md:p-7"
              >
                <h3
                  className="text-[1.65rem] leading-[1.02] tracking-[-0.03em] text-[#efe6d4] md:text-2xl"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#e9decb]/78">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Private Community Partnerships */}
      <section className="relative border-y border-[#c4a465]/12 bg-[#0f0d0a] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
                Private Community Partnerships
              </p>

              <h2
                className="mt-5 text-[clamp(2.6rem,11vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Luxury hospitality, already approved for your community.
              </h2>
            </div>

            <p className="text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
              Plate The Umpqua partners with luxury gated communities, private neighborhoods, country clubs, and estate communities to provide residents with a trusted, pre-approved culinary experience. Once approved by the HOA or community management, residents gain access to refined private dining, wine experiences, seasonal gatherings, executive entertaining, and clubhouse hospitality—all delivered by a vetted local hospitality partner.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {communityOfferings.map((item, index) => (
              <motion.article
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.04 }}
                className="border border-[#c4a465]/16 bg-[#14120e]/45 p-6 backdrop-blur-sm md:p-7"
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4a465]/75">
                  Community Offering
                </p>

                <h3
                  className="mt-4 text-[1.55rem] leading-[1.04] tracking-[-0.03em] text-[#efe6d4] md:text-[1.65rem]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#e9decb]/76">
                  {item.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Why Communities Choose */}
      <section className="relative px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
                Why Communities Choose Plate The Umpqua
              </p>

              <h2
                className="mt-5 text-[clamp(2.6rem,11vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                An amenity that feels like Four Seasons, not a vendor list.
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/80 md:text-base md:leading-8">
                Martin partners directly with HOA boards and community management — becoming the community&apos;s trusted, pre-approved private chef and hospitality provider rather than selling dinners one homeowner at a time.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {communityPillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="border border-[#c4a465]/14 bg-[#100e0b]/55 p-5 md:p-6"
                >
                  <h3
                    className="text-[1.35rem] leading-[1.06] tracking-[-0.02em] md:text-xl"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#e9decb]/76">
                    {pillar.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Community Partnership CTA */}
      <section className="relative overflow-hidden border-y border-[#c4a465]/12 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,164,101,0.1),transparent_55%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Community Partnership
          </p>

          <h2
            className="mx-auto mt-5 max-w-3xl text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Bring luxury hospitality to your community.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 md:text-base md:leading-8">
            Whether you&apos;re an HOA board, community manager, developer, private club, or luxury residential neighborhood, Plate The Umpqua can create a tailored hospitality partnership that elevates the resident experience while simplifying event planning.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={COMMUNITY_INQUIRY_HREF}
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Community Partnership
            </Link>

            <Link
              href={COMMUNITY_INQUIRY_HREF}
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Schedule a Discovery Call
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Editorial Split */}
      <section className="grid items-center border-b border-[#c4a465]/10 md:min-h-[85vh] md:grid-cols-2">
        <div className="relative h-[58vh] min-h-[400px] overflow-hidden md:h-full md:min-h-[85vh]">
          <Image
            src="/content/images/umpqua-private-dining22.jpg"
            alt="Private dining for professional client appreciation"
            fill
            className="object-cover opacity-88 saturate-[0.96] contrast-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#14120e]/76 via-transparent to-[#14120e]/10 md:bg-gradient-to-r md:from-transparent md:to-[#14120e]/28" />
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="px-5 py-16 md:px-16 md:py-20 lg:px-24"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Relationship Hospitality
          </p>

          <h2
            className="mt-5 text-[clamp(2.6rem,11vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            The table becomes your most considered business gesture.
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            A private chef dinner says what a card cannot. It creates space for conversation, signals the value you place on the relationship, and leaves an impression that outlasts the evening itself.
          </p>

          <Link
            href={PARTNER_INQUIRY_HREF}
            className="mt-8 inline-block text-[11px] uppercase tracking-[0.24em] text-[#c4a465] transition hover:text-[#efe6d4] md:text-xs"
          >
            Start A Partner Inquiry
          </Link>
        </motion.div>
      </section>

      {/* Package Tiers */}
      <section className="relative bg-[#0f0d0a] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Program Tiers
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Four tiers. One standard of care.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-[#e9decb]/76 md:text-base">
            Each tier is shaped around the occasion, the guest count, and the level of coordination your relationship requires.
          </p>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6">
            {EXPERIENCE_TIERS.map((tier, index) => (
              <motion.article
                key={tier.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.06 }}
                className="group border border-[#c4a465]/18 bg-[#14120e]/50 p-6 backdrop-blur-sm transition duration-500 hover:border-[#c4a465]/42 md:p-8"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a465]/80">
                  Tier 0{index + 1}
                </p>

                <h3
                  className="mt-5 text-[2rem] leading-[0.96] tracking-[-0.03em] md:text-3xl"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {tier.title}
                </h3>

                <p className="mt-4 text-sm text-[#c4a465]">{tier.price}</p>

                <p className="mt-6 text-sm leading-7 text-[#e9decb]/80">
                  {tier.desc}
                </p>

                <ul className="mt-7 space-y-3 border-t border-[#c4a465]/14 pt-6 text-sm leading-6 text-[#bfb39f]">
                  {tier.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>

                <Link
                  href={PARTNER_INQUIRY_HREF}
                  className="mt-8 inline-block w-full border border-[#c4a465]/45 px-5 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] md:w-auto md:py-3"
                >
                  Check Availability
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Prepaid Partner Packages */}
      <section className="relative border-t border-[#c4a465]/12 px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Prepaid Partner Packages
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Prepaid professional gifting packages.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-7 text-[#e9decb]/76 md:text-base md:leading-8">
            Single Experience, Professional 5-Pack, or Professional 10-Pack — purchased upfront for client appreciation, closing gifts, and relationship hospitality. Each experience includes {PARTNER_GUEST_RULES.includedSummary}.
          </p>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
            {PREPAID_PARTNER_PACKAGES.map((pkg, index) => (
              <motion.article
                key={pkg.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.08 }}
                className="border border-[#c4a465]/22 bg-[#100e0b]/65 p-6 backdrop-blur-sm md:p-8"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a465]/80">
                  {pkg.tableCount === 1
                    ? "Single Experience"
                    : `${pkg.tableCount}-Experience Pack`}
                </p>

                <h3
                  className="mt-5 text-[1.85rem] leading-[0.96] tracking-[-0.03em] md:text-[2rem]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {pkg.title}
                </h3>

                <p className="mt-4 text-sm text-[#c4a465]">
                  {pkg.price}
                  {pkg.savingsLabel ? (
                    <span className="ml-2 text-[#e9decb]/55">
                      · {pkg.savingsLabel}
                    </span>
                  ) : null}
                </p>

                {pkg.tableCount > 1 ? (
                  <p className="mt-2 text-xs tracking-[0.04em] text-[#bfb39f]">
                    {pkg.perExperiencePrice} per experience
                  </p>
                ) : null}

                <p className="mt-6 text-sm leading-7 text-[#e9decb]/80">
                  {pkg.desc}
                </p>

                <ul className="mt-7 space-y-3 border-t border-[#c4a465]/14 pt-6 text-sm leading-6 text-[#bfb39f]">
                  {pkg.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>

                <div className="mt-8 grid gap-3">
                  {(() => {
                    const packageId = partnerPackageIdForTitle(pkg.title)
                    return packageId ? (
                      <Link
                        href={partnerPackagePurchaseHref(packageId)}
                        className="inline-block w-full border border-[#c4a465] px-5 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] md:w-auto md:py-3"
                      >
                        Purchase Package
                      </Link>
                    ) : null
                  })()}

                  <Link
                    href={partnerPackageInquiryHref(pkg.inquiryPackageValue)}
                    className="inline-block w-full border border-[#c4a465]/45 px-5 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] md:w-auto md:py-3"
                  >
                    Request Information
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-14 border border-[#c4a465]/16 bg-[#14120e]/40 p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]/85">
              Partner Package Parameters
            </p>

            <ul className="mt-6 space-y-4 text-sm leading-7 text-[#e9decb]/78 md:columns-2 md:gap-10">
              {PREPAID_PARTNER_COMMITMENT_POINTS.map((point) => (
                <li key={point} className="break-inside-avoid pb-2">
                  • {point}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative border-t border-[#c4a465]/12 px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            How It Works
          </p>

          <h2
            className="mx-auto mt-5 max-w-3xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            From inquiry to an evening they will not forget.
          </h2>

          <div className="mt-14 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-10 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]/70">
                  {step.num}
                </p>

                <h3
                  className="mt-4 text-[1.75rem] leading-[1.02] tracking-[-0.03em] md:text-2xl"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#e9decb]/76">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Why It Works */}
      <section className="relative bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
                Why It Works
              </p>

              <h2
                className="mt-5 text-[clamp(2.6rem,11vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Because the best gestures feel effortless.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {reasons.map((reason) => (
                <article
                  key={reason.title}
                  className="border border-[#c4a465]/14 bg-[#14120e]/35 p-5 md:p-6"
                >
                  <h3
                    className="text-[1.4rem] leading-[1.05] tracking-[-0.02em] md:text-xl"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {reason.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#e9decb]/76">
                    {reason.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-5 py-24 text-center md:px-6 md:py-32">
        <Image
          src="/content/images/umpqua-private-dining6.jpg"
          alt="Plate The Umpqua Partner Concierge experience"
          fill
          className="object-cover opacity-48 saturate-[0.9]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/56" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.12),transparent_50%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Partner Access
          </p>

          <h2
            className="mt-5 text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Ready to elevate how you appreciate the people who matter most?
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            Partner bookings are reviewed around occasion, guest count, location, and timing. Submit an inquiry and we will follow up directly to shape the experience.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={PARTNER_INQUIRY_HREF}
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Partner Booking
            </Link>

            <Link
              href="/packages"
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              View All Packages
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
