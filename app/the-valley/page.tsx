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
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

export default function TheValleyPage() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24 text-center">
        <Image
          src="/content/images/umpqua-private-dining27.jpg"
          alt="The Umpqua Valley"
          fill
          priority
          className="object-cover opacity-52 saturate-[0.92] contrast-[0.96]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/44" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.16),rgba(20,18,14,0.34)_44%,#070605_100%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl"
        >
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#c4a465]">
            The Valley
          </p>

          <h1
            className="mt-7 text-[clamp(3.3rem,8vw,8rem)] leading-[0.9] tracking-[-0.05em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Rooted in the Umpqua Valley.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#e9decb]/88 md:text-lg">
            Wine country air. Long evenings. Firelight. Private tables surrounded by rivers, vineyards, forests, and slower rhythms that shape the experience naturally.
          </p>
        </motion.div>
      </section>

      <section className="relative border-y border-[#c4a465]/12 bg-[#100e0b] px-6 py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.85fr_1.15fr]"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#c4a465]">
              Southern Oregon
            </p>

            <h2
              className="mt-5 text-4xl leading-tight tracking-[-0.03em] md:text-6xl"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Hospitality shaped by the pace of the region.
            </h2>
          </div>

          <div className="space-y-6 text-sm leading-8 text-[#e9decb]/82 md:text-base">
            <p>
              The Umpqua Valley carries a different rhythm than larger wine regions. More grounded. Less crowded. More personal. The experience naturally becomes slower, warmer, and more connected.
            </p>

            <p>
              Plate The Umpqua is built around that atmosphere — private gatherings that feel elevated without losing the calm, natural feeling of Southern Oregon itself.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="grid min-h-screen items-center border-b border-[#c4a465]/10 md:grid-cols-2">
        <div className="relative h-[70vh] overflow-hidden md:h-screen">
          <Image
            src="/content/images/umpqua-private-dining18.jpg"
            alt="Wine country hospitality"
            fill
            className="object-cover opacity-86 saturate-[0.94] contrast-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#14120e]/70 via-transparent to-[#14120e]/8 md:bg-gradient-to-r md:from-transparent md:to-[#14120e]/28" />
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="px-6 py-20 md:px-16 lg:px-24"
        >
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#c4a465]">
            Wine Country Atmosphere
          </p>

          <h2
            className="mt-5 text-4xl leading-tight tracking-[-0.03em] md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Vineyards, estates, rivers, and long tables.
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[#e9decb]/82 md:text-base">
            The environment becomes part of the hospitality itself. The setting slows people down. Conversations last longer. Evenings feel intentional instead of rushed.
          </p>
        </motion.div>
      </section>

      <section className="grid min-h-screen items-center border-b border-[#c4a465]/10 md:grid-cols-2">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="order-2 px-6 py-20 md:order-1 md:px-16 lg:px-24"
        >
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#c4a465]">
            The Experience
          </p>

          <h2
            className="mt-5 text-4xl leading-tight tracking-[-0.03em] md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Less production. More presence.
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[#e9decb]/82 md:text-base">
            The goal is never to overpower the evening. The goal is to support it quietly through food, pacing, atmosphere, and hospitality that feels natural to the environment.
          </p>
        </motion.div>

        <div className="relative order-1 h-[70vh] overflow-hidden md:order-2 md:h-screen">
          <Image
            src="/content/images/umpqua-private-dining6.jpg"
            alt="Private dining in Southern Oregon"
            fill
            className="object-cover opacity-84 saturate-[0.92]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#14120e]/70 via-transparent to-[#14120e]/8 md:bg-gradient-to-l md:from-transparent md:to-[#14120e]/28" />
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-32 text-center">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Plate The Umpqua hospitality atmosphere"
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
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#c4a465]">
            Umpqua Valley Hospitality
          </p>

          <h2
            className="mt-5 text-4xl leading-tight tracking-[-0.03em] md:text-6xl"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Built for gatherings that deserve more than a reservation.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            Private dinners, estate gatherings, wine country hospitality, and concierge experiences across Roseburg and Southern Oregon.
          </p>

          <Link
            href="/inquiry"
            className="mt-10 inline-block border border-[#c4a465] px-8 py-4 text-xs uppercase tracking-[0.25em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e]"
          >
            Request Private Experience
          </Link>
        </motion.div>
      </section>
    </main>
  );
}