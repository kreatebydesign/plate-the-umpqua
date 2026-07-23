"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import type { PublicTestimonial } from "@/lib/os/testimonials/publicTestimonials";

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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9 },
  },
};

type Props = {
  memories: PublicTestimonial[];
};

export default function HomePageClient({ memories }: Props) {
  return (
    <main
      className={`${work.variable} ${cormorant.variable} min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 pb-20 pt-28 text-center md:min-h-screen md:px-6 md:pt-24">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-46 saturate-[0.92]"
          src="/content/videos/hero-fire-2.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.18),rgba(20,18,14,0.34)_44%,#070605_100%)]" />
        <div className="absolute inset-0 bg-black/24" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-5xl"
        >
          <p className="text-[9px] uppercase tracking-[0.34em] text-[#c4a465] sm:text-[10px] sm:tracking-[0.45em]">
            Private Hospitality • Roseburg, Oregon
          </p>

          <h1
            className="mx-auto mt-6 max-w-5xl text-[clamp(3.25rem,17vw,9rem)] leading-[0.86] tracking-[-0.055em]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            The table becomes the experience.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/88 sm:text-base md:text-lg md:leading-8">
            Chef-led private dining, estate dinners, concierge hospitality, and cinematic evenings rooted in the Umpqua Valley.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/inquiry"
              className="w-full max-w-xs border border-[#c4a465] px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Request Availability
            </Link>

            <Link
              href="/experiences"
              className="w-full max-w-xs px-7 py-4 text-center text-[11px] uppercase tracking-[0.23em] text-[#efe6d4]/82 transition hover:text-[#c4a465] sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
            >
              Explore Experiences
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="relative border-t border-[#c4a465]/14 bg-[#100e0b] px-5 py-20 md:px-6 md:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              Built Around The Moment
            </p>

            <h2
              className="mt-5 text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Not catering. Not a restaurant. A private hospitality layer.
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            <p>
              Plate The Umpqua brings elevated dining into homes, vineyards, estates, retreats, and private settings across Roseburg and Southern Oregon.
            </p>

            <p>
              Every detail is shaped around the table: the pacing, the menu, the atmosphere, the guests, and the feeling people remember after the evening ends.
            </p>

            <Link
              href="/packages"
              className="inline-block pt-3 text-[11px] uppercase tracking-[0.24em] text-[#c4a465] transition hover:text-[#efe6d4] md:text-xs"
            >
              View Packages
            </Link>
          </div>
        </motion.div>
      </section>

      {memories.length > 0 ? (
        <section
          className="relative border-t border-[#c4a465]/14 bg-[#14120e] px-5 py-20 md:px-6 md:py-28"
          aria-labelledby="clients-remember-heading"
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mx-auto max-w-5xl"
          >
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
              Client voices
            </p>
            <h2
              id="clients-remember-heading"
              className="mt-5 max-w-3xl text-[clamp(2.5rem,11vw,3.75rem)] leading-[0.98] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              What clients remember
            </h2>
            <div
              className={
                memories.length === 1
                  ? "mt-12 max-w-3xl"
                  : "mt-12 grid gap-10 md:grid-cols-2 md:gap-12"
              }
            >
              {memories.map((memory) => (
                <figure key={memory.id} className="border-t border-[#c4a465]/28 pt-6">
                  <blockquote
                    className="text-[clamp(1.25rem,4.2vw,1.65rem)] leading-[1.45] text-[#efe6d4]"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {memory.quote}
                  </blockquote>
                  <figcaption className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[#b9ac97]">
                    {memory.attribution}
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
        </section>
      ) : null}

      <section className="grid items-center border-t border-[#c4a465]/10 md:min-h-screen md:grid-cols-2">
        <div className="relative h-[62vh] min-h-[440px] overflow-hidden md:h-screen">
          <Image
            src="/content/images/umpqua-private-dining6.jpg"
            alt="Private dining experience"
            fill
            priority
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
            Private Dining
          </p>

          <h2
            className="mt-5 text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Designed around the room, not the kitchen.
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            Intimate chef-led experiences designed for homes, celebrations, wine country evenings, and unforgettable gatherings with the people who matter most.
          </p>
        </motion.div>
      </section>

      <section className="grid items-center border-t border-[#c4a465]/10 md:min-h-screen md:grid-cols-2">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="order-2 px-5 py-16 md:order-1 md:px-16 md:py-20 lg:px-24"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#c4a465] md:tracking-[0.38em]">
            Wine Country Hospitality
          </p>

          <h2
            className="mt-5 text-[clamp(2.7rem,12vw,4rem)] leading-[0.96] tracking-[-0.04em] md:text-6xl md:leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Rooted in Southern Oregon’s slower rhythm.
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/82 md:text-base md:leading-8">
            Firelight. Long tables. Vineyard air. Elevated food without the pressure of performance. Hospitality that feels calm, layered, and deeply personal.
          </p>
        </motion.div>

        <div className="relative order-1 h-[62vh] min-h-[440px] overflow-hidden md:order-2 md:h-screen">
          <Image
            src="/content/images/umpqua-private-dining18.jpg"
            alt="Wine country hospitality"
            fill
            className="object-cover opacity-84 saturate-[0.92]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#14120e]/76 via-transparent to-[#14120e]/10 md:bg-gradient-to-l md:from-transparent md:to-[#14120e]/28" />
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#c4a465]/10 px-5 py-24 text-center md:px-6 md:py-32">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Plate The Umpqua atmosphere"
          fill
          className="object-cover opacity-58 saturate-[0.9]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/48" />
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
            The best evenings are reserved quietly.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#e9decb]/84 md:text-base">
            Limited bookings are accepted each month for private homes, wineries, estates, retreats, and concierge hospitality experiences.
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
