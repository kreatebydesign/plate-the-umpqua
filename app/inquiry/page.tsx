"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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

export default function InquiryPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      location: formData.get("location"),
      guests: formData.get("guests"),
      budget: formData.get("budget"),
      packageInterest: formData.get("packageInterest"),
      urgency: formData.get("urgency"),
      occasion: formData.get("occasion"),
      details: formData.get("details"),
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        e.currentTarget.reset();
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <main
      className={`${work.variable} ${cormorant.variable} relative min-h-screen overflow-hidden bg-[#14120e] text-[#efe6d4]`}
    >
      <section className="relative overflow-hidden px-5 pb-24 pt-32 md:px-6 md:pb-32 md:pt-40">
        <Image
          src="/content/images/umpqua-private-dining30.jpg"
          alt="Plate The Umpqua inquiry"
          fill
          priority
          className="object-cover opacity-38 saturate-[0.88]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[#14120e]/72" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(196,164,101,0.12),transparent_48%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-[9px] uppercase tracking-[0.34em] text-[#c4a465] sm:text-[10px] sm:tracking-[0.42em]">
              Inquiry
            </p>

            <h1
              className="mx-auto mt-6 max-w-5xl text-[clamp(3rem,15vw,6.5rem)] leading-[0.9] tracking-[-0.05em]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Request a private hospitality experience.
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[#e9decb]/84 sm:text-base md:text-lg md:leading-8">
              Private dining, estate gatherings, concierge hospitality, and elevated evenings across Roseburg and the Umpqua Valley.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.12 }}
            className="mx-auto mt-14 max-w-4xl border border-[#c4a465]/14 bg-[#0f0e0c]/88 p-5 backdrop-blur-xl sm:p-7 md:mt-20 md:p-10"
          >
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:gap-6"
            >
              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <input
                  name="name"
                  required
                  placeholder="Full Name"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition placeholder:text-[#8d8477] focus:border-[#c4a465]/55"
                />

                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Email Address"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition placeholder:text-[#8d8477] focus:border-[#c4a465]/55"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <input
                  name="phone"
                  placeholder="Phone Number"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition placeholder:text-[#8d8477] focus:border-[#c4a465]/55"
                />

                <input
                  name="location"
                  placeholder="Event Location"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition placeholder:text-[#8d8477] focus:border-[#c4a465]/55"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <select
                  name="guests"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition focus:border-[#c4a465]/55"
                >
                  <option value="">Guest Count</option>
                  <option>2-4 Guests</option>
                  <option>5-10 Guests</option>
                  <option>10-20 Guests</option>
                  <option>20+ Guests</option>
                </select>

                <select
                  name="budget"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition focus:border-[#c4a465]/55"
                >
                  <option value="">Estimated Budget</option>
                  <option value="425-750">$425-$750</option>
                  <option value="750-1500">$750-$1,500</option>
                  <option value="2000+">$2,000+</option>
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <select
                  name="packageInterest"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition focus:border-[#c4a465]/55"
                >
                  <option value="">Experience Type</option>
                  <option value="Private Table">Private Table</option>
                  <option value="Estate">Estate / Winery</option>
                  <option value="Concierge">Concierge Partner</option>
                </select>

                <select
                  name="urgency"
                  className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition focus:border-[#c4a465]/55"
                >
                  <option value="">Timeline</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="future">Future Planning</option>
                </select>
              </div>

              <input
                name="occasion"
                placeholder="Occasion"
                className="h-[58px] border border-[#c4a465]/18 bg-[#14120e] px-5 text-sm outline-none transition placeholder:text-[#8d8477] focus:border-[#c4a465]/55"
              />

              <textarea
                name="details"
                rows={7}
                placeholder="Tell us about the experience..."
                className="min-h-[180px] border border-[#c4a465]/18 bg-[#14120e] px-5 py-5 text-sm leading-7 outline-none transition placeholder:text-[#8d8477] focus:border-[#c4a465]/55"
              />

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full border border-[#c4a465] px-8 py-5 text-center text-[11px] uppercase tracking-[0.24em] transition duration-300 hover:bg-[#c4a465] hover:text-[#14120e] md:w-auto md:min-w-[280px]"
                >
                  {loading ? "Submitting..." : "Request Availability"}
                </button>

                {success && (
                  <p className="pt-5 text-sm text-[#c4a465]">
                    Inquiry submitted successfully.
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}