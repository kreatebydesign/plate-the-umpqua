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

const services = [
  "Realtor closing dinners",
  "Luxury client gifting",
  "Estate and vineyard hospitality",
  "Private host support",
  "Corporate and executive dining",
  "Priority booking access",
];

export default function ConciergePage() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center md:min-h-screen md:px-6 md:pt-24">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Concierge hospitality by Plate The Umpqua"
          fill
          priority
          className="object-cover opacity-50 saturate-[0.9] contrast-[0.96]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/52" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.15),rgba(20,18,14,0.34)_44%,#070605_100%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl"
        >
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#c4a465] sm:text-[10px] sm:tracking-[0.42em]">
            Concierge
          </p>

          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(3.15rem,16vw,8rem)] leading-[0.88] tracking-[-0.055em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Hospitality for clients, closings, and private hosts.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 sm:text-base md:text-lg md:leading-8">
            A premium service layer for realtors, wineries, estate owners, retreat hosts, and businesses that want the experience handled with quiet precision.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/inquiry"
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Concierge Access
            </Link>

            <Link
              href="/packages"
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              View Packages
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
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              The Service Layer
            </p>

            <h2
              className="mt-5 text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              A private table becomes a business gesture.
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            <p>
              The Concierge Partner Program is built for moments where hospitality needs to feel elevated, personal, and completely handled.
            </p>

            <p>
              From realtor closing gifts to estate dinners and executive client evenings, the experience is designed to feel effortless while still carrying emotional weight.
            </p>

            <Link
              href="/inquiry"
              className="inline-block pt-3 text-[11px] uppercase tracking-[0.24em] text-[#c4a465] transition hover:text-[#efe6d4] md:text-xs"
            >
              Start A Concierge Inquiry
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="grid items-center border-b border-[#c4a465]/10 md:min-h-screen md:grid-cols-2">
        <div className="relative h-[62vh] min-h-[440px] overflow-hidden md:h-screen">
          <Image
            src="/content/images/umpqua-private-dining18.jpg"
            alt="Private hospitality table setting"
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
            Partner Hospitality
          </p>

          <h2
            className="mt-5 text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Built for hosts who need the evening to land right.
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            A closing dinner. A hosted estate evening. A private client experience. The goal is simple: create an atmosphere people remember long after the evening ends.
          </p>
        </motion.div>
      </section>

      <section className="relative bg-[#0f0d0a] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Concierge Uses
          </p>

          <h2
            className="mx-auto mt-5 max-w-4xl text-center text-[clamp(2.8rem,13vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Quietly elevated. Strategically memorable.
          </h2>

          <div className="mt-14 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5">
            {services.map((service) => (
              <div
                key={service}
                className="border border-[#c4a465]/18 bg-[#14120e]/50 p-6 text-sm leading-7 text-[#e9decb]/82 backdrop-blur-sm md:p-7"
              >
                {service}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden px-5 py-24 text-center md:px-6 md:py-32">
        <Image
          src="/content/images/umpqua-private-dining6.jpg"
          alt="Plate The Umpqua concierge experience"
          fill
          className="object-cover opacity-50 saturate-[0.9]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/54" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.13),transparent_50%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Private Access
          </p>

          <h2
            className="mt-5 text-[clamp(2.8rem,13vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Designed for people who want it handled beautifully.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            Concierge bookings are intentionally limited and reviewed around location, timing, guest count, and the level of hospitality required.
          </p>

          <Link
            href="/inquiry"
            className="mt-10 inline-block w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
          >
            Request Concierge Booking
          </Link>
        </motion.div>
      </section>
    </main>
  );
}