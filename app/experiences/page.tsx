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
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9 },
  },
};

const scenes = [
  {
    eyebrow: "Private Table",
    title: "An evening built around your room.",
    copy: "Intimate chef-led dining for homes, celebrations, date nights, and private gatherings where the table becomes the center of the experience.",
    image: "/content/images/umpqua-private-dining1.jpg",
    imageClass: "object-cover opacity-88 saturate-[0.98] contrast-[1.02]",
    imagePosition: "object-center",
    overlay: "bg-black/8",
  },
  {
    eyebrow: "Estate Dining",
    title: "Hospitality with the scale of a private estate.",
    copy: "Designed for larger homes, vineyard properties, retreats, and destination-style gatherings across the Umpqua Valley.",
    image: "/content/images/umpqua-private-dining12.jpg",
    imageClass: "object-cover opacity-86 saturate-[0.96] contrast-[1.02]",
    imagePosition: "object-center",
    overlay: "bg-black/10",
  },
  {
    eyebrow: "Wine Country",
    title: "Rooted in Southern Oregon’s slower rhythm.",
    copy: "Food, fire, wine, conversation, and atmosphere paced with intention. Less production. More presence.",
    image: "/content/images/umpqua-private-dining24.jpg",
    imageClass:
      "object-cover opacity-50 blur-[0.5px] saturate-[0.76] contrast-[0.92] scale-[1.16]",
    imagePosition: "object-[72%_center]",
    overlay: "bg-[#14120e]/30",
  },
];

export default function ExperiencesPage() {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 pt-28 pb-20 text-center md:min-h-screen md:px-6 md:pt-24">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-48 saturate-[0.9]"
          src="/content/videos/hero-fire-1.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.14),rgba(20,18,14,0.32)_45%,#070605_100%)]" />
        <div className="absolute inset-0 bg-black/24" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl"
        >
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#c4a465] sm:text-[10px] sm:tracking-[0.45em]">
            Experiences
          </p>

          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(3.15rem,16vw,9rem)] leading-[0.86] tracking-[-0.055em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Private dining, paced like cinema.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/88 sm:text-base md:text-lg md:leading-8">
            From intimate private tables to estate dinners and wine country gatherings, each experience is shaped around the setting, the guests, and the reason the evening matters.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/packages"
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              View Packages
            </Link>

            <Link
              href="/inquiry"
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Availability
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative border-y border-[#c4a465]/12 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              The Feeling
            </p>

            <h2
              className="mt-5 text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Not a reservation. Not catering. A private hospitality layer.
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            <p>
              Plate The Umpqua is built for the moments where the environment matters as much as the menu. A private home. A vineyard. A long table. A fire. A client closing. A celebration that deserves to feel considered.
            </p>

            <p>
              The experience is intentionally paced: arrival, atmosphere, service, food, conversation, and the quiet luxury of not having to manage the evening yourself.
            </p>
          </div>
        </motion.div>
      </section>

      {scenes.map((scene, index) => (
        <section
          key={scene.title}
          className="relative grid items-center border-b border-[#c4a465]/10 md:min-h-screen md:grid-cols-2"
        >
          <div
            className={`relative h-[62vh] min-h-[440px] overflow-hidden md:h-screen ${
              index % 2 === 1 ? "md:order-2" : ""
            }`}
          >
            <Image
              src={scene.image}
              alt={scene.title}
              fill
              priority={index === 0}
              className={`${scene.imageClass} ${scene.imagePosition}`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            <div className={`absolute inset-0 ${scene.overlay}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14120e]/76 via-transparent to-[#14120e]/10 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#14120e]/28" />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative z-10 px-5 py-16 md:px-16 md:py-20 lg:px-24"
          >
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              {scene.eyebrow}
            </p>

            <h2
              className="mt-5 max-w-xl text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {scene.title}
            </h2>

            <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
              {scene.copy}
            </p>
          </motion.div>
        </section>
      ))}

      <section className="relative overflow-hidden px-5 py-24 text-center md:px-6 md:py-32">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Plate The Umpqua private dining atmosphere"
          fill
          className="object-cover opacity-58 saturate-[0.88] contrast-[0.96]"
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
            Availability
          </p>

          <h2
            className="mt-5 text-[clamp(2.8rem,13vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            The best evenings are reserved before they are announced.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            For private homes, wineries, estates, concierge partners, and elevated gatherings across Roseburg and the Umpqua Valley.
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