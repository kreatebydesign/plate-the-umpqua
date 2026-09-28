'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Cormorant_Garamond, Work_Sans } from 'next/font/google'
import type { ServicePageConfig } from '@/lib/site/servicePages'
import { serviceInquiryHref } from '@/lib/site/servicePages'

const work = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
})

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9 },
  },
}

type Props = {
  page: ServicePageConfig
}

export default function ServiceLandingPage({ page }: Props) {
  const inquiryHref = serviceInquiryHref(page.inquirySource)

  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-5 pb-20 pt-28 text-center md:min-h-[92vh] md:px-6 md:pt-24">
        <Image
          src={page.heroImage}
          alt={page.heroImageAlt}
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
            {page.eyebrow}
          </p>
          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(2.6rem,11vw,5.75rem)] leading-[0.94] tracking-[-0.05em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {page.headline}
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 sm:text-base md:text-lg md:leading-8">
            {page.supporting}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={inquiryHref}
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              {page.primaryCtaLabel}
            </Link>
            <Link
              href={page.secondaryCtaHref}
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              {page.secondaryCtaLabel}
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
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              {page.introEyebrow}
            </p>
            <h2
              className="mt-5 text-[clamp(2.35rem,9vw,3.75rem)] leading-[0.98] tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {page.introHeadline}
            </h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            {page.introCopy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
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
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            {page.forWhomEyebrow}
          </p>
          <h2
            className="mt-5 max-w-3xl text-[clamp(2.35rem,9vw,3.75rem)] leading-[0.98] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {page.forWhomHeadline}
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
            {page.forWhomItems.map((item) => (
              <li
                key={item}
                className="border-t border-[#c4a465]/28 pt-4 text-sm leading-7 text-[#e9decb]/84 md:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="grid items-center border-y border-[#c4a465]/10 md:min-h-[80vh] md:grid-cols-2">
        <div className="relative h-[58vh] min-h-[400px] overflow-hidden md:h-full md:min-h-[80vh]">
          <Image
            src={page.experienceImage}
            alt={page.experienceImageAlt}
            fill
            className="object-cover opacity-88 saturate-[0.96]"
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
            {page.experienceEyebrow}
          </p>
          <h2
            className="mt-5 text-[clamp(2.35rem,9vw,3.75rem)] leading-[0.98] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {page.experienceHeadline}
          </h2>
          <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            {page.experienceCopy}
          </p>
        </motion.div>
      </section>

      <section className="relative bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            {page.planningEyebrow}
          </p>
          <h2
            className="mt-5 max-w-3xl text-[clamp(2.35rem,9vw,3.75rem)] leading-[0.98] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {page.planningHeadline}
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {page.planningSteps.map((step, index) => (
              <li key={step.title} className="border-t border-[#c4a465]/28 pt-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#c4a465]">
                  0{index + 1}
                </p>
                <h3
                  className="mt-3 text-2xl tracking-[-0.03em] md:text-[1.75rem]"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#e9decb]/78 md:leading-8">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      <section className="relative px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-16"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              {page.whereEyebrow}
            </p>
            <h2
              className="mt-5 text-[clamp(2.35rem,9vw,3.5rem)] leading-[0.98] tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {page.whereHeadline}
            </h2>
            <p className="mt-7 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
              {page.whereCopy}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              {page.differenceEyebrow}
            </p>
            <h2
              className="mt-5 text-[clamp(2.35rem,9vw,3.5rem)] leading-[0.98] tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {page.differenceHeadline}
            </h2>
            <div className="mt-7 space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
              {page.differenceCopy.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-[#c4a465]/12 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Related Paths
          </p>
          <h2
            className="mt-5 max-w-3xl text-[clamp(2.35rem,9vw,3.5rem)] leading-[0.98] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Continue exploring the hospitality practice.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {page.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group border-t border-[#c4a465]/28 pt-5 transition"
              >
                <p
                  className="text-2xl tracking-[-0.03em] text-[#efe6d4] transition group-hover:text-[#c4a465]"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {link.label}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#e9decb]/72">
                  {link.description}
                </p>
              </Link>
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
          className="mx-auto max-w-4xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Questions
          </p>
          <h2
            className="mt-5 text-[clamp(2.35rem,9vw,3.5rem)] leading-[0.98] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Before you inquire.
          </h2>
          <div className="mt-12 space-y-8">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="border-t border-[#c4a465]/22 pt-5">
                <h3
                  className="text-xl tracking-[-0.02em] md:text-2xl"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {faq.question}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#e9decb]/78 md:text-base md:leading-8">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden px-5 py-24 text-center md:px-6 md:py-32">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Plate The Umpqua private hospitality atmosphere"
          fill
          className="object-cover opacity-52 saturate-[0.9]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#14120e]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.12),transparent_50%)]" />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            {page.ctaEyebrow}
          </p>
          <h2
            className="mt-5 text-[clamp(2.5rem,10vw,3.75rem)] leading-[0.98] tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {page.ctaHeadline}
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            {page.ctaCopy}
          </p>
          <Link
            href={inquiryHref}
            className="mt-10 inline-block w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
          >
            {page.primaryCtaLabel}
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
