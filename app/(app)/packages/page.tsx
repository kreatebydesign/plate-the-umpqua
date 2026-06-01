"use client";

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

const packages = [
  {
    title: "Private Table Experience",
    price: "Starting at $425",
    desc: "An intimate chef-led dining experience shaped around your home, your guests, and the tone of the evening.",
    features: ["In-home chef service", "Custom seasonal menu", "Small private gatherings"],
  },
  {
    title: "Estate & Winery Experience",
    price: "Starting at $750–$1,500",
    desc: "Elevated hospitality for vineyards, estates, retreats, and private wine country gatherings.",
    features: ["Multi-course dining", "Wine-focused pacing", "Estate and vineyard settings"],
  },
  {
    title: "Concierge Partner Program",
    price: "$2,000–$5,000+",
    desc: "A premium hospitality layer for realtors, luxury hosts, corporate gifting, and closing experiences.",
    features: ["Realtor gifting", "Client hospitality", "Priority scheduling"],
  },
];

export default function PackagesPage() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative px-5 pt-32 pb-18 text-center md:px-6 md:pt-40 md:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(196,164,101,0.16),transparent_46%),linear-gradient(to_bottom,rgba(20,18,14,0.3),#14120e_84%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl"
        >
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#c4a465] sm:text-[10px] sm:tracking-[0.42em]">
            Limited Weekly Availability
          </p>

          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(3rem,15vw,7rem)] leading-[0.9] tracking-[-0.05em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Private Hospitality Packages
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 sm:text-base md:text-lg md:leading-8">
            Each experience is designed around the room, the table, the guests, and the reason the evening matters.
          </p>
        </motion.div>
      </section>

      <section className="relative px-5 pb-24 md:px-6 md:pb-36">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3 md:gap-7">
          {packages.map((item, index) => (
            <motion.article
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              className="group border border-[#c4a465]/18 bg-[#0d0b08]/55 p-6 backdrop-blur-sm transition duration-500 hover:border-[#c4a465]/45 hover:bg-[#18130d]/70 md:p-8"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4a465]/80">
                0{index + 1}
              </p>

              <h2
                className="mt-5 text-[2rem] leading-[0.96] tracking-[-0.03em] md:text-3xl"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {item.title}
              </h2>

              <p className="mt-4 text-sm text-[#c4a465]">{item.price}</p>

              <p className="mt-7 text-sm leading-7 text-[#e9decb]/80 md:min-h-[118px]">
                {item.desc}
              </p>

              <ul className="mt-7 space-y-3 border-t border-[#c4a465]/14 pt-6 text-sm leading-6 text-[#bfb39f]">
                {item.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <Link
                href="/inquiry"
                className="mt-9 inline-block w-full border border-[#c4a465]/45 px-5 py-4 text-center text-[11px] uppercase tracking-[0.22em] text-[#efe6d4] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] md:w-auto md:py-3"
              >
                Check Availability
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative border-t border-[#c4a465]/16 px-5 py-24 text-center md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Private Booking
          </p>

          <h2
            className="mt-5 text-[clamp(2.8rem,13vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Most weekends are reserved before the table is ever set.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/80 md:text-base">
            Priority is given to private homes, winery gatherings, estates, and concierge partners across Roseburg and the Umpqua Valley.
          </p>

          <Link
            href="/inquiry"
            className="mt-10 inline-block w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
          >
            Request Private Booking
          </Link>
        </motion.div>
      </section>
    </main>
  );
}