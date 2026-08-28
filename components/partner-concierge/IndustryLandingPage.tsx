"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import type { PartnerIndustryConfig } from "@/lib/site/partnerConciergeIndustries";
import { partnerIndustryInquiryHref } from "@/lib/site/partnerConciergeIndustries";
import {
  PARTNER_GUEST_RULES,
  PREPAID_PARTNER_COMMITMENT_POINTS,
  PREPAID_PARTNER_PACKAGES,
  partnerPackageIdForTitle,
  partnerPackageInquiryHref,
  partnerPackagePurchaseHref,
} from "@/lib/site/partnerConciergePricing";
import { trackPartnerPackageSelect } from "@/lib/analytics/partnerConciergeEvents";

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

type Props = {
  industry: PartnerIndustryConfig;
};

export default function IndustryLandingPage({ industry }: Props) {
  const inquiryHref = partnerIndustryInquiryHref(industry.slug);

  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center md:min-h-screen md:px-6 md:pt-24">
        <Image
          src={industry.heroImage}
          alt={industry.heroImageAlt}
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
            {industry.eyebrow}
          </p>

          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(2.8rem,12vw,6.5rem)] leading-[0.92] tracking-[-0.05em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {industry.headline}
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 sm:text-base md:text-lg md:leading-8">
            {industry.supporting}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#packages"
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Purchase Package
            </Link>

            <Link
              href={inquiryHref}
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Information
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-[#c4a465]/12 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              {industry.conceptEyebrow}
            </p>

            <h2
              className="mt-5 text-[clamp(2.6rem,11vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {industry.conceptHeadline}
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            {industry.conceptBody.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            {industry.useCasesEyebrow}
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {industry.useCasesHeadline}
          </h2>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {industry.useCases.map((item) => (
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

      <section
        id="packages"
        className="relative border-y border-[#c4a465]/12 bg-[#0f0d0a] px-5 py-20 md:px-6 md:py-28"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Partner Packages
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Prepaid professional gifting.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-7 text-[#e9decb]/76 md:text-base md:leading-8">
            Each experience includes {PARTNER_GUEST_RULES.includedSummary}.{" "}
            {PARTNER_GUEST_RULES.prepaidFraming}
          </p>

          <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
            {PREPAID_PARTNER_PACKAGES.map((pkg, index) => (
              <motion.article
                key={pkg.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.06 }}
                className="border border-[#c4a465]/22 bg-[#14120e]/50 p-6 backdrop-blur-sm md:p-7"
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
                        href={partnerPackagePurchaseHref(packageId, industry.slug)}
                        onClick={() =>
                          trackPartnerPackageSelect({
                            industry: industry.slug,
                            package_id: packageId,
                            package_name: pkg.title,
                            experience_count: pkg.tableCount,
                            value: pkg.priceCents / 100,
                            currency: 'USD',
                          })
                        }
                        className="inline-block w-full border border-[#c4a465] px-5 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e]"
                      >
                        Purchase Package
                      </Link>
                    ) : null
                  })()}

                  <Link
                    href={partnerPackageInquiryHref(
                      pkg.inquiryPackageValue,
                      industry.slug,
                    )}
                    className="inline-block w-full border border-[#c4a465]/45 px-5 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e]"
                  >
                    Request Information
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 border border-[#c4a465]/16 bg-[#14120e]/40 p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#c4a465]/85">
              Guest Parameters
            </p>

            <ul className="mt-6 space-y-3 text-sm leading-7 text-[#e9decb]/78 md:columns-2 md:gap-10">
              {PREPAID_PARTNER_COMMITMENT_POINTS.map((point) => (
                <li key={point} className="break-inside-avoid pb-2">
                  • {point}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      <section className="relative px-5 py-20 md:px-6 md:py-28">
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
            className="mx-auto mt-5 max-w-3xl text-center text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {industry.howItWorksHeadline}
          </h2>

          <div className="mt-14 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-10 lg:grid-cols-4">
            {industry.howItWorks.map((step) => (
              <div key={step.num}>
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

      {industry.faqs.length > 0 ? (
        <section className="relative border-t border-[#c4a465]/12 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mx-auto max-w-3xl"
          >
            <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              Questions
            </p>

            <h2
              className="mx-auto mt-5 text-center text-[clamp(2.4rem,10vw,3.5rem)] leading-[0.96] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Clear parameters. Premium delivery.
            </h2>

            <div className="mt-12 space-y-6">
              {industry.faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="border border-[#c4a465]/14 bg-[#14120e]/35 p-6"
                >
                  <h3
                    className="text-[1.35rem] leading-[1.1] tracking-[-0.02em] md:text-xl"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#e9decb]/78">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </motion.div>
        </section>
      ) : null}

      <section className="relative overflow-hidden px-5 py-24 text-center md:px-6 md:py-32">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Plate The Umpqua Partner Concierge"
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
            className="mt-5 text-[clamp(2.6rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-5xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {industry.finalHeadline}
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            {industry.finalSupporting}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={inquiryHref}
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              {industry.primaryCta}
            </Link>

            <Link
              href="/partner-concierge"
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              All Partner Industries
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
