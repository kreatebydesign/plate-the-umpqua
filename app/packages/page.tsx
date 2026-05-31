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
    transition: { duration: 1, ease: "easeOut" },
  },
};

const packages = [
  {
    title: "Private Table Experience",
    price: "Starting at $425",
    desc: "Intimate in-home dining experiences designed around your space, your guests, and your moment.",
    features: ["In-home chef service", "Custom seasonal menu", "Small gatherings"],
  },
  {
    title: "Estate & Winery Experience",
    price: "Starting at $750–$1,500",
    desc: "Curated hospitality for estates, vineyards, retreats, and private luxury gatherings.",
    features: ["Multi-course dining", "Wine pairing focus", "Estate & vineyard settings"],
  },
  {
    title: "Concierge Partner Program",
    price: "$2,000–$5,000+",
    desc: "Premium hospitality for realtors, luxury hosts, corporate gifting, and closing experiences.",
    features: ["Realtor gifting", "Client experiences", "Priority scheduling"],
  },
];

export default function PackagesPage() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen bg-[#14120e] text-[#efe6d4]`}
    >
      {/* HERO */}
      <section className="px-6 pt-40 pb-20 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c4a465]">
            Limited weekly availability
          </p>

          <h1
            className="mt-6 text-[clamp(2.8rem,6vw,6rem)] leading-[1]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Private hospitality packages
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#e9decb]">
            Each experience is designed around the moment — the home, the setting, and the reason.
          </p>
        </motion.div>
      </section>

      {/* PACKAGES */}
      <section className="px-6 pb-32">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {packages.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-[#c4a465]/20 bg-black/20 p-8"
            >
              <h2
                className="text-2xl"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {p.title}
              </h2>

              <p className="mt-2 text-sm text-[#c4a465]">{p.price}</p>

              <p className="mt-6 text-sm text-[#e9decb]">{p.desc}</p>

              <ul className="mt-6 space-y-2 text-sm text-[#bfb39f]">
                {p.features.map((f, idx) => (
                  <li key={idx}>• {f}</li>
                ))}
              </ul>

              <Link
                href="/inquiry"
                className="mt-8 inline-block border border-[#c4a465]/40 px-5 py-3 text-xs uppercase tracking-widest hover:bg-[#c4a465] hover:text-black transition"
              >
                Check Availability
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONVERSION BLOCK */}
      <section className="border-t border-[#c4a465]/20 px-6 py-24 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show">
          <h2
            className="text-3xl md:text-5xl"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Limited weekly bookings available
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[#e9decb]">
            Most weekends are reserved 2–3 weeks in advance. Priority is given to wineries, estates, and concierge partners.
          </p>

          <Link
            href="/inquiry"
            className="mt-10 inline-block border border-[#c4a465] px-8 py-4 text-sm uppercase tracking-widest hover:bg-[#c4a465] hover:text-black transition"
          >
            Request Private Booking
          </Link>
        </motion.div>
      </section>
    </main>
  );
}