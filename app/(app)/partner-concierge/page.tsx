"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";

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
  "Realtors & luxury real estate teams",
  "Financial advisors & wealth managers",
  "Doctors, dentists & medical practices",
  "Attorneys & legal practices",
  "CPAs & accounting firms",
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

const tiers = [
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

const PARTNER_INQUIRY_HREF = "/inquiry?source=partner-concierge";

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

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
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

      {/* Editorial Split */}
      <section className="grid items-center border-y border-[#c4a465]/10 md:min-h-[85vh] md:grid-cols-2">
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
            {tiers.map((tier, index) => (
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
